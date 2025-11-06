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

// French names for Quebec cases
const DEMO_APPLICANTS_FR = [
  // Black/African French names
  'Marcus Dubois',
  'Keisha Tremblay',
  'Kwame N\'Diaye',
  'Aminata Cissé',
  'Jamal Beaumont',
  'Nia Jean-Baptiste',
  'Abebe Lemieux',
  'Chantal Pierre-Louis',
  'Kofi Sanogo',
  'Fatima Diallo',
  
  // Other French names (control)
  'Wei Chen',
  'Priya Kumar',
  'Maria Fernandez',
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

// Intersectional discrimination combinations
const INTERSECTIONAL_GROUNDS = [
  { primary: 'race', secondary: 'disability', description: 'Black person with disability facing compounded discrimination' },
  { primary: 'race', secondary: 'sex', description: 'Black woman experiencing both racial and gender discrimination' },
  { primary: 'race', secondary: 'age', description: 'older Black employee facing age and racial discrimination' },
  { primary: 'race', secondary: 'creed', description: 'Black Muslim facing religious and racial discrimination' },
  { primary: 'race', secondary: 'ancestry', description: 'African immigrant facing xenophobic and anti-Black racism' },
];

// Outcome types for different resolution methods
type OutcomeType = 'decision' | 'settlement' | 'mediation' | 'withdrawal' | 'consent_order';

interface OutcomeTemplate {
  type: OutcomeType;
  description: string;
  hasRemedies: boolean;
}

const OUTCOME_TEMPLATES: OutcomeTemplate[] = [
  // Decisions (adjudicated)
  { type: 'decision', description: 'Application allowed - significant damages awarded', hasRemedies: true },
  { type: 'decision', description: 'Application allowed in part - limited remedies ordered', hasRemedies: true },
  { type: 'decision', description: 'Application dismissed - insufficient evidence', hasRemedies: false },
  { type: 'decision', description: 'Application dismissed - legitimate non-discriminatory reasons', hasRemedies: false },
  
  // Settlements (negotiated resolution)
  { type: 'settlement', description: 'Matter resolved through settlement agreement', hasRemedies: true },
  { type: 'settlement', description: 'Confidential settlement reached by parties', hasRemedies: true },
  
  // Mediation (facilitated resolution)
  { type: 'mediation', description: 'Mediation successful - parties reached agreement', hasRemedies: true },
  
  // Withdrawals (applicant discontinued)
  { type: 'withdrawal', description: 'Application withdrawn with compensation', hasRemedies: true },
  { type: 'withdrawal', description: 'Application withdrawn without prejudice', hasRemedies: false },
  
  // Consent orders (parties agree, tribunal approves)
  { type: 'consent_order', description: 'Consent order approved by Tribunal', hasRemedies: true },
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
 * Generates a French language decision for Quebec tribunal
 */
function generateFrenchDecisionText(
  applicant: string,
  respondent: string,
  issue: string,
  ground: string,
  outcome: string,
  hasAntiBlackRacism: boolean,
  intersectionalGrounds?: { primary: string; secondary: string; description: string },
  outcomeType: OutcomeType = 'decision',
  partialSuccess: boolean = false
): string {
  const raceIdentifiers = hasAntiBlackRacism
    ? ['Noir', 'Noire', 'personne noire', 'd\'origine africaine', 'd\'ascendance africaine', 'Afro-Canadien', 'Canadien noir']
    : ['minorité visible', 'personne racisée', 'origine diverse'];

  const primaryIdentifier = raceIdentifiers[Math.floor(Math.random() * raceIdentifiers.length)];

  return `
# DÉCISION

## Parties

**Plaignant:** ${applicant}
**Défendeur:** ${respondent}

## Nature de la plainte

Le plaignant a déposé une plainte alléguant ${issue} contraire à la Charte des droits et libertés de la personne. La plainte concerne une discrimination fondée sur ${ground === 'race' ? 'la race' : 'des motifs protégés'}.

## Faits

Le plaignant, une personne ${primaryIdentifier}, était employé par le défendeur de 2020 à 2023. Le plaignant allègue avoir subi ${issue} durant son emploi.

${hasAntiBlackRacism ? `
La preuve révèle un pattern clair de discrimination raciale et de racisme anti-Noir. Le plaignant, qui s'identifie comme ${primaryIdentifier}, a témoigné qu'il/elle a :

1. Été victime d'insultes raciales et de commentaires désobligeants ciblant les personnes noires
2. Subi du profilage racial et un traitement discriminatoire basé sur son origine africaine et son identité noire
3. Fait l'objet de stéréotypes concernant les personnes noires
4. Été traité différemment des employés blancs dans des situations similaires
5. Signalé ces incidents de racisme, mais la direction n'a pas pris de mesures appropriées
6. Vécu dans un environnement de travail empoisonné par le racisme anti-Noir systémique

La preuve comprend des témoignages de collègues qui ont observé le traitement raciste, ainsi que des courriels contenant un langage discriminatoire ciblant le plaignant en raison de sa race et de son identité noire.
` : `
Le plaignant a présenté des preuves de traitement différentiel par rapport à ses collègues. Le plaignant allègue que certaines décisions d'emploi l'ont affecté négativement en raison de motifs protégés par la Charte.
`}

## Analyse

${hasAntiBlackRacism ? `
### Cadre juridique

Le test pour établir la discrimination est bien établi en droit québécois. Le plaignant doit démontrer, selon la prépondérance des probabilités, que : (1) il possède une caractéristique protégée par la Charte (ici, être une personne noire/d'origine africaine); (2) il a subi un traitement préjudiciable; et (3) sa caractéristique protégée était un facteur dans le traitement préjudiciable.

### Application aux faits

Après un examen attentif de toute la preuve, je conclus que le plaignant a établi une preuve prima facie de racisme anti-Noir et de discrimination raciale.

**Caractéristique protégée**: Le plaignant est une personne ${primaryIdentifier}, ce qui est protégé par la Charte.

**Traitement préjudiciable**: La preuve démontre clairement que le plaignant a subi un traitement préjudiciable important, incluant des insultes raciales, une discipline discriminatoire, et un environnement de travail empoisonné.

**Lien de causalité**: La preuve établit de façon prépondérante que l'identité noire du plaignant était un facteur central dans le traitement reçu.

### Conclusion sur la responsabilité

La preuve démontre clairement une discrimination systémique anti-Noire et un environnement de travail empoisonné par le racisme. Le plaignant a prouvé, selon la prépondérance des probabilités, qu'il a été victime de discrimination raciale fondée sur son identité noire, contrairement à la Charte.
` : `
Bien que je sois sympathique aux préoccupations du plaignant, la preuve devant moi n'établit pas le lien requis entre le motif protégé et le traitement préjudiciable allégué.
`}

## Décision

${outcome}. ${hasAntiBlackRacism ? 'Je conclus que le défendeur a violé la Charte en se livrant à une conduite discriminatoire fondée sur la race, spécifiquement le racisme anti-Noir.' : 'Je conclus que le plaignant n\'a pas établi la discrimination selon la prépondérance des probabilités.'}

## Réparation

${hasAntiBlackRacism ? `
### Dommages moraux

Le racisme anti-Noir et la discrimination raciale subis par le plaignant étaient graves et prolongés. Je condamne le défendeur à payer au plaignant la somme de **25 000 $** à titre de dommages moraux.

### Dommages matériels

Le plaignant a perdu son emploi en raison du traitement discriminatoire. J'ordonne une compensation pour perte de salaire de **42 000 $**.

### Mesures systémiques

Pour prévenir la discrimination future, j'ordonne :

1. **Formation antiracisme**: Formation obligatoire sur le racisme anti-Noir pour tous les employés
2. **Révision des politiques**: Révision des politiques de droits de la personne
3. **Surveillance**: Rapports annuels au Tribunal pendant 3 ans
` : `
La plainte étant rejetée, aucune réparation n'est ordonnée.
`}

## Conclusion

${hasAntiBlackRacism ? `
Le racisme anti-Noir n'a pas sa place dans les milieux de travail québécois. Les mesures ordonnées visent à réparer le préjudice subi et à prévenir la discrimination future.
` : `
Bien que les préoccupations du plaignant soient notées, la preuve n'établit pas qu'il y a eu discrimination. La plainte est donc rejetée.
`}

Fait le 15 mars 2024

_________________________
Membre du Tribunal
Tribunal des droits de la personne du Québec
`;
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
  hasAntiBlackRacism: boolean,
  intersectionalGrounds?: { primary: string; secondary: string; description: string },
  outcomeType: OutcomeType = 'decision',
  language: 'en' | 'fr' = 'en',
  partialSuccess: boolean = false
): string {
  if (language === 'fr') {
    return generateFrenchDecisionText(applicant, respondent, issue, ground, outcome, hasAntiBlackRacism, intersectionalGrounds, outcomeType, partialSuccess);
  }
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

  // Generate document title based on outcome type
  const docTitle = outcomeType === 'settlement' ? 'MINUTES OF SETTLEMENT'
    : outcomeType === 'mediation' ? 'MEDIATION AGREEMENT'
    : outcomeType === 'withdrawal' ? 'NOTICE OF WITHDRAWAL'
    : outcomeType === 'consent_order' ? 'CONSENT ORDER'
    : 'DECISION';

  // Add intersectional discrimination context if applicable
  const intersectionalContext = intersectionalGrounds ? `
The case involves intersectional discrimination. The Applicant is a ${primaryIdentifier} individual who also has ${intersectionalGrounds.secondary} as a protected characteristic. The Applicant alleges experiencing compounded discrimination based on both ${intersectionalGrounds.primary} and ${intersectionalGrounds.secondary}, which created unique barriers and disadvantages not experienced by those with only one protected characteristic.

Research on intersectionality demonstrates that discrimination based on multiple grounds is not simply additive, but creates distinct forms of disadvantage. In this case, the Applicant's experiences as a ${intersectionalGrounds.description} must be understood in their full context.
` : '';

  // Settlement/mediation specific content
  if (outcomeType === 'settlement' || outcomeType === 'mediation' || outcomeType === 'consent_order') {
    return `
# ${docTitle}

## Parties

**Applicant:** ${applicant}
**Respondent:** ${respondent}

## Background

The Applicant filed a complaint with the Tribunal alleging ${issue} contrary to the Human Rights Code, on the grounds of ${ground}${intersectionalGrounds ? ` and ${intersectionalGrounds.secondary}` : ''}.

${intersectionalContext}

## ${outcomeType === 'settlement' ? 'Settlement Terms' : outcomeType === 'mediation' ? 'Mediated Resolution' : 'Agreed Terms'}

The parties have ${outcomeType === 'settlement' ? 'negotiated a settlement' : outcomeType === 'mediation' ? 'participated in mediation facilitated by the Tribunal and' : 'agreed to the following terms, which the Tribunal'} ${outcomeType === 'consent_order' ? 'hereby approves as a consent order' : 'reached the following agreement'}:

${hasAntiBlackRacism ? `
### 1. Acknowledgment

The Respondent acknowledges that the Applicant, a ${primaryIdentifier} individual${intersectionalGrounds ? ` with ${intersectionalGrounds.secondary}` : ''}, experienced treatment that was inconsistent with the Respondent's commitment to maintaining a discrimination-free workplace and upholding human rights principles.

While not admitting liability, the Respondent recognizes the impact of the events on the Applicant and commits to ensuring such incidents do not recur.

### 2. Financial Compensation

The Respondent agrees to pay the Applicant:
- General damages: $${partialSuccess ? '18,000' : '25,000'}
- Compensation for lost income: $${partialSuccess ? '28,000' : '42,000'}
${intersectionalGrounds ? `- Additional compensation for intersectional discrimination: $10,000` : ''}

Total: $${partialSuccess ? (intersectionalGrounds ? '56,000' : '46,000') : (intersectionalGrounds ? '77,000' : '67,000')}

Payment to be made within 30 days of signing this agreement.

### 3. Systemic Remedies

The Respondent agrees to implement the following measures:

a) **Anti-Racism Training**: Mandatory training on anti-Black racism${intersectionalGrounds ? ` and intersectional discrimination (race and ${intersectionalGrounds.secondary})` : ''} for all staff within 6 months

b) **Policy Review**: Review and update all human rights and anti-discrimination policies to explicitly address anti-Black racism${intersectionalGrounds ? ` and intersectional discrimination` : ''}

c) **Monitoring**: Establish an internal reporting mechanism for discrimination complaints with quarterly reviews by senior management

d) **Employment Reference**: Provide a neutral employment reference for the Applicant

### 4. Confidentiality

${outcomeType === 'settlement' && Math.random() > 0.5 ? 'The terms of this settlement are confidential, except as required by law or for enforcement purposes.' : 'The parties agree that the fact of settlement and general terms may be disclosed, but specific details remain confidential.'}

### 5. Full and Final Release

Upon receipt of all payments and completion of the agreed terms, the Applicant agrees to withdraw the complaint and release the Respondent from all claims arising from the matters in the complaint.

### 6. No Admission

This ${outcomeType === 'settlement' ? 'settlement' : outcomeType === 'mediation' ? 'agreement' : 'consent order'} does not constitute an admission of liability or wrongdoing by the Respondent.
` : `
### 1. Payment

The Respondent agrees to pay the Applicant $15,000 in full and final settlement of all claims.

### 2. Withdrawal

Upon receipt of payment, the Applicant agrees to withdraw the complaint without prejudice.

### 3. No Admission

This agreement does not constitute an admission of liability by the Respondent.

### 4. Confidentiality

The terms of this agreement are confidential.
`}

## ${outcomeType === 'consent_order' ? 'Order' : 'Conclusion'}

${outcomeType === 'consent_order' ? 'The Tribunal hereby approves this consent order. The parties are bound by the terms set out above.' : 'The parties have signed this agreement voluntarily and in full understanding of its terms. The complaint will be withdrawn upon completion of the agreed terms.'}

${hasAntiBlackRacism ? `This resolution demonstrates the parties' commitment to addressing anti-Black racism${intersectionalGrounds ? ` and intersectional discrimination` : ''} and working towards a discrimination-free workplace.` : ''}

Dated: ${new Date().toLocaleDateString('en-CA')}

_________________________
Applicant

_________________________
Respondent

${outcomeType === 'consent_order' ? `
_________________________
Tribunal Member
` : ''}
`;
  }

  // Withdrawal without compensation
  if (outcomeType === 'withdrawal' && !hasAntiBlackRacism) {
    return `
# NOTICE OF WITHDRAWAL

## Case Information

**Applicant:** ${applicant}
**Respondent:** ${respondent}
**File Number:** ${Math.floor(Math.random() * 90000) + 10000}

## Notice

The Applicant hereby gives notice of withdrawal of the application filed on ${new Date(Date.now() - Math.random() * 365 * 24 * 60 * 60 * 1000).toLocaleDateString('en-CA')}.

The application alleged ${issue} contrary to the Human Rights Code.

## Reason for Withdrawal

The Applicant has decided to withdraw the application without prejudice. No settlement or agreement has been reached with the Respondent.

## Effect

This withdrawal results in the dismissal of the application. The Applicant may file a new application regarding these or related matters, subject to any applicable time limits.

Dated: ${new Date().toLocaleDateString('en-CA')}

_________________________
${applicant}, Applicant
`;
  }

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

${intersectionalContext}

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

The anti-Black racism and racial discrimination experienced by the Applicant was ${partialSuccess ? 'significant' : 'severe and prolonged'}. ${intersectionalGrounds ? `The intersectional nature of the discrimination, affecting the Applicant both as a ${primaryIdentifier} person and as someone with ${intersectionalGrounds.secondary}, compounded the harm and created unique barriers. ` : ''}The use of racial slurs, stereotyping, and the creation of a ${partialSuccess ? 'hostile' : 'poisoned'} work environment caused ${partialSuccess ? 'substantial' : 'significant'} psychological harm. The Applicant testified credibly about the impact on their mental health, sense of self-worth, and career trajectory.

${partialSuccess ? `
While I find that some of the alleged incidents were not proven on a balance of probabilities, the proven instances of anti-Black racism are sufficient to establish liability. The impact, while serious, was somewhat mitigated by the Applicant's relatively shorter exposure to the discriminatory environment.
` : ''}

Considering comparable cases involving anti-Black racism${intersectionalGrounds ? ` and intersectional discrimination` : ''} and racial harassment, ${partialSuccess ? 'and the mixed findings on the evidence' : 'and the egregious nature of the conduct here'}, I award **$${partialSuccess ? '18,000' : '25,000'}** in damages for injury to dignity, feelings and self-respect${intersectionalGrounds ? `, plus an additional **$5,000** for the intersectional aspect of the discrimination` : ''}.

### Compensation for Lost Wages

${partialSuccess ? `
The Applicant experienced a period of reduced earnings as a result of the discriminatory treatment. However, I find that not all of the lost income claimed can be attributed to the discrimination. Based on the evidence of the Applicant's salary and the period directly attributable to the discrimination, I order compensation for lost wages in the amount of **$28,000**.
` : `
The Applicant was constructively dismissed as a result of the discriminatory treatment. Based on the evidence of the Applicant's salary and the period of unemployment attributable to the discrimination, I order compensation for lost wages in the amount of **$42,000**.
`}

### Interest

The Respondent shall pay pre-judgment and post-judgment interest on all monetary awards in accordance with the Courts of Justice Act.

### Systemic Remedies

To address the systemic nature of the anti-Black racism and prevent future discrimination, I order:

1. **Anti-Racism Training**: The Respondent shall retain a qualified expert to develop and deliver mandatory anti-Black racism training for all employees, with enhanced training for managers and supervisors. This training must be completed within 6 months and repeated annually.

2. **Policy Review**: The Respondent shall review and revise its human rights, anti-discrimination, and harassment policies to explicitly address anti-Black racism and ensure robust complaint mechanisms.

3. **Monitoring**: The Respondent shall provide annual reports to the Tribunal for 3 years documenting compliance with these orders and any human rights complaints received.

### Summary of Orders

The Respondent shall:
- Pay the Applicant $${partialSuccess ? '18,000' : '25,000'} for injury to dignity${intersectionalGrounds ? `\n- Pay the Applicant $5,000 for intersectional discrimination` : ''}
- Pay the Applicant $${partialSuccess ? '28,000' : '42,000'} for lost wages
- Pay interest on all amounts as ordered
- Implement mandatory anti-Black racism training${intersectionalGrounds ? ` addressing intersectionality` : ''}
- Review and revise anti-discrimination policies${intersectionalGrounds ? ` to explicitly address intersectional discrimination` : ''}
- Provide annual compliance reports${partialSuccess ? ' for 1 year' : ' for 3 years'}

${partialSuccess ? `
Note: While the Applicant sought additional remedies including reinstatement and more extensive systemic orders, I find that the remedies ordered above are appropriate given the mixed findings on the evidence and the proven instances of discrimination.
` : ''}

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
  antiBlackRacismPercentage: number = 0.5,
  language: 'en' | 'fr' = 'en'
): DecisionLink[] {
  const links: DecisionLink[] = [];
  const currentYear = new Date().getFullYear();
  
  // Use French names for Quebec cases
  const applicantList = language === 'fr' ? DEMO_APPLICANTS_FR : DEMO_APPLICANTS;
  const blackNameCount = language === 'fr' ? 10 : 15; // French has 10 Black names, English has 15

  for (let i = 0; i < count; i++) {
    const year = currentYear - Math.floor(Math.random() * 3); // Last 3 years
    const hasAntiBlackRacism = (i / count) < antiBlackRacismPercentage;
    
    // Select appropriate name
    const applicant = hasAntiBlackRacism
      ? applicantList[Math.floor(Math.random() * blackNameCount)]
      : applicantList[Math.floor(Math.random() * applicantList.length)];
    
    const respondent = DEMO_RESPONDENTS[Math.floor(Math.random() * DEMO_RESPONDENTS.length)];
    const caseNumber = generateCaseNumber(sourceSystem, year);
    const issue = selectIssue(hasAntiBlackRacism);
    
    const month = Math.floor(Math.random() * 12) + 1;
    const day = Math.floor(Math.random() * 28) + 1;
    const date = `${year}-${month.toString().padStart(2, '0')}-${day.toString().padStart(2, '0')}`;

    const previewText = language === 'fr'
      ? `Décision concernant ${issue} dans la plainte déposée par ${applicant} contre ${respondent}.`
      : `Decision regarding ${issue} in complaint filed by ${applicant} against ${respondent}.`;

    links.push({
      url: `https://demo.tribunal.ca/decisions/${year}/${caseNumber.replace(/\s/g, '-')}`,
      title: `${applicant} v. ${respondent}`,
      date,
      preview: previewText,
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
  shouldHaveAntiBlackRacism: boolean = Math.random() > 0.5, // 50% contain anti-Black racism
  options: {
    intersectional?: boolean;
    outcomeType?: OutcomeType;
    partialSuccess?: boolean;
    language?: 'en' | 'fr';
  } = {}
): DecisionContent {
  // Determine language (French for Quebec cases)
  const language = options.language || (sourceSystem.includes('qctdp') ? 'fr' : 'en');
  
  // Select appropriate applicant name based on language
  const applicantNames = language === 'fr' ? DEMO_APPLICANTS_FR : DEMO_APPLICANTS;
  const applicant = link.title.split(' v. ')[0];
  const respondent = link.title.split(' v. ')[1] || DEMO_RESPONDENTS[0];
  const issue = selectIssue(shouldHaveAntiBlackRacism);
  
  // For anti-Black racism cases, always use race-related grounds
  const ground = shouldHaveAntiBlackRacism 
    ? ['race', 'colour', 'ancestry', 'ethnic origin'][Math.floor(Math.random() * 4)]
    : DEMO_GROUNDS[Math.floor(Math.random() * DEMO_GROUNDS.length)];
  
  // Add intersectional grounds if requested
  const intersectionalGrounds = options.intersectional && shouldHaveAntiBlackRacism && Math.random() > 0.3
    ? INTERSECTIONAL_GROUNDS[Math.floor(Math.random() * INTERSECTIONAL_GROUNDS.length)]
    : undefined;
  
  // Determine outcome type (default to decision)
  const outcomeType = options.outcomeType || (shouldHaveAntiBlackRacism && Math.random() > 0.7 
    ? ['settlement', 'mediation', 'consent_order'][Math.floor(Math.random() * 3)] as OutcomeType
    : 'decision');
  
  // For partial success, only apply to decisions with anti-Black racism
  const partialSuccess = options.partialSuccess !== undefined 
    ? options.partialSuccess 
    : (shouldHaveAntiBlackRacism && outcomeType === 'decision' && Math.random() > 0.7);
  
  // Select outcome based on type and success
  const outcomeTemplate = OUTCOME_TEMPLATES.find(t => t.type === outcomeType && t.hasRemedies === shouldHaveAntiBlackRacism) 
    || OUTCOME_TEMPLATES[0];
  const outcome = outcomeTemplate.description;

  const fullText = generateDecisionText(
    applicant,
    respondent,
    issue,
    ground,
    outcome,
    shouldHaveAntiBlackRacism,
    intersectionalGrounds,
    outcomeType,
    language,
    partialSuccess
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

  // Map outcome type to document type
  const documentType = outcomeType === 'settlement' ? 'settlement'
    : outcomeType === 'mediation' ? 'mediation'
    : outcomeType === 'withdrawal' ? 'withdrawal'
    : outcomeType === 'consent_order' ? 'consent_order'
    : 'decision';

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
    language,
    documentType,
  };
}

