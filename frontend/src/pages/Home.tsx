import { Link } from "react-router-dom";

const features = [
  {
    title: "智能温控",
    description: "精准调节每一度，三档风速智能切换",
    icon: "🎛️",
  },
  {
    title: "优先调度",
    description: "公平高效的资源分配算法",
    icon: "⚡",
  },
  {
    title: "精准计费",
    description: "按需付费，账单清晰透明",
    icon: "📊",
  },
];

const quickLinks = [
  { to: "/room-control", label: "房间控制", desc: "温度 · 风速 · 状态" },
  { to: "/frontdesk", label: "前台服务", desc: "入住 · 退房 · 账单" },
  { to: "/monitor", label: "监控面板", desc: "实时 · 全局 · 可视" },
  { to: "/report", label: "统计报表", desc: "数据 · 分析 · 洞察" },
];

export function Home() {
  return (
    <div className="space-y-32 animate-fade-in">
      {/* Hero Section - Apple 风格极简 */}
      <section className="relative pt-8 pb-16 text-center">
        {/* 淡雅背景装饰 */}
        <div className="absolute inset-0 -z-10 overflow-hidden">
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[600px] bg-gradient-to-b from-[#f5f5f7] to-transparent rounded-full blur-3xl opacity-60" />
        </div>

        {/* 小标签 */}
        <div className="inline-flex items-center gap-2 rounded-full bg-[#f5f5f7] px-4 py-2 text-xs text-[#86868b]">
          <span className="h-1.5 w-1.5 rounded-full bg-[#34c759]" />
          Software Engineering Project
        </div>

        {/* 大标题 - Apple 风格 */}
        <h1 className="mt-8 text-5xl font-semibold tracking-tight text-[#1d1d1f] sm:text-6xl lg:text-7xl">
          中央空调
          <br />
          <span className="text-[#86868b]">智能计费系统</span>
        </h1>

        {/* 副标题 - 细字体 */}
        <p className="mx-auto mt-6 max-w-xl text-lg font-normal text-[#86868b] leading-relaxed">
          基于优先级调度的多房间资源管理方案，
          <br className="hidden sm:block" />
          实现温度控制与精准计费的完美融合。
        </p>

        {/* CTA 按钮组 */}
        <div className="mt-10 flex flex-wrap items-center justify-center gap-4">
          <Link
            to="/room-control"
            className="inline-flex items-center gap-2 rounded-full bg-[#0071e3] px-7 py-3 text-sm font-medium text-white transition-all hover:bg-[#0077ed] active:scale-[0.98]"
          >
            开始使用
            <span className="text-white/70">→</span>
          </Link>
          <Link
            to="/monitor"
            className="inline-flex items-center gap-2 rounded-full bg-transparent px-7 py-3 text-sm font-medium text-[#0071e3] transition-all hover:bg-[#0071e3]/[0.08]"
          >
            查看演示
          </Link>
        </div>
      </section>

      {/* 功能卡片区 - 三列布局 */}
      <section>
        <div className="grid gap-6 sm:grid-cols-3">
          {features.map((feature) => (
            <article
              key={feature.title}
              className="group relative overflow-hidden rounded-3xl bg-[#f5f5f7] p-8 transition-all duration-300 hover-lift"
            >
              {/* 图标 */}
              <div className="mb-6 text-4xl">{feature.icon}</div>

              {/* 标题 */}
              <h3 className="text-xl font-semibold text-[#1d1d1f]">
                {feature.title}
              </h3>

              {/* 描述 */}
              <p className="mt-2 text-sm text-[#86868b] leading-relaxed">
                {feature.description}
              </p>

              {/* 装饰性渐变 */}
              <div className="absolute -bottom-20 -right-20 h-40 w-40 rounded-full bg-gradient-to-br from-white/50 to-transparent opacity-0 transition-opacity group-hover:opacity-100" />
            </article>
          ))}
        </div>
      </section>

      {/* 快速入口 - 玻璃拟态风格 */}
      <section>
        <div className="text-center mb-12">
          <h2 className="text-3xl font-semibold text-[#1d1d1f]">快速开始</h2>
          <p className="mt-3 text-[#86868b]">选择一个功能模块开始探索</p>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {quickLinks.map((link) => (
            <Link
              key={link.to}
              to={link.to}
              className="group relative overflow-hidden rounded-2xl border border-black/[0.04] bg-white p-6 transition-all duration-300 hover:border-black/[0.08] hover:shadow-lg"
            >
              <h3 className="text-lg font-semibold text-[#1d1d1f] group-hover:text-[#0071e3] transition-colors">
                {link.label}
              </h3>
              <p className="mt-1 text-xs text-[#86868b]">{link.desc}</p>
              
              {/* 箭头 */}
              <div className="absolute right-5 top-1/2 -translate-y-1/2 text-[#86868b] opacity-0 transition-all group-hover:opacity-100 group-hover:translate-x-1">
                →
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* 技术架构简介 */}
      <section className="rounded-3xl bg-[#1d1d1f] p-12 text-center">
        <h2 className="text-2xl font-semibold text-white">技术架构</h2>
        <p className="mt-3 text-sm text-white/50">现代化全栈技术方案</p>

        <div className="mt-10 flex flex-wrap items-center justify-center gap-8">
          {["FastAPI", "React", "TypeScript", "Tailwind", "SQLite", "Chart.js"].map((tech) => (
            <div key={tech} className="text-sm font-medium text-white/70">
              {tech}
            </div>
          ))}
        </div>

        <div className="mt-10 flex items-center justify-center gap-3 text-xs text-white/40">
          <span>后端服务</span>
          <span className="h-1 w-1 rounded-full bg-white/20" />
          <span>前端应用</span>
          <span className="h-1 w-1 rounded-full bg-white/20" />
          <span>调度算法</span>
          <span className="h-1 w-1 rounded-full bg-white/20" />
          <span>数据可视化</span>
        </div>
      </section>
    </div>
  );
}

