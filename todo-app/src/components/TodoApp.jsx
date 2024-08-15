import React, { useState, useEffect } from "react";
import axios from "axios";
import { jwtDecode } from "jwt-decode";
import { AiOutlineDelete, AiOutlineEdit } from "react-icons/ai";
import { BsCheckLg } from "react-icons/bs";
import { DragDropContext, Droppable, Draggable } from "react-beautiful-dnd";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import "./TodoApp.css";
import { useAuth } from "../context/AuthContext";

// const API_URL = "http://localhost:5000/api/todos";

function TodoApp() {
  const { authState } = useAuth();
  const [isCompleteScreen, setIsCompleteScreen] = useState(false);
  const [allTodos, setTodos] = useState([]);
  const [newTitle, setNewTitle] = useState("");
  const [newDescription, setNewDescription] = useState("");
  const [completedTodos, setCompletedTodos] = useState([]);
  const [currentEditId, setCurrentEditId] = useState(null);
  const [currentEditedItem, setCurrentEditedItem] = useState({});
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    if (authState.isAuthenticated && authState.user) {
      const token = localStorage.getItem("token");
      const decodedToken = jwtDecode(token);
      const userId = decodedToken.id;
      if (userId) {
        fetchTodos();
        fetchCompletedTodos(userId);
      }
    }
  }, [authState]);

  // Fetch all todos
  const fetchTodos = async () => {
    try {
      const token = localStorage.getItem("token");
      const response = await axios.get(
        `${import.meta.env.VITE_API_URL}/api/todos`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      setTodos(response.data);
    } catch (error) {
      console.error("Error fetching todos:", error);
    }
  };

  // Fetch completed todos
  const fetchCompletedTodos = async (userId) => {
    if (!userId) {
      console.error("User ID is required to fetch completed todos.");
      return;
    }
    try {
      const token = localStorage.getItem("token");
      const response = await axios.get(
        `${import.meta.env.VITE_API_URL}/api/todos/complete/${userId}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      setCompletedTodos(response.data);
    } catch (error) {
      console.error("Error fetching completed todos:", error);
    }
  };

  // Add a new todo
  const handleAddTodo = async () => {
    if (!newTitle.trim() || !newDescription.trim()) {
      toast.error("Title and description are required");
      return;
    }
    try {
      const token = localStorage.getItem("token");
      const response = await axios.post(
        `${import.meta.env.VITE_API_URL}/api/todos`,
        { title: newTitle, description: newDescription },
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );
      setTodos([...allTodos, response.data]);
      setNewTitle("");
      setNewDescription("");
      toast.success("Todo added successfully");
    } catch (error) {
      console.error("Error adding todo:", error.response);
      toast.error("Error adding todo");
    }
  };

  // Delete a todo
  const handleDeleteTodo = async (id) => {
    try {
      await axios.delete(`${import.meta.env.VITE_API_URL}/api/todos/${id}`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });
      setTodos(allTodos.filter((todo) => todo._id !== id));
      toast.success("Todo deleted successfully");
    } catch (error) {
      console.error("Error deleting todo:", error);
      toast.error("Error deleting todo");
    }
  };

  // Mark a todo as completed
  const handleComplete = async (id) => {
    try {
      await axios.put(
        `${import.meta.env.VITE_API_URL}/api/todos/${id}`,
        { isCompleted: true },
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );
      fetchTodos();
      if (authState.user) {
        const token = localStorage.getItem("token");
        const decodedToken = jwtDecode(token);
        const userId = decodedToken.id;
        fetchCompletedTodos(userId);
      }
      toast.success("Todo marked as completed");
    } catch (error) {
      console.error("Error completing todo:", error);
      toast.error("Error completing todo");
    }
  };

  // Delete a completed todo
  const handleDeleteCompletedTodo = async (id) => {
    try {
      await axios.delete(
        `${import.meta.env.VITE_API_URL}/api/todos/complete/${id}`,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );
      setCompletedTodos(completedTodos.filter((todo) => todo._id !== id));
      toast.success("Completed todo deleted successfully");
    } catch (error) {
      console.error("Error deleting completed todo:", error);
      toast.error("Error deleting completed todo");
    }
  };

  // Edit a todo
  const handleEdit = (item) => {
    setCurrentEditId(item._id);
    setCurrentEditedItem(item);
  };

  // Update title of the todo
  const handleUpdateTitle = (value) => {
    setCurrentEditedItem((prev) => ({
      ...prev,
      title: value,
    }));
  };

  // Update description of the todo
  const handleUpdateDescription = (value) => {
    setCurrentEditedItem((prev) => ({
      ...prev,
      description: value,
    }));
  };

  // Update todo
  const handleUpdateToDo = async () => {
    try {
      const response = await axios.put(
        `${import.meta.env.VITE_API_URL}/api/todos/${currentEditId}`,
        currentEditedItem,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );
      setTodos(
        allTodos.map((todo) =>
          todo._id === currentEditId ? response.data : todo
        )
      );
      setCurrentEditId(null);
      setCurrentEditedItem({});
      toast.success("Todo updated successfully");
    } catch (error) {
      console.error("Error updating todo:", error);
      toast.error("Error updating todo");
    }
  };

  // Filter todos based on search query
  const filteredTodos = allTodos.filter(
    (todo) =>
      todo.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      todo.description.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Filter completed todos based on search query
  const filteredCompletedTodos = completedTodos.filter(
    (todo) =>
      todo.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      todo.description.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Handle drag and drop
  const onDragEnd = (result) => {
    const { source, destination } = result;

    if (!destination) return;

    const items = Array.from(filteredTodos);
    const [movedItem] = items.splice(source.index, 1);
    items.splice(destination.index, 0, movedItem);

    setTodos(items);
  };

  return (
    <div className="todo-app">
      <h1>My Todos</h1>

      <div className="todo-wrapper">
        <div className="todo-input">
          <div className="todo-input-item">
            <label>Title</label>
            <input
              type="text"
              value={newTitle}
              onChange={(e) => setNewTitle(e.target.value)}
              placeholder="What's the task title?"
            />
          </div>
          <div className="todo-input-item">
            <label>Description</label>
            <input
              type="text"
              value={newDescription}
              onChange={(e) => setNewDescription(e.target.value)}
              placeholder="What's the task description?"
            />
          </div>
          <div className="todo-input-item">
            <button
              type="button"
              onClick={handleAddTodo}
              className="primaryBtn"
            >
              Add
            </button>
          </div>
        </div>
        <div className="todo-search">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search todos..."
          />
        </div>
        <div className="btn-area">
          <button
            className={`secondaryBtn ${!isCompleteScreen && "active"}`}
            onClick={() => setIsCompleteScreen(false)}
          >
            Todo
          </button>
          <button
            className={`secondaryBtn ${isCompleteScreen && "active"}`}
            onClick={() => setIsCompleteScreen(true)}
          >
            Completed
          </button>
        </div>
        {isCompleteScreen ? (
          <div className="completed-todo-list">
            <DragDropContext onDragEnd={onDragEnd}>
              <Droppable droppableId="completed-todos">
                {(provided) => (
                  <ul
                    {...provided.droppableProps}
                    ref={provided.innerRef}
                    className="todo-list"
                  >
                    {filteredCompletedTodos.map((todo, index) => (
                      <Draggable
                        key={todo._id}
                        draggableId={todo._id}
                        index={index}
                      >
                        {(provided) => (
                          <li
                            className="todo-item completed-todo-item"
                            ref={provided.innerRef}
                            {...provided.draggableProps}
                            {...provided.dragHandleProps}
                          >
                            <div className="todo-item-content">
                              <div className="todo-item-details">
                                <h3>{todo.title}</h3>
                                <p>{todo.description}</p>
                              </div>
                              <div className="todo-item-actions">
                                <AiOutlineDelete
                                  className="action-icon"
                                  onClick={() =>
                                    handleDeleteCompletedTodo(todo._id)
                                  }
                                />
                              </div>
                            </div>
                          </li>
                        )}
                      </Draggable>
                    ))}
                    {provided.placeholder}
                  </ul>
                )}
              </Droppable>
            </DragDropContext>
          </div>
        ) : (
          <div className="todo-list">
            <DragDropContext onDragEnd={onDragEnd}>
              <Droppable droppableId="todos">
                {(provided) => (
                  <ul
                    {...provided.droppableProps}
                    ref={provided.innerRef}
                    className="todo-list"
                  >
                    {filteredTodos.map((todo, index) => (
                      <Draggable
                        key={todo._id}
                        draggableId={todo._id}
                        index={index}
                      >
                        {(provided) => (
                          <li
                            className="todo-item"
                            ref={provided.innerRef}
                            {...provided.draggableProps}
                            {...provided.dragHandleProps}
                          >
                            <div className="todo-item-content">
                              <div className="todo-item-details">
                                {currentEditId === todo._id ? (
                                  <>
                                    <input
                                      type="text"
                                      value={currentEditedItem.title}
                                      onChange={(e) =>
                                        handleUpdateTitle(e.target.value)
                                      }
                                    />
                                    <input
                                      type="text"
                                      value={currentEditedItem.description}
                                      onChange={(e) =>
                                        handleUpdateDescription(e.target.value)
                                      }
                                    />
                                    <button
                                      className="primaryBtn"
                                      onClick={handleUpdateToDo}
                                    >
                                      Save
                                    </button>
                                  </>
                                ) : (
                                  <>
                                    <h3>{todo.title}</h3>
                                    <p>{todo.description}</p>
                                  </>
                                )}
                              </div>
                              <div className="todo-item-actions">
                                <BsCheckLg
                                  className="action-icon"
                                  onClick={() => handleComplete(todo._id)}
                                />
                                <AiOutlineEdit
                                  className="action-icon"
                                  onClick={() => handleEdit(todo)}
                                />
                                <AiOutlineDelete
                                  className="action-icon"
                                  onClick={() => handleDeleteTodo(todo._id)}
                                />
                              </div>
                            </div>
                          </li>
                        )}
                      </Draggable>
                    ))}
                    {provided.placeholder}
                  </ul>
                )}
              </Droppable>
            </DragDropContext>
          </div>
        )}
      </div>
      <ToastContainer />
    </div>
  );
}

export default TodoApp;
