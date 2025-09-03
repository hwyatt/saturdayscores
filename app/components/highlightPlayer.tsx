import { useEffect, useRef, useState } from "react";

type HighlightPlayerProps = {
  gameId: string;
  onSequenceEnd: () => void;
};

const fetchHDLinks = async (gameId: string): Promise<string[]> => {
  try {
    const res = await fetch(`/api/highlights?gameId=${gameId}`);
    if (!res.ok) throw new Error("Failed to fetch HD links");
    return await res.json();
  } catch (error) {
    console.error("Error fetching HD links:", error);
    return [];
  }
};

export const HighlightPlayer = ({
  gameId,
  onSequenceEnd,
}: HighlightPlayerProps) => {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const [videoUrls, setVideoUrls] = useState<string[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);

  // Fetch the video URLs when gameId changes
  useEffect(() => {
    const loadVideos = async () => {
      const links = await fetchHDLinks(gameId);
      setVideoUrls(links);
      setCurrentIndex(0);
    };

    loadVideos();
  }, [gameId]);

  // Play the current video and move to the next one or trigger onSequenceEnd
  useEffect(() => {
    const videoElement = videoRef.current;
    if (!videoElement || videoUrls.length === 0) return;

    const handleEnded = () => {
      if (currentIndex < videoUrls.length - 1) {
        setCurrentIndex((prev) => prev + 1);
      } else {
        // All videos for this game have played, trigger the callback
        onSequenceEnd();
      }
    };

    videoElement.addEventListener("ended", handleEnded);
    videoElement.src = videoUrls[currentIndex];
    videoElement.load();
    videoElement.play();

    return () => {
      videoElement.removeEventListener("ended", handleEnded);
    };
  }, [currentIndex, videoUrls, onSequenceEnd]);

  return (
    <video
      ref={videoRef}
      muted
      autoPlay
      width="1920"
      height="1080"
      className="rounded-xl border border-white shadow-xl w-[1920px] aspect-video"
    />
  );
};
