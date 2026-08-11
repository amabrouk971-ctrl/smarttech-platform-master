import React from 'react';
import { User as AuthUser, Course, LearningPath } from '../types';
import { DynamicStorytellingHomepage } from '../components/discovery/DynamicStorytellingHomepage';

interface HomePageProps {
  currentUser: AuthUser | null;
  courses: Course[];
  learningPaths: LearningPath[];
  onStartLearning: () => void;
  onExplorePaths: () => void;
  onSelectCourse: (course: Course) => void;
  onOpenAuth: () => void;
  setActiveTab: (tab: string) => void;
  setActiveLabId: (labId: string) => void;
}

export const HomePage: React.FC<HomePageProps> = (props) => {
  return <DynamicStorytellingHomepage {...props} />;
};
