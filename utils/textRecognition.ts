import TextRecognition, {
  TextRecognitionScript,
} from "@react-native-ml-kit/text-recognition";
import { CameraCapturedPicture } from "expo-camera";
import * as ImagePicker from "expo-image-picker";
import { extractWiFiFromText, WiFiCredentials } from "./wifi";

export const recognizeTextFromImage = async (
  photo: CameraCapturedPicture | ImagePicker.ImagePickerAsset
): Promise<WiFiCredentials[]> => {
  try {
    const imageUri = photo.uri;

    // Initialize combined text
    let combinedText = "";

    // Try with specific scripts for better accuracy on different languages
    const scriptTypes = [
      TextRecognitionScript.LATIN,
      TextRecognitionScript.CHINESE,
      TextRecognitionScript.JAPANESE,
      TextRecognitionScript.KOREAN,
    ];

    for (const scriptType of scriptTypes) {
      try {
        const result = await TextRecognition.recognize(imageUri, scriptType);
        combinedText += result.text + "\n";
      } catch (e) {
        // If a specific script fails, just continue
        console.log(`Recognition with script ${scriptType} failed:`, e);
      }
    }

    // Extract WiFi credentials from the combined text
    const credentials = extractWiFiFromText(combinedText);

    // Remove duplicates
    const uniqueCredentials = credentials.filter(
      (cred, index, self) =>
        index ===
        self.findIndex(
          (c) => c.ssid === cred.ssid && c.password === cred.password
        )
    );

    return uniqueCredentials;
  } catch (error) {
    console.error("Error recognizing text:", error);
    return [];
  }
};
