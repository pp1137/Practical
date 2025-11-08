import React, { useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import { GoogleSignin, User } from '@react-native-google-signin/google-signin';
import { StackNavigationProp } from '@react-navigation/stack';
import { useAuth } from '../context/AuthContext';


type Props = { navigation: StackNavigationProp<any> };

export default function GoogleOAuthScreen({ navigation }: Props) {

      const { login } = useAuth();
    
  useEffect(() => {
    GoogleSignin.configure({
      webClientId: '899346437941-vf04h85485r7v7hen4b208rot6u37dfq.apps.googleusercontent.com',
      offlineAccess: true,
    });
  }, []);

  const handleGoogleLogin = async () => {
  try {
    await GoogleSignin.hasPlayServices();
    const response = await GoogleSignin.signIn();

    console.log('Google response:', response);
    if (response.type === 'success' || response.data) {
      const { user } = response.data;
      const tokens = await GoogleSignin.getTokens();

      console.log('Google user:', user);
      console.log('Google tokens:', tokens);

      // store in AuthContext
      await login(user, tokens.idToken);

      // move to Home
      navigation.replace('Home');
    } else {
      Alert.alert('Login failed', 'Google login did not return user info');
    }
  } catch (error: any) {
    console.error('Google Sign-In Error:', error);
    Alert.alert('Error', error.message || 'Google Sign-In failed');
  }
};

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Google Sign-In</Text>

      <TouchableOpacity onPress={handleGoogleLogin} style={styles.button}>
        <Text style={styles.buttonText}>Sign in with Google</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#fff' },
  title: { fontSize: 24, marginBottom: 30, fontWeight: 'bold' },
  button: {
    backgroundColor: '#DB4437',
    paddingVertical: 15,
    paddingHorizontal: 30,
    borderRadius: 8,
  },
  buttonText: { color: '#fff', fontSize: 16, fontWeight: '600' },
});
