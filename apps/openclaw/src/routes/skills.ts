/**
 * Skill 路由映射
 *
 * @module routes/skills
 */

import { Hono } from "hono"
import { skillController as ctrl } from "../controllers/skill.js"

// ── /api/skills ──────────────────────────────────────────

export const skillRoutes = new Hono()

skillRoutes.get("/", ctrl.list)
skillRoutes.get("/:id", ctrl.getById)
skillRoutes.post("/", ctrl.create)
skillRoutes.put("/:id", ctrl.update)
skillRoutes.delete("/:id", ctrl.remove)

// ── /open/skills ─────────────────────────────────────────

export const skillOpenRoutes = new Hono()

skillOpenRoutes.get("/", ctrl.list)
skillOpenRoutes.get("/:id", ctrl.getById)
