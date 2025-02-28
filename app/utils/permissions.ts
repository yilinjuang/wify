import { Camera } from "expo-camera";
import * as Location from "expo-location";

export interface PermissionStatus {
  camera: boolean;
  location: boolean;
  allGranted: boolean;
}

export const requestPermissions = async (): Promise<PermissionStatus> => {
  // Request camera permission
  const cameraPermission = await Camera.requestCameraPermissionsAsync();

  // Request location permission
  const locationPermission = await Location.requestForegroundPermissionsAsync();

  const permissionStatus: PermissionStatus = {
    camera: cameraPermission.status === "granted",
    location: locationPermission.status === "granted",
    allGranted:
      cameraPermission.status === "granted" &&
      locationPermission.status === "granted",
  };

  return permissionStatus;
};

export const checkPermissions = async (): Promise<PermissionStatus> => {
  // Check camera permission
  const cameraPermission = await Camera.getCameraPermissionsAsync();

  // Check location permission
  const locationPermission = await Location.getForegroundPermissionsAsync();

  const permissionStatus: PermissionStatus = {
    camera: cameraPermission.status === "granted",
    location: locationPermission.status === "granted",
    allGranted:
      cameraPermission.status === "granted" &&
      locationPermission.status === "granted",
  };

  return permissionStatus;
};
