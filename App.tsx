import React, { useState, useEffect } from "react";
import { StatusBar } from "expo-status-bar";
import { View } from "react-native";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import * as SplashScreenLib from "expo-splash-screen";
import {
  useFonts,
  Inter_400Regular,
  Inter_600SemiBold,
  Inter_700Bold,
  Inter_800ExtraBold
} from "@expo-google-fonts/inter";
import { NavigationContainer } from "@react-navigation/native";
import { createStackNavigator } from "@react-navigation/stack";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { LayoutDashboard, Calendar, Utensils, ChefHat } from "lucide-react-native";
import { SafeAreaProvider } from "react-native-safe-area-context";
import * as Linking from "expo-linking";

import { SplashScreen } from "./src/screens/SplashScreen";
import { WelcomeScreen } from "./src/screens/WelcomeScreen";
import { SignInScreen } from "./src/screens/SignInScreen";
import { SignUpScreen } from "./src/screens/SignUpScreen";
import { ForgotPasswordScreen } from "./src/screens/ForgotPasswordScreen";
import { VerificationScreen } from "./src/screens/VerificationScreen";
import { ResetPasswordScreen } from "./src/screens/ResetPasswordScreen";
import { GoalSetupScreen } from "./src/screens/GoalSetupScreen";
import { AboutYourselfScreen } from "./src/screens/AboutYourselfScreen";
import { DietCustomizationScreen } from "./src/screens/DietCustomizationScreen";
import { CameraScanScreen } from "./src/screens/CameraScanScreen";
import { IngredientsScreen } from "./src/screens/IngredientsScreen";
import { MealsScreen } from "./src/screens/MealsScreen";
import { MealDiscoveryScreen } from "./src/screens/MealDiscoveryScreen";
import { PremiumAccessScreen } from "./src/screens/PremiumAccessScreen";
import { BillingReturnScreen } from "./src/screens/BillingReturnScreen";
import { AddCardScreen } from "./src/screens/AddCardScreen";
import { RecipeDetailsScreen } from "./src/screens/RecipeDetailsScreen";
import { CustomMealScreen } from "./src/screens/CustomMealScreen";
import { CookingModeScreen } from "./src/screens/CookingModeScreen";
import { ShoppingListScreen } from "./src/screens/ShoppingListScreen";
import { MealRecommendationsScreen } from "./src/screens/MealRecommendationsScreen";
import { ExpirationAlertScreen } from "./src/screens/ExpirationAlertScreen";
import { MealPlannerScreen } from "./src/screens/MealPlannerScreen";
import { DashboardScreen } from "./src/screens/DashboardScreen";
import { PantryScreen } from "./src/screens/PantryScreen";
import { ProfileScreen } from "./src/screens/ProfileScreen";
import { EditProfileScreen } from "./src/screens/EditProfileScreen";
import { SecurityScreen } from "./src/screens/SecurityScreen";
import { ProgressPhotosScreen } from "./src/screens/ProgressPhotosScreen";
import { Colors } from "./src/constants/theme";
import { AuthProvider, useAuth } from "./src/context/AuthContext";
import { OnboardingProvider } from "./src/context/OnboardingContext";

const Stack = createStackNavigator();
const Tab = createBottomTabNavigator();

function MainTabs() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarStyle: {
          backgroundColor: "#FFF",
          height: 90,
          borderTopWidth: 1,
          borderTopColor: "#F0F0F0",
          paddingBottom: 20,
          paddingTop: 10
        },
        tabBarActiveTintColor: Colors.primary,
        tabBarInactiveTintColor: "#999",
        tabBarShowLabel: true,
        tabBarLabelStyle: {
          fontSize: 11,
          fontFamily: "Inter-Bold",
          marginTop: 2
        },
        tabBarIconStyle: {
          marginTop: 5
        },
        tabBarIcon: ({ color, focused }) => {
          const size = 24;
          if (route.name === "DashboardTab") {
            return <LayoutDashboard size={size} color={color} strokeWidth={focused ? 2.5 : 2} />;
          }
          if (route.name === "Planner") {
            return <Calendar size={size} color={color} strokeWidth={focused ? 2.5 : 2} />;
          }
          if (route.name === "Meal") {
            return <Utensils size={size} color={color} strokeWidth={focused ? 2.5 : 2} />;
          }
          if (route.name === "Cooking") {
            return <ChefHat size={size} color={color} strokeWidth={focused ? 2.5 : 2} />;
          }
          return null;
        }
      })}
    >
      <Tab.Screen name="DashboardTab" component={DashboardScreen} options={{ tabBarLabel: "DASHBOARD" }} />
      <Tab.Screen name="Planner" component={MealPlannerScreen} options={{ tabBarLabel: "PLANNER" }} />
      <Tab.Screen name="Meal" component={MealRecommendationsScreen} options={{ tabBarLabel: "MEAL" }} />
      <Tab.Screen name="Cooking" component={CookingModeScreen} options={{ tabBarLabel: "COOKING" }} />
    </Tab.Navigator>
  );
}

