'use client';

import { Suspense } from 'react';
import HomeInner from '@/components/HomeInner';

export default function Home() {
  return (
    <Suspense>
      <HomeInner />
    </Suspense>
  );
}
