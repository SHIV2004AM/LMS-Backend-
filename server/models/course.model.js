import mongoose from "mongoose";

const courseSchema = new mongoose.Schema({
    title :{
        type : String ,
        required : [true , 'title is required ' ] , 
        minLength: [8 , ' min 8 char' ] , 
        maxLength : [60 ,'max 60 char' ] , 
        trim : true 
    } ,
    description :{
        type : String , 
        required : [true , 'title is required ' ] , 
        minLength: [8 , ' min 8 char' ] , 
        maxLength : [200 ,'max 200 char' ] , 
        trim : true 
    } , 
    category :{
        type : String , 
        required : [true , 'category is required ' ] , 
    } , 
    thumbnail :{
        public_id :{
            type : String , 
        } , 
        secure_url :{
            type : String ,
        }
    } , 
    lectures:[ 
        {
        title : String , 
        description : String , 
        lecture :{
            public_id :{
                type : String , 
            } , 
            secure_url :{
                type : String ,
            }
        }
    }
 ] , 
 numbersOfLectures :{
    type : Number , 
    default : 0 
 } ,
 createdBy :{
    type : String , 
    required : true , 
 } 

} , {timestamps : true}) ; 

const Course = mongoose.model('Course' , courseSchema) ; 

export default Course ; 