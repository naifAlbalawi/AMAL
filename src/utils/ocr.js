import Tesseract from 'tesseract.js';

let worker = null;

export async function initOCR() {
  if (!worker) {
    worker = await Tesseract.createWorker('eng');
  }
  return worker;
}

export async function recognizeText(imageDataUrl, onProgress) {
  const w = await initOCR();
  const result = await w.recognize(imageDataUrl);
  return result.data.text;
}

export async function terminateOCR() {
  if (worker) {
    await worker.terminate();
    worker = null;
  }
}
