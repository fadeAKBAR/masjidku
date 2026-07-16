import React from "react";
import { Target, FileText, CheckCircle2, Calendar, Sparkles, MapPin, Printer } from "lucide-react";
import { ProposalData } from "../types";

interface ProposalViewerProps {
  proposal: ProposalData;
}

export default function ProposalViewer({ proposal }: ProposalViewerProps) {
  const percent = Math.min(100, Math.floor((proposal.collectedAmount / proposal.targetAmount) * 100));

  const formatIDR = (num: number) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
    }).format(num);
  };

  const handlePrintProposal = () => {
    const printWindow = window.open("", "_blank");
    if (!printWindow) return;
    
    const sectionsHTML = proposal.sections
      .map(
        (sec) => `
        <div style="margin-bottom: 24px;">
          <h2 style="color: #1B4332; font-family: 'Lora', Georgia, serif; font-size: 18px; border-bottom: 1px solid #E5E0D5; padding-bottom: 6px; margin-bottom: 12px;">${sec.title}</h2>
          <p style="font-size: 14px; color: #2D332F; line-height: 1.6; white-space: pre-line;">${sec.content}</p>
        </div>
      `
      )
      .join("");

    printWindow.document.write(`
      <html>
        <head>
          <title>${proposal.title}</title>
          <style>
            body { font-family: 'Plus Jakarta Sans', system-ui, sans-serif; padding: 40px; color: #2D332F; max-width: 800px; margin: 0 auto; background-color: #FDFBF7; }
            h1 { text-align: center; color: #1B4332; margin-bottom: 8px; font-size: 24px; font-family: 'Lora', Georgia, serif; }
            .subtitle { text-align: center; color: #8B8476; font-size: 14px; margin-bottom: 30px; letter-spacing: 0.1em; text-transform: uppercase; }
            .meta-box { background-color: #F1F5F1; border: 1px solid #D1D8D1; border-radius: 12px; padding: 20px; margin-bottom: 30px; }
            .meta-grid { display: grid; grid-template-cols: 1fr 1fr; gap: 16px; margin-top: 12px; }
            .meta-item { font-size: 13px; color: #8B8476; }
            .meta-val { font-weight: bold; color: #1B4332; font-size: 16px; font-family: 'Lora', Georgia, serif; }
            .footer { margin-top: 50px; text-align: center; font-size: 11px; color: #8B8476; border-top: 1px solid #E5E0D5; padding-top: 20px; }
          </style>
        </head>
        <body>
          <h1>${proposal.title}</h1>
          <div class="subtitle">Masjid Nurul Falah Samaoling, Soppeng</div>
          
          <div class="meta-box">
            <div style="font-size: 14px; color: #2D332F;">${proposal.description}</div>
            <div class="meta-grid">
              <div class="meta-item">Target Anggaran:<br/><span class="meta-val">${formatIDR(proposal.targetAmount)}</span></div>
              <div class="meta-item">Telah Terkumpul:<br/><span class="meta-val">${formatIDR(proposal.collectedAmount)} (${percent}%)</span></div>
            </div>
          </div>

          ${sectionsHTML}

          <div style="margin-top: 40px; padding: 20px; background-color: #F1F5F1; border: 1px dashed #1B4332; border-radius: 12px; text-align: center;">
            <p style="font-size: 14px; font-weight: bold; color: #1B4332; margin: 0;">Salurkan Donasi Terbaik Anda melalui scan QRIS resmi atau Rekening Bank Syariah Indonesia (BSI) di halaman utama.</p>
          </div>

          <div class="footer">
            PANITIA PEMBANGUNAN MASJID NURUL FALAH SAMAOLING<br/>
            Alamat: Samaoling, Desa Parenring, Kec. Lilirilau, Kab. Soppeng 90871
          </div>
          <script>
            window.onload = function() { window.print(); }
          </script>
        </body>
      </html>
    `);
    printWindow.document.close();
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6" id="proposal-viewer-root">
      {/* Target and Progress Column */}
      <div className="lg:col-span-1 space-y-6" id="proposal-progress-col">
        {/* Progress Tracker Card */}
        <div className="bg-white border border-editorial-border p-6 rounded-3xl shadow-sm space-y-5" id="proposal-progress-card">
          <div className="flex items-center gap-2" id="progress-card-hdr">
            <div className="p-2.5 bg-editorial-light-green rounded-xl text-editorial-pine">
              <Target className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold font-serif text-editorial-pine text-sm">Status Penggalangan Dana</h3>
              <p className="text-[11px] text-editorial-taupe">Pembaruan otomatis dari kas pembangunan</p>
            </div>
          </div>

          {/* Large Percent visual */}
          <div className="text-center py-4 bg-editorial-bg border border-editorial-border rounded-2xl relative overflow-hidden" id="percent-badge-container">
            <span className="text-5xl font-bold font-serif text-editorial-pine tracking-tight">{percent}%</span>
            <span className="text-xs text-editorial-pine font-bold block mt-1">Selesai Terkumpul</span>
          </div>

          {/* Progress Bar */}
          <div className="space-y-1" id="progress-bar-container">
            <div className="w-full h-3 bg-editorial-bg border border-editorial-border/40 rounded-full overflow-hidden">
              <div className="h-full bg-editorial-pine rounded-full transition-all duration-500" style={{ width: `${percent}%` }} />
            </div>
            <div className="flex justify-between text-[10px] text-editorial-taupe font-bold font-mono">
              <span>0%</span>
              <span>TARGET: {formatIDR(proposal.targetAmount).replace("Rp", "").trim()}</span>
            </div>
          </div>

          {/* Ledger Numbers */}
          <div className="divide-y divide-editorial-border text-xs" id="progress-numerical-stats">
            <div className="py-2.5 flex justify-between">
              <span className="text-editorial-taupe font-medium">Telah Terkumpul</span>
              <span className="font-bold text-editorial-text font-mono">{formatIDR(proposal.collectedAmount)}</span>
            </div>
            <div className="py-2.5 flex justify-between">
              <span className="text-editorial-taupe font-medium">Kekurangan</span>
              <span className="font-bold text-rose-700 font-mono">
                {formatIDR(Math.max(0, proposal.targetAmount - proposal.collectedAmount))}
              </span>
            </div>
          </div>

          {/* CTA Print Button */}
          <button
            onClick={handlePrintProposal}
            className="w-full py-3 bg-editorial-pine hover:bg-[#0E251B] text-white rounded-2xl font-bold text-xs transition-colors shadow-sm flex items-center justify-center gap-1.5"
            id="print-proposal-btn"
          >
            <Printer className="w-4 h-4 text-editorial-mint" /> Cetak Lembar Proposal
          </button>
        </div>

        {/* Development Meta info Card */}
        <div className="bg-editorial-light-green/30 border border-editorial-border p-6 rounded-3xl space-y-4" id="renovation-info-card">
          <h4 className="font-bold font-serif text-editorial-pine text-xs flex items-center gap-1.5 uppercase tracking-wide">
            <Sparkles className="w-4 h-4 text-editorial-pine" /> Informasi Renovasi
          </h4>
          <div className="space-y-3 text-xs text-editorial-text" id="info-list">
            <div className="flex gap-2">
              <MapPin className="w-4 h-4 text-editorial-pine flex-shrink-0" />
              <span>Samaoling, Desa Parenring, Kec. Lilirilau, Kab. Soppeng 90871</span>
            </div>
            <div className="flex gap-2">
              <Calendar className="w-4 h-4 text-editorial-pine flex-shrink-0" />
              <span>Target Penyelesaian: Desember 2026</span>
            </div>
            <div className="flex gap-2">
              <CheckCircle2 className="w-4 h-4 text-editorial-pine flex-shrink-0" />
              <span>Panitia Resmi: Pengurus Masjid Nurul Falah Samaoling</span>
            </div>
          </div>
        </div>
      </div>

      {/* Structured Chapters Column */}
      <div className="lg:col-span-2 space-y-6" id="proposal-chapters-col">
        <div className="bg-white border border-editorial-border p-6 rounded-3xl shadow-sm" id="proposal-body-card">
          <div className="flex items-center gap-2 mb-6 border-b border-editorial-border pb-4" id="proposal-body-hdr">
            <div className="p-2.5 bg-editorial-bg border border-editorial-border rounded-xl text-editorial-pine">
              <FileText className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold font-serif text-editorial-pine text-base">{proposal.title}</h3>
              <p className="text-xs text-editorial-taupe">Keterbukaan rencana pembangunan untuk seluruh ummat.</p>
            </div>
          </div>

          {/* Description Section */}
          <div className="mb-6 p-4 bg-editorial-light-green/50 rounded-2xl border border-editorial-border-green/30 text-xs text-editorial-text leading-relaxed italic" id="proposal-overview-txt">
            &ldquo;{proposal.description}&rdquo;
          </div>

          {/* Dynamic Chapters */}
          <div className="space-y-6" id="proposal-chapters-list">
            {proposal.sections.map((sec, idx) => (
              <div key={sec.id} className="space-y-2 border-b border-editorial-border pb-5 last:border-none last:pb-0" id={`chapter-${sec.id}`}>
                <div className="flex items-center gap-2">
                  <span className="flex h-6 w-6 items-center justify-center rounded-full bg-editorial-light-green border border-editorial-border-green/40 text-xs font-bold text-editorial-pine font-mono">
                    {idx + 1}
                  </span>
                  <h4 className="font-bold font-serif text-editorial-text text-sm">{sec.title}</h4>
                </div>
                <p className="text-xs text-editorial-text leading-relaxed whitespace-pre-line pl-8">
                  {sec.content}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
