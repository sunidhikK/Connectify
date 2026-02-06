export interface User {
  id: string;
  name: string;
  email: string;
  avatar?: string;
  bio?: string;
  skills: string[];
  availability: 'full-time' | 'part-time' | 'weekends' | 'flexible';
  lookingFor: 'project' | 'teammates' | 'both';
  github?: string;
  linkedin?: string;
  portfolio?: string;
  createdAt: Date;
}

export interface Project {
  id: string;
  title: string;
  description: string;
  ownerId: string;
  ownerName: string;
  ownerAvatar?: string;
  techStack: string[];
  rolesNeeded: string[];
  teamSize: number;
  currentMembers: number;
  duration: string;
  hackathon?: string;
  createdAt: Date;
  status: 'open' | 'in-progress' | 'completed';
}

export interface Match {
  id: string;
  projectId: string;
  userId: string;
  projectOwnerId: string;
  userInterested: boolean;
  ownerApproved: boolean;
  matchedAt?: Date;
  status: 'pending' | 'matched' | 'rejected';
}

export interface Message {
  id: string;
  matchId: string;
  senderId: string;
  content: string;
  createdAt: Date;
  read: boolean;
}
