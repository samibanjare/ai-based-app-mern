import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
  username: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true,
    unique: true,
  },
  password: {
    type: String,
    required :true,
  },
  profileImage:{
    type: String,
    default: null
  },
  terms: {
    type : Boolean,
    required: true,
  }
}, { timestamps: true });

//Hash password before saving
// UserSchema.pre('save', async function(next){
//     if (!this.isModified('password')){
//         next();
//     }
//     const salt = await bcrypt.genSalt(10);
//     this.password = await bcrypt.genSalt(this.password, salt);
// });

//compare password method
// UserSchema.methods.matchPassword = async function(enteredPassword){
//     return await bcrypt.compare(enteredPassword, this.password);
// }

const User = mongoose.model("User", userSchema);
export default User;
