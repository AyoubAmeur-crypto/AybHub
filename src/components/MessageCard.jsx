import { cn } from "../lib/utils";
import { MessageSquare, Clock, Send } from "lucide-react";

const MessagesCard = ({ 
  icon: Icon, 
  title, 
  className,
  variant = "default",
  onSeeAll,
  maxItems
}) => {
  const messages = [
    { 
      sender: "Sarah Wilson", 
      message: "The new design mockups are ready for review. Can we schedule a meeting?", 
      time: "2 min ago", 
      avatar: "SW",
      unread: true
    },
    { 
      sender: "Mike Johnson", 
      message: "Project deadline moved to next Friday. Please update your tasks.", 
      time: "15 min ago", 
      avatar: "MJ",
      unread: true
    },
    { 
      sender: "Team Lead", 
      message: "Great work on the sprint! Let's discuss the next phase tomorrow.", 
      time: "1 hr ago", 
      avatar: "TL",
      unread: false
    },
    { 
      sender: "Client", 
      message: "Thanks for the quick turnaround. Looking forward to deliverables.", 
      time: "3 hr ago", 
      avatar: "CL",
      unread: false
    },
    { 
      sender: "Alex Davis", 
      message: "Could you please review the latest wireframes? Need your feedback by EOD.", 
      time: "5 hr ago", 
      avatar: "AD",
      unread: false
    }
  ];

  const itemsToShow = variant === 'all' ? messages.length : 3;
  const showSeeAll = messages.length > itemsToShow && variant !== 'all';

  return (
    <div className={cn(
      "relative p-3 bg-white/95 backdrop-blur-sm rounded-2xl",
      "shadow-[0_4px_20px_rgba(0,0,0,0.08)] border border-gray-100/50",
      "h-full flex flex-col overflow-hidden",
      className
    )}>
      {/* Header */}
      <div className="flex items-center justify-between mb-3 flex-shrink-0">
        <div className="flex items-center gap-2">
          {Icon && (
            <div className="flex items-center justify-center w-8 h-8 rounded-xl bg-gradient-to-br from-blue-500 to-blue-600">
              <Icon className="w-4 h-4 text-white" />
            </div>
          )}
          <div>
            <h3 className="text-sm font-semibold text-gray-700">{title}</h3>
            <p className="text-xs text-gray-500">
              {messages.filter(m => m.unread).length} unread messages
            </p>
          </div>
        </div>
        <div className="w-2 h-2 bg-red-500 rounded-full"></div>
      </div>

      {/* Messages List - No Scrollbar */}
      <div className="flex-1 space-y-2 overflow-hidden relative">
        {messages.slice(0, itemsToShow).map((msg, index) => (
          <div key={index} className={cn(
            "p-2 rounded-lg transition-colors cursor-pointer",
            msg.unread ? "bg-blue-50/50 border border-blue-100/50" : "bg-gray-50/50 hover:bg-gray-100/50"
          )}>
            <div className="flex items-start gap-3">
              <div className={cn(
                "w-7 h-7 rounded-full flex items-center justify-center text-xs font-semibold text-white flex-shrink-0",
                msg.unread ? "bg-blue-500" : "bg-gray-400"
              )}>
                {msg.avatar}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between mb-1">
                  <p className={cn(
                    "text-sm truncate",
                    msg.unread ? "font-semibold text-gray-800" : "font-medium text-gray-600"
                  )}>
                    {msg.sender}
                  </p>
                  <span className="text-xs text-gray-500 flex items-center gap-1 ml-2">
                    <Clock className="w-3 h-3" />
                    {msg.time}
                  </span>
                </div>
                <p className={cn(
                  "text-xs leading-relaxed line-clamp-2",
                  msg.unread ? "text-gray-700" : "text-gray-500"
                )}>
                  {msg.message}
                </p>
              </div>
            </div>
          </div>
        ))}
        
        {/* Blue Background Effect with Subtle Blur */}
        {showSeeAll && (
          <div className="absolute bottom-0 left-0 right-0 h-12 bg-gradient-to-t from-blue-50/70 via-blue-25/40 to-transparent backdrop-blur-[2px] pointer-events-none" />
        )}
      </div>

      {/* Send Message Button with Blue Background Effect */}
      {showSeeAll && (
        <div className="relative mt-2 flex justify-center">
          {/* Blue Background Layer */}
          <div className="absolute inset-0 bg-gradient-to-r from-blue-50/30 via-blue-100/20 to-blue-50/30 rounded-lg backdrop-blur-[1px]" />
          
          {/* Button */}
          <button 
            className="relative z-10 text-sm text-blue-600 hover:text-blue-700 font-medium px-4 py-2 bg-white/80 hover:bg-white/90 rounded-lg border border-blue-100/50 hover:border-blue-200/70 transition-all duration-200 flex items-center gap-2 shadow-sm hover:shadow-md" 
            onClick={onSeeAll}
          >
            <Send className="w-3 h-3" />
            Send Message
          </button>
        </div>
      )}
    </div>
  );
};

export default MessagesCard;