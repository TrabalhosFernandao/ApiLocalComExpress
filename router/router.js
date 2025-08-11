import { Router } from "express";
import getAllData from "../controllers/controller.js";

const rota = Router();
rota.get('/', getAllData);

export default rota;
