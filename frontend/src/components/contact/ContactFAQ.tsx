import React from 'react';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";

export const ContactFAQ = () => {
    return (
        <div className="mt-12">
            <h2 className="text-2xl font-bold text-school-primary mb-6 text-center">Frequently Asked Questions</h2>
            <Accordion type="single" collapsible className="w-full">
                <AccordionItem value="item-1">
                    <AccordionTrigger>What are the office hours for admission inquiries?</AccordionTrigger>
                    <AccordionContent>
                        Our office handles admission inquiries primarily between 10:00 AM and 2:00 PM, Monday to Friday. You can also email admissions@baliadangahs.edu anytime.
                    </AccordionContent>
                </AccordionItem>
                <AccordionItem value="item-2">
                    <AccordionTrigger>How can I get the transfer certificate?</AccordionTrigger>
                    <AccordionContent>
                        To obtain a transfer certificate, you need to submit a written application to the Headmaster signed by your guardian. Processing usually takes 2-3 working days.
                    </AccordionContent>
                </AccordionItem>
                <AccordionItem value="item-3">
                    <AccordionTrigger>Is there a school bus facility?</AccordionTrigger>
                    <AccordionContent>
                        Currently, the school acts as a local community high school and does not operate its own bus fleet. Most students commute via local transport or bicycles.
                    </AccordionContent>
                </AccordionItem>
                <AccordionItem value="item-4">
                    <AccordionTrigger>How can I check my child's attendance?</AccordionTrigger>
                    <AccordionContent>
                        Parents can check attendance through the "Student Portal" using their child's Student ID and password.
                    </AccordionContent>
                </AccordionItem>
            </Accordion>
        </div>
    );
};
