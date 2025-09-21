import express from 'express'
import cors from 'cors'
import  { Stripe } from "stripe"
import admissionRouter from './routes/admission.routes.js'
import cookieParser from 'cookie-parser'
import "./jobs/autoCancelBookings.js";


const app = express()

app.use(cors({
    origin: ['http://localhost:3000', process.env.CLIENT_URI],
    credentials: true
}))

app.use(cookieParser())

app.use(express.json())
app.use(express.urlencoded({extended: true}))

app.use('/api/v1/admission', admissionRouter)

app.get('/', (req, res) => res.json({message: 'Hello World'}))

export default app