// App.js (App nativo com React Navigation)
import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { ThemeProvider } from './contexts/ThemeContext';
import { NotificationProvider } from './contexts/NotificationContext';
import NotificationContainer from './components/NotificationContainer';
import LoginScreen from './screens/LoginScreen';
import CadastroScreen from './screens/CadastroScreen';
import HomeScreen from './screens/HomeScreen';
import TreinoScreen from './screens/TreinoScreen';
import DesafiosScreen from './screens/DesafiosScreen';
import PerfilScreen from './screens/PerfilScreen';

const Stack = createNativeStackNavigator();

function AppContent() {
  const { currentUser } = useAuth();

  return (
    <>
      <NavigationContainer>
        <Stack.Navigator>
          {!currentUser ? (
            <>
              <Stack.Screen name="Login" component={LoginScreen} options={{ headerShown: false }} />
              <Stack.Screen name="Cadastro" component={CadastroScreen} options={{ headerShown: false }} />
            </>
          ) : (
            <>
              <Stack.Screen name="Home" component={HomeScreen} options={{ headerShown: false }} />
              <Stack.Screen name="Treino" component={TreinoScreen} options={{ headerShown: false }} />
              <Stack.Screen name="Desafios" component={DesafiosScreen} options={{ headerShown: false }} />
              <Stack.Screen name="Perfil" component={PerfilScreen} options={{ headerShown: false }} />
            </>
          )}
        </Stack.Navigator>
      </NavigationContainer>
      <NotificationContainer />
    </>
  );
}

function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <NotificationProvider>
          <AppContent />
        </NotificationProvider>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;