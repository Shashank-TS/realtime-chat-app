import express from 'express'
import authRouter from './src/routes/authRoutes.js';
import 'dotenv/config'
import connectDB from './src/config/db.js';
import cookieParser from 'cookie-parser';
import messageRouter from './src/routes/messageRoutes.js';
import cors from 'cors'
import { app, io, server } from './src/config/socket.js';
import path from 'path';

const __dirname = path.resolve();

app.use(express.json({limit:'10mb'}))
app.use(express.urlencoded({extended:true,limit:'10mb'}))
app.use(cookieParser())

app.use(cors({
    origin:process.env.FRONTEND_URI,
    methods:["GET","PUT","POST","DELETE"],
    allowedHeaders:["Content-Type"],
    credentials:true
}))

connectDB();

app.use('/api/auth', authRouter)
app.use('/api/messages', messageRouter)

if(process.env.NODE_ENV === "production"){
    app.use(express.static(path.join(__dirname,"../frontend/dist")));

    app.get("*",(req,res)=>{
        res.sendFile(path.join(__dirname,"../frontend","dist","index.html"))
    })
}

server.listen(5000, () => console.log("Server is running at http://localhost:5000"))