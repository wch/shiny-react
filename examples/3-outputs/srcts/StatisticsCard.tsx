import { useShinyOutput } from "@posit/shiny-react";
import React from "react";
import Card from "./Card";

interface TableStats {
  colname: string;
  mean: number;
  median: number;
  min: number;
  max: number;
}

function StatisticsCard() {
  const [tableStats] = useShinyOutput<TableStats | undefined>(
    "table_stats",
    undefined
  );

  return (
    <Card title='Statistics'>
      <div className='output-section'>
        {tableStats ? (
          <div className='stats-section'>
            <h3>{tableStats.colname} statistics</h3>
            <div className='stats-visual'>
              <div className='stat-range'>
                <div className='range-bar'>
                  <div className='range-track'>
                    <span className='range-min'>
                      {tableStats.min.toFixed(1)}
                    </span>
                    <span className='range-max'>
                      {tableStats.max.toFixed(1)}
                    </span>
                  </div>
                  <div
                    className='range-indicator mean-indicator'
                    style={{
                      left: `${((tableStats.mean - tableStats.min) / (tableStats.max - tableStats.min)) * 100}%`,
                    }}
                    title={`Mean: ${tableStats.mean.toFixed(2)}`}
                  >
                    <div className='indicator-dot mean-dot'></div>
                    <div className='indicator-label'>
                      Mean
                      <br />
                      {tableStats.mean.toFixed(1)}
                    </div>
                  </div>
                  <div
                    className='range-indicator median-indicator'
                    style={{
                      left: `${((tableStats.median - tableStats.min) / (tableStats.max - tableStats.min)) * 100}%`,
                    }}
                    title={`Median: ${tableStats.median.toFixed(2)}`}
                  >
                    <div className='indicator-dot median-dot'></div>
                    <div className='indicator-label'>
                      Median
                      <br />
                      {tableStats.median.toFixed(1)}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className='stats-placeholder'>Loading statistics...</div>
        )}
      </div>
    </Card>
  );
}

export default StatisticsCard;
