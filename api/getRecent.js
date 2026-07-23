import { MongoClient, ServerApiVersion } from 'mongodb';

const uri = process.env.MONGODB_URI;
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  }
});

const RECENT_LIMIT = 25;

export default async (req, res) => {
  console.log("GET /api/getRecent");
  try {
    await client.connect();
    const database = client.db('twitter');
    const users = database.collection('users');
    console.log("Connected to the database");

    const recentAnalyses = await users
      .find(
        {
          username: { $type: 'string', $ne: '' },
          beautyScore: { $type: 'number', $gte: 0, $lte: 10 },
          profileColor: { $type: 'array' },
        },
        {
          projection: {
            username: 1,
            beautyScore: 1,
            profileColor: 1,
            profileImageUrl: 1,
            analyzedAt: 1,
          },
        }
      )
      .sort({ _id: -1 })
      .limit(RECENT_LIMIT)
      .toArray();

    res.status(200).json(
      recentAnalyses.map((analysis) => ({
        ...analysis,
        analyzedAt: analysis.analyzedAt ?? analysis._id.getTimestamp(),
      }))
    );
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'An error occurred' });
  } finally {
    await client.close();
  }
};
