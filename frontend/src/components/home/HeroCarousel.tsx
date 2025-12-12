import React, { useCallback, useEffect, useState } from 'react';
import useEmblaCarousel from 'embla-carousel-react';
import Autoplay from 'embla-carousel-autoplay';
import { motion } from 'framer-motion';

const images = [
    // Classroom/Generic School
    'https://images.unsplash.com/photo-1562774053-701939374585?ixlib=rb-4.0.3&auto=format&fit=crop&w=1920&q=80',
    // Library
    'https://images.unsplash.com/photo-1509062522246-3755977927d7?ixlib=rb-4.0.3&auto=format&fit=crop&w=1920&q=80',
    // Sports/Outdoors
    'https://images.unsplash.com/photo-1576267423445-b2e0074d68a4?ixlib=rb-4.0.3&auto=format&fit=crop&w=1920&q=80',
    // Students Group
    'https://images.unsplash.com/photo-1523050854058-8df90110c9f1?ixlib=rb-4.0.3&auto=format&fit=crop&w=1920&q=80'
];

export const HeroCarousel = () => {
    const [emblaRef, emblaApi] = useEmblaCarousel({ loop: true }, [Autoplay({ delay: 5000 })]);

    return (
        <div className="absolute inset-0 z-0 bg-black/50"> {/* Overlay color */}
            <div className="overflow-hidden h-full" ref={emblaRef}>
                <div className="flex h-full">
                    {images.map((src, index) => (
                        <div className="flex-[0_0_100%] min-w-0 relative h-full" key={index}>
                            <motion.img
                                initial={{ scale: 1.1 }}
                                animate={{ scale: 1.0 }}
                                transition={{ duration: 6, repeat: Infinity, repeatType: "reverse" }} // Subtle zoom effect
                                src={src}
                                alt={`School Slide ${index + 1}`}
                                className="w-full h-full object-cover"
                            />
                            {/* Dark gradient overlay for text readability */}
                            <div className="absolute inset-0 bg-gradient-to-t from-school-primary/80 via-black/20 to-black/30 mix-blend-multiply" />
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};
