import cloudinary from "../config/cloudinary.js";
import { getReceiverSocketId,io } from "../config/socket.js";
import Message from "../models/message.js";
import User from "../models/user.js";

export const getUsersForSidebar = async (req, res) => {
    try {
        const LoggedInUserId = req.user._id;

        const filteredUsers = await User.find({ _id: { $ne: LoggedInUserId } }).select("-password");

        res.status(200).json(filteredUsers)

    } catch (error) {
        console.log(error);    
        res.status(500).json({ message: error.message })
    }
}

export const getMessages = async (req, res) => {
    try {
        const myId = req.user._id;
        const userTochatId = req.params.id

        const messages = await Message.find({
            $or: [
                { senderId: myId, recieverId: userTochatId },
                { senderId: userTochatId, recieverId: myId }
            ]
        })
        
        res.status(200).json(messages)

    } catch (error) {
        res.status(500).json({ message: error.message })
    }
}

export const sendMessage = async (req, res) => {
    try {
        const senderId = req.user._id;
        const recieverId = req.params.id

        const {text,image} = req.body

        let imageUrl 
        if(image){
            const {secure_url} =await cloudinary.uploader.upload(image,{
                folder:"chatapp"
            });
            imageUrl = secure_url
        }

        const newMessage  = new Message({
            senderId,
            recieverId,
            image:imageUrl,
            text
        });

        await newMessage.save()

        //todo
        const  recieverSocketId = getReceiverSocketId(recieverId);
        if(recieverSocketId){
            io.to(recieverSocketId).emit("newMessage",newMessage)
        }
        
        res.status(201).json(newMessage)

    } catch (error) {
        res.status(500).json({ message: error.message })
    }
}