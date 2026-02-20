"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { 
  Wrench, 
  Battery, 
  Droplets, 
  Cpu, 
  HardDrive,
  Monitor,
  Camera,
  Mic,
  Wifi,
  Plug,
  Gamepad2,
  Shield,
  CheckCircle,
  Calendar
} from "lucide-react";
import { Button } from "@/src/components/ui/button";

const mainServices = [
  {
    icon: Monitor,
    title: "Screen Repair",
    description: "Professional LCD and OLED screen replacement for all major brands.",
    highlights: ["Same-day service", "Genuine parts", "90-day warranty"],
  },
  {
    icon: Battery,
    title: "Battery Replacement",
    description: "Restore your device's battery life with high-quality replacement batteries.",
    highlights: ["Quick turnaround", "Health diagnostics", "Certified batteries"],
  },
  {
    icon: Droplets,
    title: "Water Damage Repair",
    description: "Expert water damage recovery to save your device.",
    highlights: ["Emergency service", "Component cleaning", "Data recovery"],
  },
  {
    icon: Cpu,
    title: "Hardware Diagnostics",
    description: "Comprehensive hardware testing to identify and resolve issues.",
    highlights: ["Full inspection", "Detailed report", "Expert analysis"],
  },
  {
    icon: HardDrive,
    title: "Data Recovery",
    description: "Recover lost or deleted data from damaged storage devices.",
    highlights: ["Secure process", "High success rate", "Confidential"],
  },
  {
    icon: Wrench,
    title: "Software Repair",
    description: "Fix software issues, remove viruses, optimize performance.",
    highlights: ["Data backup", "OS updates", "Performance tuning"],
  },
];

const additionalServices = [
  { icon: Camera, title: "Camera Repair", description: "Front and rear camera fixes" },
  { icon: Mic, title: "Microphone & Speaker", description: "Audio component repair" },
  { icon: Wifi, title: "Connectivity Issues", description: "Wi-Fi, Bluetooth, cellular fixes" },
  { icon: Plug, title: "Charging Port Repair", description: "Port cleaning and replacement" },
  { icon: Gamepad2, title: "Gaming Console Repair", description: "PS5, Xbox, Nintendo repairs" },
  { icon: Shield, title: "Extended Warranty", description: "Protection plans available" },
];

const howItWorks = [
  { step: 1, title: "Book or Drop In", description: "Schedule online or visit our store" },
  { step: 2, title: "Free Diagnostic", description: "We assess your device at no charge" },
  { step: 3, title: "Expert Repair", description: "Certified technicians fix your device" },
  { step: 4, title: "Quality Check & Collect", description: "Thorough testing before handover" },
];

const ServiceContent = ({ brandId }: { brandId?: string }) => {
  return (
    <section className="py-16 bg-gradient-dark">
      <div className="container mx-auto px-4 space-y-16">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center"
        >
          <h2 className="text-3xl md:text-4xl font-bold mb-4">Our Repair Services</h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Comprehensive repair solutions for all your devices, backed by our quality guarantee
          </p>
        </motion.div>

        {/* Main Service Cards */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {mainServices.map((service, index) => (
            <motion.div
              key={service.title}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="group p-6 rounded-2xl bg-gradient-card shadow-card glass-hover"
            >
              <div className="w-12 h-12 mb-4 rounded-xl bg-primary/10 flex items-center justify-center group-hover:bg-primary/20 transition-colors">
                <service.icon className="h-6 w-6 text-primary" />
              </div>
              <h3 className="text-xl font-bold mb-2">{service.title}</h3>
              <p className="text-muted-foreground text-sm mb-4">{service.description}</p>
              <ul className="space-y-2">
                {service.highlights.map(highlight => (
                  <li key={highlight} className="flex items-center gap-2 text-sm">
                    <CheckCircle className="h-4 w-4 text-primary" />
                    <span>{highlight}</span>
                  </li>
                ))}
              </ul>
            </motion.div>
          ))}
        </div>

        {/* Additional Services */}
        <div>
          <motion.h3
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-2xl font-bold mb-6 text-center"
          >
            Additional Services
          </motion.h3>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {additionalServices.map((service, index) => (
              <motion.div
                key={service.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.05 }}
                className="flex items-center gap-4 p-4 rounded-xl bg-card/50 border border-border/50 hover:border-primary/30 transition-colors"
              >
                <div className="p-3 rounded-lg bg-primary/10">
                  <service.icon className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <h4 className="font-semibold text-sm">{service.title}</h4>
                  <p className="text-xs text-muted-foreground">{service.description}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>

        {/* How It Works */}
        <div>
          <motion.h3
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-2xl font-bold mb-8 text-center"
          >
            How It Works
          </motion.h3>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {howItWorks.map((item, index) => (
              <motion.div
                key={item.step}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                className="text-center"
              >
                <div className="w-12 h-12 mx-auto mb-4 rounded-full bg-primary/20 flex items-center justify-center text-primary font-bold text-lg">
                  {item.step}
                </div>
                <h4 className="font-semibold mb-2">{item.title}</h4>
                <p className="text-sm text-muted-foreground">{item.description}</p>
              </motion.div>
            ))}
          </div>
        </div>

        {/* CTA */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center"
        >
           <Link href={brandId ? `/booking?brandId=${brandId}` : "/booking"}>
            <Button size="lg" className="bg-gradient-primary hover:opacity-90 text-primary-foreground gap-2">
              <Calendar className="h-5 w-5" />
              Book Time Slot
            </Button>
          </Link>
        </motion.div>
      </div>
    </section>
  );
};

export default ServiceContent;
