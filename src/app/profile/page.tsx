'use client';

import { useEffect, useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { Package, CreditCard, User as UserIconLucide, Edit3, Save, XCircle, UploadCloud, Trash2 } from 'lucide-react';
import Link from 'next/link';
import { useToast } from '@/hooks/use-toast';
import { Skeleton } from '@/components/ui/skeleton';
import { auth, db, storage } from '@/firebase/firebaseConfig'; // Import Firebase modules
import { doc, getDoc, setDoc, updateDoc } from 'firebase/firestore';
import { ref, uploadString, getDownloadURL, deleteObject } from 'firebase/storage';
import { onAuthStateChanged } from 'firebase/auth';

export default function ProfilePage() {
  const [userEmail, setUserEmail] = useState<string | null>(null);
  const [userName, setUserName] = useState<string | null>(null);
  const [editableUserName, setEditableUserName] = useState<string>('');
  const [profilePicUrl, setProfilePicUrl] = useState<string | null>(null);
  const [phoneNumber, setPhoneNumber] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isEditingUsername, setIsEditingUsername] = useState(false);
  const [userId, setUserId] = useState<string | null>(null);
  
  const router = useRouter();
  const { toast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Check authentication status and fetch user data
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        setUserId(user.uid);
        setUserEmail(user.email);
        
        // Fetch user profile data from Firestore
        try {
          const userDocRef = doc(db, 'users', user.uid);
          const userDoc = await getDoc(userDocRef);
          
          if (userDoc.exists()) {
            const userData = userDoc.data();
            
            // Set user data from Firestore
            setUserName(userData.displayName ||(userData.firstName && userData.lastName? `${userData.firstName}${" "}${userData.lastName}`: ''));
            setEditableUserName(userData.displayName || (user.email ? user.email.split('@')[0] : ''));
            setProfilePicUrl(userData.profilePic || null);
            setPhoneNumber(userData.phone || null);
          } else {
            // Create new user document if it doesn't exist
            const defaultName = user.email ? user.email.split('@')[0] : '';
            setUserName(defaultName);
            setEditableUserName(defaultName);
            
            await setDoc(userDocRef, {
              displayName: defaultName,
              email: user.email,
              phoneNumber: '',
              profilePic: null,
              createdAt: new Date()
            });
          }
        } catch (error) {
          console.error("Error fetching user data:", error);
          toast({ 
            title: "Error", 
            description: "Could not load profile information.", 
            variant: "destructive" 
          });
        }
      } else {
        // User is not logged in, redirect to login
        router.push('/login?redirect=/profile');
      }
      setIsLoading(false);
    });

    return () => unsubscribe();
  }, [router, toast]);

  const handleProfilePictureChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    if (!userId) return;
    const file = event.target.files?.[0];
    
    if (file) {
      if (!file.type.startsWith('image/')) {
        toast({ title: "Invalid File", description: "Please select an image file.", variant: "destructive" });
        return;
      }
      
      const maxSize = 5 * 1024 * 1024; // 5MB
      if (file.size > maxSize) {
        toast({ title: "File Too Large", description: "Image size should not exceed 5MB.", variant: "destructive" });
        return;
      }
      
      try {
        setIsLoading(true);
        const reader = new FileReader();
        reader.onloadend = async () => {
          const dataUrl = reader.result as string;
          
          // Upload to Firebase Storage
          const storageRef = ref(storage, `profile-pictures/${userId}`);
          await uploadString(storageRef, dataUrl, 'data_url');
          
          // Get download URL
          const downloadUrl = await getDownloadURL(storageRef);
          
          // Update Firestore with new profile pic URL
          const userDocRef = doc(db, 'users', userId);
          await updateDoc(userDocRef, {
            profilePic: downloadUrl
          });
          
          setProfilePicUrl(downloadUrl);
          setIsLoading(false);
          toast({ title: "Profile Picture Updated", description: "Your new profile picture has been saved." });
        };
        
        reader.onerror = () => {
          setIsLoading(false);
          toast({ title: "Error", description: "Could not read the image file.", variant: "destructive" });
        };
        
        reader.readAsDataURL(file);
      } catch (error) {
        setIsLoading(false);
        console.error("Error uploading profile picture:", error);
        toast({ title: "Error", description: "Failed to upload profile picture.", variant: "destructive" });
      }
    }
  };

  const handleRemoveProfilePicture = async () => {
    if (!userId) return;
    
    try {
      setIsLoading(true);
      
      // Delete from Storage
      const storageRef = ref(storage, `profile-pictures/${userId}`);
      await deleteObject(storageRef);
      
      // Update Firestore
      const userDocRef = doc(db, 'users', userId);
      await updateDoc(userDocRef, {
        profilePic: null
      });
      
      setProfilePicUrl(null);
      toast({ title: "Profile Picture Removed", variant: "destructive" });
    } catch (error) {
      console.error("Error removing profile picture:", error);
      toast({ title: "Error", description: "Failed to remove profile picture.", variant: "destructive" });
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleEditUsernameToggle = () => {
    if (isEditingUsername) { // When cancelling edit
      if (userName) setEditableUserName(userName);
    } else { // When starting edit
      if (userName) setEditableUserName(userName);
      else if (userEmail) setEditableUserName(userEmail.split('@')[0]);
    }
    setIsEditingUsername(!isEditingUsername);
  };

  const handleSaveUsername = async () => {
    if (!userId) return;

    const newUsername = editableUserName.trim();

    if (!newUsername) {
      toast({ title: "Invalid Username", description: "Username cannot be empty.", variant: "destructive"});
      return;
    }
    
    try {
      setIsLoading(true);
      
      // Update Firestore document with only username
      const userDocRef = doc(db, 'users', userId);
      await updateDoc(userDocRef, {
        displayName: newUsername
      });
      
      setUserName(newUsername);
      setIsEditingUsername(false);
      toast({ title: "Username Updated", description: "Your username has been updated." });
    } catch (error) {
      console.error("Error updating username:", error);
      toast({ 
        title: "Update Failed", 
        description: "Could not update username. Please try again.", 
        variant: "destructive" 
      });
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="container mx-auto py-8">
        <Card className="max-w-2xl mx-auto shadow-lg">
          <CardHeader className="text-center">
            <Skeleton className="h-24 w-24 rounded-full mx-auto mb-4" />
            <Skeleton className="h-8 w-1/2 mx-auto mb-2" />
            <Skeleton className="h-5 w-3/4 mx-auto" />
          </CardHeader>
          <CardContent className="space-y-6">
            <Separator />
            <Skeleton className="h-10 w-full" />
            <Separator />
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Skeleton className="h-16 w-full" />
              <Skeleton className="h-16 w-full" />
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  const userEmailInitials = userName ? userName.substring(0, 2).toUpperCase() : (userEmail ? userEmail.substring(0,2).toUpperCase() : 'U');
  const displayProfilePic = profilePicUrl || `https://static.vecteezy.com/system/resources/thumbnails/020/765/399/small_2x/default-profile-account-unknown-icon-black-silhouette-free-vector.jpg`;

  return (
    <div className="container mx-auto py-8">
      <Card className="max-w-2xl mx-auto shadow-lg">
        <CardHeader className="text-center relative">
          <div className="relative w-24 h-24 mx-auto mb-4 group">
            <Avatar className="h-24 w-24">
              <AvatarImage src={displayProfilePic} alt={userName || userEmail || ""} data-ai-hint="profile picture" />
              <AvatarFallback className="text-3xl">{userEmailInitials}</AvatarFallback>
            </Avatar>
            <Button 
              variant="outline" 
              size="icon" 
              className="absolute bottom-0 right-0 h-8 w-8 rounded-full bg-background/80 opacity-0 group-hover:opacity-100 transition-opacity"
              onClick={() => fileInputRef.current?.click()}
              aria-label="Change profile picture"
            >
              <UploadCloud className="h-4 w-4" />
            </Button>
            <input 
              type="file" 
              ref={fileInputRef} 
              className="hidden" 
              accept="image/*" 
              onChange={handleProfilePictureChange} 
              title="Upload a profile picture"
            />
          </div>
          {profilePicUrl && (
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={handleRemoveProfilePicture} 
              className="absolute top-2 right-2 text-xs text-destructive hover:text-destructive hover:bg-destructive/10 px-2 py-1"
            >
              <Trash2 className="mr-1 h-3 w-3" /> Remove Pic
            </Button>
          )}
        
          <CardTitle className="text-3xl">{userName || userEmail}</CardTitle>
          <CardDescription>
            {userName && userEmail !== userName ? `${userEmail} • ${phoneNumber || 'No phone set'}` : `Manage your account and view your activity. ${phoneNumber ? `Phone: ${phoneNumber}` : ''}`}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <Separator />
          
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <h3 className="text-lg font-medium text-foreground">Account Details</h3>
            </div>

            <div className="space-y-4 p-3 bg-muted rounded-md">
              {/* Username Field */}
              <div>
                <div className="flex justify-between items-center">
                  <Label htmlFor="username" className="text-sm font-semibold">Username</Label>
                  {isEditingUsername ? (
                    <div className="flex space-x-2">
                      <Button variant="ghost" size="sm" onClick={handleEditUsernameToggle}>
                        <XCircle className="mr-2 h-4 w-4" /> Cancel
                      </Button>
                      <Button size="sm" onClick={handleSaveUsername}>
                        <Save className="mr-2 h-4 w-4" /> Save
                      </Button>
                    </div>
                  ) : (
                    <Button variant="outline" size="sm" onClick={handleEditUsernameToggle}>
                      <Edit3 className="mr-2 h-4 w-4" /> Edit
                    </Button>
                  )}
                </div>
                {isEditingUsername ? (
                  <Input
                    id="username"
                    type="text"
                    value={editableUserName}
                    onChange={(e) => setEditableUserName(e.target.value)}
                    className="mt-1"
                    placeholder="Enter your username"
                  />
                ) : (
                  <p className="text-sm text-foreground mt-1">{userName || 'Not set'}</p>
                )}
              </div>
              {/* Email Field - Read-only */}
              <div>
                <Label htmlFor="email" className="text-sm font-semibold">Email</Label>
                <p className="text-sm text-foreground mt-1">{userEmail}</p>
              </div>
              {/* Phone Number Field - Read-only */}
              <div>
                <Label htmlFor="phoneNumber" className="text-sm font-semibold">Phone Number</Label>
                <p className="text-sm text-foreground mt-1">{phoneNumber || 'Not set'}</p>
              </div>
            </div>
          </div>

          <Separator />

          <div className="space-y-3">
            <h3 className="text-lg font-medium text-foreground">Quick Links</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Link href="/orders" passHref>
                <Button variant="outline" className="w-full justify-start text-left h-auto py-3">
                  <Package className="mr-3 h-5 w-5 text-primary" />
                  <div>
                    <p className="font-semibold">My Orders</p>
                    <p className="text-xs text-muted-foreground">View your order history</p>
                  </div>
                </Button>
              </Link>
              <Link href="/profile/addresses" passHref>
                <Button variant="outline" className="w-full justify-start text-left h-auto py-3">
                  <UserIconLucide className="mr-3 h-5 w-5 text-primary" />
                  <div>
                    <p className="font-semibold">My Addresses</p>
                    <p className="text-xs text-muted-foreground">Manage your shipping addresses</p>
                  </div>
                </Button>
              </Link>
              <Link href="/payments" passHref>
                <Button variant="outline" className="w-full justify-start text-left h-auto py-3">
                  <CreditCard className="mr-3 h-5 w-5 text-primary" />
                  <div>
                    <p className="font-semibold">Payment Methods</p>
                    <p className="text-xs text-muted-foreground">Manage your payment options</p>
                  </div>
                </Button>
              </Link>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}