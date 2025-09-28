"use client";

import React, { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Upload, X, Image as ImageIcon } from "lucide-react";
import { createClient } from "@/libs/supabase/client";
import { log } from "@/libs/log";
import { ImageUploadResult } from "@/types/gym";

interface ImageUploadProps {
  label: string;
  currentUrl?: string;
  onUpload: (result: ImageUploadResult) => void;
  gymId?: string;
  type: "logo" | "cover";
  disabled?: boolean;
}

export function ImageUpload({
  label,
  currentUrl,
  onUpload,
  gymId,
  type,
  disabled = false,
}: ImageUploadProps) {
  const [isUploading, setIsUploading] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(
    currentUrl || null
  );
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = async (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith("image/")) {
      onUpload({
        success: false,
        error: "Please select an image file",
      });
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      onUpload({
        success: false,
        error: "Image must be less than 5MB",
      });
      return;
    }

    setIsUploading(true);

    try {
      // Create preview
      const reader = new FileReader();
      reader.onload = (e) => {
        setPreviewUrl(e.target?.result as string);
      };
      reader.readAsDataURL(file);

      // Upload to Supabase Storage
      const supabase = createClient();
      const fileExt = file.name.split(".").pop();
      const fileName = `${type}-${Date.now()}.${fileExt}`;
      const filePath = gymId ? `gyms/${gymId}/${fileName}` : `temp/${fileName}`;

      const { data, error } = await supabase.storage
        .from("gym-assets")
        .upload(filePath, file, {
          cacheControl: "3600",
          upsert: false,
        });

      if (error) {
        log.error("Error uploading image", {
          error: error.message,
          type,
          gymId,
        });
        onUpload({
          success: false,
          error: "Failed to upload image",
        });
        return;
      }

      // Get public URL
      const { data: urlData } = supabase.storage
        .from("gym-assets")
        .getPublicUrl(filePath);

      log.info("Image uploaded successfully", { type, gymId, filePath });

      onUpload({
        success: true,
        url: urlData.publicUrl,
      });
    } catch (error) {
      log.error("Image upload error", { error, type, gymId });
      onUpload({
        success: false,
        error: "An unexpected error occurred",
      });
    } finally {
      setIsUploading(false);
    }
  };

  const handleRemove = () => {
    setPreviewUrl(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
    onUpload({
      success: true,
      url: undefined,
    });
  };

  const handleClick = () => {
    if (!disabled) {
      fileInputRef.current?.click();
    }
  };

  return (
    <div className="space-y-2">
      <Label htmlFor={`${type}-upload`}>{label}</Label>

      <div className="flex items-center space-x-4">
        {/* Preview */}
        <div className="relative">
          {previewUrl ? (
            <div className="relative">
              <img
                src={previewUrl}
                alt={`${type} preview`}
                className={`object-cover border border-gray-200 rounded-lg ${
                  type === "logo" ? "w-20 h-20" : "w-32 h-20"
                }`}
              />
              {!disabled && (
                <button
                  type="button"
                  onClick={handleRemove}
                  className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600 transition-colors"
                  aria-label="Remove image"
                >
                  <X className="h-3 w-3" />
                </button>
              )}
            </div>
          ) : (
            <div
              className={`flex items-center justify-center border-2 border-dashed border-gray-300 rounded-lg bg-gray-50 ${
                type === "logo" ? "w-20 h-20" : "w-32 h-20"
              }`}
            >
              <ImageIcon className="h-6 w-6 text-gray-400" />
            </div>
          )}
        </div>

        {/* Upload Button */}
        <div className="flex-1">
          <input
            ref={fileInputRef}
            id={`${type}-upload`}
            type="file"
            accept="image/*"
            onChange={handleFileSelect}
            className="hidden"
            disabled={disabled}
          />

          <Button
            type="button"
            variant="outline"
            onClick={handleClick}
            disabled={disabled || isUploading}
            className="w-full"
          >
            {isUploading ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-gray-900 mr-2" />
                Uploading...
              </>
            ) : (
              <>
                <Upload className="h-4 w-4 mr-2" />
                {previewUrl ? "Change Image" : "Upload Image"}
              </>
            )}
          </Button>

          <p className="text-xs text-gray-500 mt-1">PNG, JPG up to 5MB</p>
        </div>
      </div>
    </div>
  );
}
