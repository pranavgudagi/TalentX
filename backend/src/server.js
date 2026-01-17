import express from "express"
import { ENV } from "./lib/env.js"
import path from "path"
import { connectDB } from "./lib/db.js"
const app=express();

const __dirname=path.resolve()

app.get("/health",(req,res)=>{
    res.status(200).json({msg:"api is running correctly"});
})
app.get("/books",(req,res)=>{
    res.status(200).json({msg:"this is the books endpoint"});
})

if(ENV.NODE_ENV === "production"){
    app.use(express.static(path.join(__dirname,"../frontend/dist")));

    app.get("/{*any}",(res,req)=>{
        res.sendFile(path.join(__dirname,"../frontend","dist","index.html"));
    })
} 

app.listen(ENV.PORT,()=> {
    console.log("server is running on port",ENV.PORT)
    connectDB()
});

const startServer = async () => {
    try{
        await connectDB();
        app.listen(ENV.PORT, () => {
            console.log("Server is running on ports:",ENV.PORT);
        });
    }catch(error){
        console.error("Something went wrong",error);
    }
}

startServer();