import React, { useState, useRef } from "react";
import Draggable from "react-draggable";

const shapeStyles = {
  triangle: {
    width: 60,
    height: 60,
    background: "red",
    clipPath: "polygon(50% 0%, 0% 100%, 100% 100%)",
    border: "3px solid black",
  },
};

function TestRoom() {
  const [shape, setShape] = useState({ x: 0, y: 0, rotate: 0 });
  const nodeRef = useRef(null);

  const handleStop = (e, data) => {
    setShape((prev) => ({ ...prev, x: data.x, y: data.y }));
  };

  const rotateShape = () => {
    setShape((prev) => ({ ...prev, rotate: (prev.rotate + 90) % 360 }));
  };

  return (
    <div style={{ width: "100vw", height: "100vh", background: "#eee" }}>
      <button onClick={rotateShape} style={{ margin: 20 }}>
        旋轉 90°
      </button>

      <Draggable
        nodeRef={nodeRef}
        onStop={handleStop}
        defaultPosition={{ x: 0, y: 0 }} // ✅ 用 default，不要用 position
      >
        <div
          ref={nodeRef}
          style={{
            position: "absolute",
            ...shapeStyles.triangle,
            transform: `rotate(${shape.rotate}deg)`, // ✅ rotate 生效
            cursor: "grab",
          }}
        >
          測
        </div>
      </Draggable>
    </div>
  );
}

export default TestRoom;
