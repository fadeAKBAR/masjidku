import React, { useState, useMemo } from "react";
import { ArrowDownLeft, ArrowUpRight, Wallet, Search, Filter, Printer, Download } from "lucide-react";
import { FinancialRecord } from "../types";

interface FinancialDashboardProps {
  records: FinancialRecord[];
}

export default function FinancialDashboard({ records }: FinancialDashboardProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedType, setSelectedType] = useState<"semua" | "pemasukan" | "pengeluaran">("semua");
  const [selectedCategory, setSelectedCategory] = useState<string>("semua");

  // Format currency
  const formatIDR = (num: number) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
    }).format(num);
  };

  // Financial Stats
  const stats = useMemo(() => {
    let totalPemasukan = 0;
    let totalPengeluaran = 0;

    records.forEach((r) => {
      if (r.type === "pemasukan") {
        totalPemasukan += r.amount;
      } else {
        totalPengeluaran += r.amount;
      }
    });

    const saldo = totalPemasukan - totalPengeluaran;

    return {
      totalPemasukan,
      totalPengeluaran,
      saldo,
    };
  }, [records]);

  // Unique Categories list for filter
  const categories = useMemo(() => {
    const list = new Set<string>();
    records.forEach((r) => list.add(r.category));
    return ["semua", ...Array.from(list)];
  }, [records]);

  // Filtered Records
  const filteredRecords = useMemo(() => {
    return records.filter((r) => {
      const matchesSearch =
        r.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        r.category.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesType = selectedType === "semua" ? true : r.type === selectedType;
      const matchesCategory = selectedCategory === "semua" ? true : r.category === selectedCategory;

      return matchesSearch && matchesType && matchesCategory;
    });
  }, [records, searchTerm, selectedType, selectedCategory]);

  // Custom SVG Chart Data: Cumulative Cash Flow Balance Trend
  const chartData = useMemo(() => {
    if (records.length === 0) return [];
    
    // Sort chronologically to track trend
    const chronRecords = [...records].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
    
    let runningBalance = 0;
    return chronRecords.map((r, index) => {
      if (r.type === "pemasukan") {
        runningBalance += r.amount;
      } else {
        runningBalance -= r.amount;
      }
      return {
        label: new Date(r.date).toLocaleDateString("id-ID", { day: "numeric", month: "short" }),
        balance: runningBalance,
        amount: r.amount,
        type: r.type,
      };
    });
  }, [records]);

  // Print ledger handler
  const handlePrint = () => {
    window.print();
  };

  // Export CSV handler
  const handleExportCSV = () => {
    const headers = ["ID", "Tanggal", "Tipe", "Kategori", "Deskripsi", "Jumlah (IDR)"];
    const rows = records.map((r) => [
      r.id,
      r.date,
      r.type === "pemasukan" ? "Pemasukan" : "Pengeluaran",
      r.category,
      r.description,
      r.amount,
    ]);

    const csvContent =
      "data:text/csv;charset=utf-8," +
      [headers.join(","), ...rows.map((row) => row.map(val => `"${val}"`).join(","))].join("\n");

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `laporan_keuangan_masjid_nurul_falah_${new Date().toISOString().split("T")[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6" id="finances-dashboard-root">
      {/* Cards Summary row */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6" id="finances-cards-row">
        {/* Balance Card */}
        <div className="bg-gradient-to-br from-editorial-pine to-[#0E251B] text-white p-6 rounded-3xl shadow-sm flex items-center justify-between" id="card-total-saldo">
          <div>
            <span className="text-xs text-editorial-mint font-bold uppercase tracking-wider block">Saldo Kas Masjid</span>
            <h4 className="text-3xl font-bold font-serif mt-1 tracking-tight">{formatIDR(stats.saldo)}</h4>
            <span className="text-[11px] text-editorial-bg/80 mt-2 block font-medium">Buku Kas Bersih Aktif</span>
          </div>
          <div className="p-4 bg-white/10 rounded-2xl">
            <Wallet className="w-8 h-8 text-white" />
          </div>
        </div>

        {/* Income Card */}
        <div className="bg-white border border-editorial-border p-6 rounded-3xl shadow-sm flex items-center justify-between" id="card-total-pemasukan">
          <div>
            <span className="text-xs text-editorial-taupe font-bold uppercase tracking-wider block">Total Pemasukan</span>
            <h4 className="text-3xl font-bold font-serif mt-1 text-editorial-text tracking-tight">{formatIDR(stats.totalPemasukan)}</h4>
            <span className="text-[11px] text-editorial-pine font-bold mt-2 flex items-center gap-1">
              <ArrowDownLeft className="w-3.5 h-3.5" /> Aliran Masuk (Donasi & Infaq)
            </span>
          </div>
          <div className="p-4 bg-editorial-light-green rounded-2xl">
            <ArrowDownLeft className="w-8 h-8 text-editorial-pine" />
          </div>
        </div>

        {/* Expense Card */}
        <div className="bg-white border border-editorial-border p-6 rounded-3xl shadow-sm flex items-center justify-between" id="card-total-pengeluaran">
          <div>
            <span className="text-xs text-editorial-taupe font-bold uppercase tracking-wider block">Total Pengeluaran</span>
            <h4 className="text-3xl font-bold font-serif mt-1 text-editorial-text tracking-tight">{formatIDR(stats.totalPengeluaran)}</h4>
            <span className="text-[11px] text-rose-700 font-bold mt-2 flex items-center gap-1">
              <ArrowUpRight className="w-3.5 h-3.5" /> Aliran Keluar (Operasional & RAB)
            </span>
          </div>
          <div className="p-4 bg-rose-50 rounded-2xl">
            <ArrowUpRight className="w-8 h-8 text-rose-700" />
          </div>
        </div>
      </div>

      {/* Interactive Trend Chart */}
      {chartData.length > 0 && (
        <div className="bg-white border border-editorial-border p-6 rounded-3xl shadow-sm" id="finances-chart-container">
          <div className="flex justify-between items-center mb-6">
            <div>
              <h3 className="text-lg font-bold font-serif text-editorial-pine">Tren Kas Akumulatif</h3>
              <p className="text-xs text-editorial-taupe">Visualisasi kenaikan dan penyesuaian saldo kas dari transaksi ke transaksi.</p>
            </div>
            <div className="flex gap-2 text-xs font-semibold" id="chart-legend">
              <span className="flex items-center gap-1.5 text-editorial-taupe">
                <span className="w-2.5 h-2.5 rounded-full bg-editorial-pine block"></span> Saldo Kas
              </span>
            </div>
          </div>

          {/* Simple and elegant pure SVG Chart */}
          <div className="w-full overflow-x-auto h-48 sm:h-64" id="custom-svg-chart-wrapper">
            <svg viewBox="0 0 1000 240" className="w-full min-w-[700px] h-full" id="cash-trend-svg">
              <defs>
                <linearGradient id="chartGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#1B4332" stopOpacity="0.25" />
                  <stop offset="100%" stopColor="#1B4332" stopOpacity="0.0" />
                </linearGradient>
              </defs>

              {/* Grid Lines */}
              <line x1="50" y1="20" x2="950" y2="20" stroke="#E5E0D5" strokeWidth="1" />
              <line x1="50" y1="80" x2="950" y2="80" stroke="#E5E0D5" strokeWidth="1" />
              <line x1="50" y1="140" x2="950" y2="140" stroke="#E5E0D5" strokeWidth="1" />
              <line x1="50" y1="200" x2="950" y2="200" stroke="#E5E0D5" strokeWidth="1" />

              {/* Compute chart coordinates */}
              {(() => {
                const maxVal = Math.max(...chartData.map((d) => d.balance)) || 1;
                const minVal = Math.min(...chartData.map((d) => d.balance)) || 0;
                const range = maxVal - minVal || 1;

                const getX = (index: number) => 50 + (index / (chartData.length - 1)) * 900;
                const getY = (val: number) => 200 - ((val - minVal) / range) * 160;

                const points = chartData.map((d, i) => `${getX(i)},${getY(d.balance)}`).join(" ");
                const areaPoints = `${getX(0)},200 ${points} ${getX(chartData.length - 1)},200`;

                return (
                  <>
                    {/* Fill Area */}
                    <polygon points={areaPoints} fill="url(#chartGradient)" />

                    {/* Path Line */}
                    <polyline points={points} fill="none" stroke="#1B4332" strokeWidth="3" strokeLinecap="round" />

                    {/* Circles on Nodes */}
                    {chartData.map((d, i) => (
                      <g key={i}>
                        <circle
                          cx={getX(i)}
                          cy={getY(d.balance)}
                          r="5"
                          fill="#ffffff"
                          stroke="#1B4332"
                          strokeWidth="2.5"
                        />
                        {/* Text over circle */}
                        <text
                          x={getX(i)}
                          y={getY(d.balance) - 10}
                          textAnchor="middle"
                          className="text-[10px] font-bold font-mono fill-editorial-pine"
                        >
                          {(d.balance / 1000000).toFixed(1)}M
                        </text>
                        {/* Label bottom */}
                        <text
                          x={getX(i)}
                          y="220"
                          textAnchor="middle"
                          className="text-[10px] font-bold font-mono fill-editorial-taupe"
                        >
                          {d.label}
                        </text>
                      </g>
                    ))}
                  </>
                );
              })()}
            </svg>
          </div>
        </div>
      )}

      {/* Ledger Table controls & items */}
      <div className="bg-white border border-editorial-border rounded-3xl shadow-sm overflow-hidden" id="finances-ledger-card">
        {/* Ledger Header & Action bar */}
        <div className="p-6 border-b border-editorial-border flex flex-col md:flex-row md:items-center justify-between gap-4" id="ledger-controls">
          <div>
            <h3 className="text-lg font-bold font-serif text-editorial-pine">Buku Kas Transparan</h3>
            <p className="text-xs text-editorial-taupe">Transparansi penuh pengeluaran dan pemasukan dana Masjid Nurul Falah.</p>
          </div>

          <div className="flex flex-wrap items-center gap-2" id="ledger-actions">
            <button
              onClick={handlePrint}
              className="p-2.5 text-editorial-text hover:text-editorial-pine hover:bg-editorial-light-green rounded-xl transition-colors border border-editorial-border bg-white flex items-center gap-1.5 text-xs font-bold"
              id="btn-print-ledger"
            >
              <Printer className="w-4 h-4 text-editorial-pine" /> Cetak Buku
            </button>
            <button
              onClick={handleExportCSV}
              className="p-2.5 text-editorial-text hover:text-editorial-pine hover:bg-editorial-light-green rounded-xl transition-colors border border-editorial-border bg-white flex items-center gap-1.5 text-xs font-bold"
              id="btn-export-csv"
            >
              <Download className="w-4 h-4 text-editorial-pine" /> Ekspor CSV
            </button>
          </div>
        </div>

        {/* Filters Panel */}
        <div className="p-6 bg-editorial-bg/30 border-b border-editorial-border grid grid-cols-1 md:grid-cols-3 gap-4" id="ledger-filters-panel">
          {/* Search bar */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-editorial-taupe" />
            <input
              type="text"
              placeholder="Cari transaksi..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-4 py-2 border border-editorial-border rounded-xl text-xs bg-white text-editorial-text focus:outline-none focus:ring-2 focus:ring-editorial-pine/10 focus:border-editorial-pine"
              id="filter-search-input"
            />
          </div>

          {/* Type Filter */}
          <div className="flex items-center gap-2">
            <Filter className="w-4 h-4 text-editorial-taupe" />
            <select
              value={selectedType}
              onChange={(e) => setSelectedType(e.target.value as any)}
              className="w-full px-3 py-2 border border-editorial-border rounded-xl text-xs bg-white text-editorial-text focus:outline-none focus:ring-2 focus:ring-editorial-pine/10 focus:border-editorial-pine"
              id="filter-type-select"
            >
              <option value="semua">Semua Tipe Kas</option>
              <option value="pemasukan">Hanya Pemasukan</option>
              <option value="pengeluaran">Hanya Pengeluaran</option>
            </select>
          </div>

          {/* Category Filter */}
          <div className="flex items-center gap-2">
            <Filter className="w-4 h-4 text-editorial-taupe" />
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="w-full px-3 py-2 border border-editorial-border rounded-xl text-xs bg-white text-editorial-text focus:outline-none focus:ring-2 focus:ring-editorial-pine/10 focus:border-editorial-pine"
              id="filter-category-select"
            >
              <option value="semua">Semua Kategori</option>
              {categories.map((c) => (
                <option key={c} value={c}>
                  {c.charAt(0).toUpperCase() + c.slice(1)}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Ledger Table */}
        <div className="overflow-x-auto" id="ledger-table-container">
          <table className="w-full text-left border-collapse" id="ledger-records-table">
            <thead>
              <tr className="bg-editorial-bg border-b border-editorial-border text-[11px] font-bold text-editorial-taupe uppercase tracking-wider">
                <th className="p-4">Tanggal</th>
                <th className="p-4">Deskripsi</th>
                <th className="p-4">Kategori</th>
                <th className="p-4">Aliran</th>
                <th className="p-4 text-right">Jumlah</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-editorial-border text-xs text-editorial-text">
              {filteredRecords.length === 0 ? (
                <tr>
                  <td colSpan={5} className="p-8 text-center text-editorial-taupe">
                    Tidak ditemukan data transaksi keuangan yang cocok.
                  </td>
                </tr>
              ) : (
                filteredRecords.map((r) => (
                  <tr key={r.id} className="hover:bg-editorial-light-green/10 transition-colors" id={`row-${r.id}`}>
                    <td className="p-4 font-mono text-editorial-taupe">
                      {new Date(r.date).toLocaleDateString("id-ID", {
                        day: "2-digit",
                        month: "2-digit",
                        year: "numeric",
                      })}
                    </td>
                    <td className="p-4 font-bold text-editorial-text">{r.description}</td>
                    <td className="p-4">
                      <span className="bg-editorial-bg border border-editorial-border text-editorial-taupe px-2.5 py-1 rounded-full text-[10px] font-semibold">
                        {r.category}
                      </span>
                    </td>
                    <td className="p-4">
                      <span
                        className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded border ${
                          r.type === "pemasukan"
                            ? "text-editorial-pine bg-editorial-light-green border-editorial-border-green/40"
                            : "text-rose-700 bg-rose-50 border-rose-100"
                        }`}
                      >
                        {r.type}
                      </span>
                    </td>
                    <td className={`p-4 text-right font-bold font-mono ${r.type === "pemasukan" ? "text-editorial-pine" : "text-rose-600"}`}>
                      {r.type === "pemasukan" ? "+" : "-"} {formatIDR(r.amount).replace("Rp", "").trim()}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
