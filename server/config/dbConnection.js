import mongoose from 'mongoose' ; 

mongoose.set('strictQuery' , false ) ; 

const connectDB = async ()=>{
    try {
        await mongoose.connect(process.env.MONGODB_URI ).then((conn)=>{
            console.log('database coonected ' , conn.connection.host);
        })
    } catch (error) {
        console.log("error : " , error.message);
        process.exit(1) ; 
    }
}
   

    export default connectDB ; 