-- Add unique constraints to prevent duplicate entries for the same profile
-- First, clean up existing duplicates (keep the one with the highest ID as it's likely the newest/most complete)

-- 1. CLEANUP education_details
DELETE e1 FROM education_details e1
INNER JOIN education_details e2 
WHERE e1.id < e2.id AND e1.profile_id = e2.profile_id;

ALTER TABLE education_details ADD UNIQUE KEY unique_profile_edu (profile_id);

-- 2. CLEANUP professional_details
DELETE p1 FROM professional_details p1
INNER JOIN professional_details p2 
WHERE p1.id < p2.id AND p1.profile_id = p2.profile_id;

ALTER TABLE professional_details ADD UNIQUE KEY unique_profile_pro (profile_id);

-- 3. CLEANUP location_details
DELETE l1 FROM location_details l1
INNER JOIN location_details l2 
WHERE l1.id < l2.id AND l1.profile_id = l2.profile_id;

ALTER TABLE location_details ADD UNIQUE KEY unique_profile_loc (profile_id);

-- 4. CLEANUP family_details
DELETE f1 FROM family_details f1
INNER JOIN family_details f2 
WHERE f1.id < f2.id AND f1.profile_id = f2.profile_id;

ALTER TABLE family_details ADD UNIQUE KEY unique_profile_fam (profile_id);

-- 5. CLEANUP astrology_details
DELETE a1 FROM astrology_details a1
INNER JOIN astrology_details a2 
WHERE a1.id < a2.id AND a1.profile_id = a2.profile_id;

ALTER TABLE astrology_details ADD UNIQUE KEY unique_profile_ast (profile_id);
