export const STUDY_CLASSES = [
    { value: '9th', label: 'Class 9' },
    { value: '10th', label: 'Class 10' },
    { value: '11th', label: 'Class 11' },
    { value: '12th', label: 'Class 12' },
    { value: 'ecat', label: 'ECAT' }
];

export const STUDY_SUBJECTS = [
    { key: 'Urdu', label: 'Urdu' },
    { key: 'English', label: 'English' },
    { key: 'Mathematics', label: 'Math' },
    { key: 'Islamiat', label: 'Islamiyat' },
    { key: 'Biology', label: 'Biology' },
    { key: 'Physics', label: 'Physics' },
    { key: 'Chemistry', label: 'Chemistry' },
    { key: 'Computer Science', label: 'Computer' },
    { key: 'Tarjma-tul-Quran', label: 'Tarjma-tul-Quran' },
    { key: 'Pak Studies', label: 'Pak-Studies' },
    { key: 'ECAT-Prep', label: 'ECAT-Prep' },
    { key: 'Scheme-of-Study', label: 'Scheme-of-Study' }
];

export const STUDY_CATEGORIES = [
    { key: 'past_papers', label: 'Past Papers' },
    { key: 'mcqs', label: 'MCQs' },
    { key: 'kamiyab_series', label: 'Kamiyab Series' },
    { key: 'notes', label: 'Notes' },
    { key: 'paper_presentation', label: 'Paper Presentation' },
    { key: 'exercise_notes', label: 'Exercise Notes' },
    { key: 'short_questions', label: 'Short Questions' },
    { key: 'guess_paper', label: 'Guess Paper' },
    { key: 'ecat_unsolved_tests', label: 'ECAT Unsolved Tests' },
    { key: 'postmortem_series', label: 'Postmortem Series' },
    { key: 'book_lessons', label: 'Book Lessons' },
    { key: 'paid_test_series', label: 'Paid Test Series' }
];

export const STUDY_PAID_TIERS = [
    { key: 'none', label: 'None (Default)' },
    { key: 'demo', label: 'Demo Subtype' },
    { key: 'premium', label: 'Premium Subtype' }
];

// Helper to get labels from keys
export const getSubjectLabel = (key) => STUDY_SUBJECTS.find(s => s.key === key)?.label || key;
export const getCategoryLabel = (key) => STUDY_CATEGORIES.find(c => c.key === key)?.label || key;
export const getClassLabel = (val) => STUDY_CLASSES.find(c => c.value === val)?.label || val;
export const getTierLabel = (key) => STUDY_PAID_TIERS.find(t => t.key === key)?.label || key;
