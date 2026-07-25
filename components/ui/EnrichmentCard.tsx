import React from 'react';
import { View, Text, StyleSheet, Pressable, ScrollView } from 'react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { Ionicons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import type { EnrichmentData } from '../../hooks/useStore';

const ACCENT = '#8EC934';

interface EnrichmentCardProps {
  enrichment: EnrichmentData;
}

// ── Shared: Key Points ────────────────────────────────────────
function KeyPoints({ points }: { points: string[] }) {
  if (!points.length) return null;
  return (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>Key Takeaways</Text>
      {points.map((point, i) => (
        <Animated.View
          key={i}
          entering={FadeInDown.delay(i * 60).duration(300)}
          style={styles.pointRow}
        >
          <View style={styles.bullet} />
          <Text style={styles.pointText}>{point}</Text>
        </Animated.View>
      ))}
    </View>
  );
}

// ── Shared: Creator Button ────────────────────────────────────
function CreatorButton({ username, profileUrl }: { username: string; profileUrl?: string }) {
  if (!username) return null;
  return (
    <Pressable
      style={styles.creatorButton}
      onPress={() => {
        if (profileUrl) {
          // Open URL — handled by parent or Linking
        }
      }}
    >
      <Ionicons name="person-circle-outline" size={16} color={ACCENT} />
      <Text style={styles.creatorText}>@{username}</Text>
      {profileUrl && <Ionicons name="open-outline" size={14} color="#888" />}
    </Pressable>
  );
}

// ── Shared: Suggested Related ─────────────────────────────────
function SuggestedRelated({ items }: { items: string[] }) {
  if (!items.length) return null;
  return (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>Related Content</Text>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.relatedRow}>
        {items.map((item, i) => (
          <Pressable key={i} style={styles.relatedCard}>
            <Ionicons name="link" size={14} color="#888" />
            <Text style={styles.relatedText} numberOfLines={2}>
              {item.replace(/^https?:\/\//, '').slice(0, 60)}
            </Text>
          </Pressable>
        ))}
      </ScrollView>
    </View>
  );
}

// ── Video Card ────────────────────────────────────────────────
function VideoCard({ data }: { data: EnrichmentData }) {
  return (
    <View>
      <CreatorButton username={data.creator_username || ''} profileUrl={data.creator_profile_url} />
      <KeyPoints points={data.key_points} />
      <SuggestedRelated items={data.suggested_related} />
    </View>
  );
}

// ── Recipe Card ───────────────────────────────────────────────
function RecipeCard({ data }: { data: EnrichmentData }) {
  return (
    <View>
      {data.prep_time || data.cook_time ? (
        <View style={styles.timingRow}>
          {data.prep_time && (
            <View style={styles.timingBadge}>
              <Ionicons name="time-outline" size={14} color={ACCENT} />
              <Text style={styles.timingText}>Prep: {data.prep_time}</Text>
            </View>
          )}
          {data.cook_time && (
            <View style={styles.timingBadge}>
              <Ionicons name="flame-outline" size={14} color={ACCENT} />
              <Text style={styles.timingText}>Cook: {data.cook_time}</Text>
            </View>
          )}
        </View>
      ) : null}

      {data.ingredients && data.ingredients.length > 0 && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Ingredients</Text>
          {data.ingredients.map((ing, i) => (
            <View key={i} style={styles.ingredientRow}>
              {ing.image_url ? (
                <Image source={{ uri: ing.image_url }} style={styles.ingredientImg} contentFit="cover" />
              ) : (
                <View style={[styles.ingredientImg, styles.ingredientPlaceholder]}>
                  <Text style={{ fontSize: 14 }}>🥄</Text>
                </View>
              )}
              <View style={{ flex: 1 }}>
                <Text style={styles.ingredientName}>{ing.name}</Text>
                <Text style={styles.ingredientAmount}>{ing.amount}</Text>
              </View>
            </View>
          ))}
        </View>
      )}

      {data.steps && data.steps.length > 0 && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Steps</Text>
          {data.steps.map((step, i) => (
            <View key={i} style={styles.stepRow}>
              <View style={styles.stepNumber}>
                <Text style={styles.stepNumberText}>{i + 1}</Text>
              </View>
              <Text style={styles.stepText}>{step}</Text>
            </View>
          ))}
        </View>
      )}

      {data.pairs_well_with && data.pairs_well_with.length > 0 && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Pairs Well With</Text>
          <View style={styles.tagRow}>
            {data.pairs_well_with.map((item, i) => (
              <View key={i} style={styles.tag}>
                <Text style={styles.tagText}>{item}</Text>
              </View>
            ))}
          </View>
        </View>
      )}

      <KeyPoints points={data.key_points} />
      <SuggestedRelated items={data.suggested_related} />
    </View>
  );
}

