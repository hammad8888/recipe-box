import { initializeApp } from 'firebase/app';
import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  getFirestore,
  onSnapshot,
  updateDoc,
} from 'firebase/firestore';
import { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Dimensions,
  FlatList,
  Keyboard,
  KeyboardAvoidingView,
  Modal,
  Platform,
  SafeAreaView,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  TouchableWithoutFeedback,
  View,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';

// Firebase Configuration
const firebaseConfig = {
  apiKey: "AIzaSyBIaJrKa9-2gqlj3CzE4GHwgICSOZgODAw",
  authDomain: "recipe-box-6d72.firebaseapp.com",
  projectId: "recipe-box-6d72",
  storageBucket: "recipe-box-6d72.firebasestorage.app",
  messagingSenderId: "1091688303902",
  appId: "1:1091688303902:web:998937b4c8d1393cb3cd0f",
  measurementId: "G-4PX2TNN47K"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

// Color Palette
const COLORS = {
  primary: '#FF6B6B',       // Coral Red
  secondary: '#4ECDC4',     // Turquoise
  accent: '#FFD166',        // Yellow
  background: '#F7F9FC',    // Light Gray
  surface: '#FFFFFF',       // White
  textPrimary: '#2D3436',   // Dark Gray
  textSecondary: '#636E72', // Medium Gray
  textLight: '#B2BEC3',     // Light Gray
  border: '#DFE6E9',        // Border Gray
  success: '#00B894',       // Green
  warning: '#FDCB6E',       // Yellow
  error: '#E17055',         // Orange Red
  info: '#0984E3',          // Blue
};

const { width } = Dimensions.get('window');

const Index = () => {
  // States
  const [recipes, setRecipes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [selectedRecipe, setSelectedRecipe] = useState(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [search, setSearch] = useState('');

  // Form State
  const [form, setForm] = useState({
    recipe_name: '',
    description: '',
    ingredients: '',
    category: '',
    preparation_time: '',
    cooking_time: '',
    servings: '',
  });

  // Fetch recipes in real-time
  useEffect(() => {
    const unsubscribe = onSnapshot(
      collection(db, 'recipes'),
      (snapshot) => {
        const recipesData = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
        setRecipes(recipesData);
        setLoading(false);
      },
      (error) => {
        console.error("Firestore listener error:", error);
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, []);

  // Filter recipes based on search
  const filteredRecipes = recipes.filter((recipe) => {
    if (!search.trim()) return true;
    
    const searchTerm = search.toLowerCase();
    return (
      (recipe.recipe_name || '').toLowerCase().includes(searchTerm) ||
      (recipe.description || '').toLowerCase().includes(searchTerm) ||
      (recipe.category || '').toLowerCase().includes(searchTerm) ||
      (recipe.ingredients || []).some(ing => 
        ing.toLowerCase().includes(searchTerm)
      )
    );
  });

  // Handle form input changes
  const handleInputChange = (name, value) => {
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  // Reset form
  const resetForm = () => {
    setForm({
      recipe_name: '',
      description: '',
      ingredients: '',
      category: '',
      preparation_time: '',
      cooking_time: '',
      servings: '',
    });
    setIsEditing(false);
    setEditingId(null);
  };

  // Add new recipe
  const handleAddRecipe = async () => {
    if (!form.recipe_name.trim()) {
      Alert.alert('Error', 'Recipe name is required!');
      return;
    }

    if (!form.ingredients.trim()) {
      Alert.alert('Error', 'Ingredients are required!');
      return;
    }

    const payload = {
      recipe_name: form.recipe_name.trim(),
      description: form.description.trim(),
      ingredients: form.ingredients
        ? form.ingredients.split(',').map((s) => s.trim()).filter(Boolean)
        : [],
      category: form.category.trim(),
      preparation_time: Number(form.preparation_time) || 0,
      cooking_time: Number(form.cooking_time) || 0,
      servings: Number(form.servings) || 1,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    try {
      await addDoc(collection(db, 'recipes'), payload);
      resetForm();
      Alert.alert('Success', 'Recipe added successfully!');
    } catch (error) {
      console.error('Add recipe failed:', error);
      Alert.alert('Error', 'Failed to add recipe');
    }
  };

  // Update existing recipe
  const handleUpdateRecipe = async () => {
    if (!form.recipe_name.trim()) {
      Alert.alert('Error', 'Recipe name is required!');
      return;
    }

    if (!form.ingredients.trim()) {
      Alert.alert('Error', 'Ingredients are required!');
      return;
    }

    const payload = {
      recipe_name: form.recipe_name.trim(),
      description: form.description.trim(),
      ingredients: form.ingredients
        ? form.ingredients.split(',').map((s) => s.trim()).filter(Boolean)
        : [],
      category: form.category.trim(),
      preparation_time: Number(form.preparation_time) || 0,
      cooking_time: Number(form.cooking_time) || 0,
      servings: Number(form.servings) || 1,
      updated_at: new Date().toISOString(),
    };

    try {
      await updateDoc(doc(db, 'recipes', editingId), payload);
      resetForm();
      Alert.alert('Success', 'Recipe updated successfully!');
    } catch (error) {
      console.error('Update recipe failed:', error);
      Alert.alert('Error', 'Failed to update recipe');
    }
  };

  // Delete recipe
  const handleDeleteRecipe = async (id) => {
    Alert.alert(
      'Delete Recipe',
      'Are you sure you want to delete this recipe?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              await deleteDoc(doc(db, 'recipes', id));
              if (selectedRecipe?.id === id) setSelectedRecipe(null);
              Alert.alert('Success', 'Recipe deleted successfully!');
            } catch (error) {
              console.error('Delete failed:', error);
              Alert.alert('Error', 'Failed to delete recipe');
            }
          },
        },
      ]
    );
  };

  // Edit recipe
  const handleEditRecipe = (recipe) => {
    setIsEditing(true);
    setEditingId(recipe.id);
    setForm({
      recipe_name: recipe.recipe_name || '',
      description: recipe.description || '',
      ingredients: Array.isArray(recipe.ingredients) 
        ? recipe.ingredients.join(', ') 
        : recipe.ingredients || '',
      category: recipe.category || '',
      preparation_time: recipe.preparation_time?.toString() || '',
      cooking_time: recipe.cooking_time?.toString() || '',
      servings: recipe.servings?.toString() || '',
    });
    setSelectedRecipe(null);
  };

  // View recipe details
  const handleViewRecipe = (recipe) => {
    setSelectedRecipe(recipe);
    setModalVisible(true);
  };

  // Submit form (Add or Update)
  const handleSubmit = () => {
    if (isEditing) {
      handleUpdateRecipe();
    } else {
      handleAddRecipe();
    }
  };

  // Cancel editing
  const handleCancelEdit = () => {
    resetForm();
  };

  // Recipe Item Component
  const renderRecipeItem = ({ item, index }) => (
    <TouchableOpacity
      style={[
        styles.recipeItem,
        index % 2 === 0 ? styles.recipeItemEven : styles.recipeItemOdd
      ]}
      onPress={() => handleViewRecipe(item)}
      activeOpacity={0.7}
    >
      <View style={styles.recipeItemLeft}>
        <View style={styles.recipeIconContainer}>
          <Icon name="restaurant" size={24} color={COLORS.primary} />
        </View>
        <View style={styles.recipeInfo}>
          <Text style={styles.recipeName} numberOfLines={1}>
            {item.recipe_name}
          </Text>
          <Text style={styles.recipeMeta} numberOfLines={1}>
            <Icon name="category" size={12} color={COLORS.textSecondary} /> {item.category || 'Uncategorized'}
            {'  •  '}
            <Icon name="people" size={12} color={COLORS.textSecondary} /> {item.servings} servings
            {'  •  '}
            <Icon name="timer" size={12} color={COLORS.textSecondary} /> {item.preparation_time + item.cooking_time} min
          </Text>
        </View>
      </View>
      <View style={styles.recipeActions}>
        <TouchableOpacity
          style={[styles.actionButton, styles.editButton]}
          onPress={() => handleEditRecipe(item)}
        >
          <Icon name="edit" size={18} color={COLORS.warning} />
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.actionButton, styles.deleteButton]}
          onPress={() => handleDeleteRecipe(item.id)}
        >
          <Icon name="delete" size={18} color={COLORS.error} />
        </TouchableOpacity>
      </View>
    </TouchableOpacity>
  );

  // Loading Component
  if (loading) {
    return (
      <SafeAreaView style={styles.loadingContainer}>
        <StatusBar backgroundColor={COLORS.primary} barStyle="light-content" />
        <View style={styles.loadingContent}>
          <ActivityIndicator size="large" color={COLORS.primary} />
          <Text style={styles.loadingText}>Loading Recipes...</Text>
          <Text style={styles.loadingSubtext}>Please wait a moment</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar backgroundColor={COLORS.primary} barStyle="light-content" />
      <KeyboardAvoidingView
        style={styles.container}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 20}
      >
        <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
          <ScrollView 
            style={styles.scrollView}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.scrollContent}
          >
            {/* Header */}
            <View style={styles.header}>
              <View style={styles.headerTop}>
                <View style={styles.logoContainer}>
                  <Icon name="restaurant-menu" size={32} color={COLORS.surface} />
                  <Text style={styles.headerTitle}>RecipeBox</Text>
                </View>
                <View style={styles.headerStats}>
                  <Text style={styles.statText}>{recipes.length} Recipes</Text>
                </View>
              </View>
              <Text style={styles.headerSubtitle}>Create, manage & share your favorite recipes</Text>
            </View>

            {/* Search Bar */}
            <View style={styles.searchContainer}>
              <Icon name="search" size={22} color={COLORS.textSecondary} style={styles.searchIcon} />
              <TextInput
                style={styles.searchInput}
                placeholder="Search recipes by name, ingredients or category..."
                value={search}
                onChangeText={setSearch}
                placeholderTextColor={COLORS.textLight}
              />
              {search.length > 0 && (
                <TouchableOpacity onPress={() => setSearch('')} style={styles.clearSearchButton}>
                  <Icon name="close" size={20} color={COLORS.textLight} />
                </TouchableOpacity>
              )}
            </View>

            {/* Recipe Form Section */}
            <View style={styles.formSection}>
              <View style={styles.sectionHeader}>
                <Icon name={isEditing ? "edit" : "add-circle"} size={24} color={COLORS.primary} />
                <Text style={styles.sectionTitle}>
                  {isEditing ? 'Edit Recipe' : 'Add New Recipe'}
                </Text>
              </View>
              
              <View style={styles.formCard}>
                {/* Recipe Name */}
                <View style={styles.inputGroup}>
                  <Text style={styles.inputLabel}>Recipe Name *</Text>
                  <View style={styles.inputWithIcon}>
                    <Icon name="title" size={20} color={COLORS.textSecondary} style={styles.inputIcon} />
                    <TextInput
                      style={styles.input}
                      placeholder="Enter recipe name"
                      value={form.recipe_name}
                      onChangeText={(text) => handleInputChange('recipe_name', text)}
                    />
                  </View>
                </View>

                {/* Description */}
                <View style={styles.inputGroup}>
                  <Text style={styles.inputLabel}>Description</Text>
                  <View style={styles.inputWithIcon}>
                    <Icon name="description" size={20} color={COLORS.textSecondary} style={styles.inputIcon} />
                    <TextInput
                      style={[styles.input, styles.textArea]}
                      placeholder="Brief description about the recipe"
                      value={form.description}
                      onChangeText={(text) => handleInputChange('description', text)}
                      multiline
                      numberOfLines={3}
                      textAlignVertical="top"
                    />
                  </View>
                </View>

                {/* Ingredients */}
                <View style={styles.inputGroup}>
                  <Text style={styles.inputLabel}>Ingredients *</Text>
                  <View style={styles.inputWithIcon}>
                    <Icon name="kitchen" size={20} color={COLORS.textSecondary} style={styles.inputIcon} />
                    <TextInput
                      style={[styles.input, styles.textArea]}
                      placeholder="Enter ingredients separated by commas"
                      value={form.ingredients}
                      onChangeText={(text) => handleInputChange('ingredients', text)}
                      multiline
                      numberOfLines={3}
                      textAlignVertical="top"
                    />
                  </View>
                  <Text style={styles.inputHint}>e.g., flour, sugar, eggs, milk</Text>
                </View>

                {/* Details Row */}
                <View style={styles.detailsRow}>
                  <View style={[styles.inputGroup, styles.flexInput]}>
                    <Text style={styles.inputLabel}>Category</Text>
                    <View style={styles.inputWithIcon}>
                      <Icon name="category" size={18} color={COLORS.textSecondary} style={styles.inputIcon} />
                      <TextInput
                        style={styles.input}
                        placeholder="e.g., Breakfast"
                        value={form.category}
                        onChangeText={(text) => handleInputChange('category', text)}
                      />
                    </View>
                  </View>

                  <View style={[styles.inputGroup, styles.flexInput]}>
                    <Text style={styles.inputLabel}>Prep (min)</Text>
                    <View style={styles.inputWithIcon}>
                      <Icon name="timer" size={18} color={COLORS.textSecondary} style={styles.inputIcon} />
                      <TextInput
                        style={styles.input}
                        placeholder="0"
                        value={form.preparation_time}
                        onChangeText={(text) => handleInputChange('preparation_time', text)}
                        keyboardType="numeric"
                      />
                    </View>
                  </View>

                  <View style={[styles.inputGroup, styles.flexInput]}>
                    <Text style={styles.inputLabel}>Cook (min)</Text>
                    <View style={styles.inputWithIcon}>
                      <Icon name="cooking" size={18} color={COLORS.textSecondary} style={styles.inputIcon} />
                      <TextInput
                        style={styles.input}
                        placeholder="0"
                        value={form.cooking_time}
                        onChangeText={(text) => handleInputChange('cooking_time', text)}
                        keyboardType="numeric"
                      />
                    </View>
                  </View>

                  <View style={[styles.inputGroup, styles.flexInput]}>
                    <Text style={styles.inputLabel}>Servings</Text>
                    <View style={styles.inputWithIcon}>
                      <Icon name="people" size={18} color={COLORS.textSecondary} style={styles.inputIcon} />
                      <TextInput
                        style={styles.input}
                        placeholder="1"
                        value={form.servings}
                        onChangeText={(text) => handleInputChange('servings', text)}
                        keyboardType="numeric"
                      />
                    </View>
                  </View>
                </View>

                {/* Form Buttons */}
                <View style={styles.formButtons}>
                  <TouchableOpacity
                    style={[
                      styles.button,
                      isEditing ? styles.updateButton : styles.addButton,
                      (!form.recipe_name.trim() || !form.ingredients.trim()) && styles.buttonDisabled
                    ]}
                    onPress={handleSubmit}
                    disabled={!form.recipe_name.trim() || !form.ingredients.trim()}
                  >
                    <Icon 
                      name={isEditing ? "check-circle" : "add-circle-outline"} 
                      size={20} 
                      color={COLORS.surface} 
                      style={styles.buttonIcon}
                    />
                    <Text style={styles.buttonText}>
                      {isEditing ? 'Update' : 'Add'}
                    </Text>
                  </TouchableOpacity>

                  {isEditing && (
                    <TouchableOpacity
                      style={[styles.button, styles.cancelButton]}
                      onPress={handleCancelEdit}
                    >
                      <Icon name="cancel" size={20} color={COLORS.textSecondary} style={styles.buttonIcon} />
                      <Text style={[styles.buttonText, styles.cancelButtonText]}>Cancel</Text>
                    </TouchableOpacity>
                  )}
                </View>
              </View>
            </View>

            {/* Recipe List Section */}
            <View style={styles.listSection}>
              <View style={styles.sectionHeader}>
                <Icon name="list" size={24} color={COLORS.secondary} />
                <Text style={styles.sectionTitle}>
                  All Recipes ({filteredRecipes.length})
                </Text>
              </View>

              {filteredRecipes.length === 0 ? (
                <View style={styles.emptyState}>
                  <Icon 
                    name={search ? "search-off" : "restaurant"} 
                    size={60} 
                    color={COLORS.border} 
                  />
                  <Text style={styles.emptyTitle}>
                    {search ? 'No recipes found' : 'No recipes yet'}
                  </Text>
                  <Text style={styles.emptySubtitle}>
                    {search ? 'Try a different search term' : 'Add your first recipe to get started!'}
                  </Text>
                  {!search && (
                    <TouchableOpacity 
                      style={styles.emptyButton}
                      onPress={() => {
                        // Scroll to form
                      }}
                    >
                      <Text style={styles.emptyButtonText}>Add First Recipe</Text>
                    </TouchableOpacity>
                  )}
                </View>
              ) : (
                <View style={styles.listCard}>
                  <FlatList
                    data={filteredRecipes}
                    renderItem={renderRecipeItem}
                    keyExtractor={(item) => item.id}
                    scrollEnabled={false}
                    showsVerticalScrollIndicator={false}
                  />
                </View>
              )}
            </View>

            {/* Bottom Padding */}
            <View style={styles.bottomPadding} />
          </ScrollView>
        </TouchableWithoutFeedback>

        {/* Recipe Details Modal */}
        <Modal
          animationType="slide"
          transparent={true}
          visible={modalVisible}
          onRequestClose={() => setModalVisible(false)}
        >
          <View style={styles.modalOverlay}>
            <View style={styles.modalContainer}>
              {/* Modal Header */}
              <View style={styles.modalHeader}>
                <View style={styles.modalHeaderLeft}>
                  <Icon name="restaurant-menu" size={24} color={COLORS.primary} />
                  <Text style={styles.modalTitle} numberOfLines={1}>
                    {selectedRecipe?.recipe_name}
                  </Text>
                </View>
                <TouchableOpacity
                  onPress={() => setModalVisible(false)}
                  style={styles.modalCloseButton}
                >
                  <Icon name="close" size={24} color={COLORS.textPrimary} />
                </TouchableOpacity>
              </View>

              {/* Modal Content */}
              <ScrollView style={styles.modalContent} showsVerticalScrollIndicator={false}>
                {/* Description */}
                {selectedRecipe?.description && (
                  <View style={styles.modalSection}>
                    <Text style={styles.modalSectionTitle}>Description</Text>
                    <Text style={styles.modalDescription}>{selectedRecipe.description}</Text>
                  </View>
                )}

                {/* Ingredients */}
                <View style={styles.modalSection}>
                  <View style={styles.modalSectionHeader}>
                    <Icon name="kitchen" size={20} color={COLORS.primary} />
                    <Text style={styles.modalSectionTitle}>Ingredients</Text>
                  </View>
                  <View style={styles.ingredientsList}>
                    {(selectedRecipe?.ingredients || []).map((ingredient, index) => (
                      <View key={index} style={styles.ingredientItem}>
                        <Icon name="circle" size={8} color={COLORS.primary} />
                        <Text style={styles.ingredientText}>{ingredient}</Text>
                      </View>
                    ))}
                  </View>
                </View>

                {/* Recipe Details */}
                <View style={styles.modalSection}>
                  <View style={styles.modalSectionHeader}>
                    <Icon name="info" size={20} color={COLORS.primary} />
                    <Text style={styles.modalSectionTitle}>Recipe Details</Text>
                  </View>
                  <View style={styles.detailsGrid}>
                    <View style={styles.detailItem}>
                      <Icon name="category" size={18} color={COLORS.secondary} />
                      <Text style={styles.detailLabel}>Category</Text>
                      <Text style={styles.detailValue}>{selectedRecipe?.category || 'Uncategorized'}</Text>
                    </View>
                    <View style={styles.detailItem}>
                      <Icon name="timer" size={18} color={COLORS.secondary} />
                      <Text style={styles.detailLabel}>Prep Time</Text>
                      <Text style={styles.detailValue}>{selectedRecipe?.preparation_time || 0} min</Text>
                    </View>
                    <View style={styles.detailItem}>
                      <Icon name="cooking" size={18} color={COLORS.secondary} />
                      <Text style={styles.detailLabel}>Cook Time</Text>
                      <Text style={styles.detailValue}>{selectedRecipe?.cooking_time || 0} min</Text>
                    </View>
                    <View style={styles.detailItem}>
                      <Icon name="people" size={18} color={COLORS.secondary} />
                      <Text style={styles.detailLabel}>Servings</Text>
                      <Text style={styles.detailValue}>{selectedRecipe?.servings || 1}</Text>
                    </View>
                  </View>
                </View>
              </ScrollView>

              {/* Modal Footer */}
              <View style={styles.modalFooter}>
                <TouchableOpacity
                  style={[styles.modalActionButton, styles.editActionButton]}
                  onPress={() => {
                    setModalVisible(false);
                    setTimeout(() => handleEditRecipe(selectedRecipe), 300);
                  }}
                >
                  <Icon name="edit" size={18} color={COLORS.surface} />
                  <Text style={styles.modalActionButtonText}>Edit Recipe</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.modalActionButton, styles.deleteActionButton]}
                  onPress={() => {
                    setModalVisible(false);
                    setTimeout(() => handleDeleteRecipe(selectedRecipe?.id), 300);
                  }}
                >
                  <Icon name="delete" size={18} color={COLORS.surface} />
                  <Text style={styles.modalActionButtonText}>Delete</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </Modal>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

// Styles
const styles = StyleSheet.create({
  // Safe Area & Container
  safeArea: {
    flex: 1,
    paddingTop:40,
    paddingBottom: 20,
    backgroundColor: COLORS.background,
  },
  container: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 30,
  },
  
  // Loading
  loadingContainer: {
    flex: 1,
    backgroundColor: COLORS.background,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingContent: {
    alignItems: 'center',
  },
  loadingText: {
    fontSize: 20,
    fontWeight: '600',
    color: COLORS.textPrimary,
    marginTop: 20,
  },
  loadingSubtext: {
    fontSize: 14,
    color: COLORS.textSecondary,
    marginTop: 8,
  },

  // Header
  header: {
    backgroundColor: COLORS.primary,
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 30,
    borderBottomLeftRadius: 25,
    borderBottomRightRadius: 25,
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
  },
  headerTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  logoContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: COLORS.surface,
    marginLeft: 10,
  },
  headerStats: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    paddingHorizontal: 16,
    paddingVertical: 6,
    borderRadius: 20,
  },
  statText: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.surface,
  },
  headerSubtitle: {
    fontSize: 15,
    color: 'rgba(255, 255, 255, 0.85)',
    lineHeight: 22,
  },

  // Search Bar
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.surface,
    marginHorizontal: 20,
    marginTop: -20,
    paddingHorizontal: 16,
    borderRadius: 15,
    elevation: 6,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
  },
  searchIcon: {
    marginRight: 10,
  },
  searchInput: {
    flex: 1,
    paddingVertical: 16,
    fontSize: 16,
    color: COLORS.textPrimary,
  },
  clearSearchButton: {
    padding: 8,
  },

  // Sections
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
    marginTop: 10,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: COLORS.textPrimary,
    marginLeft: 10,
  },

  // Form Section
  formSection: {
    paddingHorizontal: 20,
    marginTop: 25,
  },
  formCard: {
    backgroundColor: COLORS.surface,
    borderRadius: 18,
    padding: 20,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 6,
  },

  // Input Groups
  inputGroup: {
    marginBottom: 20,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.textPrimary,
    marginBottom: 8,
  },
  inputWithIcon: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.background,
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: COLORS.border,
    overflow: 'hidden',
  },
  inputIcon: {
    paddingHorizontal: 14,
  },
  input: {
    flex: 1,
    paddingVertical: 14,
    fontSize: 16,
    color: COLORS.textPrimary,
    paddingRight: 14,
  },
  textArea: {
    minHeight: 100,
    paddingTop: 14,
    paddingBottom: 14,
  },
  inputHint: {
    fontSize: 12,
    color: COLORS.textLight,
    marginTop: 6,
    fontStyle: 'italic',
  },

  // Details Row
  detailsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginHorizontal: -5,
  },
  flexInput: {
    flex: 1,
    minWidth: width / 4 - 20,
    marginHorizontal: 5,
  },

  // Form Buttons
  formButtons: {
    flexDirection: 'row',
    marginTop: 10,
  },
  button: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    borderRadius: 12,
    marginHorizontal: 5,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  addButton: {
    backgroundColor: COLORS.primary,
  },
  updateButton: {
    backgroundColor: COLORS.success,
  },
  cancelButton: {
    backgroundColor: COLORS.background,
    borderWidth: 2,
    borderColor: COLORS.border,
  },
  buttonDisabled: {
    backgroundColor: COLORS.textLight,
    opacity: 0.7,
  },
  buttonIcon: {
    marginRight: 8,
  },
  buttonText: {
    fontSize: 16,
    fontWeight: '700',
    color: COLORS.surface,
  },
  cancelButtonText: {
    color: COLORS.textSecondary,
  },

  // List Section
  listSection: {
    paddingHorizontal: 20,
    marginTop: 25,
  },
  listCard: {
    backgroundColor: COLORS.surface,
    borderRadius: 18,
    padding: 5,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 6,
  },

  // Recipe Item
  recipeItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderRadius: 12,
    marginVertical: 4,
  },
  recipeItemEven: {
    backgroundColor: COLORS.background,
  },
  recipeItemOdd: {
    backgroundColor: 'rgba(255, 255, 255, 0.7)',
  },
  recipeItemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  recipeIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 10,
    backgroundColor: 'rgba(255, 107, 107, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  recipeInfo: {
    flex: 1,
  },
  recipeName: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.textPrimary,
    marginBottom: 4,
  },
  recipeMeta: {
    fontSize: 12,
    color: COLORS.textSecondary,
  },
  recipeActions: {
    flexDirection: 'row',
  },
  actionButton: {
    width: 40,
    height: 40,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 8,
  },
  editButton: {
    backgroundColor: 'rgba(253, 203, 110, 0.1)',
  },
  deleteButton: {
    backgroundColor: 'rgba(225, 112, 85, 0.1)',
  },

  // Empty State
  emptyState: {
    backgroundColor: COLORS.surface,
    borderRadius: 18,
    padding: 40,
    alignItems: 'center',
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 6,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: COLORS.textPrimary,
    marginTop: 20,
    marginBottom: 8,
  },
  emptySubtitle: {
    fontSize: 14,
    color: COLORS.textSecondary,
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: 20,
  },
  emptyButton: {
    backgroundColor: COLORS.primary,
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 10,
  },
  emptyButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.surface,
  },

  // Modal Styles
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContainer: {
    backgroundColor: COLORS.surface,
    borderTopLeftRadius: 25,
    borderTopRightRadius: 25,
    maxHeight: '85%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 18,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  modalHeaderLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  modalTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: COLORS.textPrimary,
    marginLeft: 12,
    flex: 1,
  },
  modalCloseButton: {
    padding: 8,
  },
  modalContent: {
    paddingHorizontal: 20,
    paddingVertical: 20,
  },
  modalSection: {
    marginBottom: 25,
  },
  modalSectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  modalSectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: COLORS.textPrimary,
    marginLeft: 10,
  },
  modalDescription: {
    fontSize: 16,
    color: COLORS.textSecondary,
    lineHeight: 24,
    textAlign: 'justify',
  },
  ingredientsList: {
    marginLeft: 5,
  },
  ingredientItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 10,
  },
  ingredientText: {
    fontSize: 16,
    color: COLORS.textSecondary,
    marginLeft: 12,
    flex: 1,
    lineHeight: 22,
  },
  detailsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginHorizontal: -8,
  },
  detailItem: {
    width: '50%',
    paddingHorizontal: 8,
    marginBottom: 16,
  },
  detailLabel: {
    fontSize: 12,
    color: COLORS.textLight,
    marginTop: 4,
    marginBottom: 2,
  },
  detailValue: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.textPrimary,
  },
  modalFooter: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    paddingVertical: 18,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
    gap: 12,
  },
  modalActionButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    borderRadius: 12,
    gap: 8,
  },
  editActionButton: {
    backgroundColor: COLORS.primary,
  },
  deleteActionButton: {
    backgroundColor: COLORS.error,
  },
  modalActionButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.surface,
  },

  // Bottom Padding
  bottomPadding: {
    height: 30,
  },
});

export default Index;