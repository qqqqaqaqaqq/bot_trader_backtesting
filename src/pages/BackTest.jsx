import React, { useEffect, useState } from "react";
import Chart from "react-apexcharts";
import './styles/chart.css'
import './PromptCard'

export default function BacktestingResult({ backtestResult }) {
  const [series, setSeries] = useState([]);

  const options = {
      chart: {
        type: "line",
        toolbar: { show: false },
        zoom: { enabled: false },
      },
      xaxis: {
        type: "datetime",
        labels: {
          datetimeUTC: false, // 로컬 시간 표시
        },
      },
      yaxis: {
        labels: {
          formatter: (val) => val.toFixed(2) + "%" // Y축 소수점 2자리 %
        }
      },
      stroke: {
        curve: "smooth",
        width: 2,
      },
      grid: {
        strokeDashArray: 4,
      },
      tooltip: {
        y: {
          formatter: (val) => val.toFixed(2) + "%" // tooltip 소수점 2자리 %
        }
      }
    };

  useEffect(() => {
    if (!backtestResult || Object.keys(backtestResult).length === 0) return;

    const newSeries = Object.keys(backtestResult).map(key => {
      const dataArray = backtestResult[key].filter(item => item.time && item.total_asset != null);
      if (dataArray.length === 0) return { name: key, data: [] };

      const startValue = dataArray[0].total_asset;

      return {
        name: key,
        data: dataArray.map(item => ({
          x: new Date(item.time).getTime(),
          y: ((item.total_asset - startValue) / startValue) * 100 // % 변화
        }))
      };
    });

    // 비동기적으로 setState 호출
    Promise.resolve().then(() => setSeries(newSeries));
  }, [backtestResult]);

  return (
    <div className="frame">
      <h2>BackTesting Duration: 2025-01-01 ~ 2025-07-31 UTC</h2>
      <Chart
        options={options}
        series={series}
        type="line"
        height={700}
        width="100%"
      />
    </div>
  );
}
