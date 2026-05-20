---
name: full
description: 適用於全端與軟體開發。涵蓋規格轉換、架構防呆、高質量台灣繁體中文註解、UX 非同步狀態處理及自動化運維文件生成。當需要從零開發新功能、進行程式碼重構、或補齊專案中文維護須知時使用。
keywords:
  [
    fullstack,
    backend,
    frontend,
    API,
    database,
    prisma,
    react,
    vue,
    typescript,
    tailwind,
    documentation,
    comment,
    zh-tw,
    繁體中文,
    註解,
    說明文件,
    防呆,
    驗證,
    Zod,
  ]
---

<!-- Tip: Use /create-skill in chat to generate content with agent assistance -->

## 💡 功能核心概述 (Functionality Overview)

本技能為全端與軟體開發提供點對點（End-to-End）的自動化工作流。它強迫 Agent 在撰寫程式碼與文件時，遵循高標準的軟體架構防呆、資料庫事務安全、卓越的前端使用者體驗（UX），並嚴格執行**台灣繁體中文科技術語規範**，徹底消除 AI 常見的罐頭贅詞與非本地化用語。

---

## 🛠️ 執行指南與步驟 (Detailed Instructions)

當啟動此技能時，請將任務拆解為以下四個階段，並嚴格遵循規格：

### 階段一：架構防呆與資料庫設計 (Database & Guardrails)

- **資料落地**：如果是新功能，優先建立/更新資料庫 Schema。
- **軟性刪除**：所有資料表必須包含 `created_at`, `updated_at`, `is_deleted`（或 `deleted_at`）欄位。
- **欄位註解**：必須在欄位旁加上中文業務含義說明（如 Prisma 的 `///` 註解）。

### 階段二：後端安全 API 實作 (Backend & Security)

- **嚴格驗證**：所有 API 輸入（Query, Params, Body）必須使用型別安全工具（如 Zod、Pydantic）進行防呆驗證。
- **商業邏輯註解**：使用 JSDoc/TSDoc。**嚴禁只翻譯程式碼表面意思**（例如不要寫 `// 設定 id`），必須寫出「為什麼要這樣寫」以及「背後的商業邏輯/風控考量」。
- **冪等性與鎖定**：涉及金流、庫存、扣點等關鍵操作，必須加入防重複點擊的機制（如 Redis 分散式鎖），並在註解中特別註明。

### 階段三：前端響應式組件與 UX (Frontend & UX)

- **響應式切版**：UI 必須原生支援 Tailwind CSS 的響應式設計（RWD）。
- **非同步狀態處理**：調用後端 API 時，必須完整實作 Loading（載入中）、Error（錯誤處理）、Empty（空資料）三種 UI 狀態。
- **前端註解**：在複雜的狀態（State）或副作用（useEffect / Watcher）上方，必須說明觸發時機與對效能的影響。

### 階段四：自動生成繁中維護文件 (Documentation)

- **文件落地**：任務完成後，必須參考 `references/MODULE_README.md`，在專案適當目錄或根目錄生成或更新 Markdown 說明文件。
- **語系防線**：必須完全使用台灣軟體工程界習慣的科技術語，發現非台灣用語一律強制修正：
  - 🟢 必須使用：專案、伺服器、函式、組件、資料庫、非同步、物件、型別、宣告、變數、擴充外掛、路由。
  - ❌ 嚴禁使用：項目、服務器、函數、組件、數據庫、异步、對象、類型、定義、變量、插件、路由。
- **語氣**：理性、精準、高階架構師筆觸。刪除所有 AI 罐頭贅詞（如「值得注意的是」、「我們可以看到」）。

---

## 📝 程式碼與文件範例 (Examples)

### 1. 後端與資料庫範本 (`references/BACKEND_STANDARD.ts`)

