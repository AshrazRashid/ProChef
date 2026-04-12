import { SafeAreaView } from "react-native-safe-area-context";
import React, { useState } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  TouchableOpacity, 
  TextInput, 
  Image,
  ScrollView,
  Dimensions
} from 'react-native';
import { ChevronLeft, Edit2 } from 'lucide-react-native';
import { Colors } from '../constants/theme';
import { useNavigation } from '@react-navigation/native';
const { width } = Dimensions.get('window');

export const EditProfileScreen = () => {
  const navigation = useNavigation();
  const [name, setName] = useState('Elena Vance');
  const [email, setEmail] = useState('elena.vance@example.com');
  const [phone, setPhone] = useState('+1 (555) 000-0000');

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity 
          onPress={() => navigation.goBack()} 
          style={styles.backButton}
          hitSlop={{ top: 20, bottom: 20, left: 20, right: 20 }}
        >
          <ChevronLeft color="#426D45" size={28} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Edit Profile</Text>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Text style={styles.saveText}>Save</Text>
        </TouchableOpacity>
      </View>
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* Avatar Section */}
        <View style={styles.avatarContainer}>
          <View style={styles.avatarWrapper}>
            <Image source={require('../assets/images/avatar.png')} style={styles.avatar} />
            <TouchableOpacity style={styles.editIconBadge}>
              <Edit2 size={12} color="#FFF" />
            </TouchableOpacity>
          </View>
        </View>
        {/* Form Card */}
        <View style={styles.card}>
          <Text style={styles.sectionTitle}>Personal Information</Text>
          <View style={styles.inputGroup}>
            <Text style={styles.label}>FULL NAME</Text>
            <TextInput 
              style={styles.input}
              value={name}
              onChangeText={setName}
              placeholder="Enter your name"
            />
          </View>
          <View style={styles.inputGroup}>
            <Text style={styles.label}>EMAIL ADDRESS</Text>
            <TextInput 
              style={styles.input}
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              placeholder="Enter your email"
            />
          </View>
          <View style={styles.inputGroup}>
            <Text style={styles.label}>PHONE NUMBER</Text>
            <TextInput 
              style={styles.input}
              value={phone}
              onChangeText={setPhone}
              keyboardType="phone-pad"
              placeholder="Enter your phone number"
            />
          </View>
        </View>
      </ScrollView>
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
  saveText: { color: '#426D45', fontSize: 16, fontFamily: 'Inter-Bold' },
  scrollContent: { paddingBottom: 40 },
  avatarContainer: { alignItems: 'center', marginVertical: 32 },
  avatarWrapper: { position: 'relative' },
  avatar: { width: 100, height: 100, borderRadius: 50, borderWidth: 4, borderColor: '#FFF' },
  editIconBadge: { 
    position: 'absolute', 
    right: 0, 
    bottom: 5, 
    backgroundColor: '#426D45', 
    width: 26, 
    height: 26, 
    borderRadius: 13, 
    justifyContent: 'center', 
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#FFF'
  },
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
  sectionTitle: { fontSize: 18, color: '#1A1A1A', fontFamily: 'Inter-Bold', marginBottom: 24 },
  inputGroup: { marginBottom: 20 },
  label: { fontSize: 10, color: '#999', fontFamily: 'Inter-Bold', marginBottom: 8, letterSpacing: 0.5 },
  input: { 
    backgroundColor: '#F5F7F9', 
    height: 52, 
    borderRadius: 20, 
    paddingHorizontal: 20, 
    color: '#333',
    fontFamily: 'Inter-Medium',
    fontSize: 14
  },
});
