import { PrismaClient } from '@prisma/client'
const prisma = new PrismaClient()
const updates: Record<string,{title:string,content:string,duration:string}[]> = {
'Fungsi': [
{title:'Fungsi Kuadrat dan Grafiknya',duration:'25 menit',content:`# Fungsi Kuadrat

## A. Bentuk Umum
$$f(x) = ax^2 + bx + c, \\quad a \\neq 0$$

## B. Grafik Parabola
- $a > 0$: parabola terbuka **ke atas** → memiliki nilai **minimum**
- $a < 0$: parabola terbuka **ke bawah** → memiliki nilai **maksimum**

## C. Unsur-Unsur Penting

### Titik Puncak (Vertex)
$$x_p = -\\frac{b}{2a}, \\quad y_p = f(x_p) = -\\frac{D}{4a}$$
dengan **Diskriminan** $D = b^2 - 4ac$

### Sumbu Simetri
$$x = -\\frac{b}{2a}$$

### Titik Potong Sumbu-y
$$f(0) = c$$

### Titik Potong Sumbu-x
Dicari dari $ax^2 + bx + c = 0$ menggunakan rumus abc:
$$x_{1,2} = \\frac{-b \\pm \\sqrt{D}}{2a}$$

- $D > 0$: memotong sumbu-x di **dua titik**
- $D = 0$: **menyinggung** sumbu-x (satu titik)
- $D < 0$: **tidak memotong** sumbu-x

---

## D. Contoh

Tentukan titik puncak dari $f(x) = x^2 - 6x + 8$

$a=1, b=-6, c=8$

$x_p = \\frac{6}{2} = 3$

$y_p = f(3) = 9 - 18 + 8 = -1$

**Titik puncak:** $(3, -1)$

Titik potong sumbu-x: $x^2 - 6x + 8 = 0 \\Rightarrow (x-2)(x-4)=0$

$x = 2$ atau $x = 4$`},
{title:'Komposisi dan Invers Fungsi',duration:'22 menit',content:`# Komposisi dan Invers Fungsi

## A. Komposisi Fungsi

### Definisi
$(f \\circ g)(x) = f(g(x))$ — artinya $g$ dihitung **dulu**, hasilnya dimasukkan ke $f$.

$(g \\circ f)(x) = g(f(x))$ — artinya $f$ dihitung **dulu**, hasilnya dimasukkan ke $g$.

> **Catatan Penting:** Komposisi **tidak komutatif**: $f \\circ g \\neq g \\circ f$ pada umumnya.

### Contoh
$f(x) = 2x + 1$ dan $g(x) = x^2 - 3$

$(f \\circ g)(x) = f(g(x)) = f(x^2-3) = 2(x^2-3)+1 = 2x^2 - 5$

$(g \\circ f)(x) = g(f(x)) = g(2x+1) = (2x+1)^2 - 3 = 4x^2+4x-2$

$(f \\circ g)(2) = 2(4)-5 = 3$

---

## B. Invers Fungsi

### Definisi
$f^{-1}$ adalah fungsi sedemikian sehingga:
$$f(f^{-1}(x)) = f^{-1}(f(x)) = x$$

### Cara Mencari Invers
1. Misalkan $y = f(x)$
2. Nyatakan $x$ dalam $y$
3. Tukar $x$ dan $y$

### Contoh 1 (Fungsi Linear)
$f(x) = 3x - 6$

$y = 3x - 6 \\Rightarrow 3x = y+6 \\Rightarrow x = \\frac{y+6}{3}$

$$f^{-1}(x) = \\frac{x+6}{3}$$

### Contoh 2 (Fungsi Pecahan)
$f(x) = \\frac{2x+3}{x-1}$

$y(x-1) = 2x+3$

$xy - y = 2x + 3$

$x(y-2) = y+3$

$$f^{-1}(x) = \\frac{x+3}{x-2}$$`},
],
'Trigonometri': [
{title:'Perbandingan dan Fungsi Trigonometri',duration:'25 menit',content:`# Perbandingan Trigonometri

## A. Definisi pada Segitiga Siku-Siku

Untuk sudut $\\theta$ pada segitiga siku-siku:

$$\\sin \\theta = \\frac{\\text{sisi depan}}{\\text{sisi miring}} \\qquad \\cos \\theta = \\frac{\\text{sisi samping}}{\\text{sisi miring}} \\qquad \\tan \\theta = \\frac{\\text{sisi depan}}{\\text{sisi samping}}$$

**Hubungan:** $\\tan \\theta = \\frac{\\sin\\theta}{\\cos\\theta}$

## B. Nilai Sudut Istimewa

| Sudut | $0°$ | $30°$ | $45°$ | $60°$ | $90°$ |
|-------|------|-------|-------|-------|-------|
| $\\sin$ | $0$ | $\\frac{1}{2}$ | $\\frac{1}{2}\\sqrt{2}$ | $\\frac{1}{2}\\sqrt{3}$ | $1$ |
| $\\cos$ | $1$ | $\\frac{1}{2}\\sqrt{3}$ | $\\frac{1}{2}\\sqrt{2}$ | $\\frac{1}{2}$ | $0$ |
| $\\tan$ | $0$ | $\\frac{1}{3}\\sqrt{3}$ | $1$ | $\\sqrt{3}$ | $\\infty$ |

## C. Trigonometri di Empat Kuadran

| Kuadran | Sudut | Positif |
|---------|-------|---------|
| I | $0° - 90°$ | sin, cos, tan |
| II | $90° - 180°$ | sin |
| III | $180° - 270°$ | tan |
| IV | $270° - 360°$ | cos |

**Ingat:** **A**ll **S**tudents **T**ake **C**alculus

## D. Sudut Berelasi

- $\\sin(180°-\\alpha) = \\sin\\alpha$
- $\\cos(180°-\\alpha) = -\\cos\\alpha$
- $\\sin(180°+\\alpha) = -\\sin\\alpha$
- $\\cos(360°-\\alpha) = \\cos\\alpha$

## E. Contoh
$\\sin 150° = \\sin(180°-30°) = \\sin 30° = \\frac{1}{2}$

$\\cos 240° = \\cos(180°+60°) = -\\cos 60° = -\\frac{1}{2}$`},
{title:'Identitas dan Rumus Trigonometri',duration:'22 menit',content:`# Identitas dan Rumus Trigonometri

## A. Identitas Dasar Pythagoras
$$\\sin^2\\theta + \\cos^2\\theta = 1$$
$$1 + \\tan^2\\theta = \\sec^2\\theta$$
$$1 + \\cot^2\\theta = \\csc^2\\theta$$

## B. Rumus Jumlah dan Selisih Sudut
$$\\sin(\\alpha \\pm \\beta) = \\sin\\alpha\\cos\\beta \\pm \\cos\\alpha\\sin\\beta$$
$$\\cos(\\alpha \\pm \\beta) = \\cos\\alpha\\cos\\beta \\mp \\sin\\alpha\\sin\\beta$$
$$\\tan(\\alpha \\pm \\beta) = \\frac{\\tan\\alpha \\pm \\tan\\beta}{1 \\mp \\tan\\alpha\\tan\\beta}$$

## C. Rumus Sudut Rangkap
$$\\sin 2\\alpha = 2\\sin\\alpha\\cos\\alpha$$
$$\\cos 2\\alpha = \\cos^2\\alpha - \\sin^2\\alpha = 2\\cos^2\\alpha - 1 = 1 - 2\\sin^2\\alpha$$
$$\\tan 2\\alpha = \\frac{2\\tan\\alpha}{1 - \\tan^2\\alpha}$$

## D. Aturan Sinus dan Cosinus

### Aturan Sinus
$$\\frac{a}{\\sin A} = \\frac{b}{\\sin B} = \\frac{c}{\\sin C} = 2R$$

### Aturan Cosinus
$$a^2 = b^2 + c^2 - 2bc\\cos A$$

## E. Luas Segitiga
$$L = \\frac{1}{2}ab\\sin C$$

## F. Contoh
$\\sin 75° = \\sin(45°+30°) = \\sin45°\\cos30° + \\cos45°\\sin30°$
$= \\frac{\\sqrt{2}}{2} \\cdot \\frac{\\sqrt{3}}{2} + \\frac{\\sqrt{2}}{2} \\cdot \\frac{1}{2} = \\frac{\\sqrt{6}+\\sqrt{2}}{4}$`},
],
'Statistika X': [
{title:'Ukuran Pemusatan Data',duration:'22 menit',content:`# Ukuran Pemusatan Data

## A. Mean (Rata-Rata)

### Data Tunggal
$$\\bar{x} = \\frac{x_1 + x_2 + \\cdots + x_n}{n} = \\frac{\\sum_{i=1}^{n} x_i}{n}$$

### Data Berkelompok (Tabel Frekuensi)
$$\\bar{x} = \\frac{\\sum f_i \\cdot x_i}{\\sum f_i}$$

dimana $x_i$ = nilai tengah kelas, $f_i$ = frekuensi

**Contoh:** Data: 4, 5, 6, 7, 8
$$\\bar{x} = \\frac{4+5+6+7+8}{5} = \\frac{30}{5} = 6$$

---

## B. Median (Nilai Tengah)

Data harus **diurutkan** terlebih dahulu.

- **Data ganjil** ($n$ ganjil): $Me = x_{\\frac{n+1}{2}}$
- **Data genap** ($n$ genap): $Me = \\frac{x_{n/2} + x_{n/2+1}}{2}$

### Data Berkelompok
$$Me = L + \\left(\\frac{\\frac{n}{2} - F}{f_{me}}\\right) \\times p$$

$L$ = tepi bawah kelas median, $F$ = frekuensi kumulatif sebelum kelas median, $f_{me}$ = frekuensi kelas median, $p$ = panjang kelas

---

## C. Modus

Nilai yang **paling sering muncul**.

### Data Berkelompok
$$Mo = L + \\left(\\frac{d_1}{d_1 + d_2}\\right) \\times p$$

$d_1$ = selisih frekuensi kelas modus dengan kelas sebelumnya
$d_2$ = selisih frekuensi kelas modus dengan kelas sesudahnya

---

## D. Contoh Komprehensif

Data: 3, 5, 5, 7, 8, 9, 10

- **Mean** = $\\frac{47}{7} \\approx 6{,}71$
- **Median** = 7 (data ke-4 dari 7 data)
- **Modus** = 5 (muncul 2 kali)`},
{title:'Ukuran Penyebaran Data',duration:'22 menit',content:`# Ukuran Penyebaran Data

## A. Jangkauan (Range)
$$R = x_{\\text{maks}} - x_{\\text{min}}$$

## B. Kuartil
- $Q_1$ (Kuartil bawah): membagi 25% data terbawah
- $Q_2$ (Median): membagi data menjadi dua bagian sama
- $Q_3$ (Kuartil atas): membagi 75% data terbawah

### Jangkauan Interkuartil
$$IQR = Q_3 - Q_1$$

## C. Simpangan Rata-Rata
$$SR = \\frac{\\sum |x_i - \\bar{x}|}{n}$$

## D. Varians dan Simpangan Baku

### Varians (Ragam)
$$s^2 = \\frac{\\sum(x_i - \\bar{x})^2}{n} \\quad \\text{(populasi)}$$

$$s^2 = \\frac{\\sum(x_i - \\bar{x})^2}{n-1} \\quad \\text{(sampel)}$$

### Simpangan Baku
$$s = \\sqrt{s^2}$$

### Rumus Cepat
$$s^2 = \\frac{\\sum x_i^2}{n} - \\bar{x}^2$$

## E. Contoh
Data: 2, 4, 6, 8, 10

$\\bar{x} = 6$

$s^2 = \\frac{(2-6)^2+(4-6)^2+(6-6)^2+(8-6)^2+(10-6)^2}{5}$
$= \\frac{16+4+0+4+16}{5} = 8$

$s = \\sqrt{8} = 2\\sqrt{2} \\approx 2{,}83$`},
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
