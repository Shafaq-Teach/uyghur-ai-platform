// __tests__/security.test.ts
import { describe, it, expect } from 'vitest';
import { NextRequest } from 'next/server';
import { GET as downloadGET } from '@/app/api/download/route';

describe('Security Checks', () => {
  it('should block non-HTTPS URLs', async () => {
    const req = new NextRequest('https://uyghur-ai.local/api/download?url=http://internal-server');
    const res = await downloadGET(req);
    expect(res.status).toBe(403);
  });
});
