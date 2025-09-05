import React, { useRef } from "react";
import "./FloatingShapePanel.css";

const FloatingShapePanel = ({ shapeStyles, onAddShape, isVisible, onToggle }) => {
    const dragRef = useRef(null);
    const handleClose = (e) => {
        e.stopPropagation();
        onToggle();
    };

    if (!isVisible) return null;

    return (
        <div
            ref={dragRef}
            className="floating-panel"
        >
                {/* 面板標題欄 */}
                <div className="floating-panel-header">
                    <span className="panel-title">圖形按鈕</span>
                    <div className="panel-controls">
                        <button
                            className="control-btn close-btn"
                            onClick={handleClose}
                            title="關閉"
                        >
                            ×
                        </button>
                    </div>
                </div>

                {/* 面板內容 */}
                <div className="floating-panel-content">
                        {/* 第一排：圖形按鈕 */}
                        <div className="shape-buttons-row">
                            {Object.keys(shapeStyles).slice(0, 5).map((type) => (
                                <button
                                    key={type}
                                    className="floating-shape-button"
                                    onClick={() => onAddShape(type)}
                                    title={`添加 ${type}`}
                                >
                                    <div
                                        className="shape-preview"
                                        style={{
                                            ...shapeStyles[type],
                                            transform: "scale(0.4)",
                                            position: "static",
                                            cursor: "default",
                                            background: shapeStyles[type].useLayered 
                                                ? shapeStyles[type].innerLayer.background 
                                                : shapeStyles[type].background,
                                            border: "1px solid black"
                                        }}
                                    />
                                </button>
                            ))}
                        </div>

                        {/* 第二排：剩餘的形狀按鈕 */}
                        {Object.keys(shapeStyles).length > 5 && (
                            <div className="shape-buttons-row">
                                {Object.keys(shapeStyles).slice(5).map((type) => (
                                    <button
                                        key={type}
                                        className="floating-shape-button"
                                        onClick={() => onAddShape(type)}
                                        title={`添加 ${type}`}
                                    >
                                        <div
                                            className="shape-preview"
                                            style={{
                                                ...shapeStyles[type],
                                                transform: "scale(0.4)",
                                                position: "static",
                                                cursor: "default",
                                                background: shapeStyles[type].useLayered 
                                                    ? shapeStyles[type].innerLayer.background 
                                                    : shapeStyles[type].background,
                                                border: "1px solid black"
                                            }}
                                        />
                                    </button>
                                ))}
                            </div>
                        )}
                </div>
        </div>
    );
};

export default FloatingShapePanel;
