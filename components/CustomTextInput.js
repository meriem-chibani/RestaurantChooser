import React from 'react';
import { View, Text, TextInput, StyleSheet } from 'react-native';

const CustomTextInput = ({ 
  label, 
  value, 
  onChangeText, 
  maxLength, 
  placeholder, 
  error,
  stateHolder,
  stateFieldName
}) => {
  // If stateHolder and stateFieldName are provided, use them for onChange
  const handleChange = (text) => {
    if (stateHolder && stateFieldName) {
      stateHolder.handleInputChange(stateFieldName, text);
    } else if (onChangeText) {
      onChangeText(text);
    }
  };

  return (
    <View style={styles.inputContainer}>
      {label && <Text style={styles.label}>{label}</Text>}
      <TextInput
        style={[
          styles.input,
          error ? { borderColor: 'red' } : {}
        ]}
        value={value}
        onChangeText={handleChange}
        maxLength={maxLength}
        placeholder={placeholder}
      />
      {error && (
        <Text style={styles.errorText}>{error}</Text>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  inputContainer: {
    marginBottom: 15,
  },
  label: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 5,
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 5,
    paddingHorizontal: 10,
    height: 40,
    fontSize: 16,
  },
  errorText: {
    color: 'red',
    marginLeft: 10,
    marginTop: 5,
    fontSize: 14,
  },
});

export default CustomTextInput;