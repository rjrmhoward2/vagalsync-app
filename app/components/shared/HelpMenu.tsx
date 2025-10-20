'use client'

/**
 * VagalSync V15.0 Ultimate - Help Menu Component
 * Zero TypeScript errors - Safe for production
 */

import { useState } from 'react'
import { 
  HelpCircle, 
  XCircle, 
  Search, 
  ExternalLink, 
  Settings, 
  FileText, 
  MessageCircle, 
  Book, 
  Video, 
  Mail,
  LucideIcon
} from 'lucide-react'
import Link from 'next/link'

type HelpContext = 'dashboard' | 'biomarkers' | 'devices' | 'settings' | 'predictions' | 'genetic'

interface HelpMenuItem {
  id: string
  title: string
  description: string
  icon: LucideIcon
  link?: string
  action?: () => void
}

interface HelpMenuProps {
  context?: HelpContext
  className?: string
}

export default function HelpMenu({ context = 'dashboard', className = '' }: HelpMenuProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [activeTab, setActiveTab] = useState<'help' | 'resources'>('help')

  // Dashboard help items
  const dashboardHelp: HelpMenuItem[] = [
    {
      id: 'myvagal-tone',
      title: 'Understanding myVagal Tone',
      description: 'Learn how your stress resilience score is calculated from biomarkers.',
      icon: FileText,
      link: '/help/myvagal-tone'
    },
    {
      id: 'first-biomarker',
      title: 'Add Your First Biomarker',
      description: 'Start tracking HRV, sleep, or any wellness metric.',
      icon: FileText,
      action: () => setIsOpen(false)
    },
    {
      id: 'connect-device',
      title: 'Connect a Wearable Device',
      description: 'Sync data automatically from your Apple Watch, Oura, or other devices.',
      icon: FileText,
      link: '/help/connect-devices'
    }
  ]

  // Biomarkers help items
  const biomarkersHelp: HelpMenuItem[] = [
    {
      id: 'biomarker-types',
      title: 'Supported Biomarkers',
      description: 'View the 50+ biomarkers you can track (HRV, cortisol, sleep, etc).',
      icon: FileText,
      link: '/help/biomarkers'
    },
    {
      id: 'accuracy-weighting',
      title: 'Accuracy Weighting (Patent #3)',
      description: 'How VagalSync weights biomarkers based on measurement method.',
      icon: FileText,
      link: '/help/accuracy-weighting'
    },
    {
      id: 'manual-entry',
      title: 'Manual Entry Tips',
      description: 'Best practices for entering lab results and manual measurements.',
      icon: FileText,
      link: '/help/manual-entry'
    }
  ]

  // Devices help items
  const devicesHelp: HelpMenuItem[] = [
    {
      id: 'device-discovery',
      title: 'Device Discovery AI (Patent #8)',
      description: 'How VagalSync automatically finds and connects your devices.',
      icon: FileText,
      link: '/help/device-discovery'
    },
    {
      id: 'email-forwarding',
      title: 'Email Forwarding Setup',
      description: 'Forward device emails to sync@vagalsync.com for automatic import.',
      icon: FileText,
      link: '/help/email-forwarding'
    },
    {
      id: 'sync-issues',
      title: 'Troubleshooting Sync Issues',
      description: 'Device not syncing? Here is how to fix it.',
      icon: FileText,
      link: '/help/sync-troubleshooting'
    }
  ]

  // Predictions help items
  const predictionsHelp: HelpMenuItem[] = [
    {
      id: 'biological-windows',
      title: 'Optimal Timing Windows (Patent #10)',
      description: 'Learn when your body is most receptive to interventions.',
      icon: FileText,
      link: '/help/biological-windows'
    },
    {
      id: 'circadian-rhythm',
      title: 'Understanding Circadian Rhythms',
      description: 'How your 24-hour body clock affects health and performance.',
      icon: FileText,
      link: '/help/circadian-rhythm'
    },
    {
      id: 'ultradian-cycles',
      title: 'Ultradian Cycles Explained',
      description: '90-minute performance cycles throughout your day.',
      icon: FileText,
      link: '/help/ultradian-cycles'
    }
  ]

  // Genetic help items
  const geneticHelp: HelpMenuItem[] = [
    {
      id: 'genetic-privacy',
      title: 'Genetic Data Privacy',
      description: 'How we protect your genetic information (AES-256, local-only).',
      icon: FileText,
      link: '/help/genetic-privacy'
    },
    {
      id: 'upload-23andme',
      title: 'Uploading 23andMe Data',
      description: 'Step-by-step guide to securely upload your raw genetic data.',
      icon: FileText,
      link: '/help/upload-genetic-data'
    },
    {
      id: 'genetic-insights',
      title: 'Understanding Genetic Insights',
      description: 'What your SNPs mean for stress resilience and wellness.',
      icon: FileText,
      link: '/help/genetic-insights'
    }
  ]

  // Settings help items
  const settingsHelp: HelpMenuItem[] = [
    {
      id: 'account-settings',
      title: 'Account Settings',
      description: 'Manage your email, password, and subscription.',
      icon: Settings,
      link: '/settings/account'
    },
    {
      id: 'privacy-settings',
      title: 'Privacy and Data Controls',
      description: 'Control what data is collected and how it is used.',
      icon: Settings,
      link: '/settings/privacy'
    },
    {
      id: 'notification-settings',
      title: 'Notifications',
      description: 'Customize when and how you receive alerts.',
      icon: Settings,
      link: '/settings/notifications'
    }
  ]

  // General resources
  const generalResources: HelpMenuItem[] = [
    {
      id: 'help-center',
      title: 'Help Center',
      description: 'Browse all help articles and guides',
      icon: Book,
      link: '/help'
    },
    {
      id: 'video-tutorials',
      title: 'Video Tutorials',
      description: 'Watch step-by-step video guides',
      icon: Video,
      link: '/help/videos'
    },
    {
      id: 'contact-support',
      title: 'Contact Support',
      description: 'Get help from our support team',
      icon: Mail,
      link: '/support'
    },
    {
      id: 'community',
      title: 'Community Forum',
      description: 'Connect with other VagalSync users',
      icon: MessageCircle,
      link: '/community'
    }
  ]

  // Get help items based on context
  const getHelpItems = (): HelpMenuItem[] => {
    switch (context) {
      case 'dashboard':
        return dashboardHelp
      case 'biomarkers':
        return biomarkersHelp
      case 'devices':
        return devicesHelp
      case 'predictions':
        return predictionsHelp
      case 'genetic':
        return geneticHelp
      case 'settings':
        return settingsHelp
      default:
        return dashboardHelp
    }
  }

  const relevantHelp = getHelpItems()

  // Filter help items by search query
  const filteredHelp = searchQuery
    ? relevantHelp.filter(item =>
        item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.description.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : relevantHelp

  return (
    <>
      {/* Help Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        type="button"
        className={`p-2 transition rounded-lg hover:bg-white/10 ${className}`}
        title="Help and Resources"
      >
        <HelpCircle className="w-6 h-6" />
      </button>

      {/* Help Panel */}
      {isOpen && (
        <>
          {/* Backdrop */}
          <div
            className="fixed inset-0 bg-black/20 z-40"
            onClick={() => setIsOpen(false)}
          />

          {/* Panel */}
          <div className="fixed top-16 right-4 bg-white border border-gray-200 rounded-lg shadow-2xl w-96 z-50 max-h-[600px] flex flex-col">
            
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b border-gray-200">
              <div className="flex items-center">
                <HelpCircle className="w-5 h-5 text-blue-600 mr-2" />
                <h3 className="font-semibold text-gray-900">Help and Resources</h3>
              </div>
              <button
                onClick={() => setIsOpen(false)}
                type="button"
                className="text-gray-400 hover:text-gray-600"
              >
                <XCircle className="w-5 h-5" />
              </button>
            </div>

            {/* Search */}
            <div className="p-4 border-b border-gray-200">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search help articles..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900 bg-white"
                />
              </div>
            </div>

            {/* Tabs */}
            <div className="flex border-b border-gray-200">
              <button
                onClick={() => setActiveTab('help')}
                type="button"
                className={`flex-1 px-4 py-2 text-sm font-medium transition ${
                  activeTab === 'help'
                    ? 'text-blue-600 border-b-2 border-blue-600'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                Quick Help
              </button>
              <button
                onClick={() => setActiveTab('resources')}
                type="button"
                className={`flex-1 px-4 py-2 text-sm font-medium transition ${
                  activeTab === 'resources'
                    ? 'text-blue-600 border-b-2 border-blue-600'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                Resources
              </button>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto p-4">
              {activeTab === 'help' ? (
                <div className="space-y-3">
                  {filteredHelp.length > 0 ? (
                    filteredHelp.map((item) => {
                      const IconComponent = item.icon
                      return (
                        <div
                          key={item.id}
                          className="p-3 border border-gray-200 rounded-lg hover:bg-gray-50 transition cursor-pointer group"
                          onClick={() => {
                            if (item.action) {
                              item.action()
                            } else if (item.link) {
                              window.location.href = item.link
                            }
                          }}
                        >
                          <div className="flex items-start">
                            <IconComponent className="w-5 h-5 text-blue-600 mr-3 flex-shrink-0 mt-0.5" />
                            <div className="flex-1">
                              <div className="font-medium text-gray-900 mb-1 flex items-center justify-between">
                                {item.title}
                                {item.link && (
                                  <ExternalLink className="w-4 h-4 text-gray-400 group-hover:text-blue-600" />
                                )}
                              </div>
                              <div className="text-sm text-gray-600">{item.description}</div>
                            </div>
                          </div>
                        </div>
                      )
                    })
                  ) : (
                    <div className="text-center py-8 text-gray-500">
                      <Search className="w-12 h-12 mx-auto mb-3 opacity-30" />
                      <p className="mb-2">No help articles found</p>
                      <button
                        onClick={() => setSearchQuery('')}
                        type="button"
                        className="text-blue-600 hover:text-blue-700 text-sm"
                      >
                        Clear search
                      </button>
                    </div>
                  )}
                </div>
              ) : (
                <div className="space-y-3">
                  {generalResources.map((item) => {
                    const IconComponent = item.icon
                    return (
                      <Link
                        key={item.id}
                        href={item.link || '#'}
                        className="block p-3 border border-gray-200 rounded-lg hover:bg-gray-50 transition group"
                        onClick={() => setIsOpen(false)}
                      >
                        <div className="flex items-start">
                          <IconComponent className="w-5 h-5 text-blue-600 mr-3 flex-shrink-0 mt-0.5" />
                          <div className="flex-1">
                            <div className="font-medium text-gray-900 mb-1 flex items-center justify-between">
                              {item.title}
                              <ExternalLink className="w-4 h-4 text-gray-400 group-hover:text-blue-600" />
                            </div>
                            <div className="text-sm text-gray-600">{item.description}</div>
                          </div>
                        </div>
                      </Link>
                    )
                  })}
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="p-4 border-t border-gray-200 bg-gray-50">
              <div className="text-xs text-gray-600 text-center">
                Need more help?{' '}
                <Link
                  href="/support"
                  className="text-blue-600 hover:text-blue-700 font-medium"
                  onClick={() => setIsOpen(false)}
                >
                  Contact Support
                </Link>
              </div>
            </div>
          </div>
        </>
      )}
    </>
  )
}







