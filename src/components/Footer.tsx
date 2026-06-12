import React from 'react';
import Link from 'next/link';
import FooterCTA from './FooterCTA';
import { Phone, Mail, MapPin } from 'lucide-react';

const Footer = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="w-full flex flex-col mt-auto">
      {/* CTA Banner Section */}
      <FooterCTA />

      {/* Main Footer Body */}
      <div className="w-full p-20 bg-neutral-950 flex flex-col justify-start items-start">
        <div className="w-full max-w-[1280px] mx-auto flex flex-wrap justify-between items-start gap-10">

          {/* Brand & Contact Column */}
          <div className="w-72 flex flex-col justify-start items-start gap-4">
            <Link href="/" className="inline-flex justify-start items-center gap-2">
              <img
                className="w-28 h-28"
                src="https://buttoninks.com/wp-content/uploads/2026/06/cropped-Screenshot_3-removebg-preview.png"
                alt="ButtonInks Logo"
              />
            </Link>
            <p className="text-neutral-400 text-sm font-normal font-['Inter'] leading-5">
              Professional custom printing for businesses, organizations, and individuals. Quality guaranteed.
            </p>

            <div className="flex flex-col justify-start items-start gap-3 mt-2">
              <div className="inline-flex justify-start items-center gap-2">
                <Phone className="w-3.5 h-3.5 text-green-700" />
                <span className="text-neutral-400 text-xs font-normal font-['Inter']">+1 (409) 800- 3195</span>
              </div>
              <div className="inline-flex justify-start items-center gap-2">
                <Mail className="w-3.5 h-3.5 text-green-700" />
                <span className="text-neutral-400 text-xs font-normal font-['Inter']">info@buttoninks.com</span>
              </div>
              <div className="inline-flex justify-start items-center gap-2">
                <MapPin className="w-3.5 h-3.5 text-green-700 shrink-0 mt-0.5" />
                <span className="text-neutral-400 text-xs font-normal font-['Inter'] leading-5">
                  1853 Pearland Pkwy Ste #123 Unit #2161 Pearland, TX 77581
                </span>
              </div>
            </div>

            {/* Social Icons */}
            <div className="inline-flex justify-start items-start gap-2 mt-2">
              <a href="#" className="w-9 h-9 bg-white/5 rounded-lg flex justify-center items-center hover:bg-white/10 transition-colors">
                <svg className="w-4 h-4 text-neutral-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"></path>
                </svg>
              </a>
              <a href="#" className="w-9 h-9 bg-white/5 rounded-lg flex justify-center items-center hover:bg-white/10 transition-colors">
                <svg className="w-4 h-4 text-neutral-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="2" y="2" width="20" height="20" rx="5" ry="5"></rect>
                  <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path>
                  <line x1="17.5" y1="6.5" x2="17.51" y2="6.5"></line>
                </svg>
              </a>
              <a href="#" className="w-9 h-9 bg-white/5 rounded-lg flex justify-center items-center hover:bg-white/10 transition-colors">
                <svg className="w-4 h-4 text-neutral-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M22 4s-.7 2.1-2 3.4c1.6 10-9.4 17.3-18 11.6 2.2.1 4.4-.6 6-2C3 15.5.5 9.6 3 5c2.2 2.6 5.6 4.1 9 4-.9-4.2 4-6.6 7-3.8 1.1 0 3-1.2 3-1.2z"></path>
                </svg>
              </a>
              <a href="#" className="w-9 h-9 bg-white/5 rounded-lg flex justify-center items-center hover:bg-white/10 transition-colors">
                <svg className="w-4 h-4 text-neutral-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z"></path>
                  <rect x="2" y="9" width="4" height="12"></rect>
                  <circle cx="4" cy="4" r="2"></circle>
                </svg>
              </a>
            </div>
          </div>

          {/* Links Column 1: INFORMATION */}
          <div className="flex flex-col justify-start items-start gap-4">
            <h3 className="text-white text-sm font-bold font-['Outfit'] uppercase leading-4">Information</h3>
            <ul className="flex flex-col justify-start items-start gap-3">
              <li><Link href="/about" className="text-neutral-400 text-sm hover:text-green-700 transition-colors font-['Inter']">About us</Link></li>
              <li><Link href="/blog" className="text-neutral-400 text-sm hover:text-green-700 transition-colors font-['Inter']">Our Blog</Link></li>
              <li><Link href="/returns" className="text-neutral-400 text-sm hover:text-green-700 transition-colors font-['Inter']">Start a Return</Link></li>
              <li><Link href="/contact" className="text-neutral-400 text-sm hover:text-green-700 transition-colors font-['Inter']">Contact Us</Link></li>
              <li><Link href="/faq" className="text-neutral-400 text-sm hover:text-green-700 transition-colors font-['Inter']">Shipping FAQ</Link></li>
            </ul>
          </div>

          {/* Links Column 2: SERVICES */}
          <div className="flex flex-col justify-start items-start gap-4">
            <h3 className="text-white text-sm font-bold font-['Outfit'] uppercase leading-4">Services</h3>
            <ul className="flex flex-col justify-start items-start gap-3">
              <li><Link href="/services/corporate" className="text-neutral-400 text-sm hover:text-green-700 transition-colors font-['Inter']">Corporate Printing</Link></li>
              <li><Link href="/design" className="text-neutral-400 text-sm hover:text-green-700 transition-colors font-['Inter']">Design your Own</Link></li>
              <li><Link href="/services/branding" className="text-neutral-400 text-sm hover:text-green-700 transition-colors font-['Inter']">Branding Service</Link></li>
              <li><Link href="/services/graphics" className="text-neutral-400 text-sm hover:text-green-700 transition-colors font-['Inter']">Graphics Design</Link></li>
              <li><Link href="/services/pod" className="text-neutral-400 text-sm hover:text-green-700 transition-colors font-['Inter']">Print on Demand</Link></li>
            </ul>
          </div>

          {/* Links Column 3: QUICKLINKS */}
          <div className="flex flex-col justify-start items-start gap-4">
            <h3 className="text-white text-sm font-bold font-['Outfit'] uppercase leading-4">Quicklinks</h3>
            <ul className="flex flex-col justify-start items-start gap-3">
              <li><Link href="/account" className="text-neutral-400 text-sm hover:text-green-700 transition-colors font-['Inter']">My Account</Link></li>
              <li><Link href="/policies/refund" className="text-neutral-400 text-sm hover:text-green-700 transition-colors font-['Inter']">Return & Refund Policy</Link></li>
              <li><Link href="/policies/privacy" className="text-neutral-400 text-sm hover:text-green-700 transition-colors font-['Inter']">Privacy Policy</Link></li>
              <li><Link href="/policies/cookies" className="text-neutral-400 text-sm hover:text-green-700 transition-colors font-['Inter']">Cookie Policy</Link></li>
              <li><Link href="/policies/terms" className="text-neutral-400 text-sm hover:text-green-700 transition-colors font-['Inter']">Terms of use</Link></li>
            </ul>
          </div>

          {/* Connect/Newsletter Column */}
          <div className="w-72 flex flex-col justify-start items-start gap-4">
            <h3 className="text-white text-sm font-bold font-['Outfit'] uppercase leading-4">Connect</h3>
            <p className="text-neutral-400 text-sm font-normal font-['Inter'] leading-5">
              Subscribe to our newsletter for updates and special offers.
            </p>
            <form className="w-full flex justify-start items-start gap-2">
              <input
                type="email"
                placeholder="Your email"
                className="flex-1 px-3 py-2 bg-white/10 rounded border border-white/20 text-white text-sm font-normal font-['Inter'] focus:outline-none focus:border-green-700 transition-colors"
              />
              <button
                type="submit"
                className="px-4 py-2 bg-green-700 rounded text-white text-sm font-bold font-['Inter'] leading-5 hover:bg-green-600 transition-colors"
              >
                Subscribe
              </button>
            </form>
          </div>
        </div>

        {/* Payment Icons Bar */}
        <div className="w-full max-w-[1280px] mx-auto border-t border-white/10 mt-16 pt-8 flex justify-center items-center gap-6">
          <img src="https://placehold.co/40x25" alt="Visa" className="h-4 opacity-50" />
          <img src="https://placehold.co/40x25" alt="Mastercard" className="h-4 opacity-50" />
          <img src="https://placehold.co/40x25" alt="PayPal" className="h-4 opacity-50" />
          <img src="https://placehold.co/40x25" alt="Amex" className="h-4 opacity-50" />
        </div>
      </div>

      {/* Sub-Footer section */}
      <div className="w-full px-20 py-5 bg-neutral-50 border-t border-neutral-200">
        <div className="w-full max-w-[1280px] mx-auto grid grid-cols-1 md:grid-cols-3 items-center gap-4">
          {/* Left: Copyright */}
          <div className="flex justify-center md:justify-start">
            <p className="text-neutral-700 text-xs font-normal font-['Inter'] leading-5">
              © {currentYear} ButtonInks. All rights reserved.
            </p>
          </div>

          {/* Center: Developer Credit */}
          <div className="flex justify-center">
            <p className="text-neutral-700 text-xs font-normal font-['Inter'] leading-5 text-center">
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
          <div className="flex flex-wrap justify-center md:justify-end items-center gap-6">
            <Link href="/policies/privacy" className="text-neutral-700 text-xs font-normal font-['Inter'] leading-5 hover:text-green-700 transition-colors">
              Privacy Policy
            </Link>
            <Link href="/policies/terms" className="text-neutral-700 text-xs font-normal font-['Inter'] leading-5 hover:text-green-700 transition-colors">
              Terms of Service
            </Link>
            <Link href="/policies/cookies" className="text-neutral-700 text-xs font-normal font-['Inter'] leading-5 hover:text-green-700 transition-colors">
              Cookie Policy
            </Link>
            <Link href="/accessibility" className="text-neutral-700 text-xs font-normal font-['Inter'] leading-5 hover:text-green-700 transition-colors">
              Accessibility
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
