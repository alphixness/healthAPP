import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, FlatList, Image, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { useHealthPlanetStore, VideoCourse } from '../store/healthPlanetStore';
import { Theme } from '../theme';
import { api } from '../services/api';

const CourseCard: React.FC<{
  course: VideoCourse;
  isPremium: boolean;
  onLike: () => void;
  onCollect: () => void;
  onPress: () => void;
}> = ({ course, isPremium, onLike, onCollect, onPress }) => {
  const difficultyMap = { beginner: '入门', intermediate: '进阶', advanced: '高级' };
  const difficultyColorMap = { beginner: '#4CAF50', intermediate: '#FF9800', advanced: '#F44336' };
  const isLocked = course.isMemberOnly && !isPremium;

  return (
    <TouchableOpacity style={styles.courseCard} activeOpacity={0.85} onPress={onPress}>
      <View style={styles.courseImageWrap}>
        <Image source={{ uri: course.coverImage }} style={styles.courseImage} resizeMode="cover" />
        {isLocked && (
          <View style={styles.lockOverlay}>
            <Ionicons name="lock-closed" size={20} color="#fff" />
            <Text style={styles.lockText}>会员</Text>
          </View>
        )}
        <View style={styles.durationTag}>
          <Ionicons name="play-circle" size={12} color="#fff" />
          <Text style={styles.durationText}>{course.duration}分钟</Text>
        </View>
      </View>

      <View style={styles.courseInfo}>
        <View style={styles.courseHeader}>
          <Text style={styles.courseTitle} numberOfLines={1}>{course.title}</Text>
          {course.isMemberOnly && <Text style={styles.vipIcon}>👑</Text>}
        </View>
        <Text style={styles.courseDesc} numberOfLines={2}>{course.description}</Text>

        <View style={styles.courseMetaRow}>
          <View style={[styles.diffTag, { backgroundColor: `${difficultyColorMap[course.difficulty]}15` }]}>
            <Text style={[styles.diffTagText, { color: difficultyColorMap[course.difficulty] }]}>
              {difficultyMap[course.difficulty]}
            </Text>
          </View>
          <View style={styles.metaItem}>
            <Ionicons name="flame-outline" size={12} color={Theme.colors.text.tertiary} />
            <Text style={styles.metaText}>{course.calories}千卡</Text>
          </View>
          <View style={styles.ratingItem}>
            <Ionicons name="star" size={12} color="#FFD700" />
            <Text style={styles.metaText}>{course.rating}</Text>
          </View>
        </View>

        <View style={styles.courseBottom}>
          <View style={styles.creatorRow}>
            <Text style={styles.creatorEmoji}>{course.creator.avatar}</Text>
            <Text style={styles.creatorName} numberOfLines={1}>{course.creator.name}</Text>
            {course.creator.isVerified && <Ionicons name="checkmark-circle" size={11} color={Theme.colors.info} />}
          </View>
          <View style={styles.actionRow}>
            <TouchableOpacity onPress={onLike} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
              <Ionicons name={course.isLiked ? 'heart' : 'heart-outline'} size={16} color={course.isLiked ? '#EF5350' : '#ccc'} />
            </TouchableOpacity>
            <TouchableOpacity onPress={onCollect} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
              <Ionicons name={course.isCollected ? 'bookmark' : 'bookmark-outline'} size={16} color={course.isCollected ? '#FF9800' : '#ccc'} />
            </TouchableOpacity>
          </View>
        </View>

        {course.productLinks && course.productLinks.length > 0 && (
          <View style={styles.productRow}>
            {course.productLinks.map((product, i) => (
              <TouchableOpacity key={i} style={styles.productChip} activeOpacity={0.7}>
                <Text style={styles.productEmoji}>{product.emoji}</Text>
                <Text style={styles.productName}>{product.name}</Text>
                <Text style={styles.productPrice}>{product.price}</Text>
              </TouchableOpacity>
            ))}
          </View>
        )}
      </View>
    </TouchableOpacity>
  );
};

