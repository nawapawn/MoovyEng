'use client';

import React, { useState } from 'react';
import { useVocab } from '../context/VocabContext';
import { VENDOR_LABELS, DEFAULT_VENDOR_MODELS } from '../lib/constants';
import ElevenLabsDropdown from './ElevenLabsDropdown';

const VENDOR_OPTIONS = [
  { id: 'gemini', label: 'Google Gemini' },
  { id: 'openai', label: 'OpenAI (GPT & o-series)' },
  { id: 'deepseek', label: 'DeepSeek AI (V3 & R1)' },
  { id: 'groq', label: 'Groq Cloud (Fast Llama & Qwen)' },
  { id: 'anthropic', label: 'Anthropic Claude' },
  { id: 'xai', label: 'xAI Grok' },
  { id: 'mistral', label: 'Mistral AI' },
];

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
  const modelsToDisplay = availableModels.length > 0 ? availableModels : (DEFAULT_VENDOR_MODELS[aiVendor] || []);

  const handleVendorChange = (newVendor) => {
    setAiVendor(newVendor);
    const defaults = DEFAULT_VENDOR_MODELS[newVendor] || [];
    setAvailableModels(defaults);
    if (defaults.length > 0) {
      setAiModel(defaults[0].id);
    }
  };

  const handleApiKeyInput = (val) => {
    setApiKey(val);
    const key = val.trim();
    let detected = '';
    if (key.startsWith('AIza') || key.startsWith('AQ.')) detected = 'gemini';
    else if (key.startsWith('gsk_')) detected = 'groq';
    else if (key.startsWith('sk-ant-')) detected = 'anthropic';
    else if (key.startsWith('xai-')) detected = 'xai';

    if (detected && detected !== aiVendor) {
      setAiVendor(detected);
      const defaults = DEFAULT_VENDOR_MODELS[detected] || [];
      setAvailableModels(defaults);
      if (defaults.length > 0) setAiModel(defaults[0].id);
    }
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
      let fetchedModels = [];

      if (aiVendor === 'gemini') {
        const resp = await fetch(`https://generativelanguage.googleapis.com/v1beta/models?key=${encodeURIComponent(key)}`);
        if (!resp.ok) {
          const err = await resp.json().catch(() => ({}));
          throw new Error(err.error?.message || `HTTP ${resp.status}`);
        }
        const json = await resp.json();
        const priorityIds = [
          'gemini-2.0-flash',
          'gemini-1.5-flash',
          'gemini-1.5-pro',
          'gemini-2.5-flash',
          'gemma-2-9b-it'
        ];
        fetchedModels = (json.models || [])
          .filter((m) => {
            const methods = m.supportedGenerationMethods || [];
            const id = (m.name || '').replace(/^models\//, '');
            if (!methods.includes('generateContent')) return false;
            if (id.includes('tts') || id.includes('image') || id.includes('banana') || id.includes('transcribe')) return false;
            return true;
          })
          .map((m) => {
            const cleanId = m.name.replace(/^models\//, '');
            return { id: cleanId, label: `${cleanId} (${m.displayName || cleanId})` };
          })
          .sort((a, b) => {
            const idxA = priorityIds.indexOf(a.id);
            const idxB = priorityIds.indexOf(b.id);
            if (idxA !== -1 && idxB !== -1) return idxA - idxB;
            if (idxA !== -1) return -1;
            if (idxB !== -1) return 1;
            return a.id.localeCompare(b.id);
          });
      } else if (aiVendor === 'groq') {
        const resp = await fetch('https://api.groq.com/openai/v1/models', {
          headers: { Authorization: `Bearer ${key}` }
        });
        if (!resp.ok) {
          const err = await resp.json().catch(() => ({}));
          throw new Error(err.error?.message || `HTTP ${resp.status}`);
        }
        const json = await resp.json();
        fetchedModels = (json.data || []).map((m) => ({ id: m.id, label: m.id }));
      } else if (aiVendor === 'openai') {
        const resp = await fetch('https://api.openai.com/v1/models', {
          headers: { Authorization: `Bearer ${key}` }
        });
        if (!resp.ok) {
          const err = await resp.json().catch(() => ({}));
          throw new Error(err.error?.message || `HTTP ${resp.status}`);
        }
        const json = await resp.json();
        const all = json.data || [];
        const filtered = all.filter((m) => m.id.startsWith('gpt-') || m.id.startsWith('o1') || m.id.startsWith('o3') || m.id.startsWith('chatgpt-'));
        fetchedModels = (filtered.length > 0 ? filtered : all)
          .sort((a, b) => (b.created || 0) - (a.created || 0))
          .map((m) => ({ id: m.id, label: m.id }));
      } else if (aiVendor === 'deepseek') {
        const resp = await fetch('https://api.deepseek.com/models', {
          headers: { Authorization: `Bearer ${key}` }
        });
        if (!resp.ok) {
          const err = await resp.json().catch(() => ({}));
          throw new Error(err.error?.message || `HTTP ${resp.status}`);
        }
        const json = await resp.json();
        fetchedModels = (json.data || []).map((m) => ({ id: m.id, label: m.id }));
      } else if (aiVendor === 'anthropic') {
        const resp = await fetch('https://api.anthropic.com/v1/models', {
          headers: {
            'x-api-key': key,
            'anthropic-version': '2023-06-01',
            'anthropic-dangerous-direct-browser-access': 'true'
          }
        });
        if (!resp.ok) {
          const err = await resp.json().catch(() => ({}));
          throw new Error(err.error?.message || `HTTP ${resp.status}`);
        }
        const json = await resp.json();
        fetchedModels = (json.data || []).map((m) => ({ id: m.id, label: `${m.id} — ${m.display_name || m.id}` }));
      } else if (aiVendor === 'xai') {
        const resp = await fetch('https://api.x.ai/v1/models', {
          headers: { Authorization: `Bearer ${key}` }
        });
        if (!resp.ok) {
          const err = await resp.json().catch(() => ({}));
          throw new Error(err.error?.message || `HTTP ${resp.status}`);
        }
        const json = await resp.json();
        fetchedModels = (json.data || []).map((m) => ({ id: m.id, label: m.id }));
      } else if (aiVendor === 'mistral') {
        const resp = await fetch('https://api.mistral.ai/v1/models', {
          headers: { Authorization: `Bearer ${key}` }
        });
        if (!resp.ok) {
          const err = await resp.json().catch(() => ({}));
          throw new Error(err.error?.message || `HTTP ${resp.status}`);
        }
        const json = await resp.json();
        fetchedModels = (json.data || []).map((m) => ({ id: m.id, label: m.id }));
      }

      if (fetchedModels.length > 0) {
        setAvailableModels(fetchedModels);
        if (!fetchedModels.some((m) => m.id === aiModel)) {
          setAiModel(fetchedModels[0].id);
        }
        setStatusText(lang === 'th' ? `ตรวจพบ ${fetchedModels.length} โมเดล พร้อมใช้งาน!` : `${fetchedModels.length} models ready!`);
        showToast(lang === 'th' ? `เชื่อมต่อ ${vendorName} สำเร็จ!` : `${vendorName} connected!`);
      } else {
        const defaults = DEFAULT_VENDOR_MODELS[aiVendor] || [];
        setAvailableModels(defaults);
        setStatusText(lang === 'th' ? `เชื่อมต่อ ${vendorName} พร้อมใช้งาน` : `${vendorName} ready`);
        showToast(lang === 'th' ? `บันทึกคีย์ ${vendorName} เรียบร้อย` : `Saved ${vendorName} key`);
      }
    } catch (err) {
      const defaults = DEFAULT_VENDOR_MODELS[aiVendor] || [];
      if (availableModels.length === 0) {
        setAvailableModels(defaults);
      }
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
            {(VENDOR_LABELS[aiVendor] || aiVendor).toUpperCase()}
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
              <ElevenLabsDropdown
                id="ai-vendor"
                value={aiVendor}
                onChange={handleVendorChange}
                options={VENDOR_OPTIONS}
              />
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

          {/* Model Selector - Always Visible with Options */}
          <div id="model-selector-wrapper" className="pt-0.5 transition-all">
            <label htmlFor="ai-provider" className="block text-[11px] font-medium text-[#0c0a09] dark:text-white mb-1 flex items-center justify-between">
              <span id="model-selector-label">Model</span>
              <span id="model-count-badge" className="text-[10px] text-[#777169] dark:text-[#a8a29e]">
                {modelsToDisplay.length} models
              </span>
            </label>
            <ElevenLabsDropdown
              id="ai-provider"
              value={aiModel}
              onChange={setAiModel}
              options={modelsToDisplay}
            />
          </div>

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
