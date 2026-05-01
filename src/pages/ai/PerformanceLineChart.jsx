import { useEffect, useRef } from 'react';

const PerformanceLineChart = ({ data = [], height = 200, showLegend = false }) => {
  const canvasRef = useRef(null);
  const width = 500;
  
  useEffect(() => {
    if (!data.length) return;
    
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    
    canvas.width = width;
    canvas.height = height;
    
    ctx.clearRect(0, 0, width, height);
    
    const maxValue = Math.max(...data.map(d => Math.max(d.classAverage || 0, d.schoolAverage || 0, d.value || 0)), 100);
    const padding = { top: 20, right: 30, bottom: 30, left: 40 };
    const chartWidth = width - padding.left - padding.right;
    const chartHeight = height - padding.top - padding.bottom;
    
    // Draw axes
    ctx.beginPath();
    ctx.strokeStyle = '#e5e7eb';
    ctx.lineWidth = 1;
    ctx.moveTo(padding.left, padding.top);
    ctx.lineTo(padding.left, height - padding.bottom);
    ctx.lineTo(width - padding.right, height - padding.bottom);
    ctx.stroke();
    
    // Draw grid lines
    const ySteps = 5;
    for (let i = 0; i <= ySteps; i++) {
      const y = padding.top + (chartHeight / ySteps) * i;
      ctx.beginPath();
      ctx.moveTo(padding.left, y);
      ctx.lineTo(width - padding.right, y);
      ctx.strokeStyle = '#f3f4f6';
      ctx.stroke();
      
      ctx.fillStyle = '#9ca3af';
      ctx.font = '10px';
      ctx.fillText(Math.round(maxValue - (maxValue / ySteps) * i), 5, y + 3);
    }
    
    const xStep = chartWidth / (data.length - 1 || 1);
    
    // Draw class average line
    if (data.some(d => d.classAverage !== undefined)) {
      ctx.beginPath();
      ctx.strokeStyle = '#3b82f6';
      ctx.lineWidth = 2;
      data.forEach((point, i) => {
        const x = padding.left + i * xStep;
        const y = padding.top + chartHeight - (point.classAverage / maxValue) * chartHeight;
        if (i === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      });
      ctx.stroke();
      
      // Draw points
      ctx.fillStyle = '#3b82f6';
      data.forEach((point, i) => {
        const x = padding.left + i * xStep;
        const y = padding.top + chartHeight - (point.classAverage / maxValue) * chartHeight;
        ctx.beginPath();
        ctx.arc(x, y, 4, 0, 2 * Math.PI);
        ctx.fill();
      });
    }
    
    // Draw school average line
    if (data.some(d => d.schoolAverage !== undefined)) {
      ctx.beginPath();
      ctx.strokeStyle = '#10b981';
      ctx.lineWidth = 2;
      ctx.setLineDash([5, 5]);
      data.forEach((point, i) => {
        const x = padding.left + i * xStep;
        const y = padding.top + chartHeight - (point.schoolAverage / maxValue) * chartHeight;
        if (i === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      });
      ctx.stroke();
      ctx.setLineDash([]);
    }
    
    // X-axis labels
    ctx.fillStyle = '#6b7280';
    ctx.font = '10px';
    data.forEach((point, i) => {
      const x = padding.left + i * xStep - 15;
      const label = point.label || point.examType || '';
      ctx.fillText(label, x, height - 10);
    });
    
    if (showLegend) {
      ctx.fillStyle = '#3b82f6';
      ctx.fillRect(width - 90, 10, 10, 10);
      ctx.fillStyle = '#000';
      ctx.fillText('Class Average', width - 75, 20);
      
      ctx.fillStyle = '#10b981';
      ctx.fillRect(width - 90, 30, 10, 10);
      ctx.fillStyle = '#000';
      ctx.fillText('School Average', width - 75, 40);
    }
  }, [data, height, width,showLegend]);
  
  if (!data.length) {
    return <div className="text-center muted-text py-8">No data available for chart</div>;
  }
  
  return <canvas ref={canvasRef} className="w-full" style={{ height: `${height}px` }} />;
};

export default PerformanceLineChart;