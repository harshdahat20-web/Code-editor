const Project = require("../models/projectModel");
const File = require("../models/fileModel");

const checkProjectAccess = async (projectId, userId) => {
  const project = await Project.findById(projectId);

  if (!project) {
    return { error: "Project not found", status: 404 };
  }
  const isOwner = project.owner.toString() === userId;
  const isCollaborator = project.collaborators.some((collabId) => {
    collabId.toString() === userId;
  });

  if (!isOwner && !isCollaborator) {
    return { error: "You don't have access to this project", status: 403 };
  }
  return { project };
};

const createProject = async (req, res) => {
  try {
  } catch (err) {
    console.error(err);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};
const getProject = async (req, res) => {
  try {
  } catch (err) {
    console.error(err);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};
const addFile = async (req, res) => {
  try {
  } catch (err) {
    console.error(err);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};
const updateFile = async (req, res) => {
  try {
  } catch (err) {
    console.error(err);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};
const getAllProject = async (req, res) => {
  try {
  } catch (err) {
    console.error(err);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

module.exports = {
  createProject,
  getProject,
  addFile,
  updateFile,
  getAllProject,
};
