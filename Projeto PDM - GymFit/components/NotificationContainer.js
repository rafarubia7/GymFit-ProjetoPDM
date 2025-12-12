import React from 'react';
import { View, Text, StyleSheet, Animated, Dimensions } from 'react-native';
import { useNotification } from '../contexts/NotificationContext';

const { width } = Dimensions.get('window');

export default function NotificationContainer() {
  const { notifications, removeNotification } = useNotification();

  if (notifications.length === 0) return null;

  return (
    <View style={styles.container}>
      {notifications.map((notification) => (
        <Animated.View
          key={notification.id}
          style={[
            styles.notification,
            { backgroundColor: getBackgroundColor(notification.type) }
          ]}
        >
          <Text style={styles.message}>{notification.message}</Text>
        </Animated.View>
      ))}
    </View>
  );
}

function getBackgroundColor(type) {
  switch (type) {
    case 'success': return '#10B981';
    case 'error': return '#EF4444';
    case 'warning': return '#F59E0B';
    default: return '#3B82F6';
  }
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: 60,
    left: 16,
    right: 16,
    zIndex: 1000,
  },
  notification: {
    padding: 16,
    borderRadius: 12,
    marginBottom: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 5,
  },
  message: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
    textAlign: 'center',
  },
});