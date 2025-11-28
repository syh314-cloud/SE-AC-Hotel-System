import type { RoomStatus } from "../types/rooms";

type RoomStatusGridProps = {
  rooms: RoomStatus[];
  onRoomClick?: (room: RoomStatus) => void;
};

const statusConfig: Record<string, { label: string; color: string; bg: string }> = {
  serving: { label: "服务中", color: "text-[#34c759]", bg: "bg-[#34c759]/10" },
  waiting: { label: "等待中", color: "text-[#ff9500]", bg: "bg-[#ff9500]/10" },
  occupied: { label: "已入住", color: "text-[#0071e3]", bg: "bg-[#0071e3]/10" },
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
        <div className="mt-6 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {rooms.map((room) => {
            const key = room.status?.toLowerCase?.() ?? "occupied";
            const config = statusConfig[key] ?? statusConfig.occupied;
            const diff = Number((room.currentTemp - room.targetTemp).toFixed(1));
            
            const clickable = Boolean(onRoomClick);

            return (
              <article
                key={room.roomId}
                className={`group rounded-xl border border-black/[0.04] bg-white p-5 transition-all duration-300 hover:shadow-lg hover:-translate-y-0.5 ${
                  clickable ? "cursor-pointer" : ""
                }`}
                onClick={clickable ? () => onRoomClick?.(room) : undefined}
              >
                {/* 头部 */}
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-xs text-[#86868b]">房间</p>
                    <p className="text-2xl font-semibold text-[#1d1d1f]">#{room.roomId}</p>
                  </div>
                  <span className={`rounded-full px-3 py-1 text-xs font-medium ${config.bg} ${config.color}`}>
                    {config.label}
                  </span>
                </div>
                
                {/* 温度显示 */}
                <div className="mt-5 flex items-end justify-between">
                  <div>
                    <p className="text-xs text-[#86868b]">当前</p>
                    <p className="text-3xl font-semibold text-[#1d1d1f] tracking-tight">
                      {room.currentTemp.toFixed(1)}°
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-xs text-[#86868b]">目标</p>
                    <p className="text-xl text-[#86868b]">{room.targetTemp.toFixed(1)}°</p>
                    <p className={`text-xs ${Math.abs(diff) <= 0.5 ? 'text-[#34c759]' : 'text-[#ff9500]'}`}>
                      {diff > 0 ? `+${diff}` : diff}°
                    </p>
                  </div>
                </div>
                
                {/* 详细信息 */}
                <div className="mt-5 grid grid-cols-2 gap-4 border-t border-black/[0.04] pt-4">
                  <div>
                    <p className="text-[10px] text-[#86868b]">本次费用</p>
                    <p className="text-sm font-semibold text-[#1d1d1f]">¥{room.currentFee.toFixed(2)}</p>
                  </div>
                  <div>
                    <p className="text-[10px] text-[#86868b]">累计费用</p>
                    <p className="text-sm font-semibold text-[#1d1d1f]">¥{room.totalFee.toFixed(2)}</p>
                  </div>
                  <div>
                    <p className="text-[10px] text-[#86868b]">风速</p>
                    <p className="text-sm text-[#1d1d1f]">{room.speed ?? "--"}</p>
                  </div>
                  <div>
                    <p className="text-[10px] text-[#86868b]">服务时长</p>
                    <p className="text-sm text-[#1d1d1f]">{room.servedSeconds}s</p>
                  </div>
                </div>
              </article>
            );
          })}
        </div>
      )}
    </section>
  );
}
