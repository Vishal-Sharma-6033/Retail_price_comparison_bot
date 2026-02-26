import "dotenv/config";
import connectDB from './config/db.js';
import {app} from './app.js';

// Import all models to register them
import { User } from './models/user.models.js';
import { Product } from './models/product.models.js';
import { Shop } from './models/shop.models.js';
import { Notification } from './models/notifications.models.js';
import { PriceListing } from './models/priceListing.models.js';
import { PriceHistory } from './models/pricehistory.models.js';

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

