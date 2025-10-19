import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragOverlay
} from '@dnd-kit/core';
import {
  // arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import {
  useSortable,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { getTasksByProject, createTask, updateTaskPosition } from '../services/api';
import TaskCard from '../components/TaskCard';
import AIChat from '../components/AIChat';
import '../styles/KanbanBoard.css';

// Sortable Task Component
const SortableTask = ({ task, onUpdate, onDelete }) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: task._id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <div ref={setNodeRef} style={style} {...attributes} {...listeners}>
      <TaskCard 
        task={task} 
        onUpdate={onUpdate}
        onDelete={onDelete}
      />
    </div>
  );
};

const KanbanBoard = () => {
  const { projectId } = useParams();
  const navigate = useNavigate();
  const [tasks, setTasks] = useState([]);
  const [showTaskForm, setShowTaskForm] = useState(false);
  const [newTask, setNewTask] = useState({ title: '', description: '', status: 'todo' });
  const [showAIChat, setShowAIChat] = useState(false);
  const [activeId, setActiveId] = useState(null);

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  // Use useCallback to memoize the function and avoid infinite re-renders
  const fetchTasks = useCallback(async () => {
    try {
      const response = await getTasksByProject(projectId);
      setTasks(response.data);
    } catch (error) {
      console.error('Error fetching tasks:', error);
    }
  }, [projectId]);

  useEffect(() => {
    fetchTasks();
  }, [fetchTasks]);

  const handleDragStart = (event) => {
    setActiveId(event.active.id);
  };

  const handleDragEnd = async (event) => {
    const { active, over } = event;
    setActiveId(null);

    if (!over) return;

    const activeId = active.id;
    const overId = over.id;

    if (activeId === overId) return;

    // Find the tasks
    const activeTask = tasks.find(task => task._id === activeId);
    const overTask = tasks.find(task => task._id === overId);

    if (!activeTask || !overTask) return;

    // If dropping in a different column
    if (activeTask.status !== overTask.status) {
      try {
        await updateTaskPosition(activeId, {
          status: overTask.status,
          position: 0 // Will be recalculated on backend
        });
        fetchTasks();
      } catch (error) {
        console.error('Error updating task position:', error);
      }
    }
  };

  const handleDragCancel = () => {
    setActiveId(null);
  };

  const handleCreateTask = async (e) => {
    e.preventDefault();
    try {
      await createTask({ ...newTask, projectId });
      setNewTask({ title: '', description: '', status: 'todo' });
      setShowTaskForm(false);
      fetchTasks();
    } catch (error) {
      console.error('Error creating task:', error);
    }
  };

  const columns = [
    { id: 'todo', title: 'To Do', color: '#ff6b6b' },
    { id: 'inProgress', title: 'In Progress', color: '#4ecdc4' },
    { id: 'done', title: 'Done', color: '#1a936f' }
  ];

  const getTasksByStatus = (status) => {
    return tasks.filter(task => task.status === status)
               .sort((a, b) => a.position - b.position);
  };

  const activeTask = tasks.find(task => task._id === activeId);

  return (
    <div className="kanban-board">
      <div className="board-header">
        <button className="btn-back" onClick={() => navigate('/')}>
          ← Back to Projects
        </button>
        <div className="board-actions">
          <button 
            className="btn-primary"
            onClick={() => setShowTaskForm(true)}
          >
            + Add Task
          </button>
          <button 
            className="btn-ai"
            onClick={() => setShowAIChat(true)}
          >
            🤖 AI Assistant
          </button>
        </div>
      </div>

      {showTaskForm && (
        <div className="task-form-overlay">
          <div className="task-form">
            <h3>Create New Task</h3>
            <form onSubmit={handleCreateTask}>
              <input
                type="text"
                placeholder="Task Title"
                value={newTask.title}
                onChange={(e) => setNewTask({...newTask, title: e.target.value})}
                required
              />
              <textarea
                placeholder="Task Description"
                value={newTask.description}
                onChange={(e) => setNewTask({...newTask, description: e.target.value})}
              />
              <select
                value={newTask.status}
                onChange={(e) => setNewTask({...newTask, status: e.target.value})}
              >
                <option value="todo">To Do</option>
                <option value="inProgress">In Progress</option>
                <option value="done">Done</option>
              </select>
              <div className="form-actions">
                <button type="submit" className="btn-primary">Create Task</button>
                <button 
                  type="button" 
                  className="btn-secondary"
                  onClick={() => setShowTaskForm(false)}
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {showAIChat && (
        <AIChat 
          projectId={projectId}
          onClose={() => setShowAIChat(false)}
        />
      )}

      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragStart={handleDragStart}
        onDragEnd={handleDragEnd}
        onDragCancel={handleDragCancel}
      >
        <div className="board-columns">
          {columns.map(column => (
            <div key={column.id} className="board-column">
              <div className="column-header" style={{ borderTopColor: column.color }}>
                <h3>{column.title}</h3>
                <span className="task-count">
                  {getTasksByStatus(column.id).length}
                </span>
              </div>
              
              <div className="task-list">
                <SortableContext 
                  items={getTasksByStatus(column.id).map(task => task._id)}
                  strategy={verticalListSortingStrategy}
                >
                  {getTasksByStatus(column.id).map((task) => (
                    <SortableTask
                      key={task._id}
                      task={task}
                      onUpdate={fetchTasks}
                      onDelete={fetchTasks}
                    />
                  ))}
                </SortableContext>
              </div>
            </div>
          ))}
        </div>

        <DragOverlay>
          {activeTask ? (
            <div style={{ 
              transform: 'rotate(5deg)',
              opacity: 0.8 
            }}>
              <TaskCard 
                task={activeTask} 
                onUpdate={fetchTasks}
                onDelete={fetchTasks}
              />
            </div>
          ) : null}
        </DragOverlay>
      </DndContext>
    </div>
  );
};

export default KanbanBoard;
// export default KanbanBoard;

// import React, { useState, useEffect, useCallback } from 'react';
// import { useParams, useNavigate } from 'react-router-dom';
// import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd';
// import { getTasksByProject, createTask, updateTaskPosition } from '../services/api';
// import TaskCard from '../components/TaskCard';
// import AIChat from '../components/AIChat';
// import '../styles/KanbanBoard.css';

// const KanbanBoard = () => {
//   const { projectId } = useParams();
//   const navigate = useNavigate();
//   const [tasks, setTasks] = useState([]);
//   const [showTaskForm, setShowTaskForm] = useState(false);
//   const [newTask, setNewTask] = useState({ title: '', description: '', status: 'todo' });
//   const [showAIChat, setShowAIChat] = useState(false);

//   // Use useCallback to memoize the function and avoid infinite re-renders
//   const fetchTasks = useCallback(async () => {
//     try {
//       const response = await getTasksByProject(projectId);
//       setTasks(response.data);
//     } catch (error) {
//       console.error('Error fetching tasks:', error);
//     }
//   }, [projectId]);

//   useEffect(() => {
//     fetchTasks();
//   }, [fetchTasks]);

//   const handleDragEnd = async (result) => {
//     if (!result.destination) return;

//     const { draggableId, destination } = result;
    
//     try {
//       await updateTaskPosition(draggableId, {
//         status: destination.droppableId,
//         position: destination.index
//       });
      
//       fetchTasks(); // Refresh tasks
//     } catch (error) {
//       console.error('Error updating task position:', error);
//     }
//   };

//   const handleCreateTask = async (e) => {
//     e.preventDefault();
//     try {
//       await createTask({ ...newTask, projectId });
//       setNewTask({ title: '', description: '', status: 'todo' });
//       setShowTaskForm(false);
//       fetchTasks();
//     } catch (error) {
//       console.error('Error creating task:', error);
//     }
//   };

//   const columns = [
//     { id: 'todo', title: 'To Do', color: '#ff6b6b' },
//     { id: 'inProgress', title: 'In Progress', color: '#4ecdc4' },
//     { id: 'done', title: 'Done', color: '#1a936f' }
//   ];

//   const getTasksByStatus = (status) => {
//     return tasks.filter(task => task.status === status)
//                .sort((a, b) => a.position - b.position);
//   };

//   return (
//     <div className="kanban-board">
//       <div className="board-header">
//         <button className="btn-back" onClick={() => navigate('/')}>
//           ← Back to Projects
//         </button>
//         <div className="board-actions">
//           <button 
//             className="btn-primary"
//             onClick={() => setShowTaskForm(true)}
//           >
//             + Add Task
//           </button>
//           <button 
//             className="btn-ai"
//             onClick={() => setShowAIChat(true)}
//           >
//             🤖 AI Assistant
//           </button>
//         </div>
//       </div>

//       {showTaskForm && (
//         <div className="task-form-overlay">
//           <div className="task-form">
//             <h3>Create New Task</h3>
//             <form onSubmit={handleCreateTask}>
//               <input
//                 type="text"
//                 placeholder="Task Title"
//                 value={newTask.title}
//                 onChange={(e) => setNewTask({...newTask, title: e.target.value})}
//                 required
//               />
//               <textarea
//                 placeholder="Task Description"
//                 value={newTask.description}
//                 onChange={(e) => setNewTask({...newTask, description: e.target.value})}
//               />
//               <select
//                 value={newTask.status}
//                 onChange={(e) => setNewTask({...newTask, status: e.target.value})}
//               >
//                 <option value="todo">To Do</option>
//                 <option value="inProgress">In Progress</option>
//                 <option value="done">Done</option>
//               </select>
//               <div className="form-actions">
//                 <button type="submit" className="btn-primary">Create Task</button>
//                 <button 
//                   type="button" 
//                   className="btn-secondary"
//                   onClick={() => setShowTaskForm(false)}
//                 >
//                   Cancel
//                 </button>
//               </div>
//             </form>
//           </div>
//         </div>
//       )}

//       {showAIChat && (
//         <AIChat 
//           projectId={projectId}
//           onClose={() => setShowAIChat(false)}
//         />
//       )}

//       <DragDropContext onDragEnd={handleDragEnd}>
//         <div className="board-columns">
//           {columns.map(column => (
//             <div key={column.id} className="board-column">
//               <div className="column-header" style={{ borderTopColor: column.color }}>
//                 <h3>{column.title}</h3>
//                 <span className="task-count">
//                   {getTasksByStatus(column.id).length}
//                 </span>
//               </div>
              
//               <Droppable droppableId={column.id}>
//                 {(provided, snapshot) => (
//                   <div
//                     ref={provided.innerRef}
//                     {...provided.droppableProps}
//                     className={`task-list ${snapshot.isDraggingOver ? 'dragging-over' : ''}`}
//                   >
//                     {getTasksByStatus(column.id).map((task, index) => (
//                       <Draggable
//                         key={task._id}
//                         draggableId={task._id}
//                         index={index}
//                       >
//                         {(provided, snapshot) => (
//                           <div
//                             ref={provided.innerRef}
//                             {...provided.draggableProps}
//                             {...provided.dragHandleProps}
//                             className={`task-draggable ${snapshot.isDragging ? 'dragging' : ''}`}
//                           >
//                             <TaskCard 
//                               task={task} 
//                               onUpdate={fetchTasks}
//                               onDelete={fetchTasks}
//                             />
//                           </div>
//                         )}
//                       </Draggable>
//                     ))}
//                     {provided.placeholder}
//                   </div>
//                 )}
//               </Droppable>
//             </div>
//           ))}
//         </div>
//       </DragDropContext>
//     </div>
//   );
// };

// export default KanbanBoard;