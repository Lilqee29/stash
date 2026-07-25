import React, { useState } from 'react';
import { View, Text, TextInput, Pressable, KeyboardAvoidingView, Platform, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { supabase } from '../../lib/supabase';
import { useStore } from '../../hooks/useStore';
import { Button } from '../../components/Button';
import { Image } from 'react-native';

export default function SignInScreen() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleSignIn = async () => {
    if (!email || !password) {
      setErrorMessage('Please fill in all fields.');
      return;
    }
    
    setLoading(true);
    setErrorMessage(null);

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        setErrorMessage(error.message);
      } else {
        // Proceed to next step in onboarding
        router.push('/(auth)/onboarding/how-found');
      }
    } catch (err: any) {
      setErrorMessage(err.message || 'An unexpected error occurred.');
    } finally {
      setLoading(false);
    }
  };

  // Safe developer bypass to facilitate onboarding reviews
  const handleDeveloperBypass = () => {
    useStore.getState().completeOnboarding();
    router.replace('/(tabs)/home');
  };

  return (
    <SafeAreaView className="flex-1 bg-background-primary">
      <KeyboardAvoidingView 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'} 
        className="flex-1"
      >
        <ScrollView contentContainerStyle={{ flexGrow: 1, justifyContent: 'space-between', paddingHorizontal: 24, paddingVertical: 24 }}>
          
          {/* Header branding */}
          <View className="items-center mt-6">
            <Image 
              source={require('../../icon.jpeg')} 
              style={{ width: 88, height: 88, borderRadius: 24, marginBottom: 8 }} 
            />
            <Text 
              className="text-white text-2xl font-syne mt-4 tracking-tighter"
              style={{ fontFamily: 'PlusJakartaSans_700Bold', letterSpacing: -0.02 }}
            >
              Welcome back
            </Text>
            <Text 
              className="text-textCustom-secondary text-sm font-dmsans mt-1"
              style={{ fontFamily: 'Inter_400Regular' }}
            >
              Log in to retrieve your saves.
            </Text>
          </View>

          {/* Form inputs */}
          <View className="my-8 space-y-4">
            {errorMessage && (
              <View className="bg-semantic-error/10 border border-semantic-error/30 p-4 rounded-xl mb-2">
                <Text className="text-semantic-error text-xs font-dmsans text-center" style={{ fontFamily: 'Inter_400Regular' }}>
                  {errorMessage}
                </Text>
              </View>
            )}

            {/* Email Field */}
            <View>
              <Text className="text-textCustom-secondary text-[11px] font-dmsans mb-1.5 font-medium uppercase tracking-wider" style={{ fontFamily: 'Inter_500Medium' }}>
                Email Address
              </Text>
              <TextInput
                className="w-full bg-background-tertiary border border-borderCustom-subtle text-white px-4 py-3.5 rounded-[12px] font-dmsans text-sm focus:border-accent-base"
                style={{ fontFamily: 'Inter_400Regular' }}
                placeholder="Enter your email"
                placeholderTextColor="#555555"
                keyboardType="email-address"
                autoCapitalize="none"
                autoCorrect={false}
                value={email}
                onChangeText={setEmail}
              />
            </View>

            {/* Password Field */}
            <View className="mt-4">
              <Text className="text-textCustom-secondary text-[11px] font-dmsans mb-1.5 font-medium uppercase tracking-wider" style={{ fontFamily: 'Inter_500Medium' }}>
                Password
              </Text>
              <TextInput
                className="w-full bg-background-tertiary border border-borderCustom-subtle text-white px-4 py-3.5 rounded-[12px] font-dmsans text-sm focus:border-accent-base"
                style={{ fontFamily: 'Inter_400Regular' }}
                placeholder="Enter your password"
                placeholderTextColor="#555555"
                secureTextEntry
                autoCapitalize="none"
                autoCorrect={false}
                value={password}
                onChangeText={setPassword}
              />
            </View>
          </View>

          {/* Actions Section */}
          <View className="space-y-4 mt-auto">
            <Button 
              title="Sign In" 
              onPress={handleSignIn} 
              loading={loading}
              variant="primary"
            />

            {/* Offline developer access button */}
            <Pressable 
              onPress={handleDeveloperBypass}
              className="py-3 items-center"
            >
              <Text className="text-accent-bright font-dmsans text-xs underline font-medium" style={{ fontFamily: 'Inter_500Medium' }}>
                Skip Authentication (Demo Mode) →
              </Text>
            </Pressable>

            <View className="flex-row justify-center mt-4">
              <Text className="text-textCustom-secondary text-xs font-dmsans" style={{ fontFamily: 'Inter_400Regular' }}>
                Don't have an account?{' '}
              </Text>
              <Pressable onPress={() => router.push('/sign-up')}>
                <Text className="text-accent-bright text-xs font-dmsans font-medium" style={{ fontFamily: 'Inter_500Medium' }}>
                  Sign Up
                </Text>
              </Pressable>
            </View>
          </View>

        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
