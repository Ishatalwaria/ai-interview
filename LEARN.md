# LEARN.md – PrepBuddy

Welcome to the **PrepBuddy** project!  
If you're new here or looking to contribute meaningfully, this guide will help you **understand the project**, **explore its tech stack**, and **get started with contributions** quickly and confidently.

---

## What is PrepBuddy?

**PrepBuddy** is a smart, full-stack interview preparation platform designed to:
- Automatically generate personalized mock interview questions.
- Evaluate candidate answers using AI.
- Provide detailed PDF-based reports for performance review.

It empowers job seekers to **prepare better**, **track progress**, and **improve faster**.

---

## Live Demo



---

## Core Features

| Feature               | Description                                           |
|----------------------|-------------------------------------------------------|
| Firebase Auth      | Secure login/signup                                   |
| AI Evaluation      | Answer assessment using Hugging Face APIs             |
| PDF Reports        | Auto-generated interview feedback reports             |
| Role-Based Qs      | Dynamic question generation by domain                 |
| Resources Page     | Helpful materials for candidates                      |

---

## Tech Stack

### Frontend
- **React + Vite** – Component-based SPA with fast bundling
- **TailwindCSS** – Utility-first CSS for responsive design
- **Firebase Auth** – User authentication and session handling

### Backend
- **Express.js** – REST API handling and routes
- **MongoDB Atlas** – Cloud-hosted database for storing responses
- **Firebase Admin SDK** – Securely verifies user identity
- **Multer** – Handles file uploads (e.g., user resumes)
- **Hugging Face APIs** – For semantic answer evaluation (NLP)

---

## Folder Structure

PrepEdge-AI/  
│  
├── client/ # Frontend  
│ ├── public/  
│ └── src/  
│ ├── components/ # Reusable UI components  
│ ├── pages/ # Main route-based pages  
│ ├── utils/ # Helper functions  
 |  ├── .env # Environment variables  
│ └── App.jsx  
│   
├── server/ # Backend  
│ ├── controllers/ # API logic (PDF gen, evaluation)  
│ ├── routes/ # Express routes  
│ ├── utils/ # Middleware, PDF generator, validators  
| ├── .env # Environment variables  
│ └── index.js  
│  
├── README.md  
├── CODE_OF_CONDUCT.md  
└── LEARN.md  


---

## How to Contribute

1. **Fork the repository**
```bash
git clone `
cd PrepBuddy
```

2. Install dependencies:
```bash
cd client && npm install
cd ../server && npm install
```

3. Create a .env file in /server/ with:
```bash
PORT=
MONGO_URL=
FIREBASE_SERVICE_ACCOUNT=
CLOUDINARY_CLOUD_NAME=
CLOUDINARY_API_KEY=
CLOUDINARY_API_SECRET=
HUGGING_FACE_API_KEY=
EMAIL_USER=
EMAIL_PASS=
EMAIL_RECEIVER=
```

4. Create a .env file in /client/ with:
```bash
VITE_API_URL= <Your Backend Url>
VITE_FIREBASE_API_KEY=
VITE_FIREBASE_AUTH_DOMAIN=
VITE_FIREBASE_PROJECT_ID=
VITE_FIREBASE_STORAGE_BUCKET=
VITE_FIREBASE_MESSAGING_SENDER_ID=
VITE_FIREBASE_API_ID=
VITE_FIREBASE_MEASUREMENT_ID=
```

5. Run the project:
Run frontend
```bash
cd client && npm run dev
```

Run backend
```bash
cd ../server && npm run dev
```

 

## Inspiration

PrepBuddy was born to solve the real struggle of candidates preparing for interviews who need personalized practice, feedback, and confidence – powered by AI.

*Ready to make an impact? Start contributing today*
