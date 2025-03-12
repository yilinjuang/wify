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
export const extractWiFiFromText = (text: string): WiFiCredentials[] => {
  const results: WiFiCredentials[] = [];

  // Common patterns for WiFi information
  const ssidPatterns = [
    /SSID\s*:?\s*(["']?)([^"'\n]+)\1/i,
    /Network\s*:?\s*(["']?)([^"'\n]+)\1/i,
    /WiFi\s*:?\s*(["']?)([^"'\n]+)\1/i,
    /Network name\s*:?\s*(["']?)([^"'\n]+)\1/i,
  ];

  const passwordPatterns = [
    /Password\s*:?\s*(["']?)([^"'\n]+)\1/i,
    /Pass\s*:?\s*(["']?)([^"'\n]+)\1/i,
    /Passphrase\s*:?\s*(["']?)([^"'\n]+)\1/i,
    /Network key\s*:?\s*(["']?)([^"'\n]+)\1/i,
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
        break;
      }
    }

    results.push({
      ssid,
      password,
      isWPA: true, // Assume WPA by default
    });
  }

  return results;
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
      // On Android, we can connect directly
      await WiFiManager.connectToProtectedSSID(
        ssid,
        password,
        false, // iOS only
        false // Android only
      );
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
