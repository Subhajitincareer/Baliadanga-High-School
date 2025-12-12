import React from 'react';
import { motion } from 'framer-motion';
import { Quote } from 'lucide-react';

const testimonials = [
    {
        name: "Rajesh Kumar",
        role: "Software Engineer @ Google",
        batch: "Batch of 2012",
        image: "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?ixlib=rb-4.0.3&auto=format&fit=crop&w=200&q=80",
        text: "The discipline and values I learned here defined my career. The teachers were more than just mentors; they were guides for life."
    },
    {
        name: "Priya Mondal",
        role: "Doctor, AIIMS",
        batch: "Batch of 2015",
        image: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?ixlib=rb-4.0.3&auto=format&fit=crop&w=200&q=80",
        text: "Baliadanga High School gave me the foundation to dream big. The science labs and library were my sanctuary."
    },
    {
        name: "Amit Roy",
        role: "Entrepreneur",
        batch: "Batch of 2010",
        image: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?ixlib=rb-4.0.3&auto=format&fit=crop&w=200&q=80",
        text: "It was here that I learned leadership. Organizing the school sports events gave me my first taste of management."
    }
];

const Testimonials = () => {
    return (
        <section className="py-20 bg-white">
            <div className="container mx-auto px-4">
                <div className="text-center mb-16">
                    <h2 className="text-3xl md:text-5xl font-bold text-gray-900 mb-4 font-heading">Student Success Stories</h2>
                    <p className="text-gray-500 max-w-2xl mx-auto">Hear from our alumni who are making a difference in the world.</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    {testimonials.map((t, i) => (
                        <motion.div
                            key={i}
                            initial={{ opacity: 0, y: 30 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            transition={{ delay: i * 0.2, duration: 0.5 }}
                            className="bg-slate-50 p-8 rounded-2xl relative hover:-translate-y-2 transition-transform duration-300 border border-slate-100 shadow-sm hover:shadow-xl"
                        >
                            <Quote className="absolute top-6 right-6 text-school-primary/10 w-12 h-12" />
                            <div className="flex items-center gap-4 mb-6">
                                <img src={t.image} alt={t.name} className="w-14 h-14 rounded-full object-cover ring-2 ring-school-primary/20" />
                                <div>
                                    <h4 className="font-bold text-lg text-gray-900">{t.name}</h4>
                                    <p className="text-xs text-school-primary font-semibold uppercase">{t.role}</p>
                                    <p className="text-xs text-gray-400">{t.batch}</p>
                                </div>
                            </div>
                            <p className="text-gray-600 italic leading-relaxed">"{t.text}"</p>
                        </motion.div>
                    ))}
                </div>
            </div>
        </section>
    );
};

export default Testimonials;
