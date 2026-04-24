import express from "express"
import { globalSearch } from "./search.controller.js"

const router = express.Router()

router.get("/", globalSearch)

export default router
