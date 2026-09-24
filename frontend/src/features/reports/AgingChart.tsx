import React from "react";

/** Simple aging bucket bar chart (AR/AP). */
export const AgingChart: React.FC<{ rows: { partyName: string; current: number; days30: number; days60: number; days90: number }[] }> = ({ rows }) => {
  const totals = rows.reduce(
    (acc, r) => ({
      current: acc.current + (r.current || 0),
      days30: acc.days30 + (r.days30 || 0),
      days60: acc.days60 + (r.days60 || 0),
      days90: acc.days90 + (r.days90 || 0),
    }),
    { current: 0, days30: 0, days60: 0, days90: 0 }
  );
  const data = [
    { bucket: "Current", amount: totals.current },
    { bucket: "1–30 days", amount: totals.days30 },
    { bucket: "31–60 days", amount: totals.days60 },
    { bucket: "61–90 days", amount: totals.days90 },
  ];
  return <div data-chart={JSON.stringify(data)} />;
};
