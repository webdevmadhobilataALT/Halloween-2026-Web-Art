import { useEffect, useRef, useState } from "react";

// Assets: put bg.jpg and music.mp3 inside your project's /public folder
const BG = "/bg.jpg";
const MUSIC = "/music.mp3";

const css = `
@import url('https://fonts.googleapis.com/css2?family=Orbitron:wght@800;900&family=Share+Tech+Mono&family=VT323&display=swap');
.hw-root{position:fixed;inset:0;background:#040504;overflow:hidden}
.hw-bg{position:absolute;inset:0;background:#040504 center bottom/cover no-repeat}
.hw-rain{position:absolute;inset:0;width:100%;height:100%;pointer-events:none;mix-blend-mode:screen}
.hw-hero{position:absolute;left:0;right:0;top:34%;transform:translateY(-50%);text-align:center;pointer-events:none;padding:0 3vw}
.hw-hero h1{margin:0;position:relative;display:inline-block;font-family:'Orbitron','Eurostile','Arial Black',sans-serif;font-weight:900;
 font-size:clamp(30px,8.2vw,140px);line-height:1.08;letter-spacing:.07em;color:#ffb91f;
 text-shadow:0 0 4px #ffcf4a,0 0 18px #ff8a00,0 0 48px rgba(255,100,0,.65);animation:hw-jit 5s steps(1) infinite}
.hw-hero h1 span{display:block}
.hw-hero h1::before,.hw-hero h1::after{content:attr(data-t);position:absolute;inset:0;white-space:pre-line;opacity:0}
.hw-hero h1::before{color:#ff4a00;animation:hw-ga 5s steps(1) infinite}
.hw-hero h1::after{color:#fff0a8;animation:hw-gb 5s steps(1) infinite}
@keyframes hw-ga{0%,90%,100%{opacity:0}91%{opacity:.8;transform:translate(-5px,0);clip-path:inset(12% 0 62% 0)}93%{opacity:.8;transform:translate(4px,0);clip-path:inset(55% 0 20% 0)}95%{opacity:0}97%{opacity:.7;transform:translate(-3px,0);clip-path:inset(35% 0 40% 0)}98%{opacity:0}}
@keyframes hw-gb{0%,90%,100%{opacity:0}92%{opacity:.7;transform:translate(5px,0);clip-path:inset(60% 0 12% 0)}94%{opacity:.7;transform:translate(-4px,0);clip-path:inset(8% 0 70% 0)}96%{opacity:0}}
@keyframes hw-jit{0%,90%,100%{transform:none;filter:none}91%{transform:translateX(3px) skewX(-3deg)}93%{transform:translateX(-3px)}95%{transform:none;filter:brightness(1.4)}97%{transform:translateX(2px) skewX(2deg)}98%{transform:none}}
.hw-gate{position:absolute;inset:0;z-index:10;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:16px;background:#040504;color:#ffb21f;cursor:pointer;text-align:center;transition:opacity .8s;text-shadow:0 0 18px #ff7a00;font-family:'VT323',monospace}
.hw-gate b{font-size:clamp(40px,8vw,90px);font-weight:400;letter-spacing:.1em}
.hw-gate i{font-style:normal;font-size:26px;color:#ff8a00;animation:hw-bl 1.1s steps(2) infinite}
@keyframes hw-bl{50%{opacity:.2}}
.hw-mute{position:absolute;top:12px;right:14px;z-index:5;background:rgba(0,0,0,.5);color:#ff8a00;border:1px solid #ff8a00;font:22px 'VT323',monospace;padding:4px 12px;cursor:pointer;box-shadow:0 0 12px rgba(255,122,0,.4)}
`;

