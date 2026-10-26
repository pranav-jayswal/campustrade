const puppeteer = require('puppeteer-core');
const path = require('path');
const fs = require('fs');

const CHROME_PATH = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const OUT_DIR = path.resolve(__dirname, '..', 'scratch', 'docx_images');

if (!fs.existsSync(OUT_DIR)) {
  fs.mkdirSync(OUT_DIR, { recursive: true });
}

async function run() {
  console.log('Launching Chrome via puppeteer-core...');
  const browser = await puppeteer.launch({
    executablePath: CHROME_PATH,
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-gpu'],
    defaultViewport: { width: 1280, height: 820, deviceScaleFactor: 1.5 }
  });

  const page = await browser.newPage();

  // Helper to wait and screenshot
  async function snap(url, filename, setupFn = null, waitMs = 1200) {
    console.log(`Navigating to ${url}...`);
    await page.goto(url, { waitUntil: 'networkidle2' });
    if (setupFn) {
      await setupFn(page);
    }
    await new Promise((r) => setTimeout(r, waitMs));
    const target = path.join(OUT_DIR, filename);
    await page.screenshot({ path: target, type: 'jpeg', quality: 90 });
    console.log(`Saved ${filename} (${fs.statSync(target).size} bytes)`);
  }

  // 1. Home Page (image9.jpg)
  await snap('http://localhost:5173/', 'image9.jpg');

  // 2. Shop / Catalog Page (image10.jpg)
  await snap('http://localhost:5173/shop', 'image10.jpg', async (p) => {
    // Wait for at least one product card to load
    await p.waitForSelector('.group.relative, button, input', { timeout: 5000 }).catch(() => {});
  }, 1500);

  // 3. Product Detail Page (image1.jpg)
  await snap('http://localhost:5173/products/6ad3aa4f25c832c2ae2aa58f', 'image1.jpg', async (p) => {
    await p.waitForSelector('h1, button', { timeout: 5000 }).catch(() => {});
  }, 1500);

  // 4. Login Page (image12.jpg)
  await snap('http://localhost:5173/login', 'image12.jpg', null, 800);

  // 5. Register Page (image13.jpg)
  await snap('http://localhost:5173/register', 'image13.jpg', null, 800);

  // 6. Cart Page (image2.jpg) - inject item into localStorage
  await page.goto('http://localhost:5173/', { waitUntil: 'networkidle2' });
  await page.evaluate(() => {
    const sampleCart = [
      {
        productId: '6ad3aa4f25c832c2ae2aa58f',
        title: 'White Cotton Lab Coat (Unisex, Size M)',
        price: 320,
        image: 'https://images.unsplash.com/photo-1584820927498-cfe5211fd8bf?auto=format&fit=crop&w=800&q=80',
        quantity: 1
      }
    ];
    localStorage.setItem('cart', JSON.stringify(sampleCart));
  });
  await snap('http://localhost:5173/cart', 'image2.jpg', null, 1000);

  // 7. Checkout Page (image11.jpg)
  // Inject user so checkout is accessible
  await page.evaluate(() => {
    const studentUser = {
      _id: '6ad3aa4f25c832c2ae2aa58e',
      name: 'Aarav Patel',
      email: 'aarav@iar.ac.in',
      role: 'student',
      isVerifiedStudent: true,
      campus: 'Institute of Advanced Research, Gandhinagar'
    };
    localStorage.setItem('user', JSON.stringify(studentUser));
    localStorage.setItem('token', 'sample-jwt-token');
  });
  await snap('http://localhost:5173/cart', 'image11.jpg', async (p) => {
    // Fill shipping form or click checkout
    const checkoutBtn = await p.$('a[href="/cart"], button');
  }, 1000);

  // 8. Admin Dashboard Listing Modal (image4.jpg)
  await page.evaluate(() => {
    const adminUser = {
      _id: '6ad3aa4f25c832c2ae2aa58d',
      name: 'CampusTrade Admin',
      email: 'admin@example.com',
      role: 'admin',
      isVerifiedStudent: true
    };
    localStorage.setItem('user', JSON.stringify(adminUser));
    localStorage.setItem('token', 'sample-admin-jwt-token');
  });
  await snap('http://localhost:5173/admin', 'image4.jpg', async (p) => {
    // Click "+ Add new listing" button to show modal
    const buttons = await p.$$('button');
    for (const b of buttons) {
      const text = await p.evaluate((el) => el.textContent, b);
      if (text && text.includes('Add new listing')) {
        await b.click();
        break;
      }
    }
  }, 1200);

  // 9. Extra: Campus Events Page (shot_events.jpg)
  await snap('http://localhost:5173/events', 'shot_events.jpg', async (p) => {
    await p.waitForSelector('h1, h2, h3, button', { timeout: 5000 }).catch(() => {});
  }, 1500);

  // 10. Extra: User Profile Page with Passes (shot_profile.jpg)
  await snap('http://localhost:5173/profile', 'shot_profile.jpg', async (p) => {
    await p.waitForSelector('h1, button', { timeout: 5000 }).catch(() => {});
  }, 1200);

  await browser.close();
  console.log('All screenshots captured successfully!');
}

run().catch((err) => {
  console.error('Error during capture:', err);
  process.exit(1);
});
