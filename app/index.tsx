import React, { useEffect, useState } from "react";
import { SafeAreaView, StatusBar, StyleSheet, Text, View } from "react-native";
import PermissionsModal from "./components/PermissionsModal";
import WiFiScanner from "./components/WiFiScanner";
import {
  checkPermissions,
  PermissionStatus,
  requestPermissions,
} from "./utils/permissions";

export default function App() {
  const [permissionStatus, setPermissionStatus] = useState<PermissionStatus>({
    camera: false,
    location: false,
    allGranted: false,
  });
  const [showPermissionsModal, setShowPermissionsModal] = useState(false);

  useEffect(() => {
    checkInitialPermissions();
  }, []);

  const checkInitialPermissions = async () => {
    const status = await checkPermissions();
    setPermissionStatus(status);

    if (!status.allGranted) {
      setShowPermissionsModal(true);
    }
  };

  const handleRequestPermissions = async () => {
    const status = await requestPermissions();
    setPermissionStatus(status);

    if (status.allGranted) {
      setShowPermissionsModal(false);
    }
  };

  const handlePermissionsNeeded = () => {
    setShowPermissionsModal(true);
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#000000" />

      <View style={styles.header}>
        <Text style={styles.headerText}>WiFi Scanner</Text>
      </View>

      <WiFiScanner onPermissionsNeeded={handlePermissionsNeeded} />

      <PermissionsModal
        visible={showPermissionsModal}
        permissionStatus={permissionStatus}
        onRequestPermissions={handleRequestPermissions}
        onClose={() => setShowPermissionsModal(false)}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#000",
  },
  header: {
    padding: 15,
    backgroundColor: "#1a1a1a",
    alignItems: "center",
    justifyContent: "center",
  },
  headerText: {
    color: "#FFFFFF",
    fontSize: 18,
    fontWeight: "bold",
  },
});
