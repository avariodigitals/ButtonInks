export const metadata = { title: "Privacy Policy | ButtonInks", description: "ButtonInks privacy policy — how we collect, use, and protect your personal information." };

export default function PrivacyPolicyPage() {
  return (
    <main className="w-full bg-white min-h-screen">
      <section className="w-full bg-gradient-to-br from-green-50 to-white py-16 px-6 md:px-20">
        <div className="max-w-[800px] mx-auto flex flex-col gap-4">
          <span className="px-4 py-1 bg-green-100 text-green-700 text-xs font-bold rounded-full font-['Inter'] uppercase tracking-widest w-fit">Legal</span>
          <h1 className="text-4xl font-bold font-['Outfit'] text-slate-900">Privacy Policy</h1>
          <p className="text-slate-500 text-sm font-['Inter']">Last updated: January 1, 2025</p>
        </div>
      </section>
      <section className="w-full px-6 md:px-20 py-16">
        <div className="max-w-[800px] mx-auto prose prose-slate font-['Inter']">
          <h2>Information We Collect</h2>
          <p>We collect information you provide directly — such as your name, email address, shipping address, and payment information when you place an order or create an account.</p>
          <p>We also automatically collect certain data when you use our website, including IP address, browser type, pages visited, and referring URLs through cookies and similar technologies.</p>
          <h2>How We Use Your Information</h2>
          <ul>
            <li>To process and fulfil your orders</li>
            <li>To communicate with you about your account and orders</li>
            <li>To send marketing communications (with your consent)</li>
            <li>To improve our website and services</li>
            <li>To comply with legal obligations</li>
          </ul>
          <h2>Sharing of Information</h2>
          <p>We do not sell your personal data. We may share it with trusted third parties who assist in operating our business (e.g. payment processors, shipping carriers) under strict confidentiality agreements.</p>
          <h2>Data Retention</h2>
          <p>We retain your personal data for as long as your account is active or as needed to provide services. You may request deletion of your data by emailing <a href="mailto:info@buttoninks.com">info@buttoninks.com</a>.</p>
          <h2>Your Rights</h2>
          <p>You have the right to access, correct, or delete your personal information at any time. Contact us to exercise these rights.</p>
          <h2>Cookies</h2>
          <p>We use cookies to enhance your browsing experience. See our <a href="/policies/cookies">Cookie Policy</a> for full details.</p>
          <h2>Contact</h2>
          <p>If you have questions about this policy, contact us at <a href="mailto:info@buttoninks.com">info@buttoninks.com</a>.</p>
        </div>
      </section>
    </main>
  );
}
