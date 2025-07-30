import React, { useState } from 'react';
import TaskCard from './TaskCard';
import { Plus, MoreHorizontal, Trash2, X, AlertTriangle } from "lucide-react";
import axios from 'axios';
import Confetti from 'react-confetti';
import { fireRandomConfetti } from "../ConfettiBurst";

function Column({ 
  col, 
  column, 
  setColumn, 
  label,
  index, 
  id, 
    isOverlay = false ,
  tasks, 
  setTasks, 
  onDragStart, 
  onDragEnd,
  projectId
}) {
  const [updateTitle, setUpdateTitle] = useState(false);
  const [modal, setModal] = useState(false);
  const [fireConfetti, setFireConfetti] = useState(false);
    const [taskTitle, setTaskTitle] = useState('');
  const [isDragOver, setIsDragOver] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [dragOverIndex, setDragOverIndex] = useState(null);
  const [sure,setSure]=useState(false)
  const [deletedId,setDeletedId]=useState(null)
  const [loading,setLoading]=useState(false)
  const [showErrorModal,setshowErrorModal]=useState(false)
  const [errorMessage,setErrorMessage]=useState(null)

  const handleDragStart = (e) => {
    setIsDragging(true);
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('text/plain', JSON.stringify({
      type: 'column',
      id: col.id, // Use col.id for status, not col._id
      index: index
    }));
    onDragStart && onDragStart(col);
  };

  const handleDragEnd = (e) => {
    setIsDragging(false);
    onDragEnd && onDragEnd();
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    setIsDragOver(true);
  };

  const handleDragLeave = (e) => {
    if (!e.currentTarget.contains(e.relatedTarget)) {
      setIsDragOver(false);
      setDragOverIndex(null);
    }
  };

  const handleDrop = async (e) => {
    e.preventDefault();
    setIsDragOver(false);
    setDragOverIndex(null);
    
    const data = JSON.parse(e.dataTransfer.getData('text/plain'));
    
    if (data.type === 'column' && data.id !== col.id) { // Fixed: use col.id
      const newColumns = [...column];
      const draggedColumn = newColumns[data.index];
      newColumns.splice(data.index, 1);
      newColumns.splice(index, 0, draggedColumn);
      setColumn(newColumns);
      const columnsWithPositions = newColumns.map((col, idx) => ({
  ...col,
  position: idx
}));


await axios.post(`http://localhost:3000/task/api/update-column-position/${projectId}`,{
  orderedColumns:columnsWithPositions
},{withCredentials:true})
    }
  };

  const handleTaskDragOver = (e, taskIndex) => {
    e.preventDefault();
    e.stopPropagation();
    setDragOverIndex(taskIndex);
  };

  const fetchTasks = async () => {
    try {
      const res = await axios.get(
        `http://localhost:3000/task/api/get-tasks/${projectId}`,
        { withCredentials: true }
      );
      setTasks(res.data.fetchedTasks);
      console.log("fetched tasks",res.data.fetchedTasks);
      
    } catch (error) {
      console.log("Error fetching tasks:", error);
    }
  };

  const handleTaskDrop = async (e, targetIndex) => {
    e.preventDefault();
    e.stopPropagation();
    setDragOverIndex(null);
    
    const data = JSON.parse(e.dataTransfer.getData('text/plain'));
    
    if (data.type === 'task') {
      const taskId = data.id;
      const newStatus = col.id;
      
      // Find the task that's being moved
      const taskToMove = tasks.find(task => task._id === taskId);
      if (!taskToMove) return;

      const originalStatus = taskToMove.status;
      const originalPosition = taskToMove.position;

      // If moving within the same column (reordering)
      if (taskToMove.status === newStatus) {
        const columnTasks = tasks.filter(task => task.status === newStatus);
        const oldIndex = columnTasks.findIndex(task => task._id === taskId);
        
        if (oldIndex !== -1 && oldIndex !== targetIndex) {
          // Update UI optimistically
          const updatedColumnTasks = [...columnTasks];
          const [movedTask] = updatedColumnTasks.splice(oldIndex, 1);
          updatedColumnTasks.splice(targetIndex, 0, movedTask);

          // Update positions
          const updatedTasksWithPositions = updatedColumnTasks.map((task, idx) => ({
            ...task,
            position: idx
          }));

          // Merge back with other tasks
          const otherTasks = tasks.filter(task => task.status !== newStatus);
          setTasks([...otherTasks, ...updatedTasksWithPositions]);

          try {
            await axios.post(
              `http://localhost:3000/task/api/update-task-order/${projectId}`,
              {
                status: col.id,
                orderedTaskIds: updatedTasksWithPositions.map((task, idx) => ({
                  id: task._id,
                  position: idx
                }))
              },
              { withCredentials: true }
            );
            
            // Refresh tasks to ensure consistency
            await fetchTasks();
          } catch (error) {
            console.log("Failed to update task order:", error);
            // Rollback on error
            await fetchTasks();
            alert("Failed to update task order. Please try again.");
          }
        }
      } else {
        // Moving between different columns
        // Update UI optimistically
        setTasks(prevTasks => {
  // Remove the moved task from its old column
  const filtered = prevTasks.filter(task => task._id !== taskId);

  // Get tasks for the new column (after move)
  const newColumnTasks = filtered.filter(task => task.status === newStatus);

  // Insert the moved task at the target index
  newColumnTasks.splice(targetIndex, 0, { ...taskToMove, status: newStatus });

  // Reassign positions for all tasks in the new column
  const updatedNewColumnTasks = newColumnTasks.map((task, idx) => ({
    ...task,
    position: idx
  }));

  // Merge back with tasks from other columns
  const otherTasks = filtered.filter(task => task.status !== newStatus);

  return [...otherTasks, ...updatedNewColumnTasks];
});

          if (taskToMove.status !== newStatus && newStatus === "done") {
               fireRandomConfetti();
 // Reset trigger
 // Hide after 2.5s
  }

        try {
          await axios.post(
            `http://localhost:3000/task/api/dropTaskStatus/${taskId}`,
            {
              status: newStatus,
              projectId: projectId,
              position: targetIndex
            },
            { withCredentials: true }
          );
          
          // Refresh tasks to ensure consistency
          await fetchTasks();
          
        } catch (error) {
          console.log("Failed to update task status:", error);
          
          // Rollback on error
          setTasks(prevTasks => 
            prevTasks.map(task => 
              task._id === taskId 
                ? { ...task, status: originalStatus, position: originalPosition }
                : task
            )
          );
          
          alert("Failed to update task status. Please try again.");
        }
      }
    }
  };

  const updateColumnTitle = async () => {
    const newTitle = document.getElementById(`label-${col.id}`).value.trim();
      const isFirstDoneColumn = col.id === 'done'
    if ( !newTitle || newTitle.trim() === '' || newTitle.trim().toLowerCase() === 'done' || isFirstDoneColumn) {
      
      setUpdateTitle(false);
    return
    };

    try {
      // Update UI optimistically
      const updatedColumns = [...column];
      updatedColumns[index] = { ...updatedColumns[index], label: newTitle };
      setColumn(updatedColumns);
      setUpdateTitle(false);

      // Update on server
      await axios.post(
        `http://localhost:3000/task/api/update-column/${projectId}`,
        {
          id: col.id,
          label: newTitle
        },
        { withCredentials: true }
      );
    } catch (error) {
      console.log("Failed to update column title:", error);
      // Rollback on error
      const originalColumns = [...column];
      originalColumns[index] = { ...originalColumns[index], label: label };
      setColumn(originalColumns);
      console.log("cannot update title column due to this",error);
    }
  };

  const deleteColumn = async (id) => {

    setLoading(true)
    try {
      const deleteSelectedColumn = await axios.post(
        `http://localhost:3000/task/api/delete-taskStatuses/${projectId}`, 
        { deletedColumnId: id },
        { withCredentials: true }
      );
      setColumn(deleteSelectedColumn.data.filtredColumns);
      
      // Remove tasks from deleted column
      setTasks(prevTasks => prevTasks.filter(task => task.status !== id));
    } catch (error) {
      console.log("Can't delete the column:", error);
      alert(error.response?.data?.message || "Failed to delete column");
    }finally{

      setLoading(false)
    }
  };

  const handleDelete = (col)=>{

      
      if(col.id.trim() !== 'done'){
         
         setSure(true)
      setDeletedId(col)
      return
   


      }

      setErrorMessage("You cannot delete Done Column!")
      setshowErrorModal(true)

      
  }

  const addTask = async () => {
   
    setLoading(true)
    try {
      const addCurrentTask = await axios.post(
        `http://localhost:3000/task/api/addTask/${projectId}`,
        {
          name: taskTitle.trim(),
          status: col.id,
        },
        { withCredentials: true }
      );

      // Add task to UI
          await fetchTasks();

      setTaskTitle('');
      setModal(false);
      
    } catch (error) {
      console.log("Can't create task:", error);
      alert(error.response?.data?.message || "Failed to create task");
    }finally{


      setLoading(false)
    }
  };

  // Filter tasks for this column AND this project
  const columnTasks = tasks.filter((task) => 
    task.status === col.id && task.project === projectId
  ).sort((a,b)=>a.position-b.position);

  return (
    
  <div
     className={`bg-gray-50 w-80 min-w-80 project-scrollbar flex-shrink-0 shadow-sm rounded-lg border border-gray-200 flex flex-col transition-all duration-200
    ${isOverlay ? 'scale-105 z-[9999]' : ''}
    ${!isOverlay && isDragging ? 'opacity-60 transform rotate-1' : ''}
    ${isDragOver ? 'ring-2 ring-blue-400 bg-blue-50' : ''}`}
  style={{
    ...(isOverlay ? { opacity: 1 } : {}),
    height: columnTasks.length > 6 ? 'calc(100vh - 200px)' : 'fit-content',
    maxHeight: 'calc(100vh - 200px)'
  }}
  onDragOver={handleDragOver}
  onDragLeave={handleDragLeave}
  onDrop={handleDrop}
>

      <style>
        {`
          .column-scrollbar {
            scrollbar-width: thin;
            scrollbar-color: #3b82f6 #e0e7ef;
          }
             .column-scrollbar::-webkit-scrollbar {
      width: 1px !important; /* Use !important to force override */
      
    }
          .column-scrollbar::-webkit-scrollbar-thumb {
            background: #3b82f6;
            border-radius: 6px;
          }
          .column-scrollbar::-webkit-scrollbar-track {
            background: #e0e7ef;
            border-radius: 6px;
          }
        `}
      </style>
      {fireConfetti && <ConfettiBurst fire={fireConfetti} />}
      {/* Column Header */}
      <div
        draggable
        onDragStart={handleDragStart}
        onDragEnd={handleDragEnd}
        className="flex items-center justify-between p-4 shadow-sm border-b border-gray-200 cursor-grab select-none bg-white rounded-t-lg hover:bg-gray-50 transition-colors flex-shrink-0"
      >
        <div className="flex items-center gap-3 flex-1">
          {updateTitle ? (
            <input
              id={`label-${col.id}`}
              className="text-gray-900 font-semibold text-sm bg-transparent border-none outline-none flex-1"
              defaultValue={label}
              onBlur={updateColumnTitle}
              onKeyDown={(e) => e.key === 'Enter' && updateColumnTitle()}
              autoFocus
            />
          ) : (
            <h3 
              className="text-gray-900 font-semibold text-sm flex-1 cursor-pointer"
              onClick={() => setUpdateTitle(true)}
            >
              {label}
            </h3>
          )}
          <span className="bg-blue-600 text-white text-xs px-2 py-1 rounded-full font-medium mr-2">
            {columnTasks.length}
          </span>
        </div>
        <div className="flex items-center gap-1">
          <button
            onClick={() => setModal(true)}
            className="p-1 hover:bg-gray-100 rounded transition-colors"
          >
            <Plus size={16} className="text-gray-500" />
          </button>
          <button
            onClick={() => { handleDelete(col) }}
            className="p-1 hover:bg-gray-100 rounded transition-colors"
          >
            <Trash2 size={16} className="text-gray-500 hover:text-red-500" />
          </button>
        </div>
      </div>

      {/* Tasks List */}
      <div className={`flex-1 p-4 ${columnTasks.length > 3 ? 'overflow-y-auto' : 'overflow-y-auto'} column-scrollbar`}   style={{ maxHeight: 'calc(100vh - 260px)' }} // adjust as needed
>
         {modal && (
    <div className="w-full bg-white border border-gray-200 rounded-lg p-3 shadow-sm hover:shadow-md transition-all duration-200  mb-3 p-4 flex flex-col gap-3 overflow-hidden">
      <div className="flex items-center justify-between mb-2">
        <h4 className="text-sm font-normal text-gray-900">Add New Task</h4>
       
      </div>
      <input
        type="text"
        value={taskTitle}
        onChange={(e) => setTaskTitle(e.target.value)}
        onKeyDown={(e) => e.key === 'Enter' && taskTitle.trim() && addTask()}
        className="w-full px-2 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        placeholder="Enter task title..."
        autoFocus
      />
      <div className="flex gap-3">
        <button
          onClick={addTask}
          disabled={!taskTitle.trim()}
          className=" bg-blue-600 text-white text-sm py-1 px-1.5 rounded-md hover:bg-blue-700 transition-colors font-normal disabled:opacity-50 disabled:cursor-not-allowed"
        >
        {loading ? <div className='flex flex-row items-center gap-1 '><div className="w-4 h-4 mr-2 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    Adding...</div> : 'Add Task'}
        </button>
        <button
          onClick={() => {
            setModal(false);
            setTaskTitle('');
          }}
          className="p-1 text-sm border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 transition-colors"
        >
          Cancel
        </button>
      </div>
    </div>
  )}
        {columnTasks
          .sort((a, b) => (a.position || 0) - (b.position || 0)) // Sort by position
          .map((task, taskIndex) => (
            <div
              key={task._id}
              onDragOver={(e) => handleTaskDragOver(e, taskIndex)}
              onDrop={(e) => handleTaskDrop(e, taskIndex)}
              className={`${dragOverIndex === taskIndex ? 'border-t-2 border-blue-400' : ''}`}
            >
              <TaskCard
                task={task}
                setTasks={setTasks}
                columnId={col.id}
                fetchTasks={fetchTasks}
                index={taskIndex}
                onDragStart={onDragStart}
                onDragEnd={onDragEnd}
                projectId={projectId}
              />
            </div>
          ))}
        
        {columnTasks.length === 0 && (
          <div
            style={{
              minHeight: 50,
              border: '2px dashed #cbd5e1',
              borderRadius: 8,
              background: '#f8fafc',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#94a3b8',
              marginBottom: 8,
            }}
            onDragOver={(e) => handleTaskDragOver(e, 0)}
            onDrop={(e) => handleTaskDrop(e, 0)}
          >
            <Plus/>
          </div>
        )}
        
        <div
          onDragOver={(e) => handleTaskDragOver(e, columnTasks.length)}
          onDrop={(e) => handleTaskDrop(e, columnTasks.length)}
          className={`h-2 ${dragOverIndex === columnTasks.length ? 'border-t-2 border-blue-400' : ''}`}
        />
      </div>

      {/* Add Task Button */}
      <div className="p-4 pt-0 flex-shrink-0">
        <button
          onClick={() => setModal(true)}
          className="w-full flex items-center justify-center gap-2 p-3 text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-lg transition-colors border-2 border-dashed border-gray-300 hover:border-gray-400"
        >
          <Plus size={16} />
          <span className="text-sm font-medium">Add task</span>
        </button>
      </div>

      {/* Add Task Modal */}
      
       {sure && deletedId && (
        <div className="fixed inset-0 z-[10003] flex items-center justify-center p-4 bg-black/20 backdrop-blur-sm animate-fade-in">
          <div 
            className="fixed inset-0" 
            onClick={() => {
              setShowDeleteConfirmModal(false);
              setProjectToDelete(null);
            }}
          ></div>
          <div className="bg-white rounded-2xl shadow-2xl p-6 max-w-md w-full relative z-10">
            <div className="flex items-center mb-4">
              <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mr-4">
                <AlertTriangle className="w-6 h-6 text-red-600" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900">Delete Column?</h3>
              </div>
            </div>
            
            <p className="text-gray-700 mb-2">
              Are you sure you want to delete <span className="font-semibold">"{deletedId.label}"</span>?
            </p>
            <p className="text-sm text-gray-500 mb-6">
              This action cannot be undone. All tasks, and attachments will be permanently removed.
            </p>
            
            <div className="flex space-x-3">
              <button 
                onClick={() => {
                  setSure(false);
                  setDeletedId(null);
                }}
                disabled={loading}
                className="flex-1 px-4 py-2 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors font-medium"
              >
                No, Cancel
              </button>
              <button 
                onClick={() => deleteColumn(deletedId)}
                disabled={loading}
                className="flex-1 px-4 py-2 text-white bg-red-600 hover:bg-red-700 rounded-lg transition-colors font-medium flex items-center justify-center"
              >
                {loading ? (
                  <>
                    <div className="w-4 h-4 mr-2 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    Deleting...
                  </>
                ) : (
                  <>
                    <Trash2 className="w-4 h-4 mr-2" />
                    Yes, Delete
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
        {showErrorModal && (
                  <div className="fixed inset-0 z-[10002] flex items-center justify-center p-4 bg-black/20 backdrop-blur-sm animate-fade-in">
                    <div 
                      className="fixed inset-0" 
                      onClick={() => setshowErrorModal(false)}
                    ></div>
                    <div className="bg-white rounded-2xl shadow-2xl p-6 max-w-md w-full relative z-10">
                      <div className="flex items-center mb-4">
                        <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mr-4">
                          <AlertTriangle className="w-6 h-6 text-red-600" />
                        </div>
                        <div>
                          <h3 className="text-lg font-semibold text-gray-900">Validation Error</h3>
                        </div>
                      </div>
                      <p className="text-gray-700 mb-4">{errorMessage}</p>
                      <button 
                        onClick={() => setshowErrorModal(false)}
                        className="w-full px-4 py-2 text-white bg-red-600 hover:bg-red-700 rounded-lg transition-colors"
                      >
                        OK            </button>
                    </div>
                  </div>
                )}
    </div>
  );
}

export default Column;