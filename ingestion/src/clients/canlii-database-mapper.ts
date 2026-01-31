/**
 * CanLII Database ID Mapper
 *
 * Discovers available CanLII databases and maps tribunal names to their databaseIds.
 * Used during setup to configure the ingestion pipeline with correct API endpoints.
 *
 * This tool should be run once to generate DATABASE_ID_MAPPING.md
 */

import { CanLIIApiClient, CanLIIDatabase } from './canlii-api'
import { logger } from '../utils/logger'

// ============================================================================
// TYPES
// ============================================================================

/**
 * Mapping of our internal source IDs to CanLII database IDs
 */
interface DatabaseMapping {
  sourceId: string
  tribunalName: string
  databaseId: string
  jurisdiction: string
  matchQuality: 'exact' | 'probable' | 'manual'
  notes?: string
}

// ============================================================================
// KNOWN TRIBUNAL MAPPINGS
// ============================================================================

/**
 * Expected tribunal names and their CanLII databaseIds
 * Based on https://github.com/canlii/API_documentation#getting-a-list-of-courts-and-tribunals
 */
const EXPECTED_TRIBUNALS: Record<string, { pattern: RegExp; sourceId: string }> = {
  // Federal
  'Canadian Human Rights Tribunal': { pattern: /canadian\s+human\s+rights\s+tribunal/i, sourceId: 'canlii_chrt' },

  // Ontario
  'Human Rights Tribunal of Ontario': { pattern: /human\s+rights\s+tribunal\s+of\s+ontario|ontario\s+hrt/i, sourceId: 'canlii_hrto' },

  // British Columbia
  'BC Human Rights Tribunal': { pattern: /bc\s+human\s+rights|british\s+columbia\s+human/i, sourceId: 'canlii_bchrt' },

  // Alberta
  'Alberta Human Rights Commission': { pattern: /alberta\s+human\s+rights|alberta\s+hrc/i, sourceId: 'canlii_abhr' },

  // Saskatchewan
  'Saskatchewan Human Rights Commission': { pattern: /saskatchewan\s+human\s+rights|sask.*hrc/i, sourceId: 'canlii_skhr' },

  // Manitoba
  'Manitoba Human Rights Commission': { pattern: /manitoba\s+human\s+rights|manitoba\s+hrc/i, sourceId: 'canlii_mbhr' },

  // Quebec
  'Quebec Tribunal des droits de la personne': { pattern: /quebec|qc\s+tribunal|droits\s+de\s+la\s+personne/i, sourceId: 'canlii_qctdp' },

  // Atlantic Provinces
  'New Brunswick Human Rights': { pattern: /new\s+brunswick\s+human|nb\s+hrc/i, sourceId: 'canlii_nbhr' },
  'Nova Scotia Human Rights': { pattern: /nova\s+scotia\s+human|ns\s+hrc/i, sourceId: 'canlii_nshr' },
  'PEI Human Rights': { pattern: /pei\s+human|prince\s+edward\s+island|pe.*hrc/i, sourceId: 'canlii_peihr' },
  'Newfoundland & Labrador Human Rights': { pattern: /newfoundland|labrador\s+human|nl.*hrc/i, sourceId: 'canlii_nlhr' },

  // Territories
  'Yukon Human Rights': { pattern: /yukon\s+human|yt.*hrc/i, sourceId: 'canlii_ythr' },
  'Northwest Territories Human Rights': { pattern: /northwest\s+territories|nt.*hrc/i, sourceId: 'canlii_nthr' },
  'Nunavut Human Rights': { pattern: /nunavut\s+human|nu.*hrc/i, sourceId: 'canlii_nuhr' },
}

// ============================================================================
// DATABASE MAPPER CLASS
// ============================================================================

export class CanLIIDatabaseMapper {
  private client: CanLIIApiClient
  private discoveries: DatabaseMapping[] = []

  constructor(apiClient: CanLIIApiClient) {
    this.client = apiClient
  }

