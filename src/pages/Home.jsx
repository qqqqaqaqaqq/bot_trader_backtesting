import React, { useEffect, useState } from "react";
import BackTest from './BackTest'
import BTCPredChart from './pred/BTCPredChart'
import ETHPredChart from './pred/ETHPredChart'
import XRPPredChart from './pred/XRPPredChart'
import BCHPredChart from './pred/BCHPredChart'
import './styles/home.css'
import { fetchBTCCloseData } from './Upbit'
import { createClient } from "@supabase/supabase-js";

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

const BASE_CLOSE = 139257000; // 2024-12-31 종가 KRW

// LSTM 타입 정의
const LSTM_TYPES = {
  BTC: ["btc_lstm_prediction_86400_type1", "btc_lstm_prediction_86400_type2", "btc_lstm_prediction_86400_type3"],
  ETH: ["eth_lstm_prediction_86400_type1", "eth_lstm_prediction_86400_type2", "eth_lstm_prediction_86400_type3"],
  XRP: ["xrp_lstm_prediction_86400_type1", "xrp_lstm_prediction_86400_type2", "xrp_lstm_prediction_86400_type3"],
  BCH: ["bch_lstm_prediction_86400_type1", "bch_lstm_prediction_86400_type2", "bch_lstm_prediction_86400_type3"]
};

const MINI_COLLECTIONS = [
  "gemini_2_5_pro_st1", 
  "gemini_2_5_pro_st2", 
  "gemini_2_5_pro_st3",
  "gpt_5_0_mini_st1",
  "gpt_5_0_mini_st2",  
  "gpt_5_0_mini_st3",  
];

// Supabase LSTM fetch 공통 함수
async function fetchAllPredictions(coin) {
  const types = LSTM_TYPES[coin];
  let result = {};

  for (const type of types) {
    const { data, error } = await supabase
      .from(type)
      .select("time, close_pct")
      .order("time", { ascending: true });

    if (error) {
      console.error(`Supabase error [${type}]`, error);
      continue;
    }

    if (!data || data.length === 0) continue;

    result[type] = data.map(item => ({
      x: item.time.split("T")[0],
      y: item.close_pct
    }));
  }

  return result;
}

// 백테스트 fetch
async function fetchBacktest() {
  let result = {};

  for (const tableName of MINI_COLLECTIONS) {
    const { data, error } = await supabase
      .from(tableName)
      .select("time, total_asset")
      .order("time", { ascending: true });

    if (error) {
      console.error(`Supabase error [${tableName}]`, error);
      continue;
    }

    if (!data || data.length === 0) continue;
    result[tableName] = data;
  }

  return result;
}

// LSTM pct 계산 공통 함수
function convertToCumulativeSeries(dataObj) {
  const seriesData = [];

  for (const [type, rows] of Object.entries(dataObj)) {
    const cumulativeData = [{ x: "2024-12-31T00:05:00Z", y: 0 }];
    let currentPrice = BASE_CLOSE;

    rows.forEach(row => {
      currentPrice = Math.round(currentPrice * (1 + row.y / 100));
      const pctChange = ((currentPrice - BASE_CLOSE) / BASE_CLOSE) * 100;

      cumulativeData.push({ x: row.x, y: Math.round(pctChange * 100) / 100 });
    });

    seriesData.push({ name: type, data: cumulativeData });
  }

  return seriesData;
}

// 실제 종가 데이터 fetch 공통 함수
async function fetchCloseData(symbol) {
  try {
    let data = await fetchBTCCloseData(`KRW-${symbol}`);
    data = data.sort((a, b) => new Date(a.date) - new Date(b.date));

    const filteredData = data.filter(item => {
      const ts = new Date(item.date).getTime();
      const start = new Date("2024-12-30T00:00:00Z").getTime();
      const end = new Date("2025-07-31T23:59:59Z").getTime();
      return ts >= start && ts <= end;
    });

    if (filteredData.length === 0) return [];

    const firstClose = filteredData[0].close;
    return filteredData.map(item => ({
      x: item.date,
      y: Number(((item.close - firstClose) / firstClose * 100).toFixed(2))
    }));
  } catch (err) {
    console.error(`${symbol} 데이터 가져오기 실패:`, err);
    return [];
  }
}

export default function Home() {
  const [backtestResult, setBacktestResult] = useState({});
  const [series, setSeries] = useState({ BTC: [], ETH: [], XRP: [], BCH: [] });
  const [closeData, setCloseData] = useState({ BTC: [], ETH: [], XRP: [], BCH: [] });

  useEffect(() => { 
    fetchBacktest().then((data) => {
      setBacktestResult(data);
    });
  }, []);

  useEffect(() => {
    const loadSeries = async () => {
      const BTC = convertToCumulativeSeries(await fetchAllPredictions("BTC"));
      const ETH = convertToCumulativeSeries(await fetchAllPredictions("ETH"));
      const XRP = convertToCumulativeSeries(await fetchAllPredictions("XRP"));
      const BCH = convertToCumulativeSeries(await fetchAllPredictions("BCH"));
      setSeries({ BTC, ETH, XRP, BCH });
    };
    loadSeries();
  }, []);

  useEffect(() => {
    const loadCloseData = async () => {
      const BTC = await fetchCloseData("BTC");
      const ETH = await fetchCloseData("ETH");
      const XRP = await fetchCloseData("XRP");
      const BCH = await fetchCloseData("BCH");
      setCloseData({ BTC, ETH, XRP, BCH });
    };
    loadCloseData();
  }, []);

  return (
    <div className="home-frame">
      <BackTest backtestResult={backtestResult}/>
      <BTCPredChart series={series.BTC} DATA={closeData.BTC}/>
      {/* <ETHPredChart series={series.ETH} DATA={closeData.ETH}/>
      <XRPPredChart series={series.XRP} DATA={closeData.XRP}/>
      <BCHPredChart series={series.BCH} DATA={closeData.BCH}/> */}
    </div>
  );
}
