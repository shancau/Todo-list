import { Camera, CheckCircle2, Circle, Loader2, Sparkles, Trash2, X } from 'lucide-react';
import React, { useEffect, useRef, useState } from 'react';
import { Todo } from '../App';
import { ImageWithFallback } from './figma/ImageWithFallback';

interface TodoItemProps {
  todo: Todo;
  onToggle: (id: string) => void;
  onDelete: (id: string) => void;
  onUpdateImage: (id: string, imageData: string | undefined) => void;
}

export const TodoItem: React.FC<TodoItemProps> = ({ 
  todo, 
  onToggle, 
  onDelete, 
  onUpdateImage 
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [aiLabels, setAiLabels] = useState<string[]>([]);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [aiSummary, setAiSummary] = useState<string>('');

  // AI Image Analysis
  const analyzeImage = async (imageUrl: string): Promise<{labels: string[], summary: string}> => {
    try {
      // Dynamically load TensorFlow only when needed
      const cocoSsd = await import('@tensorflow-models/coco-ssd');
      const tf = await import('@tensorflow/tfjs');
      
      console.log('Loading AI model...');
      const model = await cocoSsd.load();
      
      const img = new Image();
      img.crossOrigin = 'anonymous';
      img.src = imageUrl;
      
      return new Promise((resolve) => {
        img.onload = async () => {
          // Make sure TensorFlow backend is ready
          await tf.ready();
          
          console.log('Running AI detection...');
          const predictions = await model.detect(img);
          
          // Process predictions
          const labels = predictions
            .filter(pred => pred.score > 0.4) // 40% confidence threshold
            .map(pred => `${pred.class} (${Math.round(pred.score * 100)}%)`);
          
          // Generate a human-readable summary
          const summary = generateImageSummary(predictions);
          
          console.log('AI detected:', labels);
          console.log('AI summary:', summary);
          
          resolve({ labels, summary });
        };
        
        img.onerror = () => {
          console.error('Failed to load image for AI analysis');
          resolve({ labels: [], summary: 'Failed to analyze image' });
        };
      });
    } catch (error) {
      console.error('AI analysis failed:', error);
      return { labels: [], summary: 'AI analysis unavailable' };
    }
  };

  // Generate a friendly description of what the AI sees
  const generateImageSummary = (predictions: any[]): string => {
    if (predictions.length === 0) {
      return 'No objects clearly detected';
    }
    
    // Filter high-confidence predictions (>50%)
    const highConfidence = predictions.filter(p => p.score > 0.5);
    
    if (highConfidence.length === 0) {
      return 'Objects detected but with low confidence';
    }
    
    // Group predictions by type
    const objects = highConfidence.map(p => p.class);
    const uniqueObjects = [...new Set(objects)];
    
    if (uniqueObjects.length === 1) {
      const count = objects.filter(obj => obj === uniqueObjects[0]).length;
      return `This image shows ${count > 1 ? `${count} ${uniqueObjects[0]}s` : `a ${uniqueObjects[0]}`}`;
    } else if (uniqueObjects.length === 2) {
      return `This image contains ${uniqueObjects[0]} and ${uniqueObjects[1]}`;
    } else if (uniqueObjects.length === 3) {
      return `This image contains ${uniqueObjects.slice(0, 2).join(', ')} and ${uniqueObjects[2]}`;
    } else {
      return `This image contains ${uniqueObjects.slice(0, 3).join(', ')}, and more`;
    }
  };

  // Run AI analysis when image changes
  useEffect(() => {
    if (todo.proofImage) {
      setIsAnalyzing(true);
      
      // Delay analysis slightly to ensure image is fully loaded
      const timer = setTimeout(async () => {
        const result = await analyzeImage(todo.proofImage!);
        setAiLabels(result.labels);
        setAiSummary(result.summary);
        setIsAnalyzing(false);
      }, 800);
      
      return () => clearTimeout(timer);
    } else {
      // Clear AI results when image is removed
      setAiLabels([]);
      setAiSummary('');
    }
  }, [todo.proofImage]);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        onUpdateImage(todo.id, reader.result as string);
        if (fileInputRef.current) {
          fileInputRef.current.value = '';
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const triggerFileInput = () => {
    fileInputRef.current?.click();
  };

  return (
    <div className="flex flex-col gap-3 p-4 bg-white border border-gray-100 rounded-2xl shadow-sm hover:shadow-md transition-all group">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3 flex-1">
          <button
            onClick={() => onToggle(todo.id)}
            className={`cursor-pointer transition-colors shrink-0 ${
              todo.completed ? 'text-green-500' : 'text-gray-300 hover:text-blue-500'
            }`}
          >
            {todo.completed ? (
              <CheckCircle2 className="w-6 h-6" />
            ) : (
              <Circle className="w-6 h-6" />
            )}
          </button>
          <span
            className={`text-lg transition-all break-words ${
              todo.completed ? 'line-through text-gray-400' : 'text-gray-700'
            }`}
          >
            {todo.text}
          </span>
        </div>
        
        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 focus-within:opacity-100 transition-opacity">
          {!todo.proofImage && (
            <button
              onClick={triggerFileInput}
              className="text-gray-400 hover:text-blue-500 transition-colors p-2"
              title="Add photo proof"
            >
              <Camera className="w-5 h-5" />
            </button>
          )}
          <button
            onClick={() => onDelete(todo.id)}
            className="text-gray-400 hover:text-red-500 transition-colors p-2"
            aria-label="Delete todo"
          >
            <Trash2 className="w-5 h-5" />
          </button>
        </div>
        
        <input
          type="file"
          ref={fileInputRef}
          onChange={handleImageChange}
          accept="image/*"
          capture="environment"
          className="hidden"
        />
      </div>

      {todo.proofImage && (
        <div className="relative mt-1 ml-9 group/img">
          <div className="relative w-full aspect-video rounded-xl overflow-hidden border border-gray-100 bg-gray-50">
            {/* AI Analysis Loading Overlay */}
            {isAnalyzing && (
              <div className="absolute inset-0 bg-black/40 flex items-center justify-center z-10">
                <div className="flex flex-col items-center gap-2 p-4 bg-white/90 rounded-lg">
                  <Loader2 className="w-8 h-8 text-blue-500 animate-spin" />
                  <span className="text-gray-700 font-medium">AI is analyzing your image...</span>
                  <span className="text-gray-500 text-sm">Looking for objects</span>
                </div>
              </div>
            )}
            
            <ImageWithFallback
              src={todo.proofImage}
              alt="Proof"
              className="w-full h-full object-cover"
            />
            
            <div className="absolute top-2 right-2 flex gap-2">
              <button
                onClick={triggerFileInput}
                className="bg-black/50 hover:bg-black/70 text-white p-2 rounded-full backdrop-blur-sm transition-all"
                title="Change photo"
              >
                <Camera className="w-4 h-4" />
              </button>
              <button
                onClick={() => onUpdateImage(todo.id, undefined)}
                className="bg-black/50 hover:bg-black/70 text-white p-2 rounded-full backdrop-blur-sm transition-all"
                title="Remove photo"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>
          
          {/* AI Results Section */}
          <div className="mt-3 space-y-3">
            {/* AI Summary - What the AI thinks the image shows */}
            {aiSummary && (
              <div className="bg-blue-50 border border-blue-100 rounded-xl p-3">
                <div className="flex items-center gap-2 mb-2">
                  <Sparkles className="w-4 h-4 text-blue-500" />
                  <h4 className="text-sm font-semibold text-blue-700">AI Image Analysis</h4>
                </div>
                <p className="text-gray-700">{aiSummary}</p>
                
                {/* Raw AI Detection Output */}
                {aiLabels.length > 0 && (
                  <div className="mt-2 pt-2 border-t border-blue-100">
                    <p className="text-xs text-blue-600 mb-1">Detailed detection:</p>
                    <div className="text-xs text-gray-600 space-y-1">
                      {aiLabels.map((label, idx) => (
                        <div key={idx} className="flex justify-between">
                          <span>{label.split(' (')[0]}</span>
                          <span className="font-medium">{label.split('(')[1]}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
            
            {/* Console-style debug output (also visible in browser console) */}
            <div className="bg-gray-50 border border-gray-200 rounded-lg p-3 font-mono">
              <div className="flex items-center gap-2 mb-2">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                <span className="text-xs font-medium text-gray-700">AI Debug Output</span>
              </div>
              <div className="text-xs text-gray-600 space-y-1 max-h-20 overflow-y-auto">
                {isAnalyzing ? (
                  <div className="flex items-center gap-2">
                    <span className="animate-pulse">⠋</span>
                    <span>Analyzing image...</span>
                  </div>
                ) : aiSummary ? (
                  <>
                    <div className="text-green-600">{'> AI says:'}</div>
                    <div className="ml-3">{aiSummary}</div>
                    {aiLabels.length > 0 && (
                      <>
                        <div className="text-green-600 mt-1">{'> Detected objects:'}</div>
                        {aiLabels.map((label, idx) => (
                          <div key={idx} className="ml-3">- {label}</div>
                        ))}
                      </>
                    )}
                  </>
                ) : (
                  <div className="text-gray-400">No image analysis performed yet.</div>
                )}
              </div>
            </div>
          </div>
          
          <span className="text-[10px] text-gray-400 mt-3 block uppercase tracking-wider font-semibold">
            Proof Attached {aiSummary && '• AI Analyzed'}
          </span>
        </div>
      )}
    </div>
  );
};