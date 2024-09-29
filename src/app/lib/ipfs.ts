import { NextResponse } from 'next/server';
import { create } from 'ipfs-http-client';

// Ensure environment variables are defined
const pinataApiKey = process.env.PINATA_API_KEY ?? '';
const pinataSecretApiKey = process.env.PINATA_SECRET_API_KEY ?? '';

// Throw an error if the keys are not set
if (!pinataApiKey || !pinataSecretApiKey) {
  throw new Error('Pinata API keys are missing');
}

const client = create({
  host: 'api.pinata.cloud',
  port: 5001,
  protocol: 'https',
  headers: {
    pinata_api_key: pinataApiKey,
    pinata_secret_api_key: pinataSecretApiKey,
  },
});

export async function POST(req: Request) {
  const formData = await req.formData();
  const file = formData.get('file') as Blob; // Explicitly type as Blob or File

  if (!file) {
    return NextResponse.json({ error: 'No file uploaded' }, { status: 400 });
  }

  const added = await client.add(file);
  return NextResponse.json({ url: `https://gateway.pinata.cloud/ipfs/${added.path}` });
}
