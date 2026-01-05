"use client";

import { SessionProvider } from "next-auth/react";
import { Toaster } from "react-hot-toast";

interface ProvidersProps {
  children: React.ReactNode;
}

export default function Providers({ children }: ProvidersProps) {
  return (
    <SessionProvider>
      {children}
      <Toaster
        position="top-center"
        reverseOrder={false}
        gutter={8}
        toastOptions={{
          duration: 3000,
          style: {
            // استایل دارک و مدرن (Pill Shape)
            background: '#111111',
            color: '#ffffff',
            padding: '14px 24px',
            borderRadius: '9999px', // کاملا گرد
            fontSize: '14px',
            fontWeight: '400',
            boxShadow: '0 10px 30px -5px rgba(0, 0, 0, 0.2)',
            fontFamily: 'var(--font-vazirmatn)',
          },
          success: {
            iconTheme: {
              primary: '#10B981',
              secondary: '#fff',
            },
          },
          error: {
            iconTheme: {
              primary: '#EF4444',
              secondary: '#fff',
            },
          },
        }}
      />
    </SessionProvider>
  );
}