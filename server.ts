import express, { Request, Response, NextFunction } from "express";
import path from "path";
import fs from "fs";
import crypto from "crypto";
import { createServer as createViteServer } from "vite";
import { DatabaseSchema } from "./src/types";

const app = express();
const PORT = 3000;
const DB_FILE = path.join(process.cwd(), "db.json");

// Middleware
app.use(express.json());

// In-memory active sessions
const activeSessions = new Map<string, { username: string; expiresAt: number }>();

// Password hashing utility (SHA-256)
function hashPassword(password: string): string {
  return crypto.createHash("sha256").update(password).digest("hex");
}

// Generate secure session token
function generateToken(): string {
  return crypto.randomBytes(32).toString("hex");
}

// Default initial database content
const DEFAULT_DB_CONTENT: DatabaseSchema & { admin: { username: string; passwordHash: string } } = {
  admin: {
    username: "admin",
    passwordHash: hashPassword("nurulfalah123") // Default secure password
  },
  prayerTimes: {
    subuh: "05:02",
    syuruk: "06:18",
    zuhur: "12:22",
    asar: "15:44",
    magrib: "18:24",
    isya: "19:38",
    lastUpdated: new Date().toISOString(),
    method: "auto"
  },
  gallery: [
    {
      id: "gal-1",
      title: "Tabligh Akbar Menyambut Tahun Baru Islam",
      date: "2026-07-05",
      description: "Penceramah Ustadz Dr. H. Das'ad Latif di Masjid Nurul Falah Samaoling dihadiri oleh ratusan jamaah dari Desa Parenring dan sekitarnya.",
      imageUrl: "https://picsum.photos/seed/tabligh/800/600"
    },
    {
      id: "gal-2",
      title: "Gotong Royong Pembersihan Lingkungan Masjid",
      date: "2026-06-20",
      description: "Pengurus masjid bersama masyarakat dusun Samaoling melakukan pembersihan saluran air dan pengecatan area luar menjelang renovasi.",
      imageUrl: "https://picsum.photos/seed/clean/800/600"
    },
    {
      id: "gal-3",
      title: "Penyaluran Sembako Berkah Jumat",
      date: "2026-07-12",
      description: "Penyaluran bantuan 50 paket sembako untuk yatim piatu dan lansia di wilayah Lilirilau dari dana Kotak Amal Jumat Peduli Masjid.",
      imageUrl: "https://picsum.photos/seed/charity/800/600"
    }
  ],
  finances: [
    {
      id: "fin-1",
      date: "2026-07-01",
      type: "pemasukan",
      category: "Kotak Amal",
      description: "Infaq Kotak Amal Shalat Jumat Pekan 1",
      amount: 2450000
    },
    {
      id: "fin-2",
      date: "2026-07-02",
      type: "pengeluaran",
      category: "Kebersihan",
      description: "Pembelian sabun, pembersih lantai, dan plastik sampah",
      amount: 150000
    },
    {
      id: "fin-3",
      date: "2026-07-05",
      type: "pemasukan",
      category: "Donasi Khusus",
      description: "Hamba Allah - Sumbangan Pembangunan Kubah Baru",
      amount: 15000000
    },
    {
      id: "fin-4",
      date: "2026-07-08",
      type: "pengeluaran",
      category: "Operasional",
      description: "Pembayaran tagihan listrik masjid bulan Juni",
      amount: 820000
    },
    {
      id: "fin-5",
      date: "2026-07-10",
      type: "pemasukan",
      category: "Kotak Amal",
      description: "Infaq Kotak Amal Shalat Jumat Pekan 2",
      amount: 2120000
    },
    {
      id: "fin-6",
      date: "2026-07-14",
      type: "pengeluaran",
      category: "Gaji/Insentif",
      description: "Insentif Imam Masjid bulan Juli 2026",
      amount: 2500000
    },
    {
      id: "fin-7",
      date: "2026-07-15",
      type: "pengeluaran",
      category: "Gaji/Insentif",
      description: "Insentif Muadzin & Marbot bulan Juli 2026",
      amount: 1500000
    }
  ],
  pengurus: [
    {
      id: "peng-1",
      name: "H. Andi Syamsul, S.E.",
      role: "Ketua Pengurus",
      phone: "0812-4455-8899"
    },
    {
      id: "peng-2",
      name: "Irwan Wijaya, S.Pd.",
      role: "Sekretaris",
      phone: "0852-9988-7766"
    },
    {
      id: "peng-3",
      name: "M. Yunus, S.Sos.",
      role: "Bendahara",
      phone: "0821-3344-5566"
    },
    {
      id: "peng-4",
      name: "Faisal Bakri",
      role: "Seksi Pembangunan",
      phone: "0813-5566-7788"
    }
  ],
  activeImam: {
    imam: "Ustadz H. Muhammad Arsyad, Lc.",
    muadzin: "Ustadz Ambo Tuo",
    khatib: "Ustadz Dr. Abdul Rahman, M.A."
  },
  proposal: {
    title: "Proposal Digital Pembangunan & Renovasi Masjid Nurul Falah Samaoling",
    description: "Program revitalisasi fasilitas wudhu, perluasan area shalat utama, dan pembangunan menara Masjid Nurul Falah Samaoling. Kami mengundang seluruh kaum muslimin untuk berpartisipasi dalam investasi akhirat ini.",
    targetAmount: 250000000,
    collectedAmount: 112450000,
    sections: [
      {
        id: "sec-1",
        title: "Latar Belakang",
        content: "Masjid Nurul Falah Samaoling adalah pusat kegiatan keagamaan masyarakat Dusun Samaoling, Desa Parenring. Dengan meningkatnya jumlah jamaah shalat berjamaah dan kegiatan majelis taklim, kapasitas ruang utama serta sarana tempat wudhu yang ada saat ini sudah kurang memadai, sehingga diperlukan renovasi dan perluasan sarana."
      },
      {
        id: "sec-2",
        title: "Rencana Anggaran Biaya (RAB)",
        content: "1. Pekerjaan struktur & perluasan lantai utama: Rp 120.000.000\n2. Renovasi tempat wudhu (pria & wanita dipisah): Rp 50.000.000\n3. Pembangunan Menara Masjid (Tinggi 15 meter): Rp 60.000.000\n4. Pengadaan Sound System & sarana ibadah: Rp 20.000.000\nTotal Kebutuhan Anggaran: Rp 250.000.000."
      },
      {
        id: "sec-3",
        title: "Tahapan Pembangunan",
        content: "Tahap 1: Pembongkaran dan pembangunan kembali area tempat wudhu (sedang berlangsung).\nTahap 2: Pengecoran tiang struktur dan atap perluasan area shalat utama.\nTahap 3: Pembangunan menara dan finishing eksterior."
      }
    ]
  },
  announcements: [
    {
      id: "ann-1",
      date: "2026-07-14",
      title: "Gotong Royong Pembersihan Material Pembangunan",
      content: "Dihimbau kepada seluruh warga dan jamaah Samaoling untuk berpartisipasi dalam kerja bakti pembersihan sisa material renovasi wudhu pada hari Ahad pagi, pukul 07:00 WITA.",
      type: "agenda"
    },
    {
      id: "ann-2",
      date: "2026-07-15",
      title: "Donasi Kubah Masjid Senilai Rp 15.000.000 Diterima",
      content: "Alhamdulillah, telah diterima donasi dari hamba Allah sebesar Rp 15.000.000 khusus untuk pembangunan kubah masjid. Semoga diganti berlipat ganda.",
      type: "donasi"
    }
  ],
  qris: {
    imageUrl: "", // We can use QRIS custom SVG drawing on client-side
    bankName: "Bank Syariah Indonesia (BSI)",
    accountHolder: "MASJID NURUL FALAH SAMAOLING",
    accountNumber: "719-823-1122"
  }
};

