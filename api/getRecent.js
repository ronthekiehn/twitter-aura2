const { MongoClient } = require('mongodb');

const uri = process.env.MONGODB_URI;
const client = new MongoClient(uri);

module.exports = async (req, res) => {
  try {
    await client.connect();
    const database = client.db('twitter_analyzer');
    const users = database.collection('users');

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