import React, { useEffect, useState } from "react";
import Chart from "react-apexcharts";

import { Day } from './DAY/Day';
import { GPT_5_mini } from './DAY/GPT_5_mini';
import { GPT_5_mini_Strategy_1 } from './DAY/GPT_5_mini_Strategy_1';
import { GPT_5_mini_Strategy_2 } from "./DAY/GPT_5_mini_Strategy_2";
import { Gemini_2_5_pro } from './DAY/Gemini_2_5_pro';

import './styles/DAY.css';

import { db } from "./services/firebase";
import { collection, getDocs } from "firebase/firestore";

// 전략 텍스트
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

// Firestore에서 pred_price와 real_price 가져오기 + confidence 계산
async function fetchPredPrice(ticker) {
  const querySnapshot = await getDocs(collection(db, `${ticker}_pred`));
  const data = {};
  const cutoffDate = new Date("2025-12-01T00:00:00Z");

  querySnapshot.forEach((doc) => {
    const row = doc.data();
    let ts = row.timestamp_utc;
    if (ts && typeof ts.toDate === "function") {
      ts = ts.toDate();
    } else {
      ts = new Date(ts);
    }

    if (ts >= cutoffDate) {
      const pred = row.pred_price;
      const real = row.real_price;
      const diffPercent = real ? Math.abs((pred - real) / real) * 100 : 0;
      const confidence = Math.max(0, 100 - diffPercent); // 신뢰지수 계산

      data[ts.toISOString()] = { pred, real, confidence };
    }
  });

  return data;
}

