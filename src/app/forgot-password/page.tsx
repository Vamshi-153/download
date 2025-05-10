'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Form, FormControl, FormField, FormItem, FormMessage } from "@/components/ui/form";
import Link from "next/link";
import { useToast } from "@/hooks/use-toast";
import { getAuth, sendPasswordResetEmail } from "firebase/auth";
import { app } from "../../firebase/firebaseConfig"; // Adjust the import path as necessary

const emailSchema = z.object({
  email: z.string().email({ message: "Please enter a valid email address." }),
});

type EmailFormValues = z.infer<typeof emailSchema>;

export default function ForgotPasswordPage() {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [emailSent, setEmailSent] = useState(false);

  const form = useForm<EmailFormValues>({
    resolver: zodResolver(emailSchema),
    defaultValues: {
      email: '',
    },
  });

  const onSubmit = async (data: EmailFormValues) => {
    setIsLoading(true);
    
    try {
      // Initialize Firebase Auth service
      const auth = getAuth(app);
      
      // Send password reset email
      await sendPasswordResetEmail(auth, data.email);
      
      toast({
        title: "Password Reset Email Sent",
        description: `If an account exists for ${data.email}, a reset link has been sent.`,
      });
      
      setEmailSent(true);
      form.reset(); // Clear the form
    } catch (err) {
      console.error("Password reset error:", err);
      toast({
        title: "Error",
        description: "Failed to send reset email. Please try again later.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <Card className="w-full max-w-md border border-gray-200 shadow-sm rounded-lg overflow-hidden">
        <CardContent className="pt-8">
          <div className="flex flex-col items-center">
            {/* Email Icon */}
            <div className="w-16 h-16 rounded-full bg-teal-600 flex items-center justify-center mb-5">
              <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <rect width="20" height="16" x="2" y="4" rx="2"></rect>
                <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"></path>
              </svg>
            </div>
            
            {/* Title */}
            <h1 className="text-2xl font-bold text-center mb-2">Forgot Your Password?</h1>
            
            {/* Description */}
            <p className="text-gray-600 text-center mb-6">
              No worries! Enter your email address below and we'll send you 
              a link to reset your password.
            </p>
            
            {!emailSent ? (
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="w-full space-y-5">
                  <div className="space-y-2">
                    <label htmlFor="email" className="block font-medium text-gray-700">
                      Email Address
                    </label>
                    <FormField
                      control={form.control}
                      name="email"
                      render={({ field }) => (
                        <FormItem>
                          <FormControl>
                            <Input 
                              id="email"
                              type="email" 
                              placeholder="example@gmail.com" 
                              className="w-full border border-gray-300 rounded-md"
                              {...field} 
                            />
                          </FormControl>
                          <FormMessage className="text-red-500" />
                        </FormItem>
                      )}
                    />
                  </div>
                  
                  <Button 
                    type="submit" 
                    className="w-full bg-teal-600 hover:bg-teal-700 text-white py-3 rounded-md"
                    disabled={isLoading}
                  >
                    {isLoading ? 'Sending...' : 'Send Reset Link'}
                  </Button>
                  
                  <div className="text-center pt-4">
                    <Link 
                      href="/login" 
                      className="inline-flex items-center text-teal-600 hover:text-teal-700"
                    >
                      <svg 
                        xmlns="http://www.w3.org/2000/svg" 
                        width="18" 
                        height="18" 
                        viewBox="0 0 24 24" 
                        fill="none" 
                        stroke="currentColor" 
                        strokeWidth="2" 
                        strokeLinecap="round" 
                        strokeLinejoin="round" 
                        className="mr-1"
                      >
                        <path d="m15 18-6-6 6-6" />
                      </svg>
                      Back to Login
                    </Link>
                  </div>
                </form>
              </Form>
            ) : (
              <div className="text-center py-4">
                <div className="bg-green-100 text-green-600 p-4 rounded-md mb-6">
                  Reset link sent successfully! Please check your email.
                </div>
                <Link 
                  href="/login" 
                  className="inline-flex items-center text-teal-600 hover:text-teal-700"
                >
                  <svg 
                    xmlns="http://www.w3.org/2000/svg" 
                    width="18" 
                    height="18" 
                    viewBox="0 0 24 24" 
                    fill="none" 
                    stroke="currentColor" 
                    strokeWidth="2" 
                    strokeLinecap="round" 
                    strokeLinejoin="round" 
                    className="mr-1"
                  >
                    <path d="m15 18-6-6 6-6" />
                  </svg>
                  Back to Login
                </Link>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}