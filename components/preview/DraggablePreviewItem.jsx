'use client';

import React, { useRef } from 'react';
import { useVocab } from '../../context/VocabContext';

/**
 * DraggablePreviewItem
 * Universal draggable wrapper for any preview element in Move0nyoung.
 * Supports mouse drag, touch drag, magnetic center snapping (0px),
 * and dynamic Canva-style distance scale & measurement lines.
 */
export default function DraggablePreviewItem({
  id,
  label = '',
  className = '',
  elementPositions,
  updateElementPosition,
  activeDragInfo,
  setActiveDragInfo,
  containerRef,
  children
}) {
  const { lang } = useVocab();
  const itemRef = useRef(null);
  const pos = elementPositions?.[id] || { x: 0, y: 0 };
  const isDragging = activeDragInfo?.id === id;

  const handlePointerDown = (e) => {
    // Only primary button or touch
    if (e.button !== undefined && e.button !== 0) return;

    // Do not intercept input elements or clicks inside buttons
    const targetTag = e.target.tagName?.toLowerCase();
    if (targetTag === 'input' || targetTag === 'textarea' || targetTag === 'select') {
      return;
    }

    const startX = e.clientX;
    const startY = e.clientY;
    const startPosX = pos.x;
    const startPosY = pos.y;
    let hasMoved = false;
    let isCaptured = false;
    const pointerId = e.pointerId;
    const domNode = itemRef.current;

    const handlePointerMove = (moveEvent) => {
      const dx = moveEvent.clientX - startX;
      const dy = moveEvent.clientY - startY;

      // Small jitter deadzone (5px) to preserve clicks for child elements (video play/pause, buttons)
      if (!hasMoved) {
        if (Math.hypot(dx, dy) < 5) {
          return;
        }
        hasMoved = true;
        // Only capture pointer after real drag movement has begun
        if (domNode && domNode.setPointerCapture) {
          try {
            domNode.setPointerCapture(pointerId);
            isCaptured = true;
          } catch {}
        }
      }

      let nextX = startPosX + dx;
      const nextY = startPosY + dy;

      // Magnetic center snapping within 7px of center
      const isNearCenter = Math.abs(nextX) < 7;
      if (isNearCenter) {
        nextX = 0;
      }

      updateElementPosition?.(id, { x: nextX, y: nextY });

      if (containerRef?.current && itemRef?.current) {
        const cRect = containerRef.current.getBoundingClientRect();
        const iRect = itemRef.current.getBoundingClientRect();
        setActiveDragInfo?.({
          id,
          label: label || id,
          x: nextX,
          y: nextY,
          top: Math.round(iRect.top - cRect.top),
          bottom: Math.round(cRect.bottom - iRect.bottom),
          left: Math.round(iRect.left - cRect.left),
          right: Math.round(cRect.right - iRect.right),
          width: Math.round(iRect.width),
          height: Math.round(iRect.height),
          isNearCenter
        });
      }
    };

    const handlePointerUp = (upEvent) => {
      if (isCaptured && domNode && domNode.releasePointerCapture) {
        try {
          domNode.releasePointerCapture(upEvent.pointerId || pointerId);
        } catch {}
      }
      window.removeEventListener('pointermove', handlePointerMove);
      window.removeEventListener('pointerup', handlePointerUp);
      window.removeEventListener('pointercancel', handlePointerUp);
      setActiveDragInfo?.(null);
    };

    window.addEventListener('pointermove', handlePointerMove);
    window.addEventListener('pointerup', handlePointerUp);
    window.addEventListener('pointercancel', handlePointerUp);
  };

  const handleDoubleClick = (e) => {
    // Avoid resetting movie box position on double click so video play/pause taps are safe
    if (id === 'movieBox') return;
    e.stopPropagation();
    updateElementPosition?.(id, { x: 0, y: 0 });
    setActiveDragInfo?.(null);
  };

  const hasOffset = pos.x !== 0 || pos.y !== 0;

  return (
    <div
      ref={itemRef}
      id={`draggable-item-${id}`}
      onPointerDown={handlePointerDown}
      onDoubleClick={handleDoubleClick}
      className={`relative select-none transition-transform duration-75 touch-none group/drag ${
        isDragging
          ? 'z-30 cursor-grabbing ring-1.5 ring-indigo-500 rounded-lg shadow-sm'
          : 'cursor-grab hover:ring-1 hover:ring-dashed hover:ring-indigo-400/50 rounded-lg'
      } ${className}`}
      style={{
        transform: `translate3d(${pos.x}px, ${pos.y}px, 0px)`
      }}
      title={lang === 'th' ? `${label || id} (ลากเพื่อย้าย, ดับเบิ้ลคลิกเพื่อรีเซ็ต)` : `${label || id} (Drag to move, Double-click to reset)`}
    >
      {/* 4 Corner Dots when actively dragging */}
      {isDragging && (
        <div data-export-ignore="true" className="absolute -inset-1 pointer-events-none z-50">
          <div className="absolute top-0 left-0 w-2 h-2 rounded-xs bg-indigo-500 border border-white -translate-x-1/2 -translate-y-1/2 shadow-xs" />
          <div className="absolute top-0 right-0 w-2 h-2 rounded-xs bg-indigo-500 border border-white translate-x-1/2 -translate-y-1/2 shadow-xs" />
          <div className="absolute bottom-0 left-0 w-2 h-2 rounded-xs bg-indigo-500 border border-white -translate-x-1/2 translate-y-1/2 shadow-xs" />
          <div className="absolute bottom-0 right-0 w-2 h-2 rounded-xs bg-indigo-500 border border-white translate-x-1/2 translate-y-1/2 shadow-xs" />
        </div>
      )}

      {/* Floating Delta Badge when dragging */}
      {isDragging && (
        <div
          data-export-ignore="true"
          className="absolute -top-6 left-1/2 -translate-x-1/2 px-2 py-0.5 rounded-full bg-indigo-600 text-white text-[9px] font-mono font-semibold tracking-wide shadow-md whitespace-nowrap pointer-events-none z-50 animate-in fade-in zoom-in-95 duration-100"
        >
          {label ? `${label}: ` : ''}↕ {Math.round(pos.y)}px • ↔ {Math.round(pos.x)}px
        </div>
      )}

      {/* Reset Dot indicator if offset is non-zero */}
      {hasOffset && !isDragging && (
        <div
          data-export-ignore="true"
          onClick={handleDoubleClick}
          className="opacity-0 group-hover/drag:opacity-100 absolute -top-1.5 -right-1.5 w-4 h-4 rounded-full bg-[#0c0a09] dark:bg-white text-white dark:text-[#0c0a09] flex items-center justify-center text-[8px] cursor-pointer shadow-xs transition hover:scale-110 z-40"
          title={lang === 'th' ? 'รีเซ็ตตำแหน่ง (0, 0)' : 'Reset position (0, 0)'}
        >
          <i className="fa-solid fa-rotate-left" />
        </div>
      )}

      {children}
    </div>
  );
}