// Database Read/Write helpers
function readDB(): typeof DEFAULT_DB_CONTENT {
  try {
    if (!fs.existsSync(DB_FILE)) {
      fs.writeFileSync(DB_FILE, JSON.stringify(DEFAULT_DB_CONTENT, null, 2), "utf8");
      return DEFAULT_DB_CONTENT;
    }
    const data = fs.readFileSync(DB_FILE, "utf8");
    return JSON.parse(data);
  } catch (err) {
    console.error("Error reading database file, returning default content:", err);
    return DEFAULT_DB_CONTENT;
  }
}

function writeDB(data: typeof DEFAULT_DB_CONTENT) {
  try {
    fs.writeFileSync(DB_FILE, JSON.stringify(data, null, 2), "utf8");
  } catch (err) {
    console.error("Error writing database file:", err);
  }
}

// Prayer times calculation for Soppeng, South Sulawesi (-4.3486° S, 119.8973° E, GMT+8)
function calculatePrayerTimes(date: Date): Omit<DatabaseSchema["prayerTimes"], "method" | "lastUpdated"> {
  const d = getDayOfYear(date);
  
  // Earth's solar declination delta
  const declination = 23.45 * Math.sin((2 * Math.PI * (284 + d)) / 365);
  // Equation of time in minutes
  const B = (360 * (d - 81)) / 365 * (Math.PI / 180);
  const equationOfTime = 9.87 * Math.sin(2 * B) - 7.53 * Math.cos(B) - 1.5 * Math.sin(B);
  
  // Solar transit (Zuhur) in hours
  // Local longitude is 119.8973. Standard timezone GMT+8 meridian is 120.0
  const localLongitude = 119.8973;
  const timezoneMeridian = 120.0;
  const longitudeDifference = timezoneMeridian - localLongitude;
  const transitOffset = longitudeDifference / 15; // hours
  
  // Zuhur time in hours (standard transit is 12:00 local, adjusted by Eq of Time and longitude)
  const zuhurHour = 12.0 - (equationOfTime / 60) + transitOffset;
  
  // Latitude of Soppeng is -4.3486 degrees
  const latRad = -4.3486 * (Math.PI / 180);
  const decRad = declination * (Math.PI / 180);
  
  // Helper to calculate hour angle for a specific altitude
  const getHourAngle = (altitudeDeg: number): number => {
    const altRad = altitudeDeg * (Math.PI / 180);
    const cosH = (Math.sin(altRad) - Math.sin(latRad) * Math.sin(decRad)) / (Math.cos(latRad) * Math.cos(decRad));
    if (cosH > 1) return 0; // Never rises
    if (cosH < -1) return Math.PI; // Never sets
    return Math.acos(cosH);
  };
  
  // Hour angle for sunset/sunrise (at -0.833 degrees due to atmospheric refraction)
  const H_sunset = getHourAngle(-0.833);
  const sunsetHour = zuhurHour + (H_sunset * 180 / Math.PI) / 15;
  const sunriseHour = zuhurHour - (H_sunset * 180 / Math.PI) / 15;
  
  // Subuh (Kemenag method: sun at 20 degrees below horizon)
  const H_subuh = getHourAngle(-20.0);
  const subuhHour = zuhurHour - (H_subuh * 180 / Math.PI) / 15;
  
  // Isya (Kemenag method: sun at 18 degrees below horizon)
  const H_isya = getHourAngle(-18.0);
  const isyaHour = zuhurHour + (H_isya * 180 / Math.PI) / 15;
  
  // Asar (Shafi'i/Standard method: shadow is 1x object length + noon shadow)
  const zenithAngle = Math.abs(latRad - decRad);
  const cotZenith = 1 / Math.tan(zenithAngle);
  const asarAltRad = Math.atan(1 / (1 + cotZenith));
  const asarAltDeg = asarAltRad * 180 / Math.PI;
  const H_asar = getHourAngle(asarAltDeg);
  const asarHour = zuhurHour + (H_asar * 180 / Math.PI) / 15;
  
  // Plus 2-3 minutes safety buffer (standard practice in Indonesia)
  const formatTime = (hours: number, bufferMin = 2): string => {
    const totalMinutes = Math.floor(hours * 60) + bufferMin;
    const h = Math.floor(totalMinutes / 60) % 24;
    const m = totalMinutes % 60;
    return `${h.toString().padStart(2, "0")}:${m.toString().padStart(2, "0")}`;
  };
  
  return {
    subuh: formatTime(subuhHour),
    syuruk: formatTime(sunriseHour, -2), // Sunrise has a negative buffer to show actual start
    zuhur: formatTime(zuhurHour),
    asar: formatTime(asarHour),
    magrib: formatTime(sunsetHour),
    isya: formatTime(isyaHour)
  };
}

