"use client";

/**
 * SquarePaymentForm
 *
 * Handles all three Square gateway types:
 *   square_credit_card  → card entry form
 *   square_cash_app_pay → Cash App Pay button
 *   gift_cards_pay      → gift card entry form
 *
 * Uses a callback ref so initCard() only fires after the container
 * div is confirmed in the DOM — fixes "element not found" race.
 */
import React, { useEffect, useRef, useState, useCallback } from 'react';
import { Loader2, Lock, CreditCard, Smartphone, Gift } from 'lucide-react';

// ── Square SDK types ──────────────────────────────────────────────────────────
declare global {
  interface Window {
    Square?: {
      payments: (appId: string, locationId: string) => Promise<SquarePayments>;
    };
  }
}

interface SquarePayments {
  card:           (options?: object)                          => Promise<SquareMethod>;
  cashAppPay:     (paymentRequest: SquarePaymentRequest, options?: object) => Promise<SquareMethod>;
  giftCard:       (options?: object)                          => Promise<SquareMethod>;
  paymentRequest: (options: SquarePaymentRequestOptions)      => SquarePaymentRequest;
}

interface SquarePaymentRequestOptions {
  countryCode:  string;
  currencyCode: string;
  total: { amount: string; label: string };
}

// Opaque object returned by payments.paymentRequest()
type SquarePaymentRequest = object;

interface SquareMethod {
  attach:   (element: HTMLElement) => Promise<void>;
  tokenize: () => Promise<SquareTokenResult>;
  destroy:  () => Promise<void>;
}

interface SquareTokenResult {
  status: 'OK' | 'Cancel' | 'Error' | 'Invalid' | 'Unknown' | 'PaymentMethodNotFound';
  token?:  string;
  errors?: { message: string }[];
}

// ── Props ─────────────────────────────────────────────────────────────────────
interface Props {
  gatewayId:    string;   // 'square_credit_card' | 'square_cash_app_pay' | 'gift_cards_pay'
  amountCents:  number;   // total in cents — needed for Cash App Pay request
  currency?:    string;   // default 'USD'
  onToken:      (token: string) => Promise<void>;
  isLoading:    boolean;
  buttonLabel?: string;
}

const APP_ID      = process.env.NEXT_PUBLIC_SQUARE_APP_ID!;
const LOCATION_ID = process.env.NEXT_PUBLIC_SQUARE_LOCATION_ID!;
const SDK_URL     = 'https://web.squarecdn.com/v1/square.js';

// ── Helper: load SDK script once ─────────────────────────────────────────────
function loadSquareSdk(): Promise<void> {
  return new Promise((resolve, reject) => {
    if (window.Square) { resolve(); return; }
    if (document.querySelector(`script[src="${SDK_URL}"]`)) {
      // Already injected — poll until Square is available
      const poll = setInterval(() => {
        if (window.Square) { clearInterval(poll); resolve(); }
      }, 50);
      return;
    }
    const script   = document.createElement('script');
    script.src     = SDK_URL;
    script.async   = true;
    script.onload  = () => resolve();
    script.onerror = () => reject(new Error('Failed to load Square SDK'));
    document.head.appendChild(script);
  });
}

