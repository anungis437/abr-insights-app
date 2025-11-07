# Enable AI Classification - Setup Guide

## Overview

The ABR Insights ingestion pipeline supports AI-powered classification using Azure OpenAI (GPT-4). This provides enhanced analysis beyond the rule-based system.

## Prerequisites

You need an **Azure OpenAI resource** with:
- An active Azure subscription
- Azure OpenAI service deployed
- A GPT-4 or GPT-4o deployment

## Step 1: Get Azure OpenAI Credentials

### Option A: Using Azure Portal

1. Go to [Azure Portal](https://portal.azure.com)
2. Navigate to your **Azure OpenAI resource**
3. Go to **Keys and Endpoint** section
4. Copy the following:
   - **Endpoint**: `https://your-resource.openai.azure.com`
   - **API Key**: One of the keys (KEY 1 or KEY 2)
5. Note your **Deployment Name** (usually `gpt-4` or `gpt-4o`)

### Option B: Using Azure CLI

```bash
# List your Azure OpenAI resources
az cognitiveservices account list --query "[?kind=='OpenAI']"

# Get endpoint and key
az cognitiveservices account show \
  --name your-openai-resource \
  --resource-group your-resource-group \
  --query "properties.endpoint"

az cognitiveservices account keys list \
  --name your-openai-resource \
  --resource-group your-resource-group
```

## Step 2: Add Credentials to .env.local

Update your `.env.local` file with the Azure OpenAI credentials:

```bash
# Azure OpenAI Configuration (Required for AI classification)
AZURE_OPENAI_ENDPOINT=https://your-resource.openai.azure.com
AZURE_OPENAI_API_KEY=your-api-key-here
AZURE_OPENAI_DEPLOYMENT_NAME=gpt-4o
AZURE_OPENAI_API_VERSION=2024-02-15-preview
```

### Example:

```bash
# Azure OpenAI Configuration
AZURE_OPENAI_ENDPOINT=https://abr-insights-openai.openai.azure.com
AZURE_OPENAI_API_KEY=1234567890abcdef1234567890abcdef
AZURE_OPENAI_DEPLOYMENT_NAME=gpt-4o
AZURE_OPENAI_API_VERSION=2024-02-15-preview
```

## Step 3: Verify Configuration

Run the configuration test:

```bash
npx tsx --env-file=.env.local ingestion/src/config/index.ts
```

Or run a test ingestion with AI:

```bash
npm run ingest -- --demo --limit 1
```

You should see:
- ✅ AI classification enabled
- 🤖 AI analysis for each case
- Enhanced reasoning and key phrases

Instead of:
- ⚠️ AI classification disabled: Missing Azure OpenAI credentials

## Step 4: Re-process Existing Cases with AI

Once AI is enabled, you can enhance existing cases:

### Option A: Add More Cases with AI

```bash
npm run ingest -- --demo --limit 10
```

### Option B: Update Existing Cases

Currently, the system stores AI results in the `ai_classification` JSONB column. To update existing cases, you would need to:

1. Delete existing cases (if desired)
2. Re-run ingestion with AI enabled

```bash
# Clear test data (optional)
npx tsx --env-file=.env.local -e "
import { createClient } from '@supabase/supabase-js';
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);
await supabase.from('cases').delete().neq('id', '00000000-0000-0000-0000-000000000000');
await supabase.from('tribunal_cases_raw').delete().neq('id', '00000000-0000-0000-0000-000000000000');
console.log('Cleared all cases');
"

# Re-ingest with AI
npm run ingest -- --demo --limit 20
```

## What AI Classification Provides

When AI is enabled, each case gets enhanced analysis:

### Rule-Based Only (Current):
```json
{
  "rule_based_classification": {
    "isRaceRelated": true,
    "isAntiBlackLikely": true,
    "confidence": 0.85,
    "category": "anti_black_racism",
    "groundsDetected": ["race", "colour"],
    "keywordMatches": ["Black", "racial slurs"],
    "reasoning": "High keyword density for anti-Black racism"
  },
  "ai_classification": null,
  "combined_confidence": 0.85
}
```

### With AI Enabled:
```json
{
  "rule_based_classification": { /* same as above */ },
  "ai_classification": {
    "category": "anti_black_racism",
    "confidence": 0.92,
    "reasoning": "Case involves clear discriminatory treatment based on race with specific anti-Black stereotyping and explicit racial comments...",
    "keyPhrases": [
      "racial stereotyping in hiring",
      "discriminatory comments about appearance",
      "unequal treatment in promotion"
    ],
    "groundsDetected": ["race", "colour"],
    "keyIssues": [
      "Discriminatory hiring practices",
      "Hostile work environment",
      "Retaliation after complaint"
    ],
    "remedies": ["monetary damages", "policy changes", "training"],
    "sentiment": "negative",
    "legislationCited": ["Ontario Human Rights Code s.5(1)"]
  },
  "combined_confidence": 0.89
}
```

## AI Classification Benefits

1. **Deeper Context**: Understands nuanced discrimination beyond keyword matching
2. **Key Phrases**: Extracts important discriminatory language
3. **Issue Identification**: Identifies specific human rights issues
4. **Remedies Tracking**: Notes what remedies were awarded
5. **Legal Citations**: Captures relevant legislation referenced
6. **Confidence Scoring**: Provides more accurate classification confidence
7. **Reasoning**: Explains why a case was categorized a certain way

## Cost Considerations

### Azure OpenAI Pricing (Approximate)

For GPT-4o:
- Input: ~$2.50 per 1M tokens
- Output: ~$10 per 1M tokens

### Typical Case Analysis

- Average case: ~2,000 tokens input
- AI response: ~500 tokens output
- Cost per case: ~$0.01

For 100 cases: ~$1.00

## Troubleshooting

### Error: "AI classification disabled"

**Cause**: Missing or invalid Azure OpenAI credentials

**Solution**:
1. Verify all 4 environment variables are set
2. Check endpoint format: `https://[resource-name].openai.azure.com`
3. Ensure API key is valid
4. Confirm deployment name matches your Azure resource

### Error: "Rate limit exceeded"

**Cause**: Too many requests to Azure OpenAI

**Solution**:
1. Reduce `--limit` when ingesting
2. Check your Azure OpenAI quota
3. Consider upgrading your Azure OpenAI tier

### Error: "Deployment not found"

**Cause**: Deployment name doesn't match Azure resource

**Solution**:
1. Check deployment name in Azure Portal
2. Update `AZURE_OPENAI_DEPLOYMENT_NAME` in `.env.local`
3. Common names: `gpt-4`, `gpt-4o`, `gpt-4-32k`

## Testing AI Classification

Create a test script to verify AI is working:

```bash
npx tsx --env-file=.env.local ingestion/src/debug/test-ai-classifier.ts
```

Or run a single case ingestion:

```bash
npm run ingest -- --demo --limit 1
```

Look for:
- ✅ AI classification enabled
- 🤖 AI analysis in output
- `ai_classification` populated in database

## Performance Impact

- **Without AI**: ~50ms per case (rule-based only)
- **With AI**: ~2-3 seconds per case (includes API call)

For 20 cases:
- Rule-based only: ~1 second
- With AI: ~40-60 seconds

## Next Steps

1. ✅ Add Azure OpenAI credentials to `.env.local`
2. ✅ Test with single case ingestion
3. ✅ Re-process demo data with AI
4. ✅ Review AI analysis in database
5. ✅ Check analytics dashboard for enhanced insights

---

**Need Help?**

- Azure OpenAI Docs: https://learn.microsoft.com/azure/ai-services/openai/
- Create Azure OpenAI resource: https://portal.azure.com/#create/Microsoft.CognitiveServicesOpenAI
