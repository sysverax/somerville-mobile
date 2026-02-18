"use client";
import { motion } from "framer-motion";
import Link from "next/link";
import { 
  Wrench, 
  Battery, 
  Smartphone, 
  Shield, 
  Cpu, 
  HardDrive,
  Monitor,
  Gamepad2,
  Droplets,
  Wifi,
  Camera,
  Mic,
  CheckCircle,
  ArrowRight
} from "lucide-react";
import { Button } from "@/src/components/ui/button";
import Layout from "@/src/components/layout/Layout";

const ServicesPage = () => {
  const mainServices = [
    {
      icon: Wrench,
      title: "Screen Repair",
      description: "Professional LCD and OLED screen replacement for smartphones, tablets, and laptops. We use high-quality parts that match original specifications.",
      features: ["Same-day service available", "OEM-grade quality parts", "90-day warranty", "All major brands supported"],
      devices: ["iPhone", "Samsung Galaxy", "iPad", "MacBook", "Android phones"]
    },
    {
      icon: Battery,
      title: "Battery Replacement",
      description: "Restore your device's battery life with our quality replacement service. Don't let poor battery health slow you down.",
      features: ["Quick 30-60 minute service", "Genuine capacity batteries", "Battery health diagnostics", "Proper disposal of old batteries"],
      devices: ["All smartphones", "Tablets", "Laptops", "Smartwatches"]
    },
    {
      icon: Droplets,
      title: "Water Damage Repair",
      description: "Accidents happen. Our technicians use specialized techniques to clean, dry, and restore water-damaged devices.",
      features: ["Emergency service available", "Ultrasonic cleaning", "Component-level repair", "Data recovery attempts"],
      devices: ["Phones", "Tablets", "Laptops", "Gaming consoles"]
    },
    {
      icon: Cpu,
      title: "Hardware Diagnostics",
      description: "Comprehensive testing to identify hardware issues, component failures, and performance problems.",
      features: ["Full diagnostic report", "Honest repair recommendations", "Free quotes", "No-fix no-fee policy"],
      devices: ["All electronic devices"]
    },
    {
      icon: HardDrive,
      title: "Data Recovery",
      description: "Lost precious photos, documents, or memories? We offer professional data recovery from damaged or corrupted devices.",
      features: ["Secure, confidential handling", "High success rates", "Multiple recovery methods", "External drive transfers"],
      devices: ["Phones", "Tablets", "Hard drives", "USB drives"]
    },
    {
      icon: Smartphone,
      title: "Software Repair",
      description: "Fix software issues, remove viruses, update operating systems, and restore your device to optimal performance.",
      features: ["OS updates & reinstalls", "Virus & malware removal", "Data backup included", "Performance optimization"],
      devices: ["All smartphones", "Tablets", "Computers"]
    }
  ];

  const additionalServices = [
    { icon: Camera, name: "Camera Repair", description: "Front and rear camera replacements" },
    { icon: Mic, name: "Microphone & Speaker", description: "Audio component repairs" },
    { icon: Wifi, name: "Connectivity Issues", description: "WiFi, Bluetooth, antenna repairs" },
    { icon: Monitor, name: "Charging Port Repair", description: "Lightning, USB-C, micro-USB ports" },
    { icon: Gamepad2, name: "Gaming Console Repair", description: "PS, Xbox, Nintendo repairs" },
    { icon: Shield, name: "Extended Warranty", description: "Protection plans available" }
  ];

  const repairProcess = [
    {
      step: "1",
      title: "Book or Drop In",
      description: "Schedule an appointment online or visit our store directly. Walk-ins welcome."
    },
    {
      step: "2",
      title: "Free Diagnostic",
      description: "Our technicians will assess your device and provide a detailed quote—no obligation."
    },
    {
      step: "3",
      title: "Expert Repair",
      description: "Once approved, we'll repair your device using quality parts and proven techniques."
    },
    {
      step: "4",
      title: "Quality Check & Collect",
      description: "We test everything thoroughly before you collect. Pay only when you're satisfied."
    }
  ];

  return (
    <Layout>
      {/* Hero Section */}
      <section className="relative py-24 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-background to-background" />
        <div className="absolute top-1/4 right-0 w-96 h-96 bg-primary/10 rounded-full blur-3xl" />
        <div className="container mx-auto px-4 relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="max-w-4xl mx-auto text-center"
          >
            <h1 className="text-4xl md:text-6xl font-bold mb-6">
              Professional <span className="text-primary">Repair Services</span>
            </h1>
            <p className="text-xl text-muted-foreground leading-relaxed mb-8 max-w-2xl mx-auto">
              Expert repairs for smartphones, tablets, laptops, and gaming consoles. 
              Quality parts, skilled technicians, and warranties you can trust.
            </p>
            <div className="flex flex-wrap justify-center gap-4">
              <Button size="lg" className="bg-gradient-primary hover:opacity-90 text-primary-foreground" asChild>
                <Link href="/booking">Book a Repair</Link>
              </Button>
              <Button size="lg" variant="outline" asChild>
                <a href="tel:0359776911">Call for Quote</a>
              </Button>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Main Services */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Our Repair Services</h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Comprehensive repair solutions for all your devices, backed by our quality guarantee
            </p>
          </motion.div>

          <div className="grid lg:grid-cols-2 gap-8 max-w-6xl mx-auto">
            {mainServices.map((service, index) => (
              <motion.div
                key={service.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                className="bg-card rounded-2xl border border-border/50 p-8 hover:border-primary/30 transition-colors"
              >
                <div className="flex items-start gap-4">
                  <div className="w-14 h-14 rounded-xl bg-primary/10 flex items-center justify-center flex-shrink-0">
                    <service.icon className="h-7 w-7 text-primary" />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-xl font-bold mb-2">{service.title}</h3>
                    <p className="text-muted-foreground mb-4">{service.description}</p>
                    <ul className="space-y-2 mb-4">
                      {service.features.map(feature => (
                        <li key={feature} className="flex items-center gap-2 text-sm">
                          <CheckCircle className="h-4 w-4 text-primary flex-shrink-0" />
                          <span>{feature}</span>
                        </li>
                      ))}
                    </ul>
                    <p className="text-xs text-muted-foreground">
                      <strong>Supported:</strong> {service.devices.join(", ")}
                    </p>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Additional Services */}
      <section className="py-20 bg-secondary/20">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Additional Services</h2>
            <p className="text-muted-foreground">More ways we can help keep your devices running</p>
          </motion.div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 max-w-5xl mx-auto">
            {additionalServices.map((service, index) => (
              <motion.div
                key={service.name}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.05 }}
                className="flex items-center gap-4 p-5 rounded-xl bg-card border border-border/50"
              >
                <div className="w-11 h-11 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                  <service.icon className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <h3 className="font-semibold">{service.name}</h3>
                  <p className="text-sm text-muted-foreground">{service.description}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <h2 className="text-3xl md:text-4xl font-bold mb-4">How It Works</h2>
            <p className="text-muted-foreground">Simple, transparent repair process from start to finish</p>
          </motion.div>

          <div className="grid md:grid-cols-4 gap-8 max-w-5xl mx-auto">
            {repairProcess.map((step, index) => (
              <motion.div
                key={step.step}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                className="text-center"
              >
                <div className="w-14 h-14 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-xl font-bold mx-auto mb-4">
                  {step.step}
                </div>
                <h3 className="font-bold mb-2">{step.title}</h3>
                <p className="text-sm text-muted-foreground">{step.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 bg-secondary/20">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="max-w-3xl mx-auto text-center bg-gradient-to-br from-primary/20 via-primary/10 to-transparent rounded-3xl p-12 border border-primary/20"
          >
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Ready to Get Your Device Fixed?</h2>
            <p className="text-muted-foreground mb-8">
              Book an appointment today or drop by our store. Most repairs completed same-day.
            </p>
            <div className="flex flex-wrap justify-center gap-4">
              <Button size="lg" className="bg-gradient-primary hover:opacity-90 text-primary-foreground gap-2" asChild>
                <Link href="/booking">
                  Book Now
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </Button>
              <Button size="lg" variant="outline" asChild>
                <Link href="/faq">View FAQ</Link>
              </Button>
            </div>
          </motion.div>
        </div>
      </section>
    </Layout>
  );
};

export default ServicesPage;
