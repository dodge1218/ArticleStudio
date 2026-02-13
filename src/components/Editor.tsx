import React, { useState } from 'react';
import ReactMarkdown from 'react-markdown';
import Sidebar from './Sidebar';
import { DraftResponseSchema } from '@/lib/schemas';
import { z } from 'zod';
import { Download, Copy, Wand2 } from 'lucide-react';

type Draft = z.infer<typeof DraftResponseSchema>;

interface EditorProps {
  draft: Draft;
  onRewrite: (instruction: string, currentMarkdown: string) => void;
  isRewriting: boolean;
}

export default function Editor({ draft, onRewrite, isRewriting }: EditorProps) {
  const [markdown, setMarkdown] = useState(draft.articleMarkdown);
  const [view, setView] = useState<'split' | 'edit' | 'preview'>('split');

  // Update local state if draft updates (e.g. after rewrite)
  React.useEffect(() => {
    setMarkdown(draft.articleMarkdown);
  }, [draft.articleMarkdown]);

  const handleRewrite = (instruction: string) => {
    onRewrite(instruction, markdown);
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(markdown);
    // Could add toast here
  };

  const handleDownload = () => {
    const blob = new Blob([markdown], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${draft.seo.slug || 'article'}.md`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  return (
    <div className="flex h-screen bg-gray-50 overflow-hidden">
      {/* Main Content */}
      <div className="flex-1 flex flex-col h-full min-w-0">
        
        {/* Toolbar */}
        <div className="bg-white border-b border-gray-200 px-6 py-3 flex items-center justify-between shadow-sm z-10">
          <div>
            <h1 className="text-lg font-bold text-gray-800 truncate max-w-md" title={draft.title}>
              {draft.title}
            </h1>
            <p className="text-xs text-gray-500">
               Slug: <span className="font-mono">{draft.seo.slug}</span>
            </p>
          </div>
          
          <div className="flex items-center space-x-2">
            <div className="flex bg-gray-100 rounded-lg p-1 mr-4">
              {['edit', 'split', 'preview'].map((v) => (
                <button
                  key={v}
                  onClick={() => setView(v as 'edit' | 'split' | 'preview')}
                  className={`px-3 py-1 text-xs font-medium rounded capitalize ${view === v ? 'bg-white shadow text-blue-600' : 'text-gray-500 hover:text-gray-700'}`}
                >
                  {v}
                </button>
              ))}
            </div>

            <button onClick={handleCopy} className="btn-secondary">
              <Copy className="w-4 h-4 mr-2" /> Copy
            </button>
            <button onClick={handleDownload} className="btn-secondary">
              <Download className="w-4 h-4 mr-2" /> Download
            </button>
          </div>
        </div>

        {/* Editor Wrapper */}
        <div className="flex-1 flex overflow-hidden">
          {/* Markdown Input */}
          {(view === 'edit' || view === 'split') && (
            <div className={`flex-1 flex flex-col border-r border-gray-200 bg-white ${isRewriting ? 'opacity-50' : ''}`}>
              <div className="p-2 bg-gray-50 border-b flex items-center space-x-2 overflow-x-auto">
                <Wand2 className="w-4 h-4 text-purple-600 ml-2" />
                <span className="text-xs font-semibold text-gray-500 uppercase">Rewrite:</span>
                {['Make it punchier', 'Shorten', 'Add examples', 'Add counter-argument'].map(action => (
                   <button 
                     key={action}
                     disabled={isRewriting}
                     onClick={() => handleRewrite(action)}
                     className="px-2 py-1 text-xs bg-white border border-gray-200 rounded hover:bg-purple-50 hover:text-purple-700 hover:border-purple-200 transition-colors whitespace-nowrap"
                   >
                     {action}
                   </button>
                ))}
              </div>
              <textarea
                className="flex-1 p-6 w-full resize-none focus:outline-none font-mono text-sm leading-relaxed text-gray-800"
                value={markdown}
                onChange={(e) => setMarkdown(e.target.value)}
                placeholder="# Start writing..."
              />
            </div>
          )}

          {/* Preview */}
          {(view === 'preview' || view === 'split') && (
            <div className="flex-1 bg-white overflow-y-auto p-8 prose max-w-none">
               <article className="prose prose-blue max-w-none">
                  <ReactMarkdown>{markdown}</ReactMarkdown>
               </article>
            </div>
          )}
        </div>
      </div>

      {/* Sidebar */}
      <Sidebar 
        claims={draft.claimMap} 
        research={draft.researchChecklist} 
        sourcePlaceholders={draft.sourcePlaceholders} 
      />

      <style jsx>{`
        .btn-secondary {
          @apply flex items-center px-3 py-1.5 text-xs font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500;
        }
      `}</style>
    </div>
  );
}
