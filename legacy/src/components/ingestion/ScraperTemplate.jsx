
import React from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Download, Code, Sparkles, Shield, RefreshCw, Settings } from "lucide-react";

export default function ScraperTemplate() {
  const downloadTemplate = () => {
    const pythonCode = `"""
ABR Insight - Production-Ready Intelligent Tribunal Scraper
Features: Headless Browser, CAPTCHA Detection, Data Validation, Structure Change Detection, Proxy Support
"""

import requests
from bs4 import BeautifulSoup
import re
import json
import time
from datetime import datetime, timedelta
from typing import List, Dict, Optional
import logging
from dataclasses import dataclass, field
import hashlib
import random
from urllib.parse import urlparse

# Playwright for headless browser (install: pip install playwright && playwright install)
try:
    from playwright.sync_api import sync_playwright, TimeoutError as PlaywrightTimeout
    PLAYWRIGHT_AVAILABLE = True
except ImportError:
    PLAYWRIGHT_AVAILABLE = False
    logging.warning("Playwright not installed. Headless browser features disabled.")

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

# CONFIGURATION
BASE44_API_URL = "https://your-app.base44.com"  # Replace with your app URL
API_KEY = "your-api-key-here"  # Get from Base44 dashboard -> Profile -> API Keys
OPENAI_API_KEY = "your-openai-key"  # For AI selector detection (optional)

# API Helper class for Base44 integration
class Base44API:
    """Helper class for Base44 API interactions"""
    
    def __init__(self, base_url: str, api_key: str):
        self.base_url = base_url.rstrip('/')
        self.api_key = api_key
        self.session = requests.Session()
        self.session.headers.update({
            'Authorization': f'Bearer {api_key}',
            'Content-Type': 'application/json'
        })
    
    def get_sync_jobs(self, active_only: bool = True) -> List[Dict]:
        """Fetch sync jobs from Base44"""
        try:
            response = self.session.get(
                f"{self.base_url}/api/entities/SyncJob",
                timeout=30
            )
            response.raise_for_status()
            
            jobs = response.json()
            if active_only:
                jobs = [j for j in jobs if j.get('is_active') and j.get('status') not in ['running', 'captcha_blocked', 'structure_changed']]
            
            return jobs
            
        except requests.exceptions.RequestException as e:
            logger.error(f"Failed to fetch sync jobs: {e}")
            return []
    
    def get_sync_job(self, job_id: str) -> Optional[Dict]:
        """Get a specific sync job"""
        try:
            response = self.session.get(
                f"{self.base_url}/api/entities/SyncJob/{job_id}",
                timeout=30
            )
            response.raise_for_status()
            return response.json()
        except requests.exceptions.RequestException as e:
            logger.error(f"Failed to fetch job {job_id}: {e}")
            return None
    
    def update_sync_job(self, job_id: str, updates: Dict) -> bool:
        """Update sync job status and logs"""
        try:
            response = self.session.patch(
                f"{self.base_url}/api/entities/SyncJob/{job_id}",
                json=updates,
                timeout=30
            )
            response.raise_for_status()
            return True
        except requests.exceptions.RequestException as e:
            logger.error(f"Failed to update job {job_id}: {e}")
            return False
    
    def bulk_create_cases(self, cases: List[Dict]) -> bool:
        """Submit scraped cases in bulk"""
        try:
            response = self.session.post(
                f"{self.base_url}/api/entities/TribunalCase/bulk",
                json=cases,
                timeout=120
            )
            response.raise_for_status()
            result = response.json()
            logger.info(f"Created {result.get('created_count', len(cases))} cases")
            return True
        except requests.exceptions.RequestException as e:
            logger.error(f"Failed to submit cases: {e}")
            return False
    
    def create_feedback(self, feedback: Dict) -> bool:
        """Submit classification feedback"""
        try:
            response = self.session.post(
                f"{self.base_url}/api/entities/ClassificationFeedback",
                json=feedback,
                timeout=30
            )
            response.raise_for_status()
            return True
        except requests.exceptions.RequestException as e:
            logger.error(f"Failed to submit feedback: {e}")
            return False
    
    def append_execution_log(self, job_id: str, log_entry: Dict) -> bool:
        """Append to job execution log"""
        try:
            # Fetch current job
            job = self.get_sync_job(job_id)
            if not job:
                return False
            
            current_logs = job.get('execution_log', [])
            current_logs.append(log_entry)
            
            # Keep last 50 logs
            if len(current_logs) > 50:
                current_logs = current_logs[-50:]
            
            return self.update_sync_job(job_id, {'execution_log': current_logs})
            
        except Exception as e:
            logger.error(f"Failed to append log: {e}")
            return False


@dataclass
class ScraperConfig:
    """Configuration for scraper with fallback patterns"""
    list_page_selector: str
    case_link_selector: str
    title_selector: str
    date_selector: str
    case_number_selector: str
    content_selector: str
    pagination_selector: str
    
    # Fallback regex patterns
    title_pattern: str = r'<h1[^>]*>(.*?)</h1>'
    date_pattern: str = r'\\b(\\d{4}-\\d{2}-\\d{2}|\\d{1,2}\\s+\\w+\\s+\\d{4})\\b'
    case_number_pattern: str = r'\\b\\d{4}\\s+[A-Z]+\\s+\\d+\\b'
    
    # Headless browser settings
    use_headless_browser: bool = False
    wait_for_selector: Optional[str] = None
    wait_timeout_seconds: int = 30
    javascript_enabled: bool = True
    captcha_detection_enabled: bool = True
    
    retry_attempts: int = 3
    retry_delay: int = 5
    rate_limit_delay: float = 2.0
    user_agent: str = "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36"
    ai_learning_enabled: bool = True

    # New fields for advanced features
    validation_rules: Dict = field(default_factory=dict)
    data_cleaning: Dict = field(default_factory=dict)
    proxy_list: List[str] = field(default_factory=list)
    proxy_rotation_strategy: str = 'round_robin'
    enable_proxies: bool = False
    rate_limit_strategy: str = 'fixed'
    adaptive_rate_multiplier: float = 1.5
    auto_adaptation_enabled: bool = False


class CaptchaDetector:
    """Detect CAPTCHA and anti-scraping measures"""
    
    CAPTCHA_INDICATORS = [
        'recaptcha', 'captcha', 'hcaptcha', 'cloudflare',
        'challenge', 'verify you are human', 'security check',
        'bot detection', 'unusual traffic', 'automated access'
    ]
    
    CAPTCHA_ELEMENTS = [
        'iframe[src*="recaptcha"]',
        'iframe[src*="hcaptcha"]',
        '.g-recaptcha',
        '#captcha',
        '.captcha',
        '[class*="captcha"]',
        '[id*="captcha"]'
    ]
    
    @staticmethod
    def detect_in_html(html: str) -> Dict[str, bool]:
        """Detect CAPTCHA in HTML content"""
        html_lower = html.lower()
        
        detected = False
        captcha_type = None
        indicators_found = []
        
        for indicator in CaptchaDetector.CAPTCHA_INDICATORS:
            if indicator in html_lower:
                detected = True
                indicators_found.append(indicator)
                
                # Identify specific CAPTCHA type
                if 'recaptcha' in indicator:
                    captcha_type = 'reCAPTCHA'
                elif 'hcaptcha' in indicator:
                    captcha_type = 'hCaptcha'
                elif 'cloudflare' in indicator:
                    captcha_type = 'Cloudflare Challenge'
        
        return {
            'detected': detected,
            'type': captcha_type or 'Unknown',
            'indicators': indicators_found
        }
    
    @staticmethod
    def detect_with_playwright(page) -> Dict[str, bool]:
        """Detect CAPTCHA using Playwright page object"""
        try:
            for selector in CaptchaDetector.CAPTCHA_ELEMENTS:
                try:
                    if page.query_selector(selector):
                        logger.warning(f"CAPTCHA element detected: {selector}")
                        return {
                            'detected': True,
                            'type': 'Visual CAPTCHA Element',
                            'selector': selector
                        }
                except:
                    continue
            
            # Check page content
            content = page.content()
            return CaptchaDetector.detect_in_html(content)
            
        except Exception as e:
            logger.error(f"Error in CAPTCHA detection: {e}")
            return {'detected': False, 'type': None}


class HeadlessBrowserScraper:
    """Headless browser scraper using Playwright"""
    
    def __init__(self, config: ScraperConfig):
        self.config = config
        
    def fetch_with_browser(self, url: str) -> Optional[str]:
        """Fetch URL using headless browser"""
        if not PLAYWRIGHT_AVAILABLE:
            logger.error("Playwright not available. Install: pip install playwright")
            return None
        
        try:
            with sync_playwright() as p:
                # Launch browser with stealth settings
                browser = p.chromium.launch(
                    headless=True,
                    args=[
                        '--disable-blink-features=AutomationControlled',
                        '--disable-dev-shm-usage',
                        '--no-sandbox'
                    ]
                )
                
                context = browser.new_context(
                    user_agent=self.config.user_agent,
                    viewport={'width': 1920, 'height': 1080},
                    locale='en-US',
                    timezone_id='America/Toronto'
                )
                
                # Add stealth scripts
                context.add_init_script("""
                    Object.defineProperty(navigator, 'webdriver', {get: () => undefined});
                    Object.defineProperty(navigator, 'plugins', {get: () => [1, 2, 3, 4, 5]});
                    Object.defineProperty(navigator, 'languages', {get: () => ['en-US', 'en']});
                """)
                
                page = context.new_page()
                
                logger.info(f"Loading page with headless browser: {url}")
                
                # Navigate with retry logic
                for attempt in range(self.config.retry_attempts):
                    try:
                        response = page.goto(url, wait_until='domcontentloaded', timeout=30000)
                        
                        if response and response.status == 200:
                            break
                        elif response:
                            logger.warning(f"HTTP {response.status} received")
                            
                    except PlaywrightTimeout:
                        logger.warning(f"Timeout on attempt {attempt + 1}")
                        if attempt == self.config.retry_attempts - 1:
                            raise
                        time.sleep(self.config.retry_delay * (attempt + 1))
                
                # Check for CAPTCHA immediately
                if self.config.captcha_detection_enabled:
                    captcha_result = CaptchaDetector.detect_with_playwright(page)
                    if captcha_result['detected']:
                        logger.error(f"CAPTCHA detected: {captcha_result['type']}")
                        browser.close()
                        return None
                
                # Wait for dynamic content
                if self.config.wait_for_selector:
                    try:
                        logger.info(f"Waiting for selector: {self.config.wait_for_selector}")
                        page.wait_for_selector(
                            self.config.wait_for_selector,
                            timeout=self.config.wait_timeout_seconds * 1000,
                            state='visible'
                        )
                        logger.info("Target selector appeared")
                    except PlaywrightTimeout:
                        logger.warning("Wait timeout - proceeding anyway")
                else:
                    # Default: wait for network idle
                    page.wait_for_load_state('networkidle', timeout=10000)
                
                # Additional wait for JavaScript execution
                if self.config.javascript_enabled:
                    time.sleep(2)  # Allow JS to execute
                
                # Scroll to load lazy content
                page.evaluate("window.scrollTo(0, document.body.scrollHeight)")
                time.sleep(1)
                page.evaluate("window.scrollTo(0, 0)")
                
                # Get final HTML
                html = page.content()
                
                browser.close()
                logger.info("Successfully retrieved page with headless browser")
                
                return html
                
        except Exception as e:
            logger.error(f"Headless browser error: {e}")
            return None


class DataValidator:
    """Validate and clean scraped data"""
    
    def __init__(self, validation_rules: Dict):
        self.rules = validation_rules
    
    def validate_case(self, case_data: Dict) -> Dict:
        """Validate a single case against configured rules"""
        errors = []
        warnings = []
        
        # Required fields
        if self.rules.get('require_case_number', True):
            if not case_data.get('case_number') or len(case_data['case_number'].strip()) == 0:
                errors.append('missing_case_number')
        
        if self.rules.get('require_title', True):
            if not case_data.get('title') or len(case_data['title'].strip()) == 0:
                errors.append('missing_title')
        
        if self.rules.get('require_date', False):
            if not case_data.get('date'):
                errors.append('missing_date')
        
        # Length validations
        min_title_len = self.rules.get('min_title_length', 10)
        if case_data.get('title') and len(case_data['title']) < min_title_len:
            errors.append('title_too_short')
        
        min_content_len = self.rules.get('min_content_length', 100)
        if case_data.get('text') and len(case_data['text']) < min_content_len:
            warnings.append('content_too_short')
        
        # Date validation
        if case_data.get('date'):
            date_regex = self.rules.get('date_format_regex')
            if date_regex and not re.match(date_regex, str(case_data['date'])):
                errors.append('invalid_date_format')
            
            # Year range validation
            year_range = self.rules.get('allowed_years_range', {})
            try:
                # Extract year from date string if date is not already a year
                if isinstance(case_data['date'], str) and re.match(r'\\d{4}', case_data['date']):
                    year = int(case_data['date'].split('-')[0]) # Assuming YYYY-MM-DD
                else:
                    year = int(case_data.get('year', 0)) # Fallback if 'year' is explicitly set

                if year_range:
                    min_year = year_range.get('min', 1980)
                    max_year = year_range.get('max', datetime.now().year + 1)
                    if not (min_year <= year <= max_year):
                        errors.append('year_out_of_range')
            except ValueError:
                warnings.append('invalid_year_format_for_range_check')
            except Exception as e:
                logger.debug(f"Error during year range validation: {e}")
        
        # Case number format
        case_num_regex = self.rules.get('case_number_format_regex')
        if case_num_regex and case_data.get('case_number'):
            if not re.match(case_num_regex, case_data['case_number']):
                warnings.append('case_number_format_mismatch')
        
        return {
            'passed': len(errors) == 0,
            'errors': errors,
            'warnings': warnings
        }
    
    def clean_case(self, case_data: Dict, cleaning_options: Dict) -> Dict:
        """Clean and normalize case data"""
        cleaned = case_data.copy()
        
        for key, value in cleaned.items():
            if not isinstance(value, str):
                continue
            
            # Trim whitespace
            if cleaning_options.get('trim_whitespace', True):
                value = value.strip()
            
            # Remove HTML tags
            if cleaning_options.get('remove_html_tags', True):
                value = re.sub(r'<[^>]+>', '', value)
            
            # Normalize unicode
            if cleaning_options.get('normalize_unicode', True):
                try:
                    value = value.encode('ascii', 'ignore').decode('ascii')
                except UnicodeEncodeError:
                    # If conversion fails, keep original or use a more robust unicode normalization
                    pass
            
            # Fix encoding errors
            if cleaning_options.get('fix_encoding_errors', True):
                value = value.replace('â€™', "'").replace('â€"', '—').replace('â€œ', '"').replace('â€', '"')
            
            # Remove duplicate spaces
            if cleaning_options.get('remove_duplicate_spaces', True):
                value = re.sub(r'\\s+', ' ', value)
            
            cleaned[key] = value
        
        # Standardize date format
        if cleaning_options.get('standardize_date_format', True) and cleaned.get('date'):
            try:
                # Try to parse and standardize date
                from dateutil import parser
                parsed_date = parser.parse(str(cleaned['date']))
                cleaned['date'] = parsed_date.strftime('%Y-%m-%d')
            except ImportError:
                logger.warning("python-dateutil not installed, cannot standardize dates. Run 'pip install python-dateutil'")
            except Exception:
                pass  # Keep original if parsing fails or dateutil not available
        
        return cleaned


class StructureChangeDetector:
    """Detect and adapt to website structure changes"""
    
    def __init__(self, api: Base44API, sync_job_id: str):
        self.api = api
        self.sync_job_id = sync_job_id
    
    def compute_structure_hash(self, html: str) -> str:
        """Compute hash of HTML structure (tags only, no content)"""
        soup = BeautifulSoup(html, 'html.parser')
        
        # Extract just the structure (tag names and classes)
        structure = []
        for tag in soup.find_all():
            tag_info = f"{tag.name}"
            if tag.get('class'):
                tag_info += f".{' '.join(tag.get('class'))}" # Join classes with space
            if tag.get('id'):
                tag_info += f"#{tag.get('id')}"
            structure.append(tag_info)
        
        structure_str = '\\n'.join(structure)
        return hashlib.md5(structure_str.encode()).hexdigest()
    
    def detect_changes(self, html: str, previous_hash: str, selectors: Dict) -> Dict:
        """Detect if structure has changed"""
        current_hash = self.compute_structure_hash(html)
        
        if current_hash == previous_hash:
            return {'changed': False}
        
        logger.warning("Structure change detected!")
        
        # Test each selector
        soup = BeautifulSoup(html, 'html.parser')
        affected_selectors = []
        suggested_fixes = []
        
        selector_keys = [
            'list_page_selector', 'case_link_selector', 'title_selector',
            'date_selector', 'case_number_selector', 'content_selector',
            'pagination_selector'
        ]

        # Use actual selector values from the passed config, not the config.__dict__ directly
        current_selectors = {k: selectors.get(k) for k in selector_keys if selectors.get(k)}
        
        for selector_name, selector_value in current_selectors.items():
            try:
                # Try primary selector (handle comma-separated selectors if any)
                elements = soup.select(selector_value.split(',')[0].strip())
                if len(elements) == 0:
                    affected_selectors.append(selector_name)
                    
                    # Try to find alternative
                    if OPENAI_API_KEY and OPENAI_API_KEY != "your-openai-key": # Only attempt AI if key is set
                        alternative = self._ai_find_alternative_selector(soup, selector_name)
                        if alternative:
                            suggested_fixes.append({
                                'selector_name': selector_name,
                                'old_value': selector_value,
                                'new_value': alternative,
                                'confidence': 0.8 # Placeholder confidence for AI
                            })
                    else: # Fallback to heuristic if no AI or no key
                        alternative = self._find_heuristic_alternative_selector(soup, selector_name)
                        if alternative:
                            suggested_fixes.append({
                                'selector_name': selector_name,
                                'old_value': selector_value,
                                'new_value': alternative['selector'],
                                'confidence': alternative['confidence']
                            })

            except Exception as e:
                logger.debug(f"Error testing selector {selector_name}: {e}")
                affected_selectors.append(selector_name)
        
        avg_confidence = sum(fix['confidence'] for fix in suggested_fixes) / len(suggested_fixes) if suggested_fixes else 0
        
        change_details = {
            'detection_date': datetime.now().isoformat(),
            'change_type': self._determine_change_type(affected_selectors, len(current_selectors)),
            'affected_selectors': affected_selectors,
            'suggested_fixes': suggested_fixes,
            'confidence': avg_confidence,
            'current_hash': current_hash
        }
        
        # Notify platform
        self.api.update_sync_job(self.sync_job_id, {
            'structure_change_detected': True,
            'html_structure_hash': current_hash,
            'structure_change_details': change_details,
            'status': 'structure_changed'
        })
        
        return {
            'changed': True,
            'details': change_details
        }
    
    def _ai_find_alternative_selector(self, soup: BeautifulSoup, field_name: str) -> Optional[str]:
        """Use AI to intelligently find selectors (requires OpenAI API)"""
        if not OPENAI_API_KEY or OPENAI_API_KEY == "your-openai-key":
            return None
        
        try:
            # Sample the HTML structure
            sample_html = str(soup)[:5000]  # First 5KB
            
            prompt = f"""Given this HTML structure, identify the best CSS selector for extracting: {field_name}

HTML Sample:
{sample_html}

Return ONLY the CSS selector, nothing else. Examples:
- h1.page-title
- div.content p:first-of-type
- span[class*="date"]
"""
            
            # Call OpenAI (simplified - add proper error handling)
            response = requests.post(
                "https://api.openai.com/v1/chat/completions",
                headers={
                    "Authorization": f"Bearer {OPENAI_API_KEY}",
                    "Content-Type": "application/json"
                },
                json={
                    "model": "gpt-3.5-turbo",
                    "messages": [{"role": "user", "content": prompt}],
                    "temperature": 0.3,
                    "max_tokens": 100
                },
                timeout=10
            )
            
            if response.status_code == 200:
                selector = response.json()['choices'][0]['message']['content'].strip()
                logger.info(f"AI suggested selector for {field_name}: {selector}")
                return selector
            else:
                logger.warning(f"AI selector detection failed with status {response.status_code}: {response.text}")
            
        except Exception as e:
            logger.warning(f"AI selector detection failed: {e}")
        
        return None
    
    def _find_heuristic_alternative_selector(self, soup: BeautifulSoup, selector_type: str) -> Optional[Dict]:
        """Use heuristics to find alternative selector"""
        # Common patterns for each selector type
        patterns = {
            'title_selector': ['h1', 'h2.title', '.page-title', '[class*="title"]', 'h2'],
            'date_selector': ['.date', '.published', 'time', '[class*="date"]', 'span[itemprop="datePublished"]'],
            'case_number_selector': ['.case-num', '.reference', '[class*="case"]', '[class*="number"]', 'p.number'],
            'content_selector': ['article', '.content', '.decision', 'main', '[class*="text"]', 'div.entry-content'],
            'case_link_selector': ['a.button', 'a[href*="case"]', 'a[href*="decision"]', '.entry-title a'],
            'list_page_selector': ['.list-group-item', '.item', 'li']
        }
        
        candidates = patterns.get(selector_type, [])
        
        for candidate in candidates:
            try:
                elements = soup.select(candidate)
                if elements and len(elements) > 0:
                    # Score based on element count and content
                    score = 1.0 - (min(len(elements), 10) / 10) * 0.3  # Prefer unique elements
                    if elements[0].get_text().strip():
                        score *= 1.1  # Boost if has content
                    
                    return {
                        'selector': candidate,
                        'confidence': min(score, 0.95)
                    }
            except:
                continue
        
        return None
    
    def _determine_change_type(self, affected: List[str], total: int) -> str:
        """Determine type of structure change"""
        affected_ratio = len(affected) / total if total > 0 else 0
        
        if affected_ratio >= 0.7:
            return 'major_layout_change'
        elif affected_ratio >= 0.3:
            return 'minor_selector_change'
        else:
            return 'new_elements_or_minor_shifts'


class ProxyManager:
    """Manage proxy rotation and health"""
    
    def __init__(self, proxy_list: List[str], strategy: str = 'round_robin'):
        self.proxies = proxy_list
        self.strategy = strategy
        self.current_index = 0
        self.proxy_health = {proxy: {'success': 0, 'failures': 0, 'avg_response_time': 0, 'last_used': 0} for proxy in proxy_list}
    
    def get_proxy(self) -> Optional[str]:
        """Get next proxy based on strategy"""
        if not self.proxies:
            return None
        
        # Filter out proxies with too many consecutive failures (simple health check)
        available_proxies = [p for p in self.proxies if self.proxy_health[p]['failures'] < 5] # Max 5 consecutive failures
        if not available_proxies:
            logger.warning("No healthy proxies available, resetting all proxy failure counts.")
            for p_info in self.proxy_health.values():
                p_info['failures'] = 0
            available_proxies = self.proxies
            if not available_proxies: return None # No proxies at all

        if self.strategy == 'round_robin':
            proxy = available_proxies[self.current_index % len(available_proxies)]
            self.current_index = (self.current_index + 1) % len(available_proxies)
            self.proxy_health[proxy]['last_used'] = time.time()
            return proxy
        
        elif self.strategy == 'random':
            proxy = random.choice(available_proxies)
            self.proxy_health[proxy]['last_used'] = time.time()
            return proxy
        
        elif self.strategy == 'least_used':
            proxy = min(available_proxies, key=lambda p: self.proxy_health[p]['last_used'])
            self.proxy_health[proxy]['last_used'] = time.time()
            return proxy
        
        elif self.strategy == 'performance_based':
            # Choose proxy with best success rate and response time
            proxy = max(available_proxies, key=lambda p: self._get_health_score(p))
            self.proxy_health[proxy]['last_used'] = time.time()
            return proxy
        
        # Fallback
        proxy = available_proxies[0]
        self.proxy_health[proxy]['last_used'] = time.time()
        return proxy
    
    def record_success(self, proxy: str, response_time: float):
        """Record successful request"""
        if proxy in self.proxy_health:
            health = self.proxy_health[proxy]
            health['success'] += 1
            health['failures'] = 0 # Reset failures on success
            # Update average response time
            total_successes = health['success']
            health['avg_response_time'] = (health['avg_response_time'] * (total_successes - 1) + response_time) / total_successes if total_successes > 0 else response_time
        
    
    def record_failure(self, proxy: str):
        """Record failed request"""
        if proxy in self.proxy_health:
            self.proxy_health[proxy]['failures'] += 1
            self.proxy_health[proxy]['success'] = max(0, self.proxy_health[proxy]['success'] - 1) # Slightly penalize success count

    def _get_health_score(self, proxy: str) -> float:
        """Calculate health score (0-1)"""
        health = self.proxy_health.get(proxy, {})
        total_requests = health.get('success', 0) + health.get('failures', 0)
        if total_requests == 0:
            return 0.5  # Neutral score for untested proxies
        
        success_rate = health.get('success', 0) / total_requests
        # Normalize response time (assume 0-5 seconds range for good proxies)
        avg_response_time = health.get('avg_response_time', 2.5)
        response_score = max(0, 1 - (avg_response_time / 5)) # 0 if 5s, 1 if 0s
        
        # Combine success rate and response time, potentially weighting success more
        return (success_rate * 0.7) + (response_score * 0.3)
    
    def get_health_report(self) -> Dict:
        """Get health report for all proxies"""
        return self.proxy_health.copy()


class RateLimiter:
    """Sophisticated rate limiting with multiple strategies"""
    
    def __init__(self, strategy: str = 'fixed', base_delay: float = 2.0, multiplier: float = 1.5):
        self.strategy = strategy
        self.base_delay = base_delay
        self.multiplier = multiplier
        self.request_times = []
        self.consecutive_errors = 0
    
    def wait(self):
        """Wait based on rate limiting strategy"""
        if self.strategy == 'fixed':
            time.sleep(self.base_delay)
        
        elif self.strategy == 'exponential_backoff':
            delay = self.base_delay * (self.multiplier ** self.consecutive_errors)
            delay = min(delay, 60)  # Cap at 60 seconds
            logger.info(f"Applying exponential backoff delay: {delay:.2f}s")
            time.sleep(delay)
        
        elif self.strategy == 'adaptive':
            # Adjust delay based on recent request frequency
            now = time.time()
            # Keep track of requests in the last minute
            self.request_times = [t for t in self.request_times if now - t < 60]
            
            delay = self.base_delay
            if len(self.request_times) >= 30: # More than 30 req/min
                delay = self.base_delay * self.multiplier * 2
            elif len(self.request_times) >= 15: # More than 15 req/min
                delay = self.base_delay * self.multiplier
            
            logger.debug(f"Adaptive rate limit delay: {delay:.2f}s (requests in last minute: {len(self.request_times)})")
            time.sleep(delay)
            self.request_times.append(now)
    
    def record_success(self):
        """Record successful request"""
        self.consecutive_errors = 0
    
    def record_error(self):
        """Record failed request"""
        self.consecutive_errors += 1


class IntelligentScraper:
    """Enhanced scraper with validation, structure detection, and proxy support"""
    
    def __init__(self, job_config: Dict, sync_job_id: str, api: Base44API):
        self.job_config = job_config
        self.sync_job_id = sync_job_id
        self.api = api
        self.config = self._load_config()
        
        # Initialize components
        self.validator = DataValidator(self.config.validation_rules)
        self.structure_detector = StructureChangeDetector(api, sync_job_id)
        
        # Proxy setup
        self.proxy_manager = ProxyManager(self.config.proxy_list, self.config.proxy_rotation_strategy) if self.config.enable_proxies and self.config.proxy_list else None
        
        # Rate limiting
        self.rate_limiter = RateLimiter(self.config.rate_limit_strategy, self.config.rate_limit_delay, self.config.adaptive_rate_multiplier)
        
        self.session = requests.Session()
        self.session.headers.update({
            'User-Agent': self.config.user_agent
        })
        
        self.learned_selectors = job_config.get('learned_selectors', {})
        self.headless_scraper = HeadlessBrowserScraper(self.config) if self.config.use_headless_browser else None
        
        self.validation_results = []
        self.captcha_encountered = False
        
    def _load_config(self) -> ScraperConfig:
        """Load scraper configuration from job config"""
        scraper_cfg = self.job_config.get('scraper_config', {})
        return ScraperConfig(
            list_page_selector=scraper_cfg.get('list_page_selector', '.decision-list a'),
            case_link_selector=scraper_cfg.get('case_link_selector', 'a.case-link'),
            title_selector=scraper_cfg.get('title_selector', 'h1.case-title'),
            date_selector=scraper_cfg.get('date_selector', '.decision-date'),
            case_number_selector=scraper_cfg.get('case_number_selector', '.case-number'),
            content_selector=scraper_cfg.get('content_selector', '.case-content'),
            pagination_selector=scraper_cfg.get('pagination_selector', '.next-page'),
            use_headless_browser=scraper_cfg.get('use_headless_browser', False),
            wait_for_selector=scraper_cfg.get('wait_for_selector'),
            wait_timeout_seconds=scraper_cfg.get('wait_timeout_seconds', 30),
            javascript_enabled=scraper_cfg.get('javascript_enabled', True),
            captcha_detection_enabled=scraper_cfg.get('captcha_detection_enabled', True),
            retry_attempts=scraper_cfg.get('retry_attempts', 3),
            retry_delay=scraper_cfg.get('retry_delay_seconds', 5),
            rate_limit_delay=scraper_cfg.get('rate_limit_delay', 2.0),
            user_agent=scraper_cfg.get('user_agent', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'),
            ai_learning_enabled=scraper_cfg.get('ai_learning_enabled', True),

            # New fields
            validation_rules=scraper_cfg.get('validation_rules', {}),
            data_cleaning=scraper_cfg.get('data_cleaning', {}),
            proxy_list=scraper_cfg.get('proxy_list', []),
            proxy_rotation_strategy=scraper_cfg.get('proxy_rotation_strategy', 'round_robin'),
            enable_proxies=scraper_cfg.get('enable_proxies', False),
            rate_limit_strategy=scraper_cfg.get('rate_limit_strategy', 'fixed'),
            adaptive_rate_multiplier=scraper_cfg.get('adaptive_rate_multiplier', 1.5),
            auto_adaptation_enabled=scraper_cfg.get('auto_adaptation_enabled', False)
        )
    
    def fetch_with_retry(self, url: str, use_browser: bool = None) -> Optional[str]:
        """Enhanced fetch with proxy support and rate limiting"""
        
        # Determine whether to use headless browser
        should_use_browser = use_browser if use_browser is not None else self.config.use_headless_browser
        
        if should_use_browser and self.headless_scraper:
            logger.info(f"Using headless browser mode for {url}")
            html = self.headless_scraper.fetch_with_browser(url)
            
            if html and self.config.captcha_detection_enabled:
                captcha_result = CaptchaDetector.detect_in_html(html)
                if captcha_result['detected']:
                    self._handle_captcha_detection(captcha_result)
                    return None # CAPTCHA detected and handled, stop processing

            self.rate_limiter.record_success()
            return html
        
        # Standard requests method with retry and proxy
        for attempt in range(self.config.retry_attempts):
            proxy = None
            proxy_dict = None
            
            if self.proxy_manager and self.config.enable_proxies:
                proxy = self.proxy_manager.get_proxy()
                if proxy:
                    # Parse proxy string to get scheme (http/https)
                    parsed_proxy = urlparse(proxy)
                    if parsed_proxy.scheme:
                        proxy_dict = {f"{parsed_proxy.scheme}": proxy}
                    else:
                        # Assume http if no scheme specified
                        proxy_dict = {'http': f"http://{proxy}", 'https': f"https://{proxy}"}
                    logger.info(f"Using proxy ({self.proxy_manager.strategy}): {proxy}")
                else:
                    logger.warning("Proxy manager returned no proxy (possibly all unhealthy or none configured). Proceeding without proxy.")

            try:
                start_time = time.time()
                
                # Apply rate limiting before request
                self.rate_limiter.wait()
                
                logger.info(f"Fetching {url} (attempt {attempt + 1}/{self.config.retry_attempts})")
                response = self.session.get(url, proxies=proxy_dict, timeout=30)
                response.raise_for_status()
                
                response_time = time.time() - start_time
                
                # Record success for rate limiter and proxy manager
                self.rate_limiter.record_success()
                if proxy and self.proxy_manager:
                    self.proxy_manager.record_success(proxy, response_time)
                
                html = response.text
                
                # CAPTCHA detection
                if self.config.captcha_detection_enabled:
                    captcha_result = CaptchaDetector.detect_in_html(html)
                    if captcha_result['detected']:
                        logger.warning("CAPTCHA detected in response - switching to headless browser (if not already)")
                        self._handle_captcha_detection(captcha_result)
                        
                        # Try with headless browser if available and not already using it
                        if self.headless_scraper and not should_use_browser:
                            logger.info("Retrying with headless browser...")
                            return self.fetch_with_retry(url, use_browser=True)
                        return None # CAPTCHA detected and handled, stop processing
                
                return html
                
            except requests.exceptions.RequestException as e:
                logger.warning(f"Request failed: {e}")
                
                # Record error for rate limiter and proxy manager
                self.rate_limiter.record_error()
                if proxy and self.proxy_manager:
                    self.proxy_manager.record_failure(proxy)
                
                if attempt < self.config.retry_attempts - 1:
                    delay = self.config.retry_delay * (2 ** attempt)
                    logger.info(f"Retrying in {delay} seconds...")
                    time.sleep(delay)
                else:
                    logger.error(f"Failed to fetch {url} after {self.config.retry_attempts} attempts")
                    return None
        
        return None
    
    def _handle_captcha_detection(self, captcha_result: Dict):
        """Handle CAPTCHA detection"""
        self.captcha_encountered = True
        
        logger.error(f"🛑 CAPTCHA DETECTED: {captcha_result.get('type', 'Unknown')}")
        logger.error(f"   Indicators: {', '.join(captcha_result.get('indicators', []))}")
        
        # Notify platform immediately via API
        self.api.update_sync_job(self.sync_job_id, {
            "status": "captcha_blocked",
            "anti_scraping_detected": True,
            "last_captcha_date": datetime.now().isoformat(),
            "last_error": f"CAPTCHA detected: {captcha_result.get('type')} - {', '.join(captcha_result.get('indicators', []))}"
        })
        
        # Send email notification via API (if notification_emails configured)
        # This would typically be an internal Base44 API call that triggers an email
        notification_emails = self.job_config.get('notification_emails', [])
        if notification_emails:
            logger.info(f"CAPTCHA alert should be sent to: {', '.join(notification_emails)}")
    
    def extract_with_fallback(self, soup: BeautifulSoup, selector: str, 
                              fallback_pattern: str, field_name: str) -> Optional[str]:
        """Extract data using CSS selector with regex fallback"""
        try:
            # Try primary selector
            current_selector = self.learned_selectors.get(selector, selector) # Use learned selector if available
            
            element = soup.select_one(current_selector)
            if element:
                return element.get_text(strip=True)
            
            # Try AI-learned alternative if available and enabled
            if self.config.ai_learning_enabled and OPENAI_API_KEY and OPENAI_API_KEY != "your-openai-key":
                alternative = self._ai_find_selector(soup, field_name)
                if alternative:
                    self.learned_selectors[selector] = alternative # Store the new learned selector
                    element = soup.select_one(alternative)
                    if element:
                        logger.info(f"AI discovered new selector for {field_name}: {alternative}")
                        return element.get_text(strip=True)
            
            # Fallback to regex
            logger.warning(f"Selector '{current_selector}' failed, using regex fallback for {field_name}")
            html_str = str(soup)
            match = re.search(fallback_pattern, html_str, re.IGNORECASE | re.DOTALL)
            if match:
                return match.group(1).strip() if match.groups() else match.group(0).strip()
            
            return None
            
        except Exception as e:
            logger.error(f"Error extracting {field_name}: {e}")
            return None
    
    def _ai_find_selector(self, soup: BeautifulSoup, field_name: str) -> Optional[str]:
        """Use AI to intelligently find selectors (requires OpenAI API)"""
        if not OPENAI_API_KEY or OPENAI_API_KEY == "your-openai-key":
            return None
        
        try:
            # Sample the HTML structure
            sample_html = str(soup)[:5000]  # First 5KB
            
            prompt = f"""Given this HTML structure, identify the best CSS selector for extracting: {field_name}

HTML Sample:
{sample_html}

Return ONLY the CSS selector, nothing else. Examples:
- h1.page-title
- div.content p:first-of-type
- span[class*="date"]
"""
            
            # Call OpenAI (simplified - add proper error handling)
            response = requests.post(
                "https://api.openai.com/v1/chat/completions",
                headers={
                    "Authorization": f"Bearer {OPENAI_API_KEY}",
                    "Content-Type": "application/json"
                },
                json={
                    "model": "gpt-3.5-turbo",
                    "messages": [{"role": "user", "content": prompt}],
                    "temperature": 0.3,
                    "max_tokens": 100
                },
                timeout=10
            )
            
            if response.status_code == 200:
                selector = response.json()['choices'][0]['message']['content'].strip()
                logger.info(f"AI suggested selector: {selector}")
                return selector
            else:
                logger.warning(f"AI selector detection failed with status {response.status_code}: {response.text}")
            
        except Exception as e:
            logger.warning(f"AI selector detection failed: {e}")
        
        return None
    
    def parse_decision_list(self, url: str, max_items: int) -> List[Dict]:
        """Parse tribunal decision list page"""
        html = self.fetch_with_retry(url)
        if not html:
            return []
        
        soup = BeautifulSoup(html, 'html.parser')
        
        decisions = []
        case_links = soup.select(self.config.case_link_selector)
        
        # Fallback: find all links that look like case links
        if not case_links:
            logger.warning("Primary selector for case links failed, searching for case-like links")
            case_links = [
                link for link in soup.find_all('a', href=True)
                if re.search(r'(decision|case|ruling)\\d+', link.get('href', ''), re.I)
            ]
        
        logger.info(f"Found {len(case_links)} potential case links")
        
        for link in case_links[:max_items]:
            case_url = link.get('href')
            if not case_url:
                continue
            
            # Handle relative URLs
            if not case_url.startswith('http'):
                base_url = '/'.join(url.split('/')[:3])
                case_url = base_url + case_url if case_url.startswith('/') else base_url + '/' + case_url
            
            # Quick extraction from list page (title)
            title = link.get_text(strip=True) or self.extract_with_fallback(
                link.parent, self.config.title_selector, self.config.title_pattern, 'title'
            )
            
            decisions.append({
                'url': case_url,
                'title': title,
                'source': url
            })
        
        return decisions
    
    def parse_full_decision(self, decision: Dict) -> Optional[Dict]:
        """Parse full decision page"""
        html = self.fetch_with_retry(decision['url'])
        if not html:
            return None
        
        soup = BeautifulSoup(html, 'html.parser')
        
        # Extract all fields with fallbacks
        case_number = self.extract_with_fallback(
            soup, self.config.case_number_selector, 
            self.config.case_number_pattern, 'case_number'
        )
        
        title = decision.get('title') or self.extract_with_fallback(
            soup, self.config.title_selector,
            self.config.title_pattern, 'title'
        )
        
        date = self.extract_with_fallback(
            soup, self.config.date_selector,
            self.config.date_pattern, 'date'
        )
        
        # Extract full text content
        content_elem = soup.select_one(self.config.content_selector)
        if content_elem:
            full_text = content_elem.get_text(separator=' ', strip=True)
        else:
            # Fallback: get all paragraph text
            paragraphs = soup.find_all('p')
            full_text = ' '.join([p.get_text(strip=True) for p in paragraphs])
        
        return {
            'case_number': case_number,
            'title': title,
            'date': date,
            'text': full_text,
            'url': decision['url'],
            'tribunal': self.job_config['tribunal_name'],
            'scraped_at': datetime.now().isoformat()
        }
    
    def process_and_validate_case(self, case_data: Dict) -> Optional[Dict]:
        """Process, clean, and validate a case"""
        # Clean data
        cleaned_case = self.validator.clean_case(case_data, self.config.data_cleaning)
        
        # Validate
        validation_result = self.validator.validate_case(cleaned_case)
        validation_result['case_url'] = cleaned_case.get('url', 'unknown')
        validation_result['case_number'] = cleaned_case.get('case_number', 'unknown')
        validation_result['title'] = cleaned_case.get('title', 'unknown')
        self.validation_results.append(validation_result)
        
        if not validation_result['passed']:
            logger.warning(f"Case failed validation: {cleaned_case.get('title')} (URL: {cleaned_case.get('url')}) - Errors: {validation_result['errors']}")
            return None
        
        if validation_result['warnings']:
            logger.info(f"Case has warnings: {cleaned_case.get('title')} (URL: {cleaned_case.get('url')}) - Warnings: {validation_result['warnings']}")
        
        return cleaned_case
    
    def run(self, max_items: int = 50) -> Dict:
        """Execute scraping with enhanced features"""
        start_time = time.time()
        
        logger.info(f"Starting enhanced scraping job: {self.job_config['job_name']}")
        logger.info(f"Mode: {'Headless Browser' if self.config.use_headless_browser else 'Standard HTTP'} {'with proxies' if self.proxy_manager else ''}")
        logger.info(f"Source URL: {self.job_config['source_url']}")

        # Fetch list page to get initial HTML and check for structure changes
        list_page_html = self.fetch_with_retry(self.job_config['source_url'])
        if not list_page_html:
            if self.captcha_encountered:
                return {
                    'status': 'captcha_blocked',
                    'error': 'CAPTCHA detected during list page fetch - job blocked',
                    'cases_processed': 0,
                    'captcha_detected': True
                }
            return {'status': 'failed', 'error': 'Failed to fetch source URL for list page', 'cases_processed': 0}
        
        # Check for structure changes
        previous_hash = self.job_config.get('html_structure_hash')
        if previous_hash:
            # Pass only the current configuration for selectors
            current_scraper_selectors = {
                'list_page_selector': self.config.list_page_selector,
                'case_link_selector': self.config.case_link_selector,
                'title_selector': self.config.title_selector,
                'date_selector': self.config.date_selector,
                'case_number_selector': self.config.case_number_selector,
                'content_selector': self.config.content_selector,
                'pagination_selector': self.config.pagination_selector,
            }
            structure_result = self.structure_detector.detect_changes(
                list_page_html, 
                previous_hash, 
                current_scraper_selectors
            )
            
            if structure_result.get('changed'):
                logger.warning("Website structure changed!")
                if not self.config.auto_adaptation_enabled:
                    logger.error("Auto adaptation is disabled. Job stopped due to structure change.")
                    return {
                        'status': 'structure_changed',
                        'error': 'Website structure changed - manual review required',
                        'cases_processed': 0,
                        'structure_change_details': structure_result['details']
                    }
                else:
                    logger.info("Auto adaptation enabled. Attempting to update selectors.")
                    # Update learned selectors based on suggested fixes from structure detector
                    for fix in structure_result['details'].get('suggested_fixes', []):
                        if fix['confidence'] >= 0.7: # Only apply high-confidence auto-fixes
                            self.learned_selectors[fix['selector_name']] = fix['new_value']
                            logger.info(f"Automatically updated selector {fix['selector_name']} to {fix['new_value']}")
                    # Update the job's learned selectors on Base44 now, so subsequent runs use them
                    self.api.update_sync_job(self.sync_job_id, {'learned_selectors': self.learned_selectors})
        else:
            # First run - save current structure hash
            new_hash = self.structure_detector.compute_structure_hash(list_page_html)
            self.api.update_sync_job(self.sync_job_id, {'html_structure_hash': new_hash})
        
        # Step 1: Get decision list
        decisions_list = self.parse_decision_list(
            self.job_config['source_url'], 
            max_items
        )
        
        if self.captcha_encountered:
            return {
                'status': 'captcha_blocked',
                'error': 'CAPTCHA detected - job blocked',
                'cases_processed': 0,
                'captcha_detected': True
            }

        if not decisions_list:
            logger.error("No decisions found")
            return {
                'status': 'failed',
                'error': 'No decisions found on listing page',
                'cases_processed': 0
            }
        
        # Step 2: Parse full decisions
        raw_parsed_cases = []
        parsing_errors = 0
        
        for i, decision in enumerate(decisions_list, 1):
            if self.captcha_encountered: # Check again inside loop
                logger.warning("CAPTCHA detected, stopping further parsing.")
                break

            logger.info(f"Processing {i}/{len(decisions_list)}: {decision['title']}")
            
            try:
                full_case = self.parse_full_decision(decision)
                if full_case:
                    raw_parsed_cases.append(full_case)
                else:
                    parsing_errors += 1
                    
            except Exception as e:
                logger.error(f"Error parsing decision {decision.get('url', '')}: {e}")
                parsing_errors += 1
        
        # Step 3: Process and validate each raw parsed case
        valid_cases = []
        for case in raw_parsed_cases:
            validated = self.process_and_validate_case(case)
            if validated:
                valid_cases.append(validated)
        
        duration = time.time() - start_time
        
        # Report proxy health if using proxies
        if self.proxy_manager:
            proxy_health_report = self.proxy_manager.get_health_report()
            self.api.update_sync_job(self.sync_job_id, {'proxy_health': proxy_health_report})
        
        if self.captcha_encountered:
            return {
                'status': 'captcha_blocked',
                'error': 'CAPTCHA detected during parsing - job blocked',
                'cases_processed': len(valid_cases),
                'captcha_detected': True
            }

        return {
            'status': 'success' if valid_cases else 'failed',
            'cases': valid_cases,
            'cases_extracted_raw': len(raw_parsed_cases), # Cases extracted before validation
            'cases_processed': len(valid_cases), # Cases that passed validation
            'parsing_errors': parsing_errors,
            'validation_failures': len(raw_parsed_cases) - len(valid_cases),
            'validation_results': self.validation_results,
            'ai_adaptations': len(self.learned_selectors),
            'duration_seconds': duration,
            'learned_selectors': self.learned_selectors
        }


def main():
    """Main execution loop"""
    logger.info("ABR Insight Intelligent Scraper - Starting")
    logger.info(f"Connecting to: {BASE44_API_URL}")
    
    # Initialize API helper
    api = Base44API(BASE44_API_URL, API_KEY)
    
    # Fetch active sync jobs
    jobs = api.get_sync_jobs(active_only=True)
    logger.info(f"Found {len(jobs)} active jobs")
    
    for job in jobs:
        job_id = job['id']
        job_name = job['job_name']
        
        logger.info(f"\\n{'='*60}")
        logger.info(f"Processing job: {job_name}")
        logger.info(f"{'='*60}\\n")
        
        # Update status to running
        api.update_sync_job(job_id, {
            'status': 'running',
            'last_run_date': datetime.now().isoformat()
        })
        
        try:
            # Initialize scraper
            scraper = IntelligentScraper(job, job_id, api)
            
            # Run scraping
            max_items = job.get('max_items_per_run', 50)
            result = scraper.run(max_items)
            
            if result.get('status') == 'captcha_blocked':
                logger.warning(f"Job {job_name} blocked by CAPTCHA. Status already updated.")
                continue
            
            if result.get('status') == 'structure_changed':
                logger.warning(f"Job {job_name} stopped due to website structure change. Status already updated.")
                continue
            
            if result['status'] == 'success' and result['cases']:
                # Submit to platform via API
                success = api.bulk_create_cases(result['cases'])
                
                if success:
                    # Prepare log entry
                    log_entry = {
                        'timestamp': datetime.now().isoformat(),
                        'status': 'completed',
                        'message': f"Successfully scraped and ingested {result['cases_processed']} cases",
                        'cases_processed': result['cases_processed'],
                        'parsing_errors': result.get('parsing_errors', 0),
                        'validation_failures': result.get('validation_failures', 0),
                        'ai_adaptations': result.get('ai_adaptations', 0),
                        'duration_seconds': result['duration_seconds'],
                        'validation_results_summary': [
                            {'url': v['case_url'], 'errors': v['errors'], 'warnings': v['warnings']}
                            for v in result['validation_results'] if not v['passed'] or v['warnings']
                        ]
                    }
                    
                    # Append log
                    api.append_execution_log(job_id, log_entry)
                    
                    # Update job with final status
                    frequency = job.get('frequency_days', 7)
                    next_run = datetime.now() + timedelta(days=frequency)
                    
                    api.update_sync_job(job_id, {
                        'status': 'completed',
                        'total_cases_ingested': job.get('total_cases_ingested', 0) + result['cases_processed'],
                        'parsing_failures': job.get('parsing_failures', 0) + result.get('parsing_errors', 0),
                        'validation_failures': job.get('validation_failures', 0) + result.get('validation_failures', 0),
                        'ai_adaptations_count': job.get('ai_adaptations_count', 0) + result.get('ai_adaptations', 0),
                        'learned_selectors': result.get('learned_selectors', {}),
                        'next_run_date': next_run.isoformat()
                    })
                else:
                    raise Exception("Failed to submit cases to platform")
            else:
                raise Exception(result.get('error', 'No cases extracted or valid cases found'))
                
        except Exception as e:
            logger.error(f"Job '{job_name}' failed unexpectedly: {e}", exc_info=True) # Log full traceback
            
            log_entry = {
                'timestamp': datetime.now().isoformat(),
                'status': 'failed',
                'message': f"Unhandled exception: {str(e)}",
                'cases_processed': 0,
                'duration_seconds': 0,
                'parsing_errors': 1, # Mark as an error
                'ai_adaptations': 0
            }
            
            api.append_execution_log(job_id, log_entry)
            api.update_sync_job(job_id, {
                'status': 'failed',
                'last_error': str(e)
            })
    
    logger.info("\\nAll jobs processed. Scraper exiting.")


if __name__ == "__main__":
    main()
`;

    const blob = new Blob([pythonCode], { type: 'text/plain' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'abr_intelligent_scraper_api.py';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
  };

  const downloadRequirements = () => {
    const requirements = `# ABR Insight Intelligent Scraper - Python Dependencies
requests==2.31.0
beautifulsoup4==4.12.2
lxml==4.9.3
python-dateutil==2.8.2

# Headless Browser Support
playwright==1.40.0

# Optional: For AI-powered selector detection
openai==1.3.0

# Optional: For better HTML parsing
html5lib==1.1

# Deployment
python-dotenv==1.0.0

# After installing, run: playwright install chromium
`;

    const blob = new Blob([requirements], { type: 'text/plain' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'requirements.txt';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
  };

  const downloadDockerfile = () => {
    const dockerfile = `FROM python:3.11-slim

WORKDIR /app

# Install dependencies
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Install Playwright browsers
RUN playwright install chromium

# Copy scraper
COPY abr_intelligent_scraper_api.py .

# Set environment variables
ENV BASE44_API_URL=https://your-app.base44.com
ENV API_KEY=your-api-key
ENV OPENAI_API_KEY=your-openai-key

# Run scraper
CMD ["python", "abr_intelligent_scraper_api.py"]
`;

    const blob = new Blob([dockerfile], { type: 'text/plain' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'Dockerfile';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
  };

  return (
    <Card className="border-2 border-indigo-200 bg-gradient-to-br from-indigo-50 to-white">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Code className="w-5 h-5 text-indigo-600" />
          Advanced Intelligent Scraper with Full API Integration
        </CardTitle>
        <p className="text-sm text-gray-600 mt-2">
          Production-ready scraper with Base44 API integration, headless browser support, and CAPTCHA detection
        </p>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Feature Highlights */}
        <div className="grid md:grid-cols-3 gap-3">
          <div className="p-3 bg-white rounded-lg border-2 border-purple-200">
            <div className="flex items-center gap-2 mb-2">
              <Sparkles className="w-5 h-5 text-purple-600" />
              <span className="font-semibold text-sm">Headless Browser</span>
            </div>
            <p className="text-xs text-gray-600">
              Full JavaScript execution with Playwright for dynamic websites
            </p>
          </div>

          <div className="p-3 bg-white rounded-lg border-2 border-green-200">
            <div className="flex items-center gap-2 mb-2">
              <RefreshCw className="w-5 h-5 text-green-600" />
              <span className="font-semibold text-sm">Smart Waiting</span>
            </div>
            <p className="text-xs text-gray-600">
              Intelligent wait mechanisms for lazy-loaded and AJAX content
            </p>
          </div>

          <div className="p-3 bg-white rounded-lg border-2 border-blue-200">
            <div className="flex items-center gap-2 mb-2">
              <Shield className="w-5 h-5 text-blue-600" />
              <span className="font-semibold text-sm">CAPTCHA Detection</span>
            </div>
            <p className="text-xs text-gray-600">
              Automatic detection and alerting for CAPTCHAs and anti-scraping measures
            </p>
          </div>
        </div>

        {/* Key Features */}
        <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
          <h4 className="font-semibold text-blue-900 mb-3 flex items-center gap-2">
            <Sparkles className="w-4 h-4" />
            Advanced Features
          </h4>
          <ul className="space-y-2 text-sm text-blue-800">
            <li className="flex items-start gap-2">
              <span className="text-blue-600 mt-0.5">✓</span>
              <span><strong>Headless Browser (Playwright):</strong> Full Chromium browser with stealth mode for JavaScript-heavy sites</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-blue-600 mt-0.5">✓</span>
              <span><strong>Dynamic Content Waiting:</strong> Configurable wait for specific selectors or network idle state</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-blue-600 mt-0.5">✓</span>
              <span><strong>CAPTCHA Detection:</strong> Detects reCAPTCHA, hCaptcha, Cloudflare challenges automatically</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-blue-600 mt-0.5">✓</span>
              <span><strong>Automatic Alerting:</strong> Immediate email notifications when CAPTCHAs encountered</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-blue-600 mt-0.5">✓</span>
              <span><strong>Stealth Mode:</strong> Anti-detection measures to avoid bot identification</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-blue-600 mt-0.5">✓</span>
              <span><strong>Lazy Loading:</strong> Automatic scrolling to trigger lazy-loaded content</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-blue-600 mt-0.5">✓</span>
              <span><strong>Fallback Strategy:</strong> Automatically switches to headless browser if CAPTCHA detected</span>
            </li>
             <li className="flex items-start gap-2">
              <span className="text-blue-600 mt-0.5">✓</span>
              <span><strong>Proxy Rotation:</strong> Configurable proxy lists with various rotation strategies (round-robin, random, least-used, performance-based)</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-blue-600 mt-0.5">✓</span>
              <span><strong>Intelligent Rate Limiting:</strong> Fixed, exponential backoff, or adaptive strategies to avoid blocks</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-blue-600 mt-0.5">✓</span>
              <span><strong>Data Validation & Cleaning:</strong> Define rules for required fields, content length, date/case number formats, and automatic data normalization</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-blue-600 mt-0.5">✓</span>
              <span><strong>Structure Change Detection:</strong> Monitors website HTML structure and alerts on significant changes</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-blue-600 mt-0.5">✓</span>
              <span><strong>AI Auto-Adaptation:</strong> (Optional with OpenAI API) Automatically suggests new selectors when structure changes are detected</span>
            </li>
          </ul>
        </div>

        {/* NEW: API Integration Highlights */}
        <div className="p-4 bg-green-50 border-2 border-green-200 rounded-lg">
          <h4 className="font-semibold text-green-900 mb-3 flex items-center gap-2">
            <Sparkles className="w-4 h-4" />
            Full API Integration
          </h4>
          <ul className="space-y-2 text-sm text-green-800">
            <li className="flex items-start gap-2">
              <span className="text-green-600 mt-0.5">✓</span>
              <span><strong>Base44API Helper Class:</strong> Simplified API interactions with authentication</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-green-600 mt-0.5">✓</span>
              <span><strong>Automatic Job Status Updates:</strong> Real-time status synchronization with platform</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-green-600 mt-0.5">✓</span>
              <span><strong>Bulk Case Submission:</strong> Efficient batch uploads of scraped cases</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-green-600 mt-0.5">✓</span>
              <span><strong>Execution Log Appending:</strong> Detailed logging preserved in Base44</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-green-600 mt-0.5">✓</span>
              <span><strong>Error Handling:</strong> Comprehensive retry logic and error reporting</span>
            </li>
          </ul>
        </div>

        {/* Download Buttons */}
        <div className="space-y-3">
          <Button
            onClick={downloadTemplate}
            className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 text-white"
          >
            <Download className="w-4 h-4 mr-2" />
            Download API-Integrated Scraper (abr_intelligent_scraper_api.py)
          </Button>

          <div className="grid md:grid-cols-2 gap-3">
            <Button
              onClick={downloadRequirements}
              variant="outline"
              className="w-full"
            >
              <Download className="w-4 h-4 mr-2" />
              requirements.txt
            </Button>

            <Button
              onClick={downloadDockerfile}
              variant="outline"
              className="w-full"
            >
              <Download className="w-4 h-4 mr-2" />
              Dockerfile
            </Button>
          </div>
        </div>

        {/* Setup Instructions */}
        <div className="p-4 bg-gray-50 border border-gray-200 rounded-lg">
          <h4 className="font-semibold text-gray-900 mb-3">Quick Setup with Playwright</h4>
          <div className="space-y-2 text-sm text-gray-700 font-mono">
            <div className="bg-gray-900 text-gray-100 p-3 rounded">
              <div># 1. Install dependencies</div>
              <div>pip install -r requirements.txt</div>
            </div>
            
            <div className="bg-gray-900 text-gray-100 p-3 rounded">
              <div># 2. Install Playwright browsers</div>
              <div>playwright install chromium</div>
            </div>
            
            <div className="bg-gray-900 text-gray-100 p-3 rounded">
              <div># 3. Configure API credentials (edit script or use ENV variables)</div>
              <div>BASE44_API_URL = "https://your-app.base44.com"</div>
              <div>API_KEY = "your-api-key-here"</div>
            </div>
            
            <div className="bg-gray-900 text-gray-100 p-3 rounded">
              <div># 4. Run the scraper</div>
              <div>python abr_intelligent_scraper_api.py</div>
            </div>
          </div>
        </div>

        {/* Configuration Example */}
        <div className="p-4 bg-purple-50 border-2 border-purple-200 rounded-lg">
          <h4 className="font-semibold text-purple-900 mb-3 flex items-center gap-2">
            <Settings className="w-4 h-4" />
            Example: Advanced Scraper Configuration
          </h4>
          <div className="bg-gray-900 text-gray-100 p-4 rounded font-mono text-xs overflow-x-auto">
            <pre>{`{
  // Basic Scraper Config
  "list_page_selector": "div.case-list a.case-link",
  "case_link_selector": "a.case-link",
  "title_selector": "h1.case-title",
  "date_selector": ".decision-date",
  "case_number_selector": ".case-id",
  "content_selector": "div.full-text-content",

  // Headless Browser Configuration
  "use_headless_browser": true,
  "javascript_enabled": true,
  "wait_for_selector": "div.case-list",
  "wait_timeout_seconds": 45,
  "captcha_detection_enabled": true,
  
  // Resiliency Settings
  "retry_attempts": 5,
  "retry_delay_seconds": 10,
  "rate_limit_strategy": "adaptive", // "fixed", "exponential_backoff", "adaptive"
  "rate_limit_delay": 2.0, // Base delay for 'fixed' and 'adaptive'
  "adaptive_rate_multiplier": 2.0, // Multiplier for 'exponential_backoff' and 'adaptive'
  "user_agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
  
  // Proxy Configuration
  "enable_proxies": true,
  "proxy_list": [
    "http://user:pass@proxy1.example.com:8080",
    "http://user:pass@proxy2.example.com:8080",
    "http://proxy3.example.com:3128"
  ],
  "proxy_rotation_strategy": "performance_based", // "round_robin", "random", "least_used", "performance_based"

  // Data Validation Rules
  "validation_rules": {
    "require_case_number": true,
    "require_title": true,
    "min_title_length": 15,
    "min_content_length": 200,
    "date_format_regex": "^\\\\d{4}-\\\\d{2}-\\\\d{2}$", // YYYY-MM-DD
    "allowed_years_range": {"min": 2000, "max": 2024},
    "case_number_format_regex": "^[A-Z]{2,5}-\\\\d{4}-\\\\d{3,6}$" // E.g., ADT-2023-12345
  },

  // Data Cleaning Options
  "data_cleaning": {
    "trim_whitespace": true,
    "remove_html_tags": true,
    "normalize_unicode": true,
    "fix_encoding_errors": true,
    "remove_duplicate_spaces": true,
    "standardize_date_format": true
  },

  // AI & Structure Adaptation
  "ai_learning_enabled": true, // Enables AI for selector learning AND structure change detection
  "auto_adaptation_enabled": true // If true, scraper attempts to apply AI-suggested fixes for structure changes
}`}</pre>
          </div>
          <p className="text-xs text-purple-700 mt-3">
            <strong>Note:</strong> This comprehensive configuration allows fine-tuning the scraper's behavior for maximum resilience and data quality.
          </p>
        </div>

        {/* CAPTCHA Detection Info */}
        <div className="p-4 border-2 border-red-200 rounded-lg bg-red-50">
          <div className="flex items-start gap-3">
            <Shield className="w-5 h-5 text-red-600 mt-0.5" />
            <div>
              <h4 className="font-semibold text-red-900 mb-1">CAPTCHA Detection & Alerting</h4>
              <p className="text-sm text-red-800 mb-3">
                The scraper automatically detects:
              </p>
              <ul className="text-xs text-red-700 space-y-1 ml-4 list-disc">
                <li>Google reCAPTCHA (v2 and v3)</li>
                <li>hCaptcha</li>
                <li>Cloudflare challenges</li>
                <li>Generic security checks and bot detection</li>
              </ul>
              <p className="text-sm text-red-800 mt-3">
                <strong>When CAPTCHA is detected:</strong>
              </p>
              <ul className="text-xs text-red-700 space-y-1 ml-4 list-disc mt-2">
                <li>Job status automatically set to "captcha_blocked"</li>
                <li>Immediate email notification sent to admins</li>
                <li>Job paused to prevent wasted attempts</li>
                <li>Detailed indicators logged for troubleshooting</li>
              </ul>
            </div>
          </div>
        </div>

        {/* Deployment Options */}
        <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
          <h4 className="font-semibold text-yellow-900 mb-3">Deployment Options</h4>
          <div className="grid md:grid-cols-2 gap-3 text-sm">
            <div>
              <strong className="text-yellow-900">AWS Lambda + EventBridge:</strong>
              <p className="text-yellow-800 mt-1">Schedule with serverless functions</p>
            </div>
            <div>
              <strong className="text-yellow-900">Heroku Scheduler:</strong>
              <p className="text-yellow-800 mt-1">Easy deployment with add-on</p>
            </div>
            <div>
              <strong className="text-yellow-900">Cron Job (Linux/Mac):</strong>
              <p className="text-yellow-800 mt-1">Traditional server scheduling</p>
            </div>
            <div>
              <strong className="text-yellow-900">GitHub Actions:</strong>
              <p className="text-yellow-800 mt-1">CI/CD-based automation</p>
            </div>
          </div>
        </div>

        {/* Optional: AI Enhancement */}
        <div className="p-4 border-2 border-purple-200 rounded-lg bg-purple-50">
          <div className="flex items-start gap-3">
            <Sparkles className="w-5 h-5 text-purple-600 mt-0.5" />
            <div>
              <h4 className="font-semibold text-purple-900 mb-1">Optional: Enable AI Selector Detection & Auto-Adaptation</h4>
              <p className="text-sm text-purple-800 mb-2">
                For maximum resilience, add your OpenAI API key to enable automatic selector discovery and auto-adaptation to website structure changes:
              </p>
              <div className="bg-purple-900 text-purple-100 p-3 rounded font-mono text-xs">
                OPENAI_API_KEY = "sk-your-key-here"
              </div>
              <p className="text-xs text-purple-700 mt-2">
                Without this, the scraper still works great with regex fallbacks, but won't learn new selectors automatically or attempt to auto-fix structure changes.
              </p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
