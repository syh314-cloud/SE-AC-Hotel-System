import type { RoomStatus } from "../types/rooms";

type RoomStatusGridProps = {
  rooms: RoomStatus[];
  onRoomClick?: (room: RoomStatus) => void;
};

const statusConfig: Record<
  string,
  { label: string; pillColor: string; pillBg: string; border: string; ring?: string; bg: string }
> = {
  serving: {
    label: "服务中",
    pillColor: "text-[#0071e3]",
    pillBg: "bg-[#e5f2ff]",
    border: "border-[#0071e3]",
    ring: "ring-2 ring-[#0071e3]/40",
    bg: "bg-white",
  },
  waiting: {
    label: "等待中",
    pillColor: "text-[#b25a00]",
    pillBg: "bg-[#fff4e5]",
    border: "border-[#ffcc00]",
    ring: "ring-2 ring-[#ffcc00]/50 animate-pulse",
    bg: "bg-[#fffdf5]",
  },
  occupied: {
    label: "已入住",
    pillColor: "text-[#0071e3]",
    pillBg: "bg-[#e5f2ff]",
    border: "border-[#d1d1d6]",
    bg: "bg-white",
  },
  idle: {
    label: "空闲",
    pillColor: "text-[#8e8ea0]",
    pillBg: "bg-[#f2f2f7]",
    border: "border-[#d1d1d6]",
    bg: "bg-[#f5f5f7]",
  },
};

export function RoomStatusGrid({ rooms, onRoomClick }: RoomStatusGridProps) {
  return (
    <section className="rounded-2xl border border-black/[0.04] bg-white p-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-xl font-semibold text-[#1d1d1f]">房间状态</h3>
          <p className="mt-1 text-xs text-[#86868b]">仅展示活跃房间</p>
        </div>
        <div className="flex items-center gap-2 text-[10px] text-[#86868b]">
          <span className="h-1.5 w-1.5 rounded-full bg-[#34c759]" />
          实时刷新
        </div>
      </div>

      {rooms.length === 0 ? (
        <div className="mt-8 rounded-xl bg-[#f5f5f7] py-12 text-center">
          <p className="text-sm text-[#86868b]">暂无活跃房间</p>
        </div>
      ) : (
        <div className="mt-6 grid grid-cols-2 gap-4 xl:grid-cols-4">
          {rooms.map((room) => {
            const key = room.status?.toLowerCase?.() ?? "idle";
            const config = statusConfig[key] ?? statusConfig.idle;
            const diff = Number((room.currentTemp - room.targetTemp).toFixed(1));
            const clickable = Boolean(onRoomClick);

            const modeLabel = room.mode?.toLowerCase() === "heat" ? "制热" : "制冷";
            const modeColor = room.mode?.toLowerCase() === "heat" ? "text-[#ff9500]" : "text-[#0071e3]";
            const fanLabel = room.speed || "--";

            return (
              <article
                key={room.roomId}
                className={`group rounded-2xl border ${config.border} ${config.bg} p-4 md:p-5 transition-all duration-300 hover:-translate-y-0.5 hover:shadow-lg ${
                  config.ring ?? ""
                } ${clickable ? "cursor-pointer" : ""}`}
                onClick={clickable ? () => onRoomClick?.(room) : undefined}
              >
                {/* 头部：房间 + 当前温度 + 状态 pill */}
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <p className="text-[11px] text-[#8e8ea0]">房间</p>
                    <div className="flex items-center gap-1.5">
                      <p className="text-xl font-semibold text-[#1d1d1f] tracking-tight">#{room.roomId}</p>
                    </div>
                  </div>
                  <div className="text-right space-y-1">
                    <div className="inline-flex items-center gap-1 text-[13px] font-medium text-[#1d1d1f]">
                      <span className="inline-flex h-4 w-4 items-center justify-center rounded-full bg-[#f2f2f7] text-[10px] text-[#8e8ea0]">
                        ℃
                      </span>
                      <span>{room.currentTemp.toFixed(1)}°</span>
                    </div>
                    <span
                      className={`inline-flex items-center justify-center rounded-full px-2.5 py-0.5 text-[11px] font-medium ${config.pillBg} ${config.pillColor}`}
                    >
                      {config.label}
                    </span>
                  </div>
                </div>

                {/* 中部：目标/风速/模式/费用 */}
                <div className="mt-3 space-y-2.5 text-[12px]">
                  <div className="flex items-center justify-between">
                    <span className="text-[#8e8ea0]">目标温度</span>
                    <span className="text-[#1d1d1f]">
                      {room.targetTemp.toFixed(1)}°
                      <span
                        className={`ml-1 text-[11px] ${
                          Math.abs(diff) <= 0.5 ? "text-[#34c759]" : diff > 0 ? "text-[#ff3b30]" : "text-[#0071e3]"
                        }`}
                      >
                        {diff > 0 ? `+${diff}` : diff}°
                      </span>
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-[#8e8ea0]">风速</span>
                    <span className="inline-flex items-center gap-1 text-[#1d1d1f]">
                      <span className="flex h-3 items-center gap-0.5">
                        <span className={`h-3 w-0.5 rounded-full ${fanLabel === "HIGH" ? "bg-[#ff3b30]" : "bg-[#d1d1d6]"}`} />
                        <span className={`h-2.5 w-0.5 rounded-full ${fanLabel !== "LOW" ? "bg-[#ffcc00]" : "bg-[#d1d1d6]"}`} />
                        <span className={`h-2 w-0.5 rounded-full ${"bg-[#34c759]"}`} />
                      </span>
                      <span>{fanLabel}</span>
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-[#8e8ea0]">模式</span>
                    <span className={`text-[12px] font-medium ${modeColor}`}>{modeLabel}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-[#8e8ea0]">本次费用</span>
                    <span className="text-[13px] font-semibold text-[#1d1d1f]">¥{room.currentFee.toFixed(2)}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-[#8e8ea0]">累计费用</span>
                    <span className="text-[13px] font-semibold text-[#1d1d1f]">¥{room.totalFee.toFixed(2)}</span>
                  </div>
                </div>

                {/* 底部：服务对象信息简要 */}
                <div className="mt-3 border-t border-[#e5e5ea] pt-2.5 text-[11px] text-[#8e8ea0] flex items-center justify-between">
                  <span>
                    服务时长：
                    <span className="ml-1 text-[#1d1d1f] font-medium">{room.servedSeconds}s</span>
                  </span>
                  <span>
                    队列等待：
                    <span className="ml-1 text-[#1d1d1f] font-medium">{room.waitedSeconds ?? 0}s</span>
                  </span>
                </div>
              </article>
            );
          })}
        </div>
      )}
    </section>
  );
}
