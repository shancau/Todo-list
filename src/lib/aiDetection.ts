// src/lib/aiDetection.ts
import * as cocoSsd from '@tensorflow-models/coco-ssd';

let model: cocoSsd.ObjectDetection | null = null;

export const loadModel = async (): Promise<cocoSsd.ObjectDetection> => {
  if (!model) {
    console.log('Loading TensorFlow.js model...');
    model = await cocoSsd.load();
  }
  return model;
};

export interface DetectionResult {
  label: string;
  confidence: number;
}

export const detectObjects = async (
  imageElement: HTMLImageElement
): Promise<DetectionResult[]> => {
  try {
    const model = await loadModel();
    const predictions = await model.detect(imageElement);
    
    // Filter for high-confidence results
    return predictions
      .filter(pred => pred.score > 0.5) // 50% confidence threshold
      .map(pred => ({
        label: pred.class,
        confidence: Math.round(pred.score * 100)
      }));
  } catch (error) {
    console.error('AI Detection error:', error);
    return [];
  }
};

// Helper to analyze image from data URL (from your TodoItem)
export const analyzeImageFromUrl = async (imageUrl: string): Promise<DetectionResult[]> => {
  return new Promise((resolve) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.src = imageUrl;
    
    img.onload = async () => {
      const results = await detectObjects(img);
      resolve(results);
    };
    
    img.onerror = () => {
      console.error('Failed to load image for analysis');
      resolve([]);
    };
  });
};