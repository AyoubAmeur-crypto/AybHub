import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import { Line } from 'react-chartjs-2';
import { Chart, LineController, LineElement, PointElement, LinearScale, Title, CategoryScale } from 'chart.js';
Chart.register(LineController, LineElement, PointElement, LinearScale, Title, CategoryScale);

export default function StatCardPremium({
  value = "$961",
  label = "Total Order",
  icon,
  chartData,
  chartOptions,
  activePeriod = "Year",
  onPeriodChange,
  periods = ["Month", "Year"],
  trend = "down"
}) {
  return (
    <Card
      sx={{
        background: 'linear-gradient(135deg, #2196f3 0%, #1565c0 100%)',
        color: '#fff',
        borderRadius: 3,
        boxShadow: '0 8px 32px 0 rgb(32 40 45 / 22%)',
        minHeight: 160,
        position: 'relative',
        overflow: 'hidden'
      }}
    >
      <CardContent sx={{ p: 2, pb: 1 }}>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="bg-blue-700/80 rounded-lg p-2 flex items-center justify-center">
              {icon}
            </div>
            <div>
              <div className="text-3xl font-bold tracking-tight flex items-center gap-2">
                <span
                  style={{
                    background: 'linear-gradient(90deg,#fff,#b3e0ff)',
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent'
                  }}
                >
                  {value}
                </span>
                {trend === "down" && (
                  <span className="bg-blue-300/60 text-blue-900 rounded-full px-2 py-0.5 text-xs font-semibold ml-1 flex items-center">
                    <svg width="16" height="16" fill="none"><path d="M8 12V4M8 4l-4 4M8 4l4 4" stroke="#1976d2" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
                  </span>
                )}
                {trend === "up" && (
                  <span className="bg-green-300/60 text-green-900 rounded-full px-2 py-0.5 text-xs font-semibold ml-1 flex items-center">
                    <svg width="16" height="16" fill="none"><path d="M8 4v8M8 12l4-4M8 12l-4-4" stroke="#388e3c" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
                  </span>
                )}
              </div>
              <div className="text-blue-100 text-sm font-medium">{label}</div>
            </div>
          </div>
          <div className="flex gap-2">
            {periods.map(period => (
              <button
                key={period}
                onClick={() => onPeriodChange?.(period)}
                className={`px-3 py-1 rounded-lg text-xs font-semibold transition ${
                  activePeriod === period
                    ? 'bg-blue-100 text-blue-700'
                    : 'bg-blue-700/30 text-blue-100'
                }`}
              >
                {period}
              </button>
            ))}
          </div>
        </div>
        <div className="mt-2 mb-1">
          <Line
            data={chartData}
            options={{
              ...chartOptions,
              plugins: { legend: { display: false } },
              scales: { x: { display: false }, y: { display: false } }
            }}
            height={50}
          />
        </div>
      </CardContent>
    </Card>
  );
}