import { config } from 'dotenv'
import { resolve } from 'path'
import { Client } from 'pg'

config({ path: resolve(process.cwd(), '.env.local') })

const client = new Client({
  connectionString: process.env.DATABASE_URL,
})

async function setupStorageBucket() {
  try {
    await client.connect()
    console.log('🔌 Connected to database\n')

    // 1. Create storage bucket (if not exists)
    console.log('📦 Creating storage bucket: evidence-bundle-pdfs...')

    const bucketExists = await client.query(`
      SELECT EXISTS (
        SELECT FROM storage.buckets 
        WHERE id = 'evidence-bundle-pdfs'
      );
    `)

    if (bucketExists.rows[0].exists) {
      console.log('✅ Bucket already exists')
    } else {
      await client.query(`
        INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
        VALUES (
          'evidence-bundle-pdfs',
          'evidence-bundle-pdfs',
          false,
          52428800, -- 50 MB
          ARRAY['application/pdf', 'application/zip']
        );
      `)
      console.log('✅ Bucket created')
    }

    // 2. Create RLS policies for storage bucket
    console.log('\n🔐 Setting up storage bucket RLS policies...')

    // Drop existing policies if they exist
    await client.query(`
      DROP POLICY IF EXISTS "Users can download org evidence bundles" ON storage.objects;
      DROP POLICY IF EXISTS "Authenticated users can upload evidence bundles" ON storage.objects;
      DROP POLICY IF EXISTS "Admins can delete evidence bundles" ON storage.objects;
    `)

    // Policy 1: SELECT (Download)
    await client.query(`
      CREATE POLICY "Users can download org evidence bundles"
      ON storage.objects FOR SELECT
      USING (
        bucket_id = 'evidence-bundle-pdfs' 
        AND EXISTS (
          SELECT 1 
          FROM evidence_bundle_pdfs eb
          JOIN profiles p ON eb.case_id IN (
            SELECT id FROM tribunal_cases WHERE organization_id = p.organization_id
          )
          WHERE eb.storage_path = name
          AND p.id = auth.uid()
        )
      );
    `)
    console.log('✅ Download policy created')

    // Policy 2: INSERT (Upload)
    await client.query(`
      CREATE POLICY "Authenticated users can upload evidence bundles"
      ON storage.objects FOR INSERT
      WITH CHECK (
        bucket_id = 'evidence-bundle-pdfs'
        AND auth.role() = 'authenticated'
      );
    `)
    console.log('✅ Upload policy created')

    // Policy 3: DELETE (Admin only)
    await client.query(`
      CREATE POLICY "Admins can delete evidence bundles"
      ON storage.objects FOR DELETE
      USING (
        bucket_id = 'evidence-bundle-pdfs'
        AND EXISTS (
          SELECT 1 FROM profiles
          WHERE id = auth.uid()
          AND role = 'admin'
        )
      );
    `)
    console.log('✅ Delete policy created')

    // 3. Verify setup
    console.log('\n🔍 Verifying configuration...')

    const bucket = await client.query(`
      SELECT id, name, public, file_size_limit, allowed_mime_types
      FROM storage.buckets
      WHERE id = 'evidence-bundle-pdfs';
    `)

    if (bucket.rows.length > 0) {
      const b = bucket.rows[0]
      console.log('\n📋 Bucket configuration:')
      console.log(`  Name: ${b.name}`)
      console.log(`  Public: ${b.public ? 'Yes ⚠️' : 'No ✅'}`)
      console.log(`  Size limit: ${(b.file_size_limit / 1024 / 1024).toFixed(0)} MB`)
      console.log(`  MIME types: ${b.allowed_mime_types.join(', ')}`)
    }

    const policies = await client.query(`
      SELECT COUNT(*) as policy_count
      FROM pg_policies
      WHERE schemaname = 'storage'
      AND tablename = 'objects'
      AND policyname LIKE '%evidence bundles%';
    `)

    console.log(`\n✅ ${policies.rows[0].policy_count} storage policies active`)

    console.log('\n✅ Storage bucket setup complete!\n')
    console.log('📝 Summary:')
    console.log('  ✅ evidence-bundle-pdfs bucket created')
    console.log('  ✅ RLS policies configured')
    console.log('  ✅ Ready for PDF generation\n')
  } catch (error: any) {
    console.error('❌ Setup failed:', error.message)
    console.error(error)
    process.exit(1)
  } finally {
    await client.end()
  }
}

setupStorageBucket()
