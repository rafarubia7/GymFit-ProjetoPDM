import React, { useState, useCallback, useRef } from 'react';
import { View, Text, TextInput, StyleSheet, Image, SafeAreaView, KeyboardAvoidingView, Platform, ScrollView, TouchableOpacity } from 'react-native';
import { useAuth } from '../contexts/AuthContext';
import { getItem, setItem } from '../utils/storage';
import { useNotification } from '../contexts/NotificationContext';

const objetivos = [
  { id: 'ganhar_massa', label: 'Ganhar Massa', icon: '💪', color: '#3B82F6' },
  { id: 'perder_peso', label: 'Perder Peso', icon: '🔥', color: '#EF4444' },
  { id: 'definicao', label: 'Definição', icon: '✨', color: '#10B981' },
  { id: 'forca', label: 'Força', icon: '⚡', color: '#F59E0B' },
  { id: 'resistencia', label: 'Resistência', icon: '🏃', color: '#8B5CF6' },
  { id: 'condicionamento', label: 'Condicionamento', icon: '❤️', color: '#EC4899' },
];

export default function CriarTreinoScreen() {
  const { currentUser, updateUser } = useAuth();
  const { showMessage } = useNotification();
  const scrollViewRef = useRef(null);
  const [nome, setNome] = useState('');
  const [descricao, setDescricao] = useState('');
  const [objetivo, setObjetivo] = useState('');
  const [tipo, setTipo] = useState('musculacao');
  const [duracao, setDuracao] = useState('');
  const [exercicios, setExercicios] = useState([]);
  const [exNome, setExNome] = useState('');
  const [exSeries, setExSeries] = useState('');
  const [exReps, setExReps] = useState('');
  const [loading, setLoading] = useState(false);

  const addExercicio = useCallback(() => {
    if (!exNome || !exSeries || !exReps) {
      showMessage('Preencha todos os campos do exercício', 'error');
      return;
    }
    setExercicios(prev => [...prev, { id: Date.now().toString(), nome: exNome, series: exSeries, repeticoes: exReps }]);
    setExNome('');
    setExSeries('');
    setExReps('');
    showMessage('Exercício adicionado!', 'success');
  }, [exNome, exSeries, exReps, showMessage]);

  const removeExercicio = (id) => {
    setExercicios(prev => prev.filter(e => e.id !== id));
    showMessage('Exercício removido', 'info');
  };

  const salvar = useCallback(async () => {
    if (!nome || !descricao || !objetivo || exercicios.length === 0) {
      showMessage('Preencha todos os campos e adicione pelo menos um exercício', 'error');
      return;
    }
    
    setLoading(true);
    try {
      const treinosString = await getItem('gymfit_treinos');
      const treinos = treinosString ? JSON.parse(treinosString) : [];
      const novoTreino = { id: Date.now(), nome, descricao, objetivo, tipo, duracao, exercicios, usuarioId: currentUser.id, dataCriacao: new Date().toISOString() };
      treinos.push(novoTreino);
      await setItem('gymfit_treinos', JSON.stringify(treinos));
      updateUser({ ...currentUser, xp: (currentUser.xp || 0) + 50 });
      setNome(''); setDescricao(''); setObjetivo(''); setTipo('musculacao'); setDuracao(''); setExercicios([]);
      showMessage('Treino salvo com sucesso! +50 XP', 'success');
    } catch (e) {
      showMessage('Erro ao salvar treino', 'error');
    } finally {
      setLoading(false);
    }
  }, [nome, descricao, objetivo, tipo, duracao, exercicios, currentUser, updateUser, showMessage]);

  const inputRefs = useRef({});

  const handleInputFocus = (inputName) => {
    setTimeout(() => {
      const inputRef = inputRefs.current[inputName];
      if (inputRef) {
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
        style={{ flex: 1 }} 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 20}
      >
        <ScrollView
          ref={scrollViewRef}
          contentContainerStyle={{ padding: 24 }}
          keyboardShouldPersistTaps="handled"
          keyboardDismissMode="none"
          showsVerticalScrollIndicator={false}
        >
          <View style={{ alignItems: 'center', marginBottom: 12 }}>
            <Image source={require('../assets/logo.png')} style={{ width: 56, height: 56, marginBottom: 8 }} />
            <Text style={styles.title}>Criar Treino</Text>
          </View>
          
          <TextInput 
            ref={(ref) => inputRefs.current.nome = ref}
            placeholder="Nome do treino" 
            value={nome} 
            onChangeText={setNome} 
            style={styles.input} 
            placeholderTextColor="#9CA3AF" 
            blurOnSubmit={false}
            onFocus={() => handleInputFocus('nome')}
            returnKeyType="next"
          />
          
          <TextInput 
            ref={(ref) => inputRefs.current.descricao = ref}
            placeholder="Descrição" 
            value={descricao} 
            onChangeText={setDescricao} 
            style={styles.input} 
            placeholderTextColor="#9CA3AF" 
            multiline 
            numberOfLines={3} 
            blurOnSubmit={false}
            onFocus={() => handleInputFocus('descricao')}
            returnKeyType="next"
          />
          
          <Text style={styles.label}>Objetivo do Treino</Text>
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

          <TextInput 
            ref={(ref) => inputRefs.current.tipo = ref}
            placeholder="Tipo (ex: musculacao, cardio, funcional)" 
            value={tipo} 
            onChangeText={setTipo} 
            style={styles.input} 
            placeholderTextColor="#9CA3AF" 
            blurOnSubmit={false}
            onFocus={() => handleInputFocus('tipo')}
            returnKeyType="next"
          />
          
          <Text style={styles.label}>Duração</Text>
          <View style={styles.row}>
            <TouchableOpacity style={[styles.stepBtn, { marginRight: 12 }]} onPress={() => setDuracao((p) => String(Math.max(0, (parseInt(p||'0',10)||0)-1)))}>
              <Text style={styles.stepBtnText}>-</Text>
            </TouchableOpacity>
            <View style={{ flex: 1, flexDirection: 'row', alignItems: 'center', marginRight: 12 }}>
              <TextInput 
                ref={(ref) => inputRefs.current.duracao = ref}
                placeholder="Minutos" 
                value={duracao} 
                onChangeText={setDuracao} 
                keyboardType="numeric" 
                style={[styles.input, { flex: 1, marginBottom: 0, marginRight: 8 }]} 
                placeholderTextColor="#9CA3AF" 
                blurOnSubmit={false}
                onFocus={() => handleInputFocus('duracao')}
                returnKeyType="next"
              />
              <Text style={styles.idadeLabel}>min</Text>
            </View>
            <TouchableOpacity style={styles.stepBtn} onPress={() => setDuracao((p) => String((parseInt(p||'0',10)||0)+1))}>
              <Text style={styles.stepBtnText}>+</Text>
            </TouchableOpacity>
          </View>

          <View style={{ height: 8 }} />
          <Text style={{ fontWeight: '700', marginBottom: 8, color: '#F9FAFB' }}>Adicionar exercício</Text>
          
          <TextInput 
            ref={(ref) => inputRefs.current.exNome = ref}
            placeholder="Nome do exercício" 
            value={exNome} 
            onChangeText={setExNome} 
            style={styles.input} 
            placeholderTextColor="#9CA3AF" 
            blurOnSubmit={false}
            onFocus={() => handleInputFocus('exNome')}
            returnKeyType="next"
          />
          
          <Text style={styles.label}>Séries</Text>
          <View style={styles.row}>
            <TouchableOpacity style={[styles.stepBtn, { marginRight: 12 }]} onPress={() => setExSeries((p) => String(Math.max(0, (parseInt(p||'0',10)||0)-1)))}>
              <Text style={styles.stepBtnText}>-</Text>
            </TouchableOpacity>
            <View style={{ flex: 1, flexDirection: 'row', alignItems: 'center', marginRight: 12 }}>
              <TextInput 
                ref={(ref) => inputRefs.current.exSeries = ref}
                placeholder="Séries" 
                value={exSeries} 
                onChangeText={setExSeries} 
                keyboardType="numeric" 
                style={[styles.input, { flex: 1, marginBottom: 0, marginRight: 8 }]} 
                placeholderTextColor="#9CA3AF" 
                blurOnSubmit={false}
                onFocus={() => handleInputFocus('exSeries')}
                returnKeyType="next"
              />
              <Text style={styles.idadeLabel}>séries</Text>
            </View>
            <TouchableOpacity style={styles.stepBtn} onPress={() => setExSeries((p) => String((parseInt(p||'0',10)||0)+1))}>
              <Text style={styles.stepBtnText}>+</Text>
            </TouchableOpacity>
          </View>

          <Text style={styles.label}>Repetições</Text>
          <View style={styles.row}>
            <TouchableOpacity style={[styles.stepBtn, { marginRight: 12 }]} onPress={() => setExReps((p) => String(Math.max(0, (parseInt(p||'0',10)||0)-1)))}>
              <Text style={styles.stepBtnText}>-</Text>
            </TouchableOpacity>
            <View style={{ flex: 1, flexDirection: 'row', alignItems: 'center', marginRight: 12 }}>
              <TextInput 
                ref={(ref) => inputRefs.current.exReps = ref}
                placeholder="Repetições" 
                value={exReps} 
                onChangeText={setExReps} 
                keyboardType="numeric" 
                style={[styles.input, { flex: 1, marginBottom: 0, marginRight: 8 }]} 
                placeholderTextColor="#9CA3AF" 
                blurOnSubmit={false}
                onFocus={() => handleInputFocus('exReps')}
                returnKeyType="done"
              />
              <Text style={styles.idadeLabel}>reps</Text>
            </View>
            <TouchableOpacity style={styles.stepBtn} onPress={() => setExReps((p) => String((parseInt(p||'0',10)||0)+1))}>
              <Text style={styles.stepBtnText}>+</Text>
            </TouchableOpacity>
          </View>
          
          <TouchableOpacity style={styles.secondaryBtn} onPress={addExercicio}>
            <Text style={styles.secondaryBtnText}>Adicionar</Text>
          </TouchableOpacity>

          {exercicios.map((item) => (
            <View key={item.id} style={[styles.item, { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }]}>
              <Text style={{ color: '#E5E7EB' }}>{item.nome} - {item.series}x {item.repeticoes}</Text>
              <TouchableOpacity onPress={() => removeExercicio(item.id)}>
                <Text style={{ color: '#F87171', fontWeight: '700' }}>Remover</Text>
              </TouchableOpacity>
            </View>
          ))}

          <TouchableOpacity style={styles.primaryBtn} onPress={salvar} disabled={loading}>
            <Text style={styles.primaryBtnText}>{loading ? 'Salvando...' : 'Salvar treino'}</Text>
          </TouchableOpacity>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#0B1220' },
  title: { fontSize: 20, fontWeight: '700', textAlign: 'center', marginBottom: 16, color: '#F9FAFB' },
  input: { backgroundColor: '#111827', borderWidth: 1, borderColor: '#374151', color: '#F9FAFB', borderRadius: 10, padding: 12, marginBottom: 12 },
  label: { fontSize: 14, fontWeight: '700', color: '#F9FAFB', marginBottom: 12, marginTop: 4 },
  row: { flexDirection: 'row', alignItems: 'center', marginBottom: 12 },
  idadeLabel: { color: '#9CA3AF', fontSize: 14, fontWeight: '600' },
  stepBtn: { width: 44, height: 44, borderRadius: 10, backgroundColor: '#1E293B', alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: '#374151' },
  stepBtnText: { color: '#E5E7EB', fontSize: 18, fontWeight: '800' },
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
  item: { padding: 12, borderWidth: 1, borderColor: '#1F2937', backgroundColor: '#0F172A', borderRadius: 8, marginBottom: 8 },
  secondaryBtn: { backgroundColor: '#1E293B', paddingVertical: 12, borderRadius: 10, alignItems: 'center', marginBottom: 12 },
  secondaryBtnText: { color: '#E5E7EB', fontWeight: '700' },
  primaryBtn: { backgroundColor: '#2563EB', paddingVertical: 14, borderRadius: 10, alignItems: 'center', marginTop: 8 },
  primaryBtnText: { color: '#FFFFFF', fontWeight: '700' }
});


