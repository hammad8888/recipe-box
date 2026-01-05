import { useRouter } from "expo-router";
import { collection, deleteDoc, doc, onSnapshot, updateDoc } from "firebase/firestore";
import React, { useEffect, useState } from "react";
import { FlatList, SafeAreaView, StyleSheet, Text, TextInput, TouchableOpacity, View } from "react-native";
import Icon from "react-native-vector-icons/MaterialIcons";
import Header from "./components/Header";
import RecipeItem from "./components/RecipeItem";
import { db } from "./config/firebase";
import { COLORS } from "./styles/colors";

export default function HomeScreen() {
  const router = useRouter();
  const [recipes, setRecipes] = useState([]);
  const [search, setSearch] = useState("");

  // Fetch recipes from Firestore
  useEffect(() => {
    const unsubscribe = onSnapshot(collection(db, "recipes"), (snapshot) => {
      const data = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
      setRecipes(data.sort((a, b) => b.created_at - a.created_at));
    });
    return () => unsubscribe();
  }, []);

  const handleDelete = async (id) => {
    await deleteDoc(doc(db, "recipes", id));
  };

  const toggleFavorite = async (recipe) => {
    await updateDoc(doc(db, "recipes", recipe.id), { favorite: !recipe.favorite });
  };

  const filtered = recipes.filter(
    (r) =>
      r.recipe_name.toLowerCase().includes(search.toLowerCase()) ||
      (r.ingredients?.join(",") || "").toLowerCase().includes(search.toLowerCase())
  );

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: COLORS.background }}>
      <Header recipeCount={recipes.length} />

      <View style={styles.searchContainer}>
        <Icon name="search" size={22} color={COLORS.textSecondary} />
        <TextInput
          style={styles.searchInput}
          placeholder="Search recipes..."
          value={search}
          onChangeText={setSearch}
        />
      </View>

      <TouchableOpacity
        style={styles.addBtn}
        onPress={() => router.push("/screens/RecipeFormScreen?mode=add")}
      >
        <Text style={styles.addBtnText}>+ Add New Recipe</Text>
      </TouchableOpacity>

      <FlatList
        data={filtered}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <RecipeItem
            recipe={item}
            onEdit={() => router.push({ pathname: "/screens/RecipeFormScreen", params: { mode: "edit", recipeId: item.id } })}
            onDelete={() => handleDelete(item.id)}
            onView={() => router.push({ pathname: "/screens/RecipeDetailsScreen", params: { recipeId: item.id } })}
            onToggleFavorite={() => toggleFavorite(item)}
          />
        )}
        contentContainerStyle={{ padding: 20 }}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  searchContainer: {
    flexDirection: "row",
    backgroundColor: COLORS.surface,
    margin: 20,
    padding: 10,
    borderRadius: 12,
    alignItems: "center",
  },
  searchInput: { flex: 1, marginLeft: 8 },
  addBtn: {
    backgroundColor: COLORS.primary,
    marginHorizontal: 20,
    padding: 14,
    borderRadius: 12,
    marginBottom: 10,
    alignItems: "center",
  },
  addBtnText: { color: COLORS.surface, fontWeight: "600", fontSize: 16 },
});
