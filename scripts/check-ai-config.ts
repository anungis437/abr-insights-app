import { ENV } from '../ingestion/src/config/index.js';

console.log('\n🔍 Checking AI Classification Configuration...\n');

const hasEndpoint = Boolean(ENV.AZURE_OPENAI_ENDPOINT);
const hasApiKey = Boolean(ENV.AZURE_OPENAI_API_KEY);
const hasDeployment = Boolean(ENV.AZURE_OPENAI_DEPLOYMENT);
const hasApiVersion = Boolean(ENV.AZURE_OPENAI_API_VERSION);

console.log('Configuration Status:');
console.log(`  AZURE_OPENAI_ENDPOINT:        ${hasEndpoint ? '✅ Set' : '❌ Missing'} ${hasEndpoint ? `(${ENV.AZURE_OPENAI_ENDPOINT})` : ''}`);
console.log(`  AZURE_OPENAI_API_KEY:         ${hasApiKey ? '✅ Set' : '❌ Missing'} ${hasApiKey ? '(hidden)' : ''}`);
console.log(`  AZURE_OPENAI_DEPLOYMENT_NAME: ${hasDeployment ? '✅ Set' : '❌ Missing'} ${hasDeployment ? `(${ENV.AZURE_OPENAI_DEPLOYMENT})` : ''}`);
console.log(`  AZURE_OPENAI_API_VERSION:     ${hasApiVersion ? '✅ Set' : '❌ Missing'} ${hasApiVersion ? `(${ENV.AZURE_OPENAI_API_VERSION})` : ''}`);

const isEnabled = hasEndpoint && hasApiKey;

console.log('\n' + '='.repeat(60));
if (isEnabled) {
  console.log('✅ AI Classification: ENABLED');
  console.log('\nYou can now run ingestion with AI classification:');
  console.log('  npm run ingest -- --demo --limit 5');
  console.log('\nAI will provide:');
  console.log('  • Enhanced reasoning and context');
  console.log('  • Key phrase extraction');
  console.log('  • Issue identification');
  console.log('  • Remedy tracking');
  console.log('  • Legal citation detection');
} else {
  console.log('❌ AI Classification: DISABLED');
  console.log('\nTo enable AI classification:');
  console.log('  1. Get Azure OpenAI credentials from Azure Portal');
  console.log('  2. Add them to .env.local:');
  console.log('     AZURE_OPENAI_ENDPOINT=https://your-resource.openai.azure.com');
  console.log('     AZURE_OPENAI_API_KEY=your-api-key');
  console.log('     AZURE_OPENAI_DEPLOYMENT_NAME=gpt-4o');
  console.log('\nSee ENABLE_AI_CLASSIFICATION.md for detailed setup guide.');
}
console.log('='.repeat(60) + '\n');
