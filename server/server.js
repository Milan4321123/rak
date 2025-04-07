/**
 * server.js
 * Run with: node server.js  (or use nodemon)
 */

const express = require("express");
const path = require("path");
const nodemailer = require("nodemailer");
const cors = require("cors");
const mongoose = require("mongoose");
require("dotenv").config(); // Ensure EMAIL_USER, EMAIL_PASS, MONGODB_URI are set

// Import your Mongoose models
const Appointment = require("./models/Appointment.js");
const Subscriber = require("./models/Subscriber.js");

const app = express();
const PORT = process.env.PORT || 3000;

/* ================================================
   1) Connect to MongoDB
   ================================================ */
async function connectDB() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log("Connected to MongoDB Atlas");
  } catch (err) {
    console.error("Error connecting to MongoDB:", err);
    process.exit(1);
  }
}
connectDB();

/* ================================================
   2) Middleware
   ================================================ */
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

/* ================================================
   3) Serve static files (CSS, JS, assets)
   ================================================ */
app.use("/css", express.static(path.join(__dirname, "..", "css")));
app.use("/js", express.static(path.join(__dirname, "..", "js")));
app.use("/assets", express.static(path.join(__dirname, "..", "assets")));

/* ================================================
   4) Serve .html from the project root
   ================================================ */
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "..", "index.html"));
});
app.get("/index.html", (req, res) => {
  res.sendFile(path.join(__dirname, "..", "index.html"));
});
app.get("/arbeiten.html", (req, res) => {
  res.sendFile(path.join(__dirname, "..", "arbeiten.html"));
});
app.get("/datenschutz.html", (req, res) => {
  res.sendFile(path.join(__dirname, "..", "datenschutz.html"));
});
app.get("/datenschutzEn.html", (req, res) => {
  res.sendFile(path.join(__dirname, "..", "datenschutzEn.html"));
});
app.get("/kontakt.html", (req, res) => {
  res.sendFile(path.join(__dirname, "..", "kontakt.html"));
});
app.get("/dienstleistungen.html", (req, res) => {
  res.sendFile(path.join(__dirname, "..", "dienstleistungen.html"));
});
app.get("/uber-uns.html", (req, res) => {
  res.sendFile(path.join(__dirname, "..", "uber-uns.html"));
});
app.get("/danke.html", (req, res) => {
  res.sendFile(path.join(__dirname, "..", "danke.html"));
});
app.get("/status.html", (req, res) => {
  res.sendFile(path.join(__dirname, "..", "status.html"));
});

/* ================================================
   5) Admin Panel with Basic Auth
   ================================================ */
// Simple Basic Auth middleware
const basicAuth = (req, res, next) => {
  // The credentials are base64 encoded in the format username:password
  const authHeader = req.headers.authorization;
  
  if (!authHeader) {
    res.setHeader('WWW-Authenticate', 'Basic realm="Remix Gradnja Admin"');
    return res.status(401).send('Authentication required');
  }
  
  const auth = Buffer.from(authHeader.split(' ')[1], 'base64').toString().split(':');
  const user = auth[0];
  const pass = auth[1];
  
  // Simple credentials check - in production, use environment variables or database
  if (user === 'admin' && pass === 'remixgradnja2024') {
    return next();
  }
  
  res.setHeader('WWW-Authenticate', 'Basic realm="Remix Gradnja Admin"');
  return res.status(401).send('Authentication failed');
};

// Admin panel route with basic auth
app.get("/admin", basicAuth, (req, res) => {
  res.sendFile(path.join(__dirname, "admin-panel", "index.html"));
});

/* ========================================================================
   SUBSCRIBER ROUTES (Newsletter)
   ======================================================================== */
app.options("/subscribe", cors()); // For CORS preflight (if needed)

/**
 * POST /subscribe
 * - Receives { email, language } from your newsletter form
 * - If email already exists => redirect ?subscribed=1
 * - Else => create in DB, send welcome email, redirect ?success=1&subscribe=1
 * - On error => ?error=1
 */
