import { useEffect, useMemo, useState } from "react";
import { RoomStatusGrid } from "../components";
import { monitorClient } from "../api/monitorClient";
import { acClient } from "../api/acClient";
import type { RoomStatus } from "../types/rooms";

type SchedulerVisualizerProps = {
  serving: RoomStatus[];
  waiting: RoomStatus[];
};

function SchedulerVisualizer({ serving, waiting }: SchedulerVisualizerProps) {
  // Group waiting by priority
  const waitingHigh = waiting.filter((r) => (r.waitSpeed ?? r.speed) === "HIGH");
  const waitingMid = waiting.filter((r) => (r.waitSpeed ?? r.speed) === "MID");
  const waitingLow = waiting.filter((r) => (r.waitSpeed ?? r.speed) === "LOW");

  // Sort by wait time (descending) within priority
  const sortByWait = (a: RoomStatus, b: RoomStatus) => (b.waitedSeconds ?? 0) - (a.waitedSeconds ?? 0);
  waitingHigh.sort(sortByWait);
  waitingMid.sort(sortByWait);
  waitingLow.sort(sortByWait);

  const maxSlots = 3;

  return (
    <section className="rounded-2xl border border-black/[0.04] bg-white p-6 shadow-sm">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold text-[#1d1d1f]">调度算法可视化</h3>
          <p className="mt-1 text-xs text-[#86868b]">Real-time Scheduler State</p>
        </div>
        <div className="flex items-center gap-4 text-xs">
          <div className="flex items-center gap-1.5">
            <span className="h-2 w-2 rounded-full bg-[#ff3b30]" />
            <span>High Priority</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="h-2 w-2 rounded-full bg-[#ffcc00]" />
            <span>Mid Priority</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="h-2 w-2 rounded-full bg-[#34c759]" />
            <span>Low Priority</span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-8 lg:grid-cols-[1fr_auto_1fr]">
        {/* Left: Wait Queue (Priority Buckets) */}
        <div className="space-y-4">
          <div className="flex items-center justify-between text-xs font-medium text-[#86868b]">
            <span>WAIT QUEUE (按优先级排序)</span>
            <span>{waiting.length} 房间</span>
          </div>
          
          <div className="relative min-h-[200px] rounded-xl bg-[#f5f5f7] p-3 space-y-3">
            {/* High Priority Lane */}
            <div className="relative">
              <div className="absolute -left-1 top-0 bottom-0 w-1 rounded-full bg-[#ff3b30]/20" />
              <div className="pl-3 space-y-2">
                {waitingHigh.length === 0 && <div className="text-[10px] text-[#86868b] py-1">无高优先级等待</div>}
                {waitingHigh.map((r) => (
                  <WaitCard key={r.roomId} room={r} color="bg-[#ff3b30]" />
                ))}
              </div>
            </div>
            
            {/* Mid Priority Lane */}
            <div className="relative border-t border-dashed border-gray-200 pt-3">
              <div className="absolute -left-1 top-3 bottom-0 w-1 rounded-full bg-[#ffcc00]/20" />
              <div className="pl-3 space-y-2">
                {waitingMid.length === 0 && <div className="text-[10px] text-[#86868b] py-1">无中优先级等待</div>}
                {waitingMid.map((r) => (
                  <WaitCard key={r.roomId} room={r} color="bg-[#ffcc00]" />
                ))}
              </div>
            </div>

            {/* Low Priority Lane */}
            <div className="relative border-t border-dashed border-gray-200 pt-3">
              <div className="absolute -left-1 top-3 bottom-0 w-1 rounded-full bg-[#34c759]/20" />
              <div className="pl-3 space-y-2">
                {waitingLow.length === 0 && <div className="text-[10px] text-[#86868b] py-1">无低优先级等待</div>}
                {waitingLow.map((r) => (
                  <WaitCard key={r.roomId} room={r} color="bg-[#34c759]" />
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Center: Scheduler Logic Visualization */}
        <div className="flex flex-col items-center justify-center gap-4 py-4">
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-[#1d1d1f] text-white shadow-lg">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M2 12h20M12 2v20" className="opacity-20" />
              <path d="M20.24 12.24a6 6 0 0 0-8.49-8.49L5 10.5V19h8.5z" />
            </svg>
          </div>
          <div className="flex flex-col items-center gap-1">
            <div className="h-16 w-0.5 bg-gradient-to-b from-[#1d1d1f] to-transparent opacity-20" />
            <span className="text-[10px] font-medium text-[#86868b] uppercase tracking-wider">Dispatch</span>
            <div className="h-16 w-0.5 bg-gradient-to-t from-[#1d1d1f] to-transparent opacity-20" />
          </div>
        </div>

        {/* Right: Service Queue (Slots) */}
        <div className="space-y-4">
          <div className="flex items-center justify-between text-xs font-medium text-[#86868b]">
            <span>SERVICE SLOTS (时间片轮转)</span>
            <span>{serving.length} / {maxSlots} 运行中</span>
          </div>

          <div className="grid gap-3">
            {Array.from({ length: maxSlots }).map((_, i) => {
              const room = serving[i];
              return (
                <div
                  key={i}
                  className={`relative flex h-20 items-center justify-between overflow-hidden rounded-xl border px-4 transition-all ${
                    room
                      ? "border-[#10a37f]/20 bg-[#10a37f]/5"
                      : "border-dashed border-gray-200 bg-[#f5f5f7]/50"
                  }`}
                >
                  {room ? (
                    <>
                      <div className="z-10">
                        <div className="flex items-center gap-2">
                          <span className="font-semibold text-[#1d1d1f]">Room {room.roomId}</span>
                          <span className="rounded text-[10px] font-medium uppercase text-[#10a37f]">Running</span>
                        </div>
                        <div className="mt-1 text-[11px] text-[#6e6e80]">
                          已服务 {(room.servedSeconds / 60).toFixed(1)} min
                        </div>
                      </div>
                      <div className="z-10 text-right">
                        <div className="text-[10px] text-[#86868b]">当前费用</div>
                        <div className="font-mono text-sm font-medium text-[#1d1d1f]">
                          ¥{room.currentFee.toFixed(2)}
                        </div>
                      </div>
                      {/* Progress Bar Background */}
                      <div 
                        className="absolute bottom-0 left-0 h-1 bg-[#10a37f]/20 transition-all duration-1000"
                        style={{ width: `${Math.min(100, (room.servedSeconds % 120) / 1.2)}%` }} // Fake time slice viz
                      />
                    </>
                  ) : (
                    <div className="flex w-full items-center justify-center text-xs text-[#86868b]">
                      空闲插槽
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}

function WaitCard({ room, color }: { room: RoomStatus; color: string }) {
  return (
    <div className="flex items-center justify-between rounded-lg bg-white p-2.5 shadow-sm ring-1 ring-black/[0.04]">
      <div className="flex items-center gap-2.5">
        <div className={`h-2 w-2 rounded-full ${color}`} />
        <span className="text-xs font-medium text-[#1d1d1f]">Room {room.roomId}</span>
      </div>
      <div className="text-[10px] text-[#86868b]">
        Wait: {room.waitedSeconds}s
      </div>
    </div>
  );
}

export function MonitorPage() {
  const [rooms, setRooms] = useState<RoomStatus[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
  const [selectedRoom, setSelectedRoom] = useState<RoomStatus | null>(null);
  const [actionLoading, setActionLoading] = useState(false);

  const loadRooms = async () => {
    const { data, error } = await monitorClient.fetchRooms();
    if (error) {
      setError(error);
      return;
    }
    setRooms(data?.rooms ?? []);
    setLastUpdated(new Date());
    setError(null);
    
    // Update selected room if open
    if (selectedRoom && data?.rooms) {
      const updated = data.rooms.find(r => r.roomId === selectedRoom.roomId);
      if (updated) setSelectedRoom(updated);
    }
  };

  useEffect(() => {
    loadRooms();
    const interval = window.setInterval(loadRooms, 2000); // Faster refresh for "Real-time" feel
    return () => window.clearInterval(interval);
  }, [selectedRoom?.roomId]); // Re-bind if selected room changes to keep it updated

  const activeRooms = useMemo(() => rooms.filter((room) => room.status !== "idle" || room.isServing || room.isWaiting), [rooms]);
  const serving = useMemo(() => rooms.filter((room) => room.isServing), [rooms]);
  const waiting = useMemo(() => rooms.filter((room) => room.isWaiting), [rooms]);

  // --- Control Handlers ---

  const handlePowerToggle = async () => {
    if (!selectedRoom) return;
    setActionLoading(true);
    if (selectedRoom.status === "idle" || selectedRoom.status === "occupied") {
      // Turn ON (Default to Cool, 22, Mid if not set)
      await acClient.powerOn(selectedRoom.roomId, {
        mode: selectedRoom.mode || "COOL",
        targetTemp: selectedRoom.targetTemp || 22,
        speed: selectedRoom.speed || "MID"
      });
    } else {
      // Turn OFF
      await acClient.powerOff(selectedRoom.roomId);
    }
    await loadRooms();
    setActionLoading(false);
  };

  const handleTempChange = async (delta: number) => {
    if (!selectedRoom) return;
    const newTemp = (selectedRoom.targetTemp || 22) + delta;
    setActionLoading(true);
    await acClient.changeTemp(selectedRoom.roomId, newTemp);
    await loadRooms();
    setActionLoading(false);
  };

  const handleSpeedChange = async (speed: string) => {
    if (!selectedRoom) return;
    setActionLoading(true);
    await acClient.changeSpeed(selectedRoom.roomId, speed);
    await loadRooms();
    setActionLoading(false);
  };

  return (
    <div className="space-y-8 animate-fade-in pb-20">
      {error && (
        <div className="rounded-xl bg-[#ff3b30]/10 px-4 py-3 text-sm text-[#ff3b30]">
          {error}
        </div>
      )}

      <header className="flex items-end justify-between">
        <div>
          <h1 className="text-4xl font-semibold tracking-tight text-[#1d1d1f]">
            监控面板
          </h1>
          <p className="mt-2 text-[#86868b]">实时查看所有房间状态与调度详情</p>
        </div>
        <div className="text-right text-xs text-[#86868b]">
          <p>{activeRooms.length} 间活跃</p>
          <p>更新于 {lastUpdated ? lastUpdated.toLocaleTimeString() : "--"}</p>
        </div>
      </header>

      <SchedulerVisualizer serving={serving} waiting={waiting} />
      
      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-[#1d1d1f]">房间矩阵</h3>
        <RoomStatusGrid rooms={rooms} onRoomClick={setSelectedRoom} />
      </div>

      {/* 房间详情浮动信息卡片 (Inspector) */}
      {selectedRoom && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6"
          tabIndex={-1}
          onKeyDown={(e) => e.key === "Escape" && setSelectedRoom(null)}
        >
          <div
            className="absolute inset-0 bg-black/40 backdrop-blur-[12px] animate-[fadeIn_200ms_ease-out]"
            onClick={() => setSelectedRoom(null)}
          />

          <div
            className="relative w-full max-w-[480px] max-h-[90vh] flex flex-col
                       bg-white/90 backdrop-blur-xl
                       rounded-[24px]
                       shadow-[0_20px_40px_rgba(0,0,0,0.2)]
                       border border-white/40
                       animate-[monitorCardIn_200ms_cubic-bezier(0.16,1,0.3,1)]
                       overflow-hidden"
          >
            {/* Header */}
            <div className="flex items-center justify-between px-6 pt-5 pb-3 border-b border-black/[0.05] bg-white/50">
              <div className="flex items-center gap-3">
                <div className={`flex h-8 w-8 items-center justify-center rounded-full ${
                  selectedRoom.isServing ? "bg-[#34c759]/10 text-[#34c759]" : 
                  selectedRoom.isWaiting ? "bg-[#ffcc00]/10 text-[#ffcc00]" : "bg-[#8e8ea0]/10 text-[#8e8ea0]"
                }`}>
                  <span className="text-xs font-bold">{selectedRoom.roomId}</span>
                </div>
                <div>
                  <h2 className="text-sm font-semibold text-[#1d1d1f]">Room {selectedRoom.roomId}</h2>
                  <p className="text-[11px] text-[#86868b]">
                    {selectedRoom.isServing ? "正在服务" : selectedRoom.isWaiting ? "等待调度" : "空闲/关机"}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setSelectedRoom(null)}
                className="rounded-full p-1.5 text-[#8e8ea0] hover:bg-black/[0.05] transition-colors"
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M18 6L6 18M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* Scrollable Content */}
            <div className="flex-1 overflow-y-auto px-6 py-6 space-y-6">
              
              {/* Control Panel (New) */}
              <section>
                <div className="mb-3 flex items-center justify-between">
                  <h3 className="text-xs font-semibold uppercase tracking-wider text-[#86868b]">Control Panel</h3>
                  {actionLoading && <span className="text-[10px] text-[#10a37f]">Updating...</span>}
                </div>
                <div className="grid grid-cols-2 gap-3">
                  {/* Power Button */}
                  <button
                    onClick={handlePowerToggle}
                    disabled={actionLoading}
                    className={`col-span-2 flex items-center justify-center gap-2 rounded-xl py-3 text-sm font-medium transition-all ${
                      selectedRoom.status !== "idle" && selectedRoom.status !== "occupied"
                        ? "bg-[#ff3b30] text-white shadow-lg shadow-[#ff3b30]/30 hover:bg-[#d73229]"
                        : "bg-[#34c759] text-white shadow-lg shadow-[#34c759]/30 hover:bg-[#2db14e]"
                    }`}
                  >
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                      <path d="M18.36 6.64a9 9 0 1 1-12.73 0" />
                      <line x1="12" y1="2" x2="12" y2="12" />
                    </svg>
                    {selectedRoom.status !== "idle" && selectedRoom.status !== "occupied" ? "强制关机" : "开启空调"}
                  </button>

                  {/* Temp Control */}
                  <div className="col-span-2 rounded-xl bg-[#f5f5f7] p-3">
                    <div className="mb-2 flex items-center justify-between text-xs text-[#86868b]">
                      <span>目标温度</span>
                      <span>{selectedRoom.targetTemp}°C</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <button 
                        onClick={() => handleTempChange(-1)}
                        disabled={actionLoading}
                        className="flex h-8 w-8 items-center justify-center rounded-lg bg-white shadow-sm hover:bg-gray-50 disabled:opacity-50"
                      >
                        -
                      </button>
                      <div className="flex-1 text-center text-lg font-semibold text-[#1d1d1f]">
                        {selectedRoom.targetTemp}°
                      </div>
                      <button 
                        onClick={() => handleTempChange(1)}
                        disabled={actionLoading}
                        className="flex h-8 w-8 items-center justify-center rounded-lg bg-white shadow-sm hover:bg-gray-50 disabled:opacity-50"
                      >
                        +
                      </button>
                    </div>
                  </div>

                  {/* Fan Speed */}
                  <div className="col-span-2 rounded-xl bg-[#f5f5f7] p-3">
                    <div className="mb-2 text-xs text-[#86868b]">风速设定</div>
                    <div className="grid grid-cols-3 gap-2">
                      {["LOW", "MID", "HIGH"].map((s) => (
                        <button
                          key={s}
                          onClick={() => handleSpeedChange(s)}
                          disabled={actionLoading}
                          className={`rounded-lg py-1.5 text-xs font-medium transition-colors ${
                            selectedRoom.speed === s
                              ? "bg-white text-[#1d1d1f] shadow-sm ring-1 ring-black/[0.04]"
                              : "text-[#86868b] hover:bg-black/[0.02]"
                          }`}
                        >
                          {s}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              </section>

              {/* Stats Grid */}
              <section>
                <h3 className="mb-3 text-xs font-semibold uppercase tracking-wider text-[#86868b]">Real-time Stats</h3>
                <div className="grid grid-cols-2 gap-3">
                  <div className="rounded-xl bg-[#f5f5f7] p-3">
                    <div className="text-[10px] text-[#86868b]">当前室温</div>
                    <div className="mt-1 text-xl font-semibold text-[#1d1d1f]">{selectedRoom.currentTemp.toFixed(1)}°</div>
                  </div>
                  <div className="rounded-xl bg-[#f5f5f7] p-3">
                    <div className="text-[10px] text-[#86868b]">当前费用</div>
                    <div className="mt-1 text-xl font-semibold text-[#1d1d1f]">¥{selectedRoom.currentFee.toFixed(2)}</div>
                  </div>
                  <div className="rounded-xl bg-[#f5f5f7] p-3">
                    <div className="text-[10px] text-[#86868b]">服务时长</div>
                    <div className="mt-1 text-sm font-medium text-[#1d1d1f]">{Math.floor(selectedRoom.servedSeconds / 60)} min</div>
                  </div>
                  <div className="rounded-xl bg-[#f5f5f7] p-3">
                    <div className="text-[10px] text-[#86868b]">等待时长</div>
                    <div className="mt-1 text-sm font-medium text-[#1d1d1f]">{Math.floor(selectedRoom.waitedSeconds / 60)} min</div>
                  </div>
                </div>
              </section>

            </div>
          </div>
        </div>
      )}
    </div>
  );
}

