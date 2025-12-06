import { FileText, X } from "lucide-react";
import { useEffect, useState } from "react";

interface PostMediaProps {
  url?: string;
  alt: string;
  height?: string;
  controls?: boolean;
  variant?: "full" | "card";
}

export function PostMedia({
  url,
  alt,
  height = "h-48",
  controls = true,
  variant = "full",
}: PostMediaProps) {
  const [showFull, setShowFull] = useState(false);

  useEffect(() => {
    function handleEsc(e: KeyboardEvent) {
      if (e.key === "Escape") setShowFull(false);
    }
    window.addEventListener("keydown", handleEsc);
    return () => window.removeEventListener("keydown", handleEsc);
  }, []);

  if (!url) {
    return (
      <div
        className={`w-full ${height} bg-muted flex items-center justify-center text-sm text-muted-foreground`}
      >
        Sem mídia
      </div>
    );
  }

  const extension = url.split(".").pop()?.toLowerCase();

  const isImage = ["jpg", "jpeg", "png", "webp", "gif"].includes(extension!);
  const isVideo = ["mp4", "webm", "ogg"].includes(extension!);
  const isPdf = extension === "pdf";

  if (isImage) {
    return (
      <>
        <img
          src={url}
          alt={alt}
          onClick={() => setShowFull(true)}
          className={`w-full ${height} object-cover rounded cursor-pointer`}
        />

        {showFull && (
          <div
            className="fixed inset-0 bg-black/80 backdrop-blur-sm z-[9999] flex items-center justify-center"
            onClick={() => setShowFull(false)}
          >
            <button
              className="absolute top-5 right-5 text-black "
              onClick={() => setShowFull(false)}
            >
              <X size={32} />
            </button>

            <img
              src={url}
              alt={alt}
              className="max-w-[95%] max-h-[95%] rounded shadow-lg  object-contain"
            />
          </div>
        )}
      </>
    );
  }

  if (isVideo) {
    return (
      <video
        src={url}
        controls={controls}
        className={`w-full ${height} object-cover rounded`}
      />
    );
  }

  if (isPdf) {
    if (variant === "card") {
      return (
        <div
          className={`w-full ${height} bg-red-100 flex items-center justify-center`}
        >
          <FileText />
        </div>
      );
    }

    return (
      <div className="w-full border rounded-lg p-6 bg-white flex flex-col items-center text-center shadow-sm">
        <FileText className="w-12 h-12  mb-3" />
        <a
          href={url}
          target="_blank"
          rel="noopener noreferrer"
          className="px-4 py-2 bg-primary text-white rounded-md hover:bg-primary/90 transition"
        >
          Abrir PDF
        </a>
      </div>
    );
  }

  return (
    <div
      className={`w-full ${height} bg-muted flex items-center justify-center text-sm text-muted-foreground`}
    >
      Arquivo não suportado
    </div>
  );
}
