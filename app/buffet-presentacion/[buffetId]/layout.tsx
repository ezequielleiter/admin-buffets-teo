import { Metadata } from 'next';

interface Props {
  params: Promise<{ buffetId: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { buffetId } = await params;

  try {
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL}/api/admin-buffets/buffet-menu/${buffetId}`,
      {
        method: 'GET',
        headers: {
          'Accept': 'application/json',
        },
        cache: 'no-store',
      }
    ); 

    if (response.ok) {
      const data = await response.json();
      const buffet = data.buffet;

      return {
        title: `${buffet.nombre} - Presentación`,
        description: `Presentación del menú de ${buffet.nombre}`,
        openGraph: {
          title: `${buffet.nombre} - Presentación`,
          description: `Presentación del menú de ${buffet.nombre}`,
          images: buffet.logo ? [buffet.logo] : [],
        },
      };
    }
  } catch (error) {
    console.error('Error fetching metadata:', error);
  }

  return {
    title: 'Presentación Buffet',
    description: 'Presentación del menú del buffet',
  };
}

export default function BuffetPresentacionLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}