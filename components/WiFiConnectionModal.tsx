import React, { useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Modal,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { WiFiCredentials, WiFiNetwork, connectToWiFi } from "../utils/wifi";

interface WiFiConnectionModalProps {
  visible: boolean;
  credentials: WiFiCredentials;
  matchedNetwork: WiFiNetwork | null;
  onClose: () => void;
}

const WiFiConnectionModal: React.FC<WiFiConnectionModalProps> = ({
  visible,
  credentials,
  matchedNetwork,
  onClose,
}) => {
  const [password, setPassword] = useState(credentials.password || "");
  const [isConnecting, setIsConnecting] = useState(false);

  const handleConnect = async () => {
    if (!matchedNetwork) {
      Alert.alert(
        "No Matching Network",
        "Could not find a matching WiFi network. Please make sure the network is in range.",
        [{ text: "OK", onPress: onClose }]
      );
      return;
    }

    setIsConnecting(true);

    try {
      const success = await connectToWiFi(
        matchedNetwork.SSID,
        password,
        credentials.isWPA
      );
      console.log("success", success);

      if (success) {
        Alert.alert(
          "Connected",
          `Successfully connected to ${matchedNetwork.SSID}`,
          [{ text: "OK", onPress: onClose }]
        );
      } else {
        Alert.alert(
          "Connection Failed",
          "Failed to connect to the WiFi network. Please check the password and try again.",
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

          <View style={styles.networkInfo}>
            <Text style={styles.label}>Network:</Text>
            <Text style={styles.networkName}>
              {matchedNetwork ? matchedNetwork.SSID : credentials.ssid}
              {!matchedNetwork && " (Not in range)"}
            </Text>
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

          <View style={styles.buttonContainer}>
            {isConnecting ? (
              <View style={styles.loadingContainer}>
                <ActivityIndicator size="small" color="#2196F3" />
                <Text style={styles.loadingText}>Connecting...</Text>
              </View>
            ) : (
              <>
                <TouchableOpacity
                  style={[
                    styles.button,
                    styles.connectButton,
                    !matchedNetwork && styles.disabledButton,
                  ]}
                  onPress={handleConnect}
                  disabled={!matchedNetwork || isConnecting}
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
  networkInfo: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 20,
    width: "100%",
  },
  label: {
    fontSize: 16,
    fontWeight: "600",
    marginRight: 10,
  },
  networkName: {
    fontSize: 16,
    flex: 1,
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
  disabledButton: {
    backgroundColor: "#B0BEC5",
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
});

export default WiFiConnectionModal;
