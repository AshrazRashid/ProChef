import { SafeAreaView } from "react-native-safe-area-context";
import React, { useState } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  TextInput, 
  TouchableOpacity, 
  Image,
  Dimensions,
  ActivityIndicator,
  Alert
} from 'react-native';
import { CommonActions } from '@react-navigation/native';
import { Eye, EyeOff } from 'lucide-react-native';
import { Colors } from '../constants/theme';
import { useAuth } from '../context/AuthContext';
const { width } = Dimensions.get('window');

export const SignInScreen = ({ navigation }: any) => {
  const { signIn } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [busy, setBusy] = useState(false);

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
            placeholder="Email"
            placeholderTextColor={Colors.textSecondary}
            autoCapitalize="none"
            keyboardType="email-address"
            value={email}
            onChangeText={setEmail}
          />
          <View style={styles.passwordInputWrap}>
            <TextInput
              style={[styles.input, styles.passwordInput]}
              placeholder="Password"
              placeholderTextColor={Colors.textSecondary}
              value={password}
              onChangeText={setPassword}
              secureTextEntry={!showPassword}
            />
            <TouchableOpacity
              onPress={() => setShowPassword((prev) => !prev)}
              style={styles.eyeButton}
              hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
            >
              {showPassword ? (
                <EyeOff color={Colors.textSecondary} size={20} />
              ) : (
                <Eye color={Colors.textSecondary} size={20} />
              )}
            </TouchableOpacity>
          </View>
        </View>
        {/* Continue Button */}
        <TouchableOpacity 
          style={styles.primaryButton}
          disabled={busy}
          onPress={async () => {
            setBusy(true);
            try {
              await signIn(email.trim().toLowerCase(), password);
              queueMicrotask(() => {
                navigation.dispatch(
                  CommonActions.reset({
                    index: 0,
                    routes: [{ name: "Main" }]
                  })
                );
              });
            } catch (e: unknown) {
              const msg = e instanceof Error ? e.message : "Sign in failed";
              Alert.alert("Sign in", msg);
            } finally {
              setBusy(false);
            }
          }}
        >
          {busy ? <ActivityIndicator color={Colors.white} /> : <Text style={styles.primaryButtonText}>Continue</Text>}
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
  passwordInputWrap: {
    position: 'relative',
  },
  passwordInput: {
    paddingRight: 52,
    marginBottom: 0,
  },
  eyeButton: {
    position: 'absolute',
    right: 16,
    top: 0,
    height: 60,
    justifyContent: 'center',
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
