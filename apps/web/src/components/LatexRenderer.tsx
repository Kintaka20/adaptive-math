import { useEffect, useRef } from 'react'
import katex from 'katex'
import 'katex/dist/katex.min.css'

interface LatexRendererProps {
    content: string
    className?: string
}

export default function LatexRenderer({ content, className = '' }: LatexRendererProps) {
    const containerRef = useRef<HTMLDivElement>(null)

    useEffect(() => {
        if (!containerRef.current) return

        let processed = content

        processed = processed.replace(/\$\$([\s\S]*?)\$\$/g, (_, latex) => {
            try {
                const rendered = katex.renderToString(latex.trim(), {
                    displayMode: true,
                    throwOnError: false
                }).replace(/\n/g, '')
                return `\n%%KATEX_BLOCK%%${rendered}%%END_KATEX_BLOCK%%\n`
            } catch {
                return `\n<code class="text-red-500">${latex}</code>\n`
            }
        })

        processed = processed.replace(/\$([^$\n]+)\$/g, (_, latex) => {
            try {
                const rendered = katex.renderToString(latex.trim(), {
                    displayMode: false,
                    throwOnError: false
                }).replace(/\n/g, '')
                return `<span class="ai-katex-inline">${rendered}</span>`
            } catch {
                return `<code class="text-red-500">${latex}</code>`
            }
        })

        processed = processed.replace(/!\[([^\]]*)\]\s*\(([^)]+)\)/g, '<img src="$2" alt="$1" class="ai-image" style="max-width:100%;max-height:500px;object-fit:contain;border-radius:0.75rem;margin:1rem auto;display:block;" />')

        const lines = processed.split('\n')
        const outputLines: string[] = []
        let inList = false
        let inOrderedList = false

        const applyInline = (text: string) => text
            .replace(/\*\*(.*?)\*\*/g, '<strong class="ai-bold">$1</strong>')
            .replace(/\*(.*?)\*/g, '<em>$1</em>')
            .replace(/`([^`]+)`/g, '<code class="ai-code">$1</code>')

        for (let i = 0; i < lines.length; i++) {
            let line = lines[i]

            if (line.includes('%%KATEX_BLOCK%%')) {
                if (inList) { outputLines.push('</ul>'); inList = false }
                if (inOrderedList) { outputLines.push('</ol>'); inOrderedList = false }
                line = line
                    .replace(/%%KATEX_BLOCK%%/g, '<div class="ai-katex-block">')
                    .replace(/%%END_KATEX_BLOCK%%/g, '</div>')
                outputLines.push(line)
                continue
            }

            if (line.match(/^### /)) {
                if (inList) { outputLines.push('</ul>'); inList = false }
                if (inOrderedList) { outputLines.push('</ol>'); inOrderedList = false }
                line = `<h3 class="ai-h3">${applyInline(line.substring(4))}</h3>`
            } else if (line.match(/^## /)) {
                if (inList) { outputLines.push('</ul>'); inList = false }
                if (inOrderedList) { outputLines.push('</ol>'); inOrderedList = false }
                line = `<h2 class="ai-h2">${applyInline(line.substring(3))}</h2>`
            } else if (line.match(/^# /)) {
                if (inList) { outputLines.push('</ul>'); inList = false }
                if (inOrderedList) { outputLines.push('</ol>'); inOrderedList = false }
                line = `<h1 class="ai-h1">${applyInline(line.substring(2))}</h1>`
            }
            else if (line.match(/^[-*] /)) {
                if (inOrderedList) { outputLines.push('</ol>'); inOrderedList = false }
                if (!inList) {
                    outputLines.push('<ul class="ai-ul">')
                    inList = true
                }
                line = `<li>${applyInline(line.substring(2))}</li>`
            }
            else if (line.match(/^\d+\.\s/)) {
                if (inList) { outputLines.push('</ul>'); inList = false }
                const match = line.match(/^\d+\.\s(.*)/)
                if (match) {
                    if (!inOrderedList) {
                        outputLines.push('<ol class="ai-ol">')
                        inOrderedList = true
                    }
                    line = `<li>${applyInline(match[1])}</li>`
                }
            }
            else {
                if (inList) { outputLines.push('</ul>'); inList = false }
                if (inOrderedList) { outputLines.push('</ol>'); inOrderedList = false }

                line = applyInline(line)

                if (line.trim() && !line.startsWith('<h') && !line.startsWith('<div') && !line.startsWith('<ul') && !line.startsWith('<ol') && !line.startsWith('<li') && !line.startsWith('<img')) {
                    line = `<p class="ai-p">${line}</p>`
                } else if (!line.trim()) {
                    line = '<div class="ai-spacer"></div>'
                }
            }

            outputLines.push(line)
        }

        if (inList) outputLines.push('</ul>')
        if (inOrderedList) outputLines.push('</ol>')

        containerRef.current.innerHTML = outputLines.join('')
    }, [content])

    return (
        <div
            ref={containerRef}
            className={`ai-chat-content ${className}`}
        />
    )
}
