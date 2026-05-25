const fs = require('fs');
let txt = fs.readFileSync('d:/project-ta/apps/web/src/pages/admin/AdminContentEditorPage.tsx', 'utf-8');
txt = txt.replace(/const mockBankSoal: BankQuestion\[\] = \[[\s\S]*?\]/, 'const mockBankSoal: BankQuestion[] = [] // Replaced by API');
txt = txt.replace(/const handleSubmit = \(\) => \{[\s\S]*?\}, 1000\)\s*\}/, `
    const handleSubmit = async () => {
        setIsSubmitting(true)
        try {
            if (contentType === 'material') {
                await import('../../lib/api').then(m => m.materialApi.create({ ...materialData, isSystem: true, status: 'PUBLISHED', order: 1 }));
            } else {
                if (quizMode === 'manual') {
                    await import('../../lib/api').then(m => m.questionApi.create({ ...quizData, options: answers.map(a => ({ label: a.id, text: a.text, isCorrect: a.id === correctAnswer })), isSystem: true, difficulty: quizData.difficulty.toUpperCase() }));
                }
            }
            navigate('/admin/master-data')
        } catch(err) {
            console.error(err)
        } finally {
            setIsSubmitting(false)
        }
    }`);
fs.writeFileSync('d:/project-ta/apps/web/src/pages/admin/AdminContentEditorPage.tsx', txt);
console.log('Fixed admin editor');
