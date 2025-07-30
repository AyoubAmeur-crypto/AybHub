# 🚀 ProjectBoard Backend API Implementation Roadmap

## 📋 PHASE 1: CORE PROJECT MANAGEMENT (Priority: HIGH)

### Task 1.1: Basic Project CRUD Operations
**Estimated Time: 2-3 hours**

```javascript
// Route: /api/projects
// Methods: GET, POST, PUT, DELETE

// 1.1.1 GET /api/projects - Fetch all projects for user
router.get('/projects', verifyToken, async (req, res) => {
  // Implementation needed:
  // - Get user ID from token
  // - Find all projects where user is owner/member
  // - Return array of projects with required fields
});

// Expected Response Format:
[
  {
    _id: "project_id",
    name: "Project Name",
    description: "Project description",
    status: "In Progress", // "Planning" | "In Progress" | "Completed" | "On Hold"
    visibility: "public", // "public" | "private"
    dueDate: "2024-12-31",
    createdDate: "2024-01-01",
    progress: 75, // calculated percentage
    tasksCompleted: 15,
    tasksTotal: 20,
    attachmentsCount: 5,
    avatarUrl: "https://...",
    bgColor: "bg-blue-500",
    members: [
      { id: "user_id", name: "User Name", avatar: "https://..." }
    ],
    manager: { id: "manager_id", name: "Manager Name", avatar: "https://..." },
    teams: [
      { id: "team_id", name: "Team Name", color: "bg-purple-500" }
    ]
  }
]
```

### Task 1.2: Create New Project
**Estimated Time: 1-2 hours**

```javascript
// 1.2.1 POST /api/projects - Create new project
router.post('/projects', verifyToken, async (req, res) => {
  // Implementation needed:
  // - Validate required fields
  // - Create project with owner as current user
  // - Return created project
});

// Expected Request Body:
{
  name: "Project Name",
  description: "Description",
  manager: "user_id",
  teams: ["team_id1", "team_id2"],
  members: ["member_id1", "member_id2"],
  dueDate: "2024-12-31",
  visibility: "public",
  status: "Planning",
  avatarUrl: "https://..."
}
```

### Task 1.3: Update Project
**Estimated Time: 1 hour**

```javascript
// 1.3.1 PUT /api/projects/:id - Update project
router.put('/projects/:id', verifyToken, async (req, res) => {
  // Implementation needed:
  // - Check if user has permission to edit
  // - Update allowed fields
  // - Return updated project
});

// 1.3.2 PUT /api/projects/:id/status - Update project status
router.put('/projects/:id/status', verifyToken, async (req, res) => {
  // Quick status update endpoint
});
```

### Task 1.4: Delete Project
**Estimated Time: 30 minutes**

```javascript
// 1.4.1 DELETE /api/projects/:id - Delete project
router.delete('/projects/:id', verifyToken, async (req, res) => {
  // Implementation needed:
  // - Check if user is owner
  // - Delete project and associated data
  // - Return success message
});
```

---

## 📋 PHASE 2: USER & TEAM MANAGEMENT (Priority: HIGH)

### Task 2.1: Members Management
**Estimated Time: 1-2 hours**

```javascript
// 2.1.1 GET /api/members - Fetch all available members/users
router.get('/members', verifyToken, async (req, res) => {
  // Implementation needed:
  // - Return all users that can be added to projects
  // - Exclude current user if needed
});

// Expected Response:
[
  {
    id: "user_id",
    name: "User Name",
    email: "user@example.com",
    avatar: "https://..."
  }
]

// 2.1.2 POST /api/projects/:id/members - Add members to project
router.post('/projects/:id/members', verifyToken, async (req, res) => {
  // Implementation needed:
  // - Validate project access
  // - Add members to project
  // - Send notifications (optional)
});

// Expected Request Body:
{
  memberIds: ["user_id1", "user_id2"]
}

// 2.1.3 DELETE /api/projects/:id/members/:memberId - Remove member
router.delete('/projects/:id/members/:memberId', verifyToken, async (req, res) => {
  // Implementation needed:
  // - Check permissions
  // - Remove member from project
});
```

### Task 2.2: Teams Management
**Estimated Time: 1-2 hours**

