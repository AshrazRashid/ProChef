import React, { useState, useEffect } from 'react';
import { StatusBar } from 'expo-status-bar';
import { StyleSheet } from 'react-native';
import * as SplashScreenLib from 'expo-splash-screen';
import { useFonts, Inter_400Regular, Inter_600SemiBold, Inter_700Bold, Inter_800ExtraBold } from '@expo-google-fonts/inter';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
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
import { Colors } from './src/constants/theme';

const Stack = createStackNavigator();

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
    <NavigationContainer>
      <StatusBar style="light" />
      <Stack.Navigator 
        initialRouteName="Welcome"
        screenOptions={{
          headerShown: false,
          cardStyle: { backgroundColor: Colors.background }
        }}
      >
        <Stack.Screen name="Welcome" component={WelcomeScreen} />
        <Stack.Screen name="SignIn" component={SignInScreen} />
        <Stack.Screen name="SignUp" component={SignUpScreen} />
        <Stack.Screen name="ForgotPassword" component={ForgotPasswordScreen} />
        <Stack.Screen name="Verification" component={VerificationScreen} />
        <Stack.Screen name="GoalSetup" component={GoalSetupScreen} />
        <Stack.Screen name="AboutYourself" component={AboutYourselfScreen} />
        <Stack.Screen name="DietCustomization" component={DietCustomizationScreen} />
        <Stack.Screen name="CameraScan" component={CameraScanScreen} />
        <Stack.Screen name="Ingredients" component={IngredientsScreen} />
        <Stack.Screen name="Meals" component={MealsScreen} />
        <Stack.Screen name="MealDiscovery" component={MealDiscoveryScreen} />
        <Stack.Screen name="PremiumAccess" component={PremiumAccessScreen} />
        <Stack.Screen name="AddCard" component={AddCardScreen} />
        <Stack.Screen name="RecipeDetails" component={RecipeDetailsScreen} />
        <Stack.Screen name="CustomMeal" component={CustomMealScreen} />
        <Stack.Screen name="CookingMode" component={CookingModeScreen} />
        <Stack.Screen name="ShoppingList" component={ShoppingListScreen} />
        <Stack.Screen name="MealRecommendations" component={MealRecommendationsScreen} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
});
