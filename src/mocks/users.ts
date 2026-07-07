import { User } from '@/types';

export const mockUsers: User[] = [
  {
    id: 'user-001',
    email: 'demo@karaoke.local',
    displayName: 'Demo User',
    avatarUrl: 'https://i.pravatar.cc/200?img=1',
    bio: 'Yêu hát karaoke 🎤',
    role: 'USER',
    isPremium: false,
    createdAt: '2025-12-01',
  },
  {
    id: 'user-002',
    email: 'sky@karaoke.local',
    displayName: 'Sky M-TP',
    avatarUrl: 'https://i.pravatar.cc/200?img=2',
    bio: 'Fan ruột Sơn Tùng',
    role: 'USER',
    isPremium: true,
    createdAt: '2025-11-15',
  },
  {
    id: 'admin-001',
    email: 'admin@karaoke.local',
    displayName: 'Admin',
    avatarUrl: 'https://i.pravatar.cc/200?img=3',
    bio: 'Quản trị viên hệ thống',
    role: 'ADMIN',
    isPremium: true,
    createdAt: '2025-10-01',
  },
];

export const currentUser = mockUsers[0];
