import { db } from './config';
import { 
  collection, 
  doc, 
  getDocs, 
  getDoc, 
  updateDoc, 
  query, 
  where, 
  setDoc, 
  serverTimestamp
} from 'firebase/firestore';

// Get all users (admin only)
export const getAllUsers = async () => {
  try {
    const usersSnapshot = await getDocs(collection(db, 'users'));
    return usersSnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
  } catch (error) {
    console.error('Error getting all users:', error);
    throw error;
  }
};

// Get user by ID
export const getUserById = async (userId) => {
  try {
    const userDoc = await getDoc(doc(db, 'users', userId));
    if (userDoc.exists()) {
      return {
        id: userDoc.id,
        ...userDoc.data()
      };
    } else {
      throw new Error('User not found');
    }
  } catch (error) {
    console.error('Error getting user by ID:', error);
    throw error;
  }
};

// Update user role (admin only)
export const updateUserRole = async (userId, newRole) => {
  try {
    const userRef = doc(db, 'users', userId);
    
    // Check if user exists
    const userDoc = await getDoc(userRef);
    if (!userDoc.exists()) {
      throw new Error('User not found');
    }
    
    // Update the user's role
    await updateDoc(userRef, {
      role: newRole,
      updatedAt: serverTimestamp()
    });
    
    return {
      success: true,
      message: `User ${userId} role updated to ${newRole}`
    };
  } catch (error) {
    console.error('Error updating user role:', error);
    throw error;
  }
};

// Make a user an admin (for development purposes)
export const makeUserAdmin = async (email) => {
  try {
    // Find user by email
    const usersQuery = query(collection(db, 'users'), where('email', '==', email));
    const usersSnapshot = await getDocs(usersQuery);
    
    if (usersSnapshot.empty) {
      throw new Error(`No user found with email: ${email}`);
    }
    
    const userDoc = usersSnapshot.docs[0];
    const userId = userDoc.id;
    
    // Update the user's role to admin
    await updateDoc(doc(db, 'users', userId), {
      role: 'admin',
      updatedAt: serverTimestamp()
    });
    
    return {
      success: true,
      message: `User ${email} is now an admin`,
      userId
    };
  } catch (error) {
    console.error('Error making user an admin:', error);
    throw error;
  }
};

// Get users by role
export const getUsersByRole = async (role) => {
  try {
    const usersQuery = query(collection(db, 'users'), where('role', '==', role));
    const usersSnapshot = await getDocs(usersQuery);
    
    return usersSnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
  } catch (error) {
    console.error(`Error getting users with role ${role}:`, error);
    throw error;
  }
};

// Update user profile (can be used by the user themselves)
export const updateUserProfile = async (userId, profileData) => {
  try {
    const userRef = doc(db, 'users', userId);
    
    // Check if user exists
    const userDoc = await getDoc(userRef);
    if (!userDoc.exists()) {
      throw new Error('User not found');
    }
    
    // Don't allow updating role through this function
    const { role, ...allowedUpdates } = profileData;
    
    // Update the user's profile
    await updateDoc(userRef, {
      ...allowedUpdates,
      updatedAt: serverTimestamp()
    });
    
    return {
      success: true,
      message: 'User profile updated successfully'
    };
  } catch (error) {
    console.error('Error updating user profile:', error);
    throw error;
  }
}; 