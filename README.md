# Wify

A React Native application that scans WiFi text to extract WiFi credentials, matches them with nearby networks, and connects to them.

## Why I Built This

I travel and work remotely a lot. Every new place—hotels, cafes, coworking spaces—comes with a new WiFi network. Sometimes there’s a QR code, which makes things easy, but more often, it’s a hassle: manually searching for the right SSID (especially frustrating when hotels have a different one for each room) and typing long, error-prone passwords.

To simplify this, I built this app. It uses the phone’s camera to capture WiFi details (network name and password) from printed text and instantly generates a QR code on the screen. With Google Circle to Search or Google Lens, connecting is effortless. An image from the gallery can also be imported instead of using the camera.

I also built [Wify for Mac](https://github.com/yilinjuang/wify-mac), which scans Wi-Fi QR codes using a Mac’s camera and connects to the corresponding network instantly—perfect for syncing Wi-Fi credentials across Android and Mac without manual entry.

## Features

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
- **Camera**: expo-camera
- **Text Recognition**: @react-native-ml-kit/text-recognition
- **Image Picker**: expo-image-picker
- **Location Services**: expo-location
- **Fuzzy Search**: Fuse.js
- **Icons**: @expo/vector-icons

## Installation

<a href="https://play.google.com/store/apps/details?id=com.yilinjuang.wify">
  <img alt="Get it on Google Play" src="https://play.google.com/intl/en_us/badges/static/images/badges/en_badge_web_generic.png" width="200px"/>
</a>

### Manual Installation

1. Clone the repository:

   ```bash
   git clone https://github.com/yilinjuang/wify.git
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
2. Point the camera at a WiFi text containing WiFi credentials.
3. Alternatively, tap the gallery icon to select an image containing WiFi information.
4. The app will scan for nearby WiFi networks and match them with the extracted credentials.
5. If multiple networks match, you can select the correct one from a list.
6. Confirm the connection and edit the password if needed.
7. Connect to the WiFi network.

## Permissions

The app requires the following permissions:

- **Camera**: To scan WiFi text.
- **Location**: Required by the WiFi scanning functionality to discover nearby networks.
- **Photo Library**: To access images for WiFi credential extraction.

## Project Structure

- `app/`: Main application code using Expo Router
  - `index.tsx`: Main app component
  - `_layout.tsx`: App layout configuration
- `components/`: React components
  - `WiFiScanner.tsx`: Main component for camera and WiFi text scanning
  - `WiFiConnectionModal.tsx`: Modal for connecting to WiFi networks
  - `PermissionsModal.tsx`: Modal for handling permission requests
- `utils/`: Utility functions
  - `wifi.ts`: WiFi operations including scanning, connecting, and parsing
  - `textRecognition.ts`: OCR functionality for extracting WiFi credentials from images
  - `permissions.ts`: Permission handling utilities
- `assets/`: Images and other static assets

## Key Features Implementation

- **Text Recognition**: Uses ML Kit to recognize text in multiple languages and extract WiFi credentials.
- **Fuzzy Matching**: Uses Fuse.js to match extracted WiFi names with available networks, even with slight differences.
- **Permission Handling**: Gracefully handles permission requests and provides guidance when permissions are denied.
- **Background App State**: Rechecks permissions when the app returns from background.

## Demo

https://github.com/user-attachments/assets/a0dea5bd-db5a-4051-bb37-3e81c243e905

## License

MIT
