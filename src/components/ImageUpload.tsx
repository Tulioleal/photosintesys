import { useRef } from "react";
import { Button } from "@/components/ui/button";
import { Camera, Upload } from "lucide-react";

interface ImageUploadProps {
  onImageSelect: (file: File) => void;
  loading?: boolean;
}

export function ImageUpload({ onImageSelect, loading }: ImageUploadProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const cameraInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) onImageSelect(file);
  };

  return (
    <div className="flex gap-2">
      <Button
        variant="outline"
        onClick={() => fileInputRef.current?.click()}
        disabled={loading}
        className="flex-1"
      >
        <Upload className="w-4 h-4 mr-2" />
        Upload Image
      </Button>

      <Button
        variant="outline"
        onClick={() => cameraInputRef.current?.click()}
        disabled={loading}
        className="flex-1"
      >
        <Camera className="w-4 h-4 mr-2" />
        Take Photo
      </Button>

      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleFileSelect}
        className="hidden"
        aria-label="Upload plant image from gallery"
      />

      <input
        ref={cameraInputRef}
        type="file"
        accept="image/*"
        capture="environment"
        onChange={handleFileSelect}
        className="hidden"
        aria-label="Take photo of plant with camera"
      />
    </div>
  );
}
