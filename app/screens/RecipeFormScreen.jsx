

import { useLocalSearchParams, useRouter } from "expo-router";
import { addDoc, collection, doc, getDoc, updateDoc } from "firebase/firestore";
import { useEffect, useState } from "react";
import {
  Alert,
  KeyboardAvoidingView,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import Icon from "react-native-vector-icons/MaterialIcons";
import { db } from "../config/firebase";
import { COLORS } from "../styles/colors";

export default function RecipeFormScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const { mode, recipeId } = params;

  const [form, setForm] = useState({
    recipe_name: "",
    description: "",
    ingredients: "",
    favorite: false,
    category: "",
    cuisine: "",
    difficulty_level: "",
    preparation_time: "",
    cooking_time: "",
    servings: "",
  });

  useEffect(() => {
    if (mode === "edit" && recipeId) {
      const fetchRecipe = async () => {
        const docSnap = await getDoc(doc(db, "recipes", recipeId));
        if (docSnap.exists()) {
          const data = docSnap.data();
          setForm({
            recipe_name: data.recipe_name || "",
            description: data.description || "",
            ingredients: data.ingredients?.join(", ") || "",
            favorite: data.favorite || false,
            category: data.category || "",
            cuisine: data.cuisine || "",
            difficulty_level: data.difficulty_level || "",
            preparation_time: data.preparation_time?.toString() || "",
            cooking_time: data.cooking_time?.toString() || "",
            servings: data.servings?.toString() || "",
          });
        }
      };
      fetchRecipe();
    }
  }, [mode, recipeId]);

  const handleChange = (key, value) => {
    // Allow only numbers for certain fields
    if (["preparation_time", "cooking_time", "servings"].includes(key)) {
      value = value.replace(/[^0-9]/g, "");
    }
    setForm({ ...form, [key]: value });
  };

  const handleSave = async () => {
    if (!form.recipe_name.trim()) return Alert.alert("Error", "Recipe name is required!");
    const payload = {
      recipe_name: form.recipe_name.trim(),
      description: form.description.trim(),
      ingredients: form.ingredients.split(",").map((i) => i.trim()).filter(Boolean),
      favorite: form.favorite,
      category: form.category.trim(),
      cuisine: form.cuisine.trim(),
      difficulty_level: form.difficulty_level.trim(),
      preparation_time: Number(form.preparation_time) || 0,
      cooking_time: Number(form.cooking_time) || 0,
      servings: Number(form.servings) || 1,
      updated_at: new Date().toISOString(),
    };

    try {
      if (mode === "edit") {
        await updateDoc(doc(db, "recipes", recipeId), payload);
      } else {
        await addDoc(collection(db, "recipes"), { ...payload, created_at: new Date().toISOString() });
      }
      Alert.alert("Success", "Recipe saved!");
      router.back();
    } catch (err) {
      console.error(err);
      Alert.alert("Error", "Failed to save recipe");
    }
  };

  return (
    <KeyboardAvoidingView style={{ flex: 1, backgroundColor: COLORS.background }} behavior="padding">
      <ScrollView contentContainerStyle={{ padding: 20 }}>
        <View style={styles.header}>
          <Text style={styles.title}>{mode === "edit" ? "Edit Recipe" : "Add New Recipe"}</Text>
          <TouchableOpacity onPress={() => router.back()}>
            <Icon name="close" size={28} color={COLORS.textPrimary} />
          </TouchableOpacity>
        </View>

        {[
          { label: "Recipe Name *", key: "recipe_name", placeholder: "Enter recipe name" },
          { label: "Description", key: "description", placeholder: "Enter description", multiline: true },
          { label: "Ingredients *", key: "ingredients", placeholder: "Enter ingredients separated by comma", multiline: true },
          { label: "Category", key: "category", placeholder: "e.g., Breakfast, Lunch, Dinner" },
          { label: "Cuisine", key: "cuisine", placeholder: "e.g., Pakistani, Italian" },
          { label: "Difficulty Level", key: "difficulty_level", placeholder: "Easy, Medium, Hard" },
          { label: "Prep Time (min)", key: "preparation_time", placeholder: "0", keyboard: "numeric" },
          { label: "Cook Time (min)", key: "cooking_time", placeholder: "0", keyboard: "numeric" },
          { label: "Servings", key: "servings", placeholder: "1", keyboard: "numeric" },
        ].map(({ label, key, placeholder, multiline, keyboard }) => (
          <View key={key} style={styles.inputGroup}>
            <Text style={styles.label}>{label}</Text>
            <TextInput
              style={[styles.input, multiline && { minHeight: 80 }]}
              placeholder={placeholder}
              value={form[key]}
              onChangeText={(text) => handleChange(key, text)}
              multiline={multiline || false}
              keyboardType={keyboard || "default"}
            />
          </View>
        ))}

        <TouchableOpacity style={styles.saveBtn} onPress={handleSave}>
          <Text style={styles.saveBtnText}>{mode === "edit" ? "Update Recipe" : "Save Recipe"}</Text>
        </TouchableOpacity>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  header: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 20 },
  title: { fontSize: 22, fontWeight: "700", color: COLORS.textPrimary },
  inputGroup: { marginBottom: 15 },
  label: { fontWeight: "600", marginBottom: 6, color: COLORS.textPrimary },
  input: {
    backgroundColor: COLORS.surface,
    borderRadius: 12,
    padding: 10,
    borderWidth: 1,
    borderColor: COLORS.border,
    fontSize: 16,
    color: COLORS.textPrimary,
  },
  saveBtn: { backgroundColor: COLORS.primary, padding: 15, borderRadius: 12, alignItems: "center", marginTop: 10 },
  saveBtnText: { color: COLORS.surface, fontWeight: "600", fontSize: 16 },
});
