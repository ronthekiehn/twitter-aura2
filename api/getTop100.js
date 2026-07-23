import { getUsersCollection } from '../server/mongodb.js';

export default async (req, res) => {
  console.log("GET /api/getTop100");
  try {
    const users = await getUsersCollection();
    console.log("Connected to the database");
    
    const top100 = await users
      .find({}, { projection: { username: 1, beautyScore: 1, profileColor: 1, profileImageUrl: 1 } })
      .sort({ beautyScore: -1 })
      .limit(100)
      .toArray();

    const totalUsers = await users.estimatedDocumentCount();

    res.setHeader(
      'Cache-Control',
      'public, max-age=0, s-maxage=300, stale-while-revalidate=600'
    );
    res.status(200).json({ top100, totalUsers });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'An error occurred' });
  }
};
