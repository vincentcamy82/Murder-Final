import AmbientMusic from "@/components/AmbientMusic";

export default function BiographyMusic({ children }: { children: React.ReactNode }) {
  return (
    <>
      <AmbientMusic track="/audio/biographie.mp3" />
      {children}
    </>
  );
}
