import { auth as firebaseAuth } from '@/firebaseConfig';
import type { Auth as FirebaseAuth } from 'firebase/auth';
import {
  createUserWithEmailAndPassword,
  signOut as firebaseSignOut,
  onAuthStateChanged,
  signInWithEmailAndPassword,
  User,
} from 'firebase/auth';
import React, { createContext, useContext, useEffect, useState } from 'react';

// Handle case where Firebase is not configured
const auth: FirebaseAuth | undefined = firebaseAuth;

interface AuthContextType {
  user: User | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
  signInLoading: boolean;
  signUpLoading: boolean;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [signInLoading, setSignInLoading] = useState(false);
  const [signUpLoading, setSignUpLoading] = useState(false);

  useEffect(() => {
    if (!auth) return;
    const unsubscribe = onAuthStateChanged(auth, (u) => {
      setUser(u);
      setLoading(false);
    });
    return unsubscribe;
  }, []);

  const signIn = async (email: string, password: string) => {
    if (!auth) throw new Error('Firebase not configured');
    setSignInLoading(true);
    try {
      await signInWithEmailAndPassword(auth, email, password);
    } finally {
      setSignInLoading(false);
    }
  };

  const signUp = async (email: string, password: string) => {
    if (!auth) throw new Error('Firebase not configured');
    setSignUpLoading(true);
    try {
      await createUserWithEmailAndPassword(auth, email, password);
    } finally {
      setSignUpLoading(false);
    }
  };

  const signOut = () => {
    if (!auth) return Promise.resolve();
    return firebaseSignOut(auth);
  };

  return (
    <AuthContext.Provider value={{ user, loading, signIn, signUp, signOut, signInLoading, signUpLoading }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
