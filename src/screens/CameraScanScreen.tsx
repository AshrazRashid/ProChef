import { SafeAreaView } from "react-native-safe-area-context";
import React from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  TouchableOpacity, 
  ImageBackground,
  Dimensions,
  Image
} from 'react-native';
import { ChevronLeft, Settings, Zap } from 'lucide-react-native';
import { Colors } from '../constants/theme';
const { width, height } = Dimensions.get('window');

export const CameraScanScreen = ({ navigation }: any) => {

  return (
    <View style={styles.container}>
      {/* Background simulated camera view */}
      <ImageBackground 
        source={require('../assets/images/loginImage.png')} // Using loginImage as a placeholder for the scanner background
        style={styles.cameraView}
        resizeMode="cover"
      >
        <SafeAreaView style={styles.overlay}>
          {/* Header */}
          <View style={styles.header}>
            <TouchableOpacity onPress={() => navigation.goBack()} style={styles.circularButton}>
              <ChevronLeft color={Colors.white} size={24} />
            </TouchableOpacity>
            <View style={styles.headerTitleContainer}>
              <Text style={styles.headerTitle}>Scan Meal</Text>
              <Text style={styles.stepText}>Step 3 of 3</Text>
            </View>
            <TouchableOpacity style={styles.circularButton}>
              <Settings color={Colors.white} size={24} />
            </TouchableOpacity>
          </View>
          {/* Viewfinder */}
          <View style={styles.viewfinderContainer}>
            <View style={styles.viewfinder}>
              <View style={[styles.corner, styles.topLeft]} />
              <View style={[styles.corner, styles.topRight]} />
              <View style={[styles.corner, styles.bottomLeft]} />
              <View style={[styles.corner, styles.bottomRight]} />
            </View>
            <View style={styles.instructionContainer}>
              <Text style={styles.instructionText}>
                TAKE A PHOTO OF YOUR FRIDGE,{'\n'}PANTRY, OR GROCERIES
              </Text>
            </View>
          </View>
          {/* Footer Controls */}
          <View style={styles.footer}>
            <TouchableOpacity style={styles.flashButton}>
              <Zap color={Colors.white} size={24} />
            </TouchableOpacity>
            <TouchableOpacity 
              style={styles.shutterContainer}
              onPress={() => navigation.navigate('Ingredients')}
            >
              <View style={styles.shutterInner}>
                <Image 
                  source={require('../assets/icons/photo.png')} 
                  style={styles.cameraIcon} 
                />
              </View>
            </TouchableOpacity>
            <TouchableOpacity 
              style={styles.galleryButton}
              onPress={() => navigation.navigate('Ingredients')}
            >
              <Image source={require('../assets/icons/gallery.png')} style={styles.galleryIcon} />
              <Text style={styles.galleryText}>UPLOAD FROM GALLERY</Text>
            </TouchableOpacity>
          </View>
        </SafeAreaView>
      </ImageBackground>
    </View>
  );
};
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
  },
  cameraView: {
    flex: 1,
  },
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.3)',
    justifyContent: 'space-between',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 10,
  },
  circularButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitleContainer: {
    alignItems: 'center',
  },
  headerTitle: {
    color: Colors.white,
    fontSize: 18,
    fontFamily: 'Inter-SemiBold',
  },
  stepText: {
    color: Colors.textSecondary,
    fontSize: 12,
    fontFamily: 'Inter-Regular',
  },
  viewfinderContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  viewfinder: {
    width: width * 0.75,
    height: width * 0.9,
    position: 'relative',
  },
  corner: {
    position: 'absolute',
    width: 40,
    height: 40,
    borderColor: Colors.secondary,
  },
  topLeft: {
    top: 0,
    left: 0,
    borderTopWidth: 4,
    borderLeftWidth: 4,
    borderTopLeftRadius: 20,
  },
  topRight: {
    top: 0,
    right: 0,
    borderTopWidth: 4,
    borderRightWidth: 4,
    borderTopRightRadius: 20,
  },
  bottomLeft: {
    bottom: 0,
    left: 0,
    borderBottomWidth: 4,
    borderLeftWidth: 4,
    borderBottomLeftRadius: 20,
  },
  bottomRight: {
    bottom: 0,
    right: 0,
    borderBottomWidth: 4,
    borderRightWidth: 4,
    borderBottomRightRadius: 20,
  },
  instructionContainer: {
    marginTop: 30,
    backgroundColor: 'rgba(0,0,0,0.6)',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 20,
  },
  instructionText: {
    color: Colors.white,
    fontSize: 12,
    fontFamily: 'Inter-Bold',
    textAlign: 'center',
    letterSpacing: 1,
  },
  footer: {
    paddingBottom: 40,
    alignItems: 'center',
    paddingHorizontal: 24,
  },
  flashButton: {
    position: 'absolute',
    left: 40,
    bottom: 80,
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(255,255,255,0.1)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  shutterContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: 'rgba(255,255,255,0.3)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 30,
  },
  shutterInner: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: Colors.secondary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  cameraIcon: {
    width: 32,
    height: 32,
    tintColor: Colors.white,
  },
  galleryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.5)',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 24,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.2)',
  },
  galleryIcon: {
    width: 20,
    height: 20,
    marginRight: 10,
    tintColor: Colors.white,
  },
  galleryText: {
    color: Colors.white,
    fontSize: 12,
    fontFamily: 'Inter-Bold',
  },
});
