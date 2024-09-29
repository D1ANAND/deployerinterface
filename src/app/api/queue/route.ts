import { NextResponse } from 'next/server';
import connectMongo from '../../lib/mongodb';
import CidQueue from '../../models/CidQueue';  // Ensure the correct import path for your model

export async function GET(req: Request) {
  try {
    // Connect to MongoDB
    await connectMongo();

    // Get the first CID in the queue, sorted by creation date (oldest first)
    const firstInQueue = await CidQueue.findOne().sort({ createdAt: 1 });

    if (!firstInQueue) {
      return NextResponse.json({ error: 'Queue is empty' }, { status: 404 });
    }

    return NextResponse.json(firstInQueue, { status: 200 });
  } catch (error) {
    console.error('Queue retrieval error:', error);
    return NextResponse.json({ error: 'Error retrieving queue' }, { status: 500 });
  }
}

export async function DELETE(req: Request) {
  try {
    // Connect to MongoDB
    await connectMongo();

    // Remove the first CID in the queue, sorted by creation date (oldest first)
    const deletedItem = await CidQueue.findOneAndDelete().sort({ createdAt: 1 });

    if (!deletedItem) {
      return NextResponse.json({ error: 'Queue is empty' }, { status: 404 });
    }

    return NextResponse.json(deletedItem, { status: 200 });
  } catch (error) {
    console.error('Queue deletion error:', error);
    return NextResponse.json({ error: 'Error deleting from queue' }, { status: 500 });
  }
}
