import React from 'react';
import { z } from 'zod';
import { OptionSchema } from '@/lib/schemas';
import { ArrowRight, CheckCircle, Search, FileText } from 'lucide-react';

type Option = z.infer<typeof OptionSchema>;

interface OptionCardsProps {
  options: Option[];
  onSelect: (optionId: string) => void;
  isDrafting: boolean;
}

export default function OptionCards({ options, onSelect, isDrafting }: OptionCardsProps) {
  return (
    <div className="w-full max-w-6xl mx-auto py-8">
      <h2 className="text-2xl font-bold text-center mb-8 text-gray-800">Select Your Approach</h2>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {options.map((opt) => (
          <div 
            key={opt.id}
            className="group relative bg-white border border-gray-200 rounded-xl p-6 hover:shadow-xl hover:border-blue-400 transition-all cursor-pointer flex flex-col"
            onClick={() => !isDrafting && onSelect(opt.id)}
          >
            <div className="mb-4">
              <span className="uppercase tracking-wide text-xs font-bold text-blue-600 bg-blue-50 px-2 py-1 rounded-full">
                {opt.id.replace('_', ' ')}
              </span>
            </div>
            
            <h3 className="text-xl font-bold mb-3 text-gray-900 group-hover:text-blue-700">
              {opt.title}
            </h3>
            
            <p className="text-sm text-gray-600 mb-4 italic">
              "{opt.thesis}"
            </p>
            
            <div className="flex-1 space-y-4 mb-6">
              <div>
                <h4 className="flex items-center text-xs font-semibold text-gray-500 uppercase mb-2">
                  <FileText className="w-3 h-3 mr-1" /> Outline
                </h4>
                <ul className="text-sm text-gray-700 space-y-1 ml-4 list-disc">
                  {opt.outline.slice(0, 4).map((item, i) => (
                    <li key={i}>{item}</li>
                  ))}
                  {opt.outline.length > 4 && <li>...</li>}
                </ul>
              </div>

              <div>
                <h4 className="flex items-center text-xs font-semibold text-gray-500 uppercase mb-2">
                  <Search className="w-3 h-3 mr-1" /> Verify
                </h4>
                <ul className="text-xs text-red-600 space-y-1">
                  {opt.researchToDo.slice(0, 2).map((task, i) => (
                    <li key={i} className="flex items-start">
                      <span className="mr-1">•</span> {task}
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            <button 
              disabled={isDrafting}
              className="w-full mt-auto py-2 bg-gray-50 text-gray-900 font-medium rounded-lg group-hover:bg-blue-600 group-hover:text-white transition-colors flex items-center justify-center"
            >
              {isDrafting ? 'Drafting...' : 'Select This Angle'}
              {!isDrafting && <ArrowRight className="w-4 h-4 ml-2" />}
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
