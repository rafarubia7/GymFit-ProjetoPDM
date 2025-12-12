import React, { useEffect, useState, useRef } from 'react';
import { View, Text, TextInput, Button, StyleSheet, Image, SafeAreaView, ScrollView, KeyboardAvoidingView, Platform, TouchableOpacity } from 'react-native';
import { useAuth } from '../contexts/AuthContext';
import { useNotification } from '../contexts/NotificationContext';

export default function PerfilScreen({ navigation }) {
  const { currentUser, updateUser } = useAuth();
  const { showMessage } = useNotification();
  const [nome, setNome] = useState('');
  const [email, setEmail] = useState('');
  const [idade, setIdade] = useState('');
  const [objetivo, setObjetivo] = useState('');
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

  useEffect(() => {
    if (currentUser) {
      setNome(currentUser.nome || '');
      setEmail(currentUser.email || '');
      setIdade(String(currentUser.idade || ''));
      setObjetivo(currentUser.objetivo || '');
    }
  }, [currentUser]);

  const salvar = async () => {
    if (!nome || !email || !idade) {
      showMessage('Preencha todos os campos obrigatórios', 'error');
      return;
    }
    
    try {
      await updateUser({ ...currentUser, nome, email, idade: parseInt(idade), objetivo });
      showMessage('Perfil atualizado com sucesso!', 'success');
    } catch (e) {
      showMessage('Erro ao atualizar perfil', 'error');
    }
  };

  const handleInputFocus = (inputName) => {
    setTimeout(() => {
      if (scrollViewRef.current) {
        const scrollPositions = {
          'nome': 0,
          'email': 80,
          'idade': 160,
          'objetivo': 240,
        };
        const scrollY = scrollPositions[inputName] || 0;
        scrollViewRef.current?.scrollTo({
          y: scrollY,
          animated: true,
        });
      }
    }, 200);
  };

  return (
    <SafeAreaView style={styles.safe}>
      <KeyboardAvoidingView 
        style={styles.container} 
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 0}
      >
        <ScrollView 
          ref={scrollViewRef}
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={true}
          keyboardDismissMode="interactive"
        >
          <View style={{ alignItems: 'center', marginBottom: 24 }}>
            <Image source={require('../assets/logo.png')} style={{ width: 64, height: 64, marginBottom: 8 }} />
            <Text style={styles.title}>Meu Perfil</Text>
          </View>

          <View style={styles.xpCard}>
            <View style={styles.xpHeader}>
              <Text style={styles.xpIcon}>⭐</Text>
              <Text style={styles.xpLabel}>Pontuação Total</Text>
            </View>
            <Text style={styles.xpValue}>{currentUser?.xp || 0}</Text>
            <Text style={styles.xpSubtext}>XP acumulados</Text>
            <View style={styles.xpStats}>
              <View style={styles.xpStatItem}>
                <Text style={styles.xpStatLabel}>Nível</Text>
                <Text style={styles.xpStatValue}>{Math.floor((currentUser?.xp || 0) / 1000) + 1}</Text>
              </View>
              <View style={styles.xpStatDivider} />
              <View style={styles.xpStatItem}>
                <Text style={styles.xpStatLabel}>Próximo nível</Text>
                <Text style={styles.xpStatValue}>{((Math.floor((currentUser?.xp || 0) / 1000) + 1) * 1000) - (currentUser?.xp || 0)} XP</Text>
              </View>
            </View>
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
              style={styles.input} 
              placeholderTextColor="#9CA3AF" 
              blurOnSubmit={false}
              onFocus={() => handleInputFocus('email')}
              returnKeyType="next"
            />
            <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 12 }}>
              <TouchableOpacity style={{ width: 44, height: 44, borderRadius: 10, backgroundColor: '#1E293B', alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: '#374151', marginRight: 12 }} onPress={() => setIdade((p) => String(Math.max(0, (parseInt(p||'0',10)||0)-1)))}>
                <Text style={{ color: '#E5E7EB', fontSize: 18, fontWeight: '800' }}>-</Text>
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
              <TouchableOpacity style={{ width: 44, height: 44, borderRadius: 10, backgroundColor: '#1E293B', alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: '#374151' }} onPress={() => setIdade((p) => String((parseInt(p||'0',10)||0)+1))}>
                <Text style={{ color: '#E5E7EB', fontSize: 18, fontWeight: '800' }}>+</Text>
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
            <TouchableOpacity style={styles.primaryBtn} onPress={salvar}>
              <Text style={styles.primaryBtnText}>Salvar</Text>
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
  scrollContent: { padding: 24, paddingTop: 60, paddingBottom: 120 },
  title: { fontSize: 20, fontWeight: '700', textAlign: 'center', marginBottom: 4, color: '#F9FAFB' },
  xpCard: {
    backgroundColor: '#0F172A',
    borderRadius: 20,
    padding: 24,
    marginBottom: 20,
    borderWidth: 2,
    borderColor: '#F59E0B',
    shadowColor: '#F59E0B',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  xpHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  xpIcon: {
    fontSize: 24,
    marginRight: 8,
  },
  xpLabel: {
    color: '#9CA3AF',
    fontSize: 14,
    fontWeight: '600',
  },
  xpValue: {
    color: '#F59E0B',
    fontSize: 48,
    fontWeight: '800',
    textAlign: 'center',
    marginBottom: 4,
  },
  xpSubtext: {
    color: '#9CA3AF',
    fontSize: 12,
    textAlign: 'center',
    marginBottom: 16,
  },
  xpStats: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: '#1F2937',
  },
  xpStatItem: {
    alignItems: 'center',
    flex: 1,
  },
  xpStatDivider: {
    width: 1,
    backgroundColor: '#1F2937',
  },
  xpStatLabel: {
    color: '#9CA3AF',
    fontSize: 12,
    marginBottom: 4,
  },
  xpStatValue: {
    color: '#F9FAFB',
    fontSize: 16,
    fontWeight: '700',
  },
  card: { backgroundColor: '#0F172A', borderRadius: 16, padding: 16, borderWidth: 1, borderColor: '#1F2937' },
  input: { backgroundColor: '#111827', borderWidth: 1, borderColor: '#374151', color: '#F9FAFB', borderRadius: 10, padding: 12, marginBottom: 12 },
  idadeLabel: { color: '#9CA3AF', fontSize: 14, fontWeight: '600' },
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
  primaryBtn: { backgroundColor: '#2563EB', paddingVertical: 14, borderRadius: 10, alignItems: 'center', marginTop: 4 },
  primaryBtnText: { color: '#FFFFFF', fontWeight: '700' },
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


