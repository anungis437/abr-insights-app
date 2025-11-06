/**
 * Demo Data Generator
 * 
 * Generates realistic synthetic tribunal decisions for testing the ingestion pipeline
 * without requiring actual web scraping or CanLII access.
 */

import type { DecisionLink, DecisionContent, SourceSystem } from '../types';

// ============================================================================
// DEMO TEMPLATES
// ============================================================================

const DEMO_APPLICANTS = [
  'John Smith',
  'Maria Garcia',
  'James Wilson',
  'Aisha Mohammed',
  'Wei Chen',
  'Fatima Hassan',
  'Michael Brown',
  'Sarah Johnson',
  'David Lee',
  'Amina Diallo',
];

const DEMO_RESPONDENTS = [
  'ABC Corporation',
  'XYZ Inc.',
  'City Transit Authority',
  'Provincial Health Services',
  'Tech Solutions Ltd.',
  'Retail Enterprises',
  'Manufacturing Co.',
  'Professional Services Inc.',
  'Educational Institution',
  'Government Agency',
];

const DEMO_ISSUES = [
  'discrimination based on race',
  'harassment in the workplace',
  'failure to accommodate',
  'reprisal for filing complaint',
  'constructive dismissal',
  'denial of service',
  'discriminatory hiring practices',
  'unequal treatment',
  'racist comments and behavior',
  'systemic discrimination',
];

const DEMO_GROUNDS = [
  'race',
  'colour',
  'ancestry',
  'place of origin',
  'ethnic origin',
  'citizenship',
  'creed',
  'disability',
];

const DEMO_OUTCOMES = [
  'Application allowed in part',
  'Application dismissed',
  'Application allowed',
  'Settlement reached',
  'Application withdrawn',
];

// ============================================================================
// GENERATOR FUNCTIONS
// ============================================================================

/**
 * Generates a random tribunal case number
 */
function generateCaseNumber(sourceSystem: SourceSystem, year: number): string {
  const tribunalCode = sourceSystem.includes('hrto') ? 'HRTO' 
    : sourceSystem.includes('chrt') ? 'CHRT'
    : sourceSystem.includes('bchrt') ? 'BCHRT'
    : sourceSystem.includes('abhr') ? 'AHRC'
    : sourceSystem.includes('skhr') ? 'SKHR'
    : sourceSystem.includes('mbhr') ? 'MBHR'
    : sourceSystem.includes('qctdp') ? 'QCTDP'
    : sourceSystem.includes('nshr') ? 'NSHR'
    : sourceSystem.includes('nbhr') ? 'NBHR'
    : 'DEMO';
  
  const caseNum = Math.floor(Math.random() * 900) + 100;
  return `${year} ${tribunalCode} ${caseNum}`;
}

/**
 * Generates a realistic decision text with anti-Black racism indicators
 */
function generateDecisionText(
  applicant: string,
  respondent: string,
  issue: string,
  ground: string,
  outcome: string,
  hasAntiBlackRacism: boolean
): string {
  // For anti-Black racism cases, use explicit keywords that will trigger the classifier
  const raceKeywords = hasAntiBlackRacism
    ? ['Black', 'African Canadian', 'of African descent', 'Caribbean', 'Afro-Canadian']
    : ['visible minority', 'person of colour', 'diverse background'];

  const keywords = raceKeywords[Math.floor(Math.random() * raceKeywords.length)];

  return `
# DECISION

## Parties

**Applicant:** ${applicant}
**Respondent:** ${respondent}

## Nature of Application

The Applicant filed a complaint alleging ${issue} contrary to the Human Rights Code. The complaint relates to alleged discrimination on the grounds of ${ground}.

## Facts

The Applicant, a ${keywords} individual, was employed by the Respondent from 2020 to 2023. The Applicant alleges that during their employment, they experienced ${issue}.

${hasAntiBlackRacism ? `
The evidence reveals a pattern of racial discrimination and anti-Black racism. Specifically, the Applicant testified that:

1. They were subjected to racial slurs and derogatory comments about being Black
2. They experienced racial profiling and discriminatory treatment based on their African heritage
3. They were treated differently than similarly situated white employees
4. They raised concerns about the anti-Black harassment but no action was taken
5. The situation escalated leading to a poisoned work environment with pervasive racism

The Respondent denies the allegations and argues that any adverse treatment was based on legitimate performance concerns unrelated to the Applicant's race or Black identity.
` : `
The Applicant presented evidence of differential treatment compared to colleagues. The Respondent maintains that all employment decisions were based on legitimate business reasons and performance metrics.
`}

## Analysis

${hasAntiBlackRacism ? `
After careful review of the evidence, including witness testimony and documentation, I find that the Applicant has established a prima facie case of anti-Black racism and racial discrimination. The pattern of treatment, the racist comments made, and the documented differential treatment based on the Applicant being Black support the conclusion that anti-Black racism was a significant factor in the adverse treatment experienced.

The test for racial discrimination is well-established: the Applicant must show that they possess a protected characteristic (here, being Black/African Canadian), experienced adverse treatment (harassment, discrimination, racial profiling), and that race was a factor in the treatment. All three elements are present here.

The evidence clearly demonstrates systemic anti-Black discrimination. The Respondent's explanations for the differential treatment are not credible in light of the documentary evidence showing racial bias and discriminatory conduct toward Black employees.
` : `
While I am sympathetic to the Applicant's concerns, the evidence does not establish that the protected ground was a factor in the treatment experienced. The Respondent has provided credible explanations for the employment decisions at issue.
`}

## Decision

${outcome}. ${hasAntiBlackRacism ? 'The Respondent is ordered to pay damages for injury to dignity in the amount of $15,000 and lost wages of $8,500. The Respondent shall also implement anti-discrimination training for all supervisory staff.' : ''}

## Remedy

${hasAntiBlackRacism ? `
The remedies ordered are designed to:
1. Compensate the Applicant for the injury to dignity suffered
2. Replace income lost due to the discriminatory conduct
3. Ensure systemic change to prevent future discrimination
` : 'No remedies are ordered as the application is dismissed.'}

Dated this 15th day of March, 2024

_________________________
Tribunal Member
`;
}

