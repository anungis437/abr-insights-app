# Quick Start: Enable AI Classification

## What You Need

Azure OpenAI credentials from your Azure portal:
- Endpoint URL
- API Key
- Deployment Name (usually `gpt-4o` or `gpt-4`)

## Quick Setup

1. **Add to `.env.local`:**

```bash
# Azure OpenAI Configuration
AZURE_OPENAI_ENDPOINT=https://your-resource.openai.azure.com
AZURE_OPENAI_API_KEY=your-api-key-here
AZURE_OPENAI_DEPLOYMENT_NAME=gpt-4o
AZURE_OPENAI_API_VERSION=2024-02-15-preview
```

2. **Verify configuration:**

```bash
npx tsx --env-file=.env.local check-ai-config.ts
```

3. **Test with single case:**

```bash
npm run ingest -- --demo --limit 1
```

4. **Generate cases with AI:**

```bash
npm run ingest -- --demo --limit 10
```

## What Changes

**Before (Rule-based only):**
```
⚠️  AI classification disabled: Missing Azure OpenAI credentials
📊 Classifying: Case Name
   Expected: ✓ YES
   Classified: ✓ YES
   💾 Stored in database
```

**After (With AI):**
```
✅ AI classification enabled
📊 Classifying: Case Name
   Expected: ✓ YES
   Classified: ✓ YES
   🤖 AI Analysis: High confidence anti-Black racism case...
   💾 Stored in database
```

## Benefits

- 📊 **Enhanced Accuracy**: AI provides deeper context analysis
- 🎯 **Key Insights**: Extracts important discriminatory language
- ⚖️ **Legal Context**: Identifies legislation and remedies
- 💡 **Reasoning**: Explains classification decisions
- 📈 **Better Analytics**: More detailed data for dashboards

## Cost

Approximately **$0.01 per case** with GPT-4o.

For 100 cases: ~$1.00

## Get Azure OpenAI

Don't have Azure OpenAI yet?

1. **Azure Portal**: https://portal.azure.com/#create/Microsoft.CognitiveServicesOpenAI
2. **Follow**: [Azure OpenAI Setup Guide](https://learn.microsoft.com/azure/ai-services/openai/how-to/create-resource)

## Full Documentation

See `ENABLE_AI_CLASSIFICATION.md` for complete setup guide.

## Check Status

```bash
npx tsx --env-file=.env.local check-ai-config.ts
```
