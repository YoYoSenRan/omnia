/**
 * Task 路由映射
 *
 * @module routes/tasks
 */

import { Hono } from "hono"
import { taskController as ctrl } from "../controllers/task.js"

// ── /api/tasks ───────────────────────────────────────────

export const taskRoutes = new Hono()

taskRoutes.get("/", ctrl.list)
taskRoutes.get("/:id", ctrl.getById)
taskRoutes.post("/", ctrl.create)
taskRoutes.put("/:id", ctrl.update)
taskRoutes.delete("/:id", ctrl.remove)

// ── /open/tasks ──────────────────────────────────────────

export const taskOpenRoutes = new Hono()

taskOpenRoutes.get("/", ctrl.list)
taskOpenRoutes.get("/:id", ctrl.getById)
taskOpenRoutes.post("/", ctrl.createFromOpen)
