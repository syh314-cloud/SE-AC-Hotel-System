# 作业2 映射说明 (Homework Mapping)

本文档旨在将本次作业（软件设计建模）的要求与当前代码仓库中的实际实现进行映射，帮助快速定位代码位置或理解实现方式。

---

## 任务1：软件框架结构 (10%)

**代码对应位置**：
-   **后端架构**：请参考 `backend/ARCHITECTURE.md` (已包含目录结构、分层说明)。
-   **前端架构**：请参考 `frontend/ARCHITECTURE.md` (已包含目录结构、组件说明)。
-   **整体介绍**：请参考根目录 `README.md`。

**实现方式说明**：
本项目采用 **前后端分离** 架构。
-   **后端**：采用 Python FastAPI 框架，遵循轻量级 DDD (领域驱动设计) 分层：
    -   `interfaces/` (接口层/Controller)
    -   `application/` (应用层/Service)
    -   `domain/` (领域层/Model)
    -   `infrastructure/` (基础设施层/Repository)
-   **前端**：采用 React + Vite + Tailwind CSS，组件化开发。

---

## 任务2：界面设计 (25%)

**代码对应位置**：
所有界面均已在前端代码中实现，可运行 `npm run dev` 查看实际效果。

1.  **控制面板 (Room Control)**
    -   文件：`frontend/src/pages/RoomControlPage.tsx`
    -   组件：`TempGauge.tsx` (温度表), `SpeedSelector.tsx` (风速), `FeePanel.tsx` (费用)
2.  **入住 (Check-in)**
    -   文件：`frontend/src/pages/CheckInPage.tsx`
3.  **结账 (Check-out)**
    -   文件：`frontend/src/pages/CheckOutPage.tsx`
    -   组件：`BillsView.tsx` (账单展示)
4.  **监控界面 (Monitor) [Bonus]**
    -   文件：`frontend/src/pages/MonitorPage.tsx`
    -   组件：`RoomStatusGrid.tsx` (网格状态)

---

## 任务3：动态结构交互图 (50%)

本任务要求绘制序列图/交互图。虽然代码本身不是图，但代码中的 **Service 层** 和 **Scheduler** 完整实现了这些逻辑。

### 消息1：PowerOn (开机请求)
-   **接口**：`backend/interfaces/ac_router.py` -> `power_on`
-   **逻辑实现**：`backend/application/use_ac_service.py` -> `power_on`
-   **调度策略 (组长任务)**：
    -   核心逻辑在 `backend/application/scheduler.py`。
    -   `request_service` 方法处理新请求进入队列。
    -   `tick_1s` 方法每秒执行调度（优先级抢占 + 时间片轮转）。
    -   **对应代码**：
        -   **优先级抢占**：`scheduler.py` 中的 `_try_preempt` 方法。
        -   **时间片轮询**：`scheduler.py` 中的 `_rotate_service` 方法。

### 消息2：ChangeTemp (调温)
-   **接口**：`backend/interfaces/ac_router.py` -> `change_temp`
-   **逻辑实现**：`backend/application/use_ac_service.py` -> `change_temp`
-   **说明**：代码中实现了 `<1s` 节流逻辑（前端防抖 + 后端逻辑）。

### 消息3：ChangeSpeed (调风)
-   **接口**：`backend/interfaces/ac_router.py` -> `change_speed`
-   **逻辑实现**：`backend/application/use_ac_service.py` -> `change_speed`
-   **说明**：调风被视为新请求，会重新触发 `scheduler.request_service`，可能触发抢占。

### 消息4：PowerOff (关机)
-   **接口**：`backend/interfaces/ac_router.py` -> `power_off`
-   **逻辑实现**：`backend/application/use_ac_service.py` -> `power_off`
-   **说明**：关机会触发 `billing_service.add_detail_record` 结算当前片段。

### 消息5：Create_Accommodation_Order (产生住宿订单)
-   **接口**：`backend/interfaces/frontdesk_router.py` -> `check_in`
-   **逻辑实现**：`backend/application/checkin_service.py` -> `check_in`
-   **实体**：`backend/domain/bill.py` -> `AccommodationOrder` (代码中简化合并处理)。

### 消息6：Create_Accommodation_Bill (产生住宿账单)
-   **接口**：`backend/interfaces/frontdesk_router.py` -> `check_out`
-   **逻辑实现**：`backend/application/checkout_service.py` -> `check_out`
-   **实体**：`backend/domain/bill.py` -> `AccommodationBill` (作为总账单的一部分返回)。

### 消息7：Create_AC_Bill (产生空调账单)
-   **接口**：同上 (`check_out`)
-   **逻辑实现**：`backend/application/billing_service.py` -> `create_bill`
-   **实体**：`backend/domain/bill.py` -> `ACBill`。

### 消息8：Create_DetailRecord_AC (产生空调详单)
-   **触发时机**：状态变化时（调风、关机、被抢占等）。
-   **逻辑实现**：`backend/application/billing_service.py` -> `add_detail_record`
-   **实体**：`backend/domain/detail_record.py` -> `DetailRecord`。

---

## 任务4：静态结构类图 (10%)

**代码对应位置**：
请参考 `backend/domain/` 目录下的文件，它们直接对应类图中的实体类。

1.  **顾客使用空调**
    -   `Room` (`backend/domain/room.py`)
    -   `ServiceObject` (`backend/domain/service_object.py`)
    -   `DetailRecord` (`backend/domain/detail_record.py`)
    -   `Scheduler` (`backend/application/scheduler.py` - 控制类)

2.  **前台办理入住和结账**
    -   `Room` (`backend/domain/room.py`)
    -   `AccommodationBill` / `ACBill` (`backend/domain/bill.py`)
    -   `CheckInService` / `CheckOutService` (`backend/application/*.py` - 控制类)

---

## 任务5：工作量表 (5%)

*(请根据小组成员实际分工填写)*
