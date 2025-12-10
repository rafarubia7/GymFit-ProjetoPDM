import React, { useState } from 'react';
import { View, Text, TextInput, StyleSheet, TouchableOpacity, Image, SafeAreaView, ScrollView, KeyboardAvoidingView, Platform, ActivityIndicator } from 'react-native';
import { useAuth } from '../contexts/AuthContext';
import { useNotification } from '../contexts/NotificationContext';

export default function LoginScreen({ navigation }) {
  const { login } = useAuth();
  const { showMessage } = useNotification();
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    if (!email || !senha) {
      showMessage('Preencha todos os campos', 'error');
      return;
    }
    
    setLoading(true);
    try {
      await login(email, senha);
      showMessage('Login realizado com sucesso!', 'success');
    } catch (e) {
      showMessage(e.message || 'Erro ao fazer login', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.safe}>
      <KeyboardAvoidingView
        style={styles.container}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 0}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.header}>
            <Image source={require('../assets/logo.png')} style={styles.logo} resizeMode="contain" />
            <Text style={styles.appName}>GymFit</Text>
            <Text style={styles.subtitle}>Entre para continuar sua jornada</Text>
          </View>

          <View style={styles.card}>
            <TextInput
              placeholder="E-mail"
              value={email}
              onChangeText={setEmail}
              autoCapitalize="none"
              keyboardType="email-address"
              style={styles.input}
              placeholderTextColor="#9CA3AF"
              returnKeyType="next"
              blurOnSubmit={false}
            />
            <TextInput
              placeholder="Senha"
              value={senha}
              onChangeText={setSenha}
              style={styles.input}
              placeholderTextColor="#9CA3AF"
              returnKeyType="done"
              blurOnSubmit={false}
            />

            <TouchableOpacity style={[styles.primaryBtn, loading && styles.primaryBtnDisabled]} onPress={handleLogin} disabled={loading}>
              {loading ? (
                <ActivityIndicator color="#FFFFFF" />
              ) : (
                <Text style={styles.primaryBtnText}>Entrar</Text>
              )}
            </TouchableOpacity>

            <TouchableOpacity onPress={() => navigation.navigate('Cadastro')}>
              <Text style={styles.link}>Não tem conta? Cadastre-se</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#0B1220' },
  container: { flex: 1 },
  scrollContent: { flexGrow: 1, justifyContent: 'center', padding: 24 },
  header: { alignItems: 'center', marginBottom: 24 },
  logo: { width: 96, height: 96, marginBottom: 12 },
  appName: { fontSize: 24, fontWeight: '800', color: '#F9FAFB' },
  subtitle: { color: '#9CA3AF', marginTop: 4 },
  card: { backgroundColor: '#0F172A', borderRadius: 16, padding: 16, borderWidth: 1, borderColor: '#1F2937' },
  input: { backgroundColor: '#111827', borderWidth: 1, borderColor: '#374151', color: '#F9FAFB', borderRadius: 10, padding: 12, marginBottom: 12 },
  primaryBtn: { backgroundColor: '#2563EB', paddingVertical: 14, borderRadius: 10, alignItems: 'center', marginTop: 4, marginBottom: 12 },
  primaryBtnDisabled: { backgroundColor: '#6B7280' },
  primaryBtnText: { color: '#FFFFFF', fontWeight: '700' },
  link: { color: '#93C5FD', textAlign: 'center' }
});


