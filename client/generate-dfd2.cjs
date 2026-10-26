const fs = require('fs');
const path = require('path');
const puppeteer = require('puppeteer-core');

const CHROME_PATH = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const OUT_PNG = path.resolve(__dirname, '..', 'scratch', 'docx_images', 'image6.png');

const svgContent = `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <style>
    body {
      margin: 0;
      padding: 0;
      background: #ffffff;
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
    }
    svg {
      display: block;
      background: #ffffff;
    }
  </style>
</head>
<body>
<svg width="1754" height="960" viewBox="0 0 1754 960" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <marker id="arrow" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
      <path d="M 0 1.5 L 8 5 L 0 8.5 z" fill="#0f172a" />
    </marker>
    <!-- Database cylinder shape definition -->
    <g id="cylinder">
      <path d="M 0 12 A 80 12 0 0 0 160 12 V 48 A 80 12 0 0 1 0 48 Z" fill="#f8fafc" stroke="#0f172a" stroke-width="2"/>
      <ellipse cx="80" cy="12" rx="80" ry="12" fill="#e2e8f0" stroke="#0f172a" stroke-width="2"/>
      <ellipse cx="80" cy="48" rx="80" ry="12" fill="none" stroke="#0f172a" stroke-width="2"/>
    </g>
  </defs>

  <!-- Title -->
  <text x="40" y="45" font-size="24" font-weight="bold" fill="#0f172a">2.1 Level 2 DFD - Campus-Trade System (Detailed Decomposition)</text>

  <!-- Main System Boundary Box -->
  <rect x="230" y="70" width="1260" height="780" rx="20" fill="#ffffff" stroke="#94a3b8" stroke-width="1.8" stroke-dasharray="6,4" />
  <text x="255" y="98" font-size="12" font-weight="bold" fill="#64748b" letter-spacing="1.5">CAMPUS-TRADE CORE SYSTEM BOUNDARY</text>

  <!-- Left Entity: STUDENTS -->
  <rect x="40" y="140" width="150" height="660" rx="14" fill="#ffffff" stroke="#0f172a" stroke-width="2.5"/>
  <text x="115" y="460" font-size="18" font-weight="bold" text-anchor="middle" fill="#0f172a">STUDENTS</text>
  <text x="115" y="485" font-size="12" font-weight="500" text-anchor="middle" fill="#64748b">(Buyers &amp; Sellers)</text>

  <!-- Right Entity: COLLEGE ADMINISTRATION -->
  <rect x="1530" y="240" width="185" height="400" rx="14" fill="#ffffff" stroke="#0f172a" stroke-width="2.5"/>
  <text x="1622" y="430" font-size="18" font-weight="bold" text-anchor="middle" fill="#0f172a">College</text>
  <text x="1622" y="455" font-size="18" font-weight="bold" text-anchor="middle" fill="#0f172a">Administration</text>
  <text x="1622" y="480" font-size="12" font-weight="500" text-anchor="middle" fill="#64748b">(HODs &amp; Admins)</text>

  <!-- ==================== PROCESSES (CIRCLES) ==================== -->
  <!-- Process 1.0 -->
  <circle cx="450" cy="165" r="48" fill="#ffffff" stroke="#0f172a" stroke-width="2.2" />
  <text x="450" y="152" font-size="13" font-weight="bold" text-anchor="middle">1.0</text>
  <text x="450" y="168" font-size="11" font-weight="600" text-anchor="middle">User Auth &amp;</text>
  <text x="450" y="182" font-size="11" font-weight="600" text-anchor="middle">Registration</text>

  <!-- Process 2.0 -->
  <circle cx="450" cy="300" r="48" fill="#ffffff" stroke="#0f172a" stroke-width="2.2" />
  <text x="450" y="290" font-size="13" font-weight="bold" text-anchor="middle">2.0</text>
  <text x="450" y="306" font-size="11" font-weight="600" text-anchor="middle">Student</text>
  <text x="450" y="320" font-size="11" font-weight="600" text-anchor="middle">Verification</text>

  <!-- Process 3.0 -->
  <circle cx="450" cy="435" r="48" fill="#ffffff" stroke="#0f172a" stroke-width="2.2" />
  <text x="450" y="422" font-size="13" font-weight="bold" text-anchor="middle">3.0</text>
  <text x="450" y="438" font-size="11" font-weight="600" text-anchor="middle">Product Listing</text>
  <text x="450" y="452" font-size="11" font-weight="600" text-anchor="middle">&amp; Management</text>

  <!-- Process 4.0 -->
  <circle cx="450" cy="570" r="48" fill="#ffffff" stroke="#0f172a" stroke-width="2.2" />
  <text x="450" y="557" font-size="13" font-weight="bold" text-anchor="middle">4.0</text>
  <text x="450" y="573" font-size="11" font-weight="600" text-anchor="middle">Catalog Search</text>
  <text x="450" y="587" font-size="11" font-weight="600" text-anchor="middle">&amp; Filtering</text>

  <!-- Process 5.0 -->
  <circle cx="450" cy="705" r="48" fill="#ffffff" stroke="#0f172a" stroke-width="2.2" />
  <text x="450" y="692" font-size="13" font-weight="bold" text-anchor="middle">5.0</text>
  <text x="450" y="708" font-size="11" font-weight="600" text-anchor="middle">Buying &amp; Order</text>
  <text x="450" y="722" font-size="11" font-weight="600" text-anchor="middle">Processing</text>

  <!-- Process 7.0 -->
  <circle cx="1370" cy="310" r="48" fill="#ffffff" stroke="#0f172a" stroke-width="2.2" />
  <text x="1370" y="297" font-size="13" font-weight="bold" text-anchor="middle">7.0</text>
  <text x="1370" y="313" font-size="11" font-weight="600" text-anchor="middle">College Store</text>
  <text x="1370" y="327" font-size="11" font-weight="600" text-anchor="middle">Management</text>

  <!-- Process 8.0 -->
  <circle cx="1370" cy="530" r="48" fill="#ffffff" stroke="#0f172a" stroke-width="2.2" />
  <text x="1370" y="517" font-size="13" font-weight="bold" text-anchor="middle">8.0</text>
  <text x="1370" y="533" font-size="11" font-weight="600" text-anchor="middle">Event &amp; Ticket</text>
  <text x="1370" y="547" font-size="11" font-weight="600" text-anchor="middle">Management</text>

  <!-- Process 9.0 -->
  <circle cx="750" cy="790" r="46" fill="#ffffff" stroke="#0f172a" stroke-width="2.2" />
  <text x="750" y="780" font-size="13" font-weight="bold" text-anchor="middle">9.0</text>
  <text x="750" y="796" font-size="11" font-weight="600" text-anchor="middle">Profile</text>
  <text x="750" y="810" font-size="11" font-weight="600" text-anchor="middle">Management</text>

  <!-- ==================== DATA STORES ==================== -->
  <!-- D1 User Database -->
  <use href="#cylinder" x="720" y="135" />
  <text x="800" y="165" font-size="12" font-weight="bold" text-anchor="middle" fill="#0f172a">D1 User Database</text>

  <!-- D2 Verification Database -->
  <use href="#cylinder" x="720" y="270" />
  <text x="800" y="300" font-size="11" font-weight="bold" text-anchor="middle" fill="#0f172a">D2 Verification DB</text>

  <!-- D3 Product Database -->
  <use href="#cylinder" x="720" y="470" />
  <text x="800" y="500" font-size="12" font-weight="bold" text-anchor="middle" fill="#0f172a">D3 Product Database</text>

  <!-- D4 Transaction Database -->
  <use href="#cylinder" x="720" y="675" />
  <text x="800" y="705" font-size="11" font-weight="bold" text-anchor="middle" fill="#0f172a">D4 Transaction DB</text>

  <!-- D6 College Product Database -->
  <use href="#cylinder" x="1050" y="280" />
  <text x="1130" y="310" font-size="11" font-weight="bold" text-anchor="middle" fill="#0f172a">D6 College Store DB</text>

  <!-- D7 Event Ticket Database -->
  <use href="#cylinder" x="1050" y="500" />
  <text x="1130" y="530" font-size="11" font-weight="bold" text-anchor="middle" fill="#0f172a">D7 Event Ticket DB</text>

  <!-- ==================== FLOW ARROWS ==================== -->
  <!-- Student -> 1.0 Registration Details -->
  <line x1="190" y1="150" x2="400" y2="150" stroke="#0f172a" stroke-width="1.6" marker-end="url(#arrow)" />
  <text x="295" y="142" font-size="11" font-weight="600" text-anchor="middle" fill="#0f172a">Register / Login Credentials</text>

  <!-- 1.0 -> Student Auth Token -->
  <line x1="400" y1="175" x2="190" y2="175" stroke="#0f172a" stroke-width="1.6" marker-end="url(#arrow)" />
  <text x="295" y="190" font-size="11" font-weight="600" text-anchor="middle" fill="#0f172a">Auth Token / Session State</text>

  <!-- 1.0 -> D1 User Data -->
  <line x1="498" y1="150" x2="720" y2="150" stroke="#0f172a" stroke-width="1.6" marker-end="url(#arrow)" />
  <text x="610" y="142" font-size="11" font-weight="600" text-anchor="middle" fill="#0f172a">User Credentials</text>

  <!-- D1 -> 1.0 Auth Status -->
  <line x1="720" y1="172" x2="498" y2="172" stroke="#0f172a" stroke-width="1.6" marker-end="url(#arrow)" />
  <text x="610" y="188" font-size="11" font-weight="600" text-anchor="middle" fill="#0f172a">User Data / Auth Status</text>

  <!-- Student -> 2.0 College Credentials -->
  <line x1="190" y1="285" x2="400" y2="285" stroke="#0f172a" stroke-width="1.6" marker-end="url(#arrow)" />
  <text x="295" y="277" font-size="11" font-weight="600" text-anchor="middle" fill="#0f172a">College Email &amp; Student ID</text>

  <!-- 2.0 -> Student Verification Status -->
  <line x1="400" y1="312" x2="190" y2="312" stroke="#0f172a" stroke-width="1.6" marker-end="url(#arrow)" />
  <text x="295" y="327" font-size="11" font-weight="600" text-anchor="middle" fill="#0f172a">Student Verification Status</text>

  <!-- 2.0 -> D2 Verification Data -->
  <line x1="498" y1="285" x2="720" y2="285" stroke="#0f172a" stroke-width="1.6" marker-end="url(#arrow)" />
  <text x="610" y="277" font-size="11" font-weight="600" text-anchor="middle" fill="#0f172a">Verification Data</text>

  <!-- D2 -> 2.0 Status -->
  <line x1="720" y1="312" x2="498" y2="312" stroke="#0f172a" stroke-width="1.6" marker-end="url(#arrow)" />
  <text x="610" y="327" font-size="11" font-weight="600" text-anchor="middle" fill="#0f172a">Enrollment Record Status</text>

  <!-- Student -> 3.0 Product Details -->
  <line x1="190" y1="420" x2="400" y2="420" stroke="#0f172a" stroke-width="1.6" marker-end="url(#arrow)" />
  <text x="295" y="412" font-size="11" font-weight="600" text-anchor="middle" fill="#0f172a">Listing Details (Add/Edit/Delete)</text>

  <!-- 3.0 -> Student Status -->
  <line x1="400" y1="448" x2="190" y2="448" stroke="#0f172a" stroke-width="1.6" marker-end="url(#arrow)" />
  <text x="295" y="463" font-size="11" font-weight="600" text-anchor="middle" fill="#0f172a">Listing Confirmation</text>

  <!-- 3.0 -> D3 Product Data -->
  <line x1="498" y1="435" x2="720" y2="480" stroke="#0f172a" stroke-width="1.6" marker-end="url(#arrow)" />
  <text x="610" y="445" font-size="11" font-weight="600" text-anchor="middle" fill="#0f172a">Product Data</text>

  <!-- Student -> 4.0 Search Query -->
  <line x1="190" y1="555" x2="400" y2="555" stroke="#0f172a" stroke-width="1.6" marker-end="url(#arrow)" />
  <text x="295" y="547" font-size="11" font-weight="600" text-anchor="middle" fill="#0f172a">Search Query (Category/Price/Cond)</text>

  <!-- 4.0 -> Student Product List -->
  <line x1="400" y1="582" x2="190" y2="582" stroke="#0f172a" stroke-width="1.6" marker-end="url(#arrow)" />
  <text x="295" y="598" font-size="11" font-weight="600" text-anchor="middle" fill="#0f172a">Filtered Product Results</text>

  <!-- 4.0 -> D3 Search Criteria -->
  <line x1="498" y1="565" x2="720" y2="505" stroke="#0f172a" stroke-width="1.6" marker-end="url(#arrow)" />
  <text x="610" y="548" font-size="11" font-weight="600" text-anchor="middle" fill="#0f172a">Search Criteria</text>

  <!-- D3 -> 4.0 Product List -->
  <line x1="720" y1="525" x2="498" y2="580" stroke="#0f172a" stroke-width="1.6" marker-end="url(#arrow)" />
  <text x="610" y="575" font-size="11" font-weight="600" text-anchor="middle" fill="#0f172a">Matching Product List</text>

  <!-- Student -> 5.0 Purchase Request -->
  <line x1="190" y1="692" x2="400" y2="692" stroke="#0f172a" stroke-width="1.6" marker-end="url(#arrow)" />
  <text x="295" y="684" font-size="11" font-weight="600" text-anchor="middle" fill="#0f172a">Purchase Request (Cart Items)</text>

  <!-- 5.0 -> Student Order Status -->
  <line x1="400" y1="718" x2="190" y2="718" stroke="#0f172a" stroke-width="1.6" marker-end="url(#arrow)" />
  <text x="295" y="733" font-size="11" font-weight="600" text-anchor="middle" fill="#0f172a">Order Confirmation / Status</text>

  <!-- 5.0 -> D4 Order Data -->
  <line x1="498" y1="705" x2="720" y2="705" stroke="#0f172a" stroke-width="1.6" marker-end="url(#arrow)" />
  <text x="610" y="697" font-size="11" font-weight="600" text-anchor="middle" fill="#0f172a">Order &amp; Transaction Record</text>

  <!-- Student -> 9.0 Profile Update -->
  <path d="M 190 770 H 704" fill="none" stroke="#0f172a" stroke-width="1.6" marker-end="url(#arrow)" />
  <text x="445" y="763" font-size="11" font-weight="600" text-anchor="middle" fill="#0f172a">Update Profile &amp; Campus Meetup Spot</text>

  <!-- 9.0 -> D1 Update User Profile -->
  <path d="M 796 790 H 910 V 195 H 880" fill="none" stroke="#0f172a" stroke-width="1.6" marker-end="url(#arrow)" />
  <text x="915" y="500" font-size="11" font-weight="600" text-anchor="middle" fill="#0f172a" transform="rotate(-90 915 500)">Update User Profile Document</text>

  <!-- Admin -> 7.0 College Store Data -->
  <line x1="1530" y1="300" x2="1420" y2="300" stroke="#0f172a" stroke-width="1.6" marker-end="url(#arrow)" />
  <text x="1475" y="292" font-size="11" font-weight="600" text-anchor="middle" fill="#0f172a">Official College Products</text>

  <!-- 7.0 -> D6 College Store DB -->
  <line x1="1322" y1="310" x2="1210" y2="310" stroke="#0f172a" stroke-width="1.6" marker-end="url(#arrow)" />
  <text x="1266" y="302" font-size="11" font-weight="600" text-anchor="middle" fill="#0f172a">Store Inventory Data</text>

  <!-- Admin -> 8.0 Event Details -->
  <line x1="1530" y1="520" x2="1420" y2="520" stroke="#0f172a" stroke-width="1.6" marker-end="url(#arrow)" />
  <text x="1475" y="512" font-size="11" font-weight="600" text-anchor="middle" fill="#0f172a">Event &amp; Campaign Config</text>

  <!-- 8.0 -> D7 Event Ticket DB -->
  <line x1="1322" y1="530" x2="1210" y2="530" stroke="#0f172a" stroke-width="1.6" marker-end="url(#arrow)" />
  <text x="1266" y="522" font-size="11" font-weight="600" text-anchor="middle" fill="#0f172a">Event &amp; Ticket Data</text>

  <!-- D7 -> 8.0 -> Student Pass Ticket -->
  <path d="M 1050 545 C 920 600, 780 640, 190 640" fill="none" stroke="#0f172a" stroke-width="1.6" marker-end="url(#arrow)" />
  <text x="880" y="610" font-size="11" font-weight="600" text-anchor="middle" fill="#0f172a">Confirmed Event Pass &amp; Ticket Code</text>

  <!-- ==================== LEGEND ==================== -->
  <rect x="40" y="875" width="1675" height="65" rx="10" fill="#ffffff" stroke="#94a3b8" stroke-width="1.4" stroke-dasharray="4,3"/>
  <text x="65" y="913" font-size="13" font-weight="bold" fill="#0f172a">Legend:</text>

  <rect x="160" y="890" width="45" height="30" rx="6" fill="#ffffff" stroke="#0f172a" stroke-width="1.8"/>
  <text x="215" y="910" font-size="12" font-weight="500" fill="#0f172a">- External Entity</text>

  <circle cx="365" cy="905" r="16" fill="#ffffff" stroke="#0f172a" stroke-width="1.8"/>
  <text x="395" y="910" font-size="12" font-weight="500" fill="#0f172a">- Process</text>

  <g transform="translate(505, 888) scale(0.35)">
    <use href="#cylinder" x="0" y="0"/>
  </g>
  <text x="575" y="910" font-size="12" font-weight="500" fill="#0f172a">- Data Store (NoSQL Collection)</text>

  <line x1="820" y1="905" x2="880" y2="905" stroke="#0f172a" stroke-width="1.8" marker-end="url(#arrow)" />
  <text x="895" y="910" font-size="12" font-weight="500" fill="#0f172a">- Data Flow Direction</text>
</svg>
</body>
</html>`;

const tmpHtml = path.resolve(__dirname, '..', 'scratch', 'dfd2_temp.html');
fs.writeFileSync(tmpHtml, svgContent, 'utf-8');

async function render() {
  console.log('Rendering crisp, spacious Level-2 DFD SVG to PNG...');
  const browser = await puppeteer.launch({
    executablePath: CHROME_PATH,
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });

  const page = await browser.newPage();
  await page.setViewport({ width: 1754, height: 960, deviceScaleFactor: 1 });
  await page.goto('file:///' + tmpHtml.replace(/\\/g, '/'), { waitUntil: 'load' });
  await page.screenshot({ path: OUT_PNG, type: 'png' });
  await browser.close();

  console.log(`Rendered clean Level-2 DFD to ${OUT_PNG} (${fs.statSync(OUT_PNG).size} bytes)`);
}

render().catch(console.error);
