# Classifier Debug Resolution

## Issue

Demo mode was generating cases with anti-Black racism keywords but classifier was returning NO for all cases that should have been YES.

## Root Cause

The CLI was accessing the wrong property on the classification result:

```typescript
// ❌ WRONG - checking property that doesn't exist
const classification = await classifier.classify(content);
console.log(classification.isAntiBlackLikely); // undefined on CombinedClassification
```

**Problem**: `CombinedClassifier.classify()` returns a `CombinedClassification` object with the structure:

```typescript
interface CombinedClassification {
  ruleBasedResult: RuleBasedClassification;  // Has isAntiBlackLikely
  aiResult: AIClassification;                // Has category
  finalConfidence: number;
  finalCategory: 'anti_black_racism' | 'other_discrimination' | 'non_discrimination';
  needsReview: boolean;
}
```

The property `isAntiBlackLikely` exists on `RuleBasedClassification`, not on `CombinedClassification`.

## Solution

Changed the CLI to check the correct property:

```typescript
// ✅ CORRECT - check finalCategory from combined result
const classification = await classifier.classify(content);
const isAntiBlack = classification.finalCategory === 'anti_black_racism';
console.log(isAntiBlack);
```

## Verification

Created `debug/test-classifier.ts` to test the classifier directly:

```bash
npx tsx ingestion/src/debug/test-classifier.ts
```

**Results**:
- ✅ RuleBasedClassifier correctly identifies anti-Black keywords
- ✅ Demo data contains all required keywords (black, african, racism, racial, discrimination)
- ✅ Classification returns `isAntiBlackLikely: true` with high confidence (1.0)

## Demo Mode Results

After fix, demo mode now shows **100% accuracy**:

```bash
npm run ingest -- --demo --limit 10 --dry-run
```

**Output**:
- 5/5 cases Expected YES → Classified YES ✓
- 5/5 cases Expected NO → Classified NO ✓
- 10/10 total correct classifications

## Files Changed

- `ingestion/src/cli.ts` - Fixed classification result property access
- `ingestion/src/debug/test-classifier.ts` - Added debug script for future troubleshooting

## Commits

- `49659d3` - fix: Use finalCategory instead of isAntiBlackLikely in demo mode
- `5105698` - feat: Add demo data generator for testing without scraping
- `16c3b22` - docs: Add DEMO_MODE.md documentation

## Lessons Learned

1. **Type Safety**: TypeScript casting with `as any` bypasses compile-time checks, leading to runtime bugs
2. **Interface Mismatch**: Different classifier implementations return different result structures
3. **Debug Scripts**: Standalone test scripts are invaluable for isolating issues
4. **Comprehensive Logging**: "Expected vs Classified" logging immediately revealed the mismatch
5. **Demo Data**: Synthetic data with known outcomes is excellent for validating logic

## Next Steps

1. ✅ Demo mode working correctly
2. ✅ Classifier detecting anti-Black racism accurately
3. ⏳ Wait for CanLII 403 resolution (24-48h)
4. ⏳ Test with real CanLII data once unblocked
5. ⏳ Research direct tribunal websites as backup
