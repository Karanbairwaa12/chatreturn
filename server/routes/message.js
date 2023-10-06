import express from "express";
import Chat from "../modules/chatModules.js";
import Message from "../modules/messageModule.js";
import bcrypt from 'bcrypt'
import jwt from "jsonwebtoken";
import mongoose from "mongoose";
import { verify, verifyTokenAndAuthorization } from "../verifyToken.js";
import User from "../modules/userModule.js";
const router = express.Router()
router.post('/',verify,async (req,res)=> {
    const {content, chatId} = req.body
    console.log("hi")
    console.log(req.user.id)
    if(!content || !chatId) {
      // console.log("invailid data pass in user")
      return res.sendStatus(400)
    }

    let newMessage = {
      sender:req.user.id,
      content:content,
      chat:chatId,
    }

    try {
      let message = await Message.create(newMessage)
      message = await message.populate("sender", "username pic")
      message = await message.populate("chat")
      // console.log("message",message)
      message = await User.populate(message,{
        path:"chat.users",
        select:"username pic email",
      })

      // console.log("message 2",message)

      await Chat.findByIdAndUpdate(req.body.chatId, {
        latestMessage:message,
      })
      // console.log("message 3",message)
      res.status(200).json(message)
    }catch(err) {
      res.status(400).json(err)
    }
})
router.get('/:chatId',verify,async (req,res)=> {
  try {
    // console.log("hi")
    const message = await Message.find({chat:req.params.chatId})
    .populate("sender","username pic email")
    .populate("chat")
    // console.log("hi two")
    res.status(200).json(message)
  }catch(err) {
    res.status(400).json(err)
  }
})
router.delete("/:messageId", verify,async (req,res)=> {
  try{
      const data =await Message.findByIdAndDelete(req.params.messageId)
      res.status(200).json(data)
  }catch(err) {
      res.status(500).json(err)
  }
})


export default router 