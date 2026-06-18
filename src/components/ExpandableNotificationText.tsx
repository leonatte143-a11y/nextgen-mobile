import React, { useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { colors } from '../constants/theme';

const LINE_HEIGHT = 20;
const MAX_LINES = 3;
const MAX_HEIGHT = LINE_HEIGHT * MAX_LINES;

type Props = {
  text: string;
  style?: object;
};

export function ExpandableNotificationText({ text, style }: Props) {
  const [expanded, setExpanded] = useState(false);
  const [needsMore, setNeedsMore] = useState(false);

  return (
    <View>
      <Text
        style={[styles.body, style]}
        numberOfLines={expanded ? undefined : MAX_LINES}
        onTextLayout={(e) => {
          if (!expanded && e.nativeEvent.lines.length > MAX_LINES) {
            setNeedsMore(true);
          }
        }}
      >
        {text}
      </Text>
      {(needsMore || text.length > 120) && !expanded ? (
        <Pressable onPress={() => setExpanded(true)} hitSlop={8}>
          <Text style={styles.more}>See More</Text>
        </Pressable>
      ) : null}
      {expanded ? (
        <Pressable onPress={() => setExpanded(false)} hitSlop={8}>
          <Text style={styles.more}>See Less</Text>
        </Pressable>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  body: { color: colors.grey, marginTop: 4, lineHeight: LINE_HEIGHT },
  more: { color: colors.primary, fontWeight: '800', marginTop: 4, fontSize: 13 },
});
