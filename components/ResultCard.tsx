import React from 'react';
import { SolvedQuestion, QuestionType } from '../types';
import { CheckCircle2, AlertCircle, BookOpen, BrainCircuit } from 'lucide-react';

interface ResultCardProps {
  data: SolvedQuestion;
  index: number;
}

const ResultCard: React.FC<ResultCardProps> = ({ data, index }) => {
  if (!data.isLegible) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-xl p-6 mb-4">
        <div className="flex items-center text-red-600 mb-2">
          <AlertCircle className="mr-2" size={20} />
          <h3 className="font-semibold">Question {index + 1} Unreadable</h3>
        </div>
        <p className="text-gray-600 text-sm">
          We couldn't read the text clearly. Please try capturing a clearer photo.
        </p>
      </div>
    );
  }

  const isMCQ = data.type === QuestionType.MCQ;

  return (
    <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden mb-6 transition-all hover:shadow-md">
      {/* Header */}
      <div className="bg-slate-50 px-6 py-4 border-b border-slate-100 flex justify-between items-center">
        <div className="flex items-center space-x-2">
          <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold uppercase tracking-wide
            ${isMCQ ? 'bg-purple-100 text-purple-700' : 'bg-blue-100 text-blue-700'}`}>
            {isMCQ ? 'Multiple Choice' : 'Theory'}
          </span>
          <span className="text-slate-400 text-xs">#{index + 1}</span>
        </div>
        <div className="flex items-center text-xs text-slate-500" title="AI Confidence Score">
          <BrainCircuit size={14} className="mr-1 text-indigo-500" />
          <span>{data.confidenceScore}% Confidence</span>
        </div>
      </div>

      <div className="p-6">
        {/* Question Text */}
        <h3 className="text-lg font-medium text-slate-900 mb-6 leading-relaxed">
          {data.questionText}
        </h3>

        {/* Answer Section */}
        {isMCQ ? (
          <div className="space-y-3 mb-6">
            {data.options && data.options.length > 0 ? (
              data.options.map((option, idx) => {
                const isCorrect = option.includes(data.correctAnswer) || data.correctAnswer.includes(option);
                // A naive string match, usually ID matching is better but data comes from OCR/AI
                // so we rely on the AI's "correctAnswer" field to be the full text of the correct option.
                // We'll style the one that matches the returned correct answer.
                const isSelected = option === data.correctAnswer; 
                
                return (
                  <div 
                    key={idx}
                    className={`p-3 rounded-lg border flex items-start transition-colors
                      ${isSelected 
                        ? 'bg-green-50 border-green-200 ring-1 ring-green-200' 
                        : 'bg-white border-slate-200 text-slate-600'
                      }`}
                  >
                    <div className={`mt-0.5 mr-3 flex-shrink-0 w-5 h-5 rounded-full border flex items-center justify-center
                      ${isSelected ? 'border-green-500 bg-green-500 text-white' : 'border-slate-300'}`}>
                      {isSelected && <CheckCircle2 size={12} />}
                    </div>
                    <span className={isSelected ? 'text-green-900 font-medium' : ''}>{option}</span>
                  </div>
                );
              })
            ) : (
              // Fallback if options array is empty but it's marked MCQ
              <div className="p-4 bg-green-50 border border-green-200 rounded-lg text-green-800">
                <strong>Correct Answer:</strong> {data.correctAnswer}
              </div>
            )}
            
            {/* If exact option mapping failed visually, show the answer text explicitly */}
            {(!data.options || !data.options.includes(data.correctAnswer)) && data.options && data.options.length > 0 && (
               <div className="mt-2 text-sm text-green-700 font-medium flex items-center">
                  <CheckCircle2 size={16} className="mr-1"/> Answer: {data.correctAnswer}
               </div>
            )}
          </div>
        ) : (
          <div className="bg-blue-50 border border-blue-100 rounded-lg p-5 mb-6">
            <h4 className="text-sm font-semibold text-blue-800 uppercase tracking-wide mb-2 flex items-center">
              <BookOpen size={16} className="mr-2" />
              Answer
            </h4>
            <p className="text-slate-800 leading-relaxed whitespace-pre-line">
              {data.correctAnswer}
            </p>
          </div>
        )}

        {/* Explanation */}
        <div className="bg-slate-50 rounded-lg p-5">
          <h4 className="text-sm font-semibold text-slate-700 mb-2">Explanation</h4>
          <p className="text-slate-600 text-sm leading-relaxed">
            {data.explanation}
          </p>
        </div>
      </div>
    </div>
  );
};

export default ResultCard;
