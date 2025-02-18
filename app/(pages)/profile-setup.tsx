import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Dimensions,
} from 'react-native';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import Animated, {
  FadeIn,
  FadeInDown,
  SlideInRight,
} from 'react-native-reanimated';
import { doc, setDoc } from 'firebase/firestore';
import { db } from '../../FirebaseConfig';
import { useUser } from '@clerk/clerk-expo';

const { width } = Dimensions.get('window');

const fitnessLevels = [
  {
    id: 'beginner',
    title: 'Beginner',
    description: 'Just getting started',
    icon: 'leaf',
  },
  {
    id: 'intermediate',
    title: 'Intermediate',
    description: 'Work out a few times a week',
    icon: 'fitness',
  },
  {
    id: 'advanced',
    title: 'Advanced',
    description: 'Train regularly with intense workouts',
    icon: 'barbell',
  },
];

const goals = [
  {
    id: 'weight-loss',
    title: 'Weight Loss',
    description: 'Burn fat & tone up',
    icon: 'trending-down',
  },
  {
    id: 'muscle-gain',
    title: 'Muscle Gain',
    description: 'Build strength & size',
    icon: 'barbell',
  },
  {
    id: 'endurance',
    title: 'Endurance',
    description: 'Improve stamina & performance',
    icon: 'pulse',
  },
  {
    id: 'flexibility',
    title: 'Flexibility',
    description: 'Increase mobility & balance',
    icon: 'body',
  },
  {
    id: 'health',
    title: 'Overall Health',
    description: 'Feel better & stay active',
    icon: 'heart',
  },
];

const activities = [
  {
    id: 'strength',
    title: 'Strength Training',
    icon: 'barbell',
  },
  {
    id: 'running',
    title: 'Running & Cardio',
    icon: 'walk',
  },
  {
    id: 'yoga',
    title: 'Yoga & Meditation',
    icon: 'body',
  },
  {
    id: 'hiit',
    title: 'HIIT & Fat Burn',
    icon: 'flame',
  },
  {
    id: 'cycling',
    title: 'Cycling',
    icon: 'bicycle',
  },
  {
    id: 'swimming',
    title: 'Swimming',
    icon: 'water',
  },
];

const genderOptions = [
  {
    id: 'male',
    title: 'Male',
    description: 'Identify as male',
    icon: 'man',
  },
  {
    id: 'female',
    title: 'Female',
    description: 'Identify as female',
    icon: 'woman',
  },
  {
    id: 'other',
    title: 'Other',
    description: 'Prefer not to specify',
    icon: 'person',
  },
];

type Step = 'info' | 'goals' | 'activities';

