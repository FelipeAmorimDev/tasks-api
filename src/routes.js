import { randomUUID } from "node:crypto";
import { Database } from "./database.js";
import { buildRouteParams } from "./utils/build-route-params.js";

const database = new Database();

function createBodyObjWithoutUndefined(obj) {
  const bodyWithoutUndefined = Object.entries(obj)
    .filter(([key, value]) => value !== undefined)
    .reduce((acc, data) => {
      const [key, value] = data;
      acc[key] = value;

      return acc;
    }, {});

  return bodyWithoutUndefined
}

export const routes = [
  {
    method: "GET",
    path: buildRouteParams("/tasks"),
    handle(req, res) {
      const { search } = req.query;
      const tasks = database.select(
        "tasks",
        search
          ? {
              title: search,
              description: search,
            }
          : null
      );
      return res.end(JSON.stringify(tasks));
    },
  },
  {
    method: "POST",
    path: buildRouteParams("/tasks"),
    handle(req, res) {
      const { title, description } = req.body;

      const task = {
        id: randomUUID(),
        title,
        description,
        completed_at: null,
        created_at: new Date(),
        updated_at: new Date(),
      };

      database.insert("tasks", task);

      return res.writeHead(201).end(JSON.stringify(task));
    },
  },
  {
    method: "DELETE",
    path: buildRouteParams("/tasks/:id"),
    handle(req, res) {
      const { id } = req.params;

      const [task] = database.select("tasks", { id });

      if (!task) {
        return res.writeHead("404").end();
      }

      database.delete("tasks", id);

      return res.writeHead(204).end("");
    },
  },
  {
    method: "PUT",
    path: buildRouteParams("/tasks/:id"),
    handle(req, res) {
      const { id } = req.params;
      const { title, description } = req.body;

      const selectTaskByID = database.select("tasks", { id });

      const [task] = selectTaskByID;

      if (!task) {
        return res.writeHead("404").end();
      }

      if (!title && !description) {
        return res
          .writeHead("400")
          .end(
            JSON.stringify({ message: "title or description are required" })
          );
      }

      const taskData = {
        title,
        description,
        updated_at: new Date(),
      };

      const taskDataWithoutUndefined = createBodyObjWithoutUndefined(taskData);

      database.update("tasks", id, taskDataWithoutUndefined);

      return res.writeHead(204).end();
    },
  },
  {
    method: 'PATCH',
    path: buildRouteParams('/tasks/:id/complete'),
    handle(req,res) {
      const { id } = req.params
      const selectTaskByID = database.select('tasks', {id})
      
      const [task] = selectTaskByID

      if(!task) {
        return res.writeHead(404).end()
      }

      const isTaskComplete = Boolean(task.completed_at)
      
      const body = {
        completed_at: isTaskComplete ? null : new Date()
      }
     
      database.update("tasks", id, body)

      return res.writeHead(204).end()
    }
  },
];
