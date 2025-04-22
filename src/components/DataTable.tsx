
import React, { useState, useMemo } from 'react';
import {
  flexRender,
  getCoreRowModel,
  getSortedRowModel,
  useReactTable,
  SortingState,
  ColumnDef,
  getFilteredRowModel,
} from '@tanstack/react-table';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { ExcelRow, FilterState } from '@/types/excelData';
import { formatHebrewDate } from '@/utils/excelUtils';

interface DataTableProps {
  data: ExcelRow[];
  columns: string[];
  filters: FilterState;
}

const DataTable: React.FC<DataTableProps> = ({ data, columns, filters }) => {
  const [sorting, setSorting] = useState<SortingState>([]);
  
  const tableColumns: ColumnDef<ExcelRow>[] = useMemo(() => columns.map((col) => ({
    accessorKey: col,
    header: () => (
      <div className="text-right">
        {col === "תאריך קליטה" ? "תהליך קליטה" : col}
      </div>
    ),
    cell: ({ row }) => {
      const value = row.getValue(col);
      
      // Special handling for תאריך קליטה
      if (col === "תאריך קליטה") {
        return <div className="text-right">{String(value)}</div>;
      }
      
      // Format dates for display (only for תאריך מסקנה now)
      if (col === "תאריך מסקנה") {
        const date = value as Date | string | null;
        return <div className="text-right">{formatHebrewDate(date)}</div>;
      }
      
      // Format numbers with commas
      if (
        typeof value === 'number' || 
        (typeof value === 'string' && !isNaN(Number(value)) && col !== "ח.פ יבואן" && col !== "קוד דגם")
      ) {
        return <div className="text-right">{new Intl.NumberFormat('he-IL').format(Number(value))}</div>;
      }
      
      return <div className="text-right">{value as React.ReactNode}</div>;
    },
  })), [columns]);

  const table = useReactTable({
    data,
    columns: tableColumns,
    state: {
      sorting,
    },
    onSortingChange: setSorting,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
  });

  // Check if there's data to display
  if (data.length === 0) {
    return (
      <div className="border rounded-md p-8 text-center">
        <h3 className="font-medium text-lg mb-2">אין נתונים להצגה</h3>
        <p className="text-muted-foreground">
          {filters.rowStatus.length > 0 || filters.orderStatus.length > 0 || filters.globalFilter || filters.dateRange.from || filters.dateRange.to
            ? 'נסה לשנות את הסינון כדי לראות תוצאות' 
            : 'העלה קובץ אקסל כדי להציג נתונים'}
        </p>
      </div>
    );
  }

  return (
    <div className="border rounded-md">
      <div className="overflow-x-auto">
        <Table className="excel-table">
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => (
                  <TableHead key={header.id} className="text-right">
                    {header.isPlaceholder ? null : (
                      <Button
                        variant="ghost"
                        onClick={() => header.column.toggleSorting()}
                        className="flex items-center justify-end gap-2 p-0 h-auto font-semibold"
                      >
                        {flexRender(
                          header.column.columnDef.header,
                          header.getContext()
                        )}
                        {header.column.getIsSorted() === "asc" && (
                          <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <polyline points="18 15 12 9 6 15"></polyline>
                          </svg>
                        )}
                        {header.column.getIsSorted() === "desc" && (
                          <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <polyline points="6 9 12 15 18 9"></polyline>
                          </svg>
                        )}
                        {header.column.getIsSorted() === false && (
                          <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="opacity-30">
                            <polyline points="18 15 12 9 6 15"></polyline>
                            <polyline points="6 9 12 15 18 9"></polyline>
                          </svg>
                        )}
                      </Button>
                    )}
                  </TableHead>
                ))}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {table.getRowModel().rows.map((row) => (
              <TableRow key={row.id}>
                {row.getVisibleCells().map((cell) => (
                  <TableCell key={cell.id}>
                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                  </TableCell>
                ))}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
};

export default DataTable;
