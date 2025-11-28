import { useEffect, useMemo, useState } from "react";
import { Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, Tooltip, Legend, ArcElement, BarElement, type TooltipItem } from "chart.js";
import { Line, Pie, Bar } from "react-chartjs-2";
import { reportClient, type ReportResponse } from "../api/reportClient";

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Tooltip, Legend, ArcElement, BarElement);

const toInputValue = (date: Date) => date.toISOString().slice(0, 16);
const currencyFormatter = new Intl.NumberFormat("zh-CN", { style: "currency", currency: "CNY", maximumFractionDigits: 2 });
const numberFormatter = new Intl.NumberFormat("zh-CN", { maximumFractionDigits: 2 });

export function ReportPage() {
  const now = new Date();
  const [fromValue, setFromValue] = useState(toInputValue(new Date(now.getTime() - 24 * 60 * 60 * 1000)));
  const [toValue, setToValue] = useState(toInputValue(now));
  const [report, setReport] = useState<ReportResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
  const [trendMode, setTrendMode] = useState<"hour" | "day">("hour");
  const [page, setPage] = useState(0);
  const pageSize = 6;

  const loadReport = async () => {
    setLoading(true);
    setError(null);
    const fromIso = new Date(fromValue).toISOString();
    const toIso = new Date(toValue).toISOString();
    const { data, error } = await reportClient.fetchReport(fromIso, toIso);
    if (error) {
      setError(error);
      setReport(null);
    } else {
      setReport(data ?? null);
      setLastUpdated(new Date());
      setPage(0);
    }
    setLoading(false);
  };

  useEffect(() => {
    loadReport();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const roomsSorted = useMemo(() => {
    if (!report) return [];
    return [...report.rooms].sort((a, b) => b.fee - a.fee);
  }, [report]);
  const totalPages = Math.max(1, Math.ceil(roomsSorted.length / pageSize));
  const pagedRooms = roomsSorted.slice(page * pageSize, page * pageSize + pageSize);

  const trendData = useMemo(() => {
    if (!report) return [];
    if (trendMode === "hour") return report.trend;
    const dayMap = new Map<string, { fee: number; kwh: number }>();
    report.trend.forEach((point) => {
      const day = point.time.slice(0, 10);
      const bucket = dayMap.get(day) ?? { fee: 0, kwh: 0 };
      bucket.fee += point.fee;
      bucket.kwh += point.kwh;
      dayMap.set(day, bucket);
    });
    return Array.from(dayMap.entries())
      .sort(([a], [b]) => (a > b ? 1 : -1))
      .map(([day, value]) => ({ time: day, fee: value.fee, kwh: value.kwh }));
  }, [report, trendMode]);

  const topRooms = roomsSorted.slice(0, 10);
  const speedRate = report?.speedRate ?? { high: 0, mid: 0, low: 0 };

  const summaryCards = report
    ? [
        { title: "总收入", value: currencyFormatter.format(report.summary.totalRevenue) },
        { title: "空调收入", value: currencyFormatter.format(report.summary.acRevenue) },
        { title: "房费收入", value: currencyFormatter.format(report.summary.roomRevenue) },
        { title: "总耗电", value: `${numberFormatter.format(report.summary.totalKwh)} kWh` },
      ]
    : [];

  const lineChartData = {
    labels: trendData.map((item) => item.time),
    datasets: [
      {
        label: "费用 (¥)",
        data: trendData.map((item) => item.fee),
        borderColor: "#1d1d1f",
        backgroundColor: "rgba(29,29,31,0.05)",
        fill: true,
        tension: 0.4,
        yAxisID: "y",
      },
      {
        label: "耗电量 (kWh)",
        data: trendData.map((item) => item.kwh),
        borderColor: "#86868b",
        backgroundColor: "rgba(134,134,139,0.05)",
        fill: true,
        tension: 0.4,
        yAxisID: "y1",
      },
    ],
  };

  const pieChartData = {
    labels: ["高风", "中风", "低风"],
    datasets: [
      {
        data: [speedRate.high, speedRate.mid, speedRate.low],
        backgroundColor: ["#1d1d1f", "#86868b", "#d1d1d6"],
        hoverOffset: 4,
      },
    ],
  };

  const roomBarData = {
    labels: topRooms.map((room) => room.roomId),
    datasets: [
      {
        label: "空调费用 (¥)",
        data: topRooms.map((room) => room.fee),
        backgroundColor: "#1d1d1f",
        borderRadius: 4,
      },
    ],
  };

  return (
    <div className="space-y-10 animate-fade-in">
      {/* 页面标题 */}
      <header className="text-center">
        <h1 className="text-4xl font-semibold tracking-tight text-[#1d1d1f]">
          统计报表
        </h1>
        <p className="mt-3 text-[#86868b]">收入、能耗与使用分析</p>
      </header>

      {/* 时间筛选 */}
      <div className="rounded-2xl border border-black/[0.04] bg-white p-6">
        <div className="grid gap-4 md:grid-cols-2">
          <label className="block">
            <span className="text-xs text-[#86868b]">开始时间</span>
            <input 
              className="mt-2 w-full rounded-xl border border-black/[0.08] bg-[#f5f5f7] px-4 py-3 text-sm text-[#1d1d1f]" 
              type="datetime-local" 
              value={fromValue} 
              onChange={(e) => setFromValue(e.target.value)} 
            />
          </label>
          <label className="block">
            <span className="text-xs text-[#86868b]">结束时间</span>
            <input 
              className="mt-2 w-full rounded-xl border border-black/[0.08] bg-[#f5f5f7] px-4 py-3 text-sm text-[#1d1d1f]" 
              type="datetime-local" 
              value={toValue} 
              onChange={(e) => setToValue(e.target.value)} 
            />
          </label>
        </div>
        <div className="mt-4 flex items-center justify-between">
          <span className="text-xs text-[#86868b]">
            更新于 {lastUpdated ? lastUpdated.toLocaleString() : "--"}
          </span>
          <button
            className="rounded-full bg-[#0071e3] px-6 py-2 text-sm font-medium text-white transition-all hover:bg-[#0077ed] active:scale-[0.98] disabled:opacity-50"
            type="button"
            onClick={loadReport}
            disabled={loading}
          >
            {loading ? "加载中..." : "刷新"}
          </button>
        </div>
      </div>

      {error && (
        <div className="rounded-xl bg-[#ff3b30]/10 px-4 py-3 text-sm text-[#ff3b30]">{error}</div>
      )}

      {report ? (
        <div className="space-y-8">
          {/* 摘要卡片 */}
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            {summaryCards.map((card) => (
              <div key={card.title} className="rounded-2xl bg-[#f5f5f7] p-6">
                <p className="text-xs text-[#86868b]">{card.title}</p>
                <p className="mt-2 text-3xl font-semibold tracking-tight text-[#1d1d1f]">{card.value}</p>
              </div>
            ))}
          </div>

          {/* 趋势 + 饼图 */}
          <div className="grid gap-6 lg:grid-cols-3">
            <div className="rounded-2xl border border-black/[0.04] bg-white p-6 lg:col-span-2">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="text-lg font-semibold text-[#1d1d1f]">趋势分析</h3>
                  <p className="text-xs text-[#86868b]">费用与能耗变化</p>
                </div>
                <div className="inline-flex rounded-full bg-[#f5f5f7] p-1">
                  {["hour", "day"].map((mode) => (
                    <button
                      key={mode}
                      className={`rounded-full px-3 py-1 text-xs font-medium transition ${trendMode === mode ? "bg-white text-[#1d1d1f] shadow-sm" : "text-[#86868b]"}`}
                      onClick={() => setTrendMode(mode as "hour" | "day")}
                      type="button"
                    >
                      {mode === "hour" ? "按时" : "按天"}
                    </button>
                  ))}
                </div>
              </div>
              {trendData.length > 0 ? (
                <Line
                  data={lineChartData}
                  options={{
                    responsive: true,
                    interaction: { mode: "index", intersect: false },
                    plugins: { legend: { position: "bottom", labels: { usePointStyle: true } } },
                    scales: {
                      y: { title: { display: true, text: "费用 (¥)" }, grid: { color: "rgba(0,0,0,0.04)" } },
                      y1: { position: "right", grid: { drawOnChartArea: false }, title: { display: true, text: "耗电 (kWh)" } },
                    },
                  }}
                />
              ) : (
                <p className="text-center text-sm text-[#86868b] py-8">暂无数据</p>
              )}
            </div>
            
            <div className="rounded-2xl border border-black/[0.04] bg-white p-6">
              <h3 className="text-lg font-semibold text-[#1d1d1f]">风速占比</h3>
              <p className="text-xs text-[#86868b]">使用时长分布</p>
              {speedRate.high + speedRate.mid + speedRate.low > 0 ? (
                <div className="mt-4">
                  <Pie
                    data={pieChartData}
                    options={{
                      plugins: {
                        legend: { position: "bottom", labels: { usePointStyle: true } },
                        tooltip: {
                          callbacks: {
                            label: (ctx: TooltipItem<"pie">) => {
                              const value = ctx.parsed as number;
                              return `${ctx.label}: ${(value * 100).toFixed(1)}%`;
                            },
                          },
                        },
                      },
                    }}
                  />
                </div>
              ) : (
                <p className="text-center text-sm text-[#86868b] py-8">暂无数据</p>
              )}
            </div>
          </div>

          {/* 房间表格 + TOP10 */}
          <div className="grid gap-6 lg:grid-cols-3">
            <div className="rounded-2xl border border-black/[0.04] bg-white lg:col-span-2">
              <div className="flex items-center justify-between border-b border-black/[0.04] px-6 py-4">
                <div>
                  <h3 className="text-lg font-semibold text-[#1d1d1f]">房间明细</h3>
                  <p className="text-xs text-[#86868b]">按费用排序 · 第 {page + 1}/{totalPages} 页</p>
                </div>
                <div className="flex items-center gap-2">
                  <button 
                    className="rounded-lg border border-black/[0.08] px-3 py-1 text-xs disabled:opacity-30" 
                    disabled={page === 0} 
                    onClick={() => setPage((p) => Math.max(p - 1, 0))}
                    type="button"
                  >
                    上一页
                  </button>
                  <button 
                    className="rounded-lg border border-black/[0.08] px-3 py-1 text-xs disabled:opacity-30" 
                    disabled={page >= totalPages - 1} 
                    onClick={() => setPage((p) => Math.min(p + 1, totalPages - 1))}
                    type="button"
                  >
                    下一页
                  </button>
                </div>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="bg-[#f5f5f7] text-xs text-[#86868b]">
                    <tr>
                      <th className="px-4 py-3 text-left">房间</th>
                      <th className="px-4 py-3 text-left">时长</th>
                      <th className="px-4 py-3 text-left">高/中/低</th>
                      <th className="px-4 py-3 text-left">耗电</th>
                      <th className="px-4 py-3 text-right">费用</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-black/[0.04]">
                    {pagedRooms.length === 0 && (
                      <tr><td className="px-4 py-6 text-center text-[#86868b]" colSpan={5}>暂无数据</td></tr>
                    )}
                    {pagedRooms.map((room) => (
                      <tr key={room.roomId} className="hover:bg-[#f5f5f7]/50 transition-colors">
                        <td className="px-4 py-3 font-semibold text-[#1d1d1f]">#{room.roomId}</td>
                        <td className="px-4 py-3 text-[#86868b]">{numberFormatter.format(room.minutes)} min</td>
                        <td className="px-4 py-3 text-[#86868b]">{room.highCount}/{room.midCount}/{room.lowCount}</td>
                        <td className="px-4 py-3 text-[#86868b]">{numberFormatter.format(room.kwh)} kWh</td>
                        <td className="px-4 py-3 text-right font-semibold text-[#1d1d1f]">{currencyFormatter.format(room.fee)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
            
            <div className="rounded-2xl border border-black/[0.04] bg-white p-6">
              <h3 className="text-lg font-semibold text-[#1d1d1f]">费用 TOP10</h3>
              {topRooms.length > 0 ? (
                <div className="mt-4">
                  <Bar
                    data={roomBarData}
                    options={{
                      indexAxis: "y" as const,
                      plugins: { legend: { display: false } },
                      scales: { 
                        x: { beginAtZero: true, grid: { color: "rgba(0,0,0,0.04)" } },
                        y: { grid: { display: false } }
                      },
                    }}
                  />
                </div>
              ) : (
                <p className="text-center text-sm text-[#86868b] py-8">暂无数据</p>
              )}
            </div>
          </div>
        </div>
      ) : (
        <div className="rounded-2xl bg-[#f5f5f7] py-16 text-center">
          <p className="text-sm text-[#86868b]">调整时间范围后点击刷新</p>
        </div>
      )}
    </div>
  );
}
