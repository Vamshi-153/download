// src/components/layout/header.tsx
'use client';

import Link from 'next/link';
import { useRouter, usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';
import { Button, buttonVariants } from '@/components/ui/button'; 
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { User, LogOut, ShoppingBag, CreditCard, LayoutDashboard, Home as HomeIcon, ShoppingCart, MapPin, Heart, Mail } from 'lucide-react';
import { cn } from '@/lib/utils'; 
import { useCart } from '@/hooks/use-cart'; 
import { ContactUsDialog } from '@/components/layout/contact-us-dialog'; // Import ContactUsDialog

const SELLER_EMAIL = 'seller@example.com';
const PROFILE_PIC_STORAGE_KEY_PREFIX = 'nxtbazaar-profile-pic-';
const PHONE_NUMBER_STORAGE_KEY_PREFIX = 'nxtbazaar-phonenumber-';


export function Header() {
  const [isClient, setIsClient] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isSeller, setIsSeller] = useState(false);
  const [userEmail, setUserEmail] = useState<string | null>(null);
  const [profilePicUrl, setProfilePicUrl] = useState<string | null>(null);
  const [isContactDialogOpen, setIsContactDialogOpen] = useState(false); // State for Contact Us dialog

  const router = useRouter();
  const pathname = usePathname();
  const { getCartItemCount, isCartInitialized } = useCart();
  const [cartItemCount, setCartItemCount] = useState(0);

  useEffect(() => {
    setIsClient(true); 
  }, []);

  // Effect for cart item count
  useEffect(() => {
    if (isClient && isCartInitialized) {
      setCartItemCount(getCartItemCount());
    }
  }, [isClient, isCartInitialized, getCartItemCount, pathname]); // pathname to re-check if cart updates on nav

  // Effect for login status, user email, and profile picture
  useEffect(() => {
    if (!isClient) return; 

    const checkUserData = () => {
      const loggedInStatus = localStorage.getItem('isLoggedIn') === 'true';
      const storedUserEmail = localStorage.getItem('userEmail');
      const sellerStatus = localStorage.getItem('isSeller') === 'true';

      setIsLoggedIn(loggedInStatus);
      setUserEmail(storedUserEmail);
      setIsSeller(sellerStatus);

      if (loggedInStatus && storedUserEmail) {
        const picKey = `${PROFILE_PIC_STORAGE_KEY_PREFIX}${storedUserEmail}`;
        const storedPic = localStorage.getItem(picKey);
        setProfilePicUrl(storedPic);
      } else {
        setProfilePicUrl(null); // Clear pic if not logged in or no email
      }
    };

    checkUserData(); // Initial check
    
    const handleStorageChange = (event: StorageEvent) => {
      if (event.key === 'isLoggedIn' || event.key === 'userEmail' || event.key === 'isSeller' || (event.key && event.key.startsWith(PROFILE_PIC_STORAGE_KEY_PREFIX))) {
        checkUserData(); // Re-check all user data if any relevant key changes
      }
      if (event.key === 'nxtbazaar-cart') { 
        setCartItemCount(getCartItemCount());
      }
    };
    
    window.addEventListener('storage', handleStorageChange);
    
    return () => {
      window.removeEventListener('storage', handleStorageChange);
    };
  }, [isClient, pathname, getCartItemCount]); // Re-run if client status changes or on navigation

  const handleLogout = () => {
    const currentEmail = localStorage.getItem('userEmail'); 
    localStorage.removeItem('isLoggedIn');
    localStorage.removeItem('userEmail');
    localStorage.removeItem('isSeller');
    
    if (currentEmail) {
        const picKey = `${PROFILE_PIC_STORAGE_KEY_PREFIX}${currentEmail}`;
        localStorage.removeItem(picKey);
        const wishlistKey = `nxtbazaar-wishlist-${currentEmail}`;
        localStorage.removeItem(wishlistKey);
        const phoneKey = `${PHONE_NUMBER_STORAGE_KEY_PREFIX}${currentEmail}`; // Added line
        localStorage.removeItem(phoneKey); // Added line
    }

    // Update state immediately
    setIsLoggedIn(false);
    setUserEmail(null);
    setIsSeller(false);
    setProfilePicUrl(null);
    setCartItemCount(0); // Reset cart count display, actual cart items persist
    
    router.push('/login'); 
  };

  const userInitial = userEmail ? userEmail.charAt(0).toUpperCase() : (isSeller ? 'S' : 'U');
  const avatarSrc = profilePicUrl || (userEmail ? `https://static.vecteezy.com/system/resources/thumbnails/020/765/399/small_2x/default-profile-account-unknown-icon-black-silhouette-free-vector.jpg` : undefined);


  const renderNavLinks = () => (
    <Link href="/" passHref>
      <Button 
        variant="ghost" 
        size="sm"
        className={cn(
          "hover:bg-primary/10",
          pathname === "/" ? "text-primary bg-primary/5 hover:text-primary hover:bg-primary/10" : "text-foreground hover:text-primary" 
        )}
      > 
        <HomeIcon className="mr-2 h-4 w-4" /> Home
      </Button>
    </Link>
  );

  const renderCartIcon = () => (
    <Button variant="ghost" size="icon" className="relative" asChild>
      <Link href="/cart">
        <ShoppingCart className="h-5 w-5" />
        <span className="sr-only">View Cart</span>
        {isClient && isCartInitialized && cartItemCount > 0 && (
          <span className="absolute -top-2 -right-2 bg-primary text-primary-foreground text-xs w-5 h-5 rounded-full flex items-center justify-center">
            {"!"}
          </span>
        )}
      </Link>
    </Button>
  );

  return (
    <>
    <header className="bg-secondary py-4 border-b sticky top-0 z-50">
      <div className="container mx-auto px-4 flex justify-between items-center">
        <Link href="/" className="text-2xl font-bold text-primary">
          NxtBazaar
        </Link>
        
        <nav className="flex items-center space-x-2">
          {isClient && renderNavLinks()}
          {isClient && !isSeller && renderCartIcon()}
          
          {isClient && isLoggedIn ? ( 
            isSeller ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="relative h-10 w-10 rounded-full">
                    <Avatar className="h-10 w-10" key={userEmail}> {/* Key to force re-render on email change */}
                      <AvatarImage src={avatarSrc} alt={userEmail || 'Seller'} data-ai-hint="profile seller" />
                      <AvatarFallback>{userInitial}</AvatarFallback>
                    </Avatar>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-56" align="end" forceMount>
                  <DropdownMenuLabel className="font-normal">
                    <div className="flex flex-col space-y-1">
                      <p className="text-sm font-medium leading-none">Seller Account</p>
                      <p className="text-xs leading-none text-muted-foreground">
                        {userEmail}
                      </p>
                    </div>
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem asChild>
                    <Link href="/seller/dashboard">
                      <LayoutDashboard className="mr-2 h-4 w-4" />
                      Dashboard
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={handleLogout}>
                    <LogOut className="mr-2 h-4 w-4" />
                    Logout
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="relative h-10 w-10 rounded-full">
                    <Avatar className="h-10 w-10" key={userEmail}> {/* Key to force re-render on email change */}
                       <AvatarImage src={avatarSrc} alt={userEmail || 'User'} data-ai-hint="profile user" />
                      <AvatarFallback>{userInitial}</AvatarFallback>
                    </Avatar>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-56" align="end" forceMount>
                  <DropdownMenuLabel className="font-normal">
                    <div className="flex flex-col space-y-1">
                      <p className="text-sm font-medium leading-none">My Account</p>
                      <p className="text-xs leading-none text-muted-foreground">
                        {userEmail}
                      </p>
                    </div>
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem asChild>
                    <Link href="/profile">
                      <User className="mr-2 h-4 w-4" />
                      Profile
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link href="/orders">
                      <ShoppingBag className="mr-2 h-4 w-4" />
                      Orders
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link href="/profile/addresses">
                      <MapPin className="mr-2 h-4 w-4" />
                      Addresses
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link href="/payments">
                      <CreditCard className="mr-2 h-4 w-4" />
                      Payments
                    </Link>
                  </DropdownMenuItem>
                   <DropdownMenuItem asChild>
                    <Link href="/wishlist">
                      <Heart className="mr-2 h-4 w-4" />
                      Wishlist
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setIsContactDialogOpen(true)}>
                      <Mail className="mr-2 h-4 w-4" />
                      Contact Us
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={handleLogout}>
                    <LogOut className="mr-2 h-4 w-4" />
                    Logout
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            )
          ) : isClient ? (
            <Button asChild>
              <Link href="/login">
                <User className="mr-2 h-4 w-4" /> Login
              </Link>
            </Button>
          ) : (
             <div className="h-10 w-20 bg-muted rounded animate-pulse"></div> // Skeleton loader
          )}
        </nav>
      </div>
    </header>
    <ContactUsDialog isOpen={isContactDialogOpen} onOpenChange={setIsContactDialogOpen} />
    </>
  );
}

