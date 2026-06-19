"use client";

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import FooterCTA from './FooterCTA';
import { Phone, Mail, MapPin } from 'lucide-react';
import { WP_URL } from '@/lib/wordpress';

const Footer = () => {
  const currentYear = new Date().getFullYear();
  const pathname = usePathname();

  // Hide footer on design editor page
  if (pathname?.startsWith('/design')) return null;

  return (
    <footer className="w-full flex flex-col mt-auto bg-neutral-950">
      {/* CTA Banner Section */}
      <FooterCTA />

      {/* Main Footer Body */}
      <div className="w-full px-6 md:px-20 py-16 md:py-24 flex flex-col justify-start items-center">
        <div className="w-full max-w-[1280px] grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-12 gap-12 lg:gap-8">

          {/* Brand & Contact Column */}
          <div className="sm:col-span-2 lg:col-span-4 flex flex-col justify-start items-start gap-6">
            <Link href="/" className="inline-flex justify-start items-center gap-2">
              <img
                className="w-24 h-24 md:w-28 md:h-28 object-contain"
                src={`${WP_URL}/wp-content/uploads/2026/06/cropped-Screenshot_3-removebg-preview.png`}
                alt="ButtonInks Logo"
              />
            </Link>
            <p className="text-neutral-400 text-sm font-normal font-['Inter'] leading-6 max-w-sm">
              Professional custom printing for businesses, organizations, and individuals. Premium quality, bulk pricing, and fast delivery guaranteed.
            </p>

            <div className="flex flex-col justify-start items-start gap-4 mt-2">
              <div className="inline-flex justify-start items-center gap-3 group">
                <div className="w-8 h-8 bg-green-700/10 rounded-full flex items-center justify-center group-hover:bg-green-700 transition-colors">
                  <Phone className="w-4 h-4 text-green-700 group-hover:text-white transition-colors" />
                </div>
                <span className="text-neutral-400 text-sm font-normal font-['Inter']">+1 (409) 800- 3195</span>
              </div>
              <div className="inline-flex justify-start items-center gap-3 group">
                <div className="w-8 h-8 bg-green-700/10 rounded-full flex items-center justify-center group-hover:bg-green-700 transition-colors">
                  <Mail className="w-4 h-4 text-green-700 group-hover:text-white transition-colors" />
                </div>
                <span className="text-neutral-400 text-sm font-normal font-['Inter']">info@buttoninks.com</span>
              </div>
              <div className="inline-flex justify-start items-start gap-3 group">
                <div className="w-8 h-8 bg-green-700/10 rounded-full flex items-center justify-center group-hover:bg-green-700 shrink-0 transition-colors">
                  <MapPin className="w-4 h-4 text-green-700 group-hover:text-white transition-colors" />
                </div>
                <span className="text-neutral-400 text-sm font-normal font-['Inter'] leading-6">
                  1853 Pearland Pkwy Ste #123 Unit #2161<br />Pearland, TX 77581
                </span>
              </div>
            </div>

            {/* Social Icons */}
            <div className="inline-flex justify-start items-start gap-3 mt-4">
              {[
                { path: "M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z", label: "Facebook" },
                { path: "M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z M17.5 6.5h.01", label: "Instagram" },
                { path: "M22 4s-.7 2.1-2 3.4c1.6 10-9.4 17.3-18 11.6 2.2.1 4.4-.6 6-2C3 15.5.5 9.6 3 5c2.2 2.6 5.6 4.1 9 4-.9-4.2 4-6.6 7-3.8 1.1 0 3-1.2 3-1.2z", label: "Twitter" },
                { path: "M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z M2 9h4v12H2z M4 4a2 2 0 1 1 0 4 2 2 0 0 1 0-4z", label: "LinkedIn" }
              ].map((icon, i) => (
                <a key={i} href="#" aria-label={icon.label} className="w-10 h-10 bg-white/5 rounded-xl flex justify-center items-center hover:bg-green-700 transition-all group">
                  <svg className="w-5 h-5 text-neutral-400 group-hover:text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d={icon.path}></path>
                    {icon.label === "Instagram" && <rect x="2" y="2" width="20" height="20" rx="5" ry="5"></rect>}
                  </svg>
                </a>
              ))}
            </div>
          </div>

          {/* Links Column 1: INFORMATION */}
          <div className="lg:col-span-2 flex flex-col justify-start items-start gap-6">
            <h3 className="text-white text-xs font-bold font-['Outfit'] uppercase tracking-widest leading-4">Information</h3>
            <ul className="flex flex-col justify-start items-start gap-4">
              <li><Link href="/about" className="text-neutral-400 text-sm hover:text-green-700 transition-colors font-['Inter']">About us</Link></li>
              <li><Link href="/blog" className="text-neutral-400 text-sm hover:text-green-700 transition-colors font-['Inter']">Our Blog</Link></li>
              <li><Link href="/returns" className="text-neutral-400 text-sm hover:text-green-700 transition-colors font-['Inter']">Start a Return</Link></li>
              <li><Link href="/contact" className="text-neutral-400 text-sm hover:text-green-700 transition-colors font-['Inter']">Contact Us</Link></li>
              <li><Link href="/faq" className="text-neutral-400 text-sm hover:text-green-700 transition-colors font-['Inter']">Shipping FAQ</Link></li>
            </ul>
          </div>

          {/* Links Column 2: SERVICES */}
          <div className="lg:col-span-2 flex flex-col justify-start items-start gap-6">
            <h3 className="text-white text-xs font-bold font-['Outfit'] uppercase tracking-widest leading-4">Services</h3>
            <ul className="flex flex-col justify-start items-start gap-4">
              <li><Link href="/services/corporate" className="text-neutral-400 text-sm hover:text-green-700 transition-colors font-['Inter']">Corporate Printing</Link></li>
              <li><Link href="/design" className="text-neutral-400 text-sm hover:text-green-700 transition-colors font-['Inter']">Design your Own</Link></li>
              <li><Link href="/services/branding" className="text-neutral-400 text-sm hover:text-green-700 transition-colors font-['Inter']">Branding Service</Link></li>
              <li><Link href="/services/graphics" className="text-neutral-400 text-sm hover:text-green-700 transition-colors font-['Inter']">Graphics Design</Link></li>
              <li><Link href="/services/pod" className="text-neutral-400 text-sm hover:text-green-700 transition-colors font-['Inter']">Print on Demand</Link></li>
            </ul>
          </div>

          {/* Links Column 3: QUICKLINKS */}
          <div className="lg:col-span-2 flex flex-col justify-start items-start gap-6">
            <h3 className="text-white text-xs font-bold font-['Outfit'] uppercase tracking-widest leading-4">Quicklinks</h3>
            <ul className="flex flex-col justify-start items-start gap-4">
              <li><Link href="/account" className="text-neutral-400 text-sm hover:text-green-700 transition-colors font-['Inter']">My Account</Link></li>
              <li><Link href="/policies/refund" className="text-neutral-400 text-sm hover:text-green-700 transition-colors font-['Inter']">Return & Refund Policy</Link></li>
              <li><Link href="/policies/privacy" className="text-neutral-400 text-sm hover:text-green-700 transition-colors font-['Inter']">Privacy Policy</Link></li>
              <li><Link href="/policies/cookies" className="text-neutral-400 text-sm hover:text-green-700 transition-colors font-['Inter']">Cookie Policy</Link></li>
              <li><Link href="/policies/terms" className="text-neutral-400 text-sm hover:text-green-700 transition-colors font-['Inter']">Terms of use</Link></li>
            </ul>
          </div>

          {/* Connect/Newsletter Column */}
          <div className="lg:col-span-2 flex flex-col justify-start items-start gap-6">
            <h3 className="text-white text-xs font-bold font-['Outfit'] uppercase tracking-widest leading-4">Connect</h3>
            <p className="text-neutral-400 text-sm font-normal font-['Inter'] leading-6">
              Subscribe to our newsletter for updates and special offers.
            </p>
            <form className="w-full flex flex-col gap-3">
              <input
                type="email"
                placeholder="Your email"
                className="w-full px-4 py-3 bg-white/5 rounded-xl border border-white/10 text-white text-sm font-normal font-['Inter'] focus:outline-none focus:border-green-700 transition-colors"
              />
              <button
                type="submit"
                className="w-full px-4 py-3 bg-green-700 rounded-xl text-white text-sm font-bold font-['Inter'] leading-5 hover:bg-green-600 transition-all active:scale-[0.98]"
              >
                Subscribe
              </button>
            </form>
          </div>
        </div>

        {/* Payment Icons Bar */}
        <div className="w-full max-w-[1280px] mx-auto border-t border-white/10 mt-16 pt-8 flex flex-wrap justify-center items-center gap-8 md:gap-12">
          <img src="https://placehold.co/40x25" alt="Visa" className="h-4 opacity-40 grayscale invert" />
          <img src="https://placehold.co/40x25" alt="Mastercard" className="h-4 opacity-40 grayscale invert" />
          <img src="https://placehold.co/40x25" alt="PayPal" className="h-4 opacity-40 grayscale invert" />
          <img src="https://placehold.co/40x25" alt="Amex" className="h-4 opacity-40 grayscale invert" />
        </div>
      </div>

      {/* Sub-Footer section */}
      <div className="w-full px-6 md:px-20 py-8 md:py-10 bg-neutral-900/50 border-t border-white/5">
        <div className="w-full max-w-[1280px] mx-auto flex flex-col lg:flex-row justify-between items-center gap-6">
          {/* Left: Copyright */}
          <div className="order-2 lg:order-1">
            <p className="text-neutral-500 text-xs font-normal font-['Inter'] leading-5">
              © {currentYear} ButtonInks. All rights reserved.
            </p>
          </div>

          {/* Center: Developer Credit */}
          <div className="order-1 lg:order-2">
            <p className="text-neutral-500 text-xs font-normal font-['Inter'] leading-5 text-center">
              Designed and Developed by{' '}
              <a
                href="https://www.avariodigitals.com"
                target="_blank"
                rel="noopener noreferrer"
                className="text-green-700 hover:text-green-600 transition-colors font-semibold"
              >
                Avario Digitals
              </a>
            </p>
          </div>

          {/* Right: Policy Links */}
          <div className="order-3 flex flex-wrap justify-center items-center gap-4 md:gap-6">
            <Link href="/policies/privacy" className="text-neutral-500 text-[10px] md:text-xs font-normal font-['Inter'] uppercase tracking-wider hover:text-green-700 transition-colors">
              Privacy
            </Link>
            <Link href="/policies/terms" className="text-neutral-500 text-[10px] md:text-xs font-normal font-['Inter'] uppercase tracking-wider hover:text-green-700 transition-colors">
              Terms
            </Link>
            <Link href="/policies/cookies" className="text-neutral-500 text-[10px] md:text-xs font-normal font-['Inter'] uppercase tracking-wider hover:text-green-700 transition-colors">
              Cookies
            </Link>
            <Link href="/accessibility" className="text-neutral-500 text-[10px] md:text-xs font-normal font-['Inter'] uppercase tracking-wider hover:text-green-700 transition-colors">
              Accessibility
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
