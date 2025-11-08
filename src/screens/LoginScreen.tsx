import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import { z } from 'zod';
// import { loginSchema } from '../utils/zodSchemas';
import { sendOtp } from '../api/mockApi';
import { StackNavigationProp } from '@react-navigation/stack';

type Props = { navigation: StackNavigationProp<any> };

export default function LoginScreen({ navigation }: Props) {
  const [identifier, setIdentifier] = useState('');
  const [loading, setLoading] = useState(false);


  const validateIdentifier = (value: string): string | null => {
  if (!value.trim()) return 'Email or phone is required';

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  const phoneRegex = /^\+?\d{7,15}$/;

  if (!emailRegex.test(value) && !phoneRegex.test(value)) {
    return 'Enter a valid email or phone number';
  }

  return null;
};


  const handleSendOtp = async () => {
    const error = validateIdentifier(identifier);
  if (error) {
    Alert.alert('Validation', error);
    return;
  }
    try {
      setLoading(true);
      await sendOtp(identifier);
      navigation.navigate('Otp', { identifier });
    } catch (e: any) {
      Alert.alert('Error', e.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Login with Email/Phone</Text>
      <TextInput
        style={styles.input}
        placeholder="Email or Phone"
        value={identifier}
        onChangeText={setIdentifier}
      />
      <TouchableOpacity onPress={handleSendOtp} style={styles.button} disabled={loading}>
        <Text style={styles.buttonText}>{loading ? 'Sending...' : 'Send OTP'}</Text>
      </TouchableOpacity>

      <TouchableOpacity
        onPress={() => navigation.navigate('GoogleOAuth')}
        style={[styles.button, { backgroundColor: '#DB4437' }]}
      >
        <Text style={styles.buttonText}>Continue with Google</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', padding: 20 },
  title: { fontSize: 22, fontWeight: 'bold', marginBottom: 20, textAlign: 'center' },
  input: { borderWidth: 1, borderRadius: 8, padding: 10, marginBottom: 20 },
  button: { backgroundColor: '#007bff', padding: 15, borderRadius: 8, marginBottom: 10 },
  buttonText: { color: 'white', textAlign: 'center', fontWeight: '600' },
});
