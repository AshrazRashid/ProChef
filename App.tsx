import React, { useState, useEffect } from 'react';
import { StatusBar } from 'expo-status-bar';
import { StyleSheet, View, Text } from 'react-native';
import { GestureHandlerRootView, TouchableOpacity } from 'react-native-gesture-handler';
import * as SplashScreenLib from 'expo-splash-screen';
import { useFonts, Inter_400Regular, Inter_600SemiBold, Inter_700Bold, Inter_800ExtraBold } from '@expo-google-fonts/inter';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { LayoutDashboard, Calendar, Utensils, ChefHat } from 'lucide-react-native';

import { SplashScreen } from './src/screens/SplashScreen';
import { WelcomeScreen } from './src/screens/WelcomeScreen';
import { SignInScreen } from './src/screens/SignInScreen';
import { SignUpScreen } from './src/screens/SignUpScreen';
import { ForgotPasswordScreen } from './src/screens/ForgotPasswordScreen';
import { VerificationScreen } from './src/screens/VerificationScreen';
import { GoalSetupScreen } from './src/screens/GoalSetupScreen';
import { AboutYourselfScreen } from './src/screens/AboutYourselfScreen';
import { DietCustomizationScreen } from './src/screens/DietCustomizationScreen';
import { CameraScanScreen } from './src/screens/CameraScanScreen';
import { IngredientsScreen } from './src/screens/IngredientsScreen';
import { MealsScreen } from './src/screens/MealsScreen';
import { MealDiscoveryScreen } from './src/screens/MealDiscoveryScreen';
import { PremiumAccessScreen } from './src/screens/PremiumAccessScreen';
import { AddCardScreen } from './src/screens/AddCardScreen';
import { RecipeDetailsScreen } from './src/screens/RecipeDetailsScreen';
import { CustomMealScreen } from './src/screens/CustomMealScreen';
import { CookingModeScreen } from './src/screens/CookingModeScreen';
import { ShoppingListScreen } from './src/screens/ShoppingListScreen';
import { MealRecommendationsScreen } from './src/screens/MealRecommendationsScreen';
import { ExpirationAlertScreen } from './src/screens/ExpirationAlertScreen';
import { MealPlannerScreen } from './src/screens/MealPlannerScreen';
import { DashboardScreen } from './src/screens/DashboardScreen';
import { ProfileScreen } from './src/screens/ProfileScreen';
import { EditProfileScreen } from './src/screens/EditProfileScreen';
import { SecurityScreen } from './src/screens/SecurityScreen';
import { Colors } from './src/constants/theme';

const Stack = createStackNavigator();
const Tab = createBottomTabNavigator();

// Bottom Tab Navigator Component
function MainTabs() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarStyle: {
          backgroundColor: '#FFF',
          height: 85,
          borderTopWidth: 1,
          borderTopColor: '#F0F0F0',
          paddingBottom: 25,
        },
        tabBarActiveTintColor: Colors.primary,
        tabBarInactiveTintColor: '#999',
        tabBarLabelStyle: {
          fontSize: 10,
          fontFamily: 'Inter-Bold',
          marginBottom: 5,
        },
        tabBarIconStyle: {
          marginBottom: 0,
        },
        tabBarIcon: ({ color, size }) => {
          if (route.name === 'DashboardTab') {
            return <LayoutDashboard size={24} color={color} />;
          } else if (route.name === 'Planner') {
            return <Calendar size={24} color={color} />;
          } else if (route.name === 'Meal') {
            return <Utensils size={24} color={color} />;
          } else if (route.name === 'Cooking') {
            return <ChefHat size={24} color={color} />;
          }
        },
      })}
    >
      <Tab.Screen 
        name="DashboardTab" 
        component={DashboardScreen} 
        options={{ 
          tabBarLabel: 'DASHBOARD',
          tabBarButton: (props) => <TouchableOpacity {...props} />
        }} 
      />
      <Tab.Screen 
        name="Planner" 
        component={MealPlannerScreen} 
        options={{ 
          tabBarLabel: 'PLANNER',
          tabBarButton: (props) => <TouchableOpacity {...props} />
        }} 
      />
      <Tab.Screen 
        name="Meal" 
        component={MealRecommendationsScreen} 
        options={{ 
          tabBarLabel: 'MEAL',
          tabBarButton: (props) => <TouchableOpacity {...props} />
        }} 
      />
      <Tab.Screen 
        name="Cooking" 
        component={CookingModeScreen} 
        options={{ 
          tabBarLabel: 'COOKING',
          tabBarButton: (props) => <TouchableOpacity {...props} />
        }} 
      />
    </Tab.Navigator>
  );
}

// Keep the splash screen visible while we fetch resources
SplashScreenLib.preventAutoHideAsync();

export default function App() {
  const [appIsReady, setAppIsReady] = useState(false);
  const [showSplash, setShowSplash] = useState(true);

  const [fontsLoaded] = useFonts({
    'Inter-Regular': Inter_400Regular,
    'Inter-SemiBold': Inter_600SemiBold,
    'Inter-Bold': Inter_700Bold,
    'Inter-ExtraBold': Inter_800ExtraBold,
  });

  useEffect(() => {
    if (fontsLoaded) {
      setAppIsReady(true);
      SplashScreenLib.hideAsync();
    }
  }, [fontsLoaded]);

  if (!appIsReady) {
    return null;
  }

  if (showSplash) {
    return <SplashScreen onFinish={() => setShowSplash(false)} />;
  }

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <NavigationContainer>
        <StatusBar style="light" />
        <Stack.Navigator 
          initialRouteName="Main"
          screenOptions={{
            headerShown: false,
            cardStyle: { backgroundColor: Colors.background }
          }}
        >
          {/* Auth Flow */}
          <Stack.Screen name="Welcome" component={WelcomeScreen} />
          <Stack.Screen name="SignIn" component={SignInScreen} />
          <Stack.Screen name="SignUp" component={SignUpScreen} />
          <Stack.Screen name="ForgotPassword" component={ForgotPasswordScreen} />
          <Stack.Screen name="Verification" component={VerificationScreen} />
          
          {/* Onboarding */}
          <Stack.Screen name="GoalSetup" component={GoalSetupScreen} />
          <Stack.Screen name="AboutYourself" component={AboutYourselfScreen} />
          <Stack.Screen name="DietCustomization" component={DietCustomizationScreen} />
          
          {/* Main App (Tab Navigator) */}
          <Stack.Screen name="Main" component={MainTabs} />
          
          {/* Detail Screens */}
          <Stack.Screen name="CameraScan" component={CameraScanScreen} />
          <Stack.Screen name="Ingredients" component={IngredientsScreen} />
          <Stack.Screen name="Meals" component={MealsScreen} />
          <Stack.Screen name="MealDiscovery" component={MealDiscoveryScreen} />
          <Stack.Screen name="PremiumAccess" component={PremiumAccessScreen} />
          <Stack.Screen name="AddCard" component={AddCardScreen} />
          <Stack.Screen name="RecipeDetails" component={RecipeDetailsScreen} />
          <Stack.Screen name="CustomMeal" component={CustomMealScreen} />
          <Stack.Screen name="ShoppingList" component={ShoppingListScreen} />
          <Stack.Screen name="ExpirationAlert" component={ExpirationAlertScreen} />
          <Stack.Screen name="Profile" component={ProfileScreen} />
          <Stack.Screen name="EditProfile" component={EditProfileScreen} />
          <Stack.Screen name="Security" component={SecurityScreen} />
        </Stack.Navigator>
      </NavigationContainer>
    </GestureHandlerRootView>
  );
}
