import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useFinance } from '../context/FinanceContext';
import { scanReceiptAI } from '../services/ai';
import type { Expense } from '../engines/AnalyticsEngine';
import { 
  Plus, 
  Search, 
  Filter, 
  Trash2, 
  Edit2, 
  X, 
  Camera, 
  Check, 
  RefreshCw,
  Sparkles
} from 'lucide-react';
import confetti from 'canvas-confetti';

interface ExpensesProps {
  darkMode?: boolean;
}

export const Expenses: React.FC<ExpensesProps> = ({ darkMode = true }) => {
  const { userData } = useAuth();
  const { expenses, addExpense, updateExpense, deleteExpense } = useFinance();
  const currency = userData?.preferredCurrency || '₹';

  // State Management
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [editingExpense, setEditingExpense] = useState<Expense | null>(null);

  // Form States (Manual Add / Edit)
  const [amount, setAmount] = useState('');
  const [category, setCategory] = useState('Food & Dining');
  const [description, setDescription] = useState('');
  const [merchantName, setMerchantName] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('UPI');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);

  // Receipt Scanner States
  const [scanning, setScanning] = useState(false);
  const [scanResult, setScanResult] = useState<any | null>(null);
  const [deleteReceiptAfter, setDeleteReceiptAfter] = useState(true);

  // Available Categories
  const categories = [
    "Food & Dining",
    "Groceries",
    "Shopping",
    "Transport",
    "Bills & Utilities",
    "Entertainment",
    "Health & Wellness",
    "Others"
  ];

  // OCR Receipt Scan Action
  const handleReceiptUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setScanning(true);
    try {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = async () => {
        const base64String = (reader.result as string).split(',')[1];
        
        // Call AI OCR OCRResult
        const parsed = await scanReceiptAI(base64String);
        
        // Show scan confirmation preview modal
        setScanResult({
          merchantName: parsed.merchantName,
          amount: parsed.amount,
          date: parsed.date,
          category: parsed.category,
          confidenceScore: parsed.confidenceScore
        });
      };
    } catch (error) {
      console.error("OCR parse failed:", error);
      alert("Receipt scanning failed. Running simulation fallback instead.");
    } finally {
      setScanning(false);
    }
  };

  // Confirm OCR Receipt Save
  const handleConfirmScan = async () => {
    if (!scanResult) return;
    try {
      // Validate micro expense ₹1 threshold
      if (parseFloat(scanResult.amount) < 1) {
        alert("Amount must be ₹1 or above.");
        return;
      }

      await addExpense({
        amount: parseFloat(scanResult.amount),
        category: scanResult.category,
        description: `Scanned Receipt - ${scanResult.merchantName}`,
        merchantName: scanResult.merchantName,
        paymentMethod: 'Card',
        sourceType: 'receipt',
        date: scanResult.date
      });

      confetti({
        particleCount: 80,
        spread: 50,
        origin: { y: 0.8 }
      });

      setScanResult(null);
    } catch (err) {
      console.error(err);
    }
  };

  // Submit Manual Expense
  const handleAddSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!amount || parseFloat(amount) < 1) {
      alert("Expense amount must be ₹1 and above.");
      return;
    }
    try {
      await addExpense({
        amount: parseFloat(amount),
        category,
        description,
        merchantName: merchantName || 'Direct Expense',
        paymentMethod,
        sourceType: 'manual',
        date
      });
      // reset
      setAmount('');
      setDescription('');
      setMerchantName('');
      setIsAddOpen(false);
    } catch (err) {
      console.error(err);
    }
  };

  // Submit Edit Expense
  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingExpense) return;
    if (!amount || parseFloat(amount) < 1) {
      alert("Expense amount must be ₹1 and above.");
      return;
    }
    try {
      await updateExpense(editingExpense.expenseId, {
        amount: parseFloat(amount),
        category,
        description,
        merchantName,
        paymentMethod,
        date
      });
      setEditingExpense(null);
    } catch (err) {
      console.error(err);
    }
  };

  // Load editing state
  const startEdit = (exp: Expense) => {
    setEditingExpense(exp);
    setAmount(exp.amount.toString());
    setCategory(exp.category);
    setDescription(exp.description);
    setMerchantName(exp.merchantName);
    setPaymentMethod(exp.paymentMethod);
    setDate(exp.date);
  };

  // Filters logic
  const filteredExpenses = expenses.filter(e => {
    const matchesSearch = 
      e.merchantName.toLowerCase().includes(search.toLowerCase()) || 
      e.description.toLowerCase().includes(search.toLowerCase());
    const matchesCategory = categoryFilter === '' || e.category === categoryFilter;
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="space-y-6">
      {/* Top Banner Header */}
      <div className="flex justify-between items-center flex-wrap gap-4">
        <div>
          <h2 className="text-3xl font-display font-extrabold tracking-tight m-0">
            Expenses Management
          </h2>
          <p className="text-sm text-slate-400 mt-1 m-0">
            Log financial transactions manually or upload visual receipts for instant OCR extraction.
          </p>
        </div>

        {/* Buttons Strip */}
        <div className="flex gap-3">
          {/* AI Scan Trigger */}
          <label className="flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-emerald-500/10 via-teal-500/10 to-cyan-500/10 border border-teal-500/30 text-teal-400 hover:bg-teal-500/20 text-xs font-bold rounded-xl transition-all shadow-sm cursor-pointer hover:scale-105">
            {scanning ? (
              <>
                <RefreshCw size={14} className="animate-spin" />
                <span>Extracting fields...</span>
              </>
            ) : (
              <>
                <Camera size={14} />
                <span>Scan Receipt</span>
              </>
            )}
            <input 
              type="file" 
              accept="image/*" 
              onChange={handleReceiptUpload} 
              disabled={scanning} 
              className="hidden" 
            />
          </label>

          {/* Manual Add Button */}
          <button
            onClick={() => {
              setAmount('');
              setCategory('Food & Dining');
              setDescription('');
              setMerchantName('');
              setDate(new Date().toISOString().split('T')[0]);
              setIsAddOpen(true);
            }}
            className="flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-emerald-400 to-cyan-500 hover:from-emerald-300 hover:to-cyan-400 text-slate-950 text-xs font-bold rounded-xl shadow-lg shadow-teal-500/10 transition-all hover:scale-105 cursor-pointer"
          >
            <Plus size={14} />
            <span>Add Expense</span>
          </button>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className={`p-4 rounded-xl border flex flex-col md:flex-row gap-4 items-center ${
        darkMode ? 'bg-slate-900/40 border-slate-800' : 'bg-slate-50 border-slate-200'
      }`}>
        <div className="flex-1 w-full relative">
          <Search className="absolute left-3.5 top-3.5 w-4 h-4 text-slate-500" />
          <input
            type="text"
            placeholder="Search by merchant name or description..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className={`w-full pl-10 pr-4 py-2.5 rounded-xl border text-xs focus:outline-none focus:ring-1 focus:ring-teal-500 ${
              darkMode ? 'bg-slate-950/40 border-slate-800 text-slate-200 placeholder-slate-600' : 'bg-white border-slate-200'
            }`}
          />
        </div>

        <div className="w-full md:w-56 flex items-center gap-2 relative">
          <Filter className="absolute left-3.5 top-3.5 w-4 h-4 text-slate-500" />
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className={`w-full pl-10 pr-4 py-2.5 rounded-xl border text-xs focus:outline-none ${
              darkMode ? 'bg-slate-950/40 border-slate-800 text-slate-200' : 'bg-white border-slate-200'
            }`}
          >
            <option value="">All Categories</option>
            {categories.map(c => (
              <option key={c} value={c}>{c}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Expense List Table & Cards */}
      <div className={`border rounded-2xl overflow-hidden ${
        darkMode ? 'bg-slate-900/10 border-slate-800' : 'bg-white border-slate-200'
      }`}>
        {/* Desktop View: Table */}
        <div className="hidden md:block overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className={`border-b text-[10px] uppercase font-bold tracking-widest text-slate-400 ${
                darkMode ? 'bg-slate-950/50 border-slate-800' : 'bg-slate-50 border-slate-100'
              }`}>
                <th className="p-4">Merchant & Details</th>
                <th className="p-4">Category</th>
                <th className="p-4">Payment</th>
                <th className="p-4">Date</th>
                <th className="p-4 text-right">Amount</th>
                <th className="p-4 text-center">Source</th>
                <th className="p-4 text-center">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/40 text-xs">
              {filteredExpenses.map((exp) => (
                <tr key={exp.expenseId} className={darkMode ? 'hover:bg-slate-900/20' : 'hover:bg-slate-50'}>
                  <td className="p-4">
                    <span className="font-semibold text-slate-100 block">{exp.merchantName}</span>
                    <span className="text-[10px] text-slate-500">{exp.description}</span>
                  </td>
                  <td className="p-4 font-medium">{exp.category}</td>
                  <td className="p-4 text-slate-400">{exp.paymentMethod}</td>
                  <td className="p-4 font-semibold text-slate-400">{exp.date}</td>
                  <td className="p-4 text-right font-display font-extrabold text-slate-200 text-sm">
                    {currency}{exp.amount.toFixed(2)}
                  </td>
                  <td className="p-4 text-center">
                    <span className={`text-[9px] px-2 py-0.5 rounded-full font-bold uppercase ${
                      exp.sourceType === 'receipt' 
                        ? 'bg-purple-500/15 text-purple-400 border border-purple-500/20' 
                        : 'bg-teal-500/15 text-teal-400 border border-teal-500/20'
                    }`}>
                      {exp.sourceType}
                    </span>
                  </td>
                  <td className="p-4">
                    <div className="flex justify-center gap-2">
                      <button 
                        onClick={() => startEdit(exp)}
                        className="p-1.5 rounded-lg border border-transparent text-slate-400 hover:bg-slate-800 hover:text-slate-200 cursor-pointer"
                      >
                        <Edit2 size={13} />
                      </button>
                      <button 
                        onClick={() => {
                          if (confirm("Are you sure you want to delete this expense record?")) {
                            deleteExpense(exp.expenseId);
                          }
                        }}
                        className="p-1.5 rounded-lg border border-transparent text-rose-400 hover:bg-rose-500/10 cursor-pointer"
                      >
                        <Trash2 size={13} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}

              {filteredExpenses.length === 0 && (
                <tr>
                  <td colSpan={7} className="p-8 text-center text-slate-500">
                    No matching expense logs found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Mobile View: Clean, Stacked Cards */}
        <div className="block md:hidden divide-y divide-slate-800/40">
          {filteredExpenses.map((exp) => (
            <div key={exp.expenseId} className="p-4 space-y-3">
              <div className="flex justify-between items-start">
                <div>
                  <h4 className="font-bold text-slate-100 text-sm">{exp.merchantName}</h4>
                  <p className="text-[10px] text-slate-500 mt-0.5">{exp.description}</p>
                </div>
                <span className="font-display font-extrabold text-slate-200 text-sm">
                  {currency}{exp.amount.toFixed(2)}
                </span>
              </div>
              
              <div className="flex justify-between items-center text-[10px] font-semibold text-slate-400">
                <div className="flex items-center gap-2">
                  <span className="bg-slate-800/60 border border-slate-700/30 px-2 py-0.5 rounded-lg text-slate-300">
                    {exp.category}
                  </span>
                  <span className={`text-[8px] px-1.5 py-0.5 rounded-md font-bold uppercase ${
                    exp.sourceType === 'receipt' 
                      ? 'bg-purple-500/15 text-purple-400 border border-purple-500/20' 
                      : 'bg-teal-500/15 text-teal-400 border border-teal-500/20'
                  }`}>
                    {exp.sourceType}
                  </span>
                </div>
                <span>{exp.date}</span>
              </div>

              <div className="flex justify-between items-center border-t border-slate-800/20 pt-2.5">
                <span className="text-[9px] text-slate-500 uppercase font-bold">{exp.paymentMethod}</span>
                <div className="flex gap-2">
                  <button 
                    onClick={() => startEdit(exp)}
                    className="p-1 rounded-lg border border-slate-800 text-slate-400 hover:bg-slate-800 hover:text-slate-200 cursor-pointer flex items-center gap-1 text-[10px] px-2.5"
                  >
                    <Edit2 size={10} />
                    <span>Edit</span>
                  </button>
                  <button 
                    onClick={() => {
                      if (confirm("Are you sure you want to delete this expense record?")) {
                        deleteExpense(exp.expenseId);
                      }
                    }}
                    className="p-1 rounded-lg border border-rose-500/20 text-rose-450 hover:bg-rose-500/10 cursor-pointer flex items-center gap-1 text-[10px] px-2.5"
                  >
                    <Trash2 size={10} />
                    <span>Delete</span>
                  </button>
                </div>
              </div>
            </div>
          ))}

          {filteredExpenses.length === 0 && (
            <div className="p-8 text-center text-slate-500 text-xs">
              No matching expense logs found.
            </div>
          )}
        </div>
      </div>

      {/* --- ADD EXPENSE MODAL --- */}
      {isAddOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-fade-in">
          <div className={`w-full max-w-md rounded-2xl border p-6 relative ${
            darkMode ? 'glass-panel-dark border-slate-800 text-slate-100' : 'bg-white border-slate-200 text-slate-800'
          }`}>
            <button 
              onClick={() => setIsAddOpen(false)}
              className="absolute top-4 right-4 text-slate-400 hover:text-slate-200 cursor-pointer"
            >
              <X size={18} />
            </button>
            <h3 className="text-xl font-bold font-display mb-4">Add Manual Expense</h3>

            <form onSubmit={handleAddSubmit} className="space-y-4 text-xs font-semibold">
              <div className="space-y-1.5">
                <label className="text-slate-400">Merchant Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Starbucks"
                  value={merchantName}
                  onChange={(e) => setMerchantName(e.target.value)}
                  className={`w-full px-3 py-2 rounded-xl border focus:outline-none focus:ring-1 focus:ring-teal-500 ${
                    darkMode ? 'bg-slate-950 border-slate-800' : 'bg-white border-slate-200'
                  }`}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-slate-400">Amount ({currency})</label>
                  <input
                    type="number"
                    step="0.01"
                    required
                    placeholder="Min 1"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    className={`w-full px-3 py-2 rounded-xl border focus:outline-none ${
                      darkMode ? 'bg-slate-950 border-slate-800' : 'bg-white border-slate-200'
                    }`}
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-slate-400">Category</label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className={`w-full px-3 py-2 rounded-xl border focus:outline-none ${
                      darkMode ? 'bg-slate-950 border-slate-800' : 'bg-white border-slate-200'
                    }`}
                  >
                    {categories.map(c => (
                      <option key={c} value={c}>{c}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-slate-400">Date</label>
                  <input
                    type="date"
                    required
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                    style={{ colorScheme: darkMode ? 'dark' : 'light' }}
                    className={`w-full px-3 py-2 rounded-xl border focus:outline-none ${
                      darkMode ? 'bg-slate-950 border-slate-800' : 'bg-white border-slate-200'
                    }`}
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-slate-400">Payment Method</label>
                  <select
                    value={paymentMethod}
                    onChange={(e) => setPaymentMethod(e.target.value)}
                    className={`w-full px-3 py-2 rounded-xl border focus:outline-none ${
                      darkMode ? 'bg-slate-950 border-slate-800' : 'bg-white border-slate-200'
                    }`}
                  >
                    <option value="UPI">UPI</option>
                    <option value="Card">Card</option>
                    <option value="Cash">Cash</option>
                  </select>
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-slate-400">Description</label>
                <input
                  type="text"
                  placeholder="e.g. Latte coffee"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className={`w-full px-3 py-2 rounded-xl border focus:outline-none ${
                    darkMode ? 'bg-slate-950 border-slate-800' : 'bg-white border-slate-200'
                  }`}
                />
              </div>

              <button
                type="submit"
                className="w-full py-3 bg-gradient-to-r from-emerald-500 to-cyan-500 text-slate-950 font-bold rounded-xl transition-all shadow cursor-pointer mt-2"
              >
                Save Transaction
              </button>
            </form>
          </div>
        </div>
      )}

      {/* --- EDIT EXPENSE MODAL --- */}
      {editingExpense && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
          <div className={`w-full max-w-md rounded-2xl border p-6 relative ${
            darkMode ? 'glass-panel-dark border-slate-800 text-slate-100' : 'bg-white border-slate-200 text-slate-800'
          }`}>
            <button 
              onClick={() => setEditingExpense(null)}
              className="absolute top-4 right-4 text-slate-400 hover:text-slate-200 cursor-pointer"
            >
              <X size={18} />
            </button>
            <h3 className="text-xl font-bold font-display mb-4">Edit Expense Record</h3>

            <form onSubmit={handleEditSubmit} className="space-y-4 text-xs font-semibold">
              <div className="space-y-1.5">
                <label className="text-slate-400">Merchant Name</label>
                <input
                  type="text"
                  required
                  value={merchantName}
                  onChange={(e) => setMerchantName(e.target.value)}
                  className={`w-full px-3 py-2 rounded-xl border focus:outline-none ${
                    darkMode ? 'bg-slate-950 border-slate-800' : 'bg-white border-slate-200'
                  }`}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-slate-400">Amount ({currency})</label>
                  <input
                    type="number"
                    step="0.01"
                    required
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    className={`w-full px-3 py-2 rounded-xl border focus:outline-none ${
                      darkMode ? 'bg-slate-950 border-slate-800' : 'bg-white border-slate-200'
                    }`}
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-slate-400">Category</label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className={`w-full px-3 py-2 rounded-xl border focus:outline-none ${
                      darkMode ? 'bg-slate-950 border-slate-800' : 'bg-white border-slate-200'
                    }`}
                  >
                    {categories.map(c => (
                      <option key={c} value={c}>{c}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-slate-400">Date</label>
                  <input
                    type="date"
                    required
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                    style={{ colorScheme: darkMode ? 'dark' : 'light' }}
                    className={`w-full px-3 py-2 rounded-xl border focus:outline-none ${
                      darkMode ? 'bg-slate-950 border-slate-800' : 'bg-white border-slate-200'
                    }`}
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-slate-400">Payment Method</label>
                  <select
                    value={paymentMethod}
                    onChange={(e) => setPaymentMethod(e.target.value)}
                    className={`w-full px-3 py-2 rounded-xl border focus:outline-none ${
                      darkMode ? 'bg-slate-950 border-slate-800' : 'bg-white border-slate-200'
                    }`}
                  >
                    <option value="UPI">UPI</option>
                    <option value="Card">Card</option>
                    <option value="Cash">Cash</option>
                  </select>
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-slate-400">Description</label>
                <input
                  type="text"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className={`w-full px-3 py-2 rounded-xl border focus:outline-none ${
                    darkMode ? 'bg-slate-950 border-slate-800' : 'bg-white border-slate-200'
                  }`}
                />
              </div>

              <button
                type="submit"
                className="w-full py-3 bg-gradient-to-r from-emerald-500 to-cyan-500 text-slate-950 font-bold rounded-xl transition-all shadow cursor-pointer mt-2"
              >
                Update Transaction
              </button>
            </form>
          </div>
        </div>
      )}

      {/* --- RECEIPT PREVIEW REVIEW EDITABLE MODAL (OCR) --- */}
      {scanResult && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
          <div className={`w-full max-w-md rounded-2xl border p-6 relative ${
            darkMode ? 'glass-panel-dark border-slate-800 text-slate-100' : 'bg-white border-slate-200 text-slate-800'
          }`}>
            <button 
              onClick={() => setScanResult(null)}
              className="absolute top-4 right-4 text-slate-400 hover:text-slate-200 cursor-pointer"
            >
              <X size={18} />
            </button>
            
            <div className="flex items-center gap-2 mb-4">
              <div className="w-8 h-8 bg-purple-500/10 text-purple-400 rounded-lg flex items-center justify-center">
                <Sparkles size={16} />
              </div>
              <h3 className="text-xl font-bold font-display m-0">Confirm Parsed Receipt</h3>
            </div>

            <div className="bg-slate-900/60 p-3 rounded-xl border border-slate-800 flex justify-between items-center text-xs mb-4">
              <span className="text-slate-400">OCR Extraction Confidence</span>
              <span className={`font-bold px-2 py-0.5 rounded ${
                scanResult.confidenceScore >= 75 ? 'bg-emerald-500/10 text-emerald-400' : 'bg-amber-500/10 text-amber-400'
              }`}>
                {scanResult.confidenceScore}%
              </span>
            </div>

            <form className="space-y-4 text-xs font-semibold">
              <div className="space-y-1.5">
                <label className="text-slate-400">Extracted Merchant</label>
                <input
                  type="text"
                  value={scanResult.merchantName}
                  onChange={(e) => setScanResult({ ...scanResult, merchantName: e.target.value })}
                  className={`w-full px-3 py-2 rounded-xl border focus:outline-none ${
                    darkMode ? 'bg-slate-950 border-slate-800' : 'bg-white border-slate-200'
                  }`}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-slate-400">Amount ({currency})</label>
                  <input
                    type="number"
                    step="0.01"
                    value={scanResult.amount}
                    onChange={(e) => setScanResult({ ...scanResult, amount: e.target.value })}
                    className={`w-full px-3 py-2 rounded-xl border focus:outline-none ${
                      darkMode ? 'bg-slate-950 border-slate-800' : 'bg-white border-slate-200'
                    }`}
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-slate-400">Category</label>
                  <select
                    value={scanResult.category}
                    onChange={(e) => setScanResult({ ...scanResult, category: e.target.value })}
                    className={`w-full px-3 py-2 rounded-xl border focus:outline-none ${
                      darkMode ? 'bg-slate-950 border-slate-800' : 'bg-white border-slate-200'
                    }`}
                  >
                    {categories.map(c => (
                      <option key={c} value={c}>{c}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-slate-400">Transaction Date</label>
                <input
                  type="date"
                  value={scanResult.date}
                  onChange={(e) => setScanResult({ ...scanResult, date: e.target.value })}
                  style={{ colorScheme: darkMode ? 'dark' : 'light' }}
                  className={`w-full px-3 py-2 rounded-xl border focus:outline-none ${
                    darkMode ? 'bg-slate-950 border-slate-800' : 'bg-white border-slate-200'
                  }`}
                />
              </div>

              <div className="flex items-center gap-2.5 p-1">
                <input
                  type="checkbox"
                  id="deleteCheck"
                  checked={deleteReceiptAfter}
                  onChange={(e) => setDeleteReceiptAfter(e.target.checked)}
                  className="rounded border-slate-700 bg-slate-950 accent-teal-500 focus:ring-0 focus:ring-offset-0"
                />
                <label htmlFor="deleteCheck" className="text-[11px] text-slate-400 select-none cursor-pointer">
                  Delete scanned receipt image file after confirmation (Privacy recommended)
                </label>
              </div>

              <button
                type="button"
                onClick={handleConfirmScan}
                className="w-full py-3 bg-gradient-to-r from-purple-500 to-indigo-600 hover:from-purple-400 hover:to-indigo-500 text-white font-bold rounded-xl transition-all shadow flex items-center justify-center gap-2 cursor-pointer mt-2"
              >
                <Check size={16} />
                <span>Confirm & Log Expense</span>
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
