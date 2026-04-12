import { SafeAreaView } from "react-native-safe-area-context";
import React, { useState } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  TextInput, 
  TouchableOpacity, 
  Image,
  Dimensions
} from 'react-native';
import { Colors } from '../constants/theme';
const { width } = Dimensions.get('window');

export const SignInScreen = ({ navigation }: any) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        {/* Branded Logo Box */}
        <View style={styles.logoBox}>
          <Image 
            source={require('../assets/icons/app-logo.png')}
            style={styles.logo}
            resizeMode="contain"
          />
        </View>
        <Text style={styles.title}>Sign In</Text>
        {/* Input Fields */}
        <View style={styles.inputContainer}>
          <TextInput
            style={styles.input}
            placeholder="Phone / Email"
            placeholderTextColor={Colors.textSecondary}
            value={email}
            onChangeText={setEmail}
          />
          <TextInput
            style={styles.input}
            placeholder="Password"
            placeholderTextColor={Colors.textSecondary}
            value={password}
            onChangeText={setPassword}
            secureTextEntry
          />
        </View>
        {/* Continue Button */}
        <TouchableOpacity 
          style={styles.primaryButton}
          onPress={() => navigation.navigate('Verification')}
        >
          <Text style={styles.primaryButtonText}>Continue</Text>
        </TouchableOpacity>
        {/* Forgot Password */}
        <TouchableOpacity 
          onPress={() => navigation.navigate('ForgotPassword')}
        >
          <Text style={styles.forgotText}>Forgot Password?</Text>
        </TouchableOpacity>
        {/* Footer */}
        <TouchableOpacity 
          style={styles.footer}
          onPress={() => navigation.navigate('SignUp')}
        >
          <Text style={styles.footerText}>
            Don't have an account? <Text style={styles.footerLink}>Sign Up</Text>
          </Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  content: {
    flex: 1,
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingTop: 60,
  },
  logoBox: {
    width: 120,
    height: 120,
    backgroundColor: '#1A1A1A',
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 40,
    borderWidth: 1,
    borderColor: '#333',
  },
  logo: {
    width: 80,
    height: 40,
  },
  title: {
    color: Colors.white,
    fontSize: 32,
    fontFamily: 'Inter-Bold',
    marginBottom: 32,
  },
  inputContainer: {
    width: '100%',
    marginBottom: 20,
  },
  input: {
    backgroundColor: '#1A1A1A',
    height: 60,
    borderRadius: 16,
    paddingHorizontal: 20,
    color: Colors.white,
    fontSize: 16,
    fontFamily: 'Inter-Regular',
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#333',
  },
  primaryButton: {
    backgroundColor: Colors.primary,
    width: '100%',
    height: 56,
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
  },
  primaryButtonText: {
    color: Colors.white,
    fontSize: 18,
    fontFamily: 'Inter-SemiBold',
  },
  forgotText: {
    color: Colors.textSecondary,
    fontSize: 14,
    fontFamily: 'Inter-Regular',
  },
  footer: {
    position: 'absolute',
    bottom: 40,
  },
  footerText: {
    color: Colors.textSecondary,
    fontSize: 14,
    fontFamily: 'Inter-Regular',
  },
  footerLink: {
    color: Colors.secondary,
    fontFamily: 'Inter-SemiBold',
  },
});
