import { useEffect, useRef } from 'react';

const RiskGauge = ({ value = 0, size = 'medium', showLabel = true }) => {
  const canvasRef = useRef(null);
  
  const dimensions = { small: 80, medium: 120, large: 160 };
  const dim = dimensions[size] || dimensions.medium;
  const radius = dim / 2 - 10;
  
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    const centerX = dim / 2;
    const centerY = dim / 2;
    const startAngle = -Math.PI / 2;
    const endAngle = Math.PI / 2;
    
    // Clear canvas
    ctx.clearRect(0, 0, dim, dim);
    
    // Background arc (grey)
    ctx.beginPath();
    ctx.arc(centerX, centerY, radius, startAngle, endAngle);
    ctx.strokeStyle = '#e5e7eb';
    ctx.lineWidth = 12;
    ctx.stroke();
    
    // Value arc (colored based on risk)
    const valueAngle = startAngle + (Math.PI * (value / 100));
    ctx.beginPath();
    ctx.arc(centerX, centerY, radius, startAngle, valueAngle);
    
    let color = '#22c55e'; // success
    if (value > 70) color = '#ef4444'; // danger
    else if (value > 40) color = '#f59e0b'; // warning
    
    ctx.strokeStyle = color;
    ctx.lineWidth = 12;
    ctx.stroke();
    
    // Center text
    ctx.font = `${size === 'small' ? '14px' : size === 'large' ? '24px' : '18px'} bold`;
    ctx.fillStyle = '#1f2937';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(`${Math.round(value)}%`, centerX, centerY);
    
    if (showLabel) {
      ctx.font = '10px';
      ctx.fillStyle = '#6b7280';
      ctx.fillText('Risk Score', centerX, centerY + 25);
    }
  }, [value, dim, size, showLabel,radius]);
  
  return <canvas ref={canvasRef} width={dim} height={dim} className="mx-auto" />;
};

export default RiskGauge;