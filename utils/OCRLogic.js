import 'dotenv/config';
import vision from '@google-cloud/vision';

// Create a singleton Vision client instance
const client = new vision.ImageAnnotatorClient();

/**
 * Performs OCR (Optical Character Recognition) on an image from a URI.
 * @param {string} imageUri - The URI (e.g., a public URL) of the image.
 * @returns {Promise<string|null>} A promise that resolves to the extracted text
 * or null if no text is found.
 */
async function detectTextFromImageUri(imageUri) {
  try {
    const [result] = await client.documentTextDetection(imageUri);
    const fullTextAnnotation = result.fullTextAnnotation;

    if (fullTextAnnotation && fullTextAnnotation.text) {
      console.log('✅ Text successfully detected.');
      return fullTextAnnotation.text;
    } else {
      console.log('No text was detected in the image.');
      return null;
    }
  } catch (error) {
    console.error('❌ Error during text detection:', error);
    throw new Error('Failed to perform OCR. Check your credentials and image URL.');
  }
}

// Example usage of the function with a placeholder URL
(async () => {
  // Replace this with the actual public URL of your Cloudinary image.
  const myImageUri = 'https://res.cloudinary.com/your-cloud-name/image/upload/sample.jpg';

  try {
    console.log(`🔎 Attempting to read text from: ${myImageUri}`);
    const extractedText = await detectTextFromImageUri(myImageUri);
    if (extractedText) {
      console.log('--- Extracted Text from Image ---');
      console.log(extractedText);
      console.log('-----------------------------------');
    }
  } catch (error) {
    console.error(`An error occurred: ${error.message}`);
  }
})();

export { detectTextFromImageUri };
