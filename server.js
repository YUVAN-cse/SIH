import mongoose from "mongoose";
import path from "path"; // adjust path
import Hostel from "./models/hostel.model.js";


const sampleHostelData = [
  {
    hostelId: "H1",
    name: "Boys Hostel Block A",
    address: "Campus Road, XYZ University",
    warden: {
      name: "Mr. Ramesh Kumar",
      phone: "+91-9876543210",
      email: "warden.h1@xyz.edu"
    },
    blocks: [
      {
        blockId: "A",
        floors: [
          {
            floorNumber: 1,
            rooms: [
              {
                roomId: "H1-A-101",
                roomImage: "https://example.com/room-images/H1-A-101.jpg",
                roomNumber: 101,
                type: "double",
                capacity: 2,
                beds: [
                  { bedId: "H1-A-101-1", occupiedBy: null },
                  { bedId: "H1-A-101-2", occupiedBy: null }
                ],
                facilities: ["Fan", "Attached Bath"],
                status: "active",
                occupiedBy: [],
                bookedBy: [],
                pricePerStudent: 5000
              },
              {
                roomId: "H1-A-102",
                roomImage: "https://example.com/room-images/H1-A-102.jpg",
                roomNumber: 102,
                type: "single",
                capacity: 1,
                beds: [{ bedId: "H1-A-102-1", occupiedBy: null }],
                facilities: ["AC", "Attached Bath"],
                status: "active",
                occupiedBy: [],
                bookedBy: [],
                pricePerStudent: 8000
              },
              {
                roomId: "H1-A-103",
                roomImage: "https://example.com/room-images/H1-A-103.jpg",
                roomNumber: 103,
                type: "triple",
                capacity: 3,
                beds: [
                  { bedId: "H1-A-103-1", occupiedBy: null },
                  { bedId: "H1-A-103-2", occupiedBy: null },
                  { bedId: "H1-A-103-3", occupiedBy: null }
                ],
                facilities: ["Fan"],
                status: "active",
                occupiedBy: [],
                bookedBy: [],
                pricePerStudent: 4500
              }
            ]
          },
          {
            floorNumber: 2,
            rooms: [
              {
                roomId: "H1-A-201",
                roomImage: "https://example.com/room-images/H1-A-201.jpg",
                roomNumber: 201,
                type: "double",
                capacity: 2,
                beds: [
                  { bedId: "H1-A-201-1", occupiedBy: null },
                  { bedId: "H1-A-201-2", occupiedBy: null }
                ],
                facilities: ["Fan", "Attached Bath"],
                status: "active",
                occupiedBy: [],
                bookedBy: [],
                pricePerStudent: 5200
              },
              {
                roomId: "H1-A-202",
                roomImage: "https://example.com/room-images/H1-A-202.jpg",
                roomNumber: 202,
                type: "single",
                capacity: 1,
                beds: [{ bedId: "H1-A-202-1", occupiedBy: null }],
                facilities: ["AC", "Attached Bath"],
                status: "active",
                occupiedBy: [],
                bookedBy: [],
                pricePerStudent: 8500
              },
              {
                roomId: "H1-A-203",
                roomImage: "https://example.com/room-images/H1-A-203.jpg",
                roomNumber: 203,
                type: "triple",
                capacity: 3,
                beds: [
                  { bedId: "H1-A-203-1", occupiedBy: null },
                  { bedId: "H1-A-203-2", occupiedBy: null },
                  { bedId: "H1-A-203-3", occupiedBy: null }
                ],
                facilities: ["Fan"],
                status: "active",
                occupiedBy: [],
                bookedBy: [],
                pricePerStudent: 4600
              }
            ]
          }
        ]
      }
    ]
  }
];



// Connect to MongoDB
mongoose.connect("mongodb://localhost:27017/SIH");


// Insert sample data
async function importSampleData() {
  try {
    
    await Hostel.deleteMany();
    const inserted = await Hostel.insertMany(sampleHostelData);
    console.log(`✅ Inserted ${inserted.length} hostel records`);

    mongoose.connection.close();
  } catch (err) {
    console.error(err);
  }
}

importSampleData();
