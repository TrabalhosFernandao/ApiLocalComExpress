import sampleData from "../data/sampleData.js";

 const getAllData = (req, res) =>{
    console.log("F");
    res.json(sampleData);
    
}

export default getAllData;