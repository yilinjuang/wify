import { Ionicons } from "@expo/vector-icons";
import { CameraCapturedPicture, CameraView, FlashMode } from "expo-camera";
import * as ImagePicker from "expo-image-picker";
import React, { useEffect, useRef, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Linking,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { PermissionStatus } from "../utils/permissions";
import { recognizeWifiFromImage } from "../utils/textRecognition";
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
  permissionStatus?: PermissionStatus;
}

const WiFiScanner: React.FC<WiFiScannerProps> = ({ permissionStatus }) => {
  const [scannedData, setScannedData] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [sortedNetworks, setSortedNetworks] = useState<WiFiNetwork[]>([]);
  const [selectedNetwork, setSelectedNetwork] = useState<WiFiNetwork | null>(
    null
  );
  const [credentials, setCredentials] = useState<WiFiCredentials | null>(null);
  const [showConnectionModal, setShowConnectionModal] = useState(false);
  const [showNetworkSelectionModal, setShowNetworkSelectionModal] =
    useState(false);
  const [flashMode, setFlashMode] = useState<FlashMode>("off");
  const [isCameraActive, setIsCameraActive] = useState(false);
  const [isImagePickerActive, setIsImagePickerActive] = useState(false);

  const cameraRef = useRef<CameraView>(null);

  useEffect(() => {
    if (!cameraRef.current || isProcessing) {
      return;
    }

    const modalOpen =
      showConnectionModal || showNetworkSelectionModal || isImagePickerActive;

    if (modalOpen && isCameraActive) {
      cameraRef.current.pausePreview();
      setIsCameraActive(false);
    } else if (!modalOpen && !isCameraActive) {
      cameraRef.current.resumePreview();
      setIsCameraActive(true);
    }
  }, [
    showConnectionModal,
    showNetworkSelectionModal,
    isProcessing,
    isImagePickerActive,
  ]);

  const toggleFlash = () => {
    setFlashMode(flashMode === "off" ? "on" : "off");
  };

  const openImagePicker = async () => {
    if (isProcessing) {
      return;
    }

    try {
      setIsImagePickerActive(true);

      const permissionResult =
        await ImagePicker.requestMediaLibraryPermissionsAsync();

      if (!permissionResult.granted) {
        // Check if permission is permanently denied
        if (permissionResult.canAskAgain === false) {
          Alert.alert(
            "Permission Required",
            "Photo library access has been permanently denied. Please enable it in your device settings.",
            [
              { text: "Cancel", style: "cancel" },
              { text: "Open Settings", onPress: () => Linking.openSettings() },
            ]
          );
        } else {
          Alert.alert(
            "Permission Required",
            "Photo library access is needed to select photos.",
            [{ text: "OK" }]
          );
        }
        setIsImagePickerActive(false);
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ["images"],
        allowsEditing: false,
        quality: 1,
      });

      setIsImagePickerActive(false);

      if (!result.canceled && result.assets && result.assets.length > 0) {
        const selectedImage = result.assets[0];
        await processImage(selectedImage);
      }
    } catch (error) {
      console.error("Error picking image:", error);
      Alert.alert(
        "Error",
        "Failed to pick image from library. Please try again."
      );
      setIsImagePickerActive(false);
    }
  };

  const handleBarCodeScanned = ({
    type,
    data,
  }: {
    type: string;
    data: string;
  }) => {
    if (isProcessing) {
      return;
    }

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

  const processImage = async (
    photo: CameraCapturedPicture | ImagePicker.ImagePickerAsset
  ) => {
    try {
      setIsProcessing(true);
      // Perform text recognition
      const extractedCredentials = await recognizeWifiFromImage(photo);

      if (extractedCredentials) {
        // Use the credentials found
        processWiFiCredentials(extractedCredentials);
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

    // Always scan for WiFi networks to ensure fresh data
    try {
      setIsProcessing(true);
      // Scan for networks and update state
      const freshNetworks = await scanWiFiNetworks();

      // Sort networks by fuzzy match similarity
      const sorted = getSortedNetworksByFuzzyMatch(
        wifiCredentials.ssid,
        freshNetworks
      );
      setSortedNetworks(sorted);

      // Show network selection modal
      setShowNetworkSelectionModal(true);
    } catch (error) {
      console.error("Error scanning WiFi:", error);
      Alert.alert("Error", "Failed to scan WiFi networks. Please try again.");
    } finally {
      setIsProcessing(false);
    }
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

  if (!permissionStatus?.allGranted) {
    return null;
  }

  return (
    <View style={styles.container}>
      <CameraView
        ref={cameraRef}
        style={styles.camera}
        flash={flashMode}
        active={!isCameraActive}
        onBarcodeScanned={scannedData ? undefined : handleBarCodeScanned}
        barcodeScannerSettings={{
          barcodeTypes: ["qr"],
        }}
      >
        <View style={styles.overlay}>
          <View style={styles.scanArea} />
        </View>

        <View style={styles.controlsContainer}>
          <TouchableOpacity style={styles.iconButton} onPress={toggleFlash}>
            <Ionicons
              name={flashMode === "on" ? "flash" : "flash-off"}
              size={24}
              color="#FFFFFF"
            />
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.captureButton}
            onPress={takePicture}
            disabled={isProcessing}
          >
            <View style={styles.captureButtonInner} />
          </TouchableOpacity>

          <TouchableOpacity style={styles.iconButton} onPress={openImagePicker}>
            <Ionicons name="images" size={24} color="#FFFFFF" />
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
  iconButton: {
    backgroundColor: "rgba(0, 0, 0, 0.6)",
    padding: 15,
    borderRadius: 50,
    alignItems: "center",
    justifyContent: "center",
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
  spacer: {
    width: 54, // Same width as iconButton to maintain layout balance
  },
  warningText: {
    color: "#F44336",
    fontSize: 16,
    marginTop: 10,
    marginBottom: 10,
    textAlign: "center",
    paddingHorizontal: 20,
  },
  placeholderContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  permissionsOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0, 0, 0, 0.9)",
    justifyContent: "center",
    alignItems: "center",
    zIndex: 10,
  },
});

export default WiFiScanner;
