import React, { useState, useRef, useEffect } from "react";
import Draggable from "react-draggable";
import "./MinaRoom.css";

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
    const [isLoaded, setIsLoaded] = useState(false);
    const [isDragging, setIsDragging] = useState({});

    const refs = React.useMemo(() => {
        const obj = {};
        Object.keys(shapeStyles).forEach((type) => {
            obj[type] = React.createRef();
        });
        return obj;
    }, []);

    // 從 localStorage 讀取保存的狀態
    useEffect(() => {
        const savedShapes = getInitialShapes();
        setShapes(savedShapes);
        setIsLoaded(true);
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
    }, [shapes, isDragging]);

    const addShape = (type) => {
        const initPos = { x: 0, y: 0, rotate: 0 };
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

                // 強制瀏覽器重新渲染
                void element.offsetHeight;
            }

            return { ...prev, [type]: rotated };
        });
    };

    // 觸控事件處理 - 避免 preventDefault 錯誤
    const handleTouchStart = (e, type) => {
        e.stopPropagation();
    };

    const handleTouchEnd = (e, type) => {
        e.stopPropagation();
        // 觸控旋轉也需要立即生效
        rotateShape(type);
    };

    // 防止觸控移動時的意外行為
    const handleTouchMove = (e) => {
        e.stopPropagation();
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
    };

        const handleDrag = (type) => {
        // 檢測是否為觸控設備
        const isTouchDevice = "ontouchstart" in window;
        
        if (isTouchDevice) {
            // 手機：拖曳時不做任何干擾，讓 react-draggable 自由處理
            return;
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
                enableUserSelectHack={isTouchDevice ? true : false}
                allowAnyClick={isTouchDevice ? true : false}
                cancel=".rotate-btn"
                // 手機上啟用觸控拖曳優化
                touchAction={isTouchDevice ? "pan-x pan-y" : undefined}

                onMouseDown={(e) => {
                    // 只在網頁上處理滑鼠事件
                    if (isTouchDevice) return;
                    
                    // 確保拖曳開始時保持旋轉角度
                    if (e.target === e.currentTarget || e.target.closest('.rotate-btn')) {
                        return;
                    }
                    handleDragStart(type);
                }}
            >
                <div
                    key={`${type}-${shape.rotate}`}
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
                             onClick={(e) => {
                                 // 只在網頁上處理點擊
                                 if (isTouchDevice) return;
                                 
                                 e.preventDefault();
                                 e.stopPropagation();
                                 rotateShape(type);
                             }}
                             onTouchStart={(e) => {
                                 // 只在手機上處理觸控
                                 if (!isTouchDevice) return;
                                 
                                 e.stopPropagation();
                             }}
                             onTouchEnd={(e) => {
                                 // 只在手機上處理觸控
                                 if (!isTouchDevice) return;
                                 
                                 e.stopPropagation();
                                 // 防止重複觸發
                                 if (!e.target._rotated) {
                                     e.target._rotated = true;
                                     rotateShape(type);
                                     // 延遲重置標記，防止快速點擊
                                     setTimeout(() => {
                                         e.target._rotated = false;
                                     }, 300);
                                 }
                             }}
                             onMouseDown={(e) => {
                                 // 只在網頁上處理滑鼠
                                 if (isTouchDevice) return;
                                 
                                 e.preventDefault();
                                 e.stopPropagation();
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