app.post("/subscribe", async (req, res) => {
  try {
    const { email, language } = req.body;  // "en" or "de"

    if (!email) {
      // No email => error
      return res.redirect(`/danke.html?error=1&lang=${language || "de"}`);
    }

    // Check if already subscribed
    const existing = await Subscriber.findOne({ email });
    if (existing) {
      // Already subscribed => ?subscribed=1
      return res.redirect(`/danke.html?subscribed=1&lang=${language || "de"}`);
    }

    // Otherwise create
    const newSub = new Subscriber({ email });
    await newSub.save();
    console.log("New newsletter subscriber saved:", email);

    // Prepare welcome email (English or German)
    const transporter = nodemailer.createTransport({
      service: "Gmail",
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });

    let subjectLine, messageText, messageHTML;
    if (language === "en") {
      subjectLine = "Welcome to Remix Gradnja – Thank You for Subscribing!";
      messageText = `Hello,

Thank you for subscribing to the Remix Gradnja newsletter! We're excited to keep you informed about our latest services, industry insights, and special offers.

Should you have any questions or requests, feel free to reply to this email or visit our website at https://www.remixrijeka.de.

Kind regards,

Remix Gradnja  
Industriestraße 27  
61381 Friedrichsdorf  

WhatsApp: +385 (99) 532 1237  
WhatsApp: +385 (99) 208 8076  
Email: remix.gradnja@web.de  
Website: www.remixrijeka.de  

Head Office:  
Marije Grbac 14  
51000 Rijeka  

Branch Office:  
Industriestraße 27  
61381 Friedrichsdorf  

Management: Goran Cosic  
Deputy: Drago Cosic  

---

**Confidentiality Notice**  
This email and any attachments may contain confidential and/or legally protected information. If you are not the intended recipient, please inform the sender immediately and delete this message. Any unauthorized copying or further distribution is prohibited. Your personal data is stored securely to prevent third-party access; however, email communication is generally unencrypted and can potentially be read by unauthorized persons on the internet, making complete data security impossible. If you prefer not to communicate by email, please let us know, and we will send correspondence by postal mail instead.
`;
      messageHTML = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Welcome to Remix Gradnja</title>
        <style>
          body {
            font-family: Arial, sans-serif;
            line-height: 1.6;
            color: #333;
            margin: 0;
            padding: 0;
          }
          .container {
            max-width: 600px;
            margin: 0 auto;
            padding: 20px;
          }
          .header {
            background-color: #181844;
            padding: 20px;
            text-align: center;
          }
          .header h1 {
            color: white;
            margin: 0;
          }
          .content {
            padding: 20px;
            background-color: #f9f9f9;
          }
          .footer {
            padding: 20px;
            font-size: 12px;
            color: #666;
            background-color: #f1f1f1;
          }
          .contact-info {
            border-top: 1px solid #ddd;
            margin-top: 20px;
            padding-top: 20px;
          }
          .disclaimer {
            border-top: 1px solid #ddd;
            margin-top: 20px;
            padding-top: 20px;
            font-size: 11px;
          }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>Welcome to Remix Gradnja</h1>
          </div>
          <div class="content">
            <p>Hello,</p>
            
            <p>Thank you for subscribing to the <strong>Remix Gradnja newsletter</strong>! We're excited to keep you informed about our latest services, industry insights, and special offers.</p>
            
            <p>Should you have any questions or requests, feel free to reply to this email or visit our website at <a href="https://www.remixrijeka.de">www.remixrijeka.de</a>.</p>
            
            <p>Kind regards,<br>
            <strong>Remix Gradnja</strong></p>
            
            <div class="contact-info">
              <p>
                <strong>Contact Information:</strong><br>
                Industriestraße 27<br>
                61381 Friedrichsdorf<br><br>
                
                WhatsApp: +385 (99) 532 1237<br>
                WhatsApp: +385 (99) 208 8076<br>
                Email: remix.gradnja@web.de<br>
                Website: <a href="https://www.remixrijeka.de">www.remixrijeka.de</a>
              </p>
              
              <p>
                <strong>Head Office:</strong><br>
                Marije Grbac 14<br>
                51000 Rijeka
              </p>
              
              <p>
                <strong>Branch Office:</strong><br>
                Industriestraße 27<br>
                61381 Friedrichsdorf
              </p>
              
              <p>
                <strong>Management:</strong> Goran Cosic<br>
                <strong>Deputy:</strong> Drago Cosic
              </p>
            </div>
          </div>
          <div class="footer">
            <div class="disclaimer">
              <strong>Confidentiality Notice</strong><br>
              This email and any attachments may contain confidential and/or legally protected information. If you are not the intended recipient, please inform the sender immediately and delete this message. Any unauthorized copying or further distribution is prohibited. Your personal data is stored securely to prevent third-party access; however, email communication is generally unencrypted and can potentially be read by unauthorized persons on the internet, making complete data security impossible. If you prefer not to communicate by email, please let us know, and we will send correspondence by postal mail instead.
            </div>
          </div>
        </div>
      </body>
      </html>
`;
    } else {
      // default: German
      subjectLine = "Willkommen bei Remix Gradnja – Danke für Ihre Anmeldung!";
      messageText = `Hallo,

vielen Dank für Ihre Anmeldung zum Remix Gradnja Newsletter! Wir freuen uns darauf, Ihnen künftig aktuelle Informationen, Branchen-News und exklusive Angebote zu übermitteln.

Sollten Sie Fragen oder besondere Wünsche haben, antworten Sie einfach auf diese E-Mail oder besuchen Sie unsere Webseite unter https://www.remixrijeka.de.

Freundliche Grüße,

Remix Gradnja  
Industriestraße 27  
61381 Friedrichsdorf  

WhatsApp: +385 (99) 532 1237  
WhatsApp: +385 (99) 208 8076  
E-Mail: remix.gradnja@web.de  
Web: www.remixrijeka.de  

Hauptsitz:  
Marije Grbac 14  
51000 Rijeka  

Zweigstelle:  
Industriestraße 27  
61381 Friedrichsdorf  

Geschäftsführung: Goran Cosic  
Stellvertretung: Drago Cosic  

---

**Rechtlicher Hinweis**  
Diese E-Mail und ihre Anhänge können vertrauliche bzw. rechtlich geschützte Informationen enthalten. Falls Sie diese Nachricht irrtümlich erhalten haben, informieren Sie bitte sofort den Absender und löschen Sie diese E-Mail. Eine unbefugte Vervielfältigung oder Weiterleitung ist untersagt. Wir speichern Ihre personenbezogenen Daten so, dass sie für Dritte nicht zugänglich sind; jedoch erfolgt E-Mail-Kommunikation in der Regel unverschlüsselt und kann gegebenenfalls auf dem Übertragungsweg von Unbefugten eingesehen werden, sodass eine vollständige Datensicherheit nicht gewährleistet werden kann. Wenn Sie keine Kommunikation per E-Mail wünschen, geben Sie uns bitte Bescheid; in diesem Fall senden wir unsere Korrespondenz ausschließlich per Post.
`;
      messageHTML = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Willkommen bei Remix Gradnja</title>
        <style>
          body {
            font-family: Arial, sans-serif;
            line-height: 1.6;
            color: #333;
            margin: 0;
            padding: 0;
          }
          .container {
            max-width: 600px;
            margin: 0 auto;
            padding: 20px;
          }
          .header {
            background-color: #181844;
            padding: 20px;
            text-align: center;
          }
          .header h1 {
            color: white;
            margin: 0;
          }
          .content {
            padding: 20px;
            background-color: #f9f9f9;
          }
          .footer {
            padding: 20px;
            font-size: 12px;
            color: #666;
            background-color: #f1f1f1;
          }
          .contact-info {
            border-top: 1px solid #ddd;
            margin-top: 20px;
            padding-top: 20px;
          }
          .disclaimer {
            border-top: 1px solid #ddd;
            margin-top: 20px;
            padding-top: 20px;
            font-size: 11px;
          }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>Willkommen bei Remix Gradnja</h1>
          </div>
          <div class="content">
            <p>Hallo,</p>
            
            <p>vielen Dank für Ihre Anmeldung zum <strong>Remix Gradnja Newsletter</strong>! Wir freuen uns darauf, Ihnen künftig aktuelle Informationen, Branchen-News und exklusive Angebote zu übermitteln.</p>
            
            <p>Sollten Sie Fragen oder besondere Wünsche haben, antworten Sie einfach auf diese E-Mail oder besuchen Sie unsere Webseite unter <a href="https://www.remixrijeka.de">www.remixrijeka.de</a>.</p>
            
            <p>Freundliche Grüße,<br>
            <strong>Remix Gradnja</strong></p>
            
            <div class="contact-info">
              <p>
                <strong>Kontaktinformationen:</strong><br>
                Industriestraße 27<br>
                61381 Friedrichsdorf<br><br>
                
                WhatsApp: +385 (99) 532 1237<br>
                WhatsApp: +385 (99) 208 8076<br>
                E-Mail: remix.gradnja@web.de<br>
                Web: <a href="https://www.remixrijeka.de">www.remixrijeka.de</a>
              </p>
              
              <p>
                <strong>Hauptsitz:</strong><br>
                Marije Grbac 14<br>
                51000 Rijeka
              </p>
              
              <p>
                <strong>Zweigstelle:</strong><br>
                Industriestraße 27<br>
                61381 Friedrichsdorf
              </p>
              
              <p>
                <strong>Geschäftsführung:</strong> Goran Cosic<br>
                <strong>Stellvertretung:</strong> Drago Cosic
              </p>
            </div>
          </div>
          <div class="footer">
            <div class="disclaimer">
              <strong>Rechtlicher Hinweis</strong><br>
              Diese E-Mail und ihre Anhänge können vertrauliche bzw. rechtlich geschützte Informationen enthalten. Falls Sie diese Nachricht irrtümlich erhalten haben, informieren Sie bitte sofort den Absender und löschen Sie diese E-Mail. Eine unbefugte Vervielfältigung oder Weiterleitung ist untersagt. Wir speichern Ihre personenbezogenen Daten so, dass sie für Dritte nicht zugänglich sind; jedoch erfolgt E-Mail-Kommunikation in der Regel unverschlüsselt und kann gegebenenfalls auf dem Übertragungsweg von Unbefugten eingesehen werden, sodass eine vollständige Datensicherheit nicht gewährleistet werden kann. Wenn Sie keine Kommunikation per E-Mail wünschen, geben Sie uns bitte Bescheid; in diesem Fall senden wir unsere Korrespondenz ausschließlich per Post.
            </div>
          </div>
        </div>
      </body>
      </html>
      `;
    }

    // Send welcome email
    await transporter.sendMail({
      from: `"Remix Gradnja Newsletter" <${process.env.EMAIL_USER}>`,
      to: email,
      subject: subjectLine,
      text: messageText,
      html: messageHTML
    });

    // On success => ?success=1&subscribe=1
    return res.redirect(`/danke.html?success=1&subscribe=1&lang=${language || "de"}`);
  } catch (err) {
    console.error("Error in /subscribe route:", err);
    return res.redirect(`/danke.html?error=1&lang=de`);
  }
});

