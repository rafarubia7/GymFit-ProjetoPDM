import React, { useState, useRef } from 'react';
import { View, Text, TextInput, StyleSheet, Image, SafeAreaView, TouchableOpacity, ScrollView, KeyboardAvoidingView, Platform, ActivityIndicator } from 'react-native';
import { useAuth } from '../contexts/AuthContext';
import { useNotification } from '../contexts/NotificationContext';

export default function CadastroScreen({ navigation }) {
  const { cadastro } = useAuth();
  const { showMessage } = useNotification();
  const [nome, setNome] = useState('');
  const [email, setEmail] = useState('');
  const [idade, setIdade] = useState('');
  const [objetivo, setObjetivo] = useState('');
  const [senha, setSenha] = useState('');
  const [confirmarSenha, setConfirmarSenha] = useState('');
  const [showSenha, setShowSenha] = useState(false);
  const [showConfirmarSenha, setShowConfirmarSenha] = useState(false);
  const [loading, setLoading] = useState(false);
  const scrollViewRef = useRef(null);
  const inputRefs = useRef({});

  const objetivos = [
    { id: 'ganhar_massa', label: 'Ganhar Massa', icon: '💪', color: '#3B82F6' },
    { id: 'perder_peso', label: 'Perder Peso', icon: '🔥', color: '#EF4444' },
    { id: 'definicao', label: 'Definição', icon: '✨', color: '#10B981' },
    { id: 'forca', label: 'Força', icon: '⚡', color: '#F59E0B' },
    { id: 'resistencia', label: 'Resistência', icon: '🏃', color: '#8B5CF6' },
    { id: 'condicionamento', label: 'Condicionamento', icon: '❤️', color: '#EC4899' },
  ];
  const handleSubmit = async () => {
    if (!nome || !email || !idade || !objetivo || !senha || !confirmarSenha) {
      showMessage('Preencha todos os campos', 'error');
      return;
    }
    
    if (senha !== confirmarSenha) {
      showMessage('As senhas não coincidem!', 'error');
      return;
    }
    
    if (senha.length < 6) {
      showMessage('A senha deve ter pelo menos 6 caracteres!', 'error');
      return;
    }
    
    setLoading(true);

    try {
      await cadastro({
        nome,
        email,
        senha,
        idade: parseInt(idade),
        objetivo
      });
      showMessage('Conta criada com sucesso!', 'success');
      // Não precisa navegar, o AuthContext já atualiza o currentUser
    } catch (e) {
      showMessage(e.message || 'Erro ao criar conta', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleInputFocus = (inputName) => {
    setTimeout(() => {
      const inputRef = inputRefs.current[inputName];
      if (inputRef && scrollViewRef.current) {
        inputRef.measure((x, y, width, height, pageX, pageY) => {
          scrollViewRef.current?.scrollTo({
            y: pageY - 150,
            animated: true,
          });
        });
      }
    }, 200);
  };

  return (
    <SafeAreaView style={styles.safe}>
      <KeyboardAvoidingView
        style={styles.container}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 20}
      >
        <ScrollView 
          ref={scrollViewRef}
          contentContainerStyle={[styles.scrollContent, { paddingTop: 60, paddingBottom: 120 }]} 
          keyboardShouldPersistTaps="handled" 
          showsVerticalScrollIndicator={true}
          keyboardDismissMode="interactive"
        >
          <View style={styles.header}>
            <Image source={require('../assets/logo.png')} style={styles.logo} resizeMode="contain" />
            <Text style={styles.appName}>Criar sua conta</Text>
            <Text style={styles.subtitle}>Comece sua transformação</Text>
          </View>

          <View style={styles.card}>
            <TextInput 
              ref={(ref) => inputRefs.current.nome = ref}
              placeholder="Nome" 
              value={nome} 
              onChangeText={setNome} 
              style={styles.input} 
              placeholderTextColor="#9CA3AF" 
              blurOnSubmit={false}
              onFocus={() => handleInputFocus('nome')}
              returnKeyType="next"
            />
            <TextInput 
              ref={(ref) => inputRefs.current.email = ref}
              placeholder="E-mail" 
              value={email} 
              onChangeText={setEmail} 
              autoCapitalize="none" 
              keyboardType="email-address" 
              style={styles.input} 
              placeholderTextColor="#9CA3AF" 
              blurOnSubmit={false}
              onFocus={() => handleInputFocus('email')}
              returnKeyType="next"
            />
            <View style={styles.row}>
              <TouchableOpacity style={[styles.stepBtn, { marginRight: 12 }]} onPress={() => setIdade((p) => String(Math.max(0, (parseInt(p||'0',10)||0)-1)))}>
                <Text style={styles.stepBtnText}>-</Text>
              </TouchableOpacity>
              <View style={{ flex: 1, flexDirection: 'row', alignItems: 'center', marginRight: 12 }}>
                <TextInput 
                  ref={(ref) => inputRefs.current.idade = ref}
                  placeholder="Idade" 
                  value={idade} 
                  onChangeText={setIdade} 
                  keyboardType="number-pad" 
                  style={[styles.input, { flex: 1, marginBottom: 0, marginRight: 8 }]} 
                  placeholderTextColor="#9CA3AF" 
                  blurOnSubmit={false}
                  onFocus={() => handleInputFocus('idade')}
                  returnKeyType="next"
                />
                <Text style={styles.idadeLabel}>anos</Text>
              </View>
              <TouchableOpacity style={styles.stepBtn} onPress={() => setIdade((p) => String((parseInt(p||'0',10)||0)+1))}>
                <Text style={styles.stepBtnText}>+</Text>
              </TouchableOpacity>
            </View>
            <Text style={styles.label}>Seu Objetivo</Text>
            <View style={styles.objetivosContainer}>
              {objetivos.map((obj) => (
                <TouchableOpacity
                  key={obj.id}
                  style={[
                    styles.objetivoBtn,
                    objetivo === obj.id && { backgroundColor: obj.color, borderColor: obj.color },
                    objetivo === obj.id && styles.objetivoBtnSelected
                  ]}
                  onPress={() => setObjetivo(obj.id)}
                >
                  <Text style={styles.objetivoIcon}>{obj.icon}</Text>
                  <Text style={[
                    styles.objetivoText,
                    objetivo === obj.id && styles.objetivoTextSelected
                  ]}>
                    {obj.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
            <View style={styles.passwordContainer}>
              <TextInput
                ref={(ref) => inputRefs.current.senha = ref}
                placeholder="Senha"
                value={senha}
                onChangeText={setSenha}
                style={styles.passwordInput}
                placeholderTextColor="#9CA3AF"
                blurOnSubmit={false}
                secureTextEntry={!showSenha}
                onFocus={() => handleInputFocus('senha')}
                returnKeyType="next"
              />
              <TouchableOpacity
                style={styles.eyeButton}
                onPress={() => setShowSenha(!showSenha)}
              >
                <Text style={styles.eyeIcon}>{showSenha ? '👁️' : '👁️‍🗨️'}</Text>
              </TouchableOpacity>
            </View>
            <View style={styles.passwordContainer}>
              <TextInput
                ref={(ref) => inputRefs.current.confirmarSenha = ref}
                placeholder="Confirmar Senha"
                value={confirmarSenha}
                onChangeText={setConfirmarSenha}
                style={styles.passwordInput}
                placeholderTextColor="#9CA3AF"
                blurOnSubmit={false}
                secureTextEntry={!showConfirmarSenha}
                onFocus={() => handleInputFocus('confirmarSenha')}
                returnKeyType="done"
              />
              <TouchableOpacity
                style={styles.eyeButton}
                onPress={() => setShowConfirmarSenha(!showConfirmarSenha)}
              >
                <Text style={styles.eyeIcon}>{showConfirmarSenha ? '👁️' : '👁️‍🗨️'}</Text>
              </TouchableOpacity>
            </View>

            <TouchableOpacity style={styles.primaryBtn} onPress={handleSubmit} disabled={loading}>
              <Text style={styles.primaryBtnText}>{loading ? 'Cadastrando...' : 'Cadastrar'}</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
      
      <View style={styles.backButtonContainer}>
        <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
          <Text style={styles.backButtonText}>← Voltar</Text>
        </TouchableOpacity>
      </View>
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
  passwordContainer: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#111827', borderWidth: 1, borderColor: '#374151', borderRadius: 10, marginBottom: 12 },
  passwordInput: { flex: 1, color: '#F9FAFB', padding: 12 },
  eyeButton: { padding: 12, paddingLeft: 8 },
  eyeIcon: { fontSize: 20 },
  label: { fontSize: 14, fontWeight: '700', color: '#F9FAFB', marginBottom: 12, marginTop: 4 },
  objetivosContainer: { 
    flexDirection: 'row', 
    flexWrap: 'wrap', 
    marginBottom: 12,
    marginHorizontal: -4
  },
  objetivoBtn: {
    backgroundColor: '#111827',
    borderWidth: 2,
    borderColor: '#374151',
    borderRadius: 12,
    padding: 12,
    alignItems: 'center',
    justifyContent: 'center',
    margin: 4,
    width: '47%'
  },
  objetivoBtnSelected: {
    borderWidth: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 5,
  },
  objetivoIcon: {
    fontSize: 24,
    marginBottom: 4
  },
  objetivoText: {
    color: '#9CA3AF',
    fontSize: 12,
    fontWeight: '600',
    textAlign: 'center'
  },
  objetivoTextSelected: {
    color: '#FFFFFF',
    fontWeight: '700'
  },
  row: { flexDirection: 'row', alignItems: 'center', marginBottom: 12 },
  idadeLabel: { color: '#9CA3AF', fontSize: 14, fontWeight: '600' },
  stepBtn: { width: 44, height: 44, borderRadius: 10, backgroundColor: '#1E293B', alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: '#374151' },
  stepBtnText: { color: '#E5E7EB', fontSize: 18, fontWeight: '800' },
  primaryBtn: { backgroundColor: '#10B981', paddingVertical: 14, borderRadius: 10, alignItems: 'center', marginTop: 4, marginBottom: 12 },
  primaryBtnText: { color: '#FFFFFF', fontWeight: '700' },
  error: { color: '#F87171', textAlign: 'center', marginBottom: 12 },
  backButtonContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: '#0F172A',
    borderTopWidth: 1,
    borderTopColor: '#1F2937',
    paddingVertical: 12,
    paddingHorizontal: 24,
    paddingBottom: Platform.OS === 'ios' ? 20 : 12,
  },
  backButton: {
    backgroundColor: '#1E293B',
    paddingVertical: 12,
    borderRadius: 10,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#374151',
  },
  backButtonText: {
    color: '#E5E7EB',
    fontWeight: '700',
    fontSize: 16,
  },
});


