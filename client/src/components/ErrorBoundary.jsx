import React from 'react';
import { AlertCircle, RefreshCw } from 'lucide-react';

export default class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('ErrorBoundary caught an error:', error, errorInfo);
  }

  handleReload = () => {
    this.setState({ hasError: false, error: null });
    window.location.reload();
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-[400px] flex flex-col items-center justify-center p-8 bg-slate-900 border border-slate-800 rounded-3xl text-center max-w-lg mx-auto my-12 shadow-2xl">
          <div className="w-14 h-14 rounded-2xl bg-rose-500/10 border border-rose-500/30 flex items-center justify-center text-rose-400 mb-4 shadow-lg shadow-rose-500/10">
            <AlertCircle className="w-7 h-7" />
          </div>
          <h2 className="text-lg font-black text-white mb-2 tracking-tight">
            একটি অপ্রত্যাশিত সমস্যা হয়েছে
          </h2>
          <p className="text-xs text-slate-400 mb-6 leading-relaxed">
            পেজটি রেন্ডার করার সময় একটি সমস্যা দেখা দিয়েছে। নিচের বোতামে ক্লিক করে পেজটি রিলোড করুন।
          </p>
          <button
            onClick={this.handleReload}
            className="flex items-center space-x-2 px-5 py-2.5 rounded-xl bg-amber-500 text-slate-950 font-bold text-xs hover:bg-amber-400 transition-all shadow-lg shadow-amber-500/20 active:scale-95"
          >
            <RefreshCw className="w-4 h-4" />
            <span>পেজ রিলোড করুন</span>
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}
