"use client";

import { createContext, useContext, useEffect, useState } from "react";
import type { User } from "firebase/auth";
import { 
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  onAuthStateChanged,
  signOut as firebaseSignOut,
  updateProfile,
  getIdToken
} from "firebase/auth";
import { auth } from "~/lib/firebase";
import { createUser } from "~/server/actions/users";

type AuthContextType = {
  user: User | null;
  loading: boolean;
  signUp: (email: string, password: string, username: string) => Promise<void>;
  signIn: (email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
  error: string | null;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Set auth token in localStorage when user changes
  useEffect(() => {
    const handleUserChange = async (currentUser: User | null) => {
      if (currentUser) {
        // User is signed in, store the token in localStorage
        const token = await getIdToken(currentUser);
        localStorage.setItem('firebase-auth-token', token);
      } else {
        // User is signed out, remove the token
        localStorage.removeItem('firebase-auth-token');
      }
    };

    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setUser(user);
      setLoading(false);
      if (user) {
        void handleUserChange(user);
      }
    });

    return () => unsubscribe();
  }, []);

  const signUp = async (email: string, password: string, username: string) => {
    try {
      setError(null);
      
      // Create the user in Firebase Authentication
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      
      // Set the username as displayName in Firebase
      await updateProfile(userCredential.user, {
        displayName: username
      });
      
      try {
        // Create the user in your database
        await createUser({
          firebaseUid: userCredential.user.uid,
          email: email,
          username: username
        });
      } catch (dbError) {
        // If database creation fails, still keep the Firebase user but log the error
        console.error("Error creating user in database:", dbError);
        
        // If username is taken, we should show that error
        if (dbError instanceof Error && dbError.message.includes("Username already taken")) {
          setError("Username already taken. Please choose another username.");
          // Delete the Firebase user since we couldn't create the database entry
          await userCredential.user.delete();
          return;
        }
      }
      
      // Refresh the user object
      setUser({ ...userCredential.user });
    } catch (error) {
      console.error("Error signing up:", error);
      if (error instanceof Error) {
        // Format Firebase error messages to be more user-friendly
        if (error.message.includes("email-already-in-use")) {
          setError("Email is already in use. Please use a different email or sign in.");
        } else if (error.message.includes("weak-password")) {
          setError("Password is too weak. Please use a stronger password.");
        } else if (error.message.includes("invalid-email")) {
          setError("Invalid email address. Please check your email format.");
        } else {
          setError(error.message);
        }
      } else {
        setError("Failed to sign up. Please try again.");
      }
    }
  };

  const signIn = async (email: string, password: string) => {
    try {
      setError(null);
      await signInWithEmailAndPassword(auth, email, password);
    } catch (error) {
      console.error("Error signing in:", error);
      if (error instanceof Error) {
        // Format Firebase error messages to be more user-friendly
        if (error.message.includes("user-not-found") || error.message.includes("wrong-password")) {
          setError("Invalid email or password. Please try again.");
        } else if (error.message.includes("too-many-requests")) {
          setError("Too many failed login attempts. Please try again later or reset your password.");
        } else {
          setError(error.message);
        }
      } else {
        setError("Failed to sign in. Please try again.");
      }
    }
  };

  const signOut = async () => {
    try {
      await firebaseSignOut(auth);
    } catch (error) {
      console.error("Error signing out:", error);
      if (error instanceof Error) {
        setError(error.message);
      } else {
        setError("Failed to sign out. Please try again.");
      }
    }
  };

  return (
    <AuthContext.Provider value={{ user, loading, signUp, signIn, signOut, error }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};