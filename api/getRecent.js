import { MongoClient, ServerApiVersion } from 'mongodb';

export default async (req, res) => {
  const uri = process.env.MONGODB_URI;
  const client = new MongoClient(uri, {
    serverApi: {
      version: ServerApiVersion.v1,
      strict: true,
      deprecationErrors: true,
    }
  });
  console.log("GET /api/getRecent");
  try {
    await client.connect();
    const database = client.db('twitter');
    const users = database.collection('users');
    console.log("Connected to the database");
    const recentAnalyses = await users
      .find({})
      .sort({ _id: -1 })
      .limit(10)
      .toArray();

    res.status(200).json(recentAnalyses);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'An error occurred' });
  } finally {
    await client.close();
  }
};