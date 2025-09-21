import express from 'express'
import cors from 'cors'
import admissionRouter from './routes/admission.routes.js'
import studentRoutes from './routes/students.route.js'
import libraryRoutes from './routes/library.routes.js'
import adminRoutes from './routes/admin.route.js'
import roleBasedLoginRoutes from './routes/rolebasedlogin.routes.js'
import cookieParser from 'cookie-parser'
import "./job/autoCancelBookings.js";

const app = express()

app.use(cors({
    origin: ['http://localhost:3000', process.env.CLIENT_URI],
    credentials: true
}))

app.use(cookieParser())

app.use(express.json())
app.use(express.urlencoded({extended: true}))

app.use('/api/v1/admission', admissionRouter)
app.use('/api/v1/students', studentRoutes)
app.use('/api/v1/library', libraryRoutes)
app.use('/api/v1/admin', adminRoutes)
app.use('/api/v1/role-login', roleBasedLoginRoutes)


app.get('/', (req, res) => res.json({message: 'Hello World'}))

export default app


/*
    admin dashboard 
1. Overview / Analytics
Total students enrolled (with filters by year, department, course).
Total faculty & staff count.
Active hostel bookings (occupied vs available rooms).
Fee collection summary (paid vs pending vs overdue).
Library statistics:
Total books
Issued books
Pending returns
Fines collected
Pending NOC requests.
Real-time notifications (e.g., failed payments, pending approvals).
2. Student Management
View student profiles (personal + academic + hostel + library + fee history).
Approve/reject student admission requests.
Issue NOC certificates (auto-generate PDF).
Assign hostel rooms during admissions.
Track fee dues and send reminders.
3. Faculty & Staff Management
Add/update/remove faculty accounts.
Assign roles (e.g., Librarian, Warden, Accountant).
Track staff activity logs (e.g., which librarian issued a book).
4. Hostel Management
View all hostels & rooms (occupied vs available).
Approve/reject hostel booking requests.
Set room rent/fees.
Generate hostel-wise reports.
5. Fee Management
Track all payments (filter by tuition/hostel/library fines).
Generate & download receipts.
Refund handling (if applicable).
Payment failure logs.
Integration with payment gateways (Stripe/Razorpay).
6. Library Management
View all sections and books.
Add/remove books, update stock.
Track borrowed, reserved, overdue books.
Auto fine calculation for late returns.
Reports: Most borrowed books, active readers.
7. NOC & Certificate Automation
View all student requests for NOC.
Auto-generate & sign digital NOC certificates.
Track issued certificates (with audit logs).
8. System Administration
Manage Admin roles (superadmin, admin, librarian, warden, accountant).
Manage access control (who can do what).
Backup/restore system data.
Audit logs (all actions by admins, students, staff).
9. Reports & Exports
Export data in Excel/PDF:
Student lists
Hostel occupancy
Fee reports
Library transactions
Scheduled email reports to superadmins.
10. Notifications & Communication
Push/email/SMS notifications to students & faculty.
Fee due reminders.
Book return reminders.
Hostel allocation updates.
Smart Automation (your theme):
Auto-cancel hostel booking if fee not paid in X days.
Auto-cancel library book reservation if not picked up in 24h.
Auto-generate fee receipts and NOCs.
Cron jobs to send reminders & generate reports nightly.
*/