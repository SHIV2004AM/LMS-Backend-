/*import Payment from "../models/payment.model.js"
import User from "../models/user.model.js"
import { razorpay } from "../server.js"
import AppError from "../utils/error.util.js"

import crypto from 'crypto'

export const getRazorPayApiKey = async (req , res , next ) =>{
    res.status(200).json({
        success : true , 
        message : "razorpay api key " ,
        key : process.env.RAZORPAY_KEY_ID
    })
}

export const buySubscription = async (req , res , next ) =>{
    const {id} = req.user
    const user = await User.findById(id); 

    if(!user) {
        return next (new AppError("unauthorized please login "))
    }

    if(user.role === 'ADMIN'){
        return next (new AppError('Admin can not purchase a subscription ' , 400))
    }

    const subscription = await razorpay.subscriptions.create({
        plan_id : process.env.RAZORPAY_PLAN_ID , 
        customer_notify : 1
    })

    user.subscription.id = subscription.id ; 
    user.subscription.status = subscription.status ; 

    await user.save() ; 
    res.status(200).json({
        success: true , 
        message : "subscribed successfully ", 
        subscription_id : subscription.id 
    })
}

export const verifySubscription = async (req , res , next ) =>{
    const {id}= req.user 

    const {razorpay_payment_id , razorpay_signature , razorpay_subscription_id} = req.body

    const user = await User.findById(id)

    if(!user) {
        return next (new AppError("unauthorized please login "))
    }

    const subscription = user.subscription.id ; 

    const generatedSignature = crypto.createHmac('sha256' , process.env.RAZORPAY_SECRET).update(`${razorpay_payment_id}|${subscriptionId}`).digest('hex') ; 

    if(generatedSignature !== razorpay_signature) {
        return next (new AppError('payment not verified' , 500))
    }

    await Payment.create({
        razorpay_payment_id , razorpay_signature , razorpay_subscription_id
    })

    user.subscription.status = 'active' ; 

    await user.save() ;
    
    res.status(200).json({
        success:true , 
        message : 'payment verified successfully '
    })
}

export const cancelSubscription = async (req , res , next ) =>{
   try {
    const {id} = req.user

    const user = await User.findById(id)

    if(!user) {
        return next (new AppError("unauthorized please login "))
    }

    if(user.role === 'ADMIN'){
        return next (new AppError('Admin can not cancel a subscription ' , 400))
    }

    const subscriptionId = user.subscription.id

    const subscription = await razorpay.subscriptions.cancel(subscriptionId)

    user.subscription.status = subscription.status
   } catch (e) {
    return next(new AppError(e.message , 500))
   } 
}

export const allPayments = async (req , res , next ) =>{
    const {count} = req.query ;

    const subscriptions = await razorpay.subscriptions.all({count : count || 10})

    res.status(200).json({
        success :  true , 
        message :"all payments", 
        subscriptions
    })
}
*/