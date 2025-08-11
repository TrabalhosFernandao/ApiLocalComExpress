import  Router  from "express";
import  getAllData  from "../controllers/controller.js";

const rota = Router();

//Rota top demais
rota.get('/', getAllData);
export default rota;