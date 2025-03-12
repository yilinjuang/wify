# Wify

A React Native application that scans WiFi QR codes and text to extract WiFi credentials, matches them with nearby networks, and connects to them.

## Features

- **QR Code Scanning**: Scan WiFi QR codes to extract network name and password.
- **Text Recognition (OCR)**: Extract WiFi credentials from text in images.
- **Image Picker**: Select images from gallery for WiFi credential extraction.
- **WiFi Network Scanning**: Scan for nearby WiFi networks.
- **Fuzzy Matching**: Match extracted WiFi names with available networks using Fuse.js.
- **WiFi Connection**: Connect to matched WiFi networks using react-native-wifi-reborn.
- **Permission Handling**: Proper handling of camera and location permissions with user-friendly prompts.
- **Multi-language Support**: OCR recognition for Latin, Chinese, Japanese, and Korean scripts.

## Technology Stack

- **Framework**: React Native with Expo
- **Router**: Expo Router
- **WiFi Management**: react-native-wifi-reborn
- **Camera & QR Scanning**: expo-camera
- **Text Recognition**: @react-native-ml-kit/text-recognition
- **Image Picker**: expo-image-picker
- **Location Services**: expo-location
- **Fuzzy Search**: Fuse.js
- **Icons**: @expo/vector-icons

## Installation

1. Clone the repository:

   ```bash
   git clone https://github.com/yourusername/wify.git
   cd wify
   ```

2. Install dependencies:

   ```bash
   npm install
   ```

3. Run the app:

   ```bash
   npm start
   ```

4. For development on physical devices:

   ```bash
   # For Android
   npm run android

   # For iOS
   npm run ios
   ```

## Usage

1. Launch the app and grant the required permissions (camera and location).
2. Point the camera at a WiFi QR code or text containing WiFi credentials.
3. Alternatively, tap the gallery icon to select an image containing WiFi information.
4. The app will scan for nearby WiFi networks and match them with the extracted credentials.
5. If multiple networks match, you can select the correct one from a list.
6. Confirm the connection and edit the password if needed.
7. Connect to the WiFi network.

## Permissions

The app requires the following permissions:

- **Camera**: To scan QR codes and capture images for text recognition.
- **Location**: Required by the WiFi scanning functionality to discover nearby networks.
- **Photo Library**: To access images for WiFi credential extraction.

## Project Structure

- `app/`: Main application code using Expo Router
  - `index.tsx`: Main app component
  - `_layout.tsx`: App layout configuration
- `components/`: React components
  - `WiFiScanner.tsx`: Main component for camera and QR code scanning
  - `WiFiConnectionModal.tsx`: Modal for connecting to WiFi networks
  - `PermissionsModal.tsx`: Modal for handling permission requests
  - `WiFiNetworkSelectionModal.tsx`: Modal for selecting from multiple matching networks
- `utils/`: Utility functions
  - `wifi.ts`: WiFi operations including scanning, connecting, and parsing
  - `textRecognition.ts`: OCR functionality for extracting WiFi credentials from images
  - `permissions.ts`: Permission handling utilities
- `assets/`: Images and other static assets

## Key Features Implementation

- **WiFi QR Code Parsing**: Extracts SSID, password, and security type from standard WiFi QR codes.
- **Text Recognition**: Uses ML Kit to recognize text in multiple languages and extract WiFi credentials.
- **Fuzzy Matching**: Uses Fuse.js to match extracted WiFi names with available networks, even with slight differences.
- **Permission Handling**: Gracefully handles permission requests and provides guidance when permissions are denied.
- **Background App State**: Rechecks permissions when the app returns from background.

## License

MIT

## Cursor prompt

```txt
WiFi Scanner App Prompt (React Native)

Objective

Build a single-page React Native app that includes a camera-based WiFi scanner. The app should:
  - Extract WiFi names and passwords from QR codes or text recognition (OCR).
  - Scan for nearby WiFi networks and match them with extracted data.
  - Allow the user to connect to a matched WiFi network using react-native-wifi-reborn.

Technology Stack
  - Framework: React Native (not Expo)
  - WiFi Handling: react-native-wifi-reborn
  - OCR/Text Recognition: react-native-ml-kit

Features & Functionality

1. Permissions Handling
  - Before scanning, check for and request the following permissions:
  - Camera (for scanning QR codes and text via react-native-ml-kit)
  - Location (for scanning nearby WiFi networks, required by react-native-wifi-reborn)
  - If permissions are denied:
  - Show an explanation modal.
  - Provide an option to redirect to device settings.

2. Scanning & WiFi Detection
  - Start the camera scanner to detect:
  - QR codes containing WiFi credentials (e.g., WIFI:S:MyWiFi;T:WPA;P:mypassword;;).
  - Text-based WiFi details extracted via react-native-ml-kit (OCR).
  - Scan for nearby WiFi networks using react-native-wifi-reborn.
  - Show a loading indicator while scanning for networks.
  - Fuzzy match the extracted WiFi name with scanned networks.

3. User Interaction & Connection Flow
  - If a matching WiFi network is found:
  - Prompt the user to confirm the connection.
  - Display an editable field for the password:
  - If one password is detected, pre-fill it.
  - If multiple passwords are detected, allow selection from a dropdown/list.
  - Show "Connect" and "Cancel" buttons:
  - Connect → Uses react-native-wifi-reborn to request a WiFi connection.
  - Cancel → Returns the user to the camera scanner.

4. Connection Feedback
  - Success: Show a "Connected" alert.
  - Failure: Show an alert with:
  - The reason for failure (e.g., incorrect password, weak signal, permission denied).
  - An option to retry or manually enter WiFi details.

Implementation Considerations
  - WiFi Connection (react-native-wifi-reborn):
  - Use connectToProtectedSSID to connect to password-protected WiFi.
  - Handle permission requirements on both Android and iOS.
  - Provide an alternative deep link to WiFi settings if the connection fails.
  - OCR via react-native-ml-kit:
  - Perform text recognition on-device for fast and offline processing.
  - Extract and clean up recognized text before attempting fuzzy matching.
  - UI/UX Enhancements:
  - Show a loading state when scanning for networks.
  - Allow manual entry if scanning fails or a WiFi name isn't found.
  - Offer a retry button for rescanning.
```
