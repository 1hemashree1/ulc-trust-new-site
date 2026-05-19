import express from 'express';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const app = express();
const port = 3000;

app.use(express.json());

// Handling __dirname securely in both ESM and CJS
let currentDir = '';
try {
  currentDir = path.dirname(fileURLToPath(import.meta.url));
} catch (e) {
  currentDir = __dirname;
}

const DB_PATH = path.join(currentDir, 'db.json');

// Read database helper
function readDB() {
  try {
    if (fs.existsSync(DB_PATH)) {
      return JSON.parse(fs.readFileSync(DB_PATH, 'utf-8'));
    }
  } catch (error) {
    console.error("Database read error:", error);
  }
  return { users: [], aoc: [], claims: [], harassment: [], meetings: [], feedback: [], ledger: [] };
}

// Write database helper
function writeDB(data: any) {
  try {
    fs.writeFileSync(DB_PATH, JSON.stringify(data, null, 2), 'utf-8');
  } catch (error) {
    console.error("Database write error:", error);
  }
}

// Ensure the db contains necessary keys
function ensureDBKeys() {
  const data = readDB();
  let modified = false;
  const keys = ['users', 'aoc', 'claims', 'harassment', 'meetings', 'feedback', 'ledger'];
  keys.forEach(k => {
    if (!data[k]) {
      data[k] = [];
      modified = true;
    }
  });
  if (modified) {
    writeDB(data);
  }
}
ensureDBKeys();

// API Endpoints
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', time: new Date().toISOString() });
});

// Get consolidated db state
app.get('/api/db', (req, res) => {
  res.json(readDB());
});

// Authentication: Login with protonmail or automatic signup
app.post('/api/auth/login', (req, res) => {
  const { email, password } = req.body;
  if (!email) {
    return res.status(400).json({ error: 'Proton email is required.' });
  }

  const db = readDB();
  let user = db.users.find((u: any) => u.email.toLowerCase() === email.toLowerCase());

  if (!user) {
    // For convenience of ULC Trust, auto-create account on first login to make demo seamless
    const id = 'user-' + Date.now();
    const idVal = Math.floor(10000 + Math.random() * 90000);
    const kcVal = Math.floor(1000 + Math.random() * 9000);
    
    user = {
      id,
      email: email.toLowerCase(),
      fullName: 'Minister ' + email.split('@')[0],
      legal_fiction: (email.split('@')[0]).toUpperCase() + ' FICTION',
      idNumber: `ME-${idVal}-LTD`,
      kcAccount: `KC-${kcVal}-01`,
      registeredAt: new Date().toISOString(),
      serviceHours: 5,
      serviceOffer: "Community Mutual Core Exchange",
      savingsMonthly: 600,
      donationMonthly: 60
    };
    db.users.push(user);
    writeDB(db);
  }
  
  res.json({ success: true, user });
});

