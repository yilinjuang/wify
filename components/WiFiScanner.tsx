import {
  Camera,
  CameraCapturedPicture,
  CameraView,
  FlashMode,
} from "expo-camera";
import React, { useEffect, useRef, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { recognizeTextFromImage } from "../utils/textRecognition";
import {
  getSortedNetworksByFuzzyMatch,
  parseWiFiQRCode,
  scanWiFiNetworks,
  WiFiCredentials,
  WiFiNetwork,
} from "../utils/wifi";
import WiFiConnectionModal from "./WiFiConnectionModal";
import WiFiNetworkSelectionModal from "./WiFiNetworkSelectionModal";

interface WiFiScannerProps {
  onPermissionsNeeded: () => void;
}

const WiFiScanner: React.FC<WiFiScannerProps> = ({ onPermissionsNeeded }) => {
  const [hasPermission, setHasPermission] = useState<boolean | null>(null);
  const [scannedData, setScannedData] = useState<string | null>(null);
  const [isScanning, setIsScanning] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [availableNetworks, setAvailableNetworks] = useState<WiFiNetwork[]>([]);
  const [sortedNetworks, setSortedNetworks] = useState<WiFiNetwork[]>([]);
  const [selectedNetwork, setSelectedNetwork] = useState<WiFiNetwork | null>(
    null
  );
  const [credentials, setCredentials] = useState<WiFiCredentials | null>(null);
  const [showConnectionModal, setShowConnectionModal] = useState(false);
  const [showNetworkSelectionModal, setShowNetworkSelectionModal] =
    useState(false);
  const [flashMode, setFlashMode] = useState<FlashMode>("off");

  const cameraRef = useRef<CameraView>(null);

  useEffect(() => {
    (async () => {
      const { status } = await Camera.requestCameraPermissionsAsync();
      setHasPermission(status === "granted");

      if (status !== "granted") {
        onPermissionsNeeded();
      }
    })();
  }, []);

  const toggleFlash = () => {
    setFlashMode(flashMode === "off" ? "on" : "off");
  };

  const scanWiFi = async () => {
    setIsScanning(true);
    try {
      const networks = await scanWiFiNetworks();
      setAvailableNetworks(networks);
      console.log("Available networks:", networks);
    } catch (error) {
      console.error("Error scanning WiFi:", error);
      Alert.alert("Error", "Failed to scan WiFi networks. Please try again.");
    } finally {
      setIsScanning(false);
    }
  };

  const handleBarCodeScanned = ({
    type,
    data,
  }: {
    type: string;
    data: string;
  }) => {
    if (isProcessing) return;

    setIsProcessing(true);
    setScannedData(data);

    // Try to parse WiFi QR code
    const wifiCredentials = parseWiFiQRCode(data);

    if (wifiCredentials) {
      processWiFiCredentials(wifiCredentials);
    } else {
      // Not a WiFi QR code
      setIsProcessing(false);
      Alert.alert(
        "Not a WiFi QR Code",
        "The scanned QR code does not contain WiFi information. Please try again or use text recognition.",
        [{ text: "OK", onPress: () => setScannedData(null) }]
      );
    }
  };

  const takePicture = async () => {
    if (cameraRef.current && !isProcessing) {
      setIsProcessing(true);
      try {
        const photo = await cameraRef.current.takePictureAsync();
        if (photo) {
          await processImage(photo);
        } else {
          Alert.alert("Error", "Failed to capture image. Please try again.");
          setIsProcessing(false);
        }
      } catch (error) {
        console.error("Error taking picture:", error);
        Alert.alert("Error", "Failed to capture image. Please try again.");
        setIsProcessing(false);
      }
    }
  };

  const processImage = async (photo: CameraCapturedPicture) => {
    try {
      // Perform text recognition
      const extractedCredentials = await recognizeTextFromImage(photo);

      if (extractedCredentials.length > 0) {
        // Use the first set of credentials found
        processWiFiCredentials(extractedCredentials[0]);
      } else {
        Alert.alert(
          "No WiFi Information Found",
          "Could not detect any WiFi credentials in the image. Please try again.",
          [{ text: "OK" }]
        );
        setIsProcessing(false);
      }
    } catch (error) {
      console.error("Error processing image:", error);
      Alert.alert("Error", "Failed to process image. Please try again.");
      setIsProcessing(false);
    }
  };

  const processWiFiCredentials = async (wifiCredentials: WiFiCredentials) => {
    setCredentials(wifiCredentials);

    // Scan for WiFi networks if not already done
    let networksToUse = availableNetworks;
    if (networksToUse.length === 0) {
      try {
        // Directly use the returned networks instead of relying on state update
        networksToUse = await scanWiFiNetworks();
        setAvailableNetworks(networksToUse);
      } catch (error) {
        console.error("Error scanning WiFi:", error);
        Alert.alert("Error", "Failed to scan WiFi networks. Please try again.");
        setIsProcessing(false);
        return;
      }
    }

    // Sort networks by fuzzy match similarity using the local variable
    const sorted = getSortedNetworksByFuzzyMatch(
      wifiCredentials.ssid,
      networksToUse
    );
    setSortedNetworks(sorted);

    // Show network selection modal
    setShowNetworkSelectionModal(true);
    setIsProcessing(false);
  };

  const handleSelectNetwork = (network: WiFiNetwork) => {
    setSelectedNetwork(network);
    setShowNetworkSelectionModal(false);
    setShowConnectionModal(true);
  };

  const handleCloseNetworkSelectionModal = () => {
    setShowNetworkSelectionModal(false);
    setScannedData(null);
    setCredentials(null);
  };

  const handleCloseConnectionModal = () => {
    setShowConnectionModal(false);
    setScannedData(null);
    setCredentials(null);
    setSelectedNetwork(null);
  };

  if (hasPermission === null) {
    return (
      <View style={styles.container}>
        <ActivityIndicator size="large" color="#2196F3" />
        <Text style={styles.text}>Requesting camera permission...</Text>
      </View>
    );
  }

  if (hasPermission === false) {
    return (
      <View style={styles.container}>
        <Text style={styles.text}>No access to camera</Text>
        <TouchableOpacity
          style={styles.actionButton}
          onPress={onPermissionsNeeded}
        >
          <Text style={styles.buttonText}>Grant Permissions</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <CameraView
        ref={cameraRef}
        style={styles.camera}
        flash={flashMode}
        onBarcodeScanned={scannedData ? undefined : handleBarCodeScanned}
        barcodeScannerSettings={{
          barcodeTypes: ["qr"],
        }}
      >
        <View style={styles.overlay}>
          <View style={styles.scanArea} />
        </View>

        <View style={styles.controlsContainer}>
          <TouchableOpacity style={styles.controlButton} onPress={toggleFlash}>
            <Text style={styles.buttonText}>
              {flashMode === "on" ? "Flash Off" : "Flash On"}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.captureButton}
            onPress={takePicture}
            disabled={isProcessing}
          >
            <View style={styles.captureButtonInner} />
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.controlButton}
            onPress={scanWiFi}
            disabled={isScanning}
          >
            <Text style={styles.buttonText}>
              {isScanning ? "Scanning..." : "Scan WiFi"}
            </Text>
          </TouchableOpacity>
        </View>
      </CameraView>

      {isProcessing && (
        <View style={styles.processingOverlay}>
          <ActivityIndicator size="large" color="#FFFFFF" />
          <Text style={styles.processingText}>Processing...</Text>
        </View>
      )}

      {showNetworkSelectionModal && credentials && (
        <WiFiNetworkSelectionModal
          visible={showNetworkSelectionModal}
          networks={sortedNetworks}
          searchTerm={credentials.ssid}
          onSelectNetwork={handleSelectNetwork}
          onCancel={handleCloseNetworkSelectionModal}
        />
      )}

      {showConnectionModal && credentials && selectedNetwork && (
        <WiFiConnectionModal
          visible={showConnectionModal}
          credentials={credentials}
          matchedNetwork={selectedNetwork}
          onClose={handleCloseConnectionModal}
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#000",
  },
  camera: {
    flex: 1,
  },
  overlay: {
    flex: 1,
    backgroundColor: "transparent",
    justifyContent: "center",
    alignItems: "center",
  },
  scanArea: {
    width: 250,
    height: 250,
    borderWidth: 2,
    borderColor: "#FFFFFF",
    borderRadius: 10,
  },
  controlsContainer: {
    position: "absolute",
    bottom: 40,
    left: 0,
    right: 0,
    flexDirection: "row",
    justifyContent: "space-around",
    alignItems: "center",
    paddingHorizontal: 20,
  },
  controlButton: {
    backgroundColor: "rgba(0, 0, 0, 0.6)",
    padding: 10,
    borderRadius: 10,
    width: 100,
    alignItems: "center",
  },
  captureButton: {
    width: 70,
    height: 70,
    borderRadius: 35,
    backgroundColor: "rgba(255, 255, 255, 0.3)",
    justifyContent: "center",
    alignItems: "center",
  },
  captureButtonInner: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: "#FFFFFF",
  },
  buttonText: {
    color: "#FFFFFF",
    fontWeight: "bold",
  },
  text: {
    color: "#FFFFFF",
    fontSize: 16,
    marginTop: 10,
    textAlign: "center",
  },
  processingOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0, 0, 0, 0.7)",
    justifyContent: "center",
    alignItems: "center",
  },
  processingText: {
    color: "#FFFFFF",
    fontSize: 18,
    marginTop: 10,
  },
  actionButton: {
    backgroundColor: "#2196F3",
    padding: 10,
    borderRadius: 10,
    margin: 20,
  },
});

export default WiFiScanner;
