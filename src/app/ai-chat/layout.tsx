import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'دستیار هوش مصنوعی - چت آنلاین',
  description: 'چت آنلاین با دستیار هوش مصنوعی فروشگاه',
};

export default function AIChatLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      {children}
    </>
  );
}