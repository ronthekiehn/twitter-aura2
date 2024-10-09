import { MongoClient, ServerApiVersion } from 'mongodb';
import axios from 'axios';
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

const socialDataApiKey = process.env.SOCIALDATA_API_KEY;
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
    await client.connect();
    const database = client.db('twitter');
    const users = database.collection('users');
    let user = await users.findOne({ username });

    if (!user) {
      console.log("User not found in database");

      const socialDataResponse = await axios.get(`https://api.socialdata.tools/twitter/user/${username}`, {
        headers: { 
          'Authorization': `Bearer ${socialDataApiKey}`,
          'Accept': 'application/json'
        }
      });
      
      const userData = socialDataResponse.data;
      console.log(userData);


      const profileColor = await extractColors(userData.profile_image_url_https);
      const bannerColor = userData.profile_banner_url ? await extractColors(userData.profile_banner_url) : null;

      const palette = [profileColor, bannerColor].filter(Boolean);

      const beautyScore = Math.random() * 10;

      const prompt = `analyze these ${palette}`
      const result = await model.generateContent(prompt,
            
      );
      const response = await result.response;
      const analysis = await response.text();

      // Store in MongoDB
      user = {
        screen_name: userData.screen_name,
        palette,
        beautyScore,
        analysis,
        profileImageUrl: userData.profile_image_url_https,
        bannerImageUrl: userData.profile_banner_url,
      };
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
