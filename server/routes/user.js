import express from "express";
import User from "../modules/userModule.js";
import bcrypt from 'bcrypt'
import jwt from "jsonwebtoken";
import { verify, verifyTokenAndAuthorization } from "../verifyToken.js";
const router = express.Router()
router.get('/',verify,async (req,res)=> {
  const keyword = req.query.search ? {
    $or: [
      {name : {$regex : req.query.search, $options : "i"}},
      {email: {$regex : req.query.search, $options : "i"}},
    ],
  }: {};
  // console.log(keyword)
  // console.log(req.user.id)
  const users = await User.find(keyword).find({_id: {$ne: req.user.id}})
  // console.log(users)
  res.send(users)
})

export default router 