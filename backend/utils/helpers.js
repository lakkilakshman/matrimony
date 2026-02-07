// Helper function to calculate age from date of birth
const calculateAge = (dateOfBirth) => {
    if (!dateOfBirth) return null;

    const dob = new Date(dateOfBirth);
    const today = new Date();
    let age = today.getFullYear() - dob.getFullYear();
    const monthDiff = today.getMonth() - dob.getMonth();

    // Adjust age if birthday hasn't occurred this year
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < dob.getDate())) {
        age--;
    }

    return age;
};

// Format date for MySQL
const formatDateForMySQL = (date) => {
    if (!date) return null;
    const d = new Date(date);
    return d.toISOString().split('T')[0];
};

// Sanitize string input
const sanitizeString = (str) => {
    if (!str) return null;
    return str.trim();
};

module.exports = {
    calculateAge,
    formatDateForMySQL,
    sanitizeString
};
