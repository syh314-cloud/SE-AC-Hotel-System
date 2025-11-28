const speeds = [
  { label: "低", value: "LOW", desc: "静音节能" },
  { label: "中", value: "MID", desc: "舒适平衡" },
  { label: "高", value: "HIGH", desc: "快速制冷" },
];

type SpeedSelectorProps = {
  value: string;
  onChange?: (speed: string) => void;
  disabled?: boolean;
};

export function SpeedSelector({ value, onChange, disabled = false }: SpeedSelectorProps) {
  return (
    <div className={`rounded-2xl bg-[#f5f5f7] p-6 transition-opacity ${disabled ? 'opacity-50' : ''}`}>
      <p className="text-xs text-[#86868b] tracking-wide">风速档位</p>
      
      <div className="mt-5 flex gap-3">
        {speeds.map((speed) => (
          <button
            key={speed.value}
            onClick={() => !disabled && onChange?.(speed.value)}
            disabled={disabled}
            className={[
              "flex-1 rounded-xl px-4 py-4 text-center transition-all duration-200",
              disabled ? "cursor-not-allowed" : "",
              value === speed.value
                ? "bg-[#1d1d1f] text-white shadow-lg"
                : "bg-white text-[#1d1d1f] hover:bg-white/80 border border-black/[0.04]",
            ].join(" ")}
          >
            <span className="block text-lg font-semibold">{speed.label}</span>
            <span className={`block text-[10px] mt-0.5 ${
              value === speed.value ? 'text-white/60' : 'text-[#86868b]'
            }`}>
              {speed.desc}
            </span>
          </button>
        ))}
      </div>
    </div>
  );
}
