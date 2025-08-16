import React, { useState, useRef, useEffect } from 'react';
import { ChevronDown, Check } from 'lucide-react';

interface Option {
  value: string;
  label: string;
}

interface CustomSelectProps {
  value: string;
  onChange: (value: string) => void;
  options: Option[];
  placeholder?: string;
  className?: string;
  disabled?: boolean;
}

const CustomSelect: React.FC<CustomSelectProps> = ({
  value,
  onChange,
  options,
  placeholder = 'Selecione uma opção',
  className = '',
  disabled = false
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (ref.current && !ref.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  const selectedOption = options.find(option => option.value === value);

  const handleOptionClick = (optionValue: string) => {
    onChange(optionValue);
    setIsOpen(false);
  };

  const handleKeyDown = (event: React.KeyboardEvent) => {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      setIsOpen(!isOpen);
    } else if (event.key === 'Escape') {
      setIsOpen(false);
    }
  };

  return (
    <div className={`relative ${className}`} ref={ref}>
      <button
        type="button"
        onClick={() => !disabled && setIsOpen(!isOpen)}
        onKeyDown={handleKeyDown}
        disabled={disabled}
        className={`w-full flex items-center justify-between px-4 py-3 text-sm border border-gray-200 rounded-xl bg-white shadow-sm transition-all duration-200 ${
          disabled 
            ? 'opacity-50 cursor-not-allowed' 
            : 'hover:border-[#3cd48f]/60 focus:border-[#3cd48f] focus:ring-2 focus:ring-[#3cd48f]/40 cursor-pointer'
        }`}
        aria-haspopup="listbox"
        aria-expanded={isOpen}
        aria-labelledby="custom-select-label"
      >
        <span className={selectedOption ? 'text-gray-900' : 'text-gray-500'}>
          {selectedOption ? selectedOption.label : placeholder}
        </span>
        <ChevronDown 
          className={`w-4 h-4 text-gray-400 transition-transform duration-200 ${
            isOpen ? 'rotate-180' : ''
          }`} 
        />
      </button>

      {isOpen && (
        <div className="absolute top-full left-0 mt-2 w-full bg-white border border-gray-200 rounded-2xl shadow-2xl z-50 max-h-60 overflow-y-auto">
          <div className="py-2">
            {options.map((option) => (
              <button
                key={option.value}
                onClick={() => handleOptionClick(option.value)}
                className={`w-full flex items-center justify-between px-4 py-3 text-sm transition-colors duration-200 ${
                  value === option.value 
                    ? 'bg-gradient-to-r from-[#3cd48f] to-[#3cd48f]/80 text-white font-semibold' 
                    : 'text-gray-700 hover:bg-[#3cd48f]/5 hover:text-[#3cd48f]'
                }`}
                role="option"
                aria-selected={value === option.value}
              >
                <span>{option.label}</span>
                {value === option.value && (
                  <Check className="w-4 h-4 text-white" />
                )}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default CustomSelect;
