export interface AdminUser {
  username: string;
  passwordHash: string;
}

export interface PrayerTime {
  name: string;
  time: string; // "HH:MM"
  isCustom: boolean;
}

export interface PrayerTimes {
  subuh: string;
  syuruk: string;
  zuhur: string;
  asar: string;
  magrib: string;
  isya: string;
  lastUpdated: string;
  method: 'auto' | 'manual';
}

export interface GalleryItem {
  id: string;
  title: string;
  date: string;
  description: string;
  imageUrl: string;
}

export interface FinancialRecord {
  id: string;
  date: string;
  type: 'pemasukan' | 'pengeluaran';
  category: string;
  description: string;
  amount: number;
}

export interface Pengurus {
  id: string;
  name: string;
  role: string;
  phone: string;
}

export interface ActiveImam {
  imam: string;
  muadzin: string;
  khatib: string;
}

export interface ProposalSection {
  id: string;
  title: string;
  content: string;
}

export interface ProposalData {
  title: string;
  description: string;
  targetAmount: number;
  collectedAmount: number;
  sections: ProposalSection[];
}

export interface Announcement {
  id: string;
  date: string;
  title: string;
  content: string;
  type: 'agenda' | 'donasi' | 'umum';
}

export interface DatabaseSchema {
  prayerTimes: PrayerTimes;
  gallery: GalleryItem[];
  finances: FinancialRecord[];
  pengurus: Pengurus[];
  activeImam: ActiveImam;
  proposal: ProposalData;
  announcements: Announcement[];
  qris: {
    imageUrl: string;
    bankName: string;
    accountHolder: string;
    accountNumber: string;
  };
}
