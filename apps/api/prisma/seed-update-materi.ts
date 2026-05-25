import { PrismaClient } from '@prisma/client'
const prisma = new PrismaClient()

const updates: Record<string,{title:string,content:string,duration:string}[]> = {
'Eksponen': [
{title:'Konsep Bilangan Berpangkat',duration:'20 menit',content:`# Bilangan Berpangkat (Eksponen)

## A. Pengertian Eksponen

Bilangan berpangkat atau eksponen adalah bentuk perkalian berulang suatu bilangan yang sama.

$$a^n = \\underbrace{a \\times a \\times a \\times \\cdots \\times a}_{n \\text{ faktor}}$$

**Keterangan:**
- $a$ disebut **bilangan pokok** (basis)
- $n$ disebut **pangkat** (eksponen)

**Contoh:**
- $2^4 = 2 \\times 2 \\times 2 \\times 2 = 16$
- $3^3 = 3 \\times 3 \\times 3 = 27$
- $5^2 = 5 \\times 5 = 25$

---

## B. Sifat-Sifat Eksponen (Bilangan Bulat)

### 1. Perkalian Basis Sama
$$a^m \\times a^n = a^{m+n}$$
**Contoh:** $2^3 \\times 2^4 = 2^{3+4} = 2^7 = 128$

### 2. Pembagian Basis Sama
$$\\frac{a^m}{a^n} = a^{m-n}, \\quad a \\neq 0$$
**Contoh:** $\\frac{5^6}{5^2} = 5^{6-2} = 5^4 = 625$

### 3. Pangkat dari Pangkat
$$(a^m)^n = a^{m \\times n}$$
**Contoh:** $(2^3)^2 = 2^{3 \\times 2} = 2^6 = 64$

### 4. Pangkat dari Perkalian
$$(a \\times b)^n = a^n \\times b^n$$
**Contoh:** $(2 \\times 3)^3 = 2^3 \\times 3^3 = 8 \\times 27 = 216$

### 5. Pangkat dari Pembagian
$$\\left(\\frac{a}{b}\\right)^n = \\frac{a^n}{b^n}, \\quad b \\neq 0$$
**Contoh:** $\\left(\\frac{3}{2}\\right)^2 = \\frac{9}{4}$

---

## C. Pangkat Nol dan Pangkat Negatif

### Pangkat Nol
$$a^0 = 1, \\quad a \\neq 0$$

### Pangkat Negatif
$$a^{-n} = \\frac{1}{a^n}, \\quad a \\neq 0$$

**Contoh:**
- $5^0 = 1$
- $2^{-3} = \\frac{1}{2^3} = \\frac{1}{8}$
- $10^{-2} = \\frac{1}{100} = 0{,}01$

---

## D. Pangkat Pecahan (Bentuk Akar)

$$a^{\\frac{m}{n}} = \\sqrt[n]{a^m} = (\\sqrt[n]{a})^m$$

**Contoh:**
- $8^{\\frac{1}{3}} = \\sqrt[3]{8} = 2$
- $27^{\\frac{2}{3}} = (\\sqrt[3]{27})^2 = 3^2 = 9$
- $16^{\\frac{3}{4}} = (\\sqrt[4]{16})^3 = 2^3 = 8$

---

## E. Bentuk Akar

### Sifat Operasi Bentuk Akar
- $\\sqrt{a} \\times \\sqrt{b} = \\sqrt{ab}$
- $\\frac{\\sqrt{a}}{\\sqrt{b}} = \\sqrt{\\frac{a}{b}}$
- $a\\sqrt{b} \\pm c\\sqrt{b} = (a \\pm c)\\sqrt{b}$

### Merasionalkan Penyebut
$$\\frac{a}{\\sqrt{b}} = \\frac{a\\sqrt{b}}{b}$$

$$\\frac{a}{\\sqrt{b}+\\sqrt{c}} = \\frac{a(\\sqrt{b}-\\sqrt{c})}{b-c}$$

**Contoh:**
$$\\frac{6}{\\sqrt{3}} = \\frac{6\\sqrt{3}}{3} = 2\\sqrt{3}$$`},
{title:'Logaritma',duration:'25 menit',content:`# Logaritma

## A. Pengertian Logaritma

Logaritma adalah **invers (kebalikan) dari eksponen**. Jika $a^c = b$, maka:

$$^a\\log b = c \\quad \\Leftrightarrow \\quad a^c = b$$

**Keterangan:**
- $a$ = basis/bilangan pokok ($a > 0$, $a \\neq 1$)
- $b$ = numerus/bilangan yang dicari logaritmanya ($b > 0$)
- $c$ = hasil logaritma

**Contoh:**
- $^2\\log 8 = 3$ karena $2^3 = 8$
- $^3\\log 81 = 4$ karena $3^4 = 81$
- $^5\\log 125 = 3$ karena $5^3 = 125$

---

## B. Sifat-Sifat Logaritma

### 1. Logaritma Perkalian
$$^a\\log(b \\times c) = {^a\\log b} + {^a\\log c}$$

### 2. Logaritma Pembagian
$$^a\\log\\frac{b}{c} = {^a\\log b} - {^a\\log c}$$

### 3. Logaritma Pangkat
$$^a\\log b^n = n \\cdot {^a\\log b}$$

### 4. Perubahan Basis
$$^a\\log b = \\frac{^c\\log b}{^c\\log a}$$

### 5. Sifat Khusus
- $^a\\log a = 1$
- $^a\\log 1 = 0$
- $^a\\log b \\times {^b\\log c} = {^a\\log c}$
- $^a\\log b = \\frac{1}{^b\\log a}$

---

## C. Logaritma Umum dan Logaritma Natural

| Notasi | Arti | Basis |
|--------|------|-------|
| $\\log x$ | Logaritma umum | $10$ |
| $\\ln x$ | Logaritma natural | $e \\approx 2{,}718$ |

---

## D. Contoh Soal dan Pembahasan

**Soal 1:** Jika $\\log 2 = 0{,}301$, tentukan $\\log 8$.

**Pembahasan:**
$$\\log 8 = \\log 2^3 = 3 \\log 2 = 3 \\times 0{,}301 = 0{,}903$$

**Soal 2:** Sederhanakan $^2\\log 12 + {^2\\log 4} - {^2\\log 6}$

**Pembahasan:**
$$= {^2\\log \\frac{12 \\times 4}{6}} = {^2\\log 8} = {^2\\log 2^3} = 3$$`},
{title:'Persamaan Eksponen dan Logaritma',duration:'22 menit',content:`# Persamaan Eksponen dan Logaritma

## A. Persamaan Eksponen

### Bentuk 1: $a^{f(x)} = a^{g(x)}$
Jika basis sama:
$$f(x) = g(x)$$

**Contoh:** $3^{2x-1} = 3^5 \\Rightarrow 2x-1 = 5 \\Rightarrow x = 3$

### Bentuk 2: $a^{f(x)} = b^{f(x)}$, dengan $a \\neq b$
$$f(x) = 0$$

### Bentuk 3: Substitusi (bentuk kuadrat)
$a^{2x} + pa^x + q = 0$, misalkan $y = a^x$

**Contoh:** $4^x - 6 \\cdot 2^x + 8 = 0$
- Misalkan $y = 2^x$, maka $y^2 - 6y + 8 = 0$
- $(y-2)(y-4) = 0 \\Rightarrow y = 2$ atau $y = 4$
- $2^x = 2 \\Rightarrow x = 1$ atau $2^x = 4 \\Rightarrow x = 2$

---

## B. Persamaan Logaritma

### Bentuk 1: $^a\\log f(x) = {^a\\log g(x)}$
$$f(x) = g(x)$$
Syarat: $f(x) > 0$ dan $g(x) > 0$

### Bentuk 2: $^a\\log f(x) = c$
$$f(x) = a^c$$

**Contoh:** $^3\\log(x+2) = 2$
$$x + 2 = 3^2 = 9$$
$$x = 7$$

---

## C. Pertidaksamaan Eksponen

Jika $a > 1$:
$$a^{f(x)} > a^{g(x)} \\Rightarrow f(x) > g(x)$$

Jika $0 < a < 1$:
$$a^{f(x)} > a^{g(x)} \\Rightarrow f(x) < g(x) \\quad \\text{(tanda berbalik)}$$`},
],
'Persamaan': [
{title:'Sistem Persamaan Linear Dua Variabel (SPLDV)',duration:'25 menit',content:`# Sistem Persamaan Linear Dua Variabel

## A. Pengertian

SPLDV adalah sistem yang terdiri dari dua persamaan linear dengan dua variabel (biasanya $x$ dan $y$).

$$\\begin{cases} a_1x + b_1y = c_1 \\\\ a_2x + b_2y = c_2 \\end{cases}$$

---

## B. Metode Penyelesaian

### 1. Metode Substitusi

**Langkah:**
1. Nyatakan satu variabel dalam variabel lain dari salah satu persamaan
2. Substitusikan ke persamaan lainnya
3. Selesaikan persamaan satu variabel

**Contoh:** $x + y = 5$ dan $2x - y = 1$

Dari pers.(1): $y = 5 - x$

Substitusi ke pers.(2): $2x - (5-x) = 1 \\Rightarrow 3x = 6 \\Rightarrow x = 2$

Maka $y = 5 - 2 = 3$

**HP: $\\{(2, 3)\\}$**

### 2. Metode Eliminasi

**Langkah:**
1. Samakan koefisien salah satu variabel
2. Jumlahkan atau kurangkan kedua persamaan

**Contoh:** $2x + 3y = 12$ dan $x - y = 1$

Eliminasi $x$:
$$2x + 3y = 12 \\quad \\text{...(1)}$$
$$2x - 2y = 2 \\quad \\text{...(2) dikali 2}$$
$$\\text{(1)-(2):} \\quad 5y = 10 \\Rightarrow y = 2$$

Substitusi: $x = 1 + y = 3$

### 3. Metode Determinan (Matriks)
$$x = \\frac{\\begin{vmatrix}c_1&b_1\\\\c_2&b_2\\end{vmatrix}}{\\begin{vmatrix}a_1&b_1\\\\a_2&b_2\\end{vmatrix}}, \\quad y = \\frac{\\begin{vmatrix}a_1&c_1\\\\a_2&c_2\\end{vmatrix}}{\\begin{vmatrix}a_1&b_1\\\\a_2&b_2\\end{vmatrix}}$$

---

## C. Soal Cerita SPLDV

**Contoh:** Harga 3 buku dan 2 pensil Rp21.000. Harga 1 buku dan 4 pensil Rp17.000. Berapa harga 1 buku dan 1 pensil?

Misalkan buku = $x$, pensil = $y$:
$$3x + 2y = 21.000$$
$$x + 4y = 17.000$$

Eliminasi: $x = 5.000$, $y = 3.000$

Harga 1 buku + 1 pensil = Rp8.000`},
{title:'Sistem Persamaan Linear Tiga Variabel (SPLTV)',duration:'25 menit',content:`# Sistem Persamaan Linear Tiga Variabel

## A. Bentuk Umum

$$\\begin{cases} a_1x + b_1y + c_1z = d_1 \\\\ a_2x + b_2y + c_2z = d_2 \\\\ a_3x + b_3y + c_3z = d_3 \\end{cases}$$

## B. Langkah Penyelesaian

1. **Eliminasi** satu variabel dari dua pasang persamaan → dapat SPLDV
2. **Selesaikan** SPLDV tersebut
3. **Substitusi balik** untuk mencari variabel ketiga

---

## C. Contoh Lengkap

Selesaikan:
$$x + y + z = 6 \\quad \\text{...(1)}$$
$$2x + y - z = 1 \\quad \\text{...(2)}$$
$$x - y + 2z = 5 \\quad \\text{...(3)}$$

**Langkah 1:** Eliminasi $z$

Pers.(1) + Pers.(2):
$$3x + 2y = 7 \\quad \\text{...(4)}$$

Pers.(2) + 2×Pers.(1):
$$4x + 3y = 13 \\quad \\text{...(5)}$$

**Langkah 2:** Selesaikan SPLDV (4) dan (5)

Dari (4): $x = \\frac{7-2y}{3}$

Substitusi ke (5): $y = 3, x = \\frac{1}{3}$... (lanjutkan perhitungan)

**Langkah 3:** Substitusi balik ke pers.(1) untuk mendapatkan $z$.

---

## D. Aplikasi SPLTV

SPLTV sering digunakan dalam:
- Masalah campuran (mixing problems)
- Optimasi biaya
- Analisis data dengan tiga variabel`},
],
}

async function updateMaterials() {
  const chapters = await prisma.chapter.findMany({where:{isSystem:true}})
  let count = 0
  for (const ch of chapters) {
    let matched: typeof updates[string] | undefined
    for (const [key, mats] of Object.entries(updates)) {
      if (ch.name.toLowerCase().includes(key.toLowerCase())) { matched = mats; break }
    }
    if (!matched) continue
    await prisma.material.deleteMany({where:{chapterId:ch.id}})
    for (let i = 0; i < matched.length; i++) {
      const m = matched[i]
      await prisma.material.create({data:{
        title:m.title, content:m.content, duration:m.duration,
        chapterId:ch.id, order:i+1, status:'PUBLISHED', isSystem:true
      }})
      count++
    }
    console.log(`✅ ${ch.name}: ${matched.length} materi diperbarui`)
  }
  console.log(`\nTotal: ${count} materi diperbarui`)
}

updateMaterials().catch(console.error).finally(()=>prisma.$disconnect())
