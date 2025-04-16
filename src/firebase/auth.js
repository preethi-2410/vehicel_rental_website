import { 
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  updateProfile,
  GoogleAuthProvider,
  signInWithPopup,
  RecaptchaVerifier,
  signInWithPhoneNumber
} from 'firebase/auth';
import { doc, setDoc, getDoc } from 'firebase/firestore';
import { auth, db } from './config';

// Sign up with email and password
export const signUp = async (email, password, name, phone) => {
  try {
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;

    // Update user profile
    await updateProfile(user, {
      displayName: name
    });

    // Create user document in Firestore
    await setDoc(doc(db, 'users', user.uid), {
      userId: user.uid,
      name,
      email,
      phone,
      role: 'customer', // Default role
      createdAt: new Date().toISOString()
    });

    return user;
  } catch (error) {
    throw error;
  }
};

// Sign in with email and password
export const signIn = async (email, password) => {
  try {
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    return userCredential.user;
  } catch (error) {
    throw error;
  }
};

// Sign in with Google
export const signInWithGoogle = async () => {
  try {
    const provider = new GoogleAuthProvider();
    const result = await signInWithPopup(auth, provider);
    const user = result.user;

    // Check if user document exists
    const userDoc = await getDoc(doc(db, 'users', user.uid));
    
    if (!userDoc.exists()) {
      // Create user document if it doesn't exist
      await setDoc(doc(db, 'users', user.uid), {
        userId: user.uid,
        name: user.displayName,
        email: user.email,
        phone: user.phoneNumber || '',
        role: 'customer',
        createdAt: new Date().toISOString()
      });
    }

    return user;
  } catch (error) {
    throw error;
  }
};

// Initialize reCAPTCHA verifier
export const initializeRecaptcha = (buttonId) => {
  const recaptchaVerifier = new RecaptchaVerifier(auth, buttonId, {
    'size': 'invisible',
    'callback': () => {
      // reCAPTCHA solved, allow signInWithPhoneNumber.
    }
  });
  return recaptchaVerifier;
};

// Sign in with phone number - Step 1: Send OTP
export const sendPhoneNumberVerification = async (phoneNumber, recaptchaVerifier) => {
  try {
    const confirmationResult = await signInWithPhoneNumber(auth, phoneNumber, recaptchaVerifier);
    return confirmationResult;
  } catch (error) {
    throw error;
  }
};

// Sign in with phone number - Step 2: Verify OTP
export const verifyPhoneNumber = async (confirmationResult, verificationCode) => {
  try {
    const result = await confirmationResult.confirm(verificationCode);
    const user = result.user;

    // Check if user document exists
    const userDoc = await getDoc(doc(db, 'users', user.uid));
    
    if (!userDoc.exists()) {
      // Create user document if it doesn't exist
      await setDoc(doc(db, 'users', user.uid), {
        userId: user.uid,
        name: user.displayName || 'User',
        email: user.email || '',
        phone: user.phoneNumber,
        role: 'customer',
        createdAt: new Date().toISOString()
      });
    }

    return user;
  } catch (error) {
    throw error;
  }
};

// Sign out
export const signOutUser = async () => {
  try {
    await signOut(auth);
  } catch (error) {
    throw error;
  }
}; 