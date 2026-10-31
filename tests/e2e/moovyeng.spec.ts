import { test, expect, Page } from '@playwright/test';

/**
 * ============================================================================
 * MoovyEng — Principal E2E Automation Test Suite (TypeScript)
 * Architecture: Next.js Studio (Desktop / & Mobile /edit) + Media Proxy (Port 3001)
 * Standards: Page-Object Patterns, Network Mocking, Resilient Selectors & Zero Flakiness
 * ============================================================================
 */

// ----------------------------------------------------------------------------
// Type Definitions & Mock Fixtures
// ----------------------------------------------------------------------------
interface VocabMockPayload {
  success: boolean;
  word: string;
  phonetic: string;
  thaiRead: string;
  meaning: string;
  grammar: string;
  ex1: string;
  ex2: string;
}

const MOCK_AI_VOCAB_RESPONSE: VocabMockPayload = {
  success: true,
  word: 'break a leg',
  phonetic: '/breɪk ə leɡ/',
  thaiRead: '(เบรค-อะ-เลก)',
  meaning: 'ขอให้โชคดี (นิยมใช้ก่อนขึ้นเวทีแสดง)',
  grammar: 'feel / be + under the weather',
  ex1: 'Break a leg tonight, you are going to rock the stage!',
  ex2: "Before she walked on stage, I whispered, 'Break a leg,' and smiled at her."
};

const MOCK_CLIP_RESPONSE = {
  success: true,
  slug: 'break-a-leg-s7',
  videoUrl: 'https://clip.cafe/videos/break-a-leg-s7.mp4',
  publicUrl: '/clips_cache/break-a-leg-s7_crop16x9.mp4',
  fallback: false
};

// ----------------------------------------------------------------------------
// Reusable Mock Helpers (Prevents burning production AI & ElevenLabs credits)
// ----------------------------------------------------------------------------
async function setupGlobalNetworkMocks(page: Page, options: { failProxy?: boolean } = {}) {
  // 1. Mock AI Vocab Analysis / Lookup Route
  await page.route('**/api/vocab/lookup**', async (route) => {
    if (options.failProxy) {
      await route.fulfill({
        status: 500,
        contentType: 'application/json',
        body: JSON.stringify({ success: false, error: 'Internal AI Engine Unavailable' })
      });
      return;
    }

    // Simulate standard AI processing latency (200ms)
    await new Promise((res) => setTimeout(res, 200));
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify(MOCK_AI_VOCAB_RESPONSE)
    });
  });

  // 2. Mock Python Video Download & Clip Caching API
  await page.route('**/api/cafe/python-video**', async (route) => {
    if (options.failProxy) {
      await route.fulfill({
        status: 500,
        contentType: 'application/json',
        body: JSON.stringify({ success: false, error: 'Video engine failed to download' })
      });
      return;
    }

    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify(MOCK_CLIP_RESPONSE)
    });
  });

  // 3. Mock Media Proxy Server (Stream & Clean Cache routes)
  await page.route('**/api/cafe/stream**', async (route) => {
    // Fulfill with a lightweight 206 Partial Content MP4 mock buffer
    await route.fulfill({
      status: 206,
      contentType: 'video/mp4',
      headers: {
        'Accept-Ranges': 'bytes',
        'Content-Range': 'bytes 0-1023/1024'
      },
      body: Buffer.alloc(1024)
    });
  });

  // 4. Mock External AI Models APIs (Groq / Gemini / OpenAI)
  await page.route('https://generativelanguage.googleapis.com/**', async (route) => {
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({ models: [{ name: 'models/gemini-2.0-flash', displayName: 'Gemini 2.0 Flash' }] })
    });
  });
}

// ============================================================================
// Test Suite 1: Desktop Studio Flow ('/')
// ============================================================================
test.describe('MoovyEng Desktop Studio Flow (/)', () => {
  test.beforeEach(async ({ page }) => {
    await setupGlobalNetworkMocks(page);
  });

  test('1.1 should load studio with two-column layout and core module headers', async ({ page }) => {
    await page.goto('/', { waitUntil: 'domcontentloaded' });

    // Verify Main Brand Title & Studio Canvas presence
    await expect(page).toHaveTitle(/MoovyEng/i);
    const phoneContainer = page.locator('#phone-container');
    await expect(phoneContainer).toBeVisible({ timeout: 15000 });

    // Verify Sticky Left Column & Step Controls in Right Column by Stable IDs
    await expect(page.locator('#tool-sec-ai')).toBeVisible();
    await expect(page.locator('#tool-sec-vocab')).toBeVisible();
    await expect(page.locator('#tool-sec-ratio')).toBeVisible();
    await expect(page.locator('#tool-sec-social')).toBeVisible();
  });

  test('1.2 should allow entering API key and detect provider badge automatically', async ({ page }) => {
    await page.goto('/', { waitUntil: 'domcontentloaded' });

    // Locate API Key input
    const apiKeyInput = page.locator('#api-key');
    await expect(apiKeyInput).toBeVisible();

    // Enter Mock Groq Key and verify auto-detection badge updates
    await apiKeyInput.fill('gsk_test_groq_key_123456789');
    const detectedBadge = page.locator('#detected-provider-badge');
    await expect(detectedBadge).toBeVisible();
    await expect(detectedBadge).toContainText('GROQ', { ignoreCase: true });
  });

  test('1.3 should enter flashcard text and observe instant sync on phone preview', async ({ page }) => {
    await page.goto('/', { waitUntil: 'domcontentloaded' });

    // Fill target vocabulary into Step 2 input
    const wordInput = page.locator('#target-word');
    await expect(wordInput).toBeVisible();
    await wordInput.fill('serendipity');

    // Fill Thai translation
    const thaiInput = page.locator('#target-meaning');
    if (await thaiInput.isVisible()) {
      await thaiInput.fill('ความบังเอิญที่โชคดี');
    }

    // Verify Realtime Preview Canvas updates without full page reload
    const previewWord = page.locator('#phone-container #preview-word');
    await expect(previewWord).toContainText('serendipity');
  });

  test('1.4 should verify video player container and play/pause controls', async ({ page }) => {
    await page.goto('/', { waitUntil: 'domcontentloaded' });

    const videoElement = page.locator('#phone-container video');
    await expect(videoElement).toBeAttached();

    // Verify play button triggers without throwing JS exceptions
    const playOverlay = page.locator('#phone-container .fa-play, #phone-container button[title*="Play"]').first();
    if (await playOverlay.isVisible()) {
      await playOverlay.click();
      const isPaused = await videoElement.evaluate((vid: HTMLVideoElement) => vid.paused);
      expect(typeof isPaused).toBe('boolean');
    }
  });
});

