/**
 * ============================================================================
 * moovying(En) / movyEng — Clip.cafe English Movie Scraper & Sequential Player
 * ============================================================================
 */

function parseCafeClipHtml(html) {
  const clips = [];
  const blocks = (html || '').split('<div class="searchResultClip">').slice(1);
  for (const b of blocks) {
    const slug = (b.match(/data-slug=["']([^"']+)["']/) || [])[1];
    const link = (b.match(/data-link=["']([^"']+)["']/) || [])[1];
    if (!slug || !link) continue;

    const isEnglishAudio = /title=["']Audio:\s*English["']/i.test(b) || /<span class=["']pill-code["']>EN<\/span>/i.test(b);
    if (!isEnglishAudio) continue;

    const isSeries = /Season\s+\d+|Episode\s+\d+|clipEpisodeBadge/i.test(b);
    const duration = ((b.match(/<span class=["']videoDuration["']>([^<]+)<\/span>/) || [])[1] || '').trim();
    const movieTitle = ((b.match(/<div class=["']clipMovie["']>\s*<a[^>]*>([^<]+)<\/a>/) || [])[1] || 'Movie Scene').trim();
    const movieDivMatch = b.match(/<div class=["']clipMovie["']>([\s\S]*?)<\/div>/);
    const movieMetaText = movieDivMatch ? movieDivMatch[1].replace(/<[^>]+>/g, ' ') : '';
    const yearMatch = movieMetaText.match(/\b(19\d{2}|20\d{2})\b/);
    const year = yearMatch ? parseInt(yearMatch[1], 10) : new Date().getFullYear();

    const transMatch = b.match(/<div class=["']clipTrans["']>\s*<p>(?:<b>Transcript:<\/b><br>)?([\s\S]*?)<\/p>/i);
    const transcript = transMatch ? transMatch[1].replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim() : '';

    clips.push({
      id: `cafe_${slug}`,
      slug,
      link,
      title: `${movieTitle} (${year})`,
      movieTitle,
      year,
      duration,
      isMovie: !isSeries,
      audioLang: 'EN',
      quote: transcript ? `"${transcript}"` : `Scene from ${movieTitle}`,
      movieSummary: '',
      thumb: `https://clip.cafe/img800/${slug}.jpg`,
      videoUrl: `https://clip.cafe/videos/${slug}.mp4`,
      pageUrl: `https://clip.cafe/${link}`,
      isRealCafeClip: true
    });
  }
  return clips.sort((a, b) => (a.isMovie === b.isMovie ? 0 : a.isMovie ? -1 : 1));
}

async function scrapeRealCafeClips(query, page = 1) {
  const cleanQuery = encodeURIComponent(query.trim());
  const localEndpoints = [
    `http://127.0.0.1:3001/api/cafe/search?q=${cleanQuery}&page=${page}`,
    `http://localhost:3001/api/cafe/search?q=${cleanQuery}&page=${page}`
  ];

  for (const ep of localEndpoints) {
    try {
      const localResp = await fetch(ep, {
        signal: AbortSignal.timeout(15000)
      });
      if (localResp.ok) {
        const data = await localResp.json();
        if (data.success && data.clips && data.clips.length > 0) return data.clips;
      }
    } catch (e) {}
  }

  const targetUrl = page > 1
    ? `https://clip.cafe/page/${page}/?s=${cleanQuery}&usersearch=1`
    : `https://clip.cafe/?s=${cleanQuery}&usersearch=1`;

  const proxies = [
    `https://api.allorigins.win/raw?url=${encodeURIComponent(targetUrl)}`,
    `https://corsproxy.io/?url=${encodeURIComponent(targetUrl)}`
  ];
  for (const proxyUrl of proxies) {
    try {
      const proxyResp = await fetch(proxyUrl, { signal: AbortSignal.timeout(8000) });
      if (proxyResp.ok) {
        const html = await proxyResp.text();
        const scrapedClips = parseCafeClipHtml(html);
        if (scrapedClips.length > 0) return scrapedClips;
      }
    } catch (err) {}
  }
  return [];
}

async function searchCafeClips(reset = false) {
  if (isScrapingClips) return;
  const wordVal = document.getElementById('target-word')?.value.trim();
  const clipQEl = document.getElementById('clip-query');
  if (clipQEl && wordVal && !clipQEl.value.trim()) {
    clipQEl.value = wordVal;
  }
  const query = clipQEl?.value.trim() || wordVal || '';
  if (!query) {
    showToast('กรุณาพิมพ์คำศัพท์ที่ต้องการค้นหาคลิปก่อน');
    return;
  }

  const grid = document.getElementById('clip-grid');
  const previousClips = [...cafeClipPool];

  if (reset) {
    currentPage = 1;
    if (grid && cafeClipPool.length === 0) {
      grid.innerHTML = `<div class="col-span-full py-6 text-center text-[#777169] text-xs"><i class="fa-solid fa-spinner fa-spin mr-1.5"></i>กำลัง Scrape คลิปหนังภาษาอังกฤษ & คำอธิบายเนื้อเรื่องจาก clip.cafe...</div>`;
    } else {
      const indicator = document.getElementById('clip-source-indicator');
      if (indicator) indicator.textContent = 'กำลังค้นหา...';
    }
  }

  isScrapingClips = true;
  try {
    const scraped = await scrapeRealCafeClips(query, currentPage);
    const indicator = document.getElementById('clip-source-indicator');

    if (scraped && scraped.length > 0) {
      if (reset) {
        cafeClipPool = scraped;
      } else {
        const existingIds = new Set(cafeClipPool.map(c => c.id));
        const newClips = scraped.filter(c => !existingIds.has(c.id));
        cafeClipPool = cafeClipPool.concat(newClips);
      }

      const movieCount = cafeClipPool.filter(c => c.isMovie).length;
      if (indicator) {
        indicator.textContent = `${movieCount || cafeClipPool.length} clips`;
        indicator.classList.remove('hidden');
      }

      if (reset || activeClipSequence.length === 0) {
        activeClipSequence = [cafeClipPool[0]];
      }

      prepareClipsWithPython(activeClipSequence);
      renderClipGrid();
      renderSequenceList();
      updateScrapedMovieContextUI();
      if (typeof syncFromDesktopForm === 'function') syncFromDesktopForm();
      if (typeof autoSaveDraft === 'function') autoSaveDraft();
    } else {
      if (previousClips.length > 0) {
        cafeClipPool = previousClips;
        renderClipGrid();
        showToast(`ไม่พบคลิปเพิ่มเติมสำหรับ "${query}" (ยังคงแสดงคลิปเดิม)`);
      } else if (grid) {
        grid.innerHTML = `<div class="col-span-full py-6 text-center text-[#777169] text-xs">No clips found for "${query}"</div>`;
      }
    }
  } catch (e) {
    console.error('searchCafeClips error:', e);
    if (previousClips.length > 0) {
      cafeClipPool = previousClips;
      renderClipGrid();
    }
  } finally {
    isScrapingClips = false;
  }
}

async function loadMoreCafeClips() {
  const spinner = document.getElementById('load-more-spinner');
  if (spinner) spinner.classList.add('spin-active');
  currentPage++;
  try {
    await searchCafeClips(false);
  } finally {
    setTimeout(() => {
      if (spinner) spinner.classList.remove('spin-active');
    }, 450);
  }
}

function renderClipGrid() {
  const grid = document.getElementById('clip-grid');
  if (!grid) return;
  grid.innerHTML = '';
  cafeClipPool.forEach(clip => {
    const seqIdx = activeClipSequence.findIndex(s => s.id === clip.id);
    const isSelected = seqIdx !== -1;
    const durText = formatDurationLabel(clip.duration);
    const thumbSrc = normalizeThumbUrl(clip.thumb, clip.slug);
    const card = document.createElement('div');
    card.className = `relative aspect-[3/2] rounded-xl overflow-hidden border-2 cursor-pointer transition ${
      isSelected ? 'border-[#0c0a09] ring-2 ring-[#0c0a09]/20' : 'border-[#e7e5e4] opacity-85 hover:opacity-100'
    }`;
    card.onclick = () => toggleSelectClip(clip);
    card.innerHTML = `
      <img src="${thumbSrc}" alt="${clip.title}" class="w-full h-full object-cover">
      <div class="absolute inset-0 bg-gradient-to-t from-black/90 via-black/30 to-transparent flex flex-col justify-between p-2">
        <div class="flex justify-between items-start gap-1">
          ${clip.isMovie ? '<span class="text-[9px] px-1.5 py-0.5 rounded-full bg-amber-400 text-[#0c0a09] font-bold tracking-tight">Movie</span>' : '<span class="text-[9px] px-1.5 py-0.5 rounded-full bg-zinc-700 text-white font-bold">Series</span>'}
          ${durText ? `<span class="text-[9px] px-1.5 py-0.5 rounded-full bg-black/60 text-white font-mono">${durText}</span>` : ''}
        </div>
        <div class="truncate text-left">
          <p class="text-[10px] font-semibold text-white truncate">${clip.title}</p>
          <p class="text-[8.5px] text-amber-200/95 truncate">${clip.quote}</p>
        </div>
      </div>
    `;
    grid.appendChild(card);
  });
}

function toggleSelectClip(clip) {
  const idx = activeClipSequence.findIndex(s => s.id === clip.id);
  if (idx !== -1) {
    if (activeClipSequence.length > 1) {
      activeClipSequence.splice(idx, 1);
    } else {
      showToast('เลือกคลิปนี้อยู่แล้วในคิวลำดับที่ 1');
    }
  } else {
    activeClipSequence.push(clip);
  }
  renderClipGrid();
  renderSequenceList();
  updateScrapedMovieContextUI();
  prepareClipsWithPython(activeClipSequence);
  if (typeof syncFromDesktopForm === 'function') syncFromDesktopForm();
  if (typeof autoSaveDraft === 'function') autoSaveDraft();
}

function renderSequenceList() {
  const container = document.getElementById('sequence-list');
  const badge = document.getElementById('selected-badge');
  if (!container || !badge) return;
  badge.textContent = `${activeClipSequence.length} clips`;
  container.innerHTML = '';

  if (activeClipSequence.length === 0) {
    container.innerHTML = '<div class="text-center py-2 text-xs text-[#777169]">No clips in queue</div>';
    return;
  }

  activeClipSequence.forEach((clip, index) => {
    const durText = formatDurationLabel(clip.duration);
    const thumbSrc = normalizeThumbUrl(clip.thumb, clip.slug);
    const item = document.createElement('div');
    item.className = 'flex items-center justify-between p-1.5 bg-white border border-[#e7e5e4] rounded-xl space-x-2';
    item.innerHTML = `
      <div class="flex items-center space-x-2 min-w-0">
        <span class="w-5 h-5 rounded-full bg-[#f0efed] text-[#0c0a09] flex items-center justify-center text-[10px] font-mono flex-shrink-0">${index + 1}</span>
        <img src="${thumbSrc}" class="w-10 h-7 rounded object-cover border border-[#e7e5e4] flex-shrink-0" alt="">
        <div class="truncate text-left flex items-center gap-1.5 min-w-0">
          <p class="text-xs font-medium text-[#0c0a09] truncate">${clip.title}</p>
          ${durText ? `<span class="text-[9px] px-1.5 py-0.5 rounded-full bg-[#f0efed] text-[#0c0a09] font-mono font-semibold flex-shrink-0"><i class="fa-regular fa-clock mr-0.5 text-[8px]"></i>${durText}</span>` : ''}
        </div>
      </div>
      <div class="flex items-center space-x-1 flex-shrink-0">
        <button type="button" onclick="moveSequence(${index}, -1)" ${index === 0 ? 'disabled class="opacity-20"' : ''} class="w-6 h-6 rounded-full hover:bg-[#f0efed] flex items-center justify-center"><i class="fa-solid fa-arrow-up text-[10px]"></i></button>
        <button type="button" onclick="moveSequence(${index}, 1)" ${index === activeClipSequence.length - 1 ? 'disabled class="opacity-20"' : ''} class="w-6 h-6 rounded-full hover:bg-[#f0efed] flex items-center justify-center"><i class="fa-solid fa-arrow-down text-[10px]"></i></button>
        <button type="button" onclick="removeSequence(${index})" class="w-6 h-6 rounded-full hover:bg-rose-50 text-rose-600 flex items-center justify-center"><i class="fa-solid fa-trash-can text-[10px]"></i></button>
      </div>
    `;
    container.appendChild(item);
  });
}

function moveSequence(index, direction) {
  const target = index + direction;
  if (target < 0 || target >= activeClipSequence.length) return;
  const temp = activeClipSequence[index];
  activeClipSequence[index] = activeClipSequence[target];
  activeClipSequence[target] = temp;
  renderSequenceList();
  renderClipGrid();
  if (typeof syncFromDesktopForm === 'function') syncFromDesktopForm();
  if (typeof autoSaveDraft === 'function') autoSaveDraft();
}

function removeSequence(index) {
  activeClipSequence.splice(index, 1);
  renderSequenceList();
  renderClipGrid();
  if (typeof syncFromDesktopForm === 'function') syncFromDesktopForm();
  if (typeof autoSaveDraft === 'function') autoSaveDraft();
}

function updateScrapedMovieContextUI() {
  const box = document.getElementById('scraped-movie-context-box');
  if (!box) return;
  const clip = activeClipSequence[0] || cafeClipPool[0];
  if (!clip) {
    box.classList.add('hidden');
    return;
  }
  box.classList.remove('hidden');
  const titleEl = document.getElementById('ctx-movie-title');
  const genresEl = document.getElementById('ctx-movie-genres');
  const prodEl = document.getElementById('ctx-movie-prod');
  const quoteEl = document.getElementById('ctx-movie-quote');
  const sumEl = document.getElementById('ctx-movie-summary');

  if (titleEl) titleEl.textContent = clip.title || clip.movieTitle || '';
  if (genresEl) {
    genresEl.textContent = clip.genres || 'English Film';
    genresEl.classList.toggle('hidden', !clip.genres);
  }
  if (prodEl) {
    prodEl.textContent = clip.production && clip.production !== 'N/A' ? `ค่ายผู้สร้าง: ${clip.production}` : 'ภาพยนตร์เสียงภาษาอังกฤษ (Audio: EN)';
  }
  if (quoteEl) quoteEl.textContent = clip.quote || clip.fullTranscript || '-';
  if (sumEl) {
    sumEl.textContent = clip.movieSummary || 'ฉากภาพยนตร์ภาษาอังกฤษจาก clip.cafe ที่มีบทพูดตรงกับคำศัพท์';
  }
}

async function prepareClipsWithPython(clipsList) {
  if (!Array.isArray(clipsList) || clipsList.length === 0) return;
  const baseApis = ['http://127.0.0.1:3001', 'http://localhost:3001'];
  for (const base of baseApis) {
    try {
      const resp = await fetch(`${base}/api/cafe/python-sequence`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ clips: clipsList })
      });
      if (resp.ok) {
        const data = await resp.json();
        if (data.success && Array.isArray(data.clips)) {
          data.clips.forEach((pyClip, i) => {
            if (clipsList[i] && pyClip.publicUrl) {
              clipsList[i].localVideoUrl = `${base}${pyClip.publicUrl}`;
            }
          });
          return;
        }
      }
    } catch (e) {}
  }
}

async function playAllClipsWithPython() {
  if (!activeClipSequence.length) {
    showToast('กรุณาเลือกคลิปหนังก่อน');
    return;
  }
  showToast(`กำลังใช้ Python ดึงคลิป ${activeClipSequence.length} เรื่องมาเล่นต่อกันตามคิว...`);
  await prepareClipsWithPython(activeClipSequence);
  isPlayingVideo = false;
  toggleClipPlayback();
}

function toggleClipPlayback() {
  if (!activeClipSequence.length) return;
  const video = document.getElementById('preview-video');
  const img = document.getElementById('preview-movie-img');
  const playIcon = document.getElementById('play-indicator-icon');

  if (isPlayingVideo) {
    if (video) {
      video.pause();
      video.classList.add('hidden');
    }
    if (img) img.classList.remove('hidden');
    if (playIcon) playIcon.className = 'fa-solid fa-play text-sm ml-0.5';
    isPlayingVideo = false;
    return;
  }

  isPlayingVideo = true;
  if (img) img.classList.add('hidden');
  if (video) video.classList.remove('hidden');
  if (playIcon) playIcon.className = 'fa-solid fa-pause text-sm';
  playClipAtSequenceIndex(0);
}

async function playClipAtSequenceIndex(idx) {
  if (!activeClipSequence.length) return;
  if (idx >= activeClipSequence.length) idx = 0;
  currentSequenceIndex = idx;
  const currentClip = activeClipSequence[idx];
  const video = document.getElementById('preview-video');
  const title = document.getElementById('preview-movie-title');

  if (title) title.textContent = currentClip.title || '';

  if (!currentClip.localVideoUrl && currentClip.slug) {
    try {
      const resp = await fetch(`http://127.0.0.1:3001/api/cafe/python-video?slug=${encodeURIComponent(currentClip.slug)}`);
      if (resp.ok) {
        const pyData = await resp.json();
        if (pyData.success && pyData.publicUrl) {
          currentClip.localVideoUrl = `http://127.0.0.1:3001${pyData.publicUrl}`;
        }
      }
    } catch (e) {}
  }

  const streamSrc = currentClip.localVideoUrl || currentClip.videoUrl;
  if (video && streamSrc) {
    video.src = streamSrc;
    video.load();
    video.onended = () => {
      const nextIdx = (currentSequenceIndex + 1) % activeClipSequence.length;
      playClipAtSequenceIndex(nextIdx);
    };
    video.play().catch(err => console.warn('Autoplay prevented:', err));
  }
}
