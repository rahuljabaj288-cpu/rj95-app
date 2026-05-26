/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { initializeApp } from 'firebase/app';
import { getAuth, signInWithPopup, GoogleAuthProvider, onAuthStateChanged, User } from 'firebase/auth';
import firebaseConfig from '../../firebase-applet-config.json';

// Initialize Firebase App for Google Authentication
const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);

// Configure Google Auth Provider with Google Docs, Drive & Calendar scopes
export const googleProvider = new GoogleAuthProvider();
googleProvider.addScope('https://www.googleapis.com/auth/docs');
googleProvider.addScope('https://www.googleapis.com/auth/documents');
googleProvider.addScope('https://www.googleapis.com/auth/drive');
googleProvider.addScope('https://www.googleapis.com/auth/calendar');
googleProvider.addScope('https://www.googleapis.com/auth/calendar.events');

// Local in-memory caches to secure credentials from localStorage leakage
let isSigningIn = false;
let cachedAccessToken: string | null = null;
let cachedGoogleUser: User | null = null;

// Listen to authentication changes
export const initAuth = (
  onAuthSuccess?: (user: User, token: string) => void,
  onAuthFailure?: () => void
) => {
  return onAuthStateChanged(auth, async (user: User | null) => {
    if (user) {
      cachedGoogleUser = user;
      if (cachedAccessToken) {
        if (onAuthSuccess) onAuthSuccess(user, cachedAccessToken);
      } else if (!isSigningIn) {
        // Clear if we aren't in progress of signing in
        cachedAccessToken = null;
        if (onAuthFailure) onAuthFailure();
      }
    } else {
      cachedGoogleUser = null;
      cachedAccessToken = null;
      if (onAuthFailure) onAuthFailure();
    }
  });
};

// Sign in with Google Popup
export const googleSignIn = async (): Promise<{ user: User; accessToken: string } | null> => {
  try {
    isSigningIn = true;
    const result = await signInWithPopup(auth, googleProvider);
    const credential = GoogleAuthProvider.credentialFromResult(result);
    if (!credential?.accessToken) {
      throw new Error('Failed to get Google Docs access token from authentication credentials');
    }

    cachedAccessToken = credential.accessToken;
    cachedGoogleUser = result.user;
    return { user: result.user, accessToken: cachedAccessToken };
  } catch (error: any) {
    console.error('Google Sign-in Error:', error);
    throw error;
  } finally {
    isSigningIn = false;
  }
};

// Retrieve memory-cached Access Token
export const getAccessToken = async (): Promise<string | null> => {
  return cachedAccessToken;
};

// Retrieve memory-cached active user
export const getGoogleUser = (): User | null => {
  return cachedGoogleUser;
};

// Logout from Google profile session
export const logoutGoogle = async () => {
  await auth.signOut();
  cachedAccessToken = null;
  cachedGoogleUser = null;
};
