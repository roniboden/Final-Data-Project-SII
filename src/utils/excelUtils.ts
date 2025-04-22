import * as XLSX from 'xlsx';
import { ExcelRow, ExcelData, SummaryStats } from '../types/excelData';
import { format, isValid, parse } from 'date-fns';
import { he } from 'date-fns/locale';

// Parse Excel file and return structured data
export const parseExcelFile = async (file: File): Promise<ExcelData> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    
    reader.onload = (e) => {
      try {
        const data = new Uint8Array(e.target?.result as ArrayBuffer);
        const workbook = XLSX.read(data, { type: 'array' });
        
        // Get the first worksheet
        const firstSheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[firstSheetName];
        
        // Convert to JSON
        const jsonData = XLSX.utils.sheet_to_json<ExcelRow>(worksheet, { defval: '' });
        
        // Extract column names
        const columns = Object.keys(jsonData[0] || {});
        
        // Extract unique values for filters
        const uniqueRowStatus = [...new Set(jsonData.map(row => row["סטטוס שורה"]).filter(Boolean))];
        const uniqueOrderStatus = [...new Set(jsonData.map(row => row["סטאטוס הזמנה"]).filter(Boolean))];
        
        // Process dates and numbers in the data
        const processedData = jsonData.map(row => {
          const newRow = { ...row };
          
          // Ensure תאריך קליטה is treated as a number
          if (newRow["תאריך קליטה"] !== undefined) {
            if (typeof newRow["תאריך קליטה"] === "string") {
              // Convert to number if it's a string
              const numValue = Number(newRow["תאריך קליטה"].replace(/,/g, ''));
              if (!isNaN(numValue)) {
                newRow["תאריך קליטה"] = numValue;
              }
            } else if (typeof newRow["תאריך קליטה"] === "object" && newRow["תאריך קליטה"] !== null) {
              // If it's a Date object, convert to a sequential number
              newRow["תאריך קליטה"] = (newRow["תאריך קליטה"] as Date).getTime();
            }
          }
          
          // Process other dates if needed (like תאריך מסקנה)
          if (newRow["תאריך מסקנה"] && typeof newRow["תאריך מסקנה"] === "string") {
            try {
              // Try parse with different formats
              let parsedDate;
              
              // Try dd/MM/yyyy format
              if (/^\d{1,2}\/\d{1,2}\/\d{4}$/.test(String(newRow["תאריך מסקנה"]))) {
                parsedDate = parse(String(newRow["תאריך מסקנה"]), 'dd/MM/yyyy', new Date());
              }
              // Try yyyy-MM-dd format
              else if (/^\d{4}-\d{1,2}-\d{1,2}$/.test(String(newRow["תאריך מסקנה"]))) {
                parsedDate = parse(String(newRow["תאריך מסקנה"]), 'yyyy-MM-dd', new Date());
              }
              
              if (parsedDate && isValid(parsedDate)) {
                newRow["תאריך מסקנה"] = parsedDate;
              }
            } catch (error) {
              console.error("Error parsing date:", error);
              // Keep original value if parsing fails
            }
          }
          
          return newRow;
        });
        
        resolve({
          rows: processedData,
          columns,
          uniqueRowStatus,
          uniqueOrderStatus
        });
      } catch (error) {
        console.error("Error parsing Excel file:", error);
        reject(new Error("Failed to parse Excel file. Please ensure it's a valid .xlsx file."));
      }
    };
    
    reader.onerror = (error) => {
      reject(error);
    };
    
    reader.readAsArrayBuffer(file);
  });
};

// Format date for display in Hebrew
export const formatHebrewDate = (date: Date | string | null): string => {
  if (!date) return '-';
  
  try {
    const dateObj = date instanceof Date ? date : new Date(date);
    if (!isValid(dateObj)) return String(date);
    
    return format(dateObj, 'dd/MM/yyyy', { locale: he });
  } catch (error) {
    console.error("Error formatting date:", error);
    return String(date);
  }
};

// Calculate summary statistics from data
export const calculateSummaryStats = (data: ExcelRow[]): SummaryStats => {
  const totalRows = data.length;
  
  let totalOrderCost = 0;
  let totalReleaseQuantity = 0;
  
  data.forEach(row => {
    // Sum order costs
    if (row["עלות הזמנה"] !== undefined && row["עלות הזמנה"] !== null) {
      const cost = typeof row["עלות הזמנה"] === 'number' 
        ? row["עלות הזמנה"] 
        : parseFloat(String(row["עלות הזמנה"]).replace(/,/g, ''));
      
      if (!isNaN(cost)) {
        totalOrderCost += cost;
      }
    }
    
    // Sum release quantities
    if (row["כמות לשחרור"] !== undefined && row["כמות לשחרור"] !== null) {
      const quantity = typeof row["כמות לשחרור"] === 'number' 
        ? row["כמות לשחרור"] 
        : parseFloat(String(row["כמות לשחרור"]).replace(/,/g, ''));
      
      if (!isNaN(quantity)) {
        totalReleaseQuantity += quantity;
      }
    }
  });
  
  return {
    totalRows,
    totalOrderCost,
    totalReleaseQuantity
  };
};

// Format number with commas for thousands
export const formatNumber = (num: number): string => {
  return new Intl.NumberFormat('he-IL').format(num);
};

// Check if a date is within a range
export const isDateInRange = (date: Date | string | null, from: Date | null, to: Date | null): boolean => {
  if (!date) return false;
  if (!from && !to) return true;
  
  const dateObj = date instanceof Date ? date : new Date(date);
  if (!isValid(dateObj)) return false;
  
  if (from && to) {
    return dateObj >= from && dateObj <= to;
  } else if (from) {
    return dateObj >= from;
  } else if (to) {
    return dateObj <= to;
  }
  
  return true;
};
