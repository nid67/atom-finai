import React, { useState } from 'react';
import { Share2, Copy, Check, MessageSquare, Send, Mail } from 'lucide-react';

interface ShareProps {
  darkMode?: boolean;
}

export const Share: React.FC<ShareProps> = ({ darkMode = true }) => {
  const [copied, setCopied] = useState(false);
  const appLink = "https://atomfinai.web.app";
  const shareText = `I am using Atom FinAI to manage my finances, track expenses, improve savings, and receive personalized AI-powered financial insights. Try Atom FinAI:\n${appLink}`;

  const handleCopy = () => {
    navigator.clipboard.writeText(shareText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const whatsappUrl = `https://api.whatsapp.com/send?text=${encodeURIComponent(shareText)}`;
  const telegramUrl = `https://t.me/share/url?url=${encodeURIComponent(appLink)}&text=${encodeURIComponent(shareText)}`;
  const emailUrl = `mailto:?subject=Achieve Financial Clarity with Atom FinAI&body=${encodeURIComponent(shareText)}`;

  return (
    <div className="space-y-6 max-w-xl mx-auto py-6">
      {/* Header */}
      <div className="text-center space-y-2">
        <div className="w-12 h-12 rounded-2xl bg-teal-500/10 text-teal-400 flex items-center justify-center mx-auto mb-4 animate-float-slow shadow-md">
          <Share2 size={24} />
        </div>
        <h2 className="text-3xl font-display font-extrabold tracking-tight m-0 bg-gradient-to-r from-emerald-400 to-cyan-400 bg-clip-text text-transparent">
          Spread Financial Clarity
        </h2>
        <p className="text-sm text-slate-400 leading-relaxed max-w-md mx-auto">
          Share Atom FinAI with friends and colleagues to help them gain financial intelligence, build healthy habits, and consult their personal AI financial coach.
        </p>
      </div>

      {/* Sharing Panel Card */}
      <div className={`p-6 rounded-2xl border space-y-6 ${
        darkMode ? 'glass-panel-dark border-slate-800' : 'glass-panel-light border-slate-200'
      }`}>
        {/* Visual Message Display */}
        <div className="space-y-2">
          <label className="text-[10px] uppercase font-bold text-slate-500 tracking-wider">
            Share Message Template
          </label>
          <div className={`p-4 rounded-xl border text-xs leading-relaxed font-semibold font-mono whitespace-pre-line ${
            darkMode ? 'bg-slate-950 border-slate-800 text-slate-300' : 'bg-slate-50 border-slate-200 text-slate-700'
          }`}>
            {shareText}
          </div>
        </div>

        {/* Action button Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Copy Button */}
          <button
            onClick={handleCopy}
            className={`w-full py-3 px-4 rounded-xl border font-bold text-xs flex items-center justify-center gap-2 transition-all cursor-pointer ${
              copied 
                ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400' 
                : darkMode 
                  ? 'border-slate-800 hover:bg-slate-900/60 text-slate-200' 
                  : 'border-slate-200 hover:bg-slate-50 text-slate-800'
            }`}
          >
            {copied ? (
              <>
                <Check size={14} />
                <span>Message Copied!</span>
              </>
            ) : (
              <>
                <Copy size={14} />
                <span>Copy Share Link</span>
              </>
            )}
          </button>

          {/* WhatsApp share */}
          <a
            href={whatsappUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="w-full py-3 px-4 rounded-xl bg-[#25D366] hover:bg-[#20ba59] text-slate-950 font-bold text-xs flex items-center justify-center gap-2 transition-all cursor-pointer shadow shadow-[#25D366]/10 text-center decoration-transparent"
          >
            <MessageSquare size={14} />
            <span>Share on WhatsApp</span>
          </a>

          {/* Telegram share */}
          <a
            href={telegramUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="w-full py-3 px-4 rounded-xl bg-[#0088cc] hover:bg-[#0077b5] text-white font-bold text-xs flex items-center justify-center gap-2 transition-all cursor-pointer shadow shadow-[#0088cc]/10 text-center decoration-transparent col-span-1 md:col-span-2"
          >
            <Send size={14} />
            <span>Share on Telegram</span>
          </a>

          {/* Email share */}
          <a
            href={emailUrl}
            className="w-full py-3 px-4 rounded-xl border border-slate-800 hover:bg-slate-900/60 text-slate-300 font-bold text-xs flex items-center justify-center gap-2 transition-all cursor-pointer text-center decoration-transparent col-span-1 md:col-span-2"
          >
            <Mail size={14} />
            <span>Send as Email invitation</span>
          </a>
        </div>
      </div>
    </div>
  );
};
