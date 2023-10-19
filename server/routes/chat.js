import express from "express";
import Chat from "../modules/chatModules.js";
import bcrypt from 'bcrypt'
import jwt from "jsonwebtoken";
import mongoose from "mongoose";
import { verify, verifyTokenAndAuthorization } from "../verifyToken.js";
import User from "../modules/userModule.js";
const router = express.Router()
router.post('/one',verify,async (req,res)=> {
    const {userId} = req.body
    // console.log(userId)
    if(!userId) {
      // console.log("userId param not sent with request")
      return res.sendStatus(400)
    }

    let isChat = await Chat.find({
      isGroupChat: false,
      users: { $all: [req.user.id, userId] }
    })
      .populate("users", "-password")
      .populate("latestMessage");

    isChat = await User.populate(isChat,{
      path:"latestMessage.sender",
      select: "name pic email",
    })

    if(isChat.length > 0) {
      res.send(isChat[0])
    }else {
      let chatData = {
        chatName :"sender",
        isGroupChat : false,
        users:[req.user.id,userId],
      }

      try {
        const createdChat = await Chat.create(chatData)
        const FullChat = await Chat.findOne({_id: createdChat._id})
        .populate("users","-password")
        console.log(FullChat)
        res.status(200).send(FullChat)
      }catch(error) {
        res.status(400)
        throw new Error(error.message)
      }
    }
})
router.get('/one',verify,async (req,res)=> {
  try{
    Chat.find({users:{$elemMatch : {$eq:req.user.id}}})
    .populate("users","-password")
    .populate("groupAdmin","-password")
    .populate("latestMessage")
    .sort({updateAt:-1})
    .then(async (results) => {
      results = await User.populate(results,{
        path:"latestMessage.sender",
        select:"name pic email"
      })

      res.status(200).send(results)
    })
  }catch(error) {
    res.status(400)
    throw new Error(error.message)
  }
})


router.post("/group", verify, async (req, res) => {
  if (!req.body.users || !req.body.chatName) {
    return res.status(400).send({ message: "Please fill all the fields" });
  }

  try {
    // Extract data from the request body
    const { chatName, users } = req.body;
    
    // Include the group admin's ID in the users array
    users.push(req.user.id);

    // Check if all user IDs in the `users` array exist in the User collection
    const userExistenceCheck = await User.find({ _id: { $in: users } });
    if (userExistenceCheck.length !== users.length) {
      return res.status(400).json({ message: "One or more users do not exist." });
    }

    // Create the new group chat
    const newChat = new Chat({
      chatName,
      isGroupChat: true,
      users, // Map user IDs to ObjectId
      groupAdmin: req.user.id, // Convert groupAdmin ID to ObjectId
    });

    // Save the chat to the database
    const savedChat = await newChat.save();

    // Populate the `users` field with user objects
    const populatedChat = await Chat.findById(savedChat._id)
      .populate({ path: "users", select: "-password" }) // Populate users excluding password
      .populate({ path: "groupAdmin", select: "-password" }); // Populate groupAdmin excluding password

    return res.status(201).json(populatedChat);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Internal server error" });
  }
});




router.get("/group/:chatId", verify, async (req, res) => {
  try {
    const chatId = req.params.chatId;

    // Check if the chat with the provided chatId exists
    const chat = await Chat.findById(chatId)
      .populate({ path: "users", select: "-password" })
      .populate({ path: "groupAdmin", select: "-password" });

    if (!chat) {
      return res.status(404).json({ message: "Chat not found." });
    }

    // Check if the requesting user is a member of the chat
    if (!chat.users.some(user => user._id.toString() === req.user.id)) {
      return res.status(403).json({ message: "You are not authorized to access this chat." });
    }

    return res.status(200).json(chat);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Internal server error" });
  }
});

router.put("/group/rename",verify,async (req,res)=> {
  const {chatId,chatName} = req.body
  
  try {
    const updateChat = await  Chat.findByIdAndUpdate(chatId,{
      chatName,
    },
    {new:true}
    )
    .populate("users","-password")
    .populate("groupAdmin","-password")
    // console.log("hi",updateChat)
    res.status(200).json(updateChat)
  }catch(err){
      res.status(500).json(err)
  }
})

router.put("/group/adduser", verify, async (req, res) => {
  try {
    const { users, chatId } = req.body;

    // Check if the chat with the provided chatId exists
    const chat = await Chat.findById(chatId);
    if (!chat) {
      return res.status(404).json({ message: "Chat not found." });
    }

    // Check if the requesting user is the group admin
    if (chat.groupAdmin.toString() !== req.user.id) {
      return res.status(403).json({ message: "You are not authorized to update this group." });
    }

    // Filter out users who are already in the group
    const usersToAdd = users.filter((userId) => !chat.users.includes(userId));

    // Check if all user IDs in the `usersToAdd` array exist in the User collection
    const userExistenceCheck = await User.find({ _id: { $in: usersToAdd } });
    if (userExistenceCheck.length !== usersToAdd.length) {
      return res.status(400).json({ message: "One or more users do not exist." });
    }

    // Add the new users to the group
    chat.users = [...chat.users, ...usersToAdd];

    // Save the updated chat
    await chat.save();

    // Populate the updated group chat with user objects
    const populatedChat = await Chat.findById(chatId)
      .populate({ path: "users", select: "-password" }) // Populate users excluding password
      .populate({ path: "groupAdmin", select: "-password" }); // Populate groupAdmin excluding password

    return res.status(200).json(populatedChat);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Internal server error" });
  }
});

router.put("/group/remove", verify, async (req, res) => {
  try {
    const { users, chatId } = req.body;

    // Check if the chat with the provided chatId exists
    const chat = await Chat.findById(chatId);
    if (!chat) {
      return res.status(404).json({ message: "Chat not found." });
    }

    // Check if the requesting user is the group admin
    if (chat.groupAdmin.toString() !== req.user.id) {
      return res.status(403).json({ message: "You are not authorized to update this group." });
    }

    // Ensure that the group admin is not removed
    if (users.includes(chat.groupAdmin.toString())) {
      return res.status(400).json({ message: "You cannot remove the group admin." });
    }

    // Filter out users who are not in the group
    const usersToRemove = users.filter((userId) => chat.users.includes(userId));
    // console.log(usersToRemove)
    // Check if any of the users to be removed are not in the group
    if (usersToRemove.length !== users.length) {
      return res.status(400).json({ message: "One or more users are not in the group." });
    }

    // Update the chat to remove the specified users
    // console.log(chat.users);
    chat.users = chat.users.filter((userId) => !usersToRemove.includes(userId.toString()));
    // console.log(chat.users);
    // Save the updated chat
    await chat.save();

    // Populate the updated group chat with user objects
    const populatedChat = await Chat.findById(chatId)
      .populate({ path: "users", select: "-password" })
      .populate({ path: "groupAdmin", select: "-password" });

    return res.status(200).json(populatedChat);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Internal server error" });
  }
});
export default router 