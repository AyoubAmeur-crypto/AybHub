import React, { useState, useRef } from "react";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Filler,
  Legend,
} from 'chart.js';
import { Line } from 'react-chartjs-2';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Filler,
  Legend
);

const labels = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun','Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
const chartValues = [100, 160, 234.2, 180, 210, 175, 100, 160, 234.2, 180, 210, 175];

const data = {
  labels,
  datasets: [
    {
      label: 'Revenue',
      data: chartValues,
      fill: true,
      borderColor: (context) => {
        const chart = context.chart;
        const {ctx, chartArea} = chart;
        if (!chartArea) return '#2563eb';
        const gradient = ctx.createLinearGradient(0, chartArea.top, 0, chartArea.bottom);
        gradient.addColorStop(0, '#2563eb');
        gradient.addColorStop(0.5, '#3b82f6');
        gradient.addColorStop(1, '#60a5fa');
        return gradient;
      },
      backgroundColor: (context) => {
        const ctx = context.chart.ctx;
        const gradient = ctx.createLinearGradient(0, 0, 0, 400);
        gradient.addColorStop(0, 'rgba(37, 99, 235, 0.2)');
        gradient.addColorStop(0.5, 'rgba(59, 130, 246, 0.1)');
        gradient.addColorStop(1, 'rgba(96, 165, 250, 0.03)');
        return gradient;
      },
      borderWidth: 4,
      tension: 0.4,
      pointRadius: 0,
      pointHoverRadius: 0,
      pointBackgroundColor: 'transparent',
      pointBorderColor: 'transparent',
    },
  ],
};

