import { PrismaClient } from '@prisma/client'
const prisma = new PrismaClient()
type Q = { text:string; diff:'EASY'|'MEDIUM'|'HARD'; exp:string; opts:{l:string;t:string;c:boolean}[] }
const qs: Q[] = [
{text:'Turunan dari $f(x)=5x^3$ adalah...',diff:'EASY',exp:'$f\'(x)=15x^2$',opts:[{l:'A',t:'$15x^2$',c:true},{l:'B',t:'$5x^2$',c:false},{l:'C',t:'$15x^3$',c:false},{l:'D',t:'$10x$',c:false},{l:'E',t:'$5x^4$',c:false}]},
{text:'Turunan $f(x)=x^4-3x^2+2x$ adalah...',diff:'EASY',exp:'$f\'(x)=4x^3-6x+2$',opts:[{l:'A',t:'$4x^3-6x+2$',c:true},{l:'B',t:'$4x^3-3x+2$',c:false},{l:'C',t:'$x^3-6x+2$',c:false},{l:'D',t:'$4x^3-6x^2+2$',c:false},{l:'E',t:'$3x^3-6x+2$',c:false}]},
{text:'Gradien garis singgung $y=x^2-4x+3$ di $x=3$ adalah...',diff:'MEDIUM',exp:'$y\'=2x-4$. Di $x=3$: $m=2(3)-4=2$',opts:[{l:'A',t:'$0$',c:false},{l:'B',t:'$1$',c:false},{l:'C',t:'$2$',c:true},{l:'D',t:'$3$',c:false},{l:'E',t:'$4$',c:false}]},
{text:'Nilai stasioner $f(x)=x^3-3x$ terjadi di $x=...$',diff:'MEDIUM',exp:'$f\'(x)=3x^2-3=0 \\Rightarrow x^2=1 \\Rightarrow x=\\pm1$',opts:[{l:'A',t:'$x=0$',c:false},{l:'B',t:'$x=\\pm1$',c:true},{l:'C',t:'$x=\\pm3$',c:false},{l:'D',t:'$x=3$',c:false},{l:'E',t:'$x=1$',c:false}]},
{text:'$f(x)=2x^3-9x^2+12x$ memiliki nilai maksimum lokal di...',diff:'HARD',exp:'$f\'=6x^2-18x+12=0, x^2-3x+2=0, (x-1)(x-2)=0$. $f\'\'=12x-18$. $f\'\'(1)=-6<0$ → maks di $x=1$',opts:[{l:'A',t:'$x=0$',c:false},{l:'B',t:'$x=1$',c:true},{l:'C',t:'$x=2$',c:false},{l:'D',t:'$x=3$',c:false},{l:'E',t:'$x=-1$',c:false}]},
]
async function seed() {
  const ch = await prisma.chapter.findFirst({where:{name:{contains:'Turunan'},grade:'XII',isSystem:true}})
  if(!ch){console.log('Chapter not found');return}
  const existing = await prisma.quiz.findFirst({where:{chapterId:ch.id,isSystem:true}})
  if(existing){console.log('Quiz exists');return}
  const quiz = await prisma.quiz.create({data:{title:`Latihan: ${ch.name}`,description:`Soal ${ch.name}`,chapterId:ch.id,type:'PRACTICE',timeLimit:30,passingScore:70,order:1,status:'PUBLISHED',isSystem:true}})
  for(let i=0;i<qs.length;i++){
    const q=qs[i]
    const question = await prisma.question.create({data:{text:q.text,difficulty:q.diff,explanation:q.exp,chapterId:ch.id,grade:ch.grade,isSystem:true,options:{create:q.opts.map(o=>({label:o.l,text:o.t,isCorrect:o.c}))}}})
    await prisma.quizQuestion.create({data:{quizId:quiz.id,questionId:question.id,order:i+1}})
  }
  console.log(`✅ ${ch.name}: ${qs.length} soal`)
}
seed().catch(console.error).finally(()=>prisma.$disconnect())
