"use client";
import "./datePicker.scss";
import * as React from "react";
import { CalendarIcon } from "@radix-ui/react-icons";
import { addDays, format } from "date-fns";
import { DateRange } from "react-day-picker";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

interface DatePickerComponentProps {
  onDateChange: (date: DateRange | null) => void;
}

const DatePickerComponent: React.FC<DatePickerComponentProps> = ({
  onDateChange,
}) => {
  const [date, setDate] = React.useState<DateRange | undefined>({
    from: new Date(),
    to: addDays(new Date(), 7),
  });

  const handleDateRangeChange = (selectedDate: DateRange | undefined) => {
    setDate(selectedDate);
    onDateChange(selectedDate || null);
  };

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button id="date" className="calendar-button">
          <CalendarIcon className="mr-2" />
          {date?.from ? (
            date.to ? (
              <>
                {format(date.from, "LLL dd, y")} -{" "}
                {format(date.to, "LLL dd, y")}
              </>
            ) : (
              format(date.from, "LLL dd, y")
            )
          ) : (
            <span>Pick a date</span>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="date-popover" align="end">
        <Calendar
          mode="range"
          defaultMonth={date?.from}
          selected={date}
          onSelect={handleDateRangeChange}
          numberOfMonths={1}
          className="date-calendar"
        />
      </PopoverContent>
    </Popover>
  );
};

export default DatePickerComponent;
