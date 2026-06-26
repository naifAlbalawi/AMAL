import Tesseract from 'tesseract.js';
let worker = null;
export async function recognizeText(imageDataUrl) {
  if (!worker) worker = await Tesseract.createWorker('eng');
  const result = await worker.recognize(imageDataUrl);
  return result.data.text;
}
export async function terminateOCR() {
  if (worker) { await worker.terminate(); worker = null; }
}
