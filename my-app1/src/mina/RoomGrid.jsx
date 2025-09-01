import React, { useState, useRef, useEffect } from "react";
import Draggable from "react-draggable";
// CSS 樣式已內聯到組件中

const rows = 8;
const cols = 10;

const initGrid = Array.from({ length: rows }, () => Array.from({ length: cols }, () => null));

const leftRowLabels = Array.from({ length: rows }, (_, i) => String.fromCharCode(65 + i));

const rightColLabels = Array.from({ length: cols }, (_, i) => i + 11);

const bottomRowLabels = Array.from({ length: cols }, (_, i) => String.fromCharCode("I".charCodeAt(0) + i));

const shapeStyles = {
    triangle: {
        canRotate: true,
        width: 60,
        height: 60,
        background: "blue",
        clipPath: "polygon(50% 0%, 0% 100%, 100% 100%)",
    },
    rightTriangle: {
        canRotate: true,
        width: 60,
        height: 60,
        background: "yellow",
        clipPath: "polygon(0 0, 100% 0, 0 100%)",
    },
    parallelogram: {
        canRotate: true,
        width: 90,
        height: 60,
        background: "red",
        clipPath: "polygon(20% 0%, 100% 0%, 80% 100%, 0% 100%)",
    },
    diamond: {
        canRotate: false,
        width: 80,
        height: 80,
        background: "white",
        clipPath: "polygon(50% 0%, 100% 50%, 50% 100%, 0% 50%)",
        border: "3px solid black",
    },
};

