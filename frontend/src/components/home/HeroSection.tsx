import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';
import { HeroCarousel } from './HeroCarousel';
import { motion } from 'framer-motion';
import { useSiteSettings } from '@/contexts/SiteSettingsContext';
import { useLanguage } from '@/contexts/LanguageContext';

const HeroSection = () => {
  const { settings } = useSiteSettings();
  const { t } = useLanguage();
  const name = settings.schoolInfo.name || 'Baliadanga High School';
  const tagline = settings.schoolInfo.tagline || 'Nurturing minds, building character, and inspiring excellence since 1965';
  // Split name for styling: last word gets accent color; rest gets plain white
  const words = name.split(' ');
  const lastWord = words.pop();
  const firstPart = words.join(' ');

  return (
    <div className="relative overflow-hidden min-h-[500px] md:min-h-[600px] flex items-center justify-center text-white">
      {/* Background Carousel */}
      <HeroCarousel />

      {/* Content */}
      <div className="container relative z-10 px-4">
        <div className="mx-auto max-w-4xl text-center">
          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="font-heading mb-6 text-4xl font-extrabold md:text-6xl lg:text-7xl leading-tight tracking-tight drop-shadow-md"
          >
            {t('hero.welcome')} {firstPart && <span>{firstPart} </span>}<span className="text-school-secondary">{lastWord}</span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="mb-10 text-lg md:text-2xl text-gray-100 max-w-2xl mx-auto drop-shadow-sm font-light"
          >
            {tagline}
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
            className="flex flex-col sm:flex-row flex-wrap justify-center gap-4"
          >
            <Link to="/admission" className="w-full sm:w-auto">
              <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                <Button className="w-full sm:w-auto px-8 py-6 text-lg bg-school-secondary hover:bg-green-700 shadow-lg hover:shadow-green-500/20" size="lg">
                  {t('btn.apply')}
                </Button>
              </motion.div>
            </Link>
            <Link to="/announcements" className="w-full sm:w-auto">
              <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                <Button
                  variant="outline"
                  className="w-full sm:w-auto px-8 py-6 text-lg border-2 border-white text-white hover:bg-white hover:text-school-primary backdrop-blur-sm bg-white/10"
                  size="lg"
                >
                  {t('btn.updates')}
                </Button>
              </motion.div>
            </Link>
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default HeroSection;
