import { NextResponse } from 'next/server';
import { pruneIntermediateCache } from '../../../../lib/services/clipEngineService';

export const dynamic = 'force-dynamic';

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const all = searchParams.get('all') === '1';
  const result = pruneIntermediateCache(all);
  return NextResponse.json({ success: true, ...result });
}

export async function POST(request) {
  const { searchParams } = new URL(request.url);
  const all = searchParams.get('all') === '1';
  const result = pruneIntermediateCache(all);
  return NextResponse.json({ success: true, ...result });
}