app.post('/api/auth/signup', (req, res) => {
  const { email, fullName, legal_fiction, serviceOffer, totalOutgoings } = req.body;
  if (!email || !fullName) {
    return res.status(400).json({ error: 'Email and Legal Full Name are required.' });
  }

  const db = readDB();
  const existing = db.users.find((u: any) => u.email.toLowerCase() === email.toLowerCase());
  if (existing) {
    return res.json({ success: true, user: existing, message: 'Existing profile recovered' });
  }

  const id = 'user-' + Date.now();
  const idVal = Math.floor(10000 + Math.random() * 90000);
  const kcVal = Math.floor(1000 + Math.random() * 9000);
  const monthlySavings = Number(totalOutgoings) || 800;
  
  const user = {
    id,
    email: email.toLowerCase(),
    fullName,
    legal_fiction: legal_fiction || (fullName + ' FICTION').toUpperCase(),
    idNumber: `ME-${idVal}-ULCT`,
    kcAccount: `KC-${kcVal}-09`,
    registeredAt: new Date().toISOString(),
    serviceHours: 5,
    serviceOffer: serviceOffer || "Direct Mutual Support / Food Cultivation",
    savingsMonthly: monthlySavings,
    donationMonthly: Math.ceil(monthlySavings * 0.10)
  };

  db.users.push(user);
  
  // Create a default claims record matching their initial sign up
  const newClaim = {
    id: 'claim-' + Date.now(),
    userId: id,
    fullName,
    email: email.toLowerCase(),
    liabilities: {
      councilTax: Math.ceil(monthlySavings * 0.25),
      electricity: Math.ceil(monthlySavings * 0.3),
      gas: Math.ceil(monthlySavings * 0.2),
      water: Math.ceil(monthlySavings * 0.1),
      food: Math.ceil(monthlySavings * 0.1),
      other: Math.ceil(monthlySavings * 0.05)
    },
    totalSpent: monthlySavings,
    serviceHours: 5,
    serviceOffer: user.serviceOffer,
    serviceWhereWhen: "Tuesdays and Saturdays - Local Borough Hub",
    status: "APPROVED",
    dischargedDate: new Date().toISOString(),
    refNo: `KC-CLAIM-${Math.floor(1000 + Math.random() * 9000)}`
  };
  db.claims.push(newClaim);

  // Add ledger entries for energy conversion
  const txId1 = 'tx-' + Date.now() + '-1';
  db.ledger.unshift({
    id: txId1,
    date: new Date().toISOString(),
    sender: "Global Trust Pool",
    recipient: `${fullName} (${user.idNumber})`,
    type: "conversion",
    amountKC: monthlySavings * 10,
    details: `Sovereign Energy Conversion - Discharge liabilities & activate Kind Credits`,
    equivalentSlaveTokens: `£${monthlySavings}.00`
  });

  const txId2 = 'tx-' + Date.now() + '-2';
  db.ledger.unshift({
    id: txId2,
    date: new Date().toISOString(),
    sender: fullName,
    recipient: "ULC Trust Community Chest",
    type: "donation",
    amountKC: Math.ceil(monthlySavings * 1.0), // 10% contribution in KC
    details: `10% Monthly Energy Contribution back to Community Chest`,
    equivalentSlaveTokens: `£${Math.ceil(monthlySavings * 0.1)}.00`
  });

  writeDB(db);
  res.status(201).json({ success: true, user });
});

// AOC Form POST
app.post('/api/aoc', (req, res) => {
  const { firstName, middleName, lastName, email, accounts, reference, thumbprintImg } = req.body;
  if (!firstName || !lastName || !email) {
    return res.status(400).json({ error: 'First Name, Last Name, and email are required.' });
  }

  const db = readDB();
  const rollVal = Math.floor(1000 + Math.random() * 8999);
  const territory = (reference && reference.includes("Ellas")) ? "EL" : "UK";
  const rollNumber = `ULCT-${territory}-${new Date().getFullYear()}-${rollVal}`;
  
  const newAoc = {
    id: 'aoc-' + Date.now(),
    firstName,
    middleName: middleName || '',
    lastName,
    email: email.toLowerCase(),
    accounts: accounts || 'N/A',
    reference: reference || 'Direct Access',
    date: new Date().toISOString().split('T')[0],
    rollNumber,
    thumbprintImg: thumbprintImg || 'default_thumbprint'
  };

  db.aoc.push(newAoc);

  // Automatically update/create the user corresponding to this AOC
  let user = db.users.find((u: any) => u.email.toLowerCase() === email.toLowerCase());
  const fullName = `Minister ${firstName} ${middleName ? middleName + ' ' : ''}${lastName}`;
  const legal_fiction = `${firstName.toUpperCase()} ${middleName ? middleName.toUpperCase() + ' ' : ''}${lastName.toUpperCase()}`;

  if (!user) {
    const idVal = Math.floor(10000 + Math.random() * 90000);
    const kcVal = Math.floor(1000 + Math.random() * 9000);
    user = {
      id: 'user-' + Date.now(),
      email: email.toLowerCase(),
      fullName,
      legal_fiction,
      idNumber: `ME-${idVal}-AOC`,
      kcAccount: `KC-${kcVal}-05`,
      registeredAt: new Date().toISOString(),
      serviceHours: 5,
      serviceOffer: "Community Patrol & Admin Exchange",
      savingsMonthly: 650,
      donationMonthly: 65
    };
    db.users.push(user);
  } else {
    // update legal fiction mapping
    user.legal_fiction = legal_fiction;
    user.fullName = fullName;
  }

  // Create ledger entry to celebrate AOC Assignment
  db.ledger.unshift({
    id: 'tx-' + Date.now(),
    date: new Date().toISOString(),
    sender: legal_fiction + " (System Corporation Debtor)",
    recipient: fullName + " (Sovereign Executor)",
    type: "conversion",
    amountKC: 10000,
    details: `Dissolved Cestui Que Vie Trust Roll ${rollNumber} - Mind Reclaimed from Matrix`,
    equivalentSlaveTokens: "£1,000.00 equivalent value"
  });

  writeDB(db);
  res.status(201).json({ success: true, aoc: newAoc, user });
});

