/**
 * SwasthaSevaAI — script.js v2
 * New in this version:
 * - Animated number counters on stat cards
 * - Shimmer loading state on cards
 * - Hospital info banner update
 * - Last-updated timestamp on admin page
 * - Animated admin stat counters
 * - Cleaner error UX
 */

const API_URL = "https://swasthasevaai-backend-f15e.onrender.com";
let forecastChart = null;

// ── HOSPITAL NETWORK ──────────────────────────────
const HOSPITALS = {
  "Bihar": {
    "Patna":       ["PMCH Patna", "IGIMS Patna", "AIIMS Patna"],
    "Gaya":        ["ANMMCH Gaya", "JPN Hospital Gaya", "ID Hospital Gaya"],
    "Muzaffarpur": ["SKMCH Muzaffarpur", "Sadar Hospital Muzaffarpur", "Homi Bhabha Cancer Hospital"]
  },
  "Uttar Pradesh": {
    "Lucknow":   ["KGMU Lucknow", "SGPGIMS Lucknow", "Balrampur Hospital"],
    "Gorakhpur": ["AIIMS Gorakhpur", "NSCBD Hospital Gorakhpur", "District Women Hospital Gorakhpur"],
    "Varanasi":  ["Lal Bahadur Shastri Hospital", "Pandit Deen Dayal Hospital Varanasi"]
  },
  "Jharkhand": {
    "Ranchi":     ["RIMS Ranchi", "CIP Ranchi", "RINPAS Ranchi"],
    "Dhanbad":    ["Central Hospital Dhanbad", "Sadar Hospital Dhanbad", "Divisional Hospital Dhanbad"],
    "Jamshedpur": ["MGM Medical College", "Sadar Hospital Jamshedpur", "Tata Main Hospital"]
  },
  "Gujarat": {
    "Ahmedabad": ["Civil Hospital Ahmedabad", "VS Hospital", "LG Hospital"],
    "Surat":     ["New Civil Hospital Surat", "SMIMER Hospital", "Govt ENT Hospital"],
    "Rajkot":    ["PDU Medical College", "Civil Hospital Rajkot"]
  },
  "Maharashtra": {
    "Mumbai": ["KEM Hospital", "Nair Hospital", "Cooper Hospital"],
    "Pune":   ["Sassoon Hospital", "Jehangir Hospital", "Ruby Hall Clinic"],
    "Nagpur": ["GMCH Nagpur", "IGGMCH Nagpur"]
  }
};

// ── ANIMATED COUNTER ──────────────────────────────
function animateValue(el, from, to, duration = 700) {
  if (!el || isNaN(to)) return;
  const start = performance.now();
  function step(now) {
    const progress = Math.min((now - start) / duration, 1);
    // ease out cubic
    const eased = 1 - Math.pow(1 - progress, 3);
    el.textContent = Math.round(from + (to - from) * eased);
    if (progress < 1) requestAnimationFrame(step);
  }
  requestAnimationFrame(step);
}

// ── SHIMMER LOADING ───────────────────────────────
function setLoading(on) {
  const ids = ["predPatients", "predBeds", "predDoctors", "predAvailBeds", "predRisk"];
  const cards = document.querySelectorAll(".stat-card");
  cards.forEach(c => on ? c.classList.add("loading") : c.classList.remove("loading"));
  ids.forEach(id => {
    const el = document.getElementById(id);
    if (el) el.textContent = on ? "—" : el.textContent;
  });
}

// ── DROPDOWNS ─────────────────────────────────────
function updateDistricts() {
  const state = document.getElementById("stateSelect")?.value;
  const distEl = document.getElementById("districtSelect");
  const hospEl = document.getElementById("hospitalSelect");
  distEl.innerHTML = '<option value="">Select District</option>';
  hospEl.innerHTML = '<option value="">Select Hospital</option>';
  document.getElementById("hospitalBanner")?.classList.remove("visible");
  if (!state || !HOSPITALS[state]) return;
  Object.keys(HOSPITALS[state]).forEach(d => {
    distEl.innerHTML += `<option value="${d}">${d}</option>`;
  });
}

