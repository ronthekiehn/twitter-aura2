import { MongoClient, ServerApiVersion } from 'mongodb';
import axios from 'axios';
import { Client } from "twitter-api-sdk";
import { GoogleGenerativeAI, HarmBlockThreshold, HarmCategory } from '@google/generative-ai';
import sharp from 'sharp';
//import analyze from './analyze.js';

const uri = process.env.MONGODB_URI;
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  }
});

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
  console.log("GET /api/analyze");
  const { username } = req.query;
  console.log(username);
  try {
    console.log("Connecting to the database");
    await client.connect();
    const database = client.db('twitter');
    const users = database.collection('users');
    console.log("Connected to the database");
    let user = await users.findOne({ username });

    if (!user) {
      console.log("User not found in database");

      const client = new Client(twitterToken);

      const twitterResponse = await client.users.findUserByUsername(username, {
        "user.fields": [
            "profile_banner_url",
            "profile_image_url"
        ]
      });
      const userData = twitterResponse.data;

      const profileColor = await extractColors(userData.profile_image_url);
      const bannerColor = userData.profile_banner_url ? await extractColors(userData.profile_banner_url) : null;

      const palette = [profileColor, bannerColor].filter(Boolean);

      const beautyScore = Math.random() * 10;

      const prompt = `analyze these ${palette}`
      const result = await model.generateContent(prompt,
            
      );
      const response = await result.response;
      const text = await response.text();

      // Store in MongoDB
      user = { username, pfp: userData.profile_image_url, palette, score: beautyScore, analysis: text };
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
