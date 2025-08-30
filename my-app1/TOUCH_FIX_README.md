# 觸控事件修復說明

## 已修復的問題

### 1. Apple Meta 標籤過時警告
- 將 `<meta name="apple-mobile-web-app-capable" content="yes">` 替換為 `<meta name="mobile-web-app-capable" content="yes">`
- 這是現代標準的寫法，避免瀏覽器警告

### 2. Passive Event Listener 錯誤
- 移除了觸控事件中的 `e.preventDefault()` 調用
- 現代瀏覽器預設將觸控事件設為被動模式，不允許 preventDefault
- 改用 `e.stopPropagation()` 來控制事件傳播

## 技術細節

### 觸控事件處理的改變
```javascript
// 修復前（會產生錯誤）
const handleTouchStart = (e, type) => {
    e.preventDefault(); // ❌ 在 passive event listener 中不允許
    e.stopPropagation();
};

// 修復後（正常工作）
const handleTouchStart = (e, type) => {
    // 不阻止預設行為，避免 passive event listener 錯誤
    e.stopPropagation();
    console.log(`Touch start for ${type}`);
};
```

### 為什麼會出現這個錯誤？
1. **Passive Event Listeners**: 現代瀏覽器為了提升滾動性能，預設將觸控事件設為被動模式
2. **preventDefault 限制**: 被動模式下不允許調用 `preventDefault()`
3. **觸控優化**: 瀏覽器會優化觸控事件的處理，但會限制某些操作

## 測試方法

### 1. 檢查控制台
- 觸控旋轉按鈕時，應該看到：
  ```
  Touch start for triangle
  Touch end for triangle
  ```

### 2. 功能測試
- 在手機上測試旋轉功能是否正常工作
- 確認沒有 JavaScript 錯誤
- 檢查觸控響應是否流暢

## 替代方案

如果仍然需要阻止預設行為，可以考慮：

### 1. 使用 addEventListener 的非被動模式
```javascript
useEffect(() => {
    const element = refs[type].current;
    if (element) {
        element.addEventListener('touchstart', (e) => {
            e.preventDefault();
        }, { passive: false });
    }
}, []);
```

### 2. 使用 CSS 來控制行為
```css
.rotate-btn {
    touch-action: none; /* 完全禁用觸控行為 */
    pointer-events: auto;
}
```

## 注意事項

1. **觸控事件順序**: `touchstart` → `touchmove` → `touchend`
2. **事件傳播**: 使用 `stopPropagation()` 而不是 `preventDefault()`
3. **瀏覽器相容性**: 這些修復適用於所有現代瀏覽器
4. **性能影響**: 移除 `preventDefault()` 不會影響觸控響應性能

## 下一步

如果問題仍然存在：
1. 檢查瀏覽器控制台是否有其他錯誤
2. 確認觸控事件是否被正確觸發
3. 測試不同的觸控事件處理方式
4. 考慮使用第三方觸控庫（如 Hammer.js）
