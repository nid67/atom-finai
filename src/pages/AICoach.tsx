import React, { useState, useRef, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useFinance } from '../context/FinanceContext';
import { ContextBuilder } from '../engines/ContextBuilder';
import { askCoachAI } from '../services/ai';
import { doc, updateDoc } from 'firebase/firestore';
import { db } from '../firebase';
import { 
  Send, 
  Sparkles, 
  User, 
  RefreshCw,
  BookOpen, 
  HelpCircle,
  AlertTriangle,
  FileText,
  X
} from 'lucide-react';

interface Message {
  sender: 'user' | 'coach';
  text: string;
  timestamp: Date;
}

interface AICoachProps {
  darkMode?: boolean;
}

export const AICoach: React.FC<AICoachProps> = ({ darkMode = true }) => {
  const { userData, refreshUserData } = useAuth();
  const { profile, budgets, goals, subscriptions, alerts } = useFinance();
  const currency = userData?.preferredCurrency || '₹';

  const formatMessageText = (text: string) => {
    if (!text) return '';
    const lines = text.split('\n');
    return lines.map((line, lineIdx) => {
      let processedLine = line;
      let isBullet = false;
      let isHeader = false;
      let headerLevel = 0;
      let indentLevel = 0;
      
      // Handle leading indentation spaces
      const trimStart = processedLine.trimStart();
      const leadingSpaces = processedLine.length - trimStart.length;
      if (leadingSpaces > 0) {
        indentLevel = Math.floor(leadingSpaces / 2);
      }
      
      // Check for headers
      if (trimStart.startsWith('### ')) {
        isHeader = true;
        headerLevel = 3;
        processedLine = trimStart.substring(4);
      } else if (trimStart.startsWith('## ')) {
        isHeader = true;
        headerLevel = 2;
        processedLine = trimStart.substring(3);
      } else if (trimStart.startsWith('# ')) {
        isHeader = true;
        headerLevel = 1;
        processedLine = trimStart.substring(2);
      }
      // Check if the line is a list bullet point (starts with * or - or • followed by space)
      else if (trimStart.startsWith('* ') || trimStart.startsWith('- ') || trimStart.startsWith('• ')) {
        isBullet = true;
        processedLine = trimStart.substring(2);
      } else {
        processedLine = line;
      }
      
      // Parse bold elements in the processed line
      const parts = processedLine.split(/(\*\*.*?\*\*)/g);
      const formattedParts = parts.map((part, partIdx) => {
        if (part.startsWith('**') && part.endsWith('**')) {
          return (
            <strong 
              key={partIdx} 
              className="font-extrabold text-teal-400 dark:text-teal-450"
            >
              {part.slice(2, -2)}
            </strong>
          );
        }
        return part;
      });

      if (isHeader) {
        const headerClasses = headerLevel === 1 
          ? "text-base font-extrabold text-teal-450 dark:text-teal-400 mt-4 mb-2 block" 
          : headerLevel === 2 
            ? "text-sm font-extrabold text-teal-450 dark:text-teal-400 mt-3.5 mb-1.5 block" 
            : "text-xs font-bold text-teal-450 dark:text-teal-400 mt-2.5 mb-1 block";
        return (
          <span key={lineIdx} className={headerClasses}>
            {formattedParts}
          </span>
        );
      }

      // Style bullet points elegantly with subtle padding indentations
      return (
        <div 
          key={lineIdx} 
          className={`min-h-[1.25rem] ${
            isBullet 
              ? 'pl-4 relative flex items-start gap-2 mt-1 mb-1' 
              : ''
          }`}
          style={{ paddingLeft: isBullet ? `${(indentLevel + 1) * 1}rem` : `${indentLevel * 0.5}rem` }}
        >
          {isBullet && (
            <span className="text-teal-500 dark:text-teal-400 select-none font-bold text-sm leading-none">•</span>
          )}
          <span className="flex-1">{formattedParts}</span>
        </div>
      );
    });
  };

  const [messages, setMessages] = useState<Message[]>([
    {
      sender: 'coach',
      text: `Hello ${userData?.fullName || 'there'}! I am your Atom FinAI Personal Coach. Mapped from your Spending Personality as a **${profile?.personality || 'Balanced Planner'}**, I am here to help you build financial discipline and optimize your savings. Ask me complex financial reasoning questions like "Can I buy a bike?" or "How can I cut down on my over-budget categories?"`,
      timestamp: new Date()
    }
  ]);
  
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);

  // Journal States
  const [isJournalOpen, setIsJournalOpen] = useState(false);
  const [journalContent, setJournalContent] = useState('');
  const [generatingJournal, setGeneratingJournal] = useState(false);

  const messagesEndRef = useRef<HTMLDivElement | null>(null);

  // Auto-scroll to bottom of chat
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, loading]);

  // AI Usage calculations & Reset check
  const queriesUsed = userData?.aiQueriesUsedToday || 0;
  const queryLimit = 10;
  const queriesRemaining = Math.max(0, queryLimit - queriesUsed);

  // Direct quick prompt suggestions
  const suggestionsList = [
    "Can I buy a bike for ₹80,000?",
    "Analyze my budget habits.",
    "How can I hit my milestone goal faster?"
  ];

  // INTERCEPT SIMPLE QUERIES LOCALLY (AI Usage Optimization requirement)
  const routeLocalCalculationQuery = (query: string): string | null => {
    const q = query.toLowerCase();
    
    // 1. "How much did I spend?"
    if (q.includes('how much') && (q.includes('spent') || q.includes('spend'))) {
      const totalSpent = budgets.reduce((sum, b) => sum + b.spentAmount, 0);
      return `[Local Calculator Engine] This month, you have spent a total of **${currency}${totalSpent.toLocaleString()}** across your defined budget categories.`;
    }
    
    // 2. "What is my top category?"
    if (q.includes('top category') || q.includes('highest spending') || q.includes('spending most')) {
      if (profile && profile.topCategory !== 'None') {
        return `[Local Calculator Engine] Your highest spending outflow category this month is **${profile.topCategory}** (as tracked in your Behavioral Memory profile).`;
      }
      return `[Local Calculator Engine] We do not have sufficient transaction categories logged to isolate a top category yet.`;
    }
    
    // 3. "Am I over budget?"
    if (q.includes('over budget') || q.includes('exceeded my budget')) {
      const overBudgets = budgets.filter(b => b.spentAmount > b.monthlyLimit);
      if (overBudgets.length > 0) {
        const categories = overBudgets.map(b => `**${b.category}** (by ${currency}${(b.spentAmount - b.monthlyLimit).toLocaleString()})`).join(', ');
        return `[Local Rule Engine] Yes, you are currently over budget in the following categories: ${categories}.`;
      }
      return `[Local Rule Engine] Good news! You are currently within limits in all your configured monthly budget categories.`;
    }

    return null; // Passes through to Gemini
  };

  // Submit Chat Message
  const handleSend = async (textToSend: string) => {
    if (!textToSend.trim() || loading) return;
    
    const userText = textToSend;
    setInput('');
    
    // Add user message
    const newMsg: Message = { sender: 'user', text: userText, timestamp: new Date() };
    setMessages(prev => [...prev, newMsg]);
    setLoading(true);

    // 1. Check local calculation regex router first
    const localAnswer = routeLocalCalculationQuery(userText);
    if (localAnswer) {
      setTimeout(() => {
        setMessages(prev => [...prev, {
          sender: 'coach',
          text: localAnswer,
          timestamp: new Date()
        }]);
        setLoading(false);
      }, 800);
      return;
    }

    // 2. Check 10-query limit
    if (queriesUsed >= queryLimit) {
      setTimeout(() => {
        setMessages(prev => [...prev, {
          sender: 'coach',
          text: `[Daily Limit Reached] You have consumed your **10 free coach queries** for today. Please wait until tomorrow for your queries reset, or check your local Dashboard metrics which do not consume limits!`,
          timestamp: new Date()
        }]);
        setLoading(false);
      }, 800);
      return;
    }

    // 3. Call secure Gemini wrapper
    try {
      if (!userData || !profile) return;
      
      const contextText = ContextBuilder.buildCoachContext(
        userData,
        profile,
        budgets,
        goals,
        subscriptions,
        alerts,
        userText
      );

      const aiResponse = await askCoachAI(contextText, userText);

      // Decrement queries used in Firestore
      const userRef = doc(db, 'users', userData.uid);
      await updateDoc(userRef, {
        aiQueriesUsedToday: queriesUsed + 1
      });

      await refreshUserData();

      setMessages(prev => [...prev, {
        sender: 'coach',
        text: aiResponse,
        timestamp: new Date()
      }]);
    } catch (err) {
      console.error(err);
      setMessages(prev => [...prev, {
        sender: 'coach',
        text: "I faced a connection issue. Rest assured, this did not consume your query limits. Let's try again in a few seconds.",
        timestamp: new Date()
      }]);
    } finally {
      setLoading(false);
    }
  };

  // Generate Monthly Financial Journal Story
  const generateJournalStory = async () => {
    setGeneratingJournal(true);
    setIsJournalOpen(true);
    setJournalContent('');
    try {
      if (!userData || !profile) return;
      
      const contextText = ContextBuilder.buildCoachContext(
        userData,
        profile,
        budgets,
        goals,
        subscriptions,
        alerts,
        "Write my monthly journal story."
      );

      const prompt = `Write a beautiful, narrative, prose-style Monthly Financial Journal story for ${userData.fullName}. 
      Integrate their achievements, areas of improvement, biggest spending challenges, specific budget recommendations, and goal milestones into a structured letter.
      Write this directly from your perspective as their expert Atom FinAI Wealth Coach.
      Use subheaders like: Achievements, Savings Volatility, Recommendations, Looking Forward. Make it sound extremely professional, encouraging, and deeply insightful.`;

      const response = await askCoachAI(contextText, prompt);
      setJournalContent(response);
    } catch (error) {
      setJournalContent("Failed to compile financial journal. Ensure your connection keys are correct.");
    } finally {
      setGeneratingJournal(false);
    }
  };

  return (
    <div className="h-[calc(100vh-140px)] flex flex-col gap-6">
      {/* Header section with Stats */}
      <div className="flex justify-between items-center flex-wrap gap-4">
        <div>
          <h2 className="text-3xl font-display font-extrabold tracking-tight m-0">
            AI Financial Coach
          </h2>
          <p className="text-sm text-slate-400 mt-1 m-0">
            Receive personalized strategic financial advice. Atom intercepts basic calculations locally to protect your AI quota.
          </p>
        </div>

        {/* Action Button & Quota */}
        <div className="flex items-center gap-3">
          {/* Monthly Journal button */}
          <button
            onClick={generateJournalStory}
            className="flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-purple-500/10 to-indigo-600/10 border border-purple-500/30 text-purple-400 hover:bg-purple-500/20 text-xs font-bold rounded-xl transition-all cursor-pointer hover:scale-105"
          >
            <BookOpen size={14} />
            <span>Generate Monthly Journal</span>
          </button>

          {/* Usage limit badge */}
          <div className={`px-4 py-2.5 rounded-xl border flex flex-col items-center justify-center text-xs font-semibold ${
            queriesRemaining <= 2 
              ? 'bg-rose-500/10 border-rose-500/20 text-rose-400' 
              : darkMode ? 'bg-slate-900/40 border-slate-800' : 'bg-slate-50 border-slate-200'
          }`}>
            <span className="text-[10px] text-slate-400 uppercase font-bold tracking-wider">AI Usage Today</span>
            <span className="font-extrabold text-sm mt-0.5">{queriesUsed} / {queryLimit} Used</span>
          </div>
        </div>
      </div>

      {/* Main Terminal Window Chat */}
      <div className={`flex-1 rounded-2xl border flex flex-col overflow-hidden min-h-[300px] ${
        darkMode ? 'glass-panel-dark border-slate-800' : 'bg-white border-slate-200'
      }`}>
        {/* Banner limit Warning */}
        {queriesRemaining === 0 && (
          <div className="bg-rose-500/10 border-b border-rose-500/20 px-4 py-2.5 flex items-center gap-2 text-xs text-rose-400">
            <AlertTriangle size={14} className="flex-shrink-0 animate-bounce" />
            <span>Daily free limit reached. Questions resolving basic spent metrics can still be asked and will calculate locally!</span>
          </div>
        )}

        {/* Messaging Container */}
        <div className="flex-1 overflow-y-auto p-6 space-y-4">
          {messages.map((msg, idx) => (
            <div 
              key={idx}
              className={`flex gap-3 max-w-[85%] ${
                msg.sender === 'user' ? 'ml-auto flex-row-reverse' : ''
              }`}
            >
              <div className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 border ${
                msg.sender === 'user' 
                  ? 'bg-slate-800 border-slate-700 text-slate-200' 
                  : 'bg-teal-500/15 border-teal-500/20 text-teal-400 animate-glow-cyan'
              }`}>
                {msg.sender === 'user' ? <User size={14} /> : <Sparkles size={14} />}
              </div>

              <div className={`p-4 rounded-2xl text-xs leading-relaxed ${
                msg.sender === 'user'
                  ? darkMode ? 'bg-slate-900 border-slate-800 text-slate-200' : 'bg-slate-100 text-slate-800'
                  : darkMode ? 'bg-teal-500/[0.04] border border-teal-500/10 text-slate-300' : 'bg-teal-50/50 border border-teal-500/10 text-slate-700'
              }`}>
                {/* Parse Markdown-like lists for readability */}
                <div className="m-0 space-y-1 font-medium leading-relaxed">
                  {formatMessageText(msg.text)}
                </div>
              </div>
            </div>
          ))}

          {loading && (
            <div className="flex gap-3">
              <div className="w-8 h-8 rounded-lg bg-teal-500/10 border border-teal-500/20 text-teal-400 flex items-center justify-center animate-glow-cyan">
                <RefreshCw size={14} className="animate-spin" />
              </div>
              <div className={`p-4 rounded-2xl text-xs font-semibold ${
                darkMode ? 'bg-slate-900 border-slate-800 text-slate-400' : 'bg-slate-100 text-slate-500'
              }`}>
                <span>Analysing local engines... formulation strategy...</span>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Suggestion Prompts Strip */}
        {messages.length <= 2 && !loading && (
          <div className="px-6 py-2 flex flex-wrap gap-2.5 items-center">
            <span className="text-[10px] text-slate-500 uppercase font-bold tracking-wider flex items-center gap-1">
              <HelpCircle size={10} />
              <span>Suggestions:</span>
            </span>
            {suggestionsList.map((sug, i) => (
              <button
                key={i}
                onClick={() => handleSend(sug)}
                className="px-2.5 py-1.5 bg-slate-900/60 border border-slate-800 text-[10px] font-bold text-slate-400 rounded-lg hover:text-slate-200 hover:border-slate-700 hover:bg-slate-800/20 cursor-pointer transition-all"
              >
                {sug}
              </button>
            ))}
          </div>
        )}

        {/* Bottom Input Box */}
        <div className={`p-4 border-t flex gap-3 ${
          darkMode ? 'bg-slate-950/60 border-slate-800' : 'bg-slate-50 border-slate-200'
        }`}>
          <input
            type="text"
            placeholder="Consult with your Financial Coach on reasoning strategy..."
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSend(input)}
            className={`flex-1 px-4 py-2.5 rounded-xl border text-xs focus:outline-none focus:ring-1 focus:ring-teal-500 ${
              darkMode ? 'bg-slate-950 border-slate-800 text-slate-200 placeholder-slate-600' : 'bg-white border-slate-200'
            }`}
          />
          <button
            onClick={() => handleSend(input)}
            disabled={loading || !input.trim()}
            className="w-10 h-10 rounded-xl bg-gradient-to-tr from-emerald-500 via-teal-500 to-cyan-500 text-slate-950 flex items-center justify-center transition-all hover:scale-105 shadow-md shadow-teal-500/10 cursor-pointer disabled:opacity-50"
          >
            <Send size={15} />
          </button>
        </div>
      </div>

      {/* --- MONTHLY JOURNAL LETTER OVERLAY --- */}
      {isJournalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/90 backdrop-blur-md">
          <div className={`w-full max-w-2xl rounded-2xl border p-8 relative flex flex-col max-h-[85vh] ${
            darkMode ? 'glass-panel-dark border-slate-800 text-slate-100' : 'bg-white border-slate-200 text-slate-800'
          }`}>
            <button
              onClick={() => setIsJournalOpen(false)}
              className="absolute top-4 right-4 text-slate-400 hover:text-slate-200 cursor-pointer"
            >
              <X size={20} />
            </button>

            <div className="flex items-center gap-2 mb-6 border-b border-slate-800/40 pb-4">
              <FileText className="text-purple-400" />
              <div>
                <h3 className="text-xl font-bold font-display m-0">Monthly Wealth Journal</h3>
                <span className="text-[10px] text-slate-500 uppercase font-bold tracking-wider mt-0.5">
                  Compiled Story by Atom FinAI Coach
                </span>
              </div>
            </div>

            {generatingJournal ? (
              <div className="flex-1 flex flex-col justify-center items-center py-20 text-slate-400 text-xs">
                <RefreshCw className="animate-spin text-purple-400 mb-3" size={24} />
                <span>Aggregating analytics records... formulating narrative story prose...</span>
              </div>
            ) : (
              <div className="flex-1 overflow-y-auto pr-2 space-y-4 text-xs leading-relaxed font-medium whitespace-pre-line text-slate-350 dark:text-slate-300">
                {formatMessageText(journalContent)}
              </div>
            )}

            <div className="mt-6 border-t border-slate-800/40 pt-4 flex justify-end">
              <button
                onClick={() => setIsJournalOpen(false)}
                className="px-5 py-2 bg-gradient-to-r from-purple-500 to-indigo-600 hover:from-purple-400 hover:to-indigo-500 text-white font-bold rounded-xl transition-all shadow cursor-pointer text-xs"
              >
                Close Journal
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
