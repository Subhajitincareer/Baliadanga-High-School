
import React, { useState } from 'react';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Calendar as CalendarIcon, Clock, MapPin, Search } from 'lucide-react';
import { SearchInput } from '@/components/ui/search-input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

const events = [
  {
    id: 1,
    title: "Annual Science Exhibition",
    date: "2025-05-05",
    time: "9:00 AM - 4:00 PM",
    location: "School Auditorium",
    category: "Academic",
    description: "Showcasing innovative science projects by our students across all grades. Parents and community members are invited to view the exhibits and support our young scientists.",
    image: "https://images.unsplash.com/photo-1532094349884-543bc11b234d?ixlib=rb-4.0.3&auto=format&fit=crop&w=1470&q=80"
  },
  {
    id: 2,
    title: "Inter-School Cricket Tournament",
    date: "2025-05-12",
    time: "10:00 AM - 5:00 PM",
    location: "School Playground",
    category: "Sports",
    description: "Annual cricket tournament featuring top schools from the district. Come cheer for our team as they compete for the district championship!",
    image: "https://images.unsplash.com/photo-1461896836934-ffe607ba8211?ixlib=rb-4.0.3&auto=format&fit=crop&w=1470&q=80"
  },
  {
    id: 3,
    title: "Cultural Program: Unity in Diversity",
    date: "2025-05-25",
    time: "5:00 PM - 8:00 PM",
    location: "School Auditorium",
    category: "Cultural",
    description: "Celebrating India's rich cultural heritage through music, dance and drama performances by our talented students. Parents and community members are cordially invited.",
    image: "https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1470&q=80"
  },
  {
    id: 4,
    title: "Parent-Teacher Meeting",
    date: "2025-04-20",
    time: "10:00 AM - 2:00 PM",
    location: "Respective Classrooms",
    category: "Administrative",
    description: "Quarterly parent-teacher meeting to discuss student progress, academic performance, and address any concerns. Parents are requested to attend without fail.",
    image: "https://images.unsplash.com/photo-1577896851231-70ef18881754?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1470&q=80"
  },
  {
    id: 5,
    title: "Annual Sports Day",
    date: "2025-04-15",
    time: "8:00 AM - 4:00 PM",
    location: "School Playground",
    category: "Sports",
    description: "A day full of athletic competitions, team sports, and physical activities for students of all grades. Parents are welcome to attend and cheer for their children.",
    image: "https://images.unsplash.com/photo-1526676037777-05a232554f77?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1471&q=80"
  },
  {
    id: 6,
    title: "Career Guidance Workshop",
    date: "2025-06-10",
    time: "11:00 AM - 1:00 PM",
    location: "School Conference Hall",
    category: "Academic",
    description: "Special workshop for Class 10 students to provide guidance on career options, further education paths, and skill development. Guest speakers from various professional fields will be present.",
    image: "https://images.unsplash.com/photo-1552664730-d307ca884978?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1470&q=80"
  }
];

const Events = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');

  const filteredEvents = events.filter(event => {
    const matchesSearch = event.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      event.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = categoryFilter === 'all' || event.category === categoryFilter;

    return matchesSearch && matchesCategory;
  });

  return (
    <div className="container py-8">
      <div className="mb-8">
        <h1 className="font-heading mb-2 text-3xl font-bold text-school-primary">Events Calendar</h1>
        <p className="text-lg text-muted-foreground">Stay updated with all the events and important dates at Baliadanga High School</p>
      </div>

      <div className="mb-8 flex flex-col gap-4 md:flex-row">
        <div className="flex-1">
          <SearchInput
            placeholder="Search events..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full"
            icon={Search}
          />
        </div>
        <div className="w-full md:w-64">
          <Select value={categoryFilter} onValueChange={setCategoryFilter}>
            <SelectTrigger>
              <SelectValue placeholder="Filter by category" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Categories</SelectItem>
              <SelectItem value="Academic">Academic</SelectItem>
              <SelectItem value="Sports">Sports</SelectItem>
              <SelectItem value="Cultural">Cultural</SelectItem>
              <SelectItem value="Administrative">Administrative</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
        {filteredEvents.map((event) => (
          <Card key={event.id} className="overflow-hidden transition-all duration-300 hover:shadow-lg">
            <div className="h-48 overflow-hidden">
              <img
                src={event.image}
                alt={event.title}
                className="h-full w-full object-cover transition-transform duration-300 hover:scale-105"
              />
            </div>
            <CardHeader>
              <div className="inline-flex items-center rounded-full bg-school-light px-2.5 py-0.5 text-xs font-semibold text-school-primary">
                {event.category}
              </div>
              <CardTitle className="text-xl">{event.title}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="mb-4 space-y-2 text-sm text-muted-foreground">
                <div className="flex items-center">
                  <CalendarIcon size={16} className="mr-2" />
                  <time dateTime={event.date}>
                    {new Date(event.date).toLocaleDateString('en-US', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric'
                    })}
                  </time>
                </div>
                <div className="flex items-center">
                  <Clock size={16} className="mr-2" />
                  <span>{event.time}</span>
                </div>
                <div className="flex items-center">
                  <MapPin size={16} className="mr-2" />
                  <span>{event.location}</span>
                </div>
              </div>
              <p className="line-clamp-3 text-muted-foreground">{event.description}</p>
            </CardContent>
            <CardFooter>
              <Button variant="ghost" className="text-school-primary hover:bg-school-light hover:text-school-primary">
                View Details
              </Button>
            </CardFooter>
          </Card>
        ))}
      </div>

      {filteredEvents.length === 0 && (
        <div className="mt-8 rounded-lg bg-gray-50 p-8 text-center">
          <p className="text-lg text-gray-600">No events found matching your search criteria.</p>
          <Button
            variant="outline"
            className="mt-4 border-school-primary text-school-primary hover:bg-school-primary hover:text-white"
            onClick={() => { setSearchTerm(''); setCategoryFilter('all'); }}
          >
            Reset Filters
          </Button>
        </div>
      )}
    </div>
  );
};

export default Events;