  /**
   * Discover all CanLII databases and match them to our tribunal types
   */
  async discoverAllDatabases(): Promise<DatabaseMapping[]> {
    try {
      logger.info('Starting CanLII database discovery...')

      // Fetch all available databases from CanLII API
      const databases = await this.client.getCaseDatabases()

      if (!databases || databases.length === 0) {
        logger.error('No databases returned from CanLII API')
        return []
      }

      logger.info(`Found ${databases.length} databases in CanLII`)

      // Match each database to our tribunals
      const mappings: DatabaseMapping[] = []

      for (const db of databases) {
        const matching = this.matchDatabase(db)
        if (matching) {
          mappings.push(matching)
          logger.info(`Matched: ${db.name} → ${matching.sourceId}`, {
            databaseId: db.databaseId,
            matchQuality: matching.matchQuality,
          })
        }
      }

      // Log unmapped databases
      const unmapped = databases.filter((db) => !mappings.find((m) => m.databaseId === db.databaseId))
      if (unmapped.length > 0) {
        logger.info(`${unmapped.length} databases not mapped:`, {
          names: unmapped.map((db) => `${db.name} (${db.databaseId})`),
        })
      }

      this.discoveries = mappings
      return mappings
    } catch (error) {
      logger.error('Database discovery failed', { error })
      throw error
    }
  }

  /**
   * Match a CanLII database to one of our source systems
   */
  private matchDatabase(db: CanLIIDatabase): DatabaseMapping | null {
    const dbName = db.name
    const dbId = db.databaseId

    // Try exact matches first
    for (const [expectedName, config] of Object.entries(EXPECTED_TRIBUNALS)) {
      if (config.pattern.test(dbName)) {
        return {
          sourceId: config.sourceId,
          tribunalName: dbName,
          databaseId: dbId,
          jurisdiction: db.jurisdiction,
          matchQuality: expectedName === dbName ? 'exact' : 'probable',
        }
      }
    }

    // If no match found, log for manual review
    logger.debug(`No automatic match found for: ${dbName} (${dbId})`)
    return null
  }

  /**
   * Get discovered mappings
   */
  getMappings(): DatabaseMapping[] {
    return this.discoveries
  }

  /**
   * Generate markdown documentation of mappings
   */
  generateMarkdown(): string {
    const mappings = this.discoveries

    let md = '# CanLII Database ID Mappings\n\n'
    md += '**Generated:** ' + new Date().toISOString() + '\n\n'
    md += `**Total Mapped:** ${mappings.length}\n\n`

    md += '| Source ID | Tribunal Name | CanLII ID | Jurisdiction | Match Quality |\n'
    md += '|---|---|---|---|---|\n'

    for (const m of mappings.sort((a, b) => a.sourceId.localeCompare(b.sourceId))) {
      md += `| \`${m.sourceId}\` | ${m.tribunalName} | \`${m.databaseId}\` | ${m.jurisdiction} | ${m.matchQuality} |\n`
    }

    md += '\n## Configuration\n\n'
    md += 'Use these mappings in `ingestion/src/config/index.ts` for SOURCE_CONFIGS:\n\n'
    md += '```typescript\n'

    for (const m of mappings.sort((a, b) => a.sourceId.localeCompare(b.sourceId))) {
      md += `  ${m.sourceId}: {\n`
      md += `    databaseId: '${m.databaseId}',\n`
      md += `    // ... other config\n`
      md += `  },\n`
    }

    md += '```\n'

    return md
  }

  /**
   * Export as JSON for programmatic use
   */
  toJSON(): Record<string, string> {
    const result: Record<string, string> = {}
    for (const m of this.discoveries) {
      result[m.sourceId] = m.databaseId
    }
    return result
  }
}

// ============================================================================
// CLI RUNNER
// ============================================================================

/**
 * Run database discovery (intended for CLI use)
 */
export async function runDatabaseDiscovery(apiKey?: string): Promise<void> {
  const client = new CanLIIApiClient(apiKey)

  // Validate connection first
  logger.info('Validating CanLII API connection...')
  const isValid = await client.validateConnection()

  if (!isValid) {
    throw new Error('Failed to validate CanLII API connection. Check your API key.')
  }

  // Discover databases
  const mapper = new CanLIIDatabaseMapper(client)
  const mappings = await mapper.discoverAllDatabases()

  // Output results
  console.log('\n=== CanLII Database Discovery Results ===\n')
  console.log(`Total tribunals mapped: ${mappings.length}`)
  console.log('\nMappings:')
  console.table(
    mappings.map((m) => ({
      'Source ID': m.sourceId,
      'Tribunal': m.tribunalName,
      'Database ID': m.databaseId,
      'Jurisdiction': m.jurisdiction,
    }))
  )

  // Generate markdown
  const md = mapper.generateMarkdown()
  console.log('\n=== Markdown Output ===\n')
  console.log(md)

  // Export JSON
  const json = mapper.toJSON()
  console.log('\n=== JSON Mapping ===\n')
  console.log(JSON.stringify(json, null, 2))

  logger.info('Database discovery complete', {
    totalMapped: mappings.length,
    timestamp: new Date().toISOString(),
  })
}
