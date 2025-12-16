import React, { useState } from 'react';
import { Upload, Camera, Zap, Image as ImageIcon, Loader2, RotateCcw } from 'lucide-react';
import { AppState, AnalysisResult } from './types';
import { analyzeImageWithGemini } from './services/geminiService';
import CameraCapture from './components/CameraCapture';
import ResultCard from './components/ResultCard';

const App: React.FC = () => {
  const [appState, setAppState] = useState<AppState>(AppState.IDLE);
  const [imageSrc, setImageSrc] = useState<string | null>(null);
  const [analysis, setAnalysis] = useState<AnalysisResult | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Handle File Upload
  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const result = reader.result as string;
        setImageSrc(result);
        processImage(result);
      };
      reader.readAsDataURL(file);
    }
  };

  // Handle Camera Capture
  const handleCameraCapture = (capturedImage: string) => {
    setImageSrc(capturedImage);
    setAppState(AppState.ANALYZING); // Close camera immediately visually
    processImage(capturedImage);
  };

  // Core Processing Logic
  const processImage = async (base64Img: string) => {
    setAppState(AppState.ANALYZING);
    setErrorMsg(null);
    setAnalysis(null);

    try {
      const result = await analyzeImageWithGemini(base64Img);
      setAnalysis(result);
      setAppState(AppState.RESULTS);
    } catch (err) {
      console.error(err);
      setErrorMsg("We encountered an issue analyzing this image. Please ensure the image is clear and try again.");
      setAppState(AppState.ERROR);
    }
  };

  const resetApp = () => {
    setImageSrc(null);
    setAnalysis(null);
    setErrorMsg(null);
    setAppState(AppState.IDLE);
  };

  // Render Functions
  const renderHero = () => (
    <div className="text-center max-w-2xl mx-auto px-6 pt-20 pb-12">
      <div className="inline-flex items-center justify-center p-3 bg-indigo-100 rounded-2xl mb-6">
        <Zap className="text-indigo-600" size={32} />
      </div>
      <h1 className="text-4xl md:text-5xl font-extrabold text-slate-900 tracking-tight mb-6">
        Snap, Solve, <span className="text-indigo-600">Learn.</span>
      </h1>
      <p className="text-lg text-slate-600 mb-10 leading-relaxed">
        Upload a photo of your homework or exam questions. Our AI instantly solves MCQs and explains theories with step-by-step guidance.
      </p>

      <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
        <label className="w-full sm:w-auto cursor-pointer group">
          <input 
            type="file" 
            accept="image/*" 
            className="hidden" 
            onChange={handleFileUpload}
          />
          <div className="flex items-center justify-center px-8 py-4 bg-white border-2 border-slate-200 rounded-xl shadow-sm text-slate-700 font-semibold group-hover:border-indigo-400 group-hover:text-indigo-600 transition-all">
            <Upload size={20} className="mr-2" />
            Upload Photo
          </div>
        </label>
        
        <button 
          onClick={() => setAppState(AppState.CAPTURING)}
          className="w-full sm:w-auto flex items-center justify-center px-8 py-4 bg-indigo-600 text-white rounded-xl font-semibold shadow-lg shadow-indigo-200 hover:bg-indigo-700 hover:shadow-indigo-300 transition-all"
        >
          <Camera size={20} className="mr-2" />
          Take Photo
        </button>
      </div>

      <div className="mt-12 flex justify-center space-x-8 text-slate-400 text-sm">
        <div className="flex items-center">
          <ImageIcon size={16} className="mr-2" /> Supports Printed & Handwritten
        </div>
      </div>
    </div>
  );

  const renderLoading = () => (
    <div className="flex flex-col items-center justify-center min-h-[60vh]">
      <div className="relative">
        <div className="w-16 h-16 border-4 border-indigo-100 border-t-indigo-600 rounded-full animate-spin"></div>
        <div className="absolute inset-0 flex items-center justify-center">
           <Zap size={20} className="text-indigo-600 animate-pulse" />
        </div>
      </div>
      <h2 className="mt-6 text-xl font-semibold text-slate-900">Analyzing Question...</h2>
      <p className="mt-2 text-slate-500 animate-pulse">Identifying question type and generating explanation</p>
    </div>
  );

  const renderResults = () => (
    <div className="max-w-3xl mx-auto px-4 py-8 pb-24">
      <div className="flex items-center justify-between mb-8">
        <button 
          onClick={resetApp}
          className="flex items-center text-slate-500 hover:text-indigo-600 transition font-medium"
        >
          <RotateCcw size={18} className="mr-2" />
          Scan Another
        </button>
        <span className="bg-green-100 text-green-700 text-xs font-bold px-3 py-1 rounded-full">
          Analysis Complete
        </span>
      </div>

      <div className="grid md:grid-cols-3 gap-8">
        {/* Sticky Image Preview */}
        <div className="md:col-span-1">
          <div className="sticky top-6">
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">Original Image</h3>
            <div className="rounded-xl overflow-hidden border border-slate-200 shadow-sm bg-slate-100">
               {imageSrc && (
                 <img src={imageSrc} alt="Question" className="w-full h-auto object-contain" />
               )}
            </div>
            {analysis?.overallSummary && (
              <div className="mt-4 p-4 bg-indigo-50 rounded-xl text-sm text-indigo-800 border border-indigo-100">
                {analysis.overallSummary}
              </div>
            )}
          </div>
        </div>

        {/* Results List */}
        <div className="md:col-span-2">
           <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">
             Solutions ({analysis?.questions.length || 0})
           </h3>
           {analysis?.questions.map((q, idx) => (
             <ResultCard key={idx} data={q} index={idx} />
           ))}
           
           <div className="mt-8 pt-8 border-t border-slate-100 text-center">
             <p className="text-slate-500 text-sm mb-4">Need clarification? Try scanning again with better lighting.</p>
             <button 
              onClick={resetApp}
              className="px-6 py-3 bg-indigo-600 text-white rounded-lg font-medium hover:bg-indigo-700 transition"
             >
               Solve Next Question
             </button>
           </div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">
      {/* Navbar */}
      <nav className="bg-white border-b border-slate-200 sticky top-0 z-30">
        <div className="max-w-5xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <div className="bg-indigo-600 p-1.5 rounded-lg">
              <Zap className="text-white" size={20} />
            </div>
            <span className="font-bold text-xl tracking-tight text-slate-900">SnapSolve</span>
          </div>
          <div className="text-xs font-medium text-slate-400 border px-2 py-1 rounded border-slate-200">
            Powered by Gemini
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main>
        {appState === AppState.IDLE && renderHero()}
        
        {appState === AppState.CAPTURING && (
          <CameraCapture 
            onCapture={handleCameraCapture} 
            onCancel={() => setAppState(AppState.IDLE)} 
          />
        )}
        
        {appState === AppState.ANALYZING && renderLoading()}
        
        {appState === AppState.RESULTS && renderResults()}

        {appState === AppState.ERROR && (
          <div className="max-w-md mx-auto mt-20 p-8 bg-white rounded-2xl shadow-lg border border-red-100 text-center">
             <div className="w-16 h-16 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-4">
               <Zap className="text-red-500" size={24} />
             </div>
             <h3 className="text-xl font-bold text-slate-900 mb-2">Oops! Analysis Failed</h3>
             <p className="text-slate-600 mb-6">{errorMsg || "Something went wrong."}</p>
             <button 
               onClick={resetApp}
               className="w-full py-3 bg-indigo-600 text-white rounded-xl font-semibold hover:bg-indigo-700 transition"
             >
               Try Again
             </button>
          </div>
        )}
      </main>
    </div>
  );
};

export default App;
