import { useEffect, useMemo, useState } from "react";
import { RoomStatusGrid } from "../components";
import { monitorClient } from "../api/monitorClient";
import type { RoomStatus } from "../types/rooms";

type QueuePanelProps = {
  serving: RoomStatus[];
  waiting: RoomStatus[];
};

function QueuePanel({ serving, waiting }: QueuePanelProps) {
  const maxSlots = 3;
  const utilization = Math.min(1, serving.length / maxSlots);
  
  return (
    <section className="rounded-2xl border border-black/[0.04] bg-white p-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold text-[#1d1d1f]">调度队列</h3>
          <p className="mt-1 text-xs text-[#86868b]">资源占用情况</p>
        </div>
        <div className="text-right text-xs text-[#86868b]">
          <p>服务中 <span className="font-semibold text-[#1d1d1f]">{serving.length}</span> / {maxSlots}</p>
          <p>等待中 <span className="font-semibold text-[#1d1d1f]">{waiting.length}</span></p>
        </div>
      </div>
      
      {/* 进度条 */}
      <div className="mt-5 h-1.5 w-full rounded-full bg-[#f5f5f7]">
        <div 
          className="h-full rounded-full bg-[#1d1d1f] transition-all duration-500" 
          style={{ width: `${utilization * 100}%` }} 
        />
      </div>
      
      <div className="mt-6 grid gap-4 md:grid-cols-2">
        {/* 服务中 */}
        <div className="rounded-xl bg-[#f5f5f7] p-4">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-medium text-[#1d1d1f]">服务中</span>
            <span className="flex items-center gap-1.5 text-[10px] text-[#34c759]">
              <span className="h-1.5 w-1.5 rounded-full bg-[#34c759]" />
              {serving.length} 个
            </span>
          </div>
          {serving.length === 0 ? (
            <p className="text-xs text-[#86868b]">暂无</p>
          ) : (
            <ul className="space-y-2">
              {serving.map((room) => (
                <li key={room.roomId} className="rounded-lg bg-white px-3 py-2 text-xs">
                  <div className="flex justify-between">
                    <span className="font-semibold text-[#1d1d1f]">#{room.roomId}</span>
                    <span className="text-[#86868b]">{room.serviceSpeed ?? room.speed ?? "-"}</span>
                  </div>
                  <p className="text-[#86868b] mt-0.5">已服务 {room.servedSeconds}s</p>
                </li>
              ))}
            </ul>
          )}
        </div>
        
        {/* 等待中 */}
        <div className="rounded-xl bg-[#f5f5f7] p-4">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-medium text-[#1d1d1f]">等待中</span>
            <span className="flex items-center gap-1.5 text-[10px] text-[#ff9500]">
              <span className="h-1.5 w-1.5 rounded-full bg-[#ff9500]" />
              {waiting.length} 个
            </span>
          </div>
          {waiting.length === 0 ? (
            <p className="text-xs text-[#86868b]">暂无</p>
          ) : (
            <ul className="space-y-2">
              {waiting.map((room) => (
                <li key={room.roomId} className="rounded-lg bg-white px-3 py-2 text-xs">
                  <div className="flex justify-between">
                    <span className="font-semibold text-[#1d1d1f]">#{room.roomId}</span>
                    <span className="text-[#86868b]">{room.waitSpeed ?? room.speed ?? "-"}</span>
                  </div>
                  <p className="text-[#86868b] mt-0.5">等待 {room.waitedSeconds}s</p>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </section>
  );
}

export function MonitorPage() {
  const [rooms, setRooms] = useState<RoomStatus[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
  const [selectedRoom, setSelectedRoom] = useState<RoomStatus | null>(null);

  useEffect(() => {
    let cancelled = false;
    const load = async () => {
      const { data, error } = await monitorClient.fetchRooms();
      if (cancelled) return;
      if (error) {
        setError(error);
        return;
      }
      setRooms(data?.rooms ?? []);
      setLastUpdated(new Date());
      setError(null);
    };
    load();
    const interval = window.setInterval(load, 4000);
    return () => {
      cancelled = true;
      window.clearInterval(interval);
    };
  }, []);

  const activeRooms = useMemo(() => rooms.filter((room) => room.status !== "idle" || room.isServing || room.isWaiting), [rooms]);
  const serving = useMemo(() => rooms.filter((room) => room.isServing), [rooms]);
  const waiting = useMemo(() => rooms.filter((room) => room.isWaiting), [rooms]);

  return (
    <div className="space-y-8 animate-fade-in">
      {error && (
        <div className="rounded-xl bg-[#ff3b30]/10 px-4 py-3 text-sm text-[#ff3b30]">
          {error}
        </div>
      )}

      {/* 页面标题 */}
      <header className="flex items-end justify-between">
        <div>
          <h1 className="text-4xl font-semibold tracking-tight text-[#1d1d1f]">
            监控面板
          </h1>
          <p className="mt-2 text-[#86868b]">实时查看所有房间状态</p>
        </div>
        <div className="text-right text-xs text-[#86868b]">
          <p>{activeRooms.length} 间活跃</p>
          <p>更新于 {lastUpdated ? lastUpdated.toLocaleTimeString() : "--"}</p>
        </div>
      </header>

      <QueuePanel serving={serving} waiting={waiting} />
      <RoomStatusGrid rooms={activeRooms} onRoomClick={setSelectedRoom} />

      {/* 房间详情浮动信息卡片 - OpenAI DeepResearch 风格 */}
      {selectedRoom && (
        <div
          className="fixed inset-0 z-40 flex items-center justify-center p-4 sm:p-6 animate-[fadeIn_180ms_ease-out]"
          tabIndex={-1}
          onKeyDown={(e) => e.key === "Escape" && setSelectedRoom(null)}
          ref={(el) => el?.focus()}
        >
          {/* 背景蒙层 */}
          <div
            className="absolute inset-0 bg-black/40 backdrop-blur-[12px] animate-[fadeIn_180ms_ease-out]"
            onClick={() => setSelectedRoom(null)}
          />

          {/* 悬浮信息卡片 */}
          <div
            className="relative w-full max-w-[460px] max-h-[90vh] flex flex-col
                       bg-white/90 backdrop-blur-xl
                       rounded-[20px]
                       shadow-[0_8px_32px_rgba(0,0,0,0.12)]
                       border border-white/40
                       animate-[monitorCardIn_160ms_cubic-bezier(0.16,1,0.3,1)]
                       overflow-hidden"
          >
            {/* 状态条 / 小 Banner */}
            <div className="flex items-center justify-between px-6 pt-5 pb-3 border-b border-white/60 bg-white/60">
              <div className="flex items-center gap-2.5">
                <span className="inline-flex h-5 w-5 items-center justify-center rounded-full bg-[#10a37f]/10">
                  <span className="h-2 w-2 rounded-full bg-[#10a37f]" />
                </span>
                <span className="text-[12px] font-medium text-[#10a37f]">
                  房间 #{selectedRoom.roomId} · {selectedRoom.status}
                </span>
              </div>
              <button
                onClick={() => setSelectedRoom(null)}
                className="flex h-8 w-8 items-center justify-center rounded-lg text-[#8e8ea0] hover:bg-[#f5f5f7] hover:text-[#1d1d1f] transition-colors"
                aria-label="关闭详情"
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                  <path d="M18 6L6 18M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* 标题区 */}
            <div className="px-6 pt-4 pb-3">
              <h2 className="text-[20px] font-semibold leading-tight text-[#0d0d0d] tracking-[-0.01em]">
                房间 #{selectedRoom.roomId}
              </h2>
              <p className="mt-1 text-[13px] text-[#6e6e80] leading-relaxed">
                实时监控此房间的温度、费用与调度状态
              </p>
            </div>

            {/* 内容区：多 Section 排版 */}
            <div className="flex-1 overflow-y-auto px-6 pb-5 space-y-4">
              {/* Section 1：温度与模式 */}
              <section className="rounded-2xl bg-[#f5f5f7]/80 border border-[#e5e5e7]/70 p-4 animate-[sectionIn_200ms_ease-out]">
                <div className="mb-3 flex items-center justify-between">
                  <div>
                    <p className="text-[12px] uppercase tracking-[0.12em] text-[#8e8ea0]">Temperature</p>
                    <p className="mt-0.5 text-[14px] font-medium text-[#0d0d0d]">温度与模式</p>
                  </div>
                  <span className="rounded-full bg-white px-3 py-1 text-[11px] text-[#8e8ea0]">
                    模式：{selectedRoom.mode ?? "--"}
                  </span>
                </div>
                <div className="grid grid-cols-3 gap-4 text-[13px]">
                  <div>
                    <p className="text-[11px] text-[#8e8ea0]">当前温度</p>
                    <p className="mt-1 text-[20px] font-semibold text-[#0d0d0d]">
                      {selectedRoom.currentTemp.toFixed(1)}°
                    </p>
                  </div>
                  <div>
                    <p className="text-[11px] text-[#8e8ea0]">目标温度</p>
                    <p className="mt-1 text-[18px] text-[#4b4b4f]">
                      {selectedRoom.targetTemp.toFixed(1)}°
                    </p>
                  </div>
                  <div>
                    <p className="text-[11px] text-[#8e8ea0]">风速</p>
                    <p className="mt-1 text-[14px] text-[#0d0d0d]">
                      {selectedRoom.speed ?? "--"}
                    </p>
                  </div>
                </div>
              </section>

              {/* Section 2：费用概览 */}
              <section className="rounded-2xl bg-[#f5f5f7]/80 border border-[#e5e5e7]/70 p-4 animate-[sectionIn_200ms_ease-out_40ms_both]">
                <div className="mb-3 flex items-center justify-between">
                  <div>
                    <p className="text-[12px] uppercase tracking-[0.12em] text-[#8e8ea0]">Billing</p>
                    <p className="mt-0.5 text-[14px] font-medium text-[#0d0d0d]">费用情况</p>
                  </div>
                  <span className="rounded-full bg-white px-3 py-1 text-[11px] text-[#8e8ea0]">
                    当前周期
                  </span>
                </div>
                <div className="grid grid-cols-2 gap-4 text-[13px]">
                  <div>
                    <p className="text-[11px] text-[#8e8ea0]">本次费用</p>
                    <p className="mt-1 text-[18px] font-semibold text-[#0d0d0d]">
                      ¥{selectedRoom.currentFee.toFixed(2)}
                    </p>
                  </div>
                  <div>
                    <p className="text-[11px] text-[#8e8ea0]">累计费用</p>
                    <p className="mt-1 text-[18px] font-semibold text-[#0d0d0d]">
                      ¥{selectedRoom.totalFee.toFixed(2)}
                    </p>
                  </div>
                  <div>
                    <p className="text-[11px] text-[#8e8ea0]">服务时长</p>
                    <p className="mt-1 text-[14px] text-[#0d0d0d]">
                      {selectedRoom.servedSeconds}s
                    </p>
                  </div>
                  <div>
                    <p className="text-[11px] text-[#8e8ea0]">状态</p>
                    <p className="mt-1 text-[14px] text-[#0d0d0d]">
                      {selectedRoom.status}
                    </p>
                  </div>
                </div>
              </section>

              {/* Section 3：调度情况 / 队列信息 */}
              <section className="rounded-2xl bg-[#f5f5f7]/80 border border-[#e5e5e7]/70 p-4 animate-[sectionIn_200ms_ease-out_80ms_both]">
                <div className="mb-3 flex items-center justify-between">
                  <div>
                    <p className="text-[12px] uppercase tracking-[0.12em] text-[#8e8ea0]">Scheduling</p>
                    <p className="mt-0.5 text-[14px] font-medium text-[#0d0d0d]">调度与队列</p>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4 text-[13px]">
                  <div>
                    <p className="text-[11px] text-[#8e8ea0]">是否服务中</p>
                    <p className="mt-1 text-[14px] text-[#0d0d0d]">
                      {selectedRoom.isServing ? "是" : "否"}
                    </p>
                  </div>
                  <div>
                    <p className="text-[11px] text-[#8e8ea0]">是否在队列</p>
                    <p className="mt-1 text-[14px] text-[#0d0d0d]">
                      {selectedRoom.isWaiting ? "是" : "否"}
                    </p>
                  </div>
                </div>
              </section>
            </div>

            {/* 操作区 */}
            <div className="flex items-center justify-between gap-3 border-t border-[#e5e5e7]/80 bg-white/80 px-6 py-4">
              <button
                type="button"
                onClick={() => setSelectedRoom(null)}
                className="h-10 rounded-full border border-[#dedee3] px-4 text-[13px] text-[#4b4b4f] hover:bg-[#f5f5f7] transition-colors"
              >
                关闭
              </button>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setSelectedRoom(null)}
                  className="h-10 rounded-full bg-[#f5f5f7] px-4 text-[13px] text-[#4b4b4f] hover:bg-[#ebebef] transition-colors"
                >
                  返回监控
                </button>
                <button
                  type="button"
                  className="h-10 rounded-full bg-[#10a37f] px-5 text-[13px] font-medium text-white shadow-[0_2px_8px_rgba(16,163,127,0.35)] hover:bg-[#0e9470] transition-colors"
                >
                  更多操作
                </button>
              </div>
            </div>
          </div>

          {/* 动画 keyframes */}
          <style>{`
            @keyframes monitorCardIn {
              from { opacity: 0; transform: scale(0.95) translateY(4px); }
              to { opacity: 1; transform: scale(1) translateY(0); }
            }
            @keyframes sectionIn {
              from { opacity: 0; transform: translateY(4px); }
              to { opacity: 1; transform: translateY(0); }
            }
            @keyframes fadeIn {
              from { opacity: 0; }
              to { opacity: 1; }
            }
          `}</style>
        </div>
      )}
    </div>
  );
}
