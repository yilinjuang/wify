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

// Scan for available WiFi networks
export const scanWiFiNetworks = async (): Promise<WiFiNetwork[]> => {
  try {
    // On iOS, we need to load the list differently
    if (Platform.OS === "ios") {
      // iOS doesn't support scanning for networks directly
      // We can only get the current connected network
      const ssid = await WiFiManager.getCurrentWifiSSID();
      return ssid ? [{ SSID: ssid }] : [];
    } else {
      // On Android, we can scan for networks
      return await WiFiManager.loadWifiList();
    }
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
