import { PrismaClient } from '@prisma/client'
const prisma = new PrismaClient()
const updates: Record<string,{title:string,content:string,duration:string}[]> = {
'Matriks': [
{title:'Matriks dan Operasinya',duration:'25 menit',content:`# Matriks

## A. Pengertian
Matriks adalah susunan bilangan dalam baris dan kolom berbentuk persegi panjang, ditulis dalam tanda kurung.

$$A = \\begin{pmatrix} a_{11} & a_{12} \\\\ a_{21} & a_{22} \\end{pmatrix}$$

Matriks $A$ berordo $m \\times n$ (m baris, n kolom).

## B. Jenis-Jenis Matriks
- **Matriks Baris**: hanya 1 baris
- **Matriks Kolom**: hanya 1 kolom
- **Matriks Persegi**: jumlah baris = jumlah kolom
- **Matriks Identitas**: $I = \\begin{pmatrix}1&0\\\\0&1\\end{pmatrix}$, diagonal utama = 1, lainnya = 0
- **Matriks Nol**: semua elemen = 0
- **Matriks Diagonal**: elemen di luar diagonal utama = 0
- **Matriks Segitiga**: atas atau bawah diagonal = 0

## C. Operasi Matriks

### Penjumlahan/Pengurangan
Syarat: ordo harus sama. Operasikan elemen yang bersesuaian.

### Perkalian Skalar
$kA$: kalikan setiap elemen dengan $k$

### Perkalian Matriks
Syarat: kolom A = baris B. Jika $A_{m \\times n}$ dan $B_{n \\times p}$, maka $AB$ berordo $m \\times p$.

$$(AB)_{ij} = \\sum_{k=1}^{n} a_{ik} \\cdot b_{kj}$$

> **Catatan:** $AB \\neq BA$ pada umumnya (tidak komutatif)

## D. Determinan dan Invers

### Determinan Matriks 2×2
$$\\det(A) = |A| = ad - bc \\quad \\text{untuk } A = \\begin{pmatrix}a&b\\\\c&d\\end{pmatrix}$$

### Invers Matriks 2×2
$$A^{-1} = \\frac{1}{|A|}\\begin{pmatrix}d&-b\\\\-c&a\\end{pmatrix}$$

Syarat: $|A| \\neq 0$ (matriks non-singular)

## E. Contoh
$$A = \\begin{pmatrix}3&1\\\\2&4\\end{pmatrix}$$

$|A| = 3(4) - 1(2) = 10$

$$A^{-1} = \\frac{1}{10}\\begin{pmatrix}4&-1\\\\-2&3\\end{pmatrix}$$`},
],
'Transformasi': [
{title:'Transformasi Geometri',duration:'25 menit',content:`# Transformasi Geometri

Transformasi adalah perubahan posisi atau bentuk suatu objek geometri.

## A. Translasi (Pergeseran)
Setiap titik dipindahkan sejauh vektor translasi $T = \\begin{pmatrix}a\\\\b\\end{pmatrix}$:
$$(x, y) \\xrightarrow{T} (x+a, y+b)$$

**Contoh:** $(3,2)$ ditranslasi $\\begin{pmatrix}2\\\\-1\\end{pmatrix}$ → $(5, 1)$

## B. Refleksi (Pencerminan)
| Cermin terhadap | Bayangan |
|-----------------|----------|
| Sumbu-x | $(x, y) \\to (x, -y)$ |
| Sumbu-y | $(x, y) \\to (-x, y)$ |
| Garis $y = x$ | $(x, y) \\to (y, x)$ |
| Garis $y = -x$ | $(x, y) \\to (-y, -x)$ |
| Titik asal O | $(x, y) \\to (-x, -y)$ |

## C. Rotasi (Perputaran)
Rotasi sebesar $\\theta$ terhadap titik asal:
$$\\begin{pmatrix}x'\\\\y'\\end{pmatrix} = \\begin{pmatrix}\\cos\\theta & -\\sin\\theta \\\\ \\sin\\theta & \\cos\\theta\\end{pmatrix}\\begin{pmatrix}x\\\\y\\end{pmatrix}$$

**Contoh:** $(1,0)$ dirotasi $90°$ → $(0,1)$

## D. Dilatasi (Perkalian)
Dengan pusat O dan faktor skala $k$:
$$(x, y) \\to (kx, ky)$$

**Contoh:** $(2,3)$ didilatasi faktor 3 → $(6,9)$

## E. Komposisi Transformasi
Dua transformasi berturut-turut. Matriks transformasi dikalikan:
$$M_{\\text{total}} = M_2 \\times M_1$$`},
],
'Barisan': [
{title:'Barisan dan Deret Aritmetika & Geometri',duration:'25 menit',content:`# Barisan dan Deret

## A. Barisan Aritmetika
Barisan dengan **beda tetap** $b$ antara dua suku berurutan.

$$U_n = a + (n-1)b$$

- $a$ = suku pertama
- $b$ = beda = $U_n - U_{n-1}$
- $U_n$ = suku ke-$n$

### Deret Aritmetika
$$S_n = \\frac{n}{2}(2a + (n-1)b) = \\frac{n}{2}(U_1 + U_n)$$

**Contoh:** 3, 7, 11, 15, ...
- $a = 3$, $b = 4$
- $U_{10} = 3 + 9(4) = 39$
- $S_{10} = \\frac{10}{2}(3+39) = 210$

---

## B. Barisan Geometri
Barisan dengan **rasio tetap** $r$ antara dua suku berurutan.

$$U_n = a \\cdot r^{n-1}$$

- $r$ = rasio = $\\frac{U_n}{U_{n-1}}$

### Deret Geometri
$$S_n = \\frac{a(r^n - 1)}{r - 1} = \\frac{a(1-r^n)}{1-r}$$

### Deret Geometri Tak Hingga
Syarat: $|r| < 1$
$$S_\\infty = \\frac{a}{1-r}$$

**Contoh:** $8 + 4 + 2 + 1 + \\cdots$
- $a=8$, $r=\\frac{1}{2}$
- $S_\\infty = \\frac{8}{1-\\frac{1}{2}} = 16$

---

## C. Suku Tengah
Barisan aritmetika: $U_t = \\frac{U_a + U_b}{2}$ (rata-rata)

Barisan geometri: $U_t = \\sqrt{U_a \\cdot U_b}$ (rata-rata geometri)`},
],
'Limit': [
{title:'Limit Fungsi Aljabar',duration:'25 menit',content:`# Limit Fungsi

## A. Pengertian
$$\\lim_{x \\to a} f(x) = L$$
Artinya: nilai $f(x)$ mendekati $L$ ketika $x$ mendekati $a$.

## B. Sifat-Sifat Limit
1. $\\lim[f(x) \\pm g(x)] = \\lim f(x) \\pm \\lim g(x)$
2. $\\lim[k \\cdot f(x)] = k \\cdot \\lim f(x)$
3. $\\lim[f(x) \\cdot g(x)] = \\lim f(x) \\cdot \\lim g(x)$
4. $\\lim \\frac{f(x)}{g(x)} = \\frac{\\lim f(x)}{\\lim g(x)}$, jika $\\lim g(x) \\neq 0$

## C. Bentuk Tak Tentu $\\frac{0}{0}$
Jika substitusi langsung menghasilkan $\\frac{0}{0}$, gunakan:

### Teknik Faktorisasi
$$\\lim_{x \\to 2} \\frac{x^2-4}{x-2} = \\lim_{x \\to 2} \\frac{(x-2)(x+2)}{x-2} = \\lim_{x \\to 2} (x+2) = 4$$

### Teknik Mengalikan Sekawan (Bentuk Akar)
$$\\lim_{x \\to 0} \\frac{x}{\\sqrt{x+4}-2} \\times \\frac{\\sqrt{x+4}+2}{\\sqrt{x+4}+2} = \\lim_{x \\to 0} \\frac{x(\\sqrt{x+4}+2)}{x} = 4$$

## D. Limit di Tak Hingga
$$\\lim_{x \\to \\infty} \\frac{ax^n + \\cdots}{bx^m + \\cdots}$$

- Jika $n = m$: hasilnya $\\frac{a}{b}$
- Jika $n < m$: hasilnya $0$
- Jika $n > m$: hasilnya $\\pm\\infty$

## E. Limit Trigonometri
$$\\lim_{x \\to 0} \\frac{\\sin x}{x} = 1 \\qquad \\lim_{x \\to 0} \\frac{\\tan x}{x} = 1$$
$$\\lim_{x \\to 0} \\frac{\\sin ax}{bx} = \\frac{a}{b}$$`},
],
'Turunan': [
{title:'Turunan Fungsi Aljabar',duration:'25 menit',content:`# Turunan (Diferensial)

## A. Definisi
$$f'(x) = \\lim_{h \\to 0} \\frac{f(x+h) - f(x)}{h}$$

## B. Rumus Dasar Turunan
| Fungsi | Turunan |
|--------|---------|
| $f(x) = c$ | $f'(x) = 0$ |
| $f(x) = x^n$ | $f'(x) = nx^{n-1}$ |
| $f(x) = ax^n$ | $f'(x) = nax^{n-1}$ |

## C. Aturan Turunan
### Penjumlahan/Pengurangan
$(f \\pm g)' = f' \\pm g'$

### Perkalian
$(f \\cdot g)' = f'g + fg'$

### Pembagian
$\\left(\\frac{f}{g}\\right)' = \\frac{f'g - fg'}{g^2}$

### Aturan Rantai
$\\frac{dy}{dx} = \\frac{dy}{du} \\cdot \\frac{du}{dx}$

## D. Aplikasi Turunan

### Gradien Garis Singgung
Di titik $x = a$: $m = f'(a)$

### Titik Stasioner
$f'(x) = 0$, kemudian uji $f''(x)$:
- $f''(x) > 0$: titik **minimum**
- $f''(x) < 0$: titik **maksimum**
- $f''(x) = 0$: titik **belok**

### Contoh
$f(x) = x^3 - 3x$, $f'(x) = 3x^2 - 3$

$f'(x) = 0 \\Rightarrow x^2 = 1 \\Rightarrow x = \\pm 1$

$f''(x) = 6x$
- $f''(1) = 6 > 0$ → minimum di $x=1$
- $f''(-1) = -6 < 0$ → maksimum di $x=-1$`},
],
'Integral': [
{title:'Integral Tak Tentu dan Tentu',duration:'25 menit',content:`# Integral

Integral adalah **anti-turunan** (kebalikan dari diferensial).

## A. Integral Tak Tentu
$$\\int ax^n \\, dx = \\frac{a}{n+1}x^{n+1} + C, \\quad n \\neq -1$$

$C$ = konstanta integrasi

### Sifat
- $\\int [f(x) \\pm g(x)]dx = \\int f(x)dx \\pm \\int g(x)dx$
- $\\int k \\cdot f(x)dx = k \\int f(x)dx$

### Contoh
$$\\int (3x^2 + 4x - 5)dx = x^3 + 2x^2 - 5x + C$$

## B. Integral Tentu
$$\\int_a^b f(x)dx = F(b) - F(a) = [F(x)]_a^b$$

### Contoh
$$\\int_1^3 2x \\, dx = [x^2]_1^3 = 9 - 1 = 8$$

## C. Luas Daerah

### Luas di atas sumbu-x
$$L = \\int_a^b f(x) \\, dx$$

### Luas di bawah sumbu-x
$$L = -\\int_a^b f(x) \\, dx = \\left|\\int_a^b f(x)dx\\right|$$

### Luas antara dua kurva
$$L = \\int_a^b |f(x) - g(x)| \\, dx$$

## D. Volume Benda Putar
$$V = \\pi \\int_a^b [f(x)]^2 \\, dx$$`},
],
'Peluang': [
{title:'Peluang Kejadian',duration:'22 menit',content:`# Peluang

## A. Pengertian
$$P(A) = \\frac{n(A)}{n(S)}$$

$n(A)$ = banyak kejadian A, $n(S)$ = banyak ruang sampel

## B. Sifat
- $0 \\leq P(A) \\leq 1$
- $P(S) = 1$ (pasti terjadi)
- $P(A') = 1 - P(A)$ (komplemen)

## C. Kaidah Pencacahan
### Permutasi
$P(n,r) = \\frac{n!}{(n-r)!}$ — urutan **penting**

### Kombinasi
$C(n,r) = \\binom{n}{r} = \\frac{n!}{r!(n-r)!}$ — urutan **tidak penting**

## D. Peluang Gabungan
$$P(A \\cup B) = P(A) + P(B) - P(A \\cap B)$$

Jika saling lepas ($A \\cap B = \\emptyset$):
$$P(A \\cup B) = P(A) + P(B)$$

## E. Peluang Bersyarat
$$P(A|B) = \\frac{P(A \\cap B)}{P(B)}$$

## F. Kejadian Independen
$A$ dan $B$ independen jika:
$$P(A \\cap B) = P(A) \\cdot P(B)$$

## G. Contoh
Dua dadu dilempar. $P(\\text{jumlah} = 7)$?

Kejadian jumlah 7: (1,6), (2,5), (3,4), (4,3), (5,2), (6,1) → 6 kejadian

$n(S) = 36$

$$P = \\frac{6}{36} = \\frac{1}{6}$$`},
],
}
async function run() {
  const chapters = await prisma.chapter.findMany({where:{isSystem:true}})
  let count = 0
  for (const ch of chapters) {
    let matched: typeof updates[string]|undefined
    for (const [key,mats] of Object.entries(updates)) {
      if(ch.name.toLowerCase().includes(key.toLowerCase())){matched=mats;break}
    }
    if(!matched) continue
    await prisma.material.deleteMany({where:{chapterId:ch.id}})
    for (let i=0;i<matched.length;i++) {
      const m=matched[i]
      await prisma.material.create({data:{title:m.title,content:m.content,duration:m.duration,chapterId:ch.id,order:i+1,status:'PUBLISHED',isSystem:true}})
      count++
    }
    console.log(`✅ ${ch.name}: ${matched.length} materi`)
  }
  console.log(`\nTotal: ${count} materi diperbarui`)
}
run().catch(console.error).finally(()=>prisma.$disconnect())
