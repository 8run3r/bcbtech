import { Github, Linkedin } from "lucide-react";

const RebrandFooter = () => {
  const scrollTo = (id: string) => {
    document.getElementById(id)?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <footer className="border-t border-white/5 py-6 px-4">
      <div className="max-w-5xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4 text-white/30 text-xs">
        <div className="flex items-center gap-2">
          <span className="font-sans font-bold text-white/60 text-sm">CokTech</span>
          <span>&copy; 2026</span>
        </div>

        <nav className="flex items-center gap-4">
          <button onClick={() => scrollTo("services")} className="hover:text-white/60 transition-colors">
            Sluzby
          </button>
          <button onClick={() => scrollTo("pricing")} className="hover:text-white/60 transition-colors">
            Cennik
          </button>
          <button onClick={() => scrollTo("contact")} className="hover:text-white/60 transition-colors">
            Kontakt
          </button>
        </nav>

        <div className="flex items-center gap-3">
          <a href="https://linkedin.com" target="_blank" rel="noopener noreferrer" className="hover:text-white/60 transition-colors">
            <Linkedin size={14} />
          </a>
          <a href="https://github.com" target="_blank" rel="noopener noreferrer" className="hover:text-white/60 transition-colors">
            <Github size={14} />
          </a>
        </div>
      </div>
    </footer>
  );
};

export default RebrandFooter;
