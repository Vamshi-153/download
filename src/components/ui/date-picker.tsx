// src/components/ui/date-picker.tsx
'use client';

import * as React from 'react';
import { format } from 'date-fns';
import { Calendar as CalendarIcon } from 'lucide-react';
import type { DayPickerSingleProps, SelectSingleEventHandler } from 'react-day-picker';

import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';

interface DatePickerProps extends Omit<DayPickerSingleProps, 'mode' | 'selected' | 'onSelect'> {
  date: Date | undefined;
  onDateChange: (date: Date | undefined) => void;
  placeholder?: string;
  disabled?: boolean;
}

export function DatePicker({
  className,
  date,
  onDateChange,
  placeholder = "Pick a date",
  disabled,
  ...props
}: DatePickerProps) {
  const [isOpen, setIsOpen] = React.useState(false);

  const handleSelect: SelectSingleEventHandler = (selectedDate, _, __, event) => {
    // Stop propagation to prevent Popover from closing immediately if calendar itself handles it
    // event?.stopPropagation(); 
    onDateChange(selectedDate);
    setIsOpen(false); // Close popover on date selection
  };

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger asChild>
        <Button
          variant={'outline'}
          disabled={disabled}
          className={cn(
            'w-full justify-start text-left font-normal',
            !date && 'text-muted-foreground',
            className
          )}
        >
          <CalendarIcon className="mr-2 h-4 w-4" />
          {date ? format(date, 'PPP') : <span>{placeholder}</span>}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0" 
        // onOpenAutoFocus={(e) => e.preventDefault()} // Prevent focus stealing if calendar handles it
      >
        <Calendar
          mode="single"
          selected={date}
          onSelect={handleSelect}
          initialFocus={false} // Let Popover manage focus or set to true if needed
          disabled={disabled}
          {...props}
        />
      </PopoverContent>
    </Popover>
  );
}
