import { Application, Router } from "express";
import {
  getTollPrices,
  addToll,
  updateToll,
  listTolls,
  getTollById,
} from "../controllers/tolls.controller";

const router = Router();

router.get("/", listTolls as Application);

router.get("/:id", getTollById as Application);

router.post("/price", getTollPrices as Application);

router.post("/", addToll as Application);

router.patch("/:id", updateToll as Application);

export default router;
