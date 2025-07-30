const express = require('express')
const verifyToken = require('../middleware/verifytoken')
const {addTask,getTaskStatuses,getAllMemberTask,fetchTasks,updateColumnTitle,AddSubTask,addComment,getComment,removeSubTask,updatetask,getSecureDownload,downloadFile,updateFulltask,uploadAttachements,deleteTask,addTaskStatuses,deleteTaskStatuses,updateTaskStatus,updateTaskOrder,updateColumnPositiion, fetchSubTask,UpdateSubTask} = require("../controllers/taskController")
const {parser,attachmentParser,handleAttachmentUpload} = require("../middleware/cloudinaryStorage")

const router = express.Router()


router.post("/addTask/:projectId",verifyToken,addTask)
router.delete("/delete-task/:taskId",verifyToken,deleteTask)
router.post("/updateTask/:taskId",verifyToken,updatetask)
router.post("/massiveUpdate/:taskId",verifyToken,updateFulltask)


// attachemnts router

router.post("/uploadAttachments",handleAttachmentUpload,uploadAttachements)
router.post("/getSecureDownload", verifyToken, getSecureDownload)
router.get("/download/:cloudinaryId/:filename", downloadFile)


// subTasks route

router.post("/AddSubTask/:taskId",verifyToken,AddSubTask)
router.get("/subtasks/:taskId",verifyToken,fetchSubTask)
router.post("/checkSubtask/:taskId",verifyToken,UpdateSubTask)
router.delete("/removeSubTask/:taskId",verifyToken,removeSubTask)


//availableMemebrs
router.post("/fetchedTaskMember",verifyToken,getAllMemberTask)


// Comments

router.post("/createTaskComment/:taskId",verifyToken,addComment)
router.get("/getTaskComment/:taskId",verifyToken,getComment)





// drag & drop routes

router.get("/get-taskStatuses/:projectId",verifyToken,getTaskStatuses)
router.post("/add-taskStatuses/:projectId",verifyToken,addTaskStatuses)
router.get("/get-tasks/:projectId",verifyToken,fetchTasks)
router.post("/dropTaskStatus/:taskId",verifyToken,updateTaskStatus)
router.post("/update-task-order/:projectId", verifyToken, updateTaskOrder);
router.post("/update-column-position/:projectId", verifyToken, updateColumnPositiion);
router.post("/update-column/:projectId",verifyToken,updateColumnTitle)


router.post("/delete-taskStatuses/:projectId",verifyToken,deleteTaskStatuses)





module.exports = router