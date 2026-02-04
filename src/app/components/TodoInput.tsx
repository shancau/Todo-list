import React, { useState } from 'react';
import { Plus } from 'lucide-react';

interface TodoInputProps {
  onAdd: (text: string) => void;
}

export const TodoInput: React.FC<TodoInputProps> = ({ onAdd }) => {
  const [text, setText] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (text.trim()) {
      onAdd(text.trim());
      setText('');
    }
  };

  return (
    <form onSubmit={handleSubmit} className="relative flex items-center">
      <input
        type="text"
        value={text}
        onChange={(e) => setText(e.target.value)}
        placeholder="Add a new task..."
        className="w-full px-6 py-4 bg-white border-2 border-transparent rounded-2xl shadow-lg focus:outline-none focus:border-blue-400 transition-all text-lg pr-16"
      />
      <button
        type="submit"
        disabled={!text.trim()}
        className="absolute right-2 p-3 bg-blue-500 text-white rounded-xl hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-md active:scale-95"
      >
        <Plus className="w-6 h-6" />
      </button>
    </form>
  );
};
