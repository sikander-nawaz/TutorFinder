import { useEffect, useRef } from "react";

interface Particle {
  x: number;
  y: number;
  z: number;
  vx: number;
  vy: number;
  size: number;
  color: string;
  shape: "circle" | "square" | "triangle" | "diamond";
  opacity: number;
  rotationSpeed: number;
  rotation: number;
  pulse: number;
  pulseSpeed: number;
}

interface HeroSceneProps {
  className?: string;
}

export function HeroScene({ className }: HeroSceneProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationRef = useRef<number>(0);
  const particlesRef = useRef<Particle[]>([]);
  const timeRef = useRef<number>(0);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const colors = [
      "16, 185, 129",
      "5, 150, 105",
      "52, 211, 153",
      "110, 231, 183",
      "30, 58, 138",
      "59, 130, 246",
      "99, 102, 241",
      "245, 158, 11",
    ];

    const shapes: Particle["shape"][] = ["circle", "square", "triangle", "diamond"];

    const resize = () => {
      canvas.width = canvas.offsetWidth * window.devicePixelRatio;
      canvas.height = canvas.offsetHeight * window.devicePixelRatio;
      ctx.scale(window.devicePixelRatio, window.devicePixelRatio);
    };

    const initParticles = () => {
      const w = canvas.offsetWidth;
      const h = canvas.offsetHeight;
      const count = Math.min(60, Math.floor((w * h) / 12000));
      particlesRef.current = Array.from({ length: count }, () => ({
        x: Math.random() * w,
        y: Math.random() * h,
        z: Math.random() * 1.5 + 0.5,
        vx: (Math.random() - 0.5) * 0.3,
        vy: (Math.random() - 0.5) * 0.3,
        size: Math.random() * 16 + 6,
        color: colors[Math.floor(Math.random() * colors.length)],
        shape: shapes[Math.floor(Math.random() * shapes.length)],
        opacity: Math.random() * 0.45 + 0.1,
        rotationSpeed: (Math.random() - 0.5) * 0.025,
        rotation: Math.random() * Math.PI * 2,
        pulse: Math.random() * Math.PI * 2,
        pulseSpeed: Math.random() * 0.02 + 0.005,
      }));
    };

    const drawShape = (ctx: CanvasRenderingContext2D, p: Particle, pulseFactor: number) => {
      const s = p.size * p.z * pulseFactor;
      ctx.fillStyle = `rgba(${p.color}, ${p.opacity})`;
      ctx.strokeStyle = `rgba(${p.color}, ${Math.min(p.opacity + 0.3, 1)})`;
      ctx.lineWidth = 1.5;

      ctx.beginPath();
      if (p.shape === "circle") {
        ctx.arc(0, 0, s, 0, Math.PI * 2);
      } else if (p.shape === "square") {
        ctx.rect(-s / 2, -s / 2, s, s);
      } else if (p.shape === "triangle") {
        ctx.moveTo(0, -s);
        ctx.lineTo(s * 0.866, s * 0.5);
        ctx.lineTo(-s * 0.866, s * 0.5);
        ctx.closePath();
      } else {
        ctx.moveTo(0, -s);
        ctx.lineTo(s * 0.7, 0);
        ctx.lineTo(0, s);
        ctx.lineTo(-s * 0.7, 0);
        ctx.closePath();
      }
      ctx.fill();
      ctx.stroke();
    };

    const drawConnections = () => {
      const particles = particlesRef.current;
      const w = canvas.offsetWidth;
      const threshold = w < 768 ? 80 : 110;
      for (let i = 0; i < particles.length; i++) {
        for (let j = i + 1; j < particles.length; j++) {
          const dx = particles[i].x - particles[j].x;
          const dy = particles[i].y - particles[j].y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist < threshold) {
            const alpha = (1 - dist / threshold) * 0.1;
            ctx.beginPath();
            ctx.moveTo(particles[i].x, particles[i].y);
            ctx.lineTo(particles[j].x, particles[j].y);
            ctx.strokeStyle = `rgba(16, 185, 129, ${alpha})`;
            ctx.lineWidth = 0.6;
            ctx.stroke();
          }
        }
      }
    };

    const animate = (ts: number) => {
      const w = canvas.offsetWidth;
      const h = canvas.offsetHeight;
      timeRef.current = ts * 0.001;

      ctx.clearRect(0, 0, w, h);
      drawConnections();

      particlesRef.current.forEach((p) => {
        p.x += p.vx;
        p.y += p.vy;
        p.rotation += p.rotationSpeed;
        p.pulse += p.pulseSpeed;

        if (p.x < -50) p.x = w + 50;
        else if (p.x > w + 50) p.x = -50;
        if (p.y < -50) p.y = h + 50;
        else if (p.y > h + 50) p.y = -50;

        const pulseFactor = 1 + Math.sin(p.pulse) * 0.08;

        ctx.save();
        ctx.translate(p.x, p.y);
        ctx.rotate(p.rotation);
        drawShape(ctx, p, pulseFactor);
        ctx.restore();
      });

      animationRef.current = requestAnimationFrame(animate);
    };

    resize();
    initParticles();
    animationRef.current = requestAnimationFrame(animate);

    const handleResize = () => {
      resize();
      initParticles();
    };
    window.addEventListener("resize", handleResize);

    return () => {
      window.removeEventListener("resize", handleResize);
      cancelAnimationFrame(animationRef.current);
    };
  }, []);

  return (
    <div className={`absolute inset-0 z-0 pointer-events-none overflow-hidden ${className ?? ""}`}>
      <div className="absolute inset-0 bg-gradient-to-b from-transparent to-background/90 z-10" />
      <div className="absolute inset-0 bg-primary/5 z-10 mix-blend-overlay" />
      <canvas
        ref={canvasRef}
        style={{ display: "block", width: "100%", height: "100%", position: "absolute", inset: 0 }}
      />
    </div>
  );
}
