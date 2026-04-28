(() => {
function networks() {
  return window.SynapseData.NETWORKS;
}

const LABELLED_REGION_KEYS = new Set([
  "L_PFC", "R_PFC",
  "L_DLPFC", "R_DLPFC",
  "L_Ins", "R_Ins",
  "L_Amy", "R_Amy",
  "L_Hipp", "R_Hipp",
  "L_Thal", "R_Thal",
  "L_Caud", "R_Caud",
  "L_SMA", "R_SMA",
  "L_PCC", "R_PCC",
  "L_ENT", "R_ENT",
  "L_STG", "R_STG"
]);

const LABEL_TEXT = {
  L_PFC: "L Prefrontal",
  R_PFC: "R Prefrontal",
  L_DLPFC: "L DLPFC",
  R_DLPFC: "R DLPFC",
  L_Ins: "L Insula",
  R_Ins: "R Insula",
  L_Amy: "L Amygdala",
  R_Amy: "R Amygdala",
  L_Hipp: "L Hippocampus",
  R_Hipp: "R Hippocampus",
  L_Thal: "L Thalamus",
  R_Thal: "R Thalamus",
  L_Caud: "L Caudate",
  R_Caud: "R Caudate",
  L_SMA: "L SMA",
  R_SMA: "R SMA",
  L_PCC: "L PCC",
  R_PCC: "R PCC",
  L_ENT: "L Entorhinal",
  R_ENT: "R Entorhinal",
  L_STG: "L Sup. Temporal",
  R_STG: "R Sup. Temporal"
};

function clamp(value, min, max) {
  return Math.min(max, Math.max(min, value));
}

function hexToRgb(hex) {
  return {
    r: parseInt(hex.slice(1, 3), 16),
    g: parseInt(hex.slice(3, 5), 16),
    b: parseInt(hex.slice(5, 7), 16)
  };
}

function rgba(hex, alpha) {
  const color = hexToRgb(hex);
  return `rgba(${color.r}, ${color.g}, ${color.b}, ${alpha})`;
}

function mixRgb(a, b, weight) {
  const normalizedWeight = clamp(weight, 0, 1);
  return {
    r: Math.round(a.r + (b.r - a.r) * normalizedWeight),
    g: Math.round(a.g + (b.g - a.g) * normalizedWeight),
    b: Math.round(a.b + (b.b - a.b) * normalizedWeight)
  };
}

class ConnectomeRenderer {
  constructor(brainCanvas, matrixCanvas) {
    this.brainCanvas = brainCanvas;
    this.brainContext = brainCanvas.getContext("2d");
    this.matrixCanvas = matrixCanvas;
    this.matrixContext = matrixCanvas.getContext("2d");
  }

  resize() {
    const brainWrap = this.brainCanvas.parentElement;
    this.brainCanvas.width = Math.max(320, brainWrap.clientWidth);
    this.brainCanvas.height = Math.max(420, brainWrap.clientHeight);

    const matrixWrap = this.matrixCanvas.parentElement;
    this.matrixCanvas.width = Math.max(260, matrixWrap.clientWidth - 220);
    this.matrixCanvas.height = 86;
  }

  drawBrain(state) {
    const { brainCanvas: canvas, brainContext: ctx } = this;
    const { nodes, edges, signals, lesioned, hubMode, labelMode, activeProfile, transitionIntensity } = state;

    if (!canvas.width || !canvas.height || !nodes.length) {
      return;
    }

    ctx.clearRect(0, 0, canvas.width, canvas.height);
    this.drawBackdrop(ctx, canvas, activeProfile, transitionIntensity);
    this.drawBrainOutline(ctx, canvas, activeProfile);
    this.drawEdges(ctx, nodes, edges, lesioned, activeProfile, transitionIntensity);
    this.drawNodes(ctx, nodes, lesioned, hubMode, activeProfile, transitionIntensity);
    if (labelMode) {
      this.drawLabels(ctx, nodes, lesioned, activeProfile);
    }
    this.drawSignals(ctx, state);
  }

  drawMatrix(state) {
    const { matrixCanvas: canvas, matrixContext: ctx } = this;

    if (!canvas.width || !canvas.height) {
      return;
    }

    const size = 24;
    const cellWidth = canvas.width / size;
    const cellHeight = canvas.height / size;
    const theme = state.activeProfile?.visuals || {};
    const hue = theme.matrixHue ?? 195;

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    for (let row = 0; row < size; row += 1) {
      for (let col = 0; col < size; col += 1) {
        const diagonal = row === col;
        const rowNode = state.nodes[row % state.nodes.length];
        const colNode = state.nodes[col % state.nodes.length];
        const lesioned = state.lesioned.has(rowNode.id) || state.lesioned.has(colNode.id);
        const pathology = (rowNode.pathology + colNode.pathology) / 2;
        const weightPenalty = 1 - ((rowNode.profileWeight + colNode.profileWeight) / 2);
        const local = Math.max(0, 0.72 - Math.abs(row - col) * 0.045);
        const signal = diagonal ? 1 : clamp(local - weightPenalty * 0.24, 0.04, 0.98);
        const cellHue = lesioned ? 0 : clamp(hue + pathology * 30 - weightPenalty * 12, 0, 360);
        const saturation = diagonal ? 86 : 68 + pathology * 18;
        const lightness = lesioned ? 42 : 20 + signal * 44 - pathology * 10;
        const alpha = diagonal ? 0.9 : 0.12 + signal * 0.44 + pathology * 0.14;

        ctx.fillStyle = `hsla(${cellHue}, ${saturation}%, ${lightness}%, ${alpha})`;
        ctx.fillRect(col * cellWidth, row * cellHeight, cellWidth - 0.8, cellHeight - 0.8);
      }
    }
  }

  drawBackdrop(ctx, canvas, profile, transitionIntensity = 0) {
    const theme = profile?.visuals || {};
    const signal = theme.signal || "#43d8c9";
    const accent = theme.accent || "#5aa8ff";

    const gradient = ctx.createRadialGradient(
      canvas.width / 2,
      canvas.height / 2,
      canvas.width * 0.04,
      canvas.width / 2,
      canvas.height / 2,
      canvas.width * 0.58
    );
    gradient.addColorStop(0, rgba(signal, 0.08 + transitionIntensity * 0.08));
    gradient.addColorStop(0.5, rgba(accent, 0.045 + transitionIntensity * 0.05));
    gradient.addColorStop(1, "rgba(4, 7, 12, 0)");

    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, canvas.width, canvas.height);
  }

  drawBrainOutline(ctx, canvas, profile) {
    const accent = profile?.visuals?.accent || "#5aa8ff";

    ctx.save();
    ctx.beginPath();
    ctx.ellipse(canvas.width / 2, canvas.height / 2, canvas.width * 0.38, canvas.height * 0.35, 0, 0, Math.PI * 2);
    ctx.strokeStyle = rgba(accent, 0.1);
    ctx.lineWidth = 44;
    ctx.stroke();
    ctx.restore();
  }

  drawEdges(ctx, nodes, edges, lesioned, profile, transitionIntensity = 0) {
    const theme = profile?.visuals || {};
    const signal = theme.signal || "#43d8c9";
    const accent = theme.accent || "#5aa8ff";
    const accentRgb = hexToRgb(accent);

    for (const edge of edges) {
      const a = nodes[edge.a];
      const b = nodes[edge.b];

      if (lesioned.has(edge.a) || lesioned.has(edge.b)) {
        continue;
      }

      const activation = Math.max(a.activation, b.activation, edge.active);
      const diseaseWeight = edge.diseaseWeight ?? 1;
      const pathology = Math.max(a.pathology, b.pathology);
      const alpha = activation > 0.05
        ? 0.08 + activation * 0.58
        : clamp(edge.strength * 0.09 * diseaseWeight + pathology * 0.04, 0.03, 0.28);
      const transitionFade = 1 - transitionIntensity * 0.45;

      ctx.beginPath();
      ctx.moveTo(a.x, a.y);
      ctx.lineTo(b.x, b.y);

      if (activation > 0.05) {
        ctx.strokeStyle = rgba(signal, clamp((alpha + 0.12) * transitionFade, 0.08, 0.9));
        ctx.lineWidth = 0.75 + activation * 2.2;
      } else {
        const baseColor = hexToRgb(networks()[a.network]?.color || "#5aa8ff");
        const mixed = mixRgb(baseColor, accentRgb, clamp(pathology * 0.8 + (1 - diseaseWeight) * 0.7, 0, 0.85));
        ctx.strokeStyle = `rgba(${mixed.r}, ${mixed.g}, ${mixed.b}, ${alpha * transitionFade})`;
        ctx.lineWidth = Math.max(0.35, edge.strength * 0.85 * diseaseWeight + pathology * 0.25);
      }

      ctx.stroke();
      edge.active *= 0.968;
    }
  }

  drawNodes(ctx, nodes, lesioned, hubMode, profile, transitionIntensity = 0) {
    const theme = profile?.visuals || {};
    const accent = theme.accent || "#5aa8ff";
    const accentRgb = hexToRgb(accent);

    for (const node of nodes) {
      const activation = node.activation;
      const pathology = node.pathology ?? 0;
      const radius = node.radius + activation * 4 + pathology * 1.6 + transitionIntensity * pathology * 4.5;

      ctx.beginPath();
      ctx.arc(node.x, node.y, radius, 0, Math.PI * 2);

      if (lesioned.has(node.id)) {
        ctx.fillStyle = "rgba(239, 68, 68, 0.78)";
      } else if (activation > 0.1) {
        const intensity = clamp(activation, 0, 1);
        const glowMix = mixRgb(accentRgb, hexToRgb(theme.signal || "#43d8c9"), 0.55);
        ctx.fillStyle = `rgba(${glowMix.r}, ${glowMix.g}, ${glowMix.b}, ${0.78 + intensity * 0.18})`;
      } else if (pathology > 0.14) {
        const networkRgb = hexToRgb(networks()[node.network]?.color || "#5aa8ff");
        const mixed = mixRgb(networkRgb, accentRgb, clamp(pathology, 0.18, 0.88));
        ctx.fillStyle = `rgba(${mixed.r}, ${mixed.g}, ${mixed.b}, ${0.55 + pathology * 0.28})`;
      } else if (node.isHub && hubMode) {
        ctx.fillStyle = "rgba(245, 158, 11, 0.9)";
      } else {
        const color = hexToRgb(networks()[node.network]?.color || "#5aa8ff");
        ctx.fillStyle = `rgba(${color.r}, ${color.g}, ${color.b}, 0.68)`;
      }

      if (pathology > 0.2 && !lesioned.has(node.id)) {
        ctx.shadowBlur = 8 + pathology * 8;
        ctx.shadowColor = rgba(accent, 0.4 + pathology * 0.25);
      } else {
        ctx.shadowBlur = 0;
      }

      ctx.fill();
      ctx.shadowBlur = 0;
      node.activation *= 0.986;
    }
  }

  drawSignals(ctx, state) {
    const { nodes, edges, lesioned, activeProfile } = state;
    const signal = activeProfile?.visuals?.signal || "#43d8c9";

    for (const pulse of state.signals) {
      ctx.beginPath();
      ctx.arc(pulse.x, pulse.y, pulse.r, 0, Math.PI * 2);
      ctx.strokeStyle = rgba(signal, pulse.alpha);
      ctx.lineWidth = 1.1;
      ctx.stroke();

      pulse.r += 2.5 + state.speed * 0.035;
      pulse.alpha *= 0.962 - state.decay * 0.00052;

      for (const node of nodes) {
        if (lesioned.has(node.id)) {
          continue;
        }

        const distance = Math.sqrt((node.x - pulse.x) ** 2 + (node.y - pulse.y) ** 2);
        if (distance < pulse.r + 5 && distance > pulse.r - 11) {
          const profileBoost = clamp((node.profileWeight ?? 1) + 0.08, 0.35, 1.12);
          node.activation = Math.min(1, node.activation + pulse.alpha * 0.3 * profileBoost);

          for (const edge of edges) {
            if ((edge.a === node.id || edge.b === node.id) && edge.strength > 0.45) {
              const diseaseWeight = edge.diseaseWeight ?? 1;
              edge.active = Math.min(1, edge.active + pulse.alpha * edge.strength * 0.26 * diseaseWeight);
            }
          }
        }
      }
    }

    state.signals = state.signals.filter((pulse) => pulse.alpha > 0.02);
  }

  drawLabels(ctx, nodes, lesioned, profile) {
    const accent = profile?.visuals?.accent || "#5aa8ff";

    ctx.save();
    ctx.font = "11px 'Trebuchet MS', sans-serif";
    ctx.textBaseline = "middle";

    for (const node of nodes) {
      if (!LABELLED_REGION_KEYS.has(node.key)) {
        continue;
      }

      const label = LABEL_TEXT[node.key] || node.label;
      const xOffset = node.x >= this.brainCanvas.width / 2 ? 10 : -10;
      const align = xOffset > 0 ? "left" : "right";
      const textX = node.x + xOffset;
      const textY = node.y - 10;

      ctx.textAlign = align;
      ctx.strokeStyle = "rgba(5, 7, 11, 0.9)";
      ctx.lineWidth = 3;
      ctx.strokeText(label, textX, textY);
      ctx.fillStyle = lesioned.has(node.id) ? "rgba(239, 68, 68, 0.94)" : rgba(accent, 0.94);
      ctx.fillText(label, textX, textY);
    }

    ctx.restore();
  }
}

window.SynapseRenderer = {
  ConnectomeRenderer
};
})();
