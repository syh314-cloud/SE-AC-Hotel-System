# 前端架构说明

## 1. 总体概述

前端是一个基于 **React** 构建的单页应用（SPA），为住客（房间控制）、前台（入住/退房）和经理（监控/报表）提供用户界面。它通过 REST API 与后端进行通信。

## 2. 技术栈

-   **框架**: React 18+
-   **构建工具**: Vite
-   **语言**: TypeScript
-   **样式**: Tailwind CSS
-   **路由**: React Router DOM
-   **图表**: Chart.js (通过 react-chartjs-2)
-   **HTTP 客户端**: Fetch API (封装在 client.ts 中)

## 3. 目录结构

```
frontend/
├── public/                  # 静态资源
├── src/
│   ├── api/                 # API 客户端封装
│   │   ├── client.ts        # 基础 HTTP 请求封装
│   │   ├── acClient.ts      # 房间空调控制 API
│   │   ├── frontdeskClient.ts # 入住/退房 API
│   │   ├── monitorClient.ts # 监控面板 API
│   │   └── reportClient.ts  # 报表统计 API
│   ├── assets/              # 图片和图标
│   ├── components/          # 可复用 UI 组件
│   │   ├── Hero.tsx         # 首页 Hero 区域
│   │   ├── RoomHeader.tsx   # 房间状态头部
│   │   ├── TempGauge.tsx    # 温度仪表盘可视化
│   │   ├── SpeedSelector.tsx# 风速控制器
│   │   ├── RoomStatusGrid.tsx # 监控网格
│   │   └── ...
│   ├── pages/               # 路由页面
│   │   ├── Home.tsx         # 首页
│   │   ├── RoomControlPage.tsx # 住客空调控制面板
│   │   ├── CheckInPage.tsx  # 前台入住办理
│   │   ├── CheckOutPage.tsx # 前台退房与结账
│   │   ├── MonitorPage.tsx  # 经理监控仪表盘
│   │   └── ReportPage.tsx   # 经理统计报表
│   ├── styles/              # 全局样式
│   │   └── tokens.css       # CSS 变量（如有）
│   ├── types/               # TypeScript 类型定义
│   ├── App.tsx              # 主布局与路由配置
│   └── main.tsx             # 入口文件
├── index.html               # HTML 模板
├── tailwind.config.js       # Tailwind 配置文件
└── vite.config.ts           # Vite 配置文件
```

## 4. 核心功能与实现

### 4.1 房间控制 (`RoomControlPage`)
-   **实时状态**: 每隔几秒轮询后端，更新当前温度、费用和空调状态（服务中/等待中）。
-   **节流控制**: 对温度调节按钮实施防抖/节流（Throttling），防止 API 请求过于频繁。
-   **可视化**: 使用 `TempGauge` 展示温度变化，`SpeedSelector` 控制风速。

### 4.2 监控面板 (`MonitorPage`)
-   **网格视图**: 以网格形式展示所有房间，通过颜色区分状态（服务中、等待中、空闲）。
-   **队列可视化**: 直观展示当前的服务队列和等待队列，帮助理解调度算法的运行情况。
-   **筛选功能**: 支持按状态或楼层筛选房间。

### 4.3 统计报表 (`ReportPage`)
-   **仪表盘**: 包含汇总卡片、趋势图和饼图的综合看板。
-   **数据可视化**: 使用 `react-chartjs-2` 渲染：
    -   收入/能耗的时间趋势。
    -   风速使用占比分布。
    -   各房间的绩效表现。

### 4.4 入住/退房 (`CheckInPage`, `CheckOutPage`)
-   **表单**: 简洁的表单用于录入住客信息。
-   **账单**: 退房时获取并展示详细账单（包含住宿费 + 空调详单）。

## 5. 样式策略

-   **Tailwind CSS**: 采用 Utility-First 的方式编写样式。
-   **设计系统**: 遵循简洁现代的“类苹果”风格，使用大留白、圆角和柔和阴影。
-   **响应式**: 布局自动适配移动端和桌面端屏幕。

## 6. 运行前端

```bash
# 在 frontend/ 目录下
npm install
npm run dev
```
访问地址: `http://localhost:5173`
