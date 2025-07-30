# 🔥 TODAY'S SPRINT: ProjectBoard API Implementation

## 🎯 IMMEDIATE PRIORITY (Next 2-3 Hours)

### STEP 1: Fix File Upload APIs (30 minutes)
**Current Issue**: Avatar and attachment uploads need to return proper URLs

#### 1.1 Update Avatar Upload Endpoint
```javascript
// File: Server/routes/projectRoutes.js (or wherever your upload routes are)

// CURRENT: POST /project/api/UploadAvatar
// TARGET: POST /api/upload/avatar

router.post('/upload/avatar', verifyToken, upload.single('avatar'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }

    // Upload to Cloudinary (assuming you have cloudinary setup)
    const result = await cloudinary.uploader.upload(req.file.path, {
      folder: 'project-avatars',
      transformation: [
        { width: 200, height: 200, crop: 'fill' },
        { quality: 'auto' }
      ]
    });

    // Return the URL that frontend expects
    res.status(200).json({
      success: true,
      url: result.secure_url,
      message: 'Avatar uploaded successfully'
    });

  } catch (error) {
    console.error('Avatar upload error:', error);
    res.status(500).json({ 
      error: 'Failed to upload avatar',
      details: error.message 
    });
  }
});
```

#### 1.2 Update Attachment Upload Endpoint
```javascript
// CURRENT: POST /project/api/UpdloadAttachements  
// TARGET: POST /api/upload/attachment

router.post('/upload/attachment', verifyToken, upload.single('file'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }

    // Upload to Cloudinary
    const result = await cloudinary.uploader.upload(req.file.path, {
      folder: 'project-attachments',
      resource_type: 'auto' // Supports all file types
    });

    // Calculate file size in MB
    const fileSizeInMB = (req.file.size / (1024 * 1024)).toFixed(2);

    // Return the data that frontend expects
    res.status(200).json({
      success: true,
      url: result.secure_url,
      filename: req.file.originalname,
      size: `${fileSizeInMB} MB`,
      type: req.file.mimetype.split('/')[1], // Get file extension
      publicId: result.public_id // For deletion later
    });

  } catch (error) {
    console.error('Attachment upload error:', error);
    res.status(500).json({ 
      error: 'Failed to upload attachment',
      details: error.message 
    });
  }
});
```

### STEP 2: Update Create Project API (45 minutes)
**Current Issue**: Need to match frontend expectations

#### 2.1 Update Project Creation Endpoint
```javascript
// CURRENT: POST /project/api/add
// TARGET: POST /api/projects

router.post('/projects', verifyToken, async (req, res) => {
  try {
    const {
      name,
      description,
      manager,
      teams,
      members,
      dueDate,
      visibility,
      status,
      avatarUrl
    } = req.body;

    // Validation
    if (!name || !description) {
      return res.status(400).json({ 
        error: 'Name and description are required' 
      });
    }

    // Get user ID from token
    const ownerId = req.user.id; // Assuming your verifyToken sets req.user

    // Create project object
    const newProject = new Project({
      name,
      description,
      owner: ownerId,
      manager: manager || ownerId, // Default to owner if no manager specified
      teams: teams || [],
      members: members || [],
      dueDate: dueDate ? new Date(dueDate) : null,
      visibility: visibility || 'public',
      status: status || 'Planning',
      avatarUrl: avatarUrl || '',
      bgColor: generateRandomBgColor(), // Helper function
      createdDate: new Date(),
      progress: 0,
      tasksCompleted: 0,
      tasksTotal: 0,
      attachmentsCount: 0
    });

    // Save to database
    const savedProject = await newProject.save();

    // Return the project in the format frontend expects
    const projectResponse = {
      _id: savedProject._id,
      name: savedProject.name,
      description: savedProject.description,
      status: savedProject.status,
      visibility: savedProject.visibility,
      dueDate: savedProject.dueDate,
      createdDate: savedProject.createdDate,
      progress: savedProject.progress,
      tasksCompleted: savedProject.tasksCompleted,
      tasksTotal: savedProject.tasksTotal,
      attachmentsCount: savedProject.attachmentsCount,
      avatarUrl: savedProject.avatarUrl,
      bgColor: savedProject.bgColor,
      members: [], // TODO: Populate with actual member data
      manager: null, // TODO: Populate with actual manager data
      teams: [] // TODO: Populate with actual team data
    };

    res.status(201).json({
      success: true,
      message: 'Project created successfully',
      project: projectResponse
    });

  } catch (error) {
    console.error('Project creation error:', error);
    res.status(500).json({ 
      error: 'Failed to create project',
      details: error.message 
    });
  }
});

// Helper function for random background colors
function generateRandomBgColor() {
  const colors = [
    'bg-blue-500',
    'bg-purple-500', 
    'bg-pink-500',
    'bg-green-500',
    'bg-yellow-500',
    'bg-red-500',
    'bg-indigo-500',
    'bg-orange-500'
  ];
  return colors[Math.floor(Math.random() * colors.length)];
}
```

