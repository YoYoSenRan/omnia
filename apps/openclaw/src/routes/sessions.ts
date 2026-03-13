/**
 * Session 路由映射
 *
 * @module routes/sessions
 */

import { Hono } from "hono"
import { sessionController as ctrl } from "../controllers/session.js"

// ── /api/sessions ────────────────────────────────────────

export const sessionRoutes = new Hono()

sessionRoutes.get("/", ctrl.list)
sessionRoutes.get("/:id", ctrl.getById)
sessionRoutes.post("/", ctrl.create)
sessionRoutes.put("/:id/close", ctrl.close)

// ── /open/sessions ───────────────────────────────────────

export const sessionOpenRoutes = new Hono()

sessionOpenRoutes.get("/", ctrl.list)
sessionOpenRoutes.post("/", ctrl.createFromOpen)
