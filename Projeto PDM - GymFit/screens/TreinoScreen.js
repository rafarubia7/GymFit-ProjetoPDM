import React, { useState, useEffect, useRef } from 'react';
import { View, Text, TextInput, StyleSheet, Image, SafeAreaView, KeyboardAvoidingView, Platform, ScrollView, TouchableOpacity, ActivityIndicator } from 'react-native';
import { useAuth } from '../contexts/AuthContext';
import { getItem, setItem } from '../utils/storage';
import { useNotification } from '../contexts/NotificationContext';

const categoriasTreino = [
  { id: 'peito', label: 'Peito', exercicios: ['Supino reto', 'Supino inclinado', 'Crucifixo', 'Flexão', 'Crossover'] },
  { id: 'costas', label: 'Costas', exercicios: ['Puxada frente', 'Remada curvada', 'Remada baixa', 'Barra fixa', 'Pullover'] },
  { id: 'biceps', label: 'Bíceps', exercicios: ['Rosca direta', 'Rosca alternada', 'Rosca martelo', 'Rosca concentrada', '21s'] },
  { id: 'triceps', label: 'Tríceps', exercicios: ['Tríceps testa', 'Mergulho paralela', 'Corda pulley', 'Francês', 'Supino fechado'] },
  { id: 'pernas', label: 'Pernas', exercicios: ['Agachamento', 'Leg press', 'Cadeira extensora', 'Mesa flexora', 'Afundo'] },
  { id: 'ombros', label: 'Ombros', exercicios: ['Desenvolvimento', 'Elevação lateral', 'Elevação frontal', 'Encolhimento', 'Remada alta'] },
  { id: 'personalizado', label: 'Personalizado', exercicios: [] },
];

const objetivos = [
  { id: 'ganhar_massa', label: 'Ganhar Massa', icon: '💪', color: '#3B82F6' },
  { id: 'perder_peso', label: 'Perder Peso', icon: '🔥', color: '#EF4444' },
  { id: 'definicao', label: 'Definição', icon: '✨', color: '#10B981' },
  { id: 'forca', label: 'Força', icon: '⚡', color: '#F59E0B' },
  { id: 'resistencia', label: 'Resistência', icon: '🏃', color: '#8B5CF6' },
  { id: 'condicionamento', label: 'Condicionamento', icon: '❤️', color: '#EC4899' },
];