/**
 * Generates demo decision links
 */
export function generateDemoLinks(
  sourceSystem: SourceSystem,
  count: number = 10
): DecisionLink[] {
  const links: DecisionLink[] = [];
  const currentYear = new Date().getFullYear();

  for (let i = 0; i < count; i++) {
    const year = currentYear - Math.floor(Math.random() * 3); // Last 3 years
    const applicant = DEMO_APPLICANTS[Math.floor(Math.random() * DEMO_APPLICANTS.length)];
    const respondent = DEMO_RESPONDENTS[Math.floor(Math.random() * DEMO_RESPONDENTS.length)];
    const caseNumber = generateCaseNumber(sourceSystem, year);
    
    const month = Math.floor(Math.random() * 12) + 1;
    const day = Math.floor(Math.random() * 28) + 1;
    const date = `${year}-${month.toString().padStart(2, '0')}-${day.toString().padStart(2, '0')}`;

    links.push({
      url: `https://demo.tribunal.ca/decisions/${year}/${caseNumber.replace(/\s/g, '-')}`,
      title: `${applicant} v. ${respondent}`,
      date,
      preview: `Decision regarding discrimination complaint filed by ${applicant} against ${respondent}.`,
    });
  }

  return links;
}

/**
 * Generates a full demo decision content
 */
export function generateDemoContent(
  link: DecisionLink,
  sourceSystem: SourceSystem,
  shouldHaveAntiBlackRacism: boolean = Math.random() > 0.5 // 50% contain anti-Black racism
): DecisionContent {
  const applicant = link.title.split(' v. ')[0];
  const respondent = link.title.split(' v. ')[1] || DEMO_RESPONDENTS[0];
  const issue = DEMO_ISSUES[Math.floor(Math.random() * DEMO_ISSUES.length)];
  const ground = DEMO_GROUNDS[Math.floor(Math.random() * DEMO_GROUNDS.length)];
  const outcome = DEMO_OUTCOMES[Math.floor(Math.random() * DEMO_OUTCOMES.length)];

  const fullText = generateDecisionText(
    applicant,
    respondent,
    issue,
    ground,
    outcome,
    shouldHaveAntiBlackRacism
  );

  const tribunal = sourceSystem.includes('hrto') ? 'Human Rights Tribunal of Ontario'
    : sourceSystem.includes('chrt') ? 'Canadian Human Rights Tribunal'
    : sourceSystem.includes('bchrt') ? 'BC Human Rights Tribunal'
    : sourceSystem.includes('abhr') ? 'Alberta Human Rights Commission'
    : sourceSystem.includes('skhr') ? 'Saskatchewan Human Rights Commission'
    : sourceSystem.includes('mbhr') ? 'Manitoba Human Rights Commission'
    : sourceSystem.includes('qctdp') ? 'Quebec Human Rights Tribunal'
    : sourceSystem.includes('nshr') ? 'Nova Scotia Human Rights Commission'
    : sourceSystem.includes('nbhr') ? 'New Brunswick Human Rights Commission'
    : 'Demo Tribunal';

  const province = sourceSystem.includes('hrto') ? 'ON'
    : sourceSystem.includes('chrt') ? 'CA'
    : sourceSystem.includes('bchrt') ? 'BC'
    : sourceSystem.includes('abhr') ? 'AB'
    : sourceSystem.includes('skhr') ? 'SK'
    : sourceSystem.includes('mbhr') ? 'MB'
    : sourceSystem.includes('qctdp') ? 'QC'
    : sourceSystem.includes('nshr') ? 'NS'
    : sourceSystem.includes('nbhr') ? 'NB'
    : 'CA';

  return {
    url: link.url,
    htmlContent: `<div class="decision">${fullText.replace(/\n/g, '<br>')}</div>`,
    fullText,
    textLength: fullText.length,
    caseTitle: link.title,
    citation: link.title.split(' v. ')[0] ? 
      `${new Date(link.date || '2024-01-01').getFullYear()} ${tribunal.split(' ')[0].toUpperCase()} ${Math.floor(Math.random() * 900) + 100}` 
      : undefined,
    caseNumber: link.title,
    tribunal,
    province,
    decisionDate: link.date ? new Date(link.date) : undefined,
    applicant,
    respondent,
    language: 'en',
    documentType: 'decision',
  };
}

/**
 * Generates a complete set of demo decisions
 */
export function generateDemoDataset(
  sourceSystem: SourceSystem,
  count: number = 10,
  antiBlackRacismPercentage: number = 0.5
): Array<{ link: DecisionLink; content: DecisionContent; hasAntiBlackRacism: boolean }> {
  const links = generateDemoLinks(sourceSystem, count);
  
  return links.map((link, index) => {
    const shouldHaveAntiBlackRacism = (index / count) < antiBlackRacismPercentage;
    const content = generateDemoContent(link, sourceSystem, shouldHaveAntiBlackRacism);
    return { link, content, hasAntiBlackRacism: shouldHaveAntiBlackRacism };
  });
}
