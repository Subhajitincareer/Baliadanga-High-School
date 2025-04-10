
import React, { useState } from 'react';
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Search, CheckCircle, AlertCircle, Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

const accessCodeSchema = z.object({
  accessCode: z.string().min(6, { message: "Please enter a valid access code" }).max(10),
});

type AccessCodeFormValues = z.infer<typeof accessCodeSchema>;

interface AdmissionStatusProps {
  id: string;
  student_name: string;
  class_applying_for: string;
  status: string;
  access_code: string;
  roll_number: string | null;
  remarks: string | null;
  created_at: string;
}

const AdmissionStatus = () => {
  const [isSearching, setIsSearching] = useState(false);
  const [admissionStatus, setAdmissionStatus] = useState<AdmissionStatusProps | null>(null);
  const { toast } = useToast();

  const form = useForm<AccessCodeFormValues>({
    resolver: zodResolver(accessCodeSchema),
    defaultValues: {
      accessCode: "",
    }
  });

  const onSubmit = async (data: AccessCodeFormValues) => {
    setIsSearching(true);
    
    try {
      const { data: admissionData, error } = await supabase
        .from('admissions')
        .select('id, student_name, class_applying_for, status, access_code, roll_number, remarks, created_at')
        .eq('access_code', data.accessCode)
        .single();

      if (error) {
        if (error.code === 'PGRST116') {
          toast({
            title: "Access Code Not Found",
            description: "No application found with the provided access code.",
            variant: "destructive",
          });
        } else {
          throw error;
        }
        setAdmissionStatus(null);
      } else {
        setAdmissionStatus(admissionData);
      }
    } catch (error) {
      console.error('Error fetching admission status:', error);
      toast({
        title: "Error",
        description: "Failed to check admission status. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSearching(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString();
  };

  return (
    <div className="container py-8">
      <div className="mb-8 text-center">
        <h1 className="text-3xl font-bold mb-2">Check Admission Status</h1>
        <p className="text-muted-foreground">
          Enter your access code to check the status of your admission application
        </p>
      </div>

      <div className="max-w-md mx-auto">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Search className="h-5 w-5" />
              Enter Access Code
            </CardTitle>
            <CardDescription>
              Enter the access code you received when you submitted your application
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <FormField
                  control={form.control}
                  name="accessCode"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Access Code</FormLabel>
                      <FormControl>
                        <Input placeholder="Enter your access code" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <Button type="submit" className="w-full" disabled={isSearching}>
                  {isSearching ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Checking...
                    </>
                  ) : (
                    'Check Status'
                  )}
                </Button>
              </form>
            </Form>
          </CardContent>
        </Card>

        {admissionStatus && (
          <Card className="mt-6">
            <CardHeader className={`
              ${admissionStatus.status === 'approved' ? 'bg-green-50' : 
                admissionStatus.status === 'rejected' ? 'bg-red-50' :
                'bg-yellow-50'} rounded-t-lg
            `}>
              <CardTitle className="flex items-center gap-2">
                {admissionStatus.status === 'approved' ? (
                  <>
                    <CheckCircle className="h-5 w-5 text-green-600" />
                    <span className="text-green-600">Application Approved</span>
                  </>
                ) : admissionStatus.status === 'rejected' ? (
                  <>
                    <AlertCircle className="h-5 w-5 text-red-600" />
                    <span className="text-red-600">Application Rejected</span>
                  </>
                ) : (
                  <>
                    <Loader2 className="h-5 w-5 text-yellow-600" />
                    <span className="text-yellow-600">Application Under Review</span>
                  </>
                )}
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-4">
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Student Name</p>
                    <p>{admissionStatus.student_name}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Class</p>
                    <p>Class {admissionStatus.class_applying_for}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Application Date</p>
                    <p>{formatDate(admissionStatus.created_at)}</p>
                  </div>
                  {admissionStatus.roll_number && (
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">Roll Number</p>
                      <p className="font-mono">{admissionStatus.roll_number}</p>
                    </div>
                  )}
                </div>
                
                {admissionStatus.remarks && (
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Remarks</p>
                    <p>{admissionStatus.remarks}</p>
                  </div>
                )}
                
                {admissionStatus.status === 'approved' && (
                  <div className="bg-green-50 border border-green-100 rounded-md p-4 mt-4">
                    <p className="text-sm">
                      Congratulations! Your application has been approved. Please visit the school office with your 
                      original documents and admission fees. Use your access code and assigned roll number 
                      for all future communications.
                    </p>
                  </div>
                )}
                
                {admissionStatus.status === 'pending' && (
                  <div className="bg-yellow-50 border border-yellow-100 rounded-md p-4 mt-4">
                    <p className="text-sm">
                      Your application is currently being reviewed by our admissions team. 
                      Please check back later for updates. This process typically takes 5-7 working days.
                    </p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};

export default AdmissionStatus;
