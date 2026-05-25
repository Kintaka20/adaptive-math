import { PrismaClient } from '@prisma/client'
const prisma = new PrismaClient()

const materialData: Record<string, {title:string,content:string,duration:string}[]> = {
  'Eksponen': [
    { title:'Konsep Bilangan Berpangkat', duration:'15 menit', content:`# Bilangan Berpangkat\n\nBilangan berpangkat adalah perkalian berulang suatu bilangan dengan dirinya sendiri.\n\n## Definisi\n$$a^n = \\underbrace{a \\times a \\times a \\times \\cdots \\times a}_{n \\text{ faktor}}$$\n\nDimana:\n- $a$ disebut **basis** (bilangan pokok)\n- $n$ disebut **eksponen** (pangkat)\n\n## Sifat-Sifat Eksponen\n\n| Sifat | Rumus |\n|-------|-------|\n| Perkalian | $a^m \\times a^n = a^{m+n}$ |\n| Pembagian | $\\frac{a^m}{a^n} = a^{m-n}$ |\n| Pangkat nol | $a^0 = 1, \\; a \\neq 0$ |\n| Pangkat negatif | $a^{-n} = \\frac{1}{a^n}$ |\n| Pangkat pecahan | $a^{\\frac{m}{n}} = \\sqrt[n]{a^m}$ |\n| Pangkat pangkat | $(a^m)^n = a^{m \\cdot n}$ |\n\n## Contoh\n$2^3 \\times 2^4 = 2^{3+4} = 2^7 = 128$\n\n$\\frac{5^6}{5^2} = 5^{6-2} = 5^4 = 625$` },
    { title:'Logaritma', duration:'20 menit', content:`# Logaritma\n\nLogaritma adalah kebalikan (invers) dari eksponen.\n\n## Definisi\n$$^a\\log b = c \\Leftrightarrow a^c = b$$\n\nDimana:\n- $a$ = basis ($a > 0, a \\neq 1$)\n- $b$ = numerus ($b > 0$)\n- $c$ = hasil logaritma\n\n## Sifat-Sifat Logaritma\n\n1. $^a\\log (b \\cdot c) = {^a\\log b} + {^a\\log c}$\n2. $^a\\log \\frac{b}{c} = {^a\\log b} - {^a\\log c}$\n3. $^a\\log b^n = n \\cdot {^a\\log b}$\n4. $^a\\log b = \\frac{^c\\log b}{^c\\log a}$ (perubahan basis)\n5. $^a\\log a = 1$\n6. $^a\\log 1 = 0$\n\n## Logaritma Umum\n- $\\log x = {^{10}\\log x}$ (basis 10)\n- $\\ln x = {^e\\log x}$ (basis $e \\approx 2,718$)` },
    { title:'Persamaan Eksponen', duration:'18 menit', content:`# Persamaan Eksponen\n\nPersamaan yang memuat variabel pada pangkatnya.\n\n## Bentuk Dasar\n$$a^{f(x)} = a^{g(x)} \\Rightarrow f(x) = g(x)$$\n\n## Contoh Soal\nSelesaikan $2^{x+1} = 8$\n\n**Penyelesaian:**\n$$2^{x+1} = 2^3$$\n$$x + 1 = 3$$\n$$x = 2$$\n\n## Persamaan Logaritma\n$$^a\\log f(x) = {^a\\log g(x)} \\Rightarrow f(x) = g(x)$$\n\nSyarat: $f(x) > 0$ dan $g(x) > 0$` },
  ],
  'Persamaan': [
    { title:'Sistem Persamaan Linear Dua Variabel', duration:'20 menit', content:`# SPLDV\n\nSistem persamaan linear dua variabel (SPLDV) berbentuk:\n$$\\begin{cases} a_1x + b_1y = c_1 \\\\ a_2x + b_2y = c_2 \\end{cases}$$\n\n## Metode Penyelesaian\n\n### 1. Substitusi\nNyatakan satu variabel dalam variabel lain, lalu substitusikan.\n\n### 2. Eliminasi\nKalikan persamaan agar koefisien salah satu variabel sama, lalu kurangkan.\n\n### 3. Campuran\nKombinasi substitusi dan eliminasi.\n\n## Contoh\n$$x + y = 5 \\quad \\text{...(1)}$$\n$$x - y = 1 \\quad \\text{...(2)}$$\n\nEliminasi: $(1)+(2): 2x = 6 \\Rightarrow x = 3$\n\nSubstitusi: $3 + y = 5 \\Rightarrow y = 2$` },
    { title:'SPLTV', duration:'22 menit', content:`# Sistem Persamaan Linear Tiga Variabel\n\nSPLTV berbentuk:\n$$\\begin{cases} a_1x + b_1y + c_1z = d_1 \\\\ a_2x + b_2y + c_2z = d_2 \\\\ a_3x + b_3y + c_3z = d_3 \\end{cases}$$\n\n## Langkah Penyelesaian\n1. Eliminasi satu variabel dari 2 pasang persamaan\n2. Diperoleh SPLDV\n3. Selesaikan SPLDV\n4. Substitusi balik\n\n## Contoh\n$$x + y + z = 6$$\n$$x - y + z = 2$$\n$$2x + y - z = 1$$\n\nDari persamaan (1) dan (2): $2y = 4 \\Rightarrow y = 2$\n\nSubstitusi ke persamaan lain untuk mencari $x$ dan $z$.` },
  ],
  'Fungsi': [
    { title:'Fungsi dan Grafik Fungsi Kuadrat', duration:'25 menit', content:`# Fungsi Kuadrat\n\nFungsi kuadrat berbentuk umum:\n$$f(x) = ax^2 + bx + c, \\quad a \\neq 0$$\n\n## Sifat Grafik Parabola\n- Jika $a > 0$: parabola terbuka ke atas (minimum)\n- Jika $a < 0$: parabola terbuka ke bawah (maksimum)\n\n## Titik Puncak\n$$x_p = -\\frac{b}{2a}, \\quad y_p = -\\frac{D}{4a}$$\n\ndengan diskriminan $D = b^2 - 4ac$\n\n## Sumbu Simetri\n$$x = -\\frac{b}{2a}$$\n\n## Titik Potong Sumbu-x\nDicari dari $ax^2 + bx + c = 0$:\n$$x = \\frac{-b \\pm \\sqrt{D}}{2a}$$` },
    { title:'Komposisi dan Invers Fungsi', duration:'20 menit', content:`# Komposisi Fungsi\n\n## Definisi\n$(f \\circ g)(x) = f(g(x))$\n\n$(g \\circ f)(x) = g(f(x))$\n\n**Catatan:** $f \\circ g \\neq g \\circ f$ (tidak komutatif)\n\n## Contoh\nJika $f(x) = 2x+1$ dan $g(x) = x^2$:\n$$(f \\circ g)(x) = f(g(x)) = f(x^2) = 2x^2 + 1$$\n\n# Invers Fungsi\n\n## Definisi\n$f^{-1}$ adalah fungsi sedemikian sehingga:\n$$f(f^{-1}(x)) = f^{-1}(f(x)) = x$$\n\n## Cara Mencari\n1. Misalkan $y = f(x)$\n2. Nyatakan $x$ dalam $y$\n3. Ganti $y$ dengan $x$` },
  ],
  'Trigonometri': [
    { title:'Perbandingan Trigonometri', duration:'20 menit', content:`# Perbandingan Trigonometri\n\nPada segitiga siku-siku:\n\n$$\\sin \\theta = \\frac{\\text{depan}}{\\text{miring}}$$\n$$\\cos \\theta = \\frac{\\text{samping}}{\\text{miring}}$$\n$$\\tan \\theta = \\frac{\\text{depan}}{\\text{samping}} = \\frac{\\sin\\theta}{\\cos\\theta}$$\n\n## Nilai Sudut Istimewa\n\n| Sudut | $\\sin$ | $\\cos$ | $\\tan$ |\n|-------|--------|--------|--------|\n| $0°$ | $0$ | $1$ | $0$ |\n| $30°$ | $\\frac{1}{2}$ | $\\frac{\\sqrt{3}}{2}$ | $\\frac{1}{\\sqrt{3}}$ |\n| $45°$ | $\\frac{\\sqrt{2}}{2}$ | $\\frac{\\sqrt{2}}{2}$ | $1$ |\n| $60°$ | $\\frac{\\sqrt{3}}{2}$ | $\\frac{1}{2}$ | $\\sqrt{3}$ |\n| $90°$ | $1$ | $0$ | $\\infty$ |` },
    { title:'Identitas Trigonometri', duration:'18 menit', content:`# Identitas Trigonometri\n\n## Identitas Dasar\n$$\\sin^2\\theta + \\cos^2\\theta = 1$$\n$$1 + \\tan^2\\theta = \\sec^2\\theta$$\n$$1 + \\cot^2\\theta = \\csc^2\\theta$$\n\n## Rumus Sudut Rangkap\n$$\\sin 2\\alpha = 2\\sin\\alpha\\cos\\alpha$$\n$$\\cos 2\\alpha = \\cos^2\\alpha - \\sin^2\\alpha$$\n$$\\tan 2\\alpha = \\frac{2\\tan\\alpha}{1-\\tan^2\\alpha}$$\n\n## Rumus Jumlah Sudut\n$$\\sin(\\alpha \\pm \\beta) = \\sin\\alpha\\cos\\beta \\pm \\cos\\alpha\\sin\\beta$$\n$$\\cos(\\alpha \\pm \\beta) = \\cos\\alpha\\cos\\beta \\mp \\sin\\alpha\\sin\\beta$$` },
  ],
  'Statistika': [
    { title:'Ukuran Pemusatan Data', duration:'20 menit', content:`# Ukuran Pemusatan Data\n\n## Mean (Rata-rata)\n$$\\bar{x} = \\frac{\\sum x_i}{n}$$\n\nUntuk data berkelompok:\n$$\\bar{x} = \\frac{\\sum f_i \\cdot x_i}{\\sum f_i}$$\n\n## Median\nNilai tengah data yang telah diurutkan.\n- Data ganjil: $Me = x_{\\frac{n+1}{2}}$\n- Data genap: $Me = \\frac{x_{\\frac{n}{2}} + x_{\\frac{n}{2}+1}}{2}$\n\n## Modus\nNilai yang paling sering muncul.\n\n## Contoh\nData: 3, 5, 5, 7, 8, 9, 10\n- Mean = $\\frac{47}{7} = 6,71$\n- Median = 7 (data ke-4)\n- Modus = 5 (muncul 2 kali)` },
    { title:'Ukuran Penyebaran Data', duration:'22 menit', content:`# Ukuran Penyebaran Data\n\n## Jangkauan (Range)\n$$R = x_{max} - x_{min}$$\n\n## Varians\n$$s^2 = \\frac{\\sum(x_i - \\bar{x})^2}{n-1}$$\n\n## Simpangan Baku\n$$s = \\sqrt{\\frac{\\sum(x_i - \\bar{x})^2}{n-1}}$$\n\n## Kuartil\n- $Q_1$ = kuartil bawah (persentil ke-25)\n- $Q_2$ = median (persentil ke-50)\n- $Q_3$ = kuartil atas (persentil ke-75)\n\n## Jangkauan Interkuartil\n$$IQR = Q_3 - Q_1$$` },
  ],
  'Matriks': [
    { title:'Operasi Matriks', duration:'20 menit', content:`# Matriks\n\nMatriks adalah susunan bilangan dalam baris dan kolom.\n\n## Jenis Matriks\n- Matriks baris: 1 baris\n- Matriks kolom: 1 kolom\n- Matriks persegi: baris = kolom\n- Matriks identitas: diagonal = 1, lainnya = 0\n\n## Operasi\n### Penjumlahan\n$A + B$: jumlahkan elemen yang bersesuaian (ordo harus sama)\n\n### Perkalian Skalar\n$kA$: kalikan setiap elemen dengan $k$\n\n### Perkalian Matriks\n$(AB)_{ij} = \\sum_k a_{ik} \\cdot b_{kj}$\n\nSyarat: kolom A = baris B\n\n## Determinan 2×2\n$$\\det\\begin{pmatrix}a&b\\\\c&d\\end{pmatrix} = ad - bc$$\n\n## Invers 2×2\n$$A^{-1} = \\frac{1}{ad-bc}\\begin{pmatrix}d&-b\\\\-c&a\\end{pmatrix}$$` },
  ],
  'Transformasi': [
    { title:'Transformasi Geometri', duration:'22 menit', content:`# Transformasi Geometri\n\n## Translasi (Pergeseran)\nTitik $(x,y)$ ditranslasi oleh $\\begin{pmatrix}a\\\\b\\end{pmatrix}$:\n$$(x,y) \\rightarrow (x+a, y+b)$$\n\n## Refleksi (Pencerminan)\n- Terhadap sumbu-x: $(x,y) \\rightarrow (x,-y)$\n- Terhadap sumbu-y: $(x,y) \\rightarrow (-x,y)$\n- Terhadap $y=x$: $(x,y) \\rightarrow (y,x)$\n- Terhadap titik O: $(x,y) \\rightarrow (-x,-y)$\n\n## Rotasi (Perputaran)\nRotasi $\\theta$ terhadap titik asal:\n$$\\begin{pmatrix}x'\\\\y'\\end{pmatrix} = \\begin{pmatrix}\\cos\\theta & -\\sin\\theta \\\\ \\sin\\theta & \\cos\\theta\\end{pmatrix}\\begin{pmatrix}x\\\\y\\end{pmatrix}$$\n\n## Dilatasi\n$(x,y) \\rightarrow (kx, ky)$ dengan faktor skala $k$` },
  ],
  'Limit': [
    { title:'Limit Fungsi Aljabar', duration:'22 menit', content:`# Limit Fungsi\n\n## Definisi\n$$\\lim_{x \\to a} f(x) = L$$\n\n## Sifat Limit\n1. $\\lim_{x \\to a}[f(x) \\pm g(x)] = \\lim f(x) \\pm \\lim g(x)$\n2. $\\lim_{x \\to a}[f(x) \\cdot g(x)] = \\lim f(x) \\cdot \\lim g(x)$\n3. $\\lim_{x \\to a} c = c$\n\n## Bentuk Tak Tentu $\\frac{0}{0}$\nFaktorkan pembilang dan penyebut, lalu sederhanakan.\n\n## Contoh\n$$\\lim_{x \\to 2} \\frac{x^2-4}{x-2} = \\lim_{x \\to 2} \\frac{(x-2)(x+2)}{x-2} = \\lim_{x \\to 2}(x+2) = 4$$\n\n## Limit di Tak Hingga\n$$\\lim_{x \\to \\infty} \\frac{ax^n + ...}{bx^m + ...}$$\nBagi dengan pangkat tertinggi penyebut.` },
  ],
  'Turunan': [
    { title:'Turunan Fungsi Aljabar', duration:'25 menit', content:`# Turunan (Diferensial)\n\n## Definisi\n$$f'(x) = \\lim_{h \\to 0} \\frac{f(x+h)-f(x)}{h}$$\n\n## Rumus Dasar\n- $f(x) = ax^n \\Rightarrow f'(x) = nax^{n-1}$\n- $f(x) = c \\Rightarrow f'(x) = 0$\n\n## Aturan\n- **Penjumlahan:** $(f+g)' = f' + g'$\n- **Perkalian:** $(fg)' = f'g + fg'$\n- **Rantai:** $\\frac{dy}{dx} = \\frac{dy}{du} \\cdot \\frac{du}{dx}$\n\n## Aplikasi\n### Persamaan Garis Singgung\nGradien di titik $x=a$: $m = f'(a)$\n\n### Titik Stasioner\n$f'(x) = 0$ → cari $x$\n- $f''(x) > 0$: minimum\n- $f''(x) < 0$: maksimum` },
  ],
  'Barisan': [
    { title:'Barisan dan Deret', duration:'20 menit', content:`# Barisan dan Deret\n\n## Barisan Aritmetika\nBarisan dengan beda tetap $b$:\n$$U_n = a + (n-1)b$$\n\n### Deret Aritmetika\n$$S_n = \\frac{n}{2}(2a + (n-1)b) = \\frac{n}{2}(a + U_n)$$\n\n## Barisan Geometri\nBarisan dengan rasio tetap $r$:\n$$U_n = a \\cdot r^{n-1}$$\n\n### Deret Geometri\n$$S_n = \\frac{a(r^n - 1)}{r - 1}, \\quad r \\neq 1$$\n\n### Deret Geometri Tak Hingga ($|r| < 1$)\n$$S_\\infty = \\frac{a}{1-r}$$\n\n## Contoh\nBarisan: 2, 5, 8, 11, ...\n- $a=2$, $b=3$\n- $U_{10} = 2 + 9(3) = 29$\n- $S_{10} = \\frac{10}{2}(2+29) = 155$` },
  ],
  'Integral': [
    { title:'Integral Tak Tentu dan Tentu', duration:'25 menit', content:`# Integral\n\nIntegral adalah kebalikan dari turunan (anti-turunan).\n\n## Integral Tak Tentu\n$$\\int ax^n \\, dx = \\frac{a}{n+1}x^{n+1} + C, \\quad n \\neq -1$$\n\n## Sifat\n- $\\int [f(x) \\pm g(x)]dx = \\int f(x)dx \\pm \\int g(x)dx$\n- $\\int k \\cdot f(x)dx = k \\int f(x)dx$\n\n## Integral Tentu\n$$\\int_a^b f(x)dx = F(b) - F(a)$$\n\n## Luas Daerah\n$$L = \\int_a^b |f(x)| \\, dx$$\n\n## Contoh\n$$\\int (3x^2 + 2x)dx = x^3 + x^2 + C$$\n$$\\int_0^2 (3x^2 + 2x)dx = [x^3+x^2]_0^2 = 12$$` },
  ],
  'Dimensi': [
    { title:'Dimensi Tiga', duration:'22 menit', content:`# Dimensi Tiga (Geometri Ruang)\n\n## Jarak\n### Jarak Titik ke Titik\n$$d = \\sqrt{(x_2-x_1)^2+(y_2-y_1)^2+(z_2-z_1)^2}$$\n\n### Jarak Titik ke Garis\nGunakan rumus luas segitiga:\n$$d = \\frac{2 \\times \\text{Luas}}{\\text{panjang alas}}$$\n\n### Jarak Titik ke Bidang\nProyeksikan titik secara tegak lurus ke bidang.\n\n## Sudut\n### Sudut antara Garis dan Bidang\n$$\\sin \\alpha = \\frac{\\text{jarak proyeksi}}{\\text{panjang garis}}$$\n\n### Sudut antara Dua Bidang\nCari garis potong, buat garis tegak lurus pada masing-masing bidang.` },
  ],
  'Peluang': [
    { title:'Peluang Kejadian', duration:'18 menit', content:`# Peluang\n\n## Definisi\n$$P(A) = \\frac{n(A)}{n(S)}$$\n\n## Sifat\n- $0 \\leq P(A) \\leq 1$\n- $P(A) + P(A') = 1$ (komplemen)\n\n## Kejadian Gabungan\n$$P(A \\cup B) = P(A) + P(B) - P(A \\cap B)$$\n\nJika saling lepas: $P(A \\cup B) = P(A) + P(B)$\n\n## Peluang Bersyarat\n$$P(A|B) = \\frac{P(A \\cap B)}{P(B)}$$\n\n## Kejadian Independen\n$$P(A \\cap B) = P(A) \\cdot P(B)$$\n\n## Contoh\nDadu dilempar sekali. $P(\\text{genap}) = \\frac{3}{6} = \\frac{1}{2}$` },
  ],
  'Statistika Inf': [
    { title:'Statistika Inferensial', duration:'20 menit', content:`# Statistika Inferensial\n\n## Populasi dan Sampel\n- **Populasi**: seluruh objek pengamatan\n- **Sampel**: bagian dari populasi\n\n## Distribusi Normal\nKurva berbentuk lonceng simetris:\n$$f(x) = \\frac{1}{\\sigma\\sqrt{2\\pi}} e^{-\\frac{(x-\\mu)^2}{2\\sigma^2}}$$\n\n## Distribusi Normal Baku\n$$Z = \\frac{X - \\mu}{\\sigma}$$\n\n## Interval Kepercayaan\n$$\\bar{x} - z_{\\alpha/2}\\frac{\\sigma}{\\sqrt{n}} < \\mu < \\bar{x} + z_{\\alpha/2}\\frac{\\sigma}{\\sqrt{n}}$$\n\n## Uji Hipotesis\n1. Tentukan $H_0$ dan $H_1$\n2. Pilih taraf signifikansi $\\alpha$\n3. Hitung statistik uji\n4. Bandingkan dengan nilai kritis\n5. Kesimpulan` },
  ],
}

async function seedMaterials() {
  const chapters = await prisma.chapter.findMany({ where:{isSystem:true}, orderBy:[{grade:'asc'},{order:'asc'}] })
  let count = 0
  for (const ch of chapters) {
    let matched: typeof materialData[string] | undefined
    for (const [key, mats] of Object.entries(materialData)) {
      if (ch.name.toLowerCase().includes(key.toLowerCase())) { matched = mats; break }
    }
    if (!matched) continue
    for (let i = 0; i < matched.length; i++) {
      const m = matched[i]
      await prisma.material.create({ data: {
        title: m.title, content: m.content, duration: m.duration,
        chapterId: ch.id, order: i+1, status:'PUBLISHED', isSystem:true
      }})
      count++
    }
    console.log(`✅ ${ch.name}: ${matched.length} materi`)
  }
  console.log(`Total: ${count} materi dibuat`)
}

seedMaterials().catch(console.error).finally(() => prisma.$disconnect())
