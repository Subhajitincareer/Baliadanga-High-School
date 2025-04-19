import { Link } from 'react-router-dom';
import { LuInstagram,LuFacebook,LuMail, LuPhone,LuMapPin} from "react-icons/lu";
const Footer = () => {
  return (
    <footer className="bg-[#1B263B] text-white">
      <div className="container py-8 px-4 md:px-0">
        <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 md:grid-cols-4">
          <div className="text-center sm:text-left">
            <Link to="/" className="mb-4 inline-block md:pl-2">
              <img src="./logo.png" alt="School Logo" className="h-10 md:h-12" />
            </Link>
            <h3 className="mb-4 text-lg font-bold md: pl-2">Baliadanga High School</h3>
            <p className="mb-2 text-sm md:pl-2">Educating and inspiring since 1963</p>
            <div className="flex items-center justify-center sm:justify-start space-x-4">
              <a 
                href="https://facebook.com" 
                className="text-white hover:text-school-accent transition-colors" 
                aria-label="Facebook"
              >
                <LuFacebook  size={24}/> {/* Standardized size */}
              </a>
              <a 
                href="https://instagram.com" 
                className="text-white hover:text-school-accent transition-colors" 
                aria-label="Instagram"
              >
                <LuInstagram size={24} /> {/* Standardized size */}
              </a>
              <a 
                href="mailto:info@baliadangahs.edu" 
                className="text-white hover:text-school-accent transition-colors" 
                aria-label="Email"
              >
                <LuMail size={24} /> {/* Standardized size */}
              </a>
            </div>
          </div>
          <div className="text-center sm:text-left">
            <h3 className="mb-4 text-lg font-bold">Quick Links</h3>
            <ul className="space-y-2 text-sm">
              <li><Link to="/about" className="hover:text-school-accent transition-colors">About Us</Link></li>
              <li><Link to="/admissions" className="hover:text-school-accent transition-colors">Admissions</Link></li>
              <li><Link to="/academics" className="hover:text-school-accent transition-colors">Academics</Link></li>
              <li><Link to="/events" className="hover:text-school-accent transition-colors">Events</Link></li>
              <li><Link to="/portal" className="hover:text-school-accent transition-colors">Student Portal</Link></li>
            </ul>
          </div>
          <div className="text-center sm:text-left">
            <h3 className="mb-4 text-lg font-bold">Contact Us</h3>
            <ul className="space-y-2 text-sm">
              <li className="flex items-center justify-center sm:justify-start">
                <LuPhone size={16} className="mr-2 flex-shrink-0" />
                <span>+91 9876543210</span>
              </li>
              <li className="flex items-center justify-center sm:justify-start">
                <LuMail size={16} className="mr-2 flex-shrink-0" />
                <span>info@baliadangahs.edu</span>
              </li>
              <li className="flex items-start justify-center sm:justify-start">
                <LuMapPin size={16} className="mr-2 mt-1 flex-shrink-0" />
                <span>123 Education Road, Baliadanga, West Bengal, India</span>
              </li>
            </ul>
          </div>
          <div className="text-center sm:text-left">
            <h3 className="mb-4 text-lg font-bold">School Hours</h3>
            <ul className="space-y-2 text-sm">
              <li>Monday - Friday: 8:00 AM - 3:30 PM</li>
              <li>Saturday: 8:00 AM - 12:30 PM</li>
              <li>Office Hours: 9:00 AM - 4:00 PM</li>
              <li>Library Hours: 8:30 AM - 4:00 PM</li>
            </ul>
          </div>
        </div>
        <div className="mt-8 border-t border-gray-700 pt-6 text-center text-xs">
          <p >&copy; {new Date().getFullYear()} Baliadanga High School. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
