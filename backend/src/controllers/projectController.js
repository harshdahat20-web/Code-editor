const Project = require("../models/projectModel");
const File = require("../models/fileModel");
const User = require("../models/userModel");

const checkProjectAccess = async (projectId, userId) => {
  const project = await Project.findById(projectId);

  if (!project) {
    return { error: "Project not found", status: 404 };
  }
  const isOwner = project.owner.toString() === userId;
  const isCollaborator = project.collaborators.some(
    (collabId) => collabId.toString() === userId,
  );

  if (!isOwner && !isCollaborator) {
    return { error: "You don't have access to this project", status: 403 };
  }
  return { project };
};

const createProject = async (req, res) => {
  try {
    const { name } = req.body;

    if (!name || name.trim() === "") {
      return res.status(400).json({
        success: false,
        message: "Project name is required",
      });
    }
    const project = await Project.create({
      name,
      owner: req.user.userId,
    });
    return res.status(201).json({
      success: true,
      message: "Project created successfully",
      data: project,
    });
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
    const { projectId } = req.params;

    const { status, error } = await checkProjectAccess(
      projectId,
      req.user.userId,
    );
    if (error) {
      return res.status(status).json({ success: false, message: error });
    }

    const project = await Project.findById(projectId)
      .populate("owner", "name email")
      .populate("collaborators", "name email");

    const files = await File.find({ project: projectId });
    return res.status(200).json({
      success: true,
      message: "Project found successfully",
      data: { project, files },
    });
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
    const { projectId } = req.params;
    const { fileName } = req.body;

    if (!fileName || fileName.trim() === "") {
      return res.status(400).json({
        success: false,
        message: "File name is required",
      });
    }

    const { error, status } = await checkProjectAccess(
      projectId,
      req.user.userId,
    );

    if (error) {
      return res.status(status).json({ success: false, message: error });
    }

    const file = await File.create({ fileName, project: projectId });

    return res.status(201).json({
      success: true,
      message: "File created successfully",
      data: file,
    });
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
    const { projectId, fileId } = req.params;
    const { content } = req.body;

    const { error, status } = await checkProjectAccess(
      projectId,
      req.user.userId,
    );

    if (error) {
      return res.status(status).json({ success: false, message: error });
    }

    const file = await File.findOneAndUpdate(
      {
        _id: fileId,
        project: projectId,
      },
      { content },
      { new: true },
    );

    if (!file) {
      return res.status(404).json({
        success: false,
        message: "File not found",
      });
    }
    return res.status(200).json({
      success: true,
      message: "File updated successfully",
      data: file,
    });
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
    const userId = req.user.userId;

    const projects = await Project.find({
      $or: [{ owner: userId }, { collaborators: userId }],
    }).lean();

    const projectIds = projects.map((p) => p._id);

    const fileCounts = await File.aggregate([
      { $match: { project: { $in: projectIds } } },
      { $group: { _id: "$project", count: { $sum: 1 } } },
    ]);

    const fileCountMap = {};
    fileCounts.forEach((f) => {
      fileCountMap[f._id.toString()] = f.count;
    });

    const projectsWithCounts = projects.map((proj) => ({
      ...proj,
      fileCount: fileCountMap[proj._id.toString()] || 0,
    }));

    return res.status(200).json({
      success: true,
      message: "All project fetched successfully",
      data: projectsWithCounts,
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};
const addCollaborator = async (req, res) => {
  try {
    const { projectId } = req.params;
    const { email } = req.body;

    const project = await Project.findById(projectId);

    if (!project) {
      return res.status(404).json({
        success: false,
        message: "Project not found",
      });
    }

    const isOwner = project.owner.toString() === req.user.userId;
    if (!isOwner) {
      return res.status(403).json({
        success: false,
        message: "Only the project owner can add collaborators",
      });
    }

    const userToAdd = await User.findOne({ email });
    if (!userToAdd) {
      return res.status(404).json({
        success: false,
        message: "No user found with this email",
      });
    }

    const alreadyCollaborator = project.collaborators.some(
      (collabId) => collabId.toString() === userToAdd._id.toString(),
    );
    if (alreadyCollaborator) {
      return res.status(400).json({
        success: false,
        message: "User is already a collaborator",
      });
    }

    project.collaborators.push(userToAdd._id);
    await project.save();

    return res.status(200).json({
      success: true,
      message: "Collaborator added successfully",
      data: project,
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

const deleteProject = async (req, res) => {
  try {
    const { projectId } = req.params;

    const project = await Project.findById(projectId);

    if (!project) {
      return res.status(404).json({
        success: false,
        message: "Project not found",
      });
    }

    const isOwner = project.owner.toString() === req.user.userId;
    if (!isOwner) {
      return res.status(403).json({
        success: false,
        message: "Only the project owner can delete this project",
      });
    }

    await File.deleteMany({ project: projectId });
    await Project.findByIdAndDelete(projectId);

    return res.status(200).json({
      success: true,
      message: "Project deleted successfully",
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

const deleteFile = async (req, res) => {
  try {
    const { projectId, fileId } = req.params;

    const { error, status } = await checkProjectAccess(
      projectId,
      req.user.userId,
    );

    if (error) {
      return res.status(status).json({ success: false, message: error });
    }

    const file = await File.findOneAndDelete({
      _id: fileId,
      project: projectId,
    });

    if (!file) {
      return res.status(404).json({
        success: false,
        message: "File not found",
      });
    }

    return res.status(200).json({
      success: true,
      message: "File deleted successfully",
    });
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
  addCollaborator,
  deleteProject,
  deleteFile,
};
