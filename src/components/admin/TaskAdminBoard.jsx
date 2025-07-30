// KanbanBoard.jsx
import React, { useState, useCallback, useEffect,useRef } from 'react';
import Column from '../kanban/Column';
import { Plus, User, Tag } from "lucide-react";
import axios from 'axios';
import { DndContext, DragOverlay } from '@dnd-kit/core';




function TaskAdminBoard({projectId}) {


    const boardRef = useRef();


  const [columns, setColumns] = useState([]);
    const [tasks, setTasks] = useState([]);
    const [showAddInput, setShowAddInput] = useState(false);
  const [newColumnLabel, setNewColumnLabel] = useState('');
    const [activeColumn, setActiveColumn] = useState(null);
      const [scrollDirection, setScrollDirection] = useState(null);


  

  const getAvailableProjectColumns =async (projectId)=>{

    console.log("projectId is : ",projectId);
    
    try {

      const availableColumn = await axios.get(`http://localhost:3000/task/api/get-taskStatuses/${projectId}`,{withCredentials:true})

      if(availableColumn){

        console.log(availableColumn.data);
        setColumns(availableColumn.data.taskStatuses)
        
      }
      
      
    } catch (error) {

      console.log("can't fetch availbale column due to this",error);
     
      
      
    }
  }

  const fetchvavailableTasks = async (projectId)=> {

    try {

      const availableTasks = await axios.get(`http://localhost:3000/task/api/get-tasks/${projectId}`,{withCredentials:true})
      console.log(availableTasks.data);
      setTasks(availableTasks.data.fetchedTasks)
      
      
    } catch (error) {

      console.log("can't fetch available tasks due to this",error);
      console.log(error?.response?.data?.message);
      
      
      
    }
  }

  const getTeamColor = (name) => {
  const colors = [
    'bg-purple-500',
    'bg-green-500',
    'bg-red-500',
    'bg-yellow-500',
    'bg-pink-500',
    'bg-indigo-500',
    'bg-teal-500',
    'bg-orange-500',
  ];
  const index = name.charCodeAt(0) % colors.length;
  return colors[index];
};

//*
// task in front end treated like this  { id: 1, title: "Design system components", status: "backlog" },



 useEffect(() => {
    let animationFrameId = null;

    const animateScroll = () => {
      if (!boardRef.current || !scrollDirection) return;
      if (scrollDirection === 'left') {
        boardRef.current.scrollLeft -= 14; // Very smooth
      } else if (scrollDirection === 'right') {
        boardRef.current.scrollLeft += 14;
      }
      animationFrameId = requestAnimationFrame(animateScroll);
    };

    if (scrollDirection) {
      animationFrameId = requestAnimationFrame(animateScroll);
    } else if (animationFrameId) {
      cancelAnimationFrame(animationFrameId);
    }

    return () => {
      if (animationFrameId) cancelAnimationFrame(animationFrameId);
    };
  }, [scrollDirection]);

  useEffect(() => {
    const handleDragOver = (e) => {
      if (!boardRef.current) return;
      const boardRect = boardRef.current.getBoundingClientRect();
      const mouseX = e.clientX;

      if (mouseX < boardRect.left + 80) {
        setScrollDirection('left');
      } else if (mouseX > boardRect.right - 80) {
        setScrollDirection('right');
      } else {
        setScrollDirection(null);
      }
    };

    document.addEventListener('dragover', handleDragOver);
    document.addEventListener('dragleave', () => setScrollDirection(null));
    document.addEventListener('drop', () => setScrollDirection(null));
    return () => {
      document.removeEventListener('dragover', handleDragOver);
      document.removeEventListener('dragleave', () => setScrollDirection(null));
      document.removeEventListener('drop', () => setScrollDirection(null));
    };
  }, []);

  useEffect(()=>{

    getAvailableProjectColumns(projectId)
    fetchvavailableTasks(projectId)


  },[projectId])

  const [draggedItem, setDraggedItem] = useState(null);

  const sortedColumnsByPosition = columns.slice().sort((a,b)=>{a.position-b.position})

  const handleDragStart = useCallback((item) => {
    setDraggedItem(item);
        setActiveColumn(item); // Track the column for overlay

  }, []);

  const handleDragEnd = useCallback(() => {
    setDraggedItem(null);
        setActiveColumn(null); // Remove overlay

  }, []);

  const addColumn = async () => {
     const  id= newColumnLabel.replace(/\s+/g, '-').toLowerCase().trim()
      const label= newColumnLabel
     const  color=getTeamColor(newColumnLabel)

     if(newColumnLabel.trim() === '' || columns.find(col=>col.id===newColumnLabel.trim().toLowerCase() ) ){

      return
     }

     try {

      const setNewColumn = await axios.post(`http://localhost:3000/task/api/add-taskStatuses/${projectId}`,{id:id,label:label,color:color},{withCredentials:true})
    await getAvailableProjectColumns(projectId)

    setShowAddInput(false);
      setNewColumnLabel('');
      
     } catch (error) {

      console.log("can't add column due to this",error);
      

      
      
     }
    

  };

  return (

    <DndContext
      onDragStart={({ active }) => {
        // Find the column being dragged by its id
        const col = columns.find(c => c._id === active.id);
        if (col) setActiveColumn(col);
      }}
      onDragEnd={() => setActiveColumn(null)}
    >
    <div className=" min-h-fit">
      {/* Header */}
     
 

      {/* Board */}
      <div   ref={boardRef} // <-- Add this!
  className="p-6 overflow-x-auto overflow-y-auto h-[calc(100vh-125px)] flex flex-row gap-4 project-scrollbar"
> 

        <div className="flex gap-6 pb-6" style={{ minWidth: 'fit-content' }}>
          {sortedColumnsByPosition.map((col, index) => (
            <Column
              key={col._id}
              col={col}
              column={columns}
              setColumn={setColumns}
              label={col.label}
              index={index}
              id={col._id}
              tasks={tasks}
              setTasks={setTasks}
              onDragStart={handleDragStart}
              onDragEnd={handleDragEnd}
              projectId={projectId}
            />
          ))}
        </div>
           <div className="min-w-80 h-fit flex flex-col items-center justify-center gap-2 p-3">
          {showAddInput ? (
            <div className="w-full bg-transparent rounded-xl border-dashed border-2 border-gray-200  py-4 px-3 flex flex-col items-center gap-3 transition-all duration-200">
  <div className="w-full flex flex-col gap-3">
    <input
      type="text"
      className="border  border-gray-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-500 rounded-lg px-3 py-2 text-base outline-none transition"
      placeholder="Column Name"
      value={newColumnLabel}
      onChange={e => setNewColumnLabel(e.target.value)}
      onKeyDown={e => {
        if (e.key === 'Enter') addColumn();
        if (e.key === 'Escape') {
          setShowAddInput(false);
          setNewColumnLabel('');
        }
      }}
      autoFocus
    />
    <div className="flex  justify-end mt-1.5">
      <button
        onClick={addColumn}
        className="bg-blue-600 text-white px-2 py-1 rounded-md font-normal shadow hover:bg-blue-700 transition"
      >
        Add
      </button>
      <button
        onClick={() => {
          setShowAddInput(false);
          setNewColumnLabel('');
        }}
        className="text-gray-400 hover:text-blue-600 px-4 py-2 rounded-lg transition"
      >
        Cancel
      </button>
    </div>
  </div>
</div>
          ) : (
            <button
              onClick={() => setShowAddInput(true)}
              className="w-full flex items-center justify-center gap-2 p-3 text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-lg transition-colors border-2 border-dashed border-gray-300 hover:border-gray-400"
            >
              <Plus size={16} />
              Add Column
            </button>
          )}

        
        </div>
      </div> 
      
<DragOverlay>
          {activeColumn ? (
            <Column
              col={activeColumn}
              column={columns}
              setColumn={setColumns}
              label={activeColumn.label}
              index={columns.findIndex(c => c._id === activeColumn._id)}
              id={activeColumn._id}
              tasks={tasks}
              setTasks={setTasks}
              projectId={projectId}
              isOverlay={true} // Pass this prop for overlay styling
            />
          ) : null}
        </DragOverlay>
    </div></DndContext>
  );
}

export default TaskAdminBoard;