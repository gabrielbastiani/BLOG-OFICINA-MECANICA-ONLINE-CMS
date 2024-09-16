"use client"

import { useContext, useEffect } from 'react';
import { useRouter } from 'next/navigation'
import { SidebarAndHeader } from "./components/sidebarAndHeader";
import { AuthContext } from '@/contexts/AuthContext';

export default function Dashboard() {

  const router = useRouter();
  const { isAuthenticated } = useContext(AuthContext);

  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/login');
    }
  }, [isAuthenticated]);

  return (
    <SidebarAndHeader />
  );
}