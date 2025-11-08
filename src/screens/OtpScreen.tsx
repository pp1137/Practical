import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Alert,
  Platform,
  PermissionsAndroid,
  ToastAndroid,
} from 'react-native';
import SmsRetriever from 'react-native-sms-retriever';
import { verifyOtp, sendOtp } from '../api/mockApi';
import { useAuth } from '../context/AuthContext';
import { OtpInput } from 'react-native-otp-entry';

export default function OtpScreen({ route, navigation }: any) {
  const { identifier } = route.params;
  const [otp, setOtp] = useState('');
  const [timer, setTimer] = useState(60);
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();

 
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (timer > 0) {
      interval = setInterval(() => setTimer((t) => t - 1), 1000);
    }
    return () => clearInterval(interval);
  }, [timer]);

 
  useEffect(() => {
    if (Platform.OS === 'android') {
      requestSmsPermission();
      startSmsListener();
    }
  }, []);

  const requestSmsPermission = async () => {
    try {
      const granted = await PermissionsAndroid.request(
        PermissionsAndroid.PERMISSIONS.RECEIVE_SMS,
        {
          title: 'SMS Permission',
          message: 'App needs access to read OTP automatically',
          buttonNeutral: 'Ask Me Later',
          buttonNegative: 'Cancel',
          buttonPositive: 'OK',
        }
      );
      if (granted !== PermissionsAndroid.RESULTS.GRANTED) {
        console.log('SMS permission denied');
      }
    } catch (err) {
      console.error('Permission error:', err);
    }
  };

  
  const startSmsListener = async () => {
    try {
      const registered = await SmsRetriever.startSmsRetriever();
      if (registered) {
        SmsRetriever.addSmsListener((event) => {
          console.log('Incoming SMS:', event.message);
          const otpMatch = event.message.match(/\b\d{6}\b/);
          if (otpMatch) {
            const code = otpMatch[0];
            setOtp(code);
            ToastAndroid.show(`OTP received: ${code}`, ToastAndroid.LONG);
            SmsRetriever.removeSmsListener();
          }
        });
      }
    } catch (error) {
      console.error('SMS Retriever Error:', error);
    }
  };

  const handleVerify = async () => {
    if (otp.length !== 6) return Alert.alert('Validation', 'Enter a valid 6-digit OTP');
    setLoading(true);
    try {
      const { token, user } = await verifyOtp(identifier, otp);
      await login(user, token);
      ToastAndroid.show('Login Successful', ToastAndroid.SHORT);
      navigation.replace('Home');
    } catch (e: any) {
      Alert.alert('Error', e.message);
    } finally {
      setLoading(false);
    }
  };

 
  const handleResend = async () => {
    try {
      setTimer(60);
      await sendOtp(identifier);
      ToastAndroid.show('New OTP sent', ToastAndroid.SHORT);
    } catch (err: any) {
      Alert.alert('Error', err.message);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Enter OTP</Text>
      <Text style={styles.subtitle}>Sent to {identifier}</Text>

    
      <OtpInput
        numberOfDigits={6}
        onTextChange={setOtp}
        focusColor="#007bff"
        autoFocus
        textInputProps={{
          keyboardType: 'numeric',
        }}
      />

      <TouchableOpacity
        style={[styles.button, loading && { opacity: 0.6 }]}
        onPress={handleVerify}
        disabled={loading}
      >
        <Text style={styles.buttonText}>{loading ? 'Verifying...' : 'Verify'}</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={[styles.resendButton, timer > 0 && { opacity: 0.5 }]}
        disabled={timer > 0}
        onPress={handleResend}
      >
        <Text style={styles.resendText}>
          {timer > 0 ? `Resend OTP in ${timer}s` : 'Resend OTP'}
        </Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', padding: 20 },
  title: { fontSize: 22, textAlign: 'center', marginBottom: 10, fontWeight: 'bold' },
  subtitle: { textAlign: 'center', color: '#555', marginBottom: 20 },
  button: {
    backgroundColor: '#28a745',
    padding: 15,
    borderRadius: 8,
    marginTop: 20,
  },
  buttonText: { color: 'white', textAlign: 'center', fontWeight: '600' },
  resendButton: { marginTop: 15 },
  resendText: { textAlign: 'center', color: '#007bff', fontWeight: '500' },
});