```javascript
// 2.2.1 GET /api/teams - Fetch all available teams
router.get('/teams', verifyToken, async (req, res) => {
  // Implementation needed:
  // - Return teams user has access to
});

// Expected Response:
[
  {
    id: "team_id",
    name: "Team Name",
    color: "bg-purple-500",
    members: 5,
    description: "Team description"
  }
]

// 2.2.2 POST /api/projects/:id/teams - Add teams to project
router.post('/projects/:id/teams', verifyToken, async (req, res) => {
  // Implementation needed:
  // - Add teams to project
});

// 2.2.3 DELETE /api/projects/:id/teams/:teamId - Remove team
router.delete('/projects/:id/teams/:teamId', verifyToken, async (req, res) => {
  // Implementation needed:
  // - Remove team from project
});
```

---

## 📋 PHASE 3: PROJECT DETAILS FEATURES (Priority: MEDIUM)

### Task 3.1: Tasks Management
**Estimated Time: 2-3 hours**

```javascript
// 3.1.1 GET /api/projects/:id/tasks - Fetch tasks for project
router.get('/projects/:id/tasks', verifyToken, async (req, res) => {
  // Implementation needed:
  // - Get all tasks for specific project
  // - Include assignee information
});

// Expected Response:
[
  {
    id: "task_id",
    title: "Task Title",
    description: "Task description",
    status: "In Progress", // "To Do" | "In Progress" | "Completed"
    dueDate: "2024-12-31",
    assignee: {
      id: "user_id",
      name: "User Name",
      avatar: "https://..."
    },
    createdAt: "2024-01-01",
    updatedAt: "2024-01-02"
  }
]

// 3.1.2 POST /api/projects/:id/tasks - Create new task
router.post('/projects/:id/tasks', verifyToken, async (req, res) => {
  // Implementation needed:
  // - Create task within project
  // - Assign to user if provided
});

// Expected Request Body:
{
  title: "Task Title",
  description: "Description",
  dueDate: "2024-12-31",
  assigneeId: "user_id",
  status: "To Do"
}

// 3.1.3 PUT /api/tasks/:id - Update task
router.put('/tasks/:id', verifyToken, async (req, res) => {
  // Implementation needed:
  // - Update task details
  // - Check permissions
});

// 3.1.4 DELETE /api/tasks/:id - Delete task
router.delete('/tasks/:id', verifyToken, async (req, res) => {
  // Implementation needed:
  // - Delete task
  // - Update project progress
});
```

### Task 3.2: Comments System
**Estimated Time: 1-2 hours**

```javascript
// 3.2.1 GET /api/projects/:id/comments - Fetch project comments
router.get('/projects/:id/comments', verifyToken, async (req, res) => {
  // Implementation needed:
  // - Get comments for project
  // - Include user information
  // - Order by timestamp
});

// Expected Response:
[
  {
    id: "comment_id",
    comment: "Comment text",
    user: {
      name: "User Name",
      avatar: "https://..."
    },
    timestamp: "2024-01-01T10:30:00Z",
    createdAt: "2024-01-01T10:30:00Z"
  }
]

// 3.2.2 POST /api/projects/:id/comments - Add comment
router.post('/projects/:id/comments', verifyToken, async (req, res) => {
  // Implementation needed:
  // - Add comment to project
  // - Include user from token
});

// Expected Request Body:
{
  comment: "This is a comment"
}

// 3.2.3 DELETE /api/comments/:id - Delete comment
router.delete('/comments/:id', verifyToken, async (req, res) => {
  // Implementation needed:
  // - Delete comment
  // - Check if user owns comment or has admin rights
});
```

---

## 📋 PHASE 4: FILE MANAGEMENT (Priority: MEDIUM)

### Task 4.1: Attachments System
**Estimated Time: 2-3 hours**

```javascript
// 4.1.1 GET /api/projects/:id/attachments - Fetch project attachments
router.get('/projects/:id/attachments', verifyToken, async (req, res) => {
  // Implementation needed:
  // - Get all attachments for project
  // - Include file metadata
});

// Expected Response:
[
  {
    id: "attachment_id",
    name: "document.pdf",
    type: "pdf", // file extension
    size: "2.3 MB",
    url: "https://cloudinary.../document.pdf",
    uploadedBy: "User Name",
    uploadedAt: "2 hours ago",
    createdAt: "2024-01-01T10:30:00Z"
  }
]

// 4.1.2 POST /api/projects/:id/attachments - Upload attachment
router.post('/projects/:id/attachments', verifyToken, upload.single('file'), async (req, res) => {
  // Implementation needed:
  // - Upload file to Cloudinary
  // - Save attachment record
  // - Return attachment info
});

// Expected Response:
{
  id: "attachment_id",
  name: "document.pdf",
  url: "https://cloudinary.../document.pdf",
  size: "2.3 MB",
  type: "pdf"
}

// 4.1.3 DELETE /api/attachments/:id - Delete attachment
router.delete('/attachments/:id', verifyToken, async (req, res) => {
  // Implementation needed:
  // - Delete from Cloudinary
  // - Remove database record
});
```

