import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { db } from '../firebase';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { Star, Send, CheckCircle, RefreshCw } from 'lucide-react';
import confetti from 'canvas-confetti';

interface FeedbackProps {
  darkMode?: boolean;
}

export const Feedback: React.FC<FeedbackProps> = ({ darkMode = true }) => {
  const { user, userData } = useAuth();
  
  const [rating, setRating] = useState<number>(5);
  const [hoverRating, setHoverRating] = useState<number | null>(null);
  const [feedbackType, setFeedbackType] = useState<string>('General Suggestion');
  const [message, setMessage] = useState<string>('');
  
  const [loading, setLoading] = useState<boolean>(false);
  const [submitted, setSubmitted] = useState<boolean>(false);
  const [error, setError] = useState<string>('');

  const feedbackTypes = [
    'General Suggestion',
    'Feature Request',
    'Bug Report',
    'Financial Coach Review',
    'Praise & Support'
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!message.trim()) {
      setError('Please type a feedback message before submitting.');
      return;
    }

    setLoading(true);
    setError('');

    try {
      // Direct Firestore push to ensure "it comes to the developer by anything" securely
      await addDoc(collection(db, 'feedback'), {
        userId: user?.uid || 'guest',
        userName: userData?.fullName || 'Anonymous',
        userEmail: user?.email || userData?.email || 'No email logged',
        rating,
        feedbackType,
        message: message.trim(),
        createdAt: serverTimestamp()
      });

      // Confetti burst for awesome user reinforcement
      confetti({
        particleCount: 120,
        spread: 70,
        origin: { y: 0.6 }
      });

      setSubmitted(true);
      setMessage('');
      setRating(5);
    } catch (err: any) {
      console.error("Firestore feedback write failed:", err);
      setError(err.message || 'Failed to submit feedback. Please check your network connection.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6 max-w-2xl mx-auto py-4">
      {/* Page Header */}
      <div>
        <h2 className="text-3xl font-display font-extrabold tracking-tight m-0 bg-gradient-to-r from-emerald-400 to-cyan-400 bg-clip-text text-transparent">
          User Insights & Feedback
        </h2>
        <p className="text-sm text-slate-400 mt-1.5 m-0 font-medium">
          Tell us about your experience. Your ideas and bug reports are stored securely and reviewed directly by the developers.
        </p>
      </div>

      {/* Form Card */}
      <div className={`p-6 md:p-8 rounded-2xl border relative overflow-hidden transition-all duration-300 ${
        darkMode ? 'glass-panel-dark border-slate-800 shadow-2xl' : 'glass-panel-light border-slate-200 shadow'
      }`}>
        {submitted ? (
          <div className="py-12 text-center space-y-4 animate-fade-in">
            <div className="w-16 h-16 rounded-full bg-emerald-500/10 text-emerald-400 flex items-center justify-center mx-auto mb-4 border border-emerald-500/25 animate-float-slow">
              <CheckCircle size={32} />
            </div>
            <h3 className="text-2xl font-bold font-display m-0 text-slate-100">Feedback Submitted Successfully!</h3>
            <p className="text-xs text-slate-400 max-w-sm mx-auto leading-relaxed">
              Thank you for contributing to Atom FinAI's evolution. Your notes have been securely routed to Nidhin's Firebase repository bucket.
            </p>
            <button
              onClick={() => setSubmitted(false)}
              className="mt-6 px-5 py-2.5 bg-gradient-to-r from-emerald-500 to-cyan-500 text-slate-950 font-bold rounded-xl text-xs hover:scale-105 cursor-pointer transition-all shadow-md"
            >
              Send Another Response
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-6 text-xs font-semibold">
            {error && (
              <div className="p-3.5 bg-rose-500/10 border border-rose-500/20 text-rose-450 rounded-xl">
                {error}
              </div>
            )}

            {/* Step 1: User info indicator (Prefilled, non-editable for security routing) */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <span className="text-[10px] text-slate-500 uppercase tracking-wider block">Submitting As</span>
                <span className={`px-4 py-2.5 rounded-xl border block font-bold text-slate-350 truncate ${
                  darkMode ? 'bg-slate-950 border-slate-800' : 'bg-slate-50 border-slate-150 text-slate-650'
                }`}>
                  {userData?.fullName} ({userData?.occupation || 'Student'})
                </span>
              </div>
              <div className="space-y-1.5">
                <span className="text-[10px] text-slate-500 uppercase tracking-wider block">Secure Email Reference</span>
                <span className={`px-4 py-2.5 rounded-xl border block font-bold text-slate-350 truncate ${
                  darkMode ? 'bg-slate-950 border-slate-800' : 'bg-slate-50 border-slate-150 text-slate-650'
                }`}>
                  {user?.email || userData?.email || 'N/A'}
                </span>
              </div>
            </div>

            {/* Step 2: Rating and Category Selection */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2">
              {/* Category */}
              <div className="space-y-2">
                <label className="text-[10px] uppercase text-slate-400 tracking-wider block">Feedback Category</label>
                <select
                  value={feedbackType}
                  onChange={(e) => setFeedbackType(e.target.value)}
                  className={`w-full px-4 py-3 rounded-xl border focus:outline-none focus:ring-1 focus:ring-teal-500 text-xs ${
                    darkMode ? 'bg-slate-950 border-slate-800 text-slate-200' : 'bg-white border-slate-200 text-slate-800'
                  }`}
                >
                  {feedbackTypes.map((t) => (
                    <option key={t} value={t}>{t}</option>
                  ))}
                </select>
              </div>

              {/* Star Rating component */}
              <div className="space-y-2">
                <label className="text-[10px] uppercase text-slate-400 tracking-wider block">Experience Rating</label>
                <div className="flex items-center gap-2 px-3 py-2.5">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      type="button"
                      onClick={() => setRating(star)}
                      onMouseEnter={() => setHoverRating(star)}
                      onMouseLeave={() => setHoverRating(null)}
                      className="cursor-pointer transition-all hover:scale-120 text-slate-650"
                    >
                      <Star
                        size={22}
                        className={`${
                          star <= (hoverRating !== null ? hoverRating : rating)
                            ? 'fill-amber-400 text-amber-400 filter drop-shadow-[0_0_6px_rgba(251,191,36,0.3)]'
                            : 'text-slate-600 dark:text-slate-750'
                        } transition-colors duration-150`}
                      />
                    </button>
                  ))}
                  <span className="text-xs text-slate-400 font-bold ml-2">
                    ({rating === 5 ? 'Excellent' : rating === 4 ? 'Good' : rating === 3 ? 'Average' : rating === 2 ? 'Substandard' : 'Poor'})
                  </span>
                </div>
              </div>
            </div>

            {/* Step 3: Message */}
            <div className="space-y-2">
              <label className="text-[10px] uppercase text-slate-400 tracking-wider block">Detailed Feedback / Suggestions</label>
              <textarea
                required
                rows={5}
                placeholder="Share your thoughts, report bugs, or recommend features you want our Personal AI coach or interface to have..."
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                className={`w-full px-4 py-3 rounded-xl border text-xs focus:outline-none focus:ring-1 focus:ring-teal-500 resize-none ${
                  darkMode ? 'bg-slate-950 border-slate-800 text-slate-200 placeholder-slate-600' : 'bg-white border-slate-200 text-slate-850'
                }`}
              />
            </div>

            {/* Step 4: Submit button */}
            <button
              type="submit"
              disabled={loading || !message.trim()}
              className="w-full py-3.5 bg-gradient-to-r from-emerald-500 via-teal-500 to-cyan-500 hover:from-emerald-400 hover:to-cyan-400 text-slate-950 font-bold rounded-xl transition-all shadow-md flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 hover:scale-101 select-none"
            >
              {loading ? (
                <>
                  <RefreshCw size={14} className="animate-spin" />
                  <span>Logging records...</span>
                </>
              ) : (
                <>
                  <Send size={14} />
                  <span>Submit Secure Feedback</span>
                </>
              )}
            </button>
          </form>
        )}
      </div>
    </div>
  );
};