function RootNavigator() {
  const { bootstrapped, resolveInitialRoute, accessToken, user } = useAuth();

  if (!bootstrapped) {
    return <View style={{ flex: 1, backgroundColor: Colors.background }} />;
  }

  /**
   * When accessToken is set, resolveInitialRoute uses `user` from /me.
   * On the first render after login, `accessToken` updates before `user` — resolveInitialRoute()
   * incorrectly returns Welcome (because !user?.dietProfile), remounting the stack onto Welcome
   * and killing navigation from Sign In. Wait until /me has loaded whenever we have a token.
   */
  if (accessToken && !user) {
    return <View style={{ flex: 1, backgroundColor: Colors.background }} />;
  }

  const initialRouteName = resolveInitialRoute();
  /** Only remount when login/logout changes stored session — not when /me or entitlements refresh (that was wiping navigation resets). */
  const navKey = accessToken ?? "anon";

  const linking = {
    prefixes: [Linking.createURL("/"), "prochef://"],
    config: {
      screens: {
        BillingSuccess: "billing/success",
        BillingCancel: "billing/cancel"
      }
    }
  };

  return (
    <NavigationContainer linking={linking}>
      <StatusBar style="light" />
      <Stack.Navigator
        key={navKey}
        initialRouteName={initialRouteName}
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
        <Stack.Screen name="ResetPassword" component={ResetPasswordScreen} />
        <Stack.Screen name="GoalSetup" component={GoalSetupScreen} />
        <Stack.Screen name="AboutYourself" component={AboutYourselfScreen} />
        <Stack.Screen name="DietCustomization" component={DietCustomizationScreen} />
        <Stack.Screen name="PremiumAccess" component={PremiumAccessScreen} />
        <Stack.Screen name="BillingSuccess" component={BillingReturnScreen} />
        <Stack.Screen name="BillingCancel" component={BillingReturnScreen} />
        <Stack.Screen name="Main" component={MainTabs} />
        <Stack.Screen name="CameraScan" component={CameraScanScreen} />
        <Stack.Screen name="Ingredients" component={IngredientsScreen} />
        <Stack.Screen name="Meals" component={MealsScreen} />
        <Stack.Screen name="MealDiscovery" component={MealDiscoveryScreen} />
        <Stack.Screen name="AddCard" component={AddCardScreen} />
        <Stack.Screen name="RecipeDetails" component={RecipeDetailsScreen} />
        <Stack.Screen name="CustomMeal" component={CustomMealScreen} />
        <Stack.Screen name="ShoppingList" component={ShoppingListScreen} />
        <Stack.Screen name="ExpirationAlert" component={ExpirationAlertScreen} />
        <Stack.Screen name="Pantry" component={PantryScreen} />
        <Stack.Screen name="Profile" component={ProfileScreen} />
        <Stack.Screen name="EditProfile" component={EditProfileScreen} />
        <Stack.Screen name="Security" component={SecurityScreen} />
        <Stack.Screen name="ProgressPhotos" component={ProgressPhotosScreen} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}

SplashScreenLib.preventAutoHideAsync();

export default function App() {
  const [appIsReady, setAppIsReady] = useState(false);
  const [showSplash, setShowSplash] = useState(true);

  const [fontsLoaded, fontLoadError] = useFonts({
    "Inter-Regular": Inter_400Regular,
    "Inter-SemiBold": Inter_600SemiBold,
    "Inter-Bold": Inter_700Bold,
    "Inter-ExtraBold": Inter_800ExtraBold
  });

  useEffect(() => {
    if (fontsLoaded || fontLoadError) {
      setAppIsReady(true);
      SplashScreenLib.hideAsync();
    }
  }, [fontsLoaded, fontLoadError]);

  if (!appIsReady) {
    return null;
  }

  if (showSplash) {
    return <SplashScreen onFinish={() => setShowSplash(false)} />;
  }

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider>
        <AuthProvider>
          <OnboardingProvider>
            <RootNavigator />
          </OnboardingProvider>
        </AuthProvider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}