export default function ChartCard() {
  const [hoveredData, setHoveredData] = useState(null);
  const [hoveredIndex, setHoveredIndex] = useState(null);
  const chartRef = useRef(null);
  const containerRef = useRef(null);
  const [modalPos, setModalPos] = useState({ x: 0, y: 0 });

  const getChartOptions = () => {
    return {
      responsive: true,
      maintainAspectRatio: false,
      animation: {
        duration: 0,
      },
      interaction: {
        intersect: false,
        mode: 'index',
      },
      layout: {
        padding: {
          left: 0,   // Fully edged - no left padding
          right: 0,  // Fully edged - no right padding
          top: 0,    // Fully edged - no top padding
          bottom: 0  // Fully edged - no bottom padding
        }
      },
      plugins: {
        legend: { display: false },
        tooltip: {
          enabled: false,
        },
      },
      scales: {
        x: {
          display: false,
          grid: {
            display: false,
            drawBorder: false
          },
          ticks: {
            display: false,
            padding: 0
          },
          bounds: 'data',
          offset: false,
        },
        y: { 
          display: false,
          grid: {
            display: false,
            drawBorder: false
          },
          bounds: 'data',
          min: 0,
          beginAtZero: true,
          grace: 0,
        },
      },
      elements: {
        line: { 
          tension: 0.4 
        },
      },
      clipToChartArea: false,
      onHover: (event, activeElements, chart) => {
        chart.canvas.style.cursor = activeElements.length > 0 ? 'pointer' : 'default';
        if (activeElements.length > 0) {
          const elementIndex = activeElements[0].index;
          setHoveredIndex(elementIndex);
          setHoveredData({
            month: labels[elementIndex],
            value: chartValues[elementIndex]
          });
          
          // Get container bounds for better modal positioning
          const container = containerRef.current;
          const containerRect = container ? container.getBoundingClientRect() : null;
          
          // Calculate modal position with edge detection
          let modalX = event.native ? event.native.offsetX : event.offsetX;
          let modalY = event.native ? event.native.offsetY : event.offsetY;
          
          // Adjust for edge cases
          if (containerRect) {
            const modalWidth = 140; // Approximate modal width
            const modalHeight = 80; // Approximate modal height
            
            // Prevent modal from going off the right edge
            if (modalX + modalWidth > containerRect.width - 20) {
              modalX = modalX - modalWidth - 32; // Position to the left of cursor
            } else {
              modalX = modalX + 16; // Position to the right of cursor
            }
            
            // Prevent modal from going off the top edge
            if (modalY - modalHeight < 20) {
              modalY = modalY + 32; // Position below cursor
            } else {
              modalY = modalY - 48; // Position above cursor
            }
          }
          
          setModalPos({ x: modalX, y: modalY });
        } else {
          setHoveredIndex(null);
          setHoveredData(null);
        }
      }
    };
  };

  const getGuidelinePosition = (index) => {
    if (index !== null && chartRef.current) {
      const chart = chartRef.current;
      const meta = chart.getDatasetMeta(0);
      const point = meta.data[index];
      if (point) {
        return {
          x: point.x,
          y: point.y
        };
      }
    }
    return null;
  };

  const hoverGuidelinePos = getGuidelinePosition(hoveredIndex);

  return (
    <div className="w-full h-full" ref={containerRef}>
      <div className="w-full h-full flex flex-col overflow-hidden relative">
        
        {/* Dashboard Card Header with Icon - MATCH OTHER CARDS HEIGHT */}
        <div className="flex items-center justify-between py-3 px-4 mb-2 flex-shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center shadow-lg">
              <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M4 4a2 2 0 00-2 2v4a2 2 0 002 2V6h10a2 2 0 00-2-2H4zm2 6a2 2 0 012-2h8a2 2 0 012 2v4a2 2 0 01-2 2H8a2 2 0 01-2-2v-4zm6 4a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="text-left">
              <h3 className="text-sm font-semibold text-gray-900 uppercase tracking-wide">Monthly Savings</h3>
              <p className="text-xs text-gray-500 mt-1">Track your progress</p>
            </div>
          </div>
          
          <div className="text-right">
            <p className="text-2xl font-bold text-gray-900">
              ${hoveredData ? `${hoveredData.value}K` : '234.2K'}
            </p>
            {hoveredData && (
              <p className="text-xs text-blue-600 font-medium mt-1">
                {hoveredData.month} Performance
              </p>
            )}
            {!hoveredData && (
              <p className="text-xs text-gray-500 mt-1">Current Month</p> 
            )}
          </div>
        </div>

        {/* Chart Container with Better Spacing */}
        <div 
          className="flex-1 relative"
          style={{ 
            margin: 0,
            overflow: 'visible'
          }}
        >
          {/* HOVER Guideline */}
          {hoverGuidelinePos && hoveredData && (
            <div 
              className="absolute top-0 bottom-8 w-0.5 bg-blue-600/60 z-10 transition-all duration-200 pointer-events-none"
              style={{
                left: `${hoverGuidelinePos.x}px`,
                transform: 'translateX(-50%)'
              }}
            >
              <div 
                className="absolute w-2 h-2 bg-blue-600 rounded-full border-2 border-white shadow-md"
                style={{
                  top: `${hoverGuidelinePos.y}px`,
                  left: '-3px',
                  transform: 'translateY(-50%)'
                }}
              />
            </div>
          )}

          {/* Modal on Hover - Improved Positioning */}
          {hoveredData && (
            <div
              className="absolute z-30 bg-white border border-blue-100 rounded-lg shadow-lg px-4 py-2 text-sm font-semibold text-blue-900 pointer-events-none"
              style={{
                left: `${modalPos.x}px`,
                top: `${modalPos.y}px`,
                minWidth: '90px',
                maxWidth: '140px',
                whiteSpace: 'nowrap',
                transition: 'left 0.1s, top 0.1s'
              }}
            >
              <div>{hoveredData.month}</div>
              <div className="text-blue-600 text-lg font-bold">${hoveredData.value}K</div>
              <div className="text-xs text-gray-400 font-normal">Revenue</div>
            </div>
          )}

          {/* Chart with Padding */}
          <div className="absolute inset-0" style={{ overflow: 'hidden' }}>
            <Line 
              ref={chartRef} 
              data={data} 
              options={getChartOptions()}
              style={{ 
                width: '100%', 
                height: '100%',
                display: 'block'
              }}
            />
          </div>

          {/* Month Labels at Bottom - Fully Edged */}
          <div className="absolute bottom-2 left-2 right-2 flex justify-between z-20">
            {labels.map((month, index) => (
              <div
                key={month}
                className={`text-xs font-medium transition-all duration-200 px-1 py-0.5 rounded text-center ${
                  hoveredIndex === index
                    ? 'bg-blue-600 text-white shadow-md'
                    : 'text-gray-500'
                }`}
                style={{ fontSize: '10px', minWidth: '20px' }}
              >
                {month}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}