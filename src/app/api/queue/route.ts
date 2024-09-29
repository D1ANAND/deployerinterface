import { NextResponse } from 'next/server';
import connectMongo from '../../lib/mongodb';
import CidQueue from '../../models/CidQueue';  // Ensure the correct import path for your model

export async function GET() {  // Removed _req since it's not used
  try {
    await connectMongo();
    const firstInQueue = await CidQueue.findOne({}, { cid: 1, _id: 0 }).sort({ createdAt: 1 });

    if (!firstInQueue) {
      return NextResponse.json({ error: 'Queue is empty' }, { status: 404 });
    }

    return NextResponse.json({ cid: firstInQueue.cid }, { status: 200 });
  } catch (error) {
    console.error('Queue retrieval error:', error);
    return NextResponse.json({ error: 'Error retrieving queue' }, { status: 500 });
  }
}

export async function DELETE() {  // Removed _req since it's not used
  try {
    await connectMongo();
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
