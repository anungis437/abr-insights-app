# Utility Scripts

Collection of utility scripts for database management, testing, and development.

## Database Scripts

- **`apply-migration.ts`** - Apply database migrations to Supabase
- **`check-tables.ts`** - Check database table structure and schema
- **`execute-sql.ts`** - Execute SQL commands against the database
- **`get-schema.ts`** - Export current database schema
- **`setup-cases-table.ts`** - Initialize the cases table with proper structure
- **`check-data.js`** - Verify data integrity in the database
- **`validate-schema.js`** - Validate database schema against requirements

## AI/Classification Scripts

- **`analyze-ai-usage.ts`** - Analyze AI classification usage and performance
- **`check-ai-config.ts`** - Verify AI configuration settings
- **`check-ai-data.ts`** - Check AI-classified data quality

## Testing Scripts

- **`test-insert.ts`** - Test database insertion operations
- **`test-supabase-connection.ts`** - Test Supabase connection and authentication
- **`test-supabase.js`** - Basic Supabase functionality tests

## Migration Scripts

- **`run-migration.bat`** - Windows batch script to run migrations
- **`run-migration.ps1`** - PowerShell script to run migrations

## Usage

Most scripts can be run with:

```bash
npx tsx --env-file=.env.local scripts/<script-name>.ts
```

For JavaScript scripts:

```bash
node scripts/<script-name>.js
```

For migration scripts on Windows:

```powershell
.\scripts\run-migration.ps1
```
