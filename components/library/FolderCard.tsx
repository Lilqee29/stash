import React from 'react';
import { View, Text } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Card } from '../ui/Card';

interface FolderItem {
  id: string;
  name: string;
  count: number;
  icon: string;
  color: string;
  bg: string;
  border: string;
}

interface FolderCardProps {
  folder: FolderItem;
  isSelected: boolean;
  layoutMode: 'grid' | 'list';
  CARD_SIZE: number;
  onPress: () => void;
}

export default function FolderCard({
  folder,
  isSelected,
  layoutMode,
  CARD_SIZE,
  onPress,
}: FolderCardProps) {
  const isGrid = layoutMode === 'grid';

  if (isGrid) {
    return (
      <Card
        interactive
        onPress={onPress}
        glowColor={folder.color}
        className={`mb-4 flex-col justify-between p-4`}
        style={{
          width: CARD_SIZE,
          height: CARD_SIZE * 0.95,
          borderColor: isSelected ? folder.color : 'rgba(255, 255, 255, 0.08)',
          borderWidth: isSelected ? 1.5 : 1,
          backgroundColor: isSelected ? 'rgba(142, 201, 52, 0.04)' : '#0F0F0F',
        }}
      >
        {/* Header */}
        <View className="flex-row justify-between items-center">
          <View 
            className="w-9 h-9 rounded-xl items-center justify-center border"
            style={{
              backgroundColor: folder.bg,
              borderColor: isSelected ? folder.color : folder.border,
            }}
          >
            <Ionicons name={folder.icon as any} size={18} color={folder.color} />
          </View>
          <View 
            className="w-2 h-2 rounded-full"
            style={{
              backgroundColor: isSelected ? folder.color : 'rgba(255, 255, 255, 0.15)',
            }}
          />
        </View>

        {/* Body */}
        <View className="mt-3 gap-0.5">
          <Text 
            className="text-white text-[15px] font-syne tracking-tight"
            style={{ fontFamily: 'Syne_700Bold' }}
            numberOfLines={1}
          >
            {folder.name}
          </Text>
          <Text 
            className="text-textCustom-secondary text-[11px] font-dmsans"
            style={{ fontFamily: 'DMSans_400Regular' }}
          >
            {folder.count} items
          </Text>
        </View>

        {/* Footer / Activity Meter */}
        <View className="mt-3 gap-1.5">
          <View className="h-[3px] bg-white/[0.04] rounded-full overflow-hidden">
            <View 
              className="h-full rounded-full"
              style={{
                backgroundColor: folder.color,
                width: `${Math.min((folder.count / 40) * 100, 100)}%`,
              }}
            />
          </View>
          <Text 
            className="text-[9px] text-textCustom-tertiary font-dmsans uppercase tracking-wider"
            style={{ fontFamily: 'DMSans_500Medium' }}
          >
            Activity
          </Text>
        </View>
      </Card>
    );
  }

  // LIST MODE
  return (
    <Card
      interactive
      onPress={onPress}
      className="mb-2 flex-row justify-between items-center p-3 border-transparent"
      style={{
        backgroundColor: isSelected ? 'rgba(142, 201, 52, 0.04)' : 'transparent',
        borderColor: isSelected ? 'rgba(142, 201, 52, 0.1)' : 'transparent',
        borderWidth: 1,
      }}
    >
      {/* Left Part: Folder Details */}
      <View className="flex-row items-center flex-1 mr-4">
        <View
          className="w-9 h-9 rounded-xl items-center justify-center border mr-3"
          style={{
            backgroundColor: folder.bg,
            borderColor: folder.border,
          }}
        >
          <Ionicons name={folder.icon as any} size={16} color={folder.color} />
        </View>
        <View className="flex-1">
          <Text 
            className="text-white text-[15px] font-syne tracking-tight"
            style={{ fontFamily: 'Syne_700Bold' }}
            numberOfLines={1}
          >
            {folder.name}
          </Text>
          <Text 
            className="text-textCustom-secondary text-xs font-dmsans mt-0.5"
            style={{ fontFamily: 'DMSans_400Regular' }}
          >
            {folder.count} saves
          </Text>
        </View>
      </View>

      {/* Right Part: Overlapping mini preview strips + Chevron/Check */}
      <View className="flex-row items-center gap-3">
        {/* Mini Thumbnail strip (40x40 overlapped) */}
        <View className="flex-row w-[68px] h-10 relative">
          <View
            className="w-10 h-10 rounded-lg border items-center justify-center absolute left-0 z-30"
            style={{
              backgroundColor: folder.color + '18',
              borderColor: folder.color + '3d',
            }}
          >
            <Ionicons name="play" size={10} color={folder.color} />
          </View>
          <View
            className="w-10 h-10 rounded-lg border absolute left-[14px] z-20 bg-[#1A1A1A] border-[#2E2E2E]"
          />
          <View
            className="w-10 h-10 rounded-lg border absolute left-[28px] z-10 bg-[#151515] border-[#222222]"
          />
        </View>

        <Ionicons
          name={isSelected ? 'checkmark-circle' : 'chevron-forward'}
          size={16}
          color={isSelected ? folder.color : '#555555'}
        />
      </View>
    </Card>
  );
}
