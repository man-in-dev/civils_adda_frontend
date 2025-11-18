// Mock test data for frontend-only operation

export type Question = {
  id: string;
  text: string;
  options: string[];
  answer: number; // index of correct answer
};

export type TestDetail = {
  test: {
    id: string;
    title: string;
    description: string;
    durationMinutes: number;
    price: number;
  };
  questions: Question[];
};

export const mockTestsData: Record<string, TestDetail> = {
  'polity-basics-1': {
    test: {
      id: 'polity-basics-1',
      title: 'Polity Basics - Set 1',
      description: 'Fundamental questions on Indian Polity and Constitution',
      durationMinutes: 20,
      price: 0,
    },
    questions: [
      {
        id: 'q1',
        text: 'Which article defines India as a Union of States?',
        options: ['Art 1', 'Art 2', 'Art 3', 'Art 5'],
        answer: 0,
      },
      {
        id: 'q2',
        text: 'Who is the head of the Union Executive?',
        options: ['Prime Minister', 'President', 'Cabinet', 'Parliament'],
        answer: 1,
      },
      {
        id: 'q3',
        text: 'How many fundamental rights are guaranteed by the Indian Constitution?',
        options: ['5', '6', '7', '8'],
        answer: 1,
      },
      {
        id: 'q4',
        text: 'Who appoints the Chief Justice of India?',
        options: ['Prime Minister', 'President', 'Vice President', 'Speaker'],
        answer: 1,
      },
      {
        id: 'q5',
        text: 'What is the maximum strength of Lok Sabha?',
        options: ['540', '545', '550', '552'],
        answer: 3,
      },
    ],
  },
  'polity-advanced-1': {
    test: {
      id: 'polity-advanced-1',
      title: 'Polity Advanced - Constitutional Provisions',
      description: 'Advanced level questions on constitutional articles and amendments',
      durationMinutes: 25,
      price: 299,
    },
    questions: [
      {
        id: 'q1',
        text: 'Which amendment added fundamental duties to the Constitution?',
        options: ['42nd', '44th', '73rd', '86th'],
        answer: 0,
      },
      {
        id: 'q2',
        text: 'Article 370 is related to which state?',
        options: ['Punjab', 'Jammu & Kashmir', 'Assam', 'Nagaland'],
        answer: 1,
      },
      {
        id: 'q3',
        text: 'Who has the power to dissolve Lok Sabha?',
        options: ['President', 'Prime Minister', 'Speaker', 'Election Commission'],
        answer: 0,
      },
      {
        id: 'q4',
        text: 'How many schedules are there in Indian Constitution?',
        options: ['10', '11', '12', '13'],
        answer: 2,
      },
    ],
  },
  'history-moderate-1': {
    test: {
      id: 'history-moderate-1',
      title: 'Modern History - Set 1',
      description: 'Moderate level questions from Modern India (1857-1947)',
      durationMinutes: 20,
      price: 199,
    },
    questions: [
      {
        id: 'q1',
        text: 'When did the Revolt of 1857 start?',
        options: ['May 10, 1857', 'June 10, 1857', 'July 10, 1857', 'August 10, 1857'],
        answer: 0,
      },
      {
        id: 'q2',
        text: 'Who was the first Governor-General of India?',
        options: ['Warren Hastings', 'Lord Cornwallis', 'Lord Wellesley', 'Lord Dalhousie'],
        answer: 0,
      },
      {
        id: 'q3',
        text: 'In which year was the Indian National Congress founded?',
        options: ['1885', '1886', '1887', '1888'],
        answer: 0,
      },
      {
        id: 'q4',
        text: 'Who is known as the "Father of the Nation"?',
        options: ['Jawaharlal Nehru', 'Mahatma Gandhi', 'Subhash Chandra Bose', 'Bhagat Singh'],
        answer: 1,
      },
    ],
  },
  'history-ancient-1': {
    test: {
      id: 'history-ancient-1',
      title: 'Ancient History - Indus Valley Civilization',
      description: 'Questions on ancient Indian history and civilizations',
      durationMinutes: 15,
      price: 149,
    },
    questions: [
      {
        id: 'q1',
        text: 'Which is the largest site of Indus Valley Civilization?',
        options: ['Mohenjo-Daro', 'Harappa', 'Lothal', 'Kalibangan'],
        answer: 0,
      },
      {
        id: 'q2',
        text: 'The Great Bath is found at which site?',
        options: ['Harappa', 'Mohenjo-Daro', 'Lothal', 'Kalibangan'],
        answer: 1,
      },
      {
        id: 'q3',
        text: 'What was the main occupation of people in Indus Valley Civilization?',
        options: ['Agriculture', 'Trade', 'Fishing', 'All of the above'],
        answer: 3,
      },
    ],
  },
  'economy-basics-1': {
    test: {
      id: 'economy-basics-1',
      title: 'Indian Economy - Basics',
      description: 'Fundamental concepts of Indian economy and planning',
      durationMinutes: 20,
      price: 199,
    },
    questions: [
      {
        id: 'q1',
        text: 'When was the Planning Commission established?',
        options: ['1950', '1951', '1952', '1953'],
        answer: 0,
      },
      {
        id: 'q2',
        text: 'What is the full form of GDP?',
        options: ['Gross Domestic Product', 'Gross Development Product', 'Great Domestic Product', 'Growth Domestic Product'],
        answer: 0,
      },
      {
        id: 'q3',
        text: 'Which is the largest sector of Indian economy?',
        options: ['Agriculture', 'Industry', 'Services', 'Manufacturing'],
        answer: 2,
      },
      {
        id: 'q4',
        text: 'What is the base year for GDP calculation (as of 2023)?',
        options: ['2010-11', '2011-12', '2015-16', '2019-20'],
        answer: 1,
      },
    ],
  },
  'geography-india-1': {
    test: {
      id: 'geography-india-1',
      title: 'Geography of India - Physical Features',
      description: 'Questions on physical geography, rivers, mountains of India',
      durationMinutes: 18,
      price: 179,
    },
    questions: [
      {
        id: 'q1',
        text: 'Which is the longest river in India?',
        options: ['Ganga', 'Yamuna', 'Godavari', 'Narmada'],
        answer: 0,
      },
      {
        id: 'q2',
        text: 'Which is the highest peak in India?',
        options: ['Mount Everest', 'Kanchenjunga', 'Nanda Devi', 'K2'],
        answer: 1,
      },
      {
        id: 'q3',
        text: 'How many states are there in India?',
        options: ['27', '28', '29', '30'],
        answer: 1,
      },
      {
        id: 'q4',
        text: 'Which state has the longest coastline in India?',
        options: ['Gujarat', 'Maharashtra', 'Tamil Nadu', 'Kerala'],
        answer: 0,
      },
    ],
  },
  'science-physics-1': {
    test: {
      id: 'science-physics-1',
      title: 'Science - Physics Basics',
      description: 'Fundamental questions on physics concepts',
      durationMinutes: 15,
      price: 149,
    },
    questions: [
      {
        id: 'q1',
        text: 'What is the unit of force?',
        options: ['Joule', 'Newton', 'Watt', 'Pascal'],
        answer: 1,
      },
      {
        id: 'q2',
        text: 'What is the speed of light in vacuum?',
        options: ['3 x 10^8 m/s', '3 x 10^6 m/s', '3 x 10^10 m/s', '3 x 10^5 m/s'],
        answer: 0,
      },
      {
        id: 'q3',
        text: 'Who discovered gravity?',
        options: ['Einstein', 'Newton', 'Galileo', 'Tesla'],
        answer: 1,
      },
    ],
  },
  'science-chemistry-1': {
    test: {
      id: 'science-chemistry-1',
      title: 'Science - Chemistry Basics',
      description: 'Basic chemistry concepts and periodic table',
      durationMinutes: 15,
      price: 149,
    },
    questions: [
      {
        id: 'q1',
        text: 'What is the chemical symbol for Gold?',
        options: ['Go', 'Gd', 'Au', 'Ag'],
        answer: 2,
      },
      {
        id: 'q2',
        text: 'How many elements are in the periodic table?',
        options: ['116', '118', '120', '122'],
        answer: 1,
      },
      {
        id: 'q3',
        text: 'What is the pH of pure water?',
        options: ['6', '7', '8', '9'],
        answer: 1,
      },
    ],
  },
  'reasoning-logical-1': {
    test: {
      id: 'reasoning-logical-1',
      title: 'Logical Reasoning - Set 1',
      description: 'Logical reasoning and analytical questions',
      durationMinutes: 20,
      price: 199,
    },
    questions: [
      {
        id: 'q1',
        text: 'If all roses are flowers and some flowers are red, then:',
        options: ['All roses are red', 'Some roses are red', 'No conclusion', 'All red things are roses'],
        answer: 1,
      },
      {
        id: 'q2',
        text: 'What comes next: 2, 4, 8, 16, ?',
        options: ['24', '32', '28', '30'],
        answer: 1,
      },
      {
        id: 'q3',
        text: 'Complete: A is to B as C is to ?',
        options: ['A', 'B', 'C', 'Cannot determine'],
        answer: 3,
      },
    ],
  },
  'current-affairs-2024-1': {
    test: {
      id: 'current-affairs-2024-1',
      title: 'Current Affairs - 2024',
      description: 'Important current affairs and general knowledge',
      durationMinutes: 15,
      price: 179,
    },
    questions: [
      {
        id: 'q1',
        text: 'Which country hosted the G20 Summit in 2023?',
        options: ['India', 'Brazil', 'Indonesia', 'Japan'],
        answer: 0,
      },
      {
        id: 'q2',
        text: 'Who won the Nobel Peace Prize in 2023?',
        options: ['Narges Mohammadi', 'Maria Ressa', 'Malala Yousafzai', 'Greta Thunberg'],
        answer: 0,
      },
    ],
  },
};

export function getTestData(testId: string): TestDetail | null {
  return mockTestsData[testId] || null;
}

