type TempGaugeProps = {
  current: number;
  target: number;
};

export function TempGauge({ current, target }: TempGaugeProps) {
  const diff = current - target;
  const progress = Math.min(Math.max((current - 16) / (32 - 16) * 100, 0), 100);
  
  return (
    <div className="rounded-2xl bg-[#f5f5f7] p-8">
      {/* 标签 */}
      <p className="text-xs text-[#86868b] tracking-wide">温度</p>
      
      {/* 主要数值显示 */}
      <div className="mt-6 flex items-baseline gap-4">
        <div>
          <span className="text-6xl font-semibold tracking-tight text-[#1d1d1f]">
            {current.toFixed(1)}
          </span>
          <span className="text-2xl text-[#86868b] ml-1">°C</span>
          <p className="mt-1 text-xs text-[#86868b]">当前温度</p>
        </div>
        <div className="text-right">
          <span className="text-3xl font-medium text-[#86868b]">
            {target.toFixed(1)}°
          </span>
          <p className="mt-1 text-xs text-[#86868b]">目标</p>
        </div>
      </div>
      
      {/* 温差指示 */}
      <div className="mt-4 flex items-center gap-2">
        <span className={`text-xs font-medium ${
          Math.abs(diff) <= 0.5 ? 'text-[#34c759]' : 'text-[#ff9500]'
        }`}>
          {diff > 0 ? `+${diff.toFixed(1)}` : diff.toFixed(1)}°C
        </span>
        <span className="text-xs text-[#86868b]">偏差</span>
      </div>
      
      {/* 进度条 */}
      <div className="mt-5 h-1 rounded-full bg-[#e5e5e7]">
        <div
          className="h-full rounded-full bg-[#1d1d1f] transition-all duration-500"
          style={{ width: `${progress}%` }}
        />
      </div>
      <div className="mt-2 flex justify-between text-[10px] text-[#86868b]">
        <span>16°</span>
        <span>32°</span>
      </div>
    </div>
  );
}
