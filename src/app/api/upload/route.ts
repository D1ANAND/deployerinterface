// src/app/api/upload/route.ts
import { NextResponse } from 'next/server';
import PinataClient from '@pinata/sdk';
import { Readable } from 'stream';
import connectMongo from '@/app/lib/mongodb';
import CidQueue from '@/app/models/CidQueue';

const pinata = new PinataClient(process.env.PINATA_API_KEY, process.env.PINATA_SECRET_API_KEY);

export async function POST(req: Request) {
  try {
    // Retrieve the form data from the request
    await connectMongo();
    const formData = await req.formData();
    const file = formData.get('file') as File;

    if (!file) {
      return NextResponse.json({ error: 'File not provided' }, { status: 400 });
    }

    // Convert file to readable stream for Pinata
    const readableStream = Readable.from(Buffer.from(await file.arrayBuffer()));

    const metadata = {
      pinataMetadata: {
        name: file.name, // Set the name for the uploaded file in Pinata metadata
      },
    };

    // Pin the file to IPFS via Pinata
    const result = await pinata.pinFileToIPFS(readableStream, metadata);
    const ipfsHash = result.IpfsHash;

    // Save the CID to MongoDB as part of the queue
    const newCidEntry = new CidQueue({ cid: ipfsHash });
    await newCidEntry.save();

    // Return the IPFS URL using Pinata's gateway
    return NextResponse.json({ url: `https://gateway.pinata.cloud/ipfs/${result.IpfsHash}` });
  } catch (error) {
    console.error('Upload error:', error);
    return NextResponse.json({ error: 'Upload failed' }, { status: 500 });
  }
}
