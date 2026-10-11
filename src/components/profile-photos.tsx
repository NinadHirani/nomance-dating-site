"use client";

import { useState, useCallback, useRef } from "react";
import { supabase } from "@/lib/supabase";
import { Button } from "@/components/ui/button";
import { Loader2, Camera, X, GripVertical, Plus, Trash2, AlertCircle, CheckCircle2 } from "lucide-react";
import { toast } from "sonner";
import Cropper, { type Area } from "react-easy-crop";
import { DragDropContext, Droppable, Draggable, type DropResult } from "@hello-pangea/dnd";
import { motion, AnimatePresence } from "framer-motion";

interface PhotoUploadProps {
  userId: string;
  initialPhotos: string[];
  onPhotosChange: (photos: string[]) => void;
}

export function PhotoUpload({ userId, initialPhotos, onPhotosChange }: PhotoUploadProps) {
  const [photos, setPhotos] = useState<string[]>(initialPhotos || []);
  const [uploading, setUploading] = useState(false);
  const [croppingImage, setCroppingImage] = useState<string | null>(null);
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState<Area | null>(null);
  const [nudge, setNudge] = useState<{ message: string; type: "info" | "success" | "warning" } | null>(null);
  
  const fileInputRef = useRef<HTMLInputElement>(null);

  const onCropComplete = useCallback((_croppedArea: Area, croppedAreaPixels: Area) => {
    setCroppedAreaPixels(croppedAreaPixels);
  }, []);

  const createImage = (url: string): Promise<HTMLImageElement> =>
    new Promise((resolve, reject) => {
      const image = new Image();
      image.addEventListener("load", () => resolve(image));
      image.addEventListener("error", (error) => reject(error));
      image.setAttribute("crossOrigin", "anonymous");
      image.src = url;
    });

  const getCroppedImg = async (imageSrc: string, pixelCrop: Area): Promise<Blob | null> => {
    const image = await createImage(imageSrc);
    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d");

    if (!ctx) return null;

    canvas.width = pixelCrop.width;
    canvas.height = pixelCrop.height;

    ctx.drawImage(
      image,
      pixelCrop.x,
      pixelCrop.y,
      pixelCrop.width,
      pixelCrop.height,
      0,
      0,
      pixelCrop.width,
      pixelCrop.height
    );

    return new Promise((resolve) => {
      canvas.toBlob((blob) => {
        resolve(blob);
      }, "image/jpeg");
    });
  };

  const analyzeImage = (file: File) => {
    // Simple mock AI nudges
    // In a real app, this would call a vision API
    const size = file.size / 1024 / 1024; // MB
    
    setTimeout(() => {
      if (size < 0.1) {
        setNudge({ message: "Low resolution? A clearer photo helps matching.", type: "warning" });
      } else if (photos.length === 0) {
        setNudge({ message: "Great first photo! Make sure your face is clearly visible.", type: "success" });
      } else {
        setNudge({ message: "Looking good! Variety in photos increases interest.", type: "info" });
      }
      
      // Clear nudge after 5s
      setTimeout(() => setNudge(null), 5000);
    }, 1000);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const file = e.target.files[0];
      const reader = new FileReader();
      reader.onload = () => {
        setCroppingImage(reader.result as string);
        analyzeImage(file);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleUpload = async () => {
    if (!croppingImage || !croppedAreaPixels || !userId) return;

    try {
      setUploading(true);
      const croppedBlob = await getCroppedImg(croppingImage, croppedAreaPixels);
      if (!croppedBlob) throw new Error("Failed to crop image");

      const fileName = `${userId}/${Date.now()}.jpg`;
      const { data, error } = await supabase.storage
        .from("profile_photos")
        .upload(fileName, croppedBlob, {
          contentType: "image/jpeg",
          upsert: true,
        });

      if (error) throw error;

      const { data: { publicUrl } } = supabase.storage
        .from("profile_photos")
        .getPublicUrl(fileName);

      const newPhotos = [...photos, publicUrl];
      setPhotos(newPhotos);
      onPhotosChange(newPhotos);
      setCroppingImage(null);
      toast.success("Photo uploaded!");
    } catch (error: unknown) {
      console.error("Upload error:", error);
      toast.error("Failed to upload photo");
    } finally {
      setUploading(false);
    }
  };

  const removePhoto = async (index: number) => {
    const photoUrl = photos[index];
    const newPhotos = photos.filter((_, i) => i !== index);
    setPhotos(newPhotos);
    onPhotosChange(newPhotos);

    // Optionally delete from storage
    try {
      const path = photoUrl.split("/profile_photos/")[1];
      if (path) {
        await supabase.storage.from("profile_photos").remove([path]);
      }
    } catch (e) {
      console.error("Delete from storage error:", e);
    }
  };

  const onDragEnd = (result: DropResult) => {
    if (!result.destination) return;

    const items = Array.from(photos);
    const [reorderedItem] = items.splice(result.source.index, 1);
    items.splice(result.destination.index, 0, reorderedItem);

    setPhotos(items);
    onPhotosChange(items);
  };

  return (
    <div className="space-y-4">
      <AnimatePresence>
        {nudge && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className={`p-3 rounded-xl flex items-center gap-3 text-sm font-medium border ${
              nudge.type === "success" ? "bg-green-500/10 border-green-500/20 text-green-600" :
              nudge.type === "warning" ? "bg-orange-500/10 border-orange-500/20 text-orange-600" :
              "bg-blue-500/10 border-blue-500/20 text-blue-600"
            }`}
          >
            {nudge.type === "success" && <CheckCircle2 className="w-4 h-4" />}
            {nudge.type === "warning" && <AlertCircle className="w-4 h-4" />}
            {nudge.type === "info" && <Camera className="w-4 h-4" />}
            {nudge.message}
          </motion.div>
        )}
      </AnimatePresence>

      <DragDropContext onDragEnd={onDragEnd}>
        <Droppable droppableId="photos" direction="horizontal">
          {(provided) => (
            <div 
              {...provided.droppableProps} 
              ref={provided.innerRef}
              className="grid grid-cols-2 md:grid-cols-3 gap-4"
            >
              {photos.map((url, index) => (
                <Draggable key={url} draggableId={url} index={index}>
                  {(provided) => (
                    <div
                      ref={provided.innerRef}
                      {...provided.draggableProps}
                      className="relative aspect-[3/4] rounded-2xl overflow-hidden bg-secondary/20 group border-2 border-transparent hover:border-primary/50 transition-colors"
                    >
                      <img src={url} alt={`Profile ${index + 1}`} className="w-full h-full object-cover" />
                      
                      <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col justify-between p-2">
                        <div className="flex justify-between items-start">
                          <div {...provided.dragHandleProps} className="p-1.5 bg-white/20 backdrop-blur-md rounded-lg text-white">
                            <GripVertical className="w-4 h-4" />
                          </div>
                          <button 
                            onClick={() => removePhoto(index)}
                            className="p-1.5 bg-red-500/80 backdrop-blur-md rounded-lg text-white hover:bg-red-600 transition-colors"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                        {index === 0 && (
                          <div className="bg-primary text-primary-foreground text-[10px] font-bold px-2 py-0.5 rounded-full self-start">
                            MAIN PHOTO
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </Draggable>
              ))}
              
              {photos.length < 6 && (
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="aspect-[3/4] rounded-2xl border-2 border-dashed border-border flex flex-col items-center justify-center gap-2 text-muted-foreground hover:border-primary hover:text-primary transition-all bg-secondary/5"
                >
                  <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                    <Plus className="w-6 h-6" />
                  </div>
                  <span className="text-xs font-semibold">Add Photo</span>
                </button>
              )}
              {provided.placeholder}
            </div>
          )}
        </Droppable>
      </DragDropContext>

      <input 
        type="file" 
        ref={fileInputRef} 
        onChange={handleFileChange} 
        accept="image/*" 
        className="hidden" 
      />

      {/* Cropping Modal */}
      {croppingImage && (
        <div className="fixed inset-0 z-[100] bg-black/90 flex flex-col items-center justify-center p-4">
          <div className="relative w-full max-w-lg aspect-[3/4] bg-neutral-900 rounded-3xl overflow-hidden">
            <Cropper
              image={croppingImage}
              crop={crop}
              zoom={zoom}
              aspect={3 / 4}
              onCropChange={setCrop}
              onCropComplete={onCropComplete}
              onZoomChange={setZoom}
            />
          </div>
          
          <div className="w-full max-w-lg mt-6 space-y-6">
            <div className="space-y-2">
              <label className="text-white/60 text-xs font-semibold uppercase tracking-wider">Zoom</label>
              <input
                type="range"
                value={zoom}
                min={1}
                max={3}
                step={0.1}
                aria-labelledby="Zoom"
                onChange={(e) => setZoom(Number(e.target.value))}
                className="w-full h-1.5 bg-white/20 rounded-lg appearance-none cursor-pointer accent-primary"
              />
            </div>
            
            <div className="flex gap-4">
              <Button 
                variant="outline" 
                onClick={() => setCroppingImage(null)}
                className="flex-1 h-12 rounded-xl border-white/20 text-white hover:bg-white/10"
              >
                Cancel
              </Button>
              <Button 
                onClick={handleUpload}
                disabled={uploading}
                className="flex-1 h-12 rounded-xl bg-primary text-primary-foreground font-bold"
              >
                {uploading ? <Loader2 className="w-5 h-5 animate-spin" /> : "Apply & Upload"}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
