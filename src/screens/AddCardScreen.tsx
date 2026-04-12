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
import { ChevronLeft, CreditCard, User, Calendar, Lock, Info, Check } from 'lucide-react-native';
import { Colors } from '../constants/theme';
const { width } = Dimensions.get('window');

export const AddCardScreen = ({ navigation }: any) => {
  const [saveInfo, setSaveInfo] = useState(true);

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <ChevronLeft color={Colors.primary} size={28} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Your New Card</Text>
      </View>
      <View style={styles.content}>
        {/* Visual Card Card */}
        <View style={styles.cardVisual}>
           <View style={styles.cardVisualHeader}>
              <Text style={styles.masterCardText}>Master Card</Text>
              <CreditCard color={Colors.white} size={24} />
           </View>
           <Text style={styles.cardVisualNumber}>2332  7352  3324  6522</Text>
           <View style={styles.cardVisualFooter}>
              <View>
                 <Text style={styles.labelSmall}>CARD HOLDER</Text>
                 <Text style={styles.holderNameVisual}>HIKMET ATCEKEN</Text>
              </View>
              <View>
                 <Text style={styles.labelSmall}>EXPIRY</Text>
                 <Text style={styles.expiryVisual}>07/23</Text>
              </View>
              <Image source={require('../assets/images/visa.png')} style={styles.visaIconSmall} />
           </View>
        </View>
        {/* Input Form */}
        <View style={styles.form}>
           <Text style={styles.fieldLabel}>CARD NUMBER</Text>
           <View style={styles.inputContainer}>
              <CreditCard color="#999" size={20} />
              <TextInput 
                style={styles.input}
                placeholder="**** **** **** 6522"
                placeholderTextColor="#333"
                keyboardType="numeric"
              />
              <Image source={require('../assets/images/visa.png')} style={styles.visaIconInput} />
           </View>
           <Text style={styles.fieldLabel}>CARDHOLDER NAME</Text>
           <View style={styles.inputContainer}>
              <User color="#999" size={20} />
              <TextInput 
                style={styles.input}
                placeholder="Hikmet Atceken"
                placeholderTextColor="#333"
              />
           </View>
           <View style={styles.row}>
              <View style={styles.halfField}>
                 <Text style={styles.fieldLabel}>EXPIRY DATE</Text>
                 <View style={styles.inputContainer}>
                    <Calendar color="#999" size={20} />
                    <TextInput 
                      style={styles.input}
                      placeholder="07/23"
                      placeholderTextColor="#333"
                    />
                 </View>
              </View>
              <View style={styles.halfField}>
                 <Text style={styles.fieldLabel}>CVV</Text>
                 <View style={styles.inputContainer}>
                    <Lock color="#999" size={20} />
                    <TextInput 
                      style={styles.input}
                      placeholder="***"
                      placeholderTextColor="#333"
                      secureTextEntry
                    />
                    <Info color="#999" size={16} />
                 </View>
              </View>
           </View>
           {/* Checkbox */}
           <TouchableOpacity 
             style={styles.checkboxRow}
             onPress={() => setSaveInfo(!saveInfo)}
           >
              <View style={[styles.checkbox, saveInfo && styles.checkboxActive]}>
                 {saveInfo && <Check color={Colors.white} size={14} />}
              </View>
              <Text style={styles.checkboxText}>Save your card information. It's confidential.</Text>
           </TouchableOpacity>
        </View>
        {/* Confirm Button */}
        <TouchableOpacity 
          style={styles.confirmButton}
          onPress={() => navigation.navigate('Main')} 
        >
           <Text style={styles.confirmButtonText}>Confirm</Text>
        </TouchableOpacity>
        <View style={styles.securityRow}>
            <Lock color="#999" size={14} />
            <Text style={styles.securityText}>YOUR PAYMENT DETAILS ARE SECURELY ENCRYPTED</Text>
        </View>
      </View>
    </SafeAreaView>
  );
};
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFF',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  backButton: {
    padding: 4,
  },
  headerTitle: {
    color: Colors.primary,
    fontSize: 18,
    fontFamily: 'Inter-Bold',
    marginLeft: 10,
  },
  content: {
    flex: 1,
    paddingHorizontal: 24,
    paddingTop: 20,
  },
  cardVisual: {
    backgroundColor: '#1A1A1A',
    borderRadius: 24,
    padding: 24,
    width: '100%',
    aspectRatio: 1.6,
    justifyContent: 'space-between',
    marginBottom: 40,
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.1,
    shadowRadius: 20,
  },
  cardVisualHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  masterCardText: {
    color: Colors.white,
    fontSize: 18,
    fontFamily: 'Inter-Bold',
  },
  cardVisualNumber: {
    color: Colors.secondary,
    fontSize: 22,
    fontFamily: 'Inter-Bold',
    letterSpacing: 2,
    marginVertical: 10,
  },
  cardVisualFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
  },
  labelSmall: {
    color: '#666',
    fontSize: 8,
    fontFamily: 'Inter-Bold',
    marginBottom: 4,
  },
  holderNameVisual: {
    color: Colors.white,
    fontSize: 14,
    fontFamily: 'Inter-Medium',
  },
  expiryVisual: {
    color: Colors.white,
    fontSize: 14,
    fontFamily: 'Inter-Medium',
  },
  visaIconSmall: {
    width: 40,
    height: 15,
    tintColor: Colors.white,
    opacity: 0.8,
  },
  form: {
    marginBottom: 30,
  },
  fieldLabel: {
    color: '#999',
    fontSize: 10,
    fontFamily: 'Inter-Bold',
    marginBottom: 10,
    letterSpacing: 1,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: '#EEE',
    paddingBottom: 10,
    marginBottom: 24,
  },
  input: {
    flex: 1,
    marginLeft: 12,
    fontSize: 16,
    color: '#1A1A1A',
    fontFamily: 'Inter-Medium',
  },
  visaIconInput: {
    width: 32,
    height: 10,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  halfField: {
    width: '45%',
  },
  checkboxRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 10,
  },
  checkbox: {
    width: 24,
    height: 24,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#DDD',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 10,
  },
  checkboxActive: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
  },
  checkboxText: {
    color: '#666',
    fontSize: 12,
    fontFamily: 'Inter-Medium',
  },
  confirmButton: {
    backgroundColor: Colors.primary,
    height: 56,
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
    marginTop: 10,
  },
  confirmButtonText: {
    color: Colors.white,
    fontSize: 18,
    fontFamily: 'Inter-SemiBold',
  },
  securityRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  securityText: {
    color: '#999',
    fontSize: 8,
    fontFamily: 'Inter-Bold',
    marginLeft: 6,
    letterSpacing: 0.5,
  },
});
