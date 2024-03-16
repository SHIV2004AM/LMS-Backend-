import  app from './app.js'
import connectDB from './config/dbConnection.js'
import Razorpay  from 'razorpay'
import cloudinary from 'cloudinary' ; 
const PORT = process.env.PORT || 5002; 

// cloudinary configuration 

cloudinary.v2.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
})

/* export const razorpay = new Razorpay({
    key_id : process.env.RAZORPAY_KEY_ID , 
    key_secret : process.env.RAZORPAY_SECRET_KEY  }) ; */

app.listen(PORT , async () =>{
    await connectDB()
    console.log(`app is running at http://localhost:${PORT} `);
})