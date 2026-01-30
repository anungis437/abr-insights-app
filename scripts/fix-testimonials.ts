import { createClient } from '@supabase/supabase-js'
import * as dotenv from 'dotenv'
import { resolve } from 'path'

// Load environment variables
dotenv.config({ path: resolve(process.cwd(), '.env.local') })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

const supabase = createClient(supabaseUrl, supabaseServiceKey)

async function fixTestimonials() {
  console.log('🔧 Fixing testimonial image URLs...')

  const { data, error } = await supabase
    .from('testimonials')
    .update({ photo_url: null })
    .like('photo_url', '/images/testimonials/%')
    .select()

  if (error) {
    console.error('❌ Error updating testimonials:', error)
    process.exit(1)
  }

  console.log(`✅ Updated ${data?.length || 0} testimonials - removed broken image paths`)
  console.log('Testimonials will now display with initials instead of broken images')
}

fixTestimonials()
