import React, { useCallback, useEffect, useRef, useState } from 'react';
import jsQR from 'jsqr';
import {
  Award,
  BadgeCheck,
  Briefcase,
  Camera,
  CameraOff,
  CheckCircle2,
  ExternalLink,
  FileCheck2,
  FileText,
  ImagePlus,
  LogIn,
  Printer,
  QrCode,
  RefreshCw,
  Search,
  ShieldAlert,
  ShieldCheck,
  Sparkles,
  UserPlus,
  XCircle,
} from 'lucide-react';
import {
  CREDENTIALS_REGISTRY,
  resolveVerificationQuery,
  type VerifiedCredentialRecord,
} from '../data/credentialsRegistry';
import { CertificateWebViewModal } from './CertificateWebViewModal';

interface DigitalVerificationProps {
  onNavigateLogin: () => void;
  onNavigateRegister: () => void;
  initialQuery?: string;
  isAuthenticated?: boolean;
}

type VerifyMode = 'scanner' | 'upload' | 'manual';

export const DigitalVerification: React.FC<DigitalVerificationProps> = ({
  onNavigateLogin,
  onNavigateRegister,
  initialQuery = '',
  isAuthenticated = false,
}) => {
  const [mode, setMode] = useState<VerifyMode>(initialQuery ? 'manual' : 'scanner');
  const [searchInput, setSearchInput] = useState(initialQuery);
  const [rawScannedPayload, setRawScannedPayload] = useState(initialQuery);
  const [extractedQuery, setExtractedQuery] = useState('');
  const [results, setResults] = useState<VerifiedCredentialRecord[]>([]);
  const [hasSearched, setHasSearched] = useState(false);
  const [webViewRecord, setWebViewRecord] = useState<VerifiedCredentialRecord | null>(null);
  const [autoPrintWebView, setAutoPrintWebView] = useState(false);

  // Camera Scanner states
  const [isCameraActive, setIsCameraActive] = useState(false);
  const [cameraError, setCameraError] = useState('');
  const [facingMode, setFacingMode] = useState<'environment' | 'user'>('environment');
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const rafRef = useRef<number | null>(null);

  // Image Upload states
  const [uploadError, setUploadError] = useState('');
  const [uploadedPreview, setUploadedPreview] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const runVerification = useCallback((payload: string) => {
    const trimmed = payload.trim();
    if (!trimmed) {
      setHasSearched(false);
      setResults([]);
      setExtractedQuery('');
      return;
    }
    const { extractedQuery: extracted, matches } = resolveVerificationQuery(trimmed);
    setRawScannedPayload(trimmed);
    setExtractedQuery(extracted);
    setResults(matches);
    setHasSearched(true);
  }, []);

  // Auto-verify if URL has ?verify= or ?ref=
  useEffect(() => {
    if (initialQuery.trim()) {
      runVerification(initialQuery);
    }
  }, [initialQuery, runVerification]);

  const stopCamera = useCallback(() => {
    if (rafRef.current !== null) {
      cancelAnimationFrame(rafRef.current);
      rafRef.current = null;
    }
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
    setIsCameraActive(false);
  }, []);

  const scanFrame = useCallback(() => {
    const video = videoRef.current;
    const canvas = canvasRef.current;
    if (!video || !canvas || !streamRef.current) return;

    if (video.readyState === video.HAVE_ENOUGH_DATA && video.videoWidth > 0 && video.videoHeight > 0) {
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      const ctx = canvas.getContext('2d', { willReadFrequently: true });
      if (ctx) {
        ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
        const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
        const code = jsQR(imageData.data, imageData.width, imageData.height, {
          inversionAttempts: 'attemptBoth',
        });
        if (code && code.data) {
          stopCamera();
          setSearchInput(code.data);
          runVerification(code.data);
          return;
        }
      }
    }

    rafRef.current = requestAnimationFrame(scanFrame);
  }, [runVerification, stopCamera]);

  const startCamera = useCallback(
    async (preferredFacing: 'environment' | 'user' = facingMode) => {
      stopCamera();
      setCameraError('');

      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        setCameraError(
          'Camera access is unavailable in this browser or context. Please use Upload QR Image or Manual Reference ID lookup.'
        );
        return;
      }

      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: {
            facingMode: { ideal: preferredFacing },
            width: { ideal: 1280 },
            height: { ideal: 720 },
          },
          audio: false,
        });
        streamRef.current = stream;
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          await videoRef.current.play();
        }
        setIsCameraActive(true);
        rafRef.current = requestAnimationFrame(scanFrame);
      } catch (err) {
        const msg = err instanceof Error ? err.message : 'Unable to access camera';
        setCameraError(
          `Camera access blocked or unavailable (${msg}). Allow camera permission or upload a QR image below.`
        );
        setIsCameraActive(false);
      }
    },
    [facingMode, scanFrame, stopCamera]
  );

  useEffect(() => {
    return () => {
      stopCamera();
    };
  }, [stopCamera]);

  useEffect(() => {
    if (mode !== 'scanner') {
      stopCamera();
    }
  }, [mode, stopCamera]);

  const decodeQrFromImageFile = (file: File) => {
    setUploadError('');
    if (!file.type.startsWith('image/')) {
      setUploadError('Please upload a valid PNG, JPG, or WebP image containing the QR code.');
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      const dataUrl = reader.result as string;
      setUploadedPreview(dataUrl);

      const img = new Image();
      img.onload = () => {
        const tryDecode = (targetWidth: number, targetHeight: number) => {
          const canvas = document.createElement('canvas');
          canvas.width = targetWidth;
          canvas.height = targetHeight;
          const ctx = canvas.getContext('2d', { willReadFrequently: true });
          if (!ctx) return null;
          ctx.drawImage(img, 0, 0, targetWidth, targetHeight);
          const imageData = ctx.getImageData(0, 0, targetWidth, targetHeight);
          return jsQR(imageData.data, imageData.width, imageData.height, {
            inversionAttempts: 'attemptBoth',
          });
        };

        // 1. Try native size (capped safely at 1800px)
        const maxDim = Math.max(img.width, img.height);
        const scale = maxDim > 1800 ? 1800 / maxDim : 1;
        let decoded = tryDecode(Math.round(img.width * scale), Math.round(img.height * scale));

        // 2. Fallback downscale for very dense or blurry screenshots
        if (!decoded && maxDim > 900) {
          const s2 = 900 / maxDim;
          decoded = tryDecode(Math.round(img.width * s2), Math.round(img.height * s2));
        }

        if (decoded && decoded.data) {
          setSearchInput(decoded.data);
          runVerification(decoded.data);
        } else {
          setUploadError(
            'No readable QR code detected in this image. Ensure the QR square is clear and cropped cleanly, or enter the Certificate Reference ID manually.'
          );
        }
      };
      img.onerror = () => {
        setUploadError('Could not load the selected image file.');
      };
      img.src = dataUrl;
    };
    reader.readAsDataURL(file);
  };

  const handleManualSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    runVerification(searchInput);
  };

  const handleReset = () => {
    setSearchInput('');
    setRawScannedPayload('');
    setExtractedQuery('');
    setResults([]);
    setHasSearched(false);
    setUploadedPreview(null);
    setUploadError('');
    setCameraError('');
  };

  const getTypeIcon = (type: VerifiedCredentialRecord['type']) => {
    switch (type) {
      case 'INTERNSHIP_CERTIFICATE':
        return <Award size={18} className="text-sky-600" />;
      case 'EXPERIENCE_CERTIFICATE':
        return <Briefcase size={18} className="text-amber-600" />;
      case 'OFFER_LETTER':
        return <FileText size={18} className="text-emerald-600" />;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-sky-50/50 to-slate-100 text-slate-800 flex flex-col selection:bg-nexora-blue/20">
      {/* Top Public Header Bar */}
      <header className="sticky top-0 z-30 bg-white/85 backdrop-blur-md border-b border-slate-200/80 shadow-xs">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-3 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center space-x-3">
            <img
              src="/gonexora_logo.png"
              alt="Gonexora Techs"
              className="w-10 h-10 object-contain rounded-xl bg-slate-950 p-1 shadow-sm border border-slate-700"
            />
            <div>
              <div className="flex items-center space-x-2">
                <span className="text-sm sm:text-base font-extrabold font-heading text-slate-900 tracking-tight">
                  GONEXORA TECHS
                </span>
                <span className="hidden sm:inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-50 text-amber-700 border border-amber-200">
                  MSME REGISTERED
                </span>
              </div>
              <p className="text-[11px] text-slate-500 font-medium">
                Public Digital Credential Verification Portal
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-2.5">
            {!isAuthenticated && (
              <button
                type="button"
                onClick={onNavigateRegister}
                className="inline-flex items-center space-x-1.5 px-3 py-2 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 text-xs font-semibold transition-all cursor-pointer"
              >
                <UserPlus size={14} />
                <span className="hidden sm:inline">Register Profile</span>
              </button>
            )}
            <button
              type="button"
              onClick={onNavigateLogin}
              className="inline-flex items-center space-x-1.5 px-4 py-2 rounded-xl bg-gradient-to-r from-nexora-blue to-nexora-electric text-white text-xs font-bold shadow-md shadow-nexora-blue/25 hover:shadow-lg hover:scale-[1.01] active:scale-[0.99] transition-all cursor-pointer"
            >
              <LogIn size={14} />
              <span>{isAuthenticated ? 'Return to Workspace' : 'Workspace Login'}</span>
            </button>
          </div>
        </div>
      </header>

      {/* Main Public Verification Section */}
      <main className="flex-1 max-w-5xl w-full mx-auto px-4 sm:px-6 py-8 md:py-10">
        {/* Hero Banner */}
        <div className="text-center mb-8 animate-slide-up">
          <div className="inline-flex items-center space-x-2 px-3.5 py-1.5 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-700 text-[11px] font-bold uppercase tracking-wider mb-3 shadow-xs">
            <ShieldCheck size={14} className="text-emerald-600" />
            <span>Open Verification • No Login Required</span>
          </div>
          <h1 className="text-2xl sm:text-4xl font-extrabold font-heading text-slate-900 tracking-tight">
            Digital Credential Authentication
          </h1>
          <p className="text-xs sm:text-sm text-slate-600 max-w-2xl mx-auto mt-2.5 leading-relaxed">
            Instantly verify the authenticity of Internship Completion Certificates, Work Experience Letters, and Offer Letters issued by{' '}
            <strong className="text-slate-800">Gonexora Techs Private Limited</strong> using our live QR Scanner or Reference ID lookup.
          </p>
        </div>

        {/* Verification Panel Card */}
        <div className="bg-white border border-slate-200/90 rounded-2xl shadow-xl shadow-slate-200/60 overflow-hidden animate-fade-in">
          {/* Mode Switcher Tabs */}
          <div className="grid grid-cols-3 border-b border-slate-200 bg-slate-50/70">
            <button
              type="button"
              onClick={() => setMode('scanner')}
              className={`flex items-center justify-center space-x-2 py-3.5 px-3 text-xs sm:text-sm font-bold border-b-2 transition-all cursor-pointer ${
                mode === 'scanner'
                  ? 'border-nexora-blue text-nexora-blue bg-white'
                  : 'border-transparent text-slate-500 hover:text-slate-800 hover:bg-white/60'
              }`}
            >
              <Camera size={16} />
              <span>Scan QR Camera</span>
            </button>
            <button
              type="button"
              onClick={() => setMode('upload')}
              className={`flex items-center justify-center space-x-2 py-3.5 px-3 text-xs sm:text-sm font-bold border-b-2 transition-all cursor-pointer ${
                mode === 'upload'
                  ? 'border-nexora-blue text-nexora-blue bg-white'
                  : 'border-transparent text-slate-500 hover:text-slate-800 hover:bg-white/60'
              }`}
            >
              <ImagePlus size={16} />
              <span>Upload QR Image</span>
            </button>
            <button
              type="button"
              onClick={() => setMode('manual')}
              className={`flex items-center justify-center space-x-2 py-3.5 px-3 text-xs sm:text-sm font-bold border-b-2 transition-all cursor-pointer ${
                mode === 'manual'
                  ? 'border-nexora-blue text-nexora-blue bg-white'
                  : 'border-transparent text-slate-500 hover:text-slate-800 hover:bg-white/60'
              }`}
            >
              <Search size={16} />
              <span>Ref ID / Name</span>
            </button>
          </div>

          <div className="p-5 sm:p-8">
            {/* MODE 1: LIVE CAMERA QR SCANNER */}
            {mode === 'scanner' && (
              <div className="space-y-4">
                <div className="relative mx-auto max-w-md aspect-[4/3] rounded-2xl overflow-hidden bg-slate-950 border-2 border-slate-800 shadow-inner flex items-center justify-center">
                  <video
                    ref={videoRef}
                    playsInline
                    muted
                    className={`w-full h-full object-cover ${isCameraActive ? 'block' : 'hidden'}`}
                  />
                  <canvas ref={canvasRef} className="hidden" />

                  {isCameraActive ? (
                    <>
                      {/* Optical Reticle */}
                      <div className="absolute inset-0 pointer-events-none flex items-center justify-center">
                        <div className="w-48 h-48 sm:w-56 sm:h-56 relative">
                          <span className="absolute top-0 left-0 w-7 h-7 border-t-4 border-l-4 border-sky-400 rounded-tl-lg" />
                          <span className="absolute top-0 right-0 w-7 h-7 border-t-4 border-r-4 border-sky-400 rounded-tr-lg" />
                          <span className="absolute bottom-0 left-0 w-7 h-7 border-b-4 border-l-4 border-sky-400 rounded-bl-lg" />
                          <span className="absolute bottom-0 right-0 w-7 h-7 border-b-4 border-r-4 border-sky-400 rounded-br-lg" />
                          <div className="absolute inset-x-2 top-1/2 h-0.5 bg-sky-400/80 shadow-[0_0_10px_#38BDF8] animate-pulse" />
                        </div>
                      </div>
                      <div className="absolute bottom-3 left-1/2 -translate-x-1/2 bg-slate-900/85 backdrop-blur-sm text-sky-300 text-[11px] font-semibold px-3 py-1 rounded-full border border-sky-500/30">
                        Point camera at certificate QR code...
                      </div>
                    </>
                  ) : (
                    <div className="p-6 text-center text-slate-300 flex flex-col items-center space-y-3">
                      <div className="w-14 h-14 rounded-2xl bg-slate-900 border border-slate-700 flex items-center justify-center text-sky-400">
                        <QrCode size={28} />
                      </div>
                      <div>
                        <p className="text-sm font-bold text-white">Camera QR Scanner Ready</p>
                        <p className="text-xs text-slate-400 mt-1 max-w-xs">
                          Activate your camera to scan the verification QR square printed on any Gonexora certificate.
                        </p>
                      </div>
                      <button
                        type="button"
                        onClick={() => startCamera(facingMode)}
                        className="inline-flex items-center space-x-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-nexora-blue to-nexora-electric text-white text-xs font-bold shadow-lg shadow-nexora-blue/30 hover:scale-[1.02] transition-all cursor-pointer"
                      >
                        <Camera size={15} />
                        <span>Start QR Camera Scanner</span>
                      </button>
                    </div>
                  )}
                </div>

                {isCameraActive && (
                  <div className="flex flex-wrap items-center justify-center gap-2.5">
                    <button
                      type="button"
                      onClick={() => {
                        const next = facingMode === 'environment' ? 'user' : 'environment';
                        setFacingMode(next);
                        startCamera(next);
                      }}
                      className="inline-flex items-center space-x-1.5 px-3.5 py-2 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-xs font-semibold text-slate-700 cursor-pointer"
                    >
                      <RefreshCw size={13} />
                      <span>Switch Camera</span>
                    </button>
                    <button
                      type="button"
                      onClick={stopCamera}
                      className="inline-flex items-center space-x-1.5 px-3.5 py-2 rounded-xl border border-red-200 bg-red-50 hover:bg-red-100 text-xs font-semibold text-red-700 cursor-pointer"
                    >
                      <CameraOff size={13} />
                      <span>Stop Camera</span>
                    </button>
                  </div>
                )}

                {cameraError && (
                  <div className="max-w-lg mx-auto p-3.5 rounded-xl bg-amber-50 border border-amber-200 text-amber-800 text-xs font-medium flex items-start space-x-2.5">
                    <ShieldAlert size={16} className="shrink-0 text-amber-600 mt-0.5" />
                    <span>{cameraError}</span>
                  </div>
                )}
              </div>
            )}

            {/* MODE 2: UPLOAD QR IMAGE */}
            {mode === 'upload' && (
              <div className="space-y-4">
                <div
                  onDragOver={(e) => {
                    e.preventDefault();
                    setIsDragging(true);
                  }}
                  onDragLeave={() => setIsDragging(false)}
                  onDrop={(e) => {
                    e.preventDefault();
                    setIsDragging(false);
                    const file = e.dataTransfer.files?.[0];
                    if (file) decodeQrFromImageFile(file);
                  }}
                  onClick={() => fileInputRef.current?.click()}
                  className={`border-2 border-dashed rounded-2xl p-8 text-center transition-all cursor-pointer ${
                    isDragging
                      ? 'border-nexora-blue bg-sky-50/70'
                      : 'border-slate-300 bg-slate-50/60 hover:border-nexora-blue/60 hover:bg-sky-50/30'
                  }`}
                >
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/png,image/jpeg,image/webp,image/gif"
                    className="hidden"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) decodeQrFromImageFile(file);
                    }}
                  />
                  <div className="w-12 h-12 mx-auto rounded-2xl bg-sky-100 text-nexora-blue flex items-center justify-center mb-3">
                    <ImagePlus size={24} />
                  </div>
                  <p className="text-sm font-bold text-slate-800">
                    Drop a QR Code Image or Certificate Screenshot here
                  </p>
                  <p className="text-xs text-slate-500 mt-1">
                    Supports PNG, JPG, WebP — decoded locally in your browser
                  </p>
                  <span className="inline-block mt-3 px-4 py-1.5 rounded-lg bg-white border border-slate-200 text-xs font-bold text-nexora-blue shadow-xs">
                    Browse Image File
                  </span>
                </div>

                {uploadedPreview && (
                  <div className="flex items-center justify-center">
                    <img
                      src={uploadedPreview}
                      alt="Uploaded QR preview"
                      className="max-h-36 rounded-xl border border-slate-200 shadow-sm"
                    />
                  </div>
                )}

                {uploadError && (
                  <div className="p-3.5 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs font-semibold flex items-start space-x-2">
                    <XCircle size={16} className="shrink-0 text-red-500 mt-0.5" />
                    <span>{uploadError}</span>
                  </div>
                )}
              </div>
            )}

            {/* MODE 3: MANUAL REF ID / CANDIDATE SEARCH */}
            {mode === 'manual' && (
              <div className="space-y-4">
                <form onSubmit={handleManualSubmit} className="flex flex-col sm:flex-row gap-2.5">
                  <div className="relative flex-1">
                    <Search
                      size={16}
                      className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none"
                    />
                    <input
                      type="text"
                      value={searchInput}
                      onChange={(e) => setSearchInput(e.target.value)}
                      placeholder="Enter Certificate Ref ID (e.g. GT/INT/2026/FSD-092) or Candidate Name"
                      className="w-full pl-10 pr-4 py-3 text-xs sm:text-sm rounded-xl border border-slate-200 bg-slate-50/70 text-slate-900 placeholder:text-slate-400 focus:bg-white focus:ring-2 focus:ring-nexora-blue/20 focus:border-nexora-blue focus:outline-none transition-all"
                    />
                  </div>
                  <button
                    type="submit"
                    className="px-6 py-3 rounded-xl bg-gradient-to-r from-nexora-blue to-nexora-electric text-white text-xs sm:text-sm font-bold shadow-md shadow-nexora-blue/25 hover:shadow-lg transition-all cursor-pointer shrink-0"
                  >
                    Verify Credential
                  </button>
                </form>

                <div className="flex flex-wrap items-center gap-2 pt-1">
                  <span className="text-[11px] font-semibold text-slate-500">Quick Verify Examples:</span>
                  {[
                    'GT/INT/2026/FSD-092',
                    'GT/EXP/2026/DA-055',
                    'GT/INT/2026/019',
                    'GT/INT/2026/021',
                    'NEX-EXP-2026-AK8921',
                  ].map((sampleRef) => (
                    <button
                      key={sampleRef}
                      type="button"
                      onClick={() => {
                        setSearchInput(sampleRef);
                        runVerification(sampleRef);
                      }}
                      className="px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-sky-50 border border-slate-200 hover:border-sky-300 text-[11px] font-mono font-semibold text-slate-700 hover:text-nexora-blue transition-colors cursor-pointer"
                    >
                      {sampleRef}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* VERIFICATION RESULTS AREA */}
            {hasSearched && (
              <div className="mt-7 pt-6 border-t border-slate-200 animate-slide-up">
                <div className="flex flex-wrap items-center justify-between gap-2 mb-4">
                  <div className="text-xs text-slate-500">
                    Query inspected:{' '}
                    <code className="px-2 py-0.5 rounded bg-slate-100 text-slate-800 font-mono font-semibold">
                      {extractedQuery || rawScannedPayload}
                    </code>
                  </div>
                  <button
                    type="button"
                    onClick={handleReset}
                    className="text-xs font-bold text-nexora-blue hover:underline cursor-pointer"
                  >
                    Clear / Verify Another
                  </button>
                </div>

                {results.length > 0 ? (
                  <div className="space-y-4">
                    <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 flex items-center space-x-3">
                      <CheckCircle2 size={22} className="text-emerald-600 shrink-0" />
                      <div>
                        <p className="text-xs sm:text-sm font-extrabold text-emerald-900">
                          OFFICIALLY VERIFIED AUTHENTIC • {results.length}{' '}
                          {results.length === 1 ? 'CREDENTIAL RECORD' : 'CREDENTIAL RECORDS'} FOUND
                        </p>
                        <p className="text-[11px] text-emerald-700">
                          Cryptographically matched against the official Gonexora Techs Private Limited MSME Registry.
                        </p>
                      </div>
                    </div>

                    {results.map((rec) => (
                      <div
                        key={`${rec.refId}-${rec.candidateName}`}
                        className="rounded-2xl border border-slate-200 bg-gradient-to-br from-white to-slate-50/70 p-5 shadow-sm"
                      >
                        <div className="flex flex-wrap items-start justify-between gap-3 pb-4 border-b border-slate-100">
                          <div className="flex items-center space-x-3">
                            <div className="w-10 h-10 rounded-xl bg-sky-50 border border-sky-200 flex items-center justify-center">
                              {getTypeIcon(rec.type)}
                            </div>
                            <div>
                              <div className="flex flex-wrap items-center gap-2">
                                <span className="text-xs font-extrabold uppercase tracking-wider text-nexora-blue">
                                  {rec.typeLabel}
                                </span>
                                <span className="inline-flex items-center space-x-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800">
                                  <BadgeCheck size={12} />
                                  <span>VERIFIED GENUINE</span>
                                </span>
                              </div>
                              <h3 className="text-lg font-extrabold text-slate-900 mt-0.5">
                                {rec.candidateName}
                              </h3>
                            </div>
                          </div>

                          <div className="text-left sm:text-right">
                            <span className="block text-[10px] font-bold uppercase tracking-wider text-slate-400">
                              Reference Number
                            </span>
                            <span className="inline-block mt-0.5 px-2.5 py-1 rounded-lg bg-slate-900 text-amber-300 font-mono text-xs font-bold">
                              {rec.refId}
                            </span>
                          </div>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 py-4 text-xs">
                          <div>
                            <span className="text-slate-400 font-semibold block uppercase text-[10px]">
                              Appointed Domain / Role
                            </span>
                            <span className="font-bold text-slate-800">
                              {rec.domain} ({rec.designation})
                            </span>
                          </div>
                          <div>
                            <span className="text-slate-400 font-semibold block uppercase text-[10px]">
                              Tenure Period & Duration
                            </span>
                            <span className="font-bold text-slate-800">
                              {rec.tenurePeriod} ({rec.duration})
                            </span>
                          </div>
                          <div>
                            <span className="text-slate-400 font-semibold block uppercase text-[10px]">
                              Date of Issuance & Rating
                            </span>
                            <span className="font-bold text-slate-800">
                              {rec.issueDate} • <span className="text-emerald-700">{rec.rating}</span>
                            </span>
                          </div>
                          {rec.regNo && (
                            <div>
                              <span className="text-slate-400 font-semibold block uppercase text-[10px]">
                                Academic Reg. No.
                              </span>
                              <span className="font-mono font-bold text-slate-800">{rec.regNo}</span>
                            </div>
                          )}
                          <div className="sm:col-span-2">
                            <span className="text-slate-400 font-semibold block uppercase text-[10px]">
                              Issuing Authority & Signatory
                            </span>
                            <span className="font-semibold text-slate-700">{rec.signatory}</span>
                          </div>
                        </div>

                        <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-slate-100">
                          <span className="text-[11px] font-semibold text-slate-500 flex items-center space-x-1.5">
                            <FileCheck2 size={14} className="text-emerald-600" />
                            <span>{rec.organization}</span>
                          </span>

                          <div className="flex flex-wrap items-center gap-2">
                            <button
                              type="button"
                              onClick={() => {
                                setAutoPrintWebView(false);
                                setWebViewRecord(rec);
                              }}
                              className="inline-flex items-center space-x-1.5 px-3.5 py-1.5 rounded-lg bg-nexora-blue hover:bg-nexora-blue/90 text-white text-xs font-bold shadow-xs transition-colors cursor-pointer"
                            >
                              <ExternalLink size={13} />
                              <span>Open Web View</span>
                            </button>
                            <button
                              type="button"
                              onClick={() => {
                                setAutoPrintWebView(true);
                                setWebViewRecord(rec);
                              }}
                              className="inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 text-xs font-bold transition-colors cursor-pointer"
                            >
                              <Printer size={13} />
                              <span>Print / Save PDF</span>
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="p-5 rounded-xl bg-red-50 border border-red-200 flex items-start space-x-3">
                    <XCircle size={22} className="text-red-500 shrink-0 mt-0.5" />
                    <div>
                      <p className="text-sm font-extrabold text-red-900">
                        Credential Record Not Found
                      </p>
                      <p className="text-xs text-red-700 mt-1 leading-relaxed">
                        No official Gonexora Techs record matched{' '}
                        <strong>"{extractedQuery || rawScannedPayload}"</strong>. Please verify the exact Reference ID printed at the bottom-left of the certificate (e.g., <code className="font-mono">GT/INT/2026/FSD-092</code>) or contact HR verification support at{' '}
                        <a href="mailto:contactnexoratechs@gmail.com" className="underline font-bold">
                          contactnexoratechs@gmail.com
                        </a>
                        .
                      </p>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Bottom Workspace Callout Strip (Move to Login Page) */}
        <div className="mt-8 rounded-2xl bg-slate-900 text-white p-5 sm:p-6 flex flex-col sm:flex-row items-center justify-between gap-4 shadow-lg border border-slate-800">
          <div className="flex items-center space-x-3.5">
            <img
              src="/msme_logo.png"
              alt="MSME Logo"
              className="w-11 h-11 object-contain rounded-xl bg-white p-1 shrink-0"
            />
            <div>
              <div className="flex items-center space-x-1.5 text-amber-300 text-[11px] font-bold uppercase tracking-wider">
                <Sparkles size={13} />
                <span>Registry Coverage: {CREDENTIALS_REGISTRY.length} Active Records</span>
              </div>
              <p className="text-sm font-bold text-white mt-0.5">
                Are you an intern, employee, or administrator at Gonexora Techs?
              </p>
              <p className="text-xs text-slate-400">
                Proceed to the workspace login portal to access meetings, recordings, tickets, and dashboards.
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onNavigateLogin}
            className="w-full sm:w-auto inline-flex items-center justify-center space-x-2 px-5 py-3 rounded-xl bg-gradient-to-r from-nexora-blue to-nexora-electric text-white text-xs font-bold shadow-md hover:scale-[1.02] transition-all cursor-pointer shrink-0"
          >
            <LogIn size={15} />
            <span>{isAuthenticated ? 'Return to Workspace' : 'Proceed to Login Page'}</span>
          </button>
        </div>
      </main>

      <CertificateWebViewModal
        record={webViewRecord}
        autoPrint={autoPrintWebView}
        onClose={() => {
          setWebViewRecord(null);
          setAutoPrintWebView(false);
        }}
      />
    </div>
  );
};