/**
 * GET /subscribers -> admin usage
 */
app.get("/subscribers", async (req, res) => {
  try {
    const allSubs = await Subscriber.find().sort({ createdAt: -1 });
    return res.json(allSubs);
  } catch (err) {
    console.error("Error fetching subscribers:", err);
    return res
      .status(500)
      .json({ success: false, msg: "Failed to fetch subscribers." });
  }
});

/**
 * DELETE /subscribers/:id -> remove subscriber
 */
app.delete("/subscribers/:id", async (req, res) => {
  try {
    const { id } = req.params;
    await Subscriber.findByIdAndDelete(id);
    return res.json({ success: true, msg: "Subscriber deleted." });
  } catch (err) {
    console.error("Error deleting subscriber:", err);
    return res
      .status(500)
      .json({ success: false, msg: "Failed to delete subscriber." });
  }
});

/* ========================================================================
   CONTACT / APPOINTMENT ROUTES
   ======================================================================== */
/**
 * POST /send-email
 * - Receives { name, email, message, wantsAppointment, terminDate, terminTime, hp, language }
 * - If wantsAppointment is "on" + date/time => sets appointmentDateTime
 * - On success => /danke.html?success=1 (+ &appointment=1) + &lang=
 * - On error => /danke.html?error=1 + &lang=
 */
