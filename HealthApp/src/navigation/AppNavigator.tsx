import React, { useEffect } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { Ionicons } from '@expo/vector-icons';

import { HomeScreen } from '../screens/HomeScreen';
import { FoodChannelScreen } from '../screens/FoodChannelScreen';
import { HealthPlanetScreen } from '../screens/HealthPlanetScreen';
import { CourseDetailScreen } from '../screens/CourseDetailScreen';
import { HealthDetailScreen } from '../screens/HealthDetailScreen';
import { CameraScreen } from '../screens/CameraScreen';
import { MealsScreen } from '../screens/MealsScreen';
import { RecipesScreen } from '../screens/RecipesScreen';
import { ExerciseScreen } from '../screens/ExerciseScreen';
import { AssistantScreen } from '../screens/AssistantScreen';
import { RecipeDetailScreen } from '../screens/RecipeDetailScreen';
import { PublishRecipeScreen } from '../screens/PublishRecipeScreen';
import { ProfileScreen } from '../screens/ProfileScreen';
import { ReportScreen } from '../screens/ReportScreen';
import OnboardingScreen from '../screens/OnboardingScreen';
import LoginScreen from '../screens/LoginScreen';
import RegisterScreen from '../screens/RegisterScreen';
import AdminDashboard from '../screens/admin/AdminDashboard';
import { BloggerRegisterScreen } from '../screens/BloggerRegisterScreen';
import { MembershipScreen } from '../screens/MembershipScreen';
import { CoursePublishScreen } from '../screens/CoursePublishScreen';
import { HealthQuestionnaireScreen } from '../screens/HealthQuestionnaireScreen';
import { useAppStore } from '../stores';
import { useAuthStore } from '../store/authStore';
import { Theme } from '../theme';

export type RootStackParamList = {
  Onboarding: undefined;
  Login: undefined;
  Register: undefined;
  MainTabs: undefined;
  Camera: undefined;
  HealthDetail: undefined;
  Meals: undefined;
  Recipes: undefined;
  Exercise: undefined;
  AdminDashboard: undefined;
  Assistant: { conversationId?: string };
  RecipeDetail: { postId: string };
  CourseDetail: { courseId: string };
  PublishRecipe: undefined;
  Report: undefined;
  BloggerRegister: undefined;
  Membership: undefined;
  CoursePublish: undefined;
  HealthQuestionnaire: undefined;
};

export type MainTabsParamList = {
  Home: undefined;
  FoodChannel: undefined;
  HealthPlanet: undefined;
  Profile: undefined;
};

const Stack = createNativeStackNavigator<RootStackParamList>();
const Tab = createBottomTabNavigator<MainTabsParamList>();

const MainTabs = () => {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ focused, color, size }) => {
          let iconName: keyof typeof Ionicons.glyphMap = 'help-outline';

          switch (route.name) {
            case 'Home':
              iconName = focused ? 'home' : 'home-outline';
              break;
            case 'FoodChannel':
              iconName = focused ? 'restaurant' : 'restaurant-outline';
              break;
            case 'HealthPlanet':
              iconName = focused ? 'planet' : 'planet-outline';
              break;
            case 'Profile':
              iconName = focused ? 'person' : 'person-outline';
              break;
          }

          return <Ionicons name={iconName} size={size} color={color} />;
        },
        tabBarActiveTintColor: Theme.colors.primary,
        tabBarInactiveTintColor: '#999',
        tabBarStyle: {
          backgroundColor: '#fff',
          borderTopWidth: 1,
          borderTopColor: '#f0f0f0',
          paddingTop: 8,
          paddingBottom: 8,
          height: 60,
        },
        tabBarLabelStyle: {
          fontSize: 11,
          fontWeight: '600',
          marginTop: 2,
        },
        headerShown: false,
      })}
    >
      <Tab.Screen name="Home" component={HomeScreen} options={{ tabBarLabel: '首页' }} />
      <Tab.Screen name="FoodChannel" component={FoodChannelScreen} options={{ tabBarLabel: '营养美食' }} />
      <Tab.Screen name="HealthPlanet" component={HealthPlanetScreen} options={{ tabBarLabel: '健康星球' }} />
      <Tab.Screen name="Profile" component={ProfileScreen} options={{ tabBarLabel: '我的' }} />
    </Tab.Navigator>
  );
};

