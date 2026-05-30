import React, { useState } from 'react';
import { Heart, CreditCard, Send, CheckCircle } from 'lucide-react';
import confetti from 'canvas-confetti';

interface SupportProps {
  darkMode?: boolean;
}

export const Support: React.FC<SupportProps> = ({ darkMode = true }) => {
  
  const [supportAmount, setSupportAmount] = useState('100');
  const [supportMessage, setSupportMessage] = useState('');
  const [messageSubmitted, setMessageSubmitted] = useState(false);

  const developerUpiId = "atomfinai@upi"; // Mapped Developer ID
  
  // Real working UPI pay link format:
  // upi://pay?pa=address&pn=name&tn=message&am=amount&cu=INR
  const upiPayload = `upi://pay?pa=${developerUpiId}&pn=Atom%20FinAI&tn=${encodeURIComponent(supportMessage || 'Support Atom FinAI')}&am=${supportAmount}&cu=INR`;
  
  // Real-time Dynamic QR code image using a secure public encoder
  const qrCodeUrl = `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(upiPayload)}`;

  const handleMessageSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!supportMessage.trim()) return;
    
    // Trigger confetti on contribution message log
    confetti({
      particleCount: 100,
      spread: 60,
      origin: { y: 0.6 }
    });
    
    setMessageSubmitted(true);
    setTimeout(() => {
      setMessageSubmitted(false);
      setSupportMessage('');
    }, 4000);
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto py-4">
      {/* Header */}
      <div className="text-center space-y-2">
        <div className="w-12 h-12 rounded-2xl bg-rose-500/10 text-rose-400 flex items-center justify-center mx-auto mb-4 animate-float-slow shadow-md">
          <Heart size={24} className="fill-rose-500/20" />
        </div>
        <h2 className="text-3xl font-display font-extrabold tracking-tight m-0 bg-gradient-to-r from-purple-400 to-rose-400 bg-clip-text text-transparent">
          Support Atom FinAI
        </h2>
        <p className="text-sm text-slate-400 max-w-md mx-auto leading-relaxed">
          Atom FinAI is built with passion to make financial intelligence free and highly secure. Support our servers and development using secure direct UPI transfers!
        </p>
      </div>

      {/* Main Grid: Left side details, Right side QR code */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mt-6">
        {/* Left Side: Amount Select & Support Message */}
        <div className={`p-6 rounded-2xl border space-y-6 ${
          darkMode ? 'glass-panel-dark border-slate-800' : 'glass-panel-light border-slate-200'
        }`}>
          <div>
            <h3 className="text-lg font-bold font-display m-0">1. Customize Support</h3>
            <p className="text-xs text-slate-400 mt-1 m-0">
              Select or type a support amount. Scan the QR code on the right with standard payment apps (GPay, PhonePe, Paytm).
            </p>
          </div>

          {/* Amount selection buttons */}
          <div className="space-y-3 font-semibold">
            <label className="text-[10px] uppercase text-slate-500 tracking-wider">Select Support Tier</label>
            <div className="grid grid-cols-3 gap-3 text-xs">
              {['100', '250', '500'].map((amt) => (
                <button
                  key={amt}
                  onClick={() => setSupportAmount(amt)}
                  className={`py-2.5 rounded-xl font-bold border transition-all cursor-pointer ${
                    supportAmount === amt 
                      ? 'bg-rose-500/10 border-rose-500/35 text-rose-400' 
                      : darkMode ? 'border-slate-800 hover:bg-slate-900/60 text-slate-300' : 'border-slate-200 hover:bg-slate-50 text-slate-700'
                  }`}
                >
                  ₹{amt}
                </button>
              ))}
            </div>
            
            {/* Custom Input */}
            <input
              type="number"
              value={supportAmount}
              onChange={(e) => setSupportAmount(e.target.value)}
              placeholder="Or enter custom amount in ₹"
              className={`w-full px-4 py-2.5 rounded-xl border text-xs focus:outline-none focus:ring-1 focus:ring-rose-500 ${
                darkMode ? 'bg-slate-950 border-slate-800 text-slate-200 placeholder-slate-600' : 'bg-white border-slate-200 text-slate-800'
              }`}
            />
          </div>

          {/* Message input */}
          <form onSubmit={handleMessageSubmit} className="space-y-4 border-t border-slate-800/40 pt-4 font-semibold">
            <div className="space-y-1.5">
              <label className="text-[10px] uppercase text-slate-500 tracking-wider">Leave a friendly note</label>
              <textarea
                value={supportMessage}
                onChange={(e) => setSupportMessage(e.target.value)}
                placeholder="Write a message to the developers..."
                rows={3}
                className={`w-full px-4 py-3 rounded-xl border text-xs focus:outline-none focus:ring-1 focus:ring-rose-500 resize-none ${
                  darkMode ? 'bg-slate-950 border-slate-800 text-slate-200 placeholder-slate-600' : 'bg-white border-slate-200 text-slate-800'
                }`}
              />
            </div>

            {messageSubmitted ? (
              <div className="p-3 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs rounded-xl flex items-center gap-2">
                <CheckCircle size={16} />
                <span>Message submitted! Thank you so much for your support!</span>
              </div>
            ) : (
              <button
                type="submit"
                disabled={!supportMessage.trim()}
                className="w-full py-3 bg-gradient-to-r from-purple-500 to-rose-500 hover:from-purple-400 hover:to-rose-400 text-white font-bold rounded-xl text-xs flex items-center justify-center gap-2 transition-all cursor-pointer shadow disabled:opacity-50"
              >
                <Send size={13} />
                <span>Send Note</span>
              </button>
            )}
          </form>
        </div>

        {/* Right Side: UPI ID & QR Code */}
        <div className={`p-6 rounded-2xl border flex flex-col items-center justify-center text-center space-y-6 ${
          darkMode ? 'glass-panel-dark border-slate-800' : 'glass-panel-light border-slate-200'
        }`}>
          <div>
            <h3 className="text-lg font-bold font-display m-0">2. Secure QR Scan</h3>
            <p className="text-xs text-slate-400 mt-1 m-0">
              UPI standards authenticate all secure direct routing to developer buckets instantly.
            </p>
          </div>

          {/* QR code block */}
          <div className="relative p-4 bg-white rounded-2xl shadow-xl border border-slate-200/50 flex items-center justify-center">
            <img 
              src={qrCodeUrl} 
              alt="UPI QR Code Link" 
              className="w-48 h-48 rounded"
            />
          </div>

          <div className="space-y-1">
            <span className="text-[10px] uppercase font-bold text-slate-500 tracking-wider">UPI ID Destination</span>
            <span className="text-sm font-extrabold text-slate-200 font-mono select-all bg-slate-900 border border-slate-800 px-3 py-1.5 rounded-lg block">
              {developerUpiId}
            </span>
          </div>

          <div className="flex items-center gap-2 text-xs bg-slate-900/60 p-2.5 rounded-lg border border-slate-800/40 text-slate-400 max-w-[280px]">
            <CreditCard size={14} className="text-teal-400 flex-shrink-0" />
            <span>Zero payment processing cuts. 100% direct developer routing.</span>
          </div>
        </div>
      </div>
    </div>
  );
};
