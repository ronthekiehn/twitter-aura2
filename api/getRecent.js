import { getUsersCollection } from '../server/mongodb.js';

const RECENT_LIMIT = 25;

export default async (req, res) => {
  console.log("GET /api/getRecent");
  try {
    const users = await getUsersCollection();
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

    res.setHeader(
      'Cache-Control',
      'public, max-age=0, s-maxage=10, stale-while-revalidate=20'
    );
    res.status(200).json(
      recentAnalyses.map((analysis) => ({
        ...analysis,
        analyzedAt: analysis.analyzedAt ?? analysis._id.getTimestamp(),
      }))
    );
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'An error occurred' });
  }
};
