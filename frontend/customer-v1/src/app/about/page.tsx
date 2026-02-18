"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { 
  Wrench, 
  Smartphone, 
  Monitor, 
  Gamepad2, 
  Watch, 
  Headphones, 
  Shield, 
  Clock, 
  Users,
  Award,
  CheckCircle,
  Heart,
  Target,
  Eye,
  Phone,
  Mail,
  MapPin,
  Star
} from "lucide-react";
import { Button } from "@/src/components/ui/button";
import Layout from "@/src/components/layout/Layout";

const AboutPage = () => {
  const whyChooseUs = [
    {
      icon: Users,
      title: "Skilled Technicians",
      description: "Our certified repair specialists have years of hands-on experience with all major device brands and models."
    },
    {
      icon: Shield,
      title: "Quality Parts",
      description: "We use only OEM and high-grade aftermarket parts to ensure your device performs like new."
    },
    {
      icon: Award,
      title: "Fair Pricing",
      description: "Transparent, upfront pricing with no hidden fees. We quote before we repair, always."
    },
    {
      icon: Clock,
      title: "Fast Turnaround",
      description: "Most repairs completed same-day or within 24 hours. We value your time as much as you do."
    },
    {
      icon: CheckCircle,
      title: "Warranty-Backed",
      description: "All repairs come with our satisfaction guarantee and warranty coverage for peace of mind."
    },
    {
      icon: Heart,
      title: "Customer First",
      description: "We treat every device as if it were our own, with care, attention, and respect."
    }
  ];

  const devices = [
    { icon: Smartphone, name: "Smartphones", brands: "iPhone, Samsung Galaxy, Google Pixel, OnePlus, Xiaomi" },
    { icon: Monitor, name: "Tablets & iPads", brands: "iPad Pro, iPad Air, Galaxy Tab, Surface Pro" },
    { icon: Watch, name: "Smartwatches", brands: "Apple Watch, Galaxy Watch, Pixel Watch" },
    { icon: Gamepad2, name: "Gaming Consoles", brands: "PlayStation, Xbox, Nintendo Switch" },
    { icon: Headphones, name: "Accessories", brands: "AirPods, Galaxy Buds, Controllers, Chargers" }
  ];

  const team = [
    {
      name: "Michael Chen",
      role: "Lead Technician",
      image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&h=200&fit=crop&crop=face",
      specialty: "Apple Device Specialist"
    },
    {
      name: "Sarah Williams",
      role: "Store Manager",
      image: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=200&h=200&fit=crop&crop=face",
      specialty: "Customer Experience"
    },
    {
      name: "James Park",
      role: "Senior Technician",
      image: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=200&h=200&fit=crop&crop=face",
      specialty: "Android & Gaming"
    },
    {
      name: "Emily Davis",
      role: "Repair Specialist",
      image: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=200&h=200&fit=crop&crop=face",
      specialty: "Data Recovery Expert"
    }
  ];

  const trustStats = [
    { number: "8+", label: "Years Experience" },
    { number: "15,000+", label: "Devices Repaired" },
    { number: "4.9★", label: "Customer Rating" },
    { number: "98%", label: "Satisfaction Rate" }
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
              Your Trusted Local
              <span className="block text-primary mt-2">Device Repair Experts</span>
            </h1>
            <p className="text-xl text-muted-foreground leading-relaxed mb-8 max-w-2xl mx-auto">
              Somerville Mobile has been serving the local community with professional device repairs, 
              quality products, and exceptional customer service since 2016.
            </p>
            <div className="flex flex-wrap justify-center gap-4">
              <Button size="lg" className="bg-gradient-primary hover:opacity-90 text-primary-foreground" asChild>
                <Link href="/booking">Book a Repair</Link>
              </Button>
              <Button size="lg" variant="outline" asChild>
                <Link href="/#services">View Services</Link>
              </Button>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Trust Stats */}
      <section className="py-12 bg-primary/5 border-y border-border/50">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {trustStats.map((stat, index) => (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                className="text-center"
              >
                <div className="text-3xl md:text-4xl font-bold text-primary mb-2">{stat.number}</div>
                <div className="text-muted-foreground">{stat.label}</div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Company Story */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="grid lg:grid-cols-2 gap-12 items-center max-w-6xl mx-auto">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
            >
              <div className="flex items-center gap-3 mb-6">
                <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
                  <Heart className="h-6 w-6 text-primary" />
                </div>
                <h2 className="text-3xl md:text-4xl font-bold">Our Story</h2>
              </div>
              <div className="space-y-4 text-muted-foreground leading-relaxed">
                <p>
                  Somerville Mobile began in 2016 with a simple mission: to provide honest, reliable device repairs 
                  at fair prices. What started as a small repair counter has grown into a trusted local destination 
                  for all things mobile technology.
                </p>
                <p>
                  Over the years, we've expanded our services and expertise, but our core values remain unchanged. 
                  We believe in transparent communication, quality workmanship, and treating every customer like family. 
                  When you walk through our doors, you're not just a ticket number—you're a neighbour.
                </p>
                <p>
                  Today, we're proud to be one of the most trusted device repair centres in the Mornington Peninsula, 
                  serving thousands of satisfied customers across Somerville, Tyabb, Hastings, and beyond.
                </p>
              </div>
            </motion.div>
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="relative"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-primary/20 to-primary/5 rounded-3xl blur-3xl" />
              <img
                src="https://images.unsplash.com/photo-1581092921461-eab62e97a780?w=600&h=500&fit=crop"
                alt="Our repair workshop"
                className="relative rounded-3xl shadow-2xl shadow-primary/10 w-full object-cover"
              />
            </motion.div>
          </div>
        </div>
      </section>

      {/* Why Choose Us */}
      <section className="py-20 bg-secondary/20">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Why Choose Us</h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              We're committed to delivering the best repair experience possible
            </p>
          </motion.div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto">
            {whyChooseUs.map((item, index) => (
              <motion.div
                key={item.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                className="bg-card rounded-2xl p-6 border border-border/50 hover:border-primary/30 transition-colors"
              >
                <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center mb-4">
                  <item.icon className="h-6 w-6 text-primary" />
                </div>
                <h3 className="text-xl font-bold mb-2">{item.title}</h3>
                <p className="text-muted-foreground">{item.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Mission & Vision */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-2 gap-8 max-w-5xl mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="bg-gradient-to-br from-primary/10 to-transparent rounded-3xl p-8 border border-primary/20"
            >
              <div className="w-14 h-14 rounded-2xl bg-primary/20 flex items-center justify-center mb-6">
                <Target className="h-7 w-7 text-primary" />
              </div>
              <h3 className="text-2xl font-bold mb-4">Our Mission</h3>
              <p className="text-muted-foreground leading-relaxed">
                To provide reliable, transparent, and customer-focused device repair services that exceed expectations. 
                We aim to extend the life of your devices through quality repairs, honest advice, and genuine care 
                for every customer who walks through our doors.
              </p>
            </motion.div>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.1 }}
              className="bg-gradient-to-br from-primary/10 to-transparent rounded-3xl p-8 border border-primary/20"
            >
              <div className="w-14 h-14 rounded-2xl bg-primary/20 flex items-center justify-center mb-6">
                <Eye className="h-7 w-7 text-primary" />
              </div>
              <h3 className="text-2xl font-bold mb-4">Our Vision</h3>
              <p className="text-muted-foreground leading-relaxed">
                To become the most trusted local device repair provider in Victoria—known for our expertise, 
                integrity, and unwavering commitment to customer satisfaction. We envision a future where 
                device repairs are accessible, affordable, and worry-free for everyone.
              </p>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Devices We Handle */}
      <section className="py-20 bg-secondary/20">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Devices We Repair</h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              From smartphones to gaming consoles, our technicians are trained to handle it all
            </p>
          </motion.div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 max-w-5xl mx-auto">
            {devices.map((device, index) => (
              <motion.div
                key={device.name}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                className="flex items-start gap-4 p-6 rounded-xl bg-card border border-border/50"
              >
                <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                  <device.icon className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <h3 className="font-bold mb-1">{device.name}</h3>
                  <p className="text-sm text-muted-foreground">{device.brands}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Team Section */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Meet Our Team</h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Friendly faces and expert hands ready to help with your device needs
            </p>
          </motion.div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6 max-w-5xl mx-auto">
            {team.map((member, index) => (
              <motion.div
                key={member.name}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                className="text-center p-6 rounded-2xl bg-card border border-border/50 hover:border-primary/30 transition-colors group"
              >
                <div className="relative w-24 h-24 mx-auto mb-4">
                  <img
                    src={member.image}
                    alt={member.name}
                    className="w-full h-full rounded-full object-cover border-2 border-primary/20 group-hover:border-primary/50 transition-colors"
                  />
                </div>
                <h3 className="font-bold text-lg">{member.name}</h3>
                <p className="text-primary text-sm mb-1">{member.role}</p>
                <p className="text-muted-foreground text-xs">{member.specialty}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Contact Info */}
      <section className="py-20 bg-secondary/20">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="max-w-4xl mx-auto"
          >
            <div className="text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-bold mb-4">Visit Us Today</h2>
              <p className="text-muted-foreground">
                Drop by our store or give us a call—we're always happy to help
              </p>
            </div>
            <div className="grid md:grid-cols-3 gap-6">
              <div className="flex items-center gap-4 p-6 rounded-xl bg-card border border-border/50">
                <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center">
                  <MapPin className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <h4 className="font-semibold">Location</h4>
                  <p className="text-sm text-muted-foreground">Shop 14, 49 Eramosa Road West<br />Somerville, VIC 3912</p>
                </div>
              </div>
              <div className="flex items-center gap-4 p-6 rounded-xl bg-card border border-border/50">
                <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center">
                  <Phone className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <h4 className="font-semibold">Phone</h4>
                  <p className="text-sm text-muted-foreground">(03) 5977 6911</p>
                </div>
              </div>
              <div className="flex items-center gap-4 p-6 rounded-xl bg-card border border-border/50">
                <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center">
                  <Mail className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <h4 className="font-semibold">Email</h4>
                  <p className="text-sm text-muted-foreground">info@somervillemobile.com.au</p>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="max-w-3xl mx-auto text-center bg-gradient-to-br from-primary/20 via-primary/10 to-transparent rounded-3xl p-12 border border-primary/20"
          >
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Ready to Get Started?</h2>
            <p className="text-muted-foreground mb-8">
              Book a repair appointment, explore our services, or visit us in-store today.
            </p>
            <div className="flex flex-wrap justify-center gap-4">
              <Button size="lg" className="bg-gradient-primary hover:opacity-90 text-primary-foreground" asChild>
                <Link href="/booking">Book a Repair</Link>
              </Button>
              <Button size="lg" variant="outline" asChild>
                <Link href="/contact">Contact Us</Link>
              </Button>
            </div>
          </motion.div>
        </div>
      </section>
    </Layout>
  );
};

export default AboutPage;
