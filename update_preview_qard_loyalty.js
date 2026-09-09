const fs = require('fs');
const path = 'C:\\Users\\HP\\.gemini\\antigravity\\brain\\1ad9fe0d-4a65-40dd-aaae-eb41dc0ea843\\preview.html';

let html = fs.readFileSync(path, 'utf-8');

// 1. Replace button onclicks for Qard-e-Hasana and VIP Card in Navbar, Mobile Menu, Footer, and Slider
html = html.replace(/onclick="alert\('করযে হাসানা: বিনা সুদে ১০% তাৎক্ষণিক হালাল ঋণ সুবিধা আল আনসার সুপার শপে সক্রিয় আছে!'\);"/g, 'onclick="openQardModal();"');
html = html.replace(/onclick="alert\('আল আনসার ভিআইপি ক্রেডিট কার্ডে প্রতি কেনাকাটায় ক্যাশব্যাক ও রিওয়ার্ড পয়েন্ট পাওয়া যাবে!'\)"/g, 'onclick="openLoyaltyModal();"');
html = html.replace(/toggleMobileMenu\(\);\s*alert\('করযে হাসানা:[^']+'\);/g, 'toggleMobileMenu(); openQardModal();');
html = html.replace(/toggleMobileMenu\(\);\s*alert\('আল আনসার ভিআইপি:[^']+'\);/g, 'toggleMobileMenu(); openLoyaltyModal();');
html = html.replace(/onclick="alert\('করযে হাসানা সেবা চালু রয়েছে।'\)"/g, 'onclick="openQardModal();"');
html = html.replace(/onclick="alert\('ভিআইপি লয়ালটি কার্ড সুবিধা শীঘ্রই আসছে।'\)"/g, 'onclick="openLoyaltyModal();"');
html = html.replace(/onclick="alert\('করযে হাসানা: বিনা সুদে ১০% তাৎক্ষণিক হালাল ঋণ সুবিধা আল আনসার সুপার শপে সক্রিয়!'\);"/g, 'onclick="openQardModal();"');

// 2. Prepare HTML for Qard-e-Hasana Modal, Loyalty Card Modal, and Popups
const newModalsHtml = `
  <!-- ========================================== -->
  <!-- QARD-E-HASANA MODAL (MATCHES IMAGE 1 SKETCH) -->
  <!-- ========================================== -->
  <div id="qard-modal" class="fixed inset-0 z-50 hidden bg-slate-950/75 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 overflow-y-auto animate-in fade-in">
    <div class="bg-slate-50 w-full max-w-5xl rounded-3xl border border-amber-300/80 shadow-2xl overflow-hidden flex flex-col max-h-[92vh] my-auto">
      
      <!-- Modal Top Navbar -->
      <div class="bg-gradient-to-r from-emerald-950 via-slate-950 to-emerald-900 text-white px-5 py-3.5 flex items-center justify-between border-b border-amber-500/30">
        <div class="flex items-center space-x-2.5">
          <button onclick="closeQardModal();" class="inline-flex items-center space-x-1 text-xs font-black text-amber-900 bg-amber-100 hover:bg-amber-200 px-3 py-1.5 rounded-xl border border-amber-300 transition-all cursor-pointer shadow-2xs">
            <span>← পিছনে যান (Back)</span>
          </button>
          <span class="text-xs font-bold text-emerald-300 bg-emerald-900/50 px-3 py-1 rounded-full border border-emerald-500/30 hidden sm:inline">
            ✨ ১০০% সুদমুক্ত ইসলামী সেবা
          </span>
        </div>

        <button onclick="closeQardModal();" class="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 text-slate-300 hover:text-white flex items-center justify-center transition-all cursor-pointer">
          ✕
        </button>
      </div>

      <!-- Modal Body (Scrollable if needed, but designed compact to avoid scroll) -->
      <div class="p-4 sm:p-6 overflow-y-auto space-y-4">
        
        <!-- 1. Top Compact Advert Picture / Banner (Reduced height, no excess blank space - Matches Image 1) -->
        <div class="bg-gradient-to-r from-emerald-950 via-slate-950 to-emerald-900 text-white p-5 sm:p-6 rounded-3xl border-2 border-amber-500/50 shadow-xl relative overflow-hidden flex flex-col justify-between min-h-[130px] sm:min-h-[150px]">
          <div class="absolute -right-10 -bottom-10 w-44 h-44 bg-amber-500/10 rounded-full blur-2xl pointer-events-none"></div>
          
          <div class="relative z-10 space-y-1.5">
            <div class="flex items-center space-x-2 text-amber-400">
              <span class="text-base">🤝</span>
              <span class="text-[11px] font-black uppercase tracking-widest bg-amber-500/15 px-3 py-0.5 rounded-full border border-amber-500/30">
                আল আনসার করযে হাসানা স্কিম
              </span>
            </div>

            <h1 class="text-base sm:text-2xl font-black text-white leading-snug">
              সুদমুক্ত ‘করযে হাসানা’ ঋণ সুবিধা ও ১০% তাৎক্ষণিক বাকি সেবা
            </h1>

            <p class="text-xs sm:text-sm text-slate-300 max-w-3xl leading-relaxed">
              ইসলামী শরীয়াহ অনুযায়ী পারস্পরিক সহযোগিতার উদ্দেশ্যে কোনো প্রকার অতিরিক্ত ফি, প্রসেসিং চার্জ বা সুদ ছাড়াই পণ্য ক্রয় করে সুবিধাজনক সময়ে মূল্য পরিশোধের সুযোগ।
            </p>
          </div>

          <div class="relative z-10 mt-2.5 pt-2 border-t border-amber-400/20 text-[11px] text-amber-200 italic flex items-center justify-between">
            <span>“যে ব্যক্তি কোনো মুমিনের দুনিয়াবী বিপদ দূর করে দেবে, আল্লাহ কিয়ামতের দিন তার বিপদসমূহ দূর করে দেবেন।” — (সহীহ মুসলিম)</span>
            <span class="text-[10px] font-mono font-bold text-amber-400 bg-amber-400/10 px-2 py-0.5 rounded-md hidden md:inline">
              ০% সুদ • ১০০% আমানত
            </span>
          </div>
        </div>

        <!-- 2. 4 Feature & Terms Cards Side-by-Side in a Single Row (Matches Image 1 Wireframe) -->
        <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          
          <!-- Card 1 -->
          <div class="bg-white p-4 sm:p-4.5 rounded-2xl border border-amber-100 shadow-2xs flex flex-col justify-between space-y-2.5 hover:border-amber-300 transition-all">
            <div class="space-y-2">
              <div class="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center font-bold text-lg shadow-2xs">
                🛡️
              </div>
              <span class="text-[9px] font-black uppercase tracking-wider text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md inline-block">
                Zero Interest
              </span>
              <h3 class="text-xs sm:text-sm font-black text-slate-900 leading-tight">
                ১০০% সুদমুক্ত সেবা
              </h3>
              <p class="text-[11px] text-slate-600 leading-relaxed">
                কোনো প্রকার লুকানো চার্জ, জরিমানা বা সুদ নেই। যতটুকু ধার নিবেন, ঠিক ততটুকুই পরিশোধ করবেন।
              </p>
            </div>
            <div class="pt-2 border-t border-slate-100 text-[10px] font-bold text-emerald-700">
              ✓ শরীয়াহসম্মত ও খাঁটি সেবা
            </div>
          </div>

          <!-- Card 2 -->
          <div class="bg-white p-4 sm:p-4.5 rounded-2xl border border-amber-100 shadow-2xs flex flex-col justify-between space-y-2.5 hover:border-amber-300 transition-all">
            <div class="space-y-2">
              <div class="w-10 h-10 rounded-xl bg-amber-50 text-amber-700 flex items-center justify-center font-bold text-lg shadow-2xs">
                💳
              </div>
              <span class="text-[9px] font-black uppercase tracking-wider text-amber-700 bg-amber-50 px-2 py-0.5 rounded-md inline-block">
                Instant Credit
              </span>
              <h3 class="text-xs sm:text-sm font-black text-slate-900 leading-tight">
                ১০% তাৎক্ষণিক বাকি
              </h3>
              <p class="text-[11px] text-slate-600 leading-relaxed">
                যেকোনো অর্ডারের সময় ৯০% পরিশোধ করে বাকি ১০% টাকা করযে হাসানা হিসেবে পরে পরিশোধ করতে পারবেন।
              </p>
            </div>
            <div class="pt-2 border-t border-slate-100 text-[10px] font-bold text-amber-800">
              ✓ ১-ক্লিকে চেকআউটে ব্যবহার
            </div>
          </div>

          <!-- Card 3 -->
          <div class="bg-white p-4 sm:p-4.5 rounded-2xl border border-amber-100 shadow-2xs flex flex-col justify-between space-y-2.5 hover:border-amber-300 transition-all">
            <div class="space-y-2">
              <div class="w-10 h-10 rounded-xl bg-blue-50 text-blue-700 flex items-center justify-center font-bold text-lg shadow-2xs">
                🤝
              </div>
              <span class="text-[9px] font-black uppercase tracking-wider text-blue-700 bg-blue-50 px-2 py-0.5 rounded-md inline-block">
                Flexible Terms
              </span>
              <h3 class="text-xs sm:text-sm font-black text-slate-900 leading-tight">
                সহজ পরিশোধ ও আমানত
              </h3>
              <p class="text-[11px] text-slate-600 leading-relaxed">
                আপনার সুবিধা অনুযায়ী নির্ধারিত মেয়াদের মধ্যে পরিশোধ। ঈমানী আমানত হিসেবে যথাসময়ে পরিশোধ কাম্য।
              </p>
            </div>
            <div class="pt-2 border-t border-slate-100 text-[10px] font-bold text-blue-700">
              ✓ সুবিধাজনক মেয়াদ ও কিস্তি
            </div>
          </div>

          <!-- Card 4 (Terms & Conditions) -->
          <div class="bg-amber-50/70 p-4 sm:p-4.5 rounded-2xl border border-amber-200 shadow-2xs flex flex-col justify-between space-y-2.5 hover:border-amber-400 transition-all">
            <div class="space-y-2">
              <div class="w-10 h-10 rounded-xl bg-amber-500/20 text-amber-900 flex items-center justify-center font-bold text-lg shadow-2xs">
                📜
              </div>
              <span class="text-[9px] font-black uppercase tracking-wider text-amber-900 bg-amber-200/60 px-2 py-0.5 rounded-md inline-block">
                Terms & Rules
              </span>
              <h3 class="text-xs sm:text-sm font-black text-slate-950 leading-tight">
                শর্তাবলী ও নিয়মাবলী
              </h3>
              <ul class="text-[11px] text-slate-700 space-y-1 leading-tight">
                <li>• জাতীয় পরিচয়পত্র (NID) যাচাই সাপেক্ষে লিমিট।</li>
                <li>• অর্ডারে ৯০% পেমেন্ট ও ১০% ঋণ।</li>
                <li>• অঙ্গীকার অনুযায়ী যথাসময়ে ঋণ পরিশোধ।</li>
              </ul>
            </div>
            <div class="pt-2 border-t border-amber-200 text-[10px] font-bold text-amber-900">
              ✓ ২৪ ঘণ্টার মধ্যে ভেরিফিকেশন
            </div>
          </div>

        </div>

        <!-- 3. Bottom-Right Dual-Language Apply Button (Matches Image 1 Sketch) -->
        <div class="flex flex-col sm:flex-row items-center justify-between gap-3 pt-1">
          <div id="qard-applied-badge" class="hidden p-2.5 bg-emerald-50 border border-emerald-300 rounded-xl text-xs text-emerald-900 font-bold">
            ✓ আপনার আবেদনটি পর্যালোচনায় রয়েছে। দ্রুত সক্রিয় করা হবে।
          </div>
          <div class="text-[11px] text-slate-500 font-medium hidden sm:block">
            * নিচের বাটনে ক্লিক করে সহজ পপ-আপ ফর্মে আবেদন জমা দিন।
          </div>

          <div class="flex justify-end w-full sm:w-auto">
            <button
              onclick="openQardApplicationPopup();"
              class="w-full sm:w-auto inline-flex items-center justify-end space-x-3 bg-gradient-to-r from-emerald-800 via-emerald-700 to-emerald-900 hover:from-emerald-700 hover:to-emerald-800 text-white px-5 py-2.5 rounded-2xl border-2 border-amber-400/70 shadow-lg shadow-emerald-950/30 transition-all transform hover:-translate-y-0.5 cursor-pointer group"
            >
              <div class="w-8 h-8 rounded-xl bg-amber-500/20 text-amber-300 flex items-center justify-center border border-amber-400/40 group-hover:scale-105 transition-transform flex-shrink-0 text-base">
                🤝
              </div>
              <div class="text-right">
                <span class="block text-xs sm:text-sm font-black text-white leading-tight">
                  করযে হাসানার জন্য আবেদন করুন
                </span>
                <span class="block text-[10px] sm:text-[11px] text-amber-300 font-mono font-bold tracking-wide">
                  Apply for Qard-e-Hasana
                </span>
              </div>
            </button>
          </div>
        </div>

        <!-- 4. Bottom Back Button -->
        <div class="flex items-center justify-between pt-3 border-t border-slate-200">
          <button
            onclick="closeQardModal();"
            class="inline-flex items-center space-x-1.5 text-xs font-black text-amber-900 bg-amber-100 hover:bg-amber-200 px-4 py-2 rounded-xl border border-amber-300 transition-all cursor-pointer shadow-2xs"
          >
            <span>← পিছনে যান (Back)</span>
          </button>
          <span class="text-[11px] font-bold text-slate-500">
            আল আনসার সুপার শপ • সুদমুক্ত ইসলামী কেনাকাটা
          </span>
        </div>

      </div>
    </div>
  </div>


  <!-- ========================================== -->
  <!-- QARD-E-HASANA APPLICATION FORM POPUP MODAL -->
  <!-- ========================================== -->
  <div id="qard-form-popup" class="fixed inset-0 z-60 hidden bg-slate-950/80 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 overflow-y-auto animate-in fade-in">
    <div class="bg-white w-full max-w-md rounded-3xl border border-amber-300 shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
      <div class="bg-gradient-to-r from-emerald-950 to-slate-950 text-white p-4 flex items-center justify-between border-b border-amber-500/30">
        <div class="flex items-center space-x-2.5">
          <span class="text-lg">🤝</span>
          <div>
            <h3 class="text-xs sm:text-sm font-black text-white">করযে হাসানা আবেদন ফর্ম</h3>
            <p class="text-[10px] text-amber-200">১০০% সুদমুক্ত • কোনো লুকানো চার্জ নেই</p>
          </div>
        </div>
        <button onclick="closeQardApplicationPopup();" class="w-7 h-7 rounded-full bg-white/10 hover:bg-white/20 text-slate-300 flex items-center justify-center text-xs">✕</button>
      </div>

      <form onsubmit="handleQardApplicationSubmit(event);" class="p-4 sm:p-5 space-y-3 text-xs overflow-y-auto">
        <div>
          <label class="font-bold text-slate-700 block mb-1">আবেদনকারীর পূর্ণ নাম *</label>
          <input id="qard-name" type="text" required placeholder="যেমন: তানভীর আহমেদ" class="w-full px-3 py-2 bg-slate-50 rounded-xl border border-slate-200 focus:outline-none focus:border-amber-500 font-medium">
        </div>

        <div>
          <label class="font-bold text-slate-700 block mb-1">সক্রিয় মোবাইল নম্বর *</label>
          <input id="qard-phone" type="text" required maxlength="11" placeholder="017XXXXXXXX" class="w-full px-3 py-2 bg-slate-50 rounded-xl border border-slate-200 focus:outline-none focus:border-amber-500 font-mono font-bold">
        </div>

        <div>
          <label class="font-bold text-slate-700 block mb-1">জাতীয় পরিচয়পত্র (NID) নম্বর *</label>
          <input id="qard-nid" type="text" required placeholder="১০ বা ১৭ ডিজিট" class="w-full px-3 py-2 bg-slate-50 rounded-xl border border-slate-200 focus:outline-none focus:border-amber-500 font-mono font-bold">
        </div>

        <div>
          <label class="font-bold text-slate-700 block mb-1">কাঙ্ক্ষিত ক্রেডিট লিমিট (টাকা)</label>
          <select id="qard-limit" class="w-full px-3 py-2 bg-slate-50 rounded-xl border border-slate-200 focus:outline-none focus:border-amber-500 font-bold">
            <option value="2000">৳২,০০০ (টাকা)</option>
            <option value="3000">৳৩,০০০ (টাকা)</option>
            <option value="5000" selected>৳৫,০০০ (টাকা)</option>
            <option value="10000">৳১০,০০০ (টাকা)</option>
          </select>
        </div>

        <div>
          <label class="font-bold text-slate-700 block mb-1">বর্তমান বাসস্থান ও স্থায়ী ঠিকানা *</label>
          <textarea id="qard-address" rows="2" required placeholder="বাসা নম্বর, রোড নম্বর, এলাকা, জেলা..." class="w-full px-3 py-2 bg-slate-50 rounded-xl border border-slate-200 focus:outline-none focus:border-amber-500 font-medium"></textarea>
        </div>

        <div class="p-2.5 bg-amber-50 border border-amber-200 rounded-xl text-[10px] text-amber-900 leading-tight">
          ✓ করযে হাসানা পরিশোধ ঈমানী আমানত। সময়মতো পরিশোধে আপনার ক্রেডিট লিমিট বৃদ্ধি পাবে।
        </div>

        <button type="submit" class="w-full py-2.5 bg-gradient-to-r from-emerald-800 to-emerald-900 hover:from-emerald-700 hover:to-emerald-800 text-white font-black text-xs rounded-xl shadow-md transition-all cursor-pointer">
          আবেদন সাবমিট করুন (Submit Application)
        </button>
      </form>
    </div>
  </div>


  <!-- ========================================== -->
  <!-- LOYALTY CARD MODAL (MATCHES IMAGE 1 SKETCH & IMAGE 2 LUXURY CARD) -->
  <!-- ========================================== -->
  <div id="loyalty-modal" class="fixed inset-0 z-50 hidden bg-slate-950/75 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 overflow-y-auto animate-in fade-in">
    <div class="bg-slate-50 w-full max-w-5xl rounded-3xl border border-amber-300/80 shadow-2xl overflow-hidden flex flex-col max-h-[92vh] my-auto">
      
      <!-- Top Navbar -->
      <div class="bg-gradient-to-r from-emerald-950 via-[#03241b] to-slate-950 text-white px-5 py-3.5 flex items-center justify-between border-b border-amber-500/30">
        <div class="flex items-center space-x-2.5">
          <button onclick="closeLoyaltyModal();" class="inline-flex items-center space-x-1 text-xs font-black text-amber-900 bg-amber-100 hover:bg-amber-200 px-3 py-1.5 rounded-xl border border-amber-300 transition-all cursor-pointer shadow-2xs">
            <span>← পিছনে যান (Back)</span>
          </button>
          <span class="text-xs font-bold text-amber-300 bg-amber-900/50 px-3 py-1 rounded-full border border-amber-500/30 hidden sm:inline">
            ✨ আল আনসার প্রিভিলেজ ক্লাব
          </span>
        </div>

        <button onclick="closeLoyaltyModal();" class="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 text-slate-300 hover:text-white flex items-center justify-center transition-all cursor-pointer">
          ✕
        </button>
      </div>

      <!-- Modal Body -->
      <div class="p-4 sm:p-6 overflow-y-auto space-y-4">
        
        <!-- 1. Top Compact Advert Picture / Banner (Reduced height, no excess blank space - Matches Image 1) -->
        <div class="bg-gradient-to-r from-emerald-950 via-[#03241b] to-slate-950 text-white p-5 sm:p-6 rounded-3xl border-2 border-amber-500/50 shadow-xl relative overflow-hidden flex flex-col justify-between min-h-[130px] sm:min-h-[150px]">
          <div class="absolute -right-10 -bottom-10 w-44 h-44 bg-amber-500/10 rounded-full blur-2xl pointer-events-none"></div>
          
          <div class="relative z-10 space-y-1.5">
            <div class="flex items-center space-x-2 text-amber-400">
              <span class="text-base">👑</span>
              <span class="text-[11px] font-black uppercase tracking-widest bg-amber-500/15 px-3 py-0.5 rounded-full border border-amber-500/30">
                AL ANSAR PRIVILEGE CLUB
              </span>
            </div>

            <h1 class="text-base sm:text-2xl font-black text-white leading-snug">
              আল আনসার ভিআইপি মেম্বারশিপ ও ডিজিটাল লয়ালটি কার্ড
            </h1>

            <p class="text-xs sm:text-sm text-slate-300 max-w-3xl leading-relaxed">
              আল আনসার সুপার শপের সম্মানিত নিয়মিত গ্রাহকদের জন্য বিশেষ সম্মাননা। প্রতি কেনাকাটায় ক্যাশব্যাক, রিওয়ার্ড পয়েন্ট ও বিশেষ ভিআইপি ডিসকাউন্ট সুবিধা উপভোগ করুন।
            </p>
          </div>

          <div class="relative z-10 mt-2.5 pt-2 border-t border-amber-400/20 text-[11px] text-amber-200 italic flex items-center justify-between">
            <span>লাইফটাইম ক্যাশ পয়েন্ট • ইউনিক ডিজিটাল বারকোড • বিশেষ মেম্বারশিপ ডিসকাউন্ট</span>
            <span class="text-[10px] font-mono font-bold text-amber-400 bg-amber-400/10 px-2 py-0.5 rounded-md hidden md:inline">
              VIP PRIVILEGE
            </span>
          </div>
        </div>

        <!-- 2. 4 Feature & Terms Cards Side-by-Side in a Single Row (Matches Image 1 Wireframe) -->
        <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          
          <!-- Card 1 -->
          <div class="bg-white p-4 sm:p-4.5 rounded-2xl border border-amber-100 shadow-2xs flex flex-col justify-between space-y-2.5 hover:border-amber-300 transition-all">
            <div class="space-y-2">
              <div class="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center font-bold text-lg shadow-2xs">
                🎁
              </div>
              <span class="text-[9px] font-black uppercase tracking-wider text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md inline-block">
                Cash Points
              </span>
              <h3 class="text-xs sm:text-sm font-black text-slate-900 leading-tight">
                লাইফটাইম রিওয়ার্ড পয়েন্ট
              </h3>
              <p class="text-[11px] text-slate-600 leading-relaxed">
                প্রতি ১০০ টাকা কেনাকাটায় ক্যাশ পয়েন্ট সংগ্রহ করুন। পরবর্তী যেকোনো অর্ডারে পয়েন্ট রিডিম করে ছাড় পান।
              </p>
            </div>
            <div class="pt-2 border-t border-slate-100 text-[10px] font-bold text-emerald-700">
              ✓ পয়েন্টের কোনো মেয়াদ নেই
            </div>
          </div>

          <!-- Card 2 -->
          <div class="bg-white p-4 sm:p-4.5 rounded-2xl border border-amber-100 shadow-2xs flex flex-col justify-between space-y-2.5 hover:border-amber-300 transition-all">
            <div class="space-y-2">
              <div class="w-10 h-10 rounded-xl bg-amber-50 text-amber-700 flex items-center justify-center font-bold text-lg shadow-2xs">
                ✨
              </div>
              <span class="text-[9px] font-black uppercase tracking-wider text-amber-700 bg-amber-50 px-2 py-0.5 rounded-md inline-block">
                VIP Discounts
              </span>
              <h3 class="text-xs sm:text-sm font-black text-slate-900 leading-tight">
                স্পেশাল মেম্বারশিপ ছাড়
              </h3>
              <p class="text-[11px] text-slate-600 leading-relaxed">
                প্রিমিয়াম খাঁটি আতর, ফ্রেঞ্চ পারফিউম ও উপহার সামগ্রীতে অতিরিক্ত ৫% থেকে ১৫% পর্যন্ত বিশেষ ভিআইপি মূল্যছাড়।
              </p>
            </div>
            <div class="pt-2 border-t border-slate-100 text-[10px] font-bold text-amber-800">
              ✓ এক্সক্লুসিভ মেম্বার অফার
            </div>
          </div>

          <!-- Card 3 -->
          <div class="bg-white p-4 sm:p-4.5 rounded-2xl border border-amber-100 shadow-2xs flex flex-col justify-between space-y-2.5 hover:border-amber-300 transition-all">
            <div class="space-y-2">
              <div class="w-10 h-10 rounded-xl bg-blue-50 text-blue-700 flex items-center justify-center font-bold text-lg shadow-2xs">
                🚚
              </div>
              <span class="text-[9px] font-black uppercase tracking-wider text-blue-700 bg-blue-50 px-2 py-0.5 rounded-md inline-block">
                Priority Care
              </span>
              <h3 class="text-xs sm:text-sm font-black text-slate-900 leading-tight">
                ফ্রি ডেলিভারি ও অগ্রাধিকার
              </h3>
              <p class="text-[11px] text-slate-600 leading-relaxed">
                নির্ধারিত অর্ডারে সারা দেশে ফ্রি হোম ডেলিভারি এবং যেকোনো প্রয়োজনে ২৪/৭ ভিআইপি হেল্পলাইন সাপোর্ট।
              </p>
            </div>
            <div class="pt-2 border-t border-slate-100 text-[10px] font-bold text-blue-700">
              ✓ দ্রুততম এক্সপ্রেস কুরিয়ার
            </div>
          </div>

          <!-- Card 4 (Terms & Conditions) -->
          <div class="bg-amber-50/70 p-4 sm:p-4.5 rounded-2xl border border-amber-200 shadow-2xs flex flex-col justify-between space-y-2.5 hover:border-amber-400 transition-all">
            <div class="space-y-2">
              <div class="w-10 h-10 rounded-xl bg-amber-500/20 text-amber-900 flex items-center justify-center font-bold text-lg shadow-2xs">
                📜
              </div>
              <span class="text-[9px] font-black uppercase tracking-wider text-amber-900 bg-amber-200/60 px-2 py-0.5 rounded-md inline-block">
                Terms & Rules
              </span>
              <h3 class="text-xs sm:text-sm font-black text-slate-950 leading-tight">
                কার্ডের শর্তাবলী ও নিয়ম
              </h3>
              <ul class="text-[11px] text-slate-700 space-y-1 leading-tight">
                <li>• কার্ডটি নিজস্ব নামে সংরক্ষিত ও হস্তান্তরঅযোগ্য।</li>
                <li>• প্রতিটি ডেলিভারির পর পয়েন্ট স্বয়ংক্রিয় যোগ হবে।</li>
                <li>• চেকআউটে বারকোড স্ক্যান বা নম্বর ব্যবহারযোগ্য।</li>
              </ul>
            </div>
            <div class="pt-2 border-t border-amber-200 text-[10px] font-bold text-amber-900">
              ✓ ডিজিটাল ইনস্ট্যান্ট অ্যাক্সেস
            </div>
          </div>

        </div>

        <!-- 3. Bottom Actions & Dual-Language Button -->
        <div class="flex flex-col sm:flex-row items-center justify-between gap-3 pt-1">
          <button
            onclick="toggleLoyaltyPreviewCard();"
            class="text-xs font-bold text-amber-800 hover:text-amber-900 bg-amber-100 hover:bg-amber-200 px-3.5 py-1.5 rounded-xl border border-amber-300 transition-all cursor-pointer flex items-center space-x-1.5"
          >
            <span>👑</span>
            <span id="preview-card-toggle-text">অনুমোদিত লাক্সারি কার্ডের প্রিভিউ দেখুন (Show Card)</span>
          </button>

          <div class="flex justify-end w-full sm:w-auto">
            <button
              onclick="openLoyaltyApplicationPopup();"
              class="w-full sm:w-auto inline-flex items-center justify-end space-x-3 bg-gradient-to-r from-amber-600 via-amber-500 to-amber-700 hover:from-amber-500 hover:to-amber-600 text-slate-950 px-5 py-2.5 rounded-2xl border-2 border-amber-400 shadow-md shadow-amber-500/20 transition-all transform hover:-translate-y-0.5 cursor-pointer group"
            >
              <div class="w-8 h-8 rounded-xl bg-slate-950/10 text-slate-950 flex items-center justify-center border border-slate-950/20 group-hover:scale-105 transition-transform flex-shrink-0 text-base">
                💳
              </div>
              <div class="text-right">
                <span class="block text-xs sm:text-sm font-black text-slate-950 leading-tight">
                  লয়ালটি কার্ডের জন্য আবেদন করুন
                </span>
                <span class="block text-[10px] sm:text-[11px] text-slate-900 font-mono font-bold tracking-wide">
                  Apply for Loyalty Card
                </span>
              </div>
            </button>
          </div>
        </div>

        <!-- 4. LUXURY CARD PREVIEW (STRICTLY MATCHES IMAGE 2 PHOTO WITH AUTO-GENERATED BARCODE) -->
        <div id="luxury-card-preview-section" class="hidden pt-2 border-t border-amber-200/80">
          <div class="bg-white p-5 sm:p-6 rounded-3xl border border-amber-200 shadow-lg flex flex-col items-center space-y-3">
            <div class="text-center">
              <span class="text-[11px] font-bold text-emerald-800 bg-emerald-50 px-3 py-1 rounded-full border border-emerald-200 inline-block mb-1">
                ✓ অনুমোদিত মেম্বারদের জন্য ডিজিটাল ভিআইপি কার্ড
              </span>
              <h3 class="text-sm sm:text-base font-black text-slate-900">
                আল আনসার ভিআইপি কার্ড (ছবি ২ অনুযায়ী ডিজাইন ও অটো বারকোড)
              </h3>
            </div>

            <!-- Card Container matching media_1788885683566.jpg -->
            <div class="relative w-[290px] sm:w-[320px] h-[500px] sm:h-[530px] select-none">
              
              <!-- Front Card (Matches Right side of Image 2) -->
              <div id="luxury-card-front" class="absolute inset-0 w-full h-full rounded-[30px] overflow-hidden border-2 border-amber-400/80 shadow-2xl bg-gradient-to-b from-emerald-950 via-[#04241a] to-slate-950 text-white flex flex-col justify-between p-5 transition-opacity duration-500">
                
                <!-- Top-Left Golden Arc Ribbon (SVG) -->
                <svg class="absolute -top-1 -left-1 w-32 h-32 pointer-events-none drop-shadow-md z-0" viewBox="0 0 100 100" fill="none">
                  <path d="M 0 0 L 75 0 C 70 30, 30 70, 0 75 Z" fill="url(#pGold1)" />
                  <path d="M 0 0 L 88 0 C 80 40, 40 80, 0 88 Z" stroke="#fef08a" stroke-width="1.5" fill="none" />
                  <defs>
                    <linearGradient id="pGold1" x1="0%" y1="0%" x2="100%" y2="100%">
                      <stop offset="0%" stop-color="#fef08a" />
                      <stop offset="40%" stop-color="#d97706" />
                      <stop offset="80%" stop-color="#b45309" />
                      <stop offset="100%" stop-color="#fef08a" />
                    </linearGradient>
                  </defs>
                </svg>

                <!-- Bottom-Right Golden Arc Ribbon (SVG) -->
                <svg class="absolute -bottom-1 -right-1 w-40 h-40 pointer-events-none drop-shadow-md z-0" viewBox="0 0 120 120" fill="none">
                  <path d="M 120 120 L 120 40 C 90 60, 60 90, 40 120 Z" fill="url(#pGold2)" />
                  <path d="M 120 120 L 120 25 C 80 50, 50 80, 25 120 Z" stroke="#fef08a" stroke-width="2" fill="none" />
                  <defs>
                    <linearGradient id="pGold2" x1="100%" y1="100%" x2="0%" y2="0%">
                      <stop offset="0%" stop-color="#fef08a" />
                      <stop offset="35%" stop-color="#f59e0b" />
                      <stop offset="75%" stop-color="#92400e" />
                      <stop offset="100%" stop-color="#fef08a" />
                    </linearGradient>
                  </defs>
                </svg>

                <!-- Card Front Top: Emblem & Store Name -->
                <div class="relative z-10 flex flex-col items-center pt-2">
                  <div class="w-14 h-14 rounded-full bg-gradient-to-tr from-amber-600 via-yellow-300 to-amber-500 p-[2px] shadow-lg shadow-amber-500/20">
                    <div class="w-full h-full rounded-full bg-emerald-950 flex items-center justify-center font-black text-amber-300 text-xl border border-amber-400/40">
                      ★
                    </div>
                  </div>
                  <h2 class="text-xs font-black tracking-[0.2em] uppercase text-transparent bg-clip-text bg-gradient-to-r from-amber-200 via-amber-400 to-yellow-200 mt-2 text-center drop-shadow-xs">
                    AL ANSAR SUPER SHOP
                  </h2>
                  <span class="text-[8px] font-bold tracking-widest text-emerald-300 uppercase">
                    ISLAMIC PRIVILEGE CLUB
                  </span>
                </div>

                <!-- Card Front Center: Member Name & Position -->
                <div class="relative z-10 my-auto text-center space-y-1 py-1">
                  <span class="text-[8px] tracking-[0.25em] text-amber-300/80 uppercase font-black block">
                    LOYALTY CARD HOLDER
                  </span>
                  <h3 class="text-base sm:text-lg font-black tracking-wider text-white uppercase drop-shadow-md">
                    TANVIR AHMED
                  </h3>
                  <div class="inline-flex items-center space-x-1 px-2.5 py-0.5 rounded-full bg-amber-500/15 border border-amber-400/30 text-[9px] font-black text-amber-300">
                    <span>👑 ROYAL VIP MEMBER</span>
                  </div>
                </div>

                <!-- Card Front 3 Golden Pills (Phone, Web, Address matching Photo) -->
                <div class="relative z-10 space-y-1.5 py-1">
                  <div class="flex items-center space-x-2 bg-white/10 px-2.5 py-1 rounded-xl border border-amber-400/30">
                    <div class="w-5 h-5 rounded-md bg-gradient-to-tr from-amber-400 to-yellow-200 text-slate-950 flex items-center justify-center text-[10px] font-bold shadow-xs">
                      📞
                    </div>
                    <span class="text-[10px] font-mono font-bold text-slate-200">01700-000000</span>
                  </div>

                  <div class="flex items-center space-x-2 bg-white/10 px-2.5 py-1 rounded-xl border border-amber-400/30">
                    <div class="w-5 h-5 rounded-md bg-gradient-to-tr from-amber-400 to-yellow-200 text-slate-950 flex items-center justify-center text-[10px] font-bold shadow-xs">
                      🌐
                    </div>
                    <span class="text-[10px] font-mono font-bold text-slate-200">www.alansarbd.com</span>
                  </div>

                  <div class="flex items-center space-x-2 bg-white/10 px-2.5 py-1 rounded-xl border border-amber-400/30">
                    <div class="w-5 h-5 rounded-md bg-gradient-to-tr from-amber-400 to-yellow-200 text-slate-950 flex items-center justify-center text-[10px] font-bold shadow-xs">
                      📍
                    </div>
                    <span class="text-[10px] font-medium text-slate-200">উত্তরা ও ঢাকা, বাংলাদেশ</span>
                  </div>
                </div>

                <!-- Card Front Bottom: Auto-Generated SVG Barcode -->
                <div class="relative z-10 pt-2 border-t border-amber-500/30">
                  <div class="bg-white rounded-xl p-2 shadow-inner border border-amber-400 flex flex-col items-center">
                    <!-- SVG Barcode -->
                    <svg class="w-full h-8" viewBox="0 0 200 35" preserveAspectRatio="none">
                      <!-- Start Guard -->
                      <rect x="10" y="0" width="3" height="35" fill="#0f172a"/>
                      <rect x="15" y="0" width="1.5" height="35" fill="#0f172a"/>
                      <rect x="19" y="0" width="3" height="35" fill="#0f172a"/>
                      <!-- Alternating deterministic bars -->
                      <rect x="25" y="0" width="2" height="35" fill="#0f172a"/><rect x="29" y="0" width="3.5" height="35" fill="#0f172a"/>
                      <rect x="35" y="0" width="1.5" height="35" fill="#0f172a"/><rect x="39" y="0" width="3" height="35" fill="#0f172a"/>
                      <rect x="44" y="0" width="4" height="35" fill="#0f172a"/><rect x="50" y="0" width="2" height="35" fill="#0f172a"/>
                      <rect x="55" y="0" width="1.5" height="35" fill="#0f172a"/><rect x="60" y="0" width="3.5" height="35" fill="#0f172a"/>
                      <rect x="66" y="0" width="2" height="35" fill="#0f172a"/><rect x="71" y="0" width="4" height="35" fill="#0f172a"/>
                      <rect x="78" y="0" width="1.5" height="35" fill="#0f172a"/><rect x="82" y="0" width="3" height="35" fill="#0f172a"/>
                      <rect x="88" y="0" width="2" height="35" fill="#0f172a"/><rect x="93" y="0" width="3.5" height="35" fill="#0f172a"/>
                      <rect x="99" y="0" width="1.5" height="35" fill="#0f172a"/><rect x="103" y="0" width="4" height="35" fill="#0f172a"/>
                      <rect x="110" y="0" width="2.5" height="35" fill="#0f172a"/><rect x="115" y="0" width="2" height="35" fill="#0f172a"/>
                      <rect x="120" y="0" width="3.5" height="35" fill="#0f172a"/><rect x="126" y="0" width="1.5" height="35" fill="#0f172a"/>
                      <rect x="130" y="0" width="3" height="35" fill="#0f172a"/><rect x="135" y="0" width="4" height="35" fill="#0f172a"/>
                      <rect x="142" y="0" width="2" height="35" fill="#0f172a"/><rect x="146" y="0" width="1.5" height="35" fill="#0f172a"/>
                      <rect x="150" y="0" width="3.5" height="35" fill="#0f172a"/><rect x="156" y="0" width="2" height="35" fill="#0f172a"/>
                      <rect x="161" y="0" width="4" height="35" fill="#0f172a"/><rect x="168" y="0" width="1.5" height="35" fill="#0f172a"/>
                      <rect x="172" y="0" width="3" height="35" fill="#0f172a"/><rect x="177" y="0" width="2.5" height="35" fill="#0f172a"/>
                      <!-- Stop Guard -->
                      <rect x="183" y="0" width="2" height="35" fill="#0f172a"/>
                      <rect x="187" y="0" width="1.5" height="35" fill="#0f172a"/>
                      <rect x="191" y="0" width="3" height="35" fill="#0f172a"/>
                    </svg>
                    <span class="text-[9px] font-mono tracking-widest text-slate-900 font-black mt-0.5">
                      * ANSAR-VIP-7861-2026 *
                    </span>
                  </div>

                  <div class="flex items-center justify-between text-[9px] pt-1.5 px-1 text-slate-300">
                    <span>পয়েন্ট: <strong class="text-amber-300">১৫০ Pts</strong></span>
                    <span>করযে হাসানা: <strong class="text-emerald-400">৳৫,০০০</strong></span>
                  </div>
                </div>

              </div>

              <!-- Back Card (Matches Left side of Image 2) -->
              <div id="luxury-card-back" class="absolute inset-0 w-full h-full rounded-[30px] overflow-hidden border-2 border-amber-400/80 shadow-2xl bg-gradient-to-b from-emerald-950 via-[#032117] to-slate-950 text-white flex flex-col justify-between p-5 hidden transition-opacity duration-500">
                <!-- Concentric Golden Circles matching Left card -->
                <svg class="absolute inset-0 w-full h-full pointer-events-none z-0" viewBox="0 0 300 500" fill="none">
                  <circle cx="85" cy="260" r="220" stroke="url(#pGoldBack)" stroke-width="28" opacity="0.85" />
                  <circle cx="85" cy="260" r="150" stroke="url(#pGoldBack)" stroke-width="24" opacity="0.85" />
                  <circle cx="85" cy="260" r="90" stroke="url(#pGoldBack)" stroke-width="20" opacity="0.85" />
                  <defs>
                    <linearGradient id="pGoldBack" x1="0%" y1="0%" x2="100%" y2="100%">
                      <stop offset="0%" stop-color="#fef08a" />
                      <stop offset="40%" stop-color="#f59e0b" />
                      <stop offset="80%" stop-color="#b45309" />
                      <stop offset="100%" stop-color="#fef08a" />
                    </linearGradient>
                  </defs>
                </svg>

                <div class="relative z-10 w-full -mx-5 -mt-5">
                  <div class="h-9 bg-slate-950 border-b border-amber-500/30 shadow-inner"></div>
                </div>

                <div class="relative z-10 my-auto flex flex-col items-center text-center">
                  <div class="w-20 h-20 rounded-2xl bg-gradient-to-br from-emerald-900 to-emerald-950 border-2 border-amber-400 shadow-2xl flex flex-col items-center justify-center p-2">
                    <span class="text-2xl text-amber-300">👑</span>
                    <span class="text-[8px] font-black text-amber-300 tracking-widest uppercase mt-0.5">
                      AL ANSAR
                    </span>
                  </div>
                  <h4 class="text-xs font-black tracking-widest text-amber-200 uppercase mt-3">
                    অফিসিয়াল মেম্বারশিপ কার্ড
                  </h4>
                  <p class="text-[10px] text-slate-300 max-w-[200px] leading-relaxed mt-1">
                    এই কার্ডটি আল আনসার সুপার শপের সম্মানিত নিয়মিত গ্রাহকদের জন্য সংরক্ষিত।
                  </p>
                </div>

                <div class="relative z-10 text-[9px] text-slate-400 border-t border-amber-500/20 pt-2 text-center">
                  www.alansarbd.com • হটলাইন: 01700-000000
                </div>
              </div>

            </div>

            <!-- Flip Action Button -->
            <button
              onclick="toggleLoyaltyCardFlip();"
              class="inline-flex items-center space-x-1.5 px-4 py-1.5 bg-amber-100 hover:bg-amber-200 text-amber-900 text-xs font-bold rounded-full border border-amber-300 transition-all cursor-pointer shadow-2xs"
            >
              <span>🔄</span>
              <span id="flip-btn-text">কার্ড ফ্লিপ করুন (Flip to Back)</span>
            </button>

          </div>
        </div>

        <!-- 5. Bottom Back Button -->
        <div class="flex items-center justify-between pt-3 border-t border-slate-200">
          <button
            onclick="closeLoyaltyModal();"
            class="inline-flex items-center space-x-1.5 text-xs font-black text-amber-900 bg-amber-100 hover:bg-amber-200 px-4 py-2 rounded-xl border border-amber-300 transition-all cursor-pointer shadow-2xs"
          >
            <span>← পিছনে যান (Back)</span>
          </button>
          <span class="text-[11px] font-bold text-slate-500">
            আল আনসার সুপার শপ • প্রিভিলেজ ক্লাব মেম্বারশিপ
          </span>
        </div>

      </div>
    </div>
  </div>


  <!-- ========================================== -->
  <!-- LOYALTY CARD APPLICATION POPUP MODAL -->
  <!-- ========================================== -->
  <div id="loyalty-form-popup" class="fixed inset-0 z-60 hidden bg-slate-950/80 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 overflow-y-auto animate-in fade-in">
    <div class="bg-white w-full max-w-md rounded-3xl border border-amber-300 shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
      <div class="bg-gradient-to-r from-emerald-950 to-slate-950 text-white p-4 flex items-center justify-between border-b border-amber-500/30">
        <div class="flex items-center space-x-2.5">
          <span class="text-lg">👑</span>
          <div>
            <h3 class="text-xs sm:text-sm font-black text-white">লয়ালটি কার্ড আবেদন ফর্ম</h3>
            <p class="text-[10px] text-amber-200">আল আনসার প্রিভিলেজ ক্লাব • লাইফটাইম ক্যাশব্যাক</p>
          </div>
        </div>
        <button onclick="closeLoyaltyApplicationPopup();" class="w-7 h-7 rounded-full bg-white/10 hover:bg-white/20 text-slate-300 flex items-center justify-center text-xs">✕</button>
      </div>

      <form onsubmit="handleLoyaltyApplicationSubmit(event);" class="p-4 sm:p-5 space-y-3 text-xs overflow-y-auto">
        <div>
          <label class="font-bold text-slate-700 block mb-1">কার্ডহোল্ডারের পূর্ণ নাম *</label>
          <input id="loyalty-name" type="text" required placeholder="যেমন: তানভীর আহমেদ" class="w-full px-3 py-2 bg-slate-50 rounded-xl border border-slate-200 focus:outline-none focus:border-amber-500 font-medium">
        </div>

        <div>
          <label class="font-bold text-slate-700 block mb-1">সক্রিয় মোবাইল নম্বর *</label>
          <input id="loyalty-phone" type="text" required maxlength="11" placeholder="017XXXXXXXX" class="w-full px-3 py-2 bg-slate-50 rounded-xl border border-slate-200 focus:outline-none focus:border-amber-500 font-mono font-bold">
        </div>

        <div>
          <label class="font-bold text-slate-700 block mb-1">শহর / জেলা *</label>
          <input id="loyalty-city" type="text" required placeholder="যেমন: ঢাকা" value="ঢাকা" class="w-full px-3 py-2 bg-slate-50 rounded-xl border border-slate-200 focus:outline-none focus:border-amber-500 font-medium">
        </div>

        <div>
          <label class="font-bold text-slate-700 block mb-1">ডেলিভারি ও যোগাযোগের ঠিকানা *</label>
          <textarea id="loyalty-address" rows="2" required placeholder="বাসা নম্বর, রোড নম্বর, এলাকা, থানা..." class="w-full px-3 py-2 bg-slate-50 rounded-xl border border-slate-200 focus:outline-none focus:border-amber-500 font-medium"></textarea>
        </div>

        <div>
          <label class="font-bold text-slate-700 block mb-1">জাতীয় পরিচয়পত্র (NID) নম্বর (ঐচ্ছিক)</label>
          <input id="loyalty-nid" type="text" placeholder="১০ বা ১৭ ডিজিটের এনআইডি" class="w-full px-3 py-2 bg-slate-50 rounded-xl border border-slate-200 focus:outline-none focus:border-amber-500 font-mono font-medium">
        </div>

        <div class="p-2.5 bg-amber-50 border border-amber-200 rounded-xl text-[10px] text-amber-900 leading-tight">
          ✓ অনুমোদিত হলে স্বয়ংক্রিয়ভাবে আপনার ইউনিক বারকোডসহ প্রিমিয়াম কার্ডটি প্রোফাইলে সক্রিয় হবে।
        </div>

        <button type="submit" class="w-full py-2.5 bg-gradient-to-r from-amber-600 to-amber-700 hover:from-amber-500 hover:to-amber-600 text-slate-950 font-black text-xs rounded-xl shadow-md transition-all cursor-pointer">
          লয়ালটি কার্ড আবেদন সাবমিট করুন
        </button>
      </form>
    </div>
  </div>
`;

// 3. Prepare JavaScript functions
const newJsHtml = `
    // Qard-e-Hasana Modal Logic
    function openQardModal() {
      const modal = document.getElementById('qard-modal');
      if (modal) modal.classList.remove('hidden');
    }

    function closeQardModal() {
      const modal = document.getElementById('qard-modal');
      if (modal) modal.classList.add('hidden');
    }

    function openQardApplicationPopup() {
      const popup = document.getElementById('qard-form-popup');
      if (popup) popup.classList.remove('hidden');
    }

    function closeQardApplicationPopup() {
      const popup = document.getElementById('qard-form-popup');
      if (popup) popup.classList.add('hidden');
    }

    function handleQardApplicationSubmit(event) {
      event.preventDefault();
      const name = document.getElementById('qard-name').value.trim();
      const phone = document.getElementById('qard-phone').value.trim();
      const nid = document.getElementById('qard-nid').value.trim();
      const limit = document.getElementById('qard-limit').value;

      if (!name || !phone || !nid) {
        alert('সকল আবশ্যক ঘর পূরণ করুন!');
        return;
      }

      alert('আলহামদুলিল্লাহ! আপনার করযে হাসানা আবেদনটি সফলভাবে জমা হয়েছে। এনআইডি যাচাই করে ২৪ ঘণ্টার মধ্যে আপনার ' + limit + ' টাকার ক্রেডিট লিমিট সক্রিয় করা হবে।');
      closeQardApplicationPopup();
      
      const badge = document.getElementById('qard-applied-badge');
      if (badge) badge.classList.remove('hidden');
    }

    // Loyalty Card Modal Logic
    function openLoyaltyModal() {
      const modal = document.getElementById('loyalty-modal');
      if (modal) modal.classList.remove('hidden');
    }

    function closeLoyaltyModal() {
      const modal = document.getElementById('loyalty-modal');
      if (modal) modal.classList.add('hidden');
    }

    function openLoyaltyApplicationPopup() {
      const popup = document.getElementById('loyalty-form-popup');
      if (popup) popup.classList.remove('hidden');
    }

    function closeLoyaltyApplicationPopup() {
      const popup = document.getElementById('loyalty-form-popup');
      if (popup) popup.classList.add('hidden');
    }

    function handleLoyaltyApplicationSubmit(event) {
      event.preventDefault();
      const name = document.getElementById('loyalty-name').value.trim();
      const phone = document.getElementById('loyalty-phone').value.trim();

      if (!name || !phone) {
        alert('সকল আবশ্যক ঘর পূরণ করুন!');
        return;
      }

      alert('অভিনন্দন ' + name + '! আপনার লয়ালটি মেম্বারশিপ আবেদন সফলভাবে গৃহীত হয়েছে। আপনার ইউনিক বারকোডসহ প্রিমিয়াম কার্ডটি প্রস্তুত করা হচ্ছে।');
      closeLoyaltyApplicationPopup();
      
      // Auto open preview of the card
      const cardSection = document.getElementById('luxury-card-preview-section');
      if (cardSection) cardSection.classList.remove('hidden');
      const toggleText = document.getElementById('preview-card-toggle-text');
      if (toggleText) toggleText.innerText = 'অনুমোদিত লাক্সারি কার্ড লুকান (Hide Card)';
    }

    let isCardFlipped = false;
    function toggleLoyaltyCardFlip() {
      isCardFlipped = !isCardFlipped;
      const front = document.getElementById('luxury-card-front');
      const back = document.getElementById('luxury-card-back');
      const btnText = document.getElementById('flip-btn-text');

      if (isCardFlipped) {
        front.classList.add('hidden');
        back.classList.remove('hidden');
        if (btnText) btnText.innerText = 'কার্ড ফ্লিপ করুন (Flip to Front)';
      } else {
        back.classList.add('hidden');
        front.classList.remove('hidden');
        if (btnText) btnText.innerText = 'কার্ড ফ্লিপ করুন (Flip to Back)';
      }
    }

    function toggleLoyaltyPreviewCard() {
      const cardSection = document.getElementById('luxury-card-preview-section');
      const toggleText = document.getElementById('preview-card-toggle-text');
      if (cardSection) {
        if (cardSection.classList.contains('hidden')) {
          cardSection.classList.remove('hidden');
          if (toggleText) toggleText.innerText = 'অনুমোদিত লাক্সারি কার্ড লুকান (Hide Card)';
        } else {
          cardSection.classList.add('hidden');
          if (toggleText) toggleText.innerText = 'অনুমোদিত লাক্সারি কার্ডের প্রিভিউ দেখুন (Show Card)';
        }
      }
    }
`;

// Inject modals before </body> and JS before </script>
html = html.replace('</body>', `${newModalsHtml}\n</body>`);
html = html.replace('</script>', `${newJsHtml}\n  </script>`);

fs.writeFileSync(path, html, 'utf-8');
console.log('Successfully updated preview.html with Qard-e-Hasana and Loyalty Card wireframes, Luxury Card, Barcode, and Popups!');
