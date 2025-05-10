// src/app/profile/layout.tsx
import type { PropsWithChildren } from 'react';

export default function ProfileSubLayout({ children }: PropsWithChildren) {
  return (
    <div>
      {/* 
        You could add a sub-navigation here if needed, e.g., a sidebar for profile sections,
        or ensure the header contextually links back to /profile.
        For now, individual pages will handle their "back to profile" links.
      */}
      {children}
    </div>
  );
}
