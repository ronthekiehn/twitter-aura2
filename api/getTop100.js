import { MongoClient, ServerApiVersion } from 'mongodb';

const uri = process.env.MONGODB_URI;
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  }
});

export default async (req, res) => {
  console.log("GET /api/getTop100");
  try {
    await client.connect();
    const database = client.db('twitter');
    const users = database.collection('users');
    console.log("Connected to the database");
    
    const top100 = await users
      .find({}, { projection: { username: 1, beautyScore: 1, profileColor: 1, profileImageUrl: 1 } })
      .sort({ beautyScore: -1 })
      .limit(100)
      .toArray();

    const totalUsers = await users.countDocuments();

    res.status(200).json({ top100, totalUsers });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'An error occurred' });
  } finally {
    await client.close();
  }
};