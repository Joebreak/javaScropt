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

        // 防卡死機制：定期檢查並重置異常狀態
        const resetInterval = setInterval(() => {
            setIsDragging(prev => {
                const hasActiveDragging = Object.values(prev).some(isDragging => isDragging);
                if (hasActiveDragging) {
                    console.log('定期檢查：發現活躍拖曳狀態，重置所有拖曳狀態');
                    return {};
                }
                return prev;
            });
        }, 5000); // 每5秒檢查一次

        return () => clearInterval(resetInterval);
    }, []);

    // 全局觸控事件監聽，防止觸控卡死
    useEffect(() => {
        const handleGlobalTouchEnd = () => {
            // 觸控結束時檢查是否有異常的拖曳狀態
            setTimeout(() => {
                setIsDragging(prev => {
                    const hasActiveDragging = Object.values(prev).some(isDragging => isDragging);
                    if (hasActiveDragging) {
                        console.log('全局觸控結束：發現異常拖曳狀態，重置所有拖曳狀態');
                        return {};
                    }
                    return prev;
                });
            }, 200);
        };

        document.addEventListener('touchend', handleGlobalTouchEnd);
        document.addEventListener('touchcancel', handleGlobalTouchEnd);

        return () => {
            document.removeEventListener('touchend', handleGlobalTouchEnd);
            document.removeEventListener('touchcancel', handleGlobalTouchEnd);
        };
    }, []);

    // 監聽 shapes 變化，強制更新 DOM 中的旋轉角度
    useEffect(() => {
        if (!isLoaded) return;

        Object.keys(shapes).forEach((type) => {
            const shape = shapes[type];
            if (shape && refs[type].current) {
                const element = refs[type].current;

                // 檢查當前 DOM 中的旋轉角度
                const currentTransform = element.style.transform;
                const translateMatch = currentTransform.match(/translate\([^)]+\)/);
                const rotationMatch = currentTransform.match(/rotate\(([^)]+)\)/);

                // 如果旋轉角度不匹配，強制更新
                if (!rotationMatch || rotationMatch[1] !== `${shape.rotate}deg`) {
                    if (translateMatch) {
                        element.style.transform = `${translateMatch[0]} rotate(${shape.rotate}deg)`;
                    } else {
                        element.style.transform = `rotate(${shape.rotate}deg)`;
                    }

                    console.log(`強制修正 ${type} 的旋轉: ${shape.rotate}°`);

                    // 強制重繪
                    void element.offsetHeight;
                }
            }
        });
    }, [shapes, refs, isLoaded]);

    // 監聽拖曳狀態，在拖曳過程中保持旋轉角度
    useEffect(() => {
        Object.keys(isDragging).forEach((type) => {
            if (isDragging[type] && refs[type].current) {
                // 在拖曳過程中實時保持旋轉角度
                const element = refs[type].current;
                const shape = shapes[type];
                if (shape) {
                    const currentTransform = element.style.transform;
                    const translateMatch = currentTransform.match(/translate\([^)]+\)/);
                    if (translateMatch) {
                        element.style.transform = `${translateMatch[0]} rotate(${shape.rotate}deg)`;
                        console.log(`拖曳結束後恢復 ${type} 的旋轉角度: ${shape.rotate}°`);
                    }
                }
            }
        });
    }, [isDragging, shapes, refs]);

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
        console.log(`開始旋轉 ${type}`);

        setShapes((prev) => {
            const shape = prev[type];
            if (!shape) return prev;

            const newRotation = (shape.rotate + 90) % 360;
            const rotated = { ...shape, rotate: newRotation };

            console.log(`狀態更新: ${type} 從 ${shape.rotate}° 到 ${newRotation}°`);

            // 保存到 localStorage
            localStorage.setItem(type, JSON.stringify(rotated));

            // 立即強制更新 DOM
            setTimeout(() => {
                if (refs[type].current) {
                    const element = refs[type].current;
                    const currentTransform = element.style.transform;
                    const translateMatch = currentTransform.match(/translate\([^)]+\)/);

                    if (translateMatch) {
                        element.style.transform = `${translateMatch[0]} rotate(${newRotation}deg)`;
                    } else {
                        element.style.transform = `rotate(${newRotation}deg)`;
                    }

                    console.log(`強制更新 DOM: ${type} 旋轉到 ${newRotation}°`);

                    // 強制重繪
                    void element.offsetHeight;
                }
            }, 0);

            return { ...prev, [type]: rotated };
        });
    };

    // 觸控事件處理 - 避免 preventDefault 錯誤
    const handleTouchStart = (e, type) => {
        e.stopPropagation();
        console.log(`觸控開始: ${type}`);
    };

    const handleTouchEnd = (e, type) => {
        e.stopPropagation();

        // 觸控旋轉也需要立即生效
        console.log(`觸控旋轉 ${type}`);
        rotateShape(type);
    };

    // 防止觸控移動時的意外行為
    const handleTouchMove = (e) => {
        e.stopPropagation();
    };

    const handleDragStart = (type) => {
        setIsDragging(prev => ({ ...prev, [type]: true }));
    };

    const handleDrag = (type) => {
        // 在拖曳過程中實時保持旋轉角度
        if (refs[type].current) {
            const element = refs[type].current;
            const shape = shapes[type];
            if (shape) {
                // 強制保持旋轉角度，使用更激進的方式
                const currentTransform = element.style.transform;
                const translateMatch = currentTransform.match(/translate\([^)]+\)/);
                if (translateMatch) {
                    const newTransform = `${translateMatch[0]} rotate(${shape.rotate}deg)`;
                    element.style.transform = newTransform;
                }

                // 使用 MutationObserver 監聽樣式變化，立即恢復旋轉角度
                if (!element._rotationObserver) {
                    element._rotationObserver = new MutationObserver(() => {
                        const currentTransform = element.style.transform;
                        const rotationMatch = currentTransform.match(/rotate\(([^)]+)\)/);
                        if (!rotationMatch || rotationMatch[1] !== `${shape.rotate}deg`) {
                            const translateMatch = currentTransform.match(/translate\([^)]+\)/);
                            if (translateMatch) {
                                element.style.transform = `${translateMatch[0]} rotate(${shape.rotate}deg)`;
                            }
                        }
                    });

                    element._rotationObserver.observe(element, {
                        attributes: true,
                        attributeFilter: ['style']
                    });
                }
            }
        }
    };

    const handleDragStop = (type) => {
        console.log(`拖曳停止: ${type}`);
        setIsDragging(prev => ({ ...prev, [type]: false }));

        // 清理 MutationObserver
        if (refs[type].current && refs[type].current._rotationObserver) {
            refs[type].current._rotationObserver.disconnect();
            refs[type].current._rotationObserver = null;
        }
    };

    const renderShape = (type) => {
        const shape = shapes[type];
        if (!shape) return null;

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
                enableUserSelectHack={false}
                allowAnyClick={true}
                cancel=".rotate-btn"
                onMouseDown={(e) => {
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
                        // 強制保持旋轉角度
                        ...(isDragging[type] && {
                            '--rotation-angle': `${shape.rotate}deg`,
                            '--force-rotation': 'true'
                        })
                    }}
                    data-rotation={shape.rotate}
                    onTouchStart={(e) => {
                        // 只在旋轉按鈕外的區域允許拖曳
                        if (e.target === e.currentTarget) {
                            console.log(`圖形觸控開始: ${type} - 允許拖曳`);
                        }
                    }}
                >
                    {shapeStyles[type].canRotate && (
                        <div
                            className="rotate-btn"
                            onClick={(e) => {
                                if ("ontouchstart" in window) return; // 手機上不執行 click
                                e.preventDefault();
                                e.stopPropagation();
                                rotateShape(type);
                                setIsDragging(prev => ({ ...prev, [type]: false })); // 保證能繼續拖曳
                            }}
                            onTouchEnd={(e) => {
                                e.preventDefault();
                                e.stopPropagation();
                                rotateShape(type);
                                setIsDragging(prev => ({ ...prev, [type]: false })); // 保證能繼續拖曳
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
