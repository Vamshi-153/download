// src/components/layout/footer.tsx
import Link from 'next/link';
import { Instagram, Facebook } from 'lucide-react';

export function Footer() {
  return (
    <footer className="bg-secondary py-6 mt-12 border-t">
      <div className="container mx-auto px-4 text-center text-muted-foreground text-sm">
        {/* <p className="mb-2">{new Date().getFullYear()} NxtBazaar. All rights reserved.</p> */}
        <div className="flex justify-center space-x-4">
          <Link href="https://www.instagram.com/nxt.bazaar/" target="_blank" rel="noopener noreferrer" aria-label="NxtBazaar on Instagram">
            <Instagram className="h-6 w-6 text-muted-foreground hover:text-primary transition-colors" />
          </Link>
          <Link href="https://www.facebook.com/people/Nxt-Bazaar/61575810248070/" target="_blank" rel="noopener noreferrer" aria-label="NxtBazaar on Facebook">
            <Facebook className="h-6 w-6 text-muted-foreground hover:text-primary transition-colors" />
          </Link>
        </div>
      </div>
    </footer>
  );
}
