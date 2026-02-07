import React, { useState, useRef } from 'react';
import { Upload, X, Image as ImageIcon, Star } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/use-toast';

const ImageUpload = ({ images = [], onImagesChange, maxImages = 5, profileId }) => {
    const [uploadedImages, setUploadedImages] = useState(images);
    const [isDragging, setIsDragging] = useState(false);

    // Sync state with props
    React.useEffect(() => {
        setUploadedImages(images);
    }, [images]);
    const [isUploading, setIsUploading] = useState(false);
    const fileInputRef = useRef(null);
    const { toast } = useToast();

    const getFullImageUrl = (url) => {
        if (!url) return '';
        if (url.startsWith('http')) return url;
        return `http://localhost:5000${url}`;
    };

    const handleFileSelect = async (files) => {
        const fileArray = Array.from(files);

        // Check if adding these files would exceed the limit
        if (uploadedImages.length + fileArray.length > maxImages) {
            toast({
                title: 'Too Many Images',
                description: `You can only upload up to ${maxImages} images.`,
                variant: 'destructive',
            });
            return;
        }

        // Validate file types
        const validFiles = fileArray.filter(file => {
            if (!file.type.startsWith('image/')) {
                toast({
                    title: 'Invalid File Type',
                    description: `${file.name} is not an image file.`,
                    variant: 'destructive',
                });
                return false;
            }
            return true;
        });

        if (validFiles.length === 0) return;

        setIsUploading(true);

        try {
            // Create FormData for file upload
            const formData = new FormData();
            validFiles.forEach(file => {
                formData.append('photos', file);
            });

            // Get auth token
            const token = localStorage.getItem('authToken');

            // Upload to backend API
            const response = await fetch(`http://localhost:5000/api/profiles/${profileId}/upload-images`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`
                },
                body: formData
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.message || 'Upload failed');
            }

            // Add uploaded images to state
            const newImages = data.data.map(img => ({
                id: img.id,
                url: img.url, // Store relative path
                isPrimary: img.isPrimary,
                uploadedAt: new Date().toISOString()
            }));

            const updatedImages = [...uploadedImages, ...newImages];
            setUploadedImages(updatedImages);
            onImagesChange?.(updatedImages);

            toast({
                title: 'Images Uploaded',
                description: `${newImages.length} image(s) uploaded successfully.`,
            });
        } catch (error) {
            console.error('Upload error:', error);
            toast({
                title: 'Upload Failed',
                description: error.message || 'Failed to upload images. Please try again.',
                variant: 'destructive',
            });
        } finally {
            setIsUploading(false);
        }
    };

    const handleDrop = (e) => {
        e.preventDefault();
        setIsDragging(false);
        handleFileSelect(e.dataTransfer.files);
    };

    const handleDragOver = (e) => {
        e.preventDefault();
        setIsDragging(true);
    };

    const handleDragLeave = () => {
        setIsDragging(false);
    };

    const handleClick = () => {
        fileInputRef.current?.click();
    };

    const handleDelete = async (imageId) => {
        try {
            // Get auth token
            const token = localStorage.getItem('authToken');

            // Call backend API to delete photo
            const response = await fetch(`http://localhost:5000/api/profiles/${profileId}/photos/${imageId}`, {
                method: 'DELETE',
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.message || 'Failed to delete photo');
            }

            // Remove from local state
            const updatedImages = uploadedImages.filter(img => img.id !== imageId);

            // If we deleted the primary image, make the first remaining image primary
            if (updatedImages.length > 0 && !updatedImages.some(img => img.isPrimary)) {
                updatedImages[0].isPrimary = true;
            }

            setUploadedImages(updatedImages);
            onImagesChange?.(updatedImages);

            toast({
                title: 'Image Deleted',
                description: 'Image removed successfully.',
            });
        } catch (error) {
            console.error('Delete error:', error);
            toast({
                title: 'Delete Failed',
                description: error.message || 'Failed to delete image. Please try again.',
                variant: 'destructive',
            });
        }
    };

    const handleSetPrimary = (imageId) => {
        const updatedImages = uploadedImages.map(img => ({
            ...img,
            isPrimary: img.id === imageId
        }));

        setUploadedImages(updatedImages);
        onImagesChange?.(updatedImages);

        toast({
            title: 'Primary Image Set',
            description: 'This image will be shown as your profile picture.',
        });
    };

    return (
        <div className="space-y-4">
            {/* Upload Area */}
            {Array.isArray(uploadedImages) && uploadedImages.length < maxImages && (
                <div
                    onClick={!isUploading ? handleClick : undefined}
                    onDrop={!isUploading ? handleDrop : undefined}
                    onDragOver={!isUploading ? handleDragOver : undefined}
                    onDragLeave={!isUploading ? handleDragLeave : undefined}
                    className={`
            border-2 border-dashed rounded-lg p-8 text-center transition-all
            ${isUploading
                            ? 'border-gray-300 bg-gray-50 cursor-not-allowed'
                            : isDragging
                                ? 'border-maroon bg-gold/10 scale-105 cursor-pointer'
                                : 'border-gold hover:border-maroon hover:bg-cream/50 cursor-pointer'
                        }
          `}
                >
                    <input
                        ref={fileInputRef}
                        type="file"
                        accept="image/*"
                        multiple
                        onChange={(e) => handleFileSelect(e.target.files)}
                        className="hidden"
                        disabled={isUploading}
                    />

                    {isUploading ? (
                        <>
                            <div className="h-12 w-12 mx-auto mb-4 flex items-center justify-center">
                                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-maroon"></div>
                            </div>
                            <p className="text-maroon font-semibold mb-2">
                                Uploading images...
                            </p>
                            <p className="text-sm text-maroon/60">
                                Please wait while we upload your images
                            </p>
                        </>
                    ) : (
                        <>
                            <Upload className="h-12 w-12 mx-auto mb-4 text-gold" />
                            <p className="text-maroon font-semibold mb-2">
                                Click to upload or drag and drop
                            </p>
                            <p className="text-sm text-maroon/60">
                                PNG, JPG, GIF up to 10MB ({uploadedImages.length}/{maxImages} images)
                            </p>
                        </>
                    )}
                </div>
            )}

            {/* Image Grid */}
            {Array.isArray(uploadedImages) && uploadedImages.length > 0 && (
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                    {uploadedImages.filter(img => img && img.id && img.url).map((image) => (
                        <div
                            key={image.id}
                            className="relative group aspect-square rounded-lg overflow-hidden border-2 border-gold/20"
                        >
                            <img
                                src={getFullImageUrl(image.url)}
                                alt="Profile"
                                className="w-full h-full object-cover"
                                onError={(e) => { e.target.src = 'https://via.placeholder.com/150'; }}
                            />

                            {/* Primary Badge */}
                            {image.isPrimary && (
                                <div className="absolute top-2 left-2 bg-gold text-maroon px-2 py-1 rounded-full text-xs font-bold flex items-center gap-1">
                                    <Star className="h-3 w-3 fill-current" />
                                    Primary
                                </div>
                            )}

                            {/* Overlay with Actions */}
                            <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                                {!image.isPrimary && (
                                    <Button
                                        size="sm"
                                        variant="outline"
                                        className="bg-white/90 hover:bg-white text-maroon border-gold"
                                        onClick={() => handleSetPrimary(image.id)}
                                    >
                                        <Star className="h-4 w-4" />
                                    </Button>
                                )}
                                <Button
                                    size="sm"
                                    variant="destructive"
                                    className="bg-red-500 hover:bg-red-600"
                                    onClick={() => handleDelete(image.id)}
                                >
                                    <X className="h-4 w-4" />
                                </Button>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {(!Array.isArray(uploadedImages) || uploadedImages.length === 0) && (
                <div className="text-center py-8 border-2 border-dashed border-gold/30 rounded-lg">
                    <ImageIcon className="h-12 w-12 mx-auto mb-3 text-gold/50" />
                    <p className="text-maroon/60">No images uploaded yet</p>
                </div>
            )}
        </div>
    );
};

export default ImageUpload;
