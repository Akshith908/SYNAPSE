(() => {
const NETWORKS = {
  0: { name: "Default Mode", color: "#5aa8ff" },
  1: { name: "Visual", color: "#8f7cff" },
  2: { name: "Somatomotor", color: "#43d8c9" },
  3: { name: "Dorsal Attention", color: "#9ce05d" },
  4: { name: "Limbic", color: "#ffb14f" },
  5: { name: "Frontoparietal", color: "#ff7f96" },
  6: { name: "Subcortical", color: "#ff8f4d" }
};

const REGION_BLUEPRINTS = [
  { key: "L_PFC", label: "Left Prefrontal Cortex", hemi: "Left", network: 0, mni: "-24, 14, 52", hub: true },
  { key: "L_ACC", label: "Left Anterior Cingulate", hemi: "Left", network: 0, mni: "-6, 32, 24", hub: true },
  { key: "L_PCC", label: "Left Posterior Cingulate", hemi: "Left", network: 0, mni: "-4, -46, 30", hub: true },
  { key: "L_Hipp", label: "Left Hippocampus", hemi: "Left", network: 4, mni: "-28, -18, -16", hub: false },
  { key: "L_Amy", label: "Left Amygdala", hemi: "Left", network: 4, mni: "-22, -4, -18", hub: false },
  { key: "L_V1", label: "Left Primary Visual Cortex", hemi: "Left", network: 1, mni: "-14, -90, 8", hub: true },
  { key: "L_V2", label: "Left Visual Association", hemi: "Left", network: 1, mni: "-18, -82, 18", hub: false },
  { key: "L_M1", label: "Left Motor Cortex", hemi: "Left", network: 2, mni: "-38, -22, 58", hub: false },
  { key: "L_S1", label: "Left Somatosensory Cortex", hemi: "Left", network: 2, mni: "-42, -30, 54", hub: false },
  { key: "L_Ins", label: "Left Insula", hemi: "Left", network: 3, mni: "-34, 14, 2", hub: false },
  { key: "R_PFC", label: "Right Prefrontal Cortex", hemi: "Right", network: 0, mni: "26, 16, 50", hub: true },
  { key: "R_ACC", label: "Right Anterior Cingulate", hemi: "Right", network: 0, mni: "8, 34, 24", hub: false },
  { key: "R_PCC", label: "Right Posterior Cingulate", hemi: "Right", network: 0, mni: "6, -44, 30", hub: false },
  { key: "R_Hipp", label: "Right Hippocampus", hemi: "Right", network: 4, mni: "30, -18, -16", hub: false },
  { key: "R_Amy", label: "Right Amygdala", hemi: "Right", network: 4, mni: "24, -4, -18", hub: true },
  { key: "R_V1", label: "Right Primary Visual Cortex", hemi: "Right", network: 1, mni: "16, -90, 8", hub: false },
  { key: "R_V2", label: "Right Visual Association", hemi: "Right", network: 1, mni: "20, -82, 18", hub: false },
  { key: "R_M1", label: "Right Motor Cortex", hemi: "Right", network: 2, mni: "40, -22, 58", hub: false },
  { key: "R_S1", label: "Right Somatosensory Cortex", hemi: "Right", network: 2, mni: "44, -30, 54", hub: false },
  { key: "R_Ins", label: "Right Insula", hemi: "Right", network: 3, mni: "36, 14, 2", hub: false },
  { key: "L_DLPFC", label: "Left Dorsolateral PFC", hemi: "Left", network: 5, mni: "-42, 34, 28", hub: true },
  { key: "L_OFC", label: "Left Orbitofrontal Cortex", hemi: "Left", network: 4, mni: "-30, 28, -14", hub: false },
  { key: "L_IFG", label: "Left Inferior Frontal Gyrus", hemi: "Left", network: 5, mni: "-46, 22, 12", hub: false },
  { key: "L_SFG", label: "Left Superior Frontal Gyrus", hemi: "Left", network: 5, mni: "-18, 44, 36", hub: false },
  { key: "L_STG", label: "Left Superior Temporal Gyrus", hemi: "Left", network: 3, mni: "-52, -18, 4", hub: false },
  { key: "L_MTG", label: "Left Middle Temporal Gyrus", hemi: "Left", network: 3, mni: "-56, -44, 2", hub: false },
  { key: "L_ITG", label: "Left Inferior Temporal Gyrus", hemi: "Left", network: 4, mni: "-50, -58, -10", hub: false },
  { key: "L_SPL", label: "Left Superior Parietal Lobule", hemi: "Left", network: 3, mni: "-24, -62, 52", hub: false },
  { key: "L_IPL", label: "Left Inferior Parietal Lobule", hemi: "Left", network: 5, mni: "-44, -50, 42", hub: false },
  { key: "L_Precun", label: "Left Precuneus", hemi: "Left", network: 0, mni: "-8, -58, 48", hub: false },
  { key: "R_DLPFC", label: "Right Dorsolateral PFC", hemi: "Right", network: 5, mni: "44, 34, 28", hub: true },
  { key: "R_OFC", label: "Right Orbitofrontal Cortex", hemi: "Right", network: 4, mni: "32, 28, -14", hub: false },
  { key: "R_IFG", label: "Right Inferior Frontal Gyrus", hemi: "Right", network: 5, mni: "48, 22, 12", hub: false },
  { key: "R_SFG", label: "Right Superior Frontal Gyrus", hemi: "Right", network: 5, mni: "20, 44, 36", hub: false },
  { key: "R_STG", label: "Right Superior Temporal Gyrus", hemi: "Right", network: 3, mni: "54, -18, 4", hub: false },
  { key: "R_MTG", label: "Right Middle Temporal Gyrus", hemi: "Right", network: 3, mni: "58, -44, 2", hub: false },
  { key: "R_ITG", label: "Right Inferior Temporal Gyrus", hemi: "Right", network: 4, mni: "52, -58, -10", hub: false },
  { key: "R_SPL", label: "Right Superior Parietal Lobule", hemi: "Right", network: 3, mni: "26, -62, 52", hub: false },
  { key: "R_IPL", label: "Right Inferior Parietal Lobule", hemi: "Right", network: 5, mni: "46, -50, 42", hub: false },
  { key: "R_Precun", label: "Right Precuneus", hemi: "Right", network: 0, mni: "10, -58, 48", hub: false },
  { key: "L_Caud", label: "Left Caudate", hemi: "Left", network: 6, mni: "-12, 10, 8", hub: true },
  { key: "L_Put", label: "Left Putamen", hemi: "Left", network: 6, mni: "-24, 4, 2", hub: false },
  { key: "L_Thal", label: "Left Thalamus", hemi: "Left", network: 6, mni: "-12, -18, 8", hub: false },
  { key: "L_Cing", label: "Left Cingulate Cortex", hemi: "Left", network: 0, mni: "-8, -12, 36", hub: true },
  { key: "L_SMA", label: "Left Supplementary Motor Area", hemi: "Left", network: 2, mni: "-6, -4, 58", hub: false },
  { key: "R_Caud", label: "Right Caudate", hemi: "Right", network: 6, mni: "14, 10, 8", hub: false },
  { key: "R_Put", label: "Right Putamen", hemi: "Right", network: 6, mni: "26, 4, 2", hub: false },
  { key: "R_Thal", label: "Right Thalamus", hemi: "Right", network: 6, mni: "14, -18, 8", hub: false },
  { key: "R_Cing", label: "Right Cingulate Cortex", hemi: "Right", network: 0, mni: "10, -12, 36", hub: false },
  { key: "R_SMA", label: "Right Supplementary Motor Area", hemi: "Right", network: 2, mni: "8, -4, 58", hub: false },
  { key: "L_FEF", label: "Left Frontal Eye Field", hemi: "Left", network: 3, mni: "-30, -4, 52", hub: true },
  { key: "R_FEF", label: "Right Frontal Eye Field", hemi: "Right", network: 3, mni: "32, -4, 52", hub: true },
  { key: "L_TPJ", label: "Left Temporoparietal Junction", hemi: "Left", network: 5, mni: "-50, -48, 26", hub: true },
  { key: "R_TPJ", label: "Right Temporoparietal Junction", hemi: "Right", network: 5, mni: "52, -48, 26", hub: true },
  { key: "L_ENT", label: "Left Entorhinal Cortex", hemi: "Left", network: 4, mni: "-24, -10, -28", hub: false },
  { key: "R_ENT", label: "Right Entorhinal Cortex", hemi: "Right", network: 4, mni: "26, -10, -28", hub: false },
  { key: "L_CBM", label: "Left Cerebellum", hemi: "Left", network: 2, mni: "-28, -62, -26", hub: false },
  { key: "R_CBM", label: "Right Cerebellum", hemi: "Right", network: 2, mni: "30, -62, -26", hub: false },
  { key: "L_NAcc", label: "Left Nucleus Accumbens", hemi: "Left", network: 6, mni: "-10, 10, -8", hub: false },
  { key: "R_NAcc", label: "Right Nucleus Accumbens", hemi: "Right", network: 6, mni: "12, 10, -8", hub: false }
];

const DISEASE_PROFILES = {
  Healthy: {
    label: "Healthy",
    headline: "Reference connectome state",
    severity: "Reference baseline",
    hallmark: "Stable inter-network synchrony",
    primaryCircuit: "Whole-brain integration",
    pattern: "Distributed synchrony preserved",
    description: "Baseline HCP-style sample connectome. Default mode, frontoparietal, motor, and subcortical systems retain balanced communication with short relay paths.",
    note: "Use this as the control condition for comparison during demos.",
    metrics: {
      efficiency: 0.847,
      clustering: 0.612,
      pathLength: 2.31,
      modularity: 0.489,
      communities: 7
    },
    affectedRegions: [],
    networkWeights: { 0: 1, 1: 1, 2: 1, 3: 1, 4: 1, 5: 1, 6: 1 },
    regionWeights: {},
    networkImpacts: [
      { name: "Default Mode", delta: "Stable", note: "Posterior cingulate and medial prefrontal hubs remain well coupled." },
      { name: "Motor Loop", delta: "Stable", note: "Somatomotor and basal-ganglia relay stays efficient." },
      { name: "Limbic Memory", delta: "Stable", note: "Hippocampal-entorhinal pathways show preserved routing." }
    ],
    clinicalNotes: [
      { title: "Primary Impairment", value: "None", note: "Use as the control reference against all disease conditions." },
      { title: "Most Affected Circuit", value: "None", note: "Default mode, motor, and limbic loops are all preserved." },
      { title: "Typical Visual Cue", value: "Balanced matrix", note: "No focal pathology tint or regional dropout is emphasized." }
    ],
    pathwayPresets: [
      { label: "Executive to Memory", source: "L_PFC", target: "L_Hipp" },
      { label: "Visual Relay", source: "L_V1", target: "L_V2" },
      { label: "Motor to Insula", source: "R_M1", target: "L_Ins" }
    ],
    visualImpacts: [
      "Cool-toned matrix with balanced diagonal intensity.",
      "No pathology tint on nodes or edge attenuation.",
      "Affected-region list stays empty to reinforce the control state."
    ],
    visuals: {
      accent: "#5aa8ff",
      signal: "#43d8c9",
      glow: "rgba(90, 168, 255, 0.22)",
      matrixHue: 198,
      baselineActivation: 0.03,
      affectedActivation: 0.1,
      edgeDrop: 0.02
    }
  },
  "Alzheimer's": {
    label: "Alzheimer's",
    headline: "Mnemonic circuit breakdown",
    severity: "Progressive temporal-limbic loss",
    hallmark: "Hippocampal-entorhinal disconnection",
    primaryCircuit: "Limbic and default-mode memory loop",
    pattern: "Longer relay paths and fragmented posterior memory routing",
    description: "Reduced hippocampal and entorhinal connectivity with posterior cingulate involvement. The model simulates memory-network fragmentation and weaker default-mode coordination.",
    note: "Believable demo behavior: memory-related hubs look stressed, warm-tinted, and less integrated into the rest of the graph.",
    metrics: {
      efficiency: 0.634,
      clustering: 0.441,
      pathLength: 3.12,
      modularity: 0.553,
      communities: 8
    },
    affectedRegions: ["L_Hipp", "R_Hipp", "L_ENT", "R_ENT", "L_PCC", "R_PCC"],
    networkWeights: { 0: 0.78, 1: 0.96, 2: 0.94, 3: 0.9, 4: 0.66, 5: 0.86, 6: 0.92 },
    regionWeights: {
      L_Hipp: 0.34,
      R_Hipp: 0.34,
      L_ENT: 0.28,
      R_ENT: 0.28,
      L_PCC: 0.52,
      R_PCC: 0.52,
      L_Precun: 0.72,
      R_Precun: 0.72
    },
    networkImpacts: [
      { name: "Limbic Memory", delta: "Strong decrease", note: "Hippocampus and entorhinal cortex lose relay strength first." },
      { name: "Default Mode", delta: "Moderate decrease", note: "Posterior cingulate and precuneus become less cohesive." },
      { name: "Frontoparietal", delta: "Mild compensation", note: "Executive hubs retain some activity but cannot fully offset memory loss." }
    ],
    clinicalNotes: [
      { title: "Primary Impairment", value: "Memory encoding", note: "Hippocampal-entorhinal communication is intentionally weakened." },
      { title: "Most Affected Circuit", value: "Limbic / DMN", note: "Posterior memory pathways and default-mode coordination degrade together." },
      { title: "Typical Visual Cue", value: "Amber temporal glow", note: "Warm pathology tones cluster around hippocampal and posterior cingulate regions." }
    ],
    pathwayPresets: [
      { label: "Memory Loop", source: "L_Hipp", target: "R_PFC" },
      { label: "Posterior Recall", source: "L_ENT", target: "R_PCC" },
      { label: "Amygdala to Temporal", source: "L_Amy", target: "L_STG" }
    ],
    visualImpacts: [
      "Warm amber pathology glow on hippocampal and entorhinal regions.",
      "Matrix becomes patchier with weaker off-diagonal memory blocks.",
      "Edge opacity falls around limbic-default mode connections."
    ],
    visuals: {
      accent: "#ffb14f",
      signal: "#ff8f4d",
      glow: "rgba(255, 177, 79, 0.24)",
      matrixHue: 32,
      baselineActivation: 0.02,
      affectedActivation: 0.16,
      edgeDrop: 0.18
    }
  },
  "Parkinson's": {
    label: "Parkinson's",
    headline: "Motor loop gating deficit",
    severity: "Subcortical-motor slowdown",
    hallmark: "Basal-ganglia and SMA disruption",
    primaryCircuit: "Subcortical-thalamic motor relay",
    pattern: "Selective motor inefficiency with partially preserved cortical integration",
    description: "Disrupted basal ganglia, supplementary motor area, and thalamic relay are approximated through reduced somatomotor throughput and noisier subcortical coupling.",
    note: "This condition should look more concentrated than Alzheimer's: the disruption is narrower, deeper, and centered on motor-control loops.",
    metrics: {
      efficiency: 0.712,
      clustering: 0.521,
      pathLength: 2.88,
      modularity: 0.512,
      communities: 7
    },
    affectedRegions: ["L_Caud", "R_Caud", "L_Put", "R_Put", "L_SMA", "R_SMA", "L_Thal", "R_Thal"],
    networkWeights: { 0: 0.94, 1: 0.98, 2: 0.72, 3: 0.9, 4: 0.96, 5: 0.91, 6: 0.68 },
    regionWeights: {
      L_Caud: 0.38,
      R_Caud: 0.4,
      L_Put: 0.35,
      R_Put: 0.35,
      L_SMA: 0.5,
      R_SMA: 0.5,
      L_Thal: 0.62,
      R_Thal: 0.62
    },
    networkImpacts: [
      { name: "Motor Loop", delta: "Strong decrease", note: "SMA, caudate, and putamen show the clearest throughput loss." },
      { name: "Subcortical Relay", delta: "Moderate decrease", note: "Thalamic gating becomes less efficient and more segmented." },
      { name: "Executive Control", delta: "Mild preservation", note: "Frontal hubs remain comparatively readable for contrast." }
    ],
    clinicalNotes: [
      { title: "Primary Impairment", value: "Motor initiation", note: "The simulation biases disruption toward basal-ganglia gating and SMA throughput." },
      { title: "Most Affected Circuit", value: "Subcortical motor relay", note: "Caudate, putamen, thalamus, and SMA carry the clearest attenuation." },
      { title: "Typical Visual Cue", value: "Concentrated orange disruption", note: "The graph keeps more global structure than Alzheimer's while the motor loop thins out." }
    ],
    pathwayPresets: [
      { label: "Caudate to SMA", source: "L_Caud", target: "L_SMA" },
      { label: "Motor Relay", source: "R_Put", target: "R_Thal" },
      { label: "Cross-Motor", source: "R_M1", target: "L_Ins" }
    ],
    visualImpacts: [
      "Orange-red emphasis around basal ganglia and SMA nodes.",
      "Matrix retains more structure than Alzheimer's but loses motor/subcortical contrast.",
      "Motor-related edges thin out while frontal edges stay relatively intact."
    ],
    visuals: {
      accent: "#ff8f4d",
      signal: "#ffcf5c",
      glow: "rgba(255, 143, 77, 0.22)",
      matrixHue: 18,
      baselineActivation: 0.025,
      affectedActivation: 0.18,
      edgeDrop: 0.16
    }
  },
  Schizophrenia: {
    label: "Schizophrenia",
    headline: "Distributed dysconnectivity state",
    severity: "Frontotemporal-thalamic decoupling",
    hallmark: "Prefrontal, temporal, and thalamic mismatch",
    primaryCircuit: "Frontotemporal association loop",
    pattern: "Diffuse cortical-subcortical fragmentation with elevated modularity",
    description: "Reduced prefrontal-temporal connectivity with weaker thalamic relay and noisier cross-network communication. The model favors distributed dysconnectivity rather than a single focal lesion pattern.",
    note: "This one should feel visibly different because the disruption is broad, not just local. The graph should look more segmented and less coherent overall.",
    metrics: {
      efficiency: 0.658,
      clustering: 0.478,
      pathLength: 3.04,
      modularity: 0.536,
      communities: 9
    },
    affectedRegions: ["L_PFC", "R_PFC", "L_DLPFC", "R_DLPFC", "L_STG", "R_STG", "L_Thal", "R_Thal"],
    networkWeights: { 0: 0.86, 1: 0.95, 2: 0.92, 3: 0.82, 4: 0.88, 5: 0.72, 6: 0.76 },
    regionWeights: {
      L_PFC: 0.46,
      R_PFC: 0.46,
      L_DLPFC: 0.42,
      R_DLPFC: 0.42,
      L_STG: 0.48,
      R_STG: 0.48,
      L_Thal: 0.54,
      R_Thal: 0.54,
      L_IFG: 0.7,
      R_IFG: 0.7
    },
    networkImpacts: [
      { name: "Frontoparietal", delta: "Strong decrease", note: "Executive integration weakens and hub coordination feels less stable." },
      { name: "Attention / Temporal", delta: "Moderate decrease", note: "Superior temporal and insular regions desynchronize more often." },
      { name: "Subcortical Relay", delta: "Moderate decrease", note: "Thalamic filtering is reduced, increasing apparent fragmentation." }
    ],
    clinicalNotes: [
      { title: "Primary Impairment", value: "Distributed integration", note: "This condition is modeled as broad dysconnectivity rather than a single focal deficit." },
      { title: "Most Affected Circuit", value: "Frontotemporal-thalamic", note: "Executive, temporal, and relay hubs lose coordinated timing." },
      { title: "Typical Visual Cue", value: "Segmented violet matrix", note: "Modules become more separated and long-range coherence looks noisier." }
    ],
    pathwayPresets: [
      { label: "Frontal to Temporal", source: "L_PFC", target: "L_STG" },
      { label: "DLPFC to Thalamus", source: "R_DLPFC", target: "R_Thal" },
      { label: "Association Drift", source: "L_IFG", target: "R_STG" }
    ],
    visualImpacts: [
      "Magenta-violet pathology tones spread across frontal and temporal hubs.",
      "Matrix becomes more modular with sharper separations between blocks.",
      "Affected hubs still stand out, but their connecting edges lose consistency."
    ],
    visuals: {
      accent: "#d56eff",
      signal: "#8f7cff",
      glow: "rgba(213, 110, 255, 0.24)",
      matrixHue: 284,
      baselineActivation: 0.02,
      affectedActivation: 0.17,
      edgeDrop: 0.2
    }
  }
};

const SAMPLE_PATHS = {
  "L_PFC:L_Hipp": ["L_PFC", "L_ACC", "L_Cing", "L_Hipp"],
  "L_V1:L_V2": ["L_V1", "L_V2"],
  "L_Hipp:R_PFC": ["L_Hipp", "L_PCC", "R_PCC", "R_PFC"],
  "L_Amy:L_STG": ["L_Amy", "L_Ins", "L_STG"],
  "R_M1:L_Ins": ["R_M1", "R_SMA", "R_Cing", "L_Ins"]
};

window.SynapseData = {
  NETWORKS,
  REGION_BLUEPRINTS,
  DISEASE_PROFILES,
  SAMPLE_PATHS
};
})();
