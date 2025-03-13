import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
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
  const isAndroid = Platform.OS === "android";

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
          <Text style={styles.modalTitle}>WiFi Connection</Text>

          <View style={styles.inputContainer}>
            <Text style={styles.label}>Network Name:</Text>
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
            <Text style={styles.label}>Password:</Text>
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

          {isAndroid ? (
            <View style={styles.qrContainer}>
              <Text style={styles.qrInstructions}>
                Scan this QR code with another device to connect to this WiFi
                network:
              </Text>
              <QRCode
                value={getWifiConnectionString()}
                size={200}
                color="black"
                backgroundColor="white"
              />
              <TouchableOpacity
                style={[styles.button, styles.closeButton]}
                onPress={onClose}
              >
                <Text style={styles.buttonText}>Close</Text>
              </TouchableOpacity>
            </View>
          ) : (
            <View style={styles.buttonContainer}>
              {isConnecting ? (
                <View style={styles.loadingContainer}>
                  <ActivityIndicator size="small" color="#2196F3" />
                  <Text style={styles.loadingText}>Connecting...</Text>
                </View>
              ) : (
                <>
                  <TouchableOpacity
                    style={[styles.button, styles.connectButton]}
                    onPress={handleConnect}
                    disabled={isConnecting}
                  >
                    <Text style={styles.buttonText}>Connect</Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={[styles.button, styles.cancelButton]}
                    onPress={onClose}
                    disabled={isConnecting}
                  >
                    <Text style={styles.buttonText}>Cancel</Text>
                  </TouchableOpacity>
                </>
              )}
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
    justifyContent: "space-between",
    width: "100%",
  },
  button: {
    borderRadius: 10,
    padding: 10,
    elevation: 2,
    flex: 1,
    marginHorizontal: 5,
  },
  connectButton: {
    backgroundColor: "#2196F3",
  },
  cancelButton: {
    backgroundColor: "#757575",
  },
  closeButton: {
    backgroundColor: "#757575",
    marginTop: 20,
    width: "50%",
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
  qrContainer: {
    alignItems: "center",
    marginTop: 10,
  },
  qrInstructions: {
    textAlign: "center",
    marginBottom: 15,
    fontSize: 14,
    color: "#555",
  },
});

export default WiFiConnectionModal;
