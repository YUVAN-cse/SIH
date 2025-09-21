import Student from "../models/student.model.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

// Login a student with credential verification
export const loginStudent = async (req, res) => {
  const { email, password } = req.body;

  try {
    const student = await Student.findOne({ email });
    console.log(student);
    if (!student) return res.status(400).json({ message: "Student not found" });

    // const isMatch = await bcrypt.compare(password, student.password);
    // if (!isMatch)
    //   return res.status(400).json({ message: "Invalid credentials" });

    if(student.password !== password) return res.status(400).json({ message: "Invalid credentials" });

    const token = jwt.sign({ id: student._id }, "your_jwt_secret", {
      expiresIn: "1h",
    });

    res.status(200)
    .cookie("accessToken", token, {
      httpOnly: true,
      secure: true,
      sameSite: "none",
      maxAge: 1000 * 60 * 55
    })
    .json({
      token,
      student,
      redirectTo: "/student/dashboard",
      message: "Login successful - redirecting to dashboard",
    });
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
};

//main dashboard view
export const getStudentDashboard = async (req, res) => {
  const studentId = req.studentId;

  try {
    const student = await Student.findById(studentId).populate([
      "attendanceInfo",
      "courseDetails",
      "feeStatus",
      "complaintPortal",
      "examHistory",
    ]);

    if (!student) return res.status(400).json({ message: "Student not found" });

    // Dashboard features
    res.status(200).json({
      profile: {
        name: student.name,
        email: student.email,
        studentId: student._id,
        profileImage: student.profileImage || null,
      },
      mainSections: {
        attendanceInfo: {
          totalClasses: student.attendanceInfo?.totalClasses || 0,
          attendedClasses: student.attendanceInfo?.attendedClasses || 0,
          attendancePercentage: student.attendanceInfo?.percentage || 0,
          recentAttendance: student.attendanceInfo?.recent || [],
        },
        courseDetails: {
          enrolledCourses: student.courseDetails?.enrolled || [],
          currentSemester: student.courseDetails?.semester || 1,
          academicYear:
            student.courseDetails?.academicYear || new Date().getFullYear(),
          subjects: student.courseDetails?.subjects || [],
        },
      },
      topNavigation: {
        fee: student.feeStatus || {},
        complaintPortal: student.complaintPortal || {},
        result: student.results || {},
        examHistory: student.examHistory || {},
        others: student.others || {},
      },
      sideNavigation: {
        timetable: student.timetable || {},
        chatBot: { available: true, status: "online" },
        events: student.events || [],
        library: student.library || {},
        ...(student.hasHostel && { hostel: student.hostel || {} }),
      },
    });
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
};

// Get attendance information
export const getAttendanceInfo = async (req, res) => {
  const studentId = req.studentId;

  try {
    const student = await Student.findById(studentId);
    if (!student) return res.status(400).json({ message: "Student not found" });

    res.status(200).json({
      attendanceInfo: student.attendanceInfo,
      attendanceDetails: {
        totalClasses: student.attendanceInfo?.totalClasses || 0,
        attendedClasses: student.attendanceInfo?.attendedClasses || 0,
        percentage: student.attendanceInfo?.percentage || 0,
        subjectWiseAttendance: student.attendanceInfo?.subjectWise || [],
        monthlyAttendance: student.attendanceInfo?.monthly || [],
      },
    });
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
};

// Get course details
export const getCourseDetails = async (req, res) => {
  const studentId = req.studentId;

  try {
    const student = await Student.findById(studentId);
    if (!student) return res.status(400).json({ message: "Student not found" });

    res.status(200).json({
      courseDetails: student.courseDetails,
      enrolledCourses: student.courseDetails?.enrolled || [],
      syllabus: student.courseDetails?.syllabus || {},
      faculty: student.courseDetails?.faculty || [],
      schedule: student.courseDetails?.schedule || {},
    });
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
};

// Get fee status
export const getFeeStatus = async (req, res) => {
  const studentId = req.studentId;

  try {
    const student = await Student.findById(studentId);
    if (!student) return res.status(400).json({ message: "Student not found" });

    res.status(200).json({
      feeStatus: student.feeStatus,
      paymentHistory: student.feeStatus?.paymentHistory || [],
      pendingFees: student.feeStatus?.pending || 0,
      totalFees: student.feeStatus?.total || 0,
    });
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
};

// Get complaint portal
export const getComplaintPortal = async (req, res) => {
  const studentId = req.studentId;

  try {
    const student = await Student.findById(studentId);
    if (!student) return res.status(400).json({ message: "Student not found" });

    res.status(200).json({
      complaintPortal: student.complaintPortal,
      activeComplaints: student.complaintPortal?.active || [],
      resolvedComplaints: student.complaintPortal?.resolved || [],
      complaintCategories: ["Academic", "Hostel", "Transport", "Fee", "Others"],
    });
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
};

// Get exam history
export const getExamHistory = async (req, res) => {
  const studentId = req.studentId;

  try {
    const student = await Student.findById(studentId);
    if (!student) return res.status(400).json({ message: "Student not found" });

    res.status(200).json({
      examHistory: student.examHistory,
      pastResults: student.examHistory?.results || [],
      upcomingExams: student.examHistory?.upcoming || [],
      gradeCard: student.examHistory?.gradeCard || {},
    });
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
};

// Get timetable
export const getTimetable = async (req, res) => {
  const studentId = req.studentId;

  try {
    const student = await Student.findById(studentId);
    if (!student) return res.status(400).json({ message: "Student not found" });

    res.status(200).json({
      timetable: student.timetable,
      weeklySchedule: student.timetable?.weekly || {},
      examSchedule: student.timetable?.exams || {},
    });
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
};

// Get events
export const getEvents = async (req, res) => {
  const studentId = req.studentId;

  try {
    const student = await Student.findById(studentId);
    if (!student) return res.status(400).json({ message: "Student not found" });

    res.status(200).json({
      events: student.events,
      upcomingEvents: student.events?.upcoming || [],
      registeredEvents: student.events?.registered || [],
    });
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
};

// Get library information
export const getLibrary = async (req, res) => {
  const studentId = req.studentId;

  try {
    const student = await Student.findById(studentId);
    if (!student) return res.status(400).json({ message: "Student not found" });

    res.status(200).json({
      library: student.library,
      borrowedBooks: student.library?.borrowed || [],
      fines: student.library?.fines || 0,
      reservedBooks: student.library?.reserved || [],
    });
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
};

// Get hostel information - only accessible if student opted for hostel
export const getHostel = async (req, res) => {
  const studentId = req.studentId;

  try {
    const student = await Student.findById(studentId);
    if (!student) return res.status(400).json({ message: "Student not found" });

    // to check if student has opted for hostel during registration
    if (!student.hasHostel) {
      return res.status(403).json({
        message:
          "Hostel access denied - Student has not opted for hostel facility",
      });
    }

    res.status(200).json({
      hostel: student.hostel,
      roomDetails: student.hostel?.room || {},
      messMenu: student.hostel?.mess || {},
      complaints: student.hostel?.complaints || [],
    });
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
};
