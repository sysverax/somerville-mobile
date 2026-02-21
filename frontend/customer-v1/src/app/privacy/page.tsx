"use client";

import { motion } from "framer-motion";
import { Shield, Mail, Phone, MapPin } from "lucide-react";
import Layout from "@/src/components/layout/Layout";

const PrivacyPolicyPage = () => {
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
              <Shield className="h-8 w-8 text-primary" />
            </div>
            <h1 className="text-4xl md:text-5xl font-bold mb-4">Privacy Policy</h1>
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
                <h2 className="text-2xl font-bold mb-4 text-foreground">Introduction</h2>
                <p className="text-muted-foreground leading-relaxed">
                  Somerville Mobile ("we", "us", or "our") is committed to protecting the privacy of our customers 
                  and website visitors. This Privacy Policy explains how we collect, use, disclose, and safeguard 
                  your information when you visit our store, use our services, or interact with our website.
                </p>
                <p className="text-muted-foreground leading-relaxed">
                  By using our services or accessing our website, you consent to the practices described in this policy.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-bold mb-4 text-foreground">Information We Collect</h2>
                <p className="text-muted-foreground leading-relaxed mb-4">
                  We may collect the following types of information:
                </p>
                <ul className="list-disc list-inside space-y-2 text-muted-foreground">
                  <li><strong className="text-foreground">Personal Information:</strong> Name, email address, phone number, and address when you book a repair or contact us.</li>
                  <li><strong className="text-foreground">Device Information:</strong> Details about your device including make, model, serial number, and fault description for repair purposes.</li>
                  <li><strong className="text-foreground">Transaction Information:</strong> Payment details and repair history for billing and warranty purposes.</li>
                  <li><strong className="text-foreground">Website Usage:</strong> IP address, browser type, pages visited, and other analytics data to improve our website.</li>
                </ul>
              </section>

              <section>
                <h2 className="text-2xl font-bold mb-4 text-foreground">How We Use Your Information</h2>
                <p className="text-muted-foreground leading-relaxed mb-4">
                  We use the information we collect to:
                </p>
                <ul className="list-disc list-inside space-y-2 text-muted-foreground">
                  <li>Provide repair and service quotations</li>
                  <li>Process and complete your repair orders</li>
                  <li>Communicate with you about your device and repair status</li>
                  <li>Send appointment reminders and service updates</li>
                  <li>Process payments and maintain warranty records</li>
                  <li>Improve our services and customer experience</li>
                  <li>Comply with legal obligations</li>
                </ul>
              </section>

              <section>
                <h2 className="text-2xl font-bold mb-4 text-foreground">Data Security</h2>
                <p className="text-muted-foreground leading-relaxed">
                  We implement appropriate technical and organisational measures to protect your personal information 
                  against unauthorised access, alteration, disclosure, or destruction. This includes secure storage 
                  of physical documents, encrypted digital systems, and strict access controls.
                </p>
                <p className="text-muted-foreground leading-relaxed">
                  All device data is treated with strict confidentiality. We do not access personal files on your 
                  device unless specifically required for the repair, and any data encountered is kept strictly confidential.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-bold mb-4 text-foreground">Information Sharing</h2>
                <p className="text-muted-foreground leading-relaxed mb-4">
                  We do not sell, trade, or rent your personal information to third parties. We may share your 
                  information only in the following circumstances:
                </p>
                <ul className="list-disc list-inside space-y-2 text-muted-foreground">
                  <li><strong className="text-foreground">Service Providers:</strong> With trusted partners who assist in operating our business (payment processors, delivery services).</li>
                  <li><strong className="text-foreground">Legal Requirements:</strong> When required by law, court order, or government regulations.</li>
                  <li><strong className="text-foreground">Protection of Rights:</strong> To protect our rights, property, safety, or the rights of others.</li>
                </ul>
              </section>

              <section>
                <h2 className="text-2xl font-bold mb-4 text-foreground">Your Rights</h2>
                <p className="text-muted-foreground leading-relaxed mb-4">
                  Under Australian privacy laws, you have the right to:
                </p>
                <ul className="list-disc list-inside space-y-2 text-muted-foreground">
                  <li>Access the personal information we hold about you</li>
                  <li>Request correction of inaccurate or outdated information</li>
                  <li>Request deletion of your personal information (subject to legal requirements)</li>
                  <li>Opt out of marketing communications at any time</li>
                  <li>Lodge a complaint with the Office of the Australian Information Commissioner</li>
                </ul>
              </section>

              <section>
                <h2 className="text-2xl font-bold mb-4 text-foreground">Data Retention</h2>
                <p className="text-muted-foreground leading-relaxed">
                  We retain your personal information only for as long as necessary to fulfil the purposes for which 
                  it was collected, including for warranty periods and legal compliance. Repair records are typically 
                  retained for a period of 7 years in accordance with Australian tax and consumer law requirements.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-bold mb-4 text-foreground">Cookies and Analytics</h2>
                <p className="text-muted-foreground leading-relaxed">
                  Our website may use cookies and similar technologies to enhance your browsing experience and 
                  collect anonymous usage statistics. You can control cookie settings through your browser preferences. 
                  Disabling cookies may affect some website functionality.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-bold mb-4 text-foreground">Changes to This Policy</h2>
                <p className="text-muted-foreground leading-relaxed">
                  We may update this Privacy Policy from time to time to reflect changes in our practices or legal 
                  requirements. We encourage you to review this page periodically. Significant changes will be 
                  communicated through our website or by other appropriate means.
                </p>
              </section>

              <section className="border-t border-border pt-8">
                <h2 className="text-2xl font-bold mb-4 text-foreground">Contact Us</h2>
                <p className="text-muted-foreground leading-relaxed mb-6">
                  If you have any questions about this Privacy Policy or wish to exercise your privacy rights, 
                  please contact us:
                </p>
                <div className="grid sm:grid-cols-3 gap-4">
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

export default PrivacyPolicyPage;
