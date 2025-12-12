import React from 'react';
import { MessageCircle, Phone, FileQuestion } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link } from 'react-router-dom';

export const FloatingAction = () => {
    const [isOpen, setIsOpen] = React.useState(false);

    return (
        <div className="fixed bottom-20 md:bottom-6 right-6 z-50 flex flex-col items-end gap-2">
            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ opacity: 0, scale: 0.8, y: 10 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.8, y: 10 }}
                        className="flex flex-col gap-2 mb-2"
                    >
                        <Link to="/admission" className="flex items-center gap-2 bg-white text-school-primary px-4 py-2 rounded-full shadow-lg border hover:bg-school-light transition-colors">
                            <span className="font-semibold text-sm">Admission</span>
                            <FileQuestion size={18} />
                        </Link>
                        <Link to="/contact" className="flex items-center gap-2 bg-white text-school-primary px-4 py-2 rounded-full shadow-lg border hover:bg-school-light transition-colors">
                            <span className="font-semibold text-sm">Contact</span>
                            <Phone size={18} />
                        </Link>
                    </motion.div>
                )}
            </AnimatePresence>

            <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                onClick={() => setIsOpen(!isOpen)}
                className="bg-school-secondary text-white p-4 rounded-full shadow-xl hover:bg-green-600 transition-colors"
            >
                <div className="relative">
                    <MessageCircle size={28} />
                    <span className="absolute -top-1 -right-1 flex h-3 w-3">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-white opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-3 w-3 bg-red-500"></span>
                    </span>
                </div>
            </motion.button>
        </div>
    );
};
