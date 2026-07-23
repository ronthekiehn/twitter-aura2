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
const BATCH_SIZE = 200;
const MAX_BATCHES = 10;

export default async (req, res) => {
  console.log("GET /api/getRecent");
  try {
    await client.connect();
    const database = client.db('twitter');
    const users = database.collection('users');
    console.log("Connected to the database");

    const recentAnalyses = [];
    const seenUsernames = new Set();
    let cursor = null;
    let batches = 0;

    // Page over the existing _id index so duplicate bursts do not crowd unique
    // profiles out of the recent feed. This avoids a large aggregation sort.
    while (recentAnalyses.length < RECENT_LIMIT && batches < MAX_BATCHES) {
      const query = {
        username: { $type: 'string', $ne: '' },
        beautyScore: { $type: 'number', $gte: 0, $lte: 10 },
        profileColor: { $type: 'array' },
        ...(cursor ? { _id: { $lt: cursor } } : {}),
      };

      const batch = await users
        .find(query, {
          projection: {
            username: 1,
            beautyScore: 1,
            profileColor: 1,
            profileImageUrl: 1,
            analyzedAt: 1,
          },
        })
        .sort({ _id: -1 })
        .limit(BATCH_SIZE)
        .toArray();

      if (batch.length === 0) {
        break;
      }

      for (const analysis of batch) {
        const usernameKey = analysis.username.trim().toLowerCase();
        if (seenUsernames.has(usernameKey)) {
          continue;
        }

        seenUsernames.add(usernameKey);
        recentAnalyses.push({
          ...analysis,
          analyzedAt: analysis.analyzedAt ?? analysis._id.getTimestamp(),
        });

        if (recentAnalyses.length === RECENT_LIMIT) {
          break;
        }
      }

      cursor = batch[batch.length - 1]._id;
      batches += 1;
    }

    res.status(200).json(recentAnalyses);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'An error occurred' });
  } finally {
    await client.close();
  }
};
