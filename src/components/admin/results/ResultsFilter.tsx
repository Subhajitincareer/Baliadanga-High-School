
import React from 'react';
import { Search, Download, Plus } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { StudentResults as StudentResultsType } from '@/integrations/supabase/client';

interface ResultsFilterProps {
  searchTerm: string;
  selectedClass: string;
  classes: string[];
  onSearchChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onClassChange: (value: string) => void;
  onAddClick: () => void;
  onDownloadClick: () => void;
}

const ResultsFilter: React.FC<ResultsFilterProps> = ({
  searchTerm,
  selectedClass,
  classes,
  onSearchChange,
  onClassChange,
  onAddClick,
  onDownloadClick
}) => {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-12 gap-4 items-center mb-6">
      <div className="relative sm:col-span-3">
        <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Search results..."
          value={searchTerm}
          onChange={onSearchChange}
          className="pl-9"
        />
      </div>
      
      <div className="sm:col-span-3">
        <Select 
          value={selectedClass} 
          onValueChange={onClassChange}
        >
          <SelectTrigger>
            <SelectValue placeholder="Filter by class" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="">All Classes</SelectItem>
            {classes.map(className => (
              <SelectItem key={className} value={className}>
                {className}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      
      <div className="flex gap-2 sm:col-span-6 justify-end">
        <Button
          variant="outline"
          onClick={onAddClick}
        >
          <Plus className="mr-2 h-4 w-4" />
          Add Result
        </Button>
        <Button 
          variant="secondary" 
          onClick={onDownloadClick}
        >
          <Download className="mr-2 h-4 w-4" />
          Export CSV
        </Button>
      </div>
    </div>
  );
};

export default ResultsFilter;
