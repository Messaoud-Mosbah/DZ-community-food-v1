const asyncHandler = require("express-async-handler");

// Create document
exports.addDoc = (Model) =>
  asyncHandler(async (req, res) => {
    const doc = await Model.create(req.body);
    res.status(201).json({ data: doc });
  });

// Get all documents
exports.getAllDocs = (Model) =>
  asyncHandler(async (req, res) => {
    const docs = await Model.find();
    res.status(200).json({ data: docs });
  });

// Get single document
exports.getSingleDoc = (Model) =>
  asyncHandler(async (req, res) => {
    const doc = await Model.findById(req.params.id);

    if (!doc) {
      return res.status(404).json({
        status: "fail",
        message: `No record found with ID ${req.params.id}`,
      });
    }

    res.status(200).json({ data: doc });
  });

// Update document
exports.updateDoc = (Model) =>
  asyncHandler(async (req, res) => {
    const doc = await Model.findById(req.params.id);

    if (!doc) {
      return res.status(404).json({
        status: "fail",
        message: `No record found with ID ${req.params.id}`,
      });
    }

    Object.assign(doc, req.body);
    await doc.save();

    res.status(200).json({ data: doc });
  });

// Delete document
exports.deleteDoc = (Model) =>
  asyncHandler(async (req, res) => {
    const doc = await Model.findByIdAndDelete(req.params.id);

    if (!doc) {
      return res.status(404).json({
        status: "fail",
        message: `No record found with ID ${req.params.id}`,
      });
    }

    res.status(204).send();
  });
