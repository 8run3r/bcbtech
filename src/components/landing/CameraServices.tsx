import { motion } from "framer-motion";
import { Camera, Shield, Eye, Wifi, MonitorPlay, Settings } from "lucide-react";

const cameraServices = [
  {
    icon: Camera,
    title: "IP & CCTV Kamery",
    desc: "Profesionálna montáž čínskych aj európskych kamerových systémov — Hikvision, Dahua, Uniview.",
  },
  {
    icon: Eye,
    title: "24/7 Dohľad",
    desc: "Vzdialený monitoring, nočné videnie, AI detekcia pohybu a notifikácie v reálnom čase.",
  },
  {
    icon: Shield,
    title: "Zabezpečenie objektov",
    desc: "Kompletný bezpečnostný systém pre firmy, sklady, výrobné haly a rezidenčné objekty.",
  },
  {
    icon: Wifi,
    title: "Sieťová infraštruktúra",
    desc: "PoE switche, NVR rekordéry, káblové trasy a konfigurácia siete pre kamerové systémy.",
  },
  {
    icon: MonitorPlay,
    title: "Vzdialený prístup",
    desc: "Sledujte kamery odkiaľkoľvek — mobilná appka, webový klient, VPN prístup.",
  },
  {
    icon: Settings,
    title: "Servis & Údržba",
    desc: "Pravidelný servis, upgrade firmware, rozširovanie systémov a technická podpora.",
  },
];

const CameraServices = () => {
  return (
    <section className="relative py-32 px-6 overflow-hidden">
      {/* Scan line effect */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <motion.div
          animate={{ y: ["-100%", "200%"] }}
          transition={{ duration: 8, repeat: Infinity, ease: "linear" }}
          className="absolute left-0 right-0 h-px bg-gradient-to-r from-transparent via-primary/30 to-transparent"
        />
      </div>

      <div className="max-w-7xl mx-auto relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mb-16"
        >
          <span className="text-xs uppercase tracking-[0.2em] text-primary mb-4 block font-mono">
            [ SURVEILLANCE ]
          </span>
          <h2 className="text-4xl sm:text-5xl font-bold tracking-tight mb-4">
            Kamerové systémy
          </h2>
          <p className="text-muted-foreground text-lg max-w-xl">
            Profesionálna montáž a konfigurácia bezpečnostných kamerových systémov 
            pre firemné aj súkromné priestory.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {cameraServices.map((s, i) => (
            <motion.div
              key={s.title}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.08 }}
              className="group relative p-8 rounded-lg bg-card/50 border border-border/50 hover:border-primary/40 transition-all duration-500 backdrop-blur-sm overflow-hidden"
            >
              {/* Corner brackets — surveillance style */}
              <div className="absolute top-2 left-2 w-4 h-4 border-t border-l border-primary/30 group-hover:border-primary/60 transition-colors" />
              <div className="absolute top-2 right-2 w-4 h-4 border-t border-r border-primary/30 group-hover:border-primary/60 transition-colors" />
              <div className="absolute bottom-2 left-2 w-4 h-4 border-b border-l border-primary/30 group-hover:border-primary/60 transition-colors" />
              <div className="absolute bottom-2 right-2 w-4 h-4 border-b border-r border-primary/30 group-hover:border-primary/60 transition-colors" />

              <s.icon className="text-primary mb-5" size={28} strokeWidth={1.5} />
              <h3 className="text-lg font-semibold mb-3">{s.title}</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">{s.desc}</p>
              
              {/* Recording indicator */}
              <div className="absolute top-4 right-6 flex items-center gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity">
              <span className="w-1.5 h-1.5 rounded-full bg-destructive animate-pulse" />
                <span className="text-[10px] text-destructive font-mono uppercase">REC</span>
              </div>
            </motion.div>
          ))}
        </div>

        {/* CTA */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.5 }}
          className="mt-16 text-center"
        >
          <a
            href="/kontakt"
            className="inline-flex items-center gap-3 bg-foreground text-background px-10 py-4 rounded-full font-medium text-sm uppercase tracking-wider hover:bg-primary hover:text-primary-foreground transition-all duration-500"
          >
            <Camera size={18} />
            Nezáväzná konzultácia
          </a>
        </motion.div>
      </div>
    </section>
  );
};

export default CameraServices;
