# 后端架构说明

## 1. 总体概述

后端是一个基于 **FastAPI** 的 Web 服务，实现酒店中央空调计费系统的核心逻辑，包括：

- 房间与空调的状态管理  
- 优先级 + 时间片 的空调调度算法  
- 使用时长与能耗的计费  
- 账单与详单生成  
- 监控与统计报表所需的数据聚合  

所有业务逻辑都通过统一的仓储接口读写持久化存储（当前为 SQLite）。


---

## 2. 技术栈

- **语言**：Python 3.10+  
- **Web 框架**：FastAPI  
- **运行服务器**：Uvicorn  
- **数据库**：SQLite（通过 SQLModel / SQLAlchemy 封装）  
- **测试**：pytest（`backend/tests/` 中已有针对调度、计费和 API 的单元测试）

---

## 3. 目录结构（后端）

```text
backend/
├── app/
│   ├── main.py              # FastAPI 入口，挂路由，配置 CORS，启动调度器循环
│   ├── config.py            # 读取/缓存配置（如 app_config.yaml）
│   └── app_config.yaml      # 业务参数配置（温度范围、价格、并发上限等）
├── application/             # 应用服务层（用例 / Service）
│   ├── scheduler.py         # 调度器：优先级 + 时间片，每秒 tick_1s()
│   ├── billing_service.py   # 计费服务：根据详单聚合生成账单
│   ├── use_ac_service.py    # 空调业务：开关机、调温、调风等
│   ├── checkin_service.py   # 入住流程
│   ├── checkout_service.py  # 退房/结账流程
│   └── report_service.py    # 报表统计逻辑（按时间区间统计）
├── domain/                  # 领域模型（核心业务对象）
│   ├── room.py              # 房间实体（当前温度、目标温度、状态等）
│   ├── bill.py              # 账单相关实体（ACBill、AccommodationBill 等）
│   ├── detail_record.py     # 空调详单（每一段使用记录）
│   ├── queues.py            # 服务队列 / 等待队列结构
│   └── service_object.py    # 正在服务的会话对象（Room + Speed + 状态）
├── infrastructure/          # 基础设施层（持久化、外部系统）
│   ├── database.py          # 创建 SQLite Engine / Session，本地 ac_system.db
│   ├── models.py            # SQLModel 表定义（Room、DetailRecord、Bill 等）
│   ├── repository.py        # 仓储抽象接口（读写 Room / Detail / Bill）
│   ├── memory_store.py      # 内存实现（如有），便于测试或不持久化运行
│   └── sqlite_repo.py       # 仓储的 SQLite 实现
└── interfaces/              # 接口层（FastAPI 路由）
    ├── ac_router.py         # 房间空调控制相关接口（开关机/调温/调风/状态）
    ├── frontdesk_router.py  # 前台入住 / 结账相关接口
    ├── monitor_router.py    # 监控面板用的接口
    └── report_router.py     # 报表统计接口（/report）
```

---

## 4. 关键组件说明

### 4.1 调度器 Scheduler（`application/scheduler.py`）

调度器是系统的“心跳”，由 `app/main.py` 在应用启动时注册一个后台任务，每秒执行一次 `tick_1s()`：

1. **推进时间与状态**

   - 对正在服务的会话，累计服务秒数；
   - 对等待队列中的请求，累计等待时间；
   - 根据当前风速和目标温度，更新房间当前温度（模拟升降温过程）。

2. **执行调度规则**

   - **最大并发数限制**：同一时间最多允许 N 个房间处于“送风服务中”（默认 3，可在 `app_config.yaml` 中配置）。
   - **优先级**：高风 > 中风 > 低风。新请求到来时，可能会：
     - 直接获得空闲服务名额；
     - 进入等待队列；
     - 抢占某个低优先级正在服务的会话。
   - **时间片**：当同一优先级下的等待房间超过并发上限时，调度器按时间片（例如 60 秒）轮转，让房间公平使用资源。

3. **自动停/启控制**

   - 当房间当前温度达到目标温度附近（满足 PPT 要求的阈值，如 ±1℃）时，自动停止送风；
   - 如果关闭后温度再次偏离目标，超过一定阈值，则调度器可重新安排服务（具体策略以配置和实现为准）。

### 4.2 计费 Billing（`application/billing_service.py`）

计费逻辑围绕“详单 + 账单”展开：

- **详单 DetailRecord**

  - 每当空调状态发生关键变化时（例如：开机、关机、调风、从服务队列转入等待、从等待重新获得服务等），会“结账”上一段，生成一条详单；
  - 每条详单记录该时间段内：
    - 使用房间、起止时间；
    - 所用风速等级；
    - 能耗以及对应金额。

- **账单 Bill**

  - 在退房结账时，计费服务会：
    - 聚合该入住期间的所有空调详单，形成一张 **空调账单**（ACBill）；
    - 结合住宿费用生成 **住宿账单**（AccommodationBill）；
    - 将二者合并，为前台结账页面和报表提供统一的账单结构。

### 4.3 基础设施 Infrastructure（`infrastructure/`）

- **数据库连接**

  - `database.py` 中定义了 SQLite 的连接和 Session 工厂；
  - 默认数据库文件为 `backend/ac_system.db`，无须手动创建，运行时会自动生成。

- **ORM 模型**

  - `models.py` 使用 SQLModel 定义了表结构，对应领域模型中的 Room、DetailRecord、Bill 等实体；
  - 保证领域对象与数据库结构保持基本一致，方便后续扩展。

- **仓储 Repository**

  - `repository.py` 定义了统一的仓储接口，例如：
    - 获取/保存房间信息；
    - 插入/查询详单；
    - 插入/查询账单；
  - `sqlite_repo.py` 提供具体的 SQLite 实现；
  - 某些场景下可通过 `memory_store.py` 使用内存实现，便于测试或 Demo。

---

## 5. 配置 Configuration

业务参数集中写在 `app/app_config.yaml`，通过 `app/config.py` 读取并缓存。典型配置包括：

- **温度相关**

  - 制冷 / 制热模式的温度范围；
  - 默认目标温度；
  - 空调关闭时房间温度回到环境温度的速度。

- **计费相关**

  - 每度电单价；
  - 不同风速对应的单位时间能耗（例如高风 1 度/时间，中风 1/2 度/时间等）。

- **调度相关**

  - 最大并发服务房间数（例如 3 间）；
  - 时间片长度（例如 60 秒）；
  - 调温节流参数等（可在前后端共同控制，以满足 PPT 的“<1s 只取最后一次”要求）。

---

## 6. 启动与运行方式

在项目根目录下，后端的推荐运行方式为：

```bash
# 进入 backend 目录
cd backend

# 1. 创建虚拟环境
python -m venv .venv

# 2. 激活虚拟环境
# Windows:
.venv\Scripts\activate
# Mac / Linux:
# source .venv/bin/activate

# 3. 安装依赖
pip install -r requirements.txt

# 4. 启动服务
uvicorn app.main:app --reload
```

- 默认监听地址：`http://localhost:8000`  
- Swagger 文档：`http://localhost:8000/docs`  
- 健康检查：`GET /health`（由 `app/main.py` 提供）
