import React from 'react';
import { motion } from 'framer-motion';

const PrincipalMessage = () => {
    return (
        <section className="py-20 bg-gray-50">
            <div className="container mx-auto px-4">
                <div className="flex flex-col md:flex-row items-center gap-10">
                    {/* User Image */}
                    <motion.div
                        initial={{ opacity: 0, x: -50 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.8 }}
                        className="w-full md:w-1/3"
                    >
                        <div className="relative group rounded-2xl overflow-hidden shadow-2xl">
                            <img
                                src="https://images.unsplash.com/photo-1544717305-2782549b5136?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80"
                                alt="Principal"
                                className="w-full h-auto object-cover transform group-hover:scale-105 transition-transform duration-500"
                            />
                            <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-6 text-white">
                                <h3 className="text-xl font-bold">Dr. Anirban Das</h3>
                                <p className="text-sm opacity-90">Principal, M.Sc, PhD</p>
                            </div>
                        </div>
                    </motion.div>

                    {/* Content */}
                    <motion.div
                        initial={{ opacity: 0, x: 50 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.8 }}
                        className="w-full md:w-2/3"
                    >
                        <div className="mb-4 inline-block bg-school-primary/10 text-school-primary px-3 py-1 rounded-full text-sm font-semibold uppercase tracking-wider">
                            Principal's Message
                        </div>
                        <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-6 font-heading">
                            Guiding the Future of <span className="text-school-primary">Baliadanga</span>
                        </h2>
                        <div className="space-y-4 text-gray-600 text-lg leading-relaxed">
                            <p>
                                "Welcome to Baliadanga High School. Our mission goes beyond textbooks and exams. We strive to create an environment where integrity, curiosity, and resilience are cultivated."
                            </p>
                            <p>
                                In today's rapidly changing world, we equip our students not just with knowledge, but with the wisdom to use it. I invite you to join our journey of excellence.
                            </p>
                        </div>
                        <div className="mt-8">
                            <img src="https://upload.wikimedia.org/wikipedia/commons/thumb/e/e4/Signature_sample.svg/1200px-Signature_sample.svg.png" alt="Signature" className="h-12 opacity-60" />
                        </div>
                    </motion.div>
                </div>
            </div>
        </section>
    );
};

export default PrincipalMessage;
