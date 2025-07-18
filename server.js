const express = require('express');
const cors = require('cors');
const { OpenAI } = require('openai');
require('dotenv').config();

const app = express();
const port = 3000;

app.use(cors());
app.use(express.json());
app.use(express.static('.'));

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

app.post('/api/recommendations', async (req, res) => {
  const { waterType, poleType, fishType } = req.body;

  if (!waterType || !poleType || !fishType) {
    return res.status(400).json({ message: 'Missing required fields.' });
  }

  const prompt = `
You are an expert fishing guide.
Given the following information:
- Water type: ${waterType}
- Fishing pole: ${poleType}
- Target fish: ${fishType}

1) Suggest the best lures, rigs, bait, weight, and pound line for successful fishing.
2) Provide a concise fishing tip or fact about catching the fish, including how to use the lure, best conditions, or times.

Format your response as:
Recommendations:
- item 1
- item 2
...

Tip:
Your tip here
`;


  try {
    const chat = await openai.chat.completions.create({
      model: 'gpt-3.5-turbo',
      messages: [{ role: 'user', content: prompt }],
      temperature: 0.7,
      max_tokens: 200,
    });

    const recommendationText = chat.choices[0].message.content.trim();
    const items = recommendationText.split('\n').filter(line => line.trim() !== '');

    res.json({ recommendations: items });
  } catch (error) {
    console.error('API error:', error);
    res.status(500).json({ message: 'Failed to get recommendations.' });
  }
});


app.listen(port, () => {
  console.log(`Server listening at http://localhost:${port}`);
});
