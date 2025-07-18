import React, { useState, useRef, useEffect } from 'react';
import { Calendar, ChevronDown } from 'lucide-react';

interface PeriodDropdownProps {
  value: string;
  onChange: (period: string, customRange?: { from: string; to: string }) => void;
  customRange?: { from: string; to: string };
  presets?: Array<{ value: string; label: string }>;
}

const defaultPresets = [
  { value: 'today', label: 'Today' },
  { value: 'last_60_minutes', label: 'Last 60 minutes' },
  { value: 'yesterday', label: 'Yesterday' },
  { value: 'this_week', label: 'This week' },
  { value: 'last_7_days', label: 'Last 7 days' },
  { value: 'last_week', label: 'Last week' },
  { value: 'this_month', label: 'This month' },
  { value: 'last_30_days', label: 'Last 30 days' },
  { value: 'last_month', label: 'Last month' },
  { value: 'custom', label: 'Custom' },
];

export const PeriodDropdown: React.FC<PeriodDropdownProps> = ({
  value,
  onChange,
  customRange = { from: '', to: '' },
  presets = defaultPresets,
}) => {
  const [showDropdown, setShowDropdown] = useState(false);
  const [localCustom, setLocalCustom] = useState(customRange);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setLocalCustom(customRange);
  }, [customRange]);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (ref.current && !ref.current.contains(event.target as Node)) {
        setShowDropdown(false);
      }
    }
    if (showDropdown) {
      document.addEventListener('mousedown', handleClickOutside);
    } else {
      document.removeEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showDropdown]);

  const getLabel = () => {
    if (value === 'custom' && localCustom.from && localCustom.to) {
      return `${localCustom.from} to ${localCustom.to}`;
    }
    const preset = presets.find((p) => p.value === value);
    return preset ? preset.label : 'Select period';
  };

  return (
    <div className="relative period-dropdown" ref={ref}>
      <button
        type="button"
        className="flex items-center min-w-[200px] justify-between rounded-xl border border-gray-200 bg-white px-6 py-3 shadow-lg hover:shadow-xl transition-all duration-300"
        onClick={() => setShowDropdown((v) => !v)}
      >
        <Calendar className="w-5 h-5 mr-3" />
        <span>{getLabel()}</span>
        <ChevronDown className="w-5 h-5 ml-3" />
      </button>
      {showDropdown && (
        <div className="absolute top-full left-0 mt-2 w-80 bg-white/95 backdrop-blur-sm border border-gray-200 rounded-2xl shadow-2xl z-50">
          <div className="py-2">
            {presets.map((option) => (
              <button
                key={option.value}
                onClick={() => {
                  if (option.value !== 'custom') {
                    setShowDropdown(false);
                    onChange(option.value);
                  }
                }}
                className={`w-full flex items-center px-4 py-3 text-sm hover:bg-blue-50 transition-colors duration-200 ${
                  value === option.value ? 'bg-gradient-to-r from-blue-500 to-purple-500 text-white font-semibold' : 'text-gray-700 hover:text-blue-600'
                }`}
              >
                {option.label}
              </button>
            ))}
            {value === 'custom' && (
              <div className="border-t border-gray-200 mt-3 pt-4 px-4 pb-4">
                <div className="space-y-3">
                  <div>
                    <label className="block text-xs font-semibold text-gray-600 mb-2">Start date</label>
                    <input
                      type="date"
                      value={localCustom.from}
                      onChange={e => setLocalCustom((r) => ({ ...r, from: e.target.value }))}
                      className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm shadow-sm"
                      placeholder="Select start date"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-gray-600 mb-2">End date</label>
                    <input
                      type="date"
                      value={localCustom.to}
                      onChange={e => setLocalCustom((r) => ({ ...r, to: e.target.value }))}
                      className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm shadow-sm"
                      placeholder="Select end date"
                    />
                  </div>
                  <button
                    className={`w-full px-4 py-3 rounded-xl text-sm font-semibold transition-all duration-300 ${
                      (!localCustom.from || !localCustom.to)
                        ? 'bg-gray-200 text-gray-500 cursor-not-allowed'
                        : 'bg-gradient-to-r from-blue-500 to-purple-500 text-white hover:from-blue-600 hover:to-purple-600'
                    }`}
                    onClick={() => {
                      if (localCustom.from && localCustom.to) {
                        setShowDropdown(false);
                        onChange('custom', localCustom);
                      }
                    }}
                    disabled={!localCustom.from || !localCustom.to}
                  >
                    Apply
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default PeriodDropdown; 