function getDayOfYear(date: Date): number {
  const start = new Date(date.getFullYear(), 0, 0);
  const diff = date.getTime() - start.getTime();
  const oneDay = 1000 * 60 * 60 * 24;
  return Math.floor(diff / oneDay);
}

// Authentication Middleware
function authenticateAdmin(req: Request, res: Response, next: NextFunction) {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({ message: "Akses tidak sah. Silakan login terlebih dahulu." });
  }
  
  const token = authHeader.split(" ")[1];
  const session = activeSessions.get(token);
  
  if (!session || session.expiresAt < Date.now()) {
    if (session) activeSessions.delete(token); // Cleanup expired
    return res.status(401).json({ message: "Sesi telah berakhir. Silakan login kembali." });
  }
  
  // Refresh session expiry (30 mins from now)
  session.expiresAt = Date.now() + 30 * 60 * 1000;
  next();
}

// ------------------- API ROUTES -------------------

// 1. Get Public Website Data (Single Request for speed!)
app.get("/api/public-data", (req: Request, res: Response) => {
  const db = readDB();
  
  // If prayerTimes are set to 'auto', calculate them dynamically for today's date
  let prayerTimes = { ...db.prayerTimes };
  if (db.prayerTimes.method === "auto") {
    try {
      const today = new Date();
      const calculated = calculatePrayerTimes(today);
      prayerTimes = {
        ...prayerTimes,
        ...calculated,
        lastUpdated: today.toISOString()
      };
    } catch (err) {
      console.error("Failed to calculate prayer times dynamically:", err);
    }
  }
  
  // Exclude administrative 'admin' password hash
  const { admin, ...publicData } = db;
  res.json({
    ...publicData,
    prayerTimes
  });
});

