import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { monitorClient } from "../api/monitorClient";
import type { RoomStatus } from "../types/rooms";

type FilterType = "all" | "available" | "occupied";

export function RoomSelectorPage() {
  const navigate = useNavigate();
  const [rooms, setRooms] = useState<RoomStatus[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [modalRoomId, setModalRoomId] = useState<string | null>(null);
  const [hoveredRoom, setHoveredRoom] = useState<string | null>(null);
  const [filter, setFilter] = useState<FilterType>("all");

  useEffect(() => {
    monitorClient.fetchRooms().then(({ data, error }) => {
      if (error) {
        setError(error);
        return;
      }
      setRooms(data?.rooms ?? []);
    });
  }, []);

  // 映射房间占用状态
  const occupiedSet = useMemo(() => {
    const set = new Set<string>();
    for (const r of rooms) {
      const st = String(r.status || "").toLowerCase();
      if (st === "serving" || st === "waiting" || st === "occupied") set.add(String(r.roomId));
    }
    return set;
  }, [rooms]);

  const handleSelect = (roomId: string) => {
    if (occupiedSet.has(roomId)) {
      navigate(`/room-control/${roomId}`);
    } else {
      setModalRoomId(roomId);
      setModalOpen(true);
    }
  };

  const occupiedCount = occupiedSet.size;
  const availableCount = 100 - occupiedCount;

  return (
    <section className="mx-auto w-full max-w-5xl space-y-10">
      {/* 页面头部 - Apple 风格 */}
      <header className="text-center space-y-4">
        <h1 className="text-[40px] font-semibold tracking-tight text-[#1d1d1f]">
          房间选择
        </h1>
        <p className="text-lg text-[#86868b] font-normal max-w-md mx-auto">
          点击已入住房间，进入空调控制面板
        </p>
      </header>

      {error && (
        <div className="glass rounded-2xl px-6 py-4 text-sm text-red-600 flex items-center gap-3">
          <span className="w-8 h-8 rounded-full bg-red-50 flex items-center justify-center text-base">⚠️</span>
          {error}
        </div>
      )}

      {/* 统计卡片 - 极简风格 */}
      <div className="grid gap-5 sm:grid-cols-3">
        <div className="glass rounded-2xl p-6 text-center">
          <p className="text-sm text-[#86868b] mb-1">已入住</p>
          <p className="text-4xl font-semibold text-[#1d1d1f] tracking-tight">{occupiedCount}</p>
          <p className="text-xs text-[#34c759] mt-2">可进入控制</p>
        </div>
        <div className="glass rounded-2xl p-6 text-center">
          <p className="text-sm text-[#86868b] mb-1">空闲房间</p>
          <p className="text-4xl font-semibold text-[#1d1d1f] tracking-tight">{availableCount}</p>
          <p className="text-xs text-[#86868b] mt-2">需先办理入住</p>
        </div>
        <div className="glass rounded-2xl p-6 text-center">
          <p className="text-sm text-[#86868b] mb-1">当前悬停</p>
          <p className="text-4xl font-semibold text-[#0071e3] tracking-tight">{hoveredRoom ?? "—"}</p>
          <p className="text-xs text-[#86868b] mt-2">
            {hoveredRoom ? (occupiedSet.has(hoveredRoom) ? "点击进入控制" : "未入住") : "移动鼠标选择"}
          </p>
        </div>
      </div>

      {/* 房间矩阵 - 楼层式布局 */}
      <div className="glass rounded-3xl p-8">
        {/* 头部 */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h3 className="text-xl font-semibold text-[#1d1d1f]">房间总览</h3>
            <p className="text-sm text-[#86868b] mt-0.5">共 100 间客房 · 10 层</p>
          </div>
          {/* 筛选器 */}
          <div className="flex rounded-lg bg-[#f5f5f7] p-0.5">
            {[
              { key: "all", label: "全部" },
              { key: "occupied", label: "已入住" },
              { key: "available", label: "空闲" },
            ].map((item) => (
              <button
                key={item.key}
                onClick={() => setFilter(item.key as FilterType)}
                className={`px-3 py-1.5 text-xs font-medium rounded-md transition-all ${
                  filter === item.key
                    ? "bg-white text-[#1d1d1f] shadow-sm"
                    : "text-[#86868b] hover:text-[#1d1d1f]"
                }`}
              >
                {item.label}
              </button>
            ))}
          </div>
        </div>

        {/* 图例 */}
        <div className="flex items-center gap-6 mb-6 pb-4 border-b border-black/[0.04]">
          <span className="flex items-center gap-2 text-xs text-[#86868b]">
            <span className="w-7 h-7 rounded-lg bg-[#1d1d1f] flex items-center justify-center text-[10px] text-white">01</span>
            已入住（可进入）
          </span>
          <span className="flex items-center gap-2 text-xs text-[#86868b]">
            <span className="w-7 h-7 rounded-lg bg-[#f5f5f7] border border-black/[0.06] flex items-center justify-center text-[10px] text-[#86868b]">01</span>
            空闲
          </span>
        </div>

        {/* 楼层式网格 */}
        <div className="space-y-2">
          {[9, 8, 7, 6, 5, 4, 3, 2, 1, 0].map((floor) => {
            const floorRooms = Array.from({ length: 10 }, (_, i) => String(floor * 10 + i + 1));
            const floorOccupied = floorRooms.filter(id => occupiedSet.has(id)).length;
            
            // 筛选逻辑
            const hasVisibleRooms = floorRooms.some(id => {
              const isOccupied = occupiedSet.has(id);
              if (filter === "available") return !isOccupied;
              if (filter === "occupied") return isOccupied;
              return true;
            });

            if (!hasVisibleRooms) return null;

            return (
              <div key={floor} className="flex items-center gap-4 py-1">
                {/* 楼层标识 */}
                <div className="w-12 shrink-0">
                  <span className="text-sm font-semibold text-[#1d1d1f]">{floor + 1}F</span>
                  <span className="block text-[10px] text-[#86868b]">{floorOccupied}/{10 - floorOccupied}</span>
                </div>
                
                {/* 房间按钮 */}
                <div className="flex-1 grid grid-cols-10 gap-2">
                  {floorRooms.map((id) => {
                    const isOccupied = occupiedSet.has(id);
                    const isHovered = hoveredRoom === id;
                    
                    // 筛选隐藏
                    const isHidden = 
                      (filter === "available" && isOccupied) ||
                      (filter === "occupied" && !isOccupied);

                    if (isHidden) {
                      return <div key={id} className="h-10" />;
                    }

                    return (
                      <button
                        key={id}
                        type="button"
                        onClick={() => handleSelect(id)}
                        onMouseEnter={() => setHoveredRoom(id)}
                        onMouseLeave={() => setHoveredRoom(null)}
                        className={`
                          group relative h-10 rounded-xl text-xs font-medium
                          transition-all duration-200 ease-out
                          ${isOccupied
                            ? "bg-[#1d1d1f] text-white hover:bg-[#424245]"
                            : "bg-[#f5f5f7] text-[#86868b] hover:bg-[#e8e8ed] border border-black/[0.04]"
                          }
                          ${isHovered ? "scale-110 shadow-lg z-10" : ""}
                          ${isOccupied ? "cursor-pointer" : "cursor-default"}
                        `}
                      >
                        {id}
                        {/* 入住状态小点 */}
                        {isOccupied && (
                          <span className="absolute -top-0.5 -right-0.5 h-2 w-2 rounded-full bg-[#34c759]">
                            <span className="absolute inset-0 rounded-full bg-[#34c759] animate-ping opacity-75" />
                          </span>
                        )}
                        {/* 悬浮提示 */}
                        <span className={`
                          absolute -top-9 left-1/2 -translate-x-1/2 px-2 py-1 rounded-lg 
                          bg-[#1d1d1f] text-white text-[10px] whitespace-nowrap 
                          opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none
                          ${isOccupied ? "" : "hidden"}
                        `}>
                          进入控制
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* 未入住提示弹窗 - Apple 风格 */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 backdrop-blur-xl p-4">
          <div className="glass rounded-3xl p-8 w-full max-w-sm shadow-2xl">
            <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-[#f5f5f7] text-3xl mx-auto mb-5">
              🔒
            </div>
            <h4 className="text-xl font-semibold text-center text-[#1d1d1f]">房间未入住</h4>
            <p className="mt-3 text-sm text-[#86868b] text-center leading-relaxed">
              房间 <span className="font-semibold text-[#1d1d1f]">{modalRoomId}</span> 当前未入住，无法进入控制面板。请先在前台办理入住手续。
            </p>
            <div className="mt-8 flex gap-3">
              <button
                className="flex-1 rounded-xl bg-[#0071e3] px-5 py-3 text-sm font-medium text-white transition-all hover:bg-[#0077ed] active:scale-[0.98]"
                onClick={() => {
                  setModalOpen(false);
                  navigate("/frontdesk");
                }}
                type="button"
              >
                去办理入住
              </button>
              <button
                className="rounded-xl bg-[#f5f5f7] px-5 py-3 text-sm font-medium text-[#1d1d1f] transition-all hover:bg-[#e8e8ed] active:scale-[0.98]"
                onClick={() => setModalOpen(false)}
                type="button"
              >
                关闭
              </button>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
