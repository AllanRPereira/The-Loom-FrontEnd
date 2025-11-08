// app/layout.tsx

import './globals.css';
import '@rainbow-me/rainbowkit/styles.css'; // Importe os estilos do RainbowKit
import { Providers } from './providers';

export const metadata = {
  title: 'The Loom',
  description: 'Uma plataforma descentralizada de trabalho.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        <Providers>
          <main> {children} </main>
        </Providers>
      </body>
    </html>
  );
}