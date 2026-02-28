
import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger,
} from "@/components/ui/navigation-menu";
import { Sheet, SheetContent, SheetTrigger, SheetHeader, SheetTitle, SheetDescription } from '@/components/ui/sheet';
import { cn } from "@/lib/utils";
import { Menu, X } from 'lucide-react';
import { LanguageToggle } from '@/components/common/LanguageToggle';
import { useLanguage } from '@/contexts/LanguageContext';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { useSiteSettings } from '@/contexts/SiteSettingsContext';

// Moved inside Navbar to use translations

const ListItem = React.forwardRef<
  HTMLAnchorElement,
  React.ComponentPropsWithoutRef<"a"> & { title: string; href?: string }
>(({ className, title, children, href, ...props }, ref) => {
  return (
    <li>
      <NavigationMenuLink asChild>
        <Link
          ref={ref as any}
          to={href || ""}
          className={cn(
            "block select-none space-y-1 rounded-md p-3 leading-none no-underline outline-none transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground",
            className
          )}
          {...props}
        >
          <div className="text-sm font-medium leading-none">{title}</div>
          <p className="line-clamp-2 text-sm leading-snug text-muted-foreground">
            {children}
          </p>
        </Link>
      </NavigationMenuLink>
    </li>
  );
});
ListItem.displayName = "ListItem";

const Navbar = () => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const { settings } = useSiteSettings();
  const { t } = useLanguage();
  const schoolName = settings.schoolInfo.name;

  const navigationItems = [
    { title: t('nav.home'), href: "/" },
    { title: t('nav.announcements'), href: "/announcements" },
    {
      title: t('nav.academics'),
      submenu: [
        { title: t('nav.sub.courses'), href: "/courses", description: t('nav.sub.courses.desc') },
        { title: t('nav.sub.calendar'), href: "/academic-calendar", description: t('nav.sub.calendar.desc') },
        { title: t('nav.sub.resources'), href: "/resources", description: t('nav.sub.resources.desc') },
        { title: t('nav.sub.routine'), href: "/routine", description: t('nav.sub.routine.desc') }
      ]
    },
    {
      title: t('nav.campus'),
      submenu: [
        { title: t('nav.sub.events'), href: "/events", description: t('nav.sub.events.desc') },
        { title: t('nav.sub.gallery'), href: "/gallery", description: t('nav.sub.gallery.desc') },
        { title: t('nav.sub.staff'), href: "/staff", description: t('nav.sub.staff.desc') }
      ]
    },
    { title: t('nav.contact'), href: "/contact" },
    { title: t('nav.midmeal'), href: "/mid-meal" },
    { title: t('nav.admin'), href: "/admin" }
  ];

  return (
    <nav className="sticky top-0 z-50 bg-white shadow-md">
      <div className="container flex h-16 items-center justify-between px-4">
        <Link to="/" className="flex items-center space-x-2 overflow-hidden">
          <span className="text-lg md:text-xl font-bold text-school-primary truncate">{schoolName}</span>
        </Link>

        {/* Desktop Navigation */}
        <div className="hidden md:flex items-center gap-4">
          <NavigationMenu>
            <NavigationMenuList>
              {navigationItems.map((item) =>
                item.submenu ? (
                  <NavigationMenuItem key={item.title}>
                    <NavigationMenuTrigger className="px-4 py-2 text-sm font-medium text-gray-700 hover:text-school-primary">
                      {item.title}
                    </NavigationMenuTrigger>
                    <NavigationMenuContent>
                      <ul className="grid w-[400px] gap-3 p-4 md:w-[500px] md:grid-cols-2">
                        {item.submenu.map((subItem) => (
                          <ListItem
                            key={subItem.href}
                            title={subItem.title}
                            href={subItem.href}
                          >
                            {subItem.description}
                          </ListItem>
                        ))}
                      </ul>
                    </NavigationMenuContent>
                  </NavigationMenuItem>
                ) : (
                  <NavigationMenuItem key={item.href}>
                    <NavigationMenuLink asChild>
                      <Link
                        to={item.href}
                        className="block px-4 py-2 text-sm font-medium text-gray-700 hover:text-school-primary"
                      >
                        {item.title}
                      </Link>
                    </NavigationMenuLink>
                  </NavigationMenuItem>
                )
              )}
            </NavigationMenuList>
          </NavigationMenu>
          <div className="flex items-center gap-2">
            <LanguageToggle />
            <Link to="/portal">
              <Button className="bg-school-primary hover:bg-school-dark">
                {t('btn.studentPortal')}
              </Button>
            </Link>
          </div>
        </div>

        {/* Mobile Menu using Sheet */}
        <div className="md:hidden flex items-center gap-2">
          <LanguageToggle />
          <Sheet open={isMobileMenuOpen} onOpenChange={setIsMobileMenuOpen}>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon">
                <Menu size={24} />
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="w-[300px] sm:w-[400px] overflow-y-auto">
              <SheetHeader className="text-left mb-6">
                <SheetTitle>
                  <Link to="/" onClick={() => setIsMobileMenuOpen(false)} className="flex items-center gap-2">
                     <span className="text-xl font-bold text-school-primary">{schoolName}</span>
                  </Link>
                </SheetTitle>
                <SheetDescription>
                  Navigate through our school portal
                </SheetDescription>
              </SheetHeader>
              <div className="flex flex-col gap-6">

                <div className="flex flex-col space-y-4">
                  <Accordion type="single" collapsible className="w-full">
                    {navigationItems.map((item, index) => (
                      <div key={item.title} className="w-full">
                        {item.submenu ? (
                          <AccordionItem value={`item-${index}`} className="border-b-0">
                            <AccordionTrigger className="py-2 text-lg font-medium text-gray-900 hover:no-underline">
                              {item.title}
                            </AccordionTrigger>
                            <AccordionContent className="pb-4">
                              <div className="pl-4 border-l-2 border-slate-100 flex flex-col space-y-3 mt-2">
                                {item.submenu.map((sub) => (
                                  <Link
                                    key={sub.title}
                                    to={sub.href}
                                    onClick={() => setIsMobileMenuOpen(false)}
                                    className="text-gray-600 hover:text-school-primary text-base py-1"
                                  >
                                    {sub.title}
                                  </Link>
                                ))}
                              </div>
                            </AccordionContent>
                          </AccordionItem>
                        ) : (
                          <div className="py-2">
                            <Link
                              to={item.href}
                              onClick={() => setIsMobileMenuOpen(false)}
                              className="text-lg font-medium text-gray-900 block w-full py-2 hover:text-school-primary"
                            >
                              {item.title}
                            </Link>
                          </div>
                        )}
                      </div>
                    ))}
                  </Accordion>
                </div>

                <div className="flex flex-col gap-3 mt-4">
                  <Link to="/portal" onClick={() => setIsMobileMenuOpen(false)}>
                    <Button className="w-full bg-school-primary hover:bg-school-dark">{t('btn.studentPortal')}</Button>
                  </Link>
                  <Link to="/admin" onClick={() => setIsMobileMenuOpen(false)}>
                    <Button className="w-full" variant="secondary">{t('btn.adminPortal')}</Button>
                  </Link>
                </div>
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;

