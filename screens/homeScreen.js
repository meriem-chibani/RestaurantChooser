import React, { useState, useEffect } from 'react';
import {
  Button, 
  View,
  Text,
  StyleSheet,
  TextInput,
  Image,
  TouchableOpacity,
  Modal,
  Alert,
  ActivityIndicator,
  Platform,
  KeyboardAvoidingView
} from 'react-native';
import { Camera } from 'expo-camera';
import * as ImagePicker from 'expo-image-picker';
import { SwipeListView } from 'react-native-swipe-list-view';
import { executeSql } from '../components/database/database';
import { Picker } from '@react-native-picker/picker'; 

const HomeScreen = ({ route }) => {
  // State management
  const [hasCameraPermission, setHasCameraPermission] = useState(null);
  const [camera, setCamera] = useState(null);
  const [image, setImage] = useState(null);
  const [description, setDescription] = useState('');
  const [journals, setJournals] = useState([]);
  const [editingId, setEditingId] = useState(null);
  const [category, setCategory] = useState('All');
  const [isCameraOpen, setIsCameraOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // Categories for filtering
  const categories = ['All', 'Breakfast', 'Lunch', 'Dinner', 'Snacks'];

  // Initialize camera and load journals
  useEffect(() => {
    const initialize = async () => {
      // Request camera permissions
      const { status } = await Camera.requestCameraPermissionsAsync();
      setHasCameraPermission(status === 'granted');
      
      // Load journal entries
      await loadJournals();
      setIsLoading(false);
    };

    initialize();
  }, []);

  // Load journals from database
  const loadJournals = async () => {
    try {
      const userId = route.params?.userId;
      if (!userId) {
        Alert.alert('Error', 'User not authenticated');
        return;
      }

      const result = await executeSql(
        'SELECT * FROM journals WHERE userId = ? ORDER BY date DESC',
        [userId]
      );
      
      setJournals(result.rows._array || []);
    } catch (error) {
      console.error('Error loading journals:', error);
      Alert.alert('Error', 'Failed to load journals');
    }
  };

  // Take picture with camera
  const takePicture = async () => {
    if (!camera) return;
    
    try {
      const { uri } = await camera.takePictureAsync({
        quality: 0.8,
      });
      setImage(uri);
      setIsCameraOpen(false);
    } catch (error) {
      console.error('Camera error:', error);
      Alert.alert('Error', 'Failed to take picture');
    }
  };

  // Select image from gallery
  const pickImage = async () => {
    try {
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permission required', 'Please allow access to your photos');
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [4, 3],
        quality: 0.8,
      });

      if (!result.canceled) {
        setImage(result.assets[0].uri);
      }
    } catch (error) {
      console.error('Image picker error:', error);
      Alert.alert('Error', 'Failed to select image');
    }
  };

  // Save or update journal entry
  const saveJournal = async () => {
    if (!image || !description.trim()) {
      Alert.alert('Validation Error', 'Please add both an image and description');
      return;
    }

    try {
      const userId = route.params?.userId;
      if (!userId) {
        Alert.alert('Error', 'User not authenticated');
        return;
      }

      if (editingId) {
        // Update existing entry
        await executeSql(
          'UPDATE journals SET image = ?, description = ?, category = ? WHERE id = ?',
          [image, description.trim(), category, editingId]
        );
        Alert.alert('Success', 'Journal updated successfully');
      } else {
        // Create new entry
        await executeSql(
          'INSERT INTO journals (userId, image, description, category, date) VALUES (?, ?, ?, ?, ?)',
          [
            userId,
            image,
            description.trim(),
            category,
            new Date().toISOString(),
          ]
        );
        Alert.alert('Success', 'Journal saved successfully');
      }
      
      await loadJournals();
      resetForm();
    } catch (error) {
      console.error('Save error:', error);
      Alert.alert('Error', 'An unexpected error occurred');
    }
  };

  // Delete journal entry
  const deleteJournal = async (id) => {
    Alert.alert(
      'Confirm Delete',
      'Are you sure you want to delete this journal entry?',
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Delete',
          onPress: async () => {
            try {
              await executeSql(
                'DELETE FROM journals WHERE id = ?',
                [id]
              );
              await loadJournals();
              Alert.alert('Success', 'Journal deleted successfully');
            } catch (error) {
              console.error('Delete error:', error);
              Alert.alert('Error', 'Failed to delete journal');
            }
          },
          style: 'destructive',
        },
      ]
    );
  };

  // Reset form fields
  const resetForm = () => {
    setImage(null);
    setDescription('');
    setEditingId(null);
    setCategory('All');
  };

  // Filter journals by category
  const filteredJournals = category === 'All'
    ? journals
    : journals.filter((item) => item.category === category);

  // Loading state
  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#0000ff" />
        <Text>Loading your food journals...</Text>
      </View>
    );
  }

  // Camera permission denied
  if (hasCameraPermission === false) {
    return (
      <View style={styles.permissionContainer}>
        <Text>Camera permission is required to take photos</Text>
        <Button
          title="Grant Permission"
          onPress={() => Camera.requestCameraPermissionsAsync()}
        />
      </View>
    );
  }

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.container}
    >
      {/* Camera Modal */}
      <Modal visible={isCameraOpen} animationType="slide">
        <View style={styles.cameraContainer}>
          <Camera
            style={styles.camera}
            ref={(ref) => setCamera(ref)}
            ratio="16:9"
          />
          <View style={styles.cameraButtons}>
            <TouchableOpacity
              style={styles.captureButton}
              onPress={takePicture}
            >
              <View style={styles.captureButtonInner} />
            </TouchableOpacity>
            <Button
              title="Close"
              onPress={() => setIsCameraOpen(false)}
              color="#ff4444"
            />
          </View>
        </View>
      </Modal>

      {/* Journal Input Section */}
      <View style={styles.inputContainer}>
        <Text style={styles.sectionTitle}>
          {editingId ? 'Edit Journal Entry' : 'Add New Journal Entry'}
        </Text>

        {/* Image Preview */}
        {image ? (
          <Image source={{ uri: image }} style={styles.previewImage} />
        ) : (
          <View style={styles.imagePlaceholder}>
            <Text>No image selected</Text>
          </View>
        )}

        {/* Image Selection Buttons */}
        <View style={styles.buttonGroup}>
          <TouchableOpacity
            style={styles.imageButton}
            onPress={() => setIsCameraOpen(true)}
          >
            <Text style={styles.buttonText}>Take Photo</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.imageButton}
            onPress={pickImage}
          >
            <Text style={styles.buttonText}>Choose from Gallery</Text>
          </TouchableOpacity>
        </View>

        {/* Description Input */}
        <TextInput
          placeholder="What did you eat? Add details..."
          value={description}
          onChangeText={setDescription}
          style={styles.input}
          multiline
          numberOfLines={3}
        />

        {/* Category Picker */}
        <View style={styles.pickerContainer}>
          <Text style={styles.pickerLabel}>Category:</Text>
          <View style={styles.pickerWrapper}>
            <Picker
              selectedValue={category}
              onValueChange={(itemValue) => setCategory(itemValue)}
              style={styles.picker}
            >
              {categories.map((cat) => (
                <Picker.Item key={cat} label={cat} value={cat} />
              ))}
            </Picker>
          </View>
        </View>

        {/* Save/Update Button */}
        <TouchableOpacity
          style={styles.saveButton}
          onPress={saveJournal}
        >
          <Text style={styles.saveButtonText}>
            {editingId ? 'Update Journal' : 'Save Journal'}
          </Text>
        </TouchableOpacity>

        {/* Cancel Edit Button (visible only when editing) */}
        {editingId && (
          <TouchableOpacity
            style={styles.cancelButton}
            onPress={resetForm}
          >
            <Text style={styles.cancelButtonText}>Cancel</Text>
          </TouchableOpacity>
        )}
      </View>

      {/* Journal List Section */}
      <View style={styles.listContainer}>
        <Text style={styles.sectionTitle}>Your Food Journals</Text>

        {/* Category Filter */}
        <View style={styles.filterContainer}>
          <Text style={styles.filterLabel}>Filter by:</Text>
          <View style={styles.filterPickerWrapper}>
            <Picker
              selectedValue={category}
              onValueChange={(itemValue) => setCategory(itemValue)}
              style={styles.filterPicker}
            >
              {categories.map((cat) => (
                <Picker.Item key={cat} label={cat} value={cat} />
              ))}
            </Picker>
          </View>
        </View>

        {/* Journal List */}
        {filteredJournals.length > 0 ? (
          <SwipeListView
            data={filteredJournals}
            keyExtractor={(item) => item.id.toString()}
            renderItem={({ item }) => (
              <View style={styles.journalItem}>
                <Image source={{ uri: item.image }} style={styles.journalImage} />
                <View style={styles.journalDetails}>
                  <Text style={styles.journalDescription}>
                    {item.description}
                  </Text>
                  <View style={styles.journalMeta}>
                    <Text style={styles.journalCategory}>
                      {item.category}
                    </Text>
                    <Text style={styles.journalDate}>
                      {new Date(item.date).toLocaleDateString()}
                    </Text>
                  </View>
                </View>
              </View>
            )}
            renderHiddenItem={({ item }) => (
              <View style={styles.hiddenButtons}>
                <TouchableOpacity
                  style={[styles.hiddenButton, styles.editButton]}
                  onPress={() => {
                    setEditingId(item.id);
                    setDescription(item.description);
                    setImage(item.image);
                    setCategory(item.category);
                  }}
                >
                  <Text style={styles.hiddenButtonText}>Edit</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.hiddenButton, styles.deleteButton]}
                  onPress={() => deleteJournal(item.id)}
                >
                  <Text style={styles.hiddenButtonText}>Delete</Text>
                </TouchableOpacity>
              </View>
            )}
            rightOpenValue={-150}
            disableRightSwipe
            showsVerticalScrollIndicator={false}
          />
        ) : (
          <View style={styles.emptyState}>
            <Text style={styles.emptyStateText}>
              {category === 'All'
                ? 'No journal entries yet. Add your first entry above!'
                : `No entries in ${category} category`}
            </Text>
          </View>
        )}
      </View>
    </KeyboardAvoidingView>
  );
};

