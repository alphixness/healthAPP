import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Image } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { VideoView, useVideoPlayer } from 'expo-video';
import { useNavigation, useRoute } from '@react-navigation/native';
import { useHealthPlanetStore } from '../store/healthPlanetStore';
import { Theme } from '../theme';

export const CourseDetailScreen: React.FC = () => {
  const navigation = useNavigation();
  const route = useRoute<any>();
  const { courseId } = route.params;
  const [showControls, setShowControls] = useState(true);

  const course = useHealthPlanetStore((s) =>
    s.fitnessCourses.find((c) => c.id === courseId),
  );
  const toggleCourseLike = useHealthPlanetStore((s) => s.toggleCourseLike);
  const toggleCourseCollect = useHealthPlanetStore((s) => s.toggleCourseCollect);

  const player = useVideoPlayer(course?.videoUrl || '', (player) => {
    player.loop = true;
    player.play();
  });

  const isPlaying = player.playing;

  if (!course) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
            <Ionicons name="arrow-back" size={24} color={Theme.colors.text.primary} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>课程未找到</Text>
          <View style={{ width: 40 }} />
        </View>
      </SafeAreaView>
    );
  }

  const difficultyMap = { beginner: '入门', intermediate: '进阶', advanced: '高级' };
  const difficultyColorMap = { beginner: '#4CAF50', intermediate: '#FF9800', advanced: '#F44336' };

  return (
    <View style={styles.container}>
      {/* 视频播放器 */}
      <View style={styles.videoContainer}>
        {course.videoUrl ? (
          <TouchableOpacity
            activeOpacity={1}
            style={styles.videoTouchArea}
            onPress={() => setShowControls(!showControls)}
          >
            <VideoView
              player={player}
              style={styles.video}
              contentFit="contain"
              nativeControls={false}
            />
            {showControls && (
              <View style={styles.videoOverlay}>
                <TouchableOpacity
                  style={styles.videoControlBtn}
                  onPress={() =>
                    isPlaying
                      ? player.pause()
                      : player.play()
                  }
                >
                  <Ionicons
                    name={isPlaying ? 'pause' : 'play'}
                    size={48}
                    color="#fff"
                  />
                </TouchableOpacity>
              </View>
            )}
            {/* 顶部返回 */}
            <TouchableOpacity
              style={styles.videoBackBtn}
              onPress={() => navigation.goBack()}
            >
              <Ionicons name="chevron-down" size={28} color="#fff" />
            </TouchableOpacity>
          </TouchableOpacity>
        ) : (
          <View style={styles.placeholderVideo}>
            <Image
              source={{ uri: course.coverImage }}
              style={styles.placeholderImage}
              resizeMode="cover"
            />
            <View style={styles.placeholderOverlay}>
              <View style={styles.comingSoonBadge}>
                <Ionicons name="videocam" size={24} color="#fff" />
                <Text style={styles.comingSoonText}>视频即将上线</Text>
              </View>
            </View>
            <TouchableOpacity
              style={styles.videoBackBtn}
              onPress={() => navigation.goBack()}
            >
              <Ionicons name="chevron-down" size={28} color="#fff" />
            </TouchableOpacity>
            <View style={styles.durationTag}>
              <Ionicons name="time-outline" size={14} color="#fff" />
              <Text style={styles.durationTagText}>{course.duration}分钟</Text>
            </View>
          </View>
        )}
      </View>

      {/* 课程信息 */}
      <ScrollView style={styles.infoContainer} showsVerticalScrollIndicator={false}>
        <View style={styles.titleRow}>
          <Text style={styles.courseTitle}>{course.title}</Text>
          <Text style={styles.courseEmoji}>{course.coverEmoji}</Text>
        </View>

        {/* 标签行 */}
        <View style={styles.tagRow}>
          <View style={[styles.diffTag, { backgroundColor: `${difficultyColorMap[course.difficulty]}15` }]}>
            <Text style={[styles.diffTagText, { color: difficultyColorMap[course.difficulty] }]}>
              {difficultyMap[course.difficulty]}
            </Text>
          </View>
          {course.tags.slice(0, 3).map((tag) => (
            <View key={tag} style={styles.tagChip}>
              <Text style={styles.tagText}>{tag}</Text>
            </View>
          ))}
        </View>

        {/* 数据统计 */}
        <View style={styles.statsRow}>
          <View style={styles.statItem}>
            <Ionicons name="flame" size={18} color={Theme.colors.accent} />
            <Text style={styles.statValue}>{course.calories}</Text>
            <Text style={styles.statLabel}>千卡</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statItem}>
            <Ionicons name="time" size={18} color={Theme.colors.info} />
            <Text style={styles.statValue}>{course.duration}</Text>
            <Text style={styles.statLabel}>分钟</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statItem}>
            <Ionicons name="star" size={18} color="#FFD700" />
            <Text style={styles.statValue}>{course.rating}</Text>
            <Text style={styles.statLabel}>评分</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statItem}>
            <Ionicons name="eye" size={18} color={Theme.colors.text.tertiary} />
            <Text style={styles.statValue}>
              {course.stats.views > 10000
                ? `${(course.stats.views / 10000).toFixed(1)}万`
                : course.stats.views}
            </Text>
            <Text style={styles.statLabel}>观看</Text>
          </View>
        </View>

        {/* 创作者 */}
        <View style={styles.creatorCard}>
          <Text style={styles.creatorEmoji}>{course.creator.avatar}</Text>
          <View style={styles.creatorInfo}>
            <View style={styles.creatorNameRow}>
              <Text style={styles.creatorName}>{course.creator.name}</Text>
              {course.creator.isVerified && (
                <Ionicons name="checkmark-circle" size={14} color={Theme.colors.info} />
              )}
            </View>
            <Text style={styles.creatorBio}>{course.creator.bio}</Text>
          </View>
          <View style={styles.creatorStats}>
            <Text style={styles.creatorFollowers}>
              {course.creator.followers > 10000
                ? `${(course.creator.followers / 10000).toFixed(1)}万`
                : course.creator.followers}
            </Text>
            <Text style={styles.creatorFollowersLabel}>粉丝</Text>
          </View>
        </View>

        {/* 课程描述 */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>课程介绍</Text>
          <Text style={styles.descriptionText}>{course.description}</Text>
        </View>

        {/* 操作按钮 */}
        <View style={styles.actionRow}>
          <TouchableOpacity
            style={[styles.actionBtn, course.isLiked && styles.actionBtnActive]}
            onPress={() => toggleCourseLike(course.id)}
          >
            <Ionicons
              name={course.isLiked ? 'heart' : 'heart-outline'}
              size={20}
              color={course.isLiked ? '#EF5350' : Theme.colors.text.secondary}
            />
            <Text style={[styles.actionBtnText, course.isLiked && styles.actionBtnTextActive]}>
              {course.isLiked ? '已赞' : '点赞'}
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.actionBtn, course.isCollected && styles.actionBtnActive]}
            onPress={() => toggleCourseCollect(course.id)}
          >
            <Ionicons
              name={course.isCollected ? 'bookmark' : 'bookmark-outline'}
              size={20}
              color={course.isCollected ? '#FF9800' : Theme.colors.text.secondary}
            />
            <Text style={[styles.actionBtnText, course.isCollected && styles.actionBtnTextActive]}>
              {course.isCollected ? '已收藏' : '收藏'}
            </Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.shareBtn}>
            <Ionicons name="share-outline" size={20} color={Theme.colors.text.secondary} />
            <Text style={styles.actionBtnText}>分享</Text>
          </TouchableOpacity>
        </View>

        <View style={{ height: 40 }} />
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Theme.colors.background.primary,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#fff',
  },
  backBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 17,
    fontWeight: '600',
    color: Theme.colors.text.primary,
  },

  // 视频播放器
  videoContainer: {
    width: '100%',
    aspectRatio: 16 / 9,
    backgroundColor: '#000',
  },
  videoTouchArea: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  video: {
    width: '100%',
    height: '100%',
  },
  videoOverlay: {
    ...StyleSheet.absoluteFill,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.3)',
  },
  videoControlBtn: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: 'rgba(255,255,255,0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  videoBackBtn: {
    position: 'absolute',
    top: 12,
    left: 12,
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(0,0,0,0.4)',
    justifyContent: 'center',
    alignItems: 'center',
  },

  // 占位视频（无videoUrl时）
  placeholderVideo: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  placeholderImage: {
    width: '100%',
    height: '100%',
  },
  placeholderOverlay: {
    ...StyleSheet.absoluteFill,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  comingSoonBadge: {
    alignItems: 'center',
    gap: 12,
  },
  comingSoonText: {
    fontSize: 18,
    color: '#fff',
    fontWeight: '600',
  },
  durationTag: {
    position: 'absolute',
    bottom: 16,
    right: 16,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: 'rgba(0,0,0,0.6)',
    paddingVertical: 4,
    paddingHorizontal: 10,
    borderRadius: 6,
  },
  durationTagText: {
    fontSize: 13,
    color: '#fff',
    fontWeight: '500',
  },

  // 信息区
  infoContainer: {
    flex: 1,
    paddingHorizontal: 16,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 16,
    marginBottom: 12,
  },
  courseTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: Theme.colors.text.primary,
    flex: 1,
  },
  courseEmoji: {
    fontSize: 28,
    marginLeft: 12,
  },
  tagRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 16,
  },
  diffTag: {
    paddingVertical: 4,
    paddingHorizontal: 10,
    borderRadius: 6,
  },
  diffTagText: {
    fontSize: 12,
    fontWeight: '700',
  },
  tagChip: {
    backgroundColor: '#F0F0F5',
    paddingVertical: 4,
    paddingHorizontal: 10,
    borderRadius: 6,
  },
  tagText: {
    fontSize: 12,
    color: Theme.colors.text.secondary,
    fontWeight: '500',
  },

  // 统计
  statsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 14,
    paddingVertical: 16,
    marginBottom: 12,
  },
  statItem: {
    flex: 1,
    alignItems: 'center',
    gap: 4,
  },
  statValue: {
    fontSize: 17,
    fontWeight: '800',
    color: Theme.colors.text.primary,
  },
  statLabel: {
    fontSize: 10,
    color: Theme.colors.text.tertiary,
    fontWeight: '500',
  },
  statDivider: {
    width: 1,
    height: 28,
    backgroundColor: '#F0F0F5',
  },

  // 创作者
  creatorCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 14,
    padding: 14,
    marginBottom: 12,
    gap: 12,
  },
  creatorEmoji: {
    fontSize: 36,
  },
  creatorInfo: {
    flex: 1,
  },
  creatorNameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  creatorName: {
    fontSize: 15,
    fontWeight: '700',
    color: Theme.colors.text.primary,
  },
  creatorBio: {
    fontSize: 12,
    color: Theme.colors.text.tertiary,
    marginTop: 2,
  },
  creatorStats: {
    alignItems: 'center',
  },
  creatorFollowers: {
    fontSize: 16,
    fontWeight: '800',
    color: Theme.colors.primary,
  },
  creatorFollowersLabel: {
    fontSize: 10,
    color: Theme.colors.text.tertiary,
    fontWeight: '500',
  },

  // 描述
  section: {
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: Theme.colors.text.primary,
    marginBottom: 8,
  },
  descriptionText: {
    fontSize: 14,
    color: Theme.colors.text.secondary,
    lineHeight: 22,
  },

  // 操作
  actionRow: {
    flexDirection: 'row',
    gap: 10,
  },
  actionBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    backgroundColor: '#fff',
    borderRadius: 12,
    paddingVertical: 12,
    borderWidth: 1,
    borderColor: '#F0F0F5',
  },
  actionBtnActive: {
    borderColor: '#FFE0E0',
    backgroundColor: '#FFF5F5',
  },
  actionBtnText: {
    fontSize: 13,
    fontWeight: '600',
    color: Theme.colors.text.secondary,
  },
  actionBtnTextActive: {
    color: '#EF5350',
  },
  shareBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    backgroundColor: '#fff',
    borderRadius: 12,
    paddingVertical: 12,
    borderWidth: 1,
    borderColor: '#F0F0F5',
  },
});
