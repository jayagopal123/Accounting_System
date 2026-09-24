import { useQuery } from "@tanstack/react-query";
import { queryKeys } from "@/api/queryKeys";
import { settingsService, type FiscalYearItem } from "@/api/services/settingsService";
import { useUiStore } from "@/stores/useUiStore";
import { useEffect } from "react";

export function getIndianFiscalYearDates(date: Date = new Date()): { name: string; startDate: string; endDate: string } {
  const year = date.getFullYear();
  const month = date.getMonth(); // 0-indexed: 0 is Jan, 2 is Mar, 3 is Apr

  let startYear = year;
  let endYear = year + 1;

  if (month < 3) {
    // Jan, Feb, Mar belong to previous start year
    startYear = year - 1;
    endYear = year;
  }

  return {
    name: `FY ${startYear}-${endYear}`,
    startDate: `${startYear}-04-01T00:00:00.000Z`,
    endDate: `${endYear}-03-31T23:59:59.000Z`,
  };
}

export function useActiveFiscalYear() {
  const { activeFiscalYear, setActiveFiscalYear } = useUiStore();

  const { data: fiscalYears, isLoading } = useQuery({
    queryKey: queryKeys.fiscalYears.list(),
    queryFn: settingsService.getFiscalYears,
    staleTime: 1000 * 60 * 10,
  });

  useEffect(() => {
    if (fiscalYears && fiscalYears.length > 0) {
      // Find open active FY
      const active = fiscalYears.find((fy: FiscalYearItem) => !fy.isClosed) || fiscalYears[0];
      if (active && (!activeFiscalYear || activeFiscalYear._id !== active._id)) {
        setActiveFiscalYear({
          _id: active._id,
          name: active.name,
          startDate: active.startDate,
          endDate: active.endDate,
          isClosed: active.isClosed,
        });
      }
    } else if (!activeFiscalYear) {
      const fallback = getIndianFiscalYearDates();
      setActiveFiscalYear({
        _id: "default_fy",
        ...fallback,
        isClosed: false,
      });
    }
  }, [fiscalYears, activeFiscalYear, setActiveFiscalYear]);

  return {
    activeFiscalYear: activeFiscalYear || {
      _id: "default_fy",
      ...getIndianFiscalYearDates(),
      isClosed: false,
    },
    fiscalYears: fiscalYears || [],
    isLoading,
  };
}
