
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent } from "@/components/ui/dialog";

// Sample gallery data
const galleryData = {
  "Campus": [
    { id: 1, src: "https://images.unsplash.com/photo-1577896851231-70ef18881754?ixlib=rb-4.0.3&w=800&h=600&q=80", caption: "School Main Building" },
    { id: 2, src: "https://images.unsplash.com/photo-1580582932707-520aed937b7b?ixlib=rb-4.0.3&w=800&h=600&q=80", caption: "School Library" },
    { id: 3, src: "https://images.unsplash.com/photo-1598301257983-7a888132a824?ixlib=rb-4.0.3&w=800&h=600&q=80", caption: "Computer Laboratory" },
    { id: 4, src: "https://images.unsplash.com/photo-1507842217343-583bb7270b66?ixlib=rb-4.0.3&w=800&h=600&q=80", caption: "Reading Area" },
    { id: 5, src: "https://images.unsplash.com/photo-1556761175-5973dc0f32e7?ixlib=rb-4.0.3&w=800&h=600&q=80", caption: "Basketball Court" },
    { id: 6, src: "https://images.unsplash.com/photo-1570975640108-2aaef8b9dea4?ixlib=rb-4.0.3&w=800&h=600&q=80", caption: "School Canteen" },
  ],
  "Events": [
    { id: 7, src: "https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?ixlib=rb-4.0.3&w=800&h=600&q=80", caption: "Annual Day Celebration" },
    { id: 8, src: "https://images.unsplash.com/photo-1523580494863-6f3031224c94?ixlib=rb-4.0.3&w=800&h=600&q=80", caption: "Science Exhibition" },
    { id: 9, src: "https://images.unsplash.com/photo-1560523159-4a9692d222f8?ixlib=rb-4.0.3&w=800&h=600&q=80", caption: "Sports Day" },
    { id: 10, src: "https://images.unsplash.com/photo-1526676037777-05a232554f77?ixlib=rb-4.0.3&w=800&h=600&q=80", caption: "Annual Sports Meet" },
    { id: 11, src: "https://images.unsplash.com/photo-1544928147-79a2dbc1f389?ixlib=rb-4.0.3&w=800&h=600&q=80", caption: "Cultural Program" },
    { id: 12, src: "https://images.unsplash.com/photo-1511578194003-00c80e42dc9b?ixlib=rb-4.0.3&w=800&h=600&q=80", caption: "Teachers' Day" },
  ],
  "Activities": [
    { id: 13, src: "https://images.unsplash.com/photo-1564979395767-48a39669d389?ixlib=rb-4.0.3&w=800&h=600&q=80", caption: "Art Class" },
    { id: 14, src: "https://images.unsplash.com/photo-1550305080-4e029753abcf?ixlib=rb-4.0.3&w=800&h=600&q=80", caption: "Music Class" },
    { id: 15, src: "https://images.unsplash.com/photo-1519389950473-47ba0277781c?ixlib=rb-4.0.3&w=800&h=600&q=80", caption: "Computer Class" },
    { id: 16, src: "https://images.unsplash.com/photo-1589998059171-988d887df646?ixlib=rb-4.0.3&w=800&h=600&q=80", caption: "Science Lab Activities" },
    { id: 17, src: "https://images.unsplash.com/photo-1525921429624-479b6a26d84d?ixlib=rb-4.0.3&w=800&h=600&q=80", caption: "Sports Activities" },
    { id: 18, src: "https://images.unsplash.com/photo-1553451133-8083c47243d6?ixlib=rb-4.0.3&w=800&h=600&q=80", caption: "Yoga Class" },
  ]
};

type GalleryImage = {
  id: number;
  src: string;
  caption: string;
};

const Gallery = () => {
  const [selectedImage, setSelectedImage] = useState<GalleryImage | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const handleImageClick = (image: GalleryImage) => {
    setSelectedImage(image);
    setIsDialogOpen(true);
  };

  return (
    <div className="container py-8">
      <div className="mb-8">
        <h1 className="font-heading mb-2 text-3xl font-bold text-school-primary">Photo Gallery</h1>
        <p className="text-lg text-muted-foreground">
          Explore images showcasing our school campus, events, and activities
        </p>
      </div>

      <Tabs defaultValue="Campus" className="mb-8">
        <div className="flex justify-center mb-6">
          <TabsList>
            {Object.keys(galleryData).map((category) => (
              <TabsTrigger key={category} value={category}>
                {category}
              </TabsTrigger>
            ))}
          </TabsList>
        </div>

        {Object.entries(galleryData).map(([category, images]) => (
          <TabsContent key={category} value={category}>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3">
              {images.map((image) => (
                <div
                  key={image.id}
                  className="group relative aspect-square cursor-pointer overflow-hidden rounded-md"
                  onClick={() => handleImageClick(image)}
                >
                  <img
                    src={image.src}
                    alt={image.caption}
                    className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-110"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
                  <div className="absolute bottom-0 left-0 right-0 p-4 text-white opacity-0 transition-opacity duration-300 group-hover:opacity-100">
                    <p className="font-medium">{image.caption}</p>
                  </div>
                </div>
              ))}
            </div>
          </TabsContent>
        ))}
      </Tabs>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-4xl p-0 overflow-hidden">
          {selectedImage && (
            <div className="flex flex-col">
              <div className="relative aspect-video bg-muted">
                <img
                  src={selectedImage.src}
                  alt={selectedImage.caption}
                  className="h-full w-full object-contain"
                />
              </div>
              <div className="p-6">
                <h3 className="text-lg font-medium">{selectedImage.caption}</h3>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Gallery;