```typescript
import { z } from 'zod'

/**
 * 驗證結帳請求的輸入資料結構 (Zod Schema)
 * 確保前端傳入的資料型別正確，防範惡意 SQL 注入或格式錯誤
 */
export const CheckoutInputSchema = z.object({
  cartId: z.string().uuid({ message: '購物車 ID 格式必須為 UUID' }),
  couponCode: z.string().optional(),
})

/**
 * 處理使用者購物車結帳、扣減庫存並產生訂單的主邏輯
 *
 * @param userId - 進行結帳的操作使用者不重複識別碼 (UUID)
 * @param input - 經過驗證的結帳必填參數
 * @returns 傳回新建立的訂單物件與第三方支付（例如：綠界、藍新）的金流跳轉 URL
 * @throws {ValidationError} 當購物車內無商品時拋出
 * @throws {InventoryError} 當商品庫存不足，無法滿足訂單數量時拋出
 */
export async function processOrderCheckout(
  userId: string,
  input: z.infer<typeof CheckoutInputSchema>,
): Promise<CheckoutResult> {
  // 1. 風控機制：為避免使用者在網路延遲時重複點擊按鈕，導致重複扣款或產生兩筆訂單，
  //    此處必須在 Redis 建立一個 5 秒的防重送鎖定 (Idempotency Lock)。
  const isLocked = await redis.set(`lock:checkout:${userId}`, 'active', 'NX', 'EX', 5)
  if (!isLocked) {
    throw new Error('您的訂單正在處理中，請勿重複提交點擊。')
  }

  // 2. 資料庫事務處理 (DB Transaction)：確保扣庫存與建訂單「同時成功」或「同時失敗」，防止產生幽靈訂單
  return await db.$transaction(async (tx) => {
    // 檢查庫存...
    // 扣減庫存...
    // 建立訂單...
    return { orderId: 'ORD_12345', paymentUrl: 'https://payment.com...' }
  })
}
```

### 2. 前端組件範本 (`references/FRONTEND_STANDARD.tsx`)

```tsx
import React, { useState, useEffect } from 'react'

interface CheckoutButtonProps {
  cartId: string
  totalAmount: number
}

/**
 * 結帳觸發按鈕組件（整合 RWD 與非同步 API 狀態管理）
 *
 * @component
 * @example
 * <CheckoutButton cartId="uuid-xxxx" totalAmount={1500} />
 */
export const CheckoutButton: React.FC<CheckoutButtonProps> = ({ cartId, totalAmount }) => {
  const [isLoading, setIsLoading] = useState<boolean>(false)
  const [apiError, setApiError] = useState<string | null>(null)

  // 副作用處理：依據台灣電商風控法規，當單筆交易金額超過新台幣 10 萬元時，
  // 必須在前端預先彈出大額交易應行注意事項，提醒使用者即將觸發雙重簡訊驗證。
  useEffect(() => {
    if (totalAmount > 100000) {
      console.warn('偵測到大額交易，已預先載入雙重驗證 (2FA) 模組。')
    }
  }, [totalAmount])

  const handleCheckout = async () => {
    setIsLoading(true)
    setApiError(null)
    try {
      const response = await fetch('/api/v1/orders/checkout', {
        method: 'POST',
        body: JSON.stringify({ cartId }),
      })
      const result = await response.json()
      if (result.paymentUrl) window.location.href = result.paymentUrl
    } catch (error) {
      setApiError('系統連線逾時，請稍後再試。')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="w-full p-4 md:max-w-md md:p-6">
      {' '}
      {/* RWD 容器：手機全寬，平板以上置中限制最大寬度 */}
      {apiError && <p className="text-sm text-red-600 mb-2 font-medium">{apiError}</p>}
      <button
        onClick={handleCheckout}
        disabled={isLoading || totalAmount <= 0}
        className={`w-full py-3 rounded-lg text-white font-bold transition-all ${
          isLoading ? 'bg-gray-400 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700'
        }`}
      >
        {isLoading ? '交易安全處理中...' : `立即支付 NT$ ${totalAmount.toLocaleString()}`}
      </button>
    </div>
  )
}
```

### 3. 說明文件範本 (`references/MODULE_README.md`)

```markdown
# [功能/模組名稱] 繁體中文維護說明書

## 📝 業務功能概述

本模組主要負責 [系統名稱] 的 `[具體商業功能，例如：購物車結帳流程]`。
它串聯了前端的 `[組件名稱]` 與後端的 `[API 端點]`，並直接操作資料庫中的 `[資料表名稱]` 表。

## ⛓️ 技術架構與資料流向 (Data Flow)

1. **客戶端請求**：前端組件透過 [React Query / Axios] 發送 `POST` 請求至後端。
2. **安全防線**：後端利用 [Zod / Pydantic] 進行第一層型別與格式防呆，未過則直接回傳 `HTTP 400`。
3. **高效快取**：在高併發情境下，系統會優先調用 [Redis 快取] 的資料；若快取失效（Miss），才會向 [PostgreSQL / MongoDB] 發動查詢，並重新同步至快取。

## ⚠️ 運維維護注意須知

- **排程清理 (Cron Job)**：系統每晚 02:00 會自動執行清理腳本，移除資料表中 `is_deleted = true` 且超過 30 天的歷史暫存紀錄。
- **擴充注意**：未來若需要新增欄位，請務必先修改 `schema.prisma` 並執行 `prisma migrate dev`。
```
