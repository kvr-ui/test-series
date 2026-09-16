/*
 * Seed content for the Video Insights page. Loaded into MongoDB on first boot and by `npm run seed`.
 */
export const videoInsightsPage = {
  slug: 'video-insights',
  title: 'Video Insights – FOCAS Edu',
  description:
    'FOCAS Edu mentors review your CA test answers on video. Understand exactly where you lost marks and how to fix it.',
  sections: {
    site: {
      brand: 'FOCAS Edu',
      whatsapp_phone: '916383514285',
      copyright_text: 'FOCAS Edu. All rights reserved.',
    },

    hero: {
      heading: 'You failed.',
      subheading: 'But did you know why?',
      text: 'FOCAS Edu Mentors will review your test answers — on video. Understand exactly where you lost marks and how to fix it.',
      button_label: 'Get Your Mentored Tests',
      button_link: '#pricing',
      image: '/hero-mentor-review.jpg',
      badges: ['Video Review', 'Expert Mentors', 'Personalized Feedback'],
      trusted_count: '1000+',
    },

    videoSlider: {
      heading: 'See Real Mentor Reviews',
      subheading: 'You Failed. But do you know why?',
      videos: [
        {
          video_url: 'https://vz-1b4abbd6-5f1.b-cdn.net/b977bb85-c925-4029-91be-c56f67b1f790/playlist.m3u8',
          video_id: '',
          thumbnail: '',
          caption: 'Find out how Leverages can be practiced to a level of perfection to get a perfect score',
        },
        {
          video_url: 'https://vz-1b4abbd6-5f1.b-cdn.net/0f49ae1b-d549-4c11-ad6b-9958de9a3a9b/playlist.m3u8',
          video_id: '',
          thumbnail: '',
          caption: 'Look out for small errors in SM',
        },
        {
          video_url: 'https://vz-1b4abbd6-5f1.b-cdn.net/07546cdb-ada0-4ec1-8c6f-01e7991fda19/playlist.m3u8',
          video_id: '',
          thumbnail: '',
          caption: 'Find out where the student missed out in Time of Supply',
        },
        {
          video_url: 'https://vz-1b4abbd6-5f1.b-cdn.net/9655134d-4c88-4ab7-b362-fb9ac96b662b/playlist.m3u8',
          video_id: '',
          thumbnail: '',
          caption: 'Watch how mentors analyze and correct answer sheets',
        },
      ],
    },

    howItWorks: {
      heading: 'How This Works',
      subheading: 'Four simple steps to understand your mistakes',
      steps: [
        { title: 'Write The Test', description: 'Take a mock test under exam conditions' },
        { title: 'Upload your Answer Sheet', description: 'Submit your handwritten answer sheets for review' },
        {
          title: 'Mentor Reviews with Video',
          description: 'Apart from normal evaluation, get a personalized video review from our CA Mentors',
        },
        { title: 'Apply Corrections', description: 'Implement the feedback in your next test' },
      ],
    },

    comparison: {
      pill_text: 'The Real Problem',
      heading: "More Tests Won't Fix Your Marks.",
      subheading: 'Understanding Your Mistakes Will.',
      description:
        'Most students write 15+ tests and still fail. Not because they lack practice—but because nobody showed them where they went wrong.',
      col_1_label: 'Regular Test Series',
      col_2_label: 'FOCAS Mentor Tests',
      punchline: "You don't need more tests. You need better feedback.",
      rows: [
        {
          aspect: 'After 10 tests',
          regular: 'Still repeating the same mistakes',
          focas: 'Clear improvement visible from Test 2',
        },
        {
          aspect: 'Mentor Guidance',
          regular: 'None. You are on your own.',
          focas: 'A Mentor corrects your answers and tells you exactly what went wrong',
        },
        {
          aspect: 'Mistake identification',
          regular: 'You see marks and guess why you lost them.',
          focas: 'You see and hear the exact reason where and why marks were cut.',
        },
        {
          aspect: 'Execution Support',
          regular: 'Model answers you cannot replicate under exam pressure',
          focas: 'Step-by-step changes to how you structure, present and write',
        },
        {
          aspect: 'Clarity in understanding',
          regular: 'Anxiety from unresolved doubts',
          focas: 'Clarity on what to fix and how to fix it',
        },
      ],
    },

    testimonials: {
      heading: 'Student Stories',
      subheading: 'Hear from students who transformed their preparation',
      video_orientation: 'portrait',
      items: [
        {
          video_url: '',
          video_id: '',
          thumbnail: '',
          overlay: 'I finally understood my mistakes',
          name: 'Priya S.',
          attempt: 'Nov 2024',
        },
        {
          video_url: '',
          video_id: '',
          thumbnail: '',
          overlay: 'This changed how I write answers',
          name: 'Rahul M.',
          attempt: 'May 2024',
        },
        {
          video_url: '',
          video_id: '',
          thumbnail: '',
          overlay: 'My scores improved by 15 marks',
          name: 'Sneha K.',
          attempt: 'Nov 2023',
        },
      ],
    },

    pricing: {
      heading: 'Choose Your Plan',
      subheading: 'Select your CA Inter group and subject',
      footer_text: 'No recurring charges. Pay only once.',
      levels: ['Foundation', 'Intermediate', 'Final'],
      enabled_levels: ['Intermediate'],
      default_level: 'Intermediate',
      selection_types: ['Subject Wise', 'Group Wise', 'Both Groups'],
      coming_soon_types: ['Subject Wise'],
      default_type: 'Group Wise',
      subjects: {
        Foundation: ['Accounting', 'Business Laws', 'Quantitative Aptitude', 'Business Economics'],
        Intermediate: [
          'Advanced Accounting',
          'Corporate and Other Laws',
          'Taxation (DT + GST)',
          'Cost and Management Accounting',
          'Audit and Ethics',
          'Financial and Strategic Management',
        ],
        Final: [
          'Financial Reporting',
          'Strategic Financial Management',
          'Advanced Auditing',
          'Corporate & Economic Laws',
          'Direct Tax Laws',
          'Indirect Tax Laws',
          'SCMPE',
          'ISCA',
        ],
      },
      groups: {
        Foundation: ['Group 1', 'Group 2'],
        Intermediate: ['Group 1', 'Group 2'],
        Final: ['Group 1', 'Group 2'],
      },
      pricing_by_type: {
        'Subject Wise': { solo: 299, cumulative: 999, lak: 1801 },
        'Group Wise': { solo: 799, cumulative: 2499, lak: 4524 },
        'Both Groups': { solo: 1499, cumulative: 3999, lak: 8001 },
      },
    },

    finalCta: {
      pill_text: 'Limited Mentor Review Capacity',
      heading: 'Stop Guessing.',
      subheading: 'Start Understanding.',
      text: 'Get your answers reviewed by expert CA mentors who know exactly what the examiner is looking for.',
      button_label: 'Get Your Mentored Tests Now!',
      button_link: '#pricing',
      footer_text: 'Join 500+ students who have already changed their exam approach.',
    },
  },
};
