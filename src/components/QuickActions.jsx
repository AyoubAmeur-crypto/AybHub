import React from 'react'
import { 
  Plus, 
  MessageSquare, 
  Calendar, 
  FileText, 
  Users, 
  Settings,
  Search,
  Filter,
  MoreHorizontal,
  Zap
} from 'lucide-react'

function QuickActions() {
  const quickActions = [
    {
      icon: Plus,
      label: "New Project",
      isPrimary: true
    },
    {
      icon: MessageSquare,
      label: "Messages",
      isPrimary: false
    },
    {
      icon: Calendar,
      label: "Schedule",
      isPrimary: false
    },
    {
      icon: FileText,
      label: "Invoice",
      isPrimary: false
    },
    {
      icon: Users,
      label: "Team",
      isPrimary: false
    },
    {
      icon: Settings,
      label: "Settings",
      isPrimary: false
    }
  ]

  return (
    <div className='bg-white/95 backdrop-blur-sm shadow-[0_4px_20px_rgba(0,0,0,0.08)] rounded-2xl border border-gray-100/50 overflow-hidden'>
      {/* Premium Header */}
      <div className="flex items-center justify-between px-5 py-3 bg-gradient-to-r from-slate-50 to-blue-50/30 border-b border-gray-100/50">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-xl flex items-center justify-center shadow-lg shadow-blue-600/25">
            <Zap className="w-4 h-4 text-white" strokeWidth={1.5} />
          </div>
          <div>
            <h2 className="text-sm font-semibold text-slate-800 tracking-wide">Quick Actions</h2>
            <p className="text-xs text-slate-500">Boost your productivity</p>
          </div>
        </div>
        
        <div className="flex items-center gap-1">
          <button className="p-2 hover:bg-white/60 rounded-xl transition-all duration-200 group">
            <Search className="w-4 h-4 text-slate-400 group-hover:text-slate-600" strokeWidth={1.5} />
          </button>
          <button className="p-2 hover:bg-white/60 rounded-xl transition-all duration-200 group">
            <MoreHorizontal className="w-4 h-4 text-slate-400 group-hover:text-slate-600" strokeWidth={1.5} />
          </button>
        </div>
      </div>

      {/* Premium Actions Grid */}
      <div className="p-4">
        <div className="grid grid-cols-6 gap-3">
          {quickActions.map((action, index) => (
            <button
              key={index}
              className={`group relative flex flex-col items-center justify-center p-3 rounded-2xl transition-all duration-300 ease-out
                ${action.isPrimary 
                  ? 'bg-gradient-to-br from-blue-50 to-indigo-50 hover:from-blue-100 hover:to-indigo-100 border-2 border-blue-200/50 hover:border-blue-300/60' 
                  : 'bg-slate-50 hover:bg-slate-100 border border-slate-200/50 hover:border-slate-300/60'
                } hover:scale-105 hover:shadow-lg hover:shadow-blue-600/10`}
            >
              {/* Premium Icon Container */}
              <div className={`relative w-10 h-10 rounded-xl flex items-center justify-center mb-2.5 transition-all duration-300 group-hover:scale-110
                ${action.isPrimary 
                  ? 'bg-gradient-to-r from-blue-600 to-indigo-600 shadow-lg shadow-blue-600/25 group-hover:shadow-blue-600/40' 
                  : 'bg-slate-100 group-hover:bg-slate-200 border border-slate-200/50'
                }`}>
                <action.icon 
                  className={`w-5 h-5 transition-all duration-300 ${action.isPrimary ? 'text-white' : 'text-slate-600 group-hover:text-slate-700'}`} 
                  strokeWidth={1.5} 
                />
                
                {/* Subtle glow effect for primary */}
                {action.isPrimary && (
                  <div className="absolute inset-0 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-xl opacity-0 group-hover:opacity-20 transition-opacity duration-300"></div>
                )}
              </div>
              
              {/* Premium Label */}
              <span className={`text-xs font-medium transition-all duration-300 text-center leading-tight
                ${action.isPrimary 
                  ? 'text-blue-700 group-hover:text-blue-800' 
                  : 'text-slate-600 group-hover:text-slate-700'
                }`}>
                {action.label}
              </span>

              {/* Hover shimmer effect */}
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 rounded-2xl"></div>
            </button>
          ))}
        </div>

        {/* Premium Footer */}
        
      </div>
    </div>
  )
}

export default QuickActions