function updateHospitals() {
  const state = document.getElementById("stateSelect")?.value;
  const district = document.getElementById("districtSelect")?.value;
  const hospEl = document.getElementById("hospitalSelect");
  hospEl.innerHTML = '<option value="">Select Hospital</option>';
  if (!state || !district || !HOSPITALS[state]?.[district]) return;
  HOSPITALS[state][district].forEach(h => {
    hospEl.innerHTML += `<option value="${h}">${h}</option>`;
  });
}

// ── ADMIN LOGIN MODAL ─────────────────────────────
function openAdminLogin() {
  const sel = document.getElementById("adminHospitalSelect");
  if (sel) {
    sel.innerHTML = '<option value="">Select your hospital</option>';
    Object.keys(HOSPITALS).forEach(state => {
      const grp = document.createElement("optgroup");
      grp.label = state;
      Object.keys(HOSPITALS[state]).forEach(district => {
        HOSPITALS[state][district].forEach(h => {
          grp.innerHTML += `<option value="${h}">${h}</option>`;
        });
      });
      sel.appendChild(grp);
    });
  }
  document.getElementById("adminModal").classList.add("open");
  setTimeout(() => document.getElementById("adminHospitalSelect")?.focus(), 100);
}

function closeAdminLogin() {
  document.getElementById("adminModal").classList.remove("open");
  const errEl = document.getElementById("loginError");
  if (errEl) errEl.style.display = "none";
  const pwEl = document.getElementById("adminPasswordInput");
  if (pwEl) pwEl.value = "";
}

function loginAdmin() {
  const hospital = document.getElementById("adminHospitalSelect").value;
  const pass = document.getElementById("adminPasswordInput").value;
  const errEl = document.getElementById("loginError");

  if (!hospital) { errEl.textContent = "Please select your hospital."; errEl.style.display = "block"; return; }
  if (!pass)     { errEl.textContent = "Please enter your password."; errEl.style.display = "block"; return; }

  const expected = hospital.toLowerCase().replace(/\s+/g, "") + "@swastha";
  if (pass === expected) {
    sessionStorage.setItem("loggedHospital", hospital);
    window.location.href = "admin.html";
  } else {
    errEl.textContent = `Incorrect password. Hint: ${hospital.toLowerCase().replace(/\s+/g, "")}@swastha`;
    errEl.style.display = "block";
    document.getElementById("adminPasswordInput").value = "";
    document.getElementById("adminPasswordInput").focus();
  }
}

document.addEventListener("DOMContentLoaded", () => {
  document.getElementById("adminPasswordInput")?.addEventListener("keydown", e => {
    if (e.key === "Enter") loginAdmin();
  });
});

