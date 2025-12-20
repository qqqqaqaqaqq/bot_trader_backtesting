import React from "react";
import Chart from "react-apexcharts";

import { Day } from './DAY/Day';
import { Wallet } from './DAY/Wallet';
import { Wallet_Strategy_1 } from './DAY/Wallet_Strategy_1';
import { Wallet_Strategy_2 } from "./DAY/Wallet_Strategy_2";

import './styles/DAY.css';

const PROMPT_1 = `확실한 상승 신호일때만 매수 진행해줘.
단기 상승 판단을 하더라도 위험성이 존재하므로 매수 금지 해줘.
너무 많은 거래는 자제해줘
손실이 5% 이상일 경우 부분 매도해줘. 로스컷의 양은 너가 정해줘.
수익이 5% 이상일 경우 부분 매도해줘. 이익실현의 양은 너가 정해줘.
거래량을 중요하게 봐줘`;

const PROMPT_2 = `확실한 상승 신호일때만 매수 진행해줘.
단기 상승 판단을 하더라도 위험성이 존재하므로 매수 금지 해줘.
너무 많은 거래는 자제해줘
손실이 5% 이상일 경우 부분 매도해줘. 로스컷의 양은 너가 정해줘.
수익 시 너의 판단하에 결정해줘
확실한 하락장이라고 판단되는 경우 손절 후 홀딩 해줘.
홀드 하는것도 하나의 중요한 전략이라 나는 생각해
거래량을 중요하게 봐줘`;


export default function DAY() {

  const series = [
    { name: "GPT", data: Wallet },
    { name: "GPT + Strategy_A", data: Wallet_Strategy_1 },
    { name: "GPT + Strategy_B", data: Wallet_Strategy_2 }
  ];

  // 메인 차트 옵션
  const mainOptions = {
    chart: { 
      type: 'line', 
      height: 500, 
      zoom: { enabled: true }, 
      toolbar: { show: true }, 
      animations: { enabled: true } 
    },
    colors: ["#9467bd", "#8c564b", "#c244ab"],
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
      decimalsInFloat: 2 },
    stroke: { curve: 'straight', width: 2 },
    legend: { position: 'top' },
    tooltip: { shared: true, intersect: false }
  };


  return (
    <div className="chart-container">
      {/* Header */}
      <h2>기간 2025-01-01 00:00:00 ~ 2025-08-10 00:00:00 UTC</h2>

      {/* Body */}
      <div className="container">
        <div className="chart">
          <Chart options={mainOptions} series={series} type="line" height="100%" />
                 
        </div>
      </div>

    <div className="StrategyCard">
      <h3>Wallet_Strategy_1</h3>
      <div className="StrategyContent">
        {PROMPT_1.split("\n").map((line, index) => (
          <p key={index}>{line}</p>
        ))}
      </div>
  
    </div>

    <div className="StrategyCard">
      <h3>Wallet_Strategy_2</h3>
      <div className="StrategyContent">
        {PROMPT_2.split("\n").map((line, index) => (
          <p key={index}>{line}</p>
        ))}
      </div>      
    </div>

    </div>
  );
}
