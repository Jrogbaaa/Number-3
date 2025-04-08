"use client";

import { useState } from "react";
import { cn } from "../lib/utils";

type TodoItem = {
  id: string;
  text: string;
  completed: boolean;
};

type FilterStatus = "all" | "active" | "completed";

export default function Todo() {
  const [todos, setTodos] = useState<TodoItem[]>([]);
  const [inputValue, setInputValue] = useState("");
  const [filter, setFilter] = useState<FilterStatus>("all");
  
  const filteredTodos = todos.filter((todo) => {
    if (filter === "all") return true;
    if (filter === "active") return !todo.completed;
    if (filter === "completed") return todo.completed;
    return true;
  });
  
  const handleAddTodo = () => {
    if (!inputValue.trim()) return;
    
    const newTodo: TodoItem = {
      id: crypto.randomUUID(),
      text: inputValue.trim(),
      completed: false
    };
    
    setTodos([...todos, newTodo]);
    setInputValue("");
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
  
  return (
    <div className="w-full max-w-md mx-auto p-6 bg-white rounded-lg shadow-md">
      <h1 className="text-2xl font-bold mb-4 text-gray-800">Todo App</h1>
      
      <div className="flex mb-4">
        <input
          type="text"
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Add a new todo..."
          className="flex-1 px-4 py-2 border border-gray-300 rounded-l-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          aria-label="Add a new todo"
        />
        <button
          onClick={handleAddTodo}
          className="px-4 py-2 bg-blue-500 text-white rounded-r-lg hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
          aria-label="Add todo"
        >
          Add
        </button>
      </div>
      
      <div className="flex justify-center space-x-2 mb-4">
        <button
          onClick={() => setFilter("all")}
          className={cn(
            "px-3 py-1 rounded-md",
            filter === "all" ? "bg-blue-500 text-white" : "bg-gray-200 text-gray-700 hover:bg-gray-300"
          )}
          aria-pressed={filter === "all"}
          aria-label="Show all todos"
        >
          All
        </button>
        <button
          onClick={() => setFilter("active")}
          className={cn(
            "px-3 py-1 rounded-md",
            filter === "active" ? "bg-blue-500 text-white" : "bg-gray-200 text-gray-700 hover:bg-gray-300"
          )}
          aria-pressed={filter === "active"}
          aria-label="Show active todos"
        >
          Active
        </button>
        <button
          onClick={() => setFilter("completed")}
          className={cn(
            "px-3 py-1 rounded-md",
            filter === "completed" ? "bg-blue-500 text-white" : "bg-gray-200 text-gray-700 hover:bg-gray-300"
          )}
          aria-pressed={filter === "completed"}
          aria-label="Show completed todos"
        >
          Completed
        </button>
      </div>
      
      <ul className="space-y-2">
        {filteredTodos.length === 0 ? (
          <li className="text-gray-500 text-center py-2">No todos to display</li>
        ) : (
          filteredTodos.map((todo) => (
            <li 
              key={todo.id}
              className="flex items-center justify-between p-3 border border-gray-200 rounded-lg group hover:bg-gray-50"
            >
              <div className="flex items-center">
                <input
                  type="checkbox"
                  checked={todo.completed}
                  onChange={() => handleToggleTodo(todo.id)}
                  className="w-5 h-5 text-blue-500 border-gray-300 rounded focus:ring-blue-500"
                  aria-label={`Mark "${todo.text}" as ${todo.completed ? "incomplete" : "complete"}`}
                />
                <span 
                  className={cn(
                    "ml-3",
                    todo.completed ? "text-gray-400 line-through" : "text-gray-700"
                  )}
                >
                  {todo.text}
                </span>
              </div>
              <button
                onClick={() => handleDeleteTodo(todo.id)}
                className="text-red-500 hover:text-red-700 focus:outline-none opacity-0 group-hover:opacity-100 transition-opacity"
                aria-label={`Delete "${todo.text}"`}
                tabIndex={0}
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm4 0a1 1 0 112 0v6a1 1 0 11-2 0V8z" clipRule="evenodd" />
                </svg>
              </button>
            </li>
          ))
        )}
      </ul>
      
      {todos.length > 0 && (
        <div className="mt-4 text-sm text-gray-500">
          {todos.filter(todo => !todo.completed).length} items left
        </div>
      )}
    </div>
  );
} 