# Basic Website — Extended

This commit adds:

- Hero video background (uses a public sample MP4 as the demo source)
- Pricing section
- Testimonials carousel (auto + manual controls)
- Contact form backend (Express + nodemailer)
- Portfolio-style single-page layout updates

Files added/updated in this commit:
- index.html
- styles.css
- script.js
- server/server.js
- server/package.json
- README.md
- .gitignore

---

How to run locally (frontend only):
1. Download the repository or clone it.
2. Open `index.html` in a browser. (If you preview from the filesystem, some browsers will still play the remote video; for best results serve it via a simple static server.)

How to run the contact backend (Node/Express):

1. cd server
2. npm install
3. Create a `.env` file in `server/` with these variables:

```
PORT=4123
SMTP_HOST=smtp.example.com
SMTP_PORT=587
SMTP_USER=your-smtp-user
SMTP_PASS=your-smtp-password
RECIPIENT_EMAIL=you@example.com
```

4. Run `npm start` to launch the API at http://localhost:4123
5. When running the backend locally, serve the frontend from a static server (for example `npx serve` in the repo root) so the contact form can POST to `/api/contact` on the same origin or configure a proxy.

Notes:
- The server uses nodemailer and expects real SMTP credentials. You can test with Mailtrap, Ethereal, or your SMTP provider.
- For production, secure environment variables and consider adding rate-limiting and spam protection (reCAPTCHA).
