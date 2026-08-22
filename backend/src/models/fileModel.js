const mongoose = require("mongoose");

const fileSchema = new mongoose.Schema(
  {
    fileName: {
      type: String,
      required: [true, "File name is required"],
      trim: true,
    },
    content: {
      type: String,
      default: "",
    },
    project: {
      type: String,
      ref: "Project",
      required: true,
    },
  },
  {
    timestamps: true,
  },
);

const File = mongoose.model("File", fileSchema);

module.exports = File;
