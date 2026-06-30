import { Router } from "express";
import gstrController from "../controllers/GSTRController.js";
import authenticate from "../middleware/authMiddleware.js";

const router = Router();

router.use(authenticate);

router.get("/gstr-1", gstrController.getGSTR1);
router.get("/gstr-3b", gstrController.getGSTR3B);

export default router;
