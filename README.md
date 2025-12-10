# GymFit

Aplicativo de gerenciamento de treinos e desafios fitness desenvolvido com React Native e Expo.

## Descrição

GymFit é uma aplicação mobile que permite aos usuários criar e gerenciar seus treinos personalizados, realizar treinos com temporizador, participar de desafios e acompanhar seu progresso através de um sistema de pontuação (XP).

## Funcionalidades

### Autenticação
- Sistema de login e cadastro de usuários
- Campos de senha com opção de mostrar/ocultar
- Validação de dados de entrada

### Treinos
- **Criar Treinos**: Crie treinos personalizados com:
  - Nome e descrição
  - Objetivo do treino (Ganhar Massa, Perder Peso, Definição, Força, Resistência, Condicionamento)
  - Tipo de treino (musculação, cardio, funcional)
  - Duração estimada
  - Lista de exercícios com séries e repetições
- **Listar Treinos**: Visualize todos os seus treinos criados
- **Realizar Treinos**: Execute treinos com:
  - Temporizador de treino total
  - Temporizador de descanso entre séries (60 segundos)
  - Controle de progresso por exercício
  - Sistema de pausa e continuação
  - Validação de tempo mínimo de 15 minutos para completar
  - Sistema de pontos baseado em tempo e exercícios completados

### Desafios
- Crie desafios personalizados com diferentes tipos:
  - Treinos: Complete X treinos
  - Dias Consecutivos: Treine X dias seguidos
  - Exercícios: Complete X exercícios
  - Tempo Total: Acumule X minutos de treino
  - Personalizado: Crie seu próprio desafio
- Participe de desafios criados por você ou outros usuários
- Acompanhe o progresso com barra visual
- Marcação automática de treinos completados nos desafios do tipo "treinos"
- Sistema de recompensas com XP variável (50, 100, 150, 200, 300, 500 XP)

### Perfil
- Visualize e edite suas informações pessoais:
  - Nome
  - E-mail
  - Idade
  - Objetivo de treino
- Visualize sua pontuação total (XP)
- Acompanhe seu nível atual e progresso para o próximo nível
- Sistema de níveis baseado em XP (1000 XP por nível)

### Sistema de Pontos (XP)
- Ganhe XP ao:
  - Criar treinos (+50 XP)
  - Completar treinos (baseado em tempo e exercícios)
  - Concluir desafios (recompensa configurável)
- Acompanhe seu progresso e nível no perfil

## Tecnologias Utilizadas

- React Native
- Expo
- React Navigation
- AsyncStorage (armazenamento local)
- Context API (gerenciamento de estado)

## Estrutura do Projeto

```
GymFit/
├── App.js                 # Componente principal e navegação
├── app.json               # Configuração do Expo
├── package.json           # Dependências do projeto
├── index.js               # Ponto de entrada da aplicação
├── assets/                # Recursos estáticos (imagens, etc)
│   └── logo.png
├── components/            # Componentes reutilizáveis
│   ├── Footer.js
│   ├── Header.js
│   ├── NotificationContainer.js
│   └── ThemeToggle.js
├── contexts/              # Contextos React (estado global)
│   ├── AuthContext.js     # Gerenciamento de autenticação
│   ├── NotificationContext.js  # Sistema de notificações
│   └── ThemeContext.js    # Gerenciamento de tema
├── screens/               # Telas da aplicação
│   ├── LoginScreen.js     # Tela de login
│   ├── CadastroScreen.js  # Tela de cadastro
│   ├── HomeScreen.js      # Tela inicial
│   ├── TreinoScreen.js    # Tela de treinos (criar, listar, realizar)
│   ├── DesafiosScreen.js  # Tela de desafios
│   └── PerfilScreen.js    # Tela de perfil
└── utils/                 # Utilitários
    └── storage.js         # Funções de armazenamento local
```

## Instalação

1. Clone o repositório:
```bash
git clone <url-do-repositorio>
cd GymFit
```

2. Instale as dependências:
```bash
npm install
```

3. Inicie o servidor de desenvolvimento:
```bash
npm start
```

4. Execute no dispositivo/emulador:
- Para Android: `npm run android`
- Para iOS: `npm run ios`
- Para Web: `npm run web`

## Requisitos

- Node.js (versão 20.19.4 ou superior recomendada)
- npm ou yarn
- Expo CLI (instalado globalmente ou via npx)
- Dispositivo móvel com Expo Go ou emulador Android/iOS

## Uso

### Primeiro Acesso
1. Abra o aplicativo
2. Crie uma conta na tela de cadastro
3. Preencha seus dados pessoais e objetivo de treino
4. Faça login com suas credenciais

### Criando um Treino
1. Na tela inicial, toque em "Treino"
2. Selecione a aba "Criar"
3. Preencha as informações do treino:
   - Nome e descrição
   - Selecione o objetivo
   - Defina o tipo e duração
   - Adicione exercícios com séries e repetições
4. Toque em "Salvar Treino"

### Realizando um Treino
1. Na aba "Lista" de treinos, selecione um treino
2. Toque em "Realizar Treino"
3. Toque em "Iniciar Treino" para começar
4. Complete cada série e toque em "Concluir Série"
5. Aguarde o tempo de descanso (60 segundos)
6. Continue até completar todos os exercícios
7. Toque em "Finalizar Treino" (mínimo de 15 minutos)

### Criando um Desafio
1. Na tela inicial, toque em "Desafios"
2. Preencha as informações:
   - Nome e descrição do desafio
   - Selecione o tipo de desafio
   - Defina a meta
   - Escolha a recompensa de XP
3. Toque em "Criar Desafio"
4. Toque em "Iniciar Desafio" para começar a participar

### Acompanhando Progresso
- Visualize sua pontuação total na tela de Perfil
- Acompanhe o progresso dos desafios na tela de Desafios
- Treinos completados são marcados automaticamente nos desafios do tipo "treinos"

## Armazenamento de Dados

Todos os dados são armazenados localmente no dispositivo usando AsyncStorage:
- Usuários cadastrados
- Treinos criados
- Desafios criados
- Histórico de treinos realizados
- Progresso dos desafios

## Notas Importantes

- O tempo mínimo para completar um treino é de 15 minutos
- Treinos são marcados automaticamente nos desafios quando completados
- A pontuação (XP) é calculada baseada em tempo e número de exercícios
- Cada nível requer 1000 XP adicionais

## Desenvolvimento

Para contribuir com o projeto:
1. Faça um fork do repositório
2. Crie uma branch para sua feature
3. Faça commit das suas alterações
4. Envie um pull request

## Licença

Este projeto está sob a licença 0BSD.

## Desenvolvedores
Rafael Rubiá Oliveira Cardoso
Julia Vitória Stapavicci Ferreira

