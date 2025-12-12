import { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';

export const TopLoader = () => {
    const { pathname } = useLocation();
    const [progress, setProgress] = useState(0);

    useEffect(() => {
        setProgress(30);
        const timer1 = setTimeout(() => setProgress(60), 100);
        const timer2 = setTimeout(() => setProgress(80), 300);
        const timer3 = setTimeout(() => setProgress(100), 500);

        return () => {
            clearTimeout(timer1);
            clearTimeout(timer2);
            clearTimeout(timer3);
        };
    }, [pathname]);

    useEffect(() => {
        if (progress === 100) {
            const timer = setTimeout(() => setProgress(0), 200); // Hide after completion
            return () => clearTimeout(timer);
        }
    }, [progress]);

    if (progress === 0) return null;

    return (
        <div className="fixed top-0 left-0 right-0 z-[100] h-1 bg-transparent">
            <div
                className="h-full bg-school-secondary shadow-[0_0_10px_#4b9560] transition-all duration-200 ease-out"
                style={{ width: `${progress}%` }}
            />
        </div>
    );
};
