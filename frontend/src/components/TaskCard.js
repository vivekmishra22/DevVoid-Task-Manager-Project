import React, { useState } from 'react';
import { updateTask, deleteTask } from '../services/api';

const TaskCard = ({ task, onUpdate, onDelete }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editData, setEditData] = useState({
    title: task.title,
    description: task.description
  });

  const handleUpdate = async (e) => {
    e.preventDefault();
    try {
      await updateTask(task._id, editData);
      setIsEditing(false);
      onUpdate();
    } catch (error) {
      console.error('Error updating task:', error);
    }
  };

  const handleDelete = async () => {
    if (window.confirm('Are you sure you want to delete this task?')) {
      try {
        await deleteTask(task._id);
        onDelete();
      } catch (error) {
        console.error('Error deleting task:', error);
      }
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'todo': return '#ff6b6b';
      case 'inProgress': return '#4ecdc4';
      case 'done': return '#1a936f';
      default: return '#666';
    }
  };

  if (isEditing) {
    return (
      <div className="task-card editing">
        <form onSubmit={handleUpdate}>
          <input
            type="text"
            value={editData.title}
            onChange={(e) => setEditData({...editData, title: e.target.value})}
            required
          />
          <textarea
            value={editData.description}
            onChange={(e) => setEditData({...editData, description: e.target.value})}
            placeholder="Task description..."
          />
          <div className="task-actions">
            <button type="submit" className="btn-primary">Save</button>
            <button 
              type="button" 
              className="btn-secondary"
              onClick={() => setIsEditing(false)}
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    );
  }

  return (
    <div className="task-card">
      <div className="task-header">
        <h4>{task.title}</h4>
        <span 
          className="status-indicator"
          style={{ backgroundColor: getStatusColor(task.status) }}
        ></span>
      </div>
      
      {task.description && (
        <p className="task-description">{task.description}</p>
      )}
      
      <div className="task-footer">
        <small>
          Created: {new Date(task.createdAt).toLocaleDateString()}
        </small>
        <div className="task-actions">
          <button 
            className="btn-edit"
            onClick={() => setIsEditing(true)}
          >
            Edit
          </button>
          <button 
            className="btn-delete"
            onClick={handleDelete}
          >
            Delete
          </button>
        </div>
      </div>
    </div>
  );
};

export default TaskCard;