// KC Claim Form POST
app.post('/api/claims', (req, res) => {
  const { email, liabilities, serviceOffer, serviceWhereWhen } = req.body;
  if (!email || !liabilities) {
    return res.status(400).json({ error: 'Proton email and monthly liabilities breakdown are required.' });
  }

  const db = readDB();
  const user = db.users.find((u: any) => u.email.toLowerCase() === email.toLowerCase());
  if (!user) {
    return res.status(404).json({ error: 'User profiles need to be active before filing claim. Please sign up first!' });
  }

  const totalSpent: number = (Object.values(liabilities) as any[]).reduce((acc: number, val: any): number => acc + (Number(val) || 0), 0);
  const refNo = `KC-CLAIM-${Math.floor(1000 + Math.random() * 9000)}`;

  const newClaim = {
    id: 'claim-' + Date.now(),
    userId: user.id,
    fullName: user.fullName,
    email: email.toLowerCase(),
    liabilities,
    totalSpent,
    serviceHours: 5,
    serviceOffer: serviceOffer || user.serviceOffer,
    serviceWhereWhen: serviceWhereWhen || "Local Borough Union Hubs",
    status: "APPROVED", // Auto approved in self-governed decentralized setup
    dischargedDate: new Date().toISOString(),
    refNo
  };

  db.claims.push(newClaim);

  // Update user statistics
  user.savingsMonthly = totalSpent;
  user.donationMonthly = Math.ceil(totalSpent * 0.10);
  if (serviceOffer) {
    user.serviceOffer = serviceOffer;
  }

  // Trigger Ledger transaction
  db.ledger.unshift({
    id: 'tx-' + Date.now() + '-c1',
    date: new Date().toISOString(),
    sender: "Global Trust Pool",
    recipient: `${user.fullName} (${user.idNumber})`,
    type: "conversion",
    amountKC: totalSpent * 10,
    details: `Discharged Monthly Overheads Ref ${refNo} (No debt created)`,
    equivalentSlaveTokens: `£${totalSpent}.00`
  });

  db.ledger.unshift({
    id: 'tx-' + Date.now() + '-c2',
    date: new Date().toISOString(),
    sender: user.fullName,
    recipient: "ULC Trust Community Chest",
    type: "donation",
    amountKC: Math.ceil(totalSpent * 1.0),
    details: `10% Community Contribution on Savings`,
    equivalentSlaveTokens: `£${Math.ceil(totalSpent * 0.1)}.00`
  });

  writeDB(db);
  res.status(201).json({ success: true, claim: newClaim });
});

