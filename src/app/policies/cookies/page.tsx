export const metadata = { title: "Cookie Policy | ButtonInks", description: "How ButtonInks uses cookies and similar technologies on our website." };

export default function CookiePolicyPage() {
  return (
    <main className="w-full bg-white min-h-screen">
      <section className="w-full bg-gradient-to-br from-green-50 to-white py-16 px-6 md:px-20">
        <div className="max-w-[800px] mx-auto flex flex-col gap-4">
          <span className="px-4 py-1 bg-green-100 text-green-700 text-xs font-bold rounded-full font-['Inter'] uppercase tracking-widest w-fit">Legal</span>
          <h1 className="text-4xl font-bold font-['Outfit'] text-slate-900">Cookie Policy</h1>
          <p className="text-slate-500 text-sm font-['Inter']">Last updated: January 1, 2025</p>
        </div>
      </section>
      <section className="w-full px-6 md:px-20 py-16">
        <div className="max-w-[800px] mx-auto prose prose-slate font-['Inter']">
          <h2>What Are Cookies?</h2>
          <p>Cookies are small text files stored on your device when you visit a website. They help us provide a better experience by remembering your preferences and understanding how you use our site.</p>
          <h2>Types of Cookies We Use</h2>
          <h3>Essential Cookies</h3>
          <p>These are required for the website to function. They enable core features like your shopping cart, login sessions, and checkout. You cannot opt out of these.</p>
          <h3>Analytics Cookies</h3>
          <p>These help us understand how visitors interact with our site. Data collected is anonymous and used to improve page performance and content.</p>
          <h3>Marketing Cookies</h3>
          <p>These allow us to show you relevant adverts based on your browsing behaviour. You can opt out via your browser settings or cookie preference centre.</p>
          <h2>Managing Cookies</h2>
          <p>You can control or delete cookies through your browser settings. Disabling non-essential cookies will not affect your ability to browse the site or place orders, but some features may behave differently.</p>
          <h2>Third-Party Cookies</h2>
          <p>Some features — such as embedded maps and payment widgets — may set cookies from third-party providers. These are governed by the respective providers&apos; privacy policies.</p>
          <h2>Contact</h2>
          <p>Questions about our use of cookies? Contact us at <a href="mailto:info@buttoninks.com">info@buttoninks.com</a>.</p>
        </div>
      </section>
    </main>
  );
}
