import { SafeAreaView } from "react-native-safe-area-context";
import React, { useCallback, useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  FlatList,
  TextInput,
  Modal,
  ActivityIndicator,
  Alert,
  RefreshControl,
  KeyboardAvoidingView,
  Platform
} from "react-native";
import { useFocusEffect } from "@react-navigation/native";
import { ChevronLeft, Package, Plus, Pencil, Trash2 } from "lucide-react-native";
import { Colors } from "../constants/theme";
import { apiJson } from "../api/client";

type IngredientLite = {
  id: string;
  name: string;
  category: string;
  defaultUnit: string;
};

type PantryItemRow = {
  id: string;
  ingredientId: string;
  quantity: number;
  unit: string;
  expiresAt: string | null;
  source: string;
  ingredient: IngredientLite;
};

function formatExpiry(iso: string | null): string {
  if (!iso) {
    return "—";
  }
  try {
    const d = new Date(iso);
    return d.toLocaleDateString(undefined, { month: "short", day: "numeric", year: "numeric" });
  } catch {
    return "—";
  }
}

function toExpiresIso(input: string): string | undefined {
  const t = input.trim();
  if (!t) {
    return undefined;
  }
  const d = new Date(t.includes("T") ? t : `${t}T23:59:59.000Z`);
  if (Number.isNaN(d.getTime())) {
    return undefined;
  }
  return d.toISOString();
}

