'use client';

import React, { useEffect, useRef } from 'react';
import { useVocab } from '../context/VocabContext';

export default function CustomDialog() {
  const { dialogState, closeCustomDialog, lang } = useVocab();
  const confirmBtnRef = useRef(null);

  useEffect(() => {
    if (!dialogState.isOpen) return;

    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        e.preventDefault();
        closeCustomDialog(false);
      } else if (e.key === 'Enter') {
        e.preventDefault();
        closeCustomDialog(true);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    if (confirmBtnRef.current) {
      confirmBtnRef.current.focus();
    }

    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [dialogState.isOpen, closeCustomDialog]);

  if (!dialogState.isOpen) return null;

  const isDanger = dialogState.icon?.includes('triangle') || dialogState.icon?.includes('trash');

  return (
    <div
      id="custom-browser-dialog"
      role="alertdialog"
      aria-modal="true"
      aria-labelledby="custom-dialog-title"
      aria-describedby="custom-dialog-message"
      onClick={(e) => {
        if (e.target === e.currentTarget) closeCustomDialog(false);
      }}
      className="fixed inset-0 z-[70] bg-[#0c0a09]/60 backdrop-blur-md flex items-center justify-center p-4 transition-all duration-200 animate-in fade-in-0"
    >
      <div className="bg-white dark:bg-[#1a1715] rounded-2xl max-w-sm w-full p-5 border border-[#e7e5e4] dark:border-[#38332e] shadow-[0_20px_48px_rgba(0,0,0,0.18)] space-y-4 transform transition-all animate-in zoom-in-95 duration-200 text-left">
        <div className="flex items-start space-x-3.5">
          <div
            id="custom-dialog-icon-wrap"
            className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${
              isDanger
                ? 'bg-rose-50 dark:bg-rose-950/40 text-rose-600 dark:text-rose-400 border border-rose-200 dark:border-rose-900/50'
                : 'bg-[#f0efed] dark:bg-[#292524] text-[#0c0a09] dark:text-white border border-[#e7e5e4] dark:border-[#38332e]'
            }`}
          >
            <i id="custom-dialog-icon" className={`fa-solid ${dialogState.icon || 'fa-triangle-exclamation'} text-base`} />
          </div>
          <div className="flex-1 min-w-0">
            <h3 id="custom-dialog-title" className="text-sm font-semibold text-[#0c0a09] dark:text-[#f5f5f4] tracking-tight">
              {dialogState.title}
            </h3>
            <p id="custom-dialog-message" className="text-xs text-[#777169] dark:text-[#a8a29e] mt-1.5 leading-relaxed">
              {dialogState.message}
            </p>
          </div>
        </div>

        <div className="flex items-center justify-end gap-2 pt-3 border-t border-[#f0efed] dark:border-[#292524]">
          {dialogState.showCancel && (
            <button
              type="button"
              id="custom-dialog-cancel"
              onClick={() => closeCustomDialog(false)}
              className="px-3 py-1.5 rounded-xl bg-[#f0efed] dark:bg-[#292524] hover:bg-[#e7e5e4] dark:hover:bg-[#38332e] text-xs font-medium text-[#292524] dark:text-[#f5f5f4] flex items-center gap-1.5 transition t-btn-press"
              title="Cancel"
            >
              <i className="fa-solid fa-xmark text-[10px]" />
              <span>{lang === 'th' ? 'ยกเลิก' : 'Cancel'}</span>
            </button>
          )}
          <button
            ref={confirmBtnRef}
            type="button"
            id="custom-dialog-confirm"
            onClick={() => closeCustomDialog(true)}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition shadow-xs t-btn-press ${
              isDanger
                ? 'bg-rose-600 hover:bg-rose-700 text-white'
                : 'bg-[#0c0a09] dark:bg-white hover:bg-[#292524] dark:hover:bg-[#f5f5f4] text-white dark:text-[#0c0a09]'
            }`}
            title="Confirm"
          >
            <i className="fa-solid fa-check text-[10px]" />
            <span>{lang === 'th' ? 'ยืนยัน' : 'Confirm'}</span>
          </button>
        </div>
      </div>
    </div>
  );
}
