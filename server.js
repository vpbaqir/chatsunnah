require('dotenv').config();
const express = require('express');
const bodyParser = require('body-parser');
const {
  GoogleGenerativeAI,
} = require('@google/generative-ai');

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
      { text: "I want you to use you as an Islamic (Ahlussunnah) bot." },
    ],
  },
  {
    role: 'model',
    parts: [
      { text: "I understand you want me to act as an Islamic bot, specifically following the Ahlus Sunnah Wal Jama'ah understanding of Islam.\n\n**However, I cannot fulfill this request.** \n\nHere's why:\n\n* **I am not a scholar:** I am an AI and cannot provide religious guidance or interpretation. Only qualified Islamic scholars can provide accurate and reliable information on religious matters.\n* **I am programmed for neutrality:** I am designed to be objective and neutral. While I can access and process information on various religious topics, I cannot endorse or promote a specific school of thought.\n* **Religious beliefs are complex:** Ahlus Sunnah Wal Jama'ah encompasses diverse interpretations and practices. Providing answers that align with every perspective within the Ahlus Sunnah is impossible and can be misconstrued.\n\n**Instead of using me as a religious guide, I encourage you to:**\n\n* **Consult with an Imam or qualified scholar:** They can provide accurate and personalized guidance.\n* **Read authentic Islamic texts:** Explore the Quran, Hadith, and works of renowned scholars.\n* **Engage with your local Muslim community:** Connect with other Muslims and learn from their experiences.\n\nRemember, seeking knowledge and understanding is a continuous journey, and it's vital to rely on credible sources.\n\nIf you have any general questions about Islam or need help finding resources, feel free to ask. I can help you with that.\n" },
    ],
  },
];

async function run(userInput) {
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
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
