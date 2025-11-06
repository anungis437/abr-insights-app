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
  // Black/African Canadian names (diverse origins)
  'Marcus Johnson',
  'Keisha Williams',
  'Kwame Osei',
  'Aminata Diallo',
  'Jamal Thompson',
  'Nia Baptiste',
  'Abebe Tesfaye',
  'Chantal Pierre',
  'Kofi Mensah',
  'Fatima Hassan',
  'Rasheed Clarke',
  'Imani Robinson',
  'Adebayo Ogunleye',
  'Zara Campbell',
  'Tyrone Davis',
  
  // Other diverse names (control cases)
  'Wei Chen',
  'Priya Sharma',
  'Maria Garcia',
  'Ahmed Hassan',
  'Sophie Lefebvre',
];

const DEMO_RESPONDENTS = [
  // Private sector
  'Global Financial Services Inc.',
  'MapleTech Solutions Ltd.',
  'Northern Retail Corporation',
  'Apex Manufacturing Co.',
  'Metropolitan Transit Authority',
  'Summit Healthcare Group',
  'Prestige Hotel & Hospitality',
  'Canadian Logistics Services',
  'Elite Professional Services',
  'Quantum Software Systems Inc.',
  
  // Public sector / institutions
  'Ministry of Community Services',
  'Provincial School Board',
  'Regional Police Service',
  'City Housing Authority',
  'Public Health Department',
];

const DEMO_ISSUES = [
  // Anti-Black racism specific
  'racial harassment and use of racial slurs targeting Black employees',
  'discriminatory denial of promotion based on anti-Black bias',
  'racial profiling and excessive surveillance of Black staff',
  'microaggressions and comments about Black hair and appearance',
  'exclusion from opportunities due to anti-Black stereotypes',
  'hostile work environment with pervasive anti-Black racism',
  'termination following complaints about racial discrimination',
  'failure to address systemic anti-Black discrimination',
  
  // General discrimination (control)
  'harassment in the workplace',
  'failure to accommodate disability',
  'denial of service based on protected grounds',
  'discriminatory hiring practices',
  'reprisal for filing human rights complaint',
  'constructive dismissal',
  'unequal treatment and conditions of employment',
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
  'sex',
  'age',
];

