# AI/ML Readiness Assessment

**Date**: November 7, 2025  
**Status**: 🟡 Partially Complete - Vector/Embeddings Not Implemented

---

## Executive Summary

The ingestion system is **fully complete** with AI-powered classification working. However, the **vector embeddings and semantic search infrastructure** documented in `AI_ML_ARCHITECTURE.md` is **NOT YET IMPLEMENTED**.

### What's Complete ✅

1. **Ingestion Pipeline** (100%)
   - ✅ CanLII scraper (discovery, fetch, parse)
   - ✅ Rule-based classifier (keyword matching)
   - ✅ AI classifier (Azure OpenAI GPT-4o integration)
   - ✅ Combined classification scoring
   - ✅ Storage layer with deduplication
   - ✅ 35/35 tests passing
   - ✅ CLI interface and orchestrator

2. **AI Classification** (100%)
   - ✅ Azure OpenAI integration configured
   - ✅ GPT-4o for case classification
   - ✅ Structured JSON responses
   - ✅ Confidence scoring
   - ✅ Anti-Black racism detection
   - ✅ Discrimination grounds identification
   - ✅ Key issues and remedies extraction

3. **Database Schema - Core Tables** (100%)
   - ✅ `tribunal_cases` - Production case storage
   - ✅ `tribunal_cases_raw` - Ingestion staging
   - ✅ `ingestion_jobs` - Job tracking
   - ✅ `ingestion_sources` - Source configuration
   - ✅ Full-text search indexes (PostgreSQL tsvector)

### What's Missing ❌

1. **pgvector Extension** (0%)
   - ❌ pgvector extension not enabled in `000_enable_extensions.sql`
   - ❌ Extension required for vector similarity search

2. **Embeddings Tables** (0%)
   - ❌ `case_embeddings` table not created
   - ❌ `course_embeddings` table not created
   - ❌ HNSW indexes not created

3. **Embedding Generation** (0%)
   - ❌ No embedding generation code
   - ❌ No Azure OpenAI embeddings API integration
   - ❌ No batch embedding functions

4. **Semantic Search** (0%)
   - ❌ No similarity search functions
   - ❌ No `search_similar_cases()` database function
   - ❌ No semantic search API endpoints
   - ❌ No vector-based case recommendations

5. **Advanced AI Features** (0%)
   - ❌ Similar case discovery (needs embeddings)
   - ❌ Personalized recommendations (needs embeddings)
   - ❌ Advanced case comparison (needs embeddings)
   - ❌ Semantic learning path suggestions (needs embeddings)

---

## Implementation Gap Analysis

### Current State: Text Search Only

**What works now**:
```sql
-- Full-text search (PostgreSQL tsvector)
SELECT * FROM tribunal_cases 
WHERE to_tsvector('english', case_title || ' ' || full_text) 
  @@ to_tsquery('english', 'anti-Black & racism');
```

