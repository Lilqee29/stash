import React, { useState } from 'react';
import { View, Text, TextInput, Pressable, KeyboardAvoidingView, Platform, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { supabase } from '../../lib/supabase';
import { Button } from '../../components/Button';
import { FontAwesome5 } from '@expo/vector-icons';

export default function SignUpScreen() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleSignUp = async () => {
    if (!email || !password) {
      setErrorMessage('Please fill in all fields.');
      return;
    }
    
    setLoading(true);
    setErrorMessage(null);

    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
      });

      if (error) {
        setErrorMessage(error.message);
      } else {
        // Sign-up successful, go to how-found survey
        router.push('/(auth)/onboarding/how-found');
      }
    } catch (err: any) {
      setErrorMessage(err.message || 'An unexpected error occurred.');
    } finally {
      setLoading(false);
    }
  };

  const handleSocialAuth = (provider: string) => {
    // Placeholder for social auth
    setErrorMessage(`${provider} authentication is coming soon.`);
  };

  return (
    <SafeAreaView className="flex-1 bg-background-primary">
      <KeyboardAvoidingView 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'} 
        className="flex-1"
      >
        <ScrollView contentContainerStyle={{ flexGrow: 1, justifyContent: 'center', paddingHorizontal: 24, paddingVertical: 16 }}>
          
          {/* Header branding */}
          <View className="mb-6">
            <Text 
              className="text-white text-3xl font-syne tracking-tighter"
              style={{ fontFamily: 'Syne_700Bold', letterSpacing: -0.02 }}
            >
              Create Account
            </Text>
            <Text 
              className="text-textCustom-secondary text-sm font-dmsans mt-2"
              style={{ fontFamily: 'DMSans_400Regular' }}
            >
              Sign up to permanently save your organized stash.
            </Text>
          </View>

          <View className="my-6 space-y-4">
            {errorMessage && (
              <View className="bg-semantic-error/10 border border-semantic-error/30 p-4 rounded-xl mb-2">
                <Text className="text-semantic-error text-xs font-dmsans text-center" style={{ fontFamily: 'DMSans_400Regular' }}>
                  {errorMessage}
                </Text>
              </View>
            )}

            {/* Social Auth Buttons (Side by Side) */}
            <View className="flex-row justify-between w-full gap-4 mb-2">
              <Pressable
                onPress={() => handleSocialAuth('Apple')}
                className="flex-1 bg-white flex-row items-center justify-center py-3.5 rounded-[12px]"
              >
                <FontAwesome5 name="apple" size={18} color="black" className="mr-2" />
                <Text className="text-black font-dmsans font-medium text-sm ml-2" style={{ fontFamily: 'DMSans_500Medium' }}>
                  Apple
                </Text>
              </Pressable>

              <Pressable
                onPress={() => handleSocialAuth('Google')}
                className="flex-1 bg-background-secondary border border-borderCustom-subtle flex-row items-center justify-center py-3.5 rounded-[12px]"
              >
                <FontAwesome5 name="google" size={16} color="white" className="mr-2" />
                <Text className="text-white font-dmsans font-medium text-sm ml-2" style={{ fontFamily: 'DMSans_500Medium' }}>
                  Google
                </Text>
              </Pressable>
            </View>

            {/* Divider */}
            <View className="flex-row items-center my-4 opacity-60">
              <View className="flex-1 h-[1px] bg-borderCustom-subtle" />
              <Text className="mx-4 text-textCustom-tertiary text-xs font-dmsans" style={{ fontFamily: 'DMSans_400Regular' }}>OR</Text>
              <View className="flex-1 h-[1px] bg-borderCustom-subtle" />
            </View>

            {/* Email Field */}
            <View>
              <TextInput
                className="w-full bg-background-tertiary border border-borderCustom-subtle text-white px-4 py-3.5 rounded-[12px] font-dmsans text-sm focus:border-accent-base"
                style={{ fontFamily: 'DMSans_400Regular' }}
                placeholder="Email Address"
                placeholderTextColor="#555555"
                keyboardType="email-address"
                autoCapitalize="none"
                autoCorrect={false}
                value={email}
                onChangeText={setEmail}
              />
            </View>

            {/* Password Field */}
            <View className="mt-3 relative justify-center">
              <TextInput
                className="w-full bg-background-tertiary border border-borderCustom-subtle text-white px-4 py-3.5 pr-12 rounded-[12px] font-dmsans text-sm focus:border-accent-base"
                style={{ fontFamily: 'DMSans_400Regular' }}
                placeholder="Password"
                placeholderTextColor="#555555"
                secureTextEntry={!showPassword}
                autoCapitalize="none"
                autoCorrect={false}
                value={password}
                onChangeText={setPassword}
              />
              <Pressable 
                onPress={() => setShowPassword(!showPassword)}
                className="absolute right-4 p-1"
              >
                <FontAwesome5 name={showPassword ? "eye" : "eye-slash"} size={16} color="#888888" />
              </Pressable>
            </View>
          </View>

          {/* Actions Section */}
          <View className="space-y-4 mt-4">
            <Button 
              title="Sign Up" 
              onPress={handleSignUp} 
              loading={loading}
              variant="primary"
            />

            <View className="flex-row justify-center mt-4">
              <Text className="text-textCustom-secondary text-xs font-dmsans" style={{ fontFamily: 'DMSans_400Regular' }}>
                Already have an account?{' '}
              </Text>
              <Pressable onPress={() => router.push('/sign-in')}>
                <Text className="text-accent-bright text-xs font-dmsans font-medium" style={{ fontFamily: 'DMSans_500Medium' }}>
                  Log In
                </Text>
              </Pressable>
            </View>
          </View>

        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
