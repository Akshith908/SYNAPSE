(() => {
const localBootstrap = window.SynapseData;
let { DISEASE_PROFILES, NETWORKS, REGION_BLUEPRINTS } = localBootstrap;

const {
  calculatePathStrength,
  createConnectome,
  createSignal,
  findClosestNode,
  getPathway
} = window.SynapseModel;

const { ConnectomeRenderer } = window.SynapseRenderer;

const elements = {
  brainCanvas: document.querySelector("#brain-canvas"),
  matrixCanvas: document.querySelector("#matrix-canvas"),
  nodeCount: document.querySelector("#node-count"),
  edgeCount: document.querySelector("#edge-count"),
  hudNodes: document.querySelector("#hud-nodes"),
  hudEdges: document.querySelector("#hud-edges"),
  dataSourceStatus: document.querySelector("#data-source-status"),
  signalState: document.querySelector("#signal-state"),
  currentMode: document.querySelector("#current-mode"),
  regionName: document.querySelector("#region-name"),
  regionNetwork: document.querySelector("#region-network"),
  regionHemisphere: document.querySelector("#region-hemisphere"),
  regionConnections: document.querySelector("#region-connections"),
  regionHub: document.querySelector("#region-hub"),
  regionActivation: document.querySelector("#region-activation"),
  regionMni: document.querySelector("#region-mni"),
  regionStrength: document.querySelector("#region-strength"),
  regionRank: document.querySelector("#region-rank"),
  activationLog: document.querySelector("#activation-log"),
  sourceRegion: document.querySelector("#source-region"),
  targetRegion: document.querySelector("#target-region"),
  tracePath: document.querySelector("#trace-path"),
  presetPathways: document.querySelector("#preset-pathways"),
  pathResult: document.querySelector("#path-result"),
  pathText: document.querySelector("#path-text"),
  pathHops: document.querySelector("#path-hops"),
  pathStrength: document.querySelector("#path-strength"),
  fireSignal: document.querySelector("#fire-signal"),
  lesionRegion: document.querySelector("#lesion-region"),
  detectHubs: document.querySelector("#detect-hubs"),
  toggleLabels: document.querySelector("#toggle-labels"),
  saveSnapshot: document.querySelector("#save-snapshot"),
  refreshSnapshots: document.querySelector("#refresh-snapshots"),
  modeToggle: document.querySelector("#mode-toggle"),
  diseaseGrid: document.querySelector("#disease-grid"),
  diseaseInfo: document.querySelector("#disease-info"),
  affectedRegionList: document.querySelector("#affected-region-list"),
  metricEfficiency: document.querySelector("#metric-efficiency"),
  metricClustering: document.querySelector("#metric-clustering"),
  metricPathLength: document.querySelector("#metric-path-length"),
  metricModularity: document.querySelector("#metric-modularity"),
  metricCommunities: document.querySelector("#metric-communities"),
  activeCount: document.querySelector("#active-count"),
  lesionedCount: document.querySelector("#lesioned-count"),
  hubCount: document.querySelector("#hub-count"),
  communityCount: document.querySelector("#community-count"),
  strengthSlider: document.querySelector("#strength-slider"),
  decaySlider: document.querySelector("#decay-slider"),
  speedSlider: document.querySelector("#speed-slider"),
  snapshotLabel: document.querySelector("#snapshot-label"),
  strengthValue: document.querySelector("#strength-value"),
  decayValue: document.querySelector("#decay-value"),
  speedValue: document.querySelector("#speed-value"),
  snapshotStatus: document.querySelector("#snapshot-status"),
  snapshotSourcePill: document.querySelector("#snapshot-source-pill"),
  snapshotList: document.querySelector("#snapshot-list"),
  transitionOverlay: document.querySelector("#transition-overlay"),
  transitionDiseaseName: document.querySelector("#transition-disease-name"),
  navPills: Array.from(document.querySelectorAll(".nav-pill")),
  pages: Array.from(document.querySelectorAll(".page")),
  overviewAffectedCount: document.querySelector("#overview-affected-count"),
  overviewSeverity: document.querySelector("#overview-severity"),
  overviewDiseaseName: document.querySelector("#overview-disease-name"),
  overviewDiseaseSummary: document.querySelector("#overview-disease-summary"),
  overviewPrimaryCircuit: document.querySelector("#overview-primary-circuit"),
  overviewPattern: document.querySelector("#overview-pattern"),
  conditionHeadline: document.querySelector("#condition-headline"),
  currentConfigSummary: document.querySelector("#current-config-summary"),
  historyConfigSummary: document.querySelector("#history-config-summary"),
  labCurrentDisease: document.querySelector("#lab-current-disease"),
  labCurrentDescription: document.querySelector("#lab-current-description"),
  labHallmark: document.querySelector("#lab-hallmark"),
  labCircuit: document.querySelector("#lab-circuit"),
  labPattern: document.querySelector("#lab-pattern"),
  labAffectedCount: document.querySelector("#lab-affected-count"),
  profileDiseaseName: document.querySelector("#profile-disease-name"),
  profileNote: document.querySelector("#profile-note"),
  profileHallmark: document.querySelector("#profile-hallmark"),
  profileCircuit: document.querySelector("#profile-circuit"),
  profilePattern: document.querySelector("#profile-pattern"),
  profileSeverity: document.querySelector("#profile-severity"),
  clinicalNotesStrip: document.querySelector("#clinical-notes-strip"),
  labClinicalNotesStrip: document.querySelector("#lab-clinical-notes-strip"),
  toggleCompare: document.querySelector("#toggle-compare"),
  comparePanel: document.querySelector("#compare-panel"),
  compareGrid: document.querySelector("#compare-grid"),
  diseaseNetworkImpact: document.querySelector("#disease-network-impact"),
  diseaseVisualImpact: document.querySelector("#disease-visual-impact")
};

const renderer = new ConnectomeRenderer(elements.brainCanvas, elements.matrixCanvas);

const state = {
  nodes: [],
  edges: [],
  signals: [],
  lesioned: new Set(),
  selectedNode: null,
  hubMode: false,
  labelMode: false,
  selectedDisease: "Healthy",
  activeProfile: DISEASE_PROFILES.Healthy,
  snapshots: [],
  strength: Number(elements.strengthSlider.value),
  decay: Number(elements.decaySlider.value),
  speed: Number(elements.speedSlider.value),
  snapshotLabel: "",
  animationFrame: null,
  currentMode: "CONNECTOME",
  currentView: "explorer",
  compareMode: false,
  transitionUntil: 0,
  transitionIntensity: 0
};

async function init() {
  await loadBackendData();
  populateRegionSelects();
  populateDiseaseButtons();
  bindEvents();
  activateView("explorer", false);
  renderer.resize();
  resetConnectome();
  setDisease("Healthy", {
    focusRegionKey: "L_PFC",
    resetGraph: false,
    silent: true
  });
  await loadSnapshots();

  const requestedView = resolveViewFromHash();
  if (requestedView !== "explorer") {
    activateView(requestedView, false);
  }

  animate();
}

function mergeBootstrapData(localData, remoteData) {
  const mergedProfiles = {};
  const allDiseases = new Set([
    ...Object.keys(localData.DISEASE_PROFILES || {}),
    ...Object.keys(remoteData.DISEASE_PROFILES || {})
  ]);

  for (const disease of allDiseases) {
    const localProfile = localData.DISEASE_PROFILES?.[disease] || {};
    const remoteProfile = remoteData.DISEASE_PROFILES?.[disease] || {};

    mergedProfiles[disease] = {
      ...localProfile,
      ...remoteProfile,
      metrics: {
        ...(localProfile.metrics || {}),
        ...(remoteProfile.metrics || {})
      },
      visuals: {
        ...(localProfile.visuals || {}),
        ...(remoteProfile.visuals || {})
      },
      networkWeights: {
        ...(localProfile.networkWeights || {}),
        ...(remoteProfile.networkWeights || {})
      },
      regionWeights: {
        ...(localProfile.regionWeights || {}),
        ...(remoteProfile.regionWeights || {})
      },
      clinicalNotes: remoteProfile.clinicalNotes || localProfile.clinicalNotes || [],
      pathwayPresets: remoteProfile.pathwayPresets || localProfile.pathwayPresets || [],
      networkImpacts: remoteProfile.networkImpacts || localProfile.networkImpacts || [],
      visualImpacts: remoteProfile.visualImpacts || localProfile.visualImpacts || [],
      affectedRegions: remoteProfile.affectedRegions || localProfile.affectedRegions || []
    };
  }

  return {
    NETWORKS: {
      ...(localData.NETWORKS || {}),
      ...(remoteData.NETWORKS || {})
    },
    REGION_BLUEPRINTS: remoteData.REGION_BLUEPRINTS?.length
      ? remoteData.REGION_BLUEPRINTS
      : localData.REGION_BLUEPRINTS,
    DISEASE_PROFILES: mergedProfiles,
    SAMPLE_PATHS: {
      ...(localData.SAMPLE_PATHS || {}),
      ...(remoteData.SAMPLE_PATHS || {})
    }
  };
}

async function loadBackendData() {
  if (window.location.protocol === "file:") {
    elements.dataSourceStatus.textContent = "Static Sample Mode";
    elements.snapshotSourcePill.textContent = "Offline Preview";
    elements.snapshotStatus.textContent = "Open the project through `npm start` to load and save MongoDB-backed snapshots.";
    return;
  }

  try {
    const response = await fetch("/api/bootstrap");

    if (!response.ok) {
      throw new Error(`Bootstrap API returned ${response.status}`);
    }

    const remote = await response.json();
    window.SynapseData = mergeBootstrapData(localBootstrap, remote);
    ({ DISEASE_PROFILES, NETWORKS, REGION_BLUEPRINTS } = window.SynapseData);
    state.activeProfile = DISEASE_PROFILES.Healthy || Object.values(DISEASE_PROFILES)[0];
    elements.dataSourceStatus.textContent = "MongoDB Connected";
    elements.snapshotSourcePill.textContent = "MongoDB History";
  } catch (error) {
    console.warn("Using local sample data because MongoDB API was unavailable.", error);
    elements.dataSourceStatus.textContent = "Static Fallback Mode";
    elements.snapshotSourcePill.textContent = "Fallback Mode";
    elements.snapshotStatus.textContent = "Backend unavailable, so snapshot history is hidden and local sample data is being used.";
  }
}

function resolveViewFromHash() {
  const value = window.location.hash.replace("#", "").trim();
  const allowed = new Set(["overview", "explorer", "disease-lab", "history"]);
  return allowed.has(value) ? value : "explorer";
}

function activateView(view, updateHash = true) {
  state.currentView = view;

  elements.pages.forEach((page) => {
    page.classList.toggle("active", page.dataset.view === view);
  });

  elements.navPills.forEach((pill) => {
    pill.classList.toggle("active", pill.dataset.viewTarget === view);
  });

  if (updateHash) {
    window.location.hash = view;
  }

  if (view === "explorer") {
    const config = serializeCurrentConfig();
    renderer.resize();
    applySavedConfig(config, { showStatus: false, preserveNav: true });
  }
}

function resetConnectome() {
  const connectome = createConnectome(elements.brainCanvas.width, elements.brainCanvas.height);
  state.nodes = connectome.nodes;
  state.edges = connectome.edges;
  state.signals = [];
  state.lesioned.clear();
  state.selectedNode = state.nodes[0] || null;
  updateGraphCounters();
}

function populateRegionSelects() {
  const options = REGION_BLUEPRINTS
    .map((region) => `<option value="${region.key}">${region.key} - ${region.label}</option>`)
    .join("");

  elements.sourceRegion.innerHTML = options;
  elements.targetRegion.innerHTML = options;
  elements.sourceRegion.value = "L_PFC";
  elements.targetRegion.value = "L_Hipp";
}

function populateDiseaseButtons() {
  elements.diseaseGrid.innerHTML = Object.entries(DISEASE_PROFILES)
    .map(([name, profile]) => `
      <button class="disease-btn${name === "Healthy" ? " active" : ""}" type="button" data-disease="${name}">
        <span class="disease-btn-name">${name}</span>
        <span class="disease-btn-note">${profile.primaryCircuit}</span>
      </button>
    `)
    .join("");
}

function bindEvents() {
  window.addEventListener("resize", handleResize);
  window.addEventListener("hashchange", () => {
    activateView(resolveViewFromHash(), false);
  });
  document.addEventListener("click", handleGlobalClick);
  elements.brainCanvas.addEventListener("click", handleCanvasClick);
  elements.tracePath.addEventListener("click", tracePathway);
  elements.fireSignal.addEventListener("click", fireSignal);
  elements.lesionRegion.addEventListener("click", lesionSelectedRegion);
  elements.detectHubs.addEventListener("click", () => setHubMode(!state.hubMode));
  elements.toggleLabels.addEventListener("click", () => setLabelMode(!state.labelMode));
  elements.saveSnapshot.addEventListener("click", saveSnapshot);
  elements.refreshSnapshots.addEventListener("click", loadSnapshots);
  elements.modeToggle.addEventListener("click", handleModeChange);
  elements.diseaseGrid.addEventListener("click", handleDiseaseChange);
  elements.presetPathways.addEventListener("click", handlePresetPathwayClick);
  elements.snapshotList.addEventListener("click", handleSnapshotAction);
  elements.toggleCompare.addEventListener("click", toggleComparePanel);
  bindSlider(elements.strengthSlider, elements.strengthValue, "strength");
  bindSlider(elements.decaySlider, elements.decayValue, "decay");
  bindSlider(elements.speedSlider, elements.speedValue, "speed");
  elements.snapshotLabel.addEventListener("input", () => {
    state.snapshotLabel = elements.snapshotLabel.value.trim();
    updateCurrentConfigSummary();
  });
}

function handleGlobalClick(event) {
  const target = event.target.closest("[data-view-target]");

  if (!target) {
    return;
  }

  event.preventDefault();
  activateView(target.dataset.viewTarget, true);
}

function bindSlider(slider, output, stateKey) {
  slider.addEventListener("input", () => {
    state[stateKey] = Number(slider.value);
    output.textContent = slider.value;
    updateCurrentConfigSummary();
  });
}

function setSliderValues(values = {}) {
  if (typeof values.strength === "number") {
    state.strength = values.strength;
    elements.strengthSlider.value = values.strength;
    elements.strengthValue.textContent = String(values.strength);
  }

  if (typeof values.decay === "number") {
    state.decay = values.decay;
    elements.decaySlider.value = values.decay;
    elements.decayValue.textContent = String(values.decay);
  }

  if (typeof values.speed === "number") {
    state.speed = values.speed;
    elements.speedSlider.value = values.speed;
    elements.speedValue.textContent = String(values.speed);
  }
}

function handleResize() {
  if (!state.nodes.length || state.currentView !== "explorer") {
    return;
  }

  const config = serializeCurrentConfig();
  renderer.resize();
  applySavedConfig(config, { showStatus: false, preserveNav: true });
}

function handleCanvasClick(event) {
  const rect = elements.brainCanvas.getBoundingClientRect();
  const x = (event.clientX - rect.left) * (elements.brainCanvas.width / rect.width);
  const y = (event.clientY - rect.top) * (elements.brainCanvas.height / rect.height);
  const node = findClosestNode(state.nodes, x, y);

  if (node) {
    selectNode(node, true);
  }
}

function selectNode(node, activate = true) {
  if (!node) {
    return;
  }

  state.selectedNode = node;

  if (activate) {
    node.activation = Math.max(node.activation, 0.82);
    state.signals.push(createSignal(node, state.strength));
    writeLog(node.key, node.activation);
    setSignalState("SELECTED", 900);
  } else {
    writeInitialLog();
  }

  elements.regionName.textContent = node.label;
  elements.regionNetwork.textContent = `${NETWORKS[node.network]?.name || "Unknown"} Network`;
  elements.regionHemisphere.textContent = node.hemisphere;
  elements.regionConnections.textContent = node.connections;
  elements.regionHub.textContent = node.hubScore.toFixed(2);
  elements.regionActivation.textContent = node.activation.toFixed(2);
  elements.regionMni.textContent = node.mni;
  elements.regionRank.textContent = `#${node.centralityRank} / ${REGION_BLUEPRINTS.length}`;
  elements.regionStrength.style.width = `${Math.round(node.hubScore * 100)}%`;
  updateCurrentConfigSummary();
}

function writeInitialLog() {
  const seed = [
    ["L_PFC", 0.94],
    ["L_ACC", 0.78],
    ["R_DLPFC", 0.62],
    ["L_PCC", 0.54],
    ["L_Hipp", 0.41]
  ];

  elements.activationLog.innerHTML = seed
    .map(([key, value]) => `<li><b>${key}</b> -> ${value.toFixed(2)}</li>`)
    .join("");
}

function writeLog(key, value) {
  const item = document.createElement("li");
  item.innerHTML = `<b>${key}</b> -> ${Math.min(1, value).toFixed(2)}`;
  elements.activationLog.prepend(item);

  while (elements.activationLog.children.length > 6) {
    elements.activationLog.lastElementChild.remove();
  }
}

function fireSignal() {
  const source = state.selectedNode || state.nodes[0];

  if (!source) {
    return;
  }

  source.activation = 1;

  for (let count = 0; count < 3; count += 1) {
    state.signals.push(createSignal(source, state.strength));
  }

  writeLog(source.key, source.activation);
  setSignalState("FIRING", 700, "PROPAGATING", 2400);
}

function lesionSelectedRegion() {
  const node = state.selectedNode;

  if (!node) {
    setSignalState("NO TARGET", 1100);
    return;
  }

  if (state.lesioned.has(node.id)) {
    setSignalState("ALREADY LESIONED", 1200);
    return;
  }

  if (node.isHub) {
    setSignalState("HUB LOCKED", 1200);
    return;
  }

  state.lesioned.add(node.id);
  node.activation = 0;
  node.pathology = Math.max(node.pathology, 0.85);
  writeLog(`LESION:${node.key}`, 0);
  refreshMetricOutputs();
  renderer.drawMatrix(state);
  updateCurrentConfigSummary();
  setSignalState("LESIONED", 1200);
}

function setHubMode(enabled) {
  state.hubMode = enabled;
  elements.detectHubs.classList.toggle("active", enabled);
  updateCurrentConfigSummary();
}

function setLabelMode(enabled) {
  state.labelMode = enabled;
  elements.toggleLabels.classList.toggle("active", enabled);
  elements.toggleLabels.textContent = enabled ? "Hide Main Region Names" : "Show Main Region Names";
  updateCurrentConfigSummary();
}

function handleModeChange(event) {
  const button = event.target.closest("[data-mode]");

  if (!button) {
    return;
  }

  setVisualizationMode(button.dataset.mode);
}

function setVisualizationMode(mode) {
  state.currentMode = mode;
  elements.currentMode.textContent = mode;
  elements.modeToggle.querySelectorAll(".mode-btn").forEach((item) => {
    item.classList.toggle("active", item.dataset.mode === mode);
  });
  updateCurrentConfigSummary();
}

function handleDiseaseChange(event) {
  const button = event.target.closest("[data-disease]");

  if (!button) {
    return;
  }

  setDisease(button.dataset.disease, {
    focusRegionKey: button.dataset.disease === "Healthy" ? "L_PFC" : DISEASE_PROFILES[button.dataset.disease]?.affectedRegions?.[0],
    resetGraph: true
  });
}

function handlePresetPathwayClick(event) {
  const button = event.target.closest("[data-source][data-target]");

  if (!button) {
    return;
  }

  elements.sourceRegion.value = button.dataset.source;
  elements.targetRegion.value = button.dataset.target;
  tracePathway();
}

function setDisease(name, { focusRegionKey = null, resetGraph = true, silent = false } = {}) {
  const profile = DISEASE_PROFILES[name];

  if (!profile) {
    return;
  }

  if (resetGraph) {
    resetConnectome();
  }

  state.selectedDisease = name;
  state.activeProfile = profile;

  elements.diseaseGrid.querySelectorAll(".disease-btn").forEach((item) => {
    item.classList.toggle("active", item.dataset.disease === name);
  });

  applyDiseaseToGraph(profile);
  applyTheme(profile);
  refreshMetricOutputs();
  renderDiseaseNarrative(profile);
  renderPathwayPresets(profile);
  renderComparison(profile);

  const selectedKey = focusRegionKey || profile.affectedRegions[0] || state.nodes[0]?.key;
  const focusNode = state.nodes.find((node) => node.key === selectedKey) || state.nodes[0];
  selectNode(focusNode, false);
  renderer.drawMatrix(state);
  updateCurrentConfigSummary();

  if (!silent) {
    startDiseaseTransition(profile);
    setSignalState(name.toUpperCase(), 900);
  }
}

function applyDiseaseToGraph(profile) {
  const affected = new Set(profile.affectedRegions);
  const networkWeights = profile.networkWeights || {};
  const regionWeights = profile.regionWeights || {};

  state.signals = [];
  state.lesioned.clear();
  elements.pathResult.hidden = true;

  for (const node of state.nodes) {
    const networkWeight = networkWeights[node.network] ?? 1;
    const regionWeight = regionWeights[node.key] ?? 1;
    const combinedWeight = Number((networkWeight * regionWeight).toFixed(2));
    const pathology = clamp(1 - combinedWeight, 0, 0.9);
    const affectedNode = affected.has(node.key);

    node.profileWeight = combinedWeight;
    node.pathology = affectedNode ? Math.max(pathology, 0.44) : pathology;
    node.diseaseState = affectedNode
      ? "affected"
      : combinedWeight < 0.88
        ? "disrupted"
        : combinedWeight > 1.04
          ? "compensating"
          : "baseline";

    const baseline = profile.visuals?.baselineActivation ?? 0.03;
    const affectedActivation = profile.visuals?.affectedActivation ?? 0.12;
    node.activation = affectedNode
      ? affectedActivation
      : clamp(baseline * Math.max(0.75, networkWeight), 0.01, 0.22);
  }

  for (const edge of state.edges) {
    const source = state.nodes[edge.a];
    const target = state.nodes[edge.b];
    const combinedWeight = (source.profileWeight + target.profileWeight) / 2;
    const affectedPenalty = (affected.has(source.key) || affected.has(target.key))
      ? profile.visuals?.edgeDrop ?? 0.12
      : 0;

    edge.diseaseWeight = clamp(combinedWeight - affectedPenalty, 0.22, 1.08);
    edge.active = 0;
  }
}

function applyTheme(profile) {
  const root = document.documentElement;
  root.style.setProperty("--disease-accent", profile.visuals?.accent || "#5aa8ff");
  root.style.setProperty("--disease-signal", profile.visuals?.signal || "#43d8c9");
  root.style.setProperty("--disease-glow", profile.visuals?.glow || "rgba(90, 168, 255, 0.22)");
}

function refreshMetricOutputs() {
  const metrics = state.activeProfile?.metrics || DISEASE_PROFILES.Healthy.metrics;
  const lesions = state.lesioned.size;
  const efficiency = Math.max(0.22, metrics.efficiency - lesions * 0.01);
  const clustering = Math.max(0.18, metrics.clustering - lesions * 0.008);
  const pathLength = Math.min(5.6, metrics.pathLength + lesions * 0.09);
  const modularity = Math.min(0.89, metrics.modularity + lesions * 0.012);
  const communities = metrics.communities + Math.min(2, Math.floor(lesions / 3));

  elements.metricEfficiency.textContent = efficiency.toFixed(3);
  elements.metricClustering.textContent = clustering.toFixed(3);
  elements.metricPathLength.textContent = pathLength.toFixed(2);
  elements.metricModularity.textContent = modularity.toFixed(3);
  elements.metricCommunities.textContent = String(communities);
  elements.communityCount.textContent = String(communities);
}

function renderDiseaseNarrative(profile) {
  const affectedCount = profile.affectedRegions.length;

  elements.diseaseInfo.textContent = profile.description;
  elements.overviewDiseaseName.textContent = profile.label;
  elements.overviewDiseaseSummary.textContent = profile.description;
  elements.overviewPrimaryCircuit.textContent = profile.primaryCircuit;
  elements.overviewPattern.textContent = profile.pattern;
  elements.overviewAffectedCount.textContent = String(affectedCount);
  elements.overviewSeverity.textContent = profile.severity;
  elements.conditionHeadline.textContent = profile.headline;
  elements.labCurrentDisease.textContent = profile.label;
  elements.labCurrentDescription.textContent = profile.description;
  elements.labHallmark.textContent = profile.hallmark;
  elements.labCircuit.textContent = profile.primaryCircuit;
  elements.labPattern.textContent = profile.pattern;
  elements.labAffectedCount.textContent = `${affectedCount} region${affectedCount === 1 ? "" : "s"}`;
  elements.profileDiseaseName.textContent = profile.label;
  elements.profileNote.textContent = profile.note;
  elements.profileHallmark.textContent = profile.hallmark;
  elements.profileCircuit.textContent = profile.primaryCircuit;
  elements.profilePattern.textContent = profile.pattern;
  elements.profileSeverity.textContent = profile.severity;
  renderAffectedRegions(profile.affectedRegions);
  renderClinicalNotes(profile.clinicalNotes || []);
  renderImpactList(elements.diseaseNetworkImpact, profile.networkImpacts || []);
  renderImpactList(elements.diseaseVisualImpact, profile.visualImpacts || []);
}

function renderClinicalNotes(notes) {
  const html = notes.map((item) => `
    <article class="clinical-note-card">
      <span>${item.title}</span>
      <strong>${item.value}</strong>
      <p>${item.note}</p>
    </article>
  `).join("");

  elements.clinicalNotesStrip.innerHTML = html;
  elements.labClinicalNotesStrip.innerHTML = html;
}

function renderPathwayPresets(profile) {
  const presets = profile.pathwayPresets || [];

  if (!presets.length) {
    elements.presetPathways.innerHTML = "";
    return;
  }

  elements.presetPathways.innerHTML = presets.map((preset) => `
    <button
      class="preset-path-btn"
      type="button"
      data-source="${preset.source}"
      data-target="${preset.target}"
    >
      ${preset.label}
    </button>
  `).join("");
}

function toggleComparePanel() {
  state.compareMode = !state.compareMode;
  elements.comparePanel.hidden = !state.compareMode;
  elements.toggleCompare.textContent = state.compareMode ? "Hide Comparison" : "Show Comparison";
  renderComparison(state.activeProfile);
}

function renderComparison(profile) {
  const healthy = DISEASE_PROFILES.Healthy?.metrics || {};
  const current = profile.metrics || {};
  const rows = [
    { label: "Global Efficiency", key: "efficiency", decimals: 3, direction: "higher-better" },
    { label: "Clustering", key: "clustering", decimals: 3, direction: "higher-better" },
    { label: "Path Length", key: "pathLength", decimals: 2, direction: "lower-better" },
    { label: "Modularity", key: "modularity", decimals: 3, direction: "contextual" },
    { label: "Communities", key: "communities", decimals: 0, direction: "contextual" }
  ];

  elements.compareGrid.innerHTML = rows.map((row) => {
    const baseline = healthy[row.key];
    const value = current[row.key];
    const delta = Number((value - baseline).toFixed(row.decimals));
    const deltaPrefix = delta > 0 ? "+" : "";
    const tone = resolveCompareTone(delta, row.direction);

    return `
      <article class="compare-card">
        <span>${row.label}</span>
        <strong>${value.toFixed ? value.toFixed(row.decimals) : value}</strong>
        <p>Healthy: ${baseline.toFixed ? baseline.toFixed(row.decimals) : baseline}</p>
        <p class="${tone}">Delta: ${deltaPrefix}${delta}</p>
      </article>
    `;
  }).join("");
}

function resolveCompareTone(delta, direction) {
  if (delta === 0) {
    return "compare-neutral";
  }

  if (direction === "higher-better") {
    return delta > 0 ? "compare-positive" : "compare-negative";
  }

  if (direction === "lower-better") {
    return delta < 0 ? "compare-positive" : "compare-negative";
  }

  return "compare-neutral";
}

function renderAffectedRegions(regionKeys) {
  if (!regionKeys.length) {
    elements.affectedRegionList.innerHTML = '<span class="affected-region-tag">No affected regions</span>';
    return;
  }

  elements.affectedRegionList.innerHTML = regionKeys
    .map((key) => {
      const region = REGION_BLUEPRINTS.find((item) => item.key === key);
      return `<span class="affected-region-tag">${region ? region.label : key}</span>`;
    })
    .join("");
}

function renderImpactList(container, items) {
  container.innerHTML = items
    .map((item) => {
      if (typeof item === "string") {
        return `
          <article class="impact-item">
            <strong>Visual cue</strong>
            <p>${item}</p>
          </article>
        `;
      }

      return `
        <article class="impact-item">
          <strong>${item.name} <span>${item.delta}</span></strong>
          <p>${item.note}</p>
        </article>
      `;
    })
    .join("");
}

function serializeCurrentConfig() {
  return {
    disease: state.selectedDisease,
    snapshotLabel: state.snapshotLabel,
    selectedRegion: state.selectedNode?.key || null,
    mode: state.currentMode,
    sliders: {
      strength: state.strength,
      decay: state.decay,
      speed: state.speed
    },
    toggles: {
      hubMode: state.hubMode,
      labelMode: state.labelMode,
      compareMode: state.compareMode
    },
    pathway: {
      source: elements.sourceRegion.value,
      target: elements.targetRegion.value
    },
    lesionedRegions: Array.from(state.lesioned).map((id) => state.nodes[id]?.key).filter(Boolean),
    nodeStates: state.nodes
      .filter((node) => node.activation > 0.08 || state.lesioned.has(node.id))
      .map((node) => ({
        key: node.key,
        activation: Number(node.activation.toFixed(3)),
        lesioned: state.lesioned.has(node.id)
      }))
  };
}

function applySavedConfig(config = {}, { showStatus = false, preserveNav = false } = {}) {
  const nextConfig = {
    disease: config.disease || "Healthy",
    snapshotLabel: config.snapshotLabel || "",
    selectedRegion: config.selectedRegion || config.selectedNode || "L_PFC",
    mode: config.mode || "CONNECTOME",
    sliders: config.sliders || {
      strength: state.strength,
      decay: state.decay,
      speed: state.speed
    },
    toggles: config.toggles || {
      hubMode: state.hubMode,
      labelMode: state.labelMode,
      compareMode: state.compareMode
    },
    pathway: config.pathway || {
      source: elements.sourceRegion.value,
      target: elements.targetRegion.value
    },
    lesionedRegions: config.lesionedRegions || [],
    nodeStates: config.nodeStates || []
  };

  setSliderValues(nextConfig.sliders);
  resetConnectome();
  setDisease(nextConfig.disease, {
    focusRegionKey: nextConfig.selectedRegion,
    resetGraph: false,
    silent: true
  });
  setVisualizationMode(nextConfig.mode);
  setHubMode(Boolean(nextConfig.toggles.hubMode));
  setLabelMode(Boolean(nextConfig.toggles.labelMode));
  state.compareMode = Boolean(nextConfig.toggles.compareMode);
  elements.comparePanel.hidden = !state.compareMode;
  elements.toggleCompare.textContent = state.compareMode ? "Hide Comparison" : "Show Comparison";
  state.snapshotLabel = nextConfig.snapshotLabel;
  elements.snapshotLabel.value = nextConfig.snapshotLabel;
  renderComparison(state.activeProfile);

  if (nextConfig.pathway?.source) {
    elements.sourceRegion.value = nextConfig.pathway.source;
  }

  if (nextConfig.pathway?.target) {
    elements.targetRegion.value = nextConfig.pathway.target;
  }

  for (const savedNode of nextConfig.nodeStates) {
    const node = state.nodes.find((candidate) => candidate.key === savedNode.key);
    if (!node) {
      continue;
    }

    node.activation = savedNode.lesioned ? 0 : Math.max(node.activation, savedNode.activation);

    if (savedNode.lesioned) {
      state.lesioned.add(node.id);
      node.pathology = Math.max(node.pathology, 0.85);
    }
  }

  for (const lesionKey of nextConfig.lesionedRegions) {
    const node = state.nodes.find((candidate) => candidate.key === lesionKey);
    if (!node) {
      continue;
    }

    state.lesioned.add(node.id);
    node.activation = 0;
    node.pathology = Math.max(node.pathology, 0.85);
  }

  refreshMetricOutputs();
  const focusNode = state.nodes.find((node) => node.key === nextConfig.selectedRegion) || state.nodes[0];
  selectNode(focusNode, false);
  renderer.drawMatrix(state);
  updateCurrentConfigSummary();

  if (showStatus && !preserveNav) {
    setSignalState("RESTORED", 1200);
  }
}

function updateCurrentConfigSummary() {
  const selectedRegion = state.selectedNode?.label || "No region selected";
  const lesions = Array.from(state.lesioned).map((id) => state.nodes[id]?.key).filter(Boolean);
  const lesionText = lesions.length ? lesions.join(", ") : "None";
  const html = `
    <article class="config-chip">
      <span>Snapshot Label</span>
      <strong>${state.snapshotLabel || "Untitled run"}</strong>
    </article>
    <article class="config-chip">
      <span>Condition</span>
      <strong>${state.selectedDisease}</strong>
    </article>
    <article class="config-chip">
      <span>View Mode</span>
      <strong>${state.currentMode}</strong>
    </article>
    <article class="config-chip">
      <span>Selected Region</span>
      <strong>${selectedRegion}</strong>
    </article>
    <article class="config-chip">
      <span>Sliders</span>
      <strong>S ${state.strength} | D ${state.decay} | V ${state.speed}</strong>
    </article>
    <article class="config-chip wide">
      <span>Lesions</span>
      <strong>${lesionText}</strong>
    </article>
    <article class="config-chip wide">
      <span>Flags</span>
      <strong>${state.hubMode ? "Hub detect on" : "Hub detect off"} | ${state.labelMode ? "Labels on" : "Labels off"} | ${state.compareMode ? "Compare on" : "Compare off"}</strong>
    </article>
  `;

  elements.currentConfigSummary.innerHTML = html;
  elements.historyConfigSummary.innerHTML = html;
}

async function saveSnapshot() {
  if (window.location.protocol === "file:") {
    setSignalState("START SERVER", 1400);
    return;
  }

  try {
    const response = await fetch("/api/simulations", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        disease: state.selectedDisease,
        label: state.snapshotLabel || null,
        selectedRegion: state.selectedNode?.key,
        activeCount: Number(elements.activeCount.textContent),
        lesionedCount: state.lesioned.size,
        metrics: {
          efficiency: Number(elements.metricEfficiency.textContent),
          clustering: Number(elements.metricClustering.textContent),
          pathLength: Number(elements.metricPathLength.textContent),
          modularity: Number(elements.metricModularity.textContent),
          communities: Number(elements.metricCommunities.textContent)
        },
        config: serializeCurrentConfig()
      })
    });

    if (!response.ok) {
      throw new Error(`Snapshot API returned ${response.status}`);
    }

    await loadSnapshots();
    setSignalState("SAVED", 1200);
  } catch (error) {
    console.warn("Could not save simulation snapshot.", error);
    setSignalState("SAVE FAILED", 1400);
  }
}

