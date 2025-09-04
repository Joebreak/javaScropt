import React, { useState, useRef, useEffect } from "react";
import Draggable from "react-draggable";
import "./MinaRoom.css";

const rows = 8;
const cols = 10;
// 根據螢幕大小動態調整格子大小
const getCellSize = () => {
    if (typeof window !== 'undefined') {
        const width = window.innerWidth;
        if (width <= 480) return 30;
        if (width <= 768) return 40;
        return 60;
    }
    return 40;
};
const cellSize = getCellSize();

const initGrid = Array.from({ length: rows }, () => Array.from({ length: cols }, () => null));

const leftRowLabels = Array.from({ length: rows }, (_, i) => String.fromCharCode(65 + i));

const rightColLabels = Array.from({ length: cols }, (_, i) => i + 11);

const bottomRowLabels = Array.from({ length: cols }, (_, i) => String.fromCharCode("I".charCodeAt(0) + i));

const copy = (source, overrides = {}) => ({
    ...source,
    ...overrides,
    innerLayer: source.innerLayer ? {
        ...source.innerLayer,
        ...overrides.innerLayer
    } : undefined
});

const shapeStyles = {
    triangle1: {
        canRotate: true,
        width: `${cellSize * 4 + 4 * 3}px`,
        height: `${cellSize * 2 + 4 * 1}px`,
        background: "black",
        clipPath: "polygon(50% 0%, 0% 100%, 100% 100%)",
        useLayered: true,
        innerLayer: {
            background: "white",
            offset: 0,
            clipPath: "polygon(50% 2%, 2% 98%, 98% 98%)",
        },
    },
    get triangle2() { return copy(this.triangle1); },
    rightTriangle: {
        canRotate: true,
        width: `${cellSize * 2 + 4 * 1}px`,
        height: `${cellSize * 2 + 4 * 1}px`,
        background: "yellow",
        clipPath: "polygon(0 0, 100% 0, 0 100%)",
    },
    parallelogram: {
        canRotate: true,
        width: `${cellSize * 3 + 4 * 2}px`,
        height: `${cellSize * 1 + 4 * 0}px`,
        background: "red",
        clipPath: "polygon(32% 0%, 0% 100%, 65% 100%, 100% 0%)",
    },
    diamond: {
        canRotate: false,
        width: `${cellSize * 2 + 4 * 1}px`,
        height: `${cellSize * 2 + 4 * 1}px`,
        background: "blue",
        clipPath: "polygon(50% 0%, 100% 50%, 50% 100%, 0% 50%)",
    },
    transparent: {
        canRotate: true,
        width: `${cellSize * 2 + 4 * 1}px`,
        height: `${cellSize * 1 + 4 * 0}px`,
        background: "transparent",
        border: "3px dashed #333",
        clipPath: "polygon(50% 0%, 0% 100%, 100% 100%)",
        useLayered: false,
    },
    blackRect: {
        canRotate: true,
        width: `${cellSize * 1 + 4 * 0}px`,
        height: `${cellSize * 2 + 4 * 1}px`,
        background: "black",
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
    const [currentCellSize, setCurrentCellSize] = useState(cellSize);

    useEffect(() => {
        const handleResize = () => {
            setCurrentCellSize(getCellSize());
        };

        handleResize();
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

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
        const initPos = { x: 0, y: -150, rotate: 0 };
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
            localStorage.setItem(type, JSON.stringify(rotated));
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
        if (refs[type].current) {
            const element = refs[type].current;
            const shape = shapes[type];
            if ("ontouchstart" in window) {
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
            } else {
                console.log(`handleDragStart2: ${type} mousemove`);
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
                // // 開始監控
                observer.observe(element, { attributes: true, attributeFilter: ['style'] });
                // 保存 observer 引用，以便在拖曳停止時清理
                element._rotationObserver = observer;
            }
        }
    };

    const handleDrag = (type) => {
        if (refs[type].current && shapes[type]) {
            const element = refs[type].current;
            const shape = shapes[type];
            // 手機：主動控制觸控拖曳過程，確保旋轉角度不丟失
            if ("ontouchstart" in window) {
                //console.log(`handleDrag1: ${type} touchmove`);
                // 使用 requestAnimationFrame 來確保在正確的時機更新
                requestAnimationFrame(() => {
                    console.log(`handleDrag11: ${type} touchmove`);
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
            } else {
                console.log(`handleDrag2: ${type} mousemove`);
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
        //setIsDragging(prev => ({ ...prev, [type]: false }));
        console.log(`handleDragStop: ${type}`);
        // 網頁：清理 MutationObserver

        if (refs[type].current) {
            const isTouchDevice = "ontouchstart" in window;
            if (isTouchDevice) {
                const element = refs[type].current;
                const shape = shapes[type];
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
            } else {
                const element = refs[type].current;
                if (element._rotationObserver) {
                    element._rotationObserver.disconnect();
                    delete element._rotationObserver;
                }
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
                enableUserSelectHack={isTouchDevice}
                allowAnyClick={isTouchDevice}
                cancel={isTouchDevice ? undefined : ".rotate-btn"}
                // 手機上啟用觸控拖曳優化
                touchAction={isTouchDevice ? "pan-x pan-y" : undefined}
                onMouseDown={isTouchDevice ? undefined : (e) => {
                    if (isTouchDevice) return;

                    if (e.target === e.currentTarget || e.target.closest('.rotate-btn')) {
                        return;
                    }
                    handleDragStart(type);
                }}
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
                    {shapeStyles[type].useLayered && (
                        <div
                            style={{
                                position: "absolute",
                                top: `${shapeStyles[type].innerLayer.offset}px`,
                                left: `${shapeStyles[type].innerLayer.offset}px`,
                                width: `${parseInt(shapeStyles[type].width) - shapeStyles[type].innerLayer.offset * 2}px`,
                                height: `${parseInt(shapeStyles[type].height) - shapeStyles[type].innerLayer.offset * 2}px`,
                                background: shapeStyles[type].innerLayer.background,
                                clipPath: shapeStyles[type].innerLayer.clipPath || shapeStyles[type].clipPath,
                            }}
                        />
                    )}
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
                    gridTemplateRows: `${currentCellSize}px repeat(${rows}, ${currentCellSize}px) ${currentCellSize}px`, // 上 + 中間 + 下
                    gridTemplateColumns: `${currentCellSize}px repeat(${cols}, ${currentCellSize}px) ${currentCellSize}px`, // 左 + 中間 + 右
                    gap: window.innerWidth <= 480 ? 2 : 4,
                    justifyContent: "center",
                    marginBottom: window.innerWidth <= 480 ? 20 : 40,
                }}
            >
                <div style={{}} />
                {Array.from({ length: cols }, (_, cIdx) => (
                    <div
                        key={`col-header-${cIdx}`}
                        className="grid-label"
                        style={{
                            display: "flex",
                            justifyContent: "center",
                            alignItems: "center",
                            fontWeight: "bold",
                            fontSize: "14px",
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
                            className="grid-label"
                            style={{
                                display: "flex",
                                justifyContent: "center",
                                alignItems: "center",
                                fontWeight: "bold",
                                fontSize: "14px",
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
                                    width: `${currentCellSize}px`,
                                    height: `${currentCellSize}px`,
                                }}
                            />
                        ))}
                        <div
                            className="grid-label"
                            style={{
                                display: "flex",
                                justifyContent: "center",
                                alignItems: "center",
                                fontWeight: "bold",
                                fontSize: "14px",
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
                        className="grid-label"
                        style={{
                            display: "flex",
                            justifyContent: "center",
                            alignItems: "center",
                            fontWeight: "bold",
                            fontSize: "14px",
                        }}
                    >
                        {bottomRowLabels[cIdx]}
                    </div>
                ))}
            </div>

            <div style={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                marginBottom: window.innerWidth <= 480 ? 5 : 10,
                gap: window.innerWidth <= 480 ? 8 : 12,
            }}>
                {/* 第一排：刪除按鈕 + 前5個形狀按鈕 */}
                <div style={{
                    display: "flex",
                    justifyContent: "center",
                    alignItems: "center",
                    gap: window.innerWidth <= 480 ? 5 : 10,
                    flexWrap: "wrap"
                }}>
                    {/* 刪除區域 */}
                    <div
                        ref={deleteRef}
                        className="delete-area"
                        style={{
                            width: 40,
                            height: 40,
                            background: "transparent",
                            border: "2px dashed red",
                            display: "flex",
                            justifyContent: "center",
                            alignItems: "center",
                            borderRadius: 8,
                            zIndex: 999,
                            fontSize: "16px",
                            fontWeight: "bold",
                            color: "red",
                        }}>X</div>
                    {Object.keys(shapeStyles).slice(0, 5).map((type) => (
                        <button
                            key={type}
                            className="shape-button"
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
                            <div style={{
                                ...shapeStyles[type],
                                transform: "scale(0.5)",
                                position: "static",
                                cursor: "default",
                                background: shapeStyles[type].useLayered ? shapeStyles[type].innerLayer.background : shapeStyles[type].background,
                                border: "1px solid black"
                            }} />
                        </button>
                    ))}
                </div>

                {/* 第二排：剩餘的形狀按鈕 */}
                {Object.keys(shapeStyles).length > 5 && (
                    <div style={{
                        display: "flex",
                        justifyContent: "center",
                        alignItems: "center",
                        gap: window.innerWidth <= 480 ? 5 : 10,
                        flexWrap: "wrap"
                    }}>
                        {Object.keys(shapeStyles).slice(5).map((type) => (
                            <button
                                key={type}
                                className="shape-button"
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
                                <div style={{
                                    ...shapeStyles[type],
                                    transform: "scale(0.5)",
                                    position: "static",
                                    cursor: "default",
                                    background: shapeStyles[type].useLayered ? shapeStyles[type].innerLayer.background : shapeStyles[type].background,
                                    border: "1px solid black"
                                }} />
                            </button>
                        ))}
                    </div>
                )}
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
