"use client";

import { useState } from "react";
import { cn } from "../lib/utils";

type Priority = "low" | "medium" | "high";

type TodoItem = {
  id: string;
  text: string;
  completed: boolean;
  priority: Priority;
  dueDate: string | null;
};

type FilterStatus = "all" | "active" | "completed";
type SortOption = "dueDate" | "priority" | "added";

export default function Todo() {
  const [todos, setTodos] = useState<TodoItem[]>([]);
  const [inputValue, setInputValue] = useState("");
  const [filter, setFilter] = useState<FilterStatus>("all");
  const [sort, setSort] = useState<SortOption>("added");
  const [priority, setPriority] = useState<Priority>("medium");
  const [dueDate, setDueDate] = useState<string>("");
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingTodo, setEditingTodo] = useState<TodoItem | null>(null);
  const [editText, setEditText] = useState("");
  const [editPriority, setEditPriority] = useState<Priority>("medium");
  const [editDueDate, setEditDueDate] = useState<string>("");
  
  const filteredTodos = todos.filter((todo) => {
    if (filter === "all") return true;
    if (filter === "active") return !todo.completed;
    if (filter === "completed") return todo.completed;
    return true;
  });
  
  const sortedTodos = [...filteredTodos].sort((a, b) => {
    if (sort === "dueDate") {
      // Handle null due dates (put them at the end)
      if (!a.dueDate && !b.dueDate) return 0;
      if (!a.dueDate) return 1;
      if (!b.dueDate) return -1;
      return new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime();
    }
    
    if (sort === "priority") {
      const priorityOrder = { high: 0, medium: 1, low: 2 };
      return priorityOrder[a.priority] - priorityOrder[b.priority];
    }
    
    // Default: keep original order (added)
    return 0;
  });
  
  const handleAddTodo = () => {
    if (!inputValue.trim()) return;
    
    const newTodo: TodoItem = {
      id: crypto.randomUUID(),
      text: inputValue.trim(),
      completed: false,
      priority,
      dueDate: dueDate || null
    };
    
    setTodos([...todos, newTodo]);
    setInputValue("");
    // Keep the priority but clear the due date for next todo
    setDueDate("");
  };
  
  const handleToggleTodo = (id: string) => {
    setTodos(
      todos.map((todo) =>
        todo.id === id ? { ...todo, completed: !todo.completed } : todo
      )
    );
  };
  
  const handleDeleteTodo = (id: string) => {
    setTodos(todos.filter((todo) => todo.id !== id));
  };
  
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      handleAddTodo();
    }
  };

  const handleEditKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      handleUpdateTodo();
    }
  };

  const formatDate = (dateString: string | null) => {
    if (!dateString) return "";
    const date = new Date(dateString);
    return date.toLocaleDateString();
  };

  const isOverdue = (dateString: string | null) => {
    if (!dateString) return false;
    const date = new Date(dateString);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return date < today;
  };
  
  const getPriorityColor = (priority: Priority) => {
    switch (priority) {
      case "high": return "text-red-500 border-red-300 bg-red-50";
      case "medium": return "text-yellow-500 border-yellow-300 bg-yellow-50";
      case "low": return "text-green-500 border-green-300 bg-green-50";
    }
  };

  const handleEditClick = (todo: TodoItem) => {
    setEditingTodo(todo);
    setEditText(todo.text);
    setEditPriority(todo.priority);
    setEditDueDate(todo.dueDate || "");
    setIsEditModalOpen(true);
  };

  const handleUpdateTodo = () => {
    if (!editingTodo || !editText.trim()) return;

    setTodos(
      todos.map((todo) =>
        todo.id === editingTodo.id
          ? {
              ...todo,
              text: editText.trim(),
              priority: editPriority,
              dueDate: editDueDate || null,
            }
          : todo
      )
    );

    // Close modal and reset state
    setIsEditModalOpen(false);
    setEditingTodo(null);
  };

  const closeEditModal = () => {
    setIsEditModalOpen(false);
    setEditingTodo(null);
  };
  
  return (
    <div className="w-full max-w-2xl mx-auto p-6 bg-white rounded-lg shadow-lg border border-gray-200">
      <h1 className="text-2xl font-bold mb-6 text-gray-800">Task Manager</h1>
      
      <div className="mb-6">
        <div className="flex mb-3">
          <input
            type="text"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Add a new task..."
            className="flex-1 px-4 py-2 border border-gray-300 rounded-l-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            aria-label="Add a new task"
          />
          <button
            onClick={handleAddTodo}
            className="px-6 py-2 bg-blue-500 text-white rounded-r-lg hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
            aria-label="Add task"
          >
            Add
          </button>
        </div>
        
        <div className="flex flex-wrap gap-3">
          <div className="flex items-center">
            <label htmlFor="priority" className="mr-2 text-sm text-gray-700">Priority:</label>
            <select
              id="priority"
              value={priority}
              onChange={(e) => setPriority(e.target.value as Priority)}
              className="px-2 py-1 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              aria-label="Select task priority"
            >
              <option value="low">Low</option>
              <option value="medium">Medium</option>
              <option value="high">High</option>
            </select>
          </div>
          
          <div className="flex items-center">
            <label htmlFor="dueDate" className="mr-2 text-sm text-gray-700">Due Date:</label>
            <input
              id="dueDate"
              type="date"
              value={dueDate}
              onChange={(e) => setDueDate(e.target.value)}
              className="px-2 py-1 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              aria-label="Set due date"
            />
          </div>
        </div>
      </div>
      
      <div className="flex flex-wrap justify-between items-center mb-4">
        <div className="flex space-x-2 mb-2 sm:mb-0">
          <button
            onClick={() => setFilter("all")}
            className={cn(
              "px-3 py-1 rounded-md text-sm font-medium",
              filter === "all" ? "bg-blue-500 text-white" : "bg-gray-200 text-gray-700 hover:bg-gray-300"
            )}
            aria-pressed={filter === "all"}
            aria-label="Show all tasks"
            tabIndex={0}
          >
            All
          </button>
          <button
            onClick={() => setFilter("active")}
            className={cn(
              "px-3 py-1 rounded-md text-sm font-medium",
              filter === "active" ? "bg-blue-500 text-white" : "bg-gray-200 text-gray-700 hover:bg-gray-300"
            )}
            aria-pressed={filter === "active"}
            aria-label="Show active tasks"
            tabIndex={0}
          >
            Active
          </button>
          <button
            onClick={() => setFilter("completed")}
            className={cn(
              "px-3 py-1 rounded-md text-sm font-medium",
              filter === "completed" ? "bg-blue-500 text-white" : "bg-gray-200 text-gray-700 hover:bg-gray-300"
            )}
            aria-pressed={filter === "completed"}
            aria-label="Show completed tasks"
            tabIndex={0}
          >
            Completed
          </button>
        </div>
        
        <div className="flex items-center">
          <label htmlFor="sort" className="mr-2 text-sm text-gray-700">Sort by:</label>
          <select
            id="sort"
            value={sort}
            onChange={(e) => setSort(e.target.value as SortOption)}
            className="px-2 py-1 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            aria-label="Sort tasks by"
          >
            <option value="added">Added date</option>
            <option value="dueDate">Due date</option>
            <option value="priority">Priority</option>
          </select>
        </div>
      </div>
      
      <ul className="space-y-3 mt-6">
        {sortedTodos.length === 0 ? (
          <li className="text-gray-500 text-center py-6 border border-dashed border-gray-300 rounded-lg">
            No tasks to display
          </li>
        ) : (
          sortedTodos.map((todo) => (
            <li 
              key={todo.id}
              className={cn(
                "flex items-start justify-between p-4 border rounded-lg group transition-all",
                todo.completed ? "bg-gray-50 border-gray-200" : "bg-white border-gray-200 hover:border-blue-300 hover:shadow-sm"
              )}
            >
              <div className="flex items-start gap-3 flex-1">
                <input
                  type="checkbox"
                  checked={todo.completed}
                  onChange={() => handleToggleTodo(todo.id)}
                  className="w-5 h-5 mt-1 text-blue-500 border-gray-300 rounded focus:ring-blue-500"
                  aria-label={`Mark "${todo.text}" as ${todo.completed ? "incomplete" : "complete"}`}
                />
                <div className="flex-1">
                  <p className={cn(
                    "text-gray-800 break-words",
                    todo.completed ? "text-gray-400 line-through" : ""
                  )}>
                    {todo.text}
                  </p>
                  <div className="flex flex-wrap gap-2 mt-2">
                    <span 
                      className={cn(
                        "text-xs px-2 py-1 rounded-full border",
                        getPriorityColor(todo.priority)
                      )}
                    >
                      {todo.priority}
                    </span>
                    
                    {todo.dueDate && (
                      <span 
                        className={cn(
                          "text-xs px-2 py-1 rounded-full",
                          todo.completed ? "bg-gray-100 text-gray-500 border-gray-200" :
                          isOverdue(todo.dueDate) ? "bg-red-50 text-red-600 border border-red-200" : 
                          "bg-blue-50 text-blue-600 border border-blue-200"
                        )}
                      >
                        {isOverdue(todo.dueDate) && !todo.completed ? "Overdue: " : "Due: "}
                        {formatDate(todo.dueDate)}
                      </span>
                    )}
                  </div>
                </div>
              </div>
              <div className="flex space-x-1">
                <button
                  onClick={() => handleEditClick(todo)}
                  className="text-blue-500 hover:text-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 rounded-full p-1 transition-opacity"
                  aria-label={`Edit "${todo.text}"`}
                  tabIndex={0}
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                    <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
                  </svg>
                </button>
                <button
                  onClick={() => handleDeleteTodo(todo.id)}
                  className="text-red-500 hover:text-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 rounded-full p-1 transition-opacity"
                  aria-label={`Delete "${todo.text}"`}
                  tabIndex={0}
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm4 0a1 1 0 112 0v6a1 1 0 11-2 0V8z" clipRule="evenodd" />
                  </svg>
                </button>
              </div>
            </li>
          ))
        )}
      </ul>
      
      {todos.length > 0 && (
        <div className="mt-6 flex justify-between text-sm text-gray-500">
          <div>
            {todos.filter(todo => !todo.completed).length} tasks left
          </div>
          {todos.some(todo => todo.completed) && (
            <button
              onClick={() => setTodos(todos.filter(todo => !todo.completed))}
              className="text-blue-500 hover:text-blue-700 hover:underline"
              aria-label="Clear completed tasks"
              tabIndex={0}
            >
              Clear completed
            </button>
          )}
        </div>
      )}

      {/* Edit Task Modal */}
      {isEditModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-md mx-4">
            <h2 className="text-xl font-semibold mb-4 text-gray-800">Edit Task</h2>
            
            <div className="space-y-4">
              <div>
                <label htmlFor="editText" className="block mb-1 text-sm text-gray-700">Task:</label>
                <input
                  id="editText"
                  type="text"
                  value={editText}
                  onChange={(e) => setEditText(e.target.value)}
                  onKeyDown={handleEditKeyDown}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  aria-label="Edit task text"
                />
              </div>
              
              <div>
                <label htmlFor="editPriority" className="block mb-1 text-sm text-gray-700">Priority:</label>
                <select
                  id="editPriority"
                  value={editPriority}
                  onChange={(e) => setEditPriority(e.target.value as Priority)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  aria-label="Edit task priority"
                >
                  <option value="low">Low</option>
                  <option value="medium">Medium</option>
                  <option value="high">High</option>
                </select>
              </div>
              
              <div>
                <label htmlFor="editDueDate" className="block mb-1 text-sm text-gray-700">Due Date:</label>
                <input
                  id="editDueDate"
                  type="date"
                  value={editDueDate}
                  onChange={(e) => setEditDueDate(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  aria-label="Edit task due date"
                />
              </div>
            </div>
            
            <div className="flex justify-end space-x-3 mt-6">
              <button
                onClick={closeEditModal}
                className="px-4 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 focus:outline-none focus:ring-2 focus:ring-gray-500"
                aria-label="Cancel editing task"
              >
                Cancel
              </button>
              <button
                onClick={handleUpdateTodo}
                className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
                aria-label="Save task changes"
              >
                Save
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
} 