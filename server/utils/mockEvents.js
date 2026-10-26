/**
 * Curated campus events & campaigns for Institute of Advanced Research (IAR), Gandhinagar
 */

const sampleEvents = [
  {
    _id: '671151010000000000000001',
    title: 'IAR HackFest 2026: 24-Hour Campus Hackathon',
    description:
      'The flagship annual hackathon of the Department of Computer Science & Engineering. Solve real-world campus and industry challenges, build full-stack web/mobile apps or AI models. Cash prizes up to ₹40,000, sponsor swags, mentor sessions, and free dinner/breakfast included for participants.',
    category: 'Tech Fest & Hackathon',
    organizer: {
      name: 'Dr. D. K. Sharma (HOD CSE) & Coding Club',
      department: 'Department of Computer Science & Engineering',
      contactEmail: 'hackfest@iar.ac.in',
      phone: '+91 98765 43210',
    },
    bannerUrl:
      'https://images.unsplash.com/photo-1504384308090-c894fdcc538d?auto=format&fit=crop&w=1200&q=80',
    venue: 'IAR Central Computing Labs & Main Auditorium, Block A',
    eventDate: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000), // in 5 days
    eventTime: '09:00 AM (Saturday) - 10:00 AM (Sunday)',
    registrationDeadline: new Date(Date.now() + 4 * 24 * 60 * 60 * 1000),
    registrationType: 'paid_ticket',
    price: 99,
    totalCapacity: 120,
    registeredCount: 86,
    externalRegistrationUrl: '',
    status: 'upcoming',
    isUrgentNotice: true,
    attendees: [
      {
        studentName: 'Aarav Patel',
        email: 'aarav@iar.ac.in',
        enrollmentNo: 'IAR/2023/CSE/014',
        department: 'B.Tech CSE',
        ticketCode: 'IAR-HACK-4821',
        ticketType: 'Hacker Pass (Includes Swag Kit & Meals)',
        registeredAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
      },
      {
        studentName: 'Priya Sharma',
        email: 'priya@iar.ac.in',
        enrollmentNo: 'IAR/2023/CSE/089',
        department: 'B.Tech CSE',
        ticketCode: 'IAR-HACK-4822',
        ticketType: 'Hacker Pass (Includes Swag Kit & Meals)',
        registeredAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
      },
    ],
  },
  {
    _id: '671151010000000000000002',
    title: 'Hands-on CRISPR & Genomic Sequencing Masterclass',
    description:
      'Organized by the Department of Biological Sciences & Biotechnology. A 2-day intensive practical training session on gene editing tools, PCR amplification, agarose gel analysis, and bioinformatics sequence alignment. Certificate of completion awarded by the Dean of Research.',
    category: 'Workshop & Seminar',
    organizer: {
      name: 'Prof. Anjali Trivedi (Biotechnology Coordinator)',
      department: 'Department of Biological Sciences & Bio-Engineering',
      contactEmail: 'biotech.workshop@iar.ac.in',
      phone: '+91 98765 11223',
    },
    bannerUrl:
      'https://images.unsplash.com/photo-1532187863486-abf9dbad1b69?auto=format&fit=crop&w=1200&q=80',
    venue: 'Bio-Technology Research Lab 102 & Seminar Hall 3',
    eventDate: new Date(Date.now() + 8 * 24 * 60 * 60 * 1000),
    eventTime: '10:00 AM - 04:30 PM',
    registrationDeadline: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
    registrationType: 'free_rsvp',
    price: 0,
    totalCapacity: 60,
    registeredCount: 47,
    externalRegistrationUrl: '',
    status: 'upcoming',
    isUrgentNotice: false,
    attendees: [
      {
        studentName: 'Rohan Mehta',
        email: 'rohan.biotech@iar.ac.in',
        enrollmentNo: 'IAR/2024/BIO/023',
        department: 'B.Sc Biotechnology',
        ticketCode: 'IAR-BIO-9102',
        ticketType: 'Free Student Delegate RSVP',
        registeredAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
      },
    ],
  },
  {
    _id: '671151010000000000000003',
    title: 'Campus Blood Donation & Free Health Screening Camp',
    description:
      'Annual university health welfare drive organized by IAR Student Affairs in association with Red Cross Society Gandhinagar. Includes complete blood group typing, hemoglobin test, dental checkup, and refreshments for all donors. Every donor receives a donor card and certificate of appreciation.',
    category: 'Campus Campaign',
    organizer: {
      name: 'Dean Student Welfare & NSS Unit IAR',
      department: 'Office of Student Affairs & Campus Wellness',
      contactEmail: 'welfare@iar.ac.in',
      phone: '+91 98765 99887',
    },
    bannerUrl:
      'https://images.unsplash.com/photo-1615461066841-6116e61058f4?auto=format&fit=crop&w=1200&q=80',
    venue: 'IAR Campus Health Centre & Activity Lounge, Ground Floor',
    eventDate: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000),
    eventTime: '09:30 AM - 03:00 PM',
    registrationDeadline: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000),
    registrationType: 'free_rsvp',
    price: 0,
    totalCapacity: 250,
    registeredCount: 168,
    externalRegistrationUrl: '',
    status: 'upcoming',
    isUrgentNotice: true,
    attendees: [],
  },
  {
    _id: '671151010000000000000004',
    title: 'Robotics & IoT Embedded Systems Bootcamp',
    description:
      'Learn hands-on sensor integration, ESP32 Wi-Fi microcontroller programming, and motor drivers to build autonomous campus rovers. Hardware component kit provided to all registered participants to take home for semester projects.',
    category: 'Workshop & Seminar',
    organizer: {
      name: 'Prof. K. R. Solanki (HOD Electrical & ECE)',
      department: 'Department of Electrical & Electronics Engineering',
      contactEmail: 'robotics@iar.ac.in',
      phone: '+91 98765 33445',
    },
    bannerUrl:
      'https://images.unsplash.com/photo-1485827404703-89b55fcc595e?auto=format&fit=crop&w=1200&q=80',
    venue: 'Robotics Fabrication Lab, Engineering Workshop Block',
    eventDate: new Date(Date.now() + 12 * 24 * 60 * 60 * 1000),
    eventTime: '11:00 AM - 05:00 PM',
    registrationDeadline: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000),
    registrationType: 'paid_ticket',
    price: 149,
    totalCapacity: 50,
    registeredCount: 38,
    externalRegistrationUrl: '',
    status: 'upcoming',
    isUrgentNotice: false,
    attendees: [],
  },
  {
    _id: '671151010000000000000005',
    title: 'IAR Annual Cultural & Inter-College Sports Carnival (VIBRANCE 2026)',
    description:
      'Official 3-day inter-college mega festival featuring box cricket, badminton tournaments, street dance battles, acoustic battle of the bands, debate championships, and food stalls. Team registrations and bracket rules are managed via the official university sports portal.',
    category: 'Cultural & Sports',
    organizer: {
      name: 'IAR Cultural & Sports Council',
      department: 'University Sports Board & Directorate of Youth Affairs',
      contactEmail: 'vibrance@iar.ac.in',
      phone: '+91 98765 66778',
    },
    bannerUrl:
      'https://images.unsplash.com/photo-1492684223066-81342ee5ff30?auto=format&fit=crop&w=1200&q=80',
    venue: 'IAR Sports Complex, Open-Air Amphitheatre & University Ground',
    eventDate: new Date(Date.now() + 18 * 24 * 60 * 60 * 1000),
    eventTime: '08:00 AM - 09:00 PM (3 Days)',
    registrationDeadline: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000),
    registrationType: 'external_link',
    price: 0,
    totalCapacity: 500,
    registeredCount: 312,
    externalRegistrationUrl: 'https://iar.ac.in/events/vibrance-2026',
    status: 'upcoming',
    isUrgentNotice: false,
    attendees: [],
  },
];

module.exports = {
  sampleEvents,
};
