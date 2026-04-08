import { defineConfig, type Plugin } from 'vite'
import path from 'path'
import fs from 'fs'
import https from 'https'
import tailwindcss from '@tailwindcss/vite'
import react from '@vitejs/plugin-react'

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// AVATAR DOWNLOAD MANIFEST
// Maps person IDs → source URLs for build-time image extraction.
// During `vite build`, each URL is fetched, saved to /public/avatars/
// as a production-safe JPEG, and referenced via /avatars/{id}.jpg.
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
const AVATAR_DOWNLOAD_MANIFEST: Record<string, string> = {
  taylor:   'https://images.unsplash.com/photo-1769636929388-99eff95d3bf1?w=200&h=200&fit=crop&crop=face&auto=format&q=80',
  jake:     'https://images.unsplash.com/photo-1762753674498-73ec49feafc4?w=200&h=200&fit=crop&crop=face&auto=format&q=80',
  tori:     'https://images.unsplash.com/photo-1765005204058-10418f5123c5?w=200&h=200&fit=crop&crop=face&auto=format&q=80',
  kelly:    'https://images.unsplash.com/photo-1675904599648-68daf9c8770b?w=200&h=200&fit=crop&crop=face&auto=format&q=80',
  carson:   'https://images.unsplash.com/photo-1769636930047-4478f12cf430?w=200&h=200&fit=crop&crop=face&auto=format&q=80',
  kayla:    'https://images.unsplash.com/photo-1584217881127-86df892ae1d0?w=200&h=200&fit=crop&crop=face&auto=format&q=80',
  joy:      'https://images.unsplash.com/photo-1633701376686-3904bc80f050?w=200&h=200&fit=crop&crop=face&auto=format&q=80',
  jen:      'https://images.unsplash.com/photo-1758598306913-5cd682b9e53b?w=200&h=200&fit=crop&crop=face&auto=format&q=80',
  rachel:   'https://images.unsplash.com/photo-1758598304332-94b40ce7c7b4?w=200&h=200&fit=crop&crop=face&auto=format&q=80',
  jack:     'https://images.unsplash.com/photo-1769636929261-e913ed023c83?w=200&h=200&fit=crop&crop=face&auto=format&q=80',
  ben:      'https://images.unsplash.com/photo-1619241805829-34fb64299391?w=200&h=200&fit=crop&crop=face&auto=format&q=80',
  brittney: 'https://images.unsplash.com/photo-1659353220612-2f4adc1d6d42?w=200&h=200&fit=crop&crop=face&auto=format&q=80',
  rebecca:  'https://images.unsplash.com/photo-1758518729459-235dcaadc611?w=200&h=200&fit=crop&crop=face&auto=format&q=80',
  miranda:  'https://images.unsplash.com/photo-1618593706014-06782cd3bb3b?w=200&h=200&fit=crop&crop=face&auto=format&q=80',
}

