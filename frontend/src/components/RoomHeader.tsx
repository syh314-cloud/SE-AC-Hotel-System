type RoomHeaderProps = {
  roomId: string;
  status: "SERVING" | "WAITING" | "IDLE";
  mode: "cool" | "heat";
};

const statusConfig = {
  SERVING: { label: "服务中", color: "bg-[#34c759]" },
  WAITING: { label: "等待中", color: "bg-[#ff9500]" },
  IDLE: { label: "空闲", color: "bg-[#86868b]" },
};

export function RoomHeader({ roomId, status, mode }: RoomHeaderProps) {
  const statusInfo = statusConfig[status];
  
  return (
    <header className="flex items-center justify-between">
      <div>
        <p className="text-xs text-[#86868b] tracking-wide">房间控制</p>
        <h2 className="mt-1 text-4xl font-semibold tracking-tight text-[#1d1d1f]">
          {roomId}
        </h2>
      </div>
      
      <div className="flex items-center gap-4">
        {/* 状态标签 */}
        <div className="flex items-center gap-2 rounded-full bg-[#f5f5f7] px-4 py-2">
          <span className={`h-2 w-2 rounded-full ${statusInfo.color}`} />
          <span className="text-xs font-medium text-[#1d1d1f]">
            {statusInfo.label}
          </span>
        </div>
        
        {/* 模式标签 */}
        <div className="rounded-full bg-[#f5f5f7] px-4 py-2">
          <span className="text-xs font-medium text-[#1d1d1f]">
            {mode === "cool" ? "❄️ 制冷" : "🔥 制热"}
          </span>
        </div>
      </div>
    </header>
  );
}
