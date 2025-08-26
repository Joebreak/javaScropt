import React, { useState, useRef } from "react";
import Draggable from "react-draggable";

const rows = 8;
const cols = 10;

// 格子初始化
const initGrid = Array.from({ length: rows }, () =>
    Array.from({ length: cols }, () => null)
);

const shapeStyles = {
    triangle: {
        width: 60,
        height: 60,
        background: "red",
        clipPath: "polygon(50% 0%, 0% 100%, 100% 100%)",
    },
    rightTriangle: {
        width: 60,
        height: 60,
        background: "yellow",
        clipPath: "polygon(0 0, 100% 0, 0 100%)",
    },
    parallelogram: {
        width: 90,
        height: 60,
        background: "white",
        clipPath: "polygon(20% 0%, 100% 0%, 80% 100%, 0% 100%)",
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

    const refs = {
        triangle: useRef(null),
        rightTriangle: useRef(null),
        parallelogram: useRef(null),
    };
    const addShape = (type) => {
        const initPos = { x: 0, y: 0, rotate: 0 };
        setShapes((prev) => ({ ...prev, [type]: initPos }));
        localStorage.setItem(type, JSON.stringify(initPos));
    };

    const removeShape = (type) => {
        setShapes((prev) => ({ ...prev, [type]: null }));
        localStorage.removeItem(type);
    };
    const deleteArea = { width: 80, height: 80 };

    const handleStop = (type, e, data) => {
        const { x, y } = data;
        const deleteX = window.innerWidth - deleteArea.width - 20;
        const deleteY = window.innerHeight - deleteArea.height - 20;

        if (
            x + shapeStyles[type].width > deleteX &&
            x < deleteX + deleteArea.width &&
            y + shapeStyles[type].height > deleteY &&
            y < deleteY + deleteArea.height
        ) {
            removeShape(type);
            return;
        }
        setShapes(prev => {
            const updated = { ...prev, [type]: { ...prev[type], x, y } };
            console.log(updated);
            localStorage.setItem(type, JSON.stringify(updated[type]));
            return updated;
        });
    };

    const rotateShape = (type) => {
        setShapes((prev) => {
            const shape = prev[type];
            if (!shape) return prev;
            const rotated = { ...shape, rotate: (shape.rotate + 90) % 360 };
             console.log(rotated);
            localStorage.setItem(type, JSON.stringify(rotated));
            return { ...prev, [type]: rotated };
        });
    };

    const renderShape = (type) => {
        const shape = shapes[type];
        if (!shape) return null;

        return (
            <Draggable
                nodeRef={refs[type]}
                position={{ x: shape.x, y: shape.y }}
                onStop={(e, data) => handleStop(type, e, data)}
            >
                <div
                    ref={refs[type]}
                    style={{
                        position: "absolute",
                        ...shapeStyles[type],
                        transform: `rotate(${shape.rotate}deg)`,
                        cursor: "grab",
                    }}
                >
                    {/* 右上角旋轉按鈕 */}
                    <div
                        onClick={() => rotateShape(type)}
                        style={{
                            position: "absolute",
                            top: -10,
                            right: -10,
                            width: 20,
                            height: 20,
                            background: "#4f8cff",
                            color: "#fff",
                            fontSize: 12,
                            display: "flex",
                            justifyContent: "center",
                            alignItems: "center",
                            borderRadius: "50%",
                            cursor: "pointer",
                            zIndex: 2,
                        }}
                    >
                        ⟳
                    </div>
                </div>
            </Draggable>
        );
    };

    return (
        <div style={{ padding: 20, minHeight: "100vh", position: "relative", background: "#f7f7f7" }}>
            {/* 上方格子 */}
            <div
                style={{
                    display: "grid",
                    gridTemplateRows: `repeat(${rows}, 30px)`,
                    gridTemplateColumns: `repeat(${cols}, 30px)`,
                    gap: 4,
                    justifyContent: "center",
                    marginBottom: 40,
                }}
            >
                {initGrid.map((row, rIdx) =>
                    row.map((_, cIdx) => (
                        <div
                            key={`${rIdx}-${cIdx}`}
                            style={{
                                border: "1px solid #ccc",
                                background: "#fff",
                            }}
                        />
                    ))
                )}
            </div>

            {/* 操作按鈕 */}
            <div style={{ textAlign: "center", marginBottom: 20 }}>
                <button onClick={() => addShape("triangle")}>新增三角形</button>
                <button onClick={() => addShape("rightTriangle")}>新增直角三角形</button>
                <button onClick={() => addShape("parallelogram")}>新增平行四邊形</button>
            </div>

            {/* 圖形渲染 */}
            {renderShape("triangle")}
            {renderShape("rightTriangle")}
            {renderShape("parallelogram")}

            {/* 固定刪除區域 */}
            <div
                style={{
                    position: "fixed",
                    bottom: 20,
                    right: 20,
                    width: deleteArea.width,
                    height: deleteArea.height,
                    background: "transparent",
                    border: "2px dashed red",
                    display: "flex",
                    justifyContent: "center",
                    alignItems: "center",
                    borderRadius: 8,
                }}
            ></div>
        </div>
    );
}

export default MinaRoom;
