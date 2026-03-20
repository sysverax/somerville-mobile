"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Wrench, 
  Battery, 
  Smartphone, 
  Shield, 
  Cpu, 
  HardDrive,
  Clock,
  Award,
  CheckCircle,
  ChevronLeft,
  ChevronRight
} from "lucide-react";

const services = [
  {
    icon: Wrench,
    title: "Screen Repair",
    description: "Professional LCD and OLED screen replacement for all major brands. Genuine parts with warranty.",
    features: ["Same-day service", "Genuine parts", "90-day warranty"],
  },
  {
    icon: Battery,
    title: "Battery Replacement",
    description: "Restore your device's battery life with high-quality replacement batteries.",
    features: ["Quick turnaround", "Health diagnostics", "Certified batteries"],
  },
  {
    icon: Smartphone,
    title: "Software Repair",
    description: "Fix software issues, remove viruses, and restore your device to optimal performance.",
    features: ["Data backup", "OS updates", "Performance tuning"],
  },
  {
    icon: Cpu,
    title: "Hardware Diagnostics",
    description: "Comprehensive hardware testing to identify and resolve any component issues.",
    features: ["Full inspection", "Detailed report", "Expert analysis"],
  },
  {
    icon: HardDrive,
    title: "Data Recovery",
    description: "Recover lost or deleted data from damaged or corrupted storage devices.",
    features: ["Secure process", "High success rate", "Confidential handling"],
  },
  {
    icon: Shield,
    title: "Extended Warranty",
    description: "Protect your investment with our comprehensive warranty and protection plans.",
    features: ["Accidental damage", "24/7 support", "No hidden fees"],
  },
];