export const AppNavigator = () => {
  const isOnboardingComplete = useAppStore((s) => s.isOnboardingComplete);

  return (
    <NavigationContainer>
      <Stack.Navigator
        screenOptions={{
          headerShown: false,
        }}
      >
        {!isOnboardingComplete ? (
          <Stack.Screen name="Onboarding" component={OnboardingScreen} />
        ) : (
          <>
            <Stack.Screen name="Login" component={LoginScreen}
              options={{ animation: 'slide_from_bottom' }}
            />
            <Stack.Screen name="Register" component={RegisterScreen}
              options={{ animation: 'slide_from_right' }}
            />
            <Stack.Screen name="MainTabs" component={MainTabs} />
            <Stack.Screen name="AdminDashboard" component={AdminDashboard}
              options={{
                headerShown: true,
                headerTitle: '管理后台',
                headerTintColor: Theme.colors.primary,
                headerStyle: { backgroundColor: '#fff' },
                animation: 'slide_from_right',
              }}
            />
            <Stack.Screen
              name="Camera"
              component={CameraScreen}
              options={{
                headerShown: true,
                headerTitle: '拍照识别',
                headerTintColor: Theme.colors.primary,
                headerStyle: { backgroundColor: '#fff' },
                animation: 'slide_from_bottom',
              }}
            />
            <Stack.Screen
              name="HealthDetail"
              component={HealthDetailScreen}
              options={{
                headerShown: false,
                animation: 'slide_from_right',
              }}
            />
            <Stack.Screen
              name="Meals"
              component={MealsScreen}
              options={{
                headerShown: true,
                headerTitle: '饮食记录',
                headerTintColor: Theme.colors.primary,
                headerStyle: { backgroundColor: '#fff' },
              }}
            />
            <Stack.Screen
              name="Recipes"
              component={RecipesScreen}
              options={{
                headerShown: true,
                headerTitle: '食谱推荐',
                headerTintColor: Theme.colors.primary,
                headerStyle: { backgroundColor: '#fff' },
              }}
            />
            <Stack.Screen
              name="Exercise"
              component={ExerciseScreen}
              options={{
                headerShown: true,
                headerTitle: '运动建议',
                headerTintColor: Theme.colors.primary,
                headerStyle: { backgroundColor: '#fff' },
              }}
            />
            <Stack.Screen
              name="Report"
              component={ReportScreen}
              options={{
                headerShown: false,
                animation: 'slide_from_right',
              }}
            />
            <Stack.Screen
              name="Assistant"
              component={AssistantScreen}
              options={{
                headerShown: false,
                presentation: 'modal',
              }}
            />
            <Stack.Screen
              name="RecipeDetail"
              component={RecipeDetailScreen}
              options={{
                headerShown: false,
              }}
            />
            <Stack.Screen
              name="CourseDetail"
              component={CourseDetailScreen}
              options={{
                headerShown: false,
              }}
            />
            <Stack.Screen
              name="PublishRecipe"
              component={PublishRecipeScreen}
              options={{
                headerShown: false,
              }}
            />
            <Stack.Screen
              name="BloggerRegister"
              component={BloggerRegisterScreen}
              options={{
                headerShown: false,
                animation: 'slide_from_right',
              }}
            />
            <Stack.Screen
              name="Membership"
              component={MembershipScreen}
              options={{
                headerShown: false,
                animation: 'slide_from_right',
              }}
            />
            <Stack.Screen
              name="CoursePublish"
              component={CoursePublishScreen}
              options={{
                headerShown: false,
                animation: 'slide_from_right',
              }}
            />
            <Stack.Screen
              name="HealthQuestionnaire"
              component={HealthQuestionnaireScreen}
              options={{
                headerShown: false,
                animation: 'slide_from_bottom',
              }}
            />
          </>
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
};
