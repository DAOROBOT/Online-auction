import { Router } from "express";
import { upload } from '../config/cloudinary.js';

const route = new Router();

// POST /upload
// Expects form-data with key 'image'
route.post('/', upload.single('image'), (req, res) => {
  console.log(req);
  if (!req.file) {
    return res.status(400).json({ message: 'No file uploaded' });
  }

  // Cloudinary returns the secure url in req.file.path
  res.status(200).json({ 
    message: 'Upload successful', 
    url: req.file.path,
    public_id: req.file.filename,
  });
});

export default route;