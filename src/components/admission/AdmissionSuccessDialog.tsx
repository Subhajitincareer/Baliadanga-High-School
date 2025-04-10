
import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Check, Copy } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface AdmissionSuccessDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  accessCode: string;
}

const AdmissionSuccessDialog: React.FC<AdmissionSuccessDialogProps> = ({
  open,
  onOpenChange,
  accessCode
}) => {
  const { toast } = useToast();

  const copyCodeToClipboard = () => {
    navigator.clipboard.writeText(accessCode);
    toast({
      title: "Access code copied",
      description: "The access code has been copied to your clipboard.",
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Check className="h-6 w-6 text-green-500" />
            Application Submitted Successfully
          </DialogTitle>
          <DialogDescription>
            Your admission application has been received. Please save your access code for future reference.
          </DialogDescription>
        </DialogHeader>
        
        <div className="py-4">
          <p className="mb-2 text-sm font-medium">Your Access Code:</p>
          <div className="flex items-center gap-2">
            <div className="bg-secondary p-3 rounded-md text-center font-mono text-lg w-full">
              {accessCode}
            </div>
            <Button size="sm" variant="outline" onClick={copyCodeToClipboard}>
              <Copy className="h-4 w-4" />
            </Button>
          </div>
          <p className="mt-4 text-sm text-muted-foreground">
            Keep this code safe. You will need it to check your admission status and access the student portal if your application is approved.
          </p>
        </div>
        
        <div className="flex justify-end">
          <Button onClick={() => onOpenChange(false)}>Close</Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default AdmissionSuccessDialog;
