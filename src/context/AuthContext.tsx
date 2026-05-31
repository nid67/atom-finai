import React, { createContext, useContext, useEffect, useState } from 'react';
import { 
  signInWithPopup, 
  signOut, 
  onAuthStateChanged 
} from 'firebase/auth';
import type { User } from 'firebase/auth';
import { 
  doc, 
  getDoc, 
  setDoc, 
  updateDoc, 
  serverTimestamp 
} from 'firebase/firestore';
import { auth, db, googleProvider } from '../firebase';

export interface UserData {
  uid: string;
  fullName: string;
  email: string;
  profilePhoto: string | null;
  occupation: string;
  monthlyIncome: number;
  preferredCurrency: string;
  financialGoal: string;
  financialHealthScore: number;
  financialPersonality: string;
  aiQueriesUsedToday: number;
  aiQueryResetDate: string;
  aiConfidence: number;
  createdAt: any;
  lastLogin: any;
  onboardingCompleted: boolean;
  
  // Student specific funding parameters
  isStudent?: boolean;
  studentFundingSource?: 'earn' | 'parents' | 'both' | '';
  parentFundingInterval?: 'daily' | 'weekly' | 'monthly' | 'irregular' | '';
  parentFundingAmount?: number;
  parentFundingIntervalLabel?: string;
}

interface AuthContextType {
  user: User | null;
  userData: UserData | null;
  loading: boolean;
  loginWithGoogle: () => Promise<void>;
  logout: () => Promise<void>;
  updateOnboarding: (data: Partial<UserData>) => Promise<void>;
  refreshUserData: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [userData, setUserData] = useState<UserData | null>(null);
  const [loading, setLoading] = useState(true);

  // Sync user document from Firestore or create standard shell if it doesn't exist
  const syncUserProfile = async (currentUser: User) => {
    try {
      const userRef = doc(db, 'users', currentUser.uid);
      const userSnap = await getDoc(userRef);

      const todayStr = new Date().toISOString().split('T')[0];

      if (userSnap.exists()) {
        const data = userSnap.data() as UserData;
        
        // Reset AI queries used today if the date has changed
        let updatedQueriesUsed = data.aiQueriesUsedToday;
        let queryResetDate = data.aiQueryResetDate || todayStr;
        
        if (queryResetDate !== todayStr) {
          updatedQueriesUsed = 0;
          queryResetDate = todayStr;
          await updateDoc(userRef, {
            aiQueriesUsedToday: 0,
            aiQueryResetDate: todayStr,
            lastLogin: serverTimestamp()
          });
        } else {
          await updateDoc(userRef, {
            lastLogin: serverTimestamp()
          });
        }

        setUserData({
          ...data,
          aiQueriesUsedToday: updatedQueriesUsed,
          aiQueryResetDate: queryResetDate
        });
      } else {
        // First login - Scaffold profile
        const newUserData: UserData = {
          uid: currentUser.uid,
          fullName: currentUser.displayName || 'Atom User',
          email: currentUser.email || '',
          profilePhoto: currentUser.photoURL || null,
          occupation: '',
          monthlyIncome: 0,
          preferredCurrency: '₹', // Default rupee as ₹1 minimum limit mentioned, but user can customize
          financialGoal: '',
          financialHealthScore: 100,
          financialPersonality: 'Balanced Planner',
          aiQueriesUsedToday: 0,
          aiQueryResetDate: todayStr,
          aiConfidence: 10, // Starts at 10%
          createdAt: new Date(),
          lastLogin: new Date(),
          onboardingCompleted: false
        };

        await setDoc(userRef, {
          ...newUserData,
          createdAt: serverTimestamp(),
          lastLogin: serverTimestamp()
        });

        // Initialize AI memory layer too
        const profileRef = doc(db, 'user_profile', currentUser.uid);
        await setDoc(profileRef, {
          userId: currentUser.uid,
          personality: 'Balanced Planner',
          healthScore: 100,
          savingsRate: 0,
          topCategory: 'None',
          largestWeakness: 'No data',
          strongestHabit: 'No data',
          goalPriority: 'High',
          budgetDiscipline: 'Excellent',
          goalCommitment: 'High',
          riskLevel: 'Moderate',
          aiConfidence: 10,
          lastUpdated: serverTimestamp()
        });

        setUserData(newUserData);
      }
    } catch (error) {
      console.error("Error syncing user profile:", error);
    }
  };

  const loginWithGoogle = async () => {
    setLoading(true);
    try {
      const result = await signInWithPopup(auth, googleProvider);
      if (result.user) {
        await syncUserProfile(result.user);
      }
    } catch (error) {
      console.error("Google Sign-In failed:", error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    setLoading(true);
    try {
      await signOut(auth);
      setUser(null);
      setUserData(null);
    } catch (error) {
      console.error("Logout failed:", error);
    } finally {
      setLoading(false);
    }
  };

  const updateOnboarding = async (data: Partial<UserData>) => {
    if (!user) return;
    try {
      const userRef = doc(db, 'users', user.uid);
      await updateDoc(userRef, {
        ...data,
        onboardingCompleted: true
      });
      
      // Update local state
      setUserData(prev => prev ? { ...prev, ...data, onboardingCompleted: true } : null);
    } catch (error) {
      console.error("Error updating onboarding data:", error);
      throw error;
    }
  };

  const refreshUserData = async () => {
    if (!user) return;
    try {
      const userRef = doc(db, 'users', user.uid);
      const userSnap = await getDoc(userRef);
      if (userSnap.exists()) {
        setUserData(userSnap.data() as UserData);
      }
    } catch (error) {
      console.error("Error refreshing user data:", error);
    }
  };

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      setUser(currentUser);
      if (currentUser) {
        await syncUserProfile(currentUser);
      } else {
        setUserData(null);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  return (
    <AuthContext.Provider value={{ 
      user, 
      userData, 
      loading, 
      loginWithGoogle, 
      logout, 
      updateOnboarding,
      refreshUserData
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