// 2. Admin Login
app.post("/api/auth/login", (req: Request, res: Response) => {
  const { username, password } = req.body;
  if (!username || !password) {
    return res.status(400).json({ message: "Username dan Password wajib diisi." });
  }
  
  const db = readDB();
  const inputHash = hashPassword(password);
  
  if (db.admin.username === username && db.admin.passwordHash === inputHash) {
    const token = generateToken();
    // Session valid for 30 minutes
    activeSessions.set(token, {
      username,
      expiresAt: Date.now() + 30 * 60 * 1000
    });
    return res.json({ token, username });
  }
  
  return res.status(401).json({ message: "Username atau Password salah." });
});

// 3. Admin Change Password
app.post("/api/admin/change-password", authenticateAdmin, (req: Request, res: Response) => {
  const { currentPassword, newPassword } = req.body;
  if (!currentPassword || !newPassword) {
    return res.status(400).json({ message: "Password lama dan password baru harus diisi." });
  }
  
  const db = readDB();
  if (db.admin.passwordHash !== hashPassword(currentPassword)) {
    return res.status(400).json({ message: "Password lama salah." });
  }
  
  db.admin.passwordHash = hashPassword(newPassword);
  writeDB(db);
  res.json({ message: "Password berhasil diperbarui." });
});

// 4. Admin Update Prayer Times
app.post("/api/admin/prayer-times", authenticateAdmin, (req: Request, res: Response) => {
  const { method, subuh, syuruk, zuhur, asar, magrib, isya } = req.body;
  
  const db = readDB();
  db.prayerTimes.method = method || db.prayerTimes.method;
  
  if (method === "manual") {
    db.prayerTimes.subuh = subuh || db.prayerTimes.subuh;
    db.prayerTimes.syuruk = syuruk || db.prayerTimes.syuruk;
    db.prayerTimes.zuhur = zuhur || db.prayerTimes.zuhur;
    db.prayerTimes.asar = asar || db.prayerTimes.asar;
    db.prayerTimes.magrib = magrib || db.prayerTimes.magrib;
    db.prayerTimes.isya = isya || db.prayerTimes.isya;
  }
  
  db.prayerTimes.lastUpdated = new Date().toISOString();
  writeDB(db);
  res.json({ message: "Jadwal salat berhasil diperbarui.", prayerTimes: db.prayerTimes });
});

