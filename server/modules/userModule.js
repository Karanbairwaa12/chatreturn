import mongoose from "mongoose"

const userModel = mongoose.Schema({
  username:{type:String, required:true},
  email:{type:String, required:true,unique:true},
  password:{type:String, required:true},
  isAdmin:{
      type:Boolean,
      default:false,
  },
  // pic: {
  //   type:String,
  //   default:"https://media.istockphoto.com/id/1300845620/vector/user-icon-flat-isolated-on-white-background-user-symbol-vector-illustration.jpg?s=612x612&w=0&k=20&c=yBeyba0hUkh14_jgv1OKqIH0CCSWU_4ckRkAoy2p73o="
  // },
  pic: {
    data: Buffer, // Store image binary data as a Buffer
    contentType: String, // Store the content type (e.g., 'image/jpeg', 'image/png')
     // Set a default value for the pic field
  },
  },
  {
    timestamps:true
  }
)

const User = mongoose.model("User",userModel)

export default User