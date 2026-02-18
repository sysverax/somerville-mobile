"use client";

import { motion } from "framer-motion";
import { 
  Wrench, 
  Battery, 
  Smartphone, 
  Shield, 
  Cpu, 
  HardDrive,
  Clock,
  Award,
  CheckCircle
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
  return (
    <div className="space-y-8">
      {/* Section Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        className="text-center"
      >
        <h2 className="text-3xl md:text-4xl font-bold mb-4">Our Services</h2>
        <p className="text-muted-foreground max-w-2xl mx-auto">
          Professional repair and maintenance services for all your devices. 
          Certified technicians, genuine parts, and satisfaction guaranteed.
        </p>
      </motion.div>

      {/* Service Cards Grid */}
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        {services.map((service, index) => (
          <motion.div
            key={service.title}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: index * 0.1 }}
            className="group p-6 rounded-2xl bg-gradient-card shadow-card glass-hover"
          >
            <div className="w-12 h-12 mb-4 rounded-xl bg-primary/10 flex items-center justify-center group-hover:bg-primary/20 transition-colors">
              <service.icon className="h-6 w-6 text-primary" />
            </div>
            <h3 className="text-xl font-bold mb-2">{service.title}</h3>
            <p className="text-muted-foreground text-sm mb-4">{service.description}</p>
            <ul className="space-y-2">
              {service.features.map(feature => (
                <li key={feature} className="flex items-center gap-2 text-sm">
                  <CheckCircle className="h-4 w-4 text-primary" />
                  <span>{feature}</span>
                </li>
              ))}
            </ul>
          </motion.div>
        ))}
      </div>

      {/* Trust Badges */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        className="grid sm:grid-cols-3 gap-4 pt-8"
      >
        {[
          { icon: Clock, title: "Fast Turnaround", subtitle: "Most repairs same day" },
          { icon: Award, title: "Certified Technicians", subtitle: "Factory trained experts" },
          { icon: Shield, title: "Warranty Included", subtitle: "90-day service guarantee" },
        ].map((badge, index) => (
          <div 
            key={badge.title}
            className="flex items-center gap-4 p-4 rounded-xl bg-primary/5 border border-primary/10"
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
