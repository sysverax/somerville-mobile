"use client";

import { motion } from "framer-motion";
import { HelpCircle, Smartphone, Tablet, Laptop, Gamepad2, HardDrive, MessageCircle } from "lucide-react";
import Layout from "@/src/components/layout/Layout";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/src/components/ui/accordion";

const FAQPage = () => {
  const faqCategories = [
    {
      icon: Smartphone,
      title: "Smartphone Repair",
      faqs: [
        {
          question: "How long does a typical screen replacement take?",
          answer: "Most smartphone screen replacements are completed within 1-2 hours. For more complex repairs or specific models, it may take up to 24 hours. We'll always provide you with an accurate timeframe when you book your repair."
        },
        {
          question: "Do you use genuine or aftermarket parts for phone repairs?",
          answer: "We offer both options. We use high-quality OEM-grade parts that match original specifications, and for some devices, we can source genuine manufacturer parts. We'll discuss your options and preferences before proceeding with any repair."
        },
        {
          question: "Will I lose my data during a phone repair?",
          answer: "In most cases, your data remains intact during repairs such as screen replacements or battery changes. However, we always recommend backing up your device before any repair as a precaution. If data loss is a possibility, we'll inform you beforehand."
        },
        {
          question: "Can you repair water-damaged phones?",
          answer: "Yes, we offer water damage repair services. Success rates vary depending on the extent of damage and how quickly the device is brought in. We'll perform a thorough diagnostic and provide an honest assessment before any repair work begins."
        },
        {
          question: "What warranty do you offer on phone repairs?",
          answer: "All our phone repairs come with a 90-day warranty covering both parts and workmanship. If you experience any issues related to our repair within this period, we'll fix it at no additional cost."
        }
      ]
    },
    {
      icon: Tablet,
      title: "iPad & Tablet Repair",
      faqs: [
        {
          question: "Can you fix a cracked iPad screen?",
          answer: "Absolutely! We repair cracked screens on all iPad models including iPad Pro, iPad Air, iPad Mini, and standard iPads. Our technicians are experienced with both LCD and digitizer replacements."
        },
        {
          question: "How much does iPad screen repair cost?",
          answer: "iPad repair costs vary by model and the extent of damage. We provide free diagnostics and upfront quotes before any work begins, so you'll know exactly what to expect with no hidden fees."
        },
        {
          question: "Do you repair Samsung and Android tablets?",
          answer: "Yes, we repair a wide range of tablets including Samsung Galaxy Tab series, Google Pixel tablets, and other Android devices. Our technicians are trained across multiple platforms."
        },
        {
          question: "My iPad won't charge. Can this be fixed?",
          answer: "Yes, charging issues are a common repair we handle. This could be a faulty charging port, battery issue, or software problem. We'll diagnose the cause and provide the most cost-effective solution."
        }
      ]
    },
    {
      icon: Laptop,
      title: "Laptop & MacBook Repair",
      faqs: [
        {
          question: "Do you repair MacBooks?",
          answer: "Yes, we service all MacBook models including MacBook Air and MacBook Pro. Our repairs include screen replacements, keyboard repairs, battery replacements, and logic board repairs."
        },
        {
          question: "Can you upgrade my laptop's RAM or storage?",
          answer: "For laptops that support upgrades, we can certainly help. Many modern laptops have soldered components, so we'll assess your device and let you know what upgrade options are available."
        },
        {
          question: "My laptop keyboard has some keys not working. Can you fix it?",
          answer: "Yes, we can repair or replace faulty laptop keyboards. For MacBooks, we're experienced with butterfly and Magic Keyboard mechanisms. We'll provide a quote after assessing the damage."
        },
        {
          question: "How long does a laptop battery replacement take?",
          answer: "Most laptop battery replacements are completed within 1-2 hours if we have the part in stock. Some models may require ordering specific batteries, which typically takes 2-3 business days."
        }
      ]
    },
    {
      icon: Gamepad2,
      title: "Gaming Console Repair",
      faqs: [
        {
          question: "What gaming consoles do you repair?",
          answer: "We repair PlayStation (PS4, PS5), Xbox (One, Series X/S), and Nintendo Switch consoles. Common repairs include disc drive issues, HDMI port repairs, overheating problems, and controller fixes."
        },
        {
          question: "My PS5/Xbox won't read discs. Can this be fixed?",
          answer: "Yes, disc drive issues are a common repair we handle. This could involve cleaning, laser realignment, or drive replacement. We'll diagnose the specific issue and provide options."
        },
        {
          question: "Can you fix Nintendo Switch Joy-Con drift?",
          answer: "Absolutely! Joy-Con drift is one of our most common Nintendo repairs. We can replace the analog stick components to restore smooth, accurate control to your Joy-Cons."
        },
        {
          question: "Do you repair gaming controllers?",
          answer: "Yes, we repair controllers for PlayStation, Xbox, and Nintendo consoles. Common repairs include button replacements, analog stick fixes, trigger repairs, and connectivity issues."
        }
      ]
    },
    {
      icon: HardDrive,
      title: "Data Recovery",
      faqs: [
        {
          question: "Can you recover data from a dead phone?",
          answer: "In many cases, yes. Data recovery success depends on the cause of failure and extent of damage. We use specialized tools and techniques to attempt recovery, and we'll provide an honest assessment of the likelihood of success."
        },
        {
          question: "Is my data kept confidential during recovery?",
          answer: "Absolutely. We take data privacy extremely seriously. All recovered data is handled confidentially, stored securely, and deleted from our systems once returned to you. We never access or share your personal information."
        },
        {
          question: "How much does data recovery cost?",
          answer: "Data recovery costs vary based on the complexity of the case. Simple recoveries may be straightforward, while severe physical damage requires more intensive work. We provide a quote after initial assessment."
        },
        {
          question: "Can you recover data from a water-damaged device?",
          answer: "We can attempt recovery from water-damaged devices, but success rates depend on the extent of corrosion and damage. The sooner you bring in the device, the better the chances of successful recovery."
        }
      ]
    },
    {
      icon: MessageCircle,
      title: "General Questions",
      faqs: [
        {
          question: "Do you offer a postal repair service?",
          answer: "Yes, we accept devices by mail for customers who can't visit our store in person. Simply contact us to arrange shipping, and we'll provide instructions for safely packaging your device."
        },
        {
          question: "What are your business hours?",
          answer: "We're open Monday to Friday 9:00 AM - 5:30 PM and Saturday 9:00 AM - 3:00 PM. We're closed on Sundays and public holidays. You can book appointments online anytime."
        },
        {
          question: "Do I need to make an appointment?",
          answer: "While walk-ins are welcome, we recommend booking an appointment to ensure we can attend to your device promptly. Appointments help us manage our workload and reduce your wait time."
        },
        {
          question: "What payment methods do you accept?",
          answer: "We accept cash, EFTPOS, Visa, Mastercard, and bank transfers. Payment is required upon collection of your repaired device."
        },
        {
          question: "What happens if my device can't be repaired?",
          answer: "If we determine that a repair isn't possible or cost-effective, we'll explain why and discuss alternative options. We only charge a small diagnostic fee if we can't proceed with the repair."
        }
      ]
    }
  ];

  return (
    <Layout>
      {/* Hero Section */}
      <section className="relative py-20 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-background to-background" />
        <div className="container mx-auto px-4 relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="max-w-3xl mx-auto text-center"
          >
            <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto mb-6">
              <HelpCircle className="h-8 w-8 text-primary" />
            </div>
            <h1 className="text-4xl md:text-5xl font-bold mb-6">
              Frequently Asked <span className="text-primary">Questions</span>
            </h1>
            <p className="text-xl text-muted-foreground">
              Find answers to common questions about our repair services, pricing, and policies.
              Can't find what you're looking for? Contact us directly.
            </p>
          </motion.div>
        </div>
      </section>

      {/* FAQ Categories */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto space-y-12">
            {faqCategories.map((category, categoryIndex) => (
              <motion.div
                key={category.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: categoryIndex * 0.1 }}
              >
                <div className="flex items-center gap-4 mb-6">
                  <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
                    <category.icon className="h-6 w-6 text-primary" />
                  </div>
                  <h2 className="text-2xl font-bold">{category.title}</h2>
                </div>
                <div className="bg-card rounded-2xl border border-border/50 overflow-hidden">
                  <Accordion type="single" collapsible className="w-full">
                    {category.faqs.map((faq, faqIndex) => (
                      <AccordionItem key={faqIndex} value={`${category.title}-${faqIndex}`} className="border-border/50">
                        <AccordionTrigger className="px-6 hover:no-underline hover:bg-secondary/50">
                          <span className="text-left font-medium">{faq.question}</span>
                        </AccordionTrigger>
                        <AccordionContent className="px-6 pb-6">
                          <p className="text-muted-foreground leading-relaxed">{faq.answer}</p>
                        </AccordionContent>
                      </AccordionItem>
                    ))}
                  </Accordion>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Contact CTA */}
      <section className="py-20 bg-secondary/20">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="max-w-2xl mx-auto text-center"
          >
            <h2 className="text-3xl font-bold mb-4">Still Have Questions?</h2>
            <p className="text-muted-foreground mb-8">
              Our team is here to help. Get in touch with us and we'll respond as soon as possible.
            </p>
            <div className="flex flex-wrap justify-center gap-4">
              <a
                href="tel:0359776911"
                className="inline-flex items-center gap-2 bg-primary text-primary-foreground px-6 py-3 rounded-full font-medium hover:bg-primary/90 transition-colors"
              >
                Call (03) 5977 6911
              </a>
              <a
                href="/contact"
                className="inline-flex items-center gap-2 border border-border px-6 py-3 rounded-full font-medium hover:bg-secondary transition-colors"
              >
                Send a Message
              </a>
            </div>
          </motion.div>
        </div>
      </section>
    </Layout>
  );
};

export default FAQPage;
