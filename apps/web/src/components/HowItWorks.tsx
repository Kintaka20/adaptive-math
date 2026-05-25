interface StepProps {
    number: number
    title: string
    description: string
    isLast?: boolean
}

function Step({ number, title, description, isLast = false }: StepProps) {
    return (
        <div className="relative flex flex-col items-center text-center group">
            {/* Connector line (hidden on last step and on mobile) */}
            {!isLast && (
                <div className="hidden md:block absolute top-6 left-1/2 w-full h-[2px] bg-slate-200 dark:bg-slate-700 -z-10"></div>
            )}

            {/* Step number */}
            <div className="size-12 rounded-full bg-white dark:bg-slate-800 border-2 border-primary text-primary font-bold text-xl flex items-center justify-center shadow-md mb-6 relative z-10 group-hover:bg-primary group-hover:text-white transition-colors duration-300">
                {number}
            </div>

            <h4 className="text-lg font-bold text-slate-900 dark:text-white mb-2">{title}</h4>
            <p className="text-sm text-slate-600 dark:text-slate-400 px-4">{description}</p>
        </div>
    )
}

const steps = [
    {
        number: 1,
        title: 'Diagnostic Test',
        description: 'Take a quick assessment to find your current level.',
    },
    {
        number: 2,
        title: 'Custom Roadmap',
        description: 'Get a personalized learning path tailored to your goals.',
    },
    {
        number: 3,
        title: 'AI Tutor Practice',
        description: 'Practice problems with real-time feedback and hints.',
    },
    {
        number: 4,
        title: 'Master Concepts',
        description: 'Achieve fluency and move to the next level of difficulty.',
    },
]

export default function HowItWorks() {
    return (
        <section className="py-24 bg-background-light dark:bg-background-dark overflow-hidden" id="how-it-works">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="text-center mb-16">
                    <h2 className="text-3xl lg:text-4xl font-black text-slate-900 dark:text-white mb-4 tracking-tight">
                        How It Works
                    </h2>
                    <p className="text-lg text-slate-600 dark:text-slate-400">
                        Mastering a new topic is easy with our 4-step process.
                    </p>
                </div>

                <div className="relative">
                    {/* Steps Container */}
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-8 relative z-10">
                        {steps.map((step, index) => (
                            <Step
                                key={step.number}
                                {...step}
                                isLast={index === steps.length - 1}
                            />
                        ))}
                    </div>
                </div>
            </div>
        </section>
    )
}
