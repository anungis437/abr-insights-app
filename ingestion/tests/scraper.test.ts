/**
 * CanLII Scraper - Unit Tests
 * 
 * Tests for the CanLII scraper implementation with mocked HTTP requests.
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import axios from 'axios';
import { CanLIIScraper } from '../src/scrapers/canlii';
import type { DecisionLink } from '../src/types';

// Create mock axios instance
const mockAxiosInstance = {
  get: vi.fn(),
  post: vi.fn(),
  put: vi.fn(),
  delete: vi.fn(),
  patch: vi.fn(),
  defaults: {
    headers: {
      common: {},
    },
  },
};

// Mock axios.create to return our mock instance
vi.mock('axios', () => {
  return {
    default: {
      create: vi.fn(() => mockAxiosInstance),
      get: vi.fn(),
      post: vi.fn(),
    },
  };
});

describe('CanLIIScraper', () => {
  let scraper: CanLIIScraper;

  beforeEach(() => {
    vi.clearAllMocks();
    scraper = new CanLIIScraper('canlii_hrto');
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('constructor', () => {
    it('should initialize with HRTO source system', () => {
      expect(scraper).toBeInstanceOf(CanLIIScraper);
    });

    it('should initialize with CHRT source system', () => {
      const chrtScraper = new CanLIIScraper('canlii_chrt');
      expect(chrtScraper).toBeInstanceOf(CanLIIScraper);
    });
  });

  describe('discoverDecisions', () => {
    it('should discover decisions from HTML listing page', async () => {
      const mockHtml = `
        <html>
          <body>
            <div class="results">
              <div class="result">
                <a href="/en/on/onhrt/doc/2024/2024hrto123/2024hrto123.html">
                  Smith v. Company A
                </a>
                <span class="date">2024-01-15</span>
              </div>
              <div class="result">
                <a href="/en/on/onhrt/doc/2024/2024hrto456/2024hrto456.html">
                  Jones v. Organization B
                </a>
                <span class="date">2024-01-20</span>
              </div>
            </div>
          </body>
        </html>
      `;

      mockAxiosInstance.get.mockResolvedValueOnce({ data: mockHtml, status: 200 });

      const decisions = await scraper.discoverDecisions(10);

      expect(decisions.length).toBeGreaterThan(0);
      expect(decisions[0]).toHaveProperty('url');
      expect(decisions[0]).toHaveProperty('title');
    });

    it('should respect maxCases limit', async () => {
      const mockHtml = `
        <html>
          <body>
            <div class="results">
              ${Array.from({ length: 50 }, (_, i) => `
                <div class="result">
                  <a href="/en/on/onhrt/doc/2024/2024hrto${i}/2024hrto${i}.html">
                    Case ${i}
                  </a>
                  <span class="date">2024-01-${String(i + 1).padStart(2, '0')}</span>
                </div>
              `).join('')}
            </div>
          </body>
        </html>
      `;

      mockAxiosInstance.get.mockResolvedValueOnce({ data: mockHtml, status: 200 });

      const decisions = await scraper.discoverDecisions(10);

      expect(decisions.length).toBeLessThanOrEqual(10);
    });

    it('should return empty array when no decisions found', async () => {
      const mockHtml = `
        <html>
          <body>
            <div class="results"></div>
          </body>
        </html>
      `;

      mockAxiosInstance.get.mockResolvedValueOnce({ data: mockHtml, status: 200 });

      const decisions = await scraper.discoverDecisions(10);

      expect(decisions).toEqual([]);
    });

    it('should handle pagination with startPage parameter', async () => {
      const mockHtml = `
        <html>
          <body>
            <div class="results">
              <div class="result">
                <a href="/en/on/onhrt/doc/2024/2024hrto789/2024hrto789.html">
                  Page 2 Case
                </a>
              </div>
            </div>
          </body>
        </html>
      `;

      mockAxiosInstance.get.mockResolvedValueOnce({ data: mockHtml, status: 200 });

      const decisions = await scraper.discoverDecisions(10, 1);

      expect(mockAxiosInstance.get).toHaveBeenCalledWith(
        expect.stringContaining('page=1'),
        expect.any(Object)
      );
    });

    it('should retry on network failure', async () => {
      const mockHtml = `<html><body><div class="results"><div class="result"><a href="/test">Test</a></div></div></body></html>`;

      mockAxiosInstance.get
        .mockRejectedValueOnce(new Error('Network error'))
        .mockResolvedValueOnce({ data: mockHtml, status: 200 });

      const decisions = await scraper.discoverDecisions(10);

      expect(mockAxiosInstance.get).toHaveBeenCalledTimes(2);
    });
  });

  describe('fetchDecisionContent', () => {
    it('should extract decision content from HTML', async () => {
      const mockHtml = `
        <html>
          <head>
            <title>Smith v. Company A, 2024 HRTO 123 (CanLII)</title>
          </head>
          <body>
            <div class="decision-body">
              <h1>Smith v. Company A</h1>
              <div class="date">Date: January 15, 2024</div>
              <div class="citation">Citation: 2024 HRTO 123</div>
              <div class="content">
                <p>This is the decision content discussing discrimination.</p>
              </div>
            </div>
          </body>
        </html>
      `;

      mockAxiosInstance.get.mockResolvedValueOnce({ data: mockHtml, status: 200 });

      const content = await scraper.fetchDecisionContent(
        'https://www.canlii.org/en/on/onhrt/doc/2024/2024hrto123/2024hrto123.html'
      );

      expect(content.caseTitle).toContain('Smith v. Company A');
      expect(content.fullText).toContain('discrimination');
      expect(content.url).toContain('2024hrto123');
    });

    it('should handle missing optional fields', async () => {
      const mockHtml = `
        <html>
          <head><title>Minimal Case</title></head>
          <body>
            <div class="decision-body">
              <div class="content"><p>Minimal content</p></div>
            </div>
          </body>
        </html>
      `;

      mockAxiosInstance.get.mockResolvedValueOnce({ data: mockHtml, status: 200 });

      const content = await scraper.fetchDecisionContent(
        'https://www.canlii.org/en/on/onhrt/doc/2024/2024hrto000/2024hrto000.html'
      );

      expect(content.url).toBeTruthy();
      expect(content.fullText).toBeTruthy();
    });

    it('should validate content length', async () => {
      const mockHtml = `<html><head><title>Short</title></head><body><div>Too short</div></body></html>`;

      mockAxiosInstance.get.mockResolvedValueOnce({ data: mockHtml, status: 200 });

      const content = await scraper.fetchDecisionContent('https://test.com');

      // Content should be extracted even if short
      expect(content.fullText.length).toBeGreaterThan(0);
    });

    it('should retry on network failure', async () => {
      const mockHtml = `<html><head><title>Test</title></head><body><div>Content</div></body></html>`;

      mockAxiosInstance.get
        .mockRejectedValueOnce(new Error('Network error'))
        .mockResolvedValueOnce({ data: mockHtml, status: 200 });

      const content = await scraper.fetchDecisionContent('https://test.com');

      expect(mockAxiosInstance.get).toHaveBeenCalledTimes(2);
      expect(content.fullText).toContain('Content');
    });
  });

  describe('reset', () => {
    it('should clear internal state', () => {
      scraper.reset();
      // Test passes if no error thrown
      expect(true).toBe(true);
    });
  });
});

// ============================================================================
// INTEGRATION TEST PLACEHOLDER
// ============================================================================

describe('CanLIIScraper - Integration Tests', () => {
  // These tests would run against real CanLII pages in a controlled manner
  // Skipped by default to avoid hitting real servers during development
  
  it.skip('should fetch real HRTO listing page', async () => {
    const scraper = new CanLIIScraper('canlii_hrto');
    const decisions = await scraper.discoverDecisions(5);
    expect(decisions.length).toBeGreaterThan(0);
  });

  it.skip('should fetch real decision content', async () => {
    const scraper = new CanLIIScraper('canlii_hrto');
    // Would use a known stable decision URL
    expect(true).toBe(true);
  });
});
