import { PrismaClient } from '@prisma/client'
const prisma = new PrismaClient()
type Q = { text:string; diff:'EASY'|'MEDIUM'|'HARD'; exp:string; opts:{l:string;t:string;c:boolean}[] }
const data: Record<string,Q[]> = {
'Matriks': [
{text:'Hasil dari $\\begin{pmatrix}2&1\\\\3&4\\end{pmatrix}+\\begin{pmatrix}1&3\\\\2&1\\end{pmatrix}$ adalah...',diff:'EASY',exp:'Jumlahkan elemen bersesuaian',opts:[{l:'A',t:'$\\begin{pmatrix}3&4\\\\5&5\\end{pmatrix}$',c:true},{l:'B',t:'$\\begin{pmatrix}3&3\\\\5&5\\end{pmatrix}$',c:false},{l:'C',t:'$\\begin{pmatrix}2&4\\\\5&5\\end{pmatrix}$',c:false},{l:'D',t:'$\\begin{pmatrix}3&4\\\\4&5\\end{pmatrix}$',c:false},{l:'E',t:'$\\begin{pmatrix}4&3\\\\5&5\\end{pmatrix}$',c:false}]},
{text:'Determinan matriks $\\begin{pmatrix}3&2\\\\1&4\\end{pmatrix}$ adalah...',diff:'EASY',exp:'$\\det = 3(4)-2(1)=12-2=10$',opts:[{l:'A',t:'$8$',c:false},{l:'B',t:'$10$',c:true},{l:'C',t:'$12$',c:false},{l:'D',t:'$14$',c:false},{l:'E',t:'$6$',c:false}]},
{text:'Invers matriks $\\begin{pmatrix}2&1\\\\5&3\\end{pmatrix}$ adalah...',diff:'MEDIUM',exp:'$\\det=6-5=1$. $A^{-1}=\\begin{pmatrix}3&-1\\\\-5&2\\end{pmatrix}$',opts:[{l:'A',t:'$\\begin{pmatrix}3&-1\\\\-5&2\\end{pmatrix}$',c:true},{l:'B',t:'$\\begin{pmatrix}2&-1\\\\-5&3\\end{pmatrix}$',c:false},{l:'C',t:'$\\begin{pmatrix}3&1\\\\5&2\\end{pmatrix}$',c:false},{l:'D',t:'$\\begin{pmatrix}-3&1\\\\5&-2\\end{pmatrix}$',c:false},{l:'E',t:'Tidak punya invers',c:false}]},
{text:'Hasil $2\\begin{pmatrix}1&3\\\\2&4\\end{pmatrix}$ adalah...',diff:'EASY',exp:'Kalikan setiap elemen dengan 2',opts:[{l:'A',t:'$\\begin{pmatrix}2&6\\\\4&8\\end{pmatrix}$',c:true},{l:'B',t:'$\\begin{pmatrix}2&3\\\\2&4\\end{pmatrix}$',c:false},{l:'C',t:'$\\begin{pmatrix}3&5\\\\4&6\\end{pmatrix}$',c:false},{l:'D',t:'$\\begin{pmatrix}1&6\\\\4&4\\end{pmatrix}$',c:false},{l:'E',t:'$\\begin{pmatrix}4&6\\\\2&8\\end{pmatrix}$',c:false}]},
{text:'Jika $A=\\begin{pmatrix}1&2\\\\0&3\\end{pmatrix}$, $B=\\begin{pmatrix}2&0\\\\1&4\\end{pmatrix}$, maka $AB=...$',diff:'MEDIUM',exp:'$AB=\\begin{pmatrix}1(2)+2(1)&1(0)+2(4)\\\\0(2)+3(1)&0(0)+3(4)\\end{pmatrix}=\\begin{pmatrix}4&8\\\\3&12\\end{pmatrix}$',opts:[{l:'A',t:'$\\begin{pmatrix}4&8\\\\3&12\\end{pmatrix}$',c:true},{l:'B',t:'$\\begin{pmatrix}2&8\\\\3&12\\end{pmatrix}$',c:false},{l:'C',t:'$\\begin{pmatrix}4&6\\\\3&12\\end{pmatrix}$',c:false},{l:'D',t:'$\\begin{pmatrix}4&8\\\\1&12\\end{pmatrix}$',c:false},{l:'E',t:'$\\begin{pmatrix}2&0\\\\0&12\\end{pmatrix}$',c:false}]},
],
'Transformasi': [
{text:'Bayangan titik $(3,2)$ oleh translasi $\\begin{pmatrix}2\\\\-1\\end{pmatrix}$ adalah...',diff:'EASY',exp:'$(3+2, 2+(-1))=(5,1)$',opts:[{l:'A',t:'$(5,1)$',c:true},{l:'B',t:'$(5,3)$',c:false},{l:'C',t:'$(1,3)$',c:false},{l:'D',t:'$(1,1)$',c:false},{l:'E',t:'$(3,1)$',c:false}]},
{text:'Bayangan $(4,-3)$ oleh refleksi terhadap sumbu-x adalah...',diff:'EASY',exp:'Refleksi sumbu-x: $(x,y)\\to(x,-y)$, jadi $(4,3)$',opts:[{l:'A',t:'$(4,3)$',c:true},{l:'B',t:'$(-4,-3)$',c:false},{l:'C',t:'$(-4,3)$',c:false},{l:'D',t:'$(3,4)$',c:false},{l:'E',t:'$(-3,4)$',c:false}]},
{text:'Bayangan $(1,0)$ oleh rotasi $90°$ terhadap titik asal adalah...',diff:'MEDIUM',exp:'$\\begin{pmatrix}0&-1\\\\1&0\\end{pmatrix}\\begin{pmatrix}1\\\\0\\end{pmatrix}=\\begin{pmatrix}0\\\\1\\end{pmatrix}$',opts:[{l:'A',t:'$(0,1)$',c:true},{l:'B',t:'$(0,-1)$',c:false},{l:'C',t:'$(-1,0)$',c:false},{l:'D',t:'$(1,1)$',c:false},{l:'E',t:'$(-1,1)$',c:false}]},
{text:'Bayangan $(2,3)$ oleh dilatasi pusat O faktor 3 adalah...',diff:'EASY',exp:'$(2\\times3, 3\\times3) = (6,9)$',opts:[{l:'A',t:'$(6,9)$',c:true},{l:'B',t:'$(6,3)$',c:false},{l:'C',t:'$(2,9)$',c:false},{l:'D',t:'$(5,6)$',c:false},{l:'E',t:'$(9,6)$',c:false}]},
{text:'Bayangan $(2,5)$ oleh refleksi terhadap $y=x$ adalah...',diff:'MEDIUM',exp:'$(x,y)\\to(y,x)=(5,2)$',opts:[{l:'A',t:'$(5,2)$',c:true},{l:'B',t:'$(-2,-5)$',c:false},{l:'C',t:'$(2,-5)$',c:false},{l:'D',t:'$(-5,2)$',c:false},{l:'E',t:'$(-2,5)$',c:false}]},
],
'Barisan': [
{text:'Suku ke-10 barisan 3, 7, 11, 15, ... adalah...',diff:'EASY',exp:'$a=3, b=4$. $U_{10}=3+9(4)=39$',opts:[{l:'A',t:'$35$',c:false},{l:'B',t:'$37$',c:false},{l:'C',t:'$39$',c:true},{l:'D',t:'$41$',c:false},{l:'E',t:'$43$',c:false}]},
{text:'Jumlah 20 suku pertama deret $2+5+8+11+...$ adalah...',diff:'MEDIUM',exp:'$a=2,b=3$. $S_{20}=\\frac{20}{2}(4+19\\cdot3)=10(61)=610$',opts:[{l:'A',t:'$590$',c:false},{l:'B',t:'$600$',c:false},{l:'C',t:'$610$',c:true},{l:'D',t:'$620$',c:false},{l:'E',t:'$630$',c:false}]},
{text:'Suku ke-8 barisan geometri 2, 6, 18, ... adalah...',diff:'MEDIUM',exp:'$a=2, r=3$. $U_8=2\\cdot3^7=4374$',opts:[{l:'A',t:'$2187$',c:false},{l:'B',t:'$4374$',c:true},{l:'C',t:'$6561$',c:false},{l:'D',t:'$1458$',c:false},{l:'E',t:'$13122$',c:false}]},
{text:'$S_\\infty$ dari deret $8+4+2+1+...$ adalah...',diff:'MEDIUM',exp:'$a=8, r=\\frac{1}{2}$. $S_\\infty=\\frac{8}{1-\\frac{1}{2}}=16$',opts:[{l:'A',t:'$12$',c:false},{l:'B',t:'$14$',c:false},{l:'C',t:'$16$',c:true},{l:'D',t:'$18$',c:false},{l:'E',t:'$20$',c:false}]},
{text:'Jumlah 5 suku pertama deret geometri $3+6+12+...$ adalah...',diff:'MEDIUM',exp:'$a=3,r=2$. $S_5=\\frac{3(2^5-1)}{2-1}=93$',opts:[{l:'A',t:'$63$',c:false},{l:'B',t:'$81$',c:false},{l:'C',t:'$93$',c:true},{l:'D',t:'$96$',c:false},{l:'E',t:'$99$',c:false}]},
],
'Integral': [
{text:'$\\int 3x^2 \\, dx = ...$',diff:'EASY',exp:'$\\int 3x^2dx = x^3 + C$',opts:[{l:'A',t:'$x^3+C$',c:true},{l:'B',t:'$6x+C$',c:false},{l:'C',t:'$\\frac{3}{2}x^2+C$',c:false},{l:'D',t:'$x^2+C$',c:false},{l:'E',t:'$3x^3+C$',c:false}]},
{text:'$\\int_0^3 2x \\, dx = ...$',diff:'EASY',exp:'$[x^2]_0^3=9-0=9$',opts:[{l:'A',t:'$6$',c:false},{l:'B',t:'$9$',c:true},{l:'C',t:'$12$',c:false},{l:'D',t:'$3$',c:false},{l:'E',t:'$18$',c:false}]},
{text:'$\\int (4x^3-6x) \\, dx = ...$',diff:'MEDIUM',exp:'$x^4-3x^2+C$',opts:[{l:'A',t:'$x^4-3x^2+C$',c:true},{l:'B',t:'$12x^2-6+C$',c:false},{l:'C',t:'$4x^4-6x^2+C$',c:false},{l:'D',t:'$x^4-3x+C$',c:false},{l:'E',t:'$4x^3-3x^2+C$',c:false}]},
{text:'$\\int_1^2 (3x^2+1) \\, dx = ...$',diff:'MEDIUM',exp:'$[x^3+x]_1^2=(8+2)-(1+1)=10-2=8$',opts:[{l:'A',t:'$6$',c:false},{l:'B',t:'$7$',c:false},{l:'C',t:'$8$',c:true},{l:'D',t:'$9$',c:false},{l:'E',t:'$10$',c:false}]},
{text:'Luas daerah antara kurva $y=x^2$ dan sumbu-x dari $x=0$ sampai $x=3$ adalah...',diff:'HARD',exp:'$L=\\int_0^3 x^2dx=[\\frac{x^3}{3}]_0^3=9$',opts:[{l:'A',t:'$6$',c:false},{l:'B',t:'$9$',c:true},{l:'C',t:'$12$',c:false},{l:'D',t:'$15$',c:false},{l:'E',t:'$18$',c:false}]},
],
'Dimensi': [
{text:'Jarak titik $A(1,2,3)$ ke titik $B(4,6,3)$ adalah...',diff:'EASY',exp:'$d=\\sqrt{9+16+0}=\\sqrt{25}=5$',opts:[{l:'A',t:'$3$',c:false},{l:'B',t:'$4$',c:false},{l:'C',t:'$5$',c:true},{l:'D',t:'$6$',c:false},{l:'E',t:'$7$',c:false}]},
{text:'Diagonal ruang kubus sisi 4 cm adalah...',diff:'EASY',exp:'$d=a\\sqrt{3}=4\\sqrt{3}$ cm',opts:[{l:'A',t:'$4\\sqrt{2}$ cm',c:false},{l:'B',t:'$4\\sqrt{3}$ cm',c:true},{l:'C',t:'$8$ cm',c:false},{l:'D',t:'$8\\sqrt{2}$ cm',c:false},{l:'E',t:'$8\\sqrt{3}$ cm',c:false}]},
{text:'Sudut diagonal ruang kubus terhadap alas adalah...',diff:'MEDIUM',exp:'$\\tan\\alpha=\\frac{a}{a\\sqrt{2}}=\\frac{1}{\\sqrt{2}}$, $\\alpha=\\arctan\\frac{\\sqrt{2}}{2}\\approx35{,}26°$',opts:[{l:'A',t:'$30°$',c:false},{l:'B',t:'$35{,}26°$',c:true},{l:'C',t:'$45°$',c:false},{l:'D',t:'$54{,}74°$',c:false},{l:'E',t:'$60°$',c:false}]},
{text:'Volume limas segi empat alas $6\\times6$ cm, tinggi 8 cm adalah...',diff:'EASY',exp:'$V=\\frac{1}{3}\\times36\\times8=96$ cm³',opts:[{l:'A',t:'$72$ cm³',c:false},{l:'B',t:'$96$ cm³',c:true},{l:'C',t:'$144$ cm³',c:false},{l:'D',t:'$192$ cm³',c:false},{l:'E',t:'$288$ cm³',c:false}]},
{text:'Jarak titik puncak limas beraturan T.ABCD sisi 6, tinggi 4 ke alas adalah...',diff:'EASY',exp:'Tinggi limas = 4 cm (tegak lurus alas)',opts:[{l:'A',t:'$4$ cm',c:true},{l:'B',t:'$5$ cm',c:false},{l:'C',t:'$6$ cm',c:false},{l:'D',t:'$3\\sqrt{2}$ cm',c:false},{l:'E',t:'$2\\sqrt{5}$ cm',c:false}]},
],
'Peluang': [
{text:'Sebuah dadu dilempar. Peluang muncul angka prima adalah...',diff:'EASY',exp:'Prima: 2,3,5. $P=\\frac{3}{6}=\\frac{1}{2}$',opts:[{l:'A',t:'$\\frac{1}{3}$',c:false},{l:'B',t:'$\\frac{1}{2}$',c:true},{l:'C',t:'$\\frac{2}{3}$',c:false},{l:'D',t:'$\\frac{1}{6}$',c:false},{l:'E',t:'$\\frac{5}{6}$',c:false}]},
{text:'Dua koin dilempar. Peluang muncul tepat 1 gambar adalah...',diff:'EASY',exp:'$S=\\{GG,GA,AG,AA\\}$. Tepat 1 gambar: GA, AG. $P=\\frac{2}{4}=\\frac{1}{2}$',opts:[{l:'A',t:'$\\frac{1}{4}$',c:false},{l:'B',t:'$\\frac{1}{2}$',c:true},{l:'C',t:'$\\frac{3}{4}$',c:false},{l:'D',t:'$\\frac{1}{3}$',c:false},{l:'E',t:'$\\frac{2}{3}$',c:false}]},
{text:'Dari 52 kartu, peluang terambil kartu As adalah...',diff:'EASY',exp:'Ada 4 As. $P=\\frac{4}{52}=\\frac{1}{13}$',opts:[{l:'A',t:'$\\frac{1}{13}$',c:true},{l:'B',t:'$\\frac{1}{4}$',c:false},{l:'C',t:'$\\frac{4}{13}$',c:false},{l:'D',t:'$\\frac{1}{52}$',c:false},{l:'E',t:'$\\frac{1}{26}$',c:false}]},
{text:'$P(A)=0{,}4$, $P(B)=0{,}3$, A dan B independen. $P(A \\cap B)=...$',diff:'MEDIUM',exp:'Independen: $P(A\\cap B)=P(A)\\cdot P(B)=0{,}12$',opts:[{l:'A',t:'$0{,}7$',c:false},{l:'B',t:'$0{,}1$',c:false},{l:'C',t:'$0{,}12$',c:true},{l:'D',t:'$0{,}58$',c:false},{l:'E',t:'$0{,}3$',c:false}]},
{text:'Banyak cara menyusun 3 huruf dari kata MATH adalah...',diff:'MEDIUM',exp:'$P(4,3)=\\frac{4!}{(4-3)!}=24$',opts:[{l:'A',t:'$6$',c:false},{l:'B',t:'$12$',c:false},{l:'C',t:'$24$',c:true},{l:'D',t:'$36$',c:false},{l:'E',t:'$48$',c:false}]},
],
'Statistika Inf': [
{text:'Jika $Z=\\frac{X-\\mu}{\\sigma}$, $\\mu=50$, $\\sigma=5$, maka $Z$ untuk $X=60$ adalah...',diff:'EASY',exp:'$Z=\\frac{60-50}{5}=2$',opts:[{l:'A',t:'$1$',c:false},{l:'B',t:'$2$',c:true},{l:'C',t:'$3$',c:false},{l:'D',t:'$10$',c:false},{l:'E',t:'$0{,}5$',c:false}]},
{text:'Rata-rata sampel 36 data adalah 75, $\\sigma=6$. Batas atas interval kepercayaan 95% ($z=1{,}96$) adalah...',diff:'MEDIUM',exp:'$75+1{,}96\\cdot\\frac{6}{\\sqrt{36}}=75+1{,}96=76{,}96$',opts:[{l:'A',t:'$75{,}96$',c:false},{l:'B',t:'$76{,}96$',c:true},{l:'C',t:'$77{,}96$',c:false},{l:'D',t:'$78{,}96$',c:false},{l:'E',t:'$80$',c:false}]},
{text:'Populasi berdistribusi normal. Sampel $n=25$, $\\bar{x}=80$, $s=10$. Nilai statistik uji $t$ untuk $\\mu_0=75$ adalah...',diff:'HARD',exp:'$t=\\frac{80-75}{10/\\sqrt{25}}=\\frac{5}{2}=2{,}5$',opts:[{l:'A',t:'$1{,}5$',c:false},{l:'B',t:'$2{,}0$',c:false},{l:'C',t:'$2{,}5$',c:true},{l:'D',t:'$3{,}0$',c:false},{l:'E',t:'$5{,}0$',c:false}]},
{text:'Error standar rata-rata dengan $\\sigma=12$ dan $n=36$ adalah...',diff:'EASY',exp:'$SE=\\frac{\\sigma}{\\sqrt{n}}=\\frac{12}{6}=2$',opts:[{l:'A',t:'$1$',c:false},{l:'B',t:'$2$',c:true},{l:'C',t:'$3$',c:false},{l:'D',t:'$4$',c:false},{l:'E',t:'$6$',c:false}]},
{text:'Koefisien korelasi $r=-0{,}85$ menunjukkan...',diff:'EASY',exp:'$r$ negatif mendekati $-1$: hubungan linear negatif kuat',opts:[{l:'A',t:'Hubungan positif kuat',c:false},{l:'B',t:'Hubungan negatif kuat',c:true},{l:'C',t:'Tidak ada hubungan',c:false},{l:'D',t:'Hubungan positif lemah',c:false},{l:'E',t:'Hubungan negatif lemah',c:false}]},
],
}
async function seed() {
  const chapters = await prisma.chapter.findMany({where:{isSystem:true}})
  let tq=0,tqz=0
  for (const ch of chapters) {
    let qs: Q[]|undefined
    for (const [k,v] of Object.entries(data)) { if(ch.name.toLowerCase().includes(k.toLowerCase())){qs=v;break} }
    if(!qs) continue
    const existing = await prisma.quiz.findFirst({where:{chapterId:ch.id,isSystem:true}})
    if(existing) continue
    const quiz = await prisma.quiz.create({data:{title:`Latihan: ${ch.name}`,description:`Soal latihan ${ch.name}`,chapterId:ch.id,type:'PRACTICE',timeLimit:30,passingScore:70,order:1,status:'PUBLISHED',isSystem:true}})
    tqz++
    for (let i=0;i<qs.length;i++) {
      const q=qs[i]
      const question = await prisma.question.create({data:{text:q.text,difficulty:q.diff,explanation:q.exp,chapterId:ch.id,grade:ch.grade,isSystem:true,options:{create:q.opts.map(o=>({label:o.l,text:o.t,isCorrect:o.c}))}}})
      await prisma.quizQuestion.create({data:{quizId:quiz.id,questionId:question.id,order:i+1}})
      tq++
    }
    console.log(`✅ ${ch.name}: ${qs.length} soal`)
  }
  console.log(`\nTotal: ${tqz} kuis, ${tq} soal`)
}
seed().catch(console.error).finally(()=>prisma.$disconnect())
