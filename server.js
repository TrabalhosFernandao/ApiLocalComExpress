import express  from "express";
import  dataRoutes  from "./router/router.js";

const app = express();
const PORT = process.env.PORT || 3000;


app.use(express.json());

app.use('/', dataRoutes);

app.listen(PORT, () => {
    console.log("Servidor roteando em localhostt : 3000");
    
})