import { useState, useRef, useCallback } from "react";
import { Camera, Upload, X, Image as ImageIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import axios from "axios";

interface ImageUploadProps {
  value?: string;
  onChange: (url: string) => void;
  label?: string;
  disabled?: boolean;
}

export default function ImageUpload({
  value,
  onChange,
  label = "Photo",
  disabled = false,
}: ImageUploadProps) {
  const [uploading, setUploading] = useState(false);
  const [showCamera, setShowCamera] = useState(false);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  // Start camera
  const startCamera = useCallback(async () => {
    try {
      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: "user", width: 640, height: 480 },
        audio: false,
      });
      
      setStream(mediaStream);
      setShowCamera(true);
      
      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
      }
    } catch (error) {
      toast({
        title: "Camera Error",
        description: "Could not access camera. Please check permissions.",
        variant: "destructive",
      });
    }
  }, [toast]);

  // Stop camera
  const stopCamera = useCallback(() => {
    if (stream) {
      stream.getTracks().forEach((track) => track.stop());
      setStream(null);
    }
    setShowCamera(false);
  }, [stream]);

  // Capture photo from camera
  const capturePhoto = useCallback(async () => {
    if (!videoRef.current || !canvasRef.current) return;

    const video = videoRef.current;
    const canvas = canvasRef.current;
    const context = canvas.getContext("2d");

    if (!context) return;

    // Set canvas size to match video
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;

    // Draw video frame to canvas
    context.drawImage(video, 0, 0, canvas.width, canvas.height);

    // Convert canvas to blob
    canvas.toBlob(async (blob) => {
      if (!blob) return;

      // Upload the blob
      await uploadFile(blob, "camera-capture.jpg");
      stopCamera();
    }, "image/jpeg", 0.9);
  }, [stopCamera]);

  // Upload file to server
  const uploadFile = async (file: Blob | File, filename?: string) => {
    setUploading(true);

    try {
      const formData = new FormData();
      formData.append("photo", file, filename || (file as File).name);

      const token = localStorage.getItem("token");
      const response = await axios.post(
        `${import.meta.env.VITE_API_URL || "http://localhost:3001"}/api/upload/beneficiary-photo`,
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const imageUrl = `${import.meta.env.VITE_API_URL || "http://localhost:3001"}${response.data.url}`;
      onChange(imageUrl);
      
      toast({
        title: "Success",
        description: "Photo uploaded successfully",
      });
    } catch (error: any) {
      toast({
        title: "Upload Failed",
        description: error.response?.data?.error || "Failed to upload photo",
        variant: "destructive",
      });
    } finally {
      setUploading(false);
    }
  };

  // Handle file input change
  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith("image/")) {
      toast({
        title: "Invalid File",
        description: "Please select an image file",
        variant: "destructive",
      });
      return;
    }

    // Validate file size (5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast({
        title: "File Too Large",
        description: "Please select an image smaller than 5MB",
        variant: "destructive",
      });
      return;
    }

    await uploadFile(file);
  };

  // Remove photo
  const handleRemove = () => {
    onChange("");
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  return (
    <div className="space-y-2 inline-flex flex-col justify-start">
      <Label>{label}</Label>
      
      {/* Preview */}
      {value && !showCamera && (
        <div className="relative w-48 h-48 border-2 border-dashed rounded-lg overflow-hidden">
          <img
            src={value}
            alt="Preview"
            className="w-full h-full object-cover"
          />
          <Button
            type="button"
            variant="destructive"
            size="icon"
            className="absolute top-2 right-2"
            onClick={handleRemove}
            disabled={disabled}
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
      )}

      {/* Camera View */}
      {showCamera && (
        <div className="space-y-2">
          <div className="relative w-full max-w-md border-2 border-dashed rounded-lg overflow-hidden">
            <video
              ref={videoRef}
              autoPlay
              playsInline
              className="w-full"
            />
            <canvas ref={canvasRef} className="hidden" />
          </div>
          <div className="flex gap-2">
            <Button
              type="button"
              onClick={capturePhoto}
              disabled={uploading}
            >
              <Camera className="h-4 w-4 mr-2" />
              Capture Photo
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={stopCamera}
              disabled={uploading}
            >
              Cancel
            </Button>
          </div>
        </div>
      )}

      {/* Upload Buttons */}
      {!value && !showCamera && (
        <div className="grid grid-cols-1 justify-items-stretch sm:grid-cols-2 gap-2 w-auto">
          <Button
            type="button"
            variant="outline"
            onClick={() => fileInputRef.current?.click()}
            disabled={disabled || uploading}
          >
            <Upload className="h-4 w-4 mr-2" />
            Upload Photo
          </Button>
          <Button
            type="button"
            variant="outline"
            onClick={startCamera}
            disabled={disabled || uploading}
          >
            <Camera className="h-4 w-4 mr-2" />
            Take Photo
          </Button>
        </div>
      )}

      {/* Hidden file input */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleFileChange}
        className="hidden"
        disabled={disabled}
      />

      {uploading && (
        <p className="text-sm text-muted-foreground">Uploading...</p>
      )}
    </div>
  );
}