export default function TreinoScreen({ navigation }) {
  const { currentUser, updateUser } = useAuth();
  const { showMessage } = useNotification();
  const [activeTab, setActiveTab] = useState('lista'); // 'lista', 'criar', 'realizar'
  const [treinos, setTreinos] = useState([]);
  const [treinoSelecionado, setTreinoSelecionado] = useState(null);
  const [loading, setLoading] = useState(false);

  // Estados para criar treino
  const [categoriaTreino, setCategoriaTreino] = useState('');
  const [categoriasSelecionadas, setCategoriasSelecionadas] = useState([]);
  const [nome, setNome] = useState('');
  const [descricao, setDescricao] = useState('');
  const [objetivo, setObjetivo] = useState('');
  const [tipo, setTipo] = useState('musculacao');
  const [duracao, setDuracao] = useState('');
  const [exercicios, setExercicios] = useState([]);
  const [exNome, setExNome] = useState('');
  const [exSeries, setExSeries] = useState('');
  const [exReps, setExReps] = useState('');

  const exerciciosSugeridos = categoriasSelecionadas
    .map(id => categoriasTreino.find(c => c.id === id))
    .filter(Boolean)
    .flatMap(c => c.exercicios)
    .filter((v, i, arr) => arr.indexOf(v) === i); // únicos

  // Estados para realizar treino
  const [exercicioAtual, setExercicioAtual] = useState(0);
  const [serieAtual, setSerieAtual] = useState(1);
  const [tempoRest, setTempoRest] = useState(0);
  const [tempoTotal, setTempoTotal] = useState(0);
  const [treinoIniciado, setTreinoIniciado] = useState(false);
  const [treinoPausado, setTreinoPausado] = useState(false);
  const intervalRef = useRef(null);
  const restIntervalRef = useRef(null);
  const scrollViewRef = useRef(null);
  const inputRefs = useRef({});

  useEffect(() => {
    carregarTreinos();
  }, []);

  useEffect(() => {
    if (treinoIniciado && !treinoPausado) {
      intervalRef.current = setInterval(() => {
        setTempoTotal(prev => prev + 1);
      }, 1000);
    } else {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    }
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [treinoIniciado, treinoPausado]);

  useEffect(() => {
    if (tempoRest > 0 && treinoIniciado && !treinoPausado) {
      restIntervalRef.current = setInterval(() => {
        setTempoRest(prev => {
          if (prev <= 1) {
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    } else {
      if (restIntervalRef.current) {
        clearInterval(restIntervalRef.current);
      }
    }
    return () => {
      if (restIntervalRef.current) {
        clearInterval(restIntervalRef.current);
      }
    };
  }, [tempoRest, treinoIniciado, treinoPausado]);

  const carregarTreinos = async () => {
    try {
      const treinosString = await getItem('gymfit_treinos');
      const todosTreinos = treinosString ? JSON.parse(treinosString) : [];
      const treinosUsuario = todosTreinos.filter(t => t.usuarioId === currentUser.id);
      setTreinos(treinosUsuario);
    } catch (e) {
      showMessage('Erro ao carregar treinos', 'error');
    }
  };

  const addExercicio = () => {
    if (!exNome || !exSeries || !exReps) {
      showMessage('Preencha todos os campos do exercício', 'error');
      return;
    }
    setExercicios(prev => [...prev, { 
      id: Date.now().toString(), 
      nome: exNome, 
      series: parseInt(exSeries), 
      repeticoes: exReps,
      concluido: false
    }]);
    setExNome('');
    setExSeries('');
    setExReps('');
    showMessage('Exercício adicionado!', 'success');
  };

  const removeExercicio = (id) => {
    setExercicios(prev => prev.filter(e => e.id !== id));
    showMessage('Exercício removido', 'info');
  };

  const salvarTreino = async () => {
    if (!categoriaTreino) {
      showMessage('Selecione um tipo de treino primeiro', 'error');
      return;
    }
    if (!nome || !descricao || !objetivo || exercicios.length === 0) {
      showMessage('Preencha todos os campos e adicione pelo menos um exercício', 'error');
      return;
    }
    
    setLoading(true);
    try {
      const treinosString = await getItem('gymfit_treinos');
      const todosTreinos = treinosString ? JSON.parse(treinosString) : [];
      const novoTreino = { 
        id: Date.now(), 
        nome, 
        descricao, 
        objetivo, 
        tipo, 
        duracao, 
        exercicios: exercicios.map(e => ({ ...e, concluido: false })),
        usuarioId: currentUser.id, 
        dataCriacao: new Date().toISOString(),
        categoria: categoriaTreino,
      };
      todosTreinos.push(novoTreino);
      await setItem('gymfit_treinos', JSON.stringify(todosTreinos));
      updateUser({ ...currentUser, xp: (currentUser.xp || 0) + 50 });
      setCategoriaTreino('');
      setNome(''); 
      setDescricao(''); 
      setObjetivo(''); 
      setTipo('musculacao'); 
      setDuracao(''); 
      setExercicios([]);
      showMessage('Treino salvo com sucesso! +50 XP', 'success');
      setActiveTab('lista');
      carregarTreinos();
    } catch (e) {
      showMessage('Erro ao salvar treino', 'error');
    } finally {
      setLoading(false);
    }
  };

  const iniciarTreino = (treino) => {
    setTreinoSelecionado(treino);
    setExercicioAtual(0);
    setSerieAtual(1);
    setTempoRest(0);
    setTempoTotal(0);
    setTreinoIniciado(true);
    setTreinoPausado(false);
    setActiveTab('realizar');
  };

  const concluirSerie = () => {
    if (!treinoSelecionado) return;
    
    const exercicio = treinoSelecionado.exercicios[exercicioAtual];
    if (serieAtual < exercicio.series) {
      setSerieAtual(prev => prev + 1);
      setTempoRest(60); // 60 segundos de descanso
    } else {
      // Próximo exercício
      if (exercicioAtual < treinoSelecionado.exercicios.length - 1) {
        setExercicioAtual(prev => prev + 1);
        setSerieAtual(1);
        setTempoRest(60);
      } else {
        // Treino completo
        finalizarTreino();
      }
    }
  };

  const finalizarTreino = async () => {
    if (!treinoSelecionado) return;
    
    // Validar tempo mínimo de 15 minutos (900 segundos)
    const TEMPO_MINIMO_SEGUNDOS = 15 * 60; // 15 minutos = 900 segundos
    
    if (tempoTotal < TEMPO_MINIMO_SEGUNDOS) {
      const minutosFaltantes = Math.ceil((TEMPO_MINIMO_SEGUNDOS - tempoTotal) / 60);
      showMessage(`Tempo mínimo não atingido! Faltam ${minutosFaltantes} minuto(s) para completar o treino.`, 'error');
      return;
    }
    
    setTreinoIniciado(false);
    setTreinoPausado(false);
    
    // Calcular pontos baseado no tempo e exercícios
    const pontosBase = 100;
    const pontosTempo = Math.max(0, Math.floor((parseInt(treinoSelecionado.duracao || 30) * 60 - tempoTotal) / 60) * 5);
    const pontosExercicios = treinoSelecionado.exercicios.length * 20;
    const pontosTotais = pontosBase + pontosTempo + pontosExercicios;
    
    const novoXp = (currentUser.xp || 0) + pontosTotais;
    updateUser({ ...currentUser, xp: novoXp });
    
    // Salvar histórico de treino realizado
    const historicoString = await getItem('gymfit_historico');
    const historico = historicoString ? JSON.parse(historicoString) : [];
    historico.push({
      treinoId: treinoSelecionado.id,
      treinoNome: treinoSelecionado.nome,
      data: new Date().toISOString(),
      tempoTotal: tempoTotal,
      pontos: pontosTotais
    });
    await setItem('gymfit_historico', JSON.stringify(historico));
    
    // Marcar automaticamente o treino nos desafios do tipo "treinos" em andamento
    try {
      const desafiosString = await getItem('gymfit_desafios');
      const desafios = desafiosString ? JSON.parse(desafiosString) : [];
      
      const desafiosAtualizados = desafios.map(desafio => {
        // Verificar se é um desafio do tipo "treinos" em andamento e o usuário participa
        if (desafio.tipo === 'treinos' && 
            (desafio.status === 'em_andamento' || desafio.status === 'pronto_para_concluir') &&
            desafio.participantes && desafio.participantes.includes(currentUser.id)) {
          
          const treinosCompletados = desafio.treinosCompletados || [];
          
          // Se o treino ainda não foi marcado, adicionar
          if (!treinosCompletados.includes(treinoSelecionado.id)) {
            const novosTreinosCompletados = [...treinosCompletados, treinoSelecionado.id];
            const novoProgresso = novosTreinosCompletados.length;
            const metaNum = parseInt(desafio.meta) || 1;
            
            return {
              ...desafio,
              treinosCompletados: novosTreinosCompletados,
              progresso: novoProgresso,
              status: novoProgresso >= metaNum ? 'pronto_para_concluir' : 'em_andamento'
            };
          }
        }
        return desafio;
      });
      
      await setItem('gymfit_desafios', JSON.stringify(desafiosAtualizados));
    } catch (e) {
      console.log('Erro ao atualizar desafios:', e);
    }
    
    showMessage(`Treino concluído! +${pontosTotais} XP`, 'success');
    setActiveTab('lista');
    setTreinoSelecionado(null);
  };

  const formatarTempo = (segundos) => {
    const mins = Math.floor(segundos / 60);
    const secs = segundos % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const handleInputFocus = (inputName) => {
    setTimeout(() => {
      if (scrollViewRef.current) {
        // Mapear inputs para posições aproximadas de scroll (ajustadas para campos de exercício)
        const scrollPositions = {
          'nome': 0,
          'descricao': 100,
          'tipo': 300,
          'duracao': 400,
          'exNome': 600,
          'exSeries': 700,
          'exReps': 750,
        };
        
        const scrollY = scrollPositions[inputName] || 0;
        scrollViewRef.current?.scrollTo({
          y: scrollY,
          animated: true,
        });
      }
    }, 150);
  };

  const renderListaTreinos = () => (
    <ScrollView 
      ref={scrollViewRef}
      contentContainerStyle={[styles.scrollContent, { paddingTop: 20 }]}
      keyboardShouldPersistTaps="handled"
      showsVerticalScrollIndicator={true}
    >
      <View style={styles.header}>
        <Image source={require('../assets/logo.png')} style={styles.logo} resizeMode="contain" />
        <Text style={styles.title}>Meus Treinos</Text>
      </View>

      {treinos.length === 0 ? (
        <View style={styles.emptyState}>
          <Text style={styles.emptyText}>Nenhum treino criado ainda</Text>
          <Text style={styles.emptySubtext}>Crie seu primeiro treino!</Text>
        </View>
      ) : (
        treinos.map((treino) => (
          <TouchableOpacity
            key={treino.id}
            style={styles.treinoCard}
            onPress={() => iniciarTreino(treino)}
          >
            <View style={styles.treinoCardHeader}>
              <Text style={styles.treinoNome}>{treino.nome}</Text>
              <Text style={styles.treinoObjetivo}>
                {objetivos.find(o => o.id === treino.objetivo)?.icon} {objetivos.find(o => o.id === treino.objetivo)?.label}
              </Text>
            </View>
            <Text style={styles.treinoDescricao}>{treino.descricao}</Text>
            <View style={styles.treinoInfo}>
              <Text style={styles.treinoInfoText}>⏱️ {treino.duracao || 'N/A'} min</Text>
              <Text style={styles.treinoInfoText}>💪 {treino.exercicios.length} exercícios</Text>
            </View>
            <TouchableOpacity
              style={styles.btnRealizar}
              onPress={() => iniciarTreino(treino)}
            >
              <Text style={styles.btnRealizarText}>▶️ Realizar Treino</Text>
            </TouchableOpacity>
          </TouchableOpacity>
        ))
      )}
    </ScrollView>
  );

  const renderCriarTreino = () => (
    <ScrollView 
      ref={scrollViewRef}
      contentContainerStyle={[styles.scrollContent, { paddingTop: 20 }]}
      keyboardShouldPersistTaps="handled"
      showsVerticalScrollIndicator={true}
      keyboardDismissMode="interactive"
      nestedScrollEnabled={true}
    >
      <View style={styles.header}>
        <Image source={require('../assets/logo.png')} style={styles.logo} resizeMode="contain" />
        <Text style={styles.title}>Criar Treino</Text>
      </View>
      
      <Text style={styles.label}>Passo 1: Selecione o tipo de treino</Text>
      <View style={styles.selectContainer}>
        {categoriasTreino.map((cat) => (
          <TouchableOpacity
            key={cat.id}
            style={[
              styles.selectBtn,
              categoriaTreino === cat.id && styles.selectBtnSelected
            ]}
            onPress={() => {
              setCategoriaTreino(cat.id);
              setCategoriasSelecionadas([cat.id]);
              if (cat.id !== 'personalizado') {
                setNome(cat.label);
                setTipo('musculacao');
              } else {
                setNome('');
              }
            }}
          >
            <Text style={[
              styles.selectBtnText,
              categoriaTreino === cat.id && styles.selectBtnTextSelected
            ]}>
              {cat.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {!categoriaTreino && (
        <View style={styles.infoBox}>
          <Text style={styles.infoText}>Selecione um tipo para liberar os campos</Text>
        </View>
      )}

      {categoriaTreino && (
        <>
          {categoriaTreino !== 'personalizado' ? (
            <View style={styles.readonlyBox}>
              <Text style={styles.readonlyLabel}>Nome do treino</Text>
              <Text style={styles.readonlyValue}>{nome}</Text>
            </View>
          ) : (
            <TextInput 
              ref={(ref) => inputRefs.current.nome = ref}
              placeholder="Digite o nome do treino" 
              value={nome} 
              onChangeText={setNome} 
              style={styles.input} 
              placeholderTextColor="#9CA3AF"
              onFocus={() => handleInputFocus('nome')}
              returnKeyType="next"
              blurOnSubmit={false}
            />
          )}
          
          <TextInput 
            ref={(ref) => inputRefs.current.descricao = ref}
            placeholder="Descrição" 
            value={descricao} 
            onChangeText={setDescricao} 
            style={styles.input} 
            placeholderTextColor="#9CA3AF" 
            multiline 
            numberOfLines={3}
            onFocus={() => handleInputFocus('descricao')}
            returnKeyType="next"
            blurOnSubmit={false}
          />
          
          <Text style={styles.label}>Objetivo do Treino</Text>
          <View style={styles.objetivosContainer}>
            {objetivos.map((obj) => (
              <TouchableOpacity
                key={obj.id}
                style={[
                  styles.objetivoBtn,
                  objetivo === obj.id && { backgroundColor: obj.color, borderColor: obj.color },
                ]}
                onPress={() => setObjetivo(obj.id)}
              >
                <Text style={styles.objetivoIcon}>{obj.icon}</Text>
                <Text style={[styles.objetivoText, objetivo === obj.id && styles.objetivoTextSelected]}>
                  {obj.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          {categoriaTreino && (
            <>
              <Text style={styles.label}>Adicionar mais grupos (opcional)</Text>
              <View style={styles.selectContainer}>
                {categoriasTreino
                  .filter(c => c.id !== categoriaTreino)
                  .map((cat) => {
                    const selected = categoriasSelecionadas.includes(cat.id);
                    return (
                      <TouchableOpacity
                        key={cat.id}
                        style={[
                          styles.selectBtnSmall,
                          selected && styles.selectBtnSelected
                        ]}
                        onPress={() => {
                          setCategoriasSelecionadas((prev) => {
                            if (prev.includes(cat.id)) {
                              return prev.filter(id => id !== cat.id);
                            }
                            return [...prev, cat.id];
                          });
                        }}
                      >
                        <Text style={[
                          styles.selectBtnText,
                          selected && styles.selectBtnTextSelected
                        ]}>
                          {cat.label}
                        </Text>
                      </TouchableOpacity>
                    );
                  })}
              </View>
            </>
          )}

          <View style={{ marginBottom: 12 }}>
            <Text style={[styles.label, { marginBottom: 4 }]}>Tipo selecionado</Text>
            <Text style={{ color: '#9CA3AF' }}>{tipo || 'musculacao'}</Text>
          </View>
          
          <Text style={styles.label}>Duração (minutos)</Text>
          <View style={styles.row}>
            <TouchableOpacity style={styles.stepBtn} onPress={() => setDuracao((p) => String(Math.max(0, (parseInt(p||'0',10)||0)-1)))}>
              <Text style={styles.stepBtnText}>-</Text>
            </TouchableOpacity>
            <TextInput 
              ref={(ref) => inputRefs.current.duracao = ref}
              placeholder="Minutos" 
              value={duracao} 
              onChangeText={setDuracao} 
              keyboardType="numeric" 
              style={[styles.input, { flex: 1, marginBottom: 0, marginHorizontal: 12 }]} 
              placeholderTextColor="#9CA3AF"
              onFocus={() => handleInputFocus('duracao')}
              returnKeyType="next"
              blurOnSubmit={false}
            />
            <TouchableOpacity style={styles.stepBtn} onPress={() => setDuracao((p) => String((parseInt(p||'0',10)||0)+1))}>
              <Text style={styles.stepBtnText}>+</Text>
            </TouchableOpacity>
          </View>

          <Text style={styles.label}>Passo 2: Adicionar exercício</Text>
          {exerciciosSugeridos.length > 0 && (
            <>
              <Text style={styles.label}>Exercícios sugeridos (toque para selecionar)</Text>
              <View style={styles.selectContainer}>
                {exerciciosSugeridos.map((ex) => (
                  <TouchableOpacity
                    key={ex}
                    style={[
                      styles.selectBtnSmall,
                      exNome === ex && styles.selectBtnSelected
                    ]}
                    onPress={() => setExNome(ex)}
                  >
                    <Text style={[
                      styles.selectBtnText,
                      exNome === ex && styles.selectBtnTextSelected
                    ]}>
                      {ex}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </>
          )}

          <TextInput 
            ref={(ref) => inputRefs.current.exNome = ref}
            placeholder="Outro exercício (digite se não estiver na lista)" 
            value={exNome} 
            onChangeText={setExNome} 
            style={styles.input} 
            placeholderTextColor="#9CA3AF"
            onFocus={() => handleInputFocus('exNome')}
            returnKeyType="next"
            blurOnSubmit={false}
          />

          <Text style={styles.label}>Séries</Text>
          <View style={styles.row}>
            <TouchableOpacity style={[styles.stepBtn, { marginRight: 12 }]} onPress={() => setExSeries((p) => String(Math.max(0, (parseInt(p||'0',10)||0)-1)))}>
              <Text style={styles.stepBtnText}>-</Text>
            </TouchableOpacity>
            <View style={{ flex: 1, alignItems: 'center' }}>
              <Text style={{ color: '#E5E7EB', fontSize: 16, fontWeight: '700' }}>{exSeries || '0'}</Text>
            </View>
            <TouchableOpacity style={[styles.stepBtn, { marginLeft: 12 }]} onPress={() => setExSeries((p) => String((parseInt(p||'0',10)||0)+1))}>
              <Text style={styles.stepBtnText}>+</Text>
            </TouchableOpacity>
          </View>

          <Text style={styles.label}>Repetições</Text>
          <View style={styles.row}>
            <TouchableOpacity style={[styles.stepBtn, { marginRight: 12 }]} onPress={() => setExReps((p) => String(Math.max(0, (parseInt(p||'0',10)||0)-1)))}>
              <Text style={styles.stepBtnText}>-</Text>
            </TouchableOpacity>
            <View style={{ flex: 1, alignItems: 'center' }}>
              <Text style={{ color: '#E5E7EB', fontSize: 16, fontWeight: '700' }}>{exReps || '0'}</Text>
            </View>
            <TouchableOpacity style={[styles.stepBtn, { marginLeft: 12 }]} onPress={() => setExReps((p) => String((parseInt(p||'0',10)||0)+1))}>
              <Text style={styles.stepBtnText}>+</Text>
            </TouchableOpacity>
          </View>
          
          <TouchableOpacity style={styles.secondaryBtn} onPress={addExercicio}>
            <Text style={styles.secondaryBtnText}>Adicionar Exercício</Text>
          </TouchableOpacity>

          {exercicios.map((item) => (
            <View key={item.id} style={styles.exercicioItem}>
              <Text style={styles.exercicioText}>{item.nome} - {item.series}x {item.repeticoes}</Text>
              <TouchableOpacity onPress={() => removeExercicio(item.id)}>
                <Text style={styles.removeText}>Remover</Text>
              </TouchableOpacity>
            </View>
          ))}

          <TouchableOpacity style={styles.primaryBtn} onPress={salvarTreino} disabled={loading}>
            {loading ? (
              <ActivityIndicator color="#FFFFFF" />
            ) : (
              <Text style={styles.primaryBtnText}>Salvar Treino</Text>
            )}
          </TouchableOpacity>
        </>
      )}
    </ScrollView>
  );

  const renderRealizarTreino = () => {
    if (!treinoSelecionado) {
      return (
        <View style={styles.emptyState}>
          <Text style={styles.emptyText}>Nenhum treino selecionado</Text>
        </View>
      );
    }

    const exercicio = treinoSelecionado.exercicios[exercicioAtual];
    const progresso = ((exercicioAtual + 1) / treinoSelecionado.exercicios.length) * 100;

    return (
      <ScrollView 
        contentContainerStyle={styles.realizarContainer}
        showsVerticalScrollIndicator={true}
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.timerContainer}>
          <Text style={styles.timerLabel}>Tempo Total</Text>
          <Text style={styles.timer}>{formatarTempo(tempoTotal)}</Text>
        </View>

        {tempoRest > 0 && (
          <View style={styles.restContainer}>
            <Text style={styles.restLabel}>⏸️ Descanso</Text>
            <Text style={styles.restTimer}>{formatarTempo(tempoRest)}</Text>
          </View>
        )}

        <View style={styles.progressContainer}>
          <View style={styles.progressBar}>
            <View style={[styles.progressFill, { width: `${progresso}%` }]} />
          </View>
          <Text style={styles.progressText}>
            Exercício {exercicioAtual + 1} de {treinoSelecionado.exercicios.length}
          </Text>
        </View>

        <View style={styles.exercicioContainer}>
          <Text style={styles.exercicioNome}>{exercicio.nome}</Text>
          <Text style={styles.serieInfo}>
            Série {serieAtual} de {exercicio.series}
          </Text>
          <Text style={styles.repInfo}>
            {exercicio.repeticoes} repetições
          </Text>
        </View>

        <View style={styles.actionsContainer}>
          {!treinoIniciado ? (
            <TouchableOpacity style={styles.btnIniciar} onPress={() => setTreinoIniciado(true)}>
              <Text style={styles.btnIniciarText}>▶️ Iniciar Treino</Text>
            </TouchableOpacity>
          ) : (
            <>
              {treinoPausado ? (
                <TouchableOpacity style={styles.btnContinuar} onPress={() => setTreinoPausado(false)}>
                  <Text style={styles.btnContinuarText}>▶️ Continuar</Text>
                </TouchableOpacity>
              ) : (
                <TouchableOpacity style={styles.btnPausar} onPress={() => setTreinoPausado(true)}>
                  <Text style={styles.btnPausarText}>⏸️ Pausar</Text>
                </TouchableOpacity>
              )}
              <TouchableOpacity style={styles.btnConcluirSerie} onPress={concluirSerie}>
                <Text style={styles.btnConcluirSerieText}>✓ Concluir Série</Text>
              </TouchableOpacity>
            </>
          )}
          
          <TouchableOpacity 
            style={styles.btnFinalizar} 
            onPress={finalizarTreino}
          >
            <Text style={styles.btnFinalizarText}>Finalizar Treino</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    );
  };

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.tabsContainer}>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'lista' && styles.tabActive]}
          onPress={() => setActiveTab('lista')}
        >
          <Text style={[styles.tabText, activeTab === 'lista' && styles.tabTextActive]}>
            📋 Lista
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'criar' && styles.tabActive]}
          onPress={() => setActiveTab('criar')}
        >
          <Text style={[styles.tabText, activeTab === 'criar' && styles.tabTextActive]}>
            ➕ Criar
          </Text>
        </TouchableOpacity>
        {treinoSelecionado && (
          <TouchableOpacity
            style={[styles.tab, activeTab === 'realizar' && styles.tabActive]}
            onPress={() => setActiveTab('realizar')}
          >
            <Text style={[styles.tabText, activeTab === 'realizar' && styles.tabTextActive]}>
              🏋️ Treino
            </Text>
          </TouchableOpacity>
        )}
      </View>

      <KeyboardAvoidingView 
        style={{ flex: 1 }} 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}
      >
        {activeTab === 'lista' && renderListaTreinos()}
        {activeTab === 'criar' && renderCriarTreino()}
        {activeTab === 'realizar' && renderRealizarTreino()}
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
  tabsContainer: {
    flexDirection: 'row',
    backgroundColor: '#0F172A',
    borderBottomWidth: 1,
    borderBottomColor: '#1F2937',
    paddingHorizontal: 8,
    paddingTop: 8,
  },
  tab: {
    flex: 1,
    paddingVertical: 12,
    alignItems: 'center',
    borderBottomWidth: 2,
    borderBottomColor: 'transparent',
  },
  tabActive: {
    borderBottomColor: '#2563EB',
  },
  tabText: {
    color: '#9CA3AF',
    fontWeight: '600',
    fontSize: 14,
  },
  tabTextActive: {
    color: '#2563EB',
    fontWeight: '700',
  },
  scrollContent: { padding: 24, paddingTop: 20, paddingBottom: 300 },
  header: { alignItems: 'center', marginBottom: 24 },
  logo: { width: 56, height: 56, marginBottom: 8 },
  title: { fontSize: 20, fontWeight: '700', textAlign: 'center', marginBottom: 16, color: '#F9FAFB' },
  input: { backgroundColor: '#111827', borderWidth: 1, borderColor: '#374151', color: '#F9FAFB', borderRadius: 10, padding: 12, marginBottom: 12 },
  label: { fontSize: 14, fontWeight: '700', color: '#F9FAFB', marginBottom: 12, marginTop: 4 },
  selectContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 12,
    marginHorizontal: -4,
    backgroundColor: '#0F172A',
    borderWidth: 1,
    borderColor: '#1F2937',
    borderRadius: 12,
    padding: 8,
  },
  selectBtn: {
    backgroundColor: '#111827',
    borderWidth: 2,
    borderColor: '#374151',
    borderRadius: 12,
    paddingVertical: 14,
    paddingHorizontal: 18,
    margin: 6,
    minWidth: 110,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
    elevation: 2,
  },
  selectBtnSmall: {
    backgroundColor: '#111827',
    borderWidth: 1.5,
    borderColor: '#374151',
    borderRadius: 10,
    paddingVertical: 10,
    paddingHorizontal: 14,
    margin: 4,
  },
  selectBtnSelected: {
    borderColor: '#2563EB',
    backgroundColor: '#1E3A8A',
    borderWidth: 2,
    shadowColor: '#2563EB',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 3,
  },
  selectBtnText: {
    color: '#E5E7EB',
    fontWeight: '600',
    fontSize: 14,
  },
  selectBtnTextSelected: {
    color: '#FFFFFF',
    fontWeight: '700',
  },
  infoBox: {
    backgroundColor: '#1E293B',
    borderWidth: 1,
    borderColor: '#F59E0B',
    borderRadius: 10,
    padding: 12,
    marginBottom: 12,
  },
  infoText: {
    color: '#FCD34D',
    fontSize: 14,
    fontWeight: '600',
    textAlign: 'center',
  },
  readonlyBox: {
    backgroundColor: '#0F172A',
    borderWidth: 1,
    borderColor: '#1F2937',
    borderRadius: 10,
    padding: 12,
    marginBottom: 12,
  },
  readonlyLabel: {
    color: '#9CA3AF',
    fontSize: 12,
    marginBottom: 4,
  },
  readonlyValue: {
    color: '#F9FAFB',
    fontSize: 16,
    fontWeight: '700',
  },
  row: { flexDirection: 'row', alignItems: 'center', marginBottom: 12 },
  stepBtn: { width: 44, height: 44, borderRadius: 10, backgroundColor: '#1E293B', alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: '#374151' },
  stepBtnText: { color: '#E5E7EB', fontSize: 18, fontWeight: '800' },
  objetivosContainer: { flexDirection: 'row', flexWrap: 'wrap', marginBottom: 12, marginHorizontal: -4 },
  objetivoBtn: { backgroundColor: '#111827', borderWidth: 2, borderColor: '#374151', borderRadius: 12, padding: 12, alignItems: 'center', justifyContent: 'center', margin: 4, width: '47%' },
  objetivoIcon: { fontSize: 24, marginBottom: 4 },
  objetivoText: { color: '#9CA3AF', fontSize: 12, fontWeight: '600', textAlign: 'center' },
  objetivoTextSelected: { color: '#FFFFFF', fontWeight: '700' },
  exercicioItem: { padding: 12, borderWidth: 1, borderColor: '#1F2937', backgroundColor: '#0F172A', borderRadius: 8, marginBottom: 8, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  exercicioText: { color: '#E5E7EB', flex: 1 },
  removeText: { color: '#F87171', fontWeight: '700' },
  secondaryBtn: { backgroundColor: '#1E293B', paddingVertical: 12, borderRadius: 10, alignItems: 'center', marginBottom: 12 },
  secondaryBtnText: { color: '#E5E7EB', fontWeight: '700' },
  primaryBtn: { backgroundColor: '#2563EB', paddingVertical: 14, borderRadius: 10, alignItems: 'center', marginTop: 8 },
  primaryBtnText: { color: '#FFFFFF', fontWeight: '700' },
  emptyState: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 24 },
  emptyText: { color: '#F9FAFB', fontSize: 18, fontWeight: '600', marginBottom: 8 },
  emptySubtext: { color: '#9CA3AF', fontSize: 14 },
  treinoCard: { backgroundColor: '#0F172A', borderRadius: 16, padding: 16, marginBottom: 12, borderWidth: 1, borderColor: '#1F2937' },
  treinoCardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 },
  treinoNome: { color: '#F9FAFB', fontSize: 18, fontWeight: '700', flex: 1 },
  treinoObjetivo: { color: '#9CA3AF', fontSize: 12, fontWeight: '600' },
  treinoDescricao: { color: '#E5E7EB', fontSize: 14, marginBottom: 12 },
  treinoInfo: { flexDirection: 'row', gap: 16, marginBottom: 12 },
  treinoInfoText: { color: '#9CA3AF', fontSize: 12 },
  btnRealizar: { backgroundColor: '#10B981', paddingVertical: 12, borderRadius: 10, alignItems: 'center' },
  btnRealizarText: { color: '#FFFFFF', fontWeight: '700' },
  realizarContainer: { padding: 24, paddingBottom: 100 },
  timerContainer: { alignItems: 'center', marginBottom: 24, padding: 24, backgroundColor: '#0F172A', borderRadius: 16, borderWidth: 1, borderColor: '#1F2937' },
  timerLabel: { color: '#9CA3AF', fontSize: 14, marginBottom: 8 },
  timer: { color: '#F9FAFB', fontSize: 48, fontWeight: '800' },
  restContainer: { alignItems: 'center', marginBottom: 24, padding: 16, backgroundColor: '#1E293B', borderRadius: 12 },
  restLabel: { color: '#F9FAFB', fontSize: 16, fontWeight: '600', marginBottom: 8 },
  restTimer: { color: '#F59E0B', fontSize: 32, fontWeight: '700' },
  progressContainer: { marginBottom: 24 },
  progressBar: { height: 8, backgroundColor: '#1F2937', borderRadius: 4, marginBottom: 8 },
  progressFill: { height: '100%', backgroundColor: '#2563EB', borderRadius: 4 },
  progressText: { color: '#9CA3AF', fontSize: 12, textAlign: 'center' },
  exercicioContainer: { backgroundColor: '#0F172A', borderRadius: 16, padding: 24, marginBottom: 24, borderWidth: 1, borderColor: '#1F2937', alignItems: 'center' },
  exercicioNome: { color: '#F9FAFB', fontSize: 24, fontWeight: '700', marginBottom: 12 },
  serieInfo: { color: '#2563EB', fontSize: 18, fontWeight: '600', marginBottom: 8 },
  repInfo: { color: '#9CA3AF', fontSize: 16 },
  actionsContainer: { gap: 12 },
  btnIniciar: { backgroundColor: '#10B981', paddingVertical: 16, borderRadius: 12, alignItems: 'center' },
  btnIniciarText: { color: '#FFFFFF', fontWeight: '700', fontSize: 16 },
  btnPausar: { backgroundColor: '#F59E0B', paddingVertical: 16, borderRadius: 12, alignItems: 'center' },
  btnPausarText: { color: '#FFFFFF', fontWeight: '700', fontSize: 16 },
  btnContinuar: { backgroundColor: '#10B981', paddingVertical: 16, borderRadius: 12, alignItems: 'center' },
  btnContinuarText: { color: '#FFFFFF', fontWeight: '700', fontSize: 16 },
  btnConcluirSerie: { backgroundColor: '#2563EB', paddingVertical: 16, borderRadius: 12, alignItems: 'center' },
  btnConcluirSerieText: { color: '#FFFFFF', fontWeight: '700', fontSize: 16 },
  btnFinalizar: { backgroundColor: '#EF4444', paddingVertical: 16, borderRadius: 12, alignItems: 'center' },
  btnFinalizarText: { color: '#FFFFFF', fontWeight: '700', fontSize: 16 },
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

