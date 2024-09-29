// src/app/api/upload/route.ts
import { NextResponse } from 'next/server';
import { create } from 'ipfs-http-client';

const client = create({
  host: 'api.pinata.cloud',
  port: 5001,
  protocol: 'https',
  headers: {
    pinata_api_key: process.env.PINATA_API_KEY,
    pinata_secret_api_key: process.env.PINATA_SECRET_API_KEY,
  },
});

export async function POST(req: { formData: () => any; }) {
  const file = await req.formData();
  const added = await client.add(file);
  return NextResponse.json({ url: `https://gateway.pinata.cloud/ipfs/${added.path}` });
}
