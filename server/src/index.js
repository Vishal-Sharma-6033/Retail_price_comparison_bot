import dotenv from 'dotenv';
import connectDB from './config/db.js';
import {app} from './app.js';

dotenv.config({
    path: '.env'
});

const port = process.env.PORT || 5000;
// Connect to MongoDB
connectDB()
.then(()=>{
    app.listen(port,()=>{
        console.log(`Server is running on port ${port}`);
    })
    app.on("error",(error)=>{
            console.error("Error in Express app:",error);
            throw error;
        })
})
.catch((err)=>{
    console.log("Error in connecting to DB:",err)
})

