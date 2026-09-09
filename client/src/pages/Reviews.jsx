import React, { useState, useEffect } from 'react';
import { 
  Star, 
  CheckCircle2, 
  MessageSquare, 
  Sparkles, 
  ArrowLeft, 
  Send, 
  User, 
  Calendar,
  ThumbsUp,
  ShieldCheck,
  Check
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import useScrollLock from '../hooks/useScrollLock';

export default function Reviews({ onNavigate, onBack }) {
  const { user } = useAuth();
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showSubmitModal, setShowSubmitModal] = useState(false);

  // Lock body scroll when review modal is open
  useScrollLock(showSubmitModal);
  const [rating, setRating] = useState(5);
  const [hoverRating, setHoverRating] = useState(0);
  const [name, setName] = useState(user?.name || '');
  const [comment, setComment] = useState('');
  const [productTitle, setProductTitle] = useState('আল আনসার সুপার শপ সার্ভিস ও প্রোডাক্ট');
  const [submitting, setSubmitting] = useState(false);
  const [successToast, setSuccessToast] = useState('');

  const toBengaliDigits = (str) => {
    const bengaliDigits = ['০', '১', '২', '৩', '৪', '৫', '৬', '৭', '৮', '৯'];
    return (str || '').toString().replace(/[0-9]/g, (w) => bengaliDigits[+w]);
  };

  const loadReviews = async () => {
    try {
      const res = await fetch('/api/reviews');
      const data = await res.json();
      if (data.success && Array.isArray(data.reviews)) {
        setReviews(data.reviews);
      }
    } catch (err) {
      console.error('Error fetching reviews:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadReviews();
  }, []);

  const handleSubmitReview = async (e) => {
    e.preventDefault();
    if (!name.trim() || !comment.trim()) return;

    setSubmitting(true);
    try {
      const res = await fetch('/api/reviews', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          user_name: name.trim(),
          rating,
          comment: comment.trim(),
          product_title: productTitle.trim()
        })
      });
      const data = await res.json();
      if (data.success) {
        setShowSubmitModal(false);
        setComment('');
        setSuccessToast('আপনার মূল্যবান রিভিউ সফলভাবে জমা হয়েছে! ধন্যবাদ।');
        setTimeout(() => setSuccessToast(''), 4000);
        loadReviews();
      }
    } catch (err) {
      console.error('Error submitting review:', err);
    } finally {
      setSubmitting(false);
    }
  };

  const averageRating = reviews.length > 0
    ? (reviews.reduce((acc, r) => acc + (r.rating || 5), 0) / reviews.length).toFixed(1)
    : '5.0';

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 font-sans animate-in fade-in">
      
      {/* Toast */}
      {successToast && (
        <div className="fixed top-6 right-6 z-50 bg-gradient-to-r from-emerald-600 to-emerald-700 text-white px-5 py-3 rounded-2xl shadow-2xl border border-emerald-400 flex items-center space-x-2 animate-in slide-in-from-top-3">
          <Check className="w-4 h-4 text-emerald-200" />
          <span className="text-xs font-bold">{successToast}</span>
        </div>
      )}

      {/* Top Header & Back Button */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-amber-200">
        <div className="space-y-1">
          <button
            onClick={onBack || (() => onNavigate('home'))}
            className="inline-flex items-center space-x-2 text-xs font-black text-amber-900 bg-amber-100 hover:bg-amber-200 px-4 py-2 rounded-xl border border-amber-300 transition-all cursor-pointer shadow-2xs mb-2"
          >
            <ArrowLeft className="w-4 h-4 text-amber-800" />
            <span>← পিছনে যান (Back)</span>
          </button>
          <div className="flex items-center space-x-2">
            <span className="text-xs font-black text-amber-700 uppercase tracking-wider bg-amber-100 px-2.5 py-0.5 rounded-md">
              গ্রাহক মূল্যায়ন ও মতামত
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900">কাস্টমার রিভিউ ও রেটিং</h1>
          <p className="text-xs font-semibold text-slate-600">
            আল আনসার সুপার শপের পণ্য ও সার্ভিসের বাস্তব অভিজ্ঞতা ও গ্রাহক প্রতিক্রিয়া
          </p>
        </div>

        <button
          onClick={() => setShowSubmitModal(true)}
          className="px-6 py-3.5 bg-gradient-to-r from-amber-600 to-amber-700 hover:from-amber-500 hover:to-amber-600 text-slate-950 font-black text-xs rounded-2xl shadow-lg transition-all flex items-center space-x-2 self-start sm:self-auto cursor-pointer"
        >
          <Sparkles className="w-4 h-4" />
          <span>আপনার রিভিউ দিন</span>
        </button>
      </div>

      {/* Rating Overview Summary Banner */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 p-6 sm:p-8 bg-gradient-to-br from-slate-950 via-emerald-950 to-slate-950 rounded-3xl text-white shadow-xl border border-amber-900/40">
        <div className="text-center md:text-left flex flex-col justify-center space-y-2 border-b md:border-b-0 md:border-r border-slate-800 pb-6 md:pb-0 md:pr-6">
          <span className="text-xs font-bold text-amber-400">সর্বমোট গড় রেটিং</span>
          <div className="flex items-baseline justify-center md:justify-start space-x-2">
            <span className="text-4xl sm:text-5xl font-black text-white">{toBengaliDigits(averageRating)}</span>
            <span className="text-sm text-slate-400 font-bold">/ ৫.০</span>
          </div>
          <div className="flex items-center justify-center md:justify-start space-x-1 text-amber-400">
            {[1, 2, 3, 4, 5].map(i => (
              <Star key={i} className="w-4 h-4 fill-amber-400 text-amber-400" />
            ))}
          </div>
          <p className="text-[11px] text-slate-400">মোট {toBengaliDigits(reviews.length)} টি যাচাইকৃত রিভিউ</p>
        </div>

        <div className="md:col-span-2 flex flex-col justify-center space-y-3">
          <h4 className="text-sm font-bold text-white flex items-center">
            <ShieldCheck className="w-4 h-4 mr-2 text-emerald-400" />
            শতভাগ খাঁটি ও সন্তুষ্ট গ্রাহক অভিজ্ঞতা
          </h4>
          <p className="text-xs text-slate-300 leading-relaxed font-medium">
            আল আনসার সুপার শপ সবসময় সততা, ১০০% খাঁটি পণ্য, ওজন ও পরিমাপে নিখুঁত মান এবং দ্রুততম ডেলিভারি প্রদানে প্রতিশ্রুতিবদ্ধ। পণ্য কেনার পর আপনার মূল্যবান মতামত অন্য গ্রাহকদের সঠিক পণ্য বেছে নিতে সহায়তা করে।
          </p>
        </div>
      </div>

      {/* Review List */}
      <div className="space-y-4">
        <h3 className="text-base font-black text-slate-900">সর্বশেষ রিভিউ সমূহ ({toBengaliDigits(reviews.length)})</h3>

        {reviews.length === 0 ? (
          <div className="p-12 text-center bg-white rounded-3xl border border-amber-100 text-slate-500 text-xs">
            এখনো কোনো রিভিউ জমা পড়েনি। প্রথম রিভিউটি আপনি দিন!
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {reviews.map(rev => (
              <div 
                key={rev.id} 
                className="p-5 sm:p-6 bg-white rounded-2xl border border-amber-200/90 shadow-xs hover:shadow-md transition-shadow space-y-3"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="w-9 h-9 rounded-full bg-gradient-to-tr from-amber-600 to-emerald-800 text-white flex items-center justify-center font-black text-xs shadow-xs">
                      {rev.user_name?.charAt(0)?.toUpperCase() || 'U'}
                    </div>
                    <div>
                      <h4 className="text-xs font-black text-slate-900">{rev.user_name}</h4>
                      <span className="text-[10px] text-emerald-700 font-bold flex items-center">
                        <CheckCircle2 className="w-3 h-3 mr-1 text-emerald-600" /> যাচাইকৃত ক্রেতা (Verified)
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center space-x-0.5 text-amber-500">
                    {[1, 2, 3, 4, 5].map(i => (
                      <Star 
                        key={i} 
                        className={`w-3.5 h-3.5 ${i <= (rev.rating || 5) ? 'fill-amber-400 text-amber-400' : 'text-slate-300'}`} 
                      />
                    ))}
                  </div>
                </div>

                <p className="text-xs font-semibold text-slate-700 leading-relaxed">
                  "{rev.comment}"
                </p>

                {rev.product_title && (
                  <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-[10px] font-semibold text-slate-500">
                    <span className="text-amber-800 font-bold truncate max-w-[200px]">{rev.product_title}</span>
                    <span>{new Date(rev.created_at || Date.now()).toLocaleDateString('bn-BD')}</span>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Review Submission Modal */}
      {showSubmitModal && (
        <div 
          className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-xs flex items-center justify-center p-4 font-sans"
          onClick={() => setShowSubmitModal(false)}
        >
          <div 
            className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-8 space-y-4 shadow-2xl border border-amber-200 animate-in zoom-in-95 max-h-[92vh] overflow-y-auto modal-scrollable overscroll-contain"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="text-base font-black text-slate-900 flex items-center">
                <Star className="w-4 h-4 mr-2 text-amber-600 fill-amber-500" /> আপনার রিভিউ ও রেটিং দিন
              </h3>
              <button 
                onClick={() => setShowSubmitModal(false)}
                className="text-slate-400 hover:text-slate-700 cursor-pointer font-bold"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSubmitReview} className="space-y-4 text-xs">
              <div>
                <label className="font-bold text-slate-700 block mb-1">রেটিং প্রদান করুন *</label>
                <div className="flex items-center space-x-2 py-1">
                  {[1, 2, 3, 4, 5].map(star => (
                    <button
                      type="button"
                      key={star}
                      onMouseEnter={() => setHoverRating(star)}
                      onMouseLeave={() => setHoverRating(0)}
                      onClick={() => setRating(star)}
                      className="p-1 cursor-pointer transition-transform hover:scale-125"
                    >
                      <Star 
                        className={`w-7 h-7 ${
                          (hoverRating || rating) >= star 
                            ? 'fill-amber-400 text-amber-400' 
                            : 'text-slate-300'
                        }`} 
                      />
                    </button>
                  ))}
                  <span className="text-xs font-black text-amber-700 ml-2">
                    {rating === 5 ? 'অসাধারণ (৫/৫)' : rating === 4 ? 'খুব ভালো (৪/৫)' : rating === 3 ? 'ভালো (৩/৫)' : 'মোটামুটি'}
                  </span>
                </div>
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">আপনার নাম *</label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="যেমন: তানভীর আহমেদ"
                  className="w-full px-3.5 py-2.5 bg-slate-50 rounded-xl border border-slate-200 text-slate-900 font-semibold focus:outline-none focus:border-amber-500"
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">পণ্য বা সার্ভিস সম্পর্কিত মতামত *</label>
                <textarea
                  rows={3}
                  required
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  placeholder="পণ্যের কোয়ালিটি, ডেলিভারি ও সার্ভিস কেমন লেগেছে বিস্তারিত লিখুন..."
                  className="w-full px-3.5 py-2.5 bg-slate-50 rounded-xl border border-slate-200 text-slate-900 font-semibold focus:outline-none focus:border-amber-500 leading-relaxed"
                />
              </div>

              <div className="flex space-x-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowSubmitModal(false)}
                  className="flex-1 py-3 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl cursor-pointer"
                >
                  বাতিল
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="flex-1 py-3 bg-gradient-to-r from-amber-600 to-amber-700 hover:from-amber-500 hover:to-amber-600 text-slate-950 font-black rounded-xl shadow-md cursor-pointer disabled:opacity-50"
                >
                  {submitting ? 'জমা হচ্ছে...' : '✓ রিভিউ জমা দিন'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
