import React, { useEffect, useState } from "react";
import { View, Text, ScrollView, StyleSheet, TouchableOpacity } from "react-native";
import { useRouter, useSearchParams } from "expo-router";
import { db } from "../config/firebase";
import { doc, getDoc } from "firebase/firestore";

export default function RecipeDetailsScreen() {
  const router = useRouter();
  const { recipeId } = useSearchParams();
  const [recipe, setRecipe] = useState(null);

  useEffect(() => {
    const fetchRecipe = async () => {
      const docSnap = await getDoc(doc(db, "recipes", recipeId));
      if (docSnap.exists()) setRecipe(docSnap.data());
    };
    fetchRecipe();
  }, [recipeId]);

  if (!recipe) return <Text style={{ textAlign:"center", marginTop:50 }}>Loading...</Text>;

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>{recipe.recipe_name}</Text>
      <Text style={styles.subtitle}>{recipe.category}</Text>
      <Text style={styles.section}>Description</Text>
      <Text>{recipe.description || "-"}</Text>
      <Text style={styles.section}>Ingredients</Text>
      {recipe.ingredients?.map((ing,i)=><Text key={i}>• {ing}</Text>)}
      <Text style={styles.section}>Details</Text>
      <Text>Prep Time: {recipe.preparation_time} min</Text>
      <Text>Cook Time: {recipe.cooking_time} min</Text>
      <Text>Servings: {recipe.servings}</Text>

      <TouchableOpacity style={styles.editBtn} onPress={()=>router.push({ pathname:"/screens/AddRecipeScreen", params:{ recipeId }})}>
        <Text style={{color:"#fff"}}>Edit Recipe</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container:{flex:1,padding:20,backgroundColor:"#F7F9FC"},
  title:{fontSize:24,fontWeight:"700",marginBottom:4},
  subtitle:{fontSize:14,color:"#636E72",marginBottom:20},
  section:{fontSize:16,fontWeight:"600",marginTop:16,marginBottom:4},
  editBtn:{marginTop:20, backgroundColor:"#FF6B6B", padding:14, borderRadius:12, alignItems:"center"}
});
