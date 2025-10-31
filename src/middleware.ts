/* eslint-disable @typescript-eslint/no-unused-vars */
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

import dbSetup from './models/server/dbSetup'
import getOrCreateQuestionAttachmentBucket from './models/server/storage.collection';

 
// This function can be marked `async` if using `await` inside
export async function middleware(request: NextRequest) {
  try {
    await Promise.all([
      dbSetup(),
      getOrCreateQuestionAttachmentBucket(),
    ]);
  } catch (error) {
    console.error('Middleware setup failed:', error);
    // Continue processing the request even if setup fails
  }

  return NextResponse.next();
}
 
// See "Matching Paths" below to learn more
export const config = {
  matcher: [
    "/((?!api|_next/static|_next/image|favicon.ico).*)"
  ],
}