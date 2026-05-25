/**
 * Extract text from BSE PDF textbooks and save as structured context files.
 * Run: npx tsx extract-context.ts
 */
import fs from 'fs'
import path from 'path'

const { PDFParse } = require('pdf-parse')

const CONTEXT_DIR = path.join(__dirname, 'src', 'context')
const DOCS_DIR = path.join(__dirname, '..', '..', 'docs', 'Context Injection')

const PDF_FILES = [
  { file: 'Matematika_BS_KLS_X_Rev.pdf', output: 'kelas-x.txt', label: 'Kelas X' },
  { file: 'Matematika-BS-KLS-XI.pdf', output: 'kelas-xi.txt', label: 'Kelas XI' },
  { file: 'MATEMATIKA-BS-KLS-XII.pdf', output: 'kelas-xii.txt', label: 'Kelas XII' },
]

const MAX_CHARS = 500_000

async function extractPdf(pdfPath: string): Promise<string> {
  console.log(`  Reading PDF: ${path.basename(pdfPath)} (${(fs.statSync(pdfPath).size / 1024 / 1024).toFixed(1)}MB)`)
  const buffer = fs.readFileSync(pdfPath)
  const uint8 = new Uint8Array(buffer)
  const parser = new PDFParse(uint8)
  const result = await parser.getText()
  const fullText = result.pages.map((p: any) => p.text).join('\n\n')
  console.log(`  Extracted ${result.pages.length} pages, ${fullText.length} characters`)
  return fullText
}

function cleanText(raw: string): string {
  return raw
    .replace(/[ \t]+/g, ' ')
    .replace(/\n{3,}/g, '\n\n')
    .replace(/^\d+\s*$/gm, '')
    .replace(/^Matematika\s*(untuk)?\s*SMA.*$/gim, '')
    .replace(/^Kementerian.*$/gim, '')
    .replace(/^Buku\s*Siswa.*$/gim, '')
    .trim()
}

async function main() {
  console.log('=== Context Injection: PDF Extraction ===\n')

  if (!fs.existsSync(CONTEXT_DIR)) {
    fs.mkdirSync(CONTEXT_DIR, { recursive: true })
    console.log(`Created directory: ${CONTEXT_DIR}\n`)
  }

  for (const { file, output, label } of PDF_FILES) {
    const pdfPath = path.join(DOCS_DIR, file)
    const outPath = path.join(CONTEXT_DIR, output)

    console.log(`\n[${label}] Processing ${file}...`)

    if (!fs.existsSync(pdfPath)) {
      console.log(`  SKIP: File not found at ${pdfPath}`)
      continue
    }

    try {
      const raw = await extractPdf(pdfPath)
      let cleaned = cleanText(raw)

      if (cleaned.length > MAX_CHARS) {
        console.log(`  Truncating from ${cleaned.length} to ${MAX_CHARS} characters`)
        cleaned = cleaned.substring(0, MAX_CHARS)
      }

      const header = `=== BUKU SISWA MATEMATIKA ${label.toUpperCase()} (BSE Kurikulum Merdeka) ===\n\n`
      fs.writeFileSync(outPath, header + cleaned, 'utf-8')
      console.log(`  Saved: ${outPath} (${(cleaned.length / 1024).toFixed(0)}KB)`)
    } catch (err) {
      console.error(`  ERROR processing ${file}:`, err)
    }
  }

  console.log('\n=== Extraction Complete ===')
}

main().catch(console.error)
