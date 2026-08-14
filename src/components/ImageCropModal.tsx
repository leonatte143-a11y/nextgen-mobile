import { Ionicons } from '@expo/vector-icons';
import * as ImageManipulator from 'expo-image-manipulator';
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, Image, Modal, Pressable, StyleSheet, Text, View } from 'react-native';
import { colors, radius, spacing } from '../constants/theme';

type Props = {
  visible: boolean;
  imageUri: string | null;
  onSave: (finalUri: string) => void;
  onCancel: () => void;
};

/**
 * Lightweight, reusable post-picker adjustment modal — rotate/flip the picked image and
 * confirm with an explicit "Save" button. Not tied to User vs Partner; just takes an
 * image URI and hands back a possibly-edited one.
 */
export function ImageCropModal({ visible, imageUri, onSave, onCancel }: Props) {
  const [currentUri, setCurrentUri] = useState<string | null>(imageUri);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (visible) setCurrentUri(imageUri);
  }, [visible, imageUri]);

  const applyManipulation = async (actions: ImageManipulator.Action[]) => {
    if (!currentUri || busy) return;
    setBusy(true);
    try {
      const result = await ImageManipulator.manipulateAsync(currentUri, actions, {
        compress: 1,
        format: ImageManipulator.SaveFormat.JPEG,
      });
      setCurrentUri(result.uri);
    } catch {
      // If manipulation fails, keep the current preview untouched.
    } finally {
      setBusy(false);
    }
  };

  const rotate = () => void applyManipulation([{ rotate: 90 }]);
  const flip = () => void applyManipulation([{ flip: ImageManipulator.FlipType.Horizontal }]);

  // Resize + compress on final save so large camera photos (5-15MB) come out well under 1MB
  // before being base64-encoded and sent to the server.
  const save = async () => {
    if (!currentUri || busy) return;
    setBusy(true);
    try {
      const result = await ImageManipulator.manipulateAsync(currentUri, [{ resize: { width: 1024 } }], {
        compress: 0.6,
        format: ImageManipulator.SaveFormat.JPEG,
      });
      onSave(result.uri);
    } catch {
      onSave(currentUri);
    } finally {
      setBusy(false);
    }
  };

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onCancel}>
      <View style={styles.backdrop}>
        <View style={styles.sheet}>
          <View style={styles.header}>
            <Text style={styles.title}>Adjust photo</Text>
            <Pressable onPress={onCancel} hitSlop={12}>
              <Ionicons name="close" size={24} color={colors.charcoal} />
            </Pressable>
          </View>

          <View style={styles.previewWrap}>
            {currentUri ? (
              <Image source={{ uri: currentUri }} style={styles.preview} resizeMode="contain" />
            ) : null}
            {busy ? (
              <View style={styles.busyOverlay}>
                <ActivityIndicator color={colors.white} />
              </View>
            ) : null}
          </View>

          <View style={styles.controlRow}>
            <Pressable style={styles.secondaryBtn} onPress={rotate} disabled={busy}>
              <Ionicons name="reload-outline" size={18} color={colors.charcoal} />
              <Text style={styles.secondaryTxt}>Rotate</Text>
            </Pressable>
            <Pressable style={styles.secondaryBtn} onPress={flip} disabled={busy}>
              <Ionicons name="swap-horizontal-outline" size={18} color={colors.charcoal} />
              <Text style={styles.secondaryTxt}>Flip</Text>
            </Pressable>
            <Pressable style={styles.saveBtn} onPress={() => void save()} disabled={busy || !currentUri}>
              <Ionicons name="checkmark" size={18} color={colors.white} />
              <Text style={styles.saveTxt}>Save</Text>
            </Pressable>
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: colors.overlay,
    justifyContent: 'center',
    padding: spacing.lg,
  },
  sheet: {
    backgroundColor: colors.white,
    borderRadius: radius.lg,
    padding: spacing.lg,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: spacing.md,
  },
  title: { fontSize: 17, fontWeight: '800', color: colors.charcoal },
  previewWrap: {
    width: '100%',
    height: 320,
    borderRadius: radius.md,
    backgroundColor: colors.greyLight,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  preview: { width: '100%', height: '100%' },
  busyOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: colors.overlay,
    alignItems: 'center',
    justifyContent: 'center',
  },
  controlRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    marginTop: spacing.lg,
  },
  secondaryBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.white,
  },
  secondaryTxt: { fontWeight: '700', color: colors.charcoal, fontSize: 13 },
  saveBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    borderRadius: radius.md,
    backgroundColor: colors.primary,
    marginLeft: 'auto',
  },
  saveTxt: { fontWeight: '800', color: colors.white, fontSize: 13 },
});
