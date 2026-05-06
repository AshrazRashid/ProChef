import { SafeAreaView } from "react-native-safe-area-context";
import React, { useMemo, useState } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  TouchableOpacity, 
  TextInput, 
  ScrollView,
  Platform,
  KeyboardAvoidingView,
  Alert,
  ActivityIndicator
} from 'react-native';
import { ChevronLeft, Eye, EyeOff, CheckCircle2, Circle } from 'lucide-react-native';
import { Colors } from '../constants/theme';
import { useNavigation } from '@react-navigation/native';
import { apiJson } from '../api/client';

const SPECIAL_RE = /[!@#$%^&*(),.?":{}|<>]/;

function newPasswordValid(pw: string): boolean {
  return pw.length >= 8 && /\d/.test(pw) && SPECIAL_RE.test(pw);
}

export const SecurityScreen = () => {
  const navigation = useNavigation<any>();
  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [saving, setSaving] = useState(false);

  const canSave = useMemo(() => {
    return (
      currentPassword.length > 0 &&
      newPasswordValid(newPassword) &&
      newPassword === confirmPassword
    );
  }, [currentPassword, newPassword, confirmPassword]);

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={{ flex: 1 }}
      >
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity 
            onPress={() => navigation.canGoBack() ? navigation.goBack() : navigation.navigate('Main')} 
            style={styles.backButton}
            hitSlop={{ top: 20, bottom: 20, left: 20, right: 20 }}
          >
            <ChevronLeft color="#426D45" size={28} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Security</Text>
          <View style={{ width: 40 }} />
        </View>
        <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
          <View style={styles.introSection}>
            <Text style={styles.pageTitle}>Change Password</Text>
            <Text style={styles.pageSub}>Update your credentials to stay protected.</Text>
          </View>
          <View style={styles.card}>
            {/* Current Password */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>CURRENT PASSWORD</Text>
              <View style={styles.inputWrapper}>
                <TextInput 
                  style={styles.input}
                  placeholder="........"
                  secureTextEntry={!showCurrent}
                  placeholderTextColor="#CCC"
                  value={currentPassword}
                  onChangeText={setCurrentPassword}
                />
                <TouchableOpacity onPress={() => setShowCurrent(!showCurrent)}>
                  {showCurrent ? <Eye size={20} color="#999" /> : <EyeOff size={20} color="#999" />}
                </TouchableOpacity>
              </View>
              <TouchableOpacity onPress={() => navigation.navigate('ForgotPassword')}>
                <Text style={styles.forgotText}>Forgot Current Password?</Text>
              </TouchableOpacity>
            </View>
            {/* New Password */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>NEW PASSWORD</Text>
              <View style={styles.inputWrapper}>
                <TextInput 
                  style={styles.input}
                  placeholder="Create new password"
                  secureTextEntry={!showNew}
                  placeholderTextColor="#CCC"
                  value={newPassword}
                  onChangeText={setNewPassword}
                />
                <TouchableOpacity onPress={() => setShowNew(!showNew)}>
                  {showNew ? <Eye size={20} color="#999" /> : <EyeOff size={20} color="#999" />}
                </TouchableOpacity>
              </View>
              {/* Strength Meter */}
              <View style={styles.strengthContainer}>
                <View style={[styles.strengthBar, { backgroundColor: newPassword.length > 4 ? '#F28B82' : '#A6382E', flex: 1 }]} />
                <View style={[styles.strengthBar, { backgroundColor: newPassword.length > 8 ? '#81C784' : '#E0E0E0', flex: 1 }]} />
                <View style={[styles.strengthBar, { backgroundColor: newPassword.length > 12 ? '#426D45' : '#E0E0E0', flex: 1.5 }]} />
              </View>
              <Text style={[styles.strengthText, { color: newPassword.length > 8 ? '#426D45' : '#A6382E' }]}>
                {newPassword.length === 0 ? 'Empty' : newPassword.length > 8 ? 'Strong' : 'Weak'}
              </Text>
              {/* Validation List */}
              <View style={styles.validationCard}>
                 <View style={styles.validationItem}>
                    {newPassword.length >= 8 ? <CheckCircle2 size={18} color="#426D45" /> : <Circle size={18} color="#999" />}
                    <Text style={[styles.validationText, newPassword.length >= 8 && { color: Colors.primary }]}>8+ characters</Text>
                 </View>
                 <View style={styles.validationItem}>
                    {/\d/.test(newPassword) ? <CheckCircle2 size={18} color="#426D45" /> : <Circle size={18} color="#999" />}
                    <Text style={[styles.validationText, /\d/.test(newPassword) && { color: Colors.primary }]}>1 number</Text>
                 </View>
                 <View style={styles.validationItem}>
                    {SPECIAL_RE.test(newPassword) ? <CheckCircle2 size={18} color="#426D45" /> : <Circle size={18} color="#999" />}
                    <Text style={[styles.validationText, SPECIAL_RE.test(newPassword) && { color: Colors.primary }]}>1 special character</Text>
                 </View>
              </View>
            </View>
            {/* Confirm Password */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>CONFIRM NEW PASSWORD</Text>
              <View style={styles.inputWrapper}>
                <TextInput 
                  style={styles.input}
                  placeholder="Repeat new password"
                  secureTextEntry={!showConfirm}
                  placeholderTextColor="#CCC"
                  value={confirmPassword}
                  onChangeText={setConfirmPassword}
                />
                <TouchableOpacity onPress={() => setShowConfirm(!showConfirm)}>
                  {showConfirm ? <Eye size={20} color="#999" /> : <EyeOff size={20} color="#999" />}
                </TouchableOpacity>
              </View>
              <View style={styles.matchRow}>
                 {newPassword !== '' && confirmPassword !== '' && (
                   <Text style={[styles.matchText, newPassword === confirmPassword ? {color: Colors.primary} : {color: '#E57373'}]}>
                     {newPassword === confirmPassword ? '🔄 Passwords match' : '❌ Passwords do not match'}
                   </Text>
                 )}
              </View>
            </View>
          </View>
          <TouchableOpacity 
            style={[styles.saveButton, (!canSave || saving) && { opacity: 0.5 }]}
            disabled={!canSave || saving}
            onPress={async () => {
              if (!canSave || saving) {
                return;
              }
              setSaving(true);
              try {
                await apiJson<{ message?: string }>("/me/change-password", {
                  method: "POST",
                  body: JSON.stringify({
                    currentPassword,
                    newPassword
                  })
                });
                Alert.alert("Success", "Your password has been updated.", [
                  {
                    text: "OK",
                    onPress: () =>
                      navigation.canGoBack() ? navigation.goBack() : navigation.navigate("Main")
                  }
                ]);
              } catch (e: unknown) {
                const msg =
                  e && typeof e === "object" && "message" in e ? String((e as { message: string }).message) : "Could not update password";
                Alert.alert("Change password", msg);
              } finally {
                setSaving(false);
              }
            }}
          >
            {saving ? (
              <ActivityIndicator color="#FFF" />
            ) : (
              <Text style={styles.saveButtonText}>Save</Text>
            )}
          </TouchableOpacity>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};
const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F0F2F5' },
  header: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    justifyContent: 'space-between', 
    paddingHorizontal: 16, 
    paddingVertical: 12,
    backgroundColor: '#FFF'
  },
  backButton: { width: 40, height: 40, justifyContent: 'center' },
  headerTitle: { color: '#0D0D0D', fontSize: 18, fontFamily: 'Inter-Bold' },
  scrollContent: { paddingBottom: 40 },
  introSection: { paddingHorizontal: 24, marginVertical: 24 },
  pageTitle: { fontSize: 24, color: '#1A1A1A', fontFamily: 'Inter-Bold' },
  pageSub: { fontSize: 14, color: '#666', fontFamily: 'Inter-Regular', marginTop: 8 },
  card: { 
    backgroundColor: '#FFF', 
    marginHorizontal: 20, 
    borderRadius: 32, 
    padding: 24,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 2
  },
  inputGroup: { marginBottom: 24 },
  label: { fontSize: 10, color: '#999', fontFamily: 'Inter-Bold', marginBottom: 12, letterSpacing: 0.5 },
  inputWrapper: {
    backgroundColor: '#F5F7F9',
    height: 52,
    borderRadius: 20,
    paddingHorizontal: 20,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between'
  },
  input: { flex: 1, color: '#333', fontFamily: 'Inter-Medium', fontSize: 14 },
  forgotText: { color: '#426D45', fontSize: 12, fontFamily: 'Inter-Bold', textAlign: 'right', marginTop: 12 },
  strengthContainer: { flexDirection: 'row', height: 4, marginTop: 16, gap: 4 },
  strengthBar: { borderRadius: 2 },
  strengthText: { fontSize: 10, color: '#A6382E', fontFamily: 'Inter-Bold', marginTop: 8 },
  validationCard: { backgroundColor: '#F8FAF8', borderRadius: 20, padding: 16, marginTop: 16 },
  validationItem: { flexDirection: 'row', alignItems: 'center', marginBottom: 8 },
  validationText: { fontSize: 12, color: '#999', fontFamily: 'Inter-Medium', marginLeft: 12 },
  matchRow: { marginTop: 12 },
  matchText: { fontSize: 10, color: '#999', fontFamily: 'Inter-Medium' },
  saveButton: { 
    backgroundColor: '#426D45', 
    height: 56, 
    borderRadius: 20, 
    marginHorizontal: 20, 
    marginTop: 32,
    justifyContent: 'center', 
    alignItems: 'center' 
  },
  saveButtonText: { color: '#FFF', fontSize: 16, fontFamily: 'Inter-Bold' },
});
