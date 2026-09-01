// Vercel Serverless Function to securely serve environment configuration
module.exports = (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  const config = {
    apiKey: process.env.FIREBASE_API_KEY || "AIzaSyCRfSYYs_InfqzNg4xq7-j5fGJz7SS_RhQ",
    authDomain: process.env.FIREBASE_AUTH_DOMAIN || "star-t-9be2a.firebaseapp.com",
    projectId: process.env.FIREBASE_PROJECT_ID || "star-t-9be2a",
    storageBucket: process.env.FIREBASE_STORAGE_BUCKET || "star-t-9be2a.firebasestorage.app",
    messagingSenderId: process.env.FIREBASE_MESSAGING_SENDER_ID || "127026716779",
    appId: process.env.FIREBASE_APP_ID || "1:127026716779:web:4800a34961fd7482cfd12e"
  };

  res.status(200).json(config);
};
