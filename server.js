const express = require('express');
const path = require('path');
const OpenAI = require('openai');

const app = express();

// Middleware
app.use(express.json());
app.use(express.static(path.join(__dirname)));

const openai = new OpenAI({
  apiKey: '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',
});

// Serve main pages
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});

app.get('/fish.html', (req, res) => {
  res.sendFile(path.join(__dirname, 'fish.html'));
});

// API route to get AI suggestions
app.post('/api/suggestions', async (req, res) => {
  try {
    console.log('Received body:', req.body);

    const { waterType, rodType, lineStrength, state, targetFish } = req.body;

    if (!waterType || !rodType || !lineStrength || !state || !targetFish) {
      return res.status(400).json({ error: 'Missing parameters' });
    }

    const messages = [
  {
    role: "system",
    content: `
You are a fishing gear expert helping someone catch a specific fish based on their equipment and location.

Only recommend gear if it's actually useful for the target fish. If a category is not important for this catch (e.g., rod holder for flounder), return null for that category.

Avoid generic suggestions like “high quality spinning reel.” Be specific and realistic. Use the user's provided equipment to skip anything redundant.

Only include gear that adds real value based on the fish species, water type, and location.

Provide short, concise descriptions for each category, ideally under 10 words, avoiding full sentences. For example, use "Pyramid sinkers 3 to 4 oz" instead of long explanations.

Return your result in clean JSON with keys exactly: "Reel", "Hooks", "Accessories", "Rod", "Weights", "Lure". Each key should have an array of short strings or null.

Example:

{
  "Reel": ["Size 3000 spinning reel with smooth drag"],
  "Hooks": ["Circle hooks size 1/0 or 2/0"],
  "Accessories": null,
  "Rod": ["Medium action rod"],
  "Weights": ["Pyramid sinkers 3 to 4 oz"],
  "Lure": ["Soft plastic jerkbait, 3 inch"]
}
`


  },
  {
    role: "user",
    content: `Fish: ${targetFish}\nWater type: ${waterType}\nRod: ${rodType}\nLine strength: ${lineStrength}\nLocation: ${state}`
  }
];


    const completion = await openai.chat.completions.create({
      model: "gpt-4o",
      messages,
      max_tokens: 300,
      temperature: 0.7,
    });

    let responseText = completion.choices[0]?.message?.content || '';
    console.log('Raw AI response:', responseText);

    // Clean response: remove triple backticks and quotes
    responseText = responseText.replace(/```json|```|'''/g, '').trim();

    // Fix keys missing closing quotes (common AI formatting bug)
    responseText = responseText.replace(/"(\w+):/g, '"$1":');

    // Extract JSON substring from first to last brace
    const firstBrace = responseText.indexOf('{');
    const lastBrace = responseText.lastIndexOf('}');
    if (firstBrace === -1 || lastBrace === -1 || lastBrace <= firstBrace) {
      return res.status(500).json({ error: 'AI response did not contain valid JSON.' });
    }
    const jsonSubstring = responseText.substring(firstBrace, lastBrace + 1);

    let aiResponse;
    try {
      aiResponse = JSON.parse(jsonSubstring);
    } catch (parseError) {
      console.error('JSON parse error:', parseError);
      console.error('Problematic JSON:', jsonSubstring);
      return res.status(500).json({ error: 'AI response was not valid JSON.' });
    }

    res.json({ suggestions: aiResponse });
	
	// Normalize all fields to arrays or null:
for (const key in aiResponse) {
  if (aiResponse[key] && !Array.isArray(aiResponse[key])) {
    aiResponse[key] = [aiResponse[key]];
  }
}

  } catch (error) {
    console.error('OpenAI error:', error);
    res.status(500).json({ error: 'Failed to get suggestions from AI' });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
