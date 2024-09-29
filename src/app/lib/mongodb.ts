import mongoose from 'mongoose';


const mongoUri = process.env.MONGODB_URI;

if (!mongoUri) {
  throw new Error('MONGODB_URI is not defined in environment variables');
}
console.log(mongoUri);


const connectMongo = async () => {
  if (mongoose.connection.readyState === 1) {
    return; // already connected
  }

  try {
    await mongoose.connect(mongoUri); // No need for options
    console.log('Connected to MongoDB');
    // const data = CidQueue.find();
    // console.log(data);
  } catch (error) {
    console.error('MongoDB connection error:', error);
    throw new Error('MongoDB connection failed');
  }
};

export default connectMongo;