const ServiceInfoCards = () => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isAtStart, setIsAtStart] = useState(true);
  const [isAtEnd, setIsAtEnd] = useState(false);

  useEffect(() => {
    const interval = setInterval(() => {
      const container = document.getElementById('services-scroll-container');
      if (container) {
        if (container.scrollLeft >= container.scrollWidth - container.clientWidth - 10) {
          container.scrollTo({ left: 0, behavior: 'smooth' });
        } else {
          container.scrollBy({ left: container.clientWidth, behavior: 'smooth' });
        }
      }
    }, 4000);
    
    return () => clearInterval(interval);
  }, []);

  const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
    const el = e.currentTarget;
    if (!el) return;
    
    setIsAtStart(el.scrollLeft <= 10);
    setIsAtEnd(Math.ceil(el.scrollLeft) >= el.scrollWidth - el.clientWidth - 10);

    const index = Math.round((el.scrollLeft / (el.scrollWidth - el.clientWidth)) * (services.length - 1));
    setCurrentIndex(Math.min(Math.max(index, 0), services.length - 1) || 0);
  };

  return (
    <div className="space-y-12">
      {/* Section Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        className="text-center"
      >
        <h2 className="text-3xl md:text-4xl font-bold mb-4">Our Services</h2>
        {/* <p className="text-muted-foreground max-w-2xl mx-auto">
          Professional repair and maintenance services for all your devices. 
          Certified technicians, genuine parts, and satisfaction guaranteed.
        </p> */}
      </motion.div>

      {/* MOBILE: Horizontal scroll with arrows */}
      <div className="md:hidden relative max-w-4xl mx-auto">
        <div 
          id="services-scroll-container"
          onScroll={handleScroll}
          className="flex overflow-x-auto gap-0 pb-4 scrollbar-hide scroll-smooth snap-x"
        >
          <style jsx>{`
            .scrollbar-hide::-webkit-scrollbar { display: none; }
            .scrollbar-hide { -ms-overflow-style: none; scrollbar-width: none; }
          `}</style>
          {services.map((service, index) => {
            const Icon = service.icon;
            return (
              <div key={service.title} className="flex-shrink-0 w-full snap-center px-2">
                <div className="group p-8 rounded-2xl bg-gradient-card shadow-card border border-border/50 relative overflow-hidden h-full flex flex-col">
                  {/* Instagram-style Count Badge */}
                  <div className="absolute top-4 right-4 px-2.5 py-1 bg-white/10 backdrop-blur-md rounded-full text-[10px] font-medium text-white z-20 shadow-[0_2px_10px_rgba(0,0,0,0.15)] select-none tracking-wider !text-foreground font-bold">
                    {index + 1} / {services.length}
                  </div>
                  <div className="space-y-6 relative z-10 px-2 flex-1">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center md:group-hover:bg-primary/20 transition-colors shrink-0">
                        <Icon className="h-6 w-6 text-primary" />
                      </div>
                      <h3 className="text-xl font-bold md:group-hover:text-primary transition-colors">
                        {service.title}
                      </h3>
                    </div>
                    <div className="space-y-4">
                      <p className="text-muted-foreground text-sm leading-relaxed">
                        {service.description}
                      </p>
                      <div className="grid grid-cols-1 gap-2">
                        {service.features.map(feature => (
                          <div key={feature} className="flex items-center gap-2 text-sm">
                            <CheckCircle className="h-4 w-4 text-primary" />
                            <span>{feature}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
        
        {!isAtStart && (
          <button
            onClick={() => { const c = document.getElementById('services-scroll-container'); if (c) c.scrollBy({ left: -c.clientWidth, behavior: 'smooth' }); }}
            className="absolute left-2 top-1/2 -translate-y-1/2 w-9 h-9 bg-black/50 backdrop-blur-sm rounded-full flex items-center justify-center text-white hover:bg-black/70 transition-colors z-20 shadow-lg"
            aria-label="Scroll left"
          >
            <ChevronLeft className="h-5 w-5" />
          </button>
        )}
        
        {!isAtEnd && (
          <button
            onClick={() => { const c = document.getElementById('services-scroll-container'); if (c) c.scrollBy({ left: c.clientWidth, behavior: 'smooth' }); }}
            className="absolute right-2 top-1/2 -translate-y-1/2 w-9 h-9 bg-black/50 backdrop-blur-sm rounded-full flex items-center justify-center text-white hover:bg-black/70 transition-colors z-20 shadow-lg"
            aria-label="Scroll right"
          >
            <ChevronRight className="h-5 w-5" />
          </button>
        )}
      </div>

      {/* DESKTOP: Full grid of all services */}
      <div className="hidden md:grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        {services.map((service) => {
          const Icon = service.icon;
          return (
            <div key={service.title} className="group p-8 rounded-2xl bg-gradient-card shadow-card border border-border/50 hover:border-primary/30 transition-colors">
              <div className="space-y-4">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center md:group-hover:bg-primary/20 transition-colors shrink-0">
                    <Icon className="h-6 w-6 text-primary" />
                  </div>
                  <h3 className="text-xl font-bold md:group-hover:text-primary transition-colors">
                    {service.title}
                  </h3>
                </div>
                <p className="text-muted-foreground text-sm leading-relaxed">
                  {service.description}
                </p>
                <div className="space-y-2">
                  {service.features.map(feature => (
                    <div key={feature} className="flex items-center gap-2 text-sm">
                      <CheckCircle className="h-4 w-4 text-primary" />
                      <span>{feature}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Trust Badges */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        className="grid sm:grid-cols-3 gap-4 pt-12 border-t border-border/10"
      >
        {[
          { icon: Clock, title: "Fast Turnaround", subtitle: "Most repairs same day" },
          { icon: Award, title: "Certified Technicians", subtitle: "Factory trained experts" },
          { icon: Shield, title: "Warranty Included", subtitle: "90-day service guarantee" },
        ].map((badge) => (
          <div 
            key={badge.title}
            className="flex items-center gap-4 p-5 rounded-xl bg-primary/5 border border-primary/10 hover:bg-primary/10 transition-colors"
          >
            <div className="p-3 rounded-lg bg-primary/10">
              <badge.icon className="h-6 w-6 text-primary" />
            </div>
            <div>
              <h4 className="font-semibold">{badge.title}</h4>
              <p className="text-sm text-muted-foreground">{badge.subtitle}</p>
            </div>
          </div>
        ))}
      </motion.div>
    </div>
  );
};

export default ServiceInfoCards;
