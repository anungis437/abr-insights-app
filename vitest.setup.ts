import { beforeAll, vi } from 'vitest';

// Mock environment variables for testing
beforeAll(() => {
  // Use real Supabase credentials from .env for integration tests, or mocks for unit tests
  process.env.NEXT_PUBLIC_SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://test.supabase.co';
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'test-anon-key';
  process.env.SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || 'test-service-role-key';
  process.env.SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://test.supabase.co';
  process.env.SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'test-anon-key';
  process.env.AZURE_OPENAI_ENDPOINT = process.env.AZURE_OPENAI_ENDPOINT || 'https://test.openai.azure.com';
  process.env.AZURE_OPENAI_API_KEY = process.env.AZURE_OPENAI_API_KEY || 'test-api-key';
  process.env.AZURE_OPENAI_DEPLOYMENT = process.env.AZURE_OPENAI_DEPLOYMENT || 'test-deployment';
  process.env.AZURE_OPENAI_API_VERSION = process.env.AZURE_OPENAI_API_VERSION || '2024-02-15-preview';
  process.env.AI_ENABLED = 'false'; // Disable AI by default in tests
});

// Mock Azure OpenAI to prevent actual API calls
vi.mock('openai', () => ({
  AzureOpenAI: vi.fn().mockImplementation(() => ({
    chat: {
      completions: {
        create: vi.fn().mockResolvedValue({
          choices: [{
            message: {
              content: JSON.stringify({
                category: 'anti_black_racism',
                confidence: 0.85,
                reasoning: 'Mock AI classification result',
                keyPhrases: ['race', 'discrimination'],
                groundsDetected: ['race'],
              }),
            },
          }],
        }),
      },
    },
    embeddings: {
      create: vi.fn().mockResolvedValue({
        data: [{
          embedding: new Array(1536).fill(0),
        }],
      }),
    },
  })),
}));
