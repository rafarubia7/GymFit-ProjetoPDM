import React from 'react';
import { View, Text, StyleSheet, Image, SafeAreaView, TouchableOpacity, ScrollView } from 'react-native';
import { useAuth } from '../contexts/AuthContext';
import { useNotification } from '../contexts/NotificationContext';

export default function HomeScreen({ navigation }) {
  const { currentUser, logout } = useAuth();

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView 
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={true}
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.container}>
        <View style={styles.header}>
          <Image source={require('../assets/logo.png')} style={styles.logo} resizeMode="contain" />
          <Text style={styles.appName}>GymFit</Text>
          <Text style={styles.subtitle}>Bem-vindo, {currentUser?.nome || 'Atleta'}!</Text>
        </View>

        <View style={styles.grid}>
          <TouchableOpacity style={[styles.card, { backgroundColor: '#1E293B' }]} onPress={() => navigation.navigate('Treino')}>
            <Text style={styles.cardTitle}>Treino</Text>
            <Text style={styles.cardText}>Crie e realize seus treinos</Text>
          </TouchableOpacity>

          <TouchableOpacity style={[styles.card, { backgroundColor: '#0F766E' }]} onPress={() => navigation.navigate('Desafios')}>
            <Text style={styles.cardTitle}>Desafios</Text>
            <Text style={styles.cardText}>Entre em desafios e ganhe XP</Text>
          </TouchableOpacity>

          <TouchableOpacity style={[styles.card, { backgroundColor: '#7C3AED' }]} onPress={() => navigation.navigate('Perfil')}>
            <Text style={styles.cardTitle}>Perfil</Text>
            <Text style={styles.cardText}>Edite seus dados</Text>
          </TouchableOpacity>
        </View>

        <TouchableOpacity style={styles.dangerBtn} onPress={logout}>
          <Text style={styles.dangerBtnText}>Sair</Text>
        </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#0B1220' },
  scrollContent: { flexGrow: 1, padding: 24, paddingTop: 60 },
  container: { flex: 1 },
  header: { alignItems: 'center', marginBottom: 24 },
  logo: { width: 80, height: 80, marginBottom: 8 },
  appName: { fontSize: 24, fontWeight: '800', color: '#F9FAFB' },
  subtitle: { color: '#9CA3AF', marginTop: 4 },
  grid: { gap: 12 },
  card: { padding: 20, borderRadius: 16 },
  cardTitle: { color: '#F9FAFB', fontWeight: '800', fontSize: 18, marginBottom: 6 },
  cardText: { color: '#E5E7EB' },
  dangerBtn: { marginTop: 24, backgroundColor: '#EF4444', paddingVertical: 14, borderRadius: 12, alignItems: 'center' },
  dangerBtnText: { color: '#FFF', fontWeight: '700' }
});