app.post("/send-email", async (req, res) => {
  try {
    const {
      name,
      email,
      message,
      wantsAppointment, // "on" if selected
      terminDate,
      terminTime,
      hp,               // honeypot
      language          // "en" or "de"
    } = req.body;

    // A) Honeypot / basic checks
    if (hp && hp.trim() !== "") {
      return res.redirect(`/danke.html?error=1&lang=${language || "de"}`);
    }
    if (!name || !email || !message) {
      return res.redirect(`/danke.html?error=1&lang=${language || "de"}`);
    }

    // B) Possibly store appointment
    let appointmentDateTime = null;
    let queryString = `?success=1&lang=${language || "de"}`;
    let snippetDe = "";
    let snippetEn = "";

    if (wantsAppointment === "on" && terminDate && terminTime) {
      appointmentDateTime = new Date(`${terminDate}T${terminTime}:00`);
      queryString += "&appointment=1";
      snippetDe = `\n\nHinweis zum Termin:\nDatum: ${terminDate}, Uhrzeit: ${terminTime}`;
      snippetEn = `\n\nAppointment Note:\nDate: ${terminDate}, Time: ${terminTime}`;
    }

    // C) Save in DB
    const newAppointment = new Appointment({
      name,
      email,
      message,
      appointmentDateTime
    });
    await newAppointment.save();
    console.log("New inquiry stored in DB:", newAppointment);

    // D) Email to admin
    const transporter = nodemailer.createTransport({
      service: "Gmail",
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
      }
    });

    // Subject + text to admin
    let adminSubject, adminText;
    if (language === "en") {
      adminSubject = "New Inquiry";
      adminText = `Name: ${name}\nEmail: ${email}\nMessage:\n${message}\n`;
      if (appointmentDateTime) {
        adminSubject += " (Appointment)";
        adminText += `\nAppointment requested on: ${terminDate} at ${terminTime}\n`;
      }
    } else {
      adminSubject = "Neue Kontakt-Anfrage";
      adminText = `Name: ${name}\nEmail: ${email}\nNachricht:\n${message}\n`;
      if (appointmentDateTime) {
        adminSubject += " (Terminwunsch)";
        adminText += `\nTermin: ${terminDate}, ${terminTime}\n`;
      }
    }

    await transporter.sendMail({
      from: `"${name}" <${email}>`,
      to: process.env.EMAIL_USER,
      subject: adminSubject,
      text: adminText
    });

    // E) Auto-reply to user
    let autoSubject, autoBody, autoHTML;
    if (language === "en") {
      autoSubject = "Your Inquiry at Remix Gradnja";
      autoBody = `Hello ${name},

Thank you for reaching out to Remix Gradnja. We appreciate your inquiry and will respond as soon as possible.

${appointmentDateTime ? snippetEn : ''}

Reference Number: ${newAppointment._id}
You can check the status of your inquiry at any time: https://www.remixrijeka.de/status.html?lang=en

Should you have any additional questions, feel free to reply to this email or visit our website at https://www.remixrijeka.de.

Kind regards,

Remix Gradnja  
Industriestraße 27  
61381 Friedrichsdorf  

WhatsApp: +385 (99) 532 1237  
WhatsApp: +385 (99) 208 8076  
Email: remix.gradnja@web.de  
Website: www.remixrijeka.de  

Head Office:  
Marije Grbac 14  
51000 Rijeka  

Branch Office:  
Industriestraße 27  
61381 Friedrichsdorf  

Management: Goran Cosic  
Deputy: Drago Cosic  

---

**Confidentiality Notice**  
This email and any attachments may contain confidential and/or legally protected information. If you are not the intended recipient, please notify the sender immediately and delete this email. Any unauthorized copying or sharing is prohibited. We store your personal data securely so that it is inaccessible to third parties; however, email communications are generally unencrypted and may be readable by unauthorized persons on the internet, so complete data security cannot be guaranteed. If you prefer not to communicate via email, please let us know, and we will send correspondence via postal mail.

`;
      autoHTML = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Your Inquiry at Remix Gradnja</title>
        <style>
          body {
            font-family: Arial, sans-serif;
            line-height: 1.6;
            color: #333;
            margin: 0;
            padding: 0;
          }
          .container {
            max-width: 600px;
            margin: 0 auto;
            padding: 20px;
          }
          .header {
            background-color: #181844;
            padding: 20px;
            text-align: center;
          }
          .header h1 {
            color: white;
            margin: 0;
          }
          .content {
            padding: 20px;
            background-color: #f9f9f9;
          }
          .appointment-info {
            background-color: #e0a70c;
            color: #333;
            padding: 15px;
            margin: 20px 0;
            border-radius: 5px;
          }
          .reference-info {
            background-color: #e8f4fd;
            border: 1px solid #cce5ff;
            color: #004085;
            padding: 15px;
            margin: 20px 0;
            border-radius: 5px;
          }
          .reference-info h3 {
            margin-top: 0;
          }
          .footer {
            padding: 20px;
            font-size: 12px;
            color: #666;
            background-color: #f1f1f1;
          }
          .contact-info {
            border-top: 1px solid #ddd;
            margin-top: 20px;
            padding-top: 20px;
          }
          .disclaimer {
            border-top: 1px solid #ddd;
            margin-top: 20px;
            padding-top: 20px;
            font-size: 11px;
          }
          .btn {
            display: inline-block;
            padding: 10px 16px;
            background-color: #181844;
            color: white;
            text-decoration: none;
            border-radius: 4px;
            font-weight: bold;
            margin-top: 10px;
          }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>Thank You for Your Inquiry</h1>
          </div>
          <div class="content">
            <p>Hello ${name},</p>
            
            <p>Thank you for reaching out to <strong>Remix Gradnja</strong> We appreciate your inquiry and will respond as soon as possible.</p>
            
            ${appointmentDateTime ? `
            <div class="appointment-info">
              <strong>Appointment Request Information:</strong><br>
              Date: ${terminDate}<br>
              Time: ${terminTime}
            </div>
            ` : ''}
            
            <div class="reference-info">
              <h3>Your Reference Information</h3>
              <p><strong>Reference Number:</strong> ${newAppointment._id}</p>
              <p>You can check the status of your inquiry at any time:</p>
              <a href="https://www.remixrijeka.de/status.html?lang=en" class="btn">Check Status</a>
            </div>
            
            <p>Should you have any additional questions, feel free to reply to this email or visit our website at <a href="https://www.remixrijeka.de">www.remixrijeka.de</a>.</p>
            
            <p>Kind regards,<br>
            <strong>Remix Gradnja</strong></p>
            
            <div class="contact-info">
              <p>
                <strong>Contact Information:</strong><br>
                Industriestraße 27<br>
                61381 Friedrichsdorf<br><br>
                
                WhatsApp: +385 (99) 532 1237<br>
                WhatsApp: +385 (99) 208 8076<br>
                Email: remix.gradnja@web.de<br>
                Website: <a href="https://www.remixrijeka.de">www.remixrijeka.de</a>
              </p>
              
              <p>
                <strong>Head Office:</strong><br>
                Marije Grbac 14<br>
                51000 Rijeka
              </p>
              
              <p>
                <strong>Branch Office:</strong><br>
                Industriestraße 27<br>
                61381 Friedrichsdorf
              </p>
              
              <p>
                <strong>Management:</strong> Goran Cosic<br>
                <strong>Deputy:</strong> Drago Cosic
              </p>
            </div>
          </div>
          <div class="footer">
            <div class="disclaimer">
              <strong>Confidentiality Notice</strong><br>
              This email and any attachments may contain confidential and/or legally protected information. If you are not the intended recipient, please notify the sender immediately and delete this email. Any unauthorized copying or sharing is prohibited. We store your personal data securely so that it is inaccessible to third parties; however, email communications are generally unencrypted and may be readable by unauthorized persons on the internet, so complete data security cannot be guaranteed. If you prefer not to communicate via email, please let us know, and we will send correspondence via postal mail.
            </div>
          </div>
        </div>
      </body>
      </html>
`;
    } else {
      autoSubject = "Ihre Anfrage bei Remix Gradnja";
      autoBody = `Hallo ${name},

vielen Dank für Ihre Nachricht an Remix Gradnja. Wir haben Ihre Anfrage erhalten und melden uns schnellstmöglich bei Ihnen.

${appointmentDateTime ? snippetDe : ''}

Referenznummer: ${newAppointment._id}
Sie können den Status Ihrer Anfrage jederzeit überprüfen: https://www.remixrijeka.de/status.html

Sollten Sie weitere Fragen haben, antworten Sie gerne auf diese E-Mail oder besuchen Sie unsere Webseite unter https://www.remixrijeka.de.

Freundliche Grüße,

Remix Gradnja  
Industriestraße 27  
61381 Friedrichsdorf  

WhatsApp: +385 (99) 532 1237  
WhatsApp: +385 (99) 208 8076  
E-Mail: remix.gradnja@web.de  
Web: www.remixrijeka.de  

Hauptsitz:  
Marije Grbac 14  
51000 Rijeka  

Zweigstelle:  
Industriestraße 27  
61381 Friedrichsdorf  

Geschäftsführung: Goran Cosic  
Stellvertretung: Drago Cosic  

---

**Rechtlicher Hinweis**  
Diese E-Mail und ihre Anhänge können vertrauliche bzw. rechtlich geschützte Informationen enthalten. Wenn Sie nicht der beabsichtigte Empfänger sind oder diese E-Mail irrtümlich erhalten haben, informieren Sie bitte umgehend den Absender und löschen Sie diese E-Mail. Jegliches unerlaubte Kopieren oder Weiterleiten ist untersagt. Wir speichern Ihre personenbezogenen Daten so, dass Dritte keinen Zugriff haben. Da die Kommunikation per E-Mail in der Regel unverschlüsselt erfolgt, kann eine vollständige Datensicherheit nicht garantiert werden. Falls Sie keine Kommunikation per E-Mail wünschen, teilen Sie uns dies bitte mit. In diesem Fall versenden wir unsere Korrespondenz ausschließlich auf dem Postweg.

`;
      autoHTML = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Ihre Anfrage bei Remix Gradnja</title>
        <style>
          body {
            font-family: Arial, sans-serif;
            line-height: 1.6;
            color: #333;
            margin: 0;
            padding: 0;
          }
          .container {
            max-width: 600px;
            margin: 0 auto;
            padding: 20px;
          }
          .header {
            background-color: #181844;
            padding: 20px;
            text-align: center;
          }
          .header h1 {
            color: white;
            margin: 0;
          }
          .content {
            padding: 20px;
            background-color: #f9f9f9;
          }
          .appointment-info {
            background-color: #e0a70c;
            color: #333;
            padding: 15px;
            margin: 20px 0;
            border-radius: 5px;
          }
          .reference-info {
            background-color: #e8f4fd;
            border: 1px solid #cce5ff;
            color: #004085;
            padding: 15px;
            margin: 20px 0;
            border-radius: 5px;
          }
          .reference-info h3 {
            margin-top: 0;
          }
          .footer {
            padding: 20px;
            font-size: 12px;
            color: #666;
            background-color: #f1f1f1;
          }
          .contact-info {
            border-top: 1px solid #ddd;
            margin-top: 20px;
            padding-top: 20px;
          }
          .disclaimer {
            border-top: 1px solid #ddd;
            margin-top: 20px;
            padding-top: 20px;
            font-size: 11px;
          }
          .btn {
            display: inline-block;
            padding: 10px 16px;
            background-color: #181844;
            color: white;
            text-decoration: none;
            border-radius: 4px;
            font-weight: bold;
            margin-top: 10px;
          }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>Vielen Dank für Ihre Anfrage</h1>
          </div>
          <div class="content">
            <p>Hallo ${name},</p>
            
            <p>vielen Dank für Ihre Nachricht an <strong>Remix Gradnja</strong> Wir haben Ihre Anfrage erhalten und melden uns schnellstmöglich bei Ihnen.</p>
            
            ${appointmentDateTime ? `
            <div class="appointment-info">
              <strong>Terminanfrage:</strong><br>
              Datum: ${terminDate}<br>
              Uhrzeit: ${terminTime}
            </div>
            ` : ''}
            
            <div class="reference-info">
              <h3>Ihre Referenzinformationen</h3>
              <p><strong>Referenznummer:</strong> ${newAppointment._id}</p>
              <p>Sie können den Status Ihrer Anfrage jederzeit überprüfen:</p>
              <a href="https://www.remixrijeka.de/status.html" class="btn">Status prüfen</a>
            </div>
            
            <p>Sollten Sie weitere Fragen haben, antworten Sie gerne auf diese E-Mail oder besuchen Sie unsere Webseite unter <a href="https://www.remixrijeka.de">www.remixrijeka.de</a>.</p>
            
            <p>Freundliche Grüße,<br>
            <strong>Remix Gradnja</strong></p>
            
            <div class="contact-info">
              <p>
                <strong>Kontaktinformationen:</strong><br>
                Industriestraße 27<br>
                61381 Friedrichsdorf<br><br>
                
                WhatsApp: +385 (99) 532 1237<br>
                WhatsApp: +385 (99) 208 8076<br>
                E-Mail: remix.gradnja@web.de<br>
                Web: <a href="https://www.remixrijeka.de">www.remixrijeka.de</a>
              </p>
              
              <p>
                <strong>Hauptsitz:</strong><br>
                Marije Grbac 14<br>
                51000 Rijeka
              </p>
              
              <p>
                <strong>Zweigstelle:</strong><br>
                Industriestraße 27<br>
                61381 Friedrichsdorf
              </p>
              
              <p>
                <strong>Geschäftsführung:</strong> Goran Cosic<br>
                <strong>Stellvertretung:</strong> Drago Cosic
              </p>
            </div>
          </div>
          <div class="footer">
            <div class="disclaimer">
              <strong>Rechtlicher Hinweis</strong><br>
              Diese E-Mail und ihre Anhänge können vertrauliche bzw. rechtlich geschützte Informationen enthalten. Wenn Sie nicht der beabsichtigte Empfänger sind oder diese E-Mail irrtümlich erhalten haben, informieren Sie bitte umgehend den Absender und löschen Sie diese E-Mail. Jegliches unerlaubte Kopieren oder Weiterleiten ist untersagt. Wir speichern Ihre personenbezogenen Daten so, dass Dritte keinen Zugriff haben. Da die Kommunikation per E-Mail in der Regel unverschlüsselt erfolgt, kann eine vollständige Datensicherheit nicht garantiert werden. Falls Sie keine Kommunikation per E-Mail wünschen, teilen Sie uns dies bitte mit. In diesem Fall versenden wir unsere Korrespondenz ausschließlich auf dem Postweg.
            </div>
          </div>
        </div>
      </body>
      </html>
      `;
    }

    await transporter.sendMail({
      from: `"Remix Gradnja" <${process.env.EMAIL_USER}>`,
      replyTo: email,
      to: email,
      subject: autoSubject,
      text: autoBody,
      html: autoHTML
    });

    // F) Redirect => danke
    return res.redirect(`/danke.html${queryString}`);
  } catch (err) {
    console.error("Error in /send-email route:", err);
    return res.redirect(`/danke.html?error=1&lang=de`);
  }
});

