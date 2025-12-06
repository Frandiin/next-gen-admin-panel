import { useState } from "react";
import { FileText, TvMinimalPlay, ImageIcon } from "lucide-react";

export function AdminMediaThumb({ url }: { url?: string }) {
  const [open, setOpen] = useState(false);

  if (!url)
    return (
      <div className="w-28 h-20 flex items-center justify-center border rounded text-xs text-muted-foreground">
        Sem mídia
      </div>
    );

  const type = url.split(".").pop()?.toLowerCase();

  const isImage = ["jpg", "jpeg", "png", "gif", "webp"].includes(type!);
  const isVideo = ["mp4", "mov", "avi", "webm"].includes(type!);
  const isPdf = type === "pdf";

  return (
    <>
      <div
        className={
          "w-28 h-20 border rounded overflow-hidden cursor-pointer flex items-center justify-center bg-muted hover:opacity-80 transition"
        }
        onClick={() => setOpen(true)}
      >
        {isImage ? (
          <img src={url} className="object-cover w-full h-full" />
        ) : isVideo ? (
          <TvMinimalPlay className="w-8 h-8 opacity-70" />
        ) : isPdf ? (
          <FileText className="w-8 h-8 opacity-70" />
        ) : (
          <ImageIcon className="w-8 h-8 opacity-70" />
        )}
      </div>

      {open && (
        <div
          className="fixed inset-0 bg-black/80 z-[999999999999999] backdrop-blur-sm flex items-center justify-center"
          onClick={() => setOpen(false)}
        >
          <button
            className="absolute top-5 right-5 text-black z-[10000]"
            onClick={(e) => {
              e.stopPropagation();
              setOpen(false);
            }}
          >
            ✕
          </button>

          {isImage && (
            <img src={url} className="max-w-[90%] max-h-[90%] object-contain" />
          )}
          {isVideo && (
            <video
              src={url}
              controls
              className="max-w-[90%] max-h-[90%] rounded"
            />
          )}
          {isPdf && (
            <iframe src={url} className="w-[90%] h-[90%] rounded bg-white" />
          )}
        </div>
      )}
    </>
  );
}
