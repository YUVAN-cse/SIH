import mongoose from "mongoose";

const HostelSchema = new mongoose.Schema({
  hostelId: { type: String, unique: true, required: true }, // e.g. H1
  name: { type: String, required: true },                   // e.g. Boys Hostel Block A
  address: { type: String },
  warden: {
    name: String,
    phone: String,
    email: String
  },
  blocks: [
    {
      blockId: { type: String, required: true }, // e.g. A, B, C
      floors: [
        {
          floorNumber: { type: Number, required: true },
          rooms: [
            {
              roomId: { type: String, required: true }, // e.g. H1-A-101
              roomImage: { type: String ,  }, //required: true
              roomNumber: { type: Number, required: true },
              type: { type: String, enum: ["single", "double", "triple", "dorm"], required: true },
              capacity: { type: Number, required: true },
              beds: [
                {
                  bedId: { type: String, required: true }, // e.g. H1-A-101-1
                  occupiedBy: { type: mongoose.Schema.Types.ObjectId, ref: "Student", default: null }
                }
              ],
              facilities: [String], // e.g. ["AC", "Attached Bath"]
              status: { type: String, default: "active" },
              occupiedBy: [{ 
                type: mongoose.Schema.Types.ObjectId,
                ref: "Student",
                default: null
               }],
               bookedBy: [{ 
                type: mongoose.Schema.Types.ObjectId,
                ref: "Temp",
                default: null
               }],
               pricePerStudent: { type: Number  , default: 0 },
            }
          ]
        }
      ]
    }
  ],
  createdAt: { type: Date, default: Date.now }
});

export default mongoose.model("Hostel", HostelSchema);



// {
//   "hostelId": "H1",
//   "name": "Boys Hostel Block A",
//   "address": "Campus Road, XYZ University",
//   "warden": {
//     "name": "Mr. Ramesh Kumar",
//     "phone": "+91-9876543210",
//     "email": "warden.h1@xyz.edu"
//   },
//   "blocks": [
//     {
//       "blockId": "A",
//       "floors": [
//         {
//           "floorNumber": 1,
//           "rooms": [
//             {
//               "roomId": "H1-A-101",
//               "roomNumber": 101,
//               "type": "double",
//               "capacity": 2,
//               "beds": [
//                 { "bedId": "H1-A-101-1", "occupiedBy": "S2025001" },
//                 { "bedId": "H1-A-101-2", "occupiedBy": null }
//               ],
//               "facilities": ["Fan", "Attached Bath"],
//               "status": "active"
//             }
//           ]
//         }
//       ]
//     }
//   ]
// }
