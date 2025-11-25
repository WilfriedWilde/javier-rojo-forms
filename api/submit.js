import FormData from "form-data";
import fetch from "node-fetch";

export const config = {
  api: {
    bodyParser: false, // Required for file uploads
  },
};

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).send("Method Not Allowed");
  }

  try {
    // Parse form data manually (files + fields)
    const chunks = [];
    for await (const chunk of req) {
      chunks.push(chunk);
    }
    const buffer = Buffer.concat(chunks);

    const boundary = req.headers["content-type"].split("boundary=")[1];

    // We use busboy to parse multipart
    const Busboy = (await import("busboy")).default;
    const busboy = Busboy({ headers: req.headers });

    const fields = {};
    let uploadedImage = null;

    await new Promise((resolve, reject) => {
      busboy.on("field", (name, value) => {
        fields[name] = value;
      });

      busboy.on("file", (name, file, info) => {
        const { filename, mimeType } = info;
        const fileChunks = [];

        file.on("data", (chunk) => fileChunks.push(chunk));

        file.on("end", () => {
          uploadedImage = {
            filename,
            mimeType,
            buffer: Buffer.concat(fileChunks),
          };
        });
      });

      busboy.on("finish", resolve);
      busboy.on("error", reject);

      busboy.end(buffer);
    });

    // ---- UPLOAD IMAGE TO CLOUDINARY ----
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
        {
          method: "POST",
          body: form,
        }
      );

      const cloudData = await cloudRes.json();
      if (cloudData.secure_url) {
        imageUrl = cloudData.secure_url;
      }
    }

    // ---- SEND DATA TO GOOGLE SCRIPT ----
    const data = {
      ...fields,
      image: imageUrl,
    };

    const scriptRes = await fetch(process.env.SHEET_SCRIPT_URL, {
      method: "POST",
      body: new URLSearchParams(data),
    });

    const text = await scriptRes.text();
    res.status(200).send(text);
  } catch (err) {
    console.error(err);
    res.status(500).send("Server Error");
  }
}
