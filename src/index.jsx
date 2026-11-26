import React from "react";
import {AbsoluteFill, Audio, Composition, OffthreadVideo, registerRoot, staticFile, useCurrentFrame, useVideoConfig} from "remotion";
import speech from "./speech.words.json";

const WORDS_PER_LINE = 4;

const Clip = () => (
  <AbsoluteFill>
    <OffthreadVideo src={staticFile("burned.mp4")} />
    <AbsoluteFill style={{color: "white", fontFamily: "sans-serif", fontSize: 56, fontWeight: 700, alignItems: "center", paddingTop: 80}}>
      Remotion playing an FFmpeg clip
    </AbsoluteFill>
  </AbsoluteFill>
);

const Captions = () => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const t = frame / fps;
  const spoken = speech.words.filter((w) => w.start <= t).length;
  const lineStart = Math.floor(Math.max(spoken - 1, 0) / WORDS_PER_LINE) * WORDS_PER_LINE;
  const line = speech.words.slice(lineStart, lineStart + WORDS_PER_LINE);

  return (
    <AbsoluteFill style={{background: "#16202a", fontFamily: "sans-serif", fontSize: 72, fontWeight: 800, alignItems: "center", justifyContent: "center", gap: 24, flexDirection: "row"}}>
      <Audio src={staticFile("speech.wav")} />
      {line.map((w) => (
        <span key={w.start} style={{color: t >= w.start && t < w.end ? "#ffd21f" : "white"}}>
          {w.word}
        </span>
      ))}
    </AbsoluteFill>
  );
};

registerRoot(() => (
  <>
    <Composition id="Clip" component={Clip} durationInFrames={150} fps={30} width={1280} height={720} />
    <Composition id="Captions" component={Captions} durationInFrames={Math.ceil(speech.duration * 30)} fps={30} width={1280} height={720} />
  </>
));
