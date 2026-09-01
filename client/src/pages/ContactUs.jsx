import React, { useState } from 'react';
import { 
  Phone, 
  Mail, 
  MapPin, 
  MessageCircle, 
  Clock, 
  Send, 
  Check, 
  Sparkles, 
  ArrowLeft,
  ShieldCheck
} from 'lucide-react';
import { useCart } from '../context/CartContext';

export default function ContactUs({ onNavigate }) {
  const { siteSettings } = useCart();
  const [form, setForm] = useState({ name: '', phone: '', email: '', message: '', subject: 'Fragrance Consultation' });
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    setSubmitted(true);
    setTimeout(() => {
      setSubmitted(false);
      setForm({ name: '', phone: '', email: '', message: '', subject: 'Fragrance Consultation' });
    }, 4000);
  };

  const whatsappClean = (siteSettings?.whatsapp_number || '+8801711223344').replace(/[^0-9]/g, '');

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-10 animate-in fade-in">
      
      {/* Universal Back Button */}
      <div className="flex items-center justify-between">
        <button
          onClick={() => onNavigate('home')}
          className="flex items-center space-x-1.5 text-xs font-bold text-slate-600 hover:text-amber-800 transition-colors bg-white px-3 py-1.5 rounded-xl border border-amber-200/80 shadow-2xs"
        >
          <ArrowLeft className="w-4 h-4 text-amber-700" />
          <span>← Back to Home</span>
        </button>

        <span className="text-xs font-bold text-amber-800 bg-amber-50 px-3 py-1 rounded-full border border-amber-200">
          AL ANSAR Customer Care & Concierge
        </span>
      </div>

      {/* Header */}
      <div className="text-center space-y-3 max-w-2xl mx-auto">
        <div className="w-12 h-12 rounded-2xl bg-amber-500/10 text-amber-600 flex items-center justify-center mx-auto">
          <Sparkles className="w-6 h-6" />
        </div>
        <h1 className="text-3xl sm:text-4xl font-black text-slate-900">
          Get in Touch with AL ANSAR
        </h1>
        <p className="text-xs sm:text-sm text-slate-500">
          Have queries regarding perfume longevity, custom gift box hampers, or bulk corporate fragrance gifting? We are always here to assist you.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Left Contact Cards (5 cols) */}
        <div className="lg:col-span-5 space-y-4">
          
          {/* Direct WhatsApp Card */}
          <a
            href={`https://wa.me/${whatsappClean}?text=Assalamu%20Alaikum%20AL%20ANSAR!%20I%20am%20interested%20in%20your%20fragrance%20collection.`}
            target="_blank"
            rel="noopener noreferrer"
            className="p-5 bg-gradient-to-r from-emerald-800 to-emerald-950 text-white rounded-3xl border border-emerald-500/30 shadow-xl flex items-center justify-between group hover:scale-102 transition-all block"
          >
            <div className="flex items-center space-x-3.5">
              <div className="w-12 h-12 rounded-2xl bg-emerald-500/20 flex items-center justify-center text-emerald-400 group-hover:scale-110 transition-transform">
                <MessageCircle className="w-6 h-6 fill-current" />
              </div>
              <div>
                <span className="text-[10px] font-bold text-emerald-300 uppercase tracking-wider block">Instant Chat</span>
                <h4 className="text-sm font-bold text-white">Direct WhatsApp Support</h4>
                <p className="text-[11px] text-emerald-200 mt-0.5">{siteSettings?.whatsapp_number || '+880 1711-223344'}</p>
              </div>
            </div>
            <span className="px-3 py-1.5 bg-emerald-500 text-slate-950 text-xs font-black rounded-xl">
              Chat Now
            </span>
          </a>

          {/* Showroom & Hotline Card */}
          <div className="bg-white p-6 rounded-3xl border border-amber-100 shadow-2xs space-y-4 text-xs">
            <h3 className="font-bold text-slate-900 uppercase tracking-wider text-[11px]">Showroom & Headquarters</h3>
            
            <div className="space-y-3 text-slate-600">
              <div className="flex items-start space-x-3">
                <MapPin className="w-4 h-4 text-amber-600 flex-shrink-0 mt-0.5" />
                <div>
                  <strong className="text-slate-900 block">Flagship Boutique Address:</strong>
                  <span>{siteSettings?.showroom_address || siteSettings?.store_address || 'Al Ansar Plaza, Level 4, Sector 3, Uttara, Dhaka-1230'}</span>
                </div>
              </div>

              <div className="flex items-start space-x-3">
                <Phone className="w-4 h-4 text-emerald-600 flex-shrink-0 mt-0.5" />
                <div>
                  <strong className="text-slate-900 block">Customer Hotline:</strong>
                  <span>{siteSettings?.store_phone || '+880 1711-223344'}</span>
                </div>
              </div>

              <div className="flex items-start space-x-3">
                <Mail className="w-4 h-4 text-amber-600 flex-shrink-0 mt-0.5" />
                <div>
                  <strong className="text-slate-900 block">Email Inquiries:</strong>
                  <span>{siteSettings?.store_email || 'info@alansarfragrance.com'}</span>
                </div>
              </div>

              <div className="flex items-start space-x-3">
                <Clock className="w-4 h-4 text-purple-600 flex-shrink-0 mt-0.5" />
                <div>
                  <strong className="text-slate-900 block">Opening Hours:</strong>
                  <span>Saturday - Thursday: 10:00 AM - 10:00 PM</span>
                  <span className="block text-[11px] text-slate-400">Friday: 2:30 PM - 10:30 PM</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right Contact Form (7 cols) */}
        <div className="lg:col-span-7">
          <div className="bg-white p-6 sm:p-8 rounded-3xl border border-amber-100 shadow-2xs space-y-6">
            <div>
              <h3 className="text-base font-bold text-slate-900">Send a Message to AL ANSAR Concierge</h3>
              <p className="text-xs text-slate-500 mt-0.5">Fill out the details below and our team will get back to you within 2-4 hours.</p>
            </div>

            {submitted ? (
              <div className="p-6 bg-emerald-50 border border-emerald-200 rounded-2xl text-center space-y-2 animate-in fade-in">
                <div className="w-10 h-10 rounded-full bg-emerald-600 text-white flex items-center justify-center mx-auto">
                  <Check className="w-5 h-5" />
                </div>
                <h4 className="text-sm font-bold text-emerald-900">Message Sent Successfully!</h4>
                <p className="text-xs text-emerald-700">Thank you for reaching out. We will contact you shortly.</p>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4 text-xs">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="font-bold text-slate-700 block mb-1">Your Full Name *</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Tanvir Ahmed"
                      value={form.name}
                      onChange={(e) => setForm({ ...form, name: e.target.value })}
                      className="w-full px-3.5 py-2.5 bg-slate-50 rounded-xl border border-slate-200 focus:outline-none focus:border-amber-500"
                    />
                  </div>

                  <div>
                    <label className="font-bold text-slate-700 block mb-1">Phone Number (11 digits) *</label>
                    <input
                      type="text"
                      required
                      placeholder="017XXXXXXXX"
                      value={form.phone}
                      onChange={(e) => setForm({ ...form, phone: e.target.value })}
                      className="w-full px-3.5 py-2.5 bg-slate-50 rounded-xl border border-slate-200 focus:outline-none focus:border-amber-500 font-mono font-bold"
                    />
                  </div>

                  <div className="sm:col-span-2">
                    <label className="font-bold text-slate-700 block mb-1">Email Address (Optional)</label>
                    <input
                      type="email"
                      placeholder="name@example.com"
                      value={form.email}
                      onChange={(e) => setForm({ ...form, email: e.target.value })}
                      className="w-full px-3.5 py-2.5 bg-slate-50 rounded-xl border border-slate-200 focus:outline-none focus:border-amber-500"
                    />
                  </div>

                  <div className="sm:col-span-2">
                    <label className="font-bold text-slate-700 block mb-1">Inquiry Topic</label>
                    <select
                      value={form.subject}
                      onChange={(e) => setForm({ ...form, subject: e.target.value })}
                      className="w-full px-3.5 py-2.5 bg-slate-50 rounded-xl border border-slate-200 focus:outline-none focus:border-amber-500 font-medium"
                    >
                      <option value="Fragrance Consultation">Fragrance Notes Consultation</option>
                      <option value="Custom Gift Box Hamper">Custom Gift Box & Hamper Order</option>
                      <option value="Delivery & Tracking">Delivery & Tracking Status</option>
                      <option value="Corporate / Bulk Order">Corporate & Bulk Gifting</option>
                      <option value="Other">Other Query</option>
                    </select>
                  </div>

                  <div className="sm:col-span-2">
                    <label className="font-bold text-slate-700 block mb-1">Your Message *</label>
                    <textarea
                      required
                      rows={3}
                      placeholder="Write your query or special requirements..."
                      value={form.message}
                      onChange={(e) => setForm({ ...form, message: e.target.value })}
                      className="w-full px-3.5 py-2.5 bg-slate-50 rounded-xl border border-slate-200 focus:outline-none focus:border-amber-500"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  className="px-6 py-3 bg-gradient-to-r from-amber-600 to-amber-700 hover:from-amber-500 hover:to-amber-600 text-slate-950 font-black rounded-xl shadow-md transition-all flex items-center space-x-2"
                >
                  <Send className="w-4 h-4" />
                  <span>Send Message</span>
                </button>
              </form>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
