// src/fetchBTCData.jsx
export const fetchBTCCloseData = async (market) => {
  const API_URL = "https://api.upbit.com/v1/candles/days";
  const MARKET = market;

  let allData = [];
  let toDate = new Date("2025-07-31T00:05:00Z");
  const fromDate = new Date("2024-12-31T00:05:00Z");

  const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

  // fetch with retry
  const fetchWithRetry = async (url, retries =30, delay = 1000) => {
    for (let i = 0; i < retries; i++) {
      try {
        const res = await fetch(url);
        if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
        const data = await res.json();
        return data;
      } catch (err) {
        console.warn(`Fetch attempt ${i + 1} failed: ${err.message}`);
        if (i < retries - 1) await sleep(delay);
        else throw err;
      }
    }
  };

  while (true) {
    const toISO = toDate.toISOString();
    const url = `${API_URL}?market=${MARKET}&to=${toISO}&count=200`;

    const data = await fetchWithRetry(url, 3, 1000);

    allData = [...data, ...allData]; // 앞쪽에 붙이기

    const oldestDate = new Date(data[data.length - 2].candle_date_time_utc);
    if (oldestDate <= fromDate) break;

    toDate = new Date(oldestDate.getTime() - 24 * 60 * 60 * 1000); // 하루 전
    await sleep(1000);
  }

  return allData.map((item) => ({
    date: item.candle_date_time_utc,
    close: item.trade_price,
  }));
};
