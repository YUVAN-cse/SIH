export default { doc :{
  "documentId": "DL1234567890",
  "documentType": "marksCard",
  "issuedBy": "CBSE",
  "issuedTo": {
    "name": "Rahul Sharma",
    "dob": "2005-08-15",
    "rollNumber": "CBSE2025X123",
    "school": "XYZ Senior Secondary School"
  },
  "academicDetails": {
    "year": 2025,
    "class": "12th",
    "subjects": [
      { "name": "Mathematics", "marksObtained": 95, "totalMarks": 100 },
      { "name": "Physics", "marksObtained": 90, "totalMarks": 100 },
      { "name": "Chemistry", "marksObtained": 92, "totalMarks": 100 },
      { "name": "English", "marksObtained": 88, "totalMarks": 100 },
      { "name": "Computer Science", "marksObtained": 94, "totalMarks": 100 }
    ],
    "totalMarksObtained": 459,
    "totalMarks": 500,
    "percentage": 91.8,
    "grade": "A+"
  },
  "verification": {
    "status": "verified",
    "verifiedOn": "2025-09-20T10:30:00.000Z",
    "verificationMethod": "digitalSignature"
  },
  "metadata": {
    "documentUrl": "https://digilocker.gov.in/documents/marksCard/DL1234567890.pdf",
    "issuedAt": "2025-05-30T12:00:00.000Z",
    "expiryDate": null
  }
},

idProof: {
  "documentId": "ID9876543210",
  "documentType": "idProof",
  "issuedBy": "Government of India",
  "issuedTo": {
    "name": "Rahul Sharma",
    "dob": "2005-08-15",
    "idNumber": "A123456789",
    "address": "123, MG Road, New Delhi, Delhi, 110001"
  },
  "idDetails": {
    "idType": "Aadhaar",
    "issueDate": "2023-02-10",
    "expiryDate": "2033-02-10",
    "gender": "Male",
    "photoUrl": "https://example.com/photos/rahul_sharma_aadhaar.jpg"
  },
  "verification": {
    "status": "verified",
    "verifiedOn": "2025-09-20T10:45:00.000Z",
    "verificationMethod": "biometric"
  },
  "metadata": {
    "documentUrl": "https://digilocker.gov.in/documents/idProof/ID9876543210.pdf",
    "issuedAt": "2023-02-10T09:00:00.000Z",
    "expiryDate": "2033-02-10T00:00:00.000Z"
  }
}

}