import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const appDir = path.join(__dirname, '..', 'app')

interface PageCheck {
  path: string
  hasNavigation: boolean
  isAuthPage: boolean
  isAdminPage: boolean
  content: string
}

function getAllPageFiles(dir: string, basePath = ''): string[] {
  const pages: string[] = []
  const items = fs.readdirSync(dir, { withFileTypes: true })

  for (const item of items) {
    const fullPath = path.join(dir, item.name)
    const relativePath = path.join(basePath, item.name)

    if (item.isDirectory()) {
      pages.push(...getAllPageFiles(fullPath, relativePath))
    } else if (item.name === 'page.tsx') {
      pages.push(relativePath)
    }
  }

  return pages
}

function checkPage(pagePath: string): PageCheck {
  const fullPath = path.join(appDir, pagePath)
  const content = fs.readFileSync(fullPath, 'utf-8')

  const hasNavigation =
    content.includes('<Navigation') ||
    content.includes('import Navigation') ||
    content.includes("from '@/components/shared/Navigation'")

  const isAuthPage = pagePath.startsWith('auth')
  const isAdminPage = pagePath.startsWith('admin')

  return {
    path: pagePath,
    hasNavigation,
    isAuthPage,
    isAdminPage,
    content,
  }
}

console.log('🔍 Checking Navigation coverage across all pages...\n')

const allPages = getAllPageFiles(appDir)
const pageChecks = allPages.map(checkPage)

// Group pages
const withNav = pageChecks.filter((p) => p.hasNavigation)
const withoutNav = pageChecks.filter((p) => !p.hasNavigation)
const authPages = withoutNav.filter((p) => p.isAuthPage)
const adminPages = withoutNav.filter((p) => p.isAdminPage)
const otherPages = withoutNav.filter((p) => !p.isAuthPage && !p.isAdminPage)

console.log('📊 SUMMARY:')
console.log(`Total pages: ${allPages.length}`)
console.log(`✅ With Navigation: ${withNav.length}`)
console.log(`❌ Without Navigation: ${withoutNav.length}`)
console.log(`   - Auth pages (expected): ${authPages.length}`)
console.log(`   - Admin pages: ${adminPages.length}`)
console.log(`   - Other pages: ${otherPages.length}`)

console.log('\n✅ PAGES WITH NAVIGATION:')
withNav.forEach((p) => console.log(`   ${p.path}`))

console.log('\n⚠️  AUTH PAGES (no nav expected):')
authPages.forEach((p) => console.log(`   ${p.path}`))

if (adminPages.length > 0) {
  console.log('\n❌ ADMIN PAGES WITHOUT NAVIGATION:')
  adminPages.forEach((p) => console.log(`   ${p.path}`))
}

if (otherPages.length > 0) {
  console.log('\n❌ OTHER PAGES WITHOUT NAVIGATION (NEED FIXING):')
  otherPages.forEach((p) => console.log(`   ${p.path}`))
}

console.log('\n' + '='.repeat(60))

if (otherPages.length === 0 && adminPages.length === 0) {
  console.log('✅ All non-auth pages have Navigation!')
} else {
  console.log(`⚠️  Found ${otherPages.length + adminPages.length} pages that need Navigation added`)
}
