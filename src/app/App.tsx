import React, { useState, useEffect } from 'react';
import { TodoInput } from './components/TodoInput';
import { TodoItem } from './components/TodoItem';
import { TodoFilters, FilterType } from './components/TodoFilters';
import { Toaster, toast } from 'sonner';
import { ListTodo, ClipboardCheck } from 'lucide-react';

export interface Todo {
  id: string;
  text: string;
  completed: boolean;
  createdAt: number;
  proofImage?: string;
}

const App: React.FC = () => {
  const [todos, setTodos] = useState<Todo[]>(() => {
    const saved = localStorage.getItem('todos');
    return saved ? JSON.parse(saved) : [];
  });
  const [filter, setFilter] = useState<FilterType>('all');

  useEffect(() => {
    localStorage.setItem('todos', JSON.stringify(todos));
  }, [todos]);

  const addTodo = (text: string) => {
    const newTodo: Todo = {
      id: crypto.randomUUID(),
      text,
      completed: false,
      createdAt: Date.now(),
    };
    setTodos((prev) => [newTodo, ...prev]);
    toast.success('Task added');
  };

  const toggleTodo = (id: string) => {
    setTodos((prev) =>
      prev.map((todo) =>
        todo.id === id ? { ...todo, completed: !todo.completed } : todo
      )
    );
  };

  const deleteTodo = (id: string) => {
    setTodos((prev) => prev.filter((todo) => todo.id !== id));
    toast.error('Task deleted');
  };

  const updateTodoImage = (id: string, imageData: string | undefined) => {
    setTodos((prev) =>
      prev.map((todo) =>
        todo.id === id ? { ...todo, proofImage: imageData } : todo
      )
    );
    if (imageData) {
      toast.success('Proof photo added');
    } else {
      toast.info('Proof photo removed');
    }
  };

  const filteredTodos = todos.filter((todo) => {
    if (filter === 'active') return !todo.completed;
    if (filter === 'completed') return todo.completed;
    return true;
  });

  const activeCount = todos.filter((t) => !t.completed).length;

  return (
    <div className="min-h-screen bg-[#f8fafc] flex flex-col items-center py-12 px-4 sm:px-6">
      <Toaster position="top-center" />
      
      <div className="w-full max-w-2xl">
        <header className="mb-10 text-center">
          <div className="inline-flex items-center justify-center p-3 bg-blue-100 rounded-2xl mb-4">
            <ListTodo className="w-8 h-8 text-blue-600" />
          </div>
          <h1 className="text-4xl font-bold text-gray-900 tracking-tight">My Tasks</h1>
          <p className="text-gray-500 mt-2">Stay organized and productive</p>
        </header>

        <section className="mb-8">
          <TodoInput onAdd={addTodo} />
        </section>

        <main className="bg-white rounded-3xl shadow-xl shadow-gray-200/50 border border-gray-100 overflow-hidden">
          <div className="px-6 border-b border-gray-50">
            <TodoFilters
              currentFilter={filter}
              onFilterChange={setFilter}
              activeCount={activeCount}
            />
          </div>

          <div className="divide-y divide-gray-50 max-h-[600px] overflow-y-auto p-4 flex flex-col gap-3">
            {filteredTodos.length > 0 ? (
              filteredTodos.map((todo) => (
                <TodoItem
                  key={todo.id}
                  todo={todo}
                  onToggle={toggleTodo}
                  onDelete={deleteTodo}
                  onUpdateImage={updateTodoImage}
                />
              ))
            ) : (
              <div className="flex flex-col items-center justify-center py-20 text-gray-400">
                <div className="bg-gray-50 p-6 rounded-full mb-4">
                  <ClipboardCheck className="w-12 h-12 text-gray-300" />
                </div>
                <p className="text-lg font-medium">
                  {filter === 'all' 
                    ? "You're all caught up!" 
                    : `No ${filter} tasks found`}
                </p>
                <p className="text-sm">Enjoy your day!</p>
              </div>
            )}
          </div>

          {todos.some(t => t.completed) && filter === 'all' && (
            <div className="p-4 bg-gray-50 border-t border-gray-100 flex justify-center">
              <button 
                onClick={() => setTodos(prev => prev.filter(t => !t.completed))}
                className="text-xs font-semibold text-gray-400 hover:text-red-500 uppercase tracking-wider transition-colors"
              >
                Clear completed tasks
              </button>
            </div>
          )}
        </main>

        <footer className="mt-8 text-center text-gray-400 text-xs flex flex-col gap-1">
          <p>All data is saved locally in your browser.</p>
          <p className="max-w-xs mx-auto opacity-70">Note: Photos are stored as local data. Large photos may exceed browser storage limits.</p>
        </footer>
      </div>
    </div>
  );
};

export default App;
