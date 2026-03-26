
import { NextResponse } from 'next/server';
import crypto from 'crypto';

export async function GET() {
    return NextResponse.json({
        node: process.version,
        cryptoAvailable: !!crypto,
        randomUUIDAvailable: !!crypto?.randomUUID,
        generatedUUID: crypto?.randomUUID ? crypto.randomUUID() : 'N/A'
    });
}
