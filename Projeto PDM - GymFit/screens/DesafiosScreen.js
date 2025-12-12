import React, { useEffect, useState, useCallback, useRef } from 'react';
import { View, Text, StyleSheet, Image, SafeAreaView, KeyboardAvoidingView, Platform, ScrollView, TouchableOpacity, TextInput } from 'react-native';
import { useAuth } from '../contexts/AuthContext';
import { getItem, setItem } from '../utils/storage';
import { useNotification } from '../contexts/NotificationContext';

const tiposDesafio = [
  { id: 'treinos', label: 'Treinos', icon: '💪', color: '#3B82F6', desc: 'Complete X treinos' },
  { id: 'dias_consecutivos', label: 'Dias Consecutivos', icon: '🔥', color: '#EF4444', desc: 'Treine X dias seguidos' },
  { id: 'exercicios', label: 'Exercícios', icon: '⚡', color: '#F59E0B', desc: 'Complete X exercícios' },
  { id: 'tempo', label: 'Tempo Total', icon: '⏱️', color: '#10B981', desc: 'Acumule X minutos de treino' },
  { id: 'personalizado', label: 'Personalizado', icon: '✨', color: '#8B5CF6', desc: 'Crie seu próprio desafio' },
];

const recompensasXP = [50, 100, 150, 200, 300, 500];

