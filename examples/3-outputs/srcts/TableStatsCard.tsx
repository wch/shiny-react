import React from "react";
import { useShinyInput, useShinyOutput, ImageOutput } from "shiny-react";
import Card from "./Card";

interface TableStats {
  colname: string;
  mean: number;
  median: number;
  min: number;
  max: number;
}

function TableStatsCard() {
  const [rowCount, setRowCount] = useShinyInput<number>("table_rows", 5);
  const [tableData] = useShinyOutput<Record<string, number[]> | undefined>(
    "table_data",
    undefined
  );
  const [tableStats] = useShinyOutput<TableStats | undefined>(
    "table_stats",
    undefined
  );

  // Get column names from the data
  const columnNames = tableData ? Object.keys(tableData) : [];

  // Get number of rows from first column
  const numRows =
    columnNames.length > 0 && tableData ? tableData[columnNames[0]].length : 0;

  return (
    <Card title="JSON & Table Data">
      <div className="input-section">
        <label htmlFor="row-slider">
          Number of rows to subset from data: {rowCount}
        </label>
        <input
          id="row-slider"
          type="range"
          min="1"
          max="32"
          value={rowCount}
          onChange={(e) => setRowCount(parseInt(e.target.value))}
          className="slider"
        />
      </div>

      <div className="output-section">
        <h3>Table Data ({numRows} rows)</h3>
        <div
          className="table-container"
          style={{ "--max-rows": 5 } as React.CSSProperties}
        >
          <table className="data-table">
            <thead>
              <tr>
                {columnNames.map((colName) => (
                  <th key={colName}>{colName.toUpperCase()}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {Array.from({ length: numRows }, (_, rowIndex) => (
                <tr key={rowIndex}>
                  {columnNames.map((colName) => {
                    const value = tableData?.[colName][rowIndex];
                    return (
                      <td key={colName}>
                        {typeof value === "number"
                          ? Number.isInteger(value)
                            ? value
                            : value.toFixed(3)
                          : value}
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {tableStats && (
          <div className="stats-section">
            <h3>{tableStats.colname} statistics</h3>
            <div className="stats-visual">
              {/* Range indicator with mean and median */}
              <div className="stat-range">
                <div className="range-bar">
                  <div className="range-track">
                    <span className="range-min">
                      {tableStats.min.toFixed(1)}
                    </span>
                    <span className="range-max">
                      {tableStats.max.toFixed(1)}
                    </span>
                  </div>
                  <div
                    className="range-indicator mean-indicator"
                    style={{
                      left: `${((tableStats.mean - tableStats.min) / (tableStats.max - tableStats.min)) * 100}%`,
                    }}
                    title={`Mean: ${tableStats.mean.toFixed(2)}`}
                  >
                    <div className="indicator-dot mean-dot"></div>
                    <div className="indicator-label">
                      Mean
                      <br />
                      {tableStats.mean.toFixed(1)}
                    </div>
                  </div>
                  <div
                    className="range-indicator median-indicator"
                    style={{
                      left: `${((tableStats.median - tableStats.min) / (tableStats.max - tableStats.min)) * 100}%`,
                    }}
                    title={`Median: ${tableStats.median.toFixed(2)}`}
                  >
                    <div className="indicator-dot median-dot"></div>
                    <div className="indicator-label">
                      Median
                      <br />
                      {tableStats.median.toFixed(1)}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        <div className="plot-section">
          <h3>Data Visualization</h3>
          <div className="plot-container">
            <ImageOutput id="plot1" className="data-plot" />
          </div>
        </div>
      </div>
    </Card>
  );
}

export default TableStatsCard;
