#!/usr/bin/env node
/**
 * Ingestion CLI Runner
 * 
 * Command-line interface for running ingestion jobs locally.
 * 
 * Usage:
 *   npm run ingest              # Run with defaults
 *   npm run ingest -- --dry-run # Test mode
 *   npm run ingest -- --limit 10 # Process only 10 cases
 *   npm run ingest -- --resume  # Resume from last checkpoint
 */

// Load environment variables from .env.local
import { config } from 'dotenv';
config({ path: '.env.local' });

import { SOURCE_CONFIGS } from './config';
import { IngestionOrchestrator } from './orchestrator';

// ============================================================================
// CLI ARGUMENT PARSING
// ============================================================================

interface CLIArgs {
  source?: string;
  limit?: number;
  dryRun?: boolean;
  resume?: boolean;
  help?: boolean;
}

function parseArgs(): CLIArgs {
  const args: CLIArgs = {};
  
  for (let i = 2; i < process.argv.length; i++) {
    const arg = process.argv[i];
    
    if (arg === '--help' || arg === '-h') {
      args.help = true;
    } else if (arg === '--dry-run') {
      args.dryRun = true;
    } else if (arg === '--resume') {
      args.resume = true;
    } else if (arg === '--limit' || arg === '-l') {
      args.limit = parseInt(process.argv[++i], 10);
    } else if (arg === '--source' || arg === '-s') {
      args.source = process.argv[++i];
    }
  }
  
  return args;
}

function printHelp(): void {
  console.log(`
📥 ABR Insights - Ingestion Pipeline CLI

Usage:
  npm run ingest [options]

Options:
  -s, --source <name>   Source system (canlii_hrto, canlii_chrt)
                        Default: canlii_hrto
  
  -l, --limit <number>  Maximum cases to process
                        Default: 50
  
  --dry-run             Test mode - don't save to database
                        Useful for testing without side effects
  
  --resume              Resume from last checkpoint
                        Skips already processed URLs
  
  -h, --help            Show this help message

Examples:
  npm run ingest
  npm run ingest -- --dry-run --limit 5
  npm run ingest -- --source canlii_chrt --limit 100
  npm run ingest -- --resume

Environment Variables:
  NEXT_PUBLIC_SUPABASE_URL          Supabase project URL
  SUPABASE_SERVICE_ROLE_KEY         Supabase service role key
  AZURE_OPENAI_ENDPOINT             Azure OpenAI endpoint
  AZURE_OPENAI_API_KEY              Azure OpenAI API key
  AZURE_OPENAI_DEPLOYMENT_NAME      Deployment name (default: gpt-4o)
`);
}

// ============================================================================
// MAIN EXECUTION
// ============================================================================

async function main(): Promise<void> {
  const args = parseArgs();
  
  // Show help
  if (args.help) {
    printHelp();
    process.exit(0);
  }
  
  // Defaults
  const sourceName = args.source || 'canlii_hrto';
  const limit = args.limit || 50;
  
  // Get source config
  const sourceConfig = SOURCE_CONFIGS[sourceName as keyof typeof SOURCE_CONFIGS];
  if (!sourceConfig) {
    console.error(`❌ Unknown source: ${sourceName}`);
    console.error(`Available sources: ${Object.keys(SOURCE_CONFIGS).join(', ')}`);
    process.exit(1);
  }
  
  // Print banner
  console.log('');
  console.log('═══════════════════════════════════════════════════════');
  console.log('📥  ABR INSIGHTS - INGESTION PIPELINE');
  console.log('═══════════════════════════════════════════════════════');
  console.log(`Source:   ${sourceName}`);
  console.log(`Limit:    ${limit} cases`);
  console.log(`Dry Run:  ${args.dryRun ? 'YES' : 'NO'}`);
  console.log(`Resume:   ${args.resume ? 'YES' : 'NO'}`);
  console.log('═══════════════════════════════════════════════════════');
  
  try {
    // Create orchestrator
    const orchestrator = new IngestionOrchestrator();
    
    // Run ingestion
    const result = await orchestrator.run(
      sourceName as any,
      sourceConfig,
      {
        jobType: 'manual',
        limit,
        dryRun: args.dryRun,
        resume: args.resume,
        triggeredBy: 'cli',
      }
    );
    
    // Exit with appropriate code
    if (result.status === 'failed') {
      process.exit(1);
    } else if (result.status === 'partial') {
      process.exit(2);
    } else {
      process.exit(0);
    }
    
  } catch (error) {
    console.error('\n💥 Fatal error:', error);
    process.exit(1);
  }
}

// Run if executed directly
if (require.main === module) {
  main().catch(error => {
    console.error('💥 Unhandled error:', error);
    process.exit(1);
  });
}

export { main };
