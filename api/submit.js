import FormData from "form-data";
import fetch from "node-fetch";
import Busboy from "busboy";

export const config = {
  api: {
    bodyParser: false,
  },
};

export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).send("Method Not Allowed");
console.log('inside handler')
  try {
    const busboy = Busboy({ headers: req.headers });
    const fields = {};
    let uploadedImage = null;

    await new Promise((resolve, reject) => {
      busboy.on("field", (name, value) => {
        fields[name] = value;
      });

      busboy.on("file", (name, file, info) => {
        const { filename, mimeType } = info;
        const chunks = [];

        file.on("data", (chunk) => chunks.push(chunk));
        file.on("end", () => {
          uploadedImage = {
            filename,
            mimeType,
            buffer: Buffer.concat(chunks),
          };
        });
      });

      busboy.on("finish", resolve);
      busboy.on("error", reject);

      req.pipe(busboy);
    });

    // Upload to Cloudinary
    let imageUrl = "";
    if (uploadedImage) {
      const form = new FormData();
      form.append("file", uploadedImage.buffer, {
        filename: uploadedImage.filename,
        contentType: uploadedImage.mimeType,
      });
      form.append("upload_preset", process.env.UPLOAD_PRESET);

      const cloudRes = await fetch(
        `https://api.cloudinary.com/v1_1/${process.env.CLOUD_NAME}/auto/upload`,
        { method: "POST", body: form }
      );
      const cloudData = await cloudRes.json();
      if (cloudData.secure_url) imageUrl = cloudData.secure_url;
    }

    // Send to Google Apps Script
    const data = { ...fields, image: imageUrl || "" };console.log('data:', data)
    const scriptRes = await fetch(process.env.SHEET_SCRIPT_URL, {
      method: "POST",
      body: new URLSearchParams(data),
    });

    if (scriptRes.ok) {
      res.status(202).send();
    } else {
      console.error("Google Script returned an error", scriptRes.status);
      res.status(500).send("Failed to submit");
    }
  } catch (err) {
    console.error(err);
    res.status(500).send("Server Error");
  }
}