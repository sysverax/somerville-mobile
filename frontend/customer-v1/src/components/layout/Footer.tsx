"use client";

import Link from "next/link";
import Image from "next/image";
import { Phone, Mail, MapPin, Facebook, Instagram, Clock } from "lucide-react";
import logo from "@/public/logo.jpeg";

const Footer = () => {
  return (
    <footer className="bg-card border-t border-border">
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Brand */}
          <div className="space-y-4">
            <Link href="/" className="flex items-center gap-3">

              <Image
                src={logo}
                alt="Somerville Mobile"
                width={48}
                height={48}
                className="rounded-lg object-cover"
              />
              <span className="font-bold text-lg">
                Somerville<span className="text-primary">Mobile</span>
              </span>
            </Link>
            <p className="text-muted-foreground text-sm">
              Your trusted partner for device repairs, quality products, and professional services in Somerville and the Mornington Peninsula.
            </p>
            <div className="flex items-center gap-4">
              <a href="https://facebook.com" target="_blank" rel="noopener noreferrer" className="text-muted-foreground hover:text-primary transition-colors">
                <Facebook className="h-5 w-5" />
              </a>
              <a href="https://instagram.com" target="_blank" rel="noopener noreferrer" className="text-muted-foreground hover:text-primary transition-colors">
                <Instagram className="h-5 w-5" />
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div className="space-y-4">
            <h4 className="font-semibold">Quick Links</h4>
            <ul className="space-y-2">
              <li>
                <Link href="/about" className="text-muted-foreground hover:text-foreground transition-colors text-sm">
                  About Us
                </Link>
              </li>
              <li>
                <Link href="/services" className="text-muted-foreground hover:text-foreground transition-colors text-sm">
                  Our Services
                </Link>
              </li>
              <li>
                <Link href="/booking" className="text-muted-foreground hover:text-foreground transition-colors text-sm">
                  Book a Repair
                </Link>
              </li>
              <li>
                <Link href="/faq" className="text-muted-foreground hover:text-foreground transition-colors text-sm">
                  FAQ
                </Link>
              </li>
              <li>
                <Link href="/contact" className="text-muted-foreground hover:text-foreground transition-colors text-sm">
                  Contact Us
                </Link>
              </li>
            </ul>
          </div>

          {/* Legal */}
          <div className="space-y-4">
            <h4 className="font-semibold">Legal</h4>
            <ul className="space-y-2">
              <li>
                <Link href="/privacy" className="text-muted-foreground hover:text-foreground transition-colors text-sm">
                  Privacy Policy
                </Link>
              </li>
              <li>
                <Link href="/terms" className="text-muted-foreground hover:text-foreground transition-colors text-sm">
                  Terms & Conditions
                </Link>
              </li>
            </ul>

            <h4 className="font-semibold pt-4">Business Hours</h4>
            <div className="flex items-start gap-2 text-muted-foreground text-sm">
              <Clock className="h-4 w-4 text-primary mt-0.5" />
              <div>
                <p>Mon–Fri: 9:00 AM – 6:00 PM</p>
                <p>Saturday: 9:30 AM – 4:30 PM</p>
                <p>Sunday: 10:00 AM – 3:30 PM</p>
              </div>
            </div>
          </div>

          {/* Contact */}
          <div className="space-y-4">
            <h4 className="font-semibold">Contact Us</h4>
            <ul className="space-y-3">
              <li className="flex items-center gap-3 text-muted-foreground text-sm">
                <Phone className="h-4 w-4 text-primary" />
                <a href="tel:0359776911" className="hover:text-foreground transition-colors">
                  (03) 5977 6911
                </a>
              </li>
              <li className="flex items-center gap-3 text-muted-foreground text-sm">
                <Mail className="h-4 w-4 text-primary" />
                <a href="mailto:info@somervillemobile.com.au" className="hover:text-foreground transition-colors">
                  info@somervillemobile.com.au
                </a>
              </li>
              <li className="flex items-start gap-3 text-muted-foreground text-sm">
                <MapPin className="h-4 w-4 text-primary mt-0.5" />
                <a
                  href="https://maps.google.com/?q=Shop+14,+49+Eramosa+Road+West,+Somerville+VIC+3912"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-foreground transition-colors"
                >
                  Shop 14,<br /> 49 Eramosa Road West,<br />Somerville, VIC 3912
                </a>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-12 pt-8 border-t border-border text-center text-muted-foreground text-sm">
          <p>&copy; {new Date().getFullYear()} Somerville Mobile. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
