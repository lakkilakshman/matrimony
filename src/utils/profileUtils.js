// Utility function to generate matrimony ID
export const getMatrimonyId = (profileId) => {
    return `MKM${String(profileId).padStart(6, '0')}`;
};

// Utility function to ensure profile has matrimony ID
export const ensureMatrimonyId = (profile) => {
    if (!profile) return profile;
    if (!profile.matrimonyId && profile.id) {
        return {
            ...profile,
            matrimonyId: getMatrimonyId(profile.id)
        };
    }
    return profile;
};

// Map backend snake_case to frontend camelCase
export const mapProfileFields = (profile) => {
    if (!profile) return null;

    // Create a copy to avoid mutation
    const mapped = { ...profile };

    // Common mappings from DB schema to frontend components
    const mappings = {
        first_name: 'firstName',
        last_name: 'lastName',
        marital_status: 'maritalStatus',
        father_occupation: 'fatherOccupation',
        mother_occupation: 'motherOccupation',
        permanent_address: 'permanentAddress',
        birth_time: 'birthTime',
        birth_place: 'birthPlace',
        education_level: 'education',
        occupation_category: 'occupation',
        annual_income: 'annualIncome',
        profile_photo: 'profilePhoto',
        profile_status: 'profileStatus',
        profile_status: 'profileStatus',
        date_of_birth: 'dateOfBirth',
        interestStatus: 'interestStatus', // Preserve interestStatus
        user_id: 'userId', // Preserve userId
        subscription_plan_name: 'planName', // Map to planName
        subscription_status: 'subscriptionStatus' // Map to subscriptionStatus
    };

    Object.entries(mappings).forEach(([snake, camel]) => {
        if (profile[snake] !== undefined && (profile[camel] === undefined || profile[camel] === null)) {
            mapped[camel] = profile[snake];
        }
    });

    return ensureMatrimonyId(mapped);
};

// Utility function to get primary image from images array
export const getPrimaryImage = (profile) => {
    if (!profile) return '';
    if (profile.images && profile.images.length > 0) {
        const primaryImage = profile.images.find(img => img.isPrimary);
        return primaryImage ? primaryImage.url : profile.images[0].url;
    }
    return profile.profile_photo || profile.profilePhoto || profile.photo || '';
};