// ── MAIN PREDICTION ───────────────────────────────
async function runPrediction() {
  const state    = document.getElementById("stateSelect")?.value;
  const district = document.getElementById("districtSelect")?.value;
  const hospital = document.getElementById("hospitalSelect")?.value;
  const monsoon  = document.getElementById("monsoonCheck")?.checked || false;
  const outbreak = document.getElementById("outbreakCheck")?.checked || false;

  if (!state || !district || !hospital) {
    showAlert("danger", "<strong>Selection required</strong><p>Please choose a State, District, and Hospital before running prediction.</p>");
    return;
  }

  const btn = document.getElementById("predictBtn");
  const origHTML = btn.innerHTML;
  btn.innerHTML = '<span class="spinner"></span> Analysing...';
  btn.disabled = true;
  setLoading(true);

  try {
    // Try backend first, then localStorage
    let hData = null;
    try {
      const r = await fetch(`${API_URL}/hospital/${encodeURIComponent(hospital)}`);
      if (r.ok) hData = await r.json();
    } catch (_) {}

    if (!hData) {
      const cached = localStorage.getItem("hospital_" + hospital);
      if (cached) {
        hData = JSON.parse(cached);
        showAlert("warning", "<strong>Using cached data</strong><p>The hospital admin has not submitted live data yet. Showing locally cached values.</p>");
      }
    }

    if (!hData) {
      showAlert("danger", `<strong>No data for ${hospital}</strong><p>The hospital administrator must log in and submit current data before a prediction can run.</p>`);
      setLoading(false);
      return;
    }

    // Update hospital banner with last_updated
    if (hData.last_updated) {
      const t = new Date(hData.last_updated);
      const elapsed = Math.round((Date.now() - t.getTime()) / 60000);
      const txt = elapsed < 1 ? "Just now" : elapsed < 60 ? `${elapsed}m ago` : `${Math.round(elapsed/60)}h ago`;
      const el = document.getElementById("bannerUpdatedText");
      if (el) el.textContent = "Updated " + txt;
    }

    const payload = {
      district,
      current_patients: hData.current_patients,
      occupied_beds:    hData.occupied_beds,
      total_beds:       hData.total_beds,
      doctors_on_duty:  hData.doctors_on_duty,
      monsoon, viral_outbreak: outbreak
    };

    const res = await fetch(`${API_URL}/predict`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload)
    });
    if (!res.ok) { const e = await res.json(); throw new Error(e.detail || `Server ${res.status}`); }

    const result = await res.json();
    setLoading(false);
    renderResults(result, hospital, state, district);

  } catch (err) {
    setLoading(false);
    showAlert("danger", `<strong>Prediction failed</strong><p>${err.message}. The backend may be cold-starting — please wait 30 seconds and try again.</p>`);
    console.error(err);
  } finally {
    btn.innerHTML = origHTML;
    btn.disabled = false;
  }
}

// ── RENDER RESULTS ────────────────────────────────
function renderResults(result, hospital, state, district) {
  // Animate stat card numbers
  const prev = {
    patients: parseInt(document.getElementById("predPatients").textContent) || 0,
    beds:     parseInt(document.getElementById("predBeds").textContent) || 0,
    doctors:  parseInt(document.getElementById("predDoctors").textContent) || 0,
    avail:    parseInt(document.getElementById("predAvailBeds").textContent) || 0
  };
  animateValue(document.getElementById("predPatients"),  prev.patients, result.predicted_patients);
  animateValue(document.getElementById("predBeds"),      prev.beds,     result.beds_required);
  animateValue(document.getElementById("predDoctors"),   prev.doctors,  result.doctors_required);
  animateValue(document.getElementById("predAvailBeds"), prev.avail,    result.available_beds);

  // Risk badge
  const riskEl = document.getElementById("predRisk");
  riskEl.textContent = result.risk_level;
  riskEl.className = "";
  const riskClass = { LOW: "risk-low", MEDIUM: "risk-medium", HIGH: "risk-high" };
  riskEl.className = riskClass[result.risk_level] || "";

  // Occupancy bar
  const pct = result.bed_occupancy_percent;
  const fill = document.getElementById("occFill");
  if (fill) {
    fill.style.width = Math.min(100, pct) + "%";
    fill.className = "occ-fill" + (pct > 85 ? " high" : pct > 70 ? " medium" : "");
  }
  const occPct = document.getElementById("occPercent");
  if (occPct) occPct.textContent = pct + "%";

  // Alert / suggestion
  const alertBox = document.getElementById("alertBox");
  if (result.bed_shortage) {
    const alts = getAlternatives(state, district, hospital);
    const altHTML = alts.length
      ? `<p>Suggested alternatives in ${district}: <strong>${alts.join(", ")}</strong></p>`
      : `<p>Check hospitals in neighbouring districts.</p>`;
    alertBox.className = "alert-box alert-danger";
    alertBox.innerHTML = `<strong>Bed Shortage Warning — ${hospital} may be short by ${result.beds_short_by} beds</strong><p>${result.message}</p>${altHTML}`;
    alertBox.style.display = "block";
  } else {
    alertBox.className = "alert-box alert-" + (result.risk_level === "LOW" ? "success" : "warning");
    alertBox.innerHTML = `<strong>${result.message}</strong>`;
    alertBox.style.display = "block";
  }

  if (result.epidemic_risk) {
    alertBox.innerHTML += `<p><strong>Epidemic Surge Detected:</strong> Patient load is 60%+ above normal. Alert district health authorities immediately.</p>`;
  }

  renderChart(result.predicted_patients, result.risk_level);
}

