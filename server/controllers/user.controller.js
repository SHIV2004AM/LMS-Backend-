import User from "../models/user.model.js";
import AppError from "../utils/error.util.js"
import crypto from 'crypto'
import cloudinary from "cloudinary"
import fs from 'fs'
import sendEmail from "../utils/sendEmail.js";


const cookieOptions = {
    maxAge : 7 * 24 * 60 * 60 * 1000 , // 7 days 
    httpOnly : true , 
    secure : true 
}

const register = async (req , res , next)=>{
    const {fullName , email , password } = req.body ; 

    if(!fullName || !email || !password) {
        return next(new AppError('All fields are required ' , 400))
    }

    const userExists = await User.findOne({email})

    if(userExists) {
        return next(new AppError('user already exists ' , 400))
    }

    const user = await User.create({
        fullName , 
        email , 
        password , 
        avatar :{
            public_id : email , 
        }
    })

    if(!user) {
        return next(new AppError('user registration failed , try again later ' , 400)) 
    }
       

        if(req.file) {
            console.log(req.file);
            try {
                const result = await cloudinary.v2.uploader.upload(req.file.path , {
                 folder : "lms" , 
                width : 250 , 
                height : 250 , 
                gravity : 'faces',
                  crop :'fill'
                }) ; 

                if(result){
                    user.avatar.public_id = result.public_id ;
                    user.avatar.secure_url= result.secure_url

                    // remove file from server

                   fs.rm(`uploads/${req.file.filename}`)
                }
            } catch (e) {
                return next(new AppError(e || 'file not uploaded please try again ' , 400))
            }
        }

        await user.save() ; 
        user.password = undefined ;
        
        const token = await user.generateJWTToken() ; 

        res.cookie ('token' , token , cookieOptions)

        res.status(200).json({
            success : true , 
            message : 'user registered successfully ' , 
            user , 
        })


    }

const login =async  (req , res)=>{
    try {
        const { email , password } = req.body ; 

    if(!email || !password) {
        return next(new AppError('All fields are required ', 400)
    )}

    const user = await User.findOne({
        email
    }).select('+password')

    if(!uesr || !user.comparePassword(password )){
        return next(new AppError('email or password does not match ' , 400))
    }

    const token  = await user.generateJWTToken () ; 

     user.password = undefined ; 

     res.cookie('token' , token , cookieOptions) ; 

     res.status(200).json({
        success : true , 
        message : ' user logged in successfully ', 
        user 
     })
    } catch (error) {
        return next(new AppError(e.message, 500))
    }
}

const logout = (req , res)=>{
    res.cookie('token' , null , {
        secure : true , 
        maxAge : 0 , 
        httpOnly : true 
    })
    res.status(200).json({
        success : true , 
        message : 'user logged out successfully '
    })
}

const getProfile = async (req , res)=>{
    try {
        const userId = req.user.id ; 
    const user = await User.findById(userId)
    res.status(200).json({
        success: true , 
        message : 'user details ' , 
        user 
    })
    } catch (e) {
        return next(new AppError('failed to fetch profile detail' , 500))
    }
}

const forgotPassword = async (req ,res , next) =>{
    const {email} = req.body

    if(!email) {
        return next(new AppError('email is required' , 400)) ; 
    }
    const user = await user.findOne(email)

    if(!user){
        return next(new appError('user does not exists' , 400))
    }

    const resetToken = await user.generatePasswordResetToken()

    await user.save() ; 

    const resetPasswordURL = `${process.env.FRONTEND_URL}/reset-password/${resetToken}` ; 
    const subject = 'Reset Password';
    const message = `You can reset your password by clicking <a href=${resetPasswordUrl} target="_blank">Reset your password</a>\nIf the above link does not work for some reason then copy paste this link in new tab ${resetPasswordUrl}.\n If you have not requested this, kindly ignore.`;
    try {
        await sendEmail(email , subject , message)

        res.status(200).json({success : true ,
        message : ` reset password token has been sent to ${email}`})
    } catch (error) {
        user.forgotPasswordExpiry =  undefined 
        user.forgotPasswordToken = undefined 

        await user.save() ; 
        return next(new appError(error.message , 500))
        }
}


const resetPassword = async (req , res) =>{
    const {resetToken} = req.params ; 

    const{password} = req.body ; 

    const forgotPasswordToken = crypto.createHash('sha256').update(resetToken).digest('hex') ; 

    const user = await User.findOne({
        forgotPasswordToken , 
        forgotPasswordExpiry : {$gt : Date.now()}
    })
    if(!user) {
        return next(new appError('token is invalid or expired please try again ' , 400))
    }

    user.password = password ; 
    user.forgotPasswordToken = undefined 
    forgotPasswordExpiry = undefined ; 

    user.save() ;

    res.status(200).json({
        success : true ,
        message : 'user password changed successfully '
    })
} 

const changePassword = async (req , res) =>{
    const {oldPassword , newPassword} = req.user ; 

    if(!oldPassword || !newPassword){
        return next(new appError('all fields are mandatory ' , 400))
    }
    const user = await User.findById(id).select('+password') ; 

    if(!user) {
        return next(new appError('user does not exist ' , 400))
    }
    const isPasswordValid = await user.comparePassword(oldPassword) ; 

    if(!isPasswordValid) {
        return next(new appError('invalid old password' , 400))
    }

    user.password = newPassword ; 


    await user.save() ; 
    user.password = undefined 

    res.status(200).json({
       success : true , 
       message : 'user password changed successfully ' 
    }) ; 
}

const updateUser = async (req , res )=>{
    const{ fullName} = req.body 

    const {id} = req.params

    const user = await User.findById(id)

    if(!user) {
        return next(new appError("user does not exists " , 400))
    }

    if(req.fullName){
        user.fullName = fullName ; 
    }

    if(req.file) {
        await cloudinary.v2.uploader.destroy(user.avatar.public_id) ; 
        try {
            const result = await cloudinary.v2.uploader.upload(req.file.path , {
             folder : "lms" , 
            width : 250 , 
            height : 250 , 
            gravity : 'faces',
              crop :'fill'
            }) ; 

            if(result){
                user.avatar.public_id = result.public_id ;
                user.avatar.secure_url= result.secure_url

                // remove file from server

               fs.rm(`uploads/${req.file.filename}`)
            }
        } catch (e) {
            return next(new AppError(e || 'file not uploaded please try again ' , 400))
        }
    }
    await user.save() 
    res.status(200).json({
        success: true , 
        message:'user details updated successfully '
    })
    }


export{
    register , 
    logout , 
    login , 
    getProfile , 
    forgotPassword , 
    resetPassword , 
    changePassword , 
    updateUser 
}