// ── Motion Design Card ────────────────────────────────────────
function MotionDesignCard({ data }: { data: EnrichmentData }) {
  return (
    <View>
      <CreatorButton username={data.creator_username || ''} profileUrl={data.creator_profile_url} />

      {data.brands_or_subjects_featured && data.brands_or_subjects_featured.length > 0 && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Featured Brands</Text>
          <View style={styles.tagRow}>
            {data.brands_or_subjects_featured.map((brand, i) => (
              <View key={i} style={[styles.tag, styles.brandTag]}>
                <Text style={[styles.tagText, styles.brandTagText]}>{brand}</Text>
              </View>
            ))}
          </View>
        </View>
      )}

      <KeyPoints points={data.key_points} />
      <SuggestedRelated items={data.suggested_related} />
    </View>
  );
}

// ── Comparison Card ───────────────────────────────────────────
function ComparisonCard({ data }: { data: EnrichmentData }) {
  return (
    <View>
      {data.items_compared && data.items_compared.length > 0 && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Comparing</Text>
          <View style={styles.comparisonRow}>
            {data.items_compared.map((item, i) => (
              <React.Fragment key={i}>
                <View style={styles.comparisonItem}>
                  <Text style={styles.comparisonItemText}>{item}</Text>
                </View>
                {i < data.items_compared!.length - 1 && (
                  <Text style={styles.vsText}>VS</Text>
                )}
              </React.Fragment>
            ))}
          </View>
        </View>
      )}

      {data.verdict && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Verdict</Text>
          <Text style={styles.verdictText}>{data.verdict}</Text>
        </View>
      )}

      <KeyPoints points={data.key_points} />
      <SuggestedRelated items={data.suggested_related} />
    </View>
  );
}

// ── Generic Card ──────────────────────────────────────────────
function GenericCard({ data }: { data: EnrichmentData }) {
  return (
    <View>
      <KeyPoints points={data.key_points} />
      <SuggestedRelated items={data.suggested_related} />
    </View>
  );
}

// ── Main Router ───────────────────────────────────────────────
export function EnrichmentCard({ enrichment }: EnrichmentCardProps) {
  return (
    <Animated.View entering={FadeInDown.duration(400)} style={styles.container}>
      {/* Summary */}
      <Text style={styles.summary}>{enrichment.summary}</Text>

      {/* Type-specific content */}
      {enrichment.type === 'video' && <VideoCard data={enrichment} />}
      {enrichment.type === 'recipe' && <RecipeCard data={enrichment} />}
      {enrichment.type === 'motion_design' && <MotionDesignCard data={enrichment} />}
      {enrichment.type === 'comparison' && <ComparisonCard data={enrichment} />}
      {enrichment.type === 'generic' && <GenericCard data={enrichment} />}
    </Animated.View>
  );
}

