import React, { useState, useEffect } from 'react';
import { StyleSheet, Text, View, TextInput, TouchableOpacity, Alert, SafeAreaView, KeyboardAvoidingView, Platform, Image, ScrollView } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { StatusBar } from 'expo-status-bar';
import { initDatabase, registerUser, loginUser } from './utils/database';

export default function App() {
    const [isLogin, setIsLogin] = useState(true);
    const [isLoggedIn, setIsLoggedIn] = useState(false);
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [firstName, setFirstName] = useState('');
    const [lastName, setLastName] = useState('');
    const [email, setEmail] = useState('');
    const [contactNumber, setContactNumber] = useState('');
    const [address, setAddress] = useState('');
    const [profilePicture, setProfilePicture] = useState('');
    const [userProfile, setUserProfile] = useState(null);
    const [isEditing, setIsEditing] = useState(false);

    useEffect(() => {
        initDatabase();
        checkLoginStatus();
    }, []);

    const checkLoginStatus = async () => {
        const status = await AsyncStorage.getItem('isLoggedIn');
        if (status === 'true') {
            setIsLoggedIn(true);
            fetchUserProfile();
        }
    };

    const fetchUserProfile = async () => {
        const profile = await AsyncStorage.getItem('userProfile');
        if (profile) {
            setUserProfile(JSON.parse(profile));
        }
    };

    const isValidEmail = (email) => /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/.test(email);
    const isValidPhone = (phone) => /^[0-9]{10}$/.test(phone);

    const handleSubmit = async () => {
        if (!username || !password || !firstName || !lastName || !email || !contactNumber || !address) {
            Alert.alert('Error', 'Please fill in all fields');
            return;
        }
        if (!isValidEmail(email)) {
            Alert.alert('Error', 'Invalid email address');
            return;
        }
        if (!isValidPhone(contactNumber)) {
            Alert.alert('Error', 'Invalid phone number');
            return;
        }

        try {
            if (isLogin) {
                const success = await loginUser(username, password);
                if (success) {
                    await AsyncStorage.setItem('isLoggedIn', 'true');
                    setIsLoggedIn(true);
                    fetchUserProfile();
                    Alert.alert('Success', 'Logged in successfully');
                } else {
                    Alert.alert('Error', 'Invalid credentials');
                }
            } else {
                const newUserProfile = {
                    username,
                    firstName,
                    lastName,
                    email,
                    contactNumber,
                    address,
                    profilePicture,
                };
                await registerUser(newUserProfile);
                await AsyncStorage.setItem('userProfile', JSON.stringify(newUserProfile));
                Alert.alert('Success', 'Registration successful');
                setIsLogin(true);
            }
        } catch (error) {
            Alert.alert('Error', error.message);
        }
    };

    const handleLogout = async () => {
        await AsyncStorage.removeItem('isLoggedIn');
        await AsyncStorage.removeItem('userProfile');
        setIsLoggedIn(false);
        setUsername('');
        setPassword('');
        setUserProfile(null);
    };

    const handleSaveProfile = async () => {
        try {
            await AsyncStorage.setItem('userProfile', JSON.stringify(userProfile));
            setIsEditing(false);
            Alert.alert('Success', 'Profile updated');
        } catch (error) {
            Alert.alert('Error', 'Failed to save profile');
        }
    };

    if (isLoggedIn) {
        return (
            <SafeAreaView style={styles.container}>
                <ScrollView contentContainerStyle={styles.loggedInContainer}>
                    <Image
                        source={{ uri: userProfile?.profilePicture || 'https://placekitten.com/200/200' }}
                        style={styles.avatar}
                    />
                    <Text style={styles.welcomeTitle}>
                        Welcome, {userProfile?.firstName} {userProfile?.lastName}!
                    </Text>

                    {isEditing ? (
                        <View style={styles.inputContainer}>
                            <TextInput
                                style={styles.input}
                                placeholder="First Name"
                                value={userProfile?.firstName}
                                onChangeText={(text) => setUserProfile({ ...userProfile, firstName: text })}
                            />
                            <TextInput
                                style={styles.input}
                                placeholder="Last Name"
                                value={userProfile?.lastName}
                                onChangeText={(text) => setUserProfile({ ...userProfile, lastName: text })}
                            />
                            <TextInput
                                style={styles.input}
                                placeholder="Email"
                                value={userProfile?.email}
                                onChangeText={(text) => setUserProfile({ ...userProfile, email: text })}
                            />
                            <TextInput
                                style={styles.input}
                                placeholder="Contact Number"
                                value={userProfile?.contactNumber}
                                onChangeText={(text) => setUserProfile({ ...userProfile, contactNumber: text })}
                            />
                            <TextInput
                                style={styles.input}
                                placeholder="Address"
                                value={userProfile?.address}
                                onChangeText={(text) => setUserProfile({ ...userProfile, address: text })}
                            />
                            <TextInput
                                style={styles.input}
                                placeholder="Profile Picture URL"
                                value={userProfile?.profilePicture}
                                onChangeText={(text) => setUserProfile({ ...userProfile, profilePicture: text })}
                            />
                            <TouchableOpacity onPress={handleSaveProfile} style={styles.mainButton}>
                                <Text style={styles.buttonText}>Save</Text>
                            </TouchableOpacity>
                        </View>
                    ) : (
                        <View style={styles.profileDetails}>
                            <Text style={styles.profileText}>Name: {userProfile?.firstName} {userProfile?.lastName}</Text>
                            <Text style={styles.profileText}>Email: {userProfile?.email}</Text>
                            <Text style={styles.profileText}>Contact: {userProfile?.contactNumber}</Text>
                            <Text style={styles.profileText}>Address: {userProfile?.address}</Text>
                            <TouchableOpacity onPress={() => setIsEditing(true)} style={styles.mainButton}>
                                <Text style={styles.buttonText}>Edit Profile</Text>
                            </TouchableOpacity>
                        </View>
                    )}

                    <TouchableOpacity onPress={handleLogout} style={styles.logoutButton}>
                        <Text style={styles.buttonText}>Logout</Text>
                    </TouchableOpacity>
                </ScrollView>
            </SafeAreaView>
        );
    }

    return (
        <SafeAreaView style={styles.container}>
            <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={styles.keyboardView}>
                <ScrollView contentContainerStyle={styles.formContainer}>
                    <Image source={require('./assets/icon.png')} style={styles.logo} />
                    <Text style={styles.title}>{isLogin ? 'Welcome Back!' : 'Create Account'}</Text>
                    <Text style={styles.subtitle}>
                        {isLogin ? 'Please sign in to continue' : 'Please fill in the form to continue'}
                    </Text>

                    <View style={styles.inputContainer}>
                        <TextInput
                            style={styles.input}
                            placeholder="Username"
                            value={username}
                            onChangeText={setUsername}
                            placeholderTextColor="#7f8c8d"
                            autoCapitalize="none"
                        />
                        <TextInput
                            style={styles.input}
                            placeholder="Password"
                            value={password}
                            onChangeText={setPassword}
                            secureTextEntry
                            placeholderTextColor="#7f8c8d"
                            autoCapitalize="none"
                        />
                        {!isLogin && (
                            <>
                                <TextInput
                                    style={styles.input}
                                    placeholder="First Name"
                                    value={firstName}
                                    onChangeText={setFirstName}
                                    placeholderTextColor="#7f8c8d"
                                />
                                <TextInput
                                    style={styles.input}
                                    placeholder="Last Name"
                                    value={lastName}
                                    onChangeText={setLastName}
                                    placeholderTextColor="#7f8c8d"
                                />
                                <TextInput
                                    style={styles.input}
                                    placeholder="Email"
                                    value={email}
                                    onChangeText={setEmail}
                                    placeholderTextColor="#7f8c8d"
                                    keyboardType="email-address"
                                />
                                <TextInput
                                    style={styles.input}
                                    placeholder="Contact Number"
                                    value={contactNumber}
                                    onChangeText={setContactNumber}
                                    placeholderTextColor="#7f8c8d"
                                    keyboardType="phone-pad"
                                />
                                <TextInput
                                    style={styles.input}
                                    placeholder="Address"
                                    value={address}
                                    onChangeText={setAddress}
                                    placeholderTextColor="#7f8c8d"
                                />
                                <TextInput
                                    style={styles.input}
                                    placeholder="Profile Picture URL"
                                    value={profilePicture}
                                    onChangeText={setProfilePicture}
                                    placeholderTextColor="#7f8c8d"
                                />
                            </>
                        )}
                    </View>

                    <TouchableOpacity onPress={handleSubmit} style={styles.mainButton}>
                        <Text style={styles.buttonText}>{isLogin ? 'Sign In' : 'Sign Up'}</Text>
                    </TouchableOpacity>

                    <TouchableOpacity onPress={() => setIsLogin(!isLogin)} style={styles.switchButton}>
                        <Text style={styles.switchText}>
                            {isLogin ? 'New user? Create an account' : 'Already have an account? Sign in'}
                        </Text>
                    </TouchableOpacity>
                </ScrollView>
            </KeyboardAvoidingView>
            <StatusBar style="auto" />
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#f4f7fa',
        paddingTop: Platform.OS === 'ios' ? 30 : 0, // Avoid iOS status bar overlap
    },
    keyboardView: {
        flex: 1,
    },
    formContainer: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        paddingHorizontal: 20,
        paddingVertical: 40,
    },
    logo: {
        width: 140,
        height: 140,
        marginBottom: 20,
        resizeMode: 'contain',
    },
    title: {
        fontSize: 32,
        fontWeight: 'bold',
        color: '#2d3436',
        marginBottom: 10,
        textAlign: 'center',
    },
    subtitle: {
        fontSize: 16,
        color: '#636e72',
        marginBottom: 40,
        textAlign: 'center',
        fontWeight: '500',
    },
    inputContainer: {
        width: '100%',
        marginBottom: 20,
    },
    input: {
        backgroundColor: '#ffffff',
        width: '100%',
        height: 50,
        borderRadius: 12,
        marginBottom: 14,
        paddingHorizontal: 18,
        fontSize: 16,
        borderColor: '#b2bec3',
        borderWidth: 1.5,
        color: '#2d3436',
        transition: '0.3s',
    },
    inputFocused: {
        borderColor: '#0984e3', // Color when input is focused
        boxShadow: '0 4px 8px rgba(9, 132, 227, 0.2)',
    },
    mainButton: {
        backgroundColor: '#0984e3',
        width: '100%',
        height: 50,
        borderRadius: 12,
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 18,
        elevation: 5, // Added shadow for elevation
    },
    buttonText: {
        color: '#fff',
        fontSize: 18,
        fontWeight: '600',
    },
    switchButton: {
        padding: 10,
    },
    switchText: {
        color: '#0984e3',
        fontSize: 14,
        fontWeight: '600',
    },
    loggedInContainer: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        padding: 30,
        backgroundColor: '#ffffff',
        borderRadius: 15,
        shadowColor: '#000',
        shadowOpacity: 0.1,
        shadowRadius: 10,
        elevation: 5,
    },
    welcomeTitle: {
        fontSize: 26,
        fontWeight: 'bold',
        color: '#2d3436',
        marginBottom: 30,
        textAlign: 'center',
    },
    avatar: {
        width: 120,
        height: 120,
        borderRadius: 60,
        marginBottom: 20,
        borderWidth: 2,
        borderColor: '#0984e3', // Border around avatar
    },
    logoutButton: {
        backgroundColor: '#e74c3c',
        width: '100%',
        height: 50,
        borderRadius: 12,
        alignItems: 'center',
        justifyContent: 'center',
        marginTop: 20,
        elevation: 5,
    },
    profileDetails: {
        alignItems: 'center',
        marginBottom: 20,
    },
    profileText: {
        fontSize: 16,
        color: '#2d3436',
        marginBottom: 8,
        fontWeight: '500',
    },
    profileSectionTitle: {
        fontSize: 20,
        fontWeight: '600',
        color: '#0984e3',
        marginBottom: 15,
    },
    inputEditText: {
        fontSize: 16,
        color: '#636e72',
        fontWeight: '500',
    },
    editProfileButton: {
        backgroundColor: '#0984e3',
        width: '100%',
        height: 45,
        borderRadius: 10,
        justifyContent: 'center',
        alignItems: 'center',
        marginTop: 15,
    },
    editProfileButtonText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: '600',
    },
});
