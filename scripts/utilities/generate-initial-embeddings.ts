/**
 * Generate Initial Embeddings
 *
 * This script generates embeddings for all existing cases and courses in the database.
 * It uses the embedding service to batch process content and track progress.
 *
 * Usage:
 *   npx tsx --env-file=.env.local scripts/generate-initial-embeddings.ts [--type cases|courses|all]
 *
 * Options:
 *   --type    Type of embeddings to generate (cases, courses, or all). Default: all
 *
 * Environment Variables Required:
 *   NEXT_PUBLIC_SUPABASE_URL
 *   SUPABASE_SERVICE_ROLE_KEY
 *   AZURE_OPENAI_ENDPOINT
 *   AZURE_OPENAI_KEY
 *
 * Example:
 *   npx tsx --env-file=.env.local scripts/generate-initial-embeddings.ts --type cases
 */

import {
  generateAllCaseEmbeddings,
  generateAllCourseEmbeddings,
} from '../../lib/services/embedding-service'

async function main() {
  const args = process.argv.slice(2)
  const typeArg = args.find((arg) => arg.startsWith('--type='))?.split('=')[1] || 'all'
  const type = typeArg.toLowerCase()

  if (!['cases', 'courses', 'all'].includes(type)) {
    console.error('❌ Invalid type. Must be: cases, courses, or all')
    process.exit(1)
  }

  // Validate environment variables
  const required = [
    'NEXT_PUBLIC_SUPABASE_URL',
    'SUPABASE_SERVICE_ROLE_KEY',
    'AZURE_OPENAI_ENDPOINT',
    'AZURE_OPENAI_KEY',
  ]

  const missing = required.filter((key) => !process.env[key])
  if (missing.length > 0) {
    console.error('❌ Missing required environment variables:')
    missing.forEach((key) => console.error(`   - ${key}`))
    process.exit(1)
  }

  console.log('🚀 Starting Initial Embedding Generation')
  console.log('==========================================')
  console.log()
  console.log('📊 Configuration:')
  console.log(`   Type: ${type}`)
  console.log(`   Model: text-embedding-3-large (1536 dimensions)`)
  console.log(`   Batch Size: 100 items`)
  console.log(`   Max Concurrent: 5 requests`)
  console.log()
  console.log('⚠️  This will make many Azure OpenAI API calls')
  console.log('⚠️  Estimated cost: ~$0.0001-0.0003 per case/course')
  console.log()

  const startTime = Date.now()

  try {
    if (type === 'cases' || type === 'all') {
      console.log('📝 Generating case embeddings...')
      console.log('-----------------------------------')
      const caseJob = await generateAllCaseEmbeddings()
      console.log(`✅ Case embeddings job created: ${caseJob.jobId}`)
      console.log(`   Status: ${caseJob.status}`)
      console.log(`   Total Items: ${caseJob.totalItems}`)
      console.log(`   Processed: ${caseJob.processedItems}/${caseJob.totalItems}`)
      if (caseJob.metrics) {
        console.log(`   Duration: ${caseJob.metrics.durationSeconds}s`)
        console.log(`   Throughput: ${caseJob.metrics.itemsPerSecond} items/s`)
      }
      console.log()
    }

    if (type === 'courses' || type === 'all') {
      console.log('📚 Generating course embeddings...')
      console.log('-----------------------------------')
      const courseJob = await generateAllCourseEmbeddings()
      console.log(`✅ Course embeddings job created: ${courseJob.jobId}`)
      console.log(`   Status: ${courseJob.status}`)
      console.log(`   Total Items: ${courseJob.totalItems}`)
      console.log(`   Processed: ${courseJob.processedItems}/${courseJob.totalItems}`)
      if (courseJob.metrics) {
        console.log(`   Duration: ${courseJob.metrics.durationSeconds}s`)
        console.log(`   Throughput: ${courseJob.metrics.itemsPerSecond} items/s`)
      }
      console.log()
    }

    const endTime = Date.now()
    const totalSeconds = ((endTime - startTime) / 1000).toFixed(2)

    console.log('==========================================')
    console.log('✅ Embedding Generation Complete')
    console.log(`⏱️  Total Time: ${totalSeconds}s`)
    console.log()
    console.log('📊 Next Steps:')
    console.log('   1. Check the admin ML dashboard: /admin/ml')
    console.log('   2. Test semantic search in the Search Test tab')
    console.log('   3. Monitor job progress in the Embeddings tab')
    console.log()
    console.log('💡 Tips:')
    console.log('   - View job details: SELECT * FROM embedding_jobs ORDER BY created_at DESC;')
    console.log('   - Check coverage: SELECT * FROM get_embedding_coverage_stats();')
    console.log(
      '   - Test search: POST /api/embeddings/search-cases with {"query": "discrimination"}'
    )
    console.log()
  } catch (error) {
    console.error()
    console.error('❌ Embedding generation failed')
    console.error('==========================================')
    if (error instanceof Error) {
      console.error('Error:', error.message)
      if (error.stack) {
        console.error()
        console.error('Stack trace:')
        console.error(error.stack)
      }
    } else {
      console.error('Error:', error)
    }
    console.error()
    console.error('💡 Troubleshooting:')
    console.error('   1. Verify Azure OpenAI credentials in .env.local')
    console.error('   2. Check Supabase service role key is valid')
    console.error('   3. Ensure database migrations are applied')
    console.error('   4. Review logs above for specific error details')
    console.error()
    process.exit(1)
  }
}

// Run the script
main().catch((error) => {
  console.error('Fatal error:', error)
  process.exit(1)
})
