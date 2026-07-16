import React, { useState, useEffect } from "react";
import { Clock, Volume2, VolumeX, Moon, Sun, Sunrise, Compass } from "lucide-react";
import { PrayerTimes } from "../types";

interface PrayerTimeCardProps {
  prayerTimes: PrayerTimes;
}

export default function PrayerTimeCard({ prayerTimes }: PrayerTimeCardProps) {
  const [currentTime, setCurrentTime] = useState(new Date());
  const [nextPrayer, setNextPrayer] = useState<{ name: string; time: string; countdown: string } | null>(null);
  const [currentPrayerName, setCurrentPrayerName] = useState<string>("");
  const [isPlayingAdhan, setIsPlayingAdhan] = useState(false);
  const [audio, setAudio] = useState<HTMLAudioElement | null>(null);

  // Live Clock
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // Calculate Current & Next Prayer + Countdown
  useEffect(() => {
    const parseTime = (timeStr: string, isNextDay = false): Date => {
      const [h, m] = timeStr.split(":").map(Number);
      const d = new Date();
      d.setHours(h, m, 0, 0);
      if (isNextDay) {
        d.setDate(d.getDate() + 1);
      }
      return d;
    };

    const schedule = [
      { name: "Subuh", time: prayerTimes.subuh },
      { name: "Syuruk", time: prayerTimes.syuruk },
      { name: "Zuhur", time: prayerTimes.zuhur },
      { name: "Asar", time: prayerTimes.asar },
      { name: "Magrib", time: prayerTimes.magrib },
      { name: "Isya", time: prayerTimes.isya },
    ];

    const now = currentTime.getTime();
    let nextIndex = -1;
    let minDiff = Infinity;

    // Find next prayer
    for (let i = 0; i < schedule.length; i++) {
      const pTime = parseTime(schedule[i].time).getTime();
      const diff = pTime - now;
      if (diff > 0 && diff < minDiff) {
        minDiff = diff;
        nextIndex = i;
      }
    }

    let nextName = "";
    let nextTimeString = "";
    let diffMs = 0;

    if (nextIndex !== -1) {
      nextName = schedule[nextIndex].name;
      nextTimeString = schedule[nextIndex].time;
      diffMs = minDiff;
    } else {
      // If all passed, the next prayer is Subuh tomorrow
      nextName = "Subuh";
      nextTimeString = prayerTimes.subuh;
      diffMs = parseTime(prayerTimes.subuh, true).getTime() - now;
    }

    // Determine current active prayer
    // Current prayer is the one whose time has passed, but the next prayer hasn't arrived
    let currentName = "Isya"; // Default if after Isya
    if (now >= parseTime(prayerTimes.subuh).getTime() && now < parseTime(prayerTimes.syuruk).getTime()) {
      currentName = "Subuh";
    } else if (now >= parseTime(prayerTimes.syuruk).getTime() && now < parseTime(prayerTimes.zuhur).getTime()) {
      currentName = "Syuruk (Terbit)";
    } else if (now >= parseTime(prayerTimes.zuhur).getTime() && now < parseTime(prayerTimes.asar).getTime()) {
      currentName = "Zuhur";
    } else if (now >= parseTime(prayerTimes.asar).getTime() && now < parseTime(prayerTimes.magrib).getTime()) {
      currentName = "Asar";
    } else if (now >= parseTime(prayerTimes.magrib).getTime() && now < parseTime(prayerTimes.isya).getTime()) {
      currentName = "Magrib";
    }

    setCurrentPrayerName(currentName);

    // Format countdown
    const hours = Math.floor(diffMs / (1000 * 60 * 60));
    const minutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((diffMs % (1000 * 60)) / 1000);

    const countdownStr = [
      hours > 0 ? `${hours} jam` : "",
      minutes > 0 ? `${minutes} menit` : "",
      hours === 0 ? `${seconds} detik` : "",
    ]
      .filter(Boolean)
      .join(" ");

    setNextPrayer({
      name: nextName,
      time: nextTimeString,
      countdown: countdownStr || "Sedang masuk waktu",
    });
  }, [currentTime, prayerTimes]);

  // Audio Handler
  const handleToggleAdhan = () => {
    if (isPlayingAdhan) {
      if (audio) {
        audio.pause();
        audio.currentTime = 0;
      }
      setIsPlayingAdhan(false);
    } else {
      // Free non-copyrighted beautiful adhan audio
      const newAudio = new Audio("https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3"); // Using safe audio mock or beep or a beautiful simulated audio
      newAudio.loop = false;
      newAudio.volume = 0.5;
      newAudio.play().then(() => {
        setIsPlayingAdhan(true);
        setAudio(newAudio);
        newAudio.onended = () => setIsPlayingAdhan(false);
      }).catch(err => {
        console.error("Audio playback error:", err);
        // Fallback to visual feedback
        setIsPlayingAdhan(true);
        setTimeout(() => setIsPlayingAdhan(false), 5000);
      });
    }
  };

  useEffect(() => {
    return () => {
      if (audio) {
        audio.pause();
      }
    };
  }, [audio]);

  const getPrayerIcon = (name: string) => {
    const cls = "w-6 h-6 text-emerald-600";
    if (name.includes("Subuh")) return <Moon className={cls} />;
    if (name.includes("Syuruk")) return <Sunrise className={cls} />;
    if (name.includes("Zuhur")) return <Sun className={cls} />;
    if (name.includes("Asar")) return <Sun className="w-6 h-6 text-amber-500" />;
    if (name.includes("Magrib")) return <Moon className="w-6 h-6 text-amber-600" />;
    return <Moon className="w-6 h-6 text-indigo-900" />;
  };

  // List of prayers to map in UI
  const prayersList = [
    { name: "Subuh", time: prayerTimes.subuh, icon: <Moon className="w-5 h-5 text-emerald-600" /> },
    { name: "Syuruk", time: prayerTimes.syuruk, icon: <Sunrise className="w-5 h-5 text-emerald-600" /> },
    { name: "Zuhur", time: prayerTimes.zuhur, icon: <Sun className="w-5 h-5 text-emerald-600" /> },
    { name: "Asar", time: prayerTimes.asar, icon: <Sun className="w-5 h-5 text-amber-500" /> },
    { name: "Magrib", time: prayerTimes.magrib, icon: <Moon className="w-5 h-5 text-amber-600" /> },
    { name: "Isya", time: prayerTimes.isya, icon: <Moon className="w-5 h-5 text-indigo-900" /> },
  ];

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6" id="prayer-times-section">
      {/* Primary Banner (Countdown & Active Prayer) */}
      <div className="lg:col-span-1 bg-gradient-to-br from-editorial-pine to-[#0E251B] text-white p-6 rounded-3xl shadow-md flex flex-col justify-between relative overflow-hidden" id="prayer-banner-main">
        {/* Decorative Watermark */}
        <div className="absolute right-[-40px] bottom-[-40px] opacity-10 text-white" id="watermark-mosque">
          <Moon className="w-48 h-48" />
        </div>

        <div className="z-10" id="banner-head">
          <div className="flex justify-between items-center mb-4">
            <span className="text-xs font-bold bg-white/10 text-editorial-bg px-3 py-1 rounded-full uppercase tracking-wider">
              Samaoling, Soppeng
            </span>
            <div className="flex items-center gap-1.5 text-xs text-editorial-mint">
              <Compass className="w-4 h-4" />
              <span>Qiblat: 292° Barat Laut</span>
            </div>
          </div>

          <div className="mt-4" id="clock-container">
            <span className="text-4xl font-bold font-serif tracking-tight text-white block">
              {currentTime.toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit", second: "2-digit" })}
            </span>
            <span className="text-xs text-editorial-mint font-medium mt-1 block">
              {currentTime.toLocaleDateString("id-ID", { weekday: "long", day: "numeric", month: "long", year: "numeric" })} WITA
            </span>
          </div>
        </div>

        <div className="mt-8 z-10" id="banner-body">
          <span className="text-xs font-bold text-editorial-mint tracking-wider uppercase block">
            Waktu Salat Sekarang
          </span>
          <h3 className="text-3xl font-bold font-serif text-white mt-1 flex items-center gap-2">
            {currentPrayerName}
          </h3>

          {nextPrayer && (
            <div className="mt-4 p-4 bg-[#0E251B]/60 border border-editorial-border/10 rounded-2xl" id="next-prayer-box">
              <span className="text-xs text-editorial-mint block">
                Menuju {nextPrayer.name} ({nextPrayer.time})
              </span>
              <span className="text-lg font-bold text-editorial-mint block mt-1">
                {nextPrayer.countdown}
              </span>
            </div>
          )}
        </div>

        <div className="mt-6 flex items-center justify-between border-t border-white/10 pt-4 z-10" id="banner-foot">
          <div className="flex items-center gap-2 text-xs text-editorial-mint">
            <Clock className="w-4 h-4" />
            <span>Kemenag RI (Soppeng)</span>
          </div>
          <button
            onClick={handleToggleAdhan}
            className="flex items-center gap-2 text-xs font-bold bg-white text-editorial-pine px-4 py-2 rounded-xl shadow-md hover:bg-editorial-light-green transition-colors"
            id="adhan-audio-btn"
          >
            {isPlayingAdhan ? (
              <>
                <VolumeX className="w-4 h-4 text-editorial-pine animate-pulse" />
                <span>Matikan Suara</span>
              </>
            ) : (
              <>
                <Volume2 className="w-4 h-4 text-editorial-pine" />
                <span>Simulasi Adzan</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Grid of All Prayer Times */}
      <div className="lg:col-span-2 bg-white rounded-3xl p-6 border border-editorial-border shadow-sm flex flex-col justify-between" id="prayer-times-grid">
        <div id="grid-header">
          <h3 className="text-xl font-bold font-serif text-editorial-pine flex items-center gap-2 mb-2">
            Jadwal Salat Hari Ini
          </h3>
          <p className="text-xs text-editorial-taupe leading-relaxed mb-4">
            Perhitungan berdasarkan koordinat Kecamatan Lilirilau, Kabupaten Soppeng. Hasil sinkronisasi otomatis menggunakan metode astronomi Kementerian Agama RI.
          </p>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 gap-4" id="grid-cards-container">
          {prayersList.map((p) => {
            const isActive = currentPrayerName.toLowerCase().includes(p.name.toLowerCase());
            return (
              <div
                key={p.name}
                className={`p-4 rounded-2xl border transition-all duration-300 flex flex-col justify-between h-28 relative overflow-hidden ${
                  isActive
                    ? "bg-editorial-light-green border-editorial-border-green shadow-sm ring-1 ring-editorial-pine/20"
                    : "bg-editorial-bg/30 border-editorial-border hover:bg-editorial-light-green/30 hover:border-editorial-border-green"
                }`}
                id={`prayer-tile-${p.name.toLowerCase()}`}
              >
                <div className="flex justify-between items-start" id={`tile-hdr-${p.name}`}>
                  <span className={`text-sm font-bold ${isActive ? "text-editorial-pine" : "text-editorial-text"}`}>
                    {p.name}
                  </span>
                  {getPrayerIcon(p.name)}
                </div>
                <div id={`tile-time-${p.name}`}>
                  <span className={`text-2xl font-bold font-mono tracking-tight block ${isActive ? "text-editorial-pine" : "text-editorial-text"}`}>
                    {p.time}
                  </span>
                  {isActive && (
                    <span className="text-[10px] font-bold text-editorial-pine block mt-0.5 animate-pulse uppercase tracking-wide">
                      Sedang Berlangsung
                    </span>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        <div className="mt-4 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 pt-4 border-t border-editorial-border text-[11px] text-editorial-taupe" id="grid-footer">
          <span>Koreksi lintang/bujur & ijtihad daerah: +2 Menit (Ikhtiyati)</span>
          <span className="font-mono bg-editorial-bg border border-editorial-border text-editorial-taupe px-2.5 py-1 rounded-md">
            Metode: {prayerTimes.method === "auto" ? "Astronomis (Sinkron)" : "Manual Terjadwal"}
          </span>
        </div>
      </div>
    </div>
  );
}
