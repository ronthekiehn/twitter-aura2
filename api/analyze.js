import { MongoClient, ServerApiVersion } from 'mongodb';
import axios from 'axios';
import { GoogleGenerativeAI, HarmBlockThreshold, HarmCategory } from '@google/generative-ai';
import sharp from 'sharp';
import { getPalette } from 'colorthief';

const prompt = `You are an expert in color theory. Who understands hex codes like the back of their hand. Look at the following color palette and write one or two words to describe the feeling/aura of the color palette. 
Be funny and creative, maybe even a little mean. Don't say dusty.
Please only write one or two words, no lead up or explanation.
`;

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
  const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash-lite', safetySettings });


  function colorDistance(color1, color2) {
    const [r1, g1, b1] = color1;
    const [r2, g2, b2] = color2;
    return Math.sqrt(Math.pow(r1 - r2, 2) + Math.pow(g1 - g2, 2) + Math.pow(b1 - b2, 2));
}

// Function to filter out similar colors from the palette
function filterSimilarColors(colors, threshold = 30) {
    const filteredColors = [];
    
    colors.forEach(color => {
        let isSimilar = false;
        
        for (const filteredColor of filteredColors) {
            if (colorDistance(color, filteredColor) < threshold) {
                isSimilar = true;
                break;
            }
        }

        if (!isSimilar) {
            filteredColors.push(color);
        }
    });

    return filteredColors;
}

async function extractColors(imageUrl) {
    try {
        const response = await axios.get(imageUrl, { responseType: 'arraybuffer' });
        const buffer = await sharp(Buffer.from(response.data))
            .resize(100)
            .toBuffer();
        const colorPalette = await getPalette(buffer, 10);
        
        // Filter out similar colors
        const filteredPalette = filterSimilarColors(colorPalette);
        return filteredPalette;
    } catch (error) {
        console.error('Error extracting colors:', error);
        return [];
    }
}

function calculateScore(value, min, max) {
    if (value < min) {
      return 5 * (value / min);
    } else if (value > max) {
      return 10 - 5 * ((value - max) / max);
    } else {
      return 5 + 5 * ((value - min) / (max - min));
    }
  }

function getHarmonyScore(colors) {
    let totalDistance = 0;
    let comparisons = 0;

    // Compare each color with every other color
    for (let i = 0; i < colors.length; i++) {
        for (let j = i + 1; j < colors.length; j++) {
            totalDistance += colorDistance(colors[i], colors[j]);
            comparisons++;
        }
    }

    const avgDistance = totalDistance / comparisons;
    // Calculate the average distance
    const idealNumColors = { min: 12, max: 16 };
    const idealAvgDistance = { min: 70, max: 180 };

    // Calculate scores for number of colors and average distance
    let numColorsScore = calculateScore(colors.length, idealNumColors.min, idealNumColors.max);
    let avgDistanceScore = calculateScore(avgDistance, idealAvgDistance.min, idealAvgDistance.max);

    // Calculate final score (average of the two scores)
    let finalScore = (numColorsScore + avgDistanceScore) / 2;

    // Round the final score to one decimal place
    return finalScore;

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

    const socialDataResponse = await axios.get(`https://api.socialdata.tools/twitter/user/${username}`, {
      headers: { 
        'Authorization': `Bearer ${socialDataApiKey}`,
        'Accept': 'application/json'
      }
    });
    
    const userData = socialDataResponse.data;

    let profileColor = await extractColors(userData.profile_image_url_https);
    let bannerColor = userData.profile_banner_url ? await extractColors(userData.profile_banner_url) : null;

    //if the user hasn't change their profile, keep everything the same

    if (user){
      if (
      userData.profile_image_url_https === user.profileImageUrl &&
      (!userData.profile_banner_url || !user.bannerImageUrl || userData.profile_banner_url === user.bannerImageUrl)
      ) {
        console.log(`${user.username} has not changed their profile`);
        res.status(200).json(user);
        return
      }
    }

    let rgbcolors;
    if (bannerColor){
      rgbcolors = [...new Set([...profileColor, ...bannerColor])];
      bannerColor = bannerColor.map(rgb => `#${rgb.map(x => x.toString(16).padStart(2, '0')).join('')}`);
    } else {
      rgbcolors = profileColor;
    }

    profileColor = profileColor.map(rgb => `#${rgb.map(x => x.toString(16).padStart(2, '0')).join('')}`);
    //map to hex
    const palette = rgbcolors.map(rgb => `#${rgb.map(x => x.toString(16).padStart(2, '0')).join('')}`);

    const beautyScore = getHarmonyScore(rgbcolors);


    const finalprompt = prompt + palette.join(",")
    const result = await model.generateContent(finalprompt,);
    const response = await result.response;
    const analysis = await response.text();

    // Store in MongoDB
    user = {
      username: userData.screen_name,
      profileColor,
      bannerColor,
      beautyScore,
      analysis,
      profileImageUrl: userData.profile_image_url_https,
      bannerImageUrl: userData.profile_banner_url,
    };
    await users.insertOne(user);

    console.log(user.username, "successfully analyzed");
    res.status(200).json(user);
  } catch (error) {
    console.error(error);
    if (error.response && error.response.status === 429) {
      res.status(429).json({ error: 'Hitting the rate limit, please wait a minute or so' });
    } else {
      res.status(500).json({ error: 'An error occurred' });
    }
  } finally {
    await client.close();
  }
};