function MinaRoom() {
    const getInitialShapes = () => {
        const shapes = {};
        Object.keys(shapeStyles).forEach((type) => {
            const saved = localStorage.getItem(type);
            shapes[type] = saved ? JSON.parse(saved) : null;
        });
        return shapes;
    };
    const [shapes, setShapes] = useState(getInitialShapes);
    const [isDragging, setIsDragging] = useState({});

    const refs = React.useMemo(() => {
        const obj = {};
        Object.keys(shapeStyles).forEach((type) => {
            obj[type] = React.createRef();
        });
        return obj;
    }, []);

    // 監控旋轉狀態變化，強制更新 DOM（只在拖曳停止後）
    useEffect(() => {
        Object.keys(shapes).forEach((type) => {
            if (shapes[type] && refs[type].current && !isDragging[type]) {
                const element = refs[type].current;
                const shape = shapes[type];
                const currentTransform = element.style.transform;
                const translateMatch = currentTransform.match(/translate\([^)]+\)/);

                if (translateMatch) {
                    element.style.transform = `${translateMatch[0]} rotate(${shape.rotate}deg)`;
                } else {
                    element.style.transform = `rotate(${shape.rotate}deg)`;
                }
            }
        });
    }, [shapes, isDragging, refs]);

    const addShape = (type) => {
        const initPos = { x: 0, y: 50, rotate: 0 };
        setShapes((prev) => ({ ...prev, [type]: initPos }));
        localStorage.setItem(type, JSON.stringify(initPos));
    };

    const removeShape = (type) => {
        setShapes((prev) => ({ ...prev, [type]: null }));
        localStorage.removeItem(type);
    };
    const deleteRef = useRef(null);

    const handleStop = (type, e, data) => {
        const { x, y } = data;
        if (deleteRef.current) {
            let shapeXInWindow, shapeYInWindow;
            if (e.type.startsWith("touch")) {
                const touch = e.changedTouches[0];
                shapeXInWindow = touch.clientX;
                shapeYInWindow = touch.clientY;
            } else {
                shapeXInWindow = e.clientX;
                shapeYInWindow = e.clientY;
            }
            const deleteRect = deleteRef.current.getBoundingClientRect();
            const overlapX =
                shapeXInWindow > deleteRect.left && shapeXInWindow < deleteRect.right;
            const overlapY =
                shapeYInWindow > deleteRect.top && shapeYInWindow < deleteRect.bottom;
            if (overlapX && overlapY) {
                removeShape(type);
                return;
            }
        }
        setShapes((prev) => {
            const updated = { ...prev, [type]: { ...prev[type], x, y } };
            localStorage.setItem(type, JSON.stringify(updated[type]));
            return updated;
        });
    };

    const rotateShape = (type) => {
        setShapes((prev) => {
            const shape = prev[type];
            if (!shape) return prev;
            const newRotation = (shape.rotate + 90) % 360;
            const rotated = { ...shape, rotate: newRotation };
            // 保存到 localStorage
            localStorage.setItem(type, JSON.stringify(rotated));
            // 觸控設備上也需要強制更新 DOM，確保拖曳功能正常
            if (("ontouchstart" in window) && refs[type].current) {
                const element = refs[type].current;
                const currentTransform = element.style.transform;
                const translateMatch = currentTransform.match(/translate\([^)]+\)/);

                if (translateMatch) {
                    element.style.transform = `${translateMatch[0]} rotate(${newRotation}deg)`;
                } else {
                    element.style.transform = `rotate(${newRotation}deg)`;
                }
            }
            // 強制更新 DOM 以確保旋轉立即生效
            if (refs[type].current) {
                const element = refs[type].current;
                const currentTransform = element.style.transform;
                const translateMatch = currentTransform.match(/translate\([^)]+\)/);

                if (translateMatch) {
                    element.style.transform = `${translateMatch[0]} rotate(${newRotation}deg)`;
                } else {
                    element.style.transform = `rotate(${newRotation}deg)`;
                }
                void element.offsetHeight;
            }
            return { ...prev, [type]: rotated };
        });
    };

    const handleDragStart = (type) => {
        setIsDragging(prev => ({ ...prev, [type]: true }));

        // 網頁：設置 MutationObserver 來監控樣式變化
        const isTouchDevice = "ontouchstart" in window;
        if (!isTouchDevice && refs[type].current) {
            const element = refs[type].current;
            const shape = shapes[type];

            // 創建 MutationObserver 來監控樣式變化
            const observer = new MutationObserver((mutations) => {
                mutations.forEach((mutation) => {
                    if (mutation.type === 'attributes' && mutation.attributeName === 'style') {
                        const currentTransform = element.style.transform;
                        const hasRotation = currentTransform.includes('rotate');

                        if (!hasRotation) {
                            // 如果沒有旋轉，強制添加回來
                            const translateMatch = currentTransform.match(/translate\([^)]+\)/);
                            if (translateMatch) {
                                element.style.transform = `${translateMatch[0]} rotate(${shape.rotate}deg)`;
                            } else {
                                element.style.transform = `rotate(${shape.rotate}deg)`;
                            }
                        }
                    }
                });
            });

            // 開始監控
            observer.observe(element, { attributes: true, attributeFilter: ['style'] });

            // 保存 observer 引用，以便在拖曳停止時清理
            element._rotationObserver = observer;
        }
        // 手機：主動控制觸控拖曳，確保旋轉角度不丟失
        if (isTouchDevice && refs[type].current) {
            const element = refs[type].current;
            const shape = shapes[type];

            // 使用 requestAnimationFrame 確保在正確時機更新樣式
            requestAnimationFrame(() => {
                if (element && element.style && shape) {
                    const currentTransform = element.style.transform;
                    const translateMatch = currentTransform.match(/translate\([^)]+\)/);

                    if (translateMatch) {
                        element.style.transform = `${translateMatch[0]} rotate(${shape.rotate}deg)`;
                    } else {
                        element.style.transform = `rotate(${shape.rotate}deg)`;
                    }
                }
            });
        }
    };

    const handleDrag = (type) => {
        // 檢測是否為觸控設備
        const isTouchDevice = "ontouchstart" in window;
        if (isTouchDevice) {
            // 手機：主動控制觸控拖曳過程，確保旋轉角度不丟失
            if (refs[type].current && shapes[type]) {
                const element = refs[type].current;
                const shape = shapes[type];

                // 使用 requestAnimationFrame 來確保在正確的時機更新
                requestAnimationFrame(() => {
                    if (element && element.style) {
                        const currentTransform = element.style.transform;
                        const translateMatch = currentTransform.match(/translate\([^)]+\)/);

                        if (translateMatch) {
                            element.style.transform = `${translateMatch[0]} rotate(${shape.rotate}deg)`;
                        } else {
                            element.style.transform = `rotate(${shape.rotate}deg)`;
                        }
                    }
                });
            }
        } else {
            // 網頁：拖曳過程中強制保持旋轉角度
            if (refs[type].current && shapes[type]) {
                const element = refs[type].current;
                const shape = shapes[type];

                // 使用 requestAnimationFrame 來確保在正確的時機更新
                requestAnimationFrame(() => {
                    if (element && element.style) {
                        const currentTransform = element.style.transform;
                        const translateMatch = currentTransform.match(/translate\([^)]+\)/);

                        if (translateMatch) {
                            element.style.transform = `${translateMatch[0]} rotate(${shape.rotate}deg)`;
                        } else {
                            element.style.transform = `rotate(${shape.rotate}deg)`;
                        }
                    }
                });
            }
        }
    };

    const handleDragStop = (type) => {
        setIsDragging(prev => ({ ...prev, [type]: false }));

        // 網頁：清理 MutationObserver
        const isTouchDevice = "ontouchstart" in window;
        if (!isTouchDevice && refs[type].current) {
            const element = refs[type].current;
            if (element._rotationObserver) {
                element._rotationObserver.disconnect();
                delete element._rotationObserver;
            }
        }

        // 手機：確保拖曳停止後樣式正確
        if (isTouchDevice && refs[type].current && shapes[type]) {
            const element = refs[type].current;
            const shape = shapes[type];

            // 確保拖曳停止後旋轉角度正確
            requestAnimationFrame(() => {
                if (element && element.style && shape) {
                    const currentTransform = element.style.transform;
                    const translateMatch = currentTransform.match(/translate\([^)]+\)/);

                    if (translateMatch) {
                        element.style.transform = `${translateMatch[0]} rotate(${shape.rotate}deg)`;
                    } else {
                        element.style.transform = `rotate(${shape.rotate}deg)`;
                    }
                }
            });
        }
    };

    const renderShape = (type) => {
        const shape = shapes[type];
        if (!shape) return null;

        // 檢測是否為觸控設備
        const isTouchDevice = "ontouchstart" in window;

        return (
            <Draggable
                nodeRef={refs[type]}
                position={{ x: shape.x, y: shape.y }}
                onStart={() => handleDragStart(type)}
                onDrag={() => handleDrag(type)}
                onStop={(e, data) => {
                    handleDragStop(type);
                    handleStop(type, e, data);
                }}
                // 手機和網頁使用不同的配置
                enableUserSelectHack={isTouchDevice}
                allowAnyClick={isTouchDevice}
                cancel={isTouchDevice ? undefined : ".rotate-btn"}
                // 手機上啟用觸控拖曳優化
                touchAction={isTouchDevice ? "pan-x pan-y" : undefined}
                // 手機上主動控制觸控處理，確保拖曳體驗一致
                // 手機和網頁使用不同的滑鼠事件處理
                onMouseDown={isTouchDevice ? undefined : (e) => {
                    // 只在網頁上處理滑鼠事件
                    if (isTouchDevice) return;

                    // 確保拖曳開始時保持旋轉角度
                    if (e.target === e.currentTarget || e.target.closest('.rotate-btn')) {
                        return;
                    }
                    handleDragStart(type);
                }}
            // 手機上主動控制觸控處理，確保拖曳體驗一致
            >
                <div
                    key={type}
                    ref={refs[type]}
                    className={`${isDragging[type] ? 'shape-dragging' : ''} shape-${type}`}
                    style={{
                        position: "absolute",
                        ...shapeStyles[type],
                        transform: `rotate(${shape.rotate}deg)`,
                        cursor: isDragging[type] ? "grabbing" : "grab",
                        // 強制保持旋轉
                        willChange: "transform",
                    }}
                    data-rotation={shape.rotate}
                >
                    {shapeStyles[type].canRotate && (
                        <div
                            className="rotate-btn"
                            // 點擊 (網頁)
                            onClick={(e) => {
                                if (isTouchDevice) return;
                                e.preventDefault();
                                e.stopPropagation();
                                rotateShape(type);
                            }}
                            // 觸控 (手機)
                            onTouchEnd={(e) => {
                                if (!isTouchDevice) return;
                                rotateShape(type);
                            }}
                        >
                            ⟳
                        </div>
                    )}
                </div>
            </Draggable>
        );
    };

    return (
        <div style={{ padding: 0, position: "relative", background: "#f7f7f7" }}>
            <div
                style={{
                    display: "grid",
                    gridTemplateRows: `40px repeat(${rows}, 30px) 40px`, // 上 + 中間 + 下
                    gridTemplateColumns: `40px repeat(${cols}, 30px) 40px`, // 左 + 中間 + 右
                    gap: 4,
                    justifyContent: "center",
                    marginBottom: 40,
                }}
            >
                <div style={{}} />
                {Array.from({ length: cols }, (_, cIdx) => (
                    <div
                        key={`col-header-${cIdx}`}
                        style={{
                            display: "flex",
                            justifyContent: "center",
                            alignItems: "center",
                            fontWeight: "bold",
                        }}
                    >
                        {cIdx + 1}
                    </div>
                ))}
                <div style={{}} />
                {/* 行號 + 格子 */}
                {initGrid.map((row, rIdx) => (
                    <React.Fragment key={`row-${rIdx}`}>
                        <div
                            style={{
                                display: "flex",
                                justifyContent: "center",
                                alignItems: "center",
                                fontWeight: "bold",
                            }}
                        >
                            {leftRowLabels[rIdx]}
                        </div>
                        {row.map((_, cIdx) => (
                            <div
                                key={`${rIdx}-${cIdx}`}
                                style={{
                                    border: "1px solid #ccc",
                                    background: "#fff",
                                    width: 30,
                                    height: 30,
                                }}
                            />
                        ))}
                        <div
                            style={{
                                display: "flex",
                                justifyContent: "center",
                                alignItems: "center",
                                fontWeight: "bold",
                            }}
                        >
                            {rightColLabels[rIdx]}
                        </div>
                    </React.Fragment>
                ))}
                <div style={{}} /> {/* 右上角空白 */}
                {Array.from({ length: cols }, (_, cIdx) => (
                    <div
                        key={`bottom-${cIdx}`}
                        style={{
                            display: "flex",
                            justifyContent: "center",
                            alignItems: "center",
                            fontWeight: "bold",
                        }}
                    >
                        {bottomRowLabels[cIdx]}
                    </div>
                ))}
            </div>

            <div style={{ display: "flex", justifyContent: "center", marginBottom: 10, gap: 10, }}>
                {/* 刪除區域 */}
                <div
                    ref={deleteRef}
                    style={{
                        //position: "fixed",
                        top: 20,
                        left: "50%",
                        transform: "translateX(-50%)",
                        width: 40,
                        height: 40,
                        background: "transparent",
                        border: "2px dashed red",
                        display: "flex",
                        justifyContent: "center",
                        alignItems: "center",
                        borderRadius: 8,
                        zIndex: 999,
                    }}>X</div>
                {Object.keys(shapeStyles).map((type) => (
                    <button
                        key={type}
                        onClick={() => addShape(type)}
                        style={{
                            width: 50,
                            height: 50,
                            display: "flex",
                            justifyContent: "center",
                            alignItems: "center",
                            border: "1px solid #ccc",
                            borderRadius: 8,
                            background: "#f9f9f9",
                            cursor: "pointer",
                        }}
                    >
                        <div style={{ ...shapeStyles[type], transform: "scale(0.5)" }} />
                    </button>
                ))}
            </div>
            <div />
            {Object.keys(shapes).map((type) => (
                <React.Fragment key={type}>
                    {renderShape(type)}
                </React.Fragment>
            ))}
        </div>
    );
}

