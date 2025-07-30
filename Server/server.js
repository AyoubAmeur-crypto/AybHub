const {app,server} = require("./app")
require('dotenv').config()
const mongoose = require('mongoose')


const PORT = process.env.PORT_NAME 
const DB_URL = process.env.MONGO_URI


server.listen(PORT,()=>{

    console.log(`connected successfuly to the port ${PORT} `);
    
})


mongoose.connect(DB_URL).then(()=>{console.log("DB CONNECTED SUCCESSFULY");
}).catch((err)=>{console.log("can't connect to the db due to this",err);
})