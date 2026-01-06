import React, { useEffect, useState } from "react";
import Chart from "react-apexcharts";
import './styles/chart.css';

export default function Predicted({ DATA, series }) {
  const [combine, setCombine] = useState([]); // 초기값 빈 배열
  const name = "XRP"
  const options = {
    chart: {
      type: "line",
      toolbar: { show: true },
      zoom: { enabled: false },
    },
    tooltip: {
      shared: true,       // ← 여기서 공유 활성화
      intersect: false,   // 시리즈 하나만 눌러도 툴팁 표시
      y: {
        formatter: function(val) { return val + "%"; }
      }
    },
    xaxis: { type: "datetime" },
    yaxis: {
      labels: {
        formatter: function(val) { return val + "%"; }
      }
    },
    stroke: { curve: "smooth", width: 2 },
    grid: { strokeDashArray: 4 },
  };

  useEffect(() => {
    if ((series && series.length > 0) && (DATA && DATA.length > 0)) {
      // real: 그냥 날짜만 통일
      const realDATA = DATA.map(item => ({
        x: item.x.split("T")[0],
        y: item.y
      }));

      // pred: type별로 날짜만 통일
      const predSeries = series.map(predType => ({
        name: `Predicted % Change (${predType.name})`,
        data: predType.data.map(item => ({
          x: item.x.split("T")[0], // YYYY-MM-DD로 통일
          y: item.y
        }))
      }));

      const combinedSeries = [
        ...predSeries,
        { name: "Real % Change", data: realDATA }
      ];

      setCombine(combinedSeries);
    }
  }, [series, DATA]);

  return (
    <div className="frame">
      <h2>LSTM 예측 {name} 2025-01-01 ~ 2025-07-31 UTC</h2>
      <Chart
        options={options}
        series={combine}
        type="line"
        height={700}
        width="100%"
      />
    </div>
  );
}
