import React, { useEffect, useState } from 'react';
import QRCode from 'qrcode';
import {
  BadgeCheck,
  CheckCircle2,
  Printer,
  Share2,
  ShieldCheck,
  X,
} from 'lucide-react';
import type { VerifiedCredentialRecord } from '../data/credentialsRegistry';

interface CertificateWebViewModalProps {
  record: VerifiedCredentialRecord | null;
  onClose: () => void;
  autoPrint?: boolean;
}

export const CertificateWebViewModal: React.FC<CertificateWebViewModalProps> = ({
  record,
  onClose,
  autoPrint = false,
}) => {
  const [qrDataUrl, setQrDataUrl] = useState<string>('');
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (!record) return;
    const verifyUrl = `https://connect.nexoratechs.xyz/?verify=${encodeURIComponent(record.refId)}`;
    QRCode.toDataURL(verifyUrl, {
      width: 240,
      margin: 1,
      color: {
        dark: '#0B132B',
        light: '#FFFFFF',
      },
    })
      .then((url) => setQrDataUrl(url))
      .catch(() => setQrDataUrl(''));
  }, [record]);

  useEffect(() => {
    if (!record || !autoPrint) return;
    const timer = window.setTimeout(() => {
      window.print();
    }, 350);
    return () => window.clearTimeout(timer);
  }, [record, autoPrint, qrDataUrl]);

  if (!record) return null;

  const isExperience = record.type === 'EXPERIENCE_CERTIFICATE';
  const isOffer = record.type === 'OFFER_LETTER';

  const handleShareLink = async () => {
    const shareUrl = `${window.location.origin}/?verify=${encodeURIComponent(record.refId)}`;
    try {
      await navigator.clipboard.writeText(shareUrl);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 2500);
    } catch {
      // Clipboard blocked in restricted contexts
    }
  };

  return (
    <div
      id="certificate-webview-overlay"
      className="fixed inset-0 z-50 bg-slate-950/85 backdrop-blur-md overflow-y-auto p-3 sm:p-6 flex flex-col items-center animate-fade-in"
      role="dialog"
      aria-modal="true"
      aria-label={`${record.typeLabel} — ${record.candidateName}`}
    >
      {/* Top Action Toolbar (Hidden when printing) */}
      <div className="print-hide w-full max-w-4xl bg-slate-900/95 border border-sky-500/30 rounded-2xl px-4 sm:px-6 py-3 mb-4 flex flex-wrap items-center justify-between gap-3 text-white shadow-xl">
        <div className="flex items-center space-x-3">
          <div className="p-2 rounded-xl bg-sky-500/15 border border-sky-400/30 text-sky-300">
            <ShieldCheck size={18} />
          </div>
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-sm font-extrabold tracking-tight">
                {record.typeLabel}
              </span>
              <span className="inline-flex items-center space-x-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/20 border border-emerald-400/50 text-emerald-300">
                <CheckCircle2 size={11} />
                <span>VERIFIED GENUINE</span>
              </span>
            </div>
            <p className="text-[11px] text-slate-400 font-mono">
              Ref: {record.refId} • {record.candidateName}
            </p>
          </div>
        </div>

        <div className="flex items-center space-x-2">
          <button
            type="button"
            onClick={handleShareLink}
            className="inline-flex items-center space-x-1.5 px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-xs font-semibold text-slate-200 transition-colors cursor-pointer"
          >
            <Share2 size={13} />
            <span>{copied ? 'Link Copied!' : 'Copy Verify Link'}</span>
          </button>
          <button
            type="button"
            onClick={() => window.print()}
            className="inline-flex items-center space-x-1.5 px-3.5 py-2 rounded-xl bg-gradient-to-r from-nexora-blue to-nexora-electric text-white text-xs font-bold shadow-md hover:opacity-95 transition-opacity cursor-pointer"
          >
            <Printer size={14} />
            <span>Print / Save PDF</span>
          </button>
          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors cursor-pointer"
            aria-label="Close certificate web view"
          >
            <X size={18} />
          </button>
        </div>
      </div>

      {/* Certificate Sheet */}
      <div
        id="certificate-print-sheet"
        className="w-full max-w-4xl bg-white text-slate-900 rounded-md shadow-2xl border-4 border-[#0B132B] p-6 sm:p-10 relative overflow-hidden"
        style={{ outline: '2px solid #C5A059', outlineOffset: '-9px' }}
      >
        {/* Corner Filigree Accents */}
        <div className="pointer-events-none absolute top-3 left-3 w-8 h-8 border-t-[3px] border-l-[3px] border-[#C5A059]" />
        <div className="pointer-events-none absolute top-3 right-3 w-8 h-8 border-t-[3px] border-r-[3px] border-[#C5A059]" />
        <div className="pointer-events-none absolute bottom-3 left-3 w-8 h-8 border-b-[3px] border-l-[3px] border-[#C5A059]" />
        <div className="pointer-events-none absolute bottom-3 right-3 w-8 h-8 border-b-[3px] border-r-[3px] border-[#C5A059]" />

        {/* Subtle Center Watermark */}
        <img
          src="/gonexora_logo.png"
          alt=""
          aria-hidden="true"
          className="pointer-events-none select-none absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-72 sm:w-88 opacity-[0.04] grayscale"
        />

        <div className="relative z-10 flex flex-col justify-between space-y-6">
          {/* Header Crest */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pb-4 border-b-2 border-slate-200">
            <div className="flex items-center space-x-3">
              <img
                src="/gonexora_logo.png"
                alt="Gonexora Techs Crest"
                className="w-14 h-14 object-contain rounded-xl bg-slate-950 p-1.5"
              />
              <div className="text-[11px] text-slate-600 leading-snug text-left">
                <div>
                  <strong className="text-slate-900">Ref:</strong>{' '}
                  <span className="font-mono font-bold text-[#0284C7]">{record.refId}</span>
                </div>
                <div className="text-emerald-700 font-bold">Status: Verified Authentic</div>
              </div>
            </div>

            <div className="text-center flex-1">
              <h2 className="text-base sm:text-lg font-extrabold tracking-wide text-[#0B132B]">
                GONEXORA TECHS PRIVATE LIMITED
              </h2>
              <p className="text-[10px] font-extrabold tracking-widest text-amber-600 uppercase">
                ★ MSME REGISTERED ENTERPRISE • GOVT. OF INDIA ★
              </p>
              <p className="text-[11px] font-bold text-[#0284C7]">
                Building Tomorrow, Today • Connect • Build • Empower
              </p>
              <p className="text-[10px] text-slate-500">
                Corporate Operations: Tamil Nadu, India • Portal: connect.nexoratechs.xyz
              </p>
            </div>

            <div className="flex items-center space-x-3">
              <div className="text-[11px] text-slate-600 text-right leading-snug">
                <div>
                  <strong className="text-slate-900">Issued:</strong> {record.issueDate}
                </div>
                <div>
                  <strong className="text-slate-900">Portal:</strong> nexoratechs.xyz
                </div>
              </div>
              <img
                src="/msme_logo.png"
                alt="MSME Logo"
                className="w-14 h-14 object-contain"
              />
            </div>
          </div>

          {/* Document Title */}
          <div className="text-center space-y-1.5 py-1">
            <span className="inline-block px-4 py-1 rounded-full bg-amber-100 border border-amber-400 text-amber-900 text-[10px] font-extrabold uppercase tracking-[0.2em]">
              {isExperience
                ? '★ OFFICIAL WORK EXPERIENCE CERTIFICATE & RELIEVING LETTER ★'
                : isOffer
                ? '★ OFFICIAL INTERNSHIP APPOINTMENT & OFFER LETTER ★'
                : '★ OFFICIAL CERTIFICATE OF COMPLETION ★'}
            </span>
            <h1 className="text-xl sm:text-3xl font-extrabold text-[#0B132B] tracking-wide uppercase">
              {isExperience
                ? 'EXPERIENCE CERTIFICATE & RELIEVING LETTER'
                : isOffer
                ? 'INTERNSHIP OFFER LETTER'
                : 'CERTIFICATE OF INTERNSHIP COMPLETION'}
            </h1>
            <p className="text-xs sm:text-sm italic text-slate-500 font-medium">
              {isExperience ? '— TO WHOMSOEVER IT MAY CONCERN —' : 'This is to proudly certify that'}
            </p>
          </div>

          {/* Recipient Banner */}
          <div className="text-center">
            <div className="inline-block pb-1.5 border-b-[3px] border-[#0284C7]">
              <span className="text-2xl sm:text-4xl font-extrabold text-[#0284C7] tracking-wide uppercase">
                {record.candidateName}
              </span>
            </div>
            {(record.candidateEmail || record.regNo) && (
              <p className="text-[11px] text-slate-500 mt-1.5 font-medium">
                {record.candidateEmail && <span>Email: {record.candidateEmail}</span>}
                {record.candidateEmail && record.regNo && <span> • </span>}
                {record.regNo && <span>Reg. No: {record.regNo}</span>}
              </p>
            )}
          </div>

          {/* Narrative Body */}
          {isExperience ? (
            <div className="text-xs sm:text-sm text-slate-700 leading-relaxed space-y-3 text-justify max-w-3xl mx-auto">
              <p>
                This is to formally certify that <strong>{record.candidateName}</strong>
                {record.candidateEmail ? ` (${record.candidateEmail})` : ''} worked with{' '}
                <strong>Gonexora Techs Private Limited</strong> as a{' '}
                <strong className="text-[#0284C7]">{record.designation}</strong> in the{' '}
                <strong>{record.domain}</strong> division for an official tenure of{' '}
                <strong>{record.duration}</strong>, effective{' '}
                <strong>{record.tenurePeriod}</strong>.
              </p>
              <p>
                During this association, <strong>{record.candidateName}</strong> demonstrated strong
                technical competence, reliable project execution, collaborative teamwork, and exemplary
                professional conduct across assigned deliverables.
              </p>
              <p>
                <strong>{record.candidateName}</strong> has been officially relieved from duties upon
                the successful completion of the appointed tenure with all project handovers and
                documentation discharged satisfactorily. We wish them continued excellence and success
                in all future endeavors.
              </p>
            </div>
          ) : isOffer ? (
            <div className="text-xs sm:text-sm text-slate-700 leading-relaxed space-y-3 text-center max-w-3xl mx-auto">
              <p>
                has been formally selected and appointed for a{' '}
                <strong>{record.duration} Professional Internship</strong> in{' '}
                <strong className="text-[#0284C7]">{record.domain}</strong> as{' '}
                <strong>{record.designation}</strong> with{' '}
                <strong>Gonexora Techs Private Limited</strong> for the tenure{' '}
                <strong>{record.tenurePeriod}</strong>.
              </p>
            </div>
          ) : (
            <div className="text-xs sm:text-sm text-slate-700 leading-relaxed space-y-3 text-center max-w-3xl mx-auto">
              <p>
                has successfully and meritoriously completed an intensive{' '}
                <strong>{record.duration} Professional Internship</strong> in{' '}
                <strong className="text-[#0284C7]">{record.domain}</strong> with{' '}
                <strong>Gonexora Techs Private Limited</strong> for the period{' '}
                <strong>{record.tenurePeriod}</strong>.
              </p>
              <p className="text-xs text-slate-500 leading-relaxed">
                Throughout the program, {record.candidateName} exhibited commendable technical
                proficiency, analytical problem-solving, commitment to project milestones, and
                exemplary professional ethics.
              </p>
            </div>
          )}

          {/* 4-Pillar Summary Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-slate-50 border border-slate-300 border-l-4 border-l-[#0284C7] rounded-lg p-3.5 text-center">
            <div>
              <span className="block text-[9.5px] font-bold uppercase tracking-wider text-slate-500">
                Candidate Name
              </span>
              <span className="text-xs font-extrabold text-[#0B132B]">{record.candidateName}</span>
            </div>
            <div>
              <span className="block text-[9.5px] font-bold uppercase tracking-wider text-slate-500">
                Domain / Role
              </span>
              <span className="text-xs font-extrabold text-[#0284C7]">{record.domain}</span>
            </div>
            <div>
              <span className="block text-[9.5px] font-bold uppercase tracking-wider text-slate-500">
                Tenure ({record.duration})
              </span>
              <span className="text-xs font-extrabold text-[#0B132B]">{record.tenurePeriod}</span>
            </div>
            <div>
              <span className="block text-[9.5px] font-bold uppercase tracking-wider text-slate-500">
                Evaluation / Status
              </span>
              <span className="text-xs font-extrabold text-emerald-700">{record.rating}</span>
            </div>
          </div>

          {/* Authentication Footer: QR + Seal + Signatory */}
          <div className="pt-4 border-t border-dashed border-slate-300 flex flex-col sm:flex-row items-center justify-between gap-5">
            {/* Live QR Box */}
            <div className="flex items-center space-x-3 bg-slate-50 border border-slate-200 rounded-lg p-2.5">
              {qrDataUrl ? (
                <img
                  src={qrDataUrl}
                  alt={`QR Code for ${record.refId}`}
                  className="w-16 h-16 rounded border border-slate-300 bg-white"
                />
              ) : (
                <div className="w-16 h-16 rounded border border-slate-300 bg-white flex items-center justify-center text-[10px] font-mono text-slate-400">
                  QR
                </div>
              )}
              <div className="text-[10px] leading-snug text-slate-600 text-left">
                <strong className="block text-[#0B132B] text-[10.5px]">
                  DIGITAL AUTHENTICATION
                </strong>
                <span>Official Credential Record</span>
                <span className="block font-mono font-bold text-slate-800">
                  Ref: {record.refId}
                </span>
                <span className="text-[#0284C7] font-semibold">connect.nexoratechs.xyz</span>
              </div>
            </div>

            {/* Official Corporate Seal */}
            <div className="flex flex-col items-center">
              <div className="w-20 h-20 rounded-full border-2 border-dashed border-[#0284C7] bg-sky-50/70 flex flex-col items-center justify-center text-center p-1 shadow-inner">
                <BadgeCheck size={24} className="text-[#0284C7]" />
                <span className="text-[7.5px] font-extrabold text-[#0B132B] uppercase leading-tight mt-0.5">
                  Gonexora Techs
                  <br />
                  Pvt. Ltd.
                </span>
                <span className="text-[6.5px] font-bold text-emerald-700 uppercase">
                  MSME Verified
                </span>
              </div>
              <span className="text-[8px] font-extrabold tracking-wider text-[#0284C7] uppercase mt-1">
                VERIFIED &amp; SEALED • HR GOVERNANCE
              </span>
            </div>

            {/* Authorized Signatory */}
            <div className="text-center min-w-[200px]">
              <p className="text-[10px] font-bold text-slate-600 mb-1">
                For Gonexora Techs Private Limited
              </p>
              <div className="h-9 flex items-center justify-center">
                <span className="font-serif italic font-bold text-xl text-[#0B132B] tracking-wide">
                  Trivin S.
                </span>
              </div>
              <div className="w-40 h-[1.5px] bg-[#0B132B] mx-auto mb-1" />
              <p className="text-xs font-extrabold text-[#0B132B]">TRIVIN S</p>
              <p className="text-[10px] text-slate-500 leading-tight">
                Founder &amp; Lead Administrator
                <br />
                Head of Executive Operations &amp; HR
              </p>
            </div>
          </div>

          {/* Micro Security Strip */}
          <div className="pt-2 border-t border-slate-100 flex flex-wrap items-center justify-between gap-2 text-[9px] text-slate-400">
            <span>
              GONEXORA TECHS PRIVATE LIMITED • MSME REGISTERED ENTERPRISE (GOVT. OF INDIA) • OFFICIAL RECORD
            </span>
            <span>
              Document Ref: {record.refId} • Digital Verification: connect.nexoratechs.xyz
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
