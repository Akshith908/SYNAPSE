(() => {
function regionBlueprints() {
  return window.SynapseData.REGION_BLUEPRINTS;
}

function samplePaths() {
  return window.SynapseData.SAMPLE_PATHS;
}

function seededRandom(seed) {
  let value = seed;

  return () => {
    value |= 0;
    value = (value + 0x6d2b79f5) | 0;
    let t = Math.imul(value ^ (value >>> 15), 1 | value);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function createConnectome(width, height) {
  const random = seededRandom(908);
  const cx = width / 2;
  const cy = height / 2;
  const regions = regionBlueprints();
  const nodes = regions.map((region, index) => {
    const outer = index < 50;
    const total = outer ? 50 : 10;
    const angle = ((outer ? index : index - 50) / total) * Math.PI * 2;
    const baseRadius = outer ? 0.29 + Math.sin(index * 1.3) * 0.065 : 0.1;
    const rx = width * baseRadius * (outer ? 0.92 : 0.62);
    const ry = height * baseRadius * (outer ? 0.55 : 0.42);
    const jitterX = (random() - 0.5) * width * (outer ? 0.055 : 0.045);
    const jitterY = (random() - 0.5) * height * (outer ? 0.055 : 0.045);
    const hubScore = region.hub ? 0.78 + random() * 0.18 : 0.24 + random() * 0.42;

    return {
      id: index,
      key: region.key,
      label: region.label,
      hemisphere: region.hemi,
      network: region.network,
      mni: region.mni,
      isHub: region.hub,
      hubScore,
      centralityRank: Math.max(1, Math.round((1 - hubScore) * regions.length)),
      x: cx + Math.cos(angle) * rx + jitterX,
      y: cy + Math.sin(angle) * ry + jitterY,
      radius: region.hub ? 5 : 3,
      activation: 0,
      connections: 0
    };
  });

  const edges = createEdges(nodes, width, random);
  for (const edge of edges) {
    nodes[edge.a].connections += 1;
    nodes[edge.b].connections += 1;
  }

  return { nodes, edges };
}

function createEdges(nodes, width, random) {
  const edges = [];

  for (let i = 0; i < nodes.length; i += 1) {
    for (let j = i + 1; j < nodes.length; j += 1) {
      const a = nodes[i];
      const b = nodes[j];
      const dx = a.x - b.x;
      const dy = a.y - b.y;
      const distance = Math.sqrt(dx * dx + dy * dy);
      const sameNetwork = a.network === b.network;
      const hubPair = a.isHub || b.isHub;
      const maxDistance = width * (hubPair ? 0.36 : sameNetwork ? 0.28 : 0.2);
      const threshold = sameNetwork ? 0.48 : hubPair ? 0.58 : 0.72;

      if (distance < maxDistance && random() > threshold) {
        edges.push({
          a: i,
          b: j,
          strength: Number((0.2 + random() * 0.8).toFixed(2)),
          active: 0
        });
      }
    }
  }

  return edges;
}

function findClosestNode(nodes, x, y, maxDistance = 30) {
  let closest = null;
  let minDistance = Infinity;

  for (const node of nodes) {
    const distance = Math.sqrt((node.x - x) ** 2 + (node.y - y) ** 2);
    if (distance < minDistance) {
      minDistance = distance;
      closest = node;
    }
  }

  return minDistance <= maxDistance ? closest : null;
}

function createSignal(node, strength) {
  return {
    x: node.x,
    y: node.y,
    r: node.radius,
    alpha: Math.max(0.2, strength / 100)
  };
}

function getPathway(sourceKey, targetKey) {
  const directKey = `${sourceKey}:${targetKey}`;
  const reverseKey = `${targetKey}:${sourceKey}`;
  const paths = samplePaths();
  const preset = paths[directKey] || paths[reverseKey];

  if (preset) {
    return paths[directKey] ? preset : [...preset].reverse();
  }

  if (sourceKey === targetKey) {
    return [sourceKey];
  }

  return [sourceKey, "L_ACC", "L_Cing", targetKey];
}

function calculatePathStrength(path) {
  const base = 0.92 - Math.max(0, path.length - 2) * 0.08;
  return Math.max(0.42, base).toFixed(2);
}

function pickLesionCandidate(nodes, lesioned, cursor) {
  const candidates = nodes.filter((node) => !node.isHub && !lesioned.has(node.id));
  if (!candidates.length) {
    return null;
  }

  return candidates[cursor % candidates.length];
}

window.SynapseModel = {
  calculatePathStrength,
  createConnectome,
  createSignal,
  findClosestNode,
  getPathway,
  pickLesionCandidate
};
})();
