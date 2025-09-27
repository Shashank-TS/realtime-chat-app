import jwt from 'jsonwebtoken'

export const generateToken = (user, res) => {
    const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, { expiresIn: '7d' })

    res.cookie("jwt", token, {
        maxAge: 7 * 24 * 60 * 60 * 1000, // ms
        httpOnly: true, // prevent XSS attacks
        sameSite: "None",   // prevent CSRF attacks
        secure: process.env.NODE_ENV !== 'development'
    })
    return token;
}