// Shared constants used across Attendance, Marks, MDM, Promotion pages

export const CLASS_OPTIONS = [
    'Pre-Primary', '1', '2', '3', '4', '5', '6', '7', '8', '9', '10', '11', '12',
    'I', 'II', 'III', 'IV', 'V', 'VI', 'VII', 'VIII', 'IX', 'X', 'XI', 'XII'
];

export const SECTION_OPTIONS = ['A', 'B', 'C', 'D'];

// Same list used for roman-numeral classes in promotionController & student management
export const NEXT_CLASS: Record<string, string> = {
    'Pre-Primary': '1',
    '1': '2', '2': '3', '3': '4', '4': '5', '5': '6', '6': '7', '7': '8', '8': '9', '9': '10', '10': '11', '11': '12', '12': 'Alumni',
    'I': 'II', 'II': 'III', 'III': 'IV', 'IV': 'V', 'V': 'VI', 'VI': 'VII', 'VII': 'VIII', 'VIII': 'IX', 'IX': 'X', 'X': 'XI', 'XI': 'XII', 'XII': 'Alumni',
};

export const CURRENT_SESSION = (() => {
    const now = new Date();
    const year = now.getFullYear();
    const month = now.getMonth(); // 0-indexed, April = 3
    // Indian academic year: April–March
    const startYear = month >= 3 ? year : year - 1;
    return `${startYear}-${startYear + 1}`;
})();
