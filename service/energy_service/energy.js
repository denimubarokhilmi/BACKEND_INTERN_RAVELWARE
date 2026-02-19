import influx from "../../database/influx.js";

const parseMonth = (monthStr) => {
  if (!monthStr) return null;
  const monthMap = {
    jan: 1,
    feb: 2,
    mar: 3,
    apr: 4,
    may: 5,
    jun: 6,
    jul: 7,
    aug: 8,
    sep: 9,
    oct: 10,
    nov: 11,
    dec: 12,
  };
  const key = monthStr.toLowerCase().substring(0, 3);
  if (monthMap[key]) return monthMap[key];
  const num = parseInt(monthStr);
  return !isNaN(num) && num >= 1 && num <= 12 ? num : null;
};

const getEnergyData = async (panelId, month, year) => {
  const monthNum = parseMonth(month);
  const yearNum = parseInt(year) || new Date().getFullYear();
  const isMonthlyFilter = !!monthNum;

  let rangeStart, rangeStop;

  if (isMonthlyFilter) {
    rangeStart = `${yearNum}-${String(monthNum).padStart(2, "0")}-01T00:00:00Z`;
    const nextMonth = monthNum === 12 ? 1 : monthNum + 1;
    const nextYear = monthNum === 12 ? yearNum + 1 : yearNum;
    rangeStop = `${nextYear}-${String(nextMonth).padStart(2, "0")}-01T00:00:00Z`;
  } else {
    const d = new Date();
    d.setHours(0, 0, 0, 0);
    rangeStart = d.toISOString();
    rangeStop = "now()";
  }

  const fluxQuery = `
    from(bucket: "${process.env.INFLUX_BUCKET}")
      |> range(start: ${rangeStart}${isMonthlyFilter ? `, stop: ${rangeStop}` : ""})
      |> filter(fn: (r) => r["_measurement"] == "power_consumption")
      |> filter(fn: (r) => r["pmCode"] == "${panelId}")
  `;

  const rows = await influx.queryApi.collectRows(fluxQuery);

  return processEnergyLogic(rows, panelId, monthNum, yearNum, isMonthlyFilter);
};

const processEnergyLogic = (
  rows,
  panelId,
  monthNum,
  yearNum,
  isMonthlyFilter,
) => {
  if (rows.length === 0) return null;

  const grouped = rows.reduce((acc, row) => {
    const time = row._time;
    if (!acc[time]) acc[time] = { time };
    acc[time][row._field] = row._value;
    return acc;
  }, {});

  const times = Object.keys(grouped).sort();
  const latest = grouped[times[times.length - 1]];
  const first = grouped[times[0]];

  const lastUpdate = new Date(latest.time);
  const isOffline = (new Date() - lastUpdate) / 60000 > 5;

  let energy = 0;
  let cost = 0;

  if (isMonthlyFilter) {
    const byDate = {};
    times.forEach((t) => {
      const dateKey = t.substring(0, 10);
      if (!byDate[dateKey]) byDate[dateKey] = [];
      byDate[dateKey].push(grouped[t]);
    });

    let totalEnergy = 0;
    Object.values(byDate).forEach((dayRows) => {
      const sorted = dayRows.sort(
        (a, b) => new Date(a.time) - new Date(b.time),
      );
      const firstKwh = parseFloat(sorted[0].kwh ?? 0);
      const lastKwh = parseFloat(sorted[sorted.length - 1].kwh ?? 0);
      const dailyUsage = Math.max(0, lastKwh - firstKwh);
      totalEnergy += dailyUsage;
    });

    energy = parseFloat(totalEnergy.toFixed(2));
    cost = Math.round(energy * 1500);
  } else {
    energy = 0;
    const todayUsage = Math.max(
      0,
      parseFloat(latest.kwh ?? 0) - parseFloat(first.kwh ?? 0),
    );
    cost = Math.round(todayUsage * 1500);
  }

  const details = times.map((t) => ({
    time: t,
    kw: grouped[t].kw ?? null,
    ampere: grouped[t].ampere ?? null,
    voltage: grouped[t].voltage ?? null,
    kwh: grouped[t].kwh ?? null,
  }));

  return {
    pmCode: panelId,
    year: yearNum,
    month: monthNum || new Date().getMonth() + 1,
    date: {
      last_update: latest.time,
      formatted: new Date(latest.time).toLocaleString("id-ID"),
    },
    statusPanel: isOffline ? "OFFLINE" : "ONLINE",
    energy,
    cost,
    details,
  };
};

export { getEnergyData };
