import express from 'express'
import cors from 'cors'
import stripe, { Stripe } from "stripe"
import admissionRouter from './routes/admission.routes.js'

const app = express()

app.use(cors({
    origin: ['http://localhost:3000', process.env.CLIENT_URI],
    credentials: true
}))

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

app.use(express.json())
app.use(express.urlencoded({extended: true}))

app.use('/api/v1/admission', admissionRouter)

app.get('/', (req, res) => res.json({message: 'Hello World'}))

export default app