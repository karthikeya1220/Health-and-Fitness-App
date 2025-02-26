import React from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { StatusBar } from 'expo-status-bar';
import { useAuth, useOAuth, useSignIn } from '@clerk/clerk-expo';

export default function Login() {
  const { signIn, setActive, isLoaded } = useSignIn();
  const router = useRouter();
  const { startOAuthFlow } = useOAuth({ strategy: 'oauth_google' });
  const { isSignedIn } = useAuth();
  const [emailAddress, setEmailAddress] = React.useState('');
  const [password, setPassword] = React.useState('');
  const [loading, setLoading] = React.useState(false);

  // Redirect if the user is already signed in
  React.useEffect(() => {
    if (isLoaded && isSignedIn) {
      router.replace('/(tabs)'); // Redirect to home if already signed in
    }
  }, [isLoaded, isSignedIn, router]);

  const onSignInPress = React.useCallback(async () => {
    if (!isLoaded || !setActive) return;
  
    setLoading(true);
    try {
      const signInAttempt = await signIn.create({
        identifier: emailAddress,
        password,
      });
  
      if (signInAttempt.status === 'complete' && setActive) {
        await setActive({ session: signInAttempt.createdSessionId });
        router.replace('/(tabs)'); // Redirect to '/home' after login
      } else {
        console.error(JSON.stringify(signInAttempt, null, 2));
      }
    } catch (err: any) {
      console.error(JSON.stringify(err, null, 2));
    } finally {
      setLoading(false);
    }
  }, [isLoaded, setActive, emailAddress, password]);
  

  const onGoogleSignInPress = async () => {
    if (!setActive) return; // Ensure setActive is defined
  
    try {
      const { createdSessionId } = await startOAuthFlow();
      if (createdSessionId) {
        await setActive({ session: createdSessionId });
        router.replace('/(tabs)'); 
      }
    } catch (error) {
      console.error('OAuth error:', error);
    }
  };

  return (
    <View style={styles.container}>
      <StatusBar style="light" />
      
      <View style={styles.header}>
        <Text style={styles.title}>Welcome Back</Text>
        <Text style={styles.subtitle}>Sign in to continue your fitness journey</Text>
      </View>

      <View style={styles.form}>
        <View style={styles.inputContainer}>
          <Ionicons name="mail-outline" size={20} color="rgba(255,255,255,0.6)" />
          <TextInput
            style={styles.input}
            placeholder="Email"
            placeholderTextColor="rgba(255,255,255,0.6)"
            keyboardType="email-address"
            autoCapitalize="none"
            value={emailAddress}
            onChangeText={setEmailAddress}
          />
        </View>

        <View style={styles.inputContainer}>
          <Ionicons name="lock-closed-outline" size={20} color="rgba(255,255,255,0.6)" />
          <TextInput
            style={styles.input}
            placeholder="Password"
            placeholderTextColor="rgba(255,255,255,0.6)"
            secureTextEntry
            value={password}
            onChangeText={setPassword}
          />
        </View>

        <TouchableOpacity
          style={styles.forgotPassword}
          onPress={() => {}}>
          <Text style={styles.forgotPasswordText}>Forgot Password?</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.button}
          onPress={onSignInPress}
          disabled={loading}
          activeOpacity={0.8}>
          <Text style={styles.buttonText}>{loading ? 'Signing In...' : 'Sign In'}</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.googleButton}
          onPress={onGoogleSignInPress}
          activeOpacity={0.8}>
          <Ionicons name="logo-google" size={20} color="#fff" />
          <Text style={styles.googleButtonText}>Continue with Google</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.createAccount}
          onPress={() => router.push('/(auth)/register')}>
          <Text style={styles.createAccountText}>
            Don't have an account? <Text style={styles.createAccountTextBold}>Sign Up</Text>
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 24,
  },
  header: {
    marginTop: 60,
    marginBottom: 48,
  },
  title: {
    fontSize: 32,
    fontFamily: 'Inter-Bold',
    color: '#fff',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    fontFamily: 'Inter-Regular',
    color: 'rgba(255,255,255,0.6)',
  },
  form: {
    flex: 1,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1E1E1E',
    borderRadius: 12,
    paddingHorizontal: 16,
    marginBottom: 16,
    height: 56,
  },
  input: {
    flex: 1,
    marginLeft: 12,
    fontSize: 16,
    fontFamily: 'Inter-Regular',
    color: '#fff',
  },
  forgotPassword: {
    alignSelf: 'flex-end',
    marginBottom: 32,
  },
  forgotPasswordText: {
    color: '#4ADE80',
    fontSize: 14,
    fontFamily: 'Inter-Medium',
  },
  button: {
    backgroundColor: '#4ADE80',
    height: 56,
    borderRadius: 28,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 24,
  },
  buttonText: {
    color: '#121212',
    fontSize: 16,
    fontFamily: 'Inter-Bold',
  },
  googleButton: {
    backgroundColor: '#DB4437',
    height: 56,
    borderRadius: 28,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 24,
    flexDirection: 'row',
  },
  googleButtonText: {
    color: '#fff',
    fontSize: 16,
    fontFamily: 'Inter-Bold',
    marginLeft: 12,
  },
  createAccount: {
    alignItems: 'center',
  },
  createAccountText: {
    color: 'rgba(255,255,255,0.6)',
    fontSize: 14,
    fontFamily: 'Inter-Regular',
  },
  createAccountTextBold: {
    color: '#4ADE80',
    fontFamily: 'Inter-Bold',
  },
});
