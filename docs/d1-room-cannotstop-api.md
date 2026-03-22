# D1 `/api/d1/room/:room` — Cannot Stop

本機實作：`my-server/d1RoomRoutes.js`。

前端：**擲骰不 POST**，僅 WS；**按下停下來** 才 POST 一筆回合結算。

## GET 回應

**陣列**，`round === 0` 為房間 meta：

```json
{
  "round": 0,
  "data": {
    "note2": 2,
    "currentPlayerRank": 1,
    "dice": ["4,2,3,6", "6,4,2,1"]
  },
  "list": []
}
```

- `dice`：可為歷史累積（每停一次可把該回合的 `data.dice` 合併進來）

`round !== 0`：`data` 為 **物件** `{ currentPlayerRank, dice }`（與 POST 一致）或舊版單一數字；`list` 為 `{ num, count }[]`。

## POST — 僅「停下來換人」

```json
{
  "room": 29382,
  "type": null,
  "data": {
    "currentPlayerRank": 1,
    "dice": ["4,2,3,6", "6,4,2,1"]
  },
  "list": [
    { "num": 2, "count": 4 },
    { "num": 4, "count": 1 }
  ],
  "round": 1
}
```

後端應：寫入該回合；更新 round0 `currentPlayerRank` 為下一手：`(round % members) + 1`；`data.dice` 合併進歷史或僅存回合列依需求。

## 可選（本機 mock）

```json
{ "action": "setMeta", "note2": 4 }
```
