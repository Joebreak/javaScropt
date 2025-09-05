import React, { useState, useRef, useEffect } from 'react';

const CustomDraggable = ({ 
    children, 
    handle, 
    bounds = 'parent', 
    onStart, 
    onDrag, 
    onStop,
    disabled = false 
}) => {
    const [isDragging, setIsDragging] = useState(false);
    const [position, setPosition] = useState({ x: 600, y: '50%' });
    const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
    const [elementStart, setElementStart] = useState({ x: 0, y: 0 });
    const elementRef = useRef(null);

    useEffect(() => {
        if (!elementRef.current) return;

        const element = elementRef.current;
        const handleElement = handle ? element.querySelector(handle) : element;

        if (!handleElement) return;

        const handleMouseDown = (e) => {
            if (disabled) return;
            
            e.preventDefault();
            setIsDragging(true);
            
            const rect = element.getBoundingClientRect();
            const startX = e.clientX || e.touches?.[0]?.clientX || 0;
            const startY = e.clientY || e.touches?.[0]?.clientY || 0;
            
            setDragStart({ x: startX, y: startY });
            setElementStart({ x: rect.left, y: rect.top });
            
            onStart?.(e, { x: startX, y: startY });
        };

        const handleMouseMove = (e) => {
            if (!isDragging || disabled) return;
            
            e.preventDefault();
            const currentX = e.clientX || e.touches?.[0]?.clientX || 0;
            const currentY = e.clientY || e.touches?.[0]?.clientY || 0;
            
            const deltaX = currentX - dragStart.x;
            const deltaY = currentY - dragStart.y;
            
            let newX = elementStart.x + deltaX;
            let newY = elementStart.y + deltaY;
            
            // 邊界檢查
            if (bounds === 'parent' && element.parentElement) {
                const parentRect = element.parentElement.getBoundingClientRect();
                const elementRect = element.getBoundingClientRect();
                
                newX = Math.max(0, Math.min(newX, parentRect.width - elementRect.width));
                newY = Math.max(0, Math.min(newY, parentRect.height - elementRect.height));
            }
            
            setPosition({ x: newX, y: newY });
            onDrag?.(e, { x: newX, y: newY });
        };

        const handleMouseUp = (e) => {
            if (!isDragging || disabled) return;
            
            setIsDragging(false);
            onStop?.(e, position);
        };

        // 添加事件監聽器
        handleElement.addEventListener('mousedown', handleMouseDown);
        handleElement.addEventListener('touchstart', handleMouseDown, { passive: false });
        
        document.addEventListener('mousemove', handleMouseMove);
        document.addEventListener('touchmove', handleMouseMove, { passive: false });
        
        document.addEventListener('mouseup', handleMouseUp);
        document.addEventListener('touchend', handleMouseUp);

        return () => {
            handleElement.removeEventListener('mousedown', handleMouseDown);
            handleElement.removeEventListener('touchstart', handleMouseDown);
            
            document.removeEventListener('mousemove', handleMouseMove);
            document.removeEventListener('touchmove', handleMouseMove);
            
            document.removeEventListener('mouseup', handleMouseUp);
            document.removeEventListener('touchend', handleMouseUp);
        };
    }, [isDragging, dragStart, elementStart, position, bounds, disabled, onStart, onDrag, onStop, handle]);

    return (
        <div
            ref={elementRef}
            style={{
                position: 'fixed',
                left: position.x,
                top: position.y,
                transform: 'translate(-50%, -50%)',
                cursor: isDragging ? 'grabbing' : 'grab',
                userSelect: 'none',
                ...(isDragging && { zIndex: 1000 })
            }}
        >
            {children}
        </div>
    );
};

export default CustomDraggable;
