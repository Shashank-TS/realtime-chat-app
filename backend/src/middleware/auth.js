import jwt from 'jsonwebtoken'
import User from '../models/user.js'

export const auth = async (req, res,next) => {
    try {
        const token = req.cookies.jwt

        if (!token) return res.status(401).json({ message: "Not authorized - missing token" })

        const { userId } = jwt.verify(token, process.env.JWT_SECRET)

        if (!userId) res.status(401).json({ message: "Not authorized - Invalid token" })

        const user = await User.findOne({ _id: userId }).select("-password")

        req.user = user;
        next();

    } catch (error) {
        res.status(500).json({ message: error.message })
    }
}