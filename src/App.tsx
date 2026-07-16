import React, { useState, useEffect } from "react";
import {
  MapPin,
  Compass,
  DollarSign,
  Calendar,
  Sparkles,
  BookOpen,
  HeartHandshake,
  Copy,
  Check,
  Lock,
  Menu,
  X,
  Clock,
  Users
} from "lucide-react";
import { DatabaseSchema } from "./types";

// Import modular components
import PrayerTimeCard from "./components/PrayerTimeCard";
import FinancialDashboard from "./components/FinancialDashboard";
import ProposalViewer from "./components/ProposalViewer";
import GallerySection from "./components/GallerySection";
import NotificationBell from "./components/NotificationBell";
import AdminPanel from "./components/AdminPanel";

export default function App() {
  const [data, setData] = useState<DatabaseSchema | null>(null);
  const [activeTab, setActiveTab] = useState<"beranda" | "jadwal" | "keuangan" | "proposal" | "galeri">("beranda");
  const [isAdminOpen, setIsAdminOpen] = useState(false);
  const [copiedText, setCopiedText] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Fetch all public data on mount & poll every 10 seconds for real-time announcements
  const fetchData = async () => {
    try {
      const res = await fetch("/api/public-data");
      if (res.ok) {
        const json = await res.json();
        setData(json);
      }
    } catch (err) {
      console.error("Gagal memuat data dari server:", err);
    }
  };

  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, 10000); // 10s polling
    return () => clearInterval(interval);
  }, []);

  // Copy bank account utility
  const handleCopyAccount = (num: string) => {
    navigator.clipboard.writeText(num);
    setCopiedText(true);
    setTimeout(() => setCopiedText(false), 2000);
  };

  if (!data) {
    return (
      <div className="min-h-screen bg-editorial-bg flex flex-col justify-center items-center gap-4" id="app-loading-screen">
        <div className="w-12 h-12 border-4 border-editorial-pine border-t-transparent rounded-full animate-spin" />
        <span className="text-sm font-bold text-editorial-text font-serif">Memuat Sistem Masjid Nurul Falah...</span>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-editorial-bg flex flex-col justify-between text-editorial-text antialiased font-sans" id="app-root-container">
      {/* 1. Header / Navbar */}
      <header className="sticky top-0 z-40 bg-white/80 backdrop-blur-md border-b border-editorial-border shadow-sm" id="main-header">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between" id="header-inner">
          {/* Logo & Name */}
          <div className="flex items-center gap-3 cursor-pointer" onClick={() => setActiveTab("beranda")} id="logo-container">
            <div className="w-11 h-11 bg-editorial-pine rounded-2xl flex items-center justify-center text-white font-serif text-lg font-bold shadow-md shadow-editorial-pine/10" id="mosque-logo">
              🕌
            </div>
            <div>
              <h1 className="text-sm sm:text-base font-bold font-serif text-editorial-pine leading-tight uppercase tracking-tight">MASJID NURUL FALAH</h1>
              <span className="text-[10px] sm:text-xs font-semibold text-editorial-taupe block">Samaoling, Soppeng</span>
            </div>
          </div>

          {/* Desktop Nav Links */}
          <nav className="hidden md:flex items-center gap-1.5 text-xs font-bold" id="desktop-nav">
            <button
              onClick={() => setActiveTab("beranda")}
              className={`px-4 py-2 rounded-xl transition-all border ${
                activeTab === "beranda" ? "bg-editorial-light-green text-editorial-pine border-editorial-border-green/40" : "text-editorial-taupe hover:text-editorial-pine border-transparent hover:bg-editorial-light-green/20"
              }`}
              id="tab-btn-beranda"
            >
              Beranda
            </button>
            <button
              onClick={() => setActiveTab("jadwal")}
              className={`px-4 py-2 rounded-xl transition-all border ${
                activeTab === "jadwal" ? "bg-editorial-light-green text-editorial-pine border-editorial-border-green/40" : "text-editorial-taupe hover:text-editorial-pine border-transparent hover:bg-editorial-light-green/20"
              }`}
              id="tab-btn-jadwal"
            >
              Jadwal Salat
            </button>
            <button
              onClick={() => setActiveTab("keuangan")}
              className={`px-4 py-2 rounded-xl transition-all border ${
                activeTab === "keuangan" ? "bg-editorial-light-green text-editorial-pine border-editorial-border-green/40" : "text-editorial-taupe hover:text-editorial-pine border-transparent hover:bg-editorial-light-green/20"
              }`}
              id="tab-btn-keuangan"
            >
              Keuangan Kas
            </button>
            <button
              onClick={() => setActiveTab("proposal")}
              className={`px-4 py-2 rounded-xl transition-all border ${
                activeTab === "proposal" ? "bg-editorial-light-green text-editorial-pine border-editorial-border-green/40" : "text-editorial-taupe hover:text-editorial-pine border-transparent hover:bg-editorial-light-green/20"
              }`}
              id="tab-btn-proposal"
            >
              Proposal Digital
            </button>
            <button
              onClick={() => setActiveTab("galeri")}
              className={`px-4 py-2 rounded-xl transition-all border ${
                activeTab === "galeri" ? "bg-editorial-light-green text-editorial-pine border-editorial-border-green/40" : "text-editorial-taupe hover:text-editorial-pine border-transparent hover:bg-editorial-light-green/20"
              }`}
              id="tab-btn-galeri"
            >
              Galeri Kegiatan
            </button>
          </nav>

          {/* Right Action buttons */}
          <div className="flex items-center gap-3" id="header-right-actions">
            {/* Live broadcast notification widget */}
            <NotificationBell announcements={data.announcements} />

            {/* Mobile menu toggle */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-2 text-editorial-text bg-editorial-bg border border-editorial-border rounded-xl hover:bg-editorial-light-green/40 transition-colors"
              aria-label="Toggle Menu"
              id="mobile-menu-toggle-btn"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {/* Mobile Navigation Drawer */}
        {mobileMenuOpen && (
          <div className="md:hidden border-t border-editorial-border bg-white/95 backdrop-blur-md py-4 px-4 space-y-1 text-xs font-bold" id="mobile-nav-panel">
            <button
              onClick={() => {
                setActiveTab("beranda");
                setMobileMenuOpen(false);
              }}
              className={`w-full text-left px-4 py-2.5 rounded-xl transition-all ${
                activeTab === "beranda" ? "bg-editorial-light-green text-editorial-pine font-bold" : "text-editorial-taupe hover:text-editorial-pine"
              }`}
              id="mobile-tab-beranda"
            >
              Beranda
            </button>
            <button
              onClick={() => {
                setActiveTab("jadwal");
                setMobileMenuOpen(false);
              }}
              className={`w-full text-left px-4 py-2.5 rounded-xl transition-all ${
                activeTab === "jadwal" ? "bg-editorial-light-green text-editorial-pine font-bold" : "text-editorial-taupe hover:text-editorial-pine"
              }`}
              id="mobile-tab-jadwal"
            >
              Jadwal Salat
            </button>
            <button
              onClick={() => {
                setActiveTab("keuangan");
                setMobileMenuOpen(false);
              }}
              className={`w-full text-left px-4 py-2.5 rounded-xl transition-all ${
                activeTab === "keuangan" ? "bg-editorial-light-green text-editorial-pine font-bold" : "text-editorial-taupe hover:text-editorial-pine"
              }`}
              id="mobile-tab-keuangan"
            >
              Keuangan Kas
            </button>
            <button
              onClick={() => {
                setActiveTab("proposal");
                setMobileMenuOpen(false);
              }}
              className={`w-full text-left px-4 py-2.5 rounded-xl transition-all ${
                activeTab === "proposal" ? "bg-editorial-light-green text-editorial-pine font-bold" : "text-editorial-taupe hover:text-editorial-pine"
              }`}
              id="mobile-tab-proposal"
            >
              Proposal Digital
            </button>
            <button
              onClick={() => {
                setActiveTab("galeri");
                setMobileMenuOpen(false);
              }}
              className={`w-full text-left px-4 py-2.5 rounded-xl transition-all ${
                activeTab === "galeri" ? "bg-editorial-light-green text-editorial-pine font-bold" : "text-editorial-taupe hover:text-editorial-pine"
              }`}
              id="mobile-tab-galeri"
            >
              Galeri Kegiatan
            </button>
          </div>
        )}
      </header>

      {/* 2. Main content area */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full flex-1" id="main-content-area">
        {/* VIEW: Beranda (Home page) */}
        {activeTab === "beranda" && (
          <div className="space-y-8" id="view-home">
            {/* Elegant Hero card */}
            <div className="bg-editorial-pine text-white rounded-3xl overflow-hidden shadow-sm relative p-6 sm:p-10 flex flex-col justify-between min-h-[320px] border border-editorial-pine" id="home-hero-card">
              {/* Background gradient watermarks */}
              <div className="absolute inset-0 bg-gradient-to-tr from-editorial-pine via-editorial-pine/95 to-[#0E251B]" />
              <div className="absolute right-[-20px] bottom-[-20px] opacity-10 text-white pointer-events-none">
                <Compass className="w-80 h-80" />
              </div>

              <div className="z-10" id="hero-head">
                <span className="text-[10px] sm:text-xs font-mono font-black text-editorial-mint tracking-widest uppercase block mb-2">Selamat Datang di Portal Resmi</span>
                <h2 className="text-3xl sm:text-4xl font-bold font-serif tracking-tight leading-tight max-w-2xl text-white">
                  Memakmurkan Masjid,<br />Menebar Manfaat bagi Ummat
                </h2>
                <p className="text-xs sm:text-sm text-white/90 max-w-xl mt-3 leading-relaxed">
                  Pusat syiar dakwah, keterbukaan informasi program renovasi, dan transparansi laporan keuangan jemaah Masjid Nurul Falah Samaoling.
                </p>
              </div>

              <div className="z-10 mt-8 flex flex-wrap gap-4 items-center border-t border-white/10 pt-6" id="hero-foot">
                <div className="flex items-center gap-2 text-xs text-editorial-mint">
                  <MapPin className="w-4.5 h-4.5 text-editorial-mint flex-shrink-0" />
                  <span>Samaoling, Desa Parenring, Lilirilau, Kab. Soppeng 90871</span>
                </div>
              </div>
            </div>

            {/* Prayer times compact view banner */}
            <PrayerTimeCard prayerTimes={data.prayerTimes} />

            {/* Quick Informational grids (Imam, Muadzin & Donation QRIS) */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6" id="home-informational-grids">
              {/* Active Leaders Card */}
              <div className="lg:col-span-1 bg-white border border-editorial-border p-6 rounded-3xl shadow-sm flex flex-col justify-between" id="active-leaders-card">
                <div>
                  <h3 className="font-bold font-serif text-editorial-pine text-sm flex items-center gap-1.5 uppercase tracking-wide border-b border-editorial-border pb-3 mb-4">
                    <Users className="w-4 h-4 text-editorial-pine" /> Tokoh Masjid Pekan Ini
                  </h3>
                  <div className="space-y-4" id="leaders-list">
                    <div className="flex gap-3" id="leader-imam">
                      <div className="w-9 h-9 bg-editorial-light-green border border-editorial-border-green/30 rounded-xl flex items-center justify-center font-bold text-editorial-pine flex-shrink-0">
                        👳
                      </div>
                      <div>
                        <span className="text-[10px] text-editorial-taupe font-bold block uppercase">Imam Utama</span>
                        <h4 className="text-xs font-bold font-serif text-editorial-text leading-tight mt-0.5">{data.activeImam.imam}</h4>
                      </div>
                    </div>
                    <div className="flex gap-3" id="leader-muadzin">
                      <div className="w-9 h-9 bg-editorial-light-green border border-editorial-border-green/30 rounded-xl flex items-center justify-center font-bold text-editorial-pine flex-shrink-0">
                        📢
                      </div>
                      <div>
                        <span className="text-[10px] text-editorial-taupe font-bold block uppercase">Muadzin Aktif</span>
                        <h4 className="text-xs font-bold font-serif text-editorial-text leading-tight mt-0.5">{data.activeImam.muadzin}</h4>
                      </div>
                    </div>
                    <div className="flex gap-3" id="leader-khatib">
                      <div className="w-9 h-9 bg-editorial-light-green border border-editorial-border-green/30 rounded-xl flex items-center justify-center font-bold text-editorial-pine flex-shrink-0">
                        📜
                      </div>
                      <div>
                        <span className="text-[10px] text-editorial-taupe font-bold block uppercase">Khatib Jumat</span>
                        <h4 className="text-xs font-bold font-serif text-editorial-text leading-tight mt-0.5">{data.activeImam.khatib}</h4>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="mt-6 pt-4 border-t border-editorial-border text-center" id="leaders-footer">
                  <button
                    onClick={() => setActiveTab("galeri")}
                    className="text-xs font-bold text-editorial-pine hover:text-[#0E251B]"
                  >
                    Lihat Dokumentasi Kegiatan &rarr;
                  </button>
                </div>
              </div>

              {/* QRIS Donation Card Stand */}
              <div className="lg:col-span-2 bg-white border border-editorial-border p-6 rounded-3xl shadow-sm flex flex-col md:flex-row gap-6 items-center" id="donation-card-root">
                {/* QRIS SVG Code Drawing */}
                <div className="flex-shrink-0 bg-editorial-bg p-4 border border-editorial-border rounded-2xl flex flex-col items-center shadow-sm relative" id="qris-svg-wrapper">
                  <div className="text-center font-bold text-[10px] tracking-widest text-editorial-text mb-2 border-b border-editorial-border pb-1 w-full flex items-center justify-center gap-1">
                    <span>QRIS</span>
                    <span className="text-[9px] bg-red-800 text-white px-1 rounded">GPN</span>
                  </div>

                  {/* Draw a real-looking styled QR code with inline SVG */}
                  <svg width="150" height="150" viewBox="0 0 100 100" className="bg-white p-1 rounded-lg" id="qris-vector">
                    {/* Corners outer rings */}
                    <rect x="5" y="5" width="20" height="20" fill="none" stroke="#1B4332" strokeWidth="4" />
                    <rect x="9" y="9" width="12" height="12" fill="#1B4332" />
                    <rect x="75" y="5" width="20" height="20" fill="none" stroke="#1B4332" strokeWidth="4" />
                    <rect x="79" y="9" width="12" height="12" fill="#1B4332" />
                    <rect x="5" y="75" width="20" height="20" fill="none" stroke="#1B4332" strokeWidth="4" />
                    <rect x="9" y="79" width="12" height="12" fill="#1B4332" />

                    {/* Small center heart or mosque star */}
                    <rect x="44" y="44" width="12" height="12" fill="#1B4332" rx="2" />
                    <circle cx="50" cy="50" r="3" fill="#fff" />

                    {/* QR Code random pixel arrays simulating high-fidelity code */}
                    <rect x="35" y="5" width="5" height="5" fill="#1B4332" />
                    <rect x="45" y="15" width="5" height="5" fill="#1B4332" />
                    <rect x="60" y="5" width="5" height="10" fill="#1B4332" />
                    <rect x="50" y="25" width="10" height="5" fill="#1B4332" />
                    <rect x="5" y="35" width="10" height="5" fill="#1B4332" />
                    <rect x="25" y="30" width="5" height="10" fill="#1B4332" />
                    <rect x="15" y="45" width="5" height="5" fill="#1B4332" />
                    <rect x="5" y="55" width="5" height="10" fill="#1B4332" />
                    <rect x="20" y="60" width="10" height="5" fill="#1B4332" />
                    <rect x="35" y="75" width="5" height="15" fill="#1B4332" />
                    <rect x="45" y="85" width="15" height="5" fill="#1B4332" />
                    <rect x="65" y="75" width="5" height="5" fill="#1B4332" />
                    <rect x="75" y="45" width="5" height="15" fill="#1B4332" />
                    <rect x="85" y="35" width="10" height="5" fill="#1B4332" />
                    <rect x="65" y="35" width="5" height="5" fill="#1B4332" />
                    <rect x="65" y="55" width="10" height="10" fill="#1B4332" />
                  </svg>

                  <span className="text-[8px] font-bold text-editorial-taupe mt-2 tracking-wide font-mono">NMID: ID1023847583921</span>
                </div>

                {/* Details side */}
                <div className="flex-1 space-y-4" id="donation-details">
                  <div>
                    <span className="text-[10px] font-bold text-editorial-pine bg-editorial-light-green border border-editorial-border-green/40 px-2.5 py-1 rounded-full uppercase tracking-wide inline-block mb-1.5">DONASI MASJID</span>
                    <h3 className="font-bold font-serif text-editorial-pine text-lg leading-snug">Sumbangan Pembangunan & Operasional</h3>
                    <p className="text-xs text-editorial-text mt-1">Silakan scan kode QRIS atau transfer melalui rekening resmi bank syariah untuk menyalurkan infaq jariah terbaik Anda.</p>
                  </div>

                  <div className="bg-editorial-light-green/40 border border-editorial-border p-3 rounded-2xl flex items-center justify-between" id="bank-box">
                    <div>
                      <span className="text-[9px] text-editorial-taupe font-bold block uppercase">REKENING TRANSFER BSI</span>
                      <span className="text-sm font-bold text-editorial-text font-mono block tracking-wide">{data.qris.accountNumber}</span>
                      <span className="text-[10px] text-editorial-pine font-bold block mt-0.5">{data.qris.accountHolder}</span>
                    </div>

                    <button
                      onClick={() => handleCopyAccount(data.qris.accountNumber)}
                      className="p-2.5 text-editorial-text hover:text-editorial-pine hover:bg-editorial-light-green rounded-xl transition-colors border border-editorial-border bg-white shadow-sm flex items-center gap-1 text-[10px] font-bold"
                      id="copy-account-btn"
                    >
                      {copiedText ? (
                        <>
                          <Check className="w-3.5 h-3.5 text-editorial-pine" />
                          <span>Tersalin</span>
                        </>
                      ) : (
                        <>
                          <Copy className="w-3.5 h-3.5" />
                          <span>Salin Rek</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* VIEW: Jadwal Salat Details */}
        {activeTab === "jadwal" && (
          <div className="space-y-6" id="view-jadwal">
            <PrayerTimeCard prayerTimes={data.prayerTimes} />
          </div>
        )}

        {/* VIEW: Laporan Keuangan */}
        {activeTab === "keuangan" && (
          <div className="space-y-6" id="view-keuangan">
            <FinancialDashboard records={data.finances} />
          </div>
        )}

        {/* VIEW: Proposal Digital */}
        {activeTab === "proposal" && (
          <div className="space-y-6" id="view-proposal">
            <ProposalViewer proposal={data.proposal} />
          </div>
        )}

        {/* VIEW: Galeri Kegiatan */}
        {activeTab === "galeri" && (
          <div className="space-y-6" id="view-galeri">
            <GallerySection gallery={data.gallery} />
          </div>
        )}
      </main>

      {/* 3. Footer / Bottom credits */}
      <footer className="bg-editorial-pine text-white/80 border-t border-editorial-border/25" id="main-footer">
        {/* Upper footer */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 grid grid-cols-1 md:grid-cols-3 gap-8 text-xs leading-relaxed" id="footer-upper">
          {/* Identity column */}
          <div className="space-y-3" id="footer-col-identity">
            <div className="flex items-center gap-2 text-white" id="footer-logo">
              <span className="text-xl">🕌</span>
              <span className="font-bold font-serif tracking-tight text-sm uppercase">NURUL FALAH SAMAOLING</span>
            </div>
            <p className="text-white/70 leading-relaxed">
              Pusat syiar ibadah, pembinaan keummatan, dan wadah persatuan warga Dusun Samaoling, Desa Parenring, Kec. Lilirilau, Kabupaten Soppeng.
            </p>
          </div>

          {/* Location column */}
          <div className="space-y-3" id="footer-col-location">
            <h4 className="font-bold font-serif text-white text-xs uppercase tracking-wider">Alamat Masjid</h4>
            <div className="space-y-2 text-white/70" id="footer-address">
              <div className="flex gap-2">
                <MapPin className="w-4 h-4 text-editorial-mint flex-shrink-0" />
                <span>Samaoling, Desa Parenring, Kec. Lilirilau, Kab. Soppeng, Sulawesi Selatan 90871</span>
              </div>
            </div>
          </div>

          {/* Core Navigation/Actions column */}
          <div className="space-y-3 flex flex-col" id="footer-col-nav">
            <h4 className="font-bold font-serif text-white text-xs uppercase tracking-wider">Pintasan Informasi</h4>
            <div className="flex flex-col gap-2 items-start text-white/70" id="footer-nav">
              <button onClick={() => setActiveTab("beranda")} className="hover:text-editorial-mint transition-colors">Beranda Utama</button>
              <button onClick={() => setActiveTab("keuangan")} className="hover:text-editorial-mint transition-colors">Buku Kas Transparansi</button>
              <button onClick={() => setActiveTab("proposal")} className="hover:text-editorial-mint transition-colors">Proposal Renovasi Digital</button>
            </div>
          </div>
        </div>

        {/* Lower footer copyright */}
        <div className="border-t border-white/5 bg-[#0E251B] py-6" id="footer-lower">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row justify-between items-center gap-4 text-[10px] font-bold font-mono text-editorial-taupe" id="footer-lower-inner">
            <span>&copy; {new Date().getFullYear()} Masjid Nurul Falah Samaoling, Soppeng. All Rights Reserved.</span>
            
            {/* Float administrative access toggle */}
            <button
              onClick={() => setIsAdminOpen(true)}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-white/10 hover:bg-white/20 text-white rounded-lg transition-all border border-white/10 shadow-sm"
              id="admin-access-btn"
            >
              <Lock className="w-3.5 h-3.5 text-editorial-mint" />
              <span>Kelola Konten (Admin)</span>
            </button>
          </div>
        </div>
      </footer>

      {/* Admin Panel overlay modal */}
      {isAdminOpen && (
        <AdminPanel
          data={data}
          onRefreshData={fetchData}
          onClose={() => setIsAdminOpen(false)}
        />
      )}
    </div>
  );
}