export default MinaRoom;

// 內聯 CSS 樣式
const styles = `
/* 手機觸控優化 */
* {
  -webkit-touch-callout: none;
  -webkit-user-select: none;
  -khtml-user-select: none;
  -moz-user-select: none;
  -ms-user-select: none;
  user-select: none;
  -webkit-tap-highlight-color: transparent;
}

/* 強制保持旋轉角度的樣式 */
.shape-dragging {
  transition: none !important;
  will-change: transform;
  /* 確保拖曳過程中旋轉角度不丟失 */
  transform-origin: center center;
}

.shape-dragging *:not(.rotate-btn) {
  pointer-events: none;
}

.rotate-btn {
  pointer-events: auto !important;
}

/* 旋轉過渡效果 */
.shape {
  transition: none;
}

.shape-dragging {
  transition: none !important;
}

/* 強制旋轉更新 */
.shape-triangle,
.shape-rightTriangle,
.shape-parallelogram {
  will-change: transform;
  transform-style: preserve-3d;
}

/* 旋轉按鈕點擊時的即時反饋 */
.rotate-btn:active {
  transform: translate(-50%, -50%) scale(0.9);
  transition: transform 0.1s ease;
}

/* 確保旋轉按鈕在 active 狀態下仍然可見 */
.rotate-btn:active {
  z-index: 1000;
}

/* 確保觸控事件正常工作 */
html, body {
  touch-action: manipulation;
  -webkit-overflow-scrolling: touch;
}

/* 觸控設備優化 */
@media (hover: none) and (pointer: coarse) {
  .rotate-btn {
    min-width: 30px;
    min-height: 30px;
    font-size: 14px;
    width: 30px !important;
    height: 30px !important;
  }
  
  .shape-button {
    min-width: 60px;
    min-height: 60px;
  }
}

.grid-container {
  display: grid;
  gap: 4px;
  justify-content: center;
  margin-bottom: 40px;
}

.grid-cell {
  border: 1px solid #ccc;
  background: #fff;
  width: 30px;
  height: 30px;
}

.shape {
  position: absolute;
  cursor: grab;
  touch-action: pan-x pan-y;
  -webkit-user-select: none;
  user-select: none;
}

.rotate-btn {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  width: 20px;
  height: 20px;
  background: #4f8cff;
  color: #1f0303ff;
  font-size: 12px;
  display: flex;
  justify-content: center;
  align-items: center;
  border-radius: 50%;
  cursor: pointer;
  z-index: 999;
  touch-action: manipulation;
  -webkit-tap-highlight-color: transparent;
  pointer-events: auto !important;
  user-select: none;
  -webkit-user-select: none;
  /* 觸控優化 */
  -webkit-touch-callout: none;
  -webkit-user-select: none;
  -khtml-user-select: none;
  -moz-user-select: none;
  -ms-user-select: none;
}

.delete-area {
  width: 40px;
  height: 40px;
  border: 2px dashed red;
  display: flex;
  justify-content: center;
  align-items: center;
  border-radius: 8px;
  z-index: 999;
}

.shape-button {
  width: 50px;
  height: 50px;
  display: flex;
  justify-content: center;
  align-items: center;
  border: 1px solid #ccc;
  border-radius: 8px;
  background: #f9f9f9;
  cursor: pointer;
}

/* 拖曳區域優化 */
.shape-triangle,
.shape-rightTriangle,
.shape-parallelogram,
.shape-diamond {
  touch-action: pan-x pan-y;
  -webkit-user-select: none;
  user-select: none;
  -webkit-touch-callout: none;
}
`;

// 動態注入樣式
if (typeof document !== 'undefined') {
    const styleElement = document.createElement('style');
    styleElement.textContent = styles;
    document.head.appendChild(styleElement);
}
