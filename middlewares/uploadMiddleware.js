const cloudinary = require("cloudinary").v2;
const busboy = require("busboy");

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key:    process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

const MAX_SIZE = 100 * 1024 * 1024; 

const ALLOWED_FIELDS = {
  image:           "image/",
  images:          "image/",
  avatarImageFile: "image/",
  video:           "video/",
};

const uploadToCloudinary = (file) => {
  return new Promise((resolve, reject) => {
    const isVideo       = file.mimetype.startsWith("video/");
    const resource_type = isVideo ? "video" : "image";

    const stream = cloudinary.uploader.upload_stream(
      { resource_type },
      (error, result) => {
        if (error) return reject(error);
        resolve(result.secure_url);
      }
    );

    stream.end(file.buffer);
  });
};

const parseMultipart = () => {
  return async (req, res, next) => {
    if (!req.headers["content-type"]?.includes("multipart/form-data")) {
      return next();
    }

    try {
      const bb = busboy({
        headers: req.headers,
        limits: { fileSize: MAX_SIZE },
      });

      req.body  = req.body  || {};
      req.files = req.files || {};

      const filePromises = [];

      bb.on("file", (fieldname, stream, info) => {
        const { filename, mimeType } = info;

        const allowedPrefix = ALLOWED_FIELDS[fieldname];
        if (!allowedPrefix || !mimeType.startsWith(allowedPrefix)) {
          stream.resume();
          return;
        }

        const filePromise = new Promise((resolve, reject) => {
          const chunks = [];
          
          stream.on("data", (chunk) => chunks.push(chunk));

          stream.on("end", async () => {
            try {
              const buffer = Buffer.concat(chunks);
              const file   = { buffer, originalname: filename, mimetype: mimeType };
              
              const url = await uploadToCloudinary(file);

              if (!req.files[fieldname]) req.files[fieldname] = [];
              req.files[fieldname].push({ url, filename: url.split("/").pop() });

              resolve(); 
            } catch (err) {
              reject(err); 
            }
          });

          stream.on("error", (err) => reject(err));
        });

        filePromises.push(filePromise);
      });

      bb.on("field", (name, val) => {
        req.body[name] = val;
      });

      bb.on("finish", async () => {
        try {
          await Promise.all(filePromises); 
          next();
        } catch (err) {
          next(err); 
        }
      });

      bb.on("error", (err) => next(err));

      req.pipe(bb);
    } catch (err) {
      next(err);
    }
  };
};

const cloudinaryUpload = {
  fields: (_fields) => parseMultipart(),
  single: (_fieldname) => parseMultipart(),
  array:  (_fieldname) => parseMultipart(),
};

module.exports = cloudinaryUpload;