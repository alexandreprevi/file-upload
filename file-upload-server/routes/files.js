const path = require("path");
const express = require("express");
const multer = require("multer");
const File = require("../model/file");
const Router = express.Router();
const fs = require("fs");

const upload = multer({
  storage: multer.diskStorage({
    destination(req, file, cb) {
      cb(null, "./files");
    },
    filename(req, file, cb) {
      cb(null, `${new Date().getTime()}_${file.originalname}`);
    },
  }),
  limits: { fileSize: 1000000 },
  fileFilter(_req, file, cb) {
    if (!file.originalname.match(/\.(jpeg|jpg|pdf|xml|png)$/)) {
      return cb(
        new Error("only upload files with jpg, jpeg, pdf, png, and xml format.")
      );
    }
    cb(undefined, true);
  },
});

Router.post(
  "/upload",
  upload.single("file"),
  async (req, res) => {
    try {
      const { author, description, filename: name } = req.body;
      const { path, mimetype } = req.file;
      const split = path.split("/");
      const filename = name ?? split[split.length - 1];
      const file = new File({
        author,
        description,
        filename,
        file_path: path,
        file_mimetype: mimetype,
      });
      await file.save();
      res.send(file);
    } catch (error) {
      res.status(400).send("Error while uploading file. Try again later.");
    }
  },
  (error, _req, res, _next) => {
    if (error) res.status(500).send(error.message);
  }
);

Router.get("/getAllFiles", async (_req, res) => {
  try {
    const files = await File.find({});
    const sortedByCreationDate = files.sort(
      (a, b) => b.createdAt - a.createdAt
    );
    res.send(sortedByCreationDate);
  } catch (error) {
    res.status(400).send("Error while getting list of files. Try again later.");
  }
});

Router.get("/download/:id", async (req, res) => {
  try {
    const file = await File.findById(req.params.id);
    res.set({
      "Content-Type": file.file_mimetype,
    });
    res.sendFile(path.join(__dirname, "../..", file.file_path));
  } catch (error) {
    res.status(400).send("Error while downloading file. Try again later.");
  }
});

Router.delete("/delete/:id", async (req, res) => {
  try {
    const file = await File.findById(req.params.id);
    if (!file) {
      res.status(400);
    }

    fs.unlinkSync(file.file_path);
    await file.remove();

    res.send(file);
  } catch (error) {
    res.status(400).send("Error while deleting file. Try again later.");
  }
});

module.exports = Router;