### Task 4.2: Avatar Upload
**Estimated Time: 1 hour**

```javascript
// 4.2.1 POST /api/upload/avatar - Upload project avatar/logo
router.post('/upload/avatar', verifyToken, upload.single('avatar'), async (req, res) => {
  // Implementation needed:
  // - Upload to Cloudinary
  // - Return URL for project avatar
});

// Expected Response:
{
  url: "https://cloudinary.../avatar.jpg"
}

// 4.2.2 POST /api/upload/attachment - Upload project attachment
router.post('/upload/attachment', verifyToken, upload.single('file'), async (req, res) => {
  // Implementation needed:
  // - Upload file to Cloudinary
  // - Return file info
});

// Expected Response:
{
  url: "https://cloudinary.../file.pdf",
  filename: "document.pdf",
  size: "2.3 MB"
}
```

---

## 🎯 IMPLEMENTATION ORDER RECOMMENDATION

### Week 1: Core Functionality
1. **Day 1-2**: Task 1.1 - Basic Project Fetching ✅ (Already exists)
2. **Day 3**: Task 1.2 - Create New Project ✅ (Already exists)
3. **Day 4**: Task 1.3 - Update Project
4. **Day 5**: Task 1.4 - Delete Project

### Week 2: User Management
1. **Day 1**: Task 2.1 - Members Management ✅ (Partially exists)
2. **Day 2**: Task 2.2 - Teams Management ✅ (Partially exists)
3. **Day 3-4**: Complete and test user/team features
4. **Day 5**: Bug fixes and optimization

### Week 3: Advanced Features
1. **Day 1-2**: Task 3.1 - Tasks Management
2. **Day 3**: Task 3.2 - Comments System
3. **Day 4-5**: Testing and integration

### Week 4: File Management
1. **Day 1-2**: Task 4.1 - Attachments System
2. **Day 3**: Task 4.2 - Avatar Upload ✅ (Already exists)
3. **Day 4-5**: Final testing and deployment

---

## 🔧 HELPER UTILITIES NEEDED

### Database Helpers
```javascript
// utils/projectHelpers.js
const calculateProjectProgress = (projectId) => {
  // Calculate progress based on completed tasks
};

const getProjectMembers = (projectId) => {
  // Get all members with their roles
};

const checkProjectAccess = (userId, projectId) => {
  // Check if user can access project
};
```

### Validation Schemas
```javascript
// validation/projectValidation.js
const createProjectSchema = {
  name: { required: true, minLength: 3 },
  description: { required: true },
  // ... other validations
};
```

---

## 📝 NOTES FOR IMPLEMENTATION

1. **Authentication**: All endpoints require `verifyToken` middleware
2. **Permissions**: Implement role-based access (owner, member, viewer)
3. **Validation**: Use Joi or similar for request validation
4. **Error Handling**: Consistent error response format
5. **Pagination**: Add pagination for large datasets (comments, tasks)
6. **Real-time**: Consider Socket.io for real-time updates (optional)

---

## ✅ EXISTING APIS (Already Working)
- ✅ POST /project/api/getProjects (needs to be updated to GET /api/projects)
- ✅ POST /project/api/add (needs to be updated to POST /api/projects)
- ✅ POST /project/api/fetchedMemberfirstTime (needs to be updated to GET /api/members)
- ✅ POST /project/api/fetchedteam (needs to be updated to GET /api/teams)
- ✅ POST /project/api/UploadAvatar (needs to be updated to POST /api/upload/avatar)
- ✅ POST /project/api/UpdloadAttachements (needs to be updated to POST /api/upload/attachment)

**Next Step**: Start with updating existing APIs to match the new structure, then implement missing features step by step.