// 5. Admin Manage Gallery
app.post("/api/admin/gallery", authenticateAdmin, (req: Request, res: Response) => {
  const { action, item } = req.body; // action: 'add' | 'edit' | 'delete'
  const db = readDB();
  
  if (action === "add") {
    const newItem = {
      id: "gal-" + Date.now(),
      title: item.title,
      date: item.date || new Date().toISOString().split("T")[0],
      description: item.description,
      imageUrl: item.imageUrl || "https://picsum.photos/seed/default/800/600"
    };
    db.gallery.unshift(newItem);
    
    // Auto trigger announcement for new gallery/activities
    db.announcements.unshift({
      id: "ann-" + Date.now(),
      date: newItem.date,
      title: `Kegiatan Baru: ${newItem.title}`,
      content: newItem.description.slice(0, 150) + "...",
      type: "agenda"
    });
    
    writeDB(db);
    return res.json({ message: "Kegiatan berhasil ditambahkan.", gallery: db.gallery });
  }
  
  if (action === "edit") {
    db.gallery = db.gallery.map(g => (g.id === item.id ? { ...g, ...item } : g));
    writeDB(db);
    return res.json({ message: "Kegiatan berhasil diperbarui.", gallery: db.gallery });
  }
  
  if (action === "delete") {
    db.gallery = db.gallery.filter(g => g.id !== item.id);
    writeDB(db);
    return res.json({ message: "Kegiatan berhasil dihapus.", gallery: db.gallery });
  }
  
  res.status(400).json({ message: "Aksi tidak dikenal." });
});

// 6. Admin Manage Finances
app.post("/api/admin/finances", authenticateAdmin, (req: Request, res: Response) => {
  const { action, record } = req.body; // action: 'add' | 'edit' | 'delete'
  const db = readDB();
  
  if (action === "add") {
    const newRecord = {
      id: "fin-" + Date.now(),
      date: record.date || new Date().toISOString().split("T")[0],
      type: record.type, // 'pemasukan' | 'pengeluaran'
      category: record.category,
      description: record.description,
      amount: Number(record.amount)
    };
    db.finances.unshift(newRecord);
    
    // Update proposal collected amount if it's a "Donasi Pembangunan" Category
    if (record.type === "pemasukan" && record.category.toLowerCase().includes("pembangunan")) {
      db.proposal.collectedAmount += Number(record.amount);
      
      // Auto trigger notification for new special donation
      db.announcements.unshift({
        id: "ann-" + Date.now(),
        date: newRecord.date,
        title: `Donasi Pembangunan Baru Diterima!`,
        content: `Alhamdulillah, donasi sebesar Rp ${Number(record.amount).toLocaleString("id-ID")} diterima untuk "${record.description}". Terima kasih banyak.`,
        type: "donasi"
      });
    }
    
    writeDB(db);
    return res.json({ message: "Transaksi keuangan berhasil dicatat.", finances: db.finances });
  }
  
  if (action === "edit") {
    // If edit changes the amount of a Pembangunan category, adjust proposal
    const oldRecord = db.finances.find(f => f.id === record.id);
    if (oldRecord && oldRecord.category.toLowerCase().includes("pembangunan") && oldRecord.type === "pemasukan") {
      db.proposal.collectedAmount -= oldRecord.amount;
    }
    
    db.finances = db.finances.map(f => (f.id === record.id ? { ...f, ...record, amount: Number(record.amount) } : f));
    
    const updatedRecord = db.finances.find(f => f.id === record.id);
    if (updatedRecord && updatedRecord.category.toLowerCase().includes("pembangunan") && updatedRecord.type === "pemasukan") {
      db.proposal.collectedAmount += updatedRecord.amount;
    }
    
    writeDB(db);
    return res.json({ message: "Catatan keuangan berhasil diperbarui.", finances: db.finances });
  }
  
  if (action === "delete") {
    const oldRecord = db.finances.find(f => f.id === record.id);
    if (oldRecord && oldRecord.category.toLowerCase().includes("pembangunan") && oldRecord.type === "pemasukan") {
      db.proposal.collectedAmount -= oldRecord.amount;
    }
    
    db.finances = db.finances.filter(f => f.id !== record.id);
    writeDB(db);
    return res.json({ message: "Catatan keuangan berhasil dihapus.", finances: db.finances });
  }
  
  res.status(400).json({ message: "Aksi tidak dikenal." });
});

