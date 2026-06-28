"use client";

import React, { useState } from 'react';
import Link from "next/link";
import Image from "next/image";
import { useRouter } from 'next/navigation';
import { ChevronRight, Loader2, ShoppingBag, CreditCard, Truck, User, Info } from "lucide-react";
import { useCart } from "@/context/CartContext";
import { useNotification } from "@/context/NotificationContext";

export default function CheckoutPage() {
  const { cart, subTotal, clearCart, isLoading, setIsLoading } = useCart();
  const { showNotification } = useNotification();
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState(1);

  const [formData, setFormData] = useState({
    email: '',
    firstName: '',
    lastName: '',
    phone: '',
    address: '',
    city: '',
    state: '',
    zipCode: '',
    note: '',
    shippingMethod: 'flat_rate',
    paymentMethod: 'bacs',
    // Card Details
    cardName: '',
    cardNumber: '',
    expiry: '',
    cvc: ''
  });

  // Shipping rates — these match what's configured in WooCommerce shipping zones.
  // Update these values if you change the rates in WP Admin → WooCommerce → Settings → Shipping.
  const SHIPPING_RATES = {
    usps_priority: { label: 'USPS Priority Mail®',    days: '1-3 Business Days',  cost: 12.87 },
    usps_ground:   { label: 'USPS Ground Advantage™', days: '2-5 Business Days',  cost:  8.45 },
  } as const;

  type ShippingMethod = keyof typeof SHIPPING_RATES;

  const currentShipping = SHIPPING_RATES[formData.shippingMethod as ShippingMethod]?.cost ?? 0;
  const total = subTotal + currentShipping;

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(price);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const nextStep = () => setCurrentStep(prev => Math.min(prev + 1, 3));
  const prevStep = () => setCurrentStep(prev => Math.max(prev - 1, 1));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (currentStep < 3) {
      nextStep();
      return;
    }

    if (cart.length === 0) return;

    setIsLoading(true);

    const orderData = {
      payment_method: formData.paymentMethod,
      payment_method_title: formData.paymentMethod === 'bacs' ? 'Direct Bank Transfer' : 'Stripe / Card',
      set_paid: false,
      billing: {
        first_name: formData.firstName,
        last_name: formData.lastName,
        address_1: formData.address,
        city: formData.city,
        state: formData.state,
        postcode: formData.zipCode,
        country: 'US',
        email: formData.email,
        phone: formData.phone
      },
      shipping: {
        first_name: formData.firstName,
        last_name: formData.lastName,
        address_1: formData.address,
        city: formData.city,
        state: formData.state,
        postcode: formData.zipCode,
        country: 'US',
        email: formData.email,
        phone: formData.phone
      },
      line_items: cart.map(item => ({
        product_id: item.id,
        quantity: item.quantity
      })),
      customer_note: formData.note,
      shipping_lines: [
        {
          method_id: formData.shippingMethod,
          method_title: SHIPPING_RATES[formData.shippingMethod as ShippingMethod]?.label ?? formData.shippingMethod,
          total: currentShipping.toFixed(2),
        }
      ]
    };

    try {
      const response = await fetch('/api/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(orderData)
      });

      const result = await response.json();

      if (response.ok) {
        clearCart();
        showNotification({
          title: 'Order Successful!',
          message: `Your order #${result.id} has been placed. We'll send you a confirmation email shortly.`,
          type: 'success'
        });
        router.push('/');
      } else {
        throw new Error(result.error || 'Failed to place order');
      }
    } catch (error: any) {
      showNotification({
        title: 'Checkout Failed',
        message: error.message || 'Something went wrong while processing your order. Please try again.',
        type: 'error'
      });
    } finally {
      setIsLoading(false);
    }
  };

  if (cart.length === 0 && !isLoading) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center bg-white px-4">
        <div className="w-20 h-20 bg-emerald-50 rounded-full flex items-center justify-center mb-6">
          <ShoppingBag className="w-10 h-10 text-green-700" />
        </div>
        <h1 className="text-2xl font-bold text-gray-900 mb-2 font-['Outfit']">Your cart is empty</h1>
        <p className="text-gray-500 mb-8 text-center max-w-xs">You need to add some items to your cart before checking out.</p>
        <Link href="/categories" className="px-8 py-3 bg-green-700 text-white rounded-3xl font-medium hover:bg-green-600 transition-colors">
          Return to Shop
        </Link>
      </div>
    );
  }

  return (
    <div className="w-full bg-white flex flex-col items-center overflow-hidden min-h-screen">

      {/* Breadcrumbs */}
      <div className="self-stretch px-4 md:px-20 py-4 bg-white border-b border-gray-200 flex flex-col justify-start items-start">
        <div className="w-full max-w-[1280px] mx-auto flex justify-start items-center gap-2">
          <Link href="/" className="flex justify-center items-center gap-2.5">
            <div className="text-emerald-500 text-sm font-normal font-['Inter'] leading-5">Home</div>
          </Link>
          <div className="w-4 h-4 flex items-center justify-center">
            <ChevronRight className="w-3 h-3 text-gray-400" />
          </div>
          <Link href="/cart" className="flex justify-center items-center gap-2.5">
            <div className="text-emerald-500 text-sm font-normal font-['Inter'] leading-5">Cart</div>
          </Link>
          <div className="w-4 h-4 flex items-center justify-center">
            <ChevronRight className="w-3 h-3 text-gray-400" />
          </div>
          <div className="flex justify-center items-center gap-2.5">
            <div className="text-zinc-500 text-sm font-normal font-['Inter'] leading-5">Checkout</div>
          </div>
        </div>
      </div>

      {/* Header Title */}
      <div className="self-stretch px-4 md:px-20 py-8 bg-emerald-50 border-b border-gray-200 flex flex-col justify-start items-start">
        <div className="w-full max-w-[1280px] mx-auto">
          <h1 className="text-green-700 text-4xl font-bold font-['Outfit'] leading-10">Checkout</h1>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="w-full max-w-[1280px] px-4 md:px-20 py-10 md:py-20 flex flex-col justify-center items-center gap-10">

        {/* Step Indicators */}
        <div className="w-full flex flex-col md:flex-row justify-center items-center gap-6 md:gap-0">
          <div className="flex items-center gap-6">
            <div className="flex flex-col justify-center items-center gap-2.5">
              <div className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-normal font-['Inter'] leading-5 ${currentStep >= 1 ? 'bg-green-700 text-white' : 'bg-zinc-500 text-white'}`}>
                1
              </div>
              <div className={`text-center text-base font-medium font-['Inter'] ${currentStep >= 1 ? 'text-green-700' : 'text-zinc-500'}`}>Contact Details</div>
            </div>
            <div className={`hidden md:block w-16 lg:w-28 h-0 border-t-2 ${currentStep >= 2 ? 'border-green-700' : 'border-zinc-500'}`}></div>
          </div>

          <div className="flex items-center gap-6">
            <div className="flex flex-col justify-center items-center gap-2.5">
              <div className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-normal font-['Inter'] leading-5 ${currentStep >= 2 ? 'bg-green-700 text-white' : 'bg-zinc-500 text-white'}`}>
                2
              </div>
              <div className={`text-center text-base font-medium font-['Inter'] ${currentStep >= 2 ? 'text-green-700' : 'text-zinc-500'}`}>Shipping Method</div>
            </div>
            <div className={`hidden md:block w-16 lg:w-28 h-0 border-t-2 ${currentStep >= 3 ? 'border-green-700' : 'border-zinc-500'}`}></div>
          </div>

          <div className="flex flex-col justify-center items-center gap-2.5">
            <div className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-normal font-['Inter'] leading-5 ${currentStep >= 3 ? 'bg-green-700 text-white' : 'bg-zinc-500 text-white'}`}>
              3
            </div>
            <div className={`text-center text-base font-medium font-['Inter'] ${currentStep >= 3 ? 'text-green-700' : 'text-zinc-500'}`}>Payment</div>
          </div>
        </div>

        {/* Form and Summary Grid */}
        <div className="w-full flex flex-col lg:flex-row justify-center items-start gap-10">

          {/* Left Side: Form Section */}
          <div className="flex-1 w-full p-6 md:p-8 bg-white rounded-2xl border border-gray-200 flex flex-col justify-start items-start gap-6">

            <form id="checkout-form" onSubmit={handleSubmit} className="w-full flex flex-col gap-8">

              {currentStep === 1 && (
                <div className="flex flex-col gap-6">
                  <h2 className="text-zinc-900 text-xl font-bold font-['Outfit'] leading-8">Contact Details</h2>
                  <div className="flex flex-col gap-4">
                    <div className="flex flex-col gap-1">
                      <label className="text-zinc-900 text-xs font-medium font-['Inter'] leading-5">Email Address *</label>
                      <input
                        type="email" name="email" required value={formData.email} onChange={handleInputChange} placeholder="you@company.com"
                        className="w-full h-12 px-4 py-3 bg-white rounded-[10px] border border-gray-200 focus:outline-none focus:border-green-700 text-sm font-['Inter']"
                      />
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="flex flex-col gap-1">
                        <label className="text-zinc-900 text-xs font-medium font-['Inter'] leading-5">First Name *</label>
                        <input type="text" name="firstName" required value={formData.firstName} onChange={handleInputChange} placeholder="Jone" className="w-full h-12 px-4 py-3 bg-white rounded-[10px] border border-gray-200 focus:outline-none focus:border-green-700 text-sm" />
                      </div>
                      <div className="flex flex-col gap-1">
                        <label className="text-zinc-900 text-xs font-medium font-['Inter'] leading-5">Last Name *</label>
                        <input type="text" name="lastName" required value={formData.lastName} onChange={handleInputChange} placeholder="Doe" className="w-full h-12 px-4 py-3 bg-white rounded-[10px] border border-gray-200 focus:outline-none focus:border-green-700 text-sm" />
                      </div>
                    </div>
                    <div className="flex flex-col gap-1">
                      <label className="text-zinc-900 text-xs font-medium font-['Inter'] leading-5">Phone Number *</label>
                      <input type="tel" name="phone" required value={formData.phone} onChange={handleInputChange} placeholder="+1..." className="w-full h-12 px-4 py-3 bg-white rounded-[10px] border border-gray-200 focus:outline-none focus:border-green-700 text-sm" />
                    </div>
                    <div className="flex flex-col gap-1">
                      <label className="text-zinc-900 text-xs font-medium font-['Inter'] leading-5">Street Address *</label>
                      <input type="text" name="address" required value={formData.address} onChange={handleInputChange} placeholder="Address" className="w-full h-12 px-4 py-3 bg-white rounded-[10px] border border-gray-200 focus:outline-none focus:border-green-700 text-sm" />
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div className="flex flex-col gap-1">
                        <label className="text-zinc-900 text-xs font-medium font-['Inter'] leading-5">City *</label>
                        <input type="text" name="city" required value={formData.city} onChange={handleInputChange} placeholder="City" className="w-full h-12 px-4 py-3 bg-white rounded-[10px] border border-gray-200 focus:outline-none focus:border-green-700 text-sm" />
                      </div>
                      <div className="flex flex-col gap-1">
                        <label className="text-zinc-900 text-xs font-medium font-['Inter'] leading-5">State / Region *</label>
                        <input type="text" name="state" required value={formData.state} onChange={handleInputChange} placeholder="State" className="w-full h-12 px-4 py-3 bg-white rounded-[10px] border border-gray-200 focus:outline-none focus:border-green-700 text-sm" />
                      </div>
                      <div className="flex flex-col gap-1">
                        <label className="text-zinc-900 text-xs font-medium font-['Inter'] leading-5">ZIP Code</label>
                        <input type="text" name="zipCode" value={formData.zipCode} onChange={handleInputChange} placeholder="100001" className="w-full h-12 px-4 py-3 bg-white rounded-[10px] border border-gray-200 focus:outline-none focus:border-green-700 text-sm" />
                      </div>
                    </div>
                    <div className="flex flex-col gap-1">
                      <label className="text-zinc-900 text-xs font-medium font-['Inter'] leading-5">Delivery Note</label>
                      <textarea name="note" rows={2} value={formData.note} onChange={handleInputChange} className="w-full px-4 py-3 bg-white rounded-[10px] border border-gray-200 focus:outline-none focus:border-green-700 text-sm resize-none" />
                    </div>
                  </div>
                </div>
              )}

              {currentStep === 2 && (
                <div className="flex flex-col gap-6 w-full">
                  <h2 className="text-zinc-900 text-xl font-bold font-['Outfit'] leading-8">Shipping Method</h2>
                  <div className="flex flex-col gap-4">
                    {(Object.entries(SHIPPING_RATES) as [ShippingMethod, typeof SHIPPING_RATES[ShippingMethod]][]).map(([id, rate]) => (
                      <div
                        key={id}
                        onClick={() => setFormData(prev => ({ ...prev, shippingMethod: id }))}
                        className={`p-5 border-2 rounded-xl flex justify-between items-center cursor-pointer transition-all ${formData.shippingMethod === id ? 'border-green-700 bg-green-50' : 'border-gray-100 hover:border-gray-200'}`}
                      >
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
                      Shipping rates are calculated in real-time by <strong>USPS</strong> based on your delivery address and package weight.
                    </p>
                  </div>
                  </div>
                </div>
              )}

              {currentStep === 3 && (
                <div className="flex flex-col gap-6">
                  <h2 className="text-zinc-900 text-xl font-medium font-['Outfit'] leading-8">Card Details</h2>
                  <div className="flex flex-col gap-4">
                    <div className="flex flex-col gap-1">
                      <label className="text-zinc-900 text-xs font-medium font-['Inter'] leading-5">Cardholder Name *</label>
                      <div className="w-full h-12 px-4 py-3 bg-white rounded-[10px] border border-stone-200 flex items-center overflow-hidden">
                        <input
                          type="text" name="cardName" required value={formData.cardName} onChange={handleInputChange} placeholder="Name on card"
                          className="w-full bg-transparent outline-none text-neutral-950 placeholder:text-neutral-950/50 text-sm font-['Inter']"
                        />
                      </div>
                    </div>
                    <div className="flex flex-col gap-1">
                      <label className="text-zinc-900 text-xs font-medium font-['Inter'] leading-5">Card Number *</label>
                      <div className="w-full h-12 px-4 py-3 bg-white rounded-[10px] border border-stone-200 flex justify-between items-center overflow-hidden">
                        <input
                          type="text" name="cardNumber" required value={formData.cardNumber} onChange={handleInputChange} placeholder="1234 5678 9012 3456"
                          className="w-full bg-transparent outline-none text-neutral-950 placeholder:text-neutral-950/50 text-sm font-['Cousine'] tracking-wide"
                        />
                        <CreditCard className="w-6 h-6 text-neutral-950/50" />
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="flex flex-col gap-1">
                        <label className="text-zinc-900 text-xs font-medium font-['Inter'] leading-5">Expiry *</label>
                        <div className="w-full h-12 px-4 py-3 bg-white rounded-[10px] border border-stone-200 flex items-center overflow-hidden">
                          <input
                            type="text" name="expiry" required value={formData.expiry} onChange={handleInputChange} placeholder="MM / YY"
                            className="w-full bg-transparent outline-none text-neutral-950 placeholder:text-neutral-950/50 text-sm font-['Cousine']"
                          />
                        </div>
                      </div>
                      <div className="flex flex-col gap-1">
                        <label className="text-zinc-900 text-xs font-medium font-['Inter'] leading-5">CVC *</label>
                        <div className="w-full h-12 px-4 py-3 bg-white rounded-[10px] border border-stone-200 flex items-center overflow-hidden">
                          <input
                            type="text" name="cvc" required value={formData.cvc} onChange={handleInputChange} placeholder="123"
                            className="w-full bg-transparent outline-none text-neutral-950 placeholder:text-neutral-950/50 text-sm font-['Cousine']"
                          />
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="w-full p-4 bg-green-50 rounded-2xl flex items-center gap-3">
                    <Info className="w-5 h-5 text-green-700 shrink-0" />
                    <p className="text-zinc-900 text-sm font-normal font-['Inter'] leading-5">
                      Your payment information is encrypted and never stored on our servers.
                    </p>
                  </div>
                </div>
              )}
            </form>
          </div>

          {/* Right Side: Summary Sidebar */}
          <div className="w-full lg:w-[400px] px-6 py-8 bg-white rounded-[10px] border border-gray-200 flex flex-col justify-start items-start gap-6 h-fit sticky top-24">
            <h2 className="text-zinc-500 text-2xl font-medium font-['Inter'] leading-7">Summary</h2>

            <div className="w-full flex flex-col gap-4 max-h-[300px] overflow-y-auto no-scrollbar">
              {cart.map((item) => (
                <div key={item.id} className="w-full flex justify-between items-center gap-4">
                  <div className="flex justify-start items-center gap-4">
                    <div className="w-16 h-16 relative bg-stone-50 rounded-2xl overflow-hidden shrink-0">
                      <Image
                        src={item.image || "https://placehold.co/64x64"}
                        alt={item.name}
                        fill
                        className="object-cover"
                      />
                    </div>
                    <div className="flex flex-col justify-start items-start gap-1">
                      <h3 className="text-gray-900 text-sm font-bold font-['Outfit'] leading-tight line-clamp-1">{item.name}</h3>
                      <Link href="/cart" className="text-green-700 text-[10px] font-medium font-['Inter'] border-b border-green-700">
                        Edit selection
                      </Link>
                    </div>
                  </div>
                  <div className="text-green-700 text-xs font-medium font-['Onest'] shrink-0">{formatPrice(item.price * item.quantity)}</div>
                </div>
              ))}
            </div>

            <div className="w-full flex flex-col gap-6">
              <div className="h-px bg-gray-200" />

              <div className="flex flex-col gap-4">
                <div className="w-full flex justify-between items-start">
                  <span className="text-slate-600 text-sm font-medium font-['Inter'] leading-5">Sub Total</span>
                  <div className="flex flex-col items-end">
                    <span className="text-slate-600 text-sm font-normal font-['Inter'] leading-5">{formatPrice(subTotal)}</span>
                    <span className="text-[10px] text-gray-400 font-medium uppercase">USD</span>
                  </div>
                </div>
                {currentStep >= 2 && (
                  <div className="w-full flex justify-between items-start">
                    <span className="text-slate-600 text-sm font-medium font-['Inter'] leading-5">Shipping (USPS)</span>
                    <div className="flex flex-col items-end">
                      <span className="text-slate-600 text-sm font-normal font-['Inter'] leading-5">{formatPrice(currentShipping)}</span>
                      <span className="text-[10px] text-gray-400 font-medium uppercase">USD</span>
                    </div>
                  </div>
                )}
                <div className="w-full flex justify-between items-center">
                  <span className="text-slate-600 text-sm font-medium font-['Inter'] leading-5">Tax</span>
                  <span className="text-slate-600 text-sm font-normal font-['Inter'] leading-5 text-right">Calculated by WooCommerce</span>
                </div>
              </div>

              <div className="h-px bg-gray-200" />

              <div className="w-full flex justify-between items-center">
                <span className="text-slate-600 text-sm font-medium font-['Space_Grotesk'] leading-5">Total</span>
                <div className="flex flex-col items-end">
                  <span className="text-slate-800 text-lg font-bold font-['Inter'] leading-6">
                    {formatPrice(currentStep >= 2 ? total : subTotal)}
                  </span>
                  <span className="text-[10px] text-green-700 font-bold uppercase">USD</span>
                </div>
              </div>
            </div>

            <div className="w-full flex flex-col gap-3">
              <button
                type="submit"
                form="checkout-form"
                className="w-full p-4 bg-green-700 rounded-3xl text-white text-base font-medium font-['Inter'] hover:bg-green-600 transition-colors flex items-center justify-center gap-2"
              >
                {currentStep === 3 ? 'Complete Purchase' : 'Proceed to ' + (currentStep === 1 ? 'Shipping' : 'Payment')}
              </button>

              {currentStep > 1 && (
                <button
                  type="button"
                  onClick={prevStep}
                  className="w-full p-3 text-gray-500 text-sm font-medium hover:text-green-700 transition-colors font-['Inter']"
                >
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
