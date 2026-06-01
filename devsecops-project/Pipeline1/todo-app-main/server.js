const express = require("express");
const path = require("path");
const bodyParser = require("body-parser");
const { getAll, getById, add, remove, toggleDone } = require("./public/app");

const app = express();
const PORT = 8000;

app.use(bodyParser.json());
app.use(express.static(path.join(__dirname, "public")));

// ===== Routes =====

// GET all tasks
app.get("/tasks", async (req, res) => {
  const tasks = await getAll();
  res.json(tasks);
});

// POST add task
app.post("/tasks", async (req, res) => {
  const task = await add(req.body.title);
  res.status(201).json(task);
});

// DELETE a task
app.delete("/tasks/:id", async (req, res) => {
  const tasks = await remove(parseInt(req.params.id));
  res.json(tasks);
});

// PATCH toggle done
app.patch("/tasks/:id/toggle", async (req, res) => {
  const task = await toggleDone(parseInt(req.params.id));
  res.json(task);
});

app.listen(PORT, () => console.log(`Server running at http://localhost:${PORT}`));
