'use client';

import { Filter } from 'lucide-react';

export default function FilterBar() {
  return (
    <div className="flex">
      <button className="flex items-center space-x-2 px-4 py-2 border border-gray-200 rounded-lg bg-white shadow-sm hover:shadow-md transition-shadow">
        <Filter className="w-4 h-4" />
        <span className="text-sm font-medium">Filters</span>
      </button>
    </div>
  );
}