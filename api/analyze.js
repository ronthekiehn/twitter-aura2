import { MongoClient } from 'mongodb';
import axios from 'axios';
import { GoogleGenerativeAI, HarmBlockThreshold, HarmCategory } from '@google/generative-ai';
import sharp from 'sharp';

const uri = process.env.MONGODB_URI;
const client = new MongoClient(uri);

const twitterToken = process.env.TWITTER_API_TOKEN;
const apiKey = process.env.GEMINI_API_KEY;

const genAI = new GoogleGenerativeAI(apiKey);

const safetySettings = [
    {
      category: HarmCategory.HARM_CATEGORY_HARASSMENT,
      threshold: HarmBlockThreshold.BLOCK_NONE,
    },
    {
      category: HarmCategory.HARM_CATEGORY_HATE_SPEECH,
      threshold: HarmBlockThreshold.BLOCK_NONE,
    },
    {
      category: HarmCategory.HARM_CATEGORY_SEXUALLY_EXPLICIT,
      threshold: HarmBlockThreshold.BLOCK_NONE,
    },
    {
      category: HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT,
      threshold: HarmBlockThreshold.BLOCK_NONE,
    },
  ]
  const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash', safetySettings });


async function extractColors(imageUrl) {
  const response = await axios.get(imageUrl, { responseType: 'arraybuffer' });
  const buffer = Buffer.from(response.data, 'binary');

  const image = sharp(buffer);
  const { dominant } = await image.stats();

  return `rgb(${dominant.r}, ${dominant.g}, ${dominant.b})`;
}

export default async (req, res) => {
  const { username } = req.query;

  try {
    await client.connect();
    const database = client.db('twitter_analyzer');
    const users = database.collection('users');

    let user = await users.findOne({ username });

    //change this to be if the colors haven't changed
    if (!user) {
      // Fetch Twitter profile data
      const twitterResponse = await axios.get(`https://api.twitter.com/2/users/by/username/${username}?user.fields=profile_image_url,profile_banner_url`, {
        headers: { 'Authorization': `Bearer ${twitterToken}` }
      });
      const userData = twitterResponse.data.data;

      // Extract colors
      const profileColor = await extractColors(userData.profile_image_url);
      const bannerColor = userData.profile_banner_url ? await extractColors(userData.profile_banner_url) : null;

      const palette = [profileColor, bannerColor].filter(Boolean);

      // Calculate beauty score (simplified)
      const beautyScore = Math.random() * 10;

      // Generate analysis using Gemini API
      const prompt = `analyze these ${palette}`
      const analysis = await model.generateContent(prompt,);

      // Store in MongoDB
      user = { username, palette, beautyScore, analysis };
      await users.insertOne(user);
    }

    res.status(200).json(user);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'An error occurred' });
  } finally {
    await client.close();
  }
};