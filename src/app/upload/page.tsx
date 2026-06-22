"use client";

import React, { useState, useEffect, useRef, Suspense } from 'react';
import Link from 'next/link';
import { useSearchParams, useRouter } from 'next/navigation';
import { ChevronRight, ChevronLeft, CloudUpload, CheckCircle2, Loader2, FileText, ImageIcon, X, AlertCircle, ShoppingCart } from 'lucide-react';
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
          console.error('Error fetching product:', err);
          showNotification({ title: 'Error', message: 'Failed to load product details.', type: 'error' });
        })
        .finally(() => setLoading(false));
    }
  }, [productId, showNotification]);

  useEffect(() => {
    const urls = files.filter(f => f.type.startsWith('image/')).map(f => URL.createObjectURL(f));
    setPreviewUrls(urls);
    return () => urls.forEach(url => URL.revokeObjectURL(url));
  }, [files]);

  const handleDragOver = (e: React.DragEvent) => { e.preventDefault(); setIsDragging(true); };
  const handleDragLeave = () => { setIsDragging(false); };
  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files?.length) handleFiles(Array.from(e.dataTransfer.files));
  };
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files?.length) handleFiles(Array.from(e.target.files));
  };

  const handleFiles = (newFiles: File[]) => {
    // Images only
    const imageFiles = newFiles.filter(f => f.type.startsWith('image/'));
    if (imageFiles.length < newFiles.length) {
      showNotification({ title: 'Images Only', message: 'Only image files (PNG, JPG, WEBP) are accepted.', type: 'error' });
    }

    // Max 50MB
    const sizeOk = imageFiles.filter(f => f.size <= 50 * 1024 * 1024);
    if (sizeOk.length < imageFiles.length) {
      showNotification({ title: 'File Too Large', message: 'Some files exceed the 50MB limit and were skipped.', type: 'error' });
    }

    // Max 2 files (front + back)
    setFiles(prev => {
      const combined = [...prev, ...sizeOk];
      if (combined.length > 2) {
        showNotification({ title: 'Max 2 Files', message: 'Upload 1 image for front and 1 for back.', type: 'error' });
        return combined.slice(0, 2);
      }
      return combined;
    });

    if (sizeOk.length > 0) {
      showNotification({ title: 'Files Added', message: `${sizeOk.length} image${sizeOk.length > 1 ? 's' : ''} ready for review.`, type: 'success' });
    }
  };

  const removeFile = (index: number) => setFiles(prev => prev.filter((_, i) => i !== index));

  const handleConfirmAndProceed = async () => {
    if (!product || files.length === 0) return;
    if (!isApproved) {
      showNotification({ title: 'Approval Required', message: 'Please approve your design before adding to cart.', type: 'info' });
      return;
    }
    setUploading(true);
    try {
      for (const file of files) {
        const formData = new FormData();
        formData.append('file', file);
        const res = await fetch('/api/upload', { method: 'POST', body: formData });
        if (!res.ok) throw new Error(`Failed to upload ${file.name}`);
      }
      addToCart({
        id: product.id,
        name: `${product.name} (Custom Design)`,
        price: parseFloat(product.price || '0'),
        quantity: 1,
        image: product.images[0]?.src || '',
      });
      showNotification({ title: 'Success', message: 'Design uploaded and added to cart!', type: 'success' });
      setTimeout(() => router.push('/cart'), 1500);
    } catch (error: unknown) {
      showNotification({ title: 'Upload Error', message: error instanceof Error ? error.message : 'Something went wrong.', type: 'error' });
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

  // ── Review Step ──────────────────────────────────────────────────────────────
  if (showReview) {
    return (
      <div className="fixed inset-0 z-[9999] bg-[#6b6b6b] flex flex-col overflow-hidden font-['Inter']">

        {/* Fixed back button */}
        <button
          onClick={() => setShowReview(false)}
          className="fixed top-4 left-4 z-50 flex items-center gap-1.5 px-3 py-2 bg-white/90 hover:bg-white text-gray-700 hover:text-gray-900 text-sm font-semibold rounded-lg shadow transition-all"
        >
          <ChevronLeft className="w-4 h-4" />
          <span className="hidden md:inline">Back</span>
        </button>

        <div className="flex flex-1 overflow-hidden">

          {/* Left: canvas — desktop only */}
          <div className="hidden md:flex flex-1 bg-[#c8c8c8] items-center justify-center overflow-hidden gap-6 px-8">
            {previewUrls.length === 0 && (
              <div className="flex flex-col items-center gap-3 text-gray-400">
                <ImageIcon className="w-14 h-14" />
                <span className="text-xs font-bold uppercase tracking-widest">No Preview</span>
              </div>
            )}
            {previewUrls.map((url, i) => (
              <div key={i} className="flex flex-col items-center gap-3">
                <div
                  className="relative bg-white shadow-xl overflow-hidden flex items-center justify-center"
                  style={{ width: previewUrls.length === 2 ? '190px' : '420px', height: previewUrls.length === 2 ? '240px' : '500px' }}
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={url} alt={i === 0 ? 'Front' : 'Back'} className="max-w-full max-h-full object-contain" />
                </div>
                <span className="text-xs font-bold text-white/80 uppercase tracking-widest">{i === 0 ? 'Front' : 'Back'}</span>
              </div>
            ))}
          </div>

          {/* Right panel */}
          <div className="w-full md:w-[380px] bg-white flex flex-col overflow-y-auto">

            {/* Mobile canvas */}
            <div className="md:hidden bg-[#c8c8c8] flex items-center justify-center gap-4 px-4" style={{ height: '260px' }}>
              {previewUrls.length === 0 && (
                <div className="flex flex-col items-center gap-2 text-gray-400">
                  <ImageIcon className="w-10 h-10" />
                  <span className="text-[10px] font-bold uppercase tracking-widest">No Preview</span>
                </div>
              )}
              {previewUrls.map((url, i) => (
                <div key={i} className="flex flex-col items-center gap-2">
                  <div
                    className="bg-white shadow-md overflow-hidden flex items-center justify-center"
                    style={{ width: previewUrls.length === 2 ? '130px' : '200px', height: previewUrls.length === 2 ? '160px' : '220px' }}
                  >
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={url} alt={i === 0 ? 'Front' : 'Back'} className="max-w-full max-h-full object-contain" />
                  </div>
                  <span className="text-[10px] font-bold text-white/80 uppercase tracking-widest">{i === 0 ? 'Front' : 'Back'}</span>
                </div>
              ))}
            </div>

            <div className="flex flex-col flex-1 p-6 md:p-8">

              <div className="mb-5">
                <h1 className="text-lg font-bold text-gray-900">Review your Design</h1>
                <p className="text-gray-500 text-sm mt-0.5">Double-check the following details before you continue.</p>
              </div>

              <ul className="flex flex-col gap-2.5 mb-6">
                {['Text is clear and easy to read', 'Spellings are correct', 'Images are not blurry', 'Correct images are uploaded'].map(item => (
                  <li key={item} className="flex items-center gap-2.5 text-sm text-gray-600">
                    <span className="w-1.5 h-1.5 rounded-full bg-gray-400 shrink-0" />
                    {item}
                  </li>
                ))}
              </ul>

              {files.length > 0 && (
                <div className="mb-6 p-3 bg-gray-50 rounded-lg border border-gray-100">
                  <p className="text-xs font-bold text-gray-500 uppercase tracking-wide mb-2">
                    {files.length} file{files.length > 1 ? 's' : ''} ready
                  </p>
                  {files.map((file, i) => (
                    <p key={i} className="text-xs text-gray-700 truncate">{file.name}</p>
                  ))}
                </div>
              )}

              <div className="flex-1" />

              <label className="flex items-center gap-2.5 cursor-pointer mb-4 select-none" onClick={() => setIsApproved(v => !v)}>
                <div className={`w-4 h-4 border rounded flex items-center justify-center shrink-0 transition-colors ${isApproved ? 'bg-green-600 border-green-600' : 'bg-white border-gray-300'}`}>
                  {isApproved && (
                    <svg className="w-2.5 h-2.5 text-white" viewBox="0 0 12 12" fill="none">
                      <path d="M2 6l3 3 5-5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  )}
                </div>
                <span className="text-sm text-gray-700">I have reviewed and approve my design.</span>
              </label>

              <button
                disabled={!isApproved || uploading}
                onClick={handleConfirmAndProceed}
                className={`w-full py-3.5 rounded-lg font-semibold text-sm transition-all flex items-center justify-center gap-2 mb-2.5 ${isApproved ? 'bg-green-600 hover:bg-green-700 text-white' : 'bg-green-600/40 text-white/70 cursor-not-allowed'}`}
              >
                {uploading ? <Loader2 className="w-4 h-4 animate-spin" /> : <ShoppingCart className="w-4 h-4" />}
                {uploading ? 'Processing...' : 'Add to cart'}
              </button>

              <button onClick={() => setShowReview(false)} className="w-full py-3.5 rounded-lg font-semibold text-sm border border-gray-200 text-gray-700 hover:bg-gray-50 transition-all">
                Continue Editing
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // ── Upload Form ──────────────────────────────────────────────────────────────
  return (
    <main className="w-full min-h-screen bg-white flex flex-col items-center overflow-hidden font-['Inter']">

      {/* Breadcrumbs */}
      <section className="self-stretch px-4 md:px-20 py-4 bg-white border-b border-gray-200">
        <div className="max-w-[1280px] mx-auto flex items-center gap-2 flex-wrap">
          <Link href="/" className="text-emerald-500 text-sm font-medium hover:underline">Home</Link>
          <ChevronRight className="w-3 h-3 text-gray-400" />
          <Link href="/categories" className="text-emerald-500 text-sm font-medium hover:underline">Shop</Link>
          <ChevronRight className="w-3 h-3 text-gray-400" />
          <span className="text-gray-600 text-sm font-normal truncate max-w-[120px] md:max-w-none">{product?.name || 'Product'}</span>
          <ChevronRight className="w-3 h-3 text-gray-400" />
          <span className="text-zinc-500 text-sm font-normal">Upload Design</span>
        </div>
      </section>

      {/* Title */}
      <section className="self-stretch px-4 md:px-20 py-8 bg-emerald-50 border-b border-gray-200">
        <div className="max-w-[1280px] mx-auto flex flex-col gap-2">
          <h1 className="text-green-700 text-3xl md:text-4xl font-bold font-['Outfit'] leading-10">Upload Your Design</h1>
          <p className="text-slate-500 text-base md:text-lg font-normal leading-7">Upload your print-ready files. We accept all common image formats.</p>
        </div>
      </section>

      {/* Drop zone */}
      <section className="self-stretch px-4 md:px-20 py-10 md:py-20 bg-gray-50 flex flex-col items-center gap-8 md:gap-10 min-h-[600px]">
        <div
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          onClick={() => !uploading && fileInputRef.current?.click()}
          className={`w-full max-w-[832px] p-8 md:p-16 bg-white rounded-3xl border-4 border-dashed transition-all cursor-pointer flex flex-col justify-center items-center gap-6 shadow-sm ${isDragging ? 'border-green-700 bg-green-50 scale-[0.99]' : 'border-gray-200 hover:border-green-400 hover:shadow-md'}`}
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
            accept="image/png,image/jpeg,image/jpg,image/webp"
          />

          <div className="flex flex-col gap-3 w-full border-t border-gray-100 pt-6 text-center">
            <p className="text-gray-500 text-xs md:text-sm font-medium">
              Accepted: PNG, JPG, WEBP only — Max 50MB per file
            </p>
            <div className="flex items-center justify-center gap-2 text-green-700 font-bold text-xs md:text-sm">
              <AlertCircle className="w-4 h-4" />
              <span>Max 2 images — 1 for front, 1 for back — 300DPI minimum</span>
            </div>
          </div>
        </div>

        {/* File list */}
        {files.length > 0 && (
          <div className="w-full max-w-[832px] bg-white rounded-[32px] border border-gray-100 p-6 md:p-10 flex flex-col gap-6 shadow-2xl">
            <div className="flex items-center justify-between border-b border-gray-50 pb-4">
              <h3 className="text-gray-900 text-lg font-bold flex items-center gap-2 font-['Outfit']">
                <CheckCircle2 className="w-6 h-6 text-green-600" />
                Ready for Review ({files.length} / 2)
              </h3>
              <button onClick={() => setFiles([])} className="text-xs font-bold text-red-500 hover:underline">Clear All</button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {files.map((file, index) => (
                <div key={index} className="flex items-center justify-between p-4 bg-gray-50 rounded-2xl border border-gray-100">
                  <div className="flex items-center gap-3 overflow-hidden">
                    <div className="w-12 h-12 bg-white rounded-xl flex items-center justify-center text-green-700 border border-gray-200 shrink-0">
                      {file.type.startsWith('image/') ? <ImageIcon className="w-6 h-6" /> : <FileText className="w-6 h-6" />}
                    </div>
                    <div className="flex flex-col overflow-hidden">
                      <span className="text-xs text-gray-400 font-bold uppercase tracking-wide">{index === 0 ? 'Front' : 'Back'}</span>
                      <span className="text-sm font-bold text-gray-900 truncate">{file.name}</span>
                      <span className="text-[10px] text-gray-400">{(file.size / (1024 * 1024)).toFixed(2)} MB</span>
                    </div>
                  </div>
                  <button onClick={(e) => { e.stopPropagation(); removeFile(index); }} className="p-2 text-gray-400 hover:text-red-500 transition-colors">
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
