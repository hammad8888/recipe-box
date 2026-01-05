import React from "react";
import { StyleSheet, Text, View } from "react-native";
import Icon from "react-native-vector-icons/MaterialIcons";
import { COLORS } from "../styles/colors";

export default function Header({ recipeCount }) {
  return (
    <View style={styles.header}>
      <View style={styles.logo}>
        <Icon name="restaurant-menu" size={32} color={COLORS.surface} />
        <Text style={styles.title}>RecipeBox</Text>
      </View>
      <Text style={styles.subtitle}>Create, manage & share your favorite recipes</Text>
      <Text style={styles.count}>{recipeCount} Recipes</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    backgroundColor: COLORS.primary,
    padding: 20,
    borderBottomLeftRadius: 25,
    borderBottomRightRadius: 25,
    marginBottom: 10,
  },
  logo: { flexDirection: "row", alignItems: "center" },
  title: { color: COLORS.surface, fontSize: 28, fontWeight: "bold", marginLeft: 10 },
  subtitle: { color: "rgba(255,255,255,0.85)", marginTop: 5 },
  count: { color: COLORS.surface, marginTop: 8, fontWeight: "600" },
});
