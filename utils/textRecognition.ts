import TextRecognition, {
  TextRecognitionScript,
} from "@react-native-ml-kit/text-recognition";
import { CameraCapturedPicture } from "expo-camera";
import * as ImagePicker from "expo-image-picker";
import { extractWiFiFromText, WiFiCredentials } from "./wifi";

export const recognizeWifiFromImage = async (
  photo: CameraCapturedPicture | ImagePicker.ImagePickerAsset
): Promise<WiFiCredentials | null> => {
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

    // Try each script type and collect results
    for (const scriptType of scriptTypes) {
      try {
        const result = await TextRecognition.recognize(imageUri, scriptType);
        // Try to extract credentials from each recognition result individually
        const credentials = extractWiFiFromText(result.text);
        if (credentials) {
          return credentials;
        }
        // Also add to combined text for a final attempt
        combinedText += result.text + "\n";
      } catch (e) {
        // If a specific script fails, just continue
        console.log(`Recognition with script ${scriptType} failed:`, e);
      }
    }

    // As a fallback, try with the combined text
    return extractWiFiFromText(combinedText);
  } catch (error) {
    console.error("Error recognizing text:", error);
    return null;
  }
};