// Harassment reporting (Exemplification) POST
app.post('/api/harassment', (req, res) => {
  const { emovenId, kcAccount, email, phone, debtorType, corpName, fictionNumber, corpContact, territory, details, noticeDate1, noticeDate2 } = req.body;
  
  if (!email || !corpName) {
    return res.status(400).json({ error: 'Email and Corporation Name are required.' });
  }

  const db = readDB();
  const harrRecord = {
    id: 'harr-' + Date.now(),
    emovenId: emovenId || 'ME-99018-DEF',
    kcAccount: kcAccount || 'KC-5561-00',
    email: email.toLowerCase(),
    phone: phone || '',
    debtorType: debtorType || 'Corporation / Govt',
    corpName,
    fictionNumber: fictionNumber || 'Presumed-01',
    corpContact: corpContact || '',
    territory: territory || 'United Kingdom',
    details: details || 'No additional details provided',
    noticeDate1: noticeDate1 || new Date().toISOString().split('T')[0],
    noticeDate2: noticeDate2 || '',
    status: 'NOTICE_ONE_SENT'
  };

  db.harassment.push(harrRecord);

  // Post dynamic counter-charge transaction to public record
  db.ledger.unshift({
    id: 'tx-' + Date.now(),
    date: new Date().toISOString(),
    sender: corpName,
    recipient: email.split('@')[0].toUpperCase() + " Private Trust",
    type: "conversion",
    amountKC: 50000,
    details: `Consuming of Private Credit Agreement (CCA) tariff charged on unauthorized usage of copyrighted given name.`,
    equivalentSlaveTokens: `£5,000.00`
  });

  writeDB(db);
  res.status(201).json({ success: true, harassment: harrRecord });
});

// Request support meeting POST
app.post('/api/meetings', (req, res) => {
  const { name, email, borough, country, state, postcode, subject, message } = req.body;
  if (!email || !name) {
    return res.status(400).json({ error: 'Name and Proton Email are required.' });
  }

  const db = readDB();
  const newMeeting = {
    id: 'meet-' + Date.now(),
    name,
    email: email.toLowerCase(),
    borough: borough || 'Earth Ground',
    country: country || 'United Kingdom',
    state: state || 'Private',
    postcode: postcode || '',
    subject: subject || 'General Meeting',
    message: message || 'I would like to speak to a local facilitator.',
    date: new Date().toISOString().split('T')[0]
  };

  db.meetings.push(newMeeting);
  writeDB(db);
  res.status(201).json({ success: true, meeting: newMeeting });
});

// General Feedback Testimonials POST
app.post('/api/feedback', (req, res) => {
  const { name, email, message } = req.body;
  if (!name || !message) {
    return res.status(400).json({ error: 'Name and Experiences/Feedback are required.' });
  }

  const db = readDB();
  const feedbackRecord = {
    id: 'feed-' + Date.now(),
    name,
    email: email ? email.toLowerCase() : 'anonymous@proton.me',
    message,
    date: new Date().toISOString().split('T')[0]
  };

  db.feedback.push(feedbackRecord);
  writeDB(db);
  res.status(201).json({ success: true, feedback: feedbackRecord });
});

// Trigger dynamic custom transactions for simulation
app.post('/api/ledger/transaction', (req, res) => {
  const { sender, recipient, type, amountKC, details, equivalentSlaveTokens } = req.body;
  if (!sender || !recipient || !amountKC) {
    return res.status(400).json({ error: 'Sender, recipient, and amount in KC are required.' });
  }

  const db = readDB();
  const tx = {
    id: 'tx-' + Date.now(),
    date: new Date().toISOString(),
    sender,
    recipient,
    type: type || 'conversion',
    amountKC: Number(amountKC),
    details: details || 'Mutual sovereign exchange',
    equivalentSlaveTokens: equivalentSlaveTokens || `£${Math.ceil(amountKC / 10)}.00`
  };

  db.ledger.unshift(tx);
  writeDB(db);
  res.status(201).json({ success: true, transaction: tx });
});

