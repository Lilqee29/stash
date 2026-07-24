import React from 'react';
import { View, Text } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Card } from '../ui/Card';

interface SuggestionItem {
  id: string;
  title: string;
  folder: string;
  source: string;
  color: string;
  time: string;
  thumbnailType: string;
}

interface SuggestionCardProps {
  item: SuggestionItem;
  CARD_SIZE: number;
  onPress: () => void;
}

export default function SuggestionCard({ item, CARD_SIZE, onPress }: SuggestionCardProps) {
  return (
    <Card
      interactive
      onPress={onPress}
      glowColor={item.color}
      className="border border-borderCustom-subtle overflow-hidden"
      style={{
        width: CARD_SIZE,
        height: CARD_SIZE * 0.88,
      }}
    >
      {/* High-End Creative Discipline Thumbnail Mockups */}
      <View className="h-[84px] bg-[#161616] border-b border-white/[0.05] items-center justify-center overflow-hidden relative">
        {item.thumbnailType === 'video-timeline' && (
          <View className="w-full h-full bg-[#1A1310] items-center justify-center">
            {/* Dynamic timeline representer */}
            <View className="flex-row gap-0.5 absolute bottom-2 left-2 right-2">
              <View className="h-2 flex-1 bg-[#FF6B35]/30 rounded-[2px]" />
              <View className="h-2 flex-[1.5] bg-[#FF6B35] rounded-[2px]" />
              <View className="h-2 flex-[0.8] bg-[#FF6B35]/15 rounded-[2px]" />
            </View>
            <Ionicons name="videocam" size={20} color="#FF6B35" />
          </View>
        )}

        {item.thumbnailType === 'color-palette' && (
          <View className="w-full h-full bg-[#12161A] items-center justify-center">
            {/* Film grading sliders */}
            <View className="flex-row gap-1.5 items-center">
              <View className="w-4 h-4 rounded-full bg-[#E1306C]" />
              <View className="w-4 h-4 rounded-full bg-[#ff8c9e]" />
              <View className="w-4 h-4 rounded-full bg-[#5ac8fa]" />
            </View>
          </View>
        )}

        {item.thumbnailType === 'typography-layout' && (
          <View className="w-full h-full bg-[#181A12] p-2 items-center justify-center">
            {/* Editorial character structure */}
            <Text 
              className="text-[#ffcc00] opacity-80 text-xl font-syne"
              style={{ fontFamily: 'Syne_800ExtraBold' }}
            >
              Aa
            </Text>
          </View>
        )}

        {item.thumbnailType === 'sound-wave' && (
          <View className="w-full h-full bg-[#17121C] flex-row gap-[3px] items-center justify-center">
            {/* High fidelity audio tracks */}
            <View className="h-2.5 w-[3px] bg-[#bf97ff] rounded-full" />
            <View className="h-6.5 w-[3px] bg-[#bf97ff] rounded-full" />
            <View className="h-4 w-[3px] bg-[#bf97ff] rounded-full" />
            <View className="h-[30px] w-[3px] bg-[#bf97ff] rounded-full" />
            <View className="h-2 w-[3px] bg-[#bf97ff] rounded-full" />
          </View>
        )}

        {item.thumbnailType === 'wireframe-grid' && (
          <View className="w-full h-full bg-[#121915] items-center justify-center">
            {/* Dashed metrics grid */}
            <View 
              className="w-11 h-11 border border-[#8EC934]/30 rounded-lg items-center justify-center"
              style={{ borderStyle: 'dashed' }}
            >
              <Ionicons name="analytics-outline" size={14} color="#8EC934" />
            </View>
          </View>
        )}

        {/* Platform Badge Overlay */}
        <View className="absolute top-2 left-2 flex-row items-center bg-black/70 px-1.5 py-0.5 rounded-md">
          <Ionicons
            name={item.source === 'TikTok' ? 'logo-tiktok' : 'logo-instagram'}
            size={9}
            color={item.source === 'TikTok' ? '#FFFFFF' : '#E1306C'}
          />
          <Text 
            className="color-white text-[8px] font-dmsans ml-1"
            style={{ fontFamily: 'DMSans_500Medium' }}
          >
            {item.source}
          </Text>
        </View>
      </View>

      {/* Caption Text details */}
      <View className="p-3 flex-1 justify-between">
        <Text 
          numberOfLines={2} 
          className="text-white/90 text-xs font-dmsans leading-4"
          style={{ fontFamily: 'DMSans_500Medium' }}
        >
          {item.title}
        </Text>

        <View className="mt-1">
          <Text 
            className="text-[8px] font-dmsans uppercase tracking-wide"
            style={{ fontFamily: 'DMSans_700Bold', color: item.color }}
          >
            {item.folder}
          </Text>
          <Text 
            className="text-textCustom-secondary text-[8px] font-dmsans mt-0.5"
            style={{ fontFamily: 'DMSans_400Regular' }}
          >
            {item.time}
          </Text>
        </View>
      </View>
    </Card>
  );
}
