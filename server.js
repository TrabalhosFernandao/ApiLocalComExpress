import express  from "express";
import  dataRoutes  from "./router/router.js";
import cors from "cors";

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

app.use('/', dataRoutes);

app.listen(PORT, () => {
    console.log("Servidor roteando em localhostt : 3000");
    
})