import { DuckDBRow } from "@motherduckdb/wasm-client";
import { BarChart, EventProps, Title } from "@tremor/react";

export function ComplaintsByYearChart({
  complaintsByYearData,
  handleValueChange,
}: {
  complaintsByYearData: readonly DuckDBRow[];
  handleValueChange: (value: EventProps) => void;
}) {
  return (
    <div id="top-chart">
      <div className="bg-blue-50 text-blue-500 p-3 rounded border border-blue-300 mb-8">
        💡 Click on a year to drill down into top complaints by type.
      </div>

      <Title>Complaints Received by New York City Police Department</Title>

      <BarChart
        data={complaintsByYearData as DuckDBRow[]}
        categories={["Complaints"]}
        index="Year"
        onValueChange={handleValueChange}
      />
    </div>
  );
}
