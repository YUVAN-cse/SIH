import { createWorker } from "tesseract.js";

export const detectTextFromImageUri = async (uri) => {
  const worker = await createWorker("eng");
  await worker.load();
  const { data: { text } } = await worker.recognize(uri);
  await worker.terminate();
  return text;
};