export default function DesafiosScreen({ navigation }) {
  const { currentUser, updateUser } = useAuth();
  const { showMessage } = useNotification();
  const scrollViewRef = useRef(null);
  const [desafios, setDesafios] = useState([]);
  const [loading, setLoading] = useState(true);
  const [nome, setNome] = useState('');
  const [descricao, setDescricao] = useState('');
  const [meta, setMeta] = useState('');
  const [tipo, setTipo] = useState('treinos');
  const [xpRecompensa, setXpRecompensa] = useState(100);

  useEffect(() => {
    (async () => {
      const desafiosString = await getItem('gymfit_desafios');
      const saved = desafiosString ? JSON.parse(desafiosString) : [];
      setDesafios(saved);
      setLoading(false);
    })();
  }, [currentUser]);

  const iniciar = async (id) => {
    const next = desafios.map(d => 
      d.id === id ? { 
        ...d, 
        status: 'em_andamento', 
        participantes: [ ...(d.participantes||[]), currentUser.id ],
        treinosCompletados: d.treinosCompletados || [],
        progresso: d.progresso || 0
      } : d
    );
    setDesafios(next);
    await setItem('gymfit_desafios', JSON.stringify(next));
    showMessage('Desafio iniciado!', 'success');
  };
  
  const marcarTreino = async (desafioId, treinoId) => {
    const desafio = desafios.find(d => d.id === desafioId);
    if (!desafio) return;
    
    const treinosCompletados = desafio.treinosCompletados || [];
    const jaCompleto = treinosCompletados.includes(treinoId);
    
    let novosTreinosCompletados;
    if (jaCompleto) {
      // Desmarcar treino
      novosTreinosCompletados = treinosCompletados.filter(id => id !== treinoId);
    } else {
      // Marcar treino
      novosTreinosCompletados = [...treinosCompletados, treinoId];
    }
    
    const novoProgresso = novosTreinosCompletados.length;
    const metaNum = parseInt(desafio.meta) || 1;
    
    const next = desafios.map(d => 
      d.id === desafioId ? {
        ...d,
        treinosCompletados: novosTreinosCompletados,
        progresso: novoProgresso,
        status: novoProgresso >= metaNum ? 'pronto_para_concluir' : 'em_andamento'
      } : d
    );
    
    setDesafios(next);
    await setItem('gymfit_desafios', JSON.stringify(next));
    
    if (novoProgresso >= metaNum && !jaCompleto) {
      showMessage(`Meta atingida! Você pode concluir o desafio agora!`, 'success');
    } else if (jaCompleto) {
      showMessage('Treino desmarcado', 'info');
    } else {
      showMessage(`Treino marcado! ${novoProgresso}/${metaNum}`, 'success');
    }
  };
  const criar = useCallback(async () => {
    if (!nome || !descricao || !meta) {
      showMessage('Preencha todos os campos', 'error');
      return;
    }
    
    const novo = { 
      id: Date.now(), 
      nome, 
      descricao, 
      meta, 
      tipo, 
      status: 'disponivel', 
      criadorId: currentUser.id, 
      criadorNome: currentUser.nome || 'Usuário',
      participantes: [], 
      xpRecompensa,
      progresso: 0,
      dataCriacao: new Date().toISOString() 
    };
    const next = [...desafios, novo];
    setDesafios(next);
    await setItem('gymfit_desafios', JSON.stringify(next));
    setNome(''); setDescricao(''); setMeta(''); setTipo('treinos'); setXpRecompensa(100);
    showMessage('Desafio criado com sucesso!', 'success');
  }, [nome, descricao, meta, tipo, xpRecompensa, desafios, currentUser, showMessage]);

  const concluir = async (id) => {
    const desafio = desafios.find(d => d.id === id);
    if (!desafio) return;
    
    const metaNum = parseInt(desafio.meta) || 1;
    const progresso = desafio.progresso || 0;
    
    if (progresso < metaNum) {
      showMessage(`Você precisa completar ${metaNum} treinos para concluir este desafio!`, 'error');
      return;
    }
    
    const next = desafios.map(d => 
      d.id === id ? { 
        ...d, 
        status: 'concluido', 
        dataConclusao: new Date().toISOString() 
      } : d
    );
    setDesafios(next);
    await setItem('gymfit_desafios', JSON.stringify(next));
    
    const xpGanho = desafio.xpRecompensa || 100;
    updateUser({ ...currentUser, xp: (currentUser.xp || 0) + xpGanho });
    showMessage(`Desafio concluído! +${xpGanho} XP`, 'success');
  };

  const inputRefs = useRef({});

  const handleInputFocus = (inputName) => {
    setTimeout(() => {
      if (scrollViewRef.current) {
        const scrollPositions = {
          'nome': 0,
          'descricao': 100,
          'meta': 300,
        };
        const scrollY = scrollPositions[inputName] || 0;
        scrollViewRef.current?.scrollTo({
          y: scrollY,
          animated: true,
        });
      }
    }, 200);
  };

  if (loading) {
    return <SafeAreaView style={styles.safe}><View style={styles.container}><Text style={{ color: '#E5E7EB' }}>Carregando...</Text></View></SafeAreaView>;
  }

  return (
    <SafeAreaView style={styles.safe}>
      <KeyboardAvoidingView 
        style={{ flex: 1 }} 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 20}
      >
        <ScrollView
          ref={scrollViewRef}
          contentContainerStyle={{ padding: 24, paddingTop: 60, paddingBottom: 120 }}
          keyboardShouldPersistTaps="handled"
          keyboardDismissMode="interactive"
          showsVerticalScrollIndicator={true}
        >
          <View style={{ alignItems: 'center', marginBottom: 24 }}>
            <Image source={require('../assets/logo.png')} style={{ width: 72, height: 72, marginBottom: 12 }} />
            <Text style={styles.mainTitle}>Desafios</Text>
            <Text style={styles.subtitle}>Crie e participe de desafios para ganhar XP!</Text>
          </View>

          <View style={styles.createCard}>
            <View style={styles.cardHeader}>
              <Text style={styles.cardTitle}>✨ Criar Novo Desafio</Text>
            </View>
            
            <Text style={styles.label}>Nome do Desafio</Text>
            <TextInput 
              ref={(ref) => inputRefs.current.nome = ref}
              placeholder="Ex: Desafio 30 Dias" 
              value={nome} 
              onChangeText={setNome} 
              style={styles.input} 
              placeholderTextColor="#9CA3AF" 
              blurOnSubmit={false}
              onFocus={() => handleInputFocus('nome')}
              returnKeyType="next"
            />
            
            <Text style={styles.label}>Descrição</Text>
            <TextInput 
              ref={(ref) => inputRefs.current.descricao = ref}
              placeholder="Descreva o desafio e seus objetivos..." 
              value={descricao} 
              onChangeText={setDescricao} 
              style={[styles.input, styles.textArea]} 
              placeholderTextColor="#9CA3AF" 
              multiline
              numberOfLines={3}
              blurOnSubmit={false}
              onFocus={() => handleInputFocus('descricao')}
              returnKeyType="next"
            />
            
            <Text style={styles.label}>Tipo de Desafio</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.tiposContainer}>
              {tiposDesafio.map((t) => (
                <TouchableOpacity
                  key={t.id}
                  style={[
                    styles.tipoBtn,
                    tipo === t.id && { backgroundColor: t.color, borderColor: t.color },
                    tipo === t.id && styles.tipoBtnSelected
                  ]}
                  onPress={() => setTipo(t.id)}
                >
                  <Text style={styles.tipoIcon}>{t.icon}</Text>
                  <Text style={[styles.tipoText, tipo === t.id && styles.tipoTextSelected]}>
                    {t.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
            
            <Text style={styles.label}>Meta</Text>
            <TextInput 
              ref={(ref) => inputRefs.current.meta = ref}
              placeholder={tiposDesafio.find(t => t.id === tipo)?.desc || "Ex: 10 treinos"} 
              value={meta} 
              onChangeText={setMeta} 
              style={styles.input} 
              placeholderTextColor="#9CA3AF" 
              keyboardType="numeric"
              blurOnSubmit={false}
              onFocus={() => handleInputFocus('meta')}
              returnKeyType="done"
            />
            
            <Text style={styles.label}>Recompensa de XP</Text>
            <View style={styles.xpContainer}>
              {recompensasXP.map((xp) => (
                <TouchableOpacity
                  key={xp}
                  style={[
                    styles.xpBtn,
                    xpRecompensa === xp && styles.xpBtnSelected
                  ]}
                  onPress={() => setXpRecompensa(xp)}
                >
                  <Text style={[styles.xpText, xpRecompensa === xp && styles.xpTextSelected]}>
                    {xp} XP
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
            
            <TouchableOpacity style={styles.createBtn} onPress={criar}>
              <Text style={styles.createBtnText}>🚀 Criar Desafio</Text>
            </TouchableOpacity>
          </View>

          <Text style={styles.sectionTitle}>📋 Meus Desafios</Text>
          
          {desafios.length === 0 ? (
            <View style={styles.emptyState}>
              <Text style={styles.emptyIcon}>🎯</Text>
              <Text style={styles.emptyText}>Nenhum desafio criado ainda</Text>
              <Text style={styles.emptySubtext}>Crie seu primeiro desafio acima!</Text>
            </View>
          ) : (
            desafios.map((item) => {
              const tipoInfo = tiposDesafio.find(t => t.id === item.tipo) || tiposDesafio[4];
              const statusInfo = {
                disponivel: { label: 'Disponível', color: '#3B82F6', icon: '⏳' },
                em_andamento: { label: 'Em Andamento', color: '#10B981', icon: '🔥' },
                concluido: { label: 'Concluído', color: '#6B7280', icon: '✅' }
              };
              const statusInfoCompleto = {
                ...statusInfo,
                pronto_para_concluir: { label: 'Pronto para Concluir', color: '#10B981', icon: '✅' }
              };
              const status = statusInfoCompleto[item.status] || statusInfoCompleto.disponivel;
              const progresso = item.progresso || 0;
              const metaNum = parseInt(item.meta) || 1;
              const porcentagem = Math.min((progresso / metaNum) * 100, 100);
              const treinosCompletados = item.treinosCompletados || [];
              
              return (
                <View key={item.id} style={styles.challengeCard}>
                  <View style={styles.challengeHeader}>
                    <View style={styles.challengeTitleRow}>
                      <Text style={styles.challengeIcon}>{tipoInfo.icon}</Text>
                      <View style={{ flex: 1 }}>
                        <Text style={styles.challengeTitle}>{item.nome}</Text>
                        <Text style={styles.challengeCreator}>por {item.criadorNome || 'Usuário'}</Text>
                      </View>
                    </View>
                    <View style={[styles.statusBadge, { backgroundColor: status.color + '20', borderColor: status.color }]}>
                      <Text style={[styles.statusText, { color: status.color }]}>
                        {status.icon} {status.label}
                      </Text>
                    </View>
                  </View>
                  
                  <Text style={styles.challengeDesc}>{item.descricao}</Text>
                  
                  <View style={styles.challengeMeta}>
                    <View style={styles.metaItem}>
                      <Text style={styles.metaLabel}>Meta:</Text>
                      <Text style={styles.metaValue}>{item.meta} {tipoInfo.label}</Text>
                    </View>
                    <View style={styles.metaItem}>
                      <Text style={styles.metaLabel}>Recompensa:</Text>
                      <Text style={[styles.metaValue, { color: '#F59E0B' }]}>⭐ {item.xpRecompensa || 100} XP</Text>
                    </View>
                  </View>
                  
                  {(item.status === 'em_andamento' || item.status === 'pronto_para_concluir') && (
                    <View style={styles.progressContainer}>
                      <View style={styles.progressBar}>
                        <View style={[styles.progressFill, { width: `${porcentagem}%`, backgroundColor: tipoInfo.color }]} />
                      </View>
                      <Text style={styles.progressText}>
                        {progresso} / {item.meta} ({Math.round(porcentagem)}%)
                      </Text>
                      {item.tipo === 'treinos' && (
                        <Text style={styles.progressHint}>
                          💡 Treinos são marcados automaticamente quando você os completa!
                        </Text>
                      )}
                    </View>
                  )}
                  
                  {item.status !== 'concluido' && (
                    <View style={styles.challengeActions}>
                      {item.status !== 'em_andamento' && item.status !== 'pronto_para_concluir' ? (
                        <TouchableOpacity 
                          style={[styles.actionBtn, { backgroundColor: tipoInfo.color }]} 
                          onPress={() => iniciar(item.id)}
                        >
                          <Text style={styles.actionBtnText}>🚀 Iniciar Desafio</Text>
                        </TouchableOpacity>
                      ) : (
                        <TouchableOpacity 
                          style={[
                            styles.completeBtn,
                            item.status === 'pronto_para_concluir' && styles.completeBtnReady
                          ]} 
                          onPress={() => concluir(item.id)}
                        >
                          <Text style={styles.completeBtnText}>
                            {item.status === 'pronto_para_concluir' ? '🎉 Concluir Desafio' : '✅ Concluir Desafio'}
                          </Text>
                        </TouchableOpacity>
                      )}
                    </View>
                  )}
                  
                  {item.status === 'concluido' && (
                    <View style={styles.completedBadge}>
                      <Text style={styles.completedText}>🎉 Desafio Concluído!</Text>
                    </View>
                  )}
                </View>
              );
            })
          )}
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
  container: { flex: 1, padding: 24 },
  mainTitle: { color: '#F9FAFB', fontSize: 28, fontWeight: '800', marginBottom: 4 },
  subtitle: { color: '#9CA3AF', fontSize: 14, textAlign: 'center', marginBottom: 8 },
  
  // Create Card Styles
  createCard: { 
    backgroundColor: '#0F172A', 
    borderRadius: 16, 
    padding: 20, 
    marginBottom: 24,
    borderWidth: 1, 
    borderColor: '#1F2937',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5,
  },
  cardHeader: { marginBottom: 16 },
  cardTitle: { fontSize: 20, fontWeight: '700', color: '#F9FAFB', marginBottom: 4 },
  label: { fontSize: 14, fontWeight: '600', color: '#E5E7EB', marginBottom: 8, marginTop: 4 },
  input: { 
    backgroundColor: '#111827', 
    borderWidth: 1, 
    borderColor: '#374151', 
    color: '#F9FAFB', 
    borderRadius: 12, 
    padding: 14, 
    marginBottom: 16,
    fontSize: 15,
  },
  textArea: { 
    minHeight: 80, 
    textAlignVertical: 'top',
    paddingTop: 14,
  },
  
  // Tipo Selection
  tiposContainer: { 
    marginBottom: 16,
    marginHorizontal: -4,
  },
  tipoBtn: {
    backgroundColor: '#111827',
    borderWidth: 2,
    borderColor: '#374151',
    borderRadius: 12,
    padding: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginHorizontal: 4,
    minWidth: 100,
  },
  tipoBtnSelected: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 5,
  },
  tipoIcon: { fontSize: 24, marginBottom: 4 },
  tipoText: { color: '#9CA3AF', fontSize: 12, fontWeight: '600', textAlign: 'center' },
  tipoTextSelected: { color: '#FFFFFF', fontWeight: '700' },
  
  // XP Selection
  xpContainer: { 
    flexDirection: 'row', 
    flexWrap: 'wrap', 
    marginBottom: 16,
    marginHorizontal: -4,
  },
  xpBtn: {
    backgroundColor: '#111827',
    borderWidth: 1,
    borderColor: '#374151',
    borderRadius: 8,
    paddingVertical: 8,
    paddingHorizontal: 16,
    margin: 4,
  },
  xpBtnSelected: {
    backgroundColor: '#F59E0B',
    borderColor: '#F59E0B',
  },
  xpText: { color: '#9CA3AF', fontSize: 13, fontWeight: '600' },
  xpTextSelected: { color: '#FFFFFF', fontWeight: '700' },
  
  // Create Button
  createBtn: { 
    backgroundColor: '#2563EB', 
    paddingVertical: 16, 
    borderRadius: 12, 
    alignItems: 'center',
    marginTop: 8,
    shadowColor: '#2563EB',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 8,
    elevation: 6,
  },
  createBtnText: { color: '#FFFFFF', fontWeight: '700', fontSize: 16 },
  
  // Challenge List
  sectionTitle: { 
    fontSize: 20, 
    fontWeight: '700', 
    color: '#F9FAFB', 
    marginBottom: 16,
    marginTop: 8,
  },
  emptyState: {
    alignItems: 'center',
    padding: 40,
    marginVertical: 20,
  },
  emptyIcon: { fontSize: 48, marginBottom: 12 },
  emptyText: { color: '#E5E7EB', fontSize: 16, fontWeight: '600', marginBottom: 4 },
  emptySubtext: { color: '#9CA3AF', fontSize: 14 },
  
  // Challenge Card
  challengeCard: {
    backgroundColor: '#0F172A',
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#1F2937',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
  },
  challengeHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  challengeTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    marginRight: 12,
  },
  challengeIcon: { fontSize: 32, marginRight: 12 },
  challengeTitle: { fontSize: 18, fontWeight: '700', color: '#F9FAFB', marginBottom: 2 },
  challengeCreator: { fontSize: 12, color: '#9CA3AF' },
  statusBadge: {
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 12,
    borderWidth: 1,
  },
  statusText: { fontSize: 12, fontWeight: '600' },
  challengeDesc: { 
    color: '#E5E7EB', 
    fontSize: 14, 
    lineHeight: 20,
    marginBottom: 16,
  },
  challengeMeta: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#1F2937',
  },
  metaItem: { flexDirection: 'row', alignItems: 'center' },
  metaLabel: { color: '#9CA3AF', fontSize: 13, marginRight: 6 },
  metaValue: { color: '#E5E7EB', fontSize: 13, fontWeight: '600' },
  progressContainer: {
    marginBottom: 16,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#1F2937',
  },
  progressBar: {
    height: 8,
    backgroundColor: '#1F2937',
    borderRadius: 4,
    overflow: 'hidden',
    marginBottom: 8,
  },
  progressFill: {
    height: '100%',
    borderRadius: 4,
  },
  progressText: {
    color: '#9CA3AF',
    fontSize: 12,
    textAlign: 'center',
  },
  progressHint: {
    color: '#9CA3AF',
    fontSize: 11,
    textAlign: 'center',
    marginTop: 8,
    fontStyle: 'italic',
  },
  challengeActions: {
    marginTop: 8,
  },
  actionBtn: {
    paddingVertical: 12,
    borderRadius: 10,
    alignItems: 'center',
  },
  actionBtnText: {
    color: '#FFFFFF',
    fontWeight: '700',
    fontSize: 15,
  },
  completeBtn: {
    backgroundColor: '#10B981',
    paddingVertical: 12,
    borderRadius: 10,
    alignItems: 'center',
  },
  completeBtnText: {
    color: '#FFFFFF',
    fontWeight: '700',
    fontSize: 15,
  },
  completedBadge: {
    backgroundColor: '#10B98120',
    borderWidth: 1,
    borderColor: '#10B981',
    borderRadius: 10,
    padding: 12,
    alignItems: 'center',
    marginTop: 8,
  },
  completedText: {
    color: '#10B981',
    fontWeight: '700',
    fontSize: 14,
  },
  completeBtnReady: {
    backgroundColor: '#10B981',
    shadowColor: '#10B981',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 8,
    elevation: 6,
  },
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


