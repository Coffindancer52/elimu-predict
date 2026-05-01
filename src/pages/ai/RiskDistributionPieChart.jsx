import { useEffect, useRef } from 'react';

const RiskDistributionPieChart = ({ high = 0, medium = 0, low = 0, size = 150 }) => {
  const canvasRef = useRef(null);
  const total = high + medium + low;
  
  useEffect(() => {
    if (total === 0) return;
    
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    const centerX = size / 2;
    const centerY = size / 2;
    const radius = size / 2 - 10;
    
    canvas.width = size;
    canvas.height = size;
    ctx.clearRect(0, 0, size, size);
    
    const highAngle = (high / total) * 2 * Math.PI;
    const mediumAngle = (medium / total) * 2 * Math.PI;
    const lowAngle = (low / total) * 2 * Math.PI;
    
    let startAngle = 0;
    
    // High risk slice
    ctx.beginPath();
    ctx.fillStyle = '#ef4444';
    ctx.moveTo(centerX, centerY);
    ctx.arc(centerX, centerY, radius, startAngle, startAngle + highAngle);
    ctx.fill();
    startAngle += highAngle;
    
    // Medium risk slice
    ctx.beginPath();
    ctx.fillStyle = '#f59e0b';
    ctx.moveTo(centerX, centerY);
    ctx.arc(centerX, centerY, radius, startAngle, startAngle + mediumAngle);
    ctx.fill();
    startAngle += mediumAngle;
    
    // Low risk slice
    ctx.beginPath();
    ctx.fillStyle = '#22c55e';
    ctx.moveTo(centerX, centerY);
    ctx.arc(centerX, centerY, radius, startAngle, startAngle + lowAngle);
    ctx.fill();
    
    // Draw white circle in middle for donut effect
    ctx.beginPath();
    ctx.fillStyle = '#ffffff';
    ctx.arc(centerX, centerY, radius * 0.5, 0, 2 * Math.PI);
    ctx.fill();
    
    // Center text
    ctx.fillStyle = '#1f2937';
    ctx.font = 'bold 16px';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(total, centerX, centerY);
  }, [high, medium, low, size, total]);
  
  if (total === 0) {
    return <div className="text-center muted-text py-8">No risk data available</div>;
  }
  
  return (
    <div className="flex flex-col items-center">
      <canvas ref={canvasRef} width={size} height={size} />
      <div className="flex gap-3 mt-2 text-xs">
        <div className="flex items-center gap-1"><div className="w-3 h-3 bg-danger rounded"></div><span>High ({high})</span></div>
        <div className="flex items-center gap-1"><div className="w-3 h-3 bg-warning rounded"></div><span>Medium ({medium})</span></div>
        <div className="flex items-center gap-1"><div className="w-3 h-3 bg-success rounded"></div><span>Low ({low})</span></div>
      </div>
    </div>
  );
};

export default RiskDistributionPieChart;