import React, { useState, useEffect } from "react";
import { Bell, X, Calendar, DollarSign, Info } from "lucide-react";
import { Announcement } from "../types";
import { AnimatePresence, motion } from "motion/react";

interface NotificationBellProps {
  announcements: Announcement[];
}

export default function NotificationBell({ announcements }: NotificationBellProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const [lastSeenId, setLastSeenId] = useState<string | null>(null);
  const [activeToast, setActiveToast] = useState<Announcement | null>(null);

  useEffect(() => {
    // Load last seen notification ID from localStorage to calculate unread count
    const savedLastSeen = localStorage.getItem("last_seen_announcement_id");
    setLastSeenId(savedLastSeen);

    if (announcements.length > 0) {
      if (!savedLastSeen) {
        setUnreadCount(announcements.length);
      } else {
        const index = announcements.findIndex(a => a.id === savedLastSeen);
        if (index === -1) {
          setUnreadCount(announcements.length);
        } else {
          setUnreadCount(index);
        }
      }

      // Show toast if there's a new announcement and it's not seen yet
      const newest = announcements[0];
      if (newest.id !== savedLastSeen) {
        setActiveToast(newest);
        // Auto-dismiss toast after 6 seconds
        const timer = setTimeout(() => {
          setActiveToast(null);
        }, 6000);
        return () => clearTimeout(timer);
      }
    }
  }, [announcements]);

  const handleOpenToggle = () => {
    setIsOpen(!isOpen);
    if (!isOpen && announcements.length > 0) {
      const newestId = announcements[0].id;
      localStorage.setItem("last_seen_announcement_id", newestId);
      setLastSeenId(newestId);
      setUnreadCount(0);
    }
  };

  const getIcon = (type: Announcement["type"]) => {
    switch (type) {
      case "agenda":
        return <Calendar className="w-5 h-5 text-editorial-pine" id="ann-icon-agenda" />;
      case "donasi":
        return <DollarSign className="w-5 h-5 text-amber-700" id="ann-icon-donasi" />;
      default:
        return <Info className="w-5 h-5 text-blue-700" id="ann-icon-info" />;
    }
  };

  return (
    <div className="relative" id="notification-bell-container">
      {/* Bell Button */}
      <button
        onClick={handleOpenToggle}
        className="relative p-2 text-editorial-text hover:text-editorial-pine bg-white hover:bg-editorial-light-green/40 rounded-full transition-colors border border-editorial-border shadow-sm focus:outline-none"
        aria-label="Notifikasi"
        id="notification-bell-btn"
      >
        <Bell className="w-6 h-6" />
        {unreadCount > 0 && (
          <span
            className="absolute -top-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-red-800 text-[10px] font-bold text-white ring-2 ring-white"
            id="notification-badge"
          >
            {unreadCount}
          </span>
        )}
      </button>

      {/* Dropdown Card */}
      <AnimatePresence>
        {isOpen && (
          <>
            {/* Backdrop click closer */}
            <div
              className="fixed inset-0 z-40"
              onClick={() => setIsOpen(false)}
              id="notification-backdrop"
            />

            <motion.div
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 15 }}
              className="absolute right-0 mt-3 w-80 sm:w-96 bg-white rounded-2xl shadow-xl border border-editorial-border z-50 overflow-hidden"
              id="notification-dropdown-panel"
            >
              <div className="p-4 bg-editorial-pine text-white flex items-center justify-between" id="notification-hdr">
                <div className="flex items-center gap-2">
                  <Bell className="w-5 h-5" />
                  <h3 className="font-bold font-serif text-base">Pusat Informasi Masjid</h3>
                </div>
                <button
                  onClick={() => setIsOpen(false)}
                  className="p-1 hover:bg-[#0E251B] rounded-full transition-colors"
                  id="notification-close-btn"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="max-h-[400px] overflow-y-auto divide-y divide-editorial-border" id="notification-list">
                {announcements.length === 0 ? (
                  <div className="p-8 text-center text-editorial-taupe text-sm bg-editorial-bg" id="notification-empty">
                    Tidak ada pengumuman terbaru saat ini.
                  </div>
                ) : (
                  announcements.map((ann) => (
                    <div
                      key={ann.id}
                      className={`p-4 hover:bg-editorial-light-green/20 transition-colors flex gap-3 ${
                        lastSeenId && announcements.indexOf(ann) < announcements.findIndex(a => a.id === lastSeenId)
                          ? "bg-editorial-light-green/10"
                          : ""
                      }`}
                      id={`notification-item-${ann.id}`}
                    >
                      <div className="flex-shrink-0 mt-0.5 p-2 bg-editorial-bg border border-editorial-border rounded-lg">
                        {getIcon(ann.type)}
                      </div>
                      <div className="flex-1">
                        <div className="flex justify-between items-start mb-1">
                          <span className="text-[10px] font-mono text-editorial-taupe">
                            {new Date(ann.date).toLocaleDateString("id-ID", {
                              day: "numeric",
                              month: "short",
                              year: "numeric"
                            })}
                          </span>
                          <span
                            className={`text-[9px] px-2 py-0.5 rounded-full font-bold uppercase border ${
                              ann.type === "agenda"
                                ? "bg-editorial-light-green text-editorial-pine border-editorial-border-green/20"
                                : ann.type === "donasi"
                                ? "bg-amber-50 text-amber-800 border-amber-200/50"
                                : "bg-blue-50 text-blue-800 border-blue-200/50"
                            }`}
                          >
                            {ann.type}
                          </span>
                        </div>
                        <h4 className="font-bold font-serif text-sm text-editorial-text leading-snug">{ann.title}</h4>
                        <p className="text-xs text-editorial-text/95 mt-1 whitespace-pre-line leading-relaxed">{ann.content}</p>
                      </div>
                    </div>
                  ))
                )}
              </div>
              <div className="p-3 bg-editorial-bg border-t border-editorial-border text-center" id="notification-ftr">
                <span className="text-[10px] text-editorial-taupe">Masjid Nurul Falah Samaoling, Soppeng</span>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Overlay Toast Notification */}
      <AnimatePresence>
        {activeToast && (
          <motion.div
            initial={{ opacity: 0, x: 50, y: 50 }}
            animate={{ opacity: 1, x: 0, y: 0 }}
            exit={{ opacity: 0, x: 50 }}
            className="fixed bottom-6 right-6 z-50 max-w-sm w-full bg-white border border-editorial-border shadow-2xl rounded-2xl overflow-hidden p-4 flex gap-3 ring-1 ring-editorial-pine/20"
            id="notification-toast"
          >
            <div className="flex-shrink-0 p-2.5 bg-editorial-light-green rounded-xl h-fit">
              {getIcon(activeToast.type)}
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between mb-1">
                <span className="text-[10px] font-bold text-editorial-pine tracking-wider uppercase font-serif">Info Masjid Terbaru</span>
                <button
                  onClick={() => setActiveToast(null)}
                  className="text-editorial-taupe hover:text-editorial-text"
                  id="notification-toast-close"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
              <h4 className="font-bold font-serif text-sm text-editorial-text truncate">{activeToast.title}</h4>
              <p className="text-xs text-editorial-text/90 mt-0.5 line-clamp-2 leading-relaxed">{activeToast.content}</p>
              <button
                onClick={() => {
                  setIsOpen(true);
                  setActiveToast(null);
                }}
                className="mt-2 text-xs font-bold text-editorial-pine hover:text-[#0E251B] flex items-center gap-1"
                id="notification-toast-view"
              >
                Lihat Selengkapnya &rarr;
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
