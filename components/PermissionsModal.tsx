import React from "react";
import {
  Linking,
  Modal,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { PermissionStatus } from "../utils/permissions";

interface PermissionsModalProps {
  visible: boolean;
  permissionStatus: PermissionStatus;
  onRequestPermissions: () => void;
  onClose: () => void;
}

const PermissionsModal: React.FC<PermissionsModalProps> = ({
  visible,
  permissionStatus,
  onRequestPermissions,
  onClose,
}) => {
  const openSettings = () => {
    Linking.openSettings();
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
          <Text style={styles.modalTitle}>Permissions Required</Text>

          <Text style={styles.modalText}>
            This app needs the following permissions to function properly:
          </Text>

          <View style={styles.permissionItem}>
            <Text style={styles.permissionName}>Camera: </Text>
            <Text
              style={[
                styles.permissionStatus,
                { color: permissionStatus.camera ? "#4CAF50" : "#F44336" },
              ]}
            >
              {permissionStatus.camera ? "Granted" : "Denied"}
            </Text>
          </View>

          <View style={styles.permissionItem}>
            <Text style={styles.permissionName}>Location: </Text>
            <Text
              style={[
                styles.permissionStatus,
                { color: permissionStatus.location ? "#4CAF50" : "#F44336" },
              ]}
            >
              {permissionStatus.location ? "Granted" : "Denied"}
            </Text>
          </View>

          <Text style={styles.explanationText}>
            • Camera permission is needed to scan QR codes and recognize WiFi
            credentials.
          </Text>
          <Text style={styles.explanationText}>
            • Location permission is required to scan for nearby WiFi networks.
          </Text>

          <View style={styles.buttonContainer}>
            <TouchableOpacity
              style={[styles.button, styles.buttonRequest]}
              onPress={onRequestPermissions}
            >
              <Text style={styles.buttonText}>Request Permissions</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.button, styles.buttonSettings]}
              onPress={openSettings}
            >
              <Text style={styles.buttonText}>Open Settings</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.button, styles.buttonCancel]}
              onPress={onClose}
            >
              <Text style={styles.buttonText}>Cancel</Text>
            </TouchableOpacity>
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
  modalText: {
    marginBottom: 15,
    textAlign: "center",
  },
  permissionItem: {
    flexDirection: "row",
    alignItems: "center",
    marginVertical: 5,
    width: "100%",
  },
  permissionName: {
    fontSize: 16,
    fontWeight: "600",
  },
  permissionStatus: {
    fontSize: 16,
  },
  explanationText: {
    marginTop: 10,
    textAlign: "left",
    width: "100%",
  },
  buttonContainer: {
    marginTop: 20,
    width: "100%",
  },
  button: {
    borderRadius: 10,
    padding: 10,
    elevation: 2,
    marginVertical: 5,
  },
  buttonRequest: {
    backgroundColor: "#2196F3",
  },
  buttonSettings: {
    backgroundColor: "#FF9800",
  },
  buttonCancel: {
    backgroundColor: "#757575",
  },
  buttonText: {
    color: "white",
    fontWeight: "bold",
    textAlign: "center",
  },
});

export default PermissionsModal;