### STEP 3: Update Frontend API Calls (30 minutes)
**Update ProjectBoard.jsx to use new endpoints**

#### 3.1 Update Avatar Upload Function
```javascript
// In ProjectBoard.jsx - update handleAvatar function
const handleAvatar = async (e) => {
  try {
    const file = e.target.files[0]
    if (!file) return;

    const formData = new FormData()
    formData.append("avatar", file) // Make sure field name matches backend

    const res = await axios.post("http://localhost:3000/api/upload/avatar", formData, {
      headers: { "Content-Type": "multipart/form-data" },
      withCredentials: true
    })

    console.log("Avatar uploaded:", res.data);
    
    if (res.data.success) {
      setProjectData(prev => ({ ...prev, avatarUrl: res.data.url }));
    }
  } catch (error) {
    console.error("Avatar upload failed:", error);
    setError('Failed to upload avatar');
  }
}
```

#### 3.2 Update Attachment Upload Function
```javascript
// In ProjectBoard.jsx - update handleAttachement function
const handleAttachement = async (e) => {
  try {
    const file = e.target.files[0]
    if (!file) return;

    const formData = new FormData()
    formData.append("file", file) // Make sure field name matches backend

    const res = await axios.post("http://localhost:3000/api/upload/attachment", formData, {
      headers: { "Content-Type": "multipart/form-data" },
      withCredentials: true
    })

    console.log("Attachment uploaded:", res.data);
    
    if (res.data.success) {
      // Add to project attachments array
      setProjectData(prev => ({ 
        ...prev, 
        attachments: [...prev.attachments, {
          name: res.data.filename,
          url: res.data.url,
          size: res.data.size,
          type: res.data.type
        }]
      }));
    }
  } catch (error) {
    console.error("Attachment upload failed:", error);
    setError('Failed to upload attachment');
  }
}
```

#### 3.3 Update Create Project Function
```javascript
// In ProjectBoard.jsx - update createProject function
const createProject = async (e) => {
  e.preventDefault();
  setLoading(true);
  
  try {
    const projectData = {
      name: project.name,
      description: project.description,
      manager: selectedManager?.id || null,
      teams: selectedTeams.map(team => team.id),
      members: selectedMembers.map(member => member.id),
      dueDate: project.dueDate,
      visibility: project.visibility,
      status: project.status || 'Planning',
      avatarUrl: project.avatarUrl
    };

    const response = await axios.post("http://localhost:3000/api/projects", projectData, { 
      withCredentials: true 
    });

    console.log("Project created:", response.data);
    
    if (response.data.success) {
      // Add new project to the list
      setAllProjects(prev => [...prev, response.data.project]);
      
      // Close modal and reset form
      setProjectModal(false);
      setProjectData({
        name: "",
        description: "",
        manager: "",
        teams: [],
        members: [],
        attachments: [],
        dueDate: "",
        visibility: "",
        status: "",
        avatarUrl: "",
      });
      setSelectedMembers([]);
      setSelectedTeams([]);
      setSelectedManager(null);
    }
  } catch (error) {
    console.error("Project creation failed:", error);
    setError('Failed to create project');
  } finally {
    setLoading(false);
  }
}
```

---

## 🚀 EXECUTION PLAN (Next 2 Hours)

### ⏰ Time Block 1 (30 mins): File Upload APIs
1. Open your backend project routes
2. Update avatar upload endpoint
3. Update attachment upload endpoint  
4. Test with Postman or frontend

### ⏰ Time Block 2 (45 mins): Create Project API
1. Update project creation endpoint
2. Make sure it returns proper response format
3. Test project creation

### ⏰ Time Block 3 (30 mins): Frontend Updates
1. Update frontend API calls
2. Test the complete flow: avatar → attachments → create project
3. Debug any issues

### ⏰ Time Block 4 (15 mins): Quick Testing
1. Test complete project creation flow
2. Verify data appears correctly on frontend
3. Check console for any errors

---

## 🔧 QUICK DEBUGGING TIPS

### If Avatar Upload Fails:
- Check file field name matches (`avatar` vs `file`)
- Verify Cloudinary config is working
- Check file size limits

### If Project Creation Fails:
- Check required fields validation
- Verify token is being passed correctly
- Check database connection

### If Frontend Doesn't Update:
- Check state management in React
- Verify API response format matches expectations
- Check browser console for errors

---

## 🎯 SUCCESS CRITERIA

✅ Avatar upload works and returns URL  
✅ Attachment upload works and returns file info  
✅ Project creation works with uploaded files  
✅ New project appears in project list immediately  
✅ No console errors  

**Ready to start? Let's tackle the file uploads first! Which file should I help you update first - the avatar upload or the project creation endpoint?** 🚀
