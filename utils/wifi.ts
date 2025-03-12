import Fuse from "fuse.js";
import { Platform } from "react-native";
import WiFiManager from "react-native-wifi-reborn";

export interface WiFiNetwork {
  SSID: string;
  BSSID?: string;
  capabilities?: string;
  frequency?: number;
  level?: number;
  timestamp?: number;
}

export interface WiFiCredentials {
  ssid: string;
  password: string;
  isWPA?: boolean;
}

// Parse WiFi QR code content
export const parseWiFiQRCode = (data: string): WiFiCredentials | null => {
  // Standard WiFi QR code format: WIFI:S:<SSID>;T:<WPA|WEP|>;P:<password>;;
  try {
    if (data.startsWith("WIFI:")) {
      const ssidMatch = data.match(/S:(.*?);/);
      const passwordMatch = data.match(/P:(.*?);/);
      const typeMatch = data.match(/T:(.*?);/);

      if (ssidMatch && ssidMatch[1]) {
        return {
          ssid: ssidMatch[1],
          password: passwordMatch && passwordMatch[1] ? passwordMatch[1] : "",
          isWPA:
            typeMatch && typeMatch[1]
              ? typeMatch[1].toUpperCase() === "WPA"
              : true,
        };
      }
    }
    return null;
  } catch (error) {
    console.error("Error parsing WiFi QR code:", error);
    return null;
  }
};

