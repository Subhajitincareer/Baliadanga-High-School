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
import { cn } from "@/lib/utils";
import { Menu, X } from 'lucide-react';
import { useIsMobile } from '@/hooks/use-mobile';

const navigationItems = [
  {
    title: "Home",
    href: "/"
  },
  {
    title: "Announcements",
    href: "/announcements"
  },
  {
    title: "Academics",
    submenu: [
      {
        title: "Courses",
        href: "/#/courses",
        description: "Explore our comprehensive academic curriculum"
      },
      {
        title: "Academic Calendar",
        href: "/#/academic-calendar",
        description: "View important academic dates and events"
      },
      {
        title: "Resources",
        href: "/#/resources",
        description: "Access learning materials and educational resources"
      }
    ]
  },
  {
    title: "Campus Life",
    submenu: [
      {
        title: "Events",
        href: "/#/events",
        description: "Stay updated with school events and activities"
      },
      {
        title: "Gallery",
        href: "/#/gallery",
        description: "Browse photos of our school and events"
      },
      {
        title: "Staff",
        href: "/#/staff",
        description: "Meet our dedicated teachers and staff members"
      }
    ]
  },
  {
    title: "Contact",
    href: "/contact"
  },
  {
    title: "Admin",
    href: "/admin"
  }
];

const ListItem = React.forwardRef<
  HTMLAnchorElement,
  React.ComponentPropsWithoutRef<"a"> & { title: string }
>(({ className, title, children, ...props }, ref) => {
  return (
    <li>
      <NavigationMenuLink asChild>
        <a
          ref={ref}
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
        </a>
      </NavigationMenuLink>
    </li>
  );
});
ListItem.displayName = "ListItem";

const Navbar = () => {
  const isMobile = useIsMobile();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  if (isMobile) {
    return (
      <nav className="sticky top-0 z-50 bg-white shadow-md">
        <div className="container flex h-16 items-center justify-between px-4">
          <Link to="/" className="flex items-center space-x-2">
            <span className="text-xl font-bold text-school-primary">Baliadanga High School</span>
          </Link>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          >
            {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </Button>
          {isMobileMenuOpen && (
            <div className="absolute left-0 right-0 top-16 z-50 animate-fade-in bg-white p-4 shadow-md">
              <div className="flex flex-col space-y-2">
                {navigationItems.map((item) =>
                  item.submenu ? (
                    <div key={item.title} className="space-y-1">
                      <div className="px-4 py-2 font-medium text-gray-900">{item.title}</div>
                      <div className="ml-4 border-l border-gray-200 pl-2">
                        {item.submenu.map((subItem) => (
                          <Link
                            key={subItem.href}
                            to={subItem.href}
                            className="block rounded-md px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100"
                            onClick={() => setIsMobileMenuOpen(false)}
                          >
                            {subItem.title}
                          </Link>
                        ))}
                      </div>
                    </div>
                  ) : (
                    <Link
                      key={item.href}
                      to={item.href}
                      className="rounded-md px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100"
                      onClick={() => setIsMobileMenuOpen(false)}
                    >
                      {item.title}
                    </Link>
                  )
                )}
                <Link to="/admin" className="mt-2">
                  <Button className="w-full bg-school-primary hover:bg-school-dark">
                    Admin Portal
                  </Button>
                </Link>

                <Link to="/portal" className="mt-2">
                  <Button className="w-full bg-school-primary hover:bg-school-dark">
                    Student Portal
                  </Button>
                </Link>
              </div>
            </div>
          )}
        </div>
      </nav>
    );
  }

  return (
    <nav className="sticky top-0 z-50 bg-white shadow-md">
      <div className="container flex h-16 items-center justify-between">
        <Link to="/" className="flex items-center space-x-2">
          <span className="text-xl font-bold text-school-primary">Baliadanga High School</span>
        </Link>
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
        <Link to="/portal">
          <Button className="bg-school-primary hover:bg-school-dark">
            Student Portal
          </Button>
        </Link>
      </div>
    </nav>
  );
};

export default Navbar;