function useBinaryRain(canvasRef) {
  useEffect(() => {
    const c = canvasRef.current;
    const x = c.getContext("2d");
    const R = Math.random;
    let W, H, fs, cols = [], raf;

    const resize = () => {
      const d = Math.min(window.devicePixelRatio || 1, 2);
      W = c.width = innerWidth * d;
      H = c.height = innerHeight * d;
      fs = (innerWidth < 600 ? 13 : 17) * d;
      const n = Math.ceil(W / fs);
      cols = Array.from({ length: n }, (_, i) => {
        const f = i / n;
        const edge = f < 0.17 || f > 0.87;
        const core = f > 0.3 && f < 0.7;
        return {
          y: (R() * H) / fs,
          s: 0.035 + R() * 0.1, // fall speed (lower = slower)
          len: edge ? (16 + R() * 28) | 0 : (8 + R() * 18) | 0,
          a: edge ? 0.6 + R() * 0.4 : core ? 0.2 + R() * 0.3 : 0.3 + R() * 0.35,
          skip: !edge && R() < 0.25,
          ch: Array.from({ length: 64 }, () => (R() < 0.5 ? "0" : "1")),
        };
      });
    };

    const frame = () => {
      x.clearRect(0, 0, W, H);
      x.font = `${fs}px "Share Tech Mono", monospace`;
      x.textAlign = "center";
      cols.forEach((k, i) => {
        k.y += k.s;
        const px = i * fs + fs / 2;
        const base = Math.floor(k.y);
        if (R() < 0.015) k.ch[(R() * 64) | 0] = R() < 0.5 ? "0" : "1";
        if (k.skip && (base >> 4) & 1) return;
        for (let j = 0; j < k.len; j++) {
          const yy = (k.y - j) * fs;
          if (yy < 0 || yy > H + fs) continue;
          const f = 1 - j / k.len;
          if (j === 0) {
            x.fillStyle = `rgba(255,226,130,${k.a})`;
            x.shadowColor = "#ff9a00";
            x.shadowBlur = 10;
          } else {
            x.shadowBlur = 0;
            x.fillStyle = `rgba(255,${(105 + f * 45) | 0},0,${f * k.a * 0.95})`;
          }
          x.fillText(k.ch[(base - j) & 63], px, yy);
        }
        x.shadowBlur = 0;
        if ((k.y - k.len) * fs > H) {
          k.y = -R() * 20;
          k.s = 0.035 + R() * 0.1;
        }
      });
      raf = requestAnimationFrame(frame);
    };

    resize();
    addEventListener("resize", resize);
    frame();
    return () => {
      cancelAnimationFrame(raf);
      removeEventListener("resize", resize);
    };
  }, [canvasRef]);
}

export default function HalloweenArt() {
  const canvasRef = useRef(null);
  const audioRef = useRef(null);
  const [entered, setEntered] = useState(false);
  const [gone, setGone] = useState(false);
  const [playing, setPlaying] = useState(false);

  useBinaryRain(canvasRef);

  const enter = () => {
    const a = audioRef.current;
    a.volume = 0.85;
    a.play().then(() => setPlaying(true)).catch(() => {});
    setEntered(true);
    setTimeout(() => setGone(true), 800);
  };

  const toggle = () => {
    const a = audioRef.current;
    if (a.paused) { a.play(); setPlaying(true); }
    else { a.pause(); setPlaying(false); }
  };

  return (
    <div className="hw-root">
      <style>{css}</style>
      <div className="hw-bg" style={{ backgroundImage: `url(${BG})` }} />
      <canvas ref={canvasRef} className="hw-rain" />
      <div className="hw-hero">
        <h1 data-t={"HAPPY\nHALLOWEEN"}>
          <span>HAPPY</span>
          <span>HALLOWEEN</span>
        </h1>
      </div>
      <button className="hw-mute" onClick={toggle} aria-label="Toggle music">
        {playing ? "♪ ON" : "♪ OFF"}
      </button>
      {!gone && (
        <div className="hw-gate" style={{ opacity: entered ? 0 : 1 }} onClick={enter}>
          <b>2026 HALLOWEEN</b>
          <i>[ click to enter ]</i>
        </div>
      )}
      <audio ref={audioRef} src={MUSIC} loop preload="auto" />
    </div>
  );
}
