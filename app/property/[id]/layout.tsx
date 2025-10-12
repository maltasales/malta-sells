import { propertyData } from '@/lib/propertyData';

export async function generateStaticParams() {
  return Object.keys(propertyData).map((id) => ({
    id: id,
  }));
}

export default function PropertyLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}