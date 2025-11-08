import { ToastAndroid } from "react-native";

const otpStorage: Record<
  string,
  { otp: string; expiresAt: number; attempts: number; lastSent: number }
> = {};

export const sendOtp = async (identifier: string) => {
  const now = Date.now();

  
  const data = otpStorage[identifier];
  if (data && now - data.lastSent < 60000 && data.attempts >= 3) {
    throw new Error('Too many OTP requests. Try again later.');
  }

  const otp = Math.floor(100000 + Math.random() * 900000).toString();
  otpStorage[identifier] = {
    otp,
    expiresAt: now + 1 * 60 * 1000, 
    attempts: data ? data.attempts + 1 : 1,
    lastSent: now,
  };

  console.log('Mock OTP sent:', otp);
  ToastAndroid.show(`OTP sent: ${otp}`, ToastAndroid.LONG);

  return { success: true };
};

export const verifyOtp = async (identifier: string, otp: string) => {
  const data = otpStorage[identifier];

  if (!data) throw new Error('No OTP found. Please request again.');

  if (Date.now() > data.expiresAt) {
    delete otpStorage[identifier];
    throw new Error('OTP expired. Please request a new one.');
  }

  if (data.otp !== otp) throw new Error('Invalid OTP. Please try again.');

  delete otpStorage[identifier];
  return {
    token: 'mock_token_123',
    user: { id: 1, name: 'Demo User', email: identifier },
  };
};
