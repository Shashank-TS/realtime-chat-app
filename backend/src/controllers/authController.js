import { response } from "express";
import cloudinary from "../config/cloudinary.js";
import { generateToken } from "../config/utils.js";
import User from "../models/user.js";
import bcrypt from 'bcryptjs'

export const register = async (req, res) => {
    try {
        const { fullname, email, password } = req.body;

        if (!fullname || !password || !email) return res.status(400).json({ message: 'All fields are required' })

        if (password.length < 6) return res.status(400).json({ message: 'Password must be 6 characters' })

        const user = await User.findOne({ email: email })

        if (user) return res.status(400).json({ message: "email already exists" })

        const passwordHash = await bcrypt.hash(password, 10)

        const newUser = await User.create({ fullname, email, password: passwordHash });

        if (newUser) {
            generateToken(newUser, res);
            res.status(201).json(newUser);
        }

    } catch (error) {
        console.log("Error in register controller: ", error.message);
        res.status(500).json({ message: error.message })
    }
}

export const login = async (req, res) => {
    try {
        const { email, password } = req.body;

        if (!email || !password) return res.status(400).json({ message: "All fields are required" })

        const user = await User.findOne({ email })

        if (!user) return res.status(400).json({ message: "User does not exists" })

        const match = await bcrypt.compare(password, user.password);
        if (!match) return res.status(400).json({ message: "Incorrect password" })

        generateToken(user, res)
        return res.status(200).json(user)

    } catch (error) {
        console.log("Error in register controller: ", error.message);
        res.status(500).json({ message: error.message })
    }
}

export const logout = (req, res) => {
    try {
        res.cookie("jwt", "", { maxAge: 0 })

        res.status(200).json({ message: "Logged out successfully" })
    } catch (error) {
        res.status(500).json({ message: error.message })
    }
}

export const updateProfile = async (req, res) => {
    try {
        const { profilePic } = req.body;
        const { _id } = req.user;

        if (!profilePic) return res.status(400).json({ message: "profile pic required" })

        const {secure_url} = await cloudinary.uploader.upload(profilePic,{
            folder:"chatapp"
        })
        
        const updatedUser = await User.findByIdAndUpdate(_id, { profilePic: secure_url }, { new: true })
        
        res.status(200).json(updatedUser)

    } catch (error) {
        console.log(error);
        res.status(500).json({ message: error.message })
    }
}

export const checkAuth = (req, res) => {
    try {
        res.status(200).json(req.user)
    } catch (error) {
        res.status(500).json({ message: error.message })
    }
}