import express, { urlencoded } from 'express' ; 
import cors from "cors"
import cookieParser from  'cookie-parser';
import { config } from 'dotenv' ; 
config() ; 

import userRoutes  from './routes/user.routes.js'
import courseRoutes from './routes/course.routes.js'

// import paymentRoutes from './routes/payment.routes.js'

import morgan from 'morgan';

import errorMiddleware from './middlewares/error.middleware.js';

const app = express()  ; 

app.use(express.json()) ; 

app.use(cors({
    origin : [process.env.FRONTEND_URL] , 
    credentials : true
}))

app.use(cookieParser()) ; 
app.use(urlencoded({extended : true}))

app.use(morgan('dev')) ; 

app.use('/ping', (req , res)=>{
    res.send("pong")
})

app.use('/api/v1/user' , userRoutes)
app.use('/api/v1/courses' , courseRoutes)

// app.use('/api/v1/payments' , paymentRoutes)
//  routes of 3 modules 

app.use('*' , (req ,res)=>{
    res.status(404).send(" oops! 404 paage not found ")
}) ; 

app.use(errorMiddleware) ; 


export default app ; 