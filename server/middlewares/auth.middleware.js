import AppError from "../utils/error.util.js"

import jwt from 'jsonwebtoken'

const isLoggedIn = async  (req , res , next ) =>{
    const { token } = req.cookies

    if(!token){
        return next(new AppError('un authenticated , please login ' , 401))
    }

    const userDetails = await jwt.verify(token , process.env.JWT_SECRET) ; 

    req.user = userDetails ; 

    next() ; 
}

const authorizedRoles = (...roles) => async(req , res , next ) => {
    const currentUserRole = req.user.role ; 

    if(!roles.includes(currentUserRole)){
        return next(new AppError("access denied " , 403))
    }
    next() ; 
}

const authorizeSubscriber = async  (req , res , next ) =>{
    const subscription = req.user.subscription ; 
    const currentUserRole = req.user.role ;

    if(currentUserRole !== 'ADMIN' && subscription.status !== 'active'){
        return next(new AppError('please subscribe to access ' , 403))
    }
}

export {
    isLoggedIn , 
    authorizedRoles , 
    authorizeSubscriber
}