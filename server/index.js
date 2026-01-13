require('dotenv').config();

const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const OpenAI = require('openai');
const Trip = require('./models/Trip');

const app = express();
app.use(express.json());
app.use(cors());

// --- CONFIG CHECK ---
console.log("--- CONFIGURATION CHECK ---");
console.log("GITHUB_TOKEN:", process.env.GITHUB_TOKEN ? "✅ Loaded" : "❌ MISSING");
console.log("MONGO_URI:", process.env.MONGO_URI ? "✅ Loaded" : "❌ MISSING");
console.log("---------------------------");

if (!process.env.GITHUB_TOKEN) {
    console.error("⛔ CRITICAL ERROR: GITHUB_TOKEN is missing. Check your .env file.");
    process.exit(1);
}

// --- DATABASE CONNECTION ---
if (process.env.MONGO_URI) {
    mongoose.connect(process.env.MONGO_URI)
        .then(() => console.log("✅ MongoDB Connected"))
        .catch(err => console.error("❌ MongoDB Connection Error:", err));
}

// --- AI CONFIGURATION (GITHUB MODELS) ---
const openai = new OpenAI({
    baseURL: "https://models.github.ai/inference",
    apiKey: process.env.GITHUB_TOKEN,
});

// ================= ROUTES ================= //

app.post('/api/generate-trip', async (req, res) => {
    const { destination, days, budget, interests } = req.body;

    if (!destination || !days) {
        return res.status(400).json({ error: "Destination and days are required" });
    }

    console.log(`🚀 Generating accurate trip for: ${destination} (${days} days)`);

    // --- HIGH ACCURACY PROMPT ---
    const prompt = `
    Act as a local expert travel guide. Create a detailed, day-by-day itinerary for a trip to ${destination}.
    
    User Preferences:
    - Duration: ${days} Days
    - Budget: ${budget}
    - Interests: ${interests}

    CRITICAL INSTRUCTIONS:
    1. Be specific. Do not say "Visit a local park". Say "Visit Ueno Park".
    2. Suggest logically grouped activities (places close to each other).
    3. Provide a "map_query" for every activity so I can link it to Google Maps.
    
    RESPONSE FORMAT:
    You must output strictly valid JSON. No markdown.
    
    {
      "trip_details": {
        "destination": "${destination}",
        "duration": "${days} days",
        "budget": "${budget}",
        "summary": "A 1-sentence summary of the vibe of this trip."
      },
      "itinerary": [
        {
          "day": 1,
          "theme": "Theme of the day (e.g., Historic Old Town)",
          "activities": [
            {
              "time": "Morning",
              "place": "Exact Name of Place",
              "description": "Why visit here? (1 sentence)",
              "location_area": "Neighborhood name (e.g., Shinjuku)",
              "map_query": "Exact Name of Place, City Name"
            },
            {
              "time": "Afternoon",
              "place": "Restaurant or Activity Name",
              "description": "Description...",
              "location_area": "Neighborhood name",
              "map_query": "Place Name, City Name"
            }
          ]
        }
      ]
    }
    `;

    try {
        const completion = await openai.chat.completions.create({
            model: "gpt-4o",
            messages: [
                { role: "system", content: "You are a helpful travel assistant. Output only JSON." },
                { role: "user", content: prompt }
            ],
            temperature: 0.7
        });

        // Clean up markdown if the model adds it
        let content = completion.choices[0].message.content;
        content = content.replace(/```json/g, "").replace(/```/g, "");

        const tripData = JSON.parse(content);
        res.json(tripData);

    } catch (error) {
        console.error("❌ AI Error:", error);
        res.status(500).json({ error: "Failed to generate itinerary. Check backend logs." });
    }
});

// Save Trip Route
app.post('/api/save-trip', async (req, res) => {
    try {
        const { destination, days, budget, interests, generatedContent } = req.body;
        const newTrip = new Trip({ destination, days, budget, interests, generatedContent });
        const savedTrip = await newTrip.save();
        res.json({ success: true, id: savedTrip._id });
    } catch (error) {
        console.error("Save Error:", error);
        res.status(500).json({ error: "Failed to save trip" });
    }
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));