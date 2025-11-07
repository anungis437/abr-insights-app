import { beforeAll, vi } from 'vitest';

// Mock environment variables for testing
beforeAll(() => {
  process.env.SUPABASE_URL = 'https://test.supabase.co';
  process.env.SUPABASE_ANON_KEY = 'test-anon-key';
  process.env.SUPABASE_SERVICE_ROLE_KEY = 'test-service-role-key';
  process.env.AZURE_OPENAI_ENDPOINT = 'https://test.openai.azure.com';
  process.env.AZURE_OPENAI_API_KEY = 'test-api-key';
  process.env.AZURE_OPENAI_DEPLOYMENT = 'test-deployment';
  process.env.AZURE_OPENAI_API_VERSION = '2024-02-15-preview';
  process.env.AI_ENABLED = 'false'; // Disable AI by default in tests
});

// Mock Azure OpenAI to prevent actual API calls
vi.mock('@azure/openai', () => ({
  OpenAIClient: vi.fn().mockImplementation(() => ({
    getChatCompletions: vi.fn().mockResolvedValue({
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
  })),
  AzureKeyCredential: vi.fn(),
}));
