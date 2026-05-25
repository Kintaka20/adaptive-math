/**
 * Context Injection Module
 * Loads BSE textbook content and provides relevant context for AI Chat.
 */
import fs from 'fs'
import path from 'path'

const CONTEXT_DIR = path.join(__dirname, '..', 'context')

const contextCache: Record<string, string> = {}

const TOPIC_KEYWORDS: Record<string, string[]> = {
  'eksponen': ['eksponen', 'pangkat', 'logaritma', 'bilangan berpangkat', 'basis', 'eksponensial'],
  'barisan': ['barisan', 'deret', 'aritmetika', 'geometri', 'suku ke-n', 'jumlah deret', 'sigma'],
  'trigonometri': ['trigonometri', 'sinus', 'cosinus', 'tangen', 'sin', 'cos', 'tan', 'sudut', 'radian', 'derajat', 'identitas trigonometri', 'perbandingan trigonometri'],
  'persamaan linear': ['persamaan linear', 'pertidaksamaan linear', 'splv', 'spldv', 'spltv', 'eliminasi', 'substitusi'],
  'kuadrat': ['kuadrat', 'persamaan kuadrat', 'fungsi kuadrat', 'diskriminan', 'akar', 'parabola', 'abc'],
  'statistika': ['statistika', 'data', 'mean', 'median', 'modus', 'standar deviasi', 'varians', 'frekuensi', 'histogram'],
  'peluang': ['peluang', 'probabilitas', 'kejadian', 'ruang sampel', 'peluang bersyarat', 'kombinasi', 'permutasi', 'faktorial'],
  'limit': ['limit', 'pendekatan', 'limit fungsi', 'tak hingga', 'kontinu', 'kontinuitas'],
  'turunan': ['turunan', 'diferensial', 'derivatif', 'gradien', 'kemiringan', 'laju perubahan', 'minimum', 'maksimum', 'titik stasioner', 'titik belok'],
  'integral': ['integral', 'anti turunan', 'luas daerah', 'integral tentu', 'integral tak tentu', 'volume benda putar'],
  'matriks': ['matriks', 'determinan', 'invers matriks', 'transpose', 'operasi matriks'],
  'vektor': ['vektor', 'skalar', 'resultan', 'dot product', 'cross product', 'proyeksi vektor'],
  'transformasi': ['transformasi', 'translasi', 'refleksi', 'rotasi', 'dilatasi', 'geometri transformasi'],
  'program linear': ['program linear', 'optimasi', 'fungsi objektif', 'kendala', 'daerah feasibel'],
  'lingkaran': ['lingkaran', 'persamaan lingkaran', 'garis singgung'],
  'polinomial': ['polinomial', 'suku banyak', 'pembagian polinomial', 'teorema sisa', 'teorema faktor'],
}

/**
 * Load context files at startup
 */
function loadContextFiles(): void {
  const gradeFiles: Record<string, string> = {
    'X': 'kelas-x.txt',
    'XI': 'kelas-xi.txt',
    'XII': 'kelas-xii.txt',
  }

  for (const [grade, filename] of Object.entries(gradeFiles)) {
    const filePath = path.join(CONTEXT_DIR, filename)
    if (fs.existsSync(filePath)) {
      const content = fs.readFileSync(filePath, 'utf-8')
      if (content.trim().length > 100) {
        contextCache[grade] = content
        console.log(`📚 Context loaded: ${grade} (${(content.length / 1024).toFixed(0)}KB)`)
      } else {
        console.log(`⚠️ Context too small for ${grade}, skipping`)
      }
    } else {
      console.log(`⚠️ Context file not found: ${filePath}`)
    }
  }
}

/**
 * Find the most relevant chunk of text for a given query
 */
function findRelevantChunk(fullText: string, query: string, chapterName?: string, maxChars = 4000): string {
  const queryLower = query.toLowerCase()
  const chapterLower = (chapterName || '').toLowerCase()

  let bestTopic = ''
  let bestScore = 0
  for (const [topic, keywords] of Object.entries(TOPIC_KEYWORDS)) {
    let score = 0
    for (const kw of keywords) {
      if (queryLower.includes(kw)) score += 3
      if (chapterLower.includes(kw)) score += 2
    }
    if (score > bestScore) {
      bestScore = score
      bestTopic = topic
    }
  }

  const paragraphs = fullText.split(/\n{2,}/)

  const scored = paragraphs.map((para, idx) => {
    const paraLower = para.toLowerCase()
    let score = 0

    const queryWords = queryLower.split(/\s+/).filter(w => w.length > 2)
    for (const word of queryWords) {
      if (paraLower.includes(word)) score += 2
    }

    if (bestTopic && TOPIC_KEYWORDS[bestTopic]) {
      for (const kw of TOPIC_KEYWORDS[bestTopic]) {
        if (paraLower.includes(kw)) score += 3
      }
    }

    if (chapterName) {
      const chapterWords = chapterLower.split(/\s+/).filter(w => w.length > 2)
      for (const word of chapterWords) {
        if (paraLower.includes(word)) score += 2
      }
    }

    if (/^(bab|definisi|rumus|teorema|sifat|contoh|langkah)/i.test(para.trim())) {
      score += 1
    }

    return { para, score, idx }
  })

  scored.sort((a, b) => b.score - a.score)

  const selectedParagraphs: { para: string; idx: number }[] = []
  let totalChars = 0
  for (const item of scored) {
    if (item.score <= 0) break
    if (totalChars + item.para.length > maxChars) continue
    selectedParagraphs.push(item)
    totalChars += item.para.length
    if (totalChars >= maxChars) break
  }

  if (selectedParagraphs.length === 0) {
    return ''
  }

  selectedParagraphs.sort((a, b) => a.idx - b.idx)

  return selectedParagraphs.map(p => p.para.trim()).join('\n\n')
}

/**
 * Get relevant textbook context for a student's query.
 * @param grade Student's grade (X, XI, XII)
 * @param chapterName Name of the chapter (e.g., "Trigonometri")
 * @param query The student's question
 * @returns Relevant textbook excerpt or empty string
 */
export function getRelevantContext(grade: string, chapterName: string | undefined, query: string): string {
  let fullText = contextCache[grade]

  if (!fullText) {
    for (const g of ['X', 'XI', 'XII']) {
      if (contextCache[g]) {
        fullText = contextCache[g]
        break
      }
    }
  }

  if (!fullText) return ''

  const chunk = findRelevantChunk(fullText, query, chapterName)

  if (!chunk || chunk.length < 50) return ''

  return chunk
}

loadContextFiles()
