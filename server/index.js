import express from "express";
import mongoose from "mongoose";
import dotenv from 'dotenv'
dotenv.config()
import auth from './routes/auth.js'
import user from './routes/user.js'
import chat from './routes/chat.js'
import message from './routes/message.js'
import { Server } from "socket.io";
import http from 'http'
import cors from 'cors'
import connectDb from "./db/connectdb.js";
const app = express()


const corsOptions = {
  origin: 'http://localhost:3000', // Replace with your front-end server's URL
  methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
  credentials: true,
};



const server = http.createServer(app)
const DATABASE_URL = process.env.DATABASE_URL || "mongodb://localhost:27017"
const port = process.env.PORT 
// mongoose.connect(
//     process.env.MONGO
// )
// .then(()=> console.log("DB Connection Successfull"))
// .catch((err)=> {
//     console.log(err)
// })

connectDb(DATABASE_URL)
// const corsOptions = {
//   origin: 'http://localhost:3000', // Replace with your frontend URL
//   methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
//   credentials: true,
// };

app.use(cors(corsOptions));
// app.use(cors());
app.use('/public',express.static('public'))
app.use(express.json())

app.use('/user',auth)
app.use('/user',user)
app.use('/chat',chat)
app.use('/message',message)



app.use((req, res, next) => {
  const error = new Error('Route not found');
  error.status = 404;
  next(error);
});

// Generic error handling middleware
app.use((err, req, res, next) => {
  // Set a default error status code if it's not already set
  const status = err.status || 500;

  // Send an error response to the client
  res.status(status).json({
    error: {
      message: err.message || 'Internal Server Error',
    },
  });
});

const io = new Server(server,{
  cors:{
    origin:"http://localhost:3000",
    methods:["GET","POST"],
  }
})

io.on("connection",(socket)=> {
  console.log("connected User :",socket.id)
  socket.on("join_room",(data)=> {
    socket.join(data)
    console.log(`User with Id: ${socket.id} joined room: ${data} `)
  })

  socket.on("new_message",(data)=> {
    console.log(data)
    socket.to(data.chat._id).emit("receive_message",data)
    // let chat = data.chat
    // if(!chat.users) return console.log("chat users are not defined")

    // chat.users.forEach(user => {
    //   if(user._id === data.sender._id) return 

    //   socket.in(user._id).emit("message_recived",data)
    // })
  })
  socket.on("new_group_message", (data) => {
  console.log("Received new_group_message:", data);
  const chatRoomId = data.chatId;
  socket.to(data.chat._id).emit("new_group_message",data)
});
  socket.on("disconnect",()=> {
    console.log("User Disconnected",socket.id)
  })
})
app.use((req, res, next) => {
  res.header("Referrer-Policy", "strict-origin-when-cross-origin");
  next();
});
app.listen(port,()=>{
  console.log(`request send ${port}`)
})

io.listen(9002)
