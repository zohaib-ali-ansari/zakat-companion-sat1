import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ScrollView } from 'react-native';

export default function AuthScreens({ onLoginSuccess }) {
  const [step, setStep] = useState('login'); // 'login', 'signup', 'forgot', 'otp'

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>Alkhidmat Foundation</Text>
      <Text style={styles.subtitle}>IT Department - Internship Project</Text>

      {step === 'login' && (
        <View style={styles.form}>
          <TextInput style={styles.input} placeholder="Email ya Phone Number" keyboardType="email-address" />
          <TextInput style={styles.input} placeholder="Password" secureTextEntry />
          <TouchableOpacity style={styles.button} onPress={() => setStep('otp')}>
            <Text style={styles.buttonText}>Login</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={() => setStep('forgot')}>
            <Text style={styles.linkText}>Forgot Password?</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={() => setStep('signup')}>
            <Text style={styles.linkText}>Naya account banayen? Signup</Text>
          </TouchableOpacity>
        </View>
      )}

      {step === 'signup' && (
        <View style={styles.form}>
           <TextInput style={styles.input} placeholder="Full Name" />
           <TextInput style={styles.input} placeholder="Email Address" keyboardType="email-address" />
           <TextInput style={styles.input} placeholder="Password" secureTextEntry />
           <TouchableOpacity style={styles.button} onPress={() => setStep('otp')}>
            <Text style={styles.buttonText}>Register Account</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={() => setStep('login')}>
            <Text style={styles.linkText}>Pehle se account hai? Login karein</Text>
          </TouchableOpacity>
        </View>
      )}

      {step === 'forgot' && (
        <View style={styles.form}>
          <Text style={styles.instructionText}>Apna email darj karein, hum reset link bhejenge.</Text>
          <TextInput style={styles.input} placeholder="Email Address" keyboardType="email-address" />
          <TouchableOpacity style={styles.button} onPress={() => setStep('login')}>
            <Text style={styles.buttonText}>Send Reset Link</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={() => setStep('login')}>
            <Text style={styles.linkText}>Wapas Login par jayen</Text>
          </TouchableOpacity>
        </View>
      )}

      {step === 'otp' && (
        <View style={styles.form}>
          <Text style={styles.instructionText}>4-digit OTP code enter karein (Misaal: 1234)</Text>
          <TextInput 
            style={[styles.input, {fontSize: 20, letterSpacing: 5, textAlign: 'center'}]} 
            placeholder="1234" 
            maxLength={4} 
            keyboardType="numeric" 
          />
          <TouchableOpacity style={styles.buttonSuccess} onPress={onLoginSuccess}>
            <Text style={styles.buttonText}>Verify & Continue</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={() => setStep('login')}>
            <Text style={styles.linkText}>Wapas jayen</Text>
          </TouchableOpacity>
        </View>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flexGrow: 1, padding: 20, justifyContent: 'center', backgroundColor: '#fff' },
  title: { fontSize: 26, fontWeight: 'bold', textAlign: 'center', color: '#005b9f' },
  subtitle: { fontSize: 14, marginBottom: 30, textAlign: 'center', color: '#666' },
  form: { width: '100%' },
  input: { borderWidth: 1, borderColor: '#ccc', padding: 12, borderRadius: 8, marginBottom: 15, backgroundColor: '#f9f9f9' },
  instructionText: { fontSize: 14, marginBottom: 15, textAlign: 'center', color: '#333' },
  button: { backgroundColor: '#005b9f', padding: 15, borderRadius: 8, alignItems: 'center', marginBottom: 10 },
  buttonSuccess: { backgroundColor: '#28a745', padding: 15, borderRadius: 8, alignItems: 'center', marginBottom: 10 },
  buttonText: { color: '#fff', fontWeight: 'bold', fontSize: 16 },
  linkText: { color: '#005b9f', textAlign: 'center', marginTop: 10, fontSize: 14 }
});