// Extract WiFi credentials from OCR text
export const extractWiFiFromText = (text: string): WiFiCredentials | null => {
  // Common patterns for WiFi information in multiple languages
  const ssidPatterns = [
    // English
    /SSID\s*:?\s*(["']?)([^"'\n]+)\1/i,
    /Network\s*:?\s*(["']?)([^"'\n]+)\1/i,
    /WiFi\s*:?\s*(["']?)([^"'\n]+)\1/i,
    /Network name\s*:?\s*(["']?)([^"'\n]+)\1/i,
    // Chinese
    /网络\s*:?\s*(["']?)([^"'\n]+)\1/i, // Network
    /网络名称\s*:?\s*(["']?)([^"'\n]+)\1/i, // Network name
    /无线网络\s*:?\s*(["']?)([^"'\n]+)\1/i, // Wireless network
    /名称\s*:?\s*(["']?)([^"'\n]+)\1/i, // Name
    // Spanish
    /Red\s*:?\s*(["']?)([^"'\n]+)\1/i, // Network
    /Nombre de red\s*:?\s*(["']?)([^"'\n]+)\1/i, // Network name
    // French
    /Réseau\s*:?\s*(["']?)([^"'\n]+)\1/i, // Network
    /Nom du réseau\s*:?\s*(["']?)([^"'\n]+)\1/i, // Network name
    // German
    /Netzwerk\s*:?\s*(["']?)([^"'\n]+)\1/i, // Network
    /Netzwerkname\s*:?\s*(["']?)([^"'\n]+)\1/i, // Network name
    // Japanese
    /ネットワーク\s*:?\s*(["']?)([^"'\n]+)\1/i, // Network
    /ネットワーク名\s*:?\s*(["']?)([^"'\n]+)\1/i, // Network name
    // Korean
    /네트워크\s*:?\s*(["']?)([^"'\n]+)\1/i, // Network
    /네트워크 이름\s*:?\s*(["']?)([^"'\n]+)\1/i, // Network name
  ];

  const passwordPatterns = [
    // English
    /Password\s*:?\s*(["']?)([^"'\n]+)\1/i,
    /Pass\s*:?\s*(["']?)([^"'\n]+)\1/i,
    /Passphrase\s*:?\s*(["']?)([^"'\n]+)\1/i,
    /Network key\s*:?\s*(["']?)([^"'\n]+)\1/i,
    // Chinese
    /密码\s*:?\s*(["']?)([^"'\n]+)\1/i, // Password
    /密碼\s*:?\s*(["']?)([^"'\n]+)\1/i, // Password (Traditional)
    /网络密码\s*:?\s*(["']?)([^"'\n]+)\1/i, // Network password
    /无线密码\s*:?\s*(["']?)([^"'\n]+)\1/i, // Wireless password
    /口令\s*:?\s*(["']?)([^"'\n]+)\1/i, // Passphrase
    // Spanish
    /Contraseña\s*:?\s*(["']?)([^"'\n]+)\1/i, // Password
    /Clave\s*:?\s*(["']?)([^"'\n]+)\1/i, // Key/Password
    /Clave de red\s*:?\s*(["']?)([^"'\n]+)\1/i, // Network key
    // French
    /Mot de passe\s*:?\s*(["']?)([^"'\n]+)\1/i, // Password
    /Clé\s*:?\s*(["']?)([^"'\n]+)\1/i, // Key
    /Clé réseau\s*:?\s*(["']?)([^"'\n]+)\1/i, // Network key
    // German
    /Passwort\s*:?\s*(["']?)([^"'\n]+)\1/i, // Password
    /Kennwort\s*:?\s*(["']?)([^"'\n]+)\1/i, // Password
    /Netzwerkschlüssel\s*:?\s*(["']?)([^"'\n]+)\1/i, // Network key
    // Japanese
    /パスワード\s*:?\s*(["']?)([^"'\n]+)\1/i, // Password
    /暗号キー\s*:?\s*(["']?)([^"'\n]+)\1/i, // Encryption key
    // Korean
    /비밀번호\s*:?\s*(["']?)([^"'\n]+)\1/i, // Password
    /네트워크 키\s*:?\s*(["']?)([^"'\n]+)\1/i, // Network key
  ];

  // Try to find SSID
  let ssid = "";
  for (const pattern of ssidPatterns) {
    const match = text.match(pattern);
    if (match && match[2]) {
      ssid = match[2].trim();
      break;
    }
  }

  // If SSID found, look for password
  if (ssid) {
    let password = "";
    for (const pattern of passwordPatterns) {
      const match = text.match(pattern);
      if (match && match[2]) {
        password = match[2].trim();
        return {
          ssid,
          password,
          isWPA: true, // Assume WPA by default
        };
      }
    }
  }

  // Try to extract credentials from common formats without explicit labels
  // This helps with formats like "Network: MyWiFi / Password: 12345"
  // Look for patterns like "something: value1 / something: value2"
  const combinedPattern =
    /([^:]+):\s*([^\/\n]+)(?:\s*\/\s*|\n)([^:]+):\s*([^\n]+)/i;
  const match = text.match(combinedPattern);

  if (match) {
    const label1 = match[1].trim().toLowerCase();
    const value1 = match[2].trim();
    const label2 = match[3].trim().toLowerCase();
    const value2 = match[4].trim();

    // Determine which is SSID and which is password based on labels
    let extractedSsid = "";
    let extractedPassword = "";

    // Check first pair
    const ssidLabels = [
      "ssid",
      "network",
      "wifi",
      "name",
      "网络",
      "名称",
      "red",
      "réseau",
      "netzwerk",
      "ネットワーク",
      "네트워크",
    ];
    const passwordLabels = [
      "password",
      "pass",
      "key",
      "密码",
      "密碼",
      "contraseña",
      "clave",
      "mot de passe",
      "passwort",
      "パスワード",
      "비밀번호",
    ];

    if (ssidLabels.some((label) => label1.includes(label))) {
      extractedSsid = value1;
    } else if (passwordLabels.some((label) => label1.includes(label))) {
      extractedPassword = value1;
    }

    // Check second pair
    if (ssidLabels.some((label) => label2.includes(label))) {
      extractedSsid = value2;
    } else if (passwordLabels.some((label) => label2.includes(label))) {
      extractedPassword = value2;
    }

    // If we found both SSID and password, return them
    if (extractedSsid && extractedPassword) {
      return {
        ssid: extractedSsid,
        password: extractedPassword,
        isWPA: true,
      };
    }
  }

  // If we couldn't find both SSID and password, return null
  return null;
};

// Filter out hidden networks (those with empty or placeholder SSIDs)
export const filterOutHiddenNetworks = (
  networks: WiFiNetwork[]
): WiFiNetwork[] => {
  if (!networks || networks.length === 0) return [];

  return networks.filter((network) => {
    // Keep only networks with valid SSIDs (not empty, not placeholders)
    return (
      network.SSID &&
      network.SSID.trim() !== "" &&
      network.SSID !== "<hidden>" &&
      network.SSID !== "<unknown>"
    );
  });
};

// Filter out unsecured WiFi networks
export const filterOutUnsecuredNetworks = (
  networks: WiFiNetwork[]
): WiFiNetwork[] => {
  if (!networks || networks.length === 0) return [];

  return networks.filter((network) => {
    // Only keep networks with security capabilities
    // This checks if capabilities string contains WEP, WPA, WPA2, or WPA3
    return (
      network.capabilities &&
      (network.capabilities.includes("WEP") ||
        network.capabilities.includes("WPA") ||
        network.capabilities.includes("PSK") ||
        network.capabilities.includes("EAP"))
    );
  });
};

// Scan for available WiFi networks
export const scanWiFiNetworks = async (): Promise<WiFiNetwork[]> => {
  try {
    let networks: WiFiNetwork[] = [];

    // On iOS, we need to load the list differently
    if (Platform.OS === "ios") {
      // iOS doesn't support scanning for networks directly
      // We can only get the current connected network
      const ssid = await WiFiManager.getCurrentWifiSSID();
      networks = ssid ? [{ SSID: ssid }] : [];
    } else {
      // On Android, we can scan for networks
      networks = await WiFiManager.loadWifiList();
    }

    // Filter out hidden networks first
    const visibleNetworks = filterOutHiddenNetworks(networks);

    // Filter out unsecured networks
    const securedNetworks = filterOutUnsecuredNetworks(visibleNetworks);

    // Then deduplicate networks by SSID, keeping only the strongest signal one
    return deduplicateNetworksBySSID(securedNetworks);
  } catch (error) {
    console.error("Error scanning WiFi networks:", error);
    return [];
  }
};

// Get networks sorted by fuzzy match similarity to the target SSID
export const getSortedNetworksByFuzzyMatch = (
  targetSSID: string,
  networks: WiFiNetwork[]
): WiFiNetwork[] => {
  if (!targetSSID || networks.length === 0) return [];

  // Configure Fuse.js options
  const options = {
    includeScore: true,
    keys: ["SSID"],
    threshold: 0.8, // Higher threshold allows more results
  };

  // Create a new Fuse instance
  const fuse = new Fuse(networks, options);

  // Search for the target SSID
  const results = fuse.search(targetSSID);

  // Map results back to WiFiNetwork objects
  return results.map((result) => result.item);
};

// Extract security protocol from capabilities string
export const getSecurityProtocol = (capabilities?: string): string => {
  if (!capabilities) return "Unknown";

  if (capabilities.includes("WPA3")) return "WPA3";
  if (capabilities.includes("WPA2")) return "WPA2";
  if (capabilities.includes("WPA")) return "WPA";
  if (capabilities.includes("WEP")) return "WEP";
  if (capabilities.includes("PSK") && !capabilities.includes("WPA"))
    return "PSK";
  if (capabilities.includes("EAP") && !capabilities.includes("WPA"))
    return "Enterprise";

  return "Unsecured";
};

// Connect to a WiFi network
export const connectToWiFi = async (
  ssid: string,
  password: string,
  isWPA: boolean = true
): Promise<boolean> => {
  try {
    if (Platform.OS === "android") {
      // On Android, we can suggest the network
      const success = await WiFiManager.suggestWifiNetwork([
        {
          ssid,
          password,
          isAppInteractionRequired: false,
        },
      ]);
      console.log("success", success);
      return true;
    } else if (Platform.OS === "ios") {
      // On iOS, we need to use a different method
      await WiFiManager.connectToProtectedSSIDPrefix(
        ssid,
        password,
        !isWPA // iOS only
      );
      return true;
    }
    return false;
  } catch (error) {
    console.error("Error connecting to WiFi:", error);
    return false;
  }
};

// Deduplicate networks by SSID, keeping only the strongest signal one
export const deduplicateNetworksBySSID = (
  networks: WiFiNetwork[]
): WiFiNetwork[] => {
  if (!networks || networks.length === 0) return [];

  // First filter out hidden networks
  const visibleNetworks = filterOutHiddenNetworks(networks);

  const uniqueNetworks = new Map<string, WiFiNetwork>();

  // Process each network
  for (const network of visibleNetworks) {
    // If we haven't seen this SSID before, add it
    if (!uniqueNetworks.has(network.SSID)) {
      uniqueNetworks.set(network.SSID, network);
      continue;
    }

    // If we've seen this SSID before, compare signal strength
    const existingNetwork = uniqueNetworks.get(network.SSID)!;

    // If the new network has a stronger signal (higher level), replace the existing one
    // Note: WiFi signal strength is measured in dBm, where higher (less negative) values
    // indicate stronger signals (e.g., -50 dBm is stronger than -80 dBm)
    if (
      network.level !== undefined &&
      (existingNetwork.level === undefined ||
        network.level > existingNetwork.level)
    ) {
      uniqueNetworks.set(network.SSID, network);
    }
  }

  // Convert Map values to array
  return Array.from(uniqueNetworks.values());
};
