import { Briefcase } from 'lucide-react';

interface Section {
  id: string;
  title: string;
  description: string;
  icon: React.ComponentType<{ size?: number; className?: string }>;
  color: string;
}

const SECTIONS: Section[] = [
  {
    id: 'honorario',
    title: 'Honorário',
    description: 'Gestão e acompanhamento de honorários',
    icon: Briefcase,
    color: 'from-ocl-primary to-ocl-secondary',
  },
];

interface LandingPageProps {
  onSectionSelect: (sectionId: string) => void;
}

export const LandingPage = ({ onSectionSelect }: Readonly<LandingPageProps>) => {
  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-slate-50 to-slate-100 p-6">
      <div className="w-full max-w-6xl">
        <div className="mb-12 text-center">
          <h1 className="mb-4 text-5xl font-bold text-slate-800">Dashboard OCL</h1>
          <p className="text-lg text-slate-600">Selecione uma seção para começar</p>
        </div>

        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
          {SECTIONS.map((section) => {
            const Icon = section.icon;
            return (
              <button
                key={section.id}
                onClick={() => onSectionSelect(section.id)}
                className="group relative overflow-hidden rounded-2xl bg-white p-8 shadow-lg transition-all duration-300 hover:scale-105 hover:shadow-2xl"
              >
                <div
                  className={`absolute inset-0 bg-gradient-to-br ${section.color} opacity-0 transition-opacity duration-300 group-hover:opacity-10`}
                />
                <div className="relative z-10">
                  <div
                    className={`mb-4 inline-flex rounded-xl bg-gradient-to-br ${section.color} p-4 text-white shadow-lg`}
                  >
                    <Icon size={32} />
                  </div>
                  <h2 className="mb-2 text-2xl font-bold text-slate-800">{section.title}</h2>
                  <p className="text-slate-600">{section.description}</p>
                </div>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};
