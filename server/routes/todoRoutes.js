// src/routes/todoRoutes.js
import express from "express";
import Todo from "../models/Todo.js";
import authMiddleware from "../middleware/authMiddleware.js";
const router = express.Router();

// Create a new TODO
router.post("/", authMiddleware, async (req, res) => {
  try {
    const { title, description } = req.body;
    const userId = req.user._id;
    if (!title || !description) {
      return res
        .status(400)
        .json({ message: "server: Title and description are required" });
    }
    const newTodo = new Todo({
      title,
      description,
      userId,
    });
    const savedTodo = await newTodo.save();
    res.status(201).json(savedTodo);
  } catch (error) {
    res.status(400).json({ message: "Error adding todo", error });
  }
});

// Get all TODOs
router.get("/", authMiddleware, async (req, res) => {
  try {
    const todos = await Todo.find({ userId: req.user._id, isCompleted: false });
    res.status(200).json(todos);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});
// Get a single TODO by ID
router.get("/:id", authMiddleware, async (req, res) => {
  try {
    const { id } = req.params;
    const todo = await Todo.findOne({ _id: id, userId: req.user._id });
    if (!todo) return res.status(404).json({ message: "TODO not found" });
    res.status(200).json(todo);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Update a TODO
router.put("/:id", authMiddleware, async (req, res) => {
  try {
    const { id } = req.params;
    const { title, description, isCompleted } = req.body;
    const updatedTodo = await Todo.findOneAndUpdate(
      { _id: id, userId: req.user._id },
      {
        title,
        description,
        isCompleted,
        completedOn: isCompleted ? new Date() : null,
      },
      { new: true }
    );

    if (!updatedTodo)
      return res.status(404).json({ message: "TODO not found" });
    res.status(200).json(updatedTodo);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Delete a TODO
router.delete("/:id", authMiddleware, async (req, res) => {
  try {
    const { id } = req.params;
    const deletedTodo = await Todo.findOneAndDelete({
      _id: id,
      userId: req.user._id,
    });
    if (!deletedTodo)
      return res.status(404).json({ message: "TODO not found" });
    res.status(200).json(deletedTodo);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get all completed TODOs

router.get("/complete/:userId", authMiddleware, async (req, res) => {
  try {
    const { userId } = req.params;

    // console.log("User ID from params:", userId);

    const completedTodos = await Todo.find({
      userId: userId,
      isCompleted: true,
    });

    // console.log("Completed Todos:", completedTodos);

    res.status(200).json(completedTodos);
  } catch (error) {
    console.error("Error fetching completed todos:", error.message);
    res.status(500).json({ error: error.message });
  }
});

// Get a specific completed TODO by ID
router.get("/complete/:id", authMiddleware, async (req, res) => {
  try {
    const { id } = req.params;
    const todo = await Todo.findOne({
      _id: id,
      userId: req.user._id,
      isCompleted: true,
    });

    if (!todo) {
      return res
        .status(404)
        .json({ message: "TODO not found or not completed" });
    }

    res.status(200).json(todo);
  } catch (error) {
    console.error("Error fetching specific completed todo:", error.message);
    res.status(500).json({ error: error.message });
  }
});

router.put("/complete/:id", authMiddleware, async (req, res) => {
  try {
    const { id } = req.params;
    const todo = await Todo.findOne({ _id: id, userId: req.user._id });
    if (!todo) return res.status(404).json({ message: "TODO not found" });

    // Update TODO to mark as completed
    todo.isCompleted = true;
    todo.completedOn = new Date();
    await todo.save();

    res.status(200).json(todo);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Delete a completed TODO
router.delete("/complete/:id", authMiddleware, async (req, res) => {
  try {
    const { id } = req.params;
    const deletedTodo = await Todo.findOneAndDelete({
      _id: id,
      userId: req.user._id,
    });
    if (!deletedTodo)
      return res.status(404).json({ message: "TODO not found" });
    res.status(200).json(deletedTodo);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

export default router;
