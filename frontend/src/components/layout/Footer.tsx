import { Link } from 'react-router-dom';
import { LuInstagram, LuFacebook, LuMail, LuPhone, LuMapPin } from "react-icons/lu";
import { useSiteSettings } from '@/contexts/SiteSettingsContext';
import { useLanguage } from '@/contexts/LanguageContext';

const Footer = () => {
  const { settings } = useSiteSettings();
  const { t } = useLanguage();
  const { schoolInfo, contact, footer } = settings;

  const year = new Date().getFullYear();
  const copyright = footer.copyright || `© ${year} ${schoolInfo.name}. All rights reserved.`;

  return (
    <footer className="bg-[#1B263B] text-white">
      <div className="container py-8 px-4 md:px-0">
        <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 md:grid-cols-4">

          {/* School Identity */}
          <div className="text-center sm:text-left">
            <Link to="/" className="mb-4 inline-block md:pl-2">
              <img
                src={schoolInfo.logoUrl || "./logo.png"}
                alt="School Logo"
                className="h-10 md:h-12"
              />
            </Link>
            <h3 className="mb-2 text-lg font-bold md:pl-2">{schoolInfo.name}</h3>
            <p className="mb-3 text-sm md:pl-2">{footer.tagline || schoolInfo.tagline}</p>
            <div className="flex items-center justify-center sm:justify-start space-x-4">
              <a href={footer.facebook || 'https://facebook.com'}
                className="text-white hover:text-school-accent transition-colors" aria-label="Facebook">
                <LuFacebook size={24} />
              </a>
              <a href={footer.instagram || 'https://instagram.com'}
                className="text-white hover:text-school-accent transition-colors" aria-label="Instagram">
                <LuInstagram size={24} />
              </a>
              <a href={`mailto:${contact.email}`}
                className="text-white hover:text-school-accent transition-colors" aria-label="Email">
                <LuMail size={24} />
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div className="text-center sm:text-left">
            <h3 className="mb-4 text-lg font-bold">{t('footer.quickLinks')}</h3>
            <ul className="space-y-2 text-sm">
              <li><Link to="/about" className="hover:text-school-accent transition-colors">{t('nav.sub.about') || 'About Us'}</Link></li>
              <li><Link to="/admissions" className="hover:text-school-accent transition-colors">{t('nav.sub.admissions') || 'Admissions'}</Link></li>
              <li><Link to="/academics" className="hover:text-school-accent transition-colors">{t('nav.academics')}</Link></li>
              <li><Link to="/events" className="hover:text-school-accent transition-colors">{t('nav.sub.events')}</Link></li>
              <li><Link to="/portal" className="hover:text-school-accent transition-colors">{t('btn.studentPortal')}</Link></li>
            </ul>
          </div>

          {/* Contact */}
          <div className="text-center sm:text-left">
            <h3 className="mb-4 text-lg font-bold">{t('contact.title')}</h3>
            <ul className="space-y-2 text-sm">
              <li className="flex items-center justify-center sm:justify-start">
                <LuPhone size={16} className="mr-2 flex-shrink-0" />
                <span>{contact.phone}</span>
              </li>
              {contact.phoneAlt && (
                <li className="flex items-center justify-center sm:justify-start">
                  <LuPhone size={16} className="mr-2 flex-shrink-0 opacity-50" />
                  <span>{contact.phoneAlt}</span>
                </li>
              )}
              <li className="flex items-center justify-center sm:justify-start">
                <LuMail size={16} className="mr-2 flex-shrink-0" />
                <span>{contact.email}</span>
              </li>
              <li className="flex items-start justify-center sm:justify-start">
                <LuMapPin size={16} className="mr-2 mt-1 flex-shrink-0" />
                <span>{contact.address}</span>
              </li>
            </ul>
          </div>

          {/* Office Hours */}
          <div className="text-center sm:text-left">
            <h3 className="mb-4 text-lg font-bold">{t('contact.officeHours')}</h3>
            <ul className="space-y-1 text-sm">
              {contact.officeHours.split('\n').map((line, i) => (
                <li key={i}>{line}</li>
              ))}
            </ul>
          </div>
        </div>

        <div className="mt-8 border-t border-gray-700 pt-6 text-center text-xs">
          <p>{copyright}</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
