import { SafeAreaView } from "react-native-safe-area-context";
import React, { useState } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  TouchableOpacity, 
  ScrollView, 
  Image,
  Dimensions
} from 'react-native';
import { X, CheckCircle2, ShieldCheck, CalendarRange, Star } from 'lucide-react-native';
import { Colors } from '../constants/theme';
const { width } = Dimensions.get('window');

export const PremiumAccessScreen = ({ navigation }: any) => {
  const [selectedPlan, setSelectedPlan] = useState('yearly');
  const features = [
    { title: 'Unlimited AI Scans', desc: 'Instant nutritional data for any dish.' },
    { title: 'Advanced AI Meal Plans', desc: 'Evolving plans that learn your tastes.' },
    { title: 'Detailed Macro Customization', desc: 'Granular control over every nutrient.' },
    { title: 'Full Meal Prep Planner', desc: 'Automated grocery lists and timings.' },
    { title: 'Exclusive Nutrition Insights', desc: 'Deep dives into your metabolic health.' },
    { title: 'Priority Support', desc: 'Direct access to our expert team.' },
  ];

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.closeButton}>
          <X color={Colors.white} size={24} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Premium Access</Text>
      </View>
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* Hero Section */}
        <View style={styles.hero}>
           <View style={styles.invitationBadge}>
              <Text style={styles.invitationText}>EXCLUSIVE INVITATION</Text>
           </View>
           <Text style={styles.title}>
             Prochef AI <Text style={styles.titleAccent}>Premium</Text>
           </Text>
           <Text style={styles.subtitle}>
             Elevate your wellness journey with our most advanced AI-powered nutritional precision.
           </Text>
        </View>
        {/* Pricing Plans */}
        <View style={styles.plansContainer}>
          {/* Monthly Plan */}
          <TouchableOpacity 
            style={[styles.planCard, selectedPlan === 'monthly' && styles.planCardActive]}
            onPress={() => setSelectedPlan('monthly')}
          >
            <Text style={styles.planType}>MONTHLY</Text>
            <View style={styles.priceRow}>
               <Text style={styles.price}>$7.99</Text>
               <Text style={styles.pricePeriod}>/mo</Text>
            </View>
            <Text style={styles.planDesc}>Flexible month-to-month access to all premium features.</Text>
            <View style={styles.planLine} />
          </TouchableOpacity>
          {/* Yearly Plan */}
          <TouchableOpacity 
            style={[styles.planCard, selectedPlan === 'yearly' && styles.planCardActive]}
            onPress={() => setSelectedPlan('yearly')}
          >
            <View style={styles.yearlyHeader}>
              <Text style={styles.planType}>YEARLY</Text>
              <View style={styles.bestValueBadge}>
                 <Text style={styles.bestValueText}>BEST VALUE</Text>
              </View>
              <View style={styles.saveBadge}>
                 <Text style={styles.saveText}>SAVE 42%</Text>
              </View>
            </View>
            <View style={styles.priceRow}>
               <Text style={styles.price}>$54.99</Text>
               <Text style={styles.pricePeriod}>/year</Text>
            </View>
            <Text style={styles.planDesc}>Our most popular choice for long-term health transformation.</Text>
            <View style={[styles.planLine, styles.planLineActive]} />
          </TouchableOpacity>
        </View>
        {/* Features List */}
        <View style={styles.featuresSection}>
           <Text style={styles.featuresTitle}>Unlock Full Capability</Text>
           {features.map((item, index) => (
             <View key={index} style={styles.featureItem}>
                <CheckCircle2 color={Colors.secondary} size={24} />
                <View style={styles.featureText}>
                   <Text style={styles.featureItemTitle}>{item.title}</Text>
                   <Text style={styles.featureItemDesc}>{item.desc}</Text>
                </View>
             </View>
           ))}
        </View>
        {/* Confidence Row */}
        <View style={styles.confidenceRow}>
           <View style={styles.confidenceItem}>
              <ShieldCheck color={Colors.white} size={16} />
              <Text style={styles.confidenceText}>SECURE PAYMENT</Text>
           </View>
           <View style={styles.confidenceItem}>
              <CalendarRange color={Colors.white} size={16} />
              <Text style={styles.confidenceText}>CANCEL ANYTIME</Text>
           </View>
        </View>
        <View style={styles.ratingRow}>
           <Star color={Colors.white} size={16} fill={Colors.white} />
           <Text style={styles.ratingText}>4.9/5 USER RATING</Text>
        </View>
        {/* Action Button */}
        <TouchableOpacity 
          style={styles.primaryButton}
          onPress={() => navigation.navigate('AddCard')}
        >
           <Text style={styles.primaryButtonText}>Start 7-Day Free Trail</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
};
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0D0D0D',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 10,
  },
  closeButton: {
    padding: 8,
  },
  headerTitle: {
    color: Colors.white,
    fontSize: 16,
    fontFamily: 'Inter-SemiBold',
    marginLeft: 10,
  },
  scrollContent: {
    paddingHorizontal: 24,
    paddingBottom: 40,
  },
  hero: {
    alignItems: 'center',
    marginTop: 30,
    marginBottom: 40,
  },
  invitationBadge: {
    backgroundColor: 'rgba(66, 109, 69, 0.2)',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    marginBottom: 16,
  },
  invitationText: {
    color: Colors.secondary,
    fontSize: 10,
    fontFamily: 'Inter-Bold',
    letterSpacing: 1,
  },
  title: {
    color: Colors.white,
    fontSize: 32,
    fontFamily: 'Inter-Bold',
    marginBottom: 12,
  },
  titleAccent: {
    color: Colors.secondary,
  },
  subtitle: {
    color: Colors.textSecondary,
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    textAlign: 'center',
    lineHeight: 22,
    paddingHorizontal: 20,
  },
  plansContainer: {
    marginBottom: 40,
  },
  planCard: {
    backgroundColor: '#1A1A1A',
    borderRadius: 32,
    padding: 24,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: '#333',
  },
  planCardActive: {
    borderColor: Colors.secondary,
    backgroundColor: 'rgba(66, 109, 69, 0.05)',
  },
  planType: {
    color: Colors.textSecondary,
    fontSize: 10,
    fontFamily: 'Inter-Bold',
    letterSpacing: 2,
    marginBottom: 12,
  },
  priceRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    marginBottom: 12,
  },
  price: {
    color: Colors.white,
    fontSize: 36,
    fontFamily: 'Inter-Bold',
  },
  pricePeriod: {
    color: Colors.textSecondary,
    fontSize: 16,
    fontFamily: 'Inter-Medium',
    marginLeft: 4,
  },
  planDesc: {
    color: '#666',
    fontSize: 12,
    fontFamily: 'Inter-Regular',
    marginBottom: 20,
  },
  planLine: {
    height: 4,
    backgroundColor: '#333',
    borderRadius: 2,
    width: '100%',
  },
  planLineActive: {
    backgroundColor: Colors.secondary,
  },
  yearlyHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  bestValueBadge: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 4,
    marginLeft: 10,
  },
  bestValueText: {
    color: '#999',
    fontSize: 8,
    fontFamily: 'Inter-Bold',
  },
  saveBadge: {
    backgroundColor: Colors.primary,
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 4,
    marginLeft: 'auto',
  },
  saveText: {
    color: Colors.white,
    fontSize: 8,
    fontFamily: 'Inter-Bold',
  },
  featuresSection: {
    backgroundColor: '#1A1A1A',
    borderRadius: 32,
    padding: 24,
    marginBottom: 40,
  },
  featuresTitle: {
    color: Colors.white,
    fontSize: 20,
    fontFamily: 'Inter-Bold',
    marginBottom: 24,
    textAlign: 'center',
  },
  featureItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 24,
  },
  featureText: {
    marginLeft: 15,
    flex: 1,
  },
  featureItemTitle: {
    color: Colors.white,
    fontSize: 16,
    fontFamily: 'Inter-Bold',
    marginBottom: 4,
  },
  featureItemDesc: {
    color: '#666',
    fontSize: 12,
    fontFamily: 'Inter-Regular',
  },
  confidenceRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginBottom: 12,
  },
  confidenceItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: 15,
  },
  confidenceText: {
    color: Colors.white,
    fontSize: 10,
    fontFamily: 'Inter-Bold',
    marginLeft: 6,
  },
  ratingRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 30,
  },
  ratingText: {
    color: Colors.white,
    fontSize: 10,
    fontFamily: 'Inter-Bold',
    marginLeft: 8,
  },
  primaryButton: {
    backgroundColor: Colors.primary,
    height: 56,
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
  },
  primaryButtonText: {
    color: Colors.white,
    fontSize: 18,
    fontFamily: 'Inter-SemiBold',
  },
});
