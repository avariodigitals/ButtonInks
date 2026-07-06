export const metadata = { title: "Terms of Use | ButtonInks", description: "ButtonInks terms and conditions governing use of our website and services." };

export default function TermsPage() {
  return (
    <main className="w-full bg-white min-h-screen">
      <section className="w-full bg-gradient-to-br from-green-50 to-white py-16 px-6 md:px-20">
        <div className="max-w-[800px] mx-auto flex flex-col gap-4">
          <span className="px-4 py-1 bg-green-100 text-green-700 text-xs font-bold rounded-full font-['Inter'] uppercase tracking-widest w-fit">Legal</span>
          <h1 className="text-4xl font-bold font-['Outfit'] text-slate-900">Terms of Use</h1>
          <p className="text-slate-500 text-sm font-['Inter']">Last updated: January 1, 2025</p>
        </div>
      </section>
      <section className="w-full px-6 md:px-20 py-16">
        <div className="max-w-[800px] mx-auto prose prose-slate font-['Inter']">
          <h2>Acceptance of Terms</h2>
          <p>By accessing or using the ButtonInks website and services, you agree to be bound by these Terms of Use. If you do not agree, please do not use our site.</p>
          <h2>Use of the Site</h2>
          <p>You may use our site for lawful purposes only. You agree not to:</p>
          <ul>
            <li>Upload artwork that infringes third-party intellectual property rights</li>
            <li>Submit false, misleading, or fraudulent information</li>
            <li>Attempt to disrupt or damage our systems or data</li>
            <li>Use automated tools to scrape or harvest content from our site</li>
          </ul>
          <h2>Intellectual Property</h2>
          <p>You retain ownership of artwork and designs you upload. By submitting artwork, you confirm you have the right to use it and grant ButtonInks a limited licence to produce the ordered goods.</p>
          <p>All ButtonInks branding, website content, and design tools are our intellectual property and may not be copied or reproduced without written permission.</p>
          <h2>Orders and Payment</h2>
          <p>All orders are subject to acceptance and availability. Prices are shown in USD and are subject to change without notice. Payment is due in full at the time of order placement.</p>
          <h2>Limitation of Liability</h2>
          <p>ButtonInks&apos; liability is limited to the value of your order. We are not liable for indirect, consequential, or incidental damages arising from the use of our products or services.</p>
          <h2>Governing Law</h2>
          <p>These terms are governed by the laws of the State of Texas, USA. Any disputes shall be resolved in the courts of Brazoria County, Texas.</p>
          <h2>Changes to These Terms</h2>
          <p>We may update these terms at any time. Continued use of the site after changes constitutes acceptance of the updated terms.</p>
          <h2>Contact</h2>
          <p>Questions about these terms? Email us at <a href="mailto:info@buttoninks.com">info@buttoninks.com</a>.</p>
        </div>
      </section>
    </main>
  );
}
