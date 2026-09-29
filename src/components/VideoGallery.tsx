import { youtubeEmbed, vimeoEmbed } from "@/lib/media";
import type { TeaserVideo } from "@/types";

export function VideoPlayer({ url, title }: { url: string; title: string }) {
  const embed = youtubeEmbed(url) || vimeoEmbed(url);
  return (
    <div className="aspect-video overflow-hidden rounded-md border border-white/10 bg-black">
      {embed ? (
        <iframe src={embed} title={title} className="h-full w-full" allow="autoplay; encrypted-media; picture-in-picture" allowFullScreen />
      ) : (
        <video src={url} aria-label={title} controls playsInline preload="metadata" className="h-full w-full" />
      )}
    </div>
  );
}

export default function VideoGallery({ videos }: { videos: TeaserVideo[] }) {
  if (!videos.length) {
    return <p className="rounded-md border border-dashed border-brass/30 bg-noir-paper/80 p-8 text-center font-serif italic text-parch/70">Les premiers teasers seront bientôt dévoilés.</p>;
  }
  return (
    <div className="space-y-8">
      {videos.map((video) => (
        <article key={video.id}>
          <h3 className="mb-3 font-serif text-2xl text-parch">{video.title}</h3>
          <VideoPlayer url={video.url} title={video.title} />
        </article>
      ))}
    </div>
  );
}
