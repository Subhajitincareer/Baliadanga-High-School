import React, { useState } from 'react';
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { GraduationCap } from "lucide-react";
import { useNavigate } from "react-router-dom";
import AdmissionFormJunior from "@/components/admission/AdmissionFormJunior";
import AdmissionFormSenior from "@/components/admission/AdmissionFormSenior";
import AdmissionSuccessDialog from "@/components/admission/AdmissionSuccessDialog";
import apiService from '@/services/api';
import { useSiteSettings } from '@/contexts/SiteSettingsContext';

const classOptions = [
  { value: "5", label: "Class 5" },
  { value: "6", label: "Class 6" },
  { value: "7", label: "Class 7" },
  { value: "8", label: "Class 8" },
  { value: "9", label: "Class 9" },
  { value: "10", label: "Class 10" },
];

const Admission = () => {
  const [selectedClass, setSelectedClass] = useState<string>("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [accessCode, setAccessCode] = useState<string>("");
  const [showSuccessDialog, setShowSuccessDialog] = useState(false);
  const { toast } = useToast();
  const navigate = useNavigate();
  const { settings } = useSiteSettings();

  const handleClassChange = (value: string) => {
    setSelectedClass(value);
  };

  // Accepts data from AdmissionFormJunior/AdmissionFormSenior
  const handleFormSubmit = async (formData: any) => {
    setIsSubmitting(true);
    try {
      let documentsUrls: string[] = [];
      if (formData.documents && formData.documents.length > 0) {
        for (const file of formData.documents) {
          // Upload each document via /upload endpoint, returns { url }
          const result = await apiService.uploadFile(file, 'admission-documents');
          documentsUrls.push(result.url);
        }
      }
      // Send form and document URLs to /admissions endpoint
      const payload = {
        ...formData,
        documents_url: documentsUrls,
        class_applying_for: selectedClass,
        status: 'pending'
      };

      // Example expects { access_code: '...' } in response
      const data = await apiService.createAdmission(payload);

      if (data && (data.access_code || data.accessCode)) {
        setAccessCode(data.access_code || data.accessCode);
        setShowSuccessDialog(true);
      }
      toast({
        title: "Application submitted successfully",
        description: "Your admission application has been received.",
      });
    } catch (error: any) {
      console.error("Error submitting form:", error);
      toast({
        title: "Error submitting application",
        description: error.message || "Please try again later.",
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
          Fill out the form below to apply for admission to {settings.schoolInfo.name}
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