// ── FORECAST CHART ────────────────────────────────
function renderChart(base, riskLevel) {
  const trend = riskLevel === "HIGH" ? 1.04 : riskLevel === "MEDIUM" ? 1.02 : 1.0;
  const labels = ["Today", "Day 2", "Day 3", "Day 4", "Day 5", "Day 6", "Day 7"];
  const data = labels.map((_, i) => Math.max(0, Math.round(base * Math.pow(trend, i) + (Math.random() * 12 - 6))));

  const colors = {
    LOW:    { line: "#0ea5a0", bg: "rgba(14,165,160,0.08)" },
    MEDIUM: { line: "#f2994a", bg: "rgba(242,153,74,0.08)" },
    HIGH:   { line: "#eb5757", bg: "rgba(235,87,87,0.08)" }
  };
  const c = colors[riskLevel] || colors.LOW;

  if (forecastChart) forecastChart.destroy();
  const ctx = document.getElementById("forecastChart");
  if (!ctx) return;

  forecastChart = new Chart(ctx, {
    type: "line",
    data: {
      labels,
      datasets: [{
        label: "Predicted patients",
        data,
        borderColor: c.line,
        backgroundColor: c.bg,
        borderWidth: 2.5,
        pointBackgroundColor: c.line,
        pointRadius: 4,
        pointHoverRadius: 6,
        fill: true,
        tension: 0.45
      }]
    },
    options: {
      responsive: true,
      animation: { duration: 800, easing: "easeOutQuart" },
      plugins: {
        legend: { display: false },
        tooltip: { callbacks: { label: ctx => ` ${ctx.parsed.y} patients` } }
      },
      scales: {
        y: { beginAtZero: false, grid: { color: "rgba(0,0,0,0.05)" }, ticks: { font: { family: "'DM Mono'" } } },
        x: { grid: { display: false } }
      }
    }
  });
}

// ── HELPERS ───────────────────────────────────────
function getAlternatives(state, district, current) {
  return (HOSPITALS[state]?.[district] || []).filter(h => h !== current);
}

function showAlert(type, html) {
  const box = document.getElementById("alertBox");
  if (!box) return;
  box.className = `alert-box alert-${type}`;
  box.innerHTML = html;
  box.style.display = "block";
  box.scrollIntoView({ behavior: "smooth", block: "nearest" });
}

// ── ADMIN PAGE ────────────────────────────────────
function initAdminPage() {
  const nameEl = document.getElementById("adminHospitalName");
  if (!nameEl) return;

  const hospital = sessionStorage.getItem("loggedHospital");
  if (!hospital) { window.location.href = "index.html"; return; }

  nameEl.textContent = hospital;
  const badgeEl = document.getElementById("adminBadgeName");
  if (badgeEl) badgeEl.textContent = hospital;

  // Pre-fill from localStorage cache
  const cached = localStorage.getItem("hospital_" + hospital);
  if (cached) {
    const d = JSON.parse(cached);
    const map = { inpPatients: d.current_patients, inpTotalBeds: d.total_beds, inpOccupied: d.occupied_beds, inpDoctors: d.doctors_on_duty, inpIcuBeds: d.icu_beds, inpIcuOccupied: d.icu_occupied };
    Object.entries(map).forEach(([id, val]) => {
      const el = document.getElementById(id);
      if (el && val !== undefined) el.value = val;
    });
    // Update last-updated badge
    if (d.last_updated || d._savedAt) {
      const t = new Date(d._savedAt || d.last_updated);
      const elapsed = Math.round((Date.now() - t.getTime()) / 60000);
      const txt = elapsed < 1 ? "Just now" : elapsed < 60 ? `${elapsed}m ago` : `${Math.round(elapsed/60)}h ago`;
      const el = document.getElementById("adminLastUpdated");
      if (el) el.innerHTML = el.innerHTML.replace("Never updated", "Last saved " + txt);
    }
  }
}