// 7. Admin Manage Pengurus
app.post("/api/admin/pengurus", authenticateAdmin, (req: Request, res: Response) => {
  const { action, member } = req.body;
  const db = readDB();
  
  if (action === "add") {
    const newMember = {
      id: "peng-" + Date.now(),
      name: member.name,
      role: member.role,
      phone: member.phone || "-"
    };
    db.pengurus.push(newMember);
    writeDB(db);
    return res.json({ message: "Pengurus berhasil ditambahkan.", pengurus: db.pengurus });
  }
  
  if (action === "edit") {
    db.pengurus = db.pengurus.map(p => (p.id === member.id ? { ...p, ...member } : p));
    writeDB(db);
    return res.json({ message: "Pengurus berhasil diperbarui.", pengurus: db.pengurus });
  }
  
  if (action === "delete") {
    db.pengurus = db.pengurus.filter(p => p.id !== member.id);
    writeDB(db);
    return res.json({ message: "Pengurus berhasil dihapus.", pengurus: db.pengurus });
  }
  
  res.status(400).json({ message: "Aksi tidak dikenal." });
});

// 8. Admin Manage Active Imam/Muadzin/Khatib
app.post("/api/admin/active-imam", authenticateAdmin, (req: Request, res: Response) => {
  const { imam, muadzin, khatib } = req.body;
  const db = readDB();
  
  db.activeImam.imam = imam || db.activeImam.imam;
  db.activeImam.muadzin = muadzin || db.activeImam.muadzin;
  db.activeImam.khatib = khatib || db.activeImam.khatib;
  
  writeDB(db);
  res.json({ message: "Data Imam, Muadzin & Khatib berhasil disimpan.", activeImam: db.activeImam });
});

// 9. Admin Manage Proposal
app.post("/api/admin/proposal", authenticateAdmin, (req: Request, res: Response) => {
  const { title, description, targetAmount, collectedAmount, sections } = req.body;
  const db = readDB();
  
  db.proposal.title = title || db.proposal.title;
  db.proposal.description = description || db.proposal.description;
  db.proposal.targetAmount = targetAmount !== undefined ? Number(targetAmount) : db.proposal.targetAmount;
  db.proposal.collectedAmount = collectedAmount !== undefined ? Number(collectedAmount) : db.proposal.collectedAmount;
  
  if (sections) {
    db.proposal.sections = sections;
  }
  
  writeDB(db);
  res.json({ message: "Proposal berhasil diperbarui.", proposal: db.proposal });
});

// 10. Admin Manage QRIS
app.post("/api/admin/qris", authenticateAdmin, (req: Request, res: Response) => {
  const { bankName, accountHolder, accountNumber } = req.body;
  const db = readDB();
  
  db.qris.bankName = bankName || db.qris.bankName;
  db.qris.accountHolder = accountHolder || db.qris.accountHolder;
  db.qris.accountNumber = accountNumber || db.qris.accountNumber;
  
  writeDB(db);
  res.json({ message: "Data QRIS Donasi berhasil diperbarui.", qris: db.qris });
});

// 11. Admin Manage Announcements (Broadcast Agenda / Donasi)
app.post("/api/admin/announcements", authenticateAdmin, (req: Request, res: Response) => {
  const { action, announcement } = req.body;
  const db = readDB();
  
  if (action === "add") {
    const newAnn = {
      id: "ann-" + Date.now(),
      date: announcement.date || new Date().toISOString().split("T")[0],
      title: announcement.title,
      content: announcement.content,
      type: announcement.type || "umum"
    };
    db.announcements.unshift(newAnn);
    writeDB(db);
    return res.json({ message: "Pengumuman berhasil disebarkan.", announcements: db.announcements });
  }
  
  if (action === "delete") {
    db.announcements = db.announcements.filter(a => a.id !== announcement.id);
    writeDB(db);
    return res.json({ message: "Pengumuman berhasil dihapus.", announcements: db.announcements });
  }
  
  res.status(400).json({ message: "Aksi tidak dikenal." });
});

// --------------------------------------------------

// Vite integration & Static serving
async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req: Request, res: Response) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server is running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
