'use client';

import React from 'react';
import { useVocab } from '../context/VocabContext';

export default function Toast() {
  const { isToastVisible, toastMessage } = useVocab();

  return (
    <div
      id="toast"
      className={`fixed top-5 left-1/2 -translate-x-1/2 z-50 bg-[#0c0a09] text-white px-5 py-2.5 rounded-full shadow-lg text-xs sm:text-sm font-medium flex items-center space-x-2 transition-all duration-300 border border-[#292524] ${
        isToastVisible ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-2 pointer-events-none'
      }`}
    >
      <i className="fa-solid fa-circle-check text-xs" />
      <span id="toast-msg">{toastMessage || 'บันทึกเรียบร้อย!'}</span>
    </div>
  );
}
