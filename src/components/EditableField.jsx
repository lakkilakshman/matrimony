// Helper component for editable profile fields
import React from 'react';

export const EditableField = ({ label, value, isEditing, onChange, type = 'text', options = null, className = '' }) => {
    return (
        <div className={className}>
            <label className="text-maroon/60 block mb-1">{label}</label>
            {isEditing ? (
                options ? (
                    <select
                        value={value}
                        onChange={(e) => onChange(e.target.value)}
                        className="w-full px-3 py-2 border-2 border-gold rounded-lg focus:outline-none focus:ring-2 focus:ring-maroon text-maroon"
                    >
                        {options.map(opt => (
                            <option key={opt.value} value={opt.value}>{opt.label}</option>
                        ))}
                    </select>
                ) : type === 'textarea' ? (
                    <textarea
                        value={value || ''}
                        onChange={(e) => onChange(e.target.value)}
                        rows={4}
                        className="w-full px-3 py-2 border-2 border-gold rounded-lg focus:outline-none focus:ring-2 focus:ring-maroon text-maroon"
                    />
                ) : (
                    <input
                        type={type}
                        value={value || ''}
                        onChange={(e) => onChange(type === 'number' ? parseInt(e.target.value) || 0 : e.target.value)}
                        className="w-full px-3 py-2 border-2 border-gold rounded-lg focus:outline-none focus:ring-2 focus:ring-maroon text-maroon"
                    />
                )
            ) : (
                <p className="font-semibold text-maroon">
                    {value || 'N/A'}
                </p>
            )}
        </div>
    );
};
