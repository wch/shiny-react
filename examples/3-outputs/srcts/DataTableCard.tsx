import React from "react";
import { useShinyOutput } from "shiny-react";
import Card from "./Card";

function DataTableCard() {
  const [tableData] = useShinyOutput<Record<string, number[]> | undefined>(
    "table_data",
    undefined
  );

  // Get column names from the data
  const columnNames = tableData ? Object.keys(tableData) : [];

  // Get number of rows from first column
  const numRows =
    columnNames.length > 0 && tableData ? tableData[columnNames[0]].length : 0;

  return (
    <Card title="Table Data">
      <div className="output-section">
        <h3>{numRows} rows from mtcars dataset</h3>
        <div
          className="table-container"
          style={{ "--max-rows": 8 } as React.CSSProperties}
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
      </div>
    </Card>
  );
}

export default DataTableCard;