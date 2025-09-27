import express from 'express'
import { checkAuth, login, logout, register, updateProfile } from '../controllers/authController.js';
import { auth } from '../middleware/auth.js';

const authRouter = express.Router()

authRouter.post('/register', register)
authRouter.post('/login', login)
authRouter.post('/logout', logout)

authRouter.put('/update-profile', auth, updateProfile)

authRouter.get('/check', auth, checkAuth)

export default authRouter;