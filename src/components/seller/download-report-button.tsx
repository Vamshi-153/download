'use client';

import { useState, useTransition } from 'react';
import { Button } from '@/components/ui/button';
import { Download, Loader2 } from 'lucide-react';
import { DateRange } from 'react-day-picker';
import { DateRangePicker } from '@/components/ui/date-range-picker'; // Assuming this exists
import { useToast } from '@/hooks/use-toast';
import { downloadFile } from '@/lib/utils';

interface DownloadReportButtonProps {
  reportType: 'orders' | 'transactions';
  downloadAction: (startDate: Date, endDate: Date) => Promise<{ success: boolean; data?: { filename: string; base64Content: string }; error?: string }>;
}

const EXCEL_CONTENT_TYPE = 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet';

export function DownloadReportButton({ reportType, downloadAction }: DownloadReportButtonProps) {
  const [dateRange, setDateRange] = useState<DateRange | undefined>(undefined);
  const [isPending, startTransition] = useTransition();
  const { toast } = useToast();

  const handleDownload = () => {
    if (!dateRange?.from || !dateRange?.to) {
      toast({
        title: 'Select Date Range',
        description: 'Please select a start and end date for the report.',
        variant: 'destructive',
      });
      return;
    }

    startTransition(async () => {
      const result = await downloadAction(dateRange.from!, dateRange.to!);

      if (result.success && result.data) {
        downloadFile(result.data.base64Content, result.data.filename, EXCEL_CONTENT_TYPE);
        toast({
          title: 'Download Started',
          description: `${reportType.charAt(0).toUpperCase() + reportType.slice(1)} report is downloading.`,
        });
      } else {
        toast({
          title: 'Download Failed',
          description: result.error || `Could not generate the ${reportType} report.`,
          variant: 'destructive',
        });
      }
    });
  };

  return (
    <div className="flex flex-col sm:flex-row items-center gap-2">
       <DateRangePicker date={dateRange} onDateChange={setDateRange} />
      <Button onClick={handleDownload} disabled={isPending || !dateRange?.from || !dateRange?.to}>
        {isPending ? (
          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
        ) : (
          <Download className="mr-2 h-4 w-4" />
        )}
        Download {reportType.charAt(0).toUpperCase() + reportType.slice(1)} Report
      </Button>
    </div>
  );
}
