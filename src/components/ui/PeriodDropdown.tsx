import React, { useState, useRef, useEffect } from 'react';
import { Calendar, ChevronDown } from 'lucide-react';

interface PeriodDropdownProps {
  value: string;
  onChange: (period: string, customRange?: { from: string; to: string }) => void;
  customRange?: { from: string; to: string };
  presets?: Array<{ value: string; label: string }>;
}

const defaultPresets = [
  { value: 'today', label: 'Hoje' },
  { value: 'last_60_minutes', label: 'Últimos 60 minutos' },
  { value: 'yesterday', label: 'Ontem' },
  { value: 'this_week', label: 'Esta semana' },
  { value: 'last_7_days', label: 'Últimos 7 dias' },
  { value: 'last_week', label: 'Semana passada' },
  { value: 'this_month', label: 'Este mês' },
  { value: 'last_30_days', label: 'Últimos 30 dias' },
  { value: 'last_month', label: 'Mês passado' },
  { value: 'custom', label: 'Personalizado' },
];

export const PeriodDropdown: React.FC<PeriodDropdownProps> = ({
  value,
  onChange,
  customRange = { from: '', to: '' },
  presets = defaultPresets,
}) => {
  const [showDropdown, setShowDropdown] = useState(false);
  const [localCustom, setLocalCustom] = useState(customRange);
  const [showCustomFields, setShowCustomFields] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setLocalCustom(customRange);
  }, [customRange]);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (ref.current && !ref.current.contains(event.target as Node)) {
        setShowDropdown(false);
        setShowCustomFields(false);
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
      return `${localCustom.from} até ${localCustom.to}`;
    }
    const preset = presets.find((p) => p.value === value);
    return preset ? preset.label : 'Selecionar período';
  };

  const handleOptionClick = (optionValue: string) => {
    if (optionValue === 'custom') {
      setShowCustomFields(true);
    } else {
      setShowDropdown(false);
      setShowCustomFields(false);
      onChange(optionValue);
    }
  };

  const handleApplyCustom = () => {
    if (localCustom.from && localCustom.to) {
      setShowDropdown(false);
      setShowCustomFields(false);
      onChange('custom', localCustom);
    }
  };

  return (
    <div className="relative period-dropdown" ref={ref}>
      <button
        type="button"
        className="flex items-center min-w-[200px] justify-between rounded-xl border border-gray-200 bg-white px-4 py-2 shadow-lg hover:shadow-xl transition-all duration-300"
        onClick={() => setShowDropdown((v) => !v)}
      >
        <Calendar className="w-5 h-5 mr-3" />
        <span>{getLabel()}</span>
        <ChevronDown className="w-5 h-5 ml-3" />
      </button>
      {showDropdown && (
        <div className="absolute top-full left-0 mt-2 w-80 bg-white border border-gray-200 rounded-2xl shadow-2xl z-50">
          <div className="py-2">
            {!showCustomFields ? (
              // Mostrar lista de opções
              presets.map((option) => (
                <button
                  key={option.value}
                  onClick={() => handleOptionClick(option.value)}
                  className={`w-full flex items-center px-4 py-3 text-sm hover:bg-[#3cd48f]/5 transition-colors duration-200 ${
                    value === option.value ? 'bg-gradient-to-r from-[#3cd48f] to-[#3cd48f]/80 text-white font-semibold' : 'text-gray-700 hover:text-[#3cd48f]'
                  }`}
                >
                  {option.label}
                </button>
              ))
            ) : (
              // Mostrar campos de data personalizada
              <div className="px-4 pb-4">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-sm font-semibold text-gray-800">Período Personalizado</h3>
                  <button
                    onClick={() => setShowCustomFields(false)}
                    className="text-xs text-gray-500 hover:text-gray-700"
                  >
                    ← Voltar
                  </button>
                </div>
                <div className="space-y-3">
                  <div>
                    <label className="block text-xs font-semibold text-gray-600 mb-2">Data inicial</label>
                    <input
                      type="date"
                      value={localCustom.from}
                      onChange={e => setLocalCustom((r) => ({ ...r, from: e.target.value }))}
                      className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#3cd48f]/40 focus:border-[#3cd48f] text-sm shadow-sm"
                      placeholder="Selecionar data inicial"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-gray-600 mb-2">Data final</label>
                    <input
                      type="date"
                      value={localCustom.to}
                      onChange={e => setLocalCustom((r) => ({ ...r, to: e.target.value }))}
                      className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#3cd48f]/40 focus:border-[#3cd48f] text-sm shadow-sm"
                      placeholder="Selecionar data final"
                    />
                  </div>
                  <button
                    className={`w-full px-4 py-3 rounded-xl text-sm font-semibold transition-all duration-300 ${
                      (!localCustom.from || !localCustom.to)
                        ? 'bg-gray-200 text-gray-500 cursor-not-allowed'
                        : 'bg-gradient-to-r from-[#3cd48f] to-[#3cd48f]/80 text-white hover:from-[#3cd48f]/90 hover:to-[#3cd48f]/70'
                    }`}
                    onClick={handleApplyCustom}
                    disabled={!localCustom.from || !localCustom.to}
                  >
                    Aplicar
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