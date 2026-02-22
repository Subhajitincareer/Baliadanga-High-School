// Shared constants used across Attendance, Marks, MDM, Promotion pages

export const CLASS_OPTIONS = ['I', 'II', 'III', 'IV', 'V', 'VI', 'VII', 'VIII', 'IX', 'X', 'XI', 'XII'];
export const SECTION_OPTIONS = ['A', 'B', 'C', 'D'];

// Same list used for roman-numeral classes in promotionController & student management
export const NEXT_CLASS: Record<string, string> = {
    'I': 'II',
    'II': 'III',
    'III': 'IV',
    'IV': 'V',
    'V': 'VI',
    'VI': 'VII',
    'VII': 'VIII',
    'VIII': 'IX',
    'IX': 'X',
    'X': 'XI',
    'XI': 'XII',
    'XII': 'Alumni',
};

export const CURRENT_SESSION = (() => {
    const now = new Date();
    const year = now.getFullYear();
    const month = now.getMonth(); // 0-indexed, April = 3
    // Indian academic year: April–March
    const startYear = month >= 3 ? year : year - 1;
    return `${startYear}-${startYear + 1}`;
})();
