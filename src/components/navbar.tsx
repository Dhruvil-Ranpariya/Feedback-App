'use client'

import React from 'react';
import Link from 'next/link';
import { useSession, signOut } from 'next-auth/react';
import { Button } from './ui/button';
import { User } from 'next-auth';

function Navbar() {
  const { data: session } = useSession();
  
  const user : User = session?.user as User;
  console.log("Thisss is session ",user);

  return (
    // <div className="flex flex-col min-h-screen">---------------------
    <nav className="p-4 md:p-6 shadow-md bg-gray-900 text-white">
    <div className="container px-4 md:px-6 mx-auto flex flex-col md:flex-row justify-between items-center">
      <a href="/" className="text-xl font-bold mb-4 md:mb-0">
        True Feedback
      </a>
      {user ? (
        <div className="flex items-center space-x-4">
          <span className="mr-4">Welcome, {user.username || user.email}</span>
          <Button
            onClick={() => signOut()}
            className="w-auto px-4 py-2 bg-slate-100 text-black text-sm md:text-base"
            variant="outline"
          >
            Logout
          </Button>
        </div>
      ) : (
        <Link href="/sign-in">
          <Button
            className="w-auto px-4 py-2 bg-slate-100 text-black text-sm md:text-base"
            variant="outline"
          >
            Login
          </Button>
        </Link>
      )}
    </div>
  </nav>
  
    // </div>
  );
}

export default Navbar;