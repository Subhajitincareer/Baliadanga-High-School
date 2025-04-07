
import React from 'react';
import { Button } from '@/components/ui/button';
import { SearchInput } from '@/components/ui/search-input';
import { Plus, Search } from 'lucide-react';

interface AnnouncementToolbarProps {
  searchTerm: string;
  onSearchChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onCreateClick: () => void;
}

export const AnnouncementToolbar: React.FC<AnnouncementToolbarProps> = ({
  searchTerm,
  onSearchChange,
  onCreateClick,
}) => {
  return (
    <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
      <SearchInput
        placeholder="Search announcements..."
        value={searchTerm}
        onChange={onSearchChange}
        className="w-full sm:w-64 md:w-80"
        icon={Search}
      />
      <Button onClick={onCreateClick} className="bg-school-primary hover:bg-school-primary/90">
        <Plus className="mr-2 h-4 w-4" /> New Announcement
      </Button>
    </div>
  );
};
