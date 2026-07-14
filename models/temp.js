import { MongoClient } from 'mongodb';
import {
  ObjectId
} from 'mongodb';

/*
 * Requires the MongoDB Node.js Driver
 * https://mongodb.github.io/node-mongodb-native
 */

const agg = [
  {
    '$match': {
      'product': new ObjectId('6a55007751f1e97d19e9e827')
    }
  }, {
    '$group': {
      '_id': null, 
      'averageRating': {
        '$avg': '$rating'
      }, 
      'numberOfReviews': {
        '$sum': 1
      }
    }
  }
];

const client = await MongoClient.connect(
  'mongodb://ac-mn9xbnn-shard-00-02.y76rd8n.mongodb.net,ac-mn9xbnn-shard-00-01.y76rd8n.mongodb.net,ac-mn9xbnn-shard-00-00.y76rd8n.mongodb.net/?tls=true&authMechanism=MONGODB-X509&authSource=%24external&maxIdleTimeMS=45000&minPoolSize=0&replicaSet=atlas-93votm-shard-0&compressors=zlib&appName=Data+Explorer--6a3dc7f8b40e40800f67cfa7'
);
const coll = client.db('E-Commerce-API').collection('reviews');
const cursor = coll.aggregate(agg);
const result = await cursor.toArray();
await client.close();