async function loadSnapshots() {
  if (window.location.protocol === "file:") {
    renderSnapshots([]);
    return;
  }

  try {
    const response = await fetch("/api/simulations");

    if (!response.ok) {
      throw new Error(`Snapshot API returned ${response.status}`);
    }

    state.snapshots = await response.json();
    renderSnapshots(state.snapshots);
  } catch (error) {
    console.warn("Could not load snapshot history.", error);
    renderSnapshots([]);
    elements.snapshotStatus.textContent = "Snapshot API unavailable. The dashboard still works, but history could not be loaded.";
  }
}

function renderSnapshots(snapshots) {
  if (!snapshots.length) {
    elements.snapshotStatus.textContent = window.location.protocol === "file:"
      ? "Open the project through `npm start` to load and save MongoDB-backed snapshots."
      : "MongoDB is connected, but no snapshots have been saved yet. Use the Save Snapshot button in the explorer.";
    elements.snapshotList.innerHTML = `
      <article class="snapshot-item empty">
        <strong>No snapshots loaded.</strong>
        <p>Save a run from the dashboard to store a simulation summary in MongoDB.</p>
      </article>
    `;
    return;
  }

  elements.snapshotStatus.textContent = "Saved runs include enough config state to restore the corresponding disease setup and controls.";
  elements.snapshotList.innerHTML = snapshots
    .slice(0, 8)
    .map((snapshot) => {
      const createdAt = formatTimestamp(snapshot.createdAt);
      const config = snapshot.config || {};
      const lesionCount = config.lesionedRegions?.length ?? snapshot.lesionedCount ?? 0;
      const mode = config.mode || "CONNECTOME";
      const title = snapshot.label || config.snapshotLabel || `${snapshot.disease} Simulation`;
      const sliders = config.sliders
        ? `S ${config.sliders.strength} / D ${config.sliders.decay} / V ${config.sliders.speed}`
        : "Default controls";

      return `
        <article class="snapshot-item">
          <div class="snapshot-item-top">
            <div>
              <strong>${title}</strong>
              <p>${createdAt}</p>
            </div>
            <button class="control-btn small" type="button" data-action="restore-snapshot" data-snapshot-id="${snapshot._id}">
              Restore Config
            </button>
          </div>
          <ul>
            <li><span>Disease</span><span>${snapshot.disease}</span></li>
            <li><span>Region</span><span>${snapshot.selectedRegion || config.selectedRegion || "N/A"}</span></li>
            <li><span>Mode</span><span>${mode}</span></li>
            <li><span>Lesions</span><span>${lesionCount}</span></li>
            <li><span>Controls</span><span>${sliders}</span></li>
            <li><span>Efficiency</span><span>${snapshot.metrics?.efficiency ?? "N/A"}</span></li>
          </ul>
        </article>
      `;
    })
    .join("");
}

