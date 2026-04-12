import { SafeAreaView } from "react-native-safe-area-context";
import { View, Text, StyleSheet, TouchableOpacity, Dimensions, Image, ScrollView } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Colors } from '../constants/theme';
import { FeatureItem } from '../components/FeatureItem';
const { width } = Dimensions.get('window');

export const WelcomeScreen = ({ navigation }: any) => {

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView 
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Logo Header */}
        <View style={styles.header}>
          <Text style={styles.logoText}>ProChef<Text style={styles.logoAccent}>AI</Text></Text>
        </View>
        {/* Hero Visual Block */}
        <View style={styles.heroContainer}>
          <Image 
            source={require('../assets/images/loginImage.png')}
            style={styles.heroImage}
            resizeMode="cover"
          />
          <LinearGradient
            colors={['transparent', 'rgba(0,0,0,0.8)']}
            style={styles.heroGradient}
          />
        </View>
        {/* Headline */}
        <View style={styles.headlineContainer}>
          <Text style={styles.headline}>
            Scan. Cook. <Text style={styles.headlineAccent}>Eat Smart.</Text>
          </Text>
          <Text style={styles.subheadline}>
            AI-powered meal planning that starts with what you already have.
          </Text>
        </View>
        {/* Features */}
        <View style={styles.featuresList}>
          <FeatureItem
            icon={<Image source={require('../assets/icons/barcode.png')} style={styles.featureIcon} />}
            title="Ingredient Scanning"
            description="Instant recognition of labels and produce."
          />
          <FeatureItem
            icon={<Image source={require('../assets/icons/nutrition.png')} style={styles.featureIcon} />}
            title="Nutrition AI"
            description="Personalized macros based on your goals."
          />
        </View>
        {/* Buttons */}
        <View style={styles.buttonContainer}>
          <TouchableOpacity 
            style={styles.primaryButton}
            onPress={() => navigation.navigate('SignUp')}
          >
            <Text style={styles.primaryButtonText}>Continue</Text>
          </TouchableOpacity>
          <TouchableOpacity 
            style={styles.secondaryButton}
            onPress={() => navigation.navigate('SignIn')}
          >
            <Text style={styles.secondaryButtonText}>Sign In</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  scrollContent: {
    paddingHorizontal: 24,
    paddingTop: 20,
    paddingBottom: 40,
  },
  header: {
    alignItems: 'center',
    marginBottom: 20,
    marginTop: 10,
  },
  logoText: {
    color: Colors.white,
    fontSize: 28,
    fontFamily: 'Inter-Bold',
    letterSpacing: -1,
  },
  logoAccent: {
    backgroundColor: Colors.white,
    color: Colors.background,
    paddingHorizontal: 4,
    marginLeft: 2,
    borderRadius: 4,
    overflow: 'hidden',
  },
  featureIcon: {
    width: 24,
    height: 24,
    tintColor: Colors.white,
  },
  heroContainer: {
    height: 240,
    width: '100%',
    borderRadius: 30,
    overflow: 'hidden',
    position: 'relative',
    borderWidth: 1,
    borderColor: '#333',
  },
  heroImage: {
    ...StyleSheet.absoluteFillObject,
    width: '100%',
    height: '100%',
  },
  heroGradient: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 100,
  },
  headlineContainer: {
    marginTop: 24,
  },
  headline: {
    color: Colors.white,
    fontSize: 32,
    fontFamily: 'Inter-ExtraBold',
    textAlign: 'center',
    lineHeight: 40,
  },
  headlineAccent: {
    color: Colors.secondary,
  },
  subheadline: {
    color: Colors.textSecondary,
    fontSize: 16,
    fontFamily: 'Inter-Regular',
    textAlign: 'center',
    marginTop: 12,
    lineHeight: 24,
  },
  featuresList: {
    marginTop: 30,
  },
  buttonContainer: {
    marginBottom: 20,
  },
  primaryButton: {
    backgroundColor: Colors.primary,
    height: 56,
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  primaryButtonText: {
    color: Colors.white,
    fontSize: 18,
    fontFamily: 'Inter-SemiBold',
  },
  secondaryButton: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    height: 56,
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
  },
  secondaryButtonText: {
    color: Colors.white,
    fontSize: 18,
    fontFamily: 'Inter-SemiBold',
  },
});
