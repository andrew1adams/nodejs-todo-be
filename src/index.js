const express = require("express");
const cors = require("cors");

const { v4: uuidv4 } = require("uuid");

const app = express();

app.use(cors());
app.use(express.json());

const users = [];

// Middleware for verify if USER exists
function checksExistsUserAccount(req, res, next) {
  const { username } = req.headers;
  const user = users.find((user) => user.username === username);

  if (!user) return res.status(404).json({ error: "User not found!" });

  req.user = user;

  return next();
}

// Middleware for verify if USERNAME already exists
function checkUserAccountAlreadyExist(req, res, next) {
  const { username } = req.body;
  const user = users.find((user) => user.username === username);

  if (user) return res.status(400).json({ error: "User Already Exists!" });

  return next();
}

// Middleware for verify if TODO exists
function checkTodoExists(req, res, next) {
  const { id } = req.params;
  const { user } = req;

  const nonExistsTodo = user.todos.find((todo) => todo.id === id);

  if (!nonExistsTodo) return res.status(404).json({ error: "Task not found!" });

  return next();
}

// Create USER
app.post("/users", checkUserAccountAlreadyExist, (req, res) => {
  const { name, username } = req.body;
  const user = {
    name,
    username,
    id: uuidv4(),
    todos: [],
  };

  users.push(user);
  return res.status(201).json(user);
});

// Consult USERS
app.get("/users", (_, res) => {
  return res.json(users);
});

// Consult TODOS
app.get("/todos", checksExistsUserAccount, (req, res) => {
  const { user } = req;

  return res.json(user.todos);
});

// Create TODOS
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

// Update TODOS
app.put("/todos/:id", checksExistsUserAccount, checkTodoExists, (req, res) => {
  const { id } = req.params;
  const { title, deadline } = req.body;
  const { user } = req;

  // const newArrayWithUpdatedTodos = user.todos.map((todo) => {
  //   if (todo.id === id) {
  //     return {
  //       ...todo,
  //       title,
  //       deadline: new Date(deadline),
  //     };
  //   }

  //   return todo;
  // });

  // user.todos = newArrayWithUpdatedTodos;

  const todo = user.todos.find((todo) => todo.id === id);

  todo.title = title;
  todo.deadline = new Date(deadline);

  return res.json(todo);
});

// Partial Update TODOS
app.patch(
  "/todos/:id/done",
  checksExistsUserAccount,
  checkTodoExists,
  (req, res) => {
    const { id } = req.params;
    const { user } = req;

    // const newArrayWithUpdatedTodos = user.todos.map((todo) => {
    //   if (todo.id === id) {
    //     return {
    //       ...todo,
    //       done: !todo.done,
    //     };
    //   }

    //   return todo;
    // });

    // user.todos = newArrayWithUpdatedTodos;

    const todo = user.todos.find((todo) => todo.id === id);

    todo.done = !todo.done;

    return res.status(201).json(todo);
  }
);

// Delete TODOS
app.delete(
  "/todos/:id",
  checksExistsUserAccount,
  checkTodoExists,
  (req, res) => {
    const { id } = req.params;
    const { user } = req;

    const newArrayWithUpdatedTodos = user.todos.filter(
      (todo) => todo.id !== id && todo
    );

    user.todos = newArrayWithUpdatedTodos;

    return res.status(204).send();
  }
);

module.exports = app;
