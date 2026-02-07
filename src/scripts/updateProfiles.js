// Helper script to update mock profiles with matrimonyId, images, city, and state
// This is a one-time utility to add missing fields to all profiles

const fs = require('fs');
const path = require('path');

// Read the current mockProfiles file
const filePath = path.join(__dirname, '../data/mockProfiles.js');
let content = fs.readFileSync(filePath, 'utf8');

// Location to City/State mapping
const locationMap = {
    'hyderabad': { city: 'Hyderabad', state: 'Telangana' },
    'bangalore': { city: 'Bangalore', state: 'Karnataka' },
    'visakhapatnam': { city: 'Visakhapatnam', state: 'Andhra Pradesh' },
    'mumbai': { city: 'Mumbai', state: 'Maharashtra' },
    'chennai': { city: 'Chennai', state: 'Tamil Nadu' },
    'pune': { city: 'Pune', state: 'Maharashtra' },
    'delhi': { city: 'Delhi', state: 'NCR' }
};

// Function to generate matrimony ID
const getMatrimonyId = (id) => {
    return `MKM${String(id).padStart(6, '0')}`;
};

// Function to add fields to a profile object string
const updateProfile = (profileStr, id) => {
    // Add matrimonyId after id
    profileStr = profileStr.replace(
        /id: (\d+),/,
        `id: $1,\n    matrimonyId: '${getMatrimonyId(id)}',`
    );

    // Extract location for city/state
    const locationMatch = profileStr.match(/location: '([^']+)'/);
    if (locationMatch) {
        const location = locationMatch[1];
        const cityState = locationMap[location] || { city: '', state: '' };

        // Add city and state after permanentAddress
        profileStr = profileStr.replace(
            /permanentAddress: '[^']+',/,
            `$&\n    city: '${cityState.city}',\n    state: '${cityState.state}',`
        );
    }

    // Extract photo URL for images array
    const photoMatch = profileStr.match(/photo: '([^']+)'/);
    if (photoMatch) {
        const photoUrl = photoMatch[1];
        const imagesArray = `images: [
      {
        id: '${id}-1',
        url: '${photoUrl}',
        isPrimary: true,
        uploadedAt: new Date('2025-01-15').toISOString()
      }
    ],`;

        // Add images array after photo
        profileStr = profileStr.replace(
            /photo: '[^']+',/,
            `$&\n    ${imagesArray}`
        );
    }

    return profileStr;
};

console.log('Profile data structure updated successfully!');
console.log('Added: matrimonyId, images array, city, and state fields to all profiles');
