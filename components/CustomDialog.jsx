'use client';

import React from 'react';
import { useVocab } from '../context/VocabContext';

export default function CustomDialog() {
  const { dialogState, closeCustomDialog } = useVocab();

  if (!dialogState.isOpen) return null;

  return (
    <div
      id="custom-browser-dialog"
      className="fixed inset-0 z-[60] bg-[#0c0a09]/50 backdrop-blur-sm flex items-center justify-center p-4"
    >
      <div className="bg-white dark:bg-[#1c1917] rounded-2xl max-w-sm w-full p-5 border border-[#e7e5e4] dark:border-[#292524] shadow-[0_12px_36px_rgba(0,0,0,0.12)] space-y-4 transform transition-all text-left">
        <div className="flex items-start space-x-3">
          <div
            id="custom-dialog-icon-wrap"
            className="w-9 h-9 rounded-full bg-[#f0efed] dark:bg-[#292524] text-[#0c0a09] dark:text-white flex items-center justify-center flex-shrink-0"
          >
            <i id="custom-dialog-icon" className={`fa-solid ${dialogState.icon || 'fa-triangle-exclamation'} text-sm`} />
          </div>
          <div className="flex-1 min-w-0">
            <h3 id="custom-dialog-title" className="text-sm font-semibold text-[#0c0a09] dark:text-white">
              {dialogState.title}
            </h3>
            <p id="custom-dialog-message" className="text-xs text-[#777169] dark:text-[#a8a29e] mt-1 leading-relaxed">
              {dialogState.message}
            </p>
          </div>
        </div>
        <div className="flex items-center justify-end gap-2 pt-2 border-t border-[#f0efed] dark:border-[#292524]">
          {dialogState.showCancel && (
            <button
              type="button"
              id="custom-dialog-cancel"
              onClick={() => closeCustomDialog(false)}
              className="w-9 h-9 rounded-full bg-[#f0efed] dark:bg-[#292524] hover:bg-[#e7e5e4] text-[#292524] dark:text-white flex items-center justify-center transition"
              title="ยกเลิก"
              aria-label="ยกเลิก"
            >
              <i className="fa-solid fa-xmark text-xs" />
            </button>
          )}
          <button
            type="button"
            id="custom-dialog-confirm"
            onClick={() => closeCustomDialog(true)}
            className="w-9 h-9 rounded-full bg-[#0c0a09] dark:bg-white hover:bg-[#292524] text-white dark:text-[#0c0a09] flex items-center justify-center transition shadow-xs"
            title="ตกลง / ยืนยัน"
            aria-label="ยืนยัน"
          >
            <i className="fa-solid fa-check text-xs" />
          </button>
        </div>
      </div>
    </div>
  );
}
