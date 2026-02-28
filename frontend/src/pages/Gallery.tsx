import React, { useState, useEffect } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { Loader2, ImageOff, X } from 'lucide-react';
import apiService, { GalleryItem } from '@/services/api';

const CATEGORIES = ['All', 'Campus', 'Events', 'Activities', 'Other'] as const;

const Gallery = () => {
  const [images, setImages]             = useState<GalleryItem[]>([]);
  const [loading, setLoading]           = useState(true);
  const [selected, setSelected]         = useState<GalleryItem | null>(null);
  const [activeTab, setActiveTab]       = useState<string>('All');

  useEffect(() => {
    (async () => {
      try {
        const res = await apiService.getGallery();
        if (res.success) setImages(res.data);
      } catch { /* silent */ }
      finally { setLoading(false); }
    })();
  }, []);

  const filtered = activeTab === 'All' ? images : images.filter(img => img.category === activeTab);

  return (
    <div className="container py-8">
      <div className="mb-8">
        <h1 className="font-heading mb-2 text-3xl font-bold text-school-primary">Photo Gallery</h1>
        <p className="text-lg text-muted-foreground">Explore images showcasing our school campus, events, and activities</p>
      </div>

      <Tabs defaultValue="All" onValueChange={setActiveTab} className="mb-8">
        <div className="flex justify-center mb-6">
          <TabsList>
            {CATEGORIES.map(cat => (
              <TabsTrigger key={cat} value={cat}>{cat}</TabsTrigger>
            ))}
          </TabsList>
        </div>

        {CATEGORIES.map(cat => (
          <TabsContent key={cat} value={cat}>
            {loading ? (
              <div className="flex h-48 items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin text-school-primary" />
              </div>
            ) : filtered.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-48 text-muted-foreground">
                <ImageOff className="h-12 w-12 mb-3 text-gray-300" />
                <p className="font-medium text-gray-500">No photos in this category yet</p>
                <p className="text-sm mt-1">Admin or staff can add photos from their dashboard.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
                {filtered.map((img) => (
                  <div
                    key={img._id}
                    className="group relative aspect-square cursor-pointer overflow-hidden rounded-xl border shadow-sm"
                    onClick={() => setSelected(img)}
                  >
                    <img
                      src={img.url}
                      alt={img.caption || 'Gallery image'}
                      className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-110"
                      onError={e => { (e.target as HTMLImageElement).style.display = 'none'; }}
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
                    {img.caption && (
                      <div className="absolute bottom-0 left-0 right-0 p-3 text-white opacity-0 transition-opacity duration-300 group-hover:opacity-100">
                        <p className="font-medium text-sm line-clamp-2">{img.caption}</p>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </TabsContent>
        ))}
      </Tabs>

      {/* Lightbox */}
      <Dialog open={!!selected} onOpenChange={(o) => !o && setSelected(null)}>
        <DialogContent className="max-w-4xl p-0 overflow-hidden">
          {selected && (
            <div className="flex flex-col">
              <div className="relative bg-black">
                <img
                  src={selected.url}
                  alt={selected.caption || 'Gallery'}
                  className="max-h-[70vh] w-full object-contain"
                />
                <button
                  onClick={() => setSelected(null)}
                  className="absolute top-2 right-2 bg-black/50 text-white rounded-full p-1 hover:bg-black/80 transition"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
              {selected.caption && (
                <div className="p-4 bg-white">
                  <p className="text-base font-medium">{selected.caption}</p>
                  <p className="text-xs text-muted-foreground mt-1">{selected.category}</p>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Gallery;
