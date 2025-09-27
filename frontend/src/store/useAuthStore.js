import { create } from "zustand";
import api from "../lib/api.js";
import toast from "react-hot-toast";
import { io } from 'socket.io-client'

const BASE_URL = import.meta.env.MODE === "development" ? "http://localhost:5000/api": "/";

export const useAuthStore = create((set, get) => ({
  authUser: null,
  isCheckingAuth: true,
  isLoggingIn: false,
  isSigningUp: false,
  isUpdatingProfile: false,
  onlineUsers: [],
  socket: null,

  checkAuth: async () => {
    try {
      const res = await api.get('/auth/check');
      set({ authUser: res.data })
      get().connectSocket();
    } catch (error) {
      console.log('Error in checkAuth:', error);
      set({ isCheckingAuth: false })
    } finally {
      set({ isCheckingAuth: false })
    }
  },

  SignUp: async (data) => {
    set({ isSigningUp: true });
    try {
      const res = await api.post("/auth/register", data);
      set({ authUser: res.data });
      toast.success("Account created successfully");
      get().connectSocket();
    } catch (error) {
      toast.error(error.response.data.message);
    } finally {
      set({ isSigningUp: false });
    }
  },

  login: async (data) => {
    set({ isLoggingIn: true });
    try {
      const res = await api.post("/auth/login", data);
      set({ authUser: res.data });
      toast.success("Logged in successfully");
      get().connectSocket();
    } catch (error) {
      toast.error(error.response.data.message);
    } finally {
      set({ isLoggingIn: false });
    }
  },

  logout: async () => {
    try {
      await api.post("/auth/logout");
      set({ authUser: null });
      toast.success("Logged out successfully");
      get().disconnectSocket();
    } catch (error) {
      toast.error(error.response.data.message);
    }
  },

  updateProfile: async (data) => {
    set({ isUpdatingProfile: true });
    try {
      const res = await api.put("/auth/update-profile", data);
      set({ authUser: res.data });
      toast.success("Profile updated successfully");
    } catch (error) {
      console.log("error in update profile:", error);
      toast.error(error.response.data.message);
    } finally {
      set({ isUpdatingProfile: false });
    }
  },

  connectSocket: () => {
    const { authUser } = get()
    if (!authUser || get().socket?.connected) return;
    const socket = io(BASE_URL,{
      query:{
        userId: authUser._id,
      }
    })
    socket.connect()

    set({socket:socket});

    socket.on("getOnlineUsers",(userIds)=> {
      set({onlineUsers:userIds})
    })
  },

  disconnectSocket: () => {
    if(get().socket?.connected) get().socket?.disconnect();
  }
}))