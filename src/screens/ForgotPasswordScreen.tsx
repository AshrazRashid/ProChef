import { SafeAreaView } from "react-native-safe-area-context";
import React, { useState } from 'react'; // Refreshing file for bundler
import { 
  View, 
  Text, 
  StyleSheet, 
  TextInput, 
  TouchableOpacity, 
  Image,
  Dimensions
} from 'react-native';
import { ChevronLeft } from 'lucide-react-native';
import { Colors } from '../constants/theme';
const { width } = Dimensions.get('window');

export const ForgotPasswordScreen = ({ navigation }: any) => {
  const [email, setEmail] = useState('');

  return (
    <SafeAreaView style={styles.container}>
      {/* Header with Back Button */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <ChevronLeft color={Colors.white} size={28} />
        </TouchableOpacity>
      </View>
      <View style={styles.content}>
        {/* Branded Logo Box */}
        <View style={styles.logoBox}>
          <Image 
            source={require('../assets/icons/app-logo.png')}
            style={styles.logo}
            resizeMode="contain"
          />
        </View>
        <Text style={styles.title}>Forgot Password?</Text>
        <Text style={styles.subtitle}>
          Enter your email address to receive a {'\n'}verification code.
        </Text>
        {/* Input Field */}
        <View style={styles.inputContainer}>
          <TextInput
            style={styles.input}
            placeholder="Email Address"
            placeholderTextColor={Colors.textSecondary}
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
            autoCapitalize="none"
          />
        </View>
        {/* Continue Button */}
        <TouchableOpacity 
          style={styles.primaryButton}
          onPress={() => navigation.navigate('Verification')}
        >
          <Text style={styles.primaryButtonText}>Continue</Text>
        </TouchableOpacity>
        {/* Footer */}
        <TouchableOpacity 
          style={styles.footer}
          onPress={() => navigation.navigate('SignIn')}
        >
          <Text style={styles.footerText}>
            Remember password? <Text style={styles.footerLink}>Sign In</Text>
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
  header: {
    paddingHorizontal: 20,
    paddingTop: 10,
  },
  backButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  content: {
    flex: 1,
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingTop: 20,
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
    fontSize: 28,
    fontFamily: 'Inter-Bold',
    marginBottom: 12,
  },
  subtitle: {
    color: Colors.textSecondary,
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: 40,
  },
  inputContainer: {
    width: '100%',
    marginBottom: 24,
  },
  input: {
    backgroundColor: '#1A1A1A',
    height: 56,
    borderRadius: 16,
    paddingHorizontal: 20,
    color: Colors.white,
    fontSize: 16,
    fontFamily: 'Inter-Regular',
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
    marginBottom: 24,
  },
  primaryButtonText: {
    color: Colors.white,
    fontSize: 18,
    fontFamily: 'Inter-SemiBold',
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
