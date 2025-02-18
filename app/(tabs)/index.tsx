import React from 'react';
import { Linking } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { router } from 'expo-router';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  Dimensions,
  SafeAreaView,
  Platform,
  StatusBar
} from 'react-native';
import { BlurView } from 'expo-blur';
import { Ionicons } from '@expo/vector-icons';
import Animated, {
  FadeInDown,
  FadeInRight,
  interpolate,
  useAnimatedStyle,
  useAnimatedScrollHandler,
  useSharedValue,
  withSpring,
  withTiming,
} from 'react-native-reanimated';
import { useUser } from '@clerk/clerk-expo';

const { width } = Dimensions.get('window');
const HEADER_HEIGHT = Platform.OS === 'ios' ? 120 : 100;
const HEADER_MAX_HEIGHT = 200;
const HEADER_MIN_HEIGHT = Platform.OS === 'ios' ? 90 : 70;
const HEADER_SCROLL_DISTANCE = HEADER_MAX_HEIGHT - HEADER_MIN_HEIGHT;

const AnimatedBlurView = Animated.createAnimatedComponent(BlurView);

// Daily stats data
const dailyStats = {
  steps: 8432,
  calories: 420,
  minutes: 48,
  distance: 5.2,
};

// AI-powered workout suggestions
const workoutSuggestions = [
  {
    id: 1,
    title: 'High-Intensity Cardio',
    duration: '35 min',
    calories: 320,
    level: 'Advanced',
    image: 'https://images.unsplash.com/photo-1601422407692-ec4eeec1d9b3?w=800',
    url:'/(pages)/hiit' 
  },
  {
    id: 2,
    title: 'Full Body Strength',
    duration: '45 min',
    calories: 280,
    level: 'Intermediate',
    image: 'https://images.unsplash.com/photo-1581009146145-b5ef050c2e1e?w=800',
    url:'/(pages)/strength'
  },
];

// Mindfulness sessions
const mindfulnessSessions = [
  {
    id: 1,
    title: 'Morning Meditation',
    duration: '10 min',
    category: 'Meditation',
    image: 'https://images.unsplash.com/photo-1506126613408-eca07ce68773?w=800',
    url:'/(pages)/meditation'
  },
  {
    id: 2,
    title: 'Stress Relief Yoga',
    duration: '20 min',
    category: 'Yoga',
    image: 'https://images.unsplash.com/photo-1599901860904-17e6ed7083a0?w=800',
    url:'/(pages)/yoga'
  },
];

// Community challenges
const activeChallenges = [
  {
    id: 1,
    title: '10K Steps Daily',
    participants: 1234,
    progress: 0.7,
    daysLeft: 5,
    image: 'https://images.unsplash.com/photo-1552674605-db6ffd4facb5?w=800',
  },
  {
    id: 2,
    title: 'Meditation Streak',
    participants: 856,
    progress: 0.4,
    daysLeft: 12,
    image: 'https://images.unsplash.com/photo-1506126613408-eca07ce68773?w=800',
  },
];