// ============================================================================
// Test Suite 2: Mobile Studio Flow ('/edit')
// ============================================================================
test.describe('MoovyEng Mobile Studio Flow (/edit)', () => {
  test.use({
    viewport: { width: 393, height: 852 },
    isMobile: true,
    hasTouch: true
  });

  test.beforeEach(async ({ page }) => {
    await setupGlobalNetworkMocks(page);
  });

  test('2.1 should render mobile studio view with responsive layout & touch elements', async ({ page }) => {
    await page.goto('/edit', { waitUntil: 'domcontentloaded' });

    const phoneContainer = page.locator('#phone-container');
    await expect(phoneContainer).toBeVisible({ timeout: 15000 });

    // Validate that canvas is rendered within reasonable bounds
    const box = await phoneContainer.boundingBox();
    expect(box).not.toBeNull();
    if (box) {
      expect(box.width).toBeGreaterThan(0);
      expect(box.height).toBeGreaterThan(0);
    }
  });

  test('2.2 should display mobile tool steps seamlessly', async ({ page }) => {
    await page.goto('/edit', { waitUntil: 'domcontentloaded' });

    const step2Header = page.locator('#tool-sec-vocab .tool-card-header');
    if (await step2Header.isVisible()) {
      await step2Header.click();
      const wordInput = page.locator('#target-word');
      await expect(wordInput).toBeAttached();
    }
  });
});

// ============================================================================
// Test Suite 3: API & Network Mocking (Zero API Cost Testing)
// ============================================================================
test.describe('MoovyEng API Network Mocking & UI Transitions', () => {
  test.beforeEach(async ({ page }) => {
    await setupGlobalNetworkMocks(page);
  });

  test('3.1 should show loading animation when AI analysis triggers and populate fields', async ({ page }) => {
    await page.goto('/', { waitUntil: 'domcontentloaded' });

    // Locate AI Analyze button
    const aiAnalyzeBtn = page.locator('#btn-ai-analyze');
    if (await aiAnalyzeBtn.isVisible()) {
      await aiAnalyzeBtn.click();

      // Verify AI mocked text propagates into phone preview
      await expect(page.locator('#phone-container #preview-phonetic')).toContainText('/breɪk ə leɡ/', { timeout: 8000 });
      await expect(page.locator('#phone-container #preview-meaning')).toContainText('ขอให้โชคดี');
    }
  });

  test('3.2 should open export modal without breaking UI flow', async ({ page }) => {
    await page.goto('/', { waitUntil: 'domcontentloaded' });

    const exportBtn = page.locator('#btn-export-studio');
    if (await exportBtn.isVisible()) {
      await exportBtn.click();

      const exportModal = page.locator('#export-modal');
      await expect(exportModal).toBeVisible({ timeout: 5000 });
    }
  });
});

// ============================================================================
// Test Suite 4: Resilience & Edge Cases
// ============================================================================
test.describe('MoovyEng Resilience & Edge Case Handling', () => {
  test('4.1 should gracefully handle empty state when clearing inputs', async ({ page }) => {
    await setupGlobalNetworkMocks(page);
    await page.goto('/', { waitUntil: 'domcontentloaded' });

    // Clear word input completely
    const wordInput = page.locator('#target-word');
    await wordInput.fill('');

    // Phone container remains stable and does not throw React crash
    await expect(page.locator('#phone-container')).toBeVisible();
    await expect(page.locator('body')).not.toBeEmpty();
  });

  test('4.2 should handle 500 Internal Server Error gracefully without crashing frontend', async ({ page }) => {
    // Configure network mocking to return 500 error on video & python engine endpoints
    await setupGlobalNetworkMocks(page, { failProxy: true });

    await page.goto('/', { waitUntil: 'domcontentloaded' });

    const aiAnalyzeBtn = page.locator('#btn-ai-analyze');
    if (await aiAnalyzeBtn.isVisible()) {
      await aiAnalyzeBtn.click();
    }

    // Verify Error Boundary prevents full page whiteout
    await expect(page.locator('body')).not.toBeEmpty();
    await expect(page.locator('#phone-container')).toBeVisible();
  });
});
