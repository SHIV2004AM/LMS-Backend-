import Course from '../models/course.model.js'
import AppError from '../utils/error.util.js';
import fs from 'fs/promises'
import cloudinary from 'cloudinary'

const getAllCourses = async (req ,res , next ) =>{
    try {
        const courses = await Course.find({}).select('-lectures') ; 

        res.status(200).json({
            success : true  , 
            message : "all courses " , 
            courses
        })
    } catch (error) {
        res.status(500).json({
            success : false , 
            message : error.message 
        })
    }
   
}

const getLecturesByCourseId = async(req , res , next ) =>{
    try {
        const { id } = req.params ; 

        const course = await Course.findById(id)

        if(!course){
            return next(new AppError("no courses "))
        }

        res.status(200).json({
            success : true , 
            message : "course lectures Fetched " , 
            lectures : course.lectures 
        })
    } catch (e) {
        return next(new AppError(e.message , 500)) ; 
    }
}

const createCourse = async (req , res , next)=>{
    const {title , description , category , createdBy } = req.body ; 

    if(!title || !description || !category || !createdBy){
        return next(new AppError("all fields are required " , 500))
    }

    const course = await Course.create({
        title , 
        description ,
         category , 
         createdBy
    })

    if(!course) {
        return next (new AppError("cpurse could not be created please try again " , 500))
    }

    if(req.file) {
        const result=  await cloudinary.v2.uploader.upload(req.file.path , {
            folder : 'lms'
        })

        if(result) {
            course.thumbnail.public_id = result.public_id ; 
            course.thumbnail.secure_url = result.secure_url ; 
        }
        fs.rm(`uploads/${req.file.filename}`)
    }

    await course.save() ; 
    res.status(200).json({
        success : true  , 
        message : "course created sucessfully " , 
        course 
    })
}

const updateCourse = async (req , res , next)=>{
    try {
        const { id } = req.params ; 
        const course = await Course.findByIdAndUpdate(id , {
           $set : req.body  
        }  , {
            runValidators : true  
        }
        )
        if(!course) {
            return next(new AppError("course with given id does not exists " , 500))
        }

        res.status(200).json({
            success: true ,
            message : "course updated successfully " , 
            course 
        })
        
    } catch (e) {
        return next(new AppError(e.message , 500))
    }
}

const removeCourse = async (req , res , next)=>{
    try {
        const { id } = req.params 

        const course = await Course.findById(id) 

        if(!course) {
            return next (new AppError("course does not exist "  , 500))
        }

        await Course.findByIdAndDelete(id) ; 
        res.status(200).json({
            success : true , 
            message : "course deleted successfully "
        })

    } catch (e) {
        return next (new AppError(e.message  , 500))
    }
}

const addLecturesToCourseById = async (req , res ) =>{
    try {
        const {title , description} = req.body ; 

    if(!title || !description) {
        return next (new AppError("all fields are required  " , 500))
    }

    const {id} = req.params ; 

    const course = Course.findById(id) 

    if(!course) {
        return next (new AppError("course does not exists " , 500))
    }

    const lectureData = {
        title , 
        description , 
        lecture : {}
    }

        if(req.file) {
            const result=  await cloudinary.v2.uploader.upload(req.file.path , {
                folder : 'lms'
            })
    
            if(result) {
                lectureData.thumbnail.public_id = result.public_id ; 
                lectureData.thumbnail.secure_url = result.secure_url ; 
            }
            fs.rm(`uploads/${req.file.filename}`)
    }
    course.lectures.push(lectureData)

    course.numbersOfLectures = course.lectures.length ; 

    await course.save() ; 

    res.status(200).json({
        success : true , 
        message : "adding lecture successfull " ,
        course 
    })
    } catch (e) {
        return next (new AppError(e.message , 500))
    }
}
export {
    getAllCourses  , 
    createCourse , 
    getLecturesByCourseId , 
    updateCourse , 
    removeCourse , addLecturesToCourseById 

}