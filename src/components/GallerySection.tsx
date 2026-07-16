import React, { useState, useMemo } from "react";
import { Search, Calendar, ChevronRight, X, ExternalLink } from "lucide-react";
import { GalleryItem } from "../types";
import { AnimatePresence, motion } from "motion/react";

interface GallerySectionProps {
  gallery: GalleryItem[];
}

export default function GallerySection({ gallery }: GallerySectionProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedItem, setSelectedItem] = useState<GalleryItem | null>(null);

  // Filter gallery items
  const filteredGallery = useMemo(() => {
    return gallery.filter((item) => {
      return (
        item.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.description.toLowerCase().includes(searchTerm.toLowerCase())
      );
    });
  }, [gallery, searchTerm]);

  return (
    <div className="space-y-6" id="gallery-root">
      {/* Search and Meta */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4" id="gallery-controls-row">
        <div>
          <h3 className="text-xl font-bold font-serif text-editorial-pine">Galeri Kegiatan Masjid</h3>
          <p className="text-xs text-editorial-taupe">Kumpulan dokumentasi agenda keagamaan dan kemasyarakatan di Dusun Samaoling.</p>
        </div>

        {/* Search */}
        <div className="relative w-full md:w-80">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-editorial-taupe" />
          <input
            type="text"
            placeholder="Cari dokumentasi..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-4 py-2 border border-editorial-border rounded-xl text-xs bg-white text-editorial-text focus:outline-none focus:ring-2 focus:ring-editorial-pine/10 focus:border-editorial-pine"
            id="gallery-search"
          />
        </div>
      </div>

      {/* Photos Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6" id="gallery-grid">
        {filteredGallery.length === 0 ? (
          <div className="col-span-full p-12 text-center text-editorial-taupe text-sm bg-editorial-bg border border-editorial-border rounded-3xl" id="gallery-empty">
            Tidak ditemukan dokumentasi kegiatan yang cocok.
          </div>
        ) : (
          filteredGallery.map((item) => (
            <motion.div
              layout
              key={item.id}
              className="bg-white rounded-3xl border border-editorial-border shadow-sm overflow-hidden group hover:shadow-md transition-shadow cursor-pointer flex flex-col justify-between"
              onClick={() => setSelectedItem(item)}
              id={`gallery-card-${item.id}`}
            >
              {/* Image Container */}
              <div className="relative aspect-video overflow-hidden bg-editorial-bg" id={`gallery-img-wrap-${item.id}`}>
                <img
                  src={item.imageUrl}
                  alt={item.title}
                  referrerPolicy="no-referrer"
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#0E251B]/40 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end p-4">
                  <span className="text-white text-xs font-bold flex items-center gap-1">
                    Lihat Selengkapnya <ChevronRight className="w-4 h-4" />
                  </span>
                </div>
              </div>

              {/* Text Area */}
              <div className="p-5 flex-1 flex flex-col justify-between" id={`gallery-text-${item.id}`}>
                <div>
                  <div className="flex items-center gap-1.5 text-editorial-taupe text-[10px] font-mono mb-2" id={`gallery-meta-${item.id}`}>
                    <Calendar className="w-3.5 h-3.5" />
                    <span>
                      {new Date(item.date).toLocaleDateString("id-ID", {
                        day: "numeric",
                        month: "long",
                        year: "numeric"
                      })}
                    </span>
                  </div>
                  <h4 className="font-bold font-serif text-editorial-text text-base line-clamp-2 leading-snug group-hover:text-editorial-pine transition-colors">
                    {item.title}
                  </h4>
                  <p className="text-xs text-editorial-text/80 mt-2 line-clamp-3 leading-relaxed">
                    {item.description}
                  </p>
                </div>

                <div className="mt-4 pt-3 border-t border-editorial-border flex items-center justify-between text-[11px] font-bold text-editorial-pine" id={`gallery-foot-${item.id}`}>
                  <span>Baca Rincian</span>
                  <ExternalLink className="w-3.5 h-3.5 text-editorial-pine" />
                </div>
              </div>
            </motion.div>
          ))
        )}
      </div>

      {/* Lightbox Modal */}
      <AnimatePresence>
        {selectedItem && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.6 }}
              exit={{ opacity: 0 }}
              onClick={() => setSelectedItem(null)}
              className="fixed inset-0 bg-slate-950 z-50 cursor-zoom-out"
              id="lightbox-backdrop"
            />

            {/* Modal Body */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="fixed inset-4 md:inset-x-12 md:inset-y-16 max-w-4xl mx-auto bg-white border border-editorial-border rounded-3xl shadow-2xl z-50 overflow-hidden flex flex-col md:flex-row"
              id="lightbox-modal"
            >
              {/* Media Part */}
              <div className="flex-1 bg-slate-950 relative flex items-center justify-center h-1/2 md:h-full overflow-hidden" id="lightbox-media">
                <img
                  src={selectedItem.imageUrl}
                  alt={selectedItem.title}
                  referrerPolicy="no-referrer"
                  className="max-w-full max-h-full object-contain"
                />
                {/* Floating Close Button in image for small devices */}
                <button
                  onClick={() => setSelectedItem(null)}
                  className="absolute top-4 right-4 md:hidden p-2 bg-black/60 hover:bg-black/80 text-white rounded-full transition-colors z-10"
                  id="lightbox-mobile-close"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Text Information Part */}
              <div className="w-full md:w-80 lg:w-96 p-6 flex flex-col justify-between bg-white border-t md:border-t-0 md:border-l border-editorial-border overflow-y-auto" id="lightbox-content">
                <div>
                  <div className="flex justify-between items-start mb-4" id="lightbox-hdr">
                    <span className="flex items-center gap-1 text-editorial-taupe text-xs font-mono">
                      <Calendar className="w-4 h-4 text-editorial-pine" />
                      {new Date(selectedItem.date).toLocaleDateString("id-ID", {
                        weekday: "long",
                        day: "numeric",
                        month: "long",
                        year: "numeric"
                      })}
                    </span>
                    <button
                      onClick={() => setSelectedItem(null)}
                      className="hidden md:block p-1 hover:bg-editorial-light-green rounded-full transition-colors"
                      id="lightbox-desktop-close"
                    >
                      <X className="w-5 h-5 text-editorial-taupe" />
                    </button>
                  </div>

                  <h3 className="text-xl font-bold font-serif text-editorial-pine leading-snug">
                    {selectedItem.title}
                  </h3>

                  <p className="text-xs text-editorial-text leading-relaxed mt-4 whitespace-pre-line">
                    {selectedItem.description}
                  </p>
                </div>

                <div className="mt-8 pt-4 border-t border-editorial-border" id="lightbox-footer">
                  <span className="text-[10px] text-editorial-taupe block text-center">
                    Masjid Nurul Falah Samaoling, Soppeng 90871
                  </span>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
