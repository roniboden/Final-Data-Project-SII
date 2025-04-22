import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Button } from '@/components/ui/button';
import { FilterState } from '@/types/excelData';
import { Slider } from '@/components/ui/slider';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { format } from 'date-fns';
import { he } from 'date-fns/locale';

interface FilterPanelProps {
  uniqueRowStatus: string[];
  uniqueOrderStatus: string[];
  filters: FilterState;
  setFilters: React.Dispatch<React.SetStateAction<FilterState>>;
  minIntakeNum?: number;
  maxIntakeNum?: number;
}

const FilterPanel: React.FC<FilterPanelProps> = ({
  uniqueRowStatus,
  uniqueOrderStatus,
  filters,
  setFilters,
  minIntakeNum = 0,
  maxIntakeNum = 100000,
}) => {
  const handleGlobalFilterChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFilters(prev => ({ ...prev, globalFilter: e.target.value }));
  };

  const handleRowStatusChange = (value: string, checked: boolean) => {
    setFilters(prev => {
      const newRowStatus = checked
        ? [...prev.rowStatus, value]
        : prev.rowStatus.filter(status => status !== value);
      
      return {
        ...prev,
        rowStatus: newRowStatus,
      };
    });
  };

  const handleOrderStatusChange = (value: string, checked: boolean) => {
    setFilters(prev => {
      const newOrderStatus = checked
        ? [...prev.orderStatus, value]
        : prev.orderStatus.filter(status => status !== value);
      
      return {
        ...prev,
        orderStatus: newOrderStatus,
      };
    });
  };

  const handleDateRangeChange = (range: 'from' | 'to', date: Date | null) => {
    setFilters(prev => ({
      ...prev,
      dateRange: {
        ...prev.dateRange,
        [range]: date,
      },
    }));
  };

  const handleIntakeRangeChange = (values: number[]) => {
    setFilters(prev => ({
      ...prev,
      dateRange: {
        from: values[0],
        to: values[1],
      },
    }));
  };

  const handleClearFilters = () => {
    setFilters({
      globalFilter: '',
      rowStatus: [],
      orderStatus: [],
      dateRange: {
        from: null,
        to: null,
      },
    });
  };

  return (
    <Card className="mb-6">
      <CardContent className="pt-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div>
            <Label htmlFor="globalSearch">חיפוש גלובלי</Label>
            <Input
              id="globalSearch"
              placeholder="חפש בכל השדות..."
              value={filters.globalFilter}
              onChange={handleGlobalFilterChange}
              className="w-full mt-2"
            />
          </div>

          <div>
            <Label>סטטוס שורה</Label>
            <div className="h-32 overflow-y-auto border rounded-md p-2 mt-2">
              {uniqueRowStatus.map((status) => (
                <div key={`row-${status}`} className="flex items-center space-x-2 space-x-reverse mb-2">
                  <Checkbox
                    id={`row-status-${status}`}
                    checked={filters.rowStatus.includes(status)}
                    onCheckedChange={(checked) =>
                      handleRowStatusChange(status, checked === true)
                    }
                  />
                  <Label
                    htmlFor={`row-status-${status}`}
                    className="text-sm cursor-pointer mr-2"
                  >
                    {status}
                  </Label>
                </div>
              ))}
            </div>
          </div>

          <div>
            <Label>סטאטוס הזמנה</Label>
            <div className="h-32 overflow-y-auto border rounded-md p-2 mt-2">
              {uniqueOrderStatus.map((status) => (
                <div key={`order-${status}`} className="flex items-center space-x-2 space-x-reverse mb-2">
                  <Checkbox
                    id={`order-status-${status}`}
                    checked={filters.orderStatus.includes(status)}
                    onCheckedChange={(checked) =>
                      handleOrderStatusChange(status, checked === true)
                    }
                  />
                  <Label
                    htmlFor={`order-status-${status}`}
                    className="text-sm cursor-pointer mr-2"
                  >
                    {status}
                  </Label>
                </div>
              ))}
            </div>
          </div>

          <div>
            <Label>תהליך קליטה</Label>
            <div className="flex flex-col space-y-4 mt-4">
              <div className="px-2">
                <Slider
                  defaultValue={[minIntakeNum, maxIntakeNum]}
                  max={maxIntakeNum}
                  min={minIntakeNum}
                  step={1}
                  value={[
                    filters.dateRange.from as number || minIntakeNum,
                    filters.dateRange.to as number || maxIntakeNum
                  ]}
                  onValueChange={handleIntakeRangeChange}
                  className="w-full"
                />
              </div>
              <div className="flex justify-between text-sm text-muted-foreground px-2">
                <span>מ: {filters.dateRange.from || minIntakeNum}</span>
                <span>עד: {filters.dateRange.to || maxIntakeNum}</span>
              </div>
              <Button variant="secondary" onClick={handleClearFilters} className="w-full">
                נקה סינון
              </Button>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default FilterPanel;
