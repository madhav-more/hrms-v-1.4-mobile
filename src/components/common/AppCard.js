import React from 'react';
import { View, StyleSheet, TouchableOpacity } from 'react-native';
import { colors } from '../../constants/colors';

const AppCard = ({ children, style, onPress, noPadding = false }) => {
  const Container = onPress ? TouchableOpacity : View;
  
  return (
    <Container 
      onPress={onPress} 
      activeOpacity={onPress ? 0.7 : 1}
      style={[
        styles.card, 
        !noPadding && styles.padding,
        style
      ]}
    >
      {children}
    </Container>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.surface,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.border,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
    marginBottom: 16,
  },
  padding: {
    padding: 16,
  }
});

export default AppCard;