/**
 * Generates a complete set of demo decisions with varied characteristics
 */
export function generateDemoDataset(
  sourceSystem: SourceSystem,
  count: number = 10,
  antiBlackRacismPercentage: number = 0.5,
  options: {
    includeIntersectional?: boolean;
    includeSettlements?: boolean;
    includePartialSuccess?: boolean;
    language?: 'en' | 'fr';
  } = {}
): Array<{ link: DecisionLink; content: DecisionContent; hasAntiBlackRacism: boolean }> {
  // Default options
  const includeIntersectional = options.includeIntersectional !== false; // true by default
  const includeSettlements = options.includeSettlements !== false; // true by default
  const includePartialSuccess = options.includePartialSuccess !== false; // true by default
  const language = options.language || (sourceSystem.includes('qctdp') ? 'fr' : 'en');
  
  const links = generateDemoLinks(sourceSystem, count, antiBlackRacismPercentage, language);
  
  return links.map((link, index) => {
    const shouldHaveAntiBlackRacism = (index / count) < antiBlackRacismPercentage;
    
    // Vary the characteristics across the dataset
    const contentOptions: Parameters<typeof generateDemoContent>[3] = {
      language,
    };
    
    if (includeIntersectional && shouldHaveAntiBlackRacism) {
      // 30% of anti-Black racism cases are intersectional
      contentOptions.intersectional = Math.random() > 0.7;
    }
    
    if (includeSettlements && shouldHaveAntiBlackRacism) {
      // 20% of anti-Black racism cases are settlements/mediations
      if (Math.random() > 0.8) {
        const settlementTypes: OutcomeType[] = ['settlement', 'mediation', 'consent_order'];
        contentOptions.outcomeType = settlementTypes[Math.floor(Math.random() * settlementTypes.length)];
      }
    }
    
    if (includePartialSuccess && shouldHaveAntiBlackRacism) {
      // 20% of anti-Black racism decisions have partial success
      contentOptions.partialSuccess = Math.random() > 0.8;
    }
    
    const content = generateDemoContent(link, sourceSystem, shouldHaveAntiBlackRacism, contentOptions);
    return { link, content, hasAntiBlackRacism: shouldHaveAntiBlackRacism };
  });
}
