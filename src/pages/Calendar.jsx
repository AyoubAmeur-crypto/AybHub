import React, { useEffect, useState } from "react";
import axios from "axios";
import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import timeGridPlugin from "@fullcalendar/timegrid";
import interactionPlugin from "@fullcalendar/interaction";
import '../App.css'
import Loading from "../components/Loading";

function getStatusColor(status) {
  const statusColors = {
    'pending': '#f59e0b',
    'in-progress': '#2563eb',
    'completed': '#2563eb',
    'overdue': '#ef4444',
    'review': '#8b5cf6',
    'cancelled': '#6b7280',
  };
  if (statusColors[status?.toLowerCase()]) {
    return statusColors[status.toLowerCase()];
  }
  let hash = 0;
  for (let i = 0; i < status.length; i++) {
    hash = status.charCodeAt(i) + ((hash << 5) - hash);
  }
  const hue = Math.abs(hash) % 360;
  const safeHue = (hue > 90 && hue < 150) ? 220 : hue;
  return `hsl(${safeHue}, 65%, 50%)`;
}

const Calendar = () => {
  const [events, setEvents] = useState([]);
  const [modalInfo, setModalInfo] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchProjectTask = async () => {
      try {
        setIsLoading(true);
        const res = await axios.get("http://localhost:3000/calendar/api/project-task", {
          withCredentials: true
        });
        
        const projects = res.data.projects;
        console.log("Projects fetched from server:", projects);
        
        const allEvents = projects.flatMap(project => {
          if (project.tasks && project.tasks.length > 0) {
            return project.tasks.map(task => ({
              title: `${project.name} - ${task.name}`,
              start: task.createdAt,
              end: task.due || task.createdAt,
              backgroundColor: getStatusColor(task.status),
              borderColor: getStatusColor(task.status),
              textColor: '#ffffff',
              extendedProps: {
                projectName: project.name,
                taskName: task.name,
                status: task.status,
                type: 'task'
              },
            }));
          } else {
            return [{
              title: project.name,
              start: project.createdAt,
              end: project.dueDate || project.createdAt,
              backgroundColor: '#6366f1',
              borderColor: '#6366f1',
              textColor: '#ffffff',
              extendedProps: {
                projectName: project.name,
                status: project.status,
                type: 'project'
              },
            }];
          }
        });

        setEvents(allEvents);
      } catch (error) {
        console.error("Error fetching projects and tasks:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchProjectTask();
  }, []);

  const formatDate = (date) => {
    if (!date) return 'N/A';
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  return (
    <div className="relative mt-0.5   transition-all duration-300 " style={{height: '560px', overflow: 'hidden'}}>
      <style>{`
        /* FullCalendar top nav button custom styles */
        .fc .fc-button-primary {
          background: #2563eb !important;
          color: #fff !important;
          border: none !important;
          border-radius: 8px !important;
          font-weight: 600 !important;
          box-shadow: 0 2px 8px rgba(37,99,235,0.15) !important;
          transition: background 0.2s, box-shadow 0.2s;
        }
        .fc .fc-button-primary:hover, .fc .fc-button-primary:focus {
          background: #1e40af !important;
          color: #fff !important;
          box-shadow: 0 4px 16px rgba(37,99,235,0.25) !important;
        }
        .fc-toolbar-title {
          font-size: 1.75rem !important;
          font-weight: 400 !important;
          color: #1e293b !important;
          text-shadow: none !important;
          letter-spacing: -0.025em !important;
          text-align: center !important;
          width: 100%;
          font-family: inherit !important;
        }
        /* Custom scrollbar styles */
        ::-webkit-scrollbar {
          width: 6px;
          background: transparent;
        }
        ::-webkit-scrollbar-thumb {
          background: linear-gradient(135deg, #2563eb 0%, #1e40af 100%);
          border-radius: 6px;
        }
        ::-webkit-scrollbar-track {
          background: transparent;
        }
        .fc {
          font-family: 'SF Pro Display', 'Inter', 'Segoe UI', system-ui, -apple-system, sans-serif;
          --fc-border-color: #e2e8f0;
          --fc-button-text-color: #ffffff;
          --fc-button-bg-color: #4f46e5;
          --fc-button-border-color: #4f46e5;
          --fc-button-hover-bg-color: #4338ca;
          --fc-button-hover-border-color: #4338ca;
          --fc-button-active-bg-color: #3730a3;
          --fc-button-active-border-color: #3730a3;
          width: 100% !important;
          max-width: 100vw !important;
          box-sizing: border-box !important;
          padding-right: 0 !important;
        }
        
        .fc-scrollgrid {
          border-radius: 16px !important;
          border: 1px solid rgba(226, 232, 240, 0.8) !important;
          overflow: hidden !important;
          background: transparent !important;
          backdrop-filter: none !important;
          width: 100% !important;
          margin-right: 0 !important;
          padding-right: 0 !important;
        }
        
        .fc-theme-standard .fc-scrollgrid {
          border: 1px solid rgba(226, 232, 240, 0.6) !important;
        }
        
        .fc-daygrid-day-frame, .fc-timegrid-slot {
          min-height: 52px !important;
          border: 1px solid rgba(226, 232, 240, 0.4) !important;
          transition: background-color 0.2s ease !important;
          padding-left: 0 !important;
          padding-right: 0 !important;
        }
        
        .fc-daygrid-day {
          background: rgba(255, 255, 255, 0.9) !important;
          border: 1px solid rgba(226, 232, 240, 0.4) !important;
          transition: all 0.2s ease !important;
          width: auto !important;
        }
        
        .fc-daygrid-day:hover {
          background: rgba(248, 250, 252, 0.95) !important;
        }
        
        .fc-col-header-cell {
          background: linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%) !important;
          font-weight: 700 !important;
          color: #475569 !important;
          border: none !important;
          font-size: 0.9rem !important;
          letter-spacing: 0.025em !important;
          padding: 16px 8px !important;
          text-transform: uppercase !important;
          border-bottom: 2px solid rgba(79, 70, 229, 0.1) !important;
        }
        
        .fc-timegrid-slot {
          background: rgba(255, 255, 255, 0.95) !important;
          border: 1px solid rgba(226, 232, 240, 0.3) !important;
        }
        
        .fc-day-today {
          background: linear-gradient(135deg, rgba(79, 70, 229, 0.06) 0%, rgba(99, 102, 241, 0.04) 100%) !important;
          border: 1px solid rgba(79, 70, 229, 0.15) !important;
          position: relative !important;
        }
        
        .fc-day-today::before {
          content: '';
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          height: 3px;
          background: linear-gradient(90deg, #4f46e5, #6366f1);
          border-radius: 16px 16px 0 0;
        }
        
        .fc-event {
          border-radius: 8px !important;
          font-weight: 600 !important;
          box-shadow: 0 2px 12px rgba(0, 0, 0, 0.08), 0 1px 4px rgba(0, 0, 0, 0.04) !important;
          margin: 2px 2px !important;
          opacity: 0.95 !important;
          border: none !important;
          color: #ffffff !important;
          padding: 6px 10px !important;
          font-size: 0.875rem !important;
          letter-spacing: 0.01em;
          white-space: normal !important;
          word-break: break-word !important;
          transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1) !important;
          position: relative !important;
          overflow: hidden !important;
        }
        
        .fc-event::before {
          content: '';
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: linear-gradient(135deg, rgba(255, 255, 255, 0.1) 0%, rgba(255, 255, 255, 0.05) 100%);
          pointer-events: none;
        }
        
        .fc-event:hover {
          transform: translateY(-1px) !important;
          box-shadow: 0 8px 32px rgba(0, 0, 0, 0.12), 0 4px 16px rgba(0, 0, 0, 0.08) !important;
          opacity: 1 !important;
          filter: brightness(1.05) saturate(1.1) !important;
        }
        
        .fc-daygrid-event {
          width: calc(100% - 8px) !important;
          margin: 2px 4px !important;
        }
        
        .fc-timegrid-event {
          width: calc(100% - 4px) !important;
          margin: 1px 2px !important;
        }
        
        .fc-daygrid-day-number {
          font-weight: 700 !important;
          color: #475569 !important;
          font-size: 0.9rem !important;
          padding: 8px !important;
          width: 100% !important;
        }
        
        .fc-day-today .fc-daygrid-day-number {
          color: #4f46e5 !important;
          font-weight: 800 !important;
        }
        
        .fc-toolbar-title {
          font-size: 1.75rem !important;
          font-weight: 650 !important;
          color: #1e68e0ff !important;
          text-shadow: 0 1px 3px rgba(0, 0, 0, 0.08) !important;
          letter-spacing: -0.025em !important;
        }
        
        .fc-button-primary {
          background: linear-gradient(135deg, #4f46e5 0%, #6366f1 100%) !important;
          border: none !important;
          border-radius: 8px !important;
          font-weight: 600 !important;
          color: #ffffff !important;
          box-shadow: 0 2px 8px rgba(79, 70, 229, 0.15) !important;
          transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1) !important;
          padding: 8px 16px !important;
          font-size: 0.875rem !important;
        }
        
        .fc-button-primary:hover {
          background: linear-gradient(135deg, #4338ca 0%, #5b21b6 100%) !important;
          box-shadow: 0 4px 16px rgba(79, 70, 229, 0.25) !important;
          transform: translateY(-1px) !important;
        }
        
        .fc-button-primary:active {
          transform: translateY(0) !important;
        }
        
        .fc-daygrid-event .fc-event-title, .fc-timegrid-event .fc-event-title {
          font-size: 0.875rem !important;
          line-height: 1.4 !important;
          padding: 2px 0 !important;
          font-weight: 600 !important;
          text-shadow: 0 1px 2px rgba(0, 0, 0, 0.1) !important;
        }
        
        .fc-daygrid-event .fc-event-title {
          white-space: normal !important;
          overflow: visible !important;
        }
        
        .fc-timegrid-event .fc-event-title {
          font-size: 0.8rem !important;
        }
        
        .fc .fc-button-group > .fc-button {
          margin-right: 6px !important;
        }
        
        .fc .fc-button-group > .fc-button:last-child {
          margin-right: 0 !important;
        }
        
        .fc-daygrid-day-frame {
          position: relative;
          min-width: 0 !important;
        }
        
        .fc-more-link {
          background: linear-gradient(135deg, #f3f4f6, #e5e7eb) !important;
          color: #6b7280 !important;
          border-radius: 6px !important;
          font-weight: 600 !important;
          padding: 4px 8px !important;
          font-size: 0.75rem !important;
          transition: all 0.2s ease !important;
        }
        
        .fc-more-link:hover {
          background: linear-gradient(135deg, #e5e7eb, #d1d5db) !important;
          color: #4b5563 !important;
        }
        
        .fc-popover {
          border-radius: 12px !important;
          box-shadow: 0 12px 48px rgba(0, 0, 0, 0.15) !important;
          border: 1px solid rgba(226, 232, 240, 0.6) !important;
          backdrop-filter: blur(12px) !important;
        }
        
        .fc-toolbar {
          margin-bottom: 8px !important;
        }
        
        .loading-overlay {
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: rgba(255, 255, 255, 0.9);
          backdrop-filter: blur(4px);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 10;
          border-radius: 16px;
        }
        
        .loading-spinner {
          width: 32px;
          height: 32px;
          border: 3px solid #e5e7eb;
          border-top: 3px solid #4f46e5;
          border-radius: 50%;
          animation: spin 1s linear infinite;
        }
        
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `}</style>
    

      {isLoading && (
        <Loading message="Calendar Sync"/>
      )}

      {modalInfo && (
        <div 
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/20 backdrop-blur-sm pop-up-animate" 
          onClick={() => setModalInfo(null)}
        >
          <div 
            className="bg-white/95 backdrop-blur-md rounded-2xl shadow-2xl p-8 min-w-[380px] max-w-[90vw] border border-white/20 transform transition-all duration-300 scale-100 opacity-100" 
            onClick={e => e.stopPropagation()}
          >
            <div className="flex items-start justify-between mb-6">
              <div className="flex-1">
                <h3 className="text-xl font-bold text-slate-800 mb-2 leading-tight">
                  {modalInfo.extendedProps.type === 'task' 
                    ? modalInfo.extendedProps.taskName 
                    : modalInfo.extendedProps.projectName
                  }
                </h3>
                {modalInfo.extendedProps.type === 'task' && (
                  <p className="text-sm text-slate-600 mb-3">
                    <span className="font-medium">Project:</span> {modalInfo.extendedProps.projectName}
                  </p>
                )}
              </div>
              <button 
                className="ml-4 p-2 hover:bg-slate-100 rounded-lg transition-colors"
                onClick={() => setModalInfo(null)}
              >
                <svg className="w-5 h-5 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            
            <div className="space-y-4">
              <div className="flex items-center justify-between p-4 bg-slate-50/80 rounded-xl border border-slate-200/60">
                <span className="text-sm font-semibold text-slate-600">Status</span>
                <div className="flex items-center space-x-2">
                  <div 
                    className="w-3 h-3 rounded-full"
                    style={{backgroundColor: getStatusColor(modalInfo.extendedProps.status || 'N/A')}}
                  ></div>
                  <span 
                    className="text-sm font-bold capitalize"
                    style={{color: getStatusColor(modalInfo.extendedProps.status || 'N/A')}}
                  >
                    {modalInfo.extendedProps.status || 'N/A'}
                  </span>
                </div>
              </div>
              <div className="grid grid-cols-1 gap-4">
  <div className="p-4  rounded-xl border border-slate-200/60">
    <span className="text-sm font-semibold text-blue-700 block mb-1" style={{
      background: 'linear-gradient(90deg,#2563eb,#6366f1)',
      WebkitBackgroundClip: 'text',
      WebkitTextFillColor: 'transparent',
      fontWeight: 600,
      letterSpacing: '0.03em'
    }}>Start Date</span>
    <span className="text-sm" style={{
      color: '#2563eb',
      fontWeight: 500,
      letterSpacing: '0.02em'
    }}>{formatDate(modalInfo.startStr)}</span>
  </div>

  {modalInfo.endStr && modalInfo.endStr !== modalInfo.startStr && (
    <div className="p-4  rounded-xl border border-slate-200/60">
      <span className="text-sm font-semibold block mb-1" style={{
        color: '#ff3232d0',
        
        fontWeight: 600,
        letterSpacing: '0.03em'
      }}>End Date</span>
      <span className="text-sm" style={{
        color: '#ff3232d0',
        fontWeight: 500,
        letterSpacing: '0.02em'
      }}>{formatDate(modalInfo.endStr)}</span>
    </div>
  )}
</div>
            </div>
            
           
          </div>
        </div>
      )}
      
      <FullCalendar
        plugins={[dayGridPlugin, interactionPlugin]}
        initialView="dayGridMonth"
        events={events}
        height={560}
        headerToolbar={{
          left: "prev,next today",
          right: "title",
          
        }}
        eventClick={(info) => {
          setModalInfo({
            startStr: info.event.start,
            endStr: info.event.end,
            extendedProps: info.event.extendedProps || {}
          });
        }}
        eventDisplay="block"
        dayHeaderFormat={{ weekday: 'short' }}
        eventTimeFormat={false}
        displayEventTime={false}
        allDaySlot={false}
      />
    </div>
  );
};

export default Calendar;