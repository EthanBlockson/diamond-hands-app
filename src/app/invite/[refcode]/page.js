'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function Invite({ params }) {
  const router = useRouter();
  const { refcode } = params;

  useEffect(() => {
    localStorage.setItem('refcode', refcode);
    router.push('/');
  }, [refcode, router]);

  return null;
}
