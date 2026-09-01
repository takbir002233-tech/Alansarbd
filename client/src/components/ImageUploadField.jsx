import React, { useState, useRef } from 'react';
import { UploadCloud, Image as ImageIcon, X, Check, Link, Sparkles, FolderOpen } from 'lucide-react';

export default function ImageUploadField({ 
  value, 
  onChange, 
  label = 'Product Image / Photo (প্রোডাক্টের ছবি) *', 
  aspect = 'square',
  helper = 'Select photo from computer/phone OR paste direct image URL'
}) {
  const [activeTab, setActiveTab] = useState(value && value.startsWith('http') && !value.includes('/uploads/') ? 'link' : 'file');
  const [isUploading, setIsUploading] = useState(false);
  const [dragActive, setDragActive] = useState(false);
  const fileInputRef = useRef(null);

  const handleFile = async (file) => {
    if (!file || !file.type.startsWith('image/')) {
      alert('Please select a valid image file (JPG, PNG, WEBP, SVG).');
      return;
    }

    setIsUploading(true);

    try {
      const reader = new FileReader();
      reader.onloadend = async () => {
        const base64Data = reader.result;
        
        // Upload to server endpoint
        const res = await fetch('/api/upload', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            image: base64Data,
            filename: file.name
          })
        });

        const data = await res.json();
        if (data.success && data.url) {
          onChange(data.url);
        } else {
          // If server upload endpoint unavailable, store base64 data directly
          onChange(base64Data);
        }
        setIsUploading(false);
      };
      reader.readAsDataURL(file);
    } catch (err) {
      console.error('Upload error:', err);
      setIsUploading(false);
    }
  };

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFile(e.dataTransfer.files[0]);
    }
  };

  return (
    <div className="space-y-3 p-4 bg-slate-800/70 rounded-2xl border border-slate-700">
      
      {/* Field Label */}
      <div className="flex items-center justify-between">
        <label className="text-xs font-bold text-amber-400 flex items-center">
          <ImageIcon className="w-4 h-4 mr-1.5 text-amber-400" />
          {label}
        </label>
        {value && (
          <span className="text-[11px] text-emerald-400 font-bold flex items-center">
            <Check className="w-3 h-3 mr-1" /> Image Selected
          </span>
        )}
      </div>

      {/* Two Prominent Options Tabs (File Upload vs Image Link) */}
      <div className="grid grid-cols-2 gap-2 bg-slate-900 p-1 rounded-xl border border-slate-700">
        <button
          type="button"
          onClick={() => setActiveTab('file')}
          className={`py-2 px-3 rounded-lg text-xs font-bold transition-all flex items-center justify-center space-x-1.5 ${
            activeTab === 'file'
              ? 'bg-amber-600 text-slate-950 shadow-md font-black'
              : 'text-slate-400 hover:text-white hover:bg-slate-800'
          }`}
        >
          <FolderOpen className="w-3.5 h-3.5" />
          <span>📁 Device Upload (ফাইল আপলোড)</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('link')}
          className={`py-2 px-3 rounded-lg text-xs font-bold transition-all flex items-center justify-center space-x-1.5 ${
            activeTab === 'link'
              ? 'bg-amber-600 text-slate-950 shadow-md font-black'
              : 'text-slate-400 hover:text-white hover:bg-slate-800'
          }`}
        >
          <Link className="w-3.5 h-3.5" />
          <span>🔗 Image Link / URL (ছবির লিংক)</span>
        </button>
      </div>

      {/* Mode 1: Device File Upload Area */}
      {activeTab === 'file' && (
        <div
          onDragEnter={handleDrag}
          onDragOver={handleDrag}
          onDragLeave={handleDrag}
          onDrop={handleDrop}
          className={`relative border-2 border-dashed rounded-2xl p-5 transition-all text-center ${
            dragActive
              ? 'border-amber-400 bg-amber-500/15'
              : value
              ? 'border-emerald-500/60 bg-slate-900/80'
              : 'border-slate-600 bg-slate-900/50 hover:border-amber-400'
          }`}
        >
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={(e) => e.target.files?.[0] && handleFile(e.target.files[0])}
          />

          {value ? (
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="flex items-center space-x-3 text-left">
                <div className="w-16 h-16 rounded-xl overflow-hidden bg-slate-950 border border-slate-700 flex-shrink-0 shadow-md">
                  <img src={value} alt="Preview" className="w-full h-full object-cover" />
                </div>
                <div className="min-w-0">
                  <span className="text-xs font-bold text-emerald-400 flex items-center">
                    <Check className="w-3.5 h-3.5 mr-1" /> Photo Ready
                  </span>
                  <p className="text-[10px] text-slate-400 truncate max-w-xs font-mono mt-0.5">{value}</p>
                </div>
              </div>

              <div className="flex items-center space-x-2">
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="px-3.5 py-1.5 bg-slate-800 hover:bg-slate-700 text-white text-xs font-bold rounded-xl border border-slate-600 transition-colors"
                >
                  Change Photo
                </button>
                <button
                  type="button"
                  onClick={() => onChange('')}
                  className="p-1.5 bg-rose-900/60 hover:bg-rose-800 text-rose-300 rounded-xl transition-colors"
                  title="Remove Image"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>
          ) : (
            <div className="py-2 space-y-2.5">
              <div className="w-12 h-12 rounded-2xl bg-amber-500/10 text-amber-400 flex items-center justify-center mx-auto">
                {isUploading ? (
                  <div className="w-6 h-6 border-2 border-amber-400 border-t-transparent rounded-full animate-spin" />
                ) : (
                  <UploadCloud className="w-6 h-6" />
                )}
              </div>

              <div>
                <button
                  type="button"
                  disabled={isUploading}
                  onClick={() => fileInputRef.current?.click()}
                  className="px-5 py-2.5 bg-gradient-to-r from-amber-600 to-amber-700 hover:from-amber-500 hover:to-amber-600 text-slate-950 font-black text-xs rounded-xl shadow-md transition-all cursor-pointer inline-flex items-center space-x-2"
                >
                  <FolderOpen className="w-4 h-4" />
                  <span>{isUploading ? 'Uploading...' : '📁 Browse Photo from Device (কম্পিউটার/মোবাইল)'}</span>
                </button>
                <p className="text-[11px] text-slate-400 mt-1.5">Drag & drop photo file or click to browse</p>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Mode 2: Direct Image URL Input */}
      {activeTab === 'link' && (
        <div className="space-y-3 p-3 bg-slate-900/80 rounded-2xl border border-slate-700">
          <div>
            <label className="text-[11px] font-bold text-slate-300 block mb-1">
              Direct Image Web URL (ছবির লিঙ্ক)
            </label>
            <div className="relative">
              <input
                type="url"
                value={value || ''}
                onChange={(e) => onChange(e.target.value)}
                placeholder="https://images.unsplash.com/... or https://domain.com/photo.jpg"
                className="w-full pl-9 pr-3 py-2.5 bg-slate-800 text-xs rounded-xl border border-slate-700 text-white font-mono text-[11px] focus:outline-none focus:border-amber-500"
              />
              <Link className="w-4 h-4 text-amber-500 absolute left-3 top-3" />
            </div>
          </div>

          {/* Live Preview if URL entered */}
          {value && (
            <div className="flex items-center justify-between p-2.5 bg-slate-950 rounded-xl border border-slate-800">
              <div className="flex items-center space-x-3">
                <img src={value} alt="Preview" className="w-12 h-12 rounded-lg object-cover bg-slate-800" onError={(e) => e.target.style.display = 'none'} />
                <span className="text-xs font-bold text-emerald-400">✓ Valid Image URL Loaded</span>
              </div>
              <button
                type="button"
                onClick={() => onChange('')}
                className="p-1 bg-rose-900/60 hover:bg-rose-800 text-rose-300 rounded-lg"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          )}
        </div>
      )}

      <p className="text-[10px] text-slate-400">{helper}</p>
    </div>
  );
}
