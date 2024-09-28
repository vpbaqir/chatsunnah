require('dotenv').config();
const express = require('express');
const bodyParser = require('body-parser');
const { GoogleGenerativeAI } = require('@google/generative-ai');

const app = express();
app.use(bodyParser.json());
app.use(express.static('public')); // Serve static files from the 'public' directory

// Set up the API key
const apiKey = process.env.GEMINI_API_KEY;

if (!apiKey) {
  console.error("API key is not set. Please set the GEMINI_API_KEY environment variable.");
  process.exit(1);
}

const genAI = new GoogleGenerativeAI(apiKey);
const model = genAI.getGenerativeModel({
  model: 'gemini-1.5-flash',
});

// Configuration for generation
const generationConfig = {
  temperature: 0,
  topP: 0.95,
  topK: 64,
  maxOutputTokens: 8192,
  responseMimeType: 'text/plain',
};

// History context for Ahlussunnah
const ahlussunnahContext = [
  {
    role: 'user',
    parts: [
      { text: "I want you to act as an Islamic (Ahlussunnah) bot." },
    ],
  },
  {
    role: 'model',
    parts: [
      { text: "I understand you want me to act as an Islamic bot, specifically following the Ahlus Sunnah Wal Jama'ah understanding of Islam. While I can share information based on Islamic teachings, I am not a scholar. Please always consult with qualified scholars for religious rulings." },
    ],
  },
];

// Helper function to check if the question is about Islam
function isIslamicQuestion(userInput) {
  const islamicKeywords = ['islam', 'ahlus sunnah', 'quran', 'hadith', 'prophet', 'salah', 'dua', 'hajj', 'zakat', 'ramadan', 'fasting', 'fiqh', 'shariah', 'umrah', 'sunnah', 'ibadah'];
  return islamicKeywords.some(keyword => userInput.toLowerCase().includes(keyword));
}

async function run(userInput) {
  // Check if the question is Islamic
  if (!isIslamicQuestion(userInput)) {
    return "This bot is designed to answer questions related to Islam, specifically the Ahlus Sunnah. Please consult other sources for non-Islamic topics.";
  }

  const chatSession = model.startChat({
    generationConfig,
    history: [...ahlussunnahContext, { role: 'user', parts: [{ text: userInput }] }], // Include the user input in the history
  });

  try {
    const result = await chatSession.sendMessage(userInput);
    return result.response.text(); // Return the response text
  } catch (error) {
    console.error("Error during API call:", error);
    throw new Error("API call failed");
  }
}

// Handle POST requests to /chat
app.post('/chat', async (req, res) => {
  const userInput = req.body.userInput;
  try {
    const botResponse = await run(userInput);
    res.json({ response: botResponse });
  } catch (error) {
    console.error("Error during processing:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

// Start the server
const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
