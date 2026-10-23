'use client';

import React, { useState } from 'react';
import { useVocab } from '../context/VocabContext';
import { VENDOR_LABELS } from '../lib/constants';

export default function ToolStep1AI() {
  const {
    aiVendor,
    setAiVendor,
    aiModel,
    setAiModel,
    apiKey,
    setApiKey,
    availableModels,
    setAvailableModels,
    collapsedSections,
    toggleToolCard,
    showToast,
    lang
  } = useVocab();

  const [showKey, setShowKey] = useState(false);
  const [isVerifying, setIsVerifying] = useState(false);
  const [statusText, setStatusText] = useState('');

  const isCollapsed = Boolean(collapsedSections['tool-sec-ai']);

  const handleVendorChange = (newVendor) => {
    setAiVendor(newVendor);
  };

  const handleApiKeyInput = (val) => {
    setApiKey(val);
    const key = val.trim();
    if (key.startsWith('AIza') || key.startsWith('AQ.')) setAiVendor('gemini');
    else if (key.startsWith('gsk_')) setAiVendor('groq');
    else if (key.startsWith('sk-ant-')) setAiVendor('anthropic');
    else if (key.startsWith('xai-')) setAiVendor('xai');
  };

  const verifyKeyAndFetchModels = async () => {
    const key = apiKey.trim();
    if (!key) {
      showToast(lang === 'th' ? 'กรุณาระบุ API Key ก่อนตรวจสอบ' : 'Please provide an API Key first');
      return;
    }

    setIsVerifying(true);
    const vendorName = VENDOR_LABELS[aiVendor] || aiVendor.toUpperCase();
    setStatusText(lang === 'th' ? `กำลังตรวจสอบคีย์ ${vendorName}...` : `Verifying ${vendorName} key...`);

    try {
      if (aiVendor === 'gemini') {
        const resp = await fetch(`https://generativelanguage.googleapis.com/v1beta/models?key=${encodeURIComponent(key)}`);
        if (!resp.ok) {
          const err = await resp.json().catch(() => ({}));
          throw new Error(err.error?.message || `HTTP ${resp.status}`);
        }
        const json = await resp.json();
        const models = (json.models || [])
          .filter((m) => {
            const methods = m.supportedGenerationMethods || [];
            const id = (m.name || '').replace(/^models\//, '');
            if (!methods.includes('generateContent')) return false;
            if (id.includes('tts') || id.includes('image') || id.includes('transcribe')) return false;
            return true;
          })
          .map((m) => {
            const cleanId = m.name.replace(/^models\//, '');
            return { id: cleanId, label: `${cleanId} (${m.displayName || cleanId})` };
          });

        setAvailableModels(models);
        if (models.length > 0 && !models.some((m) => m.id === aiModel)) {
          setAiModel(models[0].id);
        }
        setStatusText(lang === 'th' ? `ตรวจพบ ${models.length} โมเดล พร้อมใช้งาน!` : `${models.length} models ready!`);
        showToast(lang === 'th' ? `เชื่อมต่อ ${vendorName} สำเร็จ!` : `${vendorName} connected!`);
      } else {
        setStatusText(lang === 'th' ? `เชื่อมต่อ ${vendorName} พร้อมใช้งาน` : `${vendorName} ready`);
        showToast(lang === 'th' ? `บันทึกคีย์ ${vendorName} เรียบร้อย` : `Saved ${vendorName} key`);
      }
    } catch (err) {
      setStatusText(lang === 'th' ? `เกิดข้อผิดพลาด: ${err.message}` : `Error: ${err.message}`);
      showToast(`${lang === 'th' ? 'ตรวจสอบไม่ผ่าน' : 'Verification failed'}: ${err.message}`);
    } finally {
      setIsVerifying(false);
    }
  };

  return (
    <section
      id="tool-sec-ai"
      data-tool-keywords="1 ai model provider api key gemini openai groq deepseek claude ค่าย โมเดล คีย์"
      className={`tool-section-card bg-white dark:bg-[#1c1917] border border-[#e7e5e4] dark:border-[#292524] rounded-2xl p-4 shadow-[0_4px_16px_rgba(0,0,0,0.04)] ${
        isCollapsed ? 'is-collapsed' : ''
      }`}
    >
      <div
        className="tool-card-header flex items-center justify-between gap-2 mb-3 pb-2 border-b border-[#f0efed] dark:border-[#292524] cursor-pointer select-none"
        onClick={() => toggleToolCard('tool-sec-ai')}
      >
        <div className="flex items-center space-x-2 text-[#0c0a09] dark:text-white font-semibold text-sm">
          <span className="w-5 h-5 rounded-full bg-[#0c0a09] dark:bg-white text-white dark:text-[#0c0a09] flex items-center justify-center text-[10px] font-mono">
            1
          </span>
          <span>AI Model</span>
        </div>
        <div className="flex items-center gap-2">
          <span
            id="detected-provider-badge"
            className="text-[10px] px-2 py-0.5 rounded-full bg-[#f0efed] dark:bg-[#292524] text-[#777169] dark:text-[#a8a29e] font-semibold uppercase tracking-wider"
          >
            {apiKey ? VENDOR_LABELS[aiVendor] || 'Ready' : 'Ready'}
          </span>
          <button
            type="button"
            className="w-6 h-6 rounded-full hover:bg-[#f0efed] dark:hover:bg-[#292524] text-[#777169] hover:text-[#0c0a09] dark:hover:text-white flex items-center justify-center transition"
            title="Collapse / Expand"
          >
            <i className="fa-solid fa-chevron-down text-[10px] tool-collapse-chevron" />
          </button>
        </div>
      </div>

      <div className="tool-card-body">
        <div className="tool-card-inner space-y-2.5">
          <div className="grid grid-cols-1 sm:grid-cols-12 gap-2.5">
            <div className="sm:col-span-4">
              <label htmlFor="ai-vendor" className="block text-[11px] font-medium text-[#777169] dark:text-[#a8a29e] mb-1">
                Provider
              </label>
              <select
                id="ai-vendor"
                value={aiVendor}
                onChange={(e) => handleVendorChange(e.target.value)}
                className="w-full bg-white dark:bg-[#292524] border border-[#d6d3d1] dark:border-[#44403c] rounded-lg px-2.5 py-1.5 text-xs text-[#0c0a09] dark:text-white focus:border-[#0c0a09] dark:focus:border-white focus:outline-none transition font-medium"
              >
                <option value="gemini">Google Gemini</option>
                <option value="openai">OpenAI (GPT)</option>
                <option value="deepseek">DeepSeek AI</option>
                <option value="groq">Groq Cloud</option>
                <option value="anthropic">Anthropic Claude</option>
                <option value="xai">xAI Grok</option>
                <option value="mistral">Mistral AI</option>
              </select>
            </div>

            <div className="sm:col-span-8">
              <label htmlFor="api-key" className="block text-[11px] font-medium text-[#777169] dark:text-[#a8a29e] mb-1">
                API Key
              </label>
              <div className="flex gap-1.5">
                <div className="relative flex-1">
                  <input
                    type={showKey ? 'text' : 'password'}
                    id="api-key"
                    value={apiKey}
                    onChange={(e) => handleApiKeyInput(e.target.value)}
                    placeholder="Paste API Key..."
                    className="w-full bg-white dark:bg-[#292524] border border-[#d6d3d1] dark:border-[#44403c] rounded-lg px-3 py-1.5 pr-8 text-xs text-[#0c0a09] dark:text-white focus:border-[#0c0a09] dark:focus:border-white focus:outline-none font-mono transition"
                  />
                  <button
                    type="button"
                    onClick={() => setShowKey(!showKey)}
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[#777169] hover:text-[#0c0a09] dark:hover:text-white text-xs"
                  >
                    <i id="eye-icon" className={`fa-solid ${showKey ? 'fa-eye-slash' : 'fa-eye'}`} />
                  </button>
                </div>
                <button
                  type="button"
                  id="btn-verify-key"
                  onClick={verifyKeyAndFetchModels}
                  disabled={isVerifying}
                  className="w-8 h-8 bg-[#292524] dark:bg-white hover:bg-[#0c0a09] text-white dark:text-[#0c0a09] rounded-lg shadow-xs transition flex items-center justify-center flex-shrink-0 disabled:opacity-50"
                  title="Verify API Key"
                  aria-label="Verify API Key"
                >
                  <i className={`fa-solid ${isVerifying ? 'fa-circle-notch fa-spin' : 'fa-circle-check'} text-xs`} />
                </button>
              </div>
            </div>
          </div>

          {availableModels.length > 0 && (
            <div id="model-selector-wrapper" className="pt-0.5 transition-all">
              <label htmlFor="ai-provider" className="block text-[11px] font-medium text-[#0c0a09] dark:text-white mb-1 flex items-center justify-between">
                <span id="model-selector-label">Model</span>
                <span id="model-count-badge" className="text-[10px] text-[#777169] dark:text-[#a8a29e]">
                  {availableModels.length} models
                </span>
              </label>
              <select
                id="ai-provider"
                value={aiModel}
                onChange={(e) => setAiModel(e.target.value)}
                className="w-full bg-white dark:bg-[#292524] border border-[#0c0a09] dark:border-white rounded-lg px-3 py-1.5 text-xs text-[#0c0a09] dark:text-white focus:outline-none transition"
              >
                {availableModels.map((m) => (
                  <option key={m.id} value={m.id}>
                    {m.label}
                  </option>
                ))}
              </select>
            </div>
          )}

          {statusText && (
            <p id="openrouter-status" className="text-[10px] text-[#777169] dark:text-[#a8a29e]">
              {statusText}
            </p>
          )}
        </div>
      </div>
    </section>
  );
}
