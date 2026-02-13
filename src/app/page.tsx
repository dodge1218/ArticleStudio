'use client';

import React, { useState } from 'react';
import ChainInput from '@/components/ChainInput';
import OptionCards from '@/components/OptionCards';
import Editor from '@/components/Editor';
import { AnalyzeResponseSchema, DraftResponseSchema } from '@/lib/schemas';
import { z } from 'zod';
import { Loader2 } from 'lucide-react';

type Step = 'idle' | 'analyzing' | 'options_ready' | 'drafting' | 'editing';

type AnalysisResult = z.infer<typeof AnalyzeResponseSchema>;
type DraftResult = z.infer<typeof DraftResponseSchema>;

export default function Home() {
  const [step, setStep] = useState<Step>('idle');
  const [analysisResult, setAnalysisResult] = useState<AnalysisResult | null>(null);
  const [draftResult, setDraftResult] = useState<DraftResult | null>(null);
  
  // Store input to pass to draft
  const [inputData, setInputData] = useState<any>(null);
  const [isRewriting, setIsRewriting] = useState(false);

  const handleAnalyze = async (data: any) => {
    setInputData(data);
    setStep('analyzing');
    
    try {
      const res = await fetch('/api/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      
      if (!res.ok) throw new Error('Analysis failed');
      
      const result = await res.json();
      setAnalysisResult(result);
      setStep('options_ready');
    } catch (error) {
      console.error(error);
      alert('Failed to analyze chain. Please try again.');
      setStep('idle');
    }
  };

  const handleSelectOption = async (optionId: string) => {
    setStep('drafting');
    
    try {
      const res = await fetch('/api/draft', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          chainText: inputData.chainText,
          optionId,
          audience: inputData.audience,
          tone: inputData.tone,
          length: inputData.length,
          platform: inputData.platform,
        }),
      });

      if (!res.ok) throw new Error('Drafting failed');

      const result = await res.json();
      setDraftResult(result);
      setStep('editing');
    } catch (error) {
      console.error(error);
      alert('Failed to generate draft. Please try again.');
      setStep('options_ready');
    }
  };

  const handleRewrite = async (instruction: string, currentMarkdown: string) => {
    setIsRewriting(true);
    try {
      const res = await fetch('/api/rewrite', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          articleMarkdown: currentMarkdown,
          instruction,
        }),
      });

      if (!res.ok) throw new Error('Rewrite failed');

      const result = await res.json();
      if (draftResult) {
        setDraftResult({
          ...draftResult,
          articleMarkdown: result.articleMarkdown
        });
      }
    } catch (error) {
      console.error(error);
      alert('Rewrite failed.');
    } finally {
      setIsRewriting(false);
    }
  };

  return (
    <main className="min-h-screen bg-gray-50 flex flex-col">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 py-4 px-8 flex items-center justify-between">
        <div className="flex items-center space-x-2">
           <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center text-white font-bold">A</div>
           <span className="text-xl font-bold text-gray-800">Article Studio</span>
        </div>
        <div className="text-sm text-gray-500">
          {step === 'idle' && 'Ready'}
          {step === 'analyzing' && 'Analyzing Context...'}
          {step === 'options_ready' && 'Select Angle'}
          {step === 'drafting' && 'Writing Draft...'}
          {step === 'editing' && 'Editor'}
        </div>
      </header>

      {/* Content */}
      <div className="flex-1 flex flex-col">
        {step === 'idle' || step === 'analyzing' ? (
          <div className="flex-1 flex items-center justify-center p-6">
            <ChainInput onAnalyze={handleAnalyze} isAnalyzing={step === 'analyzing'} />
          </div>
        ) : null}

        {step === 'options_ready' && analysisResult && (
          <div className="flex-1 p-6 overflow-y-auto">
             <div className="max-w-4xl mx-auto mb-8 bg-white p-6 rounded-xl shadow-sm">
                <h3 className="text-sm font-bold text-gray-500 uppercase mb-2">Analysis Digest</h3>
                <h2 className="text-2xl font-bold text-gray-900 mb-2">{analysisResult.topicTitle}</h2>
                <p className="text-gray-600 mb-4">{analysisResult.coreQuestion}</p>
                <div className="flex flex-wrap gap-2">
                   {analysisResult.chainDigest.map((pt, i) => (
                     <span key={i} className="px-2 py-1 bg-gray-100 rounded text-xs text-gray-700">{pt}</span>
                   ))}
                </div>
             </div>
             <OptionCards 
               options={analysisResult.options} 
               onSelect={handleSelectOption} 
               isDrafting={false} 
             />
          </div>
        )}

        {step === 'drafting' && (
          <div className="flex-1 flex flex-col items-center justify-center space-y-4">
            <Loader2 className="w-12 h-12 text-blue-600 animate-spin" />
            <p className="text-lg font-medium text-gray-600">Generating your full draft...</p>
            <p className="text-sm text-gray-400">Verifying claims and structuring arguments</p>
          </div>
        )}

        {step === 'editing' && draftResult && (
          <Editor 
            draft={draftResult} 
            onRewrite={handleRewrite} 
            isRewriting={isRewriting}
          />
        )}
      </div>
    </main>
  );
}
