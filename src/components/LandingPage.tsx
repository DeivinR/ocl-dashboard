import { Briefcase, LogOut, ChevronRight } from 'lucide-react';

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
    description: 'Gestão de recuperação, renegociação e entrega amigável',
    icon: Briefcase,
    color: 'from-ocl-primary to-ocl-secondary',
  },
];

interface LandingPageProps {
  onSectionSelect: (sectionId: string) => void;
  onLogout: () => void;
}

export const LandingPage = ({ onSectionSelect, onLogout }: Readonly<LandingPageProps>) => {
  return (
    <div className="flex min-h-screen flex-col bg-slate-50">
      <header className="flex items-center justify-between border-b border-slate-200 bg-white px-8 py-4 shadow-sm">
        <img src="/logo.png" alt="OCL" className="h-10 object-contain" />
        <button
          onClick={onLogout}
          className="flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium text-slate-600 transition-colors hover:bg-slate-100 hover:text-red-600"
        >
          <LogOut size={18} />
          <span>Sair</span>
        </button>
      </header>

      <main className="flex flex-1 flex-col items-center justify-center p-6">
        <div className="w-full max-w-5xl">
          <div className="mb-16 text-center">
            <h1 className="mb-4 text-4xl font-bold text-slate-900 md:text-5xl">Bem-vindo ao Dashboard</h1>
            <p className="mx-auto max-w-2xl text-lg text-slate-600">
              Selecione um módulo abaixo para acessar suas ferramentas de gestão e relatórios.
            </p>
          </div>

          <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3">
            {SECTIONS.map((section) => {
              const Icon = section.icon;
              return (
                <button
                  key={section.id}
                  onClick={() => onSectionSelect(section.id)}
                  className="group relative flex flex-col overflow-hidden rounded-2xl bg-white p-8 text-left shadow-lg ring-1 ring-slate-900/5 transition-all duration-300 hover:-translate-y-1 hover:shadow-2xl hover:ring-ocl-primary/20"
                >
                  <div
                    className={`mb-6 inline-flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br ${section.color} text-white shadow-lg transition-transform duration-300 group-hover:scale-110`}
                  >
                    <Icon size={32} />
                  </div>
                  <h2 className="mb-3 text-2xl font-bold text-slate-900 group-hover:text-ocl-primary">
                    {section.title}
                  </h2>
                  <p className="mb-8 text-slate-600">{section.description}</p>

                  <div className="mt-auto flex items-center text-sm font-bold text-ocl-primary opacity-0 transition-all duration-300 group-hover:translate-x-2 group-hover:opacity-100">
                    Acessar Módulo <ChevronRight size={16} className="ml-1" />
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      </main>

      <footer className="border-t border-slate-200 bg-white py-6 text-center text-sm text-slate-500">
        &copy; {new Date().getFullYear()} OCL. Todos os direitos reservados.
      </footer>
    </div>
  );
};
