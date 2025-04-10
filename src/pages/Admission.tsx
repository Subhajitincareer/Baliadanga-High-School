
import React, { useState } from 'react';
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2, FileText, Upload, GraduationCap } from "lucide-react";
import { useNavigate } from "react-router-dom";
import AdmissionFormJunior from "@/components/admission/AdmissionFormJunior";
import AdmissionFormSenior from "@/components/admission/AdmissionFormSenior";
import AdmissionSuccessDialog from "@/components/admission/AdmissionSuccessDialog";
import { supabase } from "@/integrations/supabase/client";

const classOptions = [
  { value: "5", label: "Class 5" },
  { value: "6", label: "Class 6" },
  { value: "7", label: "Class 7" },
  { value: "8", label: "Class 8" }
];

const Admission = () => {
  const [selectedClass, setSelectedClass] = useState<string>("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [accessCode, setAccessCode] = useState<string>("");
  const [showSuccessDialog, setShowSuccessDialog] = useState(false);
  const { toast } = useToast();
  const navigate = useNavigate();

  const handleClassChange = (value: string) => {
    setSelectedClass(value);
  };

  const handleFormSubmit = async (formData: any) => {
    setIsSubmitting(true);

    try {
      const documentsUrls = [];
      
      if (formData.documents && formData.documents.length > 0) {
        for (const file of formData.documents) {
          const fileExt = file.name.split('.').pop();
          const fileName = `${Math.random().toString(36).substring(2, 15)}.${fileExt}`;
          const filePath = `documents/${fileName}`;
          
          const { data, error } = await supabase.storage
            .from('admission-documents')
            .upload(filePath, file);
            
          if (error) throw error;
          
          const fileUrl = supabase.storage
            .from('admission-documents')
            .getPublicUrl(filePath).data.publicUrl;
            
          documentsUrls.push(fileUrl);
        }
      }

      const { data, error } = await supabase
        .from('admissions')
        .insert({
          ...formData,
          documents_url: documentsUrls,
          class_applying_for: selectedClass,
          status: 'pending'
        })
        .select('access_code')
        .single();

      if (error) throw error;

      if (data && data.access_code) {
        setAccessCode(data.access_code);
        setShowSuccessDialog(true);
      }
      
      toast({
        title: "Application submitted successfully",
        description: "Your admission application has been received.",
      });
    } catch (error) {
      console.error("Error submitting form:", error);
      toast({
        title: "Error submitting application",
        description: "Please try again later.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="container py-8">
      <div className="mb-8 text-center">
        <h1 className="text-3xl font-bold mb-2">Admission Application</h1>
        <p className="text-muted-foreground">
          Fill out the form below to apply for admission to Baliadanga High School
        </p>
      </div>

      <Card className="max-w-3xl mx-auto">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <GraduationCap className="h-6 w-6" />
            Select Class
          </CardTitle>
          <CardDescription>
            Please select the class you wish to apply for
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-6">
            <div className="grid gap-3">
              <Select onValueChange={handleClassChange}>
                <SelectTrigger>
                  <SelectValue placeholder="Select class" />
                </SelectTrigger>
                <SelectContent>
                  {classOptions.map(option => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {selectedClass && (
              <div className="mt-4">
                {selectedClass === "5" ? (
                  <AdmissionFormJunior onSubmit={handleFormSubmit} isSubmitting={isSubmitting} />
                ) : (
                  <AdmissionFormSenior onSubmit={handleFormSubmit} isSubmitting={isSubmitting} />
                )}
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      <AdmissionSuccessDialog 
        open={showSuccessDialog}
        onOpenChange={setShowSuccessDialog}
        accessCode={accessCode}
      />
    </div>
  );
};

export default Admission;
