import User from "../models/user.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

//Generate JWT token
// const generateToken =(id)=>{
//     return jwt.sign({id}, process.env.JWT_SECRET_KEY,{
//         expiresIn: process.env.JWT_EXPIRE || "7d",
//     })
// }

// Register controller
export const registerUser = async (req, res) => {
    try {
        // Extract user info from request body
        const { username, email, password, terms } = req.body;

        // Check if username or email already exists
        const existingUser = await User.findOne({ $or: [{ username }, { email }] });
        if (existingUser) {
            return res.status(400).json({
                success: false,
                message: 'User already exists with either the same username or email. Please try with a different username or email',
            });
        }

        // Hash password
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        // Create new user
        const newUser = new User({
            username,
            email,
            password: hashedPassword,
            terms,
        });

        await newUser.save();

        res.status(201).json({
            success: true,
            message: 'User registered successfully',
        });

    } catch (error) {
        console.error(error);
        res.status(500).json({
            success: false,
            message: 'Some error occurred! Please try again.',
        });
    }
};

// Login Controller
export const loginUser = async (req, res) => {
    try {
        // Check if body exists
        if (!req.body || Object.keys(req.body).length === 0) {
            return res.status(400).json({
                success: false,
                message: "Request body is empty",
            });
        }

        const { email, password } = req.body;

        // Validate input
        if (!email || !password) {
            return res.status(400).json({
                success: false,
                message: "email and password are required",
                statusCode: 400,
            });
        }

        // Find user
        const user = await User.findOne({ email });

        if (!user) {
            return res.status(401).json({
                success: false,
                message: "User doesn't exist",
                statusCode: 401
            });
        }

        // Compare password
        const isPasswordMatch = await bcrypt.compare(password, user.password);

        if (!isPasswordMatch) {
            return res.status(400).json({
                success: false,
                message: "Invalid credentials",
            });
        }

        // Create JWT token
        const accessToken = jwt.sign(
            {
                userId: user._id,
                username: user.username,
            },
            process.env.JWT_SECRET_KEY,
            { expiresIn: "7d" }
        );

        return res.status(200).json({
            success: true,
            message: "Logged in successfully",
            accessToken,
            user: {
                userId: user._id,
                username: user.username,
                email: user.email,
             }
        });

    } catch (error) {
        console.log(error);
        res.status(500).json({
            success: false,
            message: "Some error occurred! Please try again",
        });
    }
};

//change password
export const changePassword = async(req,res)=>{
    try{
        const userId = req.userInfo.userId;

        //extract old and new password
        const {oldPassword, newPassword} = req.body;

        //find the current user
        const user = await User.findById(userId);

        if(!user){
            return res.status(400).json({
                success: false,
                message: 'User not found'
            })
        }
        //check if the old password matches
        const isPassworldMatch = await bcrypt.compare(oldPassword, user.password);

        if(!isPassworldMatch){
            return res.status(400).json({
                success: false,
                message: 'Old password is not correct! Please try again'
            })
        }

        //hash the new password here
        const salt = await bcrypt.genSalt(10);
        const newHashedPassword = await bcrypt.hash(newPassword, salt);

        //update user password
        user.password = newHashedPassword;
        await user.save();

        res.status(200).json({
            success: true,
            message: 'Password changed successfully',
        })

    }catch(error){
        console.log(error);
        res.status(500).json({
            success: false,
            message: "Some Error Occurred! please try again"
        })
    }
}

//@desc Get user profile
//@route GET /api/auth/profile
//@access Private 
export const getProfile = async(req, res, next)=>{
    try {
        const user = await User.findById(req.user._id);

        res.status(200).json({
            success: true,
            data:{
                id: user._id,
                username: user.username,
                email: user.email,
                profileImage: user.profileImage,
                createdAt: user.createdAt,
                updatedAt: user.updatedAt,
            }
        })
    } catch (error) {
        next(error);
    }
}

//@desc Update user profile
//@route PUT /api/auth/profile
//@access Private 
export const updateProfile = async(req, res, next)=>{
    try {
        const {username, email, profileImage} = req.body;
        const user = await User.findById(req.user._id);

        if (username) user.username = username;
        if (email) user.email = email;
        if (profileImage) user.profileImage = profileImage;

        await user.save();

        res.status(200).json({
            success: true,
            data: {
                id: user._id,
                username: user.username,
                email: user.email,
                profileImage: user.profileImage,
            },
            message: "Profile updated successfully",
        });
    } catch (error) {
        next(error)
    }
}

// Get all users
export const getUsers = async (req, res) => {
    try {
        const users = await User.find();
        res.json(users);
    } catch (error) {
        console.error(error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch users',
        });
    }
};
