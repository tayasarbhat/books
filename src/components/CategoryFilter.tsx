import { Category } from '../types';
import { useState, useRef, useEffect } from 'react';

interface CategoryFilterProps {
  categories: Category[];
  selectedCategory: string | null;
  onSelectCategory: (category: string | null) => void;
}

export function CategoryFilter({ categories, selectedCategory, onSelectCategory }: CategoryFilterProps) {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const mainCategories = categories.filter(cat => 
    ['QUANTITATIVE APTITUDE', 'REASONING', 'GENERAL KNOWLEDGE', 'GENERAL ENGLISH'].includes(cat.name)
  );
  
  const otherCategories = categories.filter(cat => 
    !['QUANTITATIVE APTITUDE', 'REASONING', 'GENERAL KNOWLEDGE', 'GENERAL ENGLISH'].includes(cat.name)
  );

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const getCategoryStyle = (category: Category | null) => {
    if (!category) {
      return `bg-gradient-to-r from-blue-600 to-indigo-600 text-white ${
        selectedCategory === null ? 'ring-2 ring-blue-500 ring-offset-2' : ''
      }`;
    }

    const baseStyle = category.color;
    const isSelected = selectedCategory === category.name;
    
    return `${baseStyle} text-white ${
      isSelected ? `ring-2 ring-offset-2 ${category.ringColor}` : ''
    }`;
  };

  return (
    <div className="my-8">
      <div className="flex flex-wrap gap-3 mb-4">
        <button
          onClick={() => onSelectCategory(null)}
          className={`px-6 py-2.5 rounded-2xl text-sm font-medium transition-all duration-300 shadow-sm hover:shadow-md ${getCategoryStyle(null)}`}
        >
          All Books
        </button>
        {mainCategories.map((category) => (
          <button
            key={category.name}
            onClick={() => onSelectCategory(category.name)}
            className={`px-6 py-2.5 rounded-2xl text-sm font-medium transition-all duration-300 shadow-sm hover:shadow-md ${getCategoryStyle(category)}`}
          >
            {category.name}
          </button>
        ))}
        <div className="relative inline-block" ref={dropdownRef}>
          <button
            onClick={() => setIsOpen(!isOpen)}
            className={`px-6 py-2.5 rounded-2xl text-sm font-medium transition-all duration-300 shadow-sm hover:shadow-md
              bg-gradient-to-r from-purple-600 to-pink-600 text-white ${
                selectedCategory && otherCategories.some(cat => cat.name === selectedCategory)
                ? 'ring-2 ring-purple-500 ring-offset-2'
                : ''
              }`}
          >
            More Categories {isOpen ? '▲' : '▼'}
          </button>
          {isOpen && (
            <div className="absolute left-0 mt-2 w-72 bg-white rounded-2xl shadow-xl z-50 border border-slate-200 overflow-hidden">
              <div className="py-2">
                {otherCategories.map((category) => (
                  <button
                    key={category.name}
                    onClick={() => {
                      onSelectCategory(category.name);
                      setIsOpen(false);
                    }}
                    className={`w-full text-left px-4 py-3 text-sm transition-all
                      ${category.color} text-white font-medium hover:opacity-90`}
                  >
                    {category.name}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}