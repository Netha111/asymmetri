"use client";

import { useState, useEffect } from 'react';
// import { Button } from '@/components/ui/button';
// import { Textarea } from '@/components/ui/textarea';

interface ChatInputProps {
  onSubmit: (prompt: string) => void;
  isLoading: boolean;
  defaultValue?: string;
  onReset?: () => void;
}

export function ChatInput({ onSubmit, isLoading, defaultValue, onReset }: ChatInputProps) {
  const [input, setInput] = useState(defaultValue || '');

  useEffect(() => {
    setInput(defaultValue || '');
  }, [defaultValue]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;
    onSubmit(input);
  };

  const handleClear = () => {
    setInput('');
    onReset?.();
  };

  return (
    <form onSubmit={handleSubmit} className="relative">
      <textarea
        value={input}
        onChange={(e) => setInput(e.target.value)}
        placeholder="Describe your landing page..."
        className="w-full h-32 p-4 rounded-lg border focus:outline-none focus:ring-2"
        disabled={isLoading}
      />
      <div className="absolute bottom-4 right-4 flex gap-2">
        {input && (
          <button
            type="button"
            onClick={handleClear}
            className="px-4 py-2 text-gray-600 hover:text-gray-800"
            disabled={isLoading}
          >
            Clear
          </button>
        )}
        <button
          type="submit"
          disabled={isLoading || !input.trim()}
          className="bg-blue-500 text-white px-4 py-2 rounded disabled:opacity-50"
        >
          {isLoading ? 'Generating...' : 'Generate'}
        </button>
      </div>
    </form>
  );
} 