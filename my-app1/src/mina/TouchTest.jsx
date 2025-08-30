import React, { useState } from 'react';
import './MinaRoom.css';

const TouchTest = () => {
    const [rotation, setRotation] = useState(0);
    const [touchCount, setTouchCount] = useState(0);

    const handleRotate = () => {
        setRotation((prev) => (prev + 90) % 360);
        setTouchCount((prev) => prev + 1);
    };

    const handleTouchStart = (e) => {
        // 不阻止預設行為，避免 passive event listener 錯誤
        console.log('Touch start detected');
    };

    const handleTouchEnd = (e) => {
        // 不阻止預設行為，避免 passive event listener 錯誤
        console.log('Touch end detected');
        handleRotate();
    };

    return (
        <div style={{ 
            padding: '20px', 
            textAlign: 'center',
            minHeight: '100vh',
            background: '#f0f0f0'
        }}>
            <h2>觸控測試頁面</h2>
            <p>觸控次數: {touchCount}</p>
            <p>旋轉角度: {rotation}°</p>
            
            <div style={{ margin: '40px 0' }}>
                <div
                    style={{
                        width: '100px',
                        height: '100px',
                        background: 'linear-gradient(45deg, #ff6b6b, #4ecdc4)',
                        borderRadius: '10px',
                        transform: `rotate(${rotation}deg)`,
                        margin: '0 auto',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: 'white',
                        fontSize: '18px',
                        fontWeight: 'bold',
                        boxShadow: '0 4px 8px rgba(0,0,0,0.2)',
                        transition: 'transform 0.3s ease'
                    }}
                >
                    測試
                </div>
            </div>

            <div style={{ margin: '20px 0' }}>
                <button
                    onClick={handleRotate}
                    onTouchStart={handleTouchStart}
                    onTouchEnd={handleTouchEnd}
                    style={{
                        padding: '15px 30px',
                        fontSize: '18px',
                        background: '#4f8cff',
                        color: 'white',
                        border: 'none',
                        borderRadius: '25px',
                        cursor: 'pointer',
                        minWidth: '120px',
                        minHeight: '50px'
                    }}
                >
                    點擊或觸控旋轉
                </button>
            </div>

            <div style={{ margin: '20px 0' }}>
                <div
                    className="rotate-btn"
                    onClick={handleRotate}
                    onTouchStart={handleTouchStart}
                    onTouchEnd={handleTouchEnd}
                    style={{
                        width: '60px',
                        height: '60px',
                        fontSize: '24px',
                        margin: '0 auto'
                    }}
                >
                    ⟳
                </div>
            </div>

            <div style={{ margin: '40px 0', textAlign: 'left' }}>
                <h3>測試說明：</h3>
                <ul>
                    <li>點擊或觸控按鈕來旋轉方塊</li>
                    <li>觀察觸控次數和旋轉角度</li>
                    <li>在手機上測試觸控功能</li>
                    <li>檢查控制台是否有觸控事件日誌</li>
                </ul>
            </div>
        </div>
    );
};

export default TouchTest;
