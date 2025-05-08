
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter } from '@/components/ui/card';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { ChevronDown, ChevronUp, Edit, Trash2 } from 'lucide-react';
import { StaffMember } from '@/hooks/use-staff';

interface StaffCardMobileProps {
  staff: StaffMember;
  onEdit: () => void;
  onDelete: () => void;
}

export function StaffCardMobile({ staff, onEdit, onDelete }: StaffCardMobileProps) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <Card>
      <Collapsible open={isOpen} onOpenChange={setIsOpen}>
        <div className="flex items-center justify-between p-4">
          <div>
            <h3 className="font-medium">{staff.name}</h3>
            <p className="text-sm text-muted-foreground">{staff.position}</p>
          </div>
          <CollapsibleTrigger asChild>
            <Button variant="ghost" size="sm">
              {isOpen ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
            </Button>
          </CollapsibleTrigger>
        </div>
        
        <CollapsibleContent>
          <CardContent className="pb-0 pt-0">
            {staff.email && (
              <div className="py-1">
                <span className="text-sm font-medium">Email:</span> {staff.email}
              </div>
            )}
            {staff.phone && (
              <div className="py-1">
                <span className="text-sm font-medium">Phone:</span> {staff.phone}
              </div>
            )}
            {staff.bio && (
              <div className="py-1">
                <span className="text-sm font-medium">Bio:</span> <p className="text-sm">{staff.bio}</p>
              </div>
            )}
            {staff.image_url && (
              <div className="py-1">
                <span className="text-sm font-medium">Image URL:</span> <p className="text-sm truncate">{staff.image_url}</p>
              </div>
            )}
          </CardContent>
        </CollapsibleContent>
        
        <CardFooter className="flex justify-end gap-2 p-2">
          <Button variant="outline" size="sm" onClick={onEdit}>
            <Edit className="h-4 w-4" />
          </Button>
          <Button 
            variant="outline" 
            size="sm" 
            className="text-destructive hover:bg-destructive/10" 
            onClick={onDelete}
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </CardFooter>
      </Collapsible>
    </Card>
  );
}