export default function ProfileSetup() {
  const [currentStep, setCurrentStep] = useState<Step>('info');
  const [age, setAge] = useState('');
  const [gender, setGender] = useState('');
  const [fitnessLevel, setFitnessLevel] = useState('');
  const [selectedGoals, setSelectedGoals] = useState<Set<string>>(new Set());
  const [selectedActivities, setSelectedActivities] = useState<Set<string>>(new Set());

  const { user } = useUser();
        
  if (!user) {
      console.error('No user found');
      return;
  }

  const validateCurrentStep = () => {
    switch (currentStep) {
      case 'info':
        return age.trim() !== '' && 
               gender.trim() !== '' && 
               fitnessLevel !== '';
      case 'goals':
        return selectedGoals.size > 0;
      case 'activities':
        return selectedActivities.size > 0;
      default:
        return false;
    }
  };

  const handleNext = async () => {
    if (currentStep === 'info') {
      setCurrentStep('goals');
    } else if (currentStep === 'goals') {
      setCurrentStep('activities');
    } else {
      // Handle completion and save to Firebase
      try {
        

        // Convert Sets to Arrays
        const goalsArray = Array.from(selectedGoals);
        const activitiesArray = Array.from(selectedActivities);
        console.log('Goals:', goalsArray);
        console.log('Activities:', activitiesArray);
        console.log("user id", user.id);

        // Create user profile document
        await setDoc(doc(db, 'Users', user.id), {
          age: Number(age),
          completedChallenges: [],
          earnedPoints: 0,
          fitnessGoals: goalsArray,
          fitnessLevel: fitnessLevel,
          gender: gender.toLowerCase(),
          joinedGroups: [],
          name: user.firstName || '',
          preferredActivities: activitiesArray,
          streak: 0,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          image: user?.imageUrl || '',
          rank: Number(0),
          achievement : 'Just getting started',
        });

        // Navigate to main app
        router.replace('/(tabs)');
      } catch (error) {
        console.error('Error saving profile:', error);
        // You might want to show an error message to the user here
      }
    }
  };

  const handleBack = () => {
    if (currentStep === 'goals') {
      setCurrentStep('info');
    } else if (currentStep === 'activities') {
      setCurrentStep('goals');
    }
  };

  const renderStep = () => {
    switch (currentStep) {
      case 'info':
        return (
          <Animated.View
            entering={FadeIn}
            style={styles.stepContainer}>
            <Text style={styles.stepTitle}>Basic Information</Text>
            <Text style={styles.stepDescription}>
              Tell us a little about yourself to personalize your experience
            </Text>

            <View style={styles.inputContainer}>
              <TextInput
                style={styles.input}
                placeholder="Age"
                placeholderTextColor="rgba(255,255,255,0.6)"
                keyboardType="number-pad"
                value={age}
                onChangeText={setAge}
              />
            </View>

            <Text style={styles.sectionTitle}>Gender</Text>
            {genderOptions.map((option, index) => (
              <Animated.View
                key={option.id}
                entering={FadeInDown.delay(index * 100)}
              >
                <TouchableOpacity
                  style={[
                    styles.levelCard,
                    gender === option.id && styles.selectedCard,
                  ]}
                  onPress={() => setGender(option.id)}
                >
                  <View style={styles.levelIcon}>
                    <Ionicons name={option.icon} size={24} color="#4ADE80" />
                  </View>
                  <View style={styles.levelInfo}>
                    <Text style={styles.levelTitle}>{option.title}</Text>
                    <Text style={styles.levelDescription}>
                      {option.description}
                    </Text>
                  </View>
                  <View
                    style={[
                      styles.checkbox,
                      gender === option.id && styles.checkedBox,
                    ]}
                  >
                    {gender === option.id && (
                      <Ionicons name="checkmark" size={16} color="#121212" />
                    )}
                  </View>
                </TouchableOpacity>
              </Animated.View>
            ))}

            <Text style={styles.sectionTitle}>Fitness Level</Text>
            {fitnessLevels.map((level, index) => (
              <Animated.View
                key={level.id}
                entering={FadeInDown.delay(index * 100)}>
                <TouchableOpacity
                  style={[
                    styles.levelCard,
                    fitnessLevel === level.id && styles.selectedCard,
                  ]}
                  onPress={() => setFitnessLevel(level.id)}>
                  <View style={styles.levelIcon}>
                    <Ionicons name={level.icon} size={24} color="#4ADE80" />
                  </View>
                  <View style={styles.levelInfo}>
                    <Text style={styles.levelTitle}>{level.title}</Text>
                    <Text style={styles.levelDescription}>
                      {level.description}
                    </Text>
                  </View>
                  <View
                    style={[
                      styles.checkbox,
                      fitnessLevel === level.id && styles.checkedBox,
                    ]}>
                    {fitnessLevel === level.id && (
                      <Ionicons name="checkmark" size={16} color="#121212" />
                    )}
                  </View>
                </TouchableOpacity>
              </Animated.View>
            ))}
          </Animated.View>
        );

      case 'goals':
        return (
          <Animated.View
            entering={SlideInRight}
            style={styles.stepContainer}>
            <Text style={styles.stepTitle}>Your Fitness Goals</Text>
            <Text style={styles.stepDescription}>
              What do you want to achieve? Select all that apply
            </Text>

            {goals.map((goal, index) => (
              <Animated.View
                key={goal.id}
                entering={FadeInDown.delay(index * 100)}>
                <TouchableOpacity
                  style={[
                    styles.goalCard,
                    selectedGoals.has(goal.id) && styles.selectedCard,
                  ]}
                  onPress={() => {
                    const newGoals = new Set(selectedGoals);
                    if (newGoals.has(goal.id)) {
                      newGoals.delete(goal.id);
                    } else {
                      newGoals.add(goal.id);
                    }
                    setSelectedGoals(newGoals);
                  }}>
                  <View style={styles.goalIcon}>
                    <Ionicons name={goal.icon} size={24} color="#4ADE80" />
                  </View>
                  <View style={styles.goalInfo}>
                    <Text style={styles.goalTitle}>{goal.title}</Text>
                    <Text style={styles.goalDescription}>
                      {goal.description}
                    </Text>
                  </View>
                  <View
                    style={[
                      styles.checkbox,
                      selectedGoals.has(goal.id) && styles.checkedBox,
                    ]}>
                    {selectedGoals.has(goal.id) && (
                      <Ionicons name="checkmark" size={16} color="#121212" />
                    )}
                  </View>
                </TouchableOpacity>
              </Animated.View>
            ))}
          </Animated.View>
        );

      case 'activities':
        return (
          <Animated.View
            entering={SlideInRight}
            style={styles.stepContainer}>
            <Text style={styles.stepTitle}>Preferred Activities</Text>
            <Text style={styles.stepDescription}>
              Choose the workouts you enjoy most
            </Text>

            <View style={styles.activitiesGrid}>
              {activities.map((activity, index) => (
                <Animated.View
                  key={activity.id}
                  entering={FadeInDown.delay(index * 100)}
                  style={styles.activityWrapper}>
                  <TouchableOpacity
                    style={[
                      styles.activityCard,
                      selectedActivities.has(activity.id) &&
                        styles.selectedActivityCard,
                    ]}
                    onPress={() => {
                      const newActivities = new Set(selectedActivities);
                      if (newActivities.has(activity.id)) {
                        newActivities.delete(activity.id);
                      } else {
                        newActivities.add(activity.id);
                      }
                      setSelectedActivities(newActivities);
                    }}>
                    <Ionicons
                      name={activity.icon}
                      size={32}
                      color={
                        selectedActivities.has(activity.id)
                          ? '#121212'
                          : '#4ADE80'
                      }
                    />
                    <Text
                      style={[
                        styles.activityTitle,
                        selectedActivities.has(activity.id) &&
                          styles.selectedActivityTitle,
                      ]}>
                      {activity.title}
                    </Text>
                  </TouchableOpacity>
                </Animated.View>
              ))}
            </View>
          </Animated.View>
        );
    }
  };

  return (
    <View style={styles.container}>
      {/* Progress Indicator */}
      <View style={styles.progressContainer}>
        <View style={styles.progressBar}>
          <View
            style={[
              styles.progressFill,
              {
                width:
                  currentStep === 'info'
                    ? '33%'
                    : currentStep === 'goals'
                    ? '66%'
                    : '100%',
              },
            ]}
          />
        </View>
        <View style={styles.stepsIndicator}>
          <Text style={styles.stepIndicator}>
            Step {currentStep === 'info' ? '1' : currentStep === 'goals' ? '2' : '3'}{' '}
            of 3
          </Text>
        </View>
      </View>

      {/* Back Button */}
      {currentStep !== 'info' && (
        <TouchableOpacity
          style={styles.backButton}
          onPress={handleBack}>
          <Ionicons name="arrow-back" size={24} color="#fff" />
        </TouchableOpacity>
      )}

      {/* Content */}
      <ScrollView
        style={styles.content}
        showsVerticalScrollIndicator={false}>
        {renderStep()}
      </ScrollView>

      {/* Next Button */}
      <View style={styles.footer}>
        <TouchableOpacity
          style={[
            styles.nextButton,
            !validateCurrentStep() && styles.disabledButton
          ]}
          disabled={!validateCurrentStep()}
          onPress={handleNext}>
          <Text style={styles.nextButtonText}>
            {currentStep === 'activities' ? 'Finish' : 'Next'}
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#121212',
  },
  progressContainer: {
    paddingTop: 60,
    paddingHorizontal: 24,
    paddingBottom: 24,
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
  stepsIndicator: {
    marginTop: 8,
    alignItems: 'flex-end',
  },
  stepIndicator: {
    fontSize: 14,
    fontFamily: 'Inter-Medium',
    color: 'rgba(255,255,255,0.6)',
  },
  backButton: {
    position: 'absolute',
    top: 60,
    left: 24,
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.1)',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 1,
  },
  content: {
    flex: 1,
  },
  stepContainer: {
    padding: 24,
  },
  stepTitle: {
    fontSize: 28,
    fontFamily: 'Inter-Bold',
    color: '#fff',
    marginBottom: 8,
  },
  stepDescription: {
    fontSize: 16,
    fontFamily: 'Inter-Regular',
    color: 'rgba(255,255,255,0.6)',
    marginBottom: 32,
  },
  inputContainer: {
    backgroundColor: '#1E1E1E',
    borderRadius: 12,
    marginBottom: 16,
    height: 56,
  },
  input: {
    flex: 1,
    paddingHorizontal: 16,
    fontSize: 16,
    fontFamily: 'Inter-Regular',
    color: '#fff',
  },
  sectionTitle: {
    fontSize: 18,
    fontFamily: 'Inter-Bold',
    color: '#fff',
    marginTop: 24,
    marginBottom: 16,
  },
  levelCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1E1E1E',
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
  },
  selectedCard: {
    backgroundColor: 'rgba(74,222,128,0.1)',
    borderColor: '#4ADE80',
    borderWidth: 1,
  },
  levelIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: 'rgba(74,222,128,0.1)',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
  },
  levelInfo: {
    flex: 1,
  },
  levelTitle: {
    fontSize: 16,
    fontFamily: 'Inter-Bold',
    color: '#fff',
    marginBottom: 4,
  },
  levelDescription: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    color: 'rgba(255,255,255,0.6)',
  },
  checkbox: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: 'rgba(255,255,255,0.2)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkedBox: {
    backgroundColor: '#4ADE80',
    borderColor: '#4ADE80',
  },
  goalCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1E1E1E',
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
  },
  goalIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: 'rgba(74,222,128,0.1)',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
  },
  goalInfo: {
    flex: 1,
  },
  goalTitle: {
    fontSize: 16,
    fontFamily: 'Inter-Bold',
    color: '#fff',
    marginBottom: 4,
  },
  goalDescription: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    color: 'rgba(255,255,255,0.6)',
  },
  activitiesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginHorizontal: -6,
  },
  activityWrapper: {
    width: '50%',
    padding: 6,
  },
  activityCard: {
    backgroundColor: '#1E1E1E',
    borderRadius: 16,
    padding: 16,
    alignItems: 'center',
    gap: 12,
    aspectRatio: 1,
  },
  selectedActivityCard: {
    backgroundColor: '#4ADE80',
  },
  activityTitle: {
    fontSize: 14,
    fontFamily: 'Inter-Medium',
    color: '#fff',
    textAlign: 'center',
  },
  selectedActivityTitle: {
    color: '#121212',
  },
  footer: {
    padding: 24,
    paddingBottom: 48,
  },
  nextButton: {
    backgroundColor: '#4ADE80',
    height: 56,
    borderRadius: 28,
    alignItems: 'center',
    justifyContent: 'center',
  },
  nextButtonText: {
    fontSize: 16,
    fontFamily: 'Inter-Bold',
    color: '#121212',
  },
  disabledButton: {
    backgroundColor: 'rgba(74,222,128,0.5)',
  },
});