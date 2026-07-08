"use client";

import React, { useState, useEffect, useCallback } from 'react';
import Link from "next/link";
import Image from "next/image";
import { useRouter } from 'next/navigation';
import { ChevronRight, Loader2, ShoppingBag, Truck, Info, AlertCircle, Building2, HandCoins, FileCheck } from "lucide-react";
import { useCart } from "@/context/CartContext";
import { useNotification } from "@/context/NotificationContext";
import AddressAutocomplete, { type ParsedAddress } from "@/components/AddressAutocomplete";

// ── Payment gateway type (matches /api/payment-gateways response) ─────────────
interface WCGateway {
  id:          string;
  title:       string;
  description: string;
  enabled:     boolean;
  settings:    Record<string, { value: string; label: string }>;
}

// ── Icon per gateway id ───────────────────────────────────────────────────────
function GatewayIcon({ id }: { id: string }) {
  if (id === 'bacs')   return <Building2  className="w-5 h-5 shrink-0" />;
  if (id === 'cod')    return <HandCoins  className="w-5 h-5 shrink-0" />;
  if (id === 'cheque') return <FileCheck  className="w-5 h-5 shrink-0" />;
  return <Info className="w-5 h-5 shrink-0" />;
}

// ── Details panel shown when a gateway is selected ────────────────────────────
function GatewayDetails({ gateway }: { gateway: WCGateway }) {
  const instructions = gateway.settings?.instructions?.value || gateway.description;

  if (gateway.id === 'bacs') {
    const account   = gateway.settings?.account_number?.value;
    const sortCode  = gateway.settings?.sort_code?.value;
    const iban      = gateway.settings?.iban?.value;
    const bic       = gateway.settings?.bic?.value;
    const bankName  = gateway.settings?.bank_name?.value;
    return (
      <div className="mt-3 p-4 bg-blue-50 rounded-xl flex flex-col gap-2 text-sm text-blue-900 font-['Inter']">
        <p className="font-semibold">Bank Transfer Details</p>
        {bankName  && <p>Bank: <span className="font-medium">{bankName}</span></p>}
        {account   && <p>Account No: <span className="font-medium">{account}</span></p>}
        {sortCode  && <p>Sort Code: <span className="font-medium">{sortCode}</span></p>}
        {iban      && <p>IBAN: <span className="font-medium">{iban}</span></p>}
        {bic       && <p>BIC/SWIFT: <span className="font-medium">{bic}</span></p>}
        {instructions && <p className="text-xs text-blue-700 mt-1">{instructions}</p>}
        {!bankName && !account && !iban && (
          <p className="text-xs text-blue-700">{instructions || 'You will receive bank details by email after placing your order.'}</p>
        )}
      </div>
    );
  }

  if (gateway.id === 'cod') {
    return (
      <div className="mt-3 p-4 bg-amber-50 rounded-xl text-sm text-amber-900 font-['Inter']">
        <p>{instructions || 'Pay with cash when your order is delivered.'}</p>
      </div>
    );
  }

  if (instructions) {
    return (
      <div className="mt-3 p-4 bg-gray-50 rounded-xl text-sm text-gray-700 font-['Inter']">
        <p>{instructions}</p>
      </div>
    );
  }

  return null;
}

export default function CheckoutPage() {
  const { cart, subTotal, clearCart, isLoading, setIsLoading } = useCart();
  const { showNotification } = useNotification();
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState(1);

  // ── Payment gateways from WooCommerce ──────────────────────────────────────
  const [gateways,        setGateways]        = useState<WCGateway[]>([]);
  const [gatewaysLoading, setGatewaysLoading] = useState(false);

  const fetchGateways = useCallback(async () => {
    setGatewaysLoading(true);
    try {
      const res = await fetch('/api/payment-gateways');
      if (res.ok) {
        const data = await res.json();
        setGateways(data.gateways ?? []);
      }
    } catch { /* silent — handled in UI */ } finally {
      setGatewaysLoading(false);
    }
  }, []);

  // Fetch gateways when the user reaches step 3
  useEffect(() => {
    if (currentStep === 3) fetchGateways();
  }, [currentStep, fetchGateways]);

  const [formData, setFormData] = useState({
    email: '', firstName: '', lastName: '', phone: '',
    address: '', city: '', state: '', zipCode: '', note: '',
    shippingMethod: 'usps_priority',
    paymentMethod:  '',
    createAccount: false,   // guest opt-in — only used when not logged in
  });

  // ── Auth state ─────────────────────────────────────────────────────────────
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  useEffect(() => {
    setIsLoggedIn(!!localStorage.getItem('bi_token'));
  }, []);

  // Pre-fill email (and name if stored) from logged-in user profile
  // so it can't accidentally be typed as a different address
  useEffect(() => {
    const token = typeof window !== 'undefined' ? localStorage.getItem('bi_token') : null;
    if (!token) return;
    const storedEmail = localStorage.getItem('bi_user_email') ?? '';
    const storedName  = localStorage.getItem('bi_user_name')  ?? '';
    const [first, ...rest] = storedName.trim().split(' ');
    setFormData(prev => ({
      ...prev,
      email:     storedEmail || prev.email,
      firstName: storedEmail ? (first || prev.firstName) : prev.firstName,
      lastName:  storedEmail ? (rest.join(' ') || prev.lastName) : prev.lastName,
    }));
  }, []);

  // Auto-select the first enabled gateway whenever gateways load
  useEffect(() => {
    if (gateways.length > 0 && !formData.paymentMethod) {
      setFormData(prev => ({ ...prev, paymentMethod: gateways[0].id }));
    }
  }, [gateways, formData.paymentMethod]);

  // ── Shipping ───────────────────────────────────────────────────────────────
  const SHIPPING_RATES = {
    usps_priority: { label: 'USPS Priority Mail®',    days: '1-3 Business Days', cost: 12.87 },
    usps_ground:   { label: 'USPS Ground Advantage™', days: '2-5 Business Days', cost:  8.45 },
  } as const;
  type ShippingMethod = keyof typeof SHIPPING_RATES;
  const currentShipping = SHIPPING_RATES[formData.shippingMethod as ShippingMethod]?.cost ?? 0;
  const total = subTotal + currentShipping;

  const formatPrice = (price: number) =>
    new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(price);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const nextStep = () => setCurrentStep(prev => Math.min(prev + 1, 3));
  const prevStep = () => setCurrentStep(prev => Math.max(prev - 1, 1));

  // ── Order submission ───────────────────────────────────────────────────────
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (currentStep < 3) { nextStep(); return; }
    if (cart.length === 0) return;

    // If no gateway is configured, still allow placing the order — staff will follow up
    const selectedGateway = gateways.find(g => g.id === formData.paymentMethod);

    setIsLoading(true);
    try {
      const token = typeof window !== 'undefined' ? localStorage.getItem('bi_token') : null;
      const response = await fetch('/api/checkout', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({
          payment_method:       selectedGateway?.id    ?? 'pending',
          payment_method_title: selectedGateway?.title ?? 'Pending — to be arranged',
          set_paid: false,
          billing:  { first_name: formData.firstName, last_name: formData.lastName,
                      address_1: formData.address, city: formData.city,
                      state: formData.state, postcode: formData.zipCode,
                      country: 'US', email: formData.email, phone: formData.phone },
          shipping: { first_name: formData.firstName, last_name: formData.lastName,
                      address_1: formData.address, city: formData.city,
                      state: formData.state, postcode: formData.zipCode,
                      country: 'US', email: formData.email, phone: formData.phone },
          line_items: cart.map(item => ({ product_id: item.id, quantity: item.quantity })),
          customer_note: formData.note,
          create_account: !isLoggedIn && formData.createAccount,
          shipping_lines: [{
            method_id:    formData.shippingMethod,
            method_title: SHIPPING_RATES[formData.shippingMethod as ShippingMethod]?.label ?? formData.shippingMethod,
            total:        currentShipping.toFixed(2),
          }],
        }),
      });
      const result = await response.json();
      if (response.ok) {
        clearCart();
        const guestMsg = result.guest
          ? result.account_created
            ? `Order #${result.id} confirmed. Check your email to set up your account and track this order.`
            : `Order #${result.id} confirmed. We'll be in touch shortly.`
          : `Order #${result.id} confirmed. We'll be in touch shortly.`;
        showNotification({ title: 'Order Placed!', message: guestMsg, type: 'success' });
        router.push('/');
      } else {
        throw new Error(result.error || 'Failed to place order');
      }
    } catch (error: any) {
      showNotification({ title: 'Checkout Failed',
        message: error.message || 'Something went wrong. Please try again.', type: 'error' });
    } finally {
      setIsLoading(false);
    }
  };

  // ── Empty cart guard ───────────────────────────────────────────────────────
  if (cart.length === 0 && !isLoading) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center bg-white px-4">
        <div className="w-20 h-20 bg-emerald-50 rounded-full flex items-center justify-center mb-6">
          <ShoppingBag className="w-10 h-10 text-green-700" />
        </div>
        <h1 className="text-2xl font-bold text-gray-900 mb-2 font-['Outfit']">Your cart is empty</h1>
        <p className="text-gray-500 mb-8 text-center max-w-xs">Add some items before checking out.</p>
        <Link href="/categories" className="px-8 py-3 bg-green-700 text-white rounded-3xl font-medium hover:bg-green-600 transition-colors">
          Return to Shop
        </Link>
      </div>
    );
  }

  const selectedGateway = gateways.find(g => g.id === formData.paymentMethod) ?? null;

  return (
    <div className="w-full bg-white flex flex-col items-center overflow-hidden min-h-screen">

      {/* Breadcrumbs */}
      <div className="self-stretch px-4 md:px-20 py-4 bg-white border-b border-gray-200">
        <div className="w-full max-w-[1280px] mx-auto flex items-center gap-2">
          <Link href="/" className="text-emerald-500 text-sm font-normal font-['Inter']">Home</Link>
          <ChevronRight className="w-3 h-3 text-gray-400" />
          <Link href="/cart" className="text-emerald-500 text-sm font-normal font-['Inter']">Cart</Link>
          <ChevronRight className="w-3 h-3 text-gray-400" />
          <span className="text-zinc-500 text-sm font-normal font-['Inter']">Checkout</span>
        </div>
      </div>

      {/* Header */}
      <div className="self-stretch px-4 md:px-20 py-8 bg-emerald-50 border-b border-gray-200">
        <div className="w-full max-w-[1280px] mx-auto">
          <h1 className="text-green-700 text-4xl font-bold font-['Outfit'] leading-10">Checkout</h1>
        </div>
      </div>

      <div className="w-full max-w-[1280px] px-4 md:px-20 py-10 md:py-20 flex flex-col gap-10">

        {/* Step indicators */}
        <div className="w-full flex flex-col md:flex-row justify-center items-center gap-6 md:gap-0">
          {[['1','Contact Details'],['2','Shipping Method'],['3','Payment']].map(([num, label], i) => (
            <React.Fragment key={num}>
              <div className="flex flex-col items-center gap-2.5">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-['Inter'] ${currentStep >= i+1 ? 'bg-green-700 text-white' : 'bg-zinc-300 text-white'}`}>{num}</div>
                <div className={`text-base font-medium font-['Inter'] ${currentStep >= i+1 ? 'text-green-700' : 'text-zinc-400'}`}>{label}</div>
              </div>
              {i < 2 && <div className={`hidden md:block w-16 lg:w-28 h-0 border-t-2 ${currentStep >= i+2 ? 'border-green-700' : 'border-zinc-300'}`} />}
            </React.Fragment>
          ))}
        </div>

        {/* Form + Sidebar grid */}
        <div className="w-full flex flex-col lg:flex-row gap-10">

          {/* Form */}
          <div className="flex-1 p-6 md:p-8 bg-white rounded-2xl border border-gray-200">
            <form id="checkout-form" onSubmit={handleSubmit} className="w-full flex flex-col gap-8">

              {/* ── Step 1: Contact ── */}
              {currentStep === 1 && (
                <div className="flex flex-col gap-6">
                  <h2 className="text-zinc-900 text-xl font-bold font-['Outfit']">Contact Details</h2>
                  <div className="flex flex-col gap-4">
                    <div className="flex flex-col gap-1">
                      <label className="text-zinc-900 text-xs font-medium font-['Inter']">Email Address *</label>
                      <div className="relative">
                        <input type="email" name="email" required value={formData.email} onChange={handleInputChange} placeholder="you@company.com"
                          readOnly={isLoggedIn}
                          className={`w-full h-12 px-4 bg-white rounded-[10px] border border-gray-200 focus:outline-none focus:border-green-700 text-sm font-['Inter'] ${isLoggedIn ? 'bg-gray-50 text-gray-500 cursor-not-allowed' : ''}`}
                        />
                        {isLoggedIn && (
                          <span className="absolute right-4 top-1/2 -translate-y-1/2 text-[10px] text-green-700 font-semibold font-['Inter'] bg-green-50 px-2 py-0.5 rounded-full">Account</span>
                        )}
                      </div>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="flex flex-col gap-1">
                        <label className="text-zinc-900 text-xs font-medium font-['Inter']">First Name *</label>
                        <input type="text" name="firstName" required value={formData.firstName} onChange={handleInputChange} placeholder="Jane"
                          className="w-full h-12 px-4 bg-white rounded-[10px] border border-gray-200 focus:outline-none focus:border-green-700 text-sm" />
                      </div>
                      <div className="flex flex-col gap-1">
                        <label className="text-zinc-900 text-xs font-medium font-['Inter']">Last Name *</label>
                        <input type="text" name="lastName" required value={formData.lastName} onChange={handleInputChange} placeholder="Doe"
                          className="w-full h-12 px-4 bg-white rounded-[10px] border border-gray-200 focus:outline-none focus:border-green-700 text-sm" />
                      </div>
                    </div>
                    <div className="flex flex-col gap-1">
                      <label className="text-zinc-900 text-xs font-medium font-['Inter']">Phone Number *</label>
                      <input type="tel" name="phone" required value={formData.phone} onChange={handleInputChange} placeholder="+1..."
                        className="w-full h-12 px-4 bg-white rounded-[10px] border border-gray-200 focus:outline-none focus:border-green-700 text-sm" />
                    </div>
                    <div className="flex flex-col gap-1">
                      <label className="text-zinc-900 text-xs font-medium font-['Inter']">Street Address *</label>
                      <AddressAutocomplete
                        id="address"
                        required
                        value={formData.address}
                        onChange={(val) => setFormData(prev => ({ ...prev, address: val }))}
                        onSelect={(parsed: ParsedAddress) => setFormData(prev => ({
                          ...prev,
                          address: parsed.address || prev.address,
                          city:    parsed.city    || prev.city,
                          state:   parsed.state   || prev.state,
                          zipCode: parsed.zipCode || prev.zipCode,
                        }))}
                        placeholder="123 Main St"
                      />
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div className="flex flex-col gap-1">
                        <label className="text-zinc-900 text-xs font-medium font-['Inter']">City *</label>
                        <input type="text" name="city" required value={formData.city} onChange={handleInputChange} placeholder="City"
                          className="w-full h-12 px-4 bg-white rounded-[10px] border border-gray-200 focus:outline-none focus:border-green-700 text-sm" />
                      </div>
                      <div className="flex flex-col gap-1">
                        <label className="text-zinc-900 text-xs font-medium font-['Inter']">State *</label>
                        <input type="text" name="state" required value={formData.state} onChange={handleInputChange} placeholder="State"
                          className="w-full h-12 px-4 bg-white rounded-[10px] border border-gray-200 focus:outline-none focus:border-green-700 text-sm" />
                      </div>
                      <div className="flex flex-col gap-1">
                        <label className="text-zinc-900 text-xs font-medium font-['Inter']">ZIP Code</label>
                        <input type="text" name="zipCode" value={formData.zipCode} onChange={handleInputChange} placeholder="10001"
                          className="w-full h-12 px-4 bg-white rounded-[10px] border border-gray-200 focus:outline-none focus:border-green-700 text-sm" />
                      </div>
                    </div>
                    <div className="flex flex-col gap-1">
                      <label className="text-zinc-900 text-xs font-medium font-['Inter']">Delivery Note</label>
                      <textarea name="note" rows={2} value={formData.note} onChange={handleInputChange}
                        className="w-full px-4 py-3 bg-white rounded-[10px] border border-gray-200 focus:outline-none focus:border-green-700 text-sm resize-none" />
                    </div>

                    {/* Account opt-in — only shown to guests */}
                    {!isLoggedIn && (
                      <label className="flex items-start gap-3 p-4 bg-emerald-50 rounded-xl border border-emerald-100 cursor-pointer group hover:border-green-700 transition-colors">
                        <input
                          type="checkbox"
                          checked={formData.createAccount}
                          onChange={e => setFormData(prev => ({ ...prev, createAccount: e.target.checked }))}
                          className="mt-0.5 w-4 h-4 accent-green-700 shrink-0 cursor-pointer"
                        />
                        <div className="flex flex-col gap-0.5">
                          <span className="text-zinc-900 text-sm font-semibold font-['Inter']">Save my details for faster checkout next time</span>
                          <span className="text-zinc-500 text-xs font-['Inter'] leading-5">
                            We&apos;ll create a free account so you can track this order and reorder easily. You&apos;ll receive an email to set your password.
                          </span>
                        </div>
                      </label>
                    )}
                  </div>
                </div>
              )}

              {/* ── Step 2: Shipping ── */}
              {currentStep === 2 && (
                <div className="flex flex-col gap-6">
                  <h2 className="text-zinc-900 text-xl font-bold font-['Outfit']">Shipping Method</h2>
                  <div className="flex flex-col gap-4">
                    {(Object.entries(SHIPPING_RATES) as [ShippingMethod, typeof SHIPPING_RATES[ShippingMethod]][]).map(([id, rate]) => (
                      <div key={id} onClick={() => setFormData(prev => ({ ...prev, shippingMethod: id }))}
                        className={`p-5 border-2 rounded-xl flex justify-between items-center cursor-pointer transition-all
                          ${formData.shippingMethod === id ? 'border-green-700 bg-green-50' : 'border-gray-100 hover:border-gray-200'}`}>
                        <div className="flex items-center gap-4">
                          <div className={`w-5 h-5 rounded-full border-4 bg-white ${formData.shippingMethod === id ? 'border-green-700' : 'border-gray-300'}`} />
                          <div className="flex flex-col">
                            <span className="font-bold text-gray-900 font-['Inter'] text-base">{rate.label}</span>
                            <span className="text-xs text-gray-500 font-['Inter']">{rate.days}</span>
                          </div>
                        </div>
                        <span className={`font-bold text-lg ${formData.shippingMethod === id ? 'text-green-700' : 'text-gray-700'}`}>
                          ${rate.cost.toFixed(2)} USD
                        </span>
                      </div>
                    ))}
                    <div className="p-4 bg-blue-50 rounded-xl flex items-start gap-3">
                      <Truck className="w-5 h-5 text-blue-600 shrink-0 mt-0.5" />
                      <p className="text-blue-900 text-xs font-['Inter'] leading-5">
                        Rates are based on your delivery address and package weight via <strong>USPS</strong>.
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {/* ── Step 3: Payment ── */}
              {currentStep === 3 && (
                <div className="flex flex-col gap-6">
                  <h2 className="text-zinc-900 text-xl font-bold font-['Outfit']">Payment</h2>

                  {gatewaysLoading && (
                    <div className="flex items-center gap-3 text-zinc-500 text-sm font-['Inter']">
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Loading payment options…
                    </div>
                  )}

                  {/* No gateways enabled — subtle notice, order still goes through */}
                  {!gatewaysLoading && gateways.length === 0 && (
                    <div className="p-4 bg-amber-50 border border-amber-200 rounded-xl flex items-start gap-3">
                      <AlertCircle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
                      <div className="flex flex-col gap-1">
                        <p className="text-amber-900 text-sm font-semibold font-['Inter']">Payment not set up yet</p>
                        <p className="text-amber-800 text-xs font-['Inter'] leading-5">
                          Online payments haven&apos;t been configured on this store. You can still place your order — our team will contact you to arrange payment.
                        </p>
                      </div>
                    </div>
                  )}

                  {/* Gateway selector */}
                  {!gatewaysLoading && gateways.length > 0 && (
                    <div className="flex flex-col gap-3">
                      {gateways.map(gw => (
                        <div key={gw.id}>
                          <div onClick={() => setFormData(prev => ({ ...prev, paymentMethod: gw.id }))}
                            className={`p-5 border-2 rounded-xl flex items-center gap-4 cursor-pointer transition-all
                              ${formData.paymentMethod === gw.id ? 'border-green-700 bg-green-50' : 'border-gray-100 hover:border-gray-200'}`}>
                            <div className={`w-5 h-5 rounded-full border-4 bg-white shrink-0 ${formData.paymentMethod === gw.id ? 'border-green-700' : 'border-gray-300'}`} />
                            <div className={`${formData.paymentMethod === gw.id ? 'text-green-700' : 'text-gray-500'}`}>
                              <GatewayIcon id={gw.id} />
                            </div>
                            <div className="flex flex-col">
                              <span className="font-bold text-gray-900 font-['Inter'] text-base">{gw.title}</span>
                              {gw.description && <span className="text-xs text-gray-500 font-['Inter']">{gw.description}</span>}
                            </div>
                          </div>
                          {formData.paymentMethod === gw.id && <GatewayDetails gateway={gw} />}
                        </div>
                      ))}
                    </div>
                  )}

                  <div className="p-4 bg-green-50 rounded-2xl flex items-center gap-3">
                    <Info className="w-5 h-5 text-green-700 shrink-0" />
                    <p className="text-zinc-900 text-sm font-normal font-['Inter'] leading-5">
                      Your order will be marked as pending until payment is confirmed.
                    </p>
                  </div>
                </div>
              )}

            </form>
          </div>

          {/* Summary sidebar */}
          <div className="w-full lg:w-[400px] px-6 py-8 bg-white rounded-[10px] border border-gray-200 flex flex-col gap-6 h-fit sticky top-24">
            <h2 className="text-zinc-500 text-2xl font-medium font-['Inter']">Summary</h2>

            <div className="w-full flex flex-col gap-4 max-h-[300px] overflow-y-auto">
              {cart.map(item => (
                <div key={item.id} className="w-full flex justify-between items-center gap-4">
                  <div className="flex items-center gap-4">
                    <div className="w-16 h-16 relative bg-stone-50 rounded-2xl overflow-hidden shrink-0">
                      <Image src={item.image || "https://placehold.co/64x64"} alt={item.name} fill className="object-cover" />
                    </div>
                    <div className="flex flex-col gap-1">
                      <h3 className="text-gray-900 text-sm font-bold font-['Outfit'] line-clamp-1">{item.name}</h3>
                      <Link href="/cart" className="text-green-700 text-[10px] font-medium font-['Inter'] border-b border-green-700">Edit selection</Link>
                    </div>
                  </div>
                  <div className="text-green-700 text-xs font-medium shrink-0">{formatPrice(item.price * item.quantity)}</div>
                </div>
              ))}
            </div>

            <div className="w-full flex flex-col gap-6">
              <div className="h-px bg-gray-200" />
              <div className="flex flex-col gap-4">
                <div className="w-full flex justify-between items-start">
                  <span className="text-slate-600 text-sm font-medium font-['Inter']">Sub Total</span>
                  <div className="flex flex-col items-end">
                    <span className="text-slate-600 text-sm font-normal font-['Inter']">{formatPrice(subTotal)}</span>
                    <span className="text-[10px] text-gray-400 uppercase">USD</span>
                  </div>
                </div>
                {currentStep >= 2 && (
                  <div className="w-full flex justify-between items-start">
                    <span className="text-slate-600 text-sm font-medium font-['Inter']">Shipping (USPS)</span>
                    <div className="flex flex-col items-end">
                      <span className="text-slate-600 text-sm font-normal font-['Inter']">{formatPrice(currentShipping)}</span>
                      <span className="text-[10px] text-gray-400 uppercase">USD</span>
                    </div>
                  </div>
                )}
                <div className="w-full flex justify-between items-center">
                  <span className="text-slate-600 text-sm font-medium font-['Inter']">Tax</span>
                  <span className="text-slate-600 text-sm font-normal font-['Inter']">Calculated by WooCommerce</span>
                </div>
              </div>
              <div className="h-px bg-gray-200" />
              <div className="w-full flex justify-between items-center">
                <span className="text-slate-600 text-sm font-medium font-['Space_Grotesk']">Total</span>
                <div className="flex flex-col items-end">
                  <span className="text-slate-800 text-lg font-bold font-['Inter']">
                    {formatPrice(currentStep >= 2 ? total : subTotal)}
                  </span>
                  <span className="text-[10px] text-green-700 font-bold uppercase">USD</span>
                </div>
              </div>
            </div>

            <div className="w-full flex flex-col gap-3">
              <button type="submit" form="checkout-form"
                className="w-full p-4 bg-green-700 rounded-3xl text-white text-base font-medium font-['Inter'] hover:bg-green-600 transition-colors flex items-center justify-center gap-2">
                {currentStep === 3 ? 'Place Order' : `Proceed to ${currentStep === 1 ? 'Shipping' : 'Payment'}`}
              </button>
              {currentStep > 1 && (
                <button type="button" onClick={prevStep}
                  className="w-full p-3 text-gray-500 text-sm font-medium hover:text-green-700 font-['Inter'] transition-colors">
                  Back to {currentStep === 2 ? 'Contact Details' : 'Shipping Method'}
                </button>
              )}
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
