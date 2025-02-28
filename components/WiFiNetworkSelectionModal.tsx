import React from "react";
import {
  FlatList,
  Modal,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { WiFiNetwork } from "../utils/wifi";

interface WiFiNetworkSelectionModalProps {
  visible: boolean;
  networks: WiFiNetwork[];
  searchTerm: string;
  onSelectNetwork: (network: WiFiNetwork) => void;
  onCancel: () => void;
}

const WiFiNetworkSelectionModal: React.FC<WiFiNetworkSelectionModalProps> = ({
  visible,
  networks,
  searchTerm,
  onSelectNetwork,
  onCancel,
}) => {
  // Render a single network item
  const renderNetworkItem = ({ item }: { item: WiFiNetwork }) => {
    // Display signal strength as bars (0-4)
    const getSignalStrength = (level?: number) => {
      if (!level) return "●○○○";
      if (level >= -50) return "●●●●";
      if (level >= -60) return "●●●○";
      if (level >= -70) return "●●○○";
      return "●○○○";
    };

    return (
      <TouchableOpacity
        style={styles.networkItem}
        onPress={() => onSelectNetwork(item)}
      >
        <View style={styles.networkInfo}>
          <Text style={styles.networkName}>{item.SSID}</Text>
          {item.capabilities && (
            <Text style={styles.securityInfo}>
              {item.capabilities.includes("WPA") ? "🔒 Secured" : "Unsecured"}
            </Text>
          )}
        </View>
        <Text style={styles.signalStrength}>
          {getSignalStrength(item.level)}
        </Text>
      </TouchableOpacity>
    );
  };

  return (
    <Modal
      visible={visible}
      transparent={true}
      animationType="slide"
      onRequestClose={onCancel}
    >
      <View style={styles.modalContainer}>
        <View style={styles.modalContent}>
          <View style={styles.header}>
            <Text style={styles.title}>Select WiFi Network</Text>
            {searchTerm && (
              <Text style={styles.subtitle}>
                Showing networks similar to "{searchTerm}"
              </Text>
            )}
          </View>

          {networks.length > 0 ? (
            <FlatList
              data={networks}
              renderItem={renderNetworkItem}
              keyExtractor={(item) => item.BSSID || item.SSID}
              style={styles.networkList}
            />
          ) : (
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyText}>No networks found</Text>
            </View>
          )}

          <View style={styles.buttonContainer}>
            <TouchableOpacity style={styles.cancelButton} onPress={onCancel}>
              <Text style={styles.cancelButtonText}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0, 0, 0, 0.7)",
  },
  modalContent: {
    width: "90%",
    maxHeight: "80%",
    backgroundColor: "#1a1a1a",
    borderRadius: 15,
    overflow: "hidden",
  },
  header: {
    padding: 15,
    borderBottomWidth: 1,
    borderBottomColor: "#333",
  },
  title: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#FFFFFF",
    textAlign: "center",
  },
  subtitle: {
    fontSize: 14,
    color: "#BBBBBB",
    textAlign: "center",
    marginTop: 5,
  },
  networkList: {
    maxHeight: 300,
  },
  networkItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 15,
    borderBottomWidth: 1,
    borderBottomColor: "#333",
  },
  networkInfo: {
    flex: 1,
  },
  networkName: {
    fontSize: 16,
    color: "#FFFFFF",
    marginBottom: 4,
  },
  securityInfo: {
    fontSize: 12,
    color: "#BBBBBB",
  },
  signalStrength: {
    fontSize: 14,
    color: "#2196F3",
    fontFamily: "monospace",
  },
  emptyContainer: {
    padding: 30,
    alignItems: "center",
  },
  emptyText: {
    color: "#BBBBBB",
    fontSize: 16,
  },
  buttonContainer: {
    padding: 15,
    borderTopWidth: 1,
    borderTopColor: "#333",
  },
  cancelButton: {
    backgroundColor: "#333",
    padding: 12,
    borderRadius: 10,
    alignItems: "center",
  },
  cancelButtonText: {
    color: "#FFFFFF",
    fontWeight: "bold",
    fontSize: 16,
  },
});

export default WiFiNetworkSelectionModal;
