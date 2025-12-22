import React, { useState } from "react";
import Chart from "react-apexcharts";

import { Day } from './DAY/Day';
import { GPT_5_mini } from './DAY/GPT_5_mini';
import { GPT_5_mini_Strategy_1 } from './DAY/GPT_5_mini_Strategy_1';
import { GPT_5_mini_Strategy_2 } from "./DAY/GPT_5_mini_Strategy_2";
import { Gemini_2_5_pro } from './DAY/Gemini_2_5_pro';

import './styles/DAY.css';

const GPT_5_mini_Strategy_A = `Only proceed with buying when there is a clear bullish signal.
Even if there is a short-term upward trend, do not buy due to potential risks.
Avoid making too many trades.
If a loss exceeds 5%, partially sell — you can decide the amount for the stop-loss.
If a profit exceeds 5%, partially sell — you can decide the amount for taking profit.
Pay close attention to trading volume.`;

const GPT_5_mini_Strategy_B = `Only proceed with buying when there is a clear bullish signal.
Even if there appears to be a short-term upward trend, do not buy due to potential risks.
Avoid making too many trades.
If a loss exceeds 5%, partially sell — you can decide the amount for the stop-loss.
For profits, decide based on your judgment.
If it is judged to be a clear downtrend, cut losses and hold.
I believe that holding can also be an important strategy.
Pay close attention to trading volume.`;

export default function DAY() {
  const [modalContent, setModalContent] = useState(null);

  const series = [
    { name: "GPT-5-mini", data: GPT_5_mini },
    { name: "GPT-5-mini + Strategy_A", data: GPT_5_mini_Strategy_1 },
    { name: "GPT-5-mini + Strategy_B", data: GPT_5_mini_Strategy_2 },
    { name: "Gemini_2_5_pro", data: Gemini_2_5_pro },    
  ];

  const strategies = [
    { name: "GPT-5-mini + Strategy_A", prompt: GPT_5_mini_Strategy_A },
    { name: "GPT-5-mini + Strategy_B", prompt: GPT_5_mini_Strategy_B },
  ];

  const openModal = (content) => setModalContent(content);
  const closeModal = () => setModalContent(null);

  // 메인 차트 옵션
  const mainOptions = {
    chart: { 
      type: 'line', 
      height: 500, 
      zoom: { enabled: true }, 
      toolbar: { show: true }, 
      animations: { enabled: true } 
    },
    xaxis: { 
      categories: Day,
      tickAmount: 10,
      labels: {
        rotate: 0,
        formatter: function(val) {
          if (!val) return "";
          const parts = val.split(/[-\s]/);
          if (parts.length < 3) return val;  
          const [_year, month, day] = parts;
          return `${month}월${day}일`;
        },
        style: { fontSize: '0.8em', color: 'var(--text-color)' }
      }
    },
    yaxis: { 
      title: { text: "Percent",
        style : {
          fontSize : "1en",
          color:"var(--text-color)"
        }
      },
      decimalsInFloat: 2
    },
    stroke: { curve: 'smooth', width: 2 },
    legend: {
      position: 'right',
      floating: false,    
      offsetY: 0,
      offsetX: 0
    },
    tooltip: {
      shared: true,
      intersect: false,
      custom: function({ series, dataPointIndex, w }) {
        return `
          <div style="
            background: #fff; 
            color: black; 
            padding: 8px 12px; 
            border-radius: 8px; 
            font-size: 0.85em;
            box-shadow: 0 2px 10px rgba(0,0,0,0.6);
          ">
            <div style="font-weight: bold; margin-bottom: 4px;">
              ${Day[dataPointIndex]}  
            </div>
            ${w.globals.seriesNames.map((name, i) => {
              if (!series[i] || series[i][dataPointIndex] === undefined) return '';
              return `
                <div style="display:flex; justify-content: space-between; gap:10px; margin:2px 0;">
                  <span style="color: ${w.globals.colors[i]}">${name}</span>
                  <span>${series[i][dataPointIndex].toFixed(2)} %</span>
                </div>
              `;
            }).join('')}
          </div>
        `;
      }
    }
  };

  return (
    <div className="chart-container">
      <h2>기간 2025-01-01 00:00:00 ~ 2025-08-10 00:00:00 UTC</h2>

      <div className="container">
        <div className="chart">
          <Chart
            options={mainOptions}
            series={series}
            type="line"
            height="100%"
          />
        </div>
      </div>

      {/* 전략 카드 */}
      <div className="strategy-cards">
        {strategies.map((s, idx) => (
          <div className="card" key={idx}>
            <h3>{s.name}</h3>
            <p onClick={() => openModal(s.prompt)}>{s.prompt}</p>
          </div>
        ))}
      </div>

      {/* 모달 */}
      {modalContent && (
        <div className="modal" onClick={closeModal}>
          <div className="modal-content" onClick={e => e.stopPropagation()}>
            <pre>{modalContent}</pre>
          </div>
        </div>
      )}
    </div>
  );
}