function handleSnapshotAction(event) {
  const button = event.target.closest("[data-action='restore-snapshot']");

  if (!button) {
    return;
  }

  const snapshot = state.snapshots.find((item) => String(item._id) === button.dataset.snapshotId);

  if (!snapshot) {
    setSignalState("MISSING RUN", 1200);
    return;
  }

  restoreSnapshot(snapshot);
}

function restoreSnapshot(snapshot) {
  const config = snapshot.config || {
    disease: snapshot.disease,
    snapshotLabel: snapshot.label || "",
    selectedRegion: snapshot.selectedRegion,
    mode: "CONNECTOME",
    sliders: {
      strength: 80,
      decay: 30,
      speed: 60
    },
    toggles: {
      hubMode: false,
      labelMode: false,
      compareMode: false
    },
    pathway: {
      source: "L_PFC",
      target: "L_Hipp"
    },
    lesionedRegions: []
  };

  activateView("explorer", true);
  applySavedConfig(config, { showStatus: true });
}

function tracePathway() {
  const path = getPathway(elements.sourceRegion.value, elements.targetRegion.value);
  const rawStrength = Number(calculatePathStrength(path));
  const pathWeight = path.reduce((sum, key) => {
    const node = state.nodes.find((candidate) => candidate.key === key);
    return sum + (node?.profileWeight ?? 1);
  }, 0) / path.length;
  const strength = Math.max(0.32, rawStrength * Math.max(0.55, pathWeight)).toFixed(2);

  elements.pathResult.hidden = false;
  elements.pathText.textContent = path.join(" -> ");
  elements.pathHops.textContent = String(Math.max(0, path.length - 1));
  elements.pathStrength.textContent = strength;

  for (const key of path) {
    const node = state.nodes.find((candidate) => candidate.key === key);
    if (node && !state.lesioned.has(node.id)) {
      node.activation = Math.max(node.activation, 0.78);
      state.signals.push(createSignal(node, Math.round(Number(strength) * 100)));
    }
  }

  updateCurrentConfigSummary();
  setSignalState("PATHWAY", 1400);
}

