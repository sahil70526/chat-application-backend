import express from 'express';
import {
  register,
  login,
  validUser,
  googleAuth,
  logout,
  searchUsers,
  updateInfo,
  getUserById,
  getUserProfilePic,
  addProfileImage
} from '../controllers/user.js';
import { Auth } from '../middleware/user.js';
import { uploadProfilepic } from '../multer/multer.js';
const router = express.Router();
router.post('/auth/register', register);
router.post('/auth/login', login);
router.get('/auth/valid', Auth, validUser);
router.get('/auth/logout', Auth, logout);
router.post('/api/google', googleAuth);
router.get('/api/user?', Auth, searchUsers);
router.get('/api/users/:id', Auth, getUserById);
router.get('/api/user/profileImage/download/:filename', getUserProfilePic);
router.patch('/api/users/update/:id', updateInfo);
router.post('/api/users/add-profile-image',uploadProfilepic.single('profile'),addProfileImage)
export default router;
