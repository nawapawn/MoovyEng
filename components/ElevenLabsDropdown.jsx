'use client';

import React, { useState, useRef, useEffect } from 'react';

export default function ElevenLabsDropdown({
  id,
  value,
  onChange,
  options = [],
  placeholder = 'Select option...',
  className = '',
  triggerClassName = '',
  menuClassName = '',
  renderLabel,
  disabled = false
}) {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef(null);

  // Close dropdown on click outside
  useEffect(() => {
    function handleClickOutside(event) {
      if (containerRef.current && !containerRef.current.contains(event.target)) {
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

  // Close on Escape key
  useEffect(() => {
    function handleKeyDown(event) {
      if (event.key === 'Escape') {
        setIsOpen(false);
      }
    }
    if (isOpen) {
      document.addEventListener('keydown', handleKeyDown);
    }
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen]);

  const selectedOption = options.find((opt) => opt.id === value || opt.value === value);

  const displayLabel = selectedOption
    ? renderLabel
      ? renderLabel(selectedOption)
      : selectedOption.label || selectedOption.name || selectedOption.id || selectedOption.value
    : placeholder;

  const handleSelect = (opt) => {
    const val = opt.id !== undefined ? opt.id : opt.value;
    onChange(val);
    setIsOpen(false);
  };

  return (
    <div ref={containerRef} className={`relative w-full text-left select-none ${className}`}>
      {/* ElevenLabs Style Trigger Button */}
      <button
        type="button"
        id={id}
        disabled={disabled}
        onClick={() => !disabled && setIsOpen(!isOpen)}
        aria-haspopup="listbox"
        aria-expanded={isOpen}
        className={`w-full h-9 px-3 bg-white dark:bg-[#1a1715] hover:bg-[#fafaf9] dark:hover:bg-[#23201d] border border-[#e7e5e4] dark:border-[#38332e] hover:border-[#d6d3d1] dark:hover:border-[#4d4740] rounded-xl flex items-center justify-between gap-2 shadow-2xs transition-all duration-150 outline-none focus:ring-2 focus:ring-[#0c0a09]/10 dark:focus:ring-white/10 ${
          disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'
        } ${isOpen ? 'ring-2 ring-[#0c0a09]/15 dark:ring-white/15 border-[#0c0a09]/30 dark:border-white/30' : ''} ${triggerClassName}`}
      >
        <span className="text-xs font-medium text-[#0c0a09] dark:text-[#f5f5f4] truncate">
          {displayLabel}
        </span>
        <i
          className={`fa-solid fa-chevron-down text-[10px] text-[#a8a29e] dark:text-[#78716c] transition-transform duration-200 flex-shrink-0 ${
            isOpen ? 'rotate-180 text-[#0c0a09] dark:text-white' : ''
          }`}
        />
      </button>

      {/* ElevenLabs Minimal Floating Menu Panel */}
      {isOpen && (
        <div
          role="listbox"
          tabIndex={-1}
          className={`absolute left-0 right-0 top-full mt-1.5 z-50 bg-white/95 dark:bg-[#1c1917]/95 backdrop-blur-md border border-[#e7e5e4] dark:border-[#38332e] rounded-xl shadow-lg shadow-black/8 ring-1 ring-black/5 p-1 space-y-0.5 max-h-64 overflow-y-auto animate-in fade-in-0 zoom-in-95 duration-100 ${menuClassName}`}
        >
          {options.length === 0 ? (
            <div className="py-2.5 px-3 text-xs text-[#a8a29e] text-center">
              No options available
            </div>
          ) : (
            options.map((opt) => {
              const optVal = opt.id !== undefined ? opt.id : opt.value;
              const isSelected = optVal === value;
              const label = opt.label || opt.name || optVal;

              return (
                <div
                  key={optVal}
                  role="option"
                  aria-selected={isSelected}
                  onClick={() => handleSelect(opt)}
                  className={`w-full px-2.5 py-1.5 rounded-lg text-xs cursor-pointer transition flex items-center justify-between gap-2 ${
                    isSelected
                      ? 'bg-[#f5f5f4] dark:bg-[#292524] text-[#0c0a09] dark:text-white font-semibold'
                      : 'text-[#44403c] dark:text-[#d6d3d1] hover:bg-[#fafaf9] dark:hover:bg-[#23201d] hover:text-[#0c0a09] dark:hover:text-white'
                  }`}
                >
                  <span className="truncate">{renderLabel ? renderLabel(opt) : label}</span>
                  {isSelected && (
                    <i className="fa-solid fa-check text-[10px] text-[#0c0a09] dark:text-white flex-shrink-0 ml-1" />
                  )}
                </div>
              );
            })
          )}
        </div>
      )}
    </div>
  );
}