// Restore original template db state (Admin capability)
app.post('/api/ledger/reset', (req, res) => {
  const template = {
    users: [
      {
        id: "user-1",
        email: "minister.emoven@proton.me",
        fullName: "Minister Emoven",
        legal_fiction: "JOHN MICHAEL DOE",
        idNumber: "ME-01928-UK",
        kcAccount: "KC-8849-01",
        registeredAt: "2026-04-10T11:20:00.000Z",
        serviceHours: 5,
        serviceOffer: "Farming & Food Cultivation at Leeds Community Garden",
        savingsMonthly: 780,
        donationMonthly: 78
      }
    ],
    aoc: [
      {
        id: "aoc-101",
        firstName: "John",
        middleName: "Michael",
        lastName: "Doe",
        email: "minister.emoven@proton.me",
        accounts: "Barclays A/C 994857 and Council Tax Acc 09384",
        reference: "Referred by Minister Mervyn",
        date: "2026-04-10",
        rollNumber: "ULCT-UK-2026-0081",
        thumbprintImg: "data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='100' height='100' viewBox='0 0 100 100'><circle cx='50' cy='50' r='40' fill='none' stroke='red' stroke-width='3'/></svg>"
      }
    ],
    claims: [
      {
        id: "claim-1",
        userId: "user-1",
        fullName: "Minister Emoven",
        email: "minister.emoven@proton.me",
        liabilities: { councilTax: 180, electricity: 220, gas: 150, water: 80, food: 150, other: 0 },
        totalSpent: 780,
        serviceHours: 5,
        serviceOffer: "Farming & Food Cultivation at Leeds Community Garden",
        serviceWhereWhen: "Saturdays 9am-2pm, Leeds LS9",
        status: "APPROVED",
        dischargedDate: "2026-04-11T12:00:00.000Z",
        refNo: "KC-CLAIM-0012"
      }
    ],
    harassment: [
      {
        id: "harr-1",
        emovenId: "ME-01928-UK",
        kcAccount: "KC-8849-01",
        email: "minister.emoven@proton.me",
        phone: "+447700900077",
        debtorType: "Corporate Agency",
        corpName: "BRITISH GAS PLC",
        fictionNumber: "BG-9993-81203",
        corpContact: "litigation@britishgas.co.uk",
        territory: "United Kingdom",
        details: "Sent automated threat of entry regarding unsanctioned smart meter installation, despite multiple rebuttals of presumed consent.",
        noticeDate1: "2026-04-15",
        noticeDate2: "2026-05-01",
        status: "AOC_SERVED"
      }
    ],
    meetings: [
      {
        id: "meet-1",
        name: "Minister Emoven",
        email: "minister.emoven@proton.me",
        borough: "Leeds Outer West",
        country: "United Kingdom",
        state: "West Yorkshire",
        postcode: "LS28 6PT",
        subject: "Community Garden Space Assembly",
        message: "We need to coordinate the seeds shipment from Greece (Ellas) under the ULC Trust maritime transport.",
        date: "2026-05-20"
      }
    ],
    feedback: [
      {
        id: "feed-1",
        name: "Minister Sean",
        email: "sean@proton.me",
        message: "I discharged my Council Tax liability completely after serving the Assignment of Consent on York Council! In Truth We Trust.",
        date: "2026-05-10"
      }
    ],
    ledger: [
      {
        id: "tx-1",
        date: "2026-05-19T18:45:00.000Z",
        sender: "Global Trust Pool",
        recipient: "Minister Emoven (Leeds)",
        type: "conversion",
        amountKC: 7800,
        details: "Discharged monthly liabilities (Gas, Electricity, Council Tax) - Backed by 5h Farming Exchange",
        equivalentSlaveTokens: "£780.00"
      },
      {
        id: "tx-2",
        date: "2026-05-19T19:00:00.000Z",
        sender: "Minister Emoven",
        recipient: "ULC Trust Community Chest",
        type: "donation",
        amountKC: 780,
        details: "10% Energy Return to Fund People's Protection Patrol",
        equivalentSlaveTokens: "£78.00"
      }
    ]
  };

  writeDB(template);
  res.json({ success: true, db: template });
});

// Mount Vite or static server
async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'custom',
    });
    
    app.use(vite.middlewares);
    
    app.use('*', async (req, res, next) => {
      const url = req.originalUrl;
      try {
        let template = fs.readFileSync(path.join(currentDir, 'index.html'), 'utf-8');
        template = await vite.transformIndexHtml(url, template);
        res.status(200).set({ 'Content-Type': 'text/html' }).end(template);
      } catch (e) {
        vite.ssrFixStacktrace(e as Error);
        next(e);
      }
    });
    
    console.log("Vite development middleware integrated.");
  } else {
    // Serve static files in production
    app.use(express.static(path.join(currentDir, 'dist')));
    
    app.get('*', (req, res) => {
      res.sendFile(path.join(currentDir, 'dist', 'index.html'));
    });
  }

  app.listen(port, '0.0.0.0', () => {
    console.log(`Full-stack server running on http://0.0.0.0:${port}`);
  });
}

startServer();
