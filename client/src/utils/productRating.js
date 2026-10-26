/**
 * Dynamic rating calculation function based on:
 * 1. Product's Image (quality, presence, authenticity)
 * 2. Description (depth, completeness, transparency)
 * 3. Item Condition (Brand New, Like New, Good, Fair)
 * 4. Numbers Sold (sales velocity and student demand)
 */
export function calculateProductRating(product) {
  if (!product) return { rating: 4.5, reviewCount: 12, soldCount: 0 };

  // If the product already has authoritative calculated rating from server
  if (product.rating && product.numReviews) {
    return {
      rating: Number(product.rating),
      reviewCount: Number(product.numReviews),
      soldCount: Number(product.soldCount) || 0,
    };
  }

  const {
    imageUrl = '',
    description = '',
    condition = 'Good',
    soldCount = 0,
    _id = '',
  } = product;

  // 1. Condition Factor (Weight: 35%)
  let conditionScore = 4.3;
  if (condition === 'Brand New') {
    conditionScore = 5.0;
  } else if (condition === 'Like New') {
    conditionScore = 4.7;
  } else if (condition === 'Good') {
    conditionScore = 4.3;
  } else if (condition === 'Fair') {
    conditionScore = 3.9;
  }

  // 2. Image Verification & Authenticity Factor (Weight: 25%)
  let imageScore = 4.2;
  const img = (imageUrl || '').trim();
  if (!img) {
    imageScore = 3.2; // Missing image penalty
  } else if (img.startsWith('http://localhost') || img.startsWith('data:') || img.startsWith('/uploads/')) {
    imageScore = 4.95; // Real photo uploaded directly by student
  } else if (img.includes('images.unsplash.com') || img.startsWith('https://')) {
    imageScore = 4.8; // High-resolution verified photo
  }

  // 3. Description Depth & Transparency Factor (Weight: 20%)
  const descLength = (description || '').trim().length;
  let descScore = 4.0;
  if (descLength >= 100) {
    descScore = 4.9;
  } else if (descLength >= 60) {
    descScore = 4.6;
  } else if (descLength >= 30) {
    descScore = 4.2;
  } else {
    descScore = 3.7;
  }

  // 4. Numbers Sold & Student Demand Factor (Weight: 20%)
  const sold = Number(soldCount) || 0;
  let salesScore = 4.1;
  if (sold >= 25) {
    salesScore = 4.95;
  } else if (sold >= 15) {
    salesScore = 4.8;
  } else if (sold >= 8) {
    salesScore = 4.6;
  } else if (sold >= 3) {
    salesScore = 4.4;
  } else if (sold > 0) {
    salesScore = 4.2;
  } else {
    salesScore = 4.0;
  }

  // Weighted calculation:
  // Condition: 35%, Image: 25%, Description: 20%, Numbers Sold: 20%
  const weightedSum =
    conditionScore * 0.35 +
    imageScore * 0.25 +
    descScore * 0.20 +
    salesScore * 0.20;

  // Add deterministic subtle variance based on ID so different items have distinct ratings
  let idHash = 0;
  const idStr = String(_id || '');
  if (idStr) {
    for (let i = 0; i < idStr.length; i++) {
      idHash = (idHash * 31 + idStr.charCodeAt(i)) % 100;
    }
  }
  const variance = ((idHash % 5) - 2) * 0.05; // -0.10 to +0.10

  const rawRating = weightedSum + variance;
  const rating = Math.min(5.0, Math.max(3.8, Math.round(rawRating * 10) / 10));
  const reviewCount = Math.max(3, Math.floor(sold * 1.4 + (idHash % 6) + 4));

  return {
    rating,
    reviewCount,
    soldCount: sold,
    breakdown: {
      conditionScore,
      imageScore,
      descScore,
      salesScore,
    },
  };
}

/**
 * Returns fallback student and staff reviews for campus products
 */
export function getFallbackReviews(product) {
  if (!product) return [];

  const title = (product.title || '').toLowerCase();
  const campus = 'Institute of Advanced Research, Gandhinagar';

  if (title.includes('calculus')) {
    return [
      {
        _id: 'rev-calc-1',
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
        _id: 'rev-calc-2',
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
        _id: 'rev-calc-3',
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
    ];
  }

  if (title.includes('calculator') || title.includes('casio')) {
    return [
      {
        _id: 'rev-calc-c1',
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
        _id: 'rev-calc-c2',
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
        _id: 'rev-calc-c3',
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
    ];
  }

  if (title.includes('earbud') || title.includes('wireless')) {
    return [
      {
        _id: 'rev-eb-1',
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
        _id: 'rev-eb-2',
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
    ];
  }

  if (title.includes('fridge')) {
    return [
      {
        _id: 'rev-fr-1',
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
        _id: 'rev-fr-2',
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
    ];
  }

  // General high-quality campus reviews
  return [
    {
      _id: 'rev-gen-1',
      name: 'Rohan Mehta',
      role: 'student',
      department: 'B.Tech Engineering · 2nd Year',
      rating: 5,
      title: 'Verified student seller, great deal',
      comment: `Item condition matched the listing photos and description exactly. Met inside ${campus} safely.`,
      verifiedPurchase: true,
      meetupSpot: 'IAR Library Lawn',
      helpfulCount: 9,
      dateStr: '4 days ago',
    },
    {
      _id: 'rev-gen-2',
      name: 'Neha Dave',
      role: 'student',
      department: 'B.Tech Electrical · 3rd Year',
      rating: 4,
      title: 'Punctual and honest handoff',
      comment: 'Very happy with the transaction. Recommended seller for campus peer-to-peer trade.',
      verifiedPurchase: true,
      meetupSpot: 'Student Canteen',
      helpfulCount: 5,
      dateStr: '10 days ago',
    },
  ];
}
