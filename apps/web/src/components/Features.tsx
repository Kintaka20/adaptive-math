interface FeatureCardProps {
    icon: string
    iconBgColor: string
    iconTextColor: string
    title: string
    description: string
}

function FeatureCard({ icon, iconBgColor, iconTextColor, title, description }: FeatureCardProps) {
    return (
        <div className="group p-8 rounded-2xl bg-slate-50 dark:bg-slate-800 border border-slate-100 dark:border-slate-700 hover:shadow-card-hover hover:border-primary/30 hover:bg-white dark:hover:bg-slate-800 transition-all duration-300 cursor-default">
            <div className={`size-12 rounded-xl ${iconBgColor} ${iconTextColor} flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300`}>
                <span className="material-symbols-outlined text-2xl">{icon}</span>
            </div>
            <h4 className="text-xl font-bold text-slate-900 dark:text-white mb-3">{title}</h4>
            <p className="text-slate-600 dark:text-slate-400 leading-relaxed">
                {description}
            </p>
        </div>
    )
}

const features = [
    {
        icon: 'psychology',
        iconBgColor: 'bg-blue-100',
        iconTextColor: 'text-blue-600',
        title: 'Adaptive Learning',
        description: 'Curriculum that automatically evolves with your pace, strengthening your weak areas.',
    },
    {
        icon: 'smart_toy',
        iconBgColor: 'bg-purple-100',
        iconTextColor: 'text-purple-600',
        title: 'AI Socratic Tutor',
        description: 'Never get stuck again. The AI asks guiding questions to help you solve problems yourself.',
    },
    {
        icon: 'trending_up',
        iconBgColor: 'bg-teal-100',
        iconTextColor: 'text-teal-600',
        title: 'Progress Tracking',
        description: 'Detailed analytics and visualizations to show your improvement and mastery over time.',
    },
    {
        icon: 'trophy',
        iconBgColor: 'bg-yellow-100',
        iconTextColor: 'text-yellow-600',
        title: 'Gamification',
        description: 'Earn badges, climb leaderboards, and keep your daily streak alive to stay motivated.',
    },
    {
        icon: 'supervisor_account',
        iconBgColor: 'bg-red-100',
        iconTextColor: 'text-red-600',
        title: 'Teacher Control',
        description: 'Teachers get real-time dashboards to identify struggling students and assign homework.',
    },
    {
        icon: 'smartphone',
        iconBgColor: 'bg-indigo-100',
        iconTextColor: 'text-indigo-600',
        title: 'Mobile Friendly',
        description: 'Seamless experience across desktop, tablet, and mobile so you can learn anywhere.',
    },
]

export default function Features() {
    return (
        <section className="py-24 bg-white dark:bg-slate-900 relative" id="features">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="text-center max-w-3xl mx-auto mb-16">
                    <h2 className="text-primary font-bold tracking-wide uppercase text-sm mb-3">Core Features</h2>
                    <h3 className="text-3xl lg:text-4xl font-black text-slate-900 dark:text-white mb-4 tracking-tight">
                        Why Choose AdaptiveMath?
                    </h3>
                    <p className="text-lg text-slate-600 dark:text-slate-400">
                        Our platform combines advanced AI with proven pedagogical methods to help you master math concepts faster.
                    </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {features.map((feature, index) => (
                        <FeatureCard key={index} {...feature} />
                    ))}
                </div>
            </div>
        </section>
    )
}
