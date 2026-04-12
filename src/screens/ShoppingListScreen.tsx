import React, { useState } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  TouchableOpacity, 
  SafeAreaView, 
  ScrollView, 
  Image,
  TextInput,
  Dimensions
} from 'react-native';
import { ChevronLeft, Plus, Check } from 'lucide-react-native';
import { Colors } from '../constants/theme';

const { width } = Dimensions.get('window');

export const ShoppingListScreen = ({ navigation }: any) => {
  const [selectedFilter, setSelectedFilter] = useState('All Items');
  const [checkedItems, setCheckedItems] = useState<string[]>([]);

  const toggleCheck = (id: string) => {
    if (checkedItems.includes(id)) {
      setCheckedItems(checkedItems.filter(i => i !== id));
    } else {
      setCheckedItems([...checkedItems, id]);
    }
  };

  const shoppingItems = [
    { 
      category: 'Vegetables', 
      count: '2 ITEMS',
      items: [
        { id: '1', name: 'Spinach', details: 'Organic, 500g', image: require('../assests/images/SpinachOmelette.png') },
        { id: '2', name: 'Garlic', details: '2 Whole Bulbs', image: require('../assests/icons/onion.png') },
      ]
    },
    { 
      category: 'Dairy', 
      count: '3 ITEMS',
      items: [
        { id: '3', name: 'Greek Yogurt', details: 'Full Fat, 1kg', image: require('../assests/icons/egg.png') },
        { id: '4', name: 'Parmesan', details: 'Aged 24 Months, 200g', image: require('../assests/icons/egg.png') },
        { id: '5', name: 'Almond Milk', details: 'Unsweetened, 1L', image: require('../assests/images/GreenPowerSmoothie.png') },
      ]
    },
    { 
      category: 'Protein', 
      count: '1 ITEM',
      items: [
        { id: '6', name: 'Salmon Fillets', details: 'Wild Caught, 2pcs', image: require('../assests/images/MediterraneanSalmonBowl.png') },
      ]
    }
  ];

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <ChevronLeft color={Colors.primary} size={28} />
        </TouchableOpacity>
        <View>
           <Text style={styles.headerTitle}>Shopping List</Text>
           <Text style={styles.headerSubtitle}>Insufficient Ingredients</Text>
        </View>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* Add Item Bar */}
        <View style={styles.addBar}>
           <TextInput 
             style={styles.searchInput}
             placeholder="Add new item..."
             placeholderTextColor="#CCC"
           />
           <TouchableOpacity style={styles.addBtn}>
              <Plus color={Colors.white} size={24} />
           </TouchableOpacity>
        </View>

        {/* Filter Chips */}
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.chipScroll}>
           {['All Items', 'Vegetables', 'Dairy', 'Protein'].map(chip => (
             <TouchableOpacity 
               key={chip}
               onPress={() => setSelectedFilter(chip)}
               style={[styles.chip, selectedFilter === chip && styles.chipActive]}
             >
                <Text style={[styles.chipText, selectedFilter === chip && styles.chipTextActive]}>{chip}</Text>
             </TouchableOpacity>
           ))}
        </ScrollView>

        {/* Categories */}
        {shoppingItems.map((cat, idx) => (
           <View key={idx} style={styles.categorySection}>
              <View style={styles.categoryHeader}>
                 <Text style={styles.categoryTitle}>{cat.category}</Text>
                 <View style={styles.countBadge}>
                    <Text style={styles.countText}>{cat.count}</Text>
                 </View>
              </View>

              {cat.items.map((item) => (
                 <TouchableOpacity 
                   key={item.id} 
                   style={styles.itemRow}
                   onPress={() => toggleCheck(item.id)}
                 >
                    <View style={styles.itemImageContainer}>
                       <Image source={item.image} style={styles.itemImage} />
                    </View>
                    <View style={styles.itemInfo}>
                       <Text style={styles.itemName}>{item.name}</Text>
                       <Text style={styles.itemDetails}>{item.details}</Text>
                    </View>
                    <View style={[styles.checkbox, checkedItems.includes(item.id) && styles.checkboxChecked]}>
                       {checkedItems.includes(item.id) && <Check color={Colors.white} size={14} />}
                    </View>
                 </TouchableOpacity>
              ))}
           </View>
        ))}
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FFF' },
  header: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: '#F5F5F5' },
  backButton: { padding: 4, marginRight: 10 },
  headerTitle: { color: Colors.primary, fontSize: 18, fontFamily: 'Inter-Bold' },
  headerSubtitle: { color: '#999', fontSize: 12, fontFamily: 'Inter-Regular' },
  scrollContent: { paddingHorizontal: 20, paddingBottom: 40 },
  addBar: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#F9F9F9', borderRadius: 28, paddingLeft: 24, paddingRight: 4, height: 56, marginTop: 24, marginBottom: 20 },
  searchInput: { flex: 1, color: '#333', fontSize: 16, fontFamily: 'Inter-Medium' },
  addBtn: { width: 48, height: 48, borderRadius: 24, backgroundColor: '#426D45', justifyContent: 'center', alignItems: 'center' },
  chipScroll: { marginBottom: 30 },
  chip: { paddingHorizontal: 20, paddingVertical: 10, borderRadius: 20, backgroundColor: '#F5F5F5', marginRight: 10 },
  chipActive: { backgroundColor: Colors.primary },
  chipText: { color: Colors.primary, fontSize: 13, fontFamily: 'Inter-SemiBold' },
  chipTextActive: { color: Colors.white },
  categorySection: { marginBottom: 30 },
  categoryHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 },
  categoryTitle: { color: '#1A1A1A', fontSize: 18, fontFamily: 'Inter-Bold' },
  countBadge: { backgroundColor: '#E8F5E9', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 8 },
  countText: { color: '#426D45', fontSize: 10, fontFamily: 'Inter-Bold' },
  itemRow: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#FFF', padding: 12, borderRadius: 24, marginBottom: 12, borderWidth: 1, borderColor: '#EEE' },
  itemImageContainer: { width: 56, height: 56, borderRadius: 16, overflow: 'hidden', marginRight: 16 },
  itemImage: { width: '100%', height: '100%', resizeMode: 'cover' },
  itemInfo: { flex: 1 },
  itemName: { color: Colors.primary, fontSize: 16, fontFamily: 'Inter-Bold', marginBottom: 4 },
  itemDetails: { color: '#999', fontSize: 12, fontFamily: 'Inter-Regular' },
  checkbox: { width: 28, height: 28, borderRadius: 14, borderWidth: 2, borderColor: '#EEE', justifyContent: 'center', alignItems: 'center' },
  checkboxChecked: { backgroundColor: Colors.primary, borderColor: Colors.primary },
});
