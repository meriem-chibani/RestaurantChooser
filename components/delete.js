import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { TouchableOpacity,StyleSheet, Text } from 'react-native';

class Delete extends Component {
  render() {
    const { text, onPress, buttonStyle, textStyle, width, disabled } = this.props;

    return (
      <TouchableOpacity
        style={buttonStyle}
        onPress={onPress}
        disabled={disabled}
      >
        <Text style={textStyle}>{text}</Text>
      </TouchableOpacity>
    );
  }
}

Delete.propTypes = {
  text: PropTypes.string.isRequired,
  onPress: PropTypes.func.isRequired,
  buttonStyle: PropTypes.object,
  textStyle: PropTypes.object,
  width: PropTypes.oneOfType([PropTypes.string, PropTypes.number]), // Allow both string and number
  disabled: PropTypes.bool,
};

Delete.defaultProps = {
  buttonStyle: {backgroundColor: 'red',    // Green background
    borderRadius: 25,            // Rounded corners
    paddingVertical: 8,         // Vertical padding
    paddingHorizontal: 15,       // Horizontal padding
    justifyContent: 'center',
    width : "20%",
    alignItems: 'center',},          // Default empty object if no custom buttonStyle is provided
  textStyle: {},   
  width: 100,  // Default width as 100% if not provided
  disabled: false,
};



export default Delete;