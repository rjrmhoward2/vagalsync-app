/**
 * SOCIAL & ACHIEVEMENTS TAB COMPONENT
 * VagalSync V15.0 Ultimate - Community engagement and gamification
 * Build social accountability and track milestones
 */

import React, { useState } from 'react';
import { Users, Award, Share2, TrendingUp, Trophy, Star, Flame, Target, CheckCircle, Heart, Zap, Crown, Medal } from 'lucide-react';

interface SocialTabProps {
  vagalToneScore: number;
  socialStreak: number;
  achievements: string[];
  interventionLogs: any[];
  selectedDevices: string[];
  userLevel: 'free' | 'silver' | 'gold' | 'platinum';
}

const SocialTab: React.FC<SocialTabProps> = ({
  vagalToneScore,
  socialStreak,
  achievements,
  interventionLogs,
  selectedDevices,
  userLevel
}) => {

  const [shareSuccess, setShareSuccess] = useState(false);

  // Achievement definitions
  const allAchievements = [
    {
      id: 'first-week',
      name: 'Week Warrior',
      description: 'Tracked for 7 consecutive days',
      icon: Flame,
      color: 'from-orange-500 to-red-500',
      unlocked: socialStreak >= 7,
      rarity: 'common'
    },
    {
      id: 'month-master',
      name: 'Monthly Master',
      description: 'Maintained 30-day streak',
      icon: Calendar,
      color: 'from-blue-500 to-cyan-500',
      unlocked: socialStreak >= 30,
      rarity: 'rare'
    },
    {
      id: 'score-climber',
      name: 'Score Climber',
      description: 'Improved myVagal Tone™ by 20+ points',
      icon: TrendingUp,
      color: 'from-green-500 to-emerald-500',
      unlocked: vagalToneScore >= 70,
      rarity: 'common'
    },
    {
      id: 'elite-status',
      name: 'Elite Resilience',
      description: 'Achieved myVagal Tone™ score of 80+',
      icon: Trophy,
      color: 'from-yellow-500 to-orange-500',
      unlocked: vagalToneScore >= 80,
      rarity: 'epic'
    },
    {
      id: 'device-master',
      name: 'Device Master',
      description: 'Connected 5+ devices',
      icon: Zap,
      color: 'from-purple-500 to-pink-500',
      unlocked: selectedDevices.length >= 5,
      rarity: 'rare'
    },
    {
      id: 'intervention-hero',
      name: 'Intervention Hero',
      description: 'Completed 50 intervention sessions',
      icon: Heart,
      color: 'from-red-500 to-pink-500',
      unlocked: interventionLogs.length >= 50,
      rarity: 'epic'
    },
    {
      id: 'gold-member',
      name: 'Gold Member',
      description: 'Upgraded to Gold or Platinum',
      icon: Crown,
      color: 'from-yellow-400 to-yellow-600',
      unlocked: userLevel === 'gold' || userLevel === 'platinum',
      rarity: 'rare'
    },
    {
      id: 'platinum-elite',
      name: 'Platinum Elite',
      description: 'Joined the Platinum tier',
      icon: Star,
      color: 'from-purple-400 to-purple-600',
      unlocked: userLevel === 'platinum',
      rarity: 'legendary'
    },
    {
      id: 'consistency-king',
      name: 'Consistency King',
      description: 'Tracked every day for 100 days',
      icon: Medal,
      color: 'from-cyan-500 to-blue-600',
      unlocked: socialStreak >= 100,
      rarity: 'legendary'
    }
  ];

  const unlockedAchievements = allAchievements.filter(a => a.unlocked);
  const lockedAchievements = allAchievements.filter(a => !a.unlocked);

  // Leaderboard data (mock)
  const leaderboard = [
    { rank: 1, name: 'Sarah M.', score: 94.2, streak: 127, avatar: '👩' },
    { rank: 2, name: 'Mike T.', score: 91.8, streak: 89, avatar: '👨' },
    { rank: 3, name: 'Alex K.', score: 89.5, streak: 156, avatar: '🧑' },
    { rank: 4, name: 'Jordan P.', score: 87.3, streak: 45, avatar: '👤' },
    { rank: 5, name: 'You', score: vagalToneScore, streak: socialStreak, avatar: '⭐', isUser: true }
  ];

  // Share progress
  const shareProgress = () => {
    const shareText = `🧠 My myVagal Tone™ is ${vagalToneScore.toFixed(1)}/100! 💪 
${socialStreak}-day streak on @VagalSync
#WellnessJourney #StressManagement`;

    if (navigator.share) {
      navigator.share({
        title: 'VagalSync Progress',
        text: shareText,
        url: 'https://vagalsync.com'
      });
    } else {
      navigator.clipboard.writeText(shareText);
      setShareSuccess(true);
      setTimeout(() => setShareSuccess(false), 3000);
    }
  };

  return (
    <div className="p-8 space-y-8">
      {/* Header */}
      <div className="text-center mb-12">
        <h2 className="text-5xl font-bold text-white mb-4 flex items-center justify-center">
          <Users className="w-12 h-12 mr-4 text-cyan-300" />
          Community & Achievements
        </h2>
        <p className="text-2xl text-cyan-300/80">
          Share your journey and celebrate milestones
        </p>
      </div>

      {/* Share Card */}
      <div className="bg-gradient-to-br from-purple-900/50 to-pink-900/50 rounded-3xl p-8 border border-purple-400/30 backdrop-blur">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h3 className="text-3xl font-bold text-white mb-2">Share Your Progress</h3>
            <p className="text-white/70">Inspire others and build accountability</p>
          </div>
          <Share2 className="w-12 h-12 text-cyan-400" />
        </div>

        <div className="bg-white/10 rounded-2xl p-6 mb-6">
          <div className="text-white/90 mb-4 text-lg leading-relaxed">
            🧠 My myVagal Tone™ is <span className="font-bold text-cyan-300">{vagalToneScore.toFixed(1)}/100</span>! 💪<br/>
            <span className="font-bold text-yellow-300">{socialStreak}-day streak</span> on VagalSync<br/>
            #WellnessJourney #StressManagement
          </div>
        </div>

        <div className="flex gap-4">
          <button
            onClick={shareProgress}
            className="flex-1 bg-gradient-to-r from-cyan-500 to-blue-500 text-white py-4 px-6 rounded-xl font-bold hover:from-cyan-600 hover:to-blue-600 transition-all flex items-center justify-center space-x-2"
          >
            <Share2 className="w-5 h-5" />
            <span>Share Progress</span>
          </button>
          
          {shareSuccess && (
            <div className="flex items-center space-x-2 bg-green-500/20 px-6 rounded-xl border border-green-400/30">
              <CheckCircle className="w-5 h-5 text-green-400" />
              <span className="text-green-300 font-medium">Copied to clipboard!</span>
            </div>
          )}
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-gradient-to-br from-orange-500/20 to-red-500/20 rounded-2xl p-6 border border-orange-400/30 backdrop-blur">
          <Flame className="w-12 h-12 text-orange-400 mb-4" />
          <div className="text-4xl font-bold text-white mb-2">{socialStreak}</div>
          <div className="text-white/80">Day Streak</div>
          <div className="mt-3 text-sm text-orange-300">
            🔥 Keep it going! Next milestone: {socialStreak < 30 ? '30 days' : socialStreak < 100 ? '100 days' : '200 days'}
          </div>
        </div>

        <div className="bg-gradient-to-br from-yellow-500/20 to-orange-500/20 rounded-2xl p-6 border border-yellow-400/30 backdrop-blur">
          <Award className="w-12 h-12 text-yellow-400 mb-4" />
          <div className="text-4xl font-bold text-white mb-2">{unlockedAchievements.length}</div>
          <div className="text-white/80">Achievements Unlocked</div>
          <div className="mt-3 text-sm text-yellow-300">
            {lockedAchievements.length} more to unlock
          </div>
        </div>

        <div className="bg-gradient-to-br from-cyan-500/20 to-blue-500/20 rounded-2xl p-6 border border-cyan-400/30 backdrop-blur">
          <TrendingUp className="w-12 h-12 text-cyan-400 mb-4" />
          <div className="text-4xl font-bold text-white mb-2">Top 15%</div>
          <div className="text-white/80">Community Ranking</div>
          <div className="mt-3 text-sm text-cyan-300">
            Better than 85% of users
          </div>
        </div>
      </div>

      {/* Unlocked Achievements */}
      <div className="space-y-4">
        <h3 className="text-2xl font-bold text-white flex items-center">
          <Trophy className="w-7 h-7 mr-3 text-yellow-400" />
          Your Achievements
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {unlockedAchievements.map((achievement) => (
            <div
              key={achievement.id}
              className={`bg-gradient-to-br ${achievement.color} rounded-2xl p-6 border-2 border-white/30 backdrop-blur transform hover:scale-105 transition-all cursor-pointer`}
            >
              <div className="flex items-start justify-between mb-4">
                <achievement.icon className="w-10 h-10 text-white" />
                <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                  achievement.rarity === 'legendary' ? 'bg-purple-500 text-white' :
                  achievement.rarity === 'epic' ? 'bg-yellow-500 text-black' :
                  achievement.rarity === 'rare' ? 'bg-blue-500 text-white' :
                  'bg-gray-500 text-white'
                }`}>
                  {achievement.rarity.toUpperCase()}
                </span>
              </div>
              <h4 className="font-bold text-white text-xl mb-2">{achievement.name}</h4>
              <p className="text-white/90 text-sm">{achievement.description}</p>
              <div className="mt-4 flex items-center space-x-2">
                <CheckCircle className="w-5 h-5 text-white" />
                <span className="text-white text-sm font-medium">Unlocked!</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Locked Achievements */}
      {lockedAchievements.length > 0 && (
        <div className="space-y-4">
          <h3 className="text-2xl font-bold text-white flex items-center">
            <Target className="w-7 h-7 mr-3 text-gray-400" />
            Upcoming Achievements
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {lockedAchievements.map((achievement) => (
              <div
                key={achievement.id}
                className="bg-white/5 rounded-2xl p-6 border border-white/10 backdrop-blur opacity-60 hover:opacity-80 transition-all"
              >
                <div className="flex items-start justify-between mb-4">
                  <achievement.icon className="w-10 h-10 text-gray-400" />
                  <span className="px-3 py-1 rounded-full text-xs font-bold bg-gray-600 text-white">
                    LOCKED
                  </span>
                </div>
                <h4 className="font-bold text-gray-300 text-xl mb-2">{achievement.name}</h4>
                <p className="text-gray-400 text-sm">{achievement.description}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Community Leaderboard */}
      <div className="bg-gradient-to-br from-gray-900/80 to-gray-800/80 rounded-3xl p-8 border border-gray-700/50 backdrop-blur">
        <h3 className="text-2xl font-bold text-white mb-6 flex items-center">
          <Medal className="w-7 h-7 mr-3 text-yellow-400" />
          Community Leaderboard
          <span className="ml-3 text-sm text-white/60 font-normal">(This Week)</span>
        </h3>

        <div className="space-y-3">
          {leaderboard.map((user) => (
            <div
              key={user.rank}
              className={`rounded-xl p-4 flex items-center justify-between transition-all ${
                user.isUser
                  ? 'bg-gradient-to-r from-cyan-500/20 to-blue-500/20 border-2 border-cyan-400/50'
                  : 'bg-white/5 border border-white/10 hover:bg-white/10'
              }`}
            >
              <div className="flex items-center space-x-4">
                <div className={`w-12 h-12 rounded-full flex items-center justify-center font-bold text-xl ${
                  user.rank === 1 ? 'bg-yellow-500 text-black' :
                  user.rank === 2 ? 'bg-gray-400 text-black' :
                  user.rank === 3 ? 'bg-orange-600 text-white' :
                  user.isUser ? 'bg-cyan-500 text-white' :
                  'bg-gray-600 text-white'
                }`}>
                  {user.rank === 1 ? '🥇' : user.rank === 2 ? '🥈' : user.rank === 3 ? '🥉' : user.rank}
                </div>

                <div className="text-4xl">{user.avatar}</div>

                <div>
                  <div className={`font-bold ${user.isUser ? 'text-cyan-300' : 'text-white'}`}>
                    {user.name}
                    {user.isUser && <span className="ml-2 text-xs text-cyan-400">(You)</span>}
                  </div>
                  <div className="text-sm text-white/60">
                    {user.streak} day streak
                  </div>
                </div>
              </div>

              <div className="text-right">
                <div className={`text-3xl font-bold ${user.isUser ? 'text-cyan-300' : 'text-white'}`}>
                  {user.score.toFixed(1)}
                </div>
                <div className="text-sm text-white/60">myVagal Tone™</div>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-6 text-center text-white/60 text-sm">
          Leaderboard updates weekly • Compete with thousands of users worldwide
        </div>
      </div>

      {/* Community Stats */}
      <div className="bg-gradient-to-r from-blue-900/30 to-purple-900/30 rounded-3xl p-8 border border-blue-400/30 backdrop-blur">
        <h3 className="text-2xl font-bold text-white mb-6">🌍 Global Community</h3>
        
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          <div className="text-center">
            <div className="text-4xl font-bold text-cyan-400 mb-2">47,892</div>
            <div className="text-white/70 text-sm">Active Users</div>
          </div>
          <div className="text-center">
            <div className="text-4xl font-bold text-green-400 mb-2">1.2M</div>
            <div className="text-white/70 text-sm">Sessions Logged</div>
          </div>
          <div className="text-center">
            <div className="text-4xl font-bold text-purple-400 mb-2">23.4</div>
            <div className="text-white/70 text-sm">Avg Improvement</div>
          </div>
          <div className="text-center">
            <div className="text-4xl font-bold text-yellow-400 mb-2">156</div>
            <div className="text-white/70 text-sm">Countries</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SocialTab;
