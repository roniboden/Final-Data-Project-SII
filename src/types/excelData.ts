
export interface ExcelRow {
  [key: string]: any;
  "שם היבואן"?: string;
  "ח.פ יבואן"?: string;
  "מעבדה"?: string;
  "תאריך קליטה"?: string | number;
  "מספר בקשה"?: string | number;
  "מספר שורה"?: string | number;
  "סטטוס שורה"?: string;
  "תת סטטוס שורה"?: string;
  "מספר הזמנה"?: string | number;
  "סטאטוס הזמנה"?: string;
  "מסקנת הזמנה"?: string;
  "תאריך מסקנה"?: string | Date;
  "סוג הזמנה"?: string;
  "עלות הזמנה"?: string | number;
  "מוצר"?: string;
  "תת מוצר"?: string;
  "תקן במשלוח"?: string | number;
  "קוד דגם"?: string | number;
  "תיאור דגם"?: string;
  "כמות לשחרור"?: string | number;
  "יחידת מידה"?: string;
}

export interface FilterState {
  globalFilter: string;
  rowStatus: string[];
  orderStatus: string[];
  dateRange: {
    from: number | null;
    to: number | null;
  };
}

export interface ExcelData {
  rows: ExcelRow[];
  columns: string[];
  uniqueRowStatus: string[];
  uniqueOrderStatus: string[];
  minIntakeNum?: number;
  maxIntakeNum?: number;
}

export interface SummaryStats {
  totalRows: number;
  totalOrderCost: number;
  totalReleaseQuantity: number;
}
