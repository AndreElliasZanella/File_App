import mongoose from 'mongoose';
import dotenv from 'dotenv';
import {MongoMemoryServer} from "mongodb-memory-server";

dotenv.config();

export const connect = async (): Promise<void> => {
    let dbUri = process.env.MONGO_URI || 'mongodb://shopdb:27017/tidygym_personsdb';

    if (process.env.NODE_ENV === 'test'){
        const server = new MongoMemoryServer();
        await server.start();
        dbUri = server.getUri();
    }

    try {
        console.log(`connecting to ${dbUri}...`);
        await mongoose.connect(dbUri);
        console.log('MongoDB connected!');
    } catch (err) {
        console.log("MongoDB connection failed!")
        console.error(err.message);
        process.exit(1);
    }
};

export const disconnect = async (): Promise<void> => {
    await mongoose.connection.close();
};
