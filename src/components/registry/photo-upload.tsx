import { useRef, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { X, Upload, ImagePlus } from "lucide-react";
import { cn } from "@/lib/utils";

interface PhotoUploadProps {
  userId: string;
  photos: string[];
  maxPhotos?: number;
  onChange: (urls: string[]) => void;
  className?: string;
  label?: string;
}

export function PhotoUpload({
  userId,
  photos,
  maxPhotos = 5,
  onChange,
  className,
  label = "Proof photos",
}: PhotoUploadProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const remaining = maxPhotos - photos.length;
  const canUpload = remaining > 0;

  async function handleFiles(files: FileList | null) {
    if (!files || files.length === 0) return;
    setUploading(true);
    setError(null);

    const toUpload = Array.from(files).slice(0, remaining);
    const newUrls: string[] = [];

    for (const file of toUpload) {
      if (!file.type.startsWith("image/")) {
        setError("Only image files are accepted.");
        continue;
      }
      if (file.size > 5 * 1024 * 1024) {
        setError("Each photo must be under 5 MB.");
        continue;
      }

      const ext = file.name.split(".").pop() ?? "jpg";
      const path = `${userId}/${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;

      const { error: uploadErr } = await supabase.storage
        .from("provider-photos")
        .upload(path, file, { upsert: false });

      if (uploadErr) {
        setError(uploadErr.message);
        continue;
      }

      const { data } = supabase.storage.from("provider-photos").getPublicUrl(path);
      newUrls.push(data.publicUrl);
    }

    setUploading(false);
    if (newUrls.length > 0) onChange([...photos, ...newUrls]);
  }

  async function removePhoto(url: string) {
    const path = url.split("/provider-photos/")[1];
    if (path) {
      await supabase.storage.from("provider-photos").remove([path]);
    }
    onChange(photos.filter((u) => u !== url));
  }

  return (
    <div className={cn("space-y-3", className)}>
      <div className="flex items-center justify-between">
        <p className="eyebrow text-text-soft">
          <span className="inline-block h-1.5 w-1.5 rotate-45 border border-current shrink-0" />
          {label}
        </p>
        <span className="font-mono text-[10px] uppercase tracking-[0.08em] text-text-soft/50">
          {photos.length} / {maxPhotos}
        </span>
      </div>

      {error && (
        <p className="font-sans text-[12px] text-rose-600 border border-rose-200 bg-rose-50 px-3 py-2 rounded-[3px]">
          {error}
        </p>
      )}

      <div className="grid grid-cols-3 sm:grid-cols-5 gap-2">
        {/* Existing photos */}
        {photos.map((url) => (
          <div key={url} className="relative group aspect-square rounded-[6px] overflow-hidden bg-[#1A4630]">
            <img
              src={url}
              alt="Provider proof photo"
              className="h-full w-full object-cover"
            />
            <button
              type="button"
              onClick={() => removePhoto(url)}
              className="absolute top-1 right-1 h-5 w-5 bg-forest-ink/80 text-cream rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity focus-visible:opacity-100"
              aria-label="Remove photo"
            >
              <X className="h-3 w-3" />
            </button>
          </div>
        ))}

        {/* Upload slots */}
        {canUpload && (
          <button
            type="button"
            onClick={() => inputRef.current?.click()}
            disabled={uploading}
            className={cn(
              "aspect-square rounded-[6px] border-2 border-dashed border-hairline flex flex-col items-center justify-center gap-1.5 transition-colors",
              "hover:border-forest hover:bg-forest/5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-forest",
              uploading && "opacity-50 cursor-wait"
            )}
          >
            {uploading ? (
              <div className="h-4 w-4 rounded-full border-2 border-forest border-t-transparent animate-spin" />
            ) : (
              <>
                <ImagePlus className="h-4 w-4 text-text-soft" strokeWidth={1.5} />
                <span className="font-mono text-[9px] uppercase tracking-[0.08em] text-text-soft/60">
                  Add photo
                </span>
              </>
            )}
          </button>
        )}

        {/* Empty placeholder slots */}
        {Array.from({ length: Math.max(0, remaining - 1) }).map((_, i) => (
          <div
            key={i}
            className="aspect-square rounded-[6px] border border-dashed border-hairline/50 flex items-center justify-center"
            aria-hidden
          >
            <span className="inline-block h-2.5 w-2.5 rotate-45 border border-hairline" />
          </div>
        ))}
      </div>

      <p className="font-sans text-[11px] text-text-soft/60 leading-relaxed">
        Upload up to {maxPhotos} photos. These appear on your public profile as proof of your premises and work. Max 5 MB each.
      </p>

      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        multiple
        className="sr-only"
        onChange={(e) => handleFiles(e.target.files)}
        aria-label="Upload photos"
      />
    </div>
  );
}

/* Hero image upload — admin only, stores to site-assets bucket */
interface HeroImageUploadProps {
  currentUrl: string | null;
  onUpload: (url: string) => void;
}

export function HeroImageUpload({ currentUrl, onUpload }: HeroImageUploadProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);

  async function handleFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);

    const { error } = await supabase.storage
      .from("site-assets")
      .upload("hero-bg.jpg", file, { upsert: true, contentType: file.type });

    if (!error) {
      const { data } = supabase.storage.from("site-assets").getPublicUrl("hero-bg.jpg");
      onUpload(`${data.publicUrl}?t=${Date.now()}`);
    }
    setUploading(false);
  }

  return (
    <button
      type="button"
      onClick={() => inputRef.current?.click()}
      disabled={uploading}
      title={currentUrl ? "Change hero background image" : "Upload hero background image"}
      className="flex items-center gap-1.5 bg-forest-ink/70 hover:bg-forest-ink text-cream/70 hover:text-cream px-3 py-1.5 rounded-[3px] font-mono text-[10px] uppercase tracking-[0.08em] transition-colors backdrop-blur-sm"
    >
      <Upload className="h-3 w-3" />
      {uploading ? "Uploading..." : currentUrl ? "Change hero image" : "Upload hero image"}
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        className="sr-only"
        onChange={handleFile}
      />
    </button>
  );
}
