import React, { createContext, useContext, useState, useEffect } from 'react';
import { supabase, supabaseApi } from '../config/supabase';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [profile, setProfile] = useState(null);
    const [loading, setLoading] = useState(true);

    // Fetch user profile from database using high-speed API
    const fetchProfile = async (userId) => {
        try {
            // Using direct fetch API to prevent library hanging
            const data = await supabaseApi.fetch('profiles', `id=eq.${userId}`);

            if (data && data.length > 0) {
                return data[0]; // Return the first matching profile
            }
            return null;
        } catch (err) {
            console.error('Profile fetch error:', err);
            return null;
        }
    };

    // Initialize auth state
    useEffect(() => {
        const initAuth = async () => {
            try {
                // Get current session from Supabase Auth
                const { data: { session } } = await supabase.auth.getSession();

                if (session?.user) {
                    setUser(session.user);
                    const profileData = await fetchProfile(session.user.id);
                    setProfile(profileData);
                } else {
                    setUser(null);
                    setProfile(null);
                }
            } catch (error) {
                console.error('Auth initialization error:', error);
            } finally {
                // Critical: Ensure loading is set to false regardless of success/failure
                setLoading(false);
            }
        };

        initAuth();

        // Listen for auth changes
        const { data: { subscription } } = supabase.auth.onAuthStateChange(
            async (event, session) => {
                if (session?.user) {
                    setUser(session.user);
                    // Fetch profile when auth changes
                    const profileData = await fetchProfile(session.user.id);
                    setProfile(profileData);
                } else {
                    setUser(null);
                    setProfile(null);
                }
                setLoading(false);
            }
        );

        return () => subscription.unsubscribe();
    }, []);

    // Sign in with email and password
    const signIn = async (email, password) => {
        try {
            const { data, error } = await supabase.auth.signInWithPassword({
                email,
                password,
            });

            if (error) {
                return { error };
            }

            if (data.user) {
                setUser(data.user);
                const profileData = await fetchProfile(data.user.id);
                setProfile(profileData);
                return { data: profileData, error: null };
            }

            return { data: null, error: null };
        } catch (error) {
            return { error };
        }
    };

    // Sign up with email and password
    const signUp = async (email, password, metadata = {}) => {
        try {
            const { data, error } = await supabase.auth.signUp({
                email,
                password,
                options: {
                    data: metadata,
                },
            });

            if (error) {
                return { error };
            }

            return { data, error: null };
        } catch (error) {
            return { error };
        }
    };

    // Sign out
    const signOut = async () => {
        try {
            await supabase.auth.signOut();
            setUser(null);
            setProfile(null);
        } catch (error) {
            console.error('Sign out error:', error);
        }
    };

    // Update profile
    const updateProfile = async (updates) => {
        try {
            const { data, error } = await supabase
                .from('profiles')
                .update(updates)
                .eq('id', user.id)
                .select()
                .single();

            if (error) {
                return { error };
            }

            setProfile(data);
            return { data, error: null };
        } catch (error) {
            return { error };
        }
    };

    const value = {
        user,
        profile,
        loading,
        signIn,
        signUp,
        signOut,
        updateProfile,
        institutionName: profile?.institution_name,
    };

    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};
