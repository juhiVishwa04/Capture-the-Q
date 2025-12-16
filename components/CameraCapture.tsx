import React, { useRef, useEffect, useState, useCallback } from 'react';
import { Camera, X, RefreshCw } from 'lucide-react';

interface CameraCaptureProps {
  onCapture: (imageSrc: string) => void;
  onCancel: () => void;
}

const CameraCapture: React.FC<CameraCaptureProps> = ({ onCapture, onCancel }) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [error, setError] = useState<string>('');

  const startCamera = useCallback(async () => {
    try {
      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'environment' }, // Prefer back camera on mobile
        audio: false,
      });
      setStream(mediaStream);
      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
      }
    } catch (err) {
      setError('Unable to access camera. Please allow permissions.');
      console.error(err);
    }
  }, []);

  useEffect(() => {
    startCamera();
    return () => {
      // Cleanup stream on unmount
      if (stream) {
        stream.getTracks().forEach(track => track.stop());
      }
    };
     // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleCapture = () => {
    if (videoRef.current && canvasRef.current) {
      const video = videoRef.current;
      const canvas = canvasRef.current;
      
      // Match canvas size to video size
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      
      const context = canvas.getContext('2d');
      if (context) {
        context.drawImage(video, 0, 0, canvas.width, canvas.height);
        const imageSrc = canvas.toDataURL('image/jpeg', 0.8);
        onCapture(imageSrc);
      }
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black flex flex-col items-center justify-center">
      <div className="relative w-full h-full flex flex-col">
        {/* Header Controls */}
        <div className="absolute top-0 left-0 right-0 p-4 flex justify-between items-center z-10 bg-gradient-to-b from-black/50 to-transparent">
           <button 
            onClick={onCancel}
            className="text-white bg-white/20 hover:bg-white/30 p-2 rounded-full backdrop-blur-sm transition"
          >
            <X size={24} />
          </button>
          <span className="text-white font-medium">Align Question</span>
           <div className="w-10"></div> {/* Spacer for centering */}
        </div>

        {/* Video Feed */}
        <div className="flex-1 relative bg-black flex items-center justify-center overflow-hidden">
          {error ? (
            <div className="text-white text-center p-6">
              <p className="mb-4">{error}</p>
              <button 
                onClick={startCamera}
                className="bg-indigo-600 px-4 py-2 rounded-lg text-white"
              >
                Retry
              </button>
            </div>
          ) : (
            <video
              ref={videoRef}
              autoPlay
              playsInline
              className="w-full h-full object-cover"
            />
          )}
        </div>

        {/* Capture Controls */}
        <div className="h-32 bg-black flex items-center justify-center space-x-8">
           <button 
             onClick={startCamera} 
             className="text-white/60 hover:text-white transition"
             title="Restart Camera"
           >
             <RefreshCw size={24} />
           </button>
           
           <button
            onClick={handleCapture}
            className="w-20 h-20 bg-white rounded-full border-4 border-indigo-500 flex items-center justify-center shadow-lg hover:scale-105 transition-transform active:scale-95"
            aria-label="Take Photo"
           >
             <div className="w-16 h-16 bg-indigo-50 rounded-full"></div>
           </button>
           
           <div className="w-6"></div> {/* Balance spacer */}
        </div>

        <canvas ref={canvasRef} className="hidden" />
      </div>
    </div>
  );
};

export default CameraCapture;