export default function DAY() {
  const [modalContent, setModalContent] = useState(null);
  const [pred, setPred] = useState({});
  const [loading, setLoading] = useState(true);

  const coinColors = {
    BTC: "#FF6384",
    ETH: "#36A2EB",
    XRP: "#FFCE56",
    DOGE: "#4BC0C0",
    BCH: "#9966FF"
  };

  useEffect(() => {
    const tickers = ["BTC", "XRP", "ETH", "DOGE", "BCH"];
    let loadedCount = 0;

    tickers.forEach((key) => {
      fetchPredPrice(key).then((rows) => {
        setPred((prev) => ({
          ...prev,
          [key]: rows,
        }));
        loadedCount++;
        if (loadedCount === tickers.length) setLoading(false);
      });
    });
  }, []);

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

  // 수정된 mainOptions (툴팁 정상 작동)
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
        formatter: function (val) {
          if (!val) return "";
          const parts = val.split(/[-\s]/);
          if (parts.length < 3) return val;
          const [_year, month, day] = parts;
          return `${month}월${day}일`;
        },
        style: { fontSize: '0.8em', color: 'var(--text-color)' }
      }
    },
    yaxis: { title: { text: "Percent", style: { fontSize: "1em", color: 'var(--text-color)' } }, decimalsInFloat: 2 },
    stroke: { curve: 'smooth', width: 2 },
    legend: { position: 'right', floating: false },
    tooltip: {
      shared: true,
      intersect: false,
      custom: function({ series, dataPointIndex, w }) {
        const label = w.globals.labels[dataPointIndex] || '';
        let tooltipHtml = `<div style="
          background: transparent; 
          padding: 10px; 
          border-radius: 8px; 
          box-shadow: 0 2px 10px rgba(0,0,0,0.3);
          font-size: 0.95em;
        ">`;
        tooltipHtml += `<div><strong>${label}</strong></div>`;

        series.forEach((s, idx) => {
          const value = s[dataPointIndex];
          if (value == null) return; // null이면 해당 시리즈 건너뜀
          tooltipHtml += `<div>${w.globals.seriesNames[idx]}: <span style="color:#36A2EB;">${value}%</span></div>`;
        });

        tooltipHtml += `</div>`;
        return tooltipHtml;
      }
    }
  };

  const renderTickerCharts = () => {
    return Object.keys(pred).map((ticker) => {
      const timestamps = Object.keys(pred[ticker]).sort();
      const predData = timestamps.map((ts) => pred[ticker][ts].pred);
      const realData = timestamps.map((ts) => pred[ticker][ts].real);
      const confidences = timestamps.map(ts => pred[ticker][ts].confidence);

      const avgConfidence = confidences.length > 0 ? (confidences.reduce((a, b) => a + b, 0) / confidences.length) : 0;
      const allValues = [...predData, ...realData].filter(v => v !== null && v !== undefined);
      const yMin = allValues.length > 0 ? Math.min(...allValues) * 0.9 : 0;

      const options = {
        chart: { type: "bar", height: 350, stacked: false, toolbar: { show: true } },
        plotOptions: { bar: { columnWidth: "50%" } },
        dataLabels: { enabled: false },
        colors: [coinColors[ticker], "#888888"],
        legend: { position: "right" },
        yaxis: { min: yMin, labels: { formatter: val => val.toLocaleString() } },
        xaxis: {
          categories: timestamps,
          tickAmount: 10,
          labels: {
            rotate: 0,
            formatter: function (val) {
              if (!val) return "";
              const parts = val.split(/[-T]/);
              if (parts.length < 3) return val;
              const [, month, day] = parts;
              return `${month}월${day}일`;
            },
            style: { fontSize: "0.8em" },
          },
        },
        tooltip: {
          shared: true,
          intersect: false,
          custom: function({ series, dataPointIndex, w }) {
            const predVal = series[0][dataPointIndex];
            const realVal = series[1][dataPointIndex];
            const diffPercent = realVal ? ((predVal - realVal) / realVal) * 100 : 0;
            const sign = diffPercent >= 0 ? "+" : "-";
            const color = diffPercent >= 0 ? "green" : "red";
            const confidence = pred[timestamps[dataPointIndex]]?.confidence || Math.max(0, 100 - Math.abs(diffPercent));
            return `
              <div style="
                background: transparent; 
                padding: 10px; 
                border-radius: 8px; 
                color: black; 
                font-size: 0.95em; 
                min-width: 160px;
                box-shadow: 0 2px 10px rgba(0,0,0,0.5);
              ">
                <div><strong>${w.globals.labels[dataPointIndex]}</strong></div>
                <div>Predicted: <span style="color:#36A2EB;">${predVal.toLocaleString()}</span></div>
                <div>Real: <span style="color:#FF6384;">${realVal.toLocaleString()}</span></div>
                <div>Diff: <span style="color:${color}">${sign}${Math.abs(diffPercent).toFixed(2)}%</span></div>
                <div>Confidence: <span style="color: black;">${confidence.toFixed(2)}%</span></div>
              </div>
            `;
          }
        }
      };

      const series = [
        { name: `${ticker} Predicted`, type: "bar", data: predData },
        { name: `${ticker} Real`, type: "bar", data: realData }
      ];

      return (
        <div className="predicted" key={ticker}>
          <h3>
            {ticker} Predicted vs Real Price 
            <span style={{ fontSize: "0.85em", marginLeft: "10px", color: "black" }}>
              (Avg Confidence: {avgConfidence.toFixed(2)}%)
            </span>
          </h3>
          <Chart options={options} series={series} type="bar" height="350" />
        </div>
      );
    });
  };

  if (loading) {
    return (
      <div className="loading-screen">
        <div className="spinner"></div>
        <div>Loading...</div>
      </div>
    );
  }

  return (
    <div className="chart-container">
      <h2>백테스팅 기간 2025-01-01 00:00:00 ~ 2025-08-10 00:00:00 UTC</h2>

      <div className="container">
        <div className="chart">
          <Chart options={mainOptions} series={series} type="line" height="100%" />
        </div>
      </div>

      <div className="strategy-cards">
        {strategies.map((s, idx) => (
          <div className="card" key={idx}>
            <h3>{s.name}</h3>
            <p onClick={() => openModal(s.prompt)}>{s.prompt}</p>
          </div>
        ))}
      </div>

      {modalContent && (
        <div className="modal" onClick={closeModal}>
          <div className="modal-content" onClick={e => e.stopPropagation()}>
            <pre>{modalContent}</pre>
          </div>
        </div>
      )}

      <h2>시계열 데이터 모델 예상 vs 실제 주가, 2025-12-11 00:00:00 ~ UTC</h2>
      <div className="firestore-container">
        {renderTickerCharts()}
      </div>
    </div>
  );
}