export function PantryScreen({ navigation }: { navigation: { goBack: () => void } }) {
  const [items, setItems] = useState<PantryItemRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [addOpen, setAddOpen] = useState(false);
  const [searchQ, setSearchQ] = useState("");
  const [searchHits, setSearchHits] = useState<IngredientLite[]>([]);
  const [searching, setSearching] = useState(false);
  const [picked, setPicked] = useState<IngredientLite | null>(null);
  const [qtyStr, setQtyStr] = useState("1");
  const [unitStr, setUnitStr] = useState("");
  const [expiryStr, setExpiryStr] = useState("");
  const [saving, setSaving] = useState(false);

  const [editItem, setEditItem] = useState<PantryItemRow | null>(null);
  const [editQty, setEditQty] = useState("");
  const [editUnit, setEditUnit] = useState("");
  const [editExpiry, setEditExpiry] = useState("");

  const loadItems = useCallback(async () => {
    try {
      const res = await apiJson<{ items: PantryItemRow[] }>("/pantry/items", { method: "GET" });
      setItems(res.items ?? []);
    } catch (e: unknown) {
      const msg = e && typeof e === "object" && "message" in e ? String((e as { message: string }).message) : "Could not load pantry";
      Alert.alert("Pantry", msg);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      setLoading(true);
      void loadItems();
    }, [loadItems])
  );

  useEffect(() => {
    if (!addOpen) {
      return;
    }
    const q = searchQ.trim();
    if (q.length < 2) {
      setSearchHits([]);
      return;
    }
    const t = setTimeout(() => {
      void (async () => {
        setSearching(true);
        try {
          const res = await apiJson<{ items: IngredientLite[] }>(
            `/pantry/ingredients?q=${encodeURIComponent(q)}`,
            { method: "GET" }
          );
          setSearchHits(res.items ?? []);
        } catch {
          setSearchHits([]);
        } finally {
          setSearching(false);
        }
      })();
    }, 320);
    return () => clearTimeout(t);
  }, [searchQ, addOpen]);

  const onRefresh = () => {
    setRefreshing(true);
    void loadItems();
  };

  const openAdd = () => {
    setSearchQ("");
    setSearchHits([]);
    setPicked(null);
    setQtyStr("1");
    setUnitStr("");
    setExpiryStr("");
    setAddOpen(true);
  };

  const closeAdd = () => {
    setAddOpen(false);
  };

  const submitAdd = async () => {
    if (!picked) {
      Alert.alert("Pantry", "Choose an ingredient from search.");
      return;
    }
    const qty = Number(qtyStr.replace(",", "."));
    if (!Number.isFinite(qty) || qty <= 0) {
      Alert.alert("Pantry", "Enter a valid quantity.");
      return;
    }
    const unit = (unitStr || picked.defaultUnit).trim();
    if (!unit) {
      Alert.alert("Pantry", "Enter a unit (e.g. g, lb, pcs).");
      return;
    }
    const expiresAt = toExpiresIso(expiryStr);
    setSaving(true);
    try {
      await apiJson("/pantry/items", {
        method: "POST",
        body: JSON.stringify({
          ingredientId: picked.id,
          quantity: qty,
          unit,
          ...(expiresAt ? { expiresAt } : {})
        })
      });
      closeAdd();
      await loadItems();
    } catch (e: unknown) {
      const msg = e && typeof e === "object" && "message" in e ? String((e as { message: string }).message) : "Save failed";
      Alert.alert("Pantry", msg);
    } finally {
      setSaving(false);
    }
  };

  const openEdit = (row: PantryItemRow) => {
    setEditItem(row);
    setEditQty(String(row.quantity));
    setEditUnit(row.unit);
    setEditExpiry(row.expiresAt ? row.expiresAt.slice(0, 10) : "");
  };

  const submitEdit = async () => {
    if (!editItem) {
      return;
    }
    const qty = Number(editQty.replace(",", "."));
    if (!Number.isFinite(qty) || qty <= 0) {
      Alert.alert("Pantry", "Enter a valid quantity.");
      return;
    }
    const unit = editUnit.trim();
    if (!unit) {
      Alert.alert("Pantry", "Enter a unit.");
      return;
    }
    const expiresAt = toExpiresIso(editExpiry);
    setSaving(true);
    try {
      await apiJson(`/pantry/items/${editItem.id}`, {
        method: "PATCH",
        body: JSON.stringify({
          quantity: qty,
          unit,
          ...(expiresAt ? { expiresAt } : {})
        })
      });
      setEditItem(null);
      await loadItems();
    } catch (e: unknown) {
      const msg = e && typeof e === "object" && "message" in e ? String((e as { message: string }).message) : "Update failed";
      Alert.alert("Pantry", msg);
    } finally {
      setSaving(false);
    }
  };

  const confirmDelete = (row: PantryItemRow) => {
    Alert.alert("Remove item", `Remove ${row.ingredient.name} from your pantry?`, [
      { text: "Cancel", style: "cancel" },
      {
        text: "Remove",
        style: "destructive",
        onPress: () => {
          void (async () => {
            try {
              await apiJson(`/pantry/items/${row.id}`, { method: "DELETE" });
              await loadItems();
            } catch (e: unknown) {
              const msg =
                e && typeof e === "object" && "message" in e ? String((e as { message: string }).message) : "Delete failed";
              Alert.alert("Pantry", msg);
            }
          })();
        }
      }
    ]);
  };

  const renderItem = ({ item }: { item: PantryItemRow }) => (
    <View style={styles.row}>
      <View style={styles.rowIcon}>
        <Package size={22} color={Colors.primary} strokeWidth={2} />
      </View>
      <View style={styles.rowBody}>
        <Text style={styles.rowTitle}>{item.ingredient.name}</Text>
        <Text style={styles.rowMeta}>
          {item.quantity} {item.unit} · {item.ingredient.category}
        </Text>
        <Text style={styles.rowExpiry}>Expires: {formatExpiry(item.expiresAt)}</Text>
      </View>
      <TouchableOpacity onPress={() => openEdit(item)} style={styles.rowBtn} hitSlop={12}>
        <Pencil size={18} color="#666" />
      </TouchableOpacity>
      <TouchableOpacity onPress={() => confirmDelete(item)} style={styles.rowBtn} hitSlop={12}>
        <Trash2 size={18} color="#C62828" />
      </TouchableOpacity>
    </View>
  );

  return (
    <SafeAreaView style={styles.container} edges={["top"]}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backWrap} hitSlop={16}>
          <ChevronLeft color={Colors.primary} size={32} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Pantry</Text>
        <TouchableOpacity onPress={openAdd} style={styles.addHeaderBtn} hitSlop={12}>
          <Plus color={Colors.primary} size={26} strokeWidth={2.5} />
        </TouchableOpacity>
      </View>

      {loading ? (
        <View style={styles.centered}>
          <ActivityIndicator size="large" color={Colors.primary} />
        </View>
      ) : (
        <FlatList
          data={items}
          keyExtractor={(it) => it.id}
          renderItem={renderItem}
          contentContainerStyle={styles.listContent}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={Colors.primary} />}
          ListEmptyComponent={
            <View style={styles.empty}>
              <Package size={48} color="#CCC" strokeWidth={1.5} />
              <Text style={styles.emptyTitle}>Nothing here yet</Text>
              <Text style={styles.emptySub}>Add ingredients you keep on hand. Use search to pick from the catalog.</Text>
              <TouchableOpacity style={styles.emptyCta} onPress={openAdd}>
                <Text style={styles.emptyCtaText}>Add first item</Text>
              </TouchableOpacity>
            </View>
          }
        />
      )}

      <Modal visible={addOpen} animationType="slide" transparent onRequestClose={closeAdd}>
        <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : undefined} style={styles.modalBackdrop}>
          <View style={styles.modalCard}>
            <Text style={styles.modalTitle}>Add to pantry</Text>
            <Text style={styles.modalHint}>Type at least 2 letters to search ingredients.</Text>
            <TextInput
              value={searchQ}
              onChangeText={setSearchQ}
              placeholder="Search (e.g. tomato, rice)"
              placeholderTextColor="#999"
              style={styles.input}
              autoCapitalize="none"
              autoCorrect={false}
            />
            {searching ? <ActivityIndicator color={Colors.primary} style={{ marginVertical: 8 }} /> : null}
            {!picked ? (
              <FlatList
                style={styles.searchList}
                data={searchHits}
                keyExtractor={(i) => i.id}
                keyboardShouldPersistTaps="handled"
                renderItem={({ item }) => (
                  <TouchableOpacity
                    style={styles.hitRow}
                    onPress={() => {
                      setPicked(item);
                      setUnitStr(item.defaultUnit);
                    }}
                  >
                    <Text style={styles.hitName}>{item.name}</Text>
                    <Text style={styles.hitMeta}>
                      {item.category} · default {item.defaultUnit}
                    </Text>
                  </TouchableOpacity>
                )}
              />
            ) : (
              <View style={styles.pickedBox}>
                <Text style={styles.pickedLabel}>Selected</Text>
                <Text style={styles.pickedName}>{picked.name}</Text>
                <TouchableOpacity onPress={() => setPicked(null)}>
                  <Text style={styles.changePick}>Change ingredient</Text>
                </TouchableOpacity>
                <Text style={styles.fieldLabel}>Quantity</Text>
                <TextInput
                  value={qtyStr}
                  onChangeText={setQtyStr}
                  keyboardType="decimal-pad"
                  style={styles.input}
                  placeholderTextColor="#999"
                />
                <Text style={styles.fieldLabel}>Unit</Text>
                <TextInput
                  value={unitStr}
                  onChangeText={setUnitStr}
                  style={styles.input}
                  placeholder={picked.defaultUnit}
                  placeholderTextColor="#999"
                />
                <Text style={styles.fieldLabel}>Expiry (optional, YYYY-MM-DD)</Text>
                <TextInput
                  value={expiryStr}
                  onChangeText={setExpiryStr}
                  style={styles.input}
                  placeholder="2026-12-31"
                  placeholderTextColor="#999"
                />
              </View>
            )}
            <View style={styles.modalActions}>
              <TouchableOpacity style={styles.btnGhost} onPress={closeAdd} disabled={saving}>
                <Text style={styles.btnGhostText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.btnPrimary, (!picked || saving) && styles.btnDisabled]}
                onPress={() => void submitAdd()}
                disabled={!picked || saving}
              >
                {saving ? <ActivityIndicator color="#FFF" /> : <Text style={styles.btnPrimaryText}>Save</Text>}
              </TouchableOpacity>
            </View>
          </View>
        </KeyboardAvoidingView>
      </Modal>

      <Modal visible={!!editItem} animationType="fade" transparent onRequestClose={() => setEditItem(null)}>
        <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : undefined} style={styles.modalBackdrop}>
          <View style={styles.modalCard}>
            <Text style={styles.modalTitle}>Edit item</Text>
            {editItem ? <Text style={styles.pickedName}>{editItem.ingredient.name}</Text> : null}
            <Text style={styles.fieldLabel}>Quantity</Text>
            <TextInput value={editQty} onChangeText={setEditQty} keyboardType="decimal-pad" style={styles.input} />
            <Text style={styles.fieldLabel}>Unit</Text>
            <TextInput value={editUnit} onChangeText={setEditUnit} style={styles.input} />
            <Text style={styles.fieldLabel}>Expiry (YYYY-MM-DD, optional)</Text>
            <TextInput value={editExpiry} onChangeText={setEditExpiry} style={styles.input} placeholderTextColor="#999" />
            <View style={styles.modalActions}>
              <TouchableOpacity style={styles.btnGhost} onPress={() => setEditItem(null)} disabled={saving}>
                <Text style={styles.btnGhostText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity style={[styles.btnPrimary, saving && styles.btnDisabled]} onPress={() => void submitEdit()} disabled={saving}>
                {saving ? <ActivityIndicator color="#FFF" /> : <Text style={styles.btnPrimaryText}>Update</Text>}
              </TouchableOpacity>
            </View>
          </View>
        </KeyboardAvoidingView>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#F8F8F8" },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 8,
    paddingVertical: 8,
    backgroundColor: "#FFF",
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: "#EEE"
  },
  backWrap: { width: 44, height: 44, justifyContent: "center", alignItems: "center" },
  headerTitle: { fontSize: 18, fontFamily: "Inter-Bold", color: Colors.primary },
  addHeaderBtn: { width: 44, height: 44, justifyContent: "center", alignItems: "center" },
  centered: { flex: 1, justifyContent: "center", alignItems: "center" },
  listContent: { padding: 16, paddingBottom: 40 },
  row: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFF",
    borderRadius: 20,
    padding: 14,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: "#EEE"
  },
  rowIcon: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: "#F4F9F4",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12
  },
  rowBody: { flex: 1 },
  rowTitle: { fontSize: 15, fontFamily: "Inter-Bold", color: Colors.primary },
  rowMeta: { fontSize: 12, color: "#666", fontFamily: "Inter-Regular", marginTop: 2 },
  rowExpiry: { fontSize: 11, color: "#999", marginTop: 4, fontFamily: "Inter-Medium" },
  rowBtn: { padding: 8, marginLeft: 4 },
  empty: { alignItems: "center", paddingTop: 48, paddingHorizontal: 24 },
  emptyTitle: { fontSize: 18, fontFamily: "Inter-Bold", color: Colors.primary, marginTop: 16 },
  emptySub: { fontSize: 13, color: "#888", textAlign: "center", marginTop: 8, lineHeight: 20 },
  emptyCta: {
    marginTop: 20,
    backgroundColor: Colors.primary,
    paddingHorizontal: 24,
    paddingVertical: 14,
    borderRadius: 24
  },
  emptyCtaText: { color: "#FFF", fontFamily: "Inter-Bold", fontSize: 15 },
  modalBackdrop: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.45)",
    justifyContent: "flex-end"
  },
  modalCard: {
    backgroundColor: "#FFF",
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 28,
    maxHeight: "88%"
  },
  modalTitle: { fontSize: 20, fontFamily: "Inter-Bold", color: Colors.primary },
  modalHint: { fontSize: 12, color: "#888", marginTop: 6, marginBottom: 12 },
  input: {
    borderWidth: 1,
    borderColor: "#E0E0E0",
    borderRadius: 14,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 16,
    color: "#1A1A1A",
    marginBottom: 12
  },
  searchList: { maxHeight: 220, marginBottom: 8 },
  hitRow: { paddingVertical: 12, borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: "#EEE" },
  hitName: { fontSize: 16, fontFamily: "Inter-SemiBold", color: "#1A1A1A" },
  hitMeta: { fontSize: 12, color: "#888", marginTop: 2 },
  pickedBox: { marginTop: 4 },
  pickedLabel: { fontSize: 10, color: "#999", fontFamily: "Inter-Bold", letterSpacing: 1 },
  pickedName: { fontSize: 17, fontFamily: "Inter-Bold", color: Colors.primary, marginVertical: 6 },
  changePick: { fontSize: 13, color: Colors.primary, fontFamily: "Inter-SemiBold", marginBottom: 8 },
  fieldLabel: { fontSize: 11, color: "#666", fontFamily: "Inter-Bold", marginBottom: 4 },
  modalActions: { flexDirection: "row", justifyContent: "flex-end", alignItems: "center", marginTop: 16 },
  btnGhost: { paddingVertical: 14, paddingHorizontal: 18 },
  btnGhostText: { fontSize: 16, fontFamily: "Inter-SemiBold", color: "#666" },
  btnPrimary: {
    backgroundColor: Colors.primary,
    paddingVertical: 14,
    paddingHorizontal: 22,
    borderRadius: 22,
    minWidth: 100,
    alignItems: "center",
    marginLeft: 8
  },
  btnPrimaryText: { color: "#FFF", fontFamily: "Inter-Bold", fontSize: 16 },
  btnDisabled: { opacity: 0.55 }
});