function setSignalState(primary, primaryDuration = 1000, secondary = "IDLE", secondaryDuration = 0) {
  elements.signalState.textContent = primary;

  window.setTimeout(() => {
    elements.signalState.textContent = secondary;

    if (secondaryDuration > 0) {
      window.setTimeout(() => {
        elements.signalState.textContent = "IDLE";
      }, secondaryDuration);
    }
  }, primaryDuration);
}

function startDiseaseTransition(profile) {
  state.transitionUntil = performance.now() + 680;
  state.transitionIntensity = 1;
  elements.transitionDiseaseName.textContent = profile.label;
  elements.transitionOverlay.classList.add("active");
  elements.transitionOverlay.setAttribute("aria-hidden", "false");

  for (const key of profile.affectedRegions.slice(0, 4)) {
    const node = state.nodes.find((candidate) => candidate.key === key);
    if (node) {
      node.activation = Math.max(node.activation, 0.88);
      state.signals.push(createSignal(node, Math.max(55, state.strength)));
    }
  }

  window.clearTimeout(startDiseaseTransition.hideTimer);
  startDiseaseTransition.hideTimer = window.setTimeout(() => {
    elements.transitionOverlay.classList.remove("active");
    elements.transitionOverlay.setAttribute("aria-hidden", "true");
  }, 720);
}

