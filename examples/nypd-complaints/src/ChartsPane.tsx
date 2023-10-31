import { MDConnection, QueryTableData } from "@motherduckdb/wasm-client";
import { EventProps } from "@tremor/react";
import { useCallback, useEffect, useState } from "react";
import "./ChartsPane.css";
import { ComplaintTypesForYearChart } from "./ComplaintTypesForYearChart";
import { ComplaintsByYearChart } from "./ComplaintsByYearChart";
import { compaintsByYearSql, complaintTypesForYearSql } from "./sql";

const noData: QueryTableData = [];

export function ChartsPane({ connection }: { connection: MDConnection }) {
  const [complaintsByYearData, setComplaintsByYearData] =
    useState<QueryTableData | null>(null);

  const [loadingOpacity, setLoadingOpacity] = useState(0);

  useEffect(() => {
    setLoadingOpacity(1);
  }, []);

  useEffect(() => {
    async function fetchData() {
      if (connection) {
        const result = await connection.evaluateQuery(compaintsByYearSql);
        setComplaintsByYearData(result.rows);
      }
    }
    fetchData().catch(console.error);
  }, [connection]);

  const [complaintTypesForYearData, setComplaintTypesForYearData] =
    useState<QueryTableData>(noData);

  const handleValueChange = useCallback(
    async (value: EventProps) => {
      if (connection && value) {
        const year = Number(value["Year"]);
        const sql = complaintTypesForYearSql(year);
        const result = await connection.evaluateQuery(sql);
        setComplaintTypesForYearData(result.rows);
      } else {
        setComplaintTypesForYearData(noData);
      }
    },
    [connection]
  );

  return complaintsByYearData ? (
    <div id="charts-pane">
      <ComplaintsByYearChart
        complaintsByYearData={complaintsByYearData}
        handleValueChange={handleValueChange}
      />
      {complaintTypesForYearData.length > 0 ? (
        <ComplaintTypesForYearChart
          complaintTypesForYearData={complaintTypesForYearData}
        />
      ) : null}
    </div>
  ) : (
    <div
      id="loading-pane"
      style={{
        opacity: loadingOpacity,
        transform: `translateY(${(1 - loadingOpacity) * 8}px)`,
      }}
    >
      Loading…
    </div>
  );
}