**Limitations**:
- Keyword-based only (exact matches, stemming)
- No semantic understanding ("bias" won't match "discrimination")
- No similarity scoring between cases
- Cannot find "similar cases" without shared keywords

### Desired State: Vector Semantic Search

**What we need**:
```sql
-- Vector similarity search (pgvector)
SELECT tc.*, 
       1 - (ce.embedding <=> query_embedding) AS similarity
FROM case_embeddings ce
JOIN tribunal_cases tc ON tc.id = ce.case_id
WHERE 1 - (ce.embedding <=> query_embedding) > 0.75
ORDER BY similarity DESC
LIMIT 10;
```

**Benefits**:
- Semantic understanding (finds related concepts)
- Similarity scoring (quantify how related cases are)
- Better search results (understands context)
- Personalized recommendations (based on user behavior)

---

## What Needs to Be Built

### Phase 1: Database Infrastructure (Required First)

**1. Enable pgvector Extension**

File: `supabase/migrations/000_enable_extensions.sql`

```sql
-- Add this line
CREATE EXTENSION IF NOT EXISTS "vector" SCHEMA extensions;
```

**2. Create Embeddings Tables**

File: `supabase/migrations/006_vector_embeddings.sql` (NEW)

```sql
-- Case embeddings for semantic search
CREATE TABLE IF NOT EXISTS case_embeddings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  case_id UUID REFERENCES tribunal_cases(id) ON DELETE CASCADE,
  embedding VECTOR(1536) NOT NULL,
  embedding_model TEXT DEFAULT 'text-embedding-3-large',
  content_hash TEXT, -- Detect when re-embedding needed
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- HNSW index for fast similarity search
CREATE INDEX idx_case_embeddings_hnsw ON case_embeddings 
USING hnsw (embedding vector_cosine_ops)
WITH (m = 16, ef_construction = 64);

-- Additional indexes
CREATE UNIQUE INDEX idx_case_embeddings_case_id ON case_embeddings(case_id);
CREATE INDEX idx_case_embeddings_model ON case_embeddings(embedding_model);

-- Course embeddings (future)
CREATE TABLE IF NOT EXISTS course_embeddings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  lesson_id UUID REFERENCES lessons(id) ON DELETE CASCADE,
  embedding VECTOR(1536) NOT NULL,
  content_type TEXT,
  embedding_model TEXT DEFAULT 'text-embedding-3-large',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_course_embeddings_hnsw ON course_embeddings 
USING hnsw (embedding vector_cosine_ops)
WITH (m = 16, ef_construction = 64);

-- Similarity search function
CREATE OR REPLACE FUNCTION search_similar_cases(
  query_embedding VECTOR(1536),
  match_threshold FLOAT DEFAULT 0.7,
  match_count INT DEFAULT 10
)
RETURNS TABLE (
  case_id UUID,
  similarity FLOAT,
  case_number TEXT,
  case_title TEXT,
  year INTEGER,
  tribunal TEXT,
  summary TEXT
)
LANGUAGE plpgsql
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    tc.id AS case_id,
    1 - (ce.embedding <=> query_embedding) AS similarity,
    tc.case_number,
    tc.case_title,
    tc.year,
    tc.tribunal,
    tc.summary_en AS summary
  FROM case_embeddings ce
  JOIN tribunal_cases tc ON tc.id = ce.case_id
  WHERE 1 - (ce.embedding <=> query_embedding) > match_threshold
  ORDER BY ce.embedding <=> query_embedding ASC
  LIMIT match_count;
END;
$$;
```

### Phase 2: Embedding Generation Service

**3. Create Embedding Service**

File: `lib/ai/embeddings.ts` (NEW)

```typescript
import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.AZURE_OPENAI_API_KEY,
  baseURL: `${process.env.AZURE_OPENAI_ENDPOINT}/openai/deployments/text-embedding-3-large`,
  defaultQuery: { 'api-version': '2024-08-01-preview' },
  defaultHeaders: { 'api-key': process.env.AZURE_OPENAI_API_KEY },
});

export async function generateEmbedding(text: string): Promise<number[]> {
  // Clean and truncate text (max 8191 tokens)
  const cleanText = text
    .replace(/\s+/g, ' ')
    .trim()
    .substring(0, 32000); // ~8K tokens

  const response = await openai.embeddings.create({
    model: '', // Model in baseURL for Azure
    input: cleanText,
    dimensions: 1536,
  });

  return response.data[0].embedding;
}

export async function batchGenerateEmbeddings(
  texts: string[],
  batchSize: number = 100
): Promise<number[][]> {
  const embeddings: number[][] = [];

  for (let i = 0; i < texts.length; i += batchSize) {
    const batch = texts.slice(i, i + batchSize);
    const responses = await Promise.all(
      batch.map(text => generateEmbedding(text))
    );
    embeddings.push(...responses);

    // Rate limiting
    await new Promise(resolve => setTimeout(resolve, 100));
  }

  return embeddings;
}
```

**4. Create Embedding Storage Layer**

File: `lib/ai/embedding-storage.ts` (NEW)

```typescript
import { createClient } from '@/lib/supabase';
import { generateEmbedding } from './embeddings';
import crypto from 'crypto';

export async function embedCase(caseId: string) {
  const supabase = createClient();

  // Get case content
  const { data: caseData, error: caseError } = await supabase
    .from('tribunal_cases')
    .select('case_title, summary_en, summary_fr, full_text')
    .eq('id', caseId)
    .single();

  if (caseError || !caseData) {
    throw new Error(`Case not found: ${caseId}`);
  }

  // Prepare content for embedding
  const content = [
    caseData.case_title,
    caseData.summary_en,
    caseData.full_text?.substring(0, 10000), // Limit size
  ].filter(Boolean).join(' ');

  // Generate content hash
  const contentHash = crypto.createHash('md5').update(content).digest('hex');

  // Check if embedding exists and is current
  const { data: existingEmbedding } = await supabase
    .from('case_embeddings')
    .select('id, content_hash')
    .eq('case_id', caseId)
    .single();

  if (existingEmbedding && existingEmbedding.content_hash === contentHash) {
    console.log(`Embedding up-to-date for case ${caseId}`);
    return existingEmbedding.id;
  }

  // Generate embedding
  const embedding = await generateEmbedding(content);

  // Upsert embedding
  const { data, error } = await supabase
    .from('case_embeddings')
    .upsert({
      case_id: caseId,
      embedding,
      content_hash: contentHash,
      embedding_model: 'text-embedding-3-large',
      updated_at: new Date().toISOString(),
    }, {
      onConflict: 'case_id',
    })
    .select()
    .single();

  if (error) throw error;

  console.log(`Embedded case ${caseId}`);
  return data.id;
}

export async function embedAllCases() {
  const supabase = createClient();

  // Get all cases without embeddings
  const { data: cases, error } = await supabase
    .from('tribunal_cases')
    .select('id')
    .order('created_at', { ascending: false });

  if (error) throw error;

  console.log(`Embedding ${cases.length} cases...`);

  for (const caseItem of cases) {
    try {
      await embedCase(caseItem.id);
    } catch (error) {
      console.error(`Failed to embed case ${caseItem.id}:`, error);
    }
  }

  console.log('Embedding complete');
}
```

### Phase 3: Semantic Search API

**5. Create Search API Endpoint**

File: `app/api/search/semantic/route.ts` (NEW)

```typescript
import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase';
import { generateEmbedding } from '@/lib/ai/embeddings';

export async function POST(request: NextRequest) {
  try {
    const { query, limit = 10, threshold = 0.7 } = await request.json();

    if (!query) {
      return NextResponse.json(
        { error: 'Query is required' },
        { status: 400 }
      );
    }

    // Generate query embedding
    const queryEmbedding = await generateEmbedding(query);

    // Search similar cases
    const supabase = createClient();
    const { data, error } = await supabase.rpc('search_similar_cases', {
      query_embedding: queryEmbedding,
      match_threshold: threshold,
      match_count: limit,
    });

    if (error) throw error;

    return NextResponse.json({
      results: data,
      query,
      count: data?.length || 0,
    });

  } catch (error: any) {
    console.error('Semantic search error:', error);
    return NextResponse.json(
      { error: error.message || 'Search failed' },
      { status: 500 }
    );
  }
}
```

**6. Create Similar Cases Function**

File: `lib/ai/similar-cases.ts` (NEW)

```typescript
import { createClient } from '@/lib/supabase';

export async function findSimilarCases(
  caseId: string,
  limit: number = 5
) {
  const supabase = createClient();

  // Get case embedding
  const { data: embedding, error: embError } = await supabase
    .from('case_embeddings')
    .select('embedding')
    .eq('case_id', caseId)
    .single();

  if (embError || !embedding) {
    throw new Error('Case embedding not found');
  }

  // Find similar cases
  const { data, error } = await supabase.rpc('search_similar_cases', {
    query_embedding: embedding.embedding,
    match_threshold: 0.75,
    match_count: limit + 1, // +1 to exclude query case
  });

  if (error) throw error;

  // Filter out the query case itself
  return data.filter((c: any) => c.case_id !== caseId);
}
```

### Phase 4: Background Jobs

**7. Create Embedding Background Job**

File: `scripts/generate-embeddings.ts` (NEW)

```typescript
/**
 * Generate embeddings for all cases
 * Run: npx tsx --env-file=.env.local scripts/generate-embeddings.ts
 */

import { embedAllCases } from '../lib/ai/embedding-storage';

async function main() {
  console.log('Starting embedding generation...');
  console.log('⚠️  This will make many Azure OpenAI API calls');
  console.log('⚠️  Estimated cost: ~$0.0001 per case for text-embedding-3-large');
  
  await embedAllCases();
  
  console.log('✅ Embedding generation complete');
}

main().catch(console.error);
```

---

## Environment Variables Needed

Add to `.env.local`:

```bash
# Embeddings (if different from classification deployment)
AZURE_OPENAI_EMBEDDINGS_DEPLOYMENT=text-embedding-3-large
AZURE_OPENAI_EMBEDDINGS_DIMENSIONS=1536
```

---

## Testing Strategy

1. **Unit Tests** - Test embedding generation
2. **Integration Tests** - Test database functions
3. **E2E Tests** - Test semantic search API
4. **Performance Tests** - Benchmark search speed

---

## Estimated Implementation Time

| Phase | Task | Time Estimate |
|-------|------|---------------|
| 1 | Database migrations | 1 hour |
| 2 | Embedding service code | 2 hours |
| 3 | Semantic search API | 2 hours |
| 4 | Background jobs | 1 hour |
| 5 | Testing | 2 hours |
| 6 | Initial embedding generation | 2-4 hours (runtime) |
| **Total** | | **8-10 hours dev + 2-4 hours runtime** |

---

## Cost Estimate

**Azure OpenAI Embeddings Pricing**:
- Model: `text-embedding-3-large`
- Cost: ~$0.00013 per 1K tokens
- Average case: ~2K tokens = $0.00026 per case

**For 1000 cases**: ~$0.26  
**For 10,000 cases**: ~$2.60  

---

## Recommendation

### Priority: MEDIUM-HIGH

**Should we build this now?**

**Arguments FOR building now**:
- ✅ Enhances search quality significantly
- ✅ Enables "Similar Cases" feature (high value)
- ✅ Foundation for future AI features
- ✅ Low cost (~$3 for 10K cases)
- ✅ Documented well in architecture

**Arguments AGAINST building now**:
- ⚠️ Not blocking other features
- ⚠️ Current full-text search works adequately
- ⚠️ Adds complexity to maintain
- ⚠️ Need ongoing embedding updates for new cases

### Decision Points

1. **If focusing on MVP/Launch**: Skip for now, use full-text search
2. **If building comprehensive platform**: Build now as foundation
3. **If uncertain**: Build database infrastructure now, defer API implementation

---

## Current Status: Ingestion Complete ✅

The ingestion system is **production-ready**:
- Scraping, classification, and storage working
- AI classification operational
- Tests passing
- Ready to ingest real cases

**Vector/embeddings are OPTIONAL enhancements**, not blockers for ingestion.

---

## Next Steps

### Option A: Proceed with Legacy Migrations (Recommended)

Focus on migrating existing application functionality:
- ✅ Move legacy components to Next.js app
- ✅ Implement authentication flows
- ✅ Build case browsing UI
- ✅ Migrate course/learning content
- ⏭️ Defer vector embeddings to Phase 2

### Option B: Build Vector Infrastructure First

Implement complete AI/ML stack before legacy migrations:
- Create migrations for embeddings tables
- Build embedding generation service
- Implement semantic search API
- Generate embeddings for existing cases
- Test and optimize performance

**Recommendation**: **Option A** - Proceed with legacy migrations, build vector features in Phase 2 after core app is functional.

---

**Document Owner**: AI/ML Team  
**Last Updated**: November 7, 2025  
**Status**: 🟡 Gap Analysis Complete
