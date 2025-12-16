import jwt from "jsonwebtoken";
import User from "../models/user.js";

const protect = async (req,res,next)=>{
    let token;

    //check if token exists in Authorization header
    if(req.headers.authorization && req.headers.authorization.startsWith('Bearer')){
        try {
            token = req.headers.authorization.split(' ')[1];

            //verify token
            const decoded = jwt.verify(token, process.env.JWT_SECRET_KEY);
            const userId = decoded.id || decoded._id || decoded.userId;
            req.user =await User.findById(userId).select('-password');

            if(!req.user){
                return res.status(401).json({
                    success: false,
                    error: 'User Not Found',
                    statusCode: 401
                });
            }
            return next();
        } catch (error) {
            console.error('Auth middleware error:', error.message);

            if(error.name === 'TokenExpiredError'){
                return res.status(401).json({
                    success: false,
                    error: 'Token has expired',
                    statusCode: 401
                });
            }
            return res.status(401).json({
            success: false,
            error: 'Not authorized, token failed',
            statusCode: 401
            });
        }    
    }
    return res.status(401).json({
        success: false,
        error: 'Not authorized, no token',
        statusCode: 401
    });
}

export default protect;