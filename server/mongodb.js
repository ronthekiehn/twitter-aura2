import { MongoClient, ServerApiVersion } from 'mongodb';

const client = new MongoClient(process.env.MONGODB_URI, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
  minPoolSize: 0,
  maxPoolSize: 5,
});

let connectionPromise;

async function getClient() {
  if (!connectionPromise) {
    connectionPromise = client.connect().catch((error) => {
      connectionPromise = undefined;
      throw error;
    });
  }

  return connectionPromise;
}

export async function getUsersCollection() {
  const connectedClient = await getClient();
  return connectedClient.db('twitter').collection('users');
}
