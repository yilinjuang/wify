import React, { useEffect, useRef, useState } from "react";
import {
  Alert,
  AppState,
  AppStateStatus,
  SafeAreaView,
  StatusBar,
  StyleSheet,
} from "react-native";
import PermissionsModal from "../components/PermissionsModal";
import WiFiScanner from "../components/WiFiScanner";
import {
  checkPermissions,
  PermissionStatus,
  requestPermissions,
} from "../utils/permissions";

export default function App() {
  const [permissionStatus, setPermissionStatus] = useState<PermissionStatus>({
    camera: false,
    location: false,
    allGranted: false,
    cameraPermanentlyDenied: false,
    locationPermanentlyDenied: false,
    anyPermanentlyDenied: false,
  });
  const [showPermissionsModal, setShowPermissionsModal] = useState(false);
  const appStateRef = useRef(AppState.currentState);
  const [isReturningFromBackground, setIsReturningFromBackground] =
    useState(false);

  // Check permissions when the component mounts
  useEffect(() => {
    checkInitialPermissions();
  }, []);

  // Listen for app state changes to reload permissions when app is resumed
  useEffect(() => {
    const subscription = AppState.addEventListener(
      "change",
      handleAppStateChange
    );

    return () => {
      subscription.remove();
    };
  }, []);

  const handleAppStateChange = async (nextAppState: AppStateStatus) => {
    const previousAppState = appStateRef.current;

    // When app comes back to active state from background or inactive
    if (
      (previousAppState === "background" || previousAppState === "inactive") &&
      nextAppState === "active"
    ) {
      setIsReturningFromBackground(true);
      await checkInitialPermissions();
    } else {
      setIsReturningFromBackground(false);
    }

    appStateRef.current = nextAppState;
  };

  const checkInitialPermissions = async () => {
    const status = await checkPermissions();
    const previousStatus = permissionStatus;
    setPermissionStatus(status);

    // If permissions were granted while in background, show a notification
    if (
      !previousStatus.allGranted &&
      status.allGranted &&
      isReturningFromBackground
    ) {
      Alert.alert(
        "Permissions Granted",
        "All required permissions have been granted. You can now use the app.",
        [{ text: "OK" }]
      );
    }

    if (!status.allGranted) {
      setShowPermissionsModal(true);
    } else {
      setShowPermissionsModal(false);
    }
  };

  const handleRequestPermissions = async () => {
    const status = await requestPermissions();
    setPermissionStatus(status);

    if (status.allGranted) {
      setShowPermissionsModal(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#000000" />

      <WiFiScanner permissionStatus={permissionStatus} />

      <PermissionsModal
        visible={showPermissionsModal}
        permissionStatus={permissionStatus}
        onRequestPermissions={handleRequestPermissions}
        onClose={() => {
          if (permissionStatus.allGranted) {
            setShowPermissionsModal(false);
          }
        }}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#000",
  },
});
