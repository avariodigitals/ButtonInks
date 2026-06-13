"use client";

import React, { useState, useEffect, useRef, Suspense } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useSearchParams, useRouter } from 'next/navigation';
import { ChevronRight, CloudUpload, CheckCircle2, Loader2, FileText, ImageIcon, X, AlertCircle, ShoppingCart, Info } from 'lucide-react';
import { WPProduct } from '@/lib/wordpress';
import { useNotification } from '@/context/NotificationContext';
import { useCart } from '@/context/CartContext';

function UploadContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const productId = searchParams.get('product');
  const { showNotification } = useNotification();
  const { addToCart } = useCart();

  const [product, setProduct] = useState<WPProduct | null>(null);
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [files, setFiles] = useState<File[]>([]);
  const [showReview, setShowReview] = useState(false);
  const [isApproved, setIsApproved] = useState(false);
  const [previewUrls, setPreviewUrls] = useState<string[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (productId) {
      setLoading(true);
      fetch(`/api/products/${productId}`)
        .then(res => res.json())
        .then(data => {
          if (data.error) throw new Error(data.error);
          setProduct(data);
        })
        .catch(err => {
          console.error("Error fetching product:", err);
          showNotification({
            title: 'Error',
            message: 'Failed to load product details.',
            type: 'error'
          });
        })
        .finally(() => setLoading(false));
    }
  }, [productId, showNotification]);

  // Handle preview URLs for the review step
  useEffect(() => {
    const urls = files.filter(f => f.type.includes('image')).map(f => URL.createObjectURL(f));
    setPreviewUrls(urls);
    return () => urls.forEach(url => URL.revokeObjectURL(url));
  }, [files]);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleFiles(Array.from(e.dataTransfer.files));
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      handleFiles(Array.from(e.target.files));
    }
  };

  const handleFiles = (newFiles: File[]) => {
    const validFiles = newFiles.filter(f => f.size <= 50 * 1024 * 1024);
    if (validFiles.length < newFiles.length) {
      showNotification({
        title: 'File Too Large',
        message: 'Some files were skipped because they exceed the 50MB limit.',
        type: 'error'
      });
    }

    setFiles(prev => [...prev, ...validFiles]);
    if (validFiles.length > 0) {
      showNotification({
        title: 'Files Added',
        message: `${validFiles.length} file(s) ready for review.`,
        type: 'success'
      });
    }
  };

  const removeFile = (index: number) => {
    setFiles(prev => prev.filter((_, i) => i !== index));
  };

  const handleConfirmAndProceed = async () => {
    if (!product || files.length === 0) return;
    if (!isApproved) {
      showNotification({
        title: 'Approval Required',
        message: 'Please review and approve your design before adding to cart.',
        type: 'info'
      });
      return;
    }

    setUploading(true);

    try {
      // Upload each file to WP Media
      for (const file of files) {
        const formData = new FormData();
        formData.append('file', file);
        const res = await fetch('/api/upload', { method: 'POST', body: formData });
        if (!res.ok) throw new Error(`Failed to upload ${file.name}`);
      }

      // Add to cart
      addToCart({
        id: product.id,
        name: `${product.name} (Custom Design)`,
        price: parseFloat(product.price || "0"),
        quantity: 1,
        image: product.images[0]?.src || ""
      });

      showNotification({
        title: 'Success',
        message: 'Design uploaded and product added to cart!',
        type: 'success'
      });

      setTimeout(() => {
        router.push('/cart');
      }, 1500);

    } catch (error: any) {
      showNotification({
        title: 'Upload Error',
        message: error.message || 'Something went wrong during the upload process.',
        type: 'error'
      });
    } finally {
      setUploading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center bg-white">
        <Loader2 className="w-12 h-12 text-green-700 animate-spin" />
        <p className="mt-4 text-gray-500 font-medium font-['Inter']">Loading product info...</p>
      </div>
    );
  }

  // ── Review Step ─────────────────────────────────────────────────────────────
  if (showReview) {
    return (
      <main className="w-full min-h-screen bg-white flex flex-col items-center font-['Inter']">
        {/* Breadcrumbs */}
        <div className="self-stretch px-4 md:px-20 py-4 bg-white border-b border-gray-200">
           <div className="max-w-[1280px] mx-auto flex items-center gap-2">
             <button onClick={() => setShowReview(false)} className="text-emerald-500 text-sm font-medium hover:underline">← Back to Upload</button>
           </div>
        </div>

        <div className="w-full max-w-[1440px] flex flex-col lg:flex-row bg-white overflow-hidden flex-1">
          {/* Left: Preview Section */}
          <div className="flex-1 bg-zinc-100 flex flex-col items-center justify-center p-8 min-h-[400px]">
             <div className="relative w-full max-w-[500px] aspect-[4/5] bg-white shadow-2xl rounded-3xl overflow-hidden flex items-center justify-center group border border-gray-200">
                {previewUrls.length > 0 ? (
                  <img src={previewUrls[0]} alt="Preview" className="max-w-full max-h-full object-contain" />
                ) : (
                  <div className="flex flex-col items-center gap-4 text-gray-400">
                    <ImageIcon className="w-16 h-16 opacity-20" />
                    <span className="text-sm font-bold uppercase tracking-widest">No Preview Available</span>
                  </div>
                )}
                {/* Overlay badge */}
                <div className="absolute top-6 left-6 px-4 py-1.5 bg-green-700 text-white text-[10px] font-black rounded-full shadow-xl">PRINT PREVIEW</div>
             </div>
             {previewUrls.length > 1 && (
                <div className="flex gap-2 mt-6">
                  {previewUrls.map((url, i) => (
                    <div key={i} className="w-12 h-12 rounded-lg border-2 border-white shadow-sm overflow-hidden">
                       <img src={url} className="w-full h-full object-cover" />
                    </div>
                  ))}
                </div>
             )}
          </div>

          {/* Right: Review Details */}
          <div className="w-full lg:w-[537px] p-8 md:p-12 bg-white flex flex-col justify-between border-l border-gray-100">
            <div className="flex flex-col gap-8">
              <div className="flex flex-col gap-3">
                <h2 className="text-gray-900 text-2xl md:text-3xl font-bold font-['Outfit'] leading-tight">Review your Design</h2>
                <p className="text-gray-500 text-sm font-medium leading-relaxed">Double-check the following details before you continue.</p>
              </div>

              <div className="flex flex-col gap-4">
                <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-2xl border border-gray-100">
                   <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center text-green-700">
                      <CheckCircle2 className="w-4 h-4" />
                   </div>
                   <div className="flex flex-col">
                      <span className="text-xs font-bold text-gray-900">Resolution</span>
                      <span className="text-[10px] text-gray-500 font-medium">300 DPI — Good</span>
                   </div>
                </div>
                <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-2xl border border-gray-100">
                   <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center text-green-700">
                      <CheckCircle2 className="w-4 h-4" />
                   </div>
                   <div className="flex flex-col">
                      <span className="text-xs font-bold text-gray-900">Color mode</span>
                      <span className="text-[10px] text-gray-500 font-medium">RGB (auto-convert to CMYK)</span>
                   </div>
                </div>
                <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-2xl border border-gray-100">
                   <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center text-green-700">
                      <CheckCircle2 className="w-4 h-4" />
                   </div>
                   <div className="flex flex-col">
                      <span className="text-xs font-bold text-gray-900">Dimensions</span>
                      <span className="text-[10px] text-gray-500 font-medium">Fits designated print area</span>
                   </div>
                </div>
                <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-2xl border border-gray-100">
                   <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center text-blue-700">
                      <Info className="w-4 h-4" />
                   </div>
                   <div className="flex flex-col">
                      <span className="text-xs font-bold text-gray-900">Bleed area</span>
                      <span className="text-[10px] text-gray-500 font-medium">0.125" — extended for safety</span>
                   </div>
                </div>
              </div>
            </div>

            <div className="flex flex-col gap-6 mt-16">
              <label
                className="flex items-center gap-4 cursor-pointer group p-4 bg-gray-50 rounded-2xl border border-transparent hover:border-green-200 transition-all"
                onClick={() => setIsApproved(!isApproved)}
              >
                <div className={`w-6 h-6 rounded-lg border-2 transition-all flex items-center justify-center ${isApproved ? 'bg-green-700 border-green-700 shadow-lg' : 'bg-white border-gray-300'}`}>
                  {isApproved && <CheckCircle2 className="w-4 h-4 text-white" strokeWidth={4} />}
                </div>
                <span className="text-xs font-bold text-gray-600 uppercase tracking-wider">I have reviewed and approve my design.</span>
              </label>

              <button
                disabled={!isApproved || uploading}
                onClick={handleConfirmAndProceed}
                className={`
                  w-full py-5 rounded-2xl font-black uppercase tracking-[0.2em] text-sm transition-all shadow-2xl flex items-center justify-center gap-3
                  ${!isApproved || uploading ? 'bg-gray-100 text-gray-400 cursor-not-allowed shadow-none' : 'bg-green-700 text-white hover:bg-green-800 scale-[1.02]'}
                `}
              >
                {uploading ? <Loader2 className="w-5 h-5 animate-spin" /> : <ShoppingCart className="w-5 h-5" />}
                {uploading ? 'Processing...' : 'Add to cart'}
              </button>
            </div>
          </div>
        </div>
      </main>
    );
  }

  // ── Initial Upload Step ─────────────────────────────────────────────────────
  return (
    <main className="w-full min-h-screen bg-white flex flex-col items-center overflow-hidden font-['Inter']">

      {/* ── Breadcrumbs ── */}
      <section className="self-stretch px-4 md:px-20 py-4 bg-white border-b border-gray-200">
        <div className="max-w-[1280px] mx-auto flex items-center gap-2">
          <Link href="/" className="text-emerald-500 text-sm font-medium hover:underline">Home</Link>
          <ChevronRight className="w-3 h-3 text-gray-400" />
          <Link href="/categories" className="text-emerald-500 text-sm font-medium hover:underline">Shop</Link>
          <ChevronRight className="w-3 h-3 text-gray-400" />
          <span className="text-gray-600 text-sm font-normal truncate max-w-[100px] md:max-w-none">
            {product?.name || 'Classic Tshirt'}
          </span>
          <ChevronRight className="w-3 h-3 text-gray-400" />
          <span className="text-zinc-500 text-sm font-normal">Upload Design</span>
        </div>
      </section>

      {/* ── Title Section ── */}
      <section className="self-stretch px-4 md:px-20 py-8 bg-emerald-50 border-b border-gray-200">
        <div className="max-w-[1280px] mx-auto flex flex-col gap-2">
          <h1 className="text-green-700 text-3xl md:text-4xl font-bold font-['Outfit'] leading-10">Upload Your Design</h1>
          <p className="text-slate-500 text-base md:text-lg font-normal leading-7">Upload your print-ready files. We accept all common formats.</p>
        </div>
      </section>

      {/* ── Main Upload Area ── */}
      <section className="self-stretch px-4 md:px-20 py-10 md:py-20 bg-gray-50 flex flex-col items-center gap-8 md:gap-10 min-h-[600px]">

        <div
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          onClick={() => !uploading && fileInputRef.current?.click()}
          className={`
            w-full max-w-[832px] p-8 md:p-16 bg-white rounded-3xl border-4 border-dashed transition-all cursor-pointer flex flex-col justify-center items-center gap-6 shadow-sm
            ${isDragging ? 'border-green-700 bg-green-50 scale-[0.99]' : 'border-gray-200 hover:border-green-400 hover:shadow-md'}
          `}
        >
          <div className={`w-16 h-16 rounded-full flex items-center justify-center transition-colors ${isDragging ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-400'}`}>
            <CloudUpload className="w-8 h-8" />
          </div>

          <div className="flex flex-col items-center gap-2">
            <h2 className="text-gray-900 text-xl md:text-2xl font-bold text-center tracking-tight">
              {isDragging ? 'Drop to upload' : 'Drag and drop your files here'}
            </h2>
            <p className="text-gray-400 text-sm font-medium uppercase tracking-widest">OR</p>
          </div>

          <div className="px-10 py-4 bg-green-700 hover:bg-green-800 text-white text-base font-bold rounded-2xl shadow-xl shadow-green-900/20 transition-all active:scale-95">
            Browse Files
          </div>

          <input
            type="file"
            ref={fileInputRef}
            className="hidden"
            multiple
            onChange={handleFileChange}
            accept=".png,.jpg,.jpeg,.pdf,.ai,.svg,.psd,.eps"
          />

          <div className="flex flex-col gap-3 w-full border-t border-gray-50 pt-6 text-center">
            <p className="text-gray-500 text-xs md:text-sm font-medium">
              Accepted formats: PNG, JPG, PDF, AI, SVG, PSD, EPS • Max 50MB per file
            </p>
            <div className="flex items-center justify-center gap-2 text-green-700 font-bold text-xs md:text-sm">
               <AlertCircle className="w-4 h-4" />
               <span>300DPI Minimum Resolution • 12x16” Print Area</span>
            </div>
          </div>
        </div>

        {/* ── File List (if any) ── */}
        {files.length > 0 && (
          <div className="w-full max-w-[832px] bg-white rounded-[32px] border border-gray-100 p-6 md:p-10 flex flex-col gap-6 shadow-2xl animate-in fade-in slide-in-from-bottom-8 duration-500">
            <div className="flex items-center justify-between border-b border-gray-50 pb-4">
               <h3 className="text-gray-900 text-lg font-bold flex items-center gap-2 font-['Outfit']">
                 <CheckCircle2 className="w-6 h-6 text-green-600" />
                 Ready for Review ({files.length})
               </h3>
               <button onClick={() => setFiles([])} className="text-xs font-bold text-red-500 hover:underline">Clear All</button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 max-h-[300px] overflow-y-auto no-scrollbar pr-1">
              {files.map((file, index) => (
                <div key={index} className="flex items-center justify-between p-4 bg-gray-50 rounded-2xl border border-gray-100 group">
                  <div className="flex items-center gap-3 overflow-hidden">
                    <div className="w-12 h-12 bg-white rounded-xl flex items-center justify-center text-green-700 border border-gray-200 shrink-0">
                      {file.type.includes('image') ? <ImageIcon className="w-6 h-6" /> : <FileText className="w-6 h-6" />}
                    </div>
                    <div className="flex flex-col overflow-hidden">
                      <span className="text-sm font-bold text-gray-900 truncate">{file.name}</span>
                      <span className="text-[10px] text-gray-500 font-bold uppercase tracking-wider">{(file.size / (1024 * 1024)).toFixed(2)} MB</span>
                    </div>
                  </div>
                  <button
                    onClick={(e) => { e.stopPropagation(); removeFile(index); }}
                    className="p-2 text-gray-400 hover:text-red-500 transition-colors"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
              ))}
            </div>

            <button
              onClick={() => setShowReview(true)}
              className="w-full py-5 rounded-[24px] font-black uppercase tracking-[0.2em] text-xs bg-green-700 text-white hover:bg-green-800 transition-all shadow-2xl active:scale-95"
            >
              Continue to Review Design
            </button>
          </div>
        )}
      </section>
    </main>
  );
}

export default function UploadDesignPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center bg-white">
        <Loader2 className="w-10 h-10 text-green-700 animate-spin" />
      </div>
    }>
      <UploadContent />
    </Suspense>
  );
}
