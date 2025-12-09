import React from 'react';
import { Button } from "@/components/ui/button";
import { Printer } from 'lucide-react';

const PrintableAdmissionForm = () => {

    const handlePrint = () => {
        window.print();
    };

    return (
        <div className="min-h-screen bg-gray-100 p-8 print:p-0 print:bg-white">
            {/* Control Bar - Hidden when printing */}
            <div className="max-w-4xl mx-auto mb-6 flex justify-between items-center print:hidden">
                <h1 className="text-2xl font-bold">Admission Form Preview</h1>
                <Button onClick={handlePrint} className="flex gap-2">
                    <Printer className="h-4 w-4" /> Print Form
                </Button>
            </div>

            {/* A4 Form Container */}
            <div className="max-w-[210mm] mx-auto bg-white p-[20mm] shadow-lg print:shadow-none print:w-full print:max-w-none print:p-0">

                {/* Header */}
                <div className="border-b-2 border-black pb-4 mb-6">
                    <div className="flex justify-between items-start">
                        {/* Logo/Info Section (Centered relative to page, but flex makes it hard to center perfectly while having right item. 
                           Better approach: Use grid or absolute but relative to the CONTAINER, not page. 
                           Let's use relative on parent and absolute on child BUT ensure parent is robust. 
                           OR: 3 cols grid. Left (empty), Center (Info), Right (Photo).
                           Let's use Grid.
                        */}
                        <div className="w-1/4"></div> {/* Spacer */}
                        <div className="w-2/4 text-center">
                            <h1 className="text-3xl font-black uppercase mb-1">Baliadanga High School</h1>
                            <p className="text-sm font-semibold">Established: 1950 | Govt. Aided Co-Educational Institution</p>
                            <p className="text-xs">Kaliachak, Malda, West Bengal - 732201</p>
                        </div>
                        <div className="w-1/4 flex justify-end">
                            <div className="border-2 border-black w-32 h-40 flex items-center justify-center text-xs text-gray-400 text-center p-2">
                                Please Paste Passport Size Photo
                            </div>
                        </div>
                    </div>
                    <div className="text-center mt-4">
                        <h2 className="text-xl font-bold bg-gray-800 text-white inline-block px-6 py-1 rounded-full print:text-black print:border-2 print:border-black print:bg-white">
                            ADMISSION FORM
                        </h2>
                    </div>
                </div>

                {/* Session Info */}
                <div className="flex justify-between mb-6 font-semibold">
                    <div>Session: 2025 - 2026</div>
                    <div>Form No: ______________</div>
                </div>

                {/* Form Fields - Grid Layout */}
                <div className="space-y-4 text-sm">

                    {/* Section 1: Student Details */}
                    <div className="mb-6">
                        <h3 className="font-bold border-b border-gray-400 mb-2 uppercase">1. Student Details</h3>
                        <div className="grid grid-cols-2 gap-4">
                            <div className="col-span-2">
                                <label className="block text-xs font-bold uppercase">Full Name (In Block Letters):</label>
                                <div className="border-b border-dotted border-black h-6 mt-1"></div>
                            </div>
                            <div>
                                <label className="block text-xs font-bold uppercase">Date of Birth:</label>
                                <div className="border-b border-dotted border-black h-6 mt-1"></div>
                            </div>
                            <div>
                                <label className="block text-xs font-bold uppercase">Gender:</label>
                                <div className="flex gap-4 mt-2">
                                    <span>[ ] Male</span>
                                    <span>[ ] Female</span>
                                    <span>[ ] Other</span>
                                </div>
                            </div>
                            <div>
                                <label className="block text-xs font-bold uppercase">Religion:</label>
                                <div className="border-b border-dotted border-black h-6 mt-1"></div>
                            </div>
                            <div>
                                <label className="block text-xs font-bold uppercase">Caste (Gen/SC/ST/OBC):</label>
                                <div className="border-b border-dotted border-black h-6 mt-1"></div>
                            </div>
                            <div className="col-span-2">
                                <label className="block text-xs font-bold uppercase">Aadhar Number:</label>
                                <div className="border-b border-dotted border-black h-6 mt-1"></div>
                            </div>
                        </div>
                    </div>

                    {/* Section 2: Contact Details */}
                    <div className="mb-6">
                        <h3 className="font-bold border-b border-gray-400 mb-2 uppercase">2. Contact Details</h3>
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-xs font-bold uppercase">Father's Name:</label>
                                <div className="border-b border-dotted border-black h-6 mt-1"></div>
                            </div>
                            <div>
                                <label className="block text-xs font-bold uppercase">Mother's Name:</label>
                                <div className="border-b border-dotted border-black h-6 mt-1"></div>
                            </div>
                            <div>
                                <label className="block text-xs font-bold uppercase">Guardian's Name:</label>
                                <div className="border-b border-dotted border-black h-6 mt-1"></div>
                            </div>
                            <div>
                                <label className="block text-xs font-bold uppercase">Relation with Guardian:</label>
                                <div className="border-b border-dotted border-black h-6 mt-1"></div>
                            </div>
                            <div>
                                <label className="block text-xs font-bold uppercase">Mobile Number:</label>
                                <div className="border-b border-dotted border-black h-6 mt-1"></div>
                            </div>
                            <div>
                                <label className="block text-xs font-bold uppercase">Alternate Mobile:</label>
                                <div className="border-b border-dotted border-black h-6 mt-1"></div>
                            </div>
                            <div className="col-span-2">
                                <label className="block text-xs font-bold uppercase">Permanent Address:</label>
                                <div className="border-b border-dotted border-black h-6 mt-1"></div>
                                <div className="border-b border-dotted border-black h-6 mt-4"></div>
                            </div>
                        </div>
                    </div>

                    {/* Section 3: Academic Details */}
                    <div className="mb-6">
                        <h3 className="font-bold border-b border-gray-400 mb-2 uppercase">3. Admission Sought For</h3>
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-xs font-bold uppercase">Class to be Admitted:</label>
                                <div className="border-b border-dotted border-black h-6 mt-1"></div>
                            </div>
                            <div>
                                <label className="block text-xs font-bold uppercase">Previous School Name:</label>
                                <div className="border-b border-dotted border-black h-6 mt-1"></div>
                            </div>
                        </div>
                    </div>

                    {/* Declaration */}
                    <div className="mt-12 text-xs">
                        <h3 className="font-bold uppercase mb-2">Declaration:</h3>
                        <p className="text-justify mb-4">
                            I hereby declare that the information provided above is true and correct to the best of my knowledge. I agree to abide by the rules and regulations of the school.
                        </p>
                    </div>

                    {/* Signatures */}
                    <div className="flex justify-between mt-20 text-center">
                        <div>
                            <div className="border-t border-black w-40"></div>
                            <p className="text-xs font-bold mt-1">Signature of Guardian</p>
                        </div>
                        <div>
                            <div className="border-t border-black w-40"></div>
                            <p className="text-xs font-bold mt-1">Signature of Student</p>
                        </div>
                        <div>
                            <div className="border-t border-black w-40"></div>
                            <p className="text-xs font-bold mt-1">Signature of Authority</p>
                        </div>
                    </div>

                    {/* Office Use Only */}
                    <div className="mt-12 border-2 border-black p-4">
                        <h3 className="font-bold uppercase mb-2 underline">For Office Use Only</h3>
                        <div className="grid grid-cols-3 gap-4 text-xs font-semibold">
                            <div>Date of Admission: ____________</div>
                            <div>Allocated Section: ____________</div>
                            <div>Roll Number: ____________</div>
                        </div>
                    </div>

                </div>
            </div>

            <style type="text/css" media="print">
                {`
                    @page { size: auto; margin: 0mm; }
                    body { margin: 0px; background-color: white; }
                `}
            </style>
        </div>
    );
};

export default PrintableAdmissionForm;