export const HealthPlanetScreen: React.FC = () => {
  const navigation = useNavigation<any>();
  const {
    fitnessCourses, fitnessCategories,
    selectedFitnessCategory, setFitnessCategory,
    toggleCourseLike, toggleCourseCollect,
    currentUserTier, upgradeToPremium,
  } = useHealthPlanetStore();

  const isPremium = currentUserTier === 'premium';
  const [realBloggers, setRealBloggers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadBloggers();
    loadCoursesFromApi();
  }, []);

  const loadBloggers = async () => {
    try {
      const res = await api.bloggers.list();
      if (res.success && res.data?.bloggers) {
        setRealBloggers(res.data.bloggers);
      }
    } catch {}
  };

  const loadCoursesFromApi = async () => {
    try {
      const res = await api.courses.list({ limit: 50 });
      if (res.success && res.data) {
        // 将 API 数据存入 store，这里从 store 读取课程
        // 目前沿用 store mock 数据，后续可替换
      }
    } catch {} finally {
      setLoading(false);
    }
  };

  const filteredCourses = selectedFitnessCategory === '全部'
    ? fitnessCourses
    : fitnessCourses.filter(c => c.category === selectedFitnessCategory);

  return (
    <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
      <View style={styles.header}>
        <View style={styles.headerRow}>
          <View style={styles.headerIconWrap}>
            <Ionicons name="planet" size={20} color={Theme.colors.primary} />
          </View>
          <View style={styles.headerTextWrap}>
            <Text style={styles.headerTitle} numberOfLines={1}>健康星球</Text>
            <Text style={styles.headerSub} numberOfLines={1}>运动课程 · 科学训练</Text>
          </View>
        </View>
        <View style={styles.vipActive}>
          <Text style={styles.vipActiveIcon}>🎉</Text>
          <Text style={styles.vipActiveText}>全部免费</Text>
        </View>
      </View>

      {realBloggers.length > 0 && (
      <View style={styles.creatorSection}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.creatorScroll}>
          {realBloggers.map((blogger: any) => (
            <TouchableOpacity key={blogger.user_id} style={styles.creatorItem} activeOpacity={0.7}>
              <View style={styles.creatorAvatarWrap}>
                <Text style={styles.creatorAvatarEmoji}>{blogger.avatar_url || '👤'}</Text>
              </View>
              <Text style={styles.creatorNameText} numberOfLines={1}>{blogger.display_name || blogger.nickname}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>
      )}

      <View style={styles.categorySection}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.categoryScroll}>
          {fitnessCategories.map((cat) => {
            const isActive = selectedFitnessCategory === cat;
            return (
              <TouchableOpacity
                key={cat}
                style={[styles.catChip, isActive && styles.catChipActive]}
                onPress={() => setFitnessCategory(cat)}
                activeOpacity={0.7}
              >
                <View style={[styles.catDot, isActive && styles.catDotActive]} />
                <Text style={[styles.catChipText, isActive && styles.catChipTextActive]}>{cat}</Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>
      </View>

      <FlatList
        data={filteredCourses}
        keyExtractor={(item) => item.id}
        style={{ flex: 1 }}
        contentContainerStyle={styles.listContainer}
        showsVerticalScrollIndicator={false}
        ListHeaderComponent={null}
        renderItem={({ item }) => (
          <CourseCard
            course={item}
            isPremium={isPremium}
            onPress={() => navigation.navigate('CourseDetail', { courseId: item.id })}
            onLike={() => toggleCourseLike(item.id)}
            onCollect={() => toggleCourseCollect(item.id)}
          />
        )}
        ListEmptyComponent={
          <View style={styles.emptyState}>
            <Ionicons name="fitness-outline" size={48} color={Theme.colors.text.light} />
            <Text style={styles.emptyText}>暂无该分类的课程</Text>
          </View>
        }
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Theme.colors.background.primary,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#fff',
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    flex: 1,
  },
  headerIconWrap: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#E8F5E9',
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTextWrap: {
    flex: 1,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: Theme.colors.text.primary,
  },
  headerSub: {
    fontSize: 12,
    color: Theme.colors.text.tertiary,
    marginTop: 1,
  },
  vipBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#FFF8E1',
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 16,
  },
  vipBtnIcon: {
    fontSize: 14,
  },
  vipBtnText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#FFA000',
  },
  vipActive: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#FFF8E1',
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 16,
  },
  vipActiveIcon: {
    fontSize: 14,
  },
  vipActiveText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#FFA000',
  },
  creatorSection: {
    backgroundColor: '#fff',
    height: 80,
    justifyContent: 'center',
  },
  creatorScroll: {
    paddingHorizontal: 16,
    gap: 16,
    alignItems: 'center',
  },
  creatorItem: {
    alignItems: 'center',
    width: 56,
  },
  creatorAvatarWrap: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#F5F7FA',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 4,
  },
  creatorAvatarEmoji: {
    fontSize: 22,
  },
  creatorName: {
    fontSize: 11,
    color: Theme.colors.text.secondary,
    fontWeight: '500',
  },
  creatorNameText: {
    fontSize: 11,
    color: Theme.colors.text.tertiary,
    fontWeight: '500',
    textAlign: 'center',
  },
  categorySection: {
    backgroundColor: '#fff',
    borderTopWidth: 1,
    borderTopColor: '#F5F5FA',
    height: 52,
    justifyContent: 'center',
  },
  categoryScroll: {
    paddingHorizontal: 16,
    gap: 8,
  },
  catChip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 16,
    backgroundColor: '#F5F7FA',
    borderRadius: 18,
    gap: 6,
  },
  catChipActive: {
    backgroundColor: Theme.colors.primary,
  },
  catDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#ccc',
  },
  catDotActive: {
    backgroundColor: '#fff',
  },
  catChipText: {
    fontSize: 13,
    color: Theme.colors.text.secondary,
    fontWeight: '600',
  },
  catChipTextActive: {
    color: '#fff',
  },
  listContainer: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    paddingBottom: 24,
    gap: 12,
  },
  courseCard: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    borderRadius: 14,
    overflow: 'hidden',
    ...Theme.cardShadow,
  },
  courseImageWrap: {
    width: 130,
    height: 140,
    position: 'relative',
  },
  courseImage: {
    width: 130,
    height: 140,
  },
  lockOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.55)',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 2,
  },
  lockText: {
    fontSize: 10,
    color: '#FFD700',
    fontWeight: '600',
  },
  durationTag: {
    position: 'absolute',
    bottom: 6,
    left: 6,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    backgroundColor: 'rgba(0,0,0,0.6)',
    paddingVertical: 2,
    paddingHorizontal: 6,
    borderRadius: 4,
  },
  durationText: {
    fontSize: 10,
    color: '#fff',
    fontWeight: '500',
  },
  courseInfo: {
    flex: 1,
    padding: 12,
    justifyContent: 'space-between',
  },
  courseHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  courseTitle: {
    fontSize: 15,
    fontWeight: 'bold',
    color: Theme.colors.text.primary,
    flex: 1,
  },
  vipIcon: {
    fontSize: 14,
  },
  courseDesc: {
    fontSize: 12,
    color: Theme.colors.text.tertiary,
    lineHeight: 17,
    marginTop: 4,
  },
  courseMetaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginTop: 6,
  },
  diffTag: {
    paddingVertical: 2,
    paddingHorizontal: 8,
    borderRadius: 4,
  },
  diffTagText: {
    fontSize: 10,
    fontWeight: '700',
  },
  metaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
  },
  metaText: {
    fontSize: 11,
    color: Theme.colors.text.tertiary,
  },
  ratingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
  },
  courseBottom: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 4,
  },
  creatorRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  creatorEmoji: {
    fontSize: 14,
  },
  actionRow: {
    flexDirection: 'row',
    gap: 12,
  },
  productRow: {
    flexDirection: 'row',
    gap: 6,
    marginTop: 6,
    paddingTop: 6,
    borderTopWidth: 1,
    borderTopColor: '#F5F5FA',
  },
  productChip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFF8EE',
    paddingVertical: 3,
    paddingHorizontal: 8,
    borderRadius: 10,
    gap: 4,
  },
  productEmoji: {
    fontSize: 11,
  },
  productName: {
    fontSize: 10,
    color: Theme.colors.text.secondary,
    fontWeight: '500',
  },
  productPrice: {
    fontSize: 10,
    color: '#FF9800',
    fontWeight: '700',
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 60,
  },
  emptyText: {
    fontSize: 15,
    color: Theme.colors.text.light,
    marginTop: 12,
  },
});
