const express = require("express");
const cors = require("cors");

const { v4: uuidv4 } = require("uuid");

const app = express();

app.use(cors());
app.use(express.json());

const users = [];

function checksExistsUserAccount(req, res, next) {
  const { username } = req.headers;
  const user = users.find((user) => user.username === username);

  if (!username) return res.status(400).json({ error: "User not found!" });

  req.user = user;

  return next();
}

// User create
app.post("/users", (req, res) => {
  const { name, username } = req.body;
  const user = {
    name,
    username,
    id: uuidv4(),
    todos: [],
  };

  users.push(user);
  console.log(users);
  return res.status(201).send();
});

app.get("/todos", checksExistsUserAccount, (req, res) => {
  const { user } = req;

  return res.json(user.todos);
});

app.post("/todos", checksExistsUserAccount, (req, res) => {
  const { title, deadline } = req.body;
  const { user } = req;

  const todo = {
    id: uuidv4(),
    title,
    done: false,
    deadline: new Date(deadline),
    created_at: "2021-02-22T00:00:00.000Z",
  };

  user.todos.push(todo);

  return res.status(201).json(todo);
});

app.put("/todos/:id", checksExistsUserAccount, (req, res) => {
  const { id } = req.params;
  const { title, deadline } = req.body;
  const { user } = req;

  const newArrayWithUpdatedTask = user.todos.map((todo) => {
    if (todo.id === id) {
      return {
        ...todo,
        title,
        deadline: new Date(deadline),
      };
    }

    return todo;
  });

  user.todos = newArrayWithUpdatedTask;

  return res.status(201).send();
});

app.patch("/todos/:id/done", checksExistsUserAccount, (req, res) => {
  // Complete aqui
});

app.delete("/todos/:id", checksExistsUserAccount, (req, res) => {
  // Complete aqui
});

module.exports = app;
