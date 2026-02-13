import React, { useState } from 'react';
import { Settings, Sparkles } from 'lucide-react';

interface ChainInputProps {
  onAnalyze: (data: {
    chainText: string;
    audience: string;
    tone: string;
    length: string;
    platform: string;
    seoKeyword: string;
  }) => void;
  isAnalyzing: boolean;
}

export default function ChainInput({ onAnalyze, isAnalyzing }: ChainInputProps) {
  const [chainText, setChainText] = useState('');
  const [audience, setAudience] = useState('');
  const [tone, setTone] = useState('');
  const [length, setLength] = useState('');
  const [platform, setPlatform] = useState('Blog');
  const [seoKeyword, setSeoKeyword] = useState('');
  const [showSettings, setShowSettings] = useState(false);

  const handleSubmit = () => {
    if (!chainText.trim()) return;
    onAnalyze({ chainText, audience, tone, length, platform, seoKeyword });
  };

  return (
    <div className="w-full max-w-4xl mx-auto space-y-4">
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <h2 className="text-2xl font-semibold mb-4 text-gray-800">PromptChain → Article</h2>
        
        <textarea
          className="w-full h-64 p-4 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none font-mono text-sm"
          placeholder="Paste your entire dialogue/prompt chain here..."
          value={chainText}
          onChange={(e) => setChainText(e.target.value)}
          disabled={isAnalyzing}
        />
        
        <div className="flex items-center justify-between mt-4">
          <div className="text-xs text-gray-500">
            {chainText.length.toLocaleString()} chars
            {chainText.length > 200000 && <span className="text-red-500 font-bold ml-2"> (Over limit)</span>}
          </div>
          
          <button
            onClick={() => setShowSettings(!showSettings)}
            className="flex items-center text-sm text-gray-600 hover:text-gray-900"
          >
            <Settings className="w-4 h-4 mr-1" />
            Context Controls
          </button>
        </div>

        {showSettings && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4 bg-gray-50 p-4 rounded-lg">
            <input type="text" placeholder="Target Audience" className="input" value={audience} onChange={e => setAudience(e.target.value)} />
            <input type="text" placeholder="Tone (e.g. Witty)" className="input" value={tone} onChange={e => setTone(e.target.value)} />
            <input type="text" placeholder="Length (e.g. 1000 words)" className="input" value={length} onChange={e => setLength(e.target.value)} />
            <input type="text" placeholder="Platform (Medium, Substack)" className="input" value={platform} onChange={e => setPlatform(e.target.value)} />
            <input type="text" placeholder="SEO Keyword" className="input md:col-span-2" value={seoKeyword} onChange={e => setSeoKeyword(e.target.value)} />
          </div>
        )}

        <div className="mt-6 flex justify-end">
          <button
            onClick={handleSubmit}
            disabled={isAnalyzing || !chainText.trim()}
            className="flex items-center px-6 py-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {isAnalyzing ? (
              <>Analyzing...</>
            ) : (
              <>
                <Sparkles className="w-5 h-5 mr-2" />
                Analyze & Generate Angles
              </>
            )}
          </button>
        </div>
      </div>
      
      <style jsx>{`
        .input {
          @apply w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-1 focus:ring-blue-500;
        }
      `}</style>
    </div>
  );
}
