import { Ionicons } from "@expo/vector-icons";
import React, { useEffect, useState } from "react";
import {
  Alert,
  Modal,
  Platform,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import QRCode from "react-native-qrcode-svg";
import { WiFiCredentials, connectToWiFi } from "../utils/wifi";

interface WiFiConnectionModalProps {
  visible: boolean;
  credentials: WiFiCredentials;
  onClose: () => void;
}

const WiFiConnectionModal: React.FC<WiFiConnectionModalProps> = ({
  visible,
  credentials,
  onClose,
}) => {
  const [ssid, setSsid] = useState(credentials.ssid || "");
  const [password, setPassword] = useState(credentials.password || "");
  const [isConnecting, setIsConnecting] = useState(false);

  // Update state when credentials change
  useEffect(() => {
    setSsid(credentials.ssid || "");
    setPassword(credentials.password || "");
  }, [credentials]);

  // Generate WiFi connection string for QR code
  const getWifiConnectionString = () => {
    const authType = credentials.isWPA ? "WPA" : "WEP";
    return `WIFI:S:${ssid};T:${authType};P:${password};;`;
  };

  const handleConnect = async () => {
    if (!ssid.trim()) {
      Alert.alert("Missing Network Name", "Please enter a WiFi network name.", [
        { text: "OK" },
      ]);
      return;
    }

    setIsConnecting(true);

    try {
      const success = await connectToWiFi(ssid, password, credentials.isWPA);

      if (success) {
        Alert.alert("Connected", `Successfully connected to ${ssid}`, [
          { text: "OK", onPress: onClose },
        ]);
      } else {
        Alert.alert(
          "Connection Failed",
          "Failed to connect to the WiFi network. Please check the network name and password and try again.",
          [{ text: "OK" }]
        );
      }
    } catch (error) {
      console.error("Error connecting to WiFi:", error);
      Alert.alert(
        "Connection Error",
        "An error occurred while connecting to the WiFi network. Please try again.",
        [{ text: "OK" }]
      );
    } finally {
      setIsConnecting(false);
    }
  };

  return (
    <Modal
      animationType="slide"
      transparent={true}
      visible={visible}
      onRequestClose={onClose}
    >
      <View style={styles.centeredView}>
        <View style={styles.modalView}>
          <Text style={styles.modalTitle}>Connect to WiFi</Text>

          <View style={styles.inputContainer}>
            <Text style={styles.label}>SSID</Text>
            <TextInput
              style={styles.input}
              value={ssid}
              onChangeText={setSsid}
              placeholder="Enter WiFi network name"
              placeholderTextColor="#999"
              autoCapitalize="none"
              editable={!isConnecting}
            />
          </View>

          <View style={styles.inputContainer}>
            <Text style={styles.label}>Password</Text>
            <TextInput
              style={styles.input}
              value={password}
              onChangeText={setPassword}
              placeholder="Enter WiFi password"
              placeholderTextColor="#999"
              autoCapitalize="none"
              editable={!isConnecting}
            />
          </View>

          {Platform.OS === "android" ? (
            <>
              <Text style={styles.qrInstructions}>
                Use circle to search to scan and connect
              </Text>
              <View style={styles.qrContainer}>
                <QRCode
                  value={getWifiConnectionString()}
                  size={200}
                  color="black"
                  backgroundColor="white"
                />
              </View>
              <TouchableOpacity
                style={[styles.button, styles.closeButton]}
                onPress={onClose}
              >
                <Ionicons name="close" size={24} color="white" />
              </TouchableOpacity>
            </>
          ) : (
            <View style={styles.buttonContainer}>
              <TouchableOpacity
                style={[styles.button, styles.connectButton]}
                onPress={handleConnect}
                disabled={isConnecting}
              >
                <Text style={styles.buttonText}>
                  {isConnecting ? "Connecting..." : "Connect"}
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.button, styles.cancelButton]}
                onPress={onClose}
                disabled={isConnecting}
              >
                <Text style={styles.buttonText}>Cancel</Text>
              </TouchableOpacity>
            </View>
          )}
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  centeredView: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0, 0, 0, 0.5)",
  },
  modalView: {
    margin: 20,
    backgroundColor: "white",
    borderRadius: 20,
    padding: 35,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
    width: "80%",
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 15,
    textAlign: "center",
  },
  label: {
    fontSize: 16,
    fontWeight: "600",
    marginRight: 10,
  },
  inputContainer: {
    width: "100%",
    marginBottom: 20,
  },
  input: {
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 5,
    padding: 10,
    marginTop: 5,
    width: "100%",
  },
  buttonContainer: {
    flexDirection: "row",
    width: "100%",
  },
  button: {
    borderRadius: 10,
    padding: 10,
    elevation: 2,
    marginHorizontal: 5,
  },
  connectButton: {
    flex: 1,
    backgroundColor: "#2196F3",
  },
  cancelButton: {
    backgroundColor: "#757575",
  },
  closeButton: {
    backgroundColor: "#757575",
  },
  buttonText: {
    color: "white",
    fontWeight: "bold",
    textAlign: "center",
  },
  loadingContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    width: "100%",
  },
  loadingText: {
    marginLeft: 10,
    fontSize: 16,
  },
  qrInstructions: {
    textAlign: "center",
    marginBottom: 30,
    fontSize: 14,
    color: "#555",
  },
  qrContainer: {
    marginBottom: 30,
  },
});

export default WiFiConnectionModal;