/* ================================================
   APPOINTMENT ADMIN ROUTES
   ================================================ */
// GET /appointments
app.get("/appointments", async (req, res) => {
  try {
    const all = await Appointment.find().sort({ createdAt: -1 });
    return res.json(all);
  } catch (err) {
    console.error("Error fetching appointments:", err);
    return res.status(500).json({ success: false, msg: "Failed to fetch appointments." });
  }
});

/**
 * PUBLIC APPOINTMENT STATUS CHECK
 * For users to check status of their appointment/inquiry
 */
app.get("/check-status", async (req, res) => {
  try {
    const { email, id } = req.query;
    
    // Both email and ID are required
    if (!email || !id) {
      return res.status(400).json({ 
        success: false, 
        msg: "Email and reference ID are required." 
      });
    }
    
    // Find the appointment that matches both email and _id
    const appointment = await Appointment.findOne({ 
      _id: id, 
      email: email 
    });
    
    if (!appointment) {
      return res.status(404).json({ 
        success: false, 
        msg: "No matching inquiry found. Please verify your email and reference ID." 
      });
    }
    
    // Format the appointment date if it exists
    let formattedAppointmentDate = null;
    if (appointment.appointmentDateTime) {
      const date = new Date(appointment.appointmentDateTime);
      formattedAppointmentDate = {
        date: date.toLocaleDateString(),
        time: date.toLocaleTimeString()
      };
    }
    
    // Map the status to a user-friendly value
    let statusText;
    switch (appointment.status) {
      case 'confirmed':
        statusText = 'Bestätigt / Confirmed';
        break;
      case 'canceled':
        statusText = 'Abgesagt / Canceled';
        break;
      default:
        statusText = 'In Bearbeitung / Pending';
        break;
    }
    
    // Create a message preview (truncated) if message exists
    let messagePreview = null;
    if (appointment.message) {
      // Get the first 100 characters of the message
      messagePreview = appointment.message.length > 100 
        ? appointment.message.substring(0, 100) + '...' 
        : appointment.message;
    }
    
    // Get date it was last updated (for status changes)
    const lastUpdated = appointment.updatedAt && appointment.updatedAt !== appointment.createdAt
      ? new Date(appointment.updatedAt).toLocaleDateString()
      : null;
    
    // Return the status data
    return res.json({
      success: true,
      data: {
        name: appointment.name,
        email: appointment.email,
        createdAt: new Date(appointment.createdAt).toLocaleDateString(),
        lastUpdated: lastUpdated,
        status: appointment.status,
        statusText: statusText,
        hasAppointment: !!appointment.appointmentDateTime,
        appointmentDateTime: formattedAppointmentDate,
        messagePreview: messagePreview
      }
    });
    
  } catch (err) {
    console.error("Error checking appointment status:", err);
    return res.status(500).json({ 
      success: false, 
      msg: "An error occurred while checking your inquiry status." 
    });
  }
});

