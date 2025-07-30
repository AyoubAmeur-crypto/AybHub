import { cn } from "../lib/utils";
import { TrendingUp, TrendingDown } from "lucide-react";

const StatCard = ({ 
  icon: Icon, 
  title, 
  value, 
  footer, 
  className,
  trend,
  trendValue,
  variant = "default" 
}) => {
  const getTrendColor = (trend) => {
    if (trend === 'up') return 'text-emerald-600 bg-emerald-50 border-emerald-200/50';
    if (trend === 'down') return 'text-red-600 bg-red-50 border-red-200/50';
    return 'text-gray-600 bg-gray-50 border-gray-200/50';
  };

  const getTrendIcon = (trend) => {
    if (trend === 'up') return TrendingUp;
    if (trend === 'down') return TrendingDown;
    return null;
  };

  const TrendIcon = getTrendIcon(trend);

  return (
    <div
      className={cn(
        // Enhanced card styling
        "relative p-5 bg-white/95 backdrop-blur-sm rounded-2xl",
        "shadow-[0_4px_20px_rgba(37,99,235,0.08)] border border-gray-100/50",
        "transition-all duration-200 group hover:shadow-[0_4px_24px_rgba(37,99,235,0.12)]",
        "h-full flex flex-col overflow-hidden",
        className
      )}
    >
      {/* Gradient Background Effect */}
      <div className="absolute inset-0 bg-gradient-to-br from-blue-50/50 via-transparent to-indigo-50/30 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

      {/* Content Container */}
      <div className="relative z-10">
        {/* Header with Icon and Trend */}
        <div className="flex items-center justify-between mb-4">
          {/* Icon Container with Enhanced Gradient */}
          {Icon && (
            <div className="flex items-center justify-center w-12 h-12 rounded-2xl bg-gradient-to-br from-blue-500 to-blue-600 shadow-lg shadow-blue-600/20 group-hover:shadow-blue-600/30 transition-shadow">
              <Icon className="w-5 h-5 text-white" strokeWidth={1.5} />
            </div>
          )}
          
          {/* Trend Indicator with Enhanced Design */}
          {trend && trendValue && (
            <div className={cn(
              "flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold border transition-colors",
              getTrendColor(trend)
            )}>
              {TrendIcon && <TrendIcon className="w-3.5 h-3.5" strokeWidth={2} />}
              <span>{trendValue}</span>
            </div>
          )}
        </div>

        {/* Value with Enhanced Typography */}
        <div className="text-2xl font-bold text-gray-900 tracking-tight mb-1.5">
          {value}
        </div>
        
        {/* Title with Improved Contrast */}
        <h3 className="text-sm font-medium text-gray-600 mb-1">
          {title}
        </h3>
        
        {/* Footer with Subtle Styling */}
        {footer && (
          <div className="text-sm text-gray-500 font-medium">
            {footer}
          </div>
        )}
      </div>
    </div>
  );
};

export default StatCard;