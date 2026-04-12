import { SafeAreaView } from "react-native-safe-area-context";
import React, { useState } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  TouchableOpacity, 
  ScrollView,
  Image,
  TextInput,
  Dimensions
} from 'react-native';
import { ChevronLeft, MoreVertical, Search, Plus, X, RotateCcw, Trash2, CheckCircle2 } from 'lucide-react-native';
import { Colors } from '../constants/theme';
const { width } = Dimensions.get('window');

export const IngredientsScreen = ({ navigation }: any) => {
  const [selectedFilter, setSelectedFilter] = useState('All');
  const ingredients = [
    { id: '1', name: 'Chicken Breast', confidence: 'HIGH CONFIDENCE', icon: require('../assets/icons/egg.png'), color: '#FFF' },
    { id: '2', name: 'Large Eggs', confidence: 'HIGH CONFIDENCE', icon: require('../assets/icons/egg.png'), color: '#FFF' },
    { id: '3', name: 'Spinach', confidence: 'MEDIUM CONFIDENCE', icon: require('../assets/icons/leaves.png'), color: '#E8F5E9' },
    { id: '4', name: 'Greek Yogurt', confidence: 'HIGH CONFIDENCE', icon: require('../assets/icons/egg.png'), color: '#FFF' },
  ];

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.canGoBack() ? navigation.goBack() : navigation.navigate('Main')} style={styles.backButton}>
          <ChevronLeft color="#1A1A1A" size={28} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Ingredients Found</Text>
        <TouchableOpacity style={styles.moreButton}>
          <MoreVertical color="#1A1A1A" size={24} />
        </TouchableOpacity>
      </View>
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* Detection Card */}
        <View style={styles.detectionCard}>
          <View style={styles.detectionTextContent}>
            <Text style={styles.detectionTitle}>We detected 10 ingredients {'\n'}from your scan</Text>
            <Text style={styles.detectionSubtitle}>Remove anything you don't have or {'\n'}add missing items</Text>
          </View>
          <View style={styles.sparkleCircle}>
            <Image source={require('../assets/icons/creation.png')} style={styles.sparkleIcon} />
          </View>
        </View>
        {/* Filter Tabs */}
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.filterScroll}>
          {['All', 'Protein', 'Vegetables', 'Fruits', 'Dairy'].map((filter) => (
            <TouchableOpacity 
              key={filter} 
              onPress={() => setSelectedFilter(filter)}
              style={[styles.filterTab, selectedFilter === filter && styles.filterTabActive]}
            >
              <Text style={[styles.filterText, selectedFilter === filter && styles.filterTextActive]}>{filter}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
        {/* Search / Add Section */}
        <View style={styles.searchSection}>
          <Text style={styles.searchTitle}>Missing something?</Text>
          <View style={styles.searchRow}>
            <View style={styles.searchInputContainer}>
              <Search color="#999" size={20} />
              <TextInput 
                style={styles.searchInput}
                placeholder="Add ingredient"
                placeholderTextColor="#999"
              />
            </View>
            <TouchableOpacity style={styles.addButton}>
              <Plus color={Colors.white} size={24} />
            </TouchableOpacity>
          </View>
        </View>
        {/* Action Buttons */}
        <View style={styles.actionRow}>
          <TouchableOpacity style={styles.actionButton}>
            <CheckCircle2 color="#4D4D4D" size={16} />
            <Text style={styles.actionButtonText}>SELECT ALL</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.actionButton}>
            <Trash2 color="#4D4D4D" size={16} />
            <Text style={styles.actionButtonText}>CLEAR ALL</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.actionButton}>
            <RotateCcw color="#4D4D4D" size={16} />
            <Text style={styles.actionButtonText}>RESCAN</Text>
          </TouchableOpacity>
        </View>
        {/* Ingredients Grid */}
        <View style={styles.ingredientsGrid}>
          {ingredients.map((item) => (
            <View key={item.id} style={[styles.ingredientCard, { backgroundColor: item.color }]}>
              <TouchableOpacity style={styles.removeIngredient}>
                <X color="#999" size={16} />
              </TouchableOpacity>
              <View style={styles.ingredientImageContainer}>
                <Image source={item.icon} style={styles.ingredientIcon} resizeMode="contain" />
              </View>
              <Text style={styles.ingredientName}>{item.name}</Text>
              <View style={[
                  styles.confidenceLabel, 
                  item.confidence.includes('HIGH') ? styles.confidenceHigh : styles.confidenceMedium
                ]}>
                <Text style={styles.confidenceText}>{item.confidence}</Text>
              </View>
              {item.name === 'Spinach' && (
                <View style={styles.addCircle}>
                   <Plus color={Colors.white} size={14} />
                </View>
              )}
            </View>
          ))}
        </View>
        <View style={styles.selectionLabelContainer}>
           <TouchableOpacity style={styles.selectionButton}>
              <Text style={styles.selectionButtonText}>8 INGREDIENTS SELECTED</Text>
           </TouchableOpacity>
        </View>
        {/* Footer Buttons */}
        <View style={styles.footerButtons}>
          <TouchableOpacity 
            style={styles.generateButton}
            onPress={() => navigation.navigate('Meals')}
          >
            <Text style={styles.generateButtonText}>Generate Meal</Text>
          </TouchableOpacity>
          <TouchableOpacity 
            style={styles.scanAgainButton}
            onPress={() => navigation.navigate('CameraScan')}
          >
            <Text style={styles.scanAgainButtonText}>Scan Again</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9F9F9',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 10,
    backgroundColor: '#FFF',
  },
  backButton: {
    padding: 4,
  },
  headerTitle: {
    color: '#1A1A1A',
    fontSize: 18,
    fontFamily: 'Inter-Bold',
  },
  moreButton: {
    padding: 4,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingBottom: 40,
  },
  detectionCard: {
    flexDirection: 'row',
    backgroundColor: '#FFF',
    borderRadius: 24,
    padding: 24,
    marginTop: 20,
    justifyContent: 'space-between',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 2,
  },
  detectionTextContent: {
    flex: 1,
  },
  detectionTitle: {
    color: '#1A1A1A',
    fontSize: 18,
    fontFamily: 'Inter-Bold',
    lineHeight: 24,
    marginBottom: 8,
  },
  detectionSubtitle: {
    color: '#666',
    fontSize: 12,
    fontFamily: 'Inter-Regular',
    lineHeight: 18,
  },
  sparkleCircle: {
    width: 54,
    height: 54,
    borderRadius: 27,
    backgroundColor: '#4E734E',
    justifyContent: 'center',
    alignItems: 'center',
  },
  sparkleIcon: {
    width: 28,
    height: 28,
    tintColor: Colors.white,
  },
  filterScroll: {
    marginTop: 24,
    marginBottom: 24,
  },
  filterTab: {
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 24,
    backgroundColor: '#FFF',
    marginRight: 10,
    borderWidth: 1,
    borderColor: '#F0F0F0',
  },
  filterTabActive: {
    backgroundColor: '#426D45',
    borderColor: '#426D45',
  },
  filterText: {
    color: '#666',
    fontSize: 14,
    fontFamily: 'Inter-Medium',
  },
  filterTextActive: {
    color: Colors.white,
  },
  searchSection: {
    marginBottom: 24,
  },
  searchTitle: {
    color: '#1A1A1A',
    fontSize: 16,
    fontFamily: 'Inter-Bold',
    marginBottom: 16,
  },
  searchRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  searchInputContainer: {
    flex: 1,
    height: 52,
    backgroundColor: '#FFF',
    borderRadius: 26,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    borderWidth: 1,
    borderColor: '#EEE',
    marginRight: 12,
  },
  searchInput: {
    flex: 1,
    marginLeft: 10,
    fontSize: 14,
    color: '#1A1A1A',
    fontFamily: 'Inter-Regular',
  },
  addButton: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: '#426D45',
    justifyContent: 'center',
    alignItems: 'center',
  },
  actionRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 24,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  actionButtonText: {
    color: '#4D4D4D',
    fontSize: 11,
    fontFamily: 'Inter-Bold',
    marginLeft: 6,
  },
  ingredientsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  ingredientCard: {
    width: (width - 56) / 2,
    borderRadius: 24,
    padding: 16,
    marginBottom: 16,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#F0F0F0',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 5,
    elevation: 1,
  },
  removeIngredient: {
    position: 'absolute',
    top: 12,
    right: 12,
    zIndex: 1,
  },
  ingredientImageContainer: {
    width: 80,
    height: 80,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  ingredientIcon: {
    width: 64,
    height: 64,
  },
  ingredientName: {
    color: '#1A1A1A',
    fontSize: 14,
    fontFamily: 'Inter-Bold',
    marginBottom: 6,
  },
  confidenceLabel: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  confidenceHigh: {
    backgroundColor: '#E8F5E9',
  },
  confidenceMedium: {
    backgroundColor: '#FFF9C4',
  },
  confidenceText: {
    fontSize: 8,
    fontFamily: 'Inter-Bold',
    color: '#426D45',
  },
  addCircle: {
    position: 'absolute',
    top: 12,
    right: 12,
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#81C784',
    justifyContent: 'center',
    alignItems: 'center',
  },
  selectionLabelContainer: {
     alignItems: 'center',
     marginVertical: 20,
  },
  selectionButton: {
     backgroundColor: '#426D45',
     paddingHorizontal: 20,
     paddingVertical: 10,
     borderRadius: 20,
  },
  selectionButtonText: {
     color: Colors.white,
     fontSize: 10,
     fontFamily: 'Inter-Bold',
  },
  footerButtons: {
    marginTop: 10,
  },
  generateButton: {
    backgroundColor: '#426D45',
    height: 56,
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  generateButtonText: {
    color: Colors.white,
    fontSize: 16,
    fontFamily: 'Inter-Bold',
  },
  scanAgainButton: {
    backgroundColor: '#333',
    height: 56,
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
  },
  scanAgainButtonText: {
    color: Colors.white,
    fontSize: 16,
    fontFamily: 'Inter-Bold',
  },
});
