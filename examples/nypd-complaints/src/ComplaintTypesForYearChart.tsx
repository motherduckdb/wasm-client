import { QueryTableRow } from "@motherduckdb/wasm-client";
import { BarChart } from "@tremor/react";

export function ComplaintTypesForYearChart({
  complaintTypesForYearData,
}: {
  complaintTypesForYearData: QueryTableRow[];
}) {
  return (
    <div
      id="bottom-chart"
      style={{ height: complaintTypesForYearData.length * 24 + 40 }}
    >
      <BarChart
        data={complaintTypesForYearData}
        categories={["Complaints"]}
        index="Type"
        layout="vertical"
        showLegend={false}
        yAxisWidth={250}
        className="h-full"
      />
    </div>
  );
}