async function submitAdminData() {
  const hospital = sessionStorage.getItem("loggedHospital");
  if (!hospital) { window.location.href = "index.html"; return; }

  const patients = parseInt(document.getElementById("inpPatients").value);
  const totalBeds = parseInt(document.getElementById("inpTotalBeds").value);
  const occupied  = parseInt(document.getElementById("inpOccupied").value);
  const doctors   = parseInt(document.getElementById("inpDoctors").value);
  const icuBeds   = parseInt(document.getElementById("inpIcuBeds")?.value || 0);
  const icuOcc    = parseInt(document.getElementById("inpIcuOccupied")?.value || 0);
  const status    = document.getElementById("inpStatus")?.value || "normal";
  const msgEl     = document.getElementById("saveMessage");

  // Validation
  if ([patients, totalBeds, occupied, doctors].some(isNaN)) {
    msgEl.textContent = "Please fill in all required fields.";
    msgEl.className = "save-message error";
    return;
  }
  if (occupied > totalBeds) {
    msgEl.textContent = "Occupied beds cannot exceed total beds.";
    msgEl.className = "save-message error";
    return;
  }

  const data = { current_patients: patients, total_beds: totalBeds, occupied_beds: occupied, doctors_on_duty: doctors, icu_beds: icuBeds || 0, icu_occupied: icuOcc || 0, emergency_status: status, _savedAt: new Date().toISOString() };
  localStorage.setItem("hospital_" + hospital, JSON.stringify(data));

  const btn = document.getElementById("saveBtn");
  const orig = btn.innerHTML;
  btn.innerHTML = '<span class="spinner"></span> Saving...';
  btn.disabled = true;
  msgEl.className = "save-message";
  msgEl.style.display = "none";

  try {
    const res = await fetch(`${API_URL}/hospital/update?hospital_name=${encodeURIComponent(hospital)}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data)
    });
    if (res.ok) {
      msgEl.textContent = "✓ Data saved and published to public dashboard";
      msgEl.className = "save-message success";
      // Update last-saved badge
      const badgeEl = document.getElementById("adminLastUpdated");
      if (badgeEl) badgeEl.innerHTML = badgeEl.innerHTML.replace(/Never updated|Last saved.+/, "Last saved just now");
    } else throw new Error("Server error");
  } catch {
    msgEl.textContent = "⚠ Saved locally. Backend sync failed — will retry next save.";
    msgEl.className = "save-message warning";
  } finally {
    btn.innerHTML = orig;
    btn.disabled = false;
    await runAdminPrediction(hospital, data);
  }
}

async function runAdminPrediction(hospital, data) {
  try {
    const res = await fetch(`${API_URL}/predict`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ district: "Admin", current_patients: data.current_patients, occupied_beds: data.occupied_beds, total_beds: data.total_beds, doctors_on_duty: data.doctors_on_duty, monsoon: false, viral_outbreak: false })
    });
    if (!res.ok) return;
    const result = await res.json();

    const panel = document.getElementById("adminPredPanel");
    if (panel) {
      // Set values then animate
      document.getElementById("adminPredPat").textContent  = result.predicted_patients;
      document.getElementById("adminPredBeds").textContent = result.beds_required;
      document.getElementById("adminPredDoc").textContent  = result.doctors_required;
      panel.style.display = "block";
    }

    const riskEl = document.getElementById("adminRiskBadge");
    if (riskEl) {
      riskEl.textContent = result.risk_level;
      riskEl.className = "admin-risk-badge " + ({ LOW: "risk-low", MEDIUM: "risk-medium", HIGH: "risk-high" }[result.risk_level] || "");
    }
    const msgEl = document.getElementById("adminPredMsg");
    if (msgEl) msgEl.textContent = result.message;
  } catch (e) { console.warn("Admin prediction error:", e); }
}

function logoutAdmin() {
  sessionStorage.removeItem("loggedHospital");
  window.location.href = "index.html";
}

document.addEventListener("DOMContentLoaded", initAdminPage);