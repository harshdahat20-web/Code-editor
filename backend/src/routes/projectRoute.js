const { Router } = require("express");
const {
  createProject,
  getProject,
  addFile,
  updateFile,
  getAllProject,
  addCollaborator,
  deleteProject,
  deleteFile,
} = require("../controllers/projectController");
const authMiddleware = require("../middleware/authMiddleware");

const router = Router();

router.post("/", authMiddleware, createProject);
router.get("/:projectId", authMiddleware, getProject);
router.post("/:projectId/files", authMiddleware, addFile);
router.put("/:projectId/files/:fileId", authMiddleware, updateFile);
router.get("/", authMiddleware, getAllProject);
router.post("/:projectId/collaborators", authMiddleware, addCollaborator);
router.delete("/:projectId", authMiddleware, deleteProject);
router.delete("/:projectId/files/:fileId", authMiddleware, deleteFile);

module.exports = router;
