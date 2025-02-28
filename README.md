# WiFi Scanner App

A React Native application that scans WiFi QR codes and text to extract WiFi credentials, matches them with nearby networks, and connects to them.

## Features

- **QR Code Scanning**: Scan WiFi QR codes to extract network name and password.
- **Text Recognition (OCR)**: Extract WiFi credentials from text in images.
- **WiFi Network Scanning**: Scan for nearby WiFi networks.
- **Fuzzy Matching**: Match extracted WiFi names with available networks.
- **WiFi Connection**: Connect to matched WiFi networks.
- **Permission Handling**: Proper handling of camera and location permissions.

## Technology Stack

- **Framework**: React Native with Expo
- **WiFi Management**: react-native-wifi-reborn
- **Camera & QR Scanning**: expo-camera
- **Text Recognition**: @react-native-ml-kit/text-recognition
- **Location Services**: expo-location
- **Fuzzy Search**: fuzzysort

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

4. Follow the Expo CLI instructions to run on a device or emulator.

## Usage

1. Launch the app and grant the required permissions (camera and location).
2. Point the camera at a WiFi QR code or text containing WiFi credentials.
3. The app will scan for nearby WiFi networks and match them with the extracted credentials.
4. Confirm the connection and enter/edit the password if needed.
5. Connect to the WiFi network.

## Permissions

The app requires the following permissions:

- **Camera**: To scan QR codes and capture images for text recognition.
- **Location**: Required by the WiFi scanning functionality to discover nearby networks.

## Development

### Project Structure

- `app/`: Main application code
  - `components/`: React components
  - `utils/`: Utility functions for permissions, WiFi operations, and text recognition
- `assets/`: Images and other static assets

### Key Components

- `WiFiScanner`: Main component for camera and QR code scanning
- `WiFiConnectionModal`: Modal for connecting to WiFi networks
- `PermissionsModal`: Modal for handling permission requests

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
  - Show “Connect” and “Cancel” buttons:
  - Connect → Uses react-native-wifi-reborn to request a WiFi connection.
  - Cancel → Returns the user to the camera scanner.

4. Connection Feedback
  - Success: Show a “Connected” alert.
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
  - Allow manual entry if scanning fails or a WiFi name isn’t found.
  - Offer a retry button for rescanning.
```
