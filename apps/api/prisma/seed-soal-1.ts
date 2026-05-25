import { PrismaClient } from '@prisma/client'
const prisma = new PrismaClient()
type Q = { text:string; diff:'EASY'|'MEDIUM'|'HARD'; exp:string; opts:{l:string;t:string;c:boolean}[] }
const data: Record<string,Q[]> = {
'Eksponen': [
{text:'Nilai dari $2^3 \\times 2^5$ adalah...',diff:'EASY',exp:'$2^3 \\times 2^5 = 2^{3+5} = 2^8 = 256$',opts:[{l:'A',t:'$64$',c:false},{l:'B',t:'$128$',c:false},{l:'C',t:'$256$',c:true},{l:'D',t:'$512$',c:false},{l:'E',t:'$1024$',c:false}]},
{text:'Bentuk sederhana dari $\\frac{3^5}{3^2}$ adalah...',diff:'EASY',exp:'$\\frac{3^5}{3^2} = 3^{5-2} = 3^3 = 27$',opts:[{l:'A',t:'$9$',c:false},{l:'B',t:'$27$',c:true},{l:'C',t:'$81$',c:false},{l:'D',t:'$243$',c:false},{l:'E',t:'$729$',c:false}]},
{text:'Nilai dari $^2\\log 32$ adalah...',diff:'EASY',exp:'$^2\\log 32 = ^2\\log 2^5 = 5$',opts:[{l:'A',t:'$3$',c:false},{l:'B',t:'$4$',c:false},{l:'C',t:'$5$',c:true},{l:'D',t:'$6$',c:false},{l:'E',t:'$8$',c:false}]},
{text:'Jika $\\log 2 = 0{,}301$ dan $\\log 3 = 0{,}477$, maka $\\log 12 = ...$',diff:'MEDIUM',exp:'$\\log 12 = \\log(4 \\times 3) = 2\\log 2 + \\log 3 = 0{,}602 + 0{,}477 = 1{,}079$',opts:[{l:'A',t:'$0{,}778$',c:false},{l:'B',t:'$0{,}903$',c:false},{l:'C',t:'$1{,}079$',c:true},{l:'D',t:'$1{,}204$',c:false},{l:'E',t:'$1{,}380$',c:false}]},
{text:'Nilai $x$ yang memenuhi $3^{2x-1} = 27$ adalah...',diff:'MEDIUM',exp:'$3^{2x-1} = 3^3 \\Rightarrow 2x-1=3 \\Rightarrow x=2$',opts:[{l:'A',t:'$1$',c:false},{l:'B',t:'$2$',c:true},{l:'C',t:'$3$',c:false},{l:'D',t:'$4$',c:false},{l:'E',t:'$5$',c:false}]},
{text:'Nilai dari $5^0 + 5^{-2}$ adalah...',diff:'MEDIUM',exp:'$5^0 + 5^{-2} = 1 + \\frac{1}{25} = \\frac{26}{25}$',opts:[{l:'A',t:'$\\frac{24}{25}$',c:false},{l:'B',t:'$\\frac{26}{25}$',c:true},{l:'C',t:'$\\frac{6}{5}$',c:false},{l:'D',t:'$0$',c:false},{l:'E',t:'$2$',c:false}]},
{text:'Bentuk sederhana $\\sqrt[3]{64a^6b^9}$ adalah...',diff:'HARD',exp:'$\\sqrt[3]{64a^6b^9} = 4a^2b^3$',opts:[{l:'A',t:'$4a^2b^3$',c:true},{l:'B',t:'$8a^2b^3$',c:false},{l:'C',t:'$4a^3b^3$',c:false},{l:'D',t:'$8a^3b^3$',c:false},{l:'E',t:'$4ab^3$',c:false}]},
],
'Persamaan': [
{text:'Penyelesaian dari sistem $x+y=7$ dan $x-y=3$ adalah...',diff:'EASY',exp:'Jumlahkan: $2x=10, x=5$. Maka $y=2$.',opts:[{l:'A',t:'$x=5, y=2$',c:true},{l:'B',t:'$x=4, y=3$',c:false},{l:'C',t:'$x=3, y=4$',c:false},{l:'D',t:'$x=6, y=1$',c:false},{l:'E',t:'$x=2, y=5$',c:false}]},
{text:'Nilai $x$ dari $2x+5=13$ adalah...',diff:'EASY',exp:'$2x=8 \\Rightarrow x=4$',opts:[{l:'A',t:'$3$',c:false},{l:'B',t:'$4$',c:true},{l:'C',t:'$5$',c:false},{l:'D',t:'$6$',c:false},{l:'E',t:'$7$',c:false}]},
{text:'Himpunan penyelesaian $2x+3y=12$ dan $x-y=1$ adalah...',diff:'MEDIUM',exp:'Dari pers.2: $x=y+1$. Substitusi: $2(y+1)+3y=12 \\Rightarrow 5y=10, y=2, x=3$.',opts:[{l:'A',t:'$\\{(2,3)\\}$',c:false},{l:'B',t:'$\\{(3,2)\\}$',c:true},{l:'C',t:'$\\{(4,1)\\}$',c:false},{l:'D',t:'$\\{(1,4)\\}$',c:false},{l:'E',t:'$\\{(5,0)\\}$',c:false}]},
{text:'Diketahui $x+y+z=6$, $x-y+z=2$, $2x+y-z=1$. Nilai $x$ adalah...',diff:'HARD',exp:'Pers(1)-Pers(2): $2y=4, y=2$. Substitusi ke pers lain.',opts:[{l:'A',t:'$1$',c:true},{l:'B',t:'$2$',c:false},{l:'C',t:'$3$',c:false},{l:'D',t:'$4$',c:false},{l:'E',t:'$5$',c:false}]},
{text:'Nilai $2x-y$ jika $3x+y=10$ dan $x-y=2$ adalah...',diff:'MEDIUM',exp:'Jumlah: $4x=12, x=3, y=1$. Maka $2(3)-1=5$.',opts:[{l:'A',t:'$3$',c:false},{l:'B',t:'$4$',c:false},{l:'C',t:'$5$',c:true},{l:'D',t:'$6$',c:false},{l:'E',t:'$7$',c:false}]},
],
'Fungsi': [
{text:'Jika $f(x)=3x-2$, maka $f(5)=...$',diff:'EASY',exp:'$f(5)=3(5)-2=13$',opts:[{l:'A',t:'$11$',c:false},{l:'B',t:'$12$',c:false},{l:'C',t:'$13$',c:true},{l:'D',t:'$14$',c:false},{l:'E',t:'$15$',c:false}]},
{text:'Titik puncak parabola $y=x^2-6x+8$ adalah...',diff:'MEDIUM',exp:'$x_p=\\frac{6}{2}=3$, $y_p=9-18+8=-1$.',opts:[{l:'A',t:'$(3,-1)$',c:true},{l:'B',t:'$(3,1)$',c:false},{l:'C',t:'$(-3,-1)$',c:false},{l:'D',t:'$(2,0)$',c:false},{l:'E',t:'$(4,0)$',c:false}]},
{text:'Jika $f(x)=2x+1$ dan $g(x)=x^2$, maka $(f \\circ g)(3)=...$',diff:'MEDIUM',exp:'$g(3)=9$, $f(9)=19$.',opts:[{l:'A',t:'$17$',c:false},{l:'B',t:'$18$',c:false},{l:'C',t:'$19$',c:true},{l:'D',t:'$20$',c:false},{l:'E',t:'$49$',c:false}]},
{text:'Invers dari $f(x)=\\frac{2x+3}{x-1}$ adalah $f^{-1}(x)=...$',diff:'HARD',exp:'$y(x-1)=2x+3 \\Rightarrow xy-y=2x+3 \\Rightarrow x(y-2)=y+3 \\Rightarrow x=\\frac{y+3}{y-2}$',opts:[{l:'A',t:'$\\frac{x+3}{x-2}$',c:true},{l:'B',t:'$\\frac{x-3}{x+2}$',c:false},{l:'C',t:'$\\frac{x+1}{2x-3}$',c:false},{l:'D',t:'$\\frac{2x-3}{x+1}$',c:false},{l:'E',t:'$\\frac{x-1}{2x+3}$',c:false}]},
{text:'Domain fungsi $f(x)=\\sqrt{4-x^2}$ adalah...',diff:'MEDIUM',exp:'$4-x^2 \\geq 0 \\Rightarrow -2 \\leq x \\leq 2$',opts:[{l:'A',t:'$x \\geq 2$',c:false},{l:'B',t:'$x \\leq 2$',c:false},{l:'C',t:'$-2 \\leq x \\leq 2$',c:true},{l:'D',t:'$x \\geq -2$',c:false},{l:'E',t:'Semua bilangan real',c:false}]},
],
'Trigonometri': [
{text:'Nilai dari $\\sin 60°$ adalah...',diff:'EASY',exp:'$\\sin 60° = \\frac{\\sqrt{3}}{2}$ (sudut istimewa)',opts:[{l:'A',t:'$\\frac{1}{2}$',c:false},{l:'B',t:'$\\frac{\\sqrt{2}}{2}$',c:false},{l:'C',t:'$\\frac{\\sqrt{3}}{2}$',c:true},{l:'D',t:'$1$',c:false},{l:'E',t:'$\\frac{1}{\\sqrt{3}}$',c:false}]},
{text:'Nilai $\\cos 120°$ adalah...',diff:'EASY',exp:'$\\cos 120° = -\\cos 60° = -\\frac{1}{2}$',opts:[{l:'A',t:'$\\frac{1}{2}$',c:false},{l:'B',t:'$-\\frac{1}{2}$',c:true},{l:'C',t:'$\\frac{\\sqrt{3}}{2}$',c:false},{l:'D',t:'$-\\frac{\\sqrt{3}}{2}$',c:false},{l:'E',t:'$0$',c:false}]},
{text:'Jika $\\tan \\alpha = \\frac{3}{4}$ di kuadran I, maka $\\sin \\alpha = ...$',diff:'MEDIUM',exp:'Sisi miring $= 5$. $\\sin\\alpha = \\frac{3}{5}$',opts:[{l:'A',t:'$\\frac{3}{5}$',c:true},{l:'B',t:'$\\frac{4}{5}$',c:false},{l:'C',t:'$\\frac{3}{4}$',c:false},{l:'D',t:'$\\frac{5}{3}$',c:false},{l:'E',t:'$\\frac{4}{3}$',c:false}]},
{text:'Nilai $\\sin^2 45° + \\cos^2 45°$ adalah...',diff:'EASY',exp:'Identitas: $\\sin^2\\theta + \\cos^2\\theta = 1$',opts:[{l:'A',t:'$0$',c:false},{l:'B',t:'$\\frac{1}{2}$',c:false},{l:'C',t:'$1$',c:true},{l:'D',t:'$\\sqrt{2}$',c:false},{l:'E',t:'$2$',c:false}]},
{text:'Nilai dari $\\sin 75°$ adalah...',diff:'HARD',exp:'$\\sin 75°=\\sin(45°+30°)=\\sin45°\\cos30°+\\cos45°\\sin30°=\\frac{\\sqrt{6}+\\sqrt{2}}{4}$',opts:[{l:'A',t:'$\\frac{\\sqrt{6}+\\sqrt{2}}{4}$',c:true},{l:'B',t:'$\\frac{\\sqrt{6}-\\sqrt{2}}{4}$',c:false},{l:'C',t:'$\\frac{\\sqrt{3}+1}{4}$',c:false},{l:'D',t:'$\\frac{\\sqrt{3}}{2}$',c:false},{l:'E',t:'$\\frac{1+\\sqrt{2}}{2}$',c:false}]},
],
'Statistika X': [
{text:'Rata-rata dari data 5, 8, 6, 9, 7 adalah...',diff:'EASY',exp:'$\\bar{x}=\\frac{5+8+6+9+7}{5}=\\frac{35}{5}=7$',opts:[{l:'A',t:'$6$',c:false},{l:'B',t:'$7$',c:true},{l:'C',t:'$8$',c:false},{l:'D',t:'$6{,}5$',c:false},{l:'E',t:'$7{,}5$',c:false}]},
{text:'Median dari data 3, 7, 5, 2, 9, 1, 8 adalah...',diff:'EASY',exp:'Urut: 1,2,3,5,7,8,9. Median = 5 (data ke-4)',opts:[{l:'A',t:'$3$',c:false},{l:'B',t:'$5$',c:true},{l:'C',t:'$7$',c:false},{l:'D',t:'$4$',c:false},{l:'E',t:'$6$',c:false}]},
{text:'Modus data 2,3,4,3,5,3,6,4 adalah...',diff:'EASY',exp:'3 muncul 3 kali (terbanyak)',opts:[{l:'A',t:'$2$',c:false},{l:'B',t:'$3$',c:true},{l:'C',t:'$4$',c:false},{l:'D',t:'$5$',c:false},{l:'E',t:'$6$',c:false}]},
{text:'Varians dari data 2, 4, 6, 8, 10 adalah...',diff:'HARD',exp:'$\\bar{x}=6$. $s^2=\\frac{16+4+0+4+16}{5}=8$',opts:[{l:'A',t:'$4$',c:false},{l:'B',t:'$6$',c:false},{l:'C',t:'$8$',c:true},{l:'D',t:'$10$',c:false},{l:'E',t:'$12$',c:false}]},
{text:'$Q_1$ dari data 2,4,6,8,10,12 adalah...',diff:'MEDIUM',exp:'$Q_1$ = median data bawah (2,4,6) = 4',opts:[{l:'A',t:'$3$',c:false},{l:'B',t:'$4$',c:true},{l:'C',t:'$5$',c:false},{l:'D',t:'$6$',c:false},{l:'E',t:'$7$',c:false}]},
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
