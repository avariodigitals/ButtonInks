export const metadata = { title: "Return & Refund Policy | ButtonInks", description: "ButtonInks return and refund policy — what is covered, timelines, and how to initiate a claim." };

export default function RefundPolicyPage() {
  return (
    <main className="w-full bg-white min-h-screen">
      <section className="w-full bg-gradient-to-br from-green-50 to-white py-16 px-6 md:px-20">
        <div className="max-w-[800px] mx-auto flex flex-col gap-4">
          <span className="px-4 py-1 bg-green-100 text-green-700 text-xs font-bold rounded-full font-['Inter'] uppercase tracking-widest w-fit">Legal</span>
          <h1 className="text-4xl font-bold font-['Outfit'] text-slate-900">Return &amp; Refund Policy</h1>
          <p className="text-slate-500 text-sm font-['Inter']">Last updated: January 1, 2025</p>
        </div>
      </section>
      <section className="w-full px-6 md:px-20 py-16">
        <div className="max-w-[800px] mx-auto prose prose-slate font-['Inter']">
          <h2>Our Commitment</h2>
          <p>ButtonInks is committed to delivering high-quality custom print products. If you are not satisfied with your order due to a production error or damage during shipping, we will make it right.</p>
          <h2>Eligible Returns</h2>
          <p>Returns and reprints are accepted for the following reasons:</p>
          <ul>
            <li>The item received is defective or damaged</li>
            <li>The item received is significantly different from the approved proof</li>
            <li>You received the wrong item</li>
            <li>Items were missing from your order</li>
          </ul>
          <h2>Non-Returnable Items</h2>
          <p>Because our products are custom-made to your specifications, we cannot accept returns for:</p>
          <ul>
            <li>Custom items produced correctly to your approved proof</li>
            <li>Items damaged through normal use or after delivery</li>
            <li>Change of mind on custom or personalised orders</li>
            <li>Orders placed more than 30 days ago</li>
          </ul>
          <h2>How to Initiate a Return or Refund</h2>
          <ol>
            <li>Email <a href="mailto:info@buttoninks.com">info@buttoninks.com</a> within 30 days of receiving your order.</li>
            <li>Include your order number and clear photos of the issue.</li>
            <li>Our team will review your request within 1–2 business days.</li>
            <li>If approved, we will offer a reprint, store credit, or full refund at our discretion.</li>
          </ol>
          <h2>Refund Processing</h2>
          <p>Approved refunds are returned to your original payment method within 5–10 business days depending on your bank or card issuer.</p>
          <h2>Contact</h2>
          <p>For any questions about this policy, contact us at <a href="mailto:info@buttoninks.com">info@buttoninks.com</a> or call +1 (409) 800-3195.</p>
        </div>
      </section>
    </main>
  );
}
