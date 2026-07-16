import React, { useState, useEffect } from "react";
import {
  Lock,
  User,
  Plus,
  Trash2,
  Edit2,
  Calendar,
  Save,
  CheckCircle,
  X,
  Clock,
  DollarSign,
  Users,
  Compass,
  FileText,
  Bell,
  LogOut,
  KeyRound
} from "lucide-react";
import { DatabaseSchema, FinancialRecord, GalleryItem, Pengurus, Announcement } from "../types";

interface AdminPanelProps {
  data: DatabaseSchema;
  onRefreshData: () => void;
  onClose: () => void;
}

export default function AdminPanel({ data, onRefreshData, onClose }: AdminPanelProps) {
  // Authentication State
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [authToken, setAuthToken] = useState<string | null>(null);
  const [authError, setAuthError] = useState("");

  // Control State
  const [activeTab, setActiveTab] = useState<"jadwal" | "keuangan" | "galeri" | "pengurus" | "proposal" | "notifikasi" | "password">("jadwal");
  const [alertMsg, setAlertMsg] = useState<{ text: string; type: "success" | "error" } | null>(null);

  // Form states
  // 1. Prayer Times manual overrides
  const [prayerMethod, setPrayerMethod] = useState<"auto" | "manual">("auto");
  const [manualPrayers, setManualPrayers] = useState({
    subuh: "",
    syuruk: "",
    zuhur: "",
    asar: "",
    magrib: "",
    isya: ""
  });

  // 2. Financial entries form
  const [finForm, setFinForm] = useState({
    id: "",
    date: "",
    type: "pemasukan" as "pemasukan" | "pengeluaran",
    category: "",
    description: "",
    amount: ""
  });
  const [isFinEditing, setIsFinEditing] = useState(false);

  // 3. Gallery form
  const [galForm, setGalForm] = useState({
    id: "",
    title: "",
    date: "",
    description: "",
    imageUrl: ""
  });
  const [isGalEditing, setIsGalEditing] = useState(false);

  // 4. Pengurus Form
  const [pengForm, setPengForm] = useState({
    id: "",
    name: "",
    role: "",
    phone: ""
  });
  const [isPengEditing, setIsPengEditing] = useState(false);

  // 5. Active Imam, Muadzin, Khatib Friday
  const [imamForm, setImamForm] = useState({
    imam: "",
    muadzin: "",
    khatib: ""
  });

  // 6. Proposal Form
  const [propForm, setPropForm] = useState({
    title: "",
    description: "",
    targetAmount: "",
    collectedAmount: "",
    sections: [] as typeof data.proposal.sections
  });

  // 7. Announcement / notification broadcast
  const [annForm, setAnnForm] = useState({
    title: "",
    content: "",
    type: "umum" as Announcement["type"]
  });

  // 8. Change Password
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: ""
  });

  // Load Auth Token from localStorage on mount
  useEffect(() => {
    const savedToken = localStorage.getItem("mosque_admin_token");
    const savedUser = localStorage.getItem("mosque_admin_user");
    if (savedToken && savedUser) {
      setAuthToken(savedToken);
      setUsername(savedUser);
      setIsLoggedIn(true);
    }
  }, []);

  // Sync initial state values once data loads
  useEffect(() => {
    if (data) {
      setPrayerMethod(data.prayerTimes.method);
      setManualPrayers({
        subuh: data.prayerTimes.subuh,
        syuruk: data.prayerTimes.syuruk,
        zuhur: data.prayerTimes.zuhur,
        asar: data.prayerTimes.asar,
        magrib: data.prayerTimes.magrib,
        isya: data.prayerTimes.isya
      });

      setImamForm({
        imam: data.activeImam.imam,
        muadzin: data.activeImam.muadzin,
        khatib: data.activeImam.khatib
      });

      setPropForm({
        title: data.proposal.title,
        description: data.proposal.description,
        targetAmount: String(data.proposal.targetAmount),
        collectedAmount: String(data.proposal.collectedAmount),
        sections: [...data.proposal.sections]
      });
    }
  }, [data]);

  // Alert dismiss helper
  const triggerAlert = (text: string, type: "success" | "error" = "success") => {
    setAlertMsg({ text, type });
    setTimeout(() => {
      setAlertMsg(null);
    }, 5000);
  };

  // Login handler
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError("");

    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password })
      });

      const contentType = res.headers.get("content-type");
      if (!contentType || !contentType.includes("application/json")) {
        throw new Error("Respon server tidak valid (bukan JSON). Silakan coba lagi nanti.");
      }

      const body = await res.json();
      if (!res.ok) {
        throw new Error(body.message || "Login gagal.");
      }

      localStorage.setItem("mosque_admin_token", body.token);
      localStorage.setItem("mosque_admin_user", body.username);
      setAuthToken(body.token);
      setIsLoggedIn(true);
      setPassword("");
      triggerAlert("Selamat datang! Berhasil masuk ke Halaman Admin.");
    } catch (err: any) {
      setAuthError(err.message || "Terjadi kesalahan jaringan.");
    }
  };

  // Logout handler
  const handleLogout = () => {
    localStorage.removeItem("mosque_admin_token");
    localStorage.removeItem("mosque_admin_user");
    setAuthToken(null);
    setIsLoggedIn(false);
    triggerAlert("Berhasil keluar dari Halaman Admin.");
  };

  // Core authenticated API request wrapper
  const adminRequest = async (url: string, payload: object) => {
    try {
      const res = await fetch(url, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${authToken}`
        },
        body: JSON.stringify(payload)
      });

      const contentType = res.headers.get("content-type");
      if (!contentType || !contentType.includes("application/json")) {
        throw new Error("Respon server tidak valid (bukan JSON). Silakan coba lagi nanti.");
      }

      const body = await res.json();
      if (!res.ok) {
        if (res.status === 401) {
          handleLogout();
          throw new Error("Sesi Anda telah kedaluwarsa. Silakan masuk kembali.");
        }
        throw new Error(body.message || "Gagal menyimpan perubahan.");
      }

      onRefreshData();
      return body;
    } catch (err: any) {
      triggerAlert(err.message || "Jaringan bermasalah.", "error");
      throw err;
    }
  };

  // 1. Save Prayer Times
  const handleSavePrayers = async (e: React.FormEvent) => {
    e.preventDefault();
    await adminRequest("/api/admin/prayer-times", {
      method: prayerMethod,
      ...manualPrayers
    });
    triggerAlert("Jadwal salat berhasil diperbarui.");
  };

  // 2. Financial ledger CRUD
  const handleSaveFinance = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!finForm.category || !finForm.description || !finForm.amount) {
      return triggerAlert("Mohon isi seluruh data keuangan yang wajib.", "error");
    }

    await adminRequest("/api/admin/finances", {
      action: isFinEditing ? "edit" : "add",
      record: {
        id: finForm.id,
        date: finForm.date || new Date().toISOString().split("T")[0],
        type: finForm.type,
        category: finForm.category,
        description: finForm.description,
        amount: Number(finForm.amount)
      }
    });

    setFinForm({ id: "", date: "", type: "pemasukan", category: "", description: "", amount: "" });
    setIsFinEditing(false);
    triggerAlert("Catatan transaksi keuangan berhasil disimpan.");
  };

  const handleEditFinanceClick = (record: FinancialRecord) => {
    setFinForm({
      id: record.id,
      date: record.date,
      type: record.type,
      category: record.category,
      description: record.description,
      amount: String(record.amount)
    });
    setIsFinEditing(true);
  };

  const handleDeleteFinance = async (id: string) => {
    if (!window.confirm("Apakah Anda yakin ingin menghapus catatan keuangan ini?")) return;
    await adminRequest("/api/admin/finances", {
      action: "delete",
      record: { id }
    });
    triggerAlert("Catatan transaksi keuangan berhasil dihapus.");
  };

  // 3. Activity gallery CRUD
  const handleSaveGallery = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!galForm.title || !galForm.description) {
      return triggerAlert("Mohon lengkapi judul dan deskripsi kegiatan.", "error");
    }

    await adminRequest("/api/admin/gallery", {
      action: isGalEditing ? "edit" : "add",
      item: {
        id: galForm.id,
        title: galForm.title,
        date: galForm.date || new Date().toISOString().split("T")[0],
        description: galForm.description,
        imageUrl: galForm.imageUrl
      }
    });

    setGalForm({ id: "", title: "", date: "", description: "", imageUrl: "" });
    setIsGalEditing(false);
    triggerAlert("Dokumentasi kegiatan berhasil dipos.");
  };

  const handleEditGalleryClick = (item: GalleryItem) => {
    setGalForm({
      id: item.id,
      title: item.title,
      date: item.date,
      description: item.description,
      imageUrl: item.imageUrl
    });
    setIsGalEditing(true);
  };

  const handleDeleteGallery = async (id: string) => {
    if (!window.confirm("Apakah Anda yakin ingin menghapus kegiatan ini?")) return;
    await adminRequest("/api/admin/gallery", {
      action: "delete",
      item: { id }
    });
    triggerAlert("Kegiatan berhasil dihapus.");
  };

  // 4. Pengurus CRUD
  const handleSavePengurus = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!pengForm.name || !pengForm.role) {
      return triggerAlert("Nama pengurus dan Jabatan wajib diisi.", "error");
    }

    await adminRequest("/api/admin/pengurus", {
      action: isPengEditing ? "edit" : "add",
      member: {
        id: pengForm.id,
        name: pengForm.name,
        role: pengForm.role,
        phone: pengForm.phone
      }
    });

    setPengForm({ id: "", name: "", role: "", phone: "" });
    setIsPengEditing(false);
    triggerAlert("Data pengurus berhasil diperbarui.");
  };

  const handleEditPengurusClick = (p: Pengurus) => {
    setPengForm({
      id: p.id,
      name: p.name,
      role: p.role,
      phone: p.phone
    });
    setIsPengEditing(true);
  };

  const handleDeletePengurus = async (id: string) => {
    if (!window.confirm("Hapus pengurus ini?")) return;
    await adminRequest("/api/admin/pengurus", {
      action: "delete",
      member: { id }
    });
    triggerAlert("Pengurus berhasil dihapus.");
  };

  // 5. Active Imam & Muadzin
  const handleSaveImam = async (e: React.FormEvent) => {
    e.preventDefault();
    await adminRequest("/api/admin/active-imam", imamForm);
    triggerAlert("Data Imam, Muadzin & Khatib berhasil disimpan.");
  };

  // 6. Proposal Edit
  const handleSaveProposal = async (e: React.FormEvent) => {
    e.preventDefault();
    await adminRequest("/api/admin/proposal", {
      title: propForm.title,
      description: propForm.description,
      targetAmount: Number(propForm.targetAmount),
      collectedAmount: Number(propForm.collectedAmount),
      sections: propForm.sections
    });
    triggerAlert("Data Proposal Digital berhasil disimpan.");
  };

  const handleSectionContentChange = (index: number, val: string) => {
    const updated = [...propForm.sections];
    updated[index].content = val;
    setPropForm({ ...propForm, sections: updated });
  };

  // 7. Send Announcement (Broadcast Notification)
  const handleSendNotification = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!annForm.title || !annForm.content) {
      return triggerAlert("Judul dan isi pengumuman wajib diisi.", "error");
    }

    await adminRequest("/api/admin/announcements", {
      action: "add",
      announcement: {
        title: annForm.title,
        content: annForm.content,
        type: annForm.type
      }
    });

    setAnnForm({ title: "", content: "", type: "umum" });
    triggerAlert("Notifikasi informasi berhasil disebarluaskan.");
  };

  const handleDeleteAnnouncement = async (id: string) => {
    if (!window.confirm("Hapus pemberitahuan ini dari pusat informasi?")) return;
    await adminRequest("/api/admin/announcements", {
      action: "delete",
      announcement: { id }
    });
    triggerAlert("Pemberitahuan berhasil dihapus.");
  };

  // 8. Change password handler
  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      return triggerAlert("Password baru dan konfirmasi tidak sesuai.", "error");
    }

    try {
      await adminRequest("/api/admin/change-password", {
        currentPassword: passwordForm.currentPassword,
        newPassword: passwordForm.newPassword
      });
      setPasswordForm({ currentPassword: "", newPassword: "", confirmPassword: "" });
      triggerAlert("Kata sandi admin berhasil diperbarui.");
    } catch (err) {}
  };

  // Formatted Money Converter
  const formatMoney = (val: number) => {
    return new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", minimumFractionDigits: 0 }).format(val);
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-sm flex justify-center items-center p-4 overflow-y-auto" id="admin-panel-backdrop">
      <div className="bg-editorial-bg border border-editorial-border rounded-3xl w-full max-w-6xl h-[90vh] flex flex-col overflow-hidden shadow-2xl relative" id="admin-card-container">
        {/* Floating close button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-1.5 hover:bg-editorial-light-green rounded-full transition-colors z-20 text-editorial-taupe hover:text-editorial-pine"
          id="close-admin-btn"
        >
          <X className="w-5 h-5" />
        </button>

        {/* 1. Login State overlay */}
        {!isLoggedIn ? (
          <div className="flex-1 flex flex-col md:flex-row h-full" id="admin-login-layout">
            {/* Islamic Art / Mosque banner left */}
            <div className="md:w-1/2 bg-editorial-pine text-white p-8 flex flex-col justify-between relative overflow-hidden" id="login-banner">
              <div className="absolute inset-0 bg-gradient-to-tr from-[#0E251B] via-editorial-pine to-[#132E22] opacity-90" />
              <div className="absolute -right-20 -bottom-20 opacity-10 text-white pointer-events-none">
                <Compass className="w-80 h-80" />
              </div>
              <div className="z-10" id="login-banner-head">
                <span className="text-xs font-mono tracking-wider text-editorial-mint uppercase font-bold">Kec. Lilirilau, Soppeng</span>
                <h2 className="text-2xl font-bold font-serif mt-2">Sistem Informasi Masjid<br />Nurul Falah Samaoling</h2>
              </div>
              <div className="z-10 text-xs text-editorial-mint mt-12 leading-relaxed font-serif" id="login-banner-foot">
                <p className="italic">&ldquo;Hanya yang memakmurkan masjid-masjid Allah ialah orang-orang yang beriman kepada Allah dan Hari kemudian, serta tetap mendirikan shalat, menunaikan zakat dan tidak takut (kepada siapapun) selain kepada Allah.&rdquo;</p>
                <p className="mt-2 font-bold font-sans text-white text-[11px]">— QS. At-Tubah: 18</p>
              </div>
            </div>

            {/* Login form right */}
            <div className="md:w-1/2 p-8 flex flex-col justify-center bg-editorial-bg" id="login-form-wrapper">
              <div className="max-w-sm w-full mx-auto space-y-6" id="login-content">
                <div>
                  <h3 className="text-xl font-bold font-serif text-editorial-pine">Sistem Keamanan Admin</h3>
                  <p className="text-xs text-editorial-taupe mt-1">Gunakan kredensial pengurus masjid untuk mengakses panel pengelolaan.</p>
                </div>

                <form onSubmit={handleLogin} className="space-y-4" id="login-form">
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-editorial-text block">Username</label>
                    <div className="relative">
                      <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4.5 h-4.5 text-editorial-taupe" />
                      <input
                        type="text"
                        required
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                        placeholder="Masukkan username"
                        className="w-full pl-10 pr-4 py-2.5 border border-editorial-border rounded-xl text-xs bg-white text-editorial-text focus:outline-none focus:ring-2 focus:ring-editorial-pine/10 focus:border-editorial-pine"
                        id="login-username-input"
                      />
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-editorial-text block">Sandi Keamanan</label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4.5 h-4.5 text-editorial-taupe" />
                      <input
                        type="password"
                        required
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="••••••••"
                        className="w-full pl-10 pr-4 py-2.5 border border-editorial-border rounded-xl text-xs bg-white text-editorial-text focus:outline-none focus:ring-2 focus:ring-editorial-pine/10 focus:border-editorial-pine"
                        id="login-password-input"
                      />
                    </div>
                  </div>

                  {authError && (
                    <div className="p-3 bg-rose-50 border border-rose-100 text-rose-700 text-xs rounded-xl font-medium" id="login-error-msg">
                      {authError}
                    </div>
                  )}

                  <button
                    type="submit"
                    className="w-full py-3 bg-editorial-pine hover:bg-[#0E251B] text-white rounded-xl font-bold text-xs transition-colors shadow-md shadow-editorial-pine/10"
                    id="login-submit-btn"
                  >
                    Masuk Sekarang
                  </button>
                </form>

                <div className="text-center" id="login-help">
                  <span className="text-[10px] text-editorial-taupe font-mono">Default: admin | nurulfalah123</span>
                </div>
              </div>
            </div>
          </div>
        ) : (
          /* 2. Admin Dash layout once logged in */
          <div className="flex-1 flex flex-col md:flex-row overflow-hidden h-full" id="admin-main-dashboard">
            {/* Sidebar Left */}
            <div className="w-full md:w-64 bg-slate-900 text-slate-300 flex flex-col justify-between border-r border-slate-800" id="admin-sidebar">
              <div className="p-5 space-y-6 overflow-y-auto" id="sidebar-content">
                <div>
                  <span className="text-[10px] font-mono uppercase font-black text-emerald-500 tracking-widest block">SAMAOLING APPLET</span>
                  <h3 className="font-bold text-sm text-white mt-1">Panel Pengurus</h3>
                </div>

                <div className="space-y-1" id="sidebar-nav">
                  <button
                    onClick={() => setActiveTab("jadwal")}
                    className={`w-full flex items-center gap-2.5 px-4 py-3 rounded-xl text-xs font-bold transition-colors ${
                      activeTab === "jadwal" ? "bg-emerald-700 text-white" : "hover:bg-slate-800 text-slate-300 hover:text-white"
                    }`}
                    id="nav-jadwal"
                  >
                    <Clock className="w-4 h-4" /> Jadwal Salat
                  </button>
                  <button
                    onClick={() => setActiveTab("keuangan")}
                    className={`w-full flex items-center gap-2.5 px-4 py-3 rounded-xl text-xs font-bold transition-colors ${
                      activeTab === "keuangan" ? "bg-emerald-700 text-white" : "hover:bg-slate-800 text-slate-300 hover:text-white"
                    }`}
                    id="nav-keuangan"
                  >
                    <DollarSign className="w-4 h-4" /> Keuangan Masjid
                  </button>
                  <button
                    onClick={() => setActiveTab("galeri")}
                    className={`w-full flex items-center gap-2.5 px-4 py-3 rounded-xl text-xs font-bold transition-colors ${
                      activeTab === "galeri" ? "bg-emerald-700 text-white" : "hover:bg-slate-800 text-slate-300 hover:text-white"
                    }`}
                    id="nav-galeri"
                  >
                    <Calendar className="w-4 h-4" /> Galeri Kegiatan
                  </button>
                  <button
                    onClick={() => setActiveTab("pengurus")}
                    className={`w-full flex items-center gap-2.5 px-4 py-3 rounded-xl text-xs font-bold transition-colors ${
                      activeTab === "pengurus" ? "bg-emerald-700 text-white" : "hover:bg-slate-800 text-slate-300 hover:text-white"
                    }`}
                    id="nav-pengurus"
                  >
                    <Users className="w-4 h-4" /> Pengurus & Imam
                  </button>
                  <button
                    onClick={() => setActiveTab("proposal")}
                    className={`w-full flex items-center gap-2.5 px-4 py-3 rounded-xl text-xs font-bold transition-colors ${
                      activeTab === "proposal" ? "bg-emerald-700 text-white" : "hover:bg-slate-800 text-slate-300 hover:text-white"
                    }`}
                    id="nav-proposal"
                  >
                    <FileText className="w-4 h-4" /> Edit Proposal
                  </button>
                  <button
                    onClick={() => setActiveTab("notifikasi")}
                    className={`w-full flex items-center gap-2.5 px-4 py-3 rounded-xl text-xs font-bold transition-colors ${
                      activeTab === "notifikasi" ? "bg-emerald-700 text-white" : "hover:bg-slate-800 text-slate-300 hover:text-white"
                    }`}
                    id="nav-notifikasi"
                  >
                    <Bell className="w-4 h-4" /> Kirim Informasi
                  </button>
                  <button
                    onClick={() => setActiveTab("password")}
                    className={`w-full flex items-center gap-2.5 px-4 py-3 rounded-xl text-xs font-bold transition-colors ${
                      activeTab === "password" ? "bg-emerald-700 text-white" : "hover:bg-slate-800 text-slate-300 hover:text-white"
                    }`}
                    id="nav-password"
                  >
                    <KeyRound className="w-4 h-4" /> Ganti Password
                  </button>
                </div>
              </div>

              {/* Sidebar bottom (Logout info) */}
              <div className="p-4 border-t border-slate-800 bg-slate-950/40 flex items-center justify-between" id="sidebar-footer">
                <div className="flex flex-col">
                  <span className="text-[10px] text-slate-500 font-bold">Masuk sebagai</span>
                  <span className="text-xs font-bold text-white font-mono truncate max-w-28">{username}</span>
                </div>
                <button
                  onClick={handleLogout}
                  className="p-2 bg-slate-800 hover:bg-rose-950 text-slate-400 hover:text-white rounded-xl transition-colors"
                  title="Logout"
                  id="logout-sidebar-btn"
                >
                  <LogOut className="w-4.5 h-4.5" />
                </button>
              </div>
            </div>

            {/* Dashboard Content Right */}
            <div className="flex-1 bg-slate-50 overflow-y-auto p-6 md:p-8 flex flex-col justify-between" id="admin-dashboard-content-area">
              <div className="space-y-6 flex-1" id="dash-panel-view">
                {/* Global toast notification inside panel */}
                {alertMsg && (
                  <div
                    className={`p-4 rounded-2xl flex items-center gap-3 text-xs font-bold border transition-all ${
                      alertMsg.type === "success"
                        ? "bg-emerald-50 border-emerald-100 text-emerald-800"
                        : "bg-rose-50 border-rose-100 text-rose-800"
                    }`}
                    id="dash-global-toast"
                  >
                    <CheckCircle className="w-5 h-5 flex-shrink-0" />
                    <span>{alertMsg.text}</span>
                  </div>
                )}

                {/* 1. Tab: Jadwal Salat */}
                {activeTab === "jadwal" && (
                  <div className="space-y-6" id="view-jadwal-salat">
                    <div id="view-hdr">
                      <h3 className="text-xl font-extrabold text-slate-800">Manajemen Jadwal Salat</h3>
                      <p className="text-xs text-slate-500 mt-1">Pilih metode sinkronisasi jadwal salat otomatis atau manual harian.</p>
                    </div>

                    <form onSubmit={handleSavePrayers} className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm space-y-6" id="prayer-manage-form">
                      {/* Radios */}
                      <div className="space-y-2">
                        <label className="text-xs font-bold text-slate-700 block">Metode Perhitungan</label>
                        <div className="flex gap-4">
                          <label className="flex items-center gap-2 text-xs font-semibold cursor-pointer">
                            <input
                              type="radio"
                              name="prayerMethod"
                              checked={prayerMethod === "auto"}
                              onChange={() => setPrayerMethod("auto")}
                              className="accent-emerald-700"
                            />
                            <span>Sinkronisasi Astronomis Otomatis (Koordinat Soppeng)</span>
                          </label>
                          <label className="flex items-center gap-2 text-xs font-semibold cursor-pointer">
                            <input
                              type="radio"
                              name="prayerMethod"
                              checked={prayerMethod === "manual"}
                              onChange={() => setPrayerMethod("manual")}
                              className="accent-emerald-700"
                            />
                            <span>Jadwal Manual Terpaku</span>
                          </label>
                        </div>
                      </div>

                      {/* Manual Input Fields */}
                      {prayerMethod === "manual" ? (
                        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-4" id="manual-fields">
                          {Object.keys(manualPrayers).map((key) => (
                            <div key={key} className="space-y-1.5">
                              <label className="text-xs font-bold text-slate-600 block capitalize">{key}</label>
                              <input
                                type="text"
                                placeholder="HH:MM"
                                required
                                value={(manualPrayers as any)[key]}
                                onChange={(e) => setManualPrayers({ ...manualPrayers, [key]: e.target.value })}
                                className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs text-center font-mono focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
                              />
                            </div>
                          ))}
                        </div>
                      ) : (
                        <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100 text-xs text-slate-600 leading-relaxed" id="auto-note">
                          Sistem mendeteksi letak geografis <strong>Kecamatan Lilirilau, Kabupaten Soppeng (Lat: -4.35, Lon: 119.9)</strong>. Jadwal salat diperbarui secara otomatis menggunakan kalkulasi astronomi syar'i Kemenag RI dengan pengaman ikhtiyati +2 menit.
                        </div>
                      )}

                      <button
                        type="submit"
                        className="px-6 py-2.5 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl font-bold text-xs transition-colors flex items-center gap-2 shadow-sm"
                        id="save-prayers-btn"
                      >
                        <Save className="w-4 h-4" /> Simpan Konfigurasi
                      </button>
                    </form>
                  </div>
                )}

                {/* 2. Tab: Keuangan Masjid */}
                {activeTab === "keuangan" && (
                  <div className="space-y-6" id="view-keuangan">
                    <div id="view-hdr">
                      <h3 className="text-xl font-extrabold text-slate-800">Buku Kas Masjid</h3>
                      <p className="text-xs text-slate-500 mt-1">Kelola pencatatan pemasukan (amal jumat, donatur, zakat) dan pengeluaran operasional masjid.</p>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6" id="keuangan-dash-body">
                      {/* Entry Form */}
                      <div className="lg:col-span-1 bg-white p-6 rounded-3xl border border-slate-100 shadow-sm h-fit" id="keuangan-form-container">
                        <h4 className="font-bold text-slate-800 text-sm mb-4">
                          {isFinEditing ? "Edit Transaksi" : "Tambah Transaksi Kas"}
                        </h4>

                        <form onSubmit={handleSaveFinance} className="space-y-4" id="keuangan-form">
                          <div className="space-y-1.5">
                            <label className="text-xs font-bold text-slate-600 block">Tipe Kas</label>
                            <div className="grid grid-cols-2 gap-2">
                              <button
                                type="button"
                                onClick={() => setFinForm({ ...finForm, type: "pemasukan" })}
                                className={`py-2 text-xs font-bold rounded-xl border transition-colors ${
                                  finForm.type === "pemasukan"
                                    ? "bg-emerald-50 border-emerald-500 text-emerald-800"
                                    : "border-slate-200 text-slate-600 hover:bg-slate-50"
                                }`}
                              >
                                Pemasukan (+)
                              </button>
                              <button
                                type="button"
                                onClick={() => setFinForm({ ...finForm, type: "pengeluaran" })}
                                className={`py-2 text-xs font-bold rounded-xl border transition-colors ${
                                  finForm.type === "pengeluaran"
                                    ? "bg-rose-50 border-rose-500 text-rose-800"
                                    : "border-slate-200 text-slate-600 hover:bg-slate-50"
                                }`}
                              >
                                Pengeluaran (-)
                              </button>
                            </div>
                          </div>

                          <div className="space-y-1.5">
                            <label className="text-xs font-bold text-slate-600 block">Tanggal Transaksi</label>
                            <input
                              type="date"
                              value={finForm.date}
                              onChange={(e) => setFinForm({ ...finForm, date: e.target.value })}
                              className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
                            />
                          </div>

                          <div className="space-y-1.5">
                            <label className="text-xs font-bold text-slate-600 block">Kategori</label>
                            <input
                              type="text"
                              required
                              placeholder="Misal: Kotak Amal, Listrik, Kebersihan, Pembangunan"
                              value={finForm.category}
                              onChange={(e) => setFinForm({ ...finForm, category: e.target.value })}
                              className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
                            />
                          </div>

                          <div className="space-y-1.5">
                            <label className="text-xs font-bold text-slate-600 block">Deskripsi Transaksi</label>
                            <input
                              type="text"
                              required
                              placeholder="Misal: Kotak Amal Shalat Jumat Pekan Kedua"
                              value={finForm.description}
                              onChange={(e) => setFinForm({ ...finForm, description: e.target.value })}
                              className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
                            />
                          </div>

                          <div className="space-y-1.5">
                            <label className="text-xs font-bold text-slate-600 block">Jumlah Anggaran (IDR)</label>
                            <input
                              type="number"
                              required
                              placeholder="Masukkan nominal angka saja"
                              value={finForm.amount}
                              onChange={(e) => setFinForm({ ...finForm, amount: e.target.value })}
                              className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-emerald-500/20 font-mono"
                            />
                          </div>

                          <div className="flex gap-2 pt-2">
                            <button
                              type="submit"
                              className="flex-1 py-2 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl text-xs font-bold transition-colors"
                            >
                              {isFinEditing ? "Perbarui" : "Simpan Entri"}
                            </button>
                            {isFinEditing && (
                              <button
                                type="button"
                                onClick={() => {
                                  setIsFinEditing(false);
                                  setFinForm({ id: "", date: "", type: "pemasukan", category: "", description: "", amount: "" });
                                }}
                                className="px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold transition-colors"
                              >
                                Batal
                              </button>
                            )}
                          </div>
                        </form>
                      </div>

                      {/* Financial List */}
                      <div className="lg:col-span-2 bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden h-[500px] flex flex-col justify-between" id="keuangan-ledger-container">
                        <div className="p-4 border-b border-slate-100 bg-slate-50/50">
                          <h4 className="font-bold text-slate-800 text-xs uppercase tracking-wider">Histori Jurnal Transaksi</h4>
                        </div>

                        <div className="flex-1 overflow-y-auto divide-y divide-slate-100">
                          {data.finances.map((r) => (
                            <div key={r.id} className="p-4 flex items-center justify-between hover:bg-slate-50/40 transition-colors">
                              <div>
                                <span className="text-[9px] font-mono text-slate-400 block">{r.date}</span>
                                <h5 className="font-bold text-slate-800 text-xs mt-0.5">{r.description}</h5>
                                <span className="bg-slate-100 text-slate-600 text-[9px] px-2 py-0.5 rounded-full font-bold mt-1.5 inline-block">
                                  {r.category}
                                </span>
                              </div>

                              <div className="flex items-center gap-4">
                                <span className={`text-xs font-bold font-mono ${r.type === "pemasukan" ? "text-emerald-700" : "text-rose-600"}`}>
                                  {r.type === "pemasukan" ? "+" : "-"} {formatMoney(r.amount).replace("Rp", "").trim()}
                                </span>
                                <div className="flex gap-1">
                                  <button
                                    onClick={() => handleEditFinanceClick(r)}
                                    className="p-1.5 hover:bg-slate-100 text-slate-500 hover:text-emerald-700 rounded-lg transition-colors"
                                  >
                                    <Edit2 className="w-3.5 h-3.5" />
                                  </button>
                                  <button
                                    onClick={() => handleDeleteFinance(r.id)}
                                    className="p-1.5 hover:bg-slate-100 text-slate-500 hover:text-rose-600 rounded-lg transition-colors"
                                  >
                                    <Trash2 className="w-3.5 h-3.5" />
                                  </button>
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* 3. Tab: Galeri Kegiatan */}
                {activeTab === "galeri" && (
                  <div className="space-y-6" id="view-galeri">
                    <div id="view-hdr">
                      <h3 className="text-xl font-extrabold text-slate-800">Galeri Kegiatan</h3>
                      <p className="text-xs text-slate-500 mt-1">Kelola dokumentasi berita kegiatan majelis, gotong royong, dan laporan pembangunan masjid.</p>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6" id="galeri-dash-body">
                      {/* Entry Form */}
                      <div className="lg:col-span-1 bg-white p-6 rounded-3xl border border-slate-100 shadow-sm h-fit" id="galeri-form-container">
                        <h4 className="font-bold text-slate-800 text-sm mb-4">
                          {isGalEditing ? "Edit Kegiatan" : "Posting Kegiatan Baru"}
                        </h4>

                        <form onSubmit={handleSaveGallery} className="space-y-4" id="galeri-form">
                          <div className="space-y-1.5">
                            <label className="text-xs font-bold text-slate-600 block">Judul Kegiatan</label>
                            <input
                              type="text"
                              required
                              placeholder="Misal: Tabligh Akbar Muharram"
                              value={galForm.title}
                              onChange={(e) => setGalForm({ ...galForm, title: e.target.value })}
                              className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
                            />
                          </div>

                          <div className="space-y-1.5">
                            <label className="text-xs font-bold text-slate-600 block">Tanggal</label>
                            <input
                              type="date"
                              value={galForm.date}
                              onChange={(e) => setGalForm({ ...galForm, date: e.target.value })}
                              className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
                            />
                          </div>

                          <div className="space-y-1.5">
                            <label className="text-xs font-bold text-slate-600 block">Deskripsi/Berita Lengkap</label>
                            <textarea
                              rows={4}
                              required
                              placeholder="Tuliskan berita lengkap detail kegiatan..."
                              value={galForm.description}
                              onChange={(e) => setGalForm({ ...galForm, description: e.target.value })}
                              className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
                            />
                          </div>

                          <div className="space-y-1.5">
                            <label className="text-xs font-bold text-slate-600 block">URL Link Foto Dokumentasi</label>
                            <input
                              type="text"
                              placeholder="Biarkan kosong untuk gambar acak"
                              value={galForm.imageUrl}
                              onChange={(e) => setGalForm({ ...galForm, imageUrl: e.target.value })}
                              className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
                            />
                          </div>

                          <div className="flex gap-2 pt-2">
                            <button
                              type="submit"
                              className="flex-1 py-2 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl text-xs font-bold transition-colors"
                            >
                              {isGalEditing ? "Perbarui" : "Posting Sekarang"}
                            </button>
                            {isGalEditing && (
                              <button
                                type="button"
                                onClick={() => {
                                  setIsGalEditing(false);
                                  setGalForm({ id: "", title: "", date: "", description: "", imageUrl: "" });
                                }}
                                className="px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold transition-colors"
                              >
                                Batal
                              </button>
                            )}
                          </div>
                        </form>
                      </div>

                      {/* Items List */}
                      <div className="lg:col-span-2 bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden h-[500px] flex flex-col justify-between" id="galeri-list-container">
                        <div className="p-4 border-b border-slate-100 bg-slate-50/50">
                          <h4 className="font-bold text-slate-800 text-xs uppercase tracking-wider">Histori Kegiatan Terpublikasi</h4>
                        </div>

                        <div className="flex-1 overflow-y-auto divide-y divide-slate-100">
                          {data.gallery.map((item) => (
                            <div key={item.id} className="p-4 flex gap-4 hover:bg-slate-50/40 transition-colors items-start">
                              <img
                                src={item.imageUrl}
                                alt={item.title}
                                referrerPolicy="no-referrer"
                                className="w-16 h-16 rounded-xl object-cover bg-slate-100 flex-shrink-0"
                              />
                              <div className="flex-1 min-w-0">
                                <div className="flex justify-between items-start">
                                  <div>
                                    <span className="text-[9px] font-mono text-slate-400">{item.date}</span>
                                    <h5 className="font-bold text-slate-800 text-xs truncate mt-0.5">{item.title}</h5>
                                  </div>
                                  <div className="flex gap-1 ml-2">
                                    <button
                                      onClick={() => handleEditGalleryClick(item)}
                                      className="p-1.5 hover:bg-slate-100 text-slate-500 hover:text-emerald-700 rounded-lg transition-colors"
                                    >
                                      <Edit2 className="w-3.5 h-3.5" />
                                    </button>
                                    <button
                                      onClick={() => handleDeleteGallery(item.id)}
                                      className="p-1.5 hover:bg-slate-100 text-slate-500 hover:text-rose-600 rounded-lg transition-colors"
                                    >
                                      <Trash2 className="w-3.5 h-3.5" />
                                    </button>
                                  </div>
                                </div>
                                <p className="text-[11px] text-slate-500 line-clamp-2 mt-1 whitespace-pre-line leading-relaxed">{item.description}</p>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* 4. Tab: Pengurus & Imam */}
                {activeTab === "pengurus" && (
                  <div className="space-y-6" id="view-pengurus">
                    <div id="view-hdr">
                      <h3 className="text-xl font-extrabold text-slate-800">Pengurus, Imam & Muadzin</h3>
                      <p className="text-xs text-slate-500 mt-1">Kelola data seluruh struktur organisasi pengurus dan tokoh keagamaan aktif di Masjid Nurul Falah.</p>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6" id="pengurus-dash-body">
                      {/* Section 1: Active Imam, Muadzin & Khatib */}
                      <div className="lg:col-span-1 bg-white p-6 rounded-3xl border border-slate-100 shadow-sm h-fit space-y-4" id="imam-form-container">
                        <h4 className="font-bold text-slate-800 text-sm flex items-center gap-1.5">
                          <Compass className="w-4 h-4 text-emerald-700" /> Tokoh Ibadah Jumat & Harian
                        </h4>

                        <form onSubmit={handleSaveImam} className="space-y-4" id="imam-manage-form">
                          <div className="space-y-1.5">
                            <label className="text-xs font-bold text-slate-600 block">Imam Utama Masjid</label>
                            <input
                              type="text"
                              required
                              value={imamForm.imam}
                              onChange={(e) => setImamForm({ ...imamForm, imam: e.target.value })}
                              className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
                            />
                          </div>

                          <div className="space-y-1.5">
                            <label className="text-xs font-bold text-slate-600 block">Muadzin Aktif</label>
                            <input
                              type="text"
                              required
                              value={imamForm.muadzin}
                              onChange={(e) => setImamForm({ ...imamForm, muadzin: e.target.value })}
                              className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
                            />
                          </div>

                          <div className="space-y-1.5">
                            <label className="text-xs font-bold text-slate-600 block">Khatib Jumat Pekan Ini</label>
                            <input
                              type="text"
                              required
                              value={imamForm.khatib}
                              onChange={(e) => setImamForm({ ...imamForm, khatib: e.target.value })}
                              className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
                            />
                          </div>

                          <button
                            type="submit"
                            className="w-full py-2 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl text-xs font-bold transition-colors"
                          >
                            Simpan Data Tokoh
                          </button>
                        </form>
                      </div>

                      {/* Section 2: Officers management */}
                      <div className="lg:col-span-2 bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden flex flex-col md:flex-row h-fit" id="officers-manager">
                        {/* Member Form Left */}
                        <div className="p-6 border-r border-slate-100 md:w-80" id="member-form-section">
                          <h4 className="font-bold text-slate-800 text-sm mb-4">
                            {isPengEditing ? "Edit Pengurus" : "Tambah Pengurus"}
                          </h4>

                          <form onSubmit={handleSavePengurus} className="space-y-4" id="member-form">
                            <div className="space-y-1.5">
                              <label className="text-xs font-bold text-slate-600 block">Nama Lengkap</label>
                              <input
                                type="text"
                                required
                                placeholder="Misal: Andi Syarifuddin, S.H."
                                value={pengForm.name}
                                onChange={(e) => setPengForm({ ...pengForm, name: e.target.value })}
                                className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
                              />
                            </div>

                            <div className="space-y-1.5">
                              <label className="text-xs font-bold text-slate-600 block">Jabatan/Seksi</label>
                              <input
                                type="text"
                                required
                                placeholder="Misal: Ketua Pengurus, Seksi Remaja"
                                value={pengForm.role}
                                onChange={(e) => setPengForm({ ...pengForm, role: e.target.value })}
                                className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
                              />
                            </div>

                            <div className="space-y-1.5">
                              <label className="text-xs font-bold text-slate-600 block">Nomor Telepon</label>
                              <input
                                type="text"
                                placeholder="Misal: 0812-3456-7890"
                                value={pengForm.phone}
                                onChange={(e) => setPengForm({ ...pengForm, phone: e.target.value })}
                                className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
                              />
                            </div>

                            <div className="flex gap-2 pt-2">
                              <button
                                type="submit"
                                className="flex-1 py-2 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl text-xs font-bold transition-colors"
                              >
                                {isPengEditing ? "Perbarui" : "Simpan Anggota"}
                              </button>
                              {isPengEditing && (
                                <button
                                  type="button"
                                  onClick={() => {
                                    setIsPengEditing(false);
                                    setPengForm({ id: "", name: "", role: "", phone: "" });
                                  }}
                                  className="px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold transition-colors"
                                >
                                  Batal
                                </button>
                              )}
                            </div>
                          </form>
                        </div>

                        {/* Member List Right */}
                        <div className="flex-1 p-6 space-y-4" id="member-list-section">
                          <h4 className="font-bold text-slate-800 text-xs uppercase tracking-wider">Daftar Pengurus Terdaftar</h4>

                          <div className="divide-y divide-slate-100 max-h-80 overflow-y-auto" id="members-scroller">
                            {data.pengurus.map((p) => (
                              <div key={p.id} className="py-2.5 flex items-center justify-between text-xs hover:bg-slate-50/40 px-1 rounded transition-colors">
                                <div>
                                  <h5 className="font-bold text-slate-800">{p.name}</h5>
                                  <span className="text-[10px] text-emerald-700 font-medium">{p.role}</span>
                                  {p.phone && <span className="text-[10px] text-slate-400 block mt-0.5">Kontak: {p.phone}</span>}
                                </div>
                                <div className="flex gap-1">
                                  <button
                                    onClick={() => handleEditPengurusClick(p)}
                                    className="p-1 hover:bg-slate-100 text-slate-400 hover:text-emerald-700 rounded transition-colors"
                                  >
                                    <Edit2 className="w-3.5 h-3.5" />
                                  </button>
                                  <button
                                    onClick={() => handleDeletePengurus(p.id)}
                                    className="p-1 hover:bg-slate-100 text-slate-400 hover:text-rose-600 rounded transition-colors"
                                  >
                                    <Trash2 className="w-3.5 h-3.5" />
                                  </button>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* 5. Tab: Edit Proposal */}
                {activeTab === "proposal" && (
                  <div className="space-y-6" id="view-proposal">
                    <div id="view-hdr">
                      <h3 className="text-xl font-extrabold text-slate-800">Pengaturan Proposal Digital</h3>
                      <p className="text-xs text-slate-500 mt-1">Ubah besaran rencana anggaran biaya pembangunan (RAB) serta edit bab draf proposal pembangunan.</p>
                    </div>

                    <form onSubmit={handleSaveProposal} className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm space-y-6" id="proposal-edit-form">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4" id="proposal-grid-meta">
                        <div className="space-y-1.5">
                          <label className="text-xs font-bold text-slate-600 block">Judul Proposal Utama</label>
                          <input
                            type="text"
                            required
                            value={propForm.title}
                            onChange={(e) => setPropForm({ ...propForm, title: e.target.value })}
                            className="w-full px-3 py-2.5 border border-slate-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-emerald-500/20 font-bold"
                          />
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                          <div className="space-y-1.5">
                            <label className="text-xs font-bold text-slate-600 block">Target RAB (Rp)</label>
                            <input
                              type="number"
                              required
                              value={propForm.targetAmount}
                              onChange={(e) => setPropForm({ ...propForm, targetAmount: e.target.value })}
                              className="w-full px-3 py-2.5 border border-slate-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-emerald-500/20 font-mono font-bold"
                            />
                          </div>

                          <div className="space-y-1.5">
                            <label className="text-xs font-bold text-slate-600 block">Dana Terkumpul Manual (Rp)</label>
                            <input
                              type="number"
                              required
                              value={propForm.collectedAmount}
                              onChange={(e) => setPropForm({ ...propForm, collectedAmount: e.target.value })}
                              className="w-full px-3 py-2.5 border border-slate-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-emerald-500/20 font-mono font-bold"
                            />
                          </div>
                        </div>
                      </div>

                      <div className="space-y-1.5">
                        <label className="text-xs font-bold text-slate-600 block">Deskripsi Pendek Ringkasan</label>
                        <textarea
                          rows={2}
                          required
                          value={propForm.description}
                          onChange={(e) => setPropForm({ ...propForm, description: e.target.value })}
                          className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
                        />
                      </div>

                      {/* Sections editor */}
                      <div className="space-y-4" id="proposal-sections-editor">
                        <h4 className="font-bold text-slate-800 text-xs uppercase tracking-wider">Rincian Bab Proposal</h4>

                        <div className="space-y-4" id="prop-sections-list">
                          {propForm.sections.map((sec, idx) => (
                            <div key={sec.id} className="p-4 bg-slate-50 border border-slate-100 rounded-2xl space-y-2">
                              <span className="text-[10px] font-bold text-emerald-800 bg-emerald-100 px-2 py-0.5 rounded">
                                Bab {idx + 1}: {sec.title}
                              </span>
                              <textarea
                                rows={4}
                                required
                                value={sec.content}
                                onChange={(e) => handleSectionContentChange(idx, e.target.value)}
                                className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500/20 font-serif leading-relaxed"
                              />
                            </div>
                          ))}
                        </div>
                      </div>

                      <button
                        type="submit"
                        className="px-6 py-2.5 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl font-bold text-xs transition-colors flex items-center gap-2 shadow-sm"
                        id="save-proposal-btn"
                      >
                        <Save className="w-4 h-4" /> Simpan Perubahan Proposal
                      </button>
                    </form>
                  </div>
                )}

                {/* 6. Tab: Kirim Notifikasi */}
                {activeTab === "notifikasi" && (
                  <div className="space-y-6" id="view-notifikasi">
                    <div id="view-hdr">
                      <h3 className="text-xl font-extrabold text-slate-800">Broadcast Pengumuman / Notifikasi</h3>
                      <p className="text-xs text-slate-500 mt-1">Sampaikan informasi agenda tabligh akbar, gotong royong, atau laporan keuangan baru langsung ke layar pengunjung situs.</p>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6" id="notifikasi-dash-body">
                      {/* Broadcast Form */}
                      <div className="lg:col-span-1 bg-white p-6 rounded-3xl border border-slate-100 shadow-sm h-fit" id="notifikasi-form-container">
                        <h4 className="font-bold text-slate-800 text-sm mb-4">Sebarkan Info Baru</h4>

                        <form onSubmit={handleSendNotification} className="space-y-4" id="notifikasi-form">
                          <div className="space-y-1.5">
                            <label className="text-xs font-bold text-slate-600 block">Kategori Info</label>
                            <select
                              value={annForm.type}
                              onChange={(e) => setAnnForm({ ...annForm, type: e.target.value as any })}
                              className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
                            >
                              <option value="umum">Pengumuman Umum</option>
                              <option value="agenda">Agenda Kegiatan</option>
                              <option value="donasi">Laporan Update Donasi</option>
                            </select>
                          </div>

                          <div className="space-y-1.5">
                            <label className="text-xs font-bold text-slate-600 block">Judul Pengumuman</label>
                            <input
                              type="text"
                              required
                              placeholder="Misal: Penerimaan Hewan Qurban"
                              value={annForm.title}
                              onChange={(e) => setAnnForm({ ...annForm, title: e.target.value })}
                              className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-emerald-500/20 font-bold"
                            />
                          </div>

                          <div className="space-y-1.5">
                            <label className="text-xs font-bold text-slate-600 block">Isi Pengumuman</label>
                            <textarea
                              rows={4}
                              required
                              placeholder="Ketikkan teks pesan yang ingin disiarkan ke pengunjung..."
                              value={annForm.content}
                              onChange={(e) => setAnnForm({ ...annForm, content: e.target.value })}
                              className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
                            />
                          </div>

                          <button
                            type="submit"
                            className="w-full py-2 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl text-xs font-bold transition-colors"
                          >
                            Siarkan Pengumuman &rarr;
                          </button>
                        </form>
                      </div>

                      {/* Active broadcasts */}
                      <div className="lg:col-span-2 bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden h-[450px] flex flex-col justify-between" id="active-broadcasts">
                        <div className="p-4 border-b border-slate-100 bg-slate-50/50">
                          <h4 className="font-bold text-slate-800 text-xs uppercase tracking-wider">Histori Informasi Terkirim</h4>
                        </div>

                        <div className="flex-1 overflow-y-auto divide-y divide-slate-100">
                          {data.announcements.map((ann) => (
                            <div key={ann.id} className="p-4 flex items-start justify-between hover:bg-slate-50/40 transition-colors">
                              <div className="space-y-1 flex-1 min-w-0">
                                <div className="flex items-center gap-2">
                                  <span className="text-[10px] font-mono text-slate-400">{ann.date}</span>
                                  <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded uppercase ${
                                    ann.type === "agenda" ? "bg-emerald-100 text-emerald-800" : ann.type === "donasi" ? "bg-amber-100 text-amber-800" : "bg-blue-100 text-blue-800"
                                  }`}>
                                    {ann.type}
                                  </span>
                                </div>
                                <h5 className="font-bold text-slate-800 text-xs truncate">{ann.title}</h5>
                                <p className="text-[11px] text-slate-500 line-clamp-2 leading-relaxed">{ann.content}</p>
                              </div>
                              <button
                                onClick={() => handleDeleteAnnouncement(ann.id)}
                                className="p-1.5 hover:bg-slate-100 text-slate-400 hover:text-rose-600 rounded-lg transition-colors ml-4"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* 7. Tab: Ganti Password */}
                {activeTab === "password" && (
                  <div className="space-y-6" id="view-password">
                    <div id="view-hdr">
                      <h3 className="text-xl font-extrabold text-slate-800">Ganti Sandi Keamanan</h3>
                      <p className="text-xs text-slate-500 mt-1">Perbarui kata sandi admin secara mandiri untuk menjaga privasi keamanan situs.</p>
                    </div>

                    <form onSubmit={handleChangePassword} className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm max-w-md space-y-4" id="password-edit-form">
                      <div className="space-y-1.5">
                        <label className="text-xs font-bold text-slate-600 block">Kata Sandi Lama</label>
                        <input
                          type="password"
                          required
                          value={passwordForm.currentPassword}
                          onChange={(e) => setPasswordForm({ ...passwordForm, currentPassword: e.target.value })}
                          className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
                        />
                      </div>

                      <div className="space-y-1.5">
                        <label className="text-xs font-bold text-slate-600 block">Kata Sandi Baru</label>
                        <input
                          type="password"
                          required
                          value={passwordForm.newPassword}
                          onChange={(e) => setPasswordForm({ ...passwordForm, newPassword: e.target.value })}
                          className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
                        />
                      </div>

                      <div className="space-y-1.5">
                        <label className="text-xs font-bold text-slate-600 block">Konfirmasi Kata Sandi Baru</label>
                        <input
                          type="password"
                          required
                          value={passwordForm.confirmPassword}
                          onChange={(e) => setPasswordForm({ ...passwordForm, confirmPassword: e.target.value })}
                          className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
                        />
                      </div>

                      <button
                        type="submit"
                        className="px-6 py-2.5 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl font-bold text-xs transition-colors flex items-center gap-2 shadow-sm"
                        id="save-password-btn"
                      >
                        <Save className="w-4 h-4" /> Perbarui Sandi
                      </button>
                    </form>
                  </div>
                )}
              </div>

              {/* Panel Footer bar */}
              <div className="mt-8 pt-4 border-t border-slate-100 flex justify-between text-[10px] text-slate-400 font-medium font-mono" id="dash-panel-footer">
                <span>MASJID NURUL FALAH SAMAOLING</span>
                <span>SYSTEM VERSION 2.0</span>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
