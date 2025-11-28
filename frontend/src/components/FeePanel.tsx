type FeePanelProps = {
  currentFee: number;
  totalFee: number;
};

export function FeePanel({ currentFee, totalFee }: FeePanelProps) {
  return (
    <section className="rounded-2xl bg-[#1d1d1f] p-6">
      <p className="text-xs text-white/40 tracking-wide">费用明细</p>
      
      <div className="mt-5 space-y-4">
        {/* 本次费用 */}
        <div className="flex items-baseline justify-between">
          <span className="text-sm text-white/50">本次费用</span>
          <div className="text-right">
            <span className="text-3xl font-semibold text-white tracking-tight">
              ¥{currentFee.toFixed(2)}
            </span>
          </div>
        </div>
        
        {/* 分隔线 */}
        <div className="h-px bg-white/10" />
        
        {/* 累计费用 */}
        <div className="flex items-baseline justify-between">
          <span className="text-sm text-white/50">累计费用</span>
          <div className="text-right">
            <span className="text-xl font-medium text-white/80">
              ¥{totalFee.toFixed(2)}
            </span>
          </div>
        </div>
      </div>
    </section>
  );
}