export default function SquarePaymentForm({
  gatewayId,
  amountCents,
  currency = 'USD',
  onToken,
  isLoading,
  buttonLabel = 'Place Order',
}: Props) {
  const methodRef      = useRef<SquareMethod | null>(null);
  const initCalledRef  = useRef(false);
  const [sdkReady,   setSdkReady]   = useState(false);
  const [sdkError,   setSdkError]   = useState('');
  const [tokenizing, setTokenizing] = useState(false);

  const isCashApp  = gatewayId === 'square_cash_app_pay';
  const isGiftCard = gatewayId === 'gift_cards_pay';
  const isCard     = !isCashApp && !isGiftCard;

  // ── Init the right Square method after container mounts ──────────────────
  const initMethod = useCallback(async (container: HTMLElement) => {
    if (initCalledRef.current) return;
    initCalledRef.current = true;
    try {
      await loadSquareSdk();
      if (!window.Square) throw new Error('Square SDK not available');
      const payments = await window.Square.payments(APP_ID, LOCATION_ID);

      let method: SquareMethod;

      if (isCashApp) {
        // Cash App Pay requires a real HTTPS domain — skip on localhost
        const isLocalhost = typeof window !== 'undefined' &&
          (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1');
        if (isLocalhost) {
          setSdkError('Cash App Pay is not available on localhost. It will work on your live site.');
          initCalledRef.current = false;
          return;
        }
        const paymentRequest = payments.paymentRequest({
          countryCode:  'US',
          currencyCode: currency,
          total: {
            amount: (amountCents / 100).toFixed(2),
            label:  'Total',
          },
        });
        method = await payments.cashAppPay(paymentRequest, { redirectURL: window.location.href });
      } else if (isGiftCard) {
        method = await payments.giftCard();
      } else {
        method = await payments.card();
      }

      await method.attach(container);
      methodRef.current = method;
      setSdkReady(true);
    } catch (e: unknown) {
      initCalledRef.current = false;
      const msg = e instanceof Error ? e.message : String(e);
      console.error('Square init error:', msg);
      setSdkError('Could not initialize payment form. Please refresh the page.');
    }
  }, [isCashApp, isGiftCard, amountCents, currency]);

  // ── Callback ref — fires when the container div enters the DOM ───────────
  const setContainerRef = useCallback((node: HTMLElement | null) => {
    if (!node) return;
    initMethod(node);
  }, [initMethod]);

  // ── Cleanup on unmount ────────────────────────────────────────────────────
  useEffect(() => {
    return () => { methodRef.current?.destroy().catch(() => null); };
  }, []);

  // ── Tokenize ──────────────────────────────────────────────────────────────
  const handlePay = async () => {
    if (!methodRef.current || tokenizing || isLoading) return;
    setTokenizing(true);
    setSdkError('');
    try {
      const result = await methodRef.current.tokenize();
      if (result.status === 'OK' && result.token) {
        await onToken(result.token);
      } else {
        setSdkError(result.errors?.[0]?.message ?? 'Could not process payment. Please check your details.');
      }
    } catch (e: unknown) {
      setSdkError(e instanceof Error ? e.message : 'Payment failed.');
    } finally {
      setTokenizing(false);
    }
  };

  const busy = tokenizing || isLoading;

  // ── Labels & icons per gateway ────────────────────────────────────────────
  const headerIcon  = isCashApp ? <Smartphone className="w-4 h-4 text-gray-500" />
                    : isGiftCard ? <Gift       className="w-4 h-4 text-gray-500" />
                    : <CreditCard className="w-4 h-4 text-gray-500" />;
  const headerLabel = isCashApp  ? 'Cash App Pay'
                    : isGiftCard ? 'Gift Card'
                    : 'Card Details';

  return (
    <div className="flex flex-col gap-4">

      <div className="flex flex-col gap-2">
        <div className="flex items-center gap-2 mb-1">
          {headerIcon}
          <span className="text-xs font-semibold text-gray-600 font-['Inter'] uppercase tracking-wider">
            {headerLabel}
          </span>
        </div>

        {!sdkReady && !sdkError && (
          <div className="flex items-center gap-2 text-gray-400 text-sm font-['Inter'] py-2">
            <Loader2 className="w-4 h-4 animate-spin" />
            Loading secure payment form…
          </div>
        )}

        {/* Square SDK mounts into this div.
            Hidden via CSS when there's an error (keeps the ref attached for non-error re-renders). */}
        <div
          ref={setContainerRef}
          className={`rounded-xl border border-gray-200 bg-white p-1 transition-opacity
            ${sdkReady ? 'opacity-100' : sdkError ? 'hidden' : 'opacity-0 h-0 overflow-hidden'}`}
        />
      </div>

      {sdkError && (
        <p className="text-red-600 text-sm font-['Inter'] bg-red-50 border border-red-200 rounded-lg px-4 py-3">
          {sdkError}
        </p>
      )}

      <div className="flex items-center gap-2 text-gray-400 text-xs font-['Inter']">
        <Lock className="w-3 h-3 shrink-0" />
        <span>Payments are processed securely by Square. Your card details never touch our servers.</span>
      </div>

      {/* Pay button — hidden until SDK ready; Cash App Pay uses its own built-in button */}
      {sdkReady && !isCashApp && (
        <button
          type="button"
          disabled={busy}
          onClick={handlePay}
          className="w-full p-4 bg-green-700 rounded-3xl text-white text-base font-medium font-['Inter']
                     hover:bg-green-600 transition-colors flex items-center justify-center gap-2
                     disabled:opacity-60 disabled:cursor-not-allowed"
        >
          {busy
            ? <><Loader2 className="w-4 h-4 animate-spin" /> Processing…</>
            : <><Lock className="w-4 h-4" /> {buttonLabel}</>
          }
        </button>
      )}

      {/* Cash App Pay renders its own button via the SDK — we just tokenize on its callback */}
      {sdkReady && isCashApp && (
        <p className="text-xs text-gray-400 font-['Inter'] text-center">
          Tap the Cash App Pay button above to complete payment.
        </p>
      )}
    </div>
  );
}
