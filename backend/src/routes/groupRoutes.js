import { Router } from "express";
import { groupController } from "../controllers/groupController.js";

const router = Router();

router.get("/", groupController.getAll);
router.get("/:id", groupController.getById);
router.post("/", groupController.create);
router.put("/:id", groupController.update);
router.delete("/:id", groupController.remove);

export default router;