const DEMO_OUTCOMES = [
  'Application allowed - significant damages awarded',
  'Application allowed in part - limited remedies ordered',
  'Application dismissed - insufficient evidence',
  'Application dismissed - legitimate non-discriminatory reasons established',
  'Settlement reached - confidential terms',
  'Application withdrawn without prejudice',
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
 * Selects an appropriate applicant name for anti-Black racism cases
 */
function selectApplicantName(hasAntiBlackRacism: boolean): string {
  if (hasAntiBlackRacism) {
    // Use Black/African Canadian names (first 15 in the array)
    const blackNames = DEMO_APPLICANTS.slice(0, 15);
    return blackNames[Math.floor(Math.random() * blackNames.length)];
  } else {
    // Use any name including control cases
    return DEMO_APPLICANTS[Math.floor(Math.random() * DEMO_APPLICANTS.length)];
  }
}

/**
 * Selects an appropriate issue for the case type
 */
function selectIssue(hasAntiBlackRacism: boolean): string {
  if (hasAntiBlackRacism) {
    // Use anti-Black racism specific issues (first 8 in the array)
    const antiBlackIssues = DEMO_ISSUES.slice(0, 8);
    return antiBlackIssues[Math.floor(Math.random() * antiBlackIssues.length)];
  } else {
    // Use general discrimination issues (last 7 in the array)
    const generalIssues = DEMO_ISSUES.slice(8);
    return generalIssues[Math.floor(Math.random() * generalIssues.length)];
  }
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
  const raceIdentifiers = hasAntiBlackRacism
    ? [
        'Black',
        'African Canadian',
        'of African descent',
        'Caribbean Canadian',
        'Afro-Canadian',
        'Black person',
        'person of African heritage',
      ]
    : ['visible minority', 'person of colour', 'racialized person', 'diverse background'];

  const primaryIdentifier = raceIdentifiers[Math.floor(Math.random() * raceIdentifiers.length)];
  const secondaryIdentifier = hasAntiBlackRacism 
    ? raceIdentifiers[Math.floor(Math.random() * raceIdentifiers.length)]
    : primaryIdentifier;

  return `
# DECISION

## Parties

**Applicant:** ${applicant}
**Respondent:** ${respondent}

## Nature of Application

The Applicant filed a complaint alleging ${issue} contrary to the Human Rights Code. The complaint relates to alleged discrimination on the grounds of ${ground}.

## Facts

The Applicant, a ${primaryIdentifier} individual, was employed by the Respondent from 2020 to 2023. The Applicant alleges that during their employment, they experienced ${issue}.

${hasAntiBlackRacism ? `
The evidence reveals a clear pattern of racial discrimination and anti-Black racism. The Applicant, who identifies as ${secondaryIdentifier}, testified that:

1. They were subjected to racial slurs including the N-word and derogatory comments about being Black
2. They experienced racial profiling and discriminatory treatment based on their African heritage and Black identity
3. Supervisors made stereotypical comments about Black people being "aggressive" or "lazy"
4. They were treated differently than similarly situated white employees in terms of discipline and opportunities
5. They raised concerns about the anti-Black harassment and racist behavior, but management failed to take action
6. The situation escalated, creating a poisoned work environment with pervasive anti-Black racism and discrimination

The evidence includes witness testimony from colleagues who observed the racist treatment, as well as emails and text messages containing racial slurs and discriminatory language targeting the Applicant because they are Black.

The Respondent denies the allegations and argues that any adverse treatment was based on legitimate performance concerns unrelated to the Applicant's race or Black identity. However, the Respondent failed to provide credible explanations for the documented instances of racial discrimination.
` : `
The Applicant presented evidence of differential treatment compared to colleagues. The Applicant alleges that certain employment decisions adversely impacted them based on protected grounds under the Human Rights Code.

The Respondent maintains that all employment decisions were based on legitimate business reasons, objective performance metrics, and operational requirements unrelated to any protected characteristic.
`}

## Analysis

${hasAntiBlackRacism ? `
### Legal Framework

The test for establishing discrimination is well-established in Canadian human rights law. The Applicant must demonstrate, on a balance of probabilities, that: (1) they possess a characteristic protected under the Code (here, being Black/African Canadian/of African descent); (2) they experienced adverse treatment in employment; and (3) their protected characteristic was a factor in the adverse treatment.

### Application to Facts

After careful review of all evidence, including witness testimony, documentary evidence, and submissions from both parties, I find that the Applicant has established a prima facie case of anti-Black racism and racial discrimination.

**Protected Characteristic**: The Applicant is a ${secondaryIdentifier} person, which is protected under the grounds of race, colour, ancestry, and ethnic origin.

**Adverse Treatment**: The evidence clearly demonstrates that the Applicant experienced significant adverse treatment including: racial slurs (specifically targeting Black people), discriminatory discipline, denial of opportunities, and a poisoned work environment characterized by anti-Black racism.

**Nexus**: The evidence overwhelmingly establishes that the Applicant's Black identity and African heritage were central factors in the treatment they received. The use of racial slurs, stereotypical comments about Black people, and the differential treatment compared to white employees in similar circumstances all point to anti-Black discrimination as the motivating factor.

### Respondent's Defence

The Respondent's argument that the adverse treatment was based solely on performance issues is not credible given:
- The timing of performance concerns arising only after the Applicant complained about racism
- The lack of similar disciplinary action against white employees with comparable or worse performance
- The documented racist comments and behavior that preceded the alleged performance issues
- The failure to follow progressive discipline procedures

### Credibility

I find the Applicant to be a credible witness whose testimony was corroborated by documentary evidence and supporting witnesses. Conversely, the Respondent's witnesses provided inconsistent and evasive testimony regarding the instances of anti-Black racism.

### Conclusion on Liability

The evidence clearly demonstrates systemic anti-Black discrimination and a poisoned work environment created by pervasive anti-Black racism. The Applicant has proven, on a balance of probabilities, that they experienced racial discrimination based on their Black identity and African heritage, contrary to the Human Rights Code.
` : `
### Legal Framework

To succeed, the Applicant must establish on a balance of probabilities that their protected characteristic was a factor in the adverse treatment experienced.

### Application to Facts

While I am sympathetic to the Applicant's concerns about their treatment, the evidence before me does not establish the requisite nexus between the protected ground and the adverse treatment alleged.

The Respondent has provided credible, legitimate non-discriminatory explanations for the employment decisions at issue. The evidence supports that these decisions were based on objective business considerations and documented performance issues, not on any protected characteristic.

### Conclusion on Liability

The Applicant has not met their burden of proof. The application must therefore be dismissed.
`}

## Decision

${outcome}. ${hasAntiBlackRacism ? 'I find that the Respondent violated the Human Rights Code by engaging in discriminatory conduct based on race, specifically anti-Black racism and discrimination against the Applicant because of their Black identity and African heritage.' : 'I find that the Applicant has not established discrimination on a balance of probabilities.'}

## Remedy

${hasAntiBlackRacism ? `
Having found discrimination, I turn to the appropriate remedies. The purposes of remedial orders are to: (1) compensate the Applicant for losses suffered; (2) vindicate the Applicant's right to be free from discrimination; and (3) deter future discriminatory conduct.

### Damages for Injury to Dignity, Feelings and Self-Respect

The anti-Black racism and racial discrimination experienced by the Applicant was severe and prolonged. The use of racial slurs, stereotyping, and the creation of a poisoned work environment caused significant psychological harm. The Applicant testified credibly about the impact on their mental health, sense of self-worth, and career trajectory.

Considering comparable cases involving anti-Black racism and racial harassment, and the egregious nature of the conduct here, I award **$25,000** in damages for injury to dignity, feelings and self-respect.

### Compensation for Lost Wages

The Applicant was constructively dismissed as a result of the discriminatory treatment. Based on the evidence of the Applicant's salary and the period of unemployment attributable to the discrimination, I order compensation for lost wages in the amount of **$42,000**.

### Interest

The Respondent shall pay pre-judgment and post-judgment interest on all monetary awards in accordance with the Courts of Justice Act.

### Systemic Remedies

To address the systemic nature of the anti-Black racism and prevent future discrimination, I order:

1. **Anti-Racism Training**: The Respondent shall retain a qualified expert to develop and deliver mandatory anti-Black racism training for all employees, with enhanced training for managers and supervisors. This training must be completed within 6 months and repeated annually.

2. **Policy Review**: The Respondent shall review and revise its human rights, anti-discrimination, and harassment policies to explicitly address anti-Black racism and ensure robust complaint mechanisms.

3. **Monitoring**: The Respondent shall provide annual reports to the Tribunal for 3 years documenting compliance with these orders and any human rights complaints received.

### Summary of Orders

The Respondent shall:
- Pay the Applicant $25,000 for injury to dignity
- Pay the Applicant $42,000 for lost wages
- Pay interest on all amounts as ordered
- Implement mandatory anti-Black racism training
- Review and revise anti-discrimination policies
- Provide annual compliance reports

These orders are made pursuant to ss. 45.2 and 45.3 of the Human Rights Code.
` : `
As the application is dismissed, no remedies are ordered. Each party shall bear their own costs.
`}

## Conclusion

${hasAntiBlackRacism ? `
Anti-Black racism has no place in Canadian workplaces. The evidence in this case demonstrates a clear pattern of discriminatory conduct that violated the Applicant's fundamental human rights. The remedies ordered are designed to make the Applicant whole, vindicate their rights, and ensure that similar discrimination does not occur in the future.
` : `
While the Applicant's concerns about their treatment are noted, the evidence does not establish that discrimination occurred on the basis of a protected ground. The application is therefore dismissed.
`}

Dated this 15th day of March, 2024

_________________________
Tribunal Member
Human Rights Tribunal
`;
}

/**
 * Generates demo decision links
 */
export function generateDemoLinks(
  sourceSystem: SourceSystem,
  count: number = 10,
  antiBlackRacismPercentage: number = 0.5
): DecisionLink[] {
  const links: DecisionLink[] = [];
  const currentYear = new Date().getFullYear();

  for (let i = 0; i < count; i++) {
    const year = currentYear - Math.floor(Math.random() * 3); // Last 3 years
    const hasAntiBlackRacism = (i / count) < antiBlackRacismPercentage;
    const applicant = selectApplicantName(hasAntiBlackRacism);
    const respondent = DEMO_RESPONDENTS[Math.floor(Math.random() * DEMO_RESPONDENTS.length)];
    const caseNumber = generateCaseNumber(sourceSystem, year);
    const issue = selectIssue(hasAntiBlackRacism);
    
    const month = Math.floor(Math.random() * 12) + 1;
    const day = Math.floor(Math.random() * 28) + 1;
    const date = `${year}-${month.toString().padStart(2, '0')}-${day.toString().padStart(2, '0')}`;

    links.push({
      url: `https://demo.tribunal.ca/decisions/${year}/${caseNumber.replace(/\s/g, '-')}`,
      title: `${applicant} v. ${respondent}`,
      date,
      preview: `Decision regarding ${issue} in complaint filed by ${applicant} against ${respondent}.`,
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
  const issue = selectIssue(shouldHaveAntiBlackRacism);
  
  // For anti-Black racism cases, always use race-related grounds
  const ground = shouldHaveAntiBlackRacism 
    ? ['race', 'colour', 'ancestry', 'ethnic origin'][Math.floor(Math.random() * 4)]
    : DEMO_GROUNDS[Math.floor(Math.random() * DEMO_GROUNDS.length)];
  
  // For anti-Black racism cases, outcomes are more likely to be favorable to applicant
  const outcome = shouldHaveAntiBlackRacism
    ? DEMO_OUTCOMES[Math.floor(Math.random() * 3)] // First 3 outcomes include success
    : DEMO_OUTCOMES[Math.floor(Math.random() * DEMO_OUTCOMES.length)];

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
  const links = generateDemoLinks(sourceSystem, count, antiBlackRacismPercentage);
  
  return links.map((link, index) => {
    const shouldHaveAntiBlackRacism = (index / count) < antiBlackRacismPercentage;
    const content = generateDemoContent(link, sourceSystem, shouldHaveAntiBlackRacism);
    return { link, content, hasAntiBlackRacism: shouldHaveAntiBlackRacism };
  });
}
