import mongoose from 'mongoose'

const userSchema = new mongoose.Schema(
    {
    name: {
        type:string,
        required:true,
    },
    email:{
        type:string,
        required:true,
        unique:true
    },
    profileImage:{
        type:string,
        default:"",
    },
    clerkId: {
        type:string,
        required:true,
        unique:true
    },
 },
 {timestamps: true}
);

const User = mongoose.model("user",userSchema);

export default User