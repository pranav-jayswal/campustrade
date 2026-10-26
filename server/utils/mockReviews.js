/**
 * Curated student & staff reviews for CampusTrade items at Institute of Advanced Research (IAR)
 */

const productReviewsMap = {
  'Calculus: Early Transcendentals Textbook': [
    {
      name: 'Devansh Shah',
      role: 'student',
      department: 'B.Tech ICT · 2nd Year',
      rating: 5,
      title: 'Saved me ₹700, perfect condition for Math-101!',
      comment: 'Mandatory textbook for first-year math syllabus at IAR. All integration and multi-variable formulas and problem sets are clean. Minimal pencil marks that can be easily erased.',
      verifiedPurchase: true,
      meetupSpot: 'Central Library Lawn',
      helpfulCount: 14,
      dateStr: '3 days ago',
    },
    {
      name: 'Priya Sharma',
      role: 'student',
      department: 'B.Tech CSE · 3rd Year',
      rating: 4,
      title: 'Prompt exchange near campus canteen',
      comment: 'Seller arrived right on time at the canteen after 2nd lecture. Book binding is intact and solved practice exercises in the appendix are super handy for exams.',
      verifiedPurchase: true,
      meetupSpot: 'Main Canteen',
      helpfulCount: 8,
      dateStr: '1 week ago',
    },
    {
      name: 'Rohan Mehta',
      role: 'student',
      department: 'B.Sc Biotechnology · 1st Year',
      rating: 5,
      title: 'Essential for mid-sem prep',
      comment: 'Book is like new. Covers differential equations and series tests thoroughly. Recommended over buying a new ₹1200 edition from the store.',
      verifiedPurchase: true,
      meetupSpot: 'Academic Block Quad',
      helpfulCount: 6,
      dateStr: '2 weeks ago',
    },
  ],

  'Organic Chemistry Textbook, 8th Edition': [
    {
      name: 'Kavita Desai',
      role: 'student',
      department: 'M.Sc Chemistry · 2nd Year',
      rating: 5,
      title: 'Invaluable for reaction mechanisms & synthesis',
      comment: 'Highlighted in neat pastel colors for major organic pathways (aldol condensation, Grignard reagents). Got me through Dr. Shah’s mid-sem exams with high marks!',
      verifiedPurchase: true,
      meetupSpot: 'Chemistry Dept Corridor',
      helpfulCount: 11,
      dateStr: '4 days ago',
    },
    {
      name: 'Rahul Joshi',
      role: 'student',
      department: 'B.Tech Chemical · 3rd Year',
      rating: 4,
      title: 'Good condition, fair price',
      comment: 'Cover has very minor edge wear but pages and colored orbital illustrations are crystal clear. Quick and honest deal near Biotech entrance.',
      verifiedPurchase: true,
      meetupSpot: 'Biotech Lab Entrance',
      helpfulCount: 5,
      dateStr: '10 days ago',
    },
  ],

  'Introduction to Circuit Analysis': [
    {
      name: 'Varun Bhatt',
      role: 'student',
      department: 'B.Tech Electrical · 2nd Year',
      rating: 5,
      title: 'Definitive reference for EEE breadboard labs',
      comment: 'Covers Kirchhoff’s voltage laws, Thévenin theorem, and AC impedance analysis step by step. Hardcover edition with zero torn pages.',
      verifiedPurchase: true,
      meetupSpot: 'ECE Lab 204',
      helpfulCount: 9,
      dateStr: '5 days ago',
    },
    {
      name: 'Ankit Trivedi',
      role: 'student',
      department: 'B.Tech CSE · 2nd Year',
      rating: 4,
      title: 'Helped a lot for hardware course',
      comment: 'Very practical diagrams. The seller even threw in handwritten summary sheets for operational amplifiers. Great campus spirit!',
      verifiedPurchase: true,
      meetupSpot: 'Student Activity Center',
      helpfulCount: 4,
      dateStr: '2 weeks ago',
    },
  ],

  'Scientific Calculator (Casio fx-991EX ClassWiz)': [
    {
      name: 'Siddharth Patel',
      role: 'student',
      department: 'B.Tech Mechanical · 3rd Year',
      rating: 5,
      title: 'Genuine ClassWiz fx-991EX! Permitted in exams',
      comment: 'Solves 4x4 matrices, polynomial roots, and vectors in seconds. Both solar strip and battery work flawlessly. The display is high resolution with zero dead pixels.',
      verifiedPurchase: true,
      meetupSpot: 'Main Academic Quad',
      helpfulCount: 23,
      dateStr: 'Yesterday',
    },
    {
      name: 'Neha Dave',
      role: 'student',
      department: 'B.Tech Electrical · 2nd Year',
      rating: 5,
      title: 'Crisp keys and original slide-on cover',
      comment: 'Non-programmable so professors allow it in all GTU/IAR university exams. Clean keys with responsive tactile feedback.',
      verifiedPurchase: true,
      meetupSpot: 'Central Library Steps',
      helpfulCount: 16,
      dateStr: '6 days ago',
    },
    {
      name: 'Devansh Shah',
      role: 'student',
      department: 'B.Tech ICT · 1st Year',
      rating: 5,
      title: 'Quick seller demonstration before purchase',
      comment: 'Met at the library and seller let me test the complex number mode and equation solver before paying via UPI. Highly recommended.',
      verifiedPurchase: true,
      meetupSpot: 'IAR Canteen',
      helpfulCount: 7,
      dateStr: '2 weeks ago',
    },
  ],

  'Wireless Earbuds with Noise Isolation': [
    {
      name: 'Aditya Parmar',
      role: 'student',
      department: 'B.Tech CSE · 4th Year',
      rating: 5,
      title: 'Great battery backup for library study sessions',
      comment: 'Case charges quickly and holds 4 full charges. Passive sound isolation is surprisingly effective when students are chatting nearby in the reading hall.',
      verifiedPurchase: true,
      meetupSpot: 'Hostel Gate A',
      helpfulCount: 18,
      dateStr: '2 days ago',
    },
    {
      name: 'Riddhi Prajapati',
      role: 'student',
      department: 'B.Tech Biotech · 2nd Year',
      rating: 4,
      title: 'Crisp microphone for online presentations',
      comment: 'Touch controls for pausing lectures work reliably. Bass is punchy and fits comfortably during long commutes from Ahmedabad to Gandhinagar.',
      verifiedPurchase: true,
      meetupSpot: 'Campus Cafe',
      helpfulCount: 12,
      dateStr: '5 days ago',
    },
  ],

  'Fast Laptop Charger (65W Type-C GaN)': [
    {
      name: 'Bhavin Chauhan',
      role: 'student',
      department: 'B.Tech CSE · 3rd Year',
      rating: 5,
      title: 'Super compact GaN brick, charges laptop + phone',
      comment: 'Small enough to fit in my hoodie pocket. Doesn’t heat up during heavy Android Studio compilation. Braided 2-meter cable is heavy duty.',
      verifiedPurchase: true,
      meetupSpot: 'Library Ground Floor',
      helpfulCount: 15,
      dateStr: '3 days ago',
    },
    {
      name: 'Tanvi Solanki',
      role: 'student',
      department: 'BCA · 2nd Year',
      rating: 5,
      title: 'Tested full 65W fast charging speed',
      comment: 'Fast-charges my Dell Inspiron from 10% to 80% in under 50 minutes. Foldable pins make it safe to carry in a backpack without scratching notebooks.',
      verifiedPurchase: true,
      meetupSpot: 'Academic Block B',
      helpfulCount: 9,
      dateStr: '1 week ago',
    },
  ],

  'Compact Hostel Mini Fridge (45L Single Door)': [
    {
      name: 'Dhruv Zala',
      role: 'student',
      department: 'Hostel Resident · Block C',
      rating: 5,
      title: 'Hostel summer lifesaver, whisper quiet',
      comment: 'Makes ice cubes in the top chamber in about 90 minutes. Motor is completely quiet at night, didn’t disturb my roommate. Chills bottled water, fruits, and cold brew.',
      verifiedPurchase: true,
      meetupSpot: 'Hostel Reception',
      helpfulCount: 17,
      dateStr: '4 days ago',
    },
    {
      name: 'Parth Soni',
      role: 'student',
      department: 'Hostel Resident · Block B',
      rating: 4,
      title: 'Clean condition, low power consumption',
      comment: 'Seller helped me carry it down to the elevator. Gasket seal is tight and interior is clean. Great deal for anyone living in campus hostels.',
      verifiedPurchase: true,
      meetupSpot: 'Hostel Gate',
      helpfulCount: 8,
      dateStr: '12 days ago',
    },
  ],

  'LED Study Desk Lamp with Warm/White Modes': [
    {
      name: 'Pooja Rathod',
      role: 'student',
      department: 'BBA · 2nd Year',
      rating: 5,
      title: 'Warm mode is gentle on eyes for late night study',
      comment: 'Gooseneck holds its position firmly. I use the warm 3000K mode during 2 AM exam revisions so my roommate can sleep without glare. Works on any USB port.',
      verifiedPurchase: true,
      meetupSpot: 'Hostel Block B Entrance',
      helpfulCount: 13,
      dateStr: '2 days ago',
    },
    {
      name: 'Karan Varma',
      role: 'student',
      department: 'B.Sc CS · 1st Year',
      rating: 5,
      title: 'Touch dimmer works like a charm',
      comment: 'Stepless brightness dimming. Small desk footprint left plenty of space for my laptop and reference books.',
      verifiedPurchase: true,
      meetupSpot: 'Main Canteen',
      helpfulCount: 7,
      dateStr: '1 week ago',
    },
  ],

  'Hostel Bedside Storage Caddy & Organizer': [
    {
      name: 'Manish Patel',
      role: 'student',
      department: 'Hostel Resident · Block A',
      rating: 5,
      title: 'Clamps securely onto bunk bed guardrail',
      comment: 'Deep pockets easily hold my 1L steel water flask, phone, glasses case, and iPad. Heavy duty felt doesn’t stretch or rip.',
      verifiedPurchase: true,
      meetupSpot: 'Hostel Courtyard',
      helpfulCount: 14,
      dateStr: 'Yesterday',
    },
    {
      name: 'Sneha Joshi',
      role: 'student',
      department: 'Hostel Resident · Block D',
      rating: 4,
      title: 'Solved my dormitory space problem',
      comment: 'No need to climb down the bunk bed ladder in the dark to grab phone or water. Color matches the dorm wooden furniture nicely.',
      verifiedPurchase: true,
      meetupSpot: 'Campus Common Room',
      helpfulCount: 6,
      dateStr: '8 days ago',
    },
  ],

  'White Cotton Lab Coat (Unisex, Size M)': [
    {
      name: 'Kavita Desai',
      role: 'student',
      department: 'M.Sc Chemistry · 2nd Year',
      rating: 5,
      title: '100% thick cotton, passes IAR lab inspection',
      comment: 'Mandatory for all chemistry and biotechnology practical labs. Fabric is sturdy cotton, not synthetic blend. Washed, cleanly ironed, and buttons are tight.',
      verifiedPurchase: true,
      meetupSpot: 'Chemistry Dept Corridor',
      helpfulCount: 19,
      dateStr: '3 days ago',
    },
    {
      name: 'Amit Raval',
      role: 'student',
      department: 'B.Tech Biotech · 1st Year',
      rating: 5,
      title: 'Accurate Medium fit with 3 deep pockets',
      comment: 'Fits well over hoodies or shirts. Saved me ₹300 compared to the medical uniform store near Gandhinagar sector 21.',
      verifiedPurchase: true,
      meetupSpot: 'Bio Lab 102',
      helpfulCount: 11,
      dateStr: '1 week ago',
    },
  ],

  'Engineering Drawing Kit (Mini Drafter & Sheet Tube)': [
    {
      name: 'Harshil Dave',
      role: 'student',
      department: 'B.Tech Mechanical · 1st Year',
      rating: 5,
      title: 'Precision mini drafter, zero slack',
      comment: 'Scales are aligned at exact 90 degrees with solid clamping screw. Waterproof sheet container kept all my A1 sheets dry during monsoon rain.',
      verifiedPurchase: true,
      meetupSpot: 'Engineering Workshop',
      helpfulCount: 12,
      dateStr: '5 days ago',
    },
    {
      name: 'Siddharth Patel',
      role: 'student',
      department: 'B.Tech Mechanical · 2nd Year',
      rating: 4,
      title: 'Includes compass set and clips',
      comment: 'Everything needed for Engineering Graphics / CAD fundamentals course in one kit. Great deal for incoming freshers.',
      verifiedPurchase: true,
      meetupSpot: 'Academic Quad',
      helpfulCount: 6,
      dateStr: '11 days ago',
    },
  ],

  'Campus Single-Speed Commuter Bicycle': [
    {
      name: 'Kunal Patel',
      role: 'student',
      department: 'Hostel Resident · Block A',
      rating: 5,
      title: 'Saves 20 minutes walking each day',
      comment: 'Rides smoothly on campus roads and bicycle paths. Brakes are responsive and tires hold pressure well. Seller included a sturdy combination cable lock.',
      verifiedPurchase: true,
      meetupSpot: 'Campus Cycle Stand',
      helpfulCount: 16,
      dateStr: '4 days ago',
    },
    {
      name: 'Sanjay Vaghela',
      role: 'staff',
      department: 'Staff · Campus Facilities',
      rating: 4,
      title: 'Reliable campus runabout',
      comment: 'Chain is lubricated and seat height adjusts easily. Smooth exchange right at the main security gate.',
      verifiedPurchase: true,
      meetupSpot: 'Main Security Gate',
      helpfulCount: 8,
      dateStr: '2 weeks ago',
    },
  ],
};

/**
 * Returns authentic reviews for a product or creates realistic fallback reviews
 */
function getReviewsForProduct(product) {
  if (!product) return [];

  const title = (product.title || '').trim();

  // 1. Direct match
  if (productReviewsMap[title]) {
    return productReviewsMap[title];
  }

  // 2. Partial title match
  for (const [key, reviews] of Object.entries(productReviewsMap)) {
    if (title.toLowerCase().includes(key.toLowerCase()) || key.toLowerCase().includes(title.toLowerCase())) {
      return reviews;
    }
  }

  // 3. Category based realistic fallback
  const category = (product.category || 'General').toLowerCase();
  const campus = 'Institute of Advanced Research, Gandhinagar';

  if (category.includes('textbook') || category.includes('book')) {
    return [
      {
        name: 'Devansh Shah',
        role: 'student',
        department: 'B.Tech Engineering · 2nd Year',
        rating: 5,
        title: 'Clean pages and very useful for semester exams',
        comment: `Excellent study material for coursework at ${campus}. Text is completely legible and seller was very polite.`,
        verifiedPurchase: true,
        meetupSpot: 'IAR Central Library',
        helpfulCount: 8,
        dateStr: '3 days ago',
      },
      {
        name: 'Priya Sharma',
        role: 'student',
        department: 'Computer Science · 3rd Year',
        rating: 4,
        title: 'Smooth meetup at campus canteen',
        comment: 'Book condition matched description accurately. Saved good money compared to new bookstore copies.',
        verifiedPurchase: true,
        meetupSpot: 'Main Canteen',
        helpfulCount: 5,
        dateStr: '1 week ago',
      },
    ];
  }

  if (category.includes('electron') || category.includes('gadget')) {
    return [
      {
        name: 'Aditya Parmar',
        role: 'student',
        department: 'B.Tech CSE · 3rd Year',
        rating: 5,
        title: 'Tested on the spot, works 100% as advertised',
        comment: `Tested all functions before payment near ${campus} academic quad. In top working condition.`,
        verifiedPurchase: true,
        meetupSpot: 'Academic Quad',
        helpfulCount: 11,
        dateStr: '2 days ago',
      },
      {
        name: 'Tanvi Solanki',
        role: 'student',
        department: 'BCA · 2nd Year',
        rating: 4,
        title: 'Reliable item, clean condition',
        comment: 'Great value for students on a budget. Quick handoff right after classes.',
        verifiedPurchase: true,
        meetupSpot: 'Library Ground Floor',
        helpfulCount: 6,
        dateStr: '6 days ago',
      },
    ];
  }

  // Default campus review
  return [
    {
      name: 'Rohan Mehta',
      role: 'student',
      department: 'IAR Student Community',
      rating: 5,
      title: 'Verified student seller, great deal',
      comment: `Item condition matched the listing photos and description exactly. Met inside ${campus} safely.`,
      verifiedPurchase: true,
      meetupSpot: 'IAR Library Lawn',
      helpfulCount: 9,
      dateStr: '4 days ago',
    },
    {
      name: 'Neha Dave',
      role: 'student',
      department: 'B.Tech Student',
      rating: 4,
      title: 'Punctual and honest handoff',
      comment: 'Very happy with the transaction. Recommended seller for campus peer-to-peer trade.',
      verifiedPurchase: true,
      meetupSpot: 'Student Canteen',
      helpfulCount: 4,
      dateStr: '10 days ago',
    },
  ];
}

module.exports = {
  productReviewsMap,
  getReviewsForProduct,
};
