import React, { useEffect, useRef } from 'react';
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js';

ChartJS.register(ArcElement, Tooltip, Legend);

const InvoicesCard = () => {
  const chartRef = useRef(null);
  const chartInstance = useRef(null);

  useEffect(() => {
    if (chartRef.current) {
      const ctx = chartRef.current.getContext('2d');
      if (chartInstance.current) {
        chartInstance.current.destroy();
      }
      chartInstance.current = new ChartJS(ctx, {
        type: 'doughnut',
        data: {
          datasets: [{
            data: [100, 0],
            backgroundColor: [
              '#ffffff', // White for completed portion
              'rgba(255, 255, 255, 0.2)' // Semi-transparent white for remaining
            ],
            borderWidth: 0,
            cutout: '70%',
          }]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            legend: { display: false },
            tooltip: { enabled: false }
          },
          elements: {
            arc: { borderWidth: 0 }
          }
        },
        plugins: [{
          beforeDraw: (chart) => {
            const { ctx, chartArea } = chart;
            if (!chartArea) return;
            
            // Create special gradient for the chart
            const gradient = ctx.createConicGradient(
              0, // start angle
              chartArea.left + chartArea.width / 2, // center x
              chartArea.top + chartArea.height / 2   // center y
            );
            gradient.addColorStop(0, '#ec4899'); // pink-500
            gradient.addColorStop(0.5, '#3b82f6'); // blue-500
            gradient.addColorStop(1, '#8b5cf6'); // purple-500
            
            chart.data.datasets[0].backgroundColor[0] = gradient;
          }
        }]
      });
    }
    return () => {
      if (chartInstance.current) {
        chartInstance.current.destroy();
      }
    };
  }, []);

  return (
    <div className="relative z-10 mt-4 w-full px-8 py-10" style={{ height: '160px', minHeight: '120px' }}>
      <div className="w-full relative h-full flex items-center justify-center">
        {/* Silhouette 1 (top, smallest width, lowest opacity) */}
        <div
          className="absolute left-0 right-0 mx-auto h-24 rounded-3xl bg-gray-400"
          style={{
            top: '-60px',
            width: '60%',
            opacity: 0.2
          }}
        ></div>
        {/* Silhouette 2 (middle, medium width, medium opacity) */}
        <div
          className="absolute left-0 right-0 mx-auto h-24 rounded-3xl bg-gray-400"
          style={{
            top: '-40px',
            width: '75%',
            opacity: 0.4
          }}
        ></div>
        {/* Silhouette 3 (bottom, close to card, smaller than card width, highest opacity) */}
        <div
          className="absolute left-0 right-0 mx-auto h-24 rounded-3xl bg-gray-400"
          style={{
            top: '-20px',
            width: '90%',
            opacity: 0.6
          }}
        ></div>

        <div
          className="relative w-full h-28 rounded-3xl flex items-center justify-between px-8 py-8 overflow-hidden group cursor-pointer bg-blue-950/95"
          style={{
            boxShadow: `
              0 24px 48px -12px rgba(30, 58, 138, 0.25),
              0 12px 24px -6px rgba(30, 58, 138, 0.18)
            `
          }}
        >
          <div
            className="absolute inset-0 rounded-3xl opacity-10 group-hover:opacity-20 transition-opacity duration-300"
            style={{
              background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.1) 0%, transparent 100%)'
            }}
          ></div>

          <div className="absolute top-4 right-8 w-10 h-10 bg-white/5 rounded-full opacity-60 pointer-events-none"></div>

          <div className="flex flex-col justify-center text-white z-20 relative">
            <h3 className="text-lg font-semibold mb-2 tracking-wide text-white">
              Tasks for today
            </h3>
            <p className="text-base font-medium tracking-wide text-white/80">
              Completed
            </p>
          </div>
          
          <div className="relative w-20 h-20 flex items-center justify-center z-20">
            <canvas 
              ref={chartRef} 
              className="w-full h-full relative z-30"
            />
            <div className="absolute inset-0 flex items-center justify-center z-40">
              <span className="text-white text-lg font-bold tracking-wide">
                100%
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default InvoicesCard;