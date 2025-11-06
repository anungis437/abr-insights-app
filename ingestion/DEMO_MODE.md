# Demo Mode

## Overview

The ingestion pipeline now supports **demo mode**, which generates synthetic tribunal decisions for testing without requiring access to external data sources. This is especially useful when:

- CanLII or other sources are blocked/unavailable
- Testing locally without affecting production data
- Developing and debugging classification logic
- Demonstrating the system without real data

## Usage

Run the ingestion pipeline with the `--demo` flag:

```bash
# Generate and classify 10 demo decisions (dry run)
npm run ingest -- --demo --limit 10 --dry-run

# Generate 20 decisions and store them in database
npm run ingest -- --demo --limit 20

# Demo mode with specific source (for different tribunal metadata)
npm run ingest -- --demo --source canlii_bchrt --limit 15 --dry-run
```

## Demo Data Characteristics

The demo generator creates realistic synthetic decisions with:

- **Applicants**: Diverse names representing different communities
- **Respondents**: Various types of organizations and employers
- **Issues**: Common human rights complaints (discrimination, harassment, etc.)
- **Grounds**: Protected characteristics under human rights law
- **Outcomes**: Range of tribunal decisions

### Anti-Black Racism Content

By default, **50% of generated decisions contain anti-Black racism content** with explicit keywords:

- ✅ Keywords: "Black", "African Canadian", "of African descent", "Caribbean", "Afro-Canadian"
- ✅ Discrimination terms: "racial discrimination", "anti-Black racism", "racial slurs", "racial profiling"
- ✅ Pattern evidence: Documented differential treatment, harassment, systemic discrimination
- ✅ Credibility findings: Analysis of anti-Black bias in evidence

The other 50% contain race-neutral content with generic discrimination terminology.

## Pipeline Processing

Demo mode follows the same pipeline as live scraping:

1. **Generation**: Creates synthetic `DecisionLink` and `DecisionContent` objects
2. **Classification**: Runs rule-based classifier (AI disabled in demo mode)
3. **Storage**: Saves to database (skipped with `--dry-run`)

## Output Example

```
═══════════════════════════════════════════════════════
📥  ABR INSIGHTS - INGESTION PIPELINE
═══════════════════════════════════════════════════════
Source:   canlii_hrto
Limit:    10 cases
Mode:     DEMO DATA
Dry Run:  YES
═══════════════════════════════════════════════════════

🎭 Generating demo data...
✅ Generated 10 demo decisions

📊 Classifying: Amina Diallo v. ABC Corporation
   Expected: ✓ YES
   Classified: ✓ YES (or ✗ NO if classifier needs tuning)
   💾 [DRY RUN] Would store in database

...

═══════════════════════════════════════════════════════
📊 DEMO INGESTION SUMMARY
═══════════════════════════════════════════════════════
Total Generated:  10
Classified:       10
Stored:           N/A (dry run)
Errors:           0
Duration:         0.2s
═══════════════════════════════════════════════════════
```

## Development Notes

### Adjusting Anti-Black Racism Percentage

Edit `runDemoIngestion()` in `cli.ts`:

```typescript
const dataset = generateDemoDataset(sourceSystem, limit, 0.7); // 70% anti-Black racism
```

### Adding More Applicant Names

Edit `DEMO_APPLICANTS` array in `demo/generator.ts`:

```typescript
const DEMO_APPLICANTS = [
  'John Smith',
  'Maria Garcia',
  // Add more names...
];
```

### Customizing Decision Text

Edit `generateDecisionText()` function in `demo/generator.ts` to adjust the content, keywords, or structure of generated decisions.

## Limitations

- **AI Classification Disabled**: Demo mode uses only rule-based classification (no Azure OpenAI API calls)
- **Static Templates**: Generated text follows predictable patterns
- **No Real Case Law**: Content is synthetic and not based on actual tribunal decisions
- **Simplified Metadata**: Some fields (PDFs, attachments) are not generated

## Benefits

✅ **No External Dependencies**: Works offline without CanLII access  
✅ **Consistent Testing**: Reproducible test data for development  
✅ **Fast**: Generates 100+ decisions in < 1 second  
✅ **Safe**: Dry-run mode prevents accidental database modifications  
✅ **Educational**: Clear examples of anti-Black racism content patterns

## Next Steps

Once demo mode is working correctly:

1. Tune classifier thresholds based on demo results
2. Test with real data from CanLII when access is restored
3. Compare demo classification results with live scraping results
4. Adjust demo text patterns to better match real tribunal decisions
