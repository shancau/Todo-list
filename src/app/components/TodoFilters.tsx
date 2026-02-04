import React from 'react';

export type FilterType = 'all' | 'active' | 'completed';

interface TodoFiltersProps {
  currentFilter: FilterType;
  onFilterChange: (filter: FilterType) => void;
  activeCount: number;
}

export const TodoFilters: React.FC<TodoFiltersProps> = ({
  currentFilter,
  onFilterChange,
  activeCount,
}) => {
  const filters: { label: string; value: FilterType }[] = [
    { label: 'All', value: 'all' },
    { label: 'Active', value: 'active' },
    { label: 'Completed', value: 'completed' },
  ];

  return (
    <div className="flex flex-col sm:flex-row items-center justify-between gap-4 py-4 px-2 text-sm text-gray-500">
      <span>{activeCount} items remaining</span>
      <div className="flex bg-gray-100 p-1 rounded-lg">
        {filters.map((filter) => (
          <button
            key={filter.value}
            onClick={() => onFilterChange(filter.value)}
            className={`px-4 py-1.5 rounded-md transition-all ${
              currentFilter === filter.value
                ? 'bg-white text-blue-600 shadow-sm font-medium'
                : 'hover:text-gray-800'
            }`}
          >
            {filter.label}
          </button>
        ))}
      </div>
    </div>
  );
};
