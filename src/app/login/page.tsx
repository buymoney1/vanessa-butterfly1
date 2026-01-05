// app/login/page.tsx
import LoginClient from "./LoginClient";

interface LoginPageProps {
  searchParams?: Promise<{
    register?: string;
    callbackUrl?: string;
    error?: string;
  }>;
}

export default async function LoginPage({ searchParams }: LoginPageProps) {
  const resolvedSearchParams = await searchParams;
  const initialMode = resolvedSearchParams?.register === "true" ? false : true;
  
  return <LoginClient initialMode={initialMode} />;
}