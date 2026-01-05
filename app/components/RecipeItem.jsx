import React from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import Icon from "react-native-vector-icons/MaterialIcons";
import { COLORS } from "../styles/colors";

export default function RecipeItem({ recipe, onEdit, onDelete, onView, onToggleFavorite }) {
  return (
    <TouchableOpacity style={styles.item} onPress={onView}>
      <View style={{ flex: 1 }}>
        <Text style={styles.name}>{recipe.recipe_name}</Text>
        <Text style={styles.meta}>
          {recipe.category || "Uncategorized"} • {recipe.servings} servings • {recipe.preparation_time + recipe.cooking_time} min
        </Text>
      </View>
      <View style={styles.actions}>
        <TouchableOpacity onPress={onToggleFavorite} style={{ marginRight: 8 }}>
          <Icon name={recipe.favorite ? "star" : "star-border"} size={22} color={COLORS.warning} />
        </TouchableOpacity>
        <TouchableOpacity onPress={onEdit} style={{ marginRight: 8 }}>
          <Icon name="edit" size={18} color={COLORS.info} />
        </TouchableOpacity>
        <TouchableOpacity onPress={onDelete}>
          <Icon name="delete" size={18} color={COLORS.error} />
        </TouchableOpacity>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  item: { flexDirection: "row", justifyContent: "space-between", backgroundColor: COLORS.surface, padding: 15, borderRadius: 12, marginBottom: 8 },
  name: { fontSize: 16, fontWeight: "600", color: COLORS.textPrimary },
  meta: { fontSize: 12, color: COLORS.textSecondary, marginTop: 3 },
  actions: { flexDirection: "row", alignItems: "center" },
});
