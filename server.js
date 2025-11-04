import dotenv from 'dotenv';
import express from 'express';
import multer from 'multer';
import fs from 'fs';

dotenv.config();

const PORT = process.env.PORT || 3000;
const CLOUD_NAME = process.env.CLOUD_NAME;
const UPLOAD_PRESET = process.env.UPLOAD_PRESET;
const SHEET_SCRIPT_URL = process.env.SHEET_SCRIPT_URL;

const app = express();
const upload = multer({ dest: 'uploads/' });

app.use(express.urlencoded({ extended: true }));
app.use(express.json());

app.post('/submit', upload.single('image'), async (req, res) => {
  try {

    // Upload image to cloudinary
    if (req.file) {
      const form = new FormData();
      form.set('file', fs.createReadStream(req.file.path));
      form.set('upload_preset', UPLOAD_PRESET);

      const cloudRes = await fetch(`https://api.cloudinary.com/v1_1/${CLOUD_NAME}/image/upload`, {
        method: 'POST',
        body: form
      });

      const cloudData = await cloudRes.json();
      req.image = cloudData.secure_url;

      fs.unlink(req.file.path, err => {
        if (err) console.error('Failed to delete temp file:', err);
      });
    }

    // Send data to Google Apps Script
    const data = {
      ...req.body,
      image: req.image || ''
    };

    const sheetRes = await fetch(SHEET_SCRIPT_URL, {
      method: 'POST',
      body: new URLSearchParams(data)
    });

    const sheetText = await sheetRes.text();
    res.send(sheetText);

  } catch (err) {
    console.error(err);
    res.status(500).send('Server error');
  }
});

app.listen(PORT, () => console.log(`'Server running on port ${PORT}`));