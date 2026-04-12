import { SafeAreaView } from "react-native-safe-area-context";
import React, { useState, useRef, useEffect } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  TouchableOpacity, 
  Dimensions
} from 'react-native';
import { ChevronLeft, Delete } from 'lucide-react-native';
import OTPTextInput from 'react-native-otp-textinput';
import { Colors } from '../constants/theme';
const { width } = Dimensions.get('window');

export const VerificationScreen = ({ navigation }: any) => {
  const [code, setCode] = useState('');
  const otpInput = useRef<any>(null);
  // Robust navigation logic using useEffect
  useEffect(() => {
    if (code.length === 4) {
      const timer = setTimeout(() => {
        navigation.navigate('GoalSetup');
      }, 400); 
    
  return () => clearTimeout(timer);
    }
  }, [code, navigation]);
  const handlePress = (num: string) => {
    if (code.length < 4) {
      const newCode = code + num;
      setCode(newCode);
      otpInput.current?.setValue(newCode);
    }
  };
  const handleDelete = () => {
    const newCode = code.slice(0, -1);
    setCode(newCode);
    otpInput.current?.setValue(newCode);
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Header with Back Button */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <ChevronLeft color={Colors.white} size={28} />
        </TouchableOpacity>
      </View>
      <View style={styles.content}>
        {/* Title & Subtitle */}
        <Text style={styles.title}>Email Verification</Text>
        <Text style={styles.subtitle}>
          We sent a code to your email {'\n'}
          <Text style={styles.emailText}>test@gmail.com</Text> <Text style={styles.changeLink}>Change</Text>
        </Text>
        {/* Branded OTP Input Library */}
        <View style={styles.otpWrapper}>
          <OTPTextInput
            ref={otpInput}
            handleTextChange={(text) => setCode(text)}
            inputCount={4}
            tintColor={Colors.secondary}
            offTintColor="#333"
            containerStyle={styles.otpContainer}
            textInputStyle={styles.otpInput}
            keyboardType="numeric"
          />
        </View>
        <Text style={styles.resendText}>
          Don't receive your code? <Text style={styles.resendLink}>Resend</Text>
        </Text>
      </View>
      {/* Numeric Keypad */}
      <View style={styles.keypad}>
        {[
          ['1', '2', '3'],
          ['4', '5', '6'],
          ['7', '8', '9'],
          ['', '0', 'delete']
        ].map((row, rowIndex) => (
          <View key={rowIndex} style={styles.keypadRow}>
            {row.map((key, colIndex) => (
              <TouchableOpacity 
                key={colIndex} 
                style={styles.key}
                onPress={() => key === 'delete' ? handleDelete() : key !== '' && handlePress(key)}
              >
                {key === 'delete' ? (
                  <Delete color={Colors.white} size={24} />
                ) : (
                  <Text style={styles.keyText}>{key}</Text>
                )}
                {key === '2' && <Text style={styles.keySubText}>ABC</Text>}
                {key === '3' && <Text style={styles.keySubText}>DEF</Text>}
                {key === '4' && <Text style={styles.keySubText}>GHI</Text>}
                {key === '5' && <Text style={styles.keySubText}>JKL</Text>}
                {key === '6' && <Text style={styles.keySubText}>MNO</Text>}
                {key === '7' && <Text style={styles.keySubText}>PQRS</Text>}
                {key === '8' && <Text style={styles.keySubText}>TUV</Text>}
                {key === '9' && <Text style={styles.keySubText}>WXYZ</Text>}
              </TouchableOpacity>
            ))}
          </View>
        ))}
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
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingTop: 40,
  },
  title: {
    color: Colors.white,
    fontSize: 28,
    fontFamily: 'Inter-Bold',
    marginBottom: 16,
  },
  subtitle: {
    color: Colors.textSecondary,
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: 40,
  },
  emailText: {
    color: Colors.white,
    fontFamily: 'Inter-Medium',
  },
  changeLink: {
    color: Colors.secondary,
    fontFamily: 'Inter-SemiBold',
  },
  otpWrapper: {
    marginBottom: 40,
    width: '100%',
    alignItems: 'center',
  },
  otpContainer: {
    marginBottom: 20,
  },
  otpInput: {
    width: 64,
    height: 72,
    borderWidth: 1,
    borderBottomWidth: 1,
    borderRadius: 32,
    backgroundColor: '#1A1A1A',
    color: Colors.white,
    fontSize: 24,
    fontFamily: 'Inter-Bold',
  },
  resendText: {
    color: Colors.textSecondary,
    fontSize: 14,
    fontFamily: 'Inter-Regular',
  },
  resendLink: {
    color: Colors.secondary,
    fontFamily: 'Inter-SemiBold',
  },
  keypad: {
    position: 'absolute',
    bottom: 20,
    left: 0,
    right: 0,
    paddingHorizontal: 10,
  },
  keypadRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginBottom: 10,
  },
  key: {
    width: (width - 60) / 3,
    height: 56,
    backgroundColor: '#1A1A1A',
    borderRadius: 4,
    marginHorizontal: 5,
    justifyContent: 'center',
    alignItems: 'center',
  },
  keyText: {
    color: Colors.white,
    fontSize: 20,
    fontFamily: 'Inter-Medium',
  },
  keySubText: {
    color: Colors.textSecondary,
    fontSize: 10,
    fontFamily: 'Inter-Regular',
    position: 'absolute',
    bottom: 8,
  },
});