// PUT /appointments/:id -> confirm/cancel
app.put("/appointments/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body; // e.g. "confirmed" or "canceled"
    
    // Get the appointment before updating to access email and other details
    const appointment = await Appointment.findById(id);
    
    if (!appointment) {
      return res.status(404).json({ success: false, msg: "Appointment not found." });
    }
    
    // Update the appointment
    const updated = await Appointment.findByIdAndUpdate(
      id,
      { status },
      { new: true }
    );
    
    // Send notification email to the customer
    const { email, name } = appointment;
    
    // Determine status text for email
    let statusText = status === 'confirmed' ? 'bestätigt / confirmed' : 'abgesagt / canceled';
    
    // Format appointment date if exists
    let appointmentDetails = '';
    if (appointment.appointmentDateTime) {
      const date = new Date(appointment.appointmentDateTime);
      const formattedDate = date.toLocaleDateString();
      const formattedTime = date.toLocaleTimeString();
      appointmentDetails = `
        <p><strong>Termin / Appointment:</strong> ${formattedDate}, ${formattedTime}</p>
      `;
    }
    
    // Create email subject and content
    const subject = `Aktualisierung Ihrer Anfrage / Update on your inquiry (ID: ${id})`;
    
    const htmlContent = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Status Update</title>
      <style>
        body {
          font-family: Arial, sans-serif;
          line-height: 1.6;
          margin: 0;
          padding: 0;
          color: #333;
        }
        .container {
          max-width: 600px;
          margin: 0 auto;
          padding: 20px;
        }
        .header {
          background-color: #181844;
          color: white;
          padding: 20px;
          text-align: center;
        }
        .content {
          padding: 20px;
          background: #f9f9f9;
        }
        .footer {
          font-size: 12px;
          color: #666;
          text-align: center;
          margin-top: 20px;
          padding-top: 20px;
          border-top: 1px solid #eee;
        }
        .status-badge {
          display: inline-block;
          padding: 5px 15px;
          border-radius: 20px;
          font-weight: bold;
          margin-top: 10px;
        }
        .status-confirmed {
          background-color: #4CAF50;
          color: white;
        }
        .status-canceled {
          background-color: #f44336;
          color: white;
        }
        .btn {
          display: inline-block;
          padding: 10px 20px;
          background-color: #181844;
          color: white;
          text-decoration: none;
          border-radius: 4px;
          margin-top: 15px;
        }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>Status Update</h1>
        </div>
        <div class="content">
          <p>Hallo / Hello ${name},</p>
          
          <p><strong>Deutsch:</strong></p>
          <p>Der Status Ihrer Anfrage (Referenz: ${id}) wurde aktualisiert.</p>
          <p>Neuer Status: <span class="status-badge status-${status}">${statusText}</span></p>
          ${appointmentDetails}
          <p>Sie können jederzeit den aktuellen Status Ihrer Anfrage überprüfen:</p>
          <p><a href="https://www.remixrijeka.de/status.html" class="btn">Status prüfen</a></p>
          
          <hr>
          
          <p><strong>English:</strong></p>
          <p>The status of your inquiry (Reference: ${id}) has been updated.</p>
          <p>New status: <span class="status-badge status-${status}">${statusText}</span></p>
          ${appointmentDetails}
          <p>You can check the current status of your inquiry at any time:</p>
          <p><a href="https://www.remixrijeka.de/status.html?lang=en" class="btn">Check Status</a></p>
        </div>
        <div class="footer">
          <p>Remix Gradnja</p>
          <p>Marije Grbac 14, 51000 Rijeka | remix.gradnja@web.de</p>
        </div>
      </div>
    </body>
    </html>
    `;
    
    // Send the email notification
    await transporter.sendMail({
      from: `"Remix Gradnja" <${process.env.EMAIL_USER}>`,
      to: email,
      subject: subject,
      html: htmlContent
    });
    
    return res.json({ success: true, data: updated });
  } catch (err) {
    console.error("Error updating appointment:", err);
    return res.status(500).json({ success: false, msg: "Failed to update appointment." });
  }
});

// DELETE /appointments/:id
app.delete("/appointments/:id", async (req, res) => {
  try {
    const { id } = req.params;
    await Appointment.findByIdAndDelete(id);
    return res.json({ success: true, msg: "Appointment deleted." });
  } catch (err) {
    console.error("Error deleting appointment:", err);
    return res.status(500).json({ success: false, msg: "Failed to delete appointment." });
  }
});

// Start the server
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});