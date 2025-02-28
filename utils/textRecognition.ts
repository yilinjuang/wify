import TextRecognition from "@react-native-ml-kit/text-recognition";
import { CameraCapturedPicture } from "expo-camera";
import { extractWiFiFromText, WiFiCredentials } from "./wifi";

export const recognizeTextFromImage = async (
  photo: CameraCapturedPicture
): Promise<WiFiCredentials[]> => {
  try {
    // Perform text recognition on the captured image
    const result = await TextRecognition.recognize(photo.uri);

    // Extract the recognized text
    const recognizedText = result.text;

    // Extract WiFi credentials from the recognized text
    const credentials = extractWiFiFromText(recognizedText);

    return credentials;
  } catch (error) {
    console.error("Error recognizing text:", error);
    return [];
  }
};
