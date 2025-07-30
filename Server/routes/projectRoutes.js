const express = require('express')
const {addProject,uploadProjectAvatar,getComments,filtredProjects,createComment,downloadFile,createTask,getTask,getSecureDownload,uploadAttachements,project,projects,updateProject,deleteProject,getAllMember,getAllTeams} = require("../controllers/projectController")
const {parser,attachmentParser,handleAttachmentUpload} = require("../middleware/cloudinaryStorage")
const verifyToken = require('../middleware/verifytoken')
const router = express.Router()



router.post("/getSecureDownload", verifyToken, getSecureDownload)
router.post("/UploadAvatar", parser.single('avatar'), uploadProjectAvatar)
router.post("/UpdloadAttachements", handleAttachmentUpload, uploadAttachements)
router.post("/add", verifyToken, addProject)
router.get("/download/:cloudinaryId/:filename", downloadFile)
router.post("/updateProject/:id", verifyToken, updateProject)
router.get("/getProject/:id", verifyToken, project)
router.post("/getProjects", verifyToken, projects)
router.post("/getfiltredProjects", verifyToken, filtredProjects)
router.delete("/deleteProject/:id", verifyToken, deleteProject)
router.post("/fetchedMemberfirstTime", verifyToken, getAllMember)
router.post("/fetchedteam", verifyToken, getAllTeams)
router.post("/CreatetaskFromProject",verifyToken,createTask)
router.post("/taskFromProject",verifyToken,getTask)
router.post("/createComment/:projectId",verifyToken,createComment)
router.get("/comments/:projectId",verifyToken,getComments)






module.exports = router