function updateTransition(now) {
  if (state.transitionUntil <= now) {
    state.transitionIntensity = 0;
    return;
  }

  state.transitionIntensity = Math.max(0, (state.transitionUntil - now) / 680);
}

function updateGraphCounters() {
  const hubCount = state.nodes.filter((node) => node.isHub).length;

  elements.nodeCount.textContent = String(state.nodes.length);
  elements.edgeCount.textContent = String(state.edges.length);
  elements.hudNodes.textContent = String(state.nodes.length);
  elements.hudEdges.textContent = String(state.edges.length);
  elements.hubCount.textContent = String(hubCount);
}

function updateLiveMetrics() {
  const active = state.nodes.filter((node) => node.activation > 0.1).length;

  elements.activeCount.textContent = String(active);
  elements.lesionedCount.textContent = String(state.lesioned.size);

  if (state.selectedNode) {
    elements.regionActivation.textContent = state.selectedNode.activation.toFixed(2);
  }
}

function animate() {
  updateTransition(performance.now());
  renderer.drawBrain(state);
  updateLiveMetrics();
  state.animationFrame = window.requestAnimationFrame(animate);
}

function clamp(value, min, max) {
  return Math.min(max, Math.max(min, value));
}

function formatTimestamp(value) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return "Unknown time";
  }

  return date.toLocaleString();
}

init().catch((error) => {
  console.error("SYNAPSE failed to initialize.", error);
  elements.dataSourceStatus.textContent = "Startup Error";
});
})();