// All 14 team member IDs — used for exhaustive checks
const ALL_MEMBER_IDS = Object.keys(AVATAR_DOWNLOAD_MANIFEST)

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// FIGMA ASSET → LOCAL AVATAR MAPPING
// Every known figma:asset hash → ABSOLUTE root path starting with
// /avatars/.  No relative paths.  No /assets/ references.
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
const AVATAR_MANIFEST: Record<string, string> = {
  // headshot-assets.ts (active app pipeline)
  'a56f8031b24a6448a073e451604538a99b8c6304.png': '/avatars/taylor.jpg',
  '143f6a69c403a3260602fe5ec84bfa9d4dcea7dc.png': '/avatars/tori.jpg',
  '58787c6b18d29e16e4befd3097bb9bc4d9e15bdd.png': '/avatars/jake.jpg',
  '9063a7dd6c4592d04c38d2d3de64c1d99245ba07.png': '/avatars/kelly.jpg',
  '8e3d275f2f8acfbb1ad51a8d9b7c6100e380c4e6.png': '/avatars/kayla.jpg',
  '2de9c2bf40ba1a30193c412a5a594fd9ce79e143.png': '/avatars/joy.jpg',
  '358fa06ae076026179b0b680397fc74976165545.png': '/avatars/jen.jpg',
  'bed871db41b79f68ec909f66b0a07252a0f9c07f.png': '/avatars/rachel.jpg',
  'f3696d74b99cdc9f581723b53ab0d455420e28ba.png': '/avatars/miranda.jpg',
  '5e1188ac9fe17e763ef3118520e6a5f43494af32.png': '/avatars/carson.jpg',
  '8359c15443eead0680b8d8b48af73270dc0109db.png': '/avatars/jack.jpg',
  'ab7d53b7a6327ae29caa6533f382b9704182d5ba.png': '/avatars/ben.jpg',
  '1a6733453f26c6fa0e496a28159a87504a26446a.png': '/avatars/brittney.jpg',
  'e1aecd8025be48cfe7449eaa364773fd0c49a264.png': '/avatars/rebecca.jpg',

  // TeamWeekAgenda.tsx (Figma import — different hashes, same people)
  '770d6e33616e19984dfe31fd6185fb2a2405aa33.png': '/avatars/taylor.jpg',
  '1eb72f69d04c8e1e36122f61a8e7cac2acbad8b3.png': '/avatars/tori.jpg',
  '6be1869d2b2f3689126f9cb9a2760f4cbb29c579.png': '/avatars/jake.jpg',
  '0683c8fababd97ca007605f062acd57634e76ded.png': '/avatars/rebecca.jpg',
  'c6f351d6dc23b80e4acd6f94fc7c41b485e45925.png': '/avatars/brittney.jpg',
  '4aa8f8437211fb9276cf0256b5e8b26988b98081.png': '/avatars/ben.jpg',
  '2776b5bafe3a4634c164780ad96e008d9241fd21.png': '/avatars/kayla.jpg',
  '57d442ca81c5761ad040814ee32d16c9716a03f9.png': '/avatars/jen.jpg',
  'fb38d7e01b663ea21c58e1fb00c4975a20e58348.png': '/avatars/rachel.jpg',
  '2834cd45999104915ff04b1f2966e701decface4.png': '/avatars/carson.jpg',
  'fa86911d92482ea4923dc9b0c5f927f72767d3b9.png': '/avatars/miranda.jpg',
  'e2690d3ff813993832025830c886e55fdefb4c94.png': '/avatars/jack.jpg',
  'b094960fdbbb4e698334acd3ebd596a10a516b52.png': '/avatars/joy.jpg',
  '972974546d0dccade7ada521972afba20e7d5801.png': '/avatars/kelly.jpg',
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// SELF-CHECK: validate AVATAR_MANIFEST paths at module load time
// Every value MUST begin with exactly "/avatars/" — no exceptions.
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
;(function assertManifestPaths() {
  for (const [hash, p] of Object.entries(AVATAR_MANIFEST)) {
    if (!p.startsWith('/avatars/')) {
      throw new Error(
        `AVATAR_MANIFEST path violation: "${p}" for hash ${hash} ` +
        `does not start with "/avatars/". All avatar paths must be ` +
        `absolute root paths in the format /avatars/filename.jpg`
      )
    }
  }
})()

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// UTILITY: follow-redirect HTTPS download
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
function httpsGet(url: string, maxRedirects = 5): Promise<Buffer> {
  return new Promise((resolve, reject) => {
    if (maxRedirects <= 0) return reject(new Error('Too many redirects'))
    https.get(url, (res) => {
      if (res.statusCode && res.statusCode >= 300 && res.statusCode < 400 && res.headers.location) {
        resolve(httpsGet(res.headers.location, maxRedirects - 1))
        return
      }
      if (res.statusCode !== 200) {
        reject(new Error(`HTTP ${res.statusCode} for ${url}`))
        return
      }
      const chunks: Buffer[] = []
      res.on('data', (chunk: Buffer) => chunks.push(chunk))
      res.on('end', () => resolve(Buffer.concat(chunks)))
      res.on('error', reject)
    }).on('error', reject)
  })
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// STEP 1 — Download avatar images to /public/avatars/
// Skips files that already exist as valid raster images (> 512 bytes).
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
async function downloadAvatars(projectRoot: string): Promise<void> {
  const avatarDir = path.resolve(projectRoot, 'public', 'avatars')
  if (!fs.existsSync(avatarDir)) {
    fs.mkdirSync(avatarDir, { recursive: true })
  }

  const entries = Object.entries(AVATAR_DOWNLOAD_MANIFEST)
  const results = await Promise.allSettled(
    entries.map(async ([id, url]) => {
      const dest = path.join(avatarDir, `${id}.jpg`)

      // Skip if a valid raster image already exists
      if (fs.existsSync(dest)) {
        const stat = fs.statSync(dest)
        if (stat.size > 512) {
          const head = fs.readFileSync(dest, { encoding: 'utf8', flag: 'r' }).slice(0, 10)
          if (!head.startsWith('<svg') && !head.startsWith('<?xml')) {
            console.log(`  ✓ ${id}.jpg — cached (${(stat.size / 1024).toFixed(1)} KB)`)
            return
          }
        }
        console.log(`  ↻ ${id}.jpg — replacing placeholder with real image`)
      }

      console.log(`  ↓ ${id}.jpg — downloading…`)
      const buffer = await httpsGet(url)
      if (buffer.length < 256) {
        throw new Error(`Downloaded file for ${id} is suspiciously small (${buffer.length} bytes)`)
      }
      fs.writeFileSync(dest, buffer)
      console.log(`  ✓ ${id}.jpg — saved (${(buffer.length / 1024).toFixed(1)} KB)`)
    })
  )

  const failures = results
    .map((r, i) => (r.status === 'rejected' ? { id: entries[i][0], reason: r.reason } : null))
    .filter(Boolean) as { id: string; reason: Error }[]

  if (failures.length > 0) {
    const msg = [
      '',
      '╔══════════════════════════════════════════════════════════════╗',
      '║  AVATAR DOWNLOAD FAILED — build halted                      ║',
      '╚══════════════════════════════════════════════════════════════╝',
      '',
      ...failures.map((f) => `  ✗ ${f.id}.jpg — ${f.reason.message}`),
      '',
      'All avatar images are REQUIRED production assets.',
      'Fix the URLs in AVATAR_DOWNLOAD_MANIFEST and rebuild.',
      '',
    ].join('\n')
    throw new Error(msg)
  }
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// STEP 2 — Validate every manifest entry is a real raster image file
// No fallback.  No initials.  No SVG placeholder.
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
function validateAvatarAssets(projectRoot: string): void {
  const errors: string[] = []
  const seen = new Set<string>()

  for (const [hash, localPath] of Object.entries(AVATAR_MANIFEST)) {
    if (seen.has(localPath)) continue
    seen.add(localPath)

    // Path-format check: must be absolute /avatars/
    if (!localPath.startsWith('/avatars/')) {
      errors.push(`  ✗ ${localPath} — INVALID PATH: must start with /avatars/ (hash: ${hash.slice(0, 12)}…)`)
      continue
    }

    const absolute = path.resolve(projectRoot, 'public', localPath.slice(1))

    if (!fs.existsSync(absolute)) {
      errors.push(`  ✗ ${localPath} — FILE NOT FOUND (hash: ${hash.slice(0, 12)}…)`)
      continue
    }

    const stat = fs.statSync(absolute)
    const head = fs.readFileSync(absolute, { encoding: 'utf8', flag: 'r' }).slice(0, 10)
    if (head.startsWith('<svg') || head.startsWith('<?xml')) {
      errors.push(`  ✗ ${localPath} — SVG placeholder detected (${stat.size} bytes). Real raster image required.`)
      continue
    }
    if (stat.size < 256) {
      errors.push(`  ✗ ${localPath} — File too small (${stat.size} bytes), likely corrupt`)
    }
  }

  if (errors.length > 0) {
    const msg = [
      '',
      '╔══════════════════════════════════════════════════════════════╗',
      '║  ASSET VALIDATION FAILED — build halted                     ║',
      '║  Avatar images are REQUIRED production assets.              ║',
      '║  Initials/placeholder fallbacks are DISABLED.               ║',
      '╚══════════════════════════════════════════════════════════════╝',
      '',
      ...errors,
      '',
      'Every team member must have a real raster image (JPG/PNG/WebP)',
      'at an absolute /avatars/ root path.  No relative paths allowed.',
      '',
    ].join('\n')
    throw new Error(msg)
  }
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// STEP 3 — Post-bundle: scan for unsafe/temporary image URLs
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
function scanForUnsafeUrls(outDir: string): string[] {
  const UNSAFE_PATTERNS = [
    { pattern: /blob:/gi,                              label: 'blob: URL' },
    { pattern: /figmacdn\.com/gi,                      label: 'Figma CDN URL' },
    { pattern: /amazonaws\.com[^"']*Signature=/gi,     label: 'Signed AWS URL' },
    { pattern: /cloudfront\.net[^"']*Signature=/gi,    label: 'Signed CloudFront URL' },
    { pattern: /data:image\/png;base64,.{500,}/gi,     label: 'Large base64 PNG' },
    { pattern: /data:image\/jpeg;base64,.{500,}/gi,    label: 'Large base64 JPEG' },
  ]

  const warnings: string[] = []
  const assetsDir = path.join(outDir, 'assets')
  if (!fs.existsSync(assetsDir)) return warnings

  const jsFiles = fs.readdirSync(assetsDir).filter((f: string) => f.endsWith('.js'))

  for (const file of jsFiles) {
    const content = fs.readFileSync(path.join(assetsDir, file), 'utf-8')
    for (const { pattern, label } of UNSAFE_PATTERNS) {
      const matches = content.match(pattern)
      if (matches) {
        const msg = `  ⚠ assets/${file}: ${matches.length}× ${label} — ${matches[0].slice(0, 100)}…`
        warnings.push(msg)
        console.warn(msg)
      }
    }
  }

  return warnings
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// STEP 4 — Post-bundle: verify /avatars/ directory and files in dist/
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
function verifyDistAvatars(outDir: string): void {
  // 4a. /avatars/ directory must exist at dist root
  const avatarsInDist = path.join(outDir, 'avatars')
  if (!fs.existsSync(avatarsInDist)) {
    throw new Error(
      '\n\nBUILD HALTED: dist/avatars/ directory does not exist.\n' +
      'The /avatars/ directory must exist at the project root in the exported build.\n'
    )
  }

  // 4b. Every manifest path must have a corresponding file
  const seen = new Set<string>()
  const missing: string[] = []

  for (const localPath of Object.values(AVATAR_MANIFEST)) {
    if (seen.has(localPath)) continue
    seen.add(localPath)
    const distFile = path.join(outDir, localPath.slice(1))
    if (!fs.existsSync(distFile)) {
      missing.push(`  ✗ ${localPath} — not found in dist/`)
    }
  }

  if (missing.length > 0) {
    const msg = [
      '',
      '╔══════════════════════════════════════════════════════════════╗',
      '║  POST-BUILD VERIFICATION FAILED                             ║',
      '║  Avatar images missing from dist/ output                    ║',
      '╚══════════════════════════════════════════════════════════════╝',
      '',
      ...missing,
      '',
    ].join('\n')
    throw new Error(msg)
  }

  console.log(`  ✓ dist/avatars/ directory exists with all ${seen.size} avatar images`)
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// STEP 5 — Post-bundle: scan compiled JS for INCORRECT avatar paths
// Catches relative paths (./avatars/, avatars/), /assets/ avatar refs,
// and any avatar filename not prefixed with exactly "/avatars/".
// If found, the build halts — these must be rewritten before export.
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
function scanForIncorrectAvatarPaths(outDir: string): void {
  const assetsDir = path.join(outDir, 'assets')
  if (!fs.existsSync(assetsDir)) return

  const jsFiles = fs.readdirSync(assetsDir).filter((f: string) => f.endsWith('.js'))

  // Build a regex that matches any avatar filename NOT preceded by "/avatars/"
  // This catches:  ./avatars/taylor.jpg  avatars/taylor.jpg  /assets/taylor.jpg
  const nameAlts = ALL_MEMBER_IDS.join('|')

  const BAD_PATH_PATTERNS = [
    // Relative: ./avatars/name.jpg or ../avatars/name.jpg
    { pattern: new RegExp(`\\.+/avatars/(${nameAlts})\\.`, 'gi'), label: 'relative ./avatars/ path' },
    // Missing leading slash: "avatars/name.jpg" (not preceded by /)
    { pattern: new RegExp(`[^/]avatars/(${nameAlts})\\.`, 'gi'), label: 'avatars/ without leading /' },
    // Avatar file inside /assets/ instead of /avatars/
    { pattern: new RegExp(`/assets/(${nameAlts})\\.(jpg|png|svg|webp)`, 'gi'), label: '/assets/ avatar reference' },
  ]

  const violations: string[] = []

  for (const file of jsFiles) {
    const content = fs.readFileSync(path.join(assetsDir, file), 'utf-8')
    for (const { pattern, label } of BAD_PATH_PATTERNS) {
      const matches = content.match(pattern)
      if (matches) {
        violations.push(`  ✗ assets/${file}: ${matches.length}× ${label} — e.g. "${matches[0]}"`)
      }
    }
  }

  if (violations.length > 0) {
    const msg = [
      '',
      '╔══════════════════════════════════════════════════════════════╗',
      '║  AVATAR PATH VIOLATION — build halted                       ║',
      '║  All avatar <img> src paths must be absolute: /avatars/…    ║',
      '║  Relative paths and /assets/ references are NOT allowed.    ║',
      '╚══════════════════════════════════════════════════════════════╝',
      '',
      ...violations,
      '',
      'Correct format:  /avatars/taylor.jpg',
      'Wrong formats:   ./avatars/taylor.jpg  avatars/taylor.jpg  /assets/taylor.jpg',
      '',
    ].join('\n')
    throw new Error(msg)
  }

  console.log(`  ✓ All avatar paths in compiled JS use absolute /avatars/ root paths`)
}


// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// VITE PLUGIN
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
function figmaAssetPlugin(): Plugin {
  const PREFIX = 'figma:asset/'
  const RESOLVED_PREFIX = '\0figma-asset:'

  let isBuild = false

  return {
    name: 'figma-asset-resolver',

    config(_cfg, { command }) {
      isBuild = command === 'build'
    },

    async buildStart() {
      if (!isBuild) return

      console.log('')
      console.log('━━━ Pre-Export Avatar Asset Normalization ━━━━━━━━━━━━━━━━━━━')
      console.log('')

      // Step 1: Download real headshot images to /public/avatars/
      console.log('① Downloading avatar images to /public/avatars/…')
      await downloadAvatars(__dirname)
      console.log('')

      // Step 2: Validate all files are real raster images at /avatars/ paths
      console.log('② Validating avatar assets (no placeholders, no relative paths)…')
      validateAvatarAssets(__dirname)
      console.log('  ✓ All avatar images validated as real raster images at /avatars/ root paths.')
      console.log('')

      console.log('━━━ Asset normalization complete ━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
      console.log('')
    },

    resolveId(source) {
      if (!isBuild) return null
      if (source.startsWith(PREFIX)) {
        return RESOLVED_PREFIX + source.slice(PREFIX.length)
      }
      return null
    },

    load(id) {
      if (!isBuild) return null
      if (!id.startsWith(RESOLVED_PREFIX)) return null

      const filename = id.slice(RESOLVED_PREFIX.length)

      // Avatar manifest → absolute /avatars/ root path (ONLY allowed format)
      if (AVATAR_MANIFEST[filename]) {
        const avatarPath = AVATAR_MANIFEST[filename]
        // Defensive: re-validate at emit time
        if (!avatarPath.startsWith('/avatars/')) {
          throw new Error(
            `AVATAR_MANIFEST path "${avatarPath}" does not start with /avatars/. ` +
            `All avatar paths must be absolute root paths: /avatars/filename.jpg`
          )
        }
        return `export default "${avatarPath}";`
      }

      // Non-avatar figma assets: check /public/assets/ (NOT used for avatars)
      const filePath = path.resolve(__dirname, 'public', 'assets', filename)
      if (fs.existsSync(filePath)) {
        return `export default "/assets/${filename}";`
      }

      // NO FALLBACK — halt the build
      throw new Error(
        `\n\n` +
        `BUILD HALTED: Unresolved figma:asset/${filename}\n` +
        `This image is not in the AVATAR_MANIFEST and not in /public/assets/.\n` +
        `Avatar images are REQUIRED production assets — no placeholder fallback is allowed.\n` +
        `Add the asset to AVATAR_MANIFEST or place the file in /public/assets/.\n`
      )
    },

    closeBundle() {
      if (!isBuild) return
      const outDir = path.resolve(__dirname, 'dist')
      if (!fs.existsSync(outDir)) return

      console.log('')
      console.log('━━━ Post-Export Verification ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
      console.log('')

      // Step 3: Verify dist/avatars/ directory exists with all files
      console.log('③ Verifying dist/avatars/ directory and files…')
      verifyDistAvatars(outDir)
      console.log('')

      // Step 4: Scan compiled JS for incorrect avatar paths
      console.log('④ Scanning compiled JS for relative or /assets/ avatar paths…')
      scanForIncorrectAvatarPaths(outDir)
      console.log('')

      // Step 5: Scan for unsafe/temporary URLs
      console.log('⑤ Scanning bundle for unsafe/temporary image URLs…')
      const warnings = scanForUnsafeUrls(outDir)
      if (warnings.length === 0) {
        console.log('  ✓ No unsafe image URLs detected.')
      } else {
        console.warn(`  ⚠ ${warnings.length} unsafe URL(s) found — review above.`)
      }

      console.log('')
      console.log('━━━ Export verification complete ━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
      console.log('')
    },
  }
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// VITE CONFIG
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
export default defineConfig({
  plugins: [
    figmaAssetPlugin(),
    react(),
    tailwindcss(),
  ],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  assetsInclude: ['**/*.svg', '**/*.csv'],
})
