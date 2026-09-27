import React from 'react';
import {
  X,
  Printer,
  CheckCircle2,
  Share2,
  ExternalLink,
  ShieldCheck,
  Building2,
  Calendar,
  UserCheck
} from 'lucide-react';

interface ExperienceCertificateModalProps {
  isOpen: boolean;
  onClose: () => void;
  employeeName?: string;
  designation?: string;
  period?: string;
  docId?: string;
}

export const ExperienceCertificateModal: React.FC<ExperienceCertificateModalProps> = ({
  isOpen,
  onClose,
  employeeName = 'Akshaya R',
  designation = 'Software Associate',
  period = '01 July 2026 – 31 August 2026 (2 Months)',
  docId = 'NEX-EXP-2026-AK8921'
}) => {
  if (!isOpen) return null;

  const certUrl = `/certificates/${docId}.html`;

  const handlePrint = () => {
    const printWindow = window.open(certUrl, '_blank');
    if (printWindow) {
      printWindow.focus();
    }
  };

  const handleCopyLink = () => {
    const fullUrl = `${window.location.origin}/certificates/${docId}.html`;
    navigator.clipboard.writeText(fullUrl);
    alert('Certificate verification link copied to clipboard!');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-fadeIn">
      <div className="relative w-full max-w-4xl bg-slate-900 border border-slate-700/80 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[92vh]">
        {/* Header Bar */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-slate-900/90">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-sky-500/10 text-sky-400 border border-sky-500/20 rounded-lg">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-white flex items-center gap-2">
                Work Experience Certificate
                <span className="text-xs bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-semibold px-2 py-0.5 rounded-full flex items-center gap-1">
                  <CheckCircle2 className="w-3 h-3" /> Authenticated
                </span>
              </h2>
              <p className="text-xs text-slate-400">Ref: {docId} • Issued by Nexora Technologies</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-white bg-sky-600 hover:bg-sky-500 rounded-lg transition-colors shadow-lg shadow-sky-600/20"
              title="Print or Save as PDF"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Print / PDF</span>
            </button>
            <button
              onClick={handleCopyLink}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-slate-200 bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded-lg transition-colors"
              title="Copy link"
            >
              <Share2 className="w-3.5 h-3.5" />
              <span>Share</span>
            </button>
            <button
              onClick={onClose}
              className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Certificate Overview Bar */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 p-4 bg-slate-950/60 border-b border-slate-800 text-xs">
          <div className="bg-slate-900/80 p-2.5 rounded-lg border border-slate-800">
            <span className="text-slate-400 block mb-0.5">Recipient</span>
            <span className="text-white font-semibold flex items-center gap-1">
              <UserCheck className="w-3.5 h-3.5 text-sky-400" /> {employeeName}
            </span>
          </div>
          <div className="bg-slate-900/80 p-2.5 rounded-lg border border-slate-800">
            <span className="text-slate-400 block mb-0.5">Designation</span>
            <span className="text-white font-semibold flex items-center gap-1">
              <Building2 className="w-3.5 h-3.5 text-cyan-400" /> {designation}
            </span>
          </div>
          <div className="bg-slate-900/80 p-2.5 rounded-lg border border-slate-800">
            <span className="text-slate-400 block mb-0.5">Tenure</span>
            <span className="text-white font-semibold flex items-center gap-1">
              <Calendar className="w-3.5 h-3.5 text-amber-400" /> {period}
            </span>
          </div>
          <div className="bg-slate-900/80 p-2.5 rounded-lg border border-slate-800">
            <span className="text-slate-400 block mb-0.5">Authorized Signatory</span>
            <span className="text-white font-semibold text-emerald-400">
              Trivin (Founder)
            </span>
          </div>
        </div>

        {/* Certificate Preview Frame */}
        <div className="flex-1 overflow-auto p-4 bg-slate-950/90 flex justify-center">
          <iframe
            src={certUrl}
            title="Work Experience Certificate"
            className="w-full max-w-3xl h-[650px] rounded-lg border border-slate-800 shadow-xl bg-white"
          />
        </div>

        {/* Modal Footer */}
        <div className="flex items-center justify-between px-6 py-3 border-t border-slate-800 bg-slate-900 text-xs text-slate-400">
          <div className="flex items-center gap-2">
            <span>Official digital verification link:</span>
            <a
              href={certUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="text-sky-400 hover:underline flex items-center gap-1"
            >
              View standalone page <ExternalLink className="w-3 h-3" />
            </a>
          </div>
          <button
            onClick={onClose}
            className="px-4 py-1.5 font-medium text-slate-300 hover:text-white bg-slate-800 hover:bg-slate-700 rounded-lg transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