// ── Shimmer Loading State ─────────────────────────────────────
export function EnrichmentShimmer() {
  return (
    <View style={styles.container}>
      <View style={styles.shimmerBar} />
      <View style={[styles.shimmerBar, { width: '80%' }]} />
      <View style={[styles.shimmerBar, { width: '60%' }]} />
      <View style={{ flexDirection: 'row', gap: 8, marginTop: 16 }}>
        <View style={styles.shimmerBadge} />
        <View style={styles.shimmerBadge} />
        <View style={styles.shimmerBadge} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 20,
  },
  summary: {
    fontSize: 15,
    fontFamily: 'Inter_400Regular',
    color: '#ccc',
    lineHeight: 22,
    marginBottom: 20,
  },
  // Section
  section: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 13,
    fontFamily: 'Inter_600SemiBold',
    color: '#888',
    letterSpacing: 0.5,
    textTransform: 'uppercase',
    marginBottom: 10,
  },
  // Key Points
  pointRow: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 8,
  },
  bullet: {
    width: 5,
    height: 5,
    borderRadius: 3,
    backgroundColor: ACCENT,
    marginTop: 7,
  },
  pointText: {
    flex: 1,
    fontSize: 14,
    fontFamily: 'Inter_400Regular',
    color: '#ddd',
    lineHeight: 20,
  },
  // Creator
  creatorButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingVertical: 8,
    paddingHorizontal: 12,
    backgroundColor: 'rgba(142,201,52,0.08)',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: 'rgba(142,201,52,0.2)',
    alignSelf: 'flex-start',
    marginBottom: 16,
  },
  creatorText: {
    fontSize: 13,
    fontFamily: 'Inter_500Medium',
    color: ACCENT,
  },
  // Related
  relatedRow: {
    gap: 10,
  },
  relatedCard: {
    width: 160,
    padding: 12,
    backgroundColor: '#181818',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#252525',
    gap: 6,
  },
  relatedText: {
    fontSize: 12,
    fontFamily: 'Inter_400Regular',
    color: '#999',
    lineHeight: 16,
  },
  // Recipe
  timingRow: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 16,
  },
  timingBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 8,
    backgroundColor: 'rgba(142,201,52,0.08)',
    borderRadius: 10,
  },
  timingText: {
    fontSize: 13,
    fontFamily: 'Inter_500Medium',
    color: '#ccc',
  },
  ingredientRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#1E1E1E',
  },
  ingredientImg: {
    width: 40,
    height: 40,
    borderRadius: 10,
    backgroundColor: '#222',
  },
  ingredientPlaceholder: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  ingredientName: {
    fontSize: 14,
    fontFamily: 'Inter_500Medium',
    color: '#ddd',
  },
  ingredientAmount: {
    fontSize: 12,
    fontFamily: 'Inter_400Regular',
    color: '#888',
  },
  stepRow: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 12,
  },
  stepNumber: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: ACCENT,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 2,
  },
  stepNumberText: {
    fontSize: 12,
    fontFamily: 'Inter_700Bold',
    color: '#0A0A0A',
  },
  stepText: {
    flex: 1,
    fontSize: 14,
    fontFamily: 'Inter_400Regular',
    color: '#ddd',
    lineHeight: 20,
  },
  // Tags
  tagRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  tag: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    backgroundColor: '#1A1A1A',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#2A2A2A',
  },
  tagText: {
    fontSize: 12,
    fontFamily: 'Inter_500Medium',
    color: '#ccc',
  },
  brandTag: {
    backgroundColor: 'rgba(142,201,52,0.1)',
    borderColor: 'rgba(142,201,52,0.3)',
  },
  brandTagText: {
    color: ACCENT,
  },
  // Comparison
  comparisonRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    flexWrap: 'wrap',
  },
  comparisonItem: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    backgroundColor: '#181818',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#252525',
  },
  comparisonItemText: {
    fontSize: 14,
    fontFamily: 'Inter_600SemiBold',
    color: '#fff',
  },
  vsText: {
    fontSize: 12,
    fontFamily: 'Inter_700Bold',
    color: '#555',
    letterSpacing: 1,
  },
  verdictText: {
    fontSize: 14,
    fontFamily: 'Inter_400Regular',
    color: '#ddd',
    lineHeight: 20,
    fontStyle: 'italic',
  },
  // Shimmer
  shimmerBar: {
    height: 14,
    borderRadius: 7,
    backgroundColor: '#1A1A1A',
    marginBottom: 10,
    width: '100%',
  },
  shimmerBadge: {
    width: 80,
    height: 28,
    borderRadius: 8,
    backgroundColor: '#1A1A1A',
  },
});
