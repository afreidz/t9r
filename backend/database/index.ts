import { Db, MongoClient } from "mongodb";
let cache: Db;

export default async function getDBClient(): Promise<Db> {
  if (cache) return cache;

  const url = process.env.AZURE_COSMOS_CONNECTION_STRING;

  const client = new MongoClient(url);
  await client.connect();
  cache = client.db(process.env.AZURE_COSMOS_DATABASE_NAME);

  return cache;
}
