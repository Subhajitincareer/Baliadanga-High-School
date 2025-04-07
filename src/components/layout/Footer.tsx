
import React from 'react';
import { Link } from 'react-router-dom';
import { Facebook, Instagram, Mail, MapPin, Phone } from 'lucide-react';

const Footer = () => {
  return (
    <footer className="bg-school-dark text-white">
      <div className="container py-12">
        <div className="grid grid-cols-1 gap-8 md:grid-cols-4">
          <div>
            <h3 className="mb-4 text-lg font-bold">Baliadanga High School</h3>
            <p className="mb-2 text-sm">Educating and inspiring since 1965</p>
            <div className="flex items-center space-x-4">
              <a href="https://facebook.com" className="text-white hover:text-school-accent" aria-label="Facebook">
                <Facebook size={20} />
              </a>
              <a href="https://instagram.com" className="text-white hover:text-school-accent" aria-label="Instagram">
                <Instagram size={20} />
              </a>
              <a href="mailto:info@baliadangahs.edu" className="text-white hover:text-school-accent" aria-label="Email">
                <Mail size={20} />
              </a>
            </div>
          </div>
          <div>
            <h3 className="mb-4 text-lg font-bold">Quick Links</h3>
            <ul className="space-y-2 text-sm">
              <li><Link to="/about" className="hover:text-school-accent">About Us</Link></li>
              <li><Link to="/admissions" className="hover:text-school-accent">Admissions</Link></li>
              <li><Link to="/academics" className="hover:text-school-accent">Academics</Link></li>
              <li><Link to="/events" className="hover:text-school-accent">Events</Link></li>
              <li><Link to="/portal" className="hover:text-school-accent">Student Portal</Link></li>
            </ul>
          </div>
          <div>
            <h3 className="mb-4 text-lg font-bold">Contact Us</h3>
            <ul className="space-y-2 text-sm">
              <li className="flex items-center">
                <Phone size={16} className="mr-2" />
                <span>+91 9876543210</span>
              </li>
              <li className="flex items-center">
                <Mail size={16} className="mr-2" />
                <span>info@baliadangahs.edu</span>
              </li>
              <li className="flex items-start">
                <MapPin size={16} className="mr-2 mt-1" />
                <span>123 Education Road, Baliadanga, West Bengal, India</span>
              </li>
            </ul>
          </div>
          <div>
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
          <p>&copy; {new Date().getFullYear()} Baliadanga High School. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
