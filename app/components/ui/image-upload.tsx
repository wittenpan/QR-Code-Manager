"use client";

import { useCallback, useState } from "react";
import { uploadImage } from "../../lib/storage";
import Image from "next/image";
import { Button } from "./button";
import { toast } from "./use-toast";

interface ImageUploadProps {
  value: { url: string }[]; // Change this to match MenuItemDialog's format
  onChangeImages: (images: { url: string }[]) => void; // Change to accept array of image objects
  maxImages?: number;
}

export function ImageUpload({
  value = [],
  onChangeImages,
  maxImages = 5,
}: ImageUploadProps) {
  const [isUploading, setIsUploading] = useState(false);

  const handleUpload = useCallback(
    async (event: React.ChangeEvent<HTMLInputElement>) => {
      try {
        setIsUploading(true);
        const file = event.target.files?.[0];
        if (!file) return;

        // Validate file type and size
        const validTypes = ["image/jpeg", "image/png", "image/webp"];
        if (!validTypes.includes(file.type)) {
          throw new Error(
            "Invalid file type. Please upload a JPEG, PNG, or WebP image.",
          );
        }

        const maxSize = 5 * 1024 * 1024; // 5MB
        if (file.size > maxSize) {
          throw new Error(
            "File size too large. Please upload an image under 5MB.",
          );
        }

        const imageUrl = await uploadImage(file);
        onChangeImages([...value, { url: imageUrl }]); // Update this line

        toast({
          title: "Success",
          description: "Image uploaded successfully",
        });
      } catch (error) {
        console.error("Error uploading image:", error);
        toast({
          title: "Error",
          description:
            error instanceof Error ? error.message : "Failed to upload image",
          variant: "destructive",
        });
      } finally {
        setIsUploading(false);
        const input = document.getElementById(
          "image-upload",
        ) as HTMLInputElement;
        if (input) input.value = "";
      }
    },
    [value, onChangeImages],
  );

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-3 gap-4">
        {value.map((image, index) => (
          <div key={image.url} className="relative aspect-square">
            <Image
              src={image.url}
              alt={`Uploaded image ${index + 1}`}
              fill
              className="object-cover rounded-md"
            />
            <Button
              variant="destructive"
              size="sm"
              className="absolute top-2 right-2"
              onClick={() => 
                onChangeImages(value.filter((img) => img.url !== image.url))
              }
            >
              Remove
            </Button>
          </div>
        ))}
      </div>

      {value.length < maxImages && (
        <div>
          <input
            type="file"
            accept="image/jpeg,image/png,image/webp"
            onChange={handleUpload}
            disabled={isUploading}
            className="hidden"
            id="image-upload"
          />
          <label htmlFor="image-upload">
            <Button
              variant="outline"
              disabled={isUploading}
              className="cursor-pointer"
              asChild
            >
              <span>{isUploading ? "Uploading..." : "Upload Image"}</span>
            </Button>
          </label>
        </div>
      )}
    </div>
  );
}
