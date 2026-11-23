import { Router } from "express";
import { groupController } from "../controllers/groupController.js";
import { requireAuth } from "../middlewares/authMiddleware.js";

const router = Router();

// Groups are user-specific; authentication is required for all operations
router.use(requireAuth);

router.get("/", groupController.getAll);
router.get("/:id", groupController.getById);
router.post("/", groupController.create);
router.put("/:id", groupController.update);
router.delete("/:id", groupController.remove);

export default router;
