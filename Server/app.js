const express = require('express')
const authRoute = require("./routes/authRoute")
const cors = require("cors")
const session = require("express-session")
const cookieParser = require('cookie-parser')
const passport = require("passport")
const userData = require("./routes/userData")
const taskRoutes = require("./routes/taskRoutes")
require('dotenv').config()
require("./config/passport")
const protectedDashboardRoute = require("./routes/protectedDashboardRoute")
const projectRoutes = require("./routes/projectRoutes")
const entrepriseRoute = require("./routes/entrepriseRoute")
const socketIO = require("socket.io");
const {socketHandler}=require("./socket/socket")
const chatRoute = require("./routes/chatRoute")
const notificationRoute = require("./routes/notificationRoute")
const calendarRoute = require("./routes/calendarRoute")
const teamRoutes = require("./routes/teamRoutes")
const settingRoute = require("./routes/settingRoute")
const newsetterRoute = require("./routes/newsletterRoute")
const http = require("http")


const app = express()

const server = http.createServer(app)

app.use(express.json())
app.use(cors({
    origin:'http://localhost:5173',
    credentials:true
}
))
const io = socketIO(server, {
  cors: {
    origin: "http://localhost:5173",
    credentials:true, 
    methods: ["GET", "POST"]
  }
});
// socket Hnadler

socketHandler(io)
app.set('io', io);
// to use real time socket in controller we create this global middleware to call io in any controller using req.io
app.use((req,res,next)=>{

  req.io = io

  next()
})
app.subscribe
app.use(cookieParser())
app.use(session({
  secret: process.env.SESSION_KEY ,
  resave: false,
  saveUninitialized: false,
  cookie: {
    httpOnly: true,
    secure: false, 
    maxAge: 1000 * 60 * 60 * 24 
  }
}));
app.use(passport.initialize())
app.use(passport.session())

app.use('/auth',authRoute)
app.use("/entreprise/api",entrepriseRoute)
app.use('/api',userData)
app.use('/dashboard',protectedDashboardRoute)
app.use('/project/api',projectRoutes)
app.use('/task/api',taskRoutes)
app.use("/chat/api",chatRoute)
app.use("/calendar/api",calendarRoute)
app.use("/team/api",teamRoutes)
app.use("/notification/api",notificationRoute)
app.use("/setting/api",settingRoute)
app.use("/newsLetter",newsetterRoute)


module.exports = {app,io,server}