// Styles remain the same as in your original code
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  permissionContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  cameraContainer: {
    flex: 1,
    backgroundColor: 'black',
  },
  camera: {
    flex: 1,
  },
  cameraButtons: {
    position: 'absolute',
    bottom: 30,
    width: '100%',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  captureButton: {
    width: 70,
    height: 70,
    borderRadius: 35,
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    borderWidth: 3,
    borderColor: 'white',
    justifyContent: 'center',
    alignItems: 'center',
  },
  captureButtonInner: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: 'white',
  },
  inputContainer: {
    backgroundColor: 'white',
    padding: 20,
    margin: 15,
    borderRadius: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 5,
    elevation: 3,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 15,
    color: '#333',
  },
  previewImage: {
    width: '100%',
    height: 200,
    borderRadius: 8,
    marginBottom: 15,
  },
  imagePlaceholder: {
    width: '100%',
    height: 200,
    backgroundColor: '#f0f0f0',
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 15,
  },
  buttonGroup: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 15,
  },
  imageButton: {
    backgroundColor: '#4285f4',
    padding: 10,
    borderRadius: 5,
    width: '48%',
    alignItems: 'center',
  },
  buttonText: {
    color: 'white',
    fontWeight: 'bold',
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 5,
    padding: 12,
    marginBottom: 15,
    fontSize: 16,
    textAlignVertical: 'top',
  },
  pickerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 15,
  },
  pickerLabel: {
    marginRight: 10,
    fontSize: 16,
  },
  pickerWrapper: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 5,
  },
  picker: {
    height: 50,
  },
  saveButton: {
    backgroundColor: '#34a853',
    padding: 15,
    borderRadius: 5,
    alignItems: 'center',
    marginBottom: 10,
  },
  saveButtonText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 16,
  },
  cancelButton: {
    backgroundColor: '#ea4335',
    padding: 15,
    borderRadius: 5,
    alignItems: 'center',
  },
  cancelButtonText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 16,
  },
  listContainer: {
    flex: 1,
    backgroundColor: 'white',
    padding: 15,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.1,
    shadowRadius: 5,
    elevation: 5,
  },
  filterContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 15,
  },
  filterLabel: {
    marginRight: 10,
    fontSize: 16,
  },
  filterPickerWrapper: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 5,
  },
  filterPicker: {
    height: 40,
  },
  journalItem: {
    backgroundColor: 'white',
    borderRadius: 8,
    padding: 15,
    marginBottom: 10,
    flexDirection: 'row',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  journalImage: {
    width: 80,
    height: 80,
    borderRadius: 8,
  },
  journalDetails: {
    flex: 1,
    marginLeft: 15,
    justifyContent: 'center',
  },
  journalDescription: {
    fontSize: 16,
    marginBottom: 5,
  },
  journalMeta: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  journalCategory: {
    color: '#4285f4',
    fontWeight: 'bold',
  },
  journalDate: {
    color: '#666',
  },
  hiddenButtons: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    alignItems: 'center',
    height: '100%',
  },
  hiddenButton: {
    justifyContent: 'center',
    alignItems: 'center',
    width: 75,
    height: '100%',
  },
  editButton: {
    backgroundColor: '#fbbc05',
  },
  deleteButton: {
    backgroundColor: '#ea4335',
  },
  hiddenButtonText: {
    color: 'white',
    fontWeight: 'bold',
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  emptyStateText: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
  },
});

export default HomeScreen;