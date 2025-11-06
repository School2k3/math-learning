import { Router } from 'express';
import multer from 'multer';
import { uploadImage } from '../controllers/uploadController.js';

const router = Router();

// Use memory storage; we'll stream to Cloudinary
const upload = multer({ storage: multer.memoryStorage() });

// Single file field name: 'image'
router.post('/', upload.single('image'), uploadImage);

export default router;


