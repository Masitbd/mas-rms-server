import mongoose from "mongoose";
import { MongoMemoryReplSet, MongoMemoryServer } from "mongodb-memory-server";

// this no longer works
let mongoServer: MongoMemoryReplSet;

export const dbConnect = async () => {
  mongoServer = await MongoMemoryReplSet.create({
    replSet: { count: 1 },
    instanceOpts: [{ storageEngine: "wiredTiger" }], // Ensure 'wiredTiger' storage engine
  });
  const uri = await mongoServer.getUri();

  // const mongooseOpts = {
  //   useNewUrlParser: true,
  //   useCreateIndex: true,
  //   useUnifiedTopology: true,
  //   useFindAndModify: false,
  // };

  await mongoose.connect(uri);
};

export const dbDisconnect = async () => {
  await mongoose.connection.dropDatabase();
  await mongoose.connection.close();
  await mongoServer.stop();
};