export default function Home() {
  const scrollY = useSharedValue(0);
  const {user} = useUser();

  const scrollHandler = useAnimatedScrollHandler({
    onScroll: (event) => {
      scrollY.value = event.contentOffset.y;
    },
  });

  const headerStyle = useAnimatedStyle(() => {
    const height = interpolate(scrollY.value, [0, HEADER_SCROLL_DISTANCE], [HEADER_MAX_HEIGHT, HEADER_MIN_HEIGHT], 'clamp');
    const opacity = interpolate(scrollY.value, [0, HEADER_SCROLL_DISTANCE], [1, 0.9], 'clamp');

    return {
      height: withSpring(height, { damping: 20, stiffness: 90 }),
      opacity: withTiming(opacity, { duration: 150 }),
      position: 'absolute',
      top: 0,
      left: 0,
      right: 0,
      zIndex: 1,
    };
  });

  return (
    <SafeAreaView style={styles.SafeArea}>
      <View style={styles.container}>
      <Animated.View style={[styles.header, headerStyle]}>
        <AnimatedBlurView
          tint="dark"
          intensity={30}
          style={StyleSheet.absoluteFill}
        />
        <View style={styles.headerContent}>
          <View style={styles.headerTop}>
            <View>
              <Text style={styles.greeting}>Hello {user?.firstName} 💪</Text>
              <Text style={styles.title}>Ready for your workout?</Text>
            </View>
            <TouchableOpacity style={styles.notificationButton}>
              <Ionicons name="notifications-outline" size={24} color="#fff" />
            </TouchableOpacity>
          </View>
        </View>
      </Animated.View>

      <Animated.ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollViewContent}
        showsVerticalScrollIndicator={false}
        onScroll={scrollHandler}
        scrollEventThrottle={16}
      >
        {/* Daily Progress Stats */}
        <View style={styles.statsContainer}>
          <View style={styles.statCard}>
            <Ionicons name="footsteps" size={24} color="#4ADE80" />
            <Text style={styles.statValue}>{dailyStats.steps}</Text>
            <Text style={styles.statLabel}>Steps</Text>
          </View>
          <View style={styles.statCard}>
            <Ionicons name="flame" size={24} color="#4ADE80" />
            <Text style={styles.statValue}>{dailyStats.calories}</Text>
            <Text style={styles.statLabel}>Calories</Text>
          </View>
          <View style={styles.statCard}>
            <Ionicons name="time" size={24} color="#4ADE80" />
            <Text style={styles.statValue}>{dailyStats.minutes}m</Text>
            <Text style={styles.statLabel}>Active</Text>
          </View>
          <View style={styles.statCard}>
            <Ionicons name="map" size={24} color="#4ADE80" />
            <Text style={styles.statValue}>{dailyStats.distance}km</Text>
            <Text style={styles.statLabel}>Distance</Text>
          </View>
        </View>

        {/* AI Workout Suggestions */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>AI-Powered Workouts 🤖</Text>
            <TouchableOpacity>
              <Text style={styles.seeAll}>See all</Text>
            </TouchableOpacity>
          </View>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            {workoutSuggestions.map((workout, index) => (
              <Animated.View
                key={workout.id}
                entering={FadeInRight.delay(index * 100)}
              >
                <TouchableOpacity style={styles.workoutCard} onPress={() => router.push(workout.url)}>
                  <Image
                    source={{ uri: workout.image }}
                    style={styles.workoutImage}
                  />
                  <View style={styles.workoutOverlay}>
                    <View style={styles.workoutBadge}>
                      <Text style={styles.workoutLevel}>{workout.level}</Text>
                    </View>
                    <View style={styles.workoutInfo}>
                      <Text style={styles.workoutTitle}>{workout.title}</Text>
                      <View style={styles.workoutMeta}>
                        <Text style={styles.workoutDetail}>
                          {workout.duration}
                        </Text>
                        <Text style={styles.workoutDetail}>•</Text>
                        <Text style={styles.workoutDetail}>
                          {workout.calories} cal
                        </Text>
                      </View>
                    </View>
                  </View>
                </TouchableOpacity>
              </Animated.View>
            ))}
          </ScrollView>
        </View>

        {/* Mindfulness Section */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Mindfulness & Wellness 🧘‍♀️</Text>
            <TouchableOpacity>
              <Text style={styles.seeAll}>See all</Text>
            </TouchableOpacity>
          </View>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            {mindfulnessSessions.map((session, index) => (
              <Animated.View
                key={session.id}
                entering={FadeInRight.delay(index * 100)}
              >
                <TouchableOpacity style={styles.mindfulnessCard} onPress={() => router.push(session.url)}>
                  <Image
                    source={{ uri: session.image }}
                    style={styles.mindfulnessImage}
                  />
                  <View style={styles.mindfulnessOverlay}>
                    <View style={styles.mindfulnessBadge}>
                      <Text style={styles.mindfulnessCategory}>
                        {session.category}
                      </Text>
                    </View>
                    <View style={styles.mindfulnessInfo}>
                      <Text style={styles.mindfulnessTitle}>
                        {session.title}
                      </Text>
                      <Text style={styles.mindfulnessDuration}>
                        {session.duration}
                      </Text>
                    </View>
                  </View>
                </TouchableOpacity>
              </Animated.View>
            ))}
          </ScrollView>
        </View>

        {/* Active Challenges */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Active Challenges 🏆</Text>
            <TouchableOpacity>
              <Text style={styles.seeAll} onPress={() => router.push('/(pages)/active-challenges')}>See all</Text>
            </TouchableOpacity>
          </View>
          {activeChallenges.map((challenge, index) => (
            <Animated.View
              key={challenge.id}
              entering={FadeInDown.delay(index * 100)}
            >
              <TouchableOpacity style={styles.challengeCard}>
                <Image
                  source={{ uri: challenge.image }}
                  style={styles.challengeImage}
                />
                <View style={styles.challengeInfo}>
                  <Text style={styles.challengeTitle}>{challenge.title}</Text>
                  <View style={styles.challengeMeta}>
                    <Text style={styles.challengeParticipants}>
                      {challenge.participants.toLocaleString()} participants
                    </Text>
                    <Text style={styles.challengeDays}>
                      {challenge.daysLeft} days left
                    </Text>
                  </View>
                  <View style={styles.progressBar}>
                    <View
                      style={[
                        styles.progressFill,
                        { width: `${challenge.progress * 100}%` },
                      ]}
                    />
                  </View>
                </View>
              </TouchableOpacity>
            </Animated.View>
          ))}
        </View>
      </Animated.ScrollView>
    </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  SafeArea: {
    flex: 1,
    backgroundColor: '#121212',
    paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight : 0,
  },
  container: {
    flex: 1,
    backgroundColor: '#121212',
  },
  header: {
    height: HEADER_MAX_HEIGHT,
    justifyContent: 'flex-end',
    paddingHorizontal: 24,
    paddingBottom: 24,
    backgroundColor: '#121212',
  },
  scrollView: {
    flex: 1,
  },
  scrollViewContent: {
    paddingTop: HEADER_MAX_HEIGHT, // Add padding to prevent content from being hidden under header
    paddingBottom: 100,
  },
  headerContent: {
    gap: 20,
  },
  headerTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  greeting: {
    fontSize: 16,
    color: '#fff',
    fontFamily: 'Inter-Regular',
    opacity: 0.7,
  },
  title: {
    fontSize: 24,
    color: '#fff',
    fontFamily: 'Inter-Bold',
    marginTop: 4,
  },
  notificationButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.1)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  content: {
    flex: 1,
  },
  statsContainer: {
    flexDirection: 'row',
    padding: 24,
    gap: 12,
  },
  statCard: {
    flex: 1,
    backgroundColor: '#1E1E1E',
    borderRadius: 16,
    padding: 12,
    alignItems: 'center',
  },
  statValue: {
    fontSize: 18,
    fontFamily: 'Inter-Bold',
    color: '#fff',
    marginTop: 8,
  },
  statLabel: {
    fontSize: 12,
    fontFamily: 'Inter-Regular',
    color: 'rgba(255,255,255,0.6)',
    marginTop: 4,
  },
  section: {
    marginTop: 24,
    paddingHorizontal: 24,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 20,
    fontFamily: 'Inter-Bold',
    color: '#fff',
  },
  seeAll: {
    fontSize: 14,
    fontFamily: 'Inter-Medium',
    color: '#4ADE80',
  },
  workoutCard: {
    width: width * 0.7,
    height: 200,
    marginRight: 16,
    borderRadius: 16,
    overflow: 'hidden',
  },
  workoutImage: {
    width: '100%',
    height: '100%',
  },
  workoutOverlay: {
    ...StyleSheet.absoluteFillObject,
    padding: 16,
    justifyContent: 'space-between',
    backgroundColor: 'rgba(0,0,0,0.3)',
  },
  workoutBadge: {
    alignSelf: 'flex-start',
    backgroundColor: 'rgba(74,222,128,0.9)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
  },
  workoutLevel: {
    fontSize: 12,
    fontFamily: 'Inter-Bold',
    color: '#121212',
  },
  workoutInfo: {
    gap: 8,
  },
  workoutTitle: {
    fontSize: 18,
    fontFamily: 'Inter-Bold',
    color: '#fff',
  },
  workoutMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  workoutDetail: {
    fontSize: 14,
    fontFamily: 'Inter-Medium',
    color: 'rgba(255,255,255,0.8)',
  },
  mindfulnessCard: {
    width: width * 0.6,
    height: 180,
    marginRight: 16,
    borderRadius: 16,
    overflow: 'hidden',
  },
  mindfulnessImage: {
    width: '100%',
    height: '100%',
  },
  mindfulnessOverlay: {
    ...StyleSheet.absoluteFillObject,
    padding: 16,
    justifyContent: 'space-between',
    backgroundColor: 'rgba(0,0,0,0.3)',
  },
  mindfulnessBadge: {
    alignSelf: 'flex-start',
    backgroundColor: 'rgba(74,222,128,0.9)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
  },
  mindfulnessCategory: {
    fontSize: 12,
    fontFamily: 'Inter-Bold',
    color: '#121212',
  },
  mindfulnessInfo: {
    gap: 4,
  },
  mindfulnessTitle: {
    fontSize: 18,
    fontFamily: 'Inter-Bold',
    color: '#fff',
  },
  mindfulnessDuration: {
    fontSize: 14,
    fontFamily: 'Inter-Medium',
    color: 'rgba(255,255,255,0.8)',
  },
  challengeCard: {
    flexDirection: 'row',
    backgroundColor: '#1E1E1E',
    borderRadius: 16,
    overflow: 'hidden',
    marginBottom: 12,
    height: 100,
  },
  challengeImage: {
    width: 100,
    height: '100%',
  },
  challengeInfo: {
    flex: 1,
    padding: 16,
    justifyContent: 'space-between',
  },
  challengeTitle: {
    fontSize: 16,
    fontFamily: 'Inter-Bold',
    color: '#fff',
  },
  challengeMeta: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  challengeParticipants: {
    fontSize: 12,
    fontFamily: 'Inter-Regular',
    color: 'rgba(255,255,255,0.6)',
  },
  challengeDays: {
    fontSize: 12,
    fontFamily: 'Inter-Medium',
    color: '#4ADE80',
  },
  progressBar: {
    height: 4,
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderRadius: 2,
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#4ADE80',
    borderRadius: 2,
  },
});
