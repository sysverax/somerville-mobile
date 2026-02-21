"use client";

import { motion } from "framer-motion";
import { FileText, Mail, Phone, MapPin } from "lucide-react";
import Layout from "@/src/components/layout/Layout";

const TermsPage = () => {
  return (
    <Layout>
      {/* Hero Section */}
      <section className="relative pb-2 pt-16 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-background to-background" />
        <div className="container mx-auto px-4 relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="max-w-3xl mx-auto text-center"
          >
            <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto mb-6">
              <FileText className="h-8 w-8 text-primary" />
            </div>
            <h1 className="text-4xl md:text-5xl font-bold mb-4">Terms & Conditions</h1>
            <p className="text-muted-foreground">
              Last updated: February 2026
            </p>
          </motion.div>
        </div>
      </section>

      {/* Content */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="max-w-4xl mx-auto prose prose-invert prose-lg"
          >
            <div className="bg-card rounded-2xl border border-border/50 p-8 md:p-12 space-y-8">
              
              <section>
                <h2 className="text-2xl font-bold mb-4 text-foreground">1. Acceptance of Terms</h2>
                <p className="text-muted-foreground leading-relaxed">
                  By submitting a device for repair or service at Somerville Mobile, you agree to be bound by these 
                  Terms and Conditions. Please read them carefully before proceeding with any repair service. If you 
                  do not agree with any part of these terms, please do not use our services.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-bold mb-4 text-foreground">2. Repair Services</h2>
                <p className="text-muted-foreground leading-relaxed mb-4">
                  2.1 All repairs are subject to assessment and final quotation. The quoted price may change if 
                  additional faults are discovered during the repair process.
                </p>
                <p className="text-muted-foreground leading-relaxed mb-4">
                  2.2 We reserve the right to refuse any repair that we deem unfeasible, uneconomical, or beyond 
                  our capabilities.
                </p>
                <p className="text-muted-foreground leading-relaxed">
                  2.3 Repair timeframes are estimates only and may vary based on parts availability, complexity of 
                  the repair, and workshop workload.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-bold mb-4 text-foreground">3. Warranty on Repairs</h2>
                <p className="text-muted-foreground leading-relaxed mb-4">
                  3.1 All repairs performed by Somerville Mobile carry a 90-day warranty on parts and workmanship, 
                  unless otherwise specified at the time of service.
                </p>
                <p className="text-muted-foreground leading-relaxed mb-4">
                  3.2 The warranty does not cover:
                </p>
                <ul className="list-disc list-inside space-y-2 text-muted-foreground mb-4">
                  <li>Physical damage occurring after the repair (drops, water damage, impact)</li>
                  <li>Damage caused by third-party repairs or modifications</li>
                  <li>Software issues unrelated to the original repair</li>
                  <li>Normal wear and tear</li>
                  <li>Damage caused by misuse or negligence</li>
                </ul>
                <p className="text-muted-foreground leading-relaxed">
                  3.3 Warranty claims must be made in person at our store with the original repair receipt.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-bold mb-4 text-foreground">4. Data and Privacy</h2>
                <p className="text-muted-foreground leading-relaxed mb-4">
                  4.1 Customers are strongly advised to back up all data before submitting devices for repair. 
                  Somerville Mobile is not responsible for data loss during the repair process.
                </p>
                <p className="text-muted-foreground leading-relaxed mb-4">
                  4.2 We treat all customer data with strict confidentiality. Our technicians will not access 
                  personal files unless specifically required for the repair.
                </p>
                <p className="text-muted-foreground leading-relaxed">
                  4.3 Please disable passwords and locks where possible to allow technicians to test device 
                  functionality. We accept no responsibility for inability to complete testing due to locked devices.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-bold mb-4 text-foreground">5. Liability Limitations</h2>
                <p className="text-muted-foreground leading-relaxed mb-4">
                  5.1 While we take every precaution, some repairs carry inherent risks. By authorising a repair, 
                  you accept that additional damage may occur during the repair process, particularly with:
                </p>
                <ul className="list-disc list-inside space-y-2 text-muted-foreground mb-4">
                  <li>Water-damaged devices</li>
                  <li>Devices with existing physical damage</li>
                  <li>Older devices with brittle or degraded components</li>
                  <li>Devices with non-original parts from previous repairs</li>
                </ul>
                <p className="text-muted-foreground leading-relaxed">
                  5.2 Our total liability for any claim shall not exceed the value of the repair service provided.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-bold mb-4 text-foreground">6. Parts and Materials</h2>
                <p className="text-muted-foreground leading-relaxed mb-4">
                  6.1 We use high-quality OEM-grade and aftermarket parts. Genuine manufacturer parts may be 
                  available upon request and may incur additional costs.
                </p>
                <p className="text-muted-foreground leading-relaxed mb-4">
                  6.2 Replaced parts become the property of Somerville Mobile unless otherwise agreed.
                </p>
                <p className="text-muted-foreground leading-relaxed">
                  6.3 The use of aftermarket parts may affect manufacturer warranties on the device.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-bold mb-4 text-foreground">7. Refurbished and Second-Hand Devices</h2>
                <p className="text-muted-foreground leading-relaxed mb-4">
                  7.1 Refurbished and second-hand devices sold by Somerville Mobile come with a 30-day warranty 
                  covering hardware defects present at the time of sale.
                </p>
                <p className="text-muted-foreground leading-relaxed">
                  7.2 This warranty does not cover damage occurring after purchase, software issues, or cosmetic 
                  imperfections disclosed at the time of sale.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-bold mb-4 text-foreground">8. Payment and Collection</h2>
                <p className="text-muted-foreground leading-relaxed mb-4">
                  8.1 Payment is required in full upon collection of the repaired device. We accept cash, EFTPOS, 
                  Visa, Mastercard, and bank transfer.
                </p>
                <p className="text-muted-foreground leading-relaxed">
                  8.2 Devices not collected within 30 days of repair completion notification will incur a storage 
                  fee. Devices not collected within 90 days may be disposed of or sold to recover costs.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-bold mb-4 text-foreground">9. Cancellation and Refunds</h2>
                <p className="text-muted-foreground leading-relaxed mb-4">
                  9.1 Repairs may be cancelled before work commences. A diagnostic fee may apply if assessment 
                  has already been performed.
                </p>
                <p className="text-muted-foreground leading-relaxed">
                  9.2 Refunds are not available for completed repairs unless the repair is covered under warranty 
                  and cannot be rectified.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-bold mb-4 text-foreground">10. Governing Law</h2>
                <p className="text-muted-foreground leading-relaxed">
                  These Terms and Conditions are governed by the laws of the State of Victoria, Australia. Any 
                  disputes arising from these terms shall be subject to the exclusive jurisdiction of the courts 
                  of Victoria.
                </p>
              </section>

              <section className="border-t border-border pt-8">
                <h2 className="text-2xl font-bold mb-4 text-foreground">Contact Us</h2>
                <p className="text-muted-foreground leading-relaxed mb-8">
                  If you have any questions about these Terms and Conditions, please contact us:
                </p>
                <div className="grid sm:grid-cols-3 gap-4 items-start">
                  <div className="flex items-center gap-3 text-muted-foreground">
                    <Mail className="h-5 w-5 text-primary" />
                    <span className="text-sm">info@somervillemobile.com.au</span>
                  </div>
                  <div className="flex items-center gap-3 text-muted-foreground">
                    <Phone className="h-5 w-5 text-primary" />
                    <span className="text-sm">(03) 5977 6911</span>
                  </div>
                  <div className="flex items-start gap-3 text-muted-foreground">
                    <MapPin className="h-5 w-5 text-primary mt-0.5" />
                    <span className="text-sm">Shop 14,<br /> 49 Eramosa Road West,<br />Somerville, VIC 3912</span>
                  </div>
                </div>
              </section>

            </div>
          </motion.div>
        </div>
      </section>
    </Layout>
  );
};

export default TermsPage;
