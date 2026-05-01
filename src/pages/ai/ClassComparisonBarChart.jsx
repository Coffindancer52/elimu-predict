import { useEffect, useRef } from 'react';

const ClassComparisonBarChart = ({ data = [], height = 300 }) => {
  const canvasRef = useRef(null);
  const width = 600;
  
  useEffect(() => {
    if (!data.length) return;
    
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    
    canvas.width = width;
    canvas.height = height;
    
    ctx.clearRect(0, 0, width, height);
    
    const maxValue = Math.max(...data.map(d => d.meanAverage || 0), 100);
    const padding = { top: 20, right: 30, bottom: 50, left: 60 };
    const chartWidth = width - padding.left - padding.right;
    const chartHeight = height - padding.top - padding.bottom;
    const barWidth = (chartWidth / data.length) * 0.7;
    const barSpacing = (chartWidth / data.length) * 0.3;
    
    // Draw axes
    ctx.beginPath();
    ctx.strokeStyle = '#e5e7eb';
    ctx.moveTo(padding.left, padding.top);
    ctx.lineTo(padding.left, height - padding.bottom);
    ctx.lineTo(width - padding.right, height - padding.bottom);
    ctx.stroke();
    
    // Y-axis labels
    for (let i = 0; i <= 5; i++) {
      const value = (maxValue / 5) * i;
      const y = padding.top + chartHeight - (value / maxValue) * chartHeight;
      ctx.fillStyle = '#9ca3af';
      ctx.font = '10px';
      ctx.fillText(Math.round(value), 5, y + 3);
      
      ctx.beginPath();
      ctx.moveTo(padding.left - 5, y);
      ctx.lineTo(padding.left, y);
      ctx.stroke();
      
      ctx.beginPath();
      ctx.moveTo(padding.left, y);
      ctx.lineTo(width - padding.right, y);
      ctx.strokeStyle = '#f3f4f6';
      ctx.stroke();
    }
    
    // Draw bars
    data.forEach((item, i) => {
      const x = padding.left + i * (barWidth + barSpacing);
      const barHeight = (item.meanAverage / maxValue) * chartHeight;
      const y = padding.top + chartHeight - barHeight;
      
      // Bar color based on performance
      let color = '#ef4444'; // red for low
      if (item.meanAverage >= 70) color = '#22c55e';
      else if (item.meanAverage >= 50) color = '#f59e0b';
      
      ctx.fillStyle = color;
      ctx.fillRect(x, y, barWidth, barHeight);
      
      // Value on top of bar
      ctx.fillStyle = '#1f2937';
      ctx.font = '11px bold';
      ctx.fillText(`${Math.round(item.meanAverage)}%`, x + barWidth / 2 - 15, y - 5);
      
      // Class name below bar
      ctx.fillStyle = '#4b5563';
      ctx.font = '10px';
      const className = item.className?.length > 10 ? item.className.substring(0, 8) + '...' : item.className;
      ctx.fillText(className, x + barWidth / 2 - 20, height - padding.bottom + 15);
    });
    
  }, [data, height, width]);
  
  if (!data.length) {
    return <div className="text-center muted-text py-8">No class data available</div>;
  }
  
  return <canvas ref={canvasRef} className="w-full" style={{ height: `${height}px` }} />;
};

export default ClassComparisonBarChart;