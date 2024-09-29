import { NextResponse } from 'next/server';
import PinataClient from '@pinata/sdk';
import { Readable } from 'stream';
import connectMongo from '@/app/lib/mongodb';
import CidQueue from '@/app/models/CidQueue';

const pinata = new PinataClient(process.env.PINATA_API_KEY, process.env.PINATA_SECRET_API_KEY);

export async function POST(req: Request) {
  try {
    // Connect to MongoDB (ensure this uses connection pooling)
    await connectMongo();

    // Retrieve form data from the request
    const formData = await req.formData();
    const file = formData.get('file');

    if (!(file instanceof Blob)) {
      return NextResponse.json({ error: 'File not provided or invalid' }, { status: 400 });
    }

    // Create a readable stream directly from the Blob
    const readableStream = Readable.from(file.stream());

    const metadata = {
      pinataMetadata: {
        name: file.name, // Set the file name in Pinata metadata
      },
    };

    // Set a reasonable timeout for Pinata upload
    const result = await withTimeout(
      pinata.pinFileToIPFS(readableStream, metadata),
      10000 // Timeout in 10 seconds
    );
    const ipfsHash = result.IpfsHash;

    // Save the CID to MongoDB (part of the queue)
    const newCidEntry = new CidQueue({ cid: ipfsHash });
    await newCidEntry.save();

    // Return the IPFS URL using Pinata's gateway
    return NextResponse.json({ url: `https://gateway.pinata.cloud/ipfs/${ipfsHash}` });

  } catch (error) {
    console.error('Upload error:', error);

    // Check for specific errors (like timeout)
    if (error.message === 'Upload to Pinata timed out') {
      return NextResponse.json({ error: 'Upload timed out' }, { status: 504 });
    }

    // General upload failure
    return NextResponse.json({ error: 'Upload failed' }, { status: 500 });
  }
}

// Helper function to add a timeout for async tasks
function withTimeout(promise: Promise<any>, timeoutMs: number) {
  return new Promise((resolve, reject) => {
    const timeoutId = setTimeout(() => reject(new Error('Upload to Pinata timed out')), timeoutMs);
    promise
      .then((res) => {
        clearTimeout(timeoutId);
        resolve(res);
      })
      .catch((err) => {
        clearTimeout(timeoutId);
        reject(err);
      });
  });
}
