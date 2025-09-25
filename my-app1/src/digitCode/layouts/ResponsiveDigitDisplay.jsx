import React from 'react';
import DesktopLayout from './DesktopLayout';
import MobileLayout from './MobileLayout';

// 響應式數位顯示組件
export default function ResponsiveDigitDisplay(props) {
  const isMobile = window.innerWidth <= 768;

  if (isMobile) {
    return <MobileLayout {...props} />;
  } else {
    return <DesktopLayout {...props} />;
  }
}
