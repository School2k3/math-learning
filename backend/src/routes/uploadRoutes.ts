import { Router } from 'express';
import multer from 'multer';
import { uploadImage, uploadVideo } from '../controllers/uploadController.js';

const router = Router();

// Use memory storage; we'll stream to Cloudinary
const upload = multer({ storage: multer.memoryStorage() });

// Single file field name: 'image'
router.post('/image', upload.single('image'), uploadImage);

// Video upload: field 'video'
router.post('/video', upload.single('video'), uploadVideo);

export default router;


