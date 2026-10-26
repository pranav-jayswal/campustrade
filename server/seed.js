const dotenv = require('dotenv');
const connectDB = require('./config/db');
const Product = require('./models/Product');
const Event = require('./models/Event');
const User = require('./models/User');
const BountyRequest = require('./models/BountyRequest');
const LostAndFound = require('./models/LostAndFound');
const { sampleProducts, sampleBounties, sampleLostFound } = require('./utils/mockData');
const { sampleEvents } = require('./utils/mockEvents');

dotenv.config();

const adminUser = {
  name: 'Campus Administrator',
  email: 'admin@iar.ac.in',
  password: 'Password123!',
  role: 'admin',
  campus: 'Institute of Advanced Research, Gandhinagar',
  enrollmentNo: 'IAR/ADMIN/01',
  studentId: 'IAR/ADMIN/01',
  admissionYear: 2020,
  gradYear: 2024,
  isVerifiedStudent: true,
  phone: '+91 98765 00000',
};

const sampleStudent = {
  name: 'Aarav Patel',
  email: 'aarav@iar.ac.in',
  password: 'Password123!',
  role: 'student',
  campus: 'Institute of Advanced Research, Gandhinagar',
  enrollmentNo: 'IAR/11111',
  studentId: 'IAR/11111',
  admissionYear: 2023,
  gradYear: 2026,
  isVerifiedStudent: true,
  phone: '+91 98765 43210',
};

const seed = async () => {
  await connectDB();

  try {
    let admin = await User.findOne({ email: adminUser.email });
    if (!admin) {
      admin = await User.create(adminUser);
      console.log(`Seeded admin user: ${adminUser.email} / ${adminUser.password}`);
    }

    let student = await User.findOne({ email: sampleStudent.email });
    if (!student) {
      student = await User.create(sampleStudent);
      console.log(`Seeded verified student: ${sampleStudent.email}`);
    } else {
      student.campus = 'Institute of Advanced Research, Gandhinagar';
      student.enrollmentNo = 'IAR/11111';
      student.studentId = 'IAR/11111';
      student.admissionYear = 2023;
      student.isVerifiedStudent = true;
      student.phone = '+91 98765 43210';
      await student.save();
    }

    // Attach student seller ID and sanitize _id for fresh insertion
    const productsWithSeller = sampleProducts.map((p) => {
      const copy = { ...p };
      delete copy._id;
      return {
        ...copy,
        seller: student._id,
        campus: 'Institute of Advanced Research, Gandhinagar',
        status: 'available',
      };
    });

    await Product.deleteMany();
    await Product.insertMany(productsWithSeller);
    console.log(`Seeded ${productsWithSeller.length} products with rental, academic, and giveaway options.`);

    await Event.deleteMany();
    await Event.insertMany(sampleEvents);
    console.log(`Seeded ${sampleEvents.length} official campus events & campaigns.`);

    const bountiesWithUser = sampleBounties.map((b) => {
      const copy = { ...b };
      delete copy._id;
      return {
        ...copy,
        user: student._id,
      };
    });
    await BountyRequest.deleteMany();
    await BountyRequest.insertMany(bountiesWithUser);
    console.log(`Seeded ${bountiesWithUser.length} campus request/bounty board items.`);

    const lostFoundWithUser = sampleLostFound.map((lf) => {
      const copy = { ...lf };
      delete copy._id;
      return {
        ...copy,
        user: student._id,
      };
    });
    await LostAndFound.deleteMany();
    await LostAndFound.insertMany(lostFoundWithUser);
    console.log(`Seeded ${lostFoundWithUser.length} campus lost & found items.`);

    console.log('Seeding complete.');
    process.exit(0);
  } catch (error) {
    console.error('Seeding failed:', error.message);
    process.exit(1);
  }
};

seed();
