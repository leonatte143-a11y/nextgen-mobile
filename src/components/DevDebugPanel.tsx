import React, { useEffect, useState } from 'react';
import {
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { authStorageKeys } from '../context/AuthContext';
import { BASE_URL } from '../config/api';
import {
  clearApiHistory,
  getApiHistory,
  IS_DEV,
  subscribeApiHistory,
  type ApiTraceEntry,
} from '../lib/devLog';

function Row({ e }: { e: ApiTraceEntry }) {
  return (
    <View style={[styles.row, !e.ok && styles.rowErr]}>
      <Text style={styles.rowTitle}>
        {e.ok ? '✓' : '✗'} {e.method} {e.path}
      </Text>
      <Text style={styles.rowMeta}>
        {e.responseStatus} · {e.durationMs}ms · {e.requestId}
      </Text>
      {e.auth ? (
        <Text style={styles.rowMeta}>
          auth:{e.auth} token:{e.hasToken ? e.tokenPreview ?? 'yes' : 'no'}
        </Text>
      ) : null}
      {e.error ? <Text style={styles.err}>{e.error}</Text> : null}
    </View>
  );
}

export function DevDebugPanel() {
  const [open, setOpen] = useState(false);
  const [, tick] = useState(0);
  const [tokens, setTokens] = useState({ user: false, partner: false });

  useEffect(() => {
    if (!IS_DEV) return undefined;
    return subscribeApiHistory(() => {
      tick((n) => n + 1);
    });
  }, []);

  useEffect(() => {
    if (!open || !IS_DEV) return;
    (async () => {
      const [u, p] = await Promise.all([
        AsyncStorage.getItem(authStorageKeys.userToken),
        AsyncStorage.getItem(authStorageKeys.partnerToken),
      ]);
      setTokens({ user: Boolean(u?.trim()), partner: Boolean(p?.trim()) });
    })();
  }, [open]);

  if (!IS_DEV) return null;

  const history = getApiHistory();

  return (
    <>
      <Pressable style={styles.fab} onPress={() => setOpen(true)} accessibilityLabel="Open API debug panel">
        <Text style={styles.fabText}>DBG</Text>
      </Pressable>
      <Modal visible={open} animationType="slide" onRequestClose={() => setOpen(false)}>
        <View style={styles.modal}>
          <View style={styles.header}>
            <Text style={styles.h1}>API debug (dev)</Text>
            <Pressable onPress={() => setOpen(false)} hitSlop={12}>
              <Text style={styles.close}>Close</Text>
            </Pressable>
          </View>
          <Text style={styles.sub}>Base: {BASE_URL}</Text>
          <Text style={styles.sub}>
            Tokens — user: {tokens.user ? 'yes' : 'no'} · partner: {tokens.partner ? 'yes' : 'no'}
          </Text>
          <Pressable onPress={() => clearApiHistory()} style={styles.clearBtn}>
            <Text style={styles.clearTxt}>Clear history</Text>
          </Pressable>
          <ScrollView style={styles.list}>
            {history.length === 0 ? (
              <Text style={styles.empty}>No API calls yet. Use the app — logs also appear in Metro.</Text>
            ) : (
              history.map((e) => <Row key={e.id} e={e} />)
            )}
          </ScrollView>
        </View>
      </Modal>
    </>
  );
}

const styles = StyleSheet.create({
  fab: {
    position: 'absolute',
    bottom: 88,
    right: 12,
    zIndex: 9999,
    backgroundColor: '#2D2D2D',
    paddingHorizontal: 10,
    paddingVertical: 8,
    borderRadius: 8,
    opacity: 0.92,
  },
  fabText: { color: '#FF8C00', fontWeight: '800', fontSize: 11 },
  modal: { flex: 1, backgroundColor: '#fff', paddingTop: 48, paddingHorizontal: 12 },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 },
  h1: { fontSize: 18, fontWeight: '800' },
  close: { color: '#FF8C00', fontWeight: '700' },
  sub: { fontSize: 12, color: '#757575', marginBottom: 4 },
  clearBtn: { alignSelf: 'flex-start', marginVertical: 8 },
  clearTxt: { color: '#FF8C00', fontWeight: '600', fontSize: 13 },
  list: { flex: 1 },
  row: {
    borderWidth: 1,
    borderColor: '#eee',
    borderRadius: 8,
    padding: 10,
    marginBottom: 8,
    backgroundColor: '#FAFAFA',
  },
  rowErr: { borderColor: '#fcc', backgroundColor: '#FFF5F5' },
  rowTitle: { fontWeight: '700', fontSize: 13, color: '#2D2D2D' },
  rowMeta: { fontSize: 11, color: '#757575', marginTop: 2 },
  err: { fontSize: 12, color: '#c00', marginTop: 4 },
  empty: { color: '#757575', marginTop: 24, textAlign: 'center' },
});
