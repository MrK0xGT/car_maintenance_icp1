# 汽車維修平台專案 (Car Maintenance ICP)

## 專案簡介
這是一個基於 Internet Computer (ICP) 的汽車維修平台，旨在為客戶提供便捷的汽車維修預約服務，並為技師提供維修進度管理功能。專案使用 Motoko 開發後端，React 開發前端，並整合了 NFT 技術來記錄預約和維修單。

## 功能
- 維修記錄：添加和查看維修記錄
- 技師預約：預約技師
- 新增技師：添加新技師
- 客戶預約：客戶預約技師並生成 NFT 標識，包含車牌號碼
- 查看進度：客戶查看自己的所有預約和對應的維修進度
- 技師更新：技師更新維修進度
- 付款：模擬加密貨幣付款並生成 NFT 維修單

## 部署和運行步驟
1. 啟動 DFX 網絡：
   dfx start --host 127.0.0.1:8000 --clean --background

2. 部署後端：
   dfx deploy

3. 添加初始數據：
   dfx canister call car_maintenance_icp1_backend addTechnician '("T001", "張技師", vec { "汽車維修證照" }, 5, vec { "2025-03-25 10:00" })'
   dfx canister call car_maintenance_icp1_backend addRecord '(1, "2025-03-25", "Toyota Camry", vec { "更換機油"; "檢查輪胎" }, "T001")'

4. 啟動前端：
   cd src/car_maintenance_icp1_frontend
   npm start

5. 訪問應用：
   打開瀏覽器，訪問 http://localhost:3000