import React, { useEffect, useState, useRef } from 'react';
import { motion, useInView, useSpring, useMotionValue } from 'framer-motion';
import { Users, GraduationCap, Award, BookOpen } from 'lucide-react';

const stats = [
    { label: "Founded In", value: 1965, icon: <BookOpen className="w-8 h-8 text-school-secondary" />, suffix: "" },
    { label: "Total Students", value: 1250, icon: <Users className="w-8 h-8 text-blue-400" />, suffix: "+" },
    { label: "Qualified Staff", value: 45, icon: <GraduationCap className="w-8 h-8 text-purple-400" />, suffix: "+" },
    { label: "Awards Won", value: 28, icon: <Award className="w-8 h-8 text-yellow-400" />, suffix: "" },
];

const Counter = ({ value, suffix }: { value: number, suffix: string }) => {
    const ref = useRef<HTMLSpanElement>(null);
    const motionValue = useMotionValue(0);
    const springValue = useSpring(motionValue, { damping: 50, stiffness: 100 });
    const isInView = useInView(ref, { once: true, margin: "-100px" });

    useEffect(() => {
        if (isInView) {
            motionValue.set(value);
        }
    }, [isInView, value, motionValue]);

    useEffect(() => {
        springValue.on("change", (latest) => {
            if (ref.current) {
                ref.current.textContent = Math.round(latest).toString() + suffix;
            }
        });
    }, [springValue, suffix]);

    return <span ref={ref} className="text-4xl font-bold text-school-primary" />;
};

const StatsSection = () => {
    return (
        <section className="py-16 bg-white">
            <div className="container px-4 mx-auto">
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-8 text-center">
                    {stats.map((stat, index) => (
                        <motion.div
                            key={index}
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.5, delay: index * 0.1 }}
                            viewport={{ once: true }}
                            className="flex flex-col items-center p-6 bg-slate-50 rounded-xl shadow-sm hover:shadow-md transition-shadow"
                        >
                            <div className="p-3 bg-white rounded-full shadow-sm mb-4">
                                {stat.icon}
                            </div>
                            <Counter value={stat.value} suffix={stat.suffix} />
                            <span className="text-gray-600 font-medium mt-2">{stat.label}</span>
                        </motion.div>
                    ))}
                </div>
            </div>
        </section>
    );
};

export default StatsSection;
