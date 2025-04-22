import React, { useState, useCallback } from 'react';
import FileUploader from '@/components/FileUploader';
import FilterPanel from '@/components/FilterPanel';
import StatsPanel from '@/components/StatsPanel';
import DataTable from '@/components/DataTable';
import { ExcelData, ExcelRow, FilterState, SummaryStats } from '@/types/excelData';
import { calculateSummaryStats, parseExcelFile } from '@/utils/excelUtils';
import { useToast } from '@/hooks/use-toast';
import { exampleData } from '@/data/exampleData';
import { Button } from '@/components/ui/button';

const Index = () => {
  const { toast } = useToast();
  const [excelData, setExcelData] = useState<ExcelData | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [filters, setFilters] = useState<FilterState>({
    globalFilter: '',
    rowStatus: [],
    orderStatus: [],
    dateRange: {
      from: null,
      to: null,
    },
  });
  const [stats, setStats] = useState<SummaryStats>({
    totalRows: 0,
    totalOrderCost: 0,
    totalReleaseQuantity: 0,
  });

  const handleFileUpload = async (file: File) => {
    setIsLoading(true);
    try {
      const data = await parseExcelFile(file);
      
      // Find min and max intake numbers for the slider
      const intakeNumbers = data.rows
        .map(row => Number(row["תאריך קליטה"]))
        .filter(num => !isNaN(num));
      
      const minIntake = Math.min(...intakeNumbers);
      const maxIntake = Math.max(...intakeNumbers);
      
      setExcelData({
        ...data,
        minIntakeNum: minIntake,
        maxIntakeNum: maxIntake,
      });

      const calculatedStats = calculateSummaryStats(data.rows);
      setStats(calculatedStats);
      toast({
        title: "הקובץ נטען בהצלחה",
        description: `נטענו ${data.rows.length} שורות מהקובץ`,
      });
    } catch (error) {
      console.error("Error processing file:", error);
      toast({
        title: "שגיאה בטעינת הקובץ",
        description: "אירעה שגיאה בעת עיבוד קובץ האקסל. אנא נסה שוב.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const loadExampleData = () => {
    setExcelData(exampleData);
    const calculatedStats = calculateSummaryStats(exampleData.rows);
    setStats(calculatedStats);
    toast({
      title: "נתוני דוגמה נטענו בהצלחה",
      description: `נטענו ${exampleData.rows.length} שורות לדוגמה`,
    });
  };

  const getFilteredData = useCallback((): ExcelRow[] => {
    if (!excelData) return [];
    
    // Apply all filters
    return excelData.rows.filter(row => {
      // Apply row status filter
      if (filters.rowStatus.length > 0 && row["סטטוס שורה"]) {
        if (!filters.rowStatus.includes(String(row["סטטוס שורה"]))) {
          return false;
        }
      }
      
      // Apply order status filter
      if (filters.orderStatus.length > 0 && row["סטאטוס הזמנה"]) {
        if (!filters.orderStatus.includes(String(row["סטאטוס הזמנה"]))) {
          return false;
        }
      }
      
      // Apply date range filter (now treating as number range)
      if (
        (filters.dateRange.from || filters.dateRange.to) && 
        row["תאריך קליטה"] !== undefined
      ) {
        const intakeValue = typeof row["תאריך קליטה"] === 'number' 
          ? row["תאריך קליטה"] 
          : Number(row["תאריך קליטה"]);
        
        if (filters.dateRange.from !== null && filters.dateRange.to !== null) {
          return intakeValue >= filters.dateRange.from && intakeValue <= filters.dateRange.to;
        } else if (filters.dateRange.from !== null) {
          return intakeValue >= filters.dateRange.from;
        } else if (filters.dateRange.to !== null) {
          return intakeValue <= filters.dateRange.to;
        }
      }
      
      // Apply global filter
      if (filters.globalFilter) {
        const searchTerm = filters.globalFilter.toLowerCase();
        return Object.values(row).some(value => {
          if (value === null || value === undefined) return false;
          const strValue = value instanceof Date 
            ? value.toLocaleDateString('he-IL') 
            : String(value).toLowerCase();
          return strValue.includes(searchTerm);
        });
      }
      
      return true;
    });
  }, [excelData, filters]);

  React.useEffect(() => {
    if (excelData) {
      const filteredData = getFilteredData();
      const calculatedStats = calculateSummaryStats(filteredData);
      setStats(calculatedStats);
    }
  }, [filters, excelData, getFilteredData]);

  return (
    <div className="min-h-screen bg-blue-gentle/40 rtl">
      <header className="bg-white shadow-sm border-b">
        <div className="container mx-auto py-4 px-4 sm:px-6 lg:px-8">
          <h1 className="text-2xl font-bold text-primary">מציג נתוני אקסל - המכון לתקנים</h1>
        </div>
      </header>
      
      <main className="container mx-auto py-6 px-4 sm:px-6 lg:px-8">
        {!excelData ? (
          <div className="max-w-lg mx-auto mt-8">
            <h2 className="text-xl font-semibold mb-4 text-center">העלה קובץ אקסל כדי להתחיל</h2>
            <FileUploader onFileUploaded={handleFileUpload} isLoading={isLoading} />
            <div className="mt-4 text-center">
              <p className="text-muted-foreground mb-2">או</p>
              <Button 
                variant="outline"
                onClick={loadExampleData}
                className="w-full"
              >
                טען נתוני דוגמה
              </Button>
            </div>
          </div>
        ) : (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-xl font-semibold">הנתונים שלך</h2>
              <div>
                <FileUploader onFileUploaded={handleFileUpload} isLoading={isLoading} />
              </div>
            </div>
            
            <StatsPanel stats={stats} />
            
            <FilterPanel
              uniqueRowStatus={excelData.uniqueRowStatus}
              uniqueOrderStatus={excelData.uniqueOrderStatus}
              filters={filters}
              setFilters={setFilters}
              minIntakeNum={excelData.minIntakeNum}
              maxIntakeNum={excelData.maxIntakeNum}
            />
            
            <DataTable
              data={getFilteredData()}
              columns={excelData.columns}
              filters={filters}
            />
          </div>
        )}
      </main>
    </div>
  );
};

export default Index;
