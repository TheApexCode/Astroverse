import React, { useRef, useEffect, useState } from 'react';
import { Share2, Download, Copy, Check, X, Twitter, MessageCircle, ExternalLink, Sparkles } from 'lucide-react';
import { ObservationLog } from '../../types/astronomy';

export const SocialShareModal: React.FC<{
  log: ObservationLog | null;
  isOpen: boolean;
  onClose: () => void;
}> = ({ log, isOpen, onClose }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (!isOpen || !log || !canvasRef.current) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d')!;
    const w = canvas.width;
    const h = canvas.height;

    // Background Gradient (Deep Space Obsidian & Nebula Violet)
    const bgGrad = ctx.createLinearGradient(0, 0, w, h);
    bgGrad.addColorStop(0, '#030712');
    bgGrad.addColorStop(0.5, '#0f172a');
    bgGrad.addColorStop(1, '#1e1b4b');
    ctx.fillStyle = bgGrad;
    ctx.fillRect(0, 0, w, h);

    // Decorative Stars
    ctx.fillStyle = '#ffffff';
    for (let i = 0; i < 90; i++) {
      const x = Math.random() * w;
      const y = Math.random() * h;
      const r = Math.random() * 2;
      ctx.globalAlpha = 0.3 + Math.random() * 0.7;
      ctx.beginPath();
      ctx.arc(x, y, r, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.globalAlpha = 1.0;

    // Glowing border frame
    ctx.strokeStyle = '#38bdf8';
    ctx.lineWidth = 3;
    ctx.strokeRect(20, 20, w - 40, h - 40);

    // Header branding
    ctx.font = 'bold 16px "JetBrains Mono", monospace';
    ctx.fillStyle = '#38bdf8';
    ctx.fillText('ASTROVERSE // OFFICIAL CELESTIAL OBSERVATION', 50, 65);

    // Target Name
    ctx.font = 'bold 32px "Space Grotesk", sans-serif';
    ctx.fillStyle = '#ffffff';
    ctx.fillText(log.targetName, 50, 115);

    // Constellation & Subtitle
    ctx.font = '16px "Space Grotesk", sans-serif';
    ctx.fillStyle = '#94a3b8';
    ctx.fillText(
      `${log.targetCategory.toUpperCase()}${log.constellation ? ` • Constellation ${log.constellation}` : ''}`,
      50,
      145
    );

    // Notes Box
    ctx.fillStyle = 'rgba(15, 23, 42, 0.75)';
    ctx.fillRect(50, 175, w - 100, 100);
    ctx.strokeStyle = 'rgba(56, 189, 248, 0.3)';
    ctx.lineWidth = 1;
    ctx.strokeRect(50, 175, w - 100, 100);

    ctx.font = 'italic 15px "Space Grotesk", sans-serif';
    ctx.fillStyle = '#e2e8f0';
    // Wrap text simply
    const words = log.notes.split(' ');
    let line = '';
    let yPos = 208;
    for (let n = 0; n < words.length; n++) {
      const testLine = line + words[n] + ' ';
      const metrics = ctx.measureText(testLine);
      if (metrics.width > w - 140 && n > 0) {
        ctx.fillText(line, 65, yPos);
        line = words[n] + ' ';
        yPos += 24;
        if (yPos > 260) break;
      } else {
        line = testLine;
      }
    }
    ctx.fillText(line, 65, yPos);

    // Telemetry Footers
    ctx.font = '14px "JetBrains Mono", monospace';
    ctx.fillStyle = '#38bdf8';
    ctx.fillText(`Optics: ${log.equipment}`, 50, 315);
    ctx.fillText(`Sky: Bortle Class ${log.bortleScale} (${log.seeingCondition})`, 50, 340);

    ctx.fillStyle = '#f59e0b';
    ctx.fillText(`Observer: ${log.authorName || 'Stargazer'}`, 440, 315);
    ctx.fillText(`Date: ${new Date(log.timestamp).toLocaleDateString()}`, 440, 340);

    // Astroverse verification watermark badge
    ctx.fillStyle = '#64748b';
    ctx.font = '11px "JetBrains Mono", monospace';
    ctx.fillText('Verified with Astroverse Astronomical Platform', 50, 385);
  }, [isOpen, log]);

  if (!isOpen || !log) return null;

  const handleDownloadCard = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const link = document.createElement('a');
    link.download = `Astroverse-${log.targetName.replace(/\s+/g, '_')}-Sighting.png`;
    link.href = canvas.toDataURL('image/png');
    link.click();
  };

  const shareText = `🔭 Just observed ${log.targetName} under Bortle ${log.bortleScale} skies using ${log.equipment}! Logged with #Astroverse astronomy engine.`;

  const handleCopyText = () => {
    navigator.clipboard.writeText(`${shareText}\n${window.location.href}`);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const handleShareTwitter = () => {
    const url = `https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText)}&url=${encodeURIComponent(window.location.href)}`;
    window.open(url, '_blank');
  };

  const handleShareReddit = () => {
    const url = `https://reddit.com/r/astronomy/submit?title=${encodeURIComponent(`Observation: ${log.targetName}`)}&text=${encodeURIComponent(shareText)}`;
    window.open(url, '_blank');
  };

  const handleShareWhatsApp = () => {
    const url = `https://api.whatsapp.com/send?text=${encodeURIComponent(`${shareText} ${window.location.href}`)}`;
    window.open(url, '_blank');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-md p-4 animate-in fade-in">
      <div className="w-full max-w-2xl bg-slate-900 border border-slate-700 rounded-2xl p-6 shadow-2xl relative max-h-[90vh] overflow-y-auto">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-slate-400 hover:text-white p-1 rounded-lg bg-slate-800 hover:bg-slate-700"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-2 mb-4">
          <Share2 className="w-5 h-5 text-cyan-400" />
          <h3 className="text-lg font-bold text-white">Share Celestial Sighting Card</h3>
        </div>

        {/* Rendered Visual Card */}
        <div className="flex justify-center mb-5 overflow-hidden rounded-xl border border-slate-800 shadow-2xl">
          <canvas
            ref={canvasRef}
            width={720}
            height={420}
            className="w-full max-w-[620px] aspect-[720/420]"
          />
        </div>

        {/* Sharing Options Bar */}
        <div className="space-y-3">
          <span className="text-xs font-mono text-slate-400 block">Share to Community & Social:</span>
          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={handleDownloadCard}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-semibold shadow-md transition cursor-pointer"
            >
              <Download className="w-4 h-4" />
              <span>Download Card (PNG)</span>
            </button>

            <button
              onClick={handleCopyText}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold transition cursor-pointer"
            >
              {copied ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
              <span>{copied ? 'Copied Sighting!' : 'Copy Text & Link'}</span>
            </button>

            <button
              onClick={handleShareTwitter}
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-[#1DA1F2]/20 hover:bg-[#1DA1F2]/30 border border-[#1DA1F2]/40 text-[#1DA1F2] text-xs font-semibold transition cursor-pointer"
            >
              <Twitter className="w-4 h-4" />
              <span>Post on X</span>
            </button>

            <button
              onClick={handleShareWhatsApp}
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-emerald-600/20 hover:bg-emerald-600/30 border border-emerald-500/40 text-emerald-300 text-xs font-semibold transition cursor-pointer"
            >
              <MessageCircle className="w-4 h-4" />
              <span>WhatsApp</span>
            </button>

            <button
              onClick={handleShareReddit}
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-orange-600/20 hover:bg-orange-600/30 border border-orange-500/40 text-orange-300 text-xs font-semibold transition cursor-pointer"
            >
              <ExternalLink className="w-4 h-4" />
              <span>Reddit r/astronomy</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
