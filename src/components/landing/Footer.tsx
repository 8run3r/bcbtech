const Footer = () => {
  return (
    <footer className="border-t border-border/50 py-12 px-6">
      <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="text-lg font-bold tracking-tight">
          <span className="text-primary">nex</span>
          <span className="text-foreground">sol</span>
        </div>
        <p className="text-xs text-muted-foreground font-mono">
          © 2026 nexsol. Všetky práva vyhradené.
        </p>
        <div className="flex gap-6">
          <a href="#" className="text-xs text-muted-foreground hover:text-primary transition-colors font-mono">
            GitHub
          </a>
          <a href="#" className="text-xs text-muted-foreground hover:text-primary transition-colors font-mono">
            LinkedIn
          </a>
          <a href="#" className="text-xs text-muted-foreground hover:text-primary transition-colors font-mono">
            Twitter
          </a>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
