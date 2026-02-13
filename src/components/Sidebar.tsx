import React, { useState } from 'react';
import { z } from 'zod';
import { ClaimSchema, ResearchItemSchema } from '@/lib/schemas';
import { AlertTriangle, Check, BookOpen, Search } from 'lucide-react';
import clsx from 'clsx';

type Claim = z.infer<typeof ClaimSchema>;
type ResearchItem = z.infer<typeof ResearchItemSchema>;

interface SidebarProps {
  claims: Claim[];
  research: ResearchItem[];
  sourcePlaceholders: string[];
}

export default function Sidebar({ claims, research, sourcePlaceholders }: SidebarProps) {
  const [activeTab, setActiveTab] = useState<'claims' | 'research'>('claims');

  return (
    <div className="w-80 bg-white border-l border-gray-200 h-full overflow-y-auto flex flex-col">
      <div className="flex border-b border-gray-200">
        <button
          className={clsx("flex-1 py-3 text-sm font-medium", activeTab === 'claims' ? "text-blue-600 border-b-2 border-blue-600" : "text-gray-500 hover:text-gray-700")}
          onClick={() => setActiveTab('claims')}
        >
          Claim Map
        </button>
        <button
          className={clsx("flex-1 py-3 text-sm font-medium", activeTab === 'research' ? "text-blue-600 border-b-2 border-blue-600" : "text-gray-500 hover:text-gray-700")}
          onClick={() => setActiveTab('research')}
        >
          Research ({research.length})
        </button>
      </div>

      <div className="p-4 space-y-4 flex-1">
        {activeTab === 'claims' && (
          <div className="space-y-3">
            {claims.length === 0 && <p className="text-gray-400 text-sm">No claims extracted.</p>}
            {claims.map((claim, idx) => (
              <div key={idx} className={clsx("p-3 rounded-lg text-sm border", 
                claim.evidenceLevel === 'from_chain' ? "bg-green-50 border-green-200" :
                claim.evidenceLevel === 'general_background' ? "bg-gray-50 border-gray-200" :
                "bg-amber-50 border-amber-200"
              )}>
                <div className="flex items-start justify-between mb-1">
                  <span className={clsx("text-xs font-bold px-1.5 py-0.5 rounded",
                     claim.evidenceLevel === 'from_chain' ? "text-green-700 bg-green-100" :
                     claim.evidenceLevel === 'general_background' ? "text-gray-600 bg-gray-100" :
                     "text-amber-700 bg-amber-100"
                  )}>
                    {claim.evidenceLevel.replace('_', ' ')}
                  </span>
                </div>
                <p className="text-gray-800 leading-snug">{claim.claim}</p>
                {claim.notes && <p className="text-xs text-gray-500 mt-2 border-t pt-1">{claim.notes}</p>}
              </div>
            ))}
          </div>
        )}

        {activeTab === 'research' && (
          <div className="space-y-6">
            <section>
              <h3 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Verification Needed</h3>
              <div className="space-y-3">
                {research.map((item, idx) => (
                  <div key={idx} className="bg-red-50 border border-red-100 p-3 rounded-lg">
                    <p className="text-sm font-medium text-red-800 mb-1">{item.question}</p>
                    <div className="text-xs text-red-600">
                      <span className="font-semibold">Why:</span> {item.whyItMatters}
                    </div>
                    <div className="text-xs text-blue-600 mt-1 cursor-pointer hover:underline flex items-center">
                      <Search className="w-3 h-3 mr-1" />
                      {item.howToVerify}
                    </div>
                  </div>
                ))}
              </div>
            </section>

            <section>
              <h3 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Missing Sources</h3>
              {sourcePlaceholders.length === 0 ? <p className="text-sm text-gray-400">No missing sources detected.</p> : (
                <ul className="space-y-2">
                  {sourcePlaceholders.map((ph, idx) => (
                    <li key={idx} className="flex items-center text-sm text-gray-700 bg-gray-50 p-2 rounded">
                      <AlertTriangle className="w-4 h-4 text-amber-500 mr-2 flex-shrink-0" />
                      <span className="truncate">{ph}</span>
                    </li>
                  ))}
                </ul>
              )}
            </section>
          </div>
        )}
      </div>
    </div>
  );
}
