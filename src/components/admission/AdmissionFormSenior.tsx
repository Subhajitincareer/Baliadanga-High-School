
import React, { useState } from 'react';
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Loader2, Upload, X } from "lucide-react";

// Schema for Class 6-8 admission form
const seniorFormSchema = z.object({
  student_name: z.string().min(2, { message: "Student name is required" }),
  gender: z.string().min(1, { message: "Gender is required" }),
  date_of_birth: z.string().min(1, { message: "Date of birth is required" }),
  father_name: z.string().min(2, { message: "Father's name is required" }),
  mother_name: z.string().min(2, { message: "Mother's name is required" }),
  guardian_phone: z.string().min(10, { message: "Valid phone number is required" }),
  guardian_email: z.string().email({ message: "Valid email is required" }).optional().or(z.literal('')),
  address: z.string().min(5, { message: "Address is required" }),
  previous_school: z.string().min(2, { message: "Previous school name is required" }),
  previous_class: z.string().min(1, { message: "Previous class is required" }),
  previous_marks: z.string().min(1, { message: "Previous exam marks are required" }),
  // documents will be handled separately
});

type SeniorFormValues = z.infer<typeof seniorFormSchema>;

interface AdmissionFormSeniorProps {
  onSubmit: (data: any) => void;
  isSubmitting: boolean;
}

const AdmissionFormSenior: React.FC<AdmissionFormSeniorProps> = ({ onSubmit, isSubmitting }) => {
  const [documents, setDocuments] = useState<File[]>([]);
  
  const form = useForm<SeniorFormValues>({
    resolver: zodResolver(seniorFormSchema),
    defaultValues: {
      student_name: "",
      gender: "",
      date_of_birth: "",
      father_name: "",
      mother_name: "",
      guardian_phone: "",
      guardian_email: "",
      address: "",
      previous_school: "",
      previous_class: "",
      previous_marks: "",
    }
  });

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files) {
      const newFiles = Array.from(event.target.files);
      setDocuments(prev => [...prev, ...newFiles]);
    }
  };

  const removeFile = (index: number) => {
    setDocuments(prev => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = (data: SeniorFormValues) => {
    // Combine form data with files
    onSubmit({
      ...data,
      documents: documents
    });
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
        <div className="space-y-4">
          <h2 className="text-xl font-semibold border-b pb-2">Student Information</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormField
              control={form.control}
              name="student_name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Student Name</FormLabel>
                  <FormControl>
                    <Input placeholder="Enter full name" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="gender"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Gender</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select gender" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="male">Male</SelectItem>
                      <SelectItem value="female">Female</SelectItem>
                      <SelectItem value="other">Other</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="date_of_birth"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Date of Birth</FormLabel>
                  <FormControl>
                    <Input type="date" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
        </div>
        
        <div className="space-y-4">
          <h2 className="text-xl font-semibold border-b pb-2">Parent/Guardian Information</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormField
              control={form.control}
              name="father_name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Father's Name</FormLabel>
                  <FormControl>
                    <Input placeholder="Enter father's name" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="mother_name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Mother's Name</FormLabel>
                  <FormControl>
                    <Input placeholder="Enter mother's name" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="guardian_phone"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Contact Number</FormLabel>
                  <FormControl>
                    <Input placeholder="Enter phone number" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="guardian_email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Email Address (Optional)</FormLabel>
                  <FormControl>
                    <Input placeholder="Enter email address" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
          
          <FormField
            control={form.control}
            name="address"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Full Address</FormLabel>
                <FormControl>
                  <Textarea placeholder="Enter complete address" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
        
        <div className="space-y-4">
          <h2 className="text-xl font-semibold border-b pb-2">Previous Education</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormField
              control={form.control}
              name="previous_school"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Previous School Name</FormLabel>
                  <FormControl>
                    <Input placeholder="Enter school name" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="previous_class"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Previous Class</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select class" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="5">Class 5</SelectItem>
                      <SelectItem value="6">Class 6</SelectItem>
                      <SelectItem value="7">Class 7</SelectItem>
                      <SelectItem value="other">Other</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="previous_marks"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Previous Final Exam Marks (%)</FormLabel>
                  <FormControl>
                    <Input type="number" min="0" max="100" placeholder="Enter marks percentage" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
        </div>
        
        <div className="space-y-4">
          <h2 className="text-xl font-semibold border-b pb-2">Required Documents</h2>
          <p className="text-sm text-muted-foreground">
            Please upload necessary documents (Mark sheets, Transfer Certificate, etc.)
          </p>
          
          <div className="grid gap-4">
            <div className="flex items-center gap-4">
              <label 
                htmlFor="documents" 
                className="flex items-center gap-2 px-4 py-2 border rounded-md cursor-pointer hover:bg-secondary"
              >
                <Upload className="h-4 w-4" />
                <span>Upload Files</span>
              </label>
              <input 
                id="documents" 
                type="file" 
                onChange={handleFileChange} 
                className="hidden" 
                multiple 
                accept=".pdf,.jpg,.jpeg,.png"
              />
            </div>
            
            <div className="space-y-2">
              {documents.map((file, index) => (
                <div 
                  key={index} 
                  className="flex items-center justify-between p-2 border rounded-md"
                >
                  <span className="text-sm truncate max-w-[80%]">{file.name}</span>
                  <Button 
                    type="button" 
                    variant="ghost" 
                    size="sm"
                    onClick={() => removeFile(index)}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              ))}
            </div>
          </div>
        </div>
        
        <div className="flex justify-end">
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Submit Application
          </Button>
        </div>
      </form>
    </Form>
  );
};

export default AdmissionFormSenior;
