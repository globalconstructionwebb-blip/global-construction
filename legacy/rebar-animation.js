/**
 * REBAR DYNAMIC GENERATOR (PREMIUM)
 * Programmatically creates vector ribs along the SVG path to ensure 
 * they follow curves perfectly and act as a single coherent object.
 */
gsap.registerPlugin(ScrollTrigger);

document.addEventListener('DOMContentLoaded', () => {
    const geometryPath = document.getElementById('rebar-geometry-path');
    const ribsContainer = document.getElementById('rebar-ribs-container');
    const maskPath = document.getElementById('rebar-mask-path');
    
    if (!geometryPath || !ribsContainer || !maskPath) return;

    // 1. Generate Ribs Programmatically
    function generateRibs() {
        const totalLength = geometryPath.getTotalLength();
        const visualStep = 14; // Constant pixels on screen between ribs
        const rodRadius = 6;  // 6px radius = 12px rod on screen
        const protrusion = 2; // Ribs stick out 2px on each side
        const slant = 7;      // Longitudinal slant for diagonal look

        // Calculate current scale to compensate for SVG stretching
        const svg = geometryPath.ownerSVGElement;
        const rect = svg.getBoundingClientRect();
        const viewBox = svg.viewBox.baseVal;
        const scaleX = rect.width / viewBox.width;
        const scaleY = rect.height / viewBox.height;

        let currentPos = 0;
        while (currentPos < totalLength) {
            const p1 = geometryPath.getPointAtLength(currentPos);
            const p2 = geometryPath.getPointAtLength(Math.min(currentPos + 1, totalLength));
            
            // Local path angle
            const angle = Math.atan2(p2.y - p1.y, p2.x - p1.x);

            // Calculate internal step needed for visualStep
            // We want move dist on screen = visualStep
            const localScale = Math.sqrt(
                Math.pow(Math.cos(angle) * scaleX, 2) + 
                Math.pow(Math.sin(angle) * scaleY, 2)
            );
            const internalStep = visualStep / localScale;

            // Rib geometry in SCREEN PIXELS (Relative to p1)
            // We create a diagonal "wrap"
            const sX1 = -slant;
            const sY1 = -(rodRadius + protrusion);
            const sX2 = slant;
            const sY2 = (rodRadius + protrusion);
            
            // Control point for the curve (to give 3D volume)
            const sCX = 0;
            const sCY = -(rodRadius + protrusion + 2);

            // Rotate screen coordinates to match path orientation
            const cos = Math.cos(angle);
            const sin = Math.sin(angle);

            const rx1 = sX1 * cos - sY1 * sin;
            const ry1 = sX1 * sin + sY1 * cos;
            const rx2 = sX2 * cos - sY2 * sin;
            const ry2 = sX2 * sin + sY2 * cos;
            const rcx = sCX * cos - sCY * sin;
            const rcy = sCX * sin + sCY * cos;

            // Convert back to Internal SVG Coordinates
            const x1 = p1.x + rx1 / scaleX;
            const y1 = p1.y + ry1 / scaleY;
            const x2 = p1.x + rx2 / scaleX;
            const y2 = p1.y + ry2 / scaleY;
            const cx = p1.x + rcx / scaleX;
            const cy = p1.y + rcy / scaleY;

            // Main Rib Path
            const rib = document.createElementNS("http://www.w3.org/2000/svg", "path");
            const d = `M ${x1},${y1} Q ${cx},${cy} ${x2},${y2}`;
            rib.setAttribute("d", d);
            rib.setAttribute("stroke", "#2d3748");
            rib.setAttribute("stroke-width", "3");
            rib.setAttribute("stroke-linecap", "round");
            rib.setAttribute("fill", "none");
            rib.style.vectorEffect = "non-scaling-stroke";
            ribsContainer.appendChild(rib);

            // Highlight on the rib
            const highlight = document.createElementNS("http://www.w3.org/2000/svg", "path");
            const hx1 = p1.x + (sX1 * 0.5 * cos - sY1 * 0.5 * sin) / scaleX;
            const hy1 = p1.y + (sX1 * 0.5 * sin + sY1 * 0.5 * cos) / scaleY;
            const hd = `M ${hx1},${hy1} Q ${cx},${cy} ${p1.x},${p1.y}`;
            highlight.setAttribute("d", hd);
            highlight.setAttribute("stroke", "rgba(255,255,255,0.3)");
            highlight.setAttribute("stroke-width", "1");
            highlight.setAttribute("stroke-linecap", "round");
            highlight.setAttribute("fill", "none");
            highlight.style.vectorEffect = "non-scaling-stroke";
            ribsContainer.appendChild(highlight);

            currentPos += internalStep;
        }
    }

    // 2. Animate Mask based on Scroll
    function initAnimation() {
        const totalLength = geometryPath.getTotalLength();
        
        // Initial state: hidden
        gsap.set(maskPath, {
            strokeDasharray: totalLength,
            strokeDashoffset: totalLength
        });

        gsap.to(maskPath, {
            strokeDashoffset: 0,
            ease: "none",
            scrollTrigger: {
                trigger: ".services-section",
                start: "top center",
                end: "bottom center",
                scrub: 0.5
            }
        });
    }

    generateRibs();
    initAnimation();
});
