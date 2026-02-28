import React, { useState } from "react";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { Mail, MapPin, Phone, Clock, ExternalLink } from "lucide-react";
import emailjs from '@emailjs/browser';
import { ContactFAQ } from "@/components/contact/ContactFAQ";
import { useSiteSettings } from "@/contexts/SiteSettingsContext";
import { useLanguage } from '@/contexts/LanguageContext';

const Contact = () => {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [subject, setSubject] = useState("general");
  const [message, setMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();
  const { settings } = useSiteSettings();
  const { t } = useLanguage();
  const { contact, map, schoolInfo } = settings;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      await emailjs.send("service_56gj0wi", "template_olbq0sc", {
        from_name: name,
        reply_to: email,
        subject: subject,
        message: message,
      }, "YjG2ML82G4rMz-3F7");
      toast({ title: "Message sent", description: "We'll get back to you soon." });
      setName(""); setEmail(""); setSubject("general"); setMessage("");
    } catch (error) {
      toast({ title: "Error", description: "Failed to send message." });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="container py-8">
      <div className="mb-8">
        <h1 className="font-heading mb-2 text-3xl font-bold text-school-primary">{t('contact.title')}</h1>
        <p className="text-lg text-muted-foreground">{t('contact.subtitle')}</p>
      </div>

      <div className="grid gap-8 md:grid-cols-3">
        {/* Left contact cards */}
        <div className="md:col-span-1">
          <div className="space-y-6">
            {/* Address */}
            <a href={map.directionsUrl || '#'} target="_blank" rel="noreferrer">
              <Card className="hover:shadow-lg transition-shadow cursor-pointer border-l-4 border-l-school-primary">
                <CardContent className="pt-6">
                  <div className="flex items-start space-x-3">
                    <MapPin className="h-5 w-5 text-school-primary mt-1" />
                    <div>
                      <h3 className="font-bold text-lg mb-1">Visit Us</h3>
                      <address className="not-italic text-sm text-gray-600 leading-relaxed whitespace-pre-line">
                        {contact.address}
                      </address>
                      <p className="text-xs text-school-primary mt-2 font-semibold">Get Directions →</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </a>

            {/* Phone */}
            <a href={`tel:${contact.phone.replace(/\s/g,'')}`}>
              <Card className="hover:shadow-lg transition-shadow cursor-pointer border-l-4 border-l-school-secondary">
                <CardContent className="pt-6">
                  <div className="flex items-start space-x-3">
                    <Phone className="h-5 w-5 text-school-secondary mt-1" />
                    <div>
                      <h3 className="font-bold text-lg mb-1">Call Us</h3>
                      <p className="text-sm text-gray-600">
                        Main Office: <span className="font-semibold text-gray-900">{contact.phone}</span>
                        {contact.phoneAlt && <><br />Admissions: {contact.phoneAlt}</>}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </a>

            {/* Email */}
            <Card className="hover:shadow-lg transition-shadow border-l-4 border-l-school-accent">
              <CardContent className="pt-6">
                <div className="flex items-start space-x-3">
                  <Mail className="h-5 w-5 text-school-accent mt-1" />
                  <div>
                    <h3 className="font-bold text-lg mb-1">Email Us</h3>
                    <div className="text-sm text-gray-600 flex flex-col gap-1">
                      <a href={`mailto:${contact.email}`} className="hover:text-school-primary hover:underline">{contact.email}</a>
                      {contact.emailAlt && (
                        <a href={`mailto:${contact.emailAlt}`} className="hover:text-school-primary hover:underline">{contact.emailAlt}</a>
                      )}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Hours */}
            <Card className="border-l-4 border-l-gray-400">
              <CardContent className="pt-6">
                <div className="flex items-start space-x-3">
                  <Clock className="h-5 w-5 text-gray-500 mt-1" />
                  <div>
                    <h3 className="font-bold text-lg mb-1">Office Hours</h3>
                    <p className="text-sm text-gray-600 whitespace-pre-line">{contact.officeHours}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Right: contact form + map */}
        <div className="md:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle>Send us a Message</CardTitle>
              <CardDescription>Fill out the form below and we'll get back to you as soon as possible.</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="name">{t('contact.form.name')}</Label>
                    <Input id="name" placeholder="Enter your name" value={name} onChange={(e) => setName(e.target.value)} required />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="email">{t('contact.form.email')}</Label>
                    <Input id="email" type="email" placeholder="Enter your email" value={email} onChange={(e) => setEmail(e.target.value)} required />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="subject">{t('contact.form.subject')}</Label>
                  <Select value={subject} onValueChange={setSubject}>
                    <SelectTrigger><SelectValue placeholder="Select subject" /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="general">General Inquiry</SelectItem>
                      <SelectItem value="admission">Admission Information</SelectItem>
                      <SelectItem value="facilities">Facilities</SelectItem>
                      <SelectItem value="academics">Academics</SelectItem>
                      <SelectItem value="other">Other</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="message">{t('contact.form.message')}</Label>
                  <Textarea id="message" placeholder="Type your message here" rows={6} value={message} onChange={(e) => setMessage(e.target.value)} required />
                </div>
                <Button type="submit" className="w-full bg-school-primary hover:bg-school-dark" disabled={isSubmitting}>
                  {isSubmitting ? "..." : t('contact.form.submit')}
                </Button>
              </form>
            </CardContent>
          </Card>

          {/* Map */}
          <div className="mt-8">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <MapPin className="mr-2 h-5 w-5" /> Our Location
                </CardTitle>
              </CardHeader>
              <CardContent className="p-0">
                <div className="aspect-video w-full rounded-md overflow-hidden">
                  {map.embedUrl ? (
                    <iframe
                      src={map.embedUrl}
                      width="100%" height="100%"
                      style={{ border: 0 }}
                      loading="lazy"
                      title="School Location"
                      className="aspect-video"
                    />
                  ) : (
                    <div className="flex items-center justify-center h-full bg-slate-100 text-muted-foreground text-sm">
                      Map not configured. Set the Google Maps embed URL in Admin → Site Settings → Map.
                    </div>
                  )}
                </div>
              </CardContent>
              <CardFooter>
                <a href={map.directionsUrl || '#'} target="_blank" rel="noopener noreferrer"
                  className="flex items-center text-sm text-school-primary hover:underline">
                  View larger map <ExternalLink className="ml-1 h-3 w-3" />
                </a>
              </CardFooter>
            </Card>
          </div>
        </div>
      </div>

      <ContactFAQ />
    </div>
  );
};

export default Contact;
