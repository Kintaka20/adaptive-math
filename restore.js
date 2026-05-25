
const fs = require('fs');
const lines = fs.readFileSync('C:/Users/kinta/.gemini/antigravity/brain/663b6400-14fa-4af9-a26f-5378c2cf47e9/.system_generated/logs/transcript.jsonl', 'utf-8').split('\n').filter(l => l.trim().length > 0);
const viewLogs = lines.map(l => JSON.parse(l)).filter(o => o.type === 'VIEW_FILE' && o.content.includes('ContentEditorPage.tsx') && o.content.includes('Showing lines 1 to 800'));
const content1 = viewLogs[0].content;
const marker = 'leading space.\n';
const startIdx1 = content1.indexOf(marker) + marker.length;
const lines1 = content1.substring(startIdx1).split('\n');
const cleanLines1 = [];
for(let l of lines1) {
    if(l.startsWith('<truncated')) break;
    const colonIdx = l.indexOf(': ');
    if(colonIdx !== -1 && !isNaN(parseInt(l.substring(0, colonIdx)))) {
        cleanLines1.push(l.substring(colonIdx + 2).replace(/\r$/, ''));
    }
}
const viewLogs2 = lines.map(l => JSON.parse(l)).filter(o => o.type === 'VIEW_FILE' && o.content.includes('ContentEditorPage.tsx') && o.content.includes('Showing lines 600 to 863'));
const content2 = viewLogs2[0].content;
const startIdx2 = content2.indexOf(marker) + marker.length;
const lines2 = content2.substring(startIdx2).split('\n');
const cleanLines2 = [];
for(let l of lines2) {
    if(l.startsWith('The above content')) break;
    const colonIdx = l.indexOf(': ');
    if(colonIdx !== -1 && !isNaN(parseInt(l.substring(0, colonIdx)))) {
        const lineNum = parseInt(l.substring(0, colonIdx));
        if(lineNum > 800) {
            cleanLines2.push(l.substring(colonIdx + 2).replace(/\r$/, ''));
        }
    }
}
fs.writeFileSync('d:/project-ta/apps/web/src/pages/teacher/ContentEditorPage.tsx', cleanLines1.join('\n') + '\n' + cleanLines2.join('\n'));
console.log('Successfully restored file!');

