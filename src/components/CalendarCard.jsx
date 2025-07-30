import { cn } from "../lib/utils";
import { Calendar, Clock, Users, MapPin } from "lucide-react";

const CalendarCard = ({ 
  icon: Icon, 
  title, 
  className,
  variant = "default",
  onSeeAll,
  maxItems
}) => {
  const todayEvents = [
    { time: "9:00 AM", title: "Team Standup", attendees: 8, location: "Conference Room A", color: "bg-blue-500" },
    { time: "11:30 AM", title: "Client Meeting", attendees: 3, location: "Zoom Call", color: "bg-green-500" },
    { time: "2:00 PM", title: "Project Review", attendees: 5, location: "Conference Room B", color: "bg-purple-500" },
    { time: "4:30 PM", title: "Sprint Planning", attendees: 12, location: "Main Hall", color: "bg-orange-500" },
    { time: "6:00 PM", title: "Team Dinner", attendees: 15, location: "Restaurant", color: "bg-pink-500" }
  ];
  const itemsToShow = typeof maxItems === 'number' ? maxItems : (variant === 'all' ? todayEvents.length : 2);
  const showSeeAll = todayEvents.length > itemsToShow && variant !== 'all';

  return (
    <div
      className={cn(
        "relative p-2 bg-white/95 backdrop-blur-sm rounded-2xl",
        "shadow-[0_4px_20px_rgba(0,0,0,0.08)] border border-gray-100/50",
        "transition-all duration-200",
        "h-full flex flex-col overflow-hidden",
        className
      )}
    >
      {/* Header - Compact size */}
      <div className="flex items-center gap-2 mb-2 flex-shrink-0">
        {Icon && (
          <div className="flex items-center justify-center w-7 h-7 rounded-xl bg-gradient-to-br from-blue-500 to-blue-600 shadow-lg shadow-blue-600/25">
            <Icon className="w-3.5 h-3.5 text-white" strokeWidth={1.5} />
          </div>
        )}
        <div>
          <h3 className="text-xs font-semibold text-gray-700">{title}</h3>
          <p className="text-[10px] text-gray-500">{todayEvents.length} meetings scheduled</p>
        </div>
      </div>

      {/* Events List - Compact spacing */}
      <div className="flex-1 space-y-1 overflow-y-auto">
        {todayEvents.slice(0, itemsToShow).map((event, index) => (
          <div key={index} className="flex items-start gap-2 p-2 bg-gray-50/50 rounded-xl hover:bg-gray-100/50 transition-colors">
            <div className={cn("w-2.5 h-2.5 rounded-full flex-shrink-0 mt-1", event.color)}></div>
            <div className="flex-1 min-w-0">
              <div className="flex items-start justify-between mb-0.5">
                <div>
                  <p className="text-xs font-semibold text-gray-700 mb-0.5">{event.title}</p>
                  <div className="flex items-center gap-1 text-[10px] text-gray-500">
                    <span className="flex items-center gap-1">
                      <MapPin className="w-2 h-2" />
                      {event.location}
                    </span>
                    <span className="flex items-center gap-1">
                      <Users className="w-2 h-2" />
                      {event.attendees}
                    </span>
                  </div>
                </div>
                <div className="text-right">
                  <span className="text-[10px] font-medium text-gray-700 flex items-center gap-1">
                    <Clock className="w-2 h-2" />
                    {event.time}
                  </span>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
      {showSeeAll && (
        <div className="mt-1 flex justify-center">
          <button className="text-xs text-blue-600 hover:underline" onClick={onSeeAll}>See all</button>
        </div>
      )}
    </div>
  );
};

export default CalendarCard;