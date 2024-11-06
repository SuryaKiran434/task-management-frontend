import React, { useContext } from 'react';
import { TaskContext } from '../context/TaskContext';
import { format } from 'date-fns';

const TaskItem = ({ task }) => {
  const { deleteTask } = useContext(TaskContext);

  const handleDelete = () => {
    deleteTask(task.id);
  };

  // Format the due date
  const formattedDate = format(new Date(task.dueDate), 'MMMM dd, yyyy');

  return (
    <div>
      <h3>{task.title}</h3>
      <p>{task.description}</p>
      <p>Status: {task.status}</p>
      <p>Priority: {task.priority.toUpperCase()}</p> {/* Ensure consistency */}
      <p>Due Date: {formattedDate}</p>
      <button onClick={() => {/* logic to set task for editing */}}>Edit</button>
      <button onClick={handleDelete}>Delete</button>
    </div>
  );
};

export default TaskItem;
