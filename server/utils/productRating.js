/**
 * Dynamic rating calculation function based on:
 * 1. Product's Image (quality, presence, authenticity)
 * 2. Description (depth, completeness, transparency)
 * 3. Item Condition (Brand New, Like New, Good, Fair)
 * 4. Numbers Sold (sales velocity and student demand)
 */
function calculateProductRating(product) {
  if (!product) return { rating: 4.5, reviewCount: 12, soldCount: 0 };

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

  // Weighted calculation
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

module.exports = { calculateProductRating };
