import express from "express";
import { registerUser, loginUser, changePassword, getUsers, getProfile, updateProfile } from "../controllers/userController.js";

const router = express.Router();

router.post("/register", registerUser);
router.post("/login",loginUser);
router.post("/change-password",changePassword);
router.get("/profile", getProfile);
router.put("/profile", updateProfile);
router.get("/", getUsers);


export default router;
