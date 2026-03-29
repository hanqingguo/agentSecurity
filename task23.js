/*
 * Task 2.3 — Scenario Authoring Toolkit
 * Live preview updates + JSON export.
 */

(function () {
  var TOOL_META = {
    file:  { icon: "📄", label: "File I/O" },
    web:   { icon: "🌐", label: "Web Fetch" },
    code:  { icon: "💻", label: "Code Exec" },
    email: { icon: "✉️", label: "Email/Cal" },
    api:   { icon: "🔌", label: "API Calls" },
    db:    { icon: "🗄️", label: "DB Queries" },
  };

  var MECH_ICONS = {
    html: "🌐", pdf: "📄", email: "✉️",
    code: "💻", api: "🔌", sql: "🗄️",
  };

  var VIS_LABELS = ["", "Fully Visible", "Mostly Visible", "Medium", "Mostly Hidden", "Completely Hidden"];
  var DIST_LABELS = ["", "1 hop", "2 hops", "3 hops", "4 hops", "5+ hops"];
  var DEF_LABELS  = ["", "Full Info", "Most Info", "Partial Info", "Limited Info", "No Info"];

  var selectedMech = "html";

  // ── Tool toggles ──
  var toggles = document.querySelectorAll(".tool-toggle");
  for (var i = 0; i < toggles.length; i++) {
    (function (toggle) {
      toggle.addEventListener("click", function (e) {
        e.preventDefault();
        var cb = toggle.querySelector("input[type=checkbox]");
        cb.checked = !cb.checked;
        toggle.classList.toggle("active", cb.checked);
        updatePreview();
      });
    })(toggles[i]);
  }

  // ── Delivery mechanism chips ──
  var chips = document.querySelectorAll(".delivery-chip");
  for (var j = 0; j < chips.length; j++) {
    (function (chip) {
      chip.addEventListener("click", function () {
        for (var k = 0; k < chips.length; k++) chips[k].classList.remove("active");
        chip.classList.add("active");
        selectedMech = chip.dataset.mech;
        updatePreview();
      });
    })(chips[j]);
  }

  // ── Slider labels ──
  var sliderVis  = document.getElementById("sliderVis");
  var sliderDist = document.getElementById("sliderDist");
  var sliderDef  = document.getElementById("sliderDef");

  sliderVis.addEventListener("input", function () {
    document.getElementById("visLabel").textContent = VIS_LABELS[this.value];
    updatePreview();
  });
  sliderDist.addEventListener("input", function () {
    document.getElementById("distLabel").textContent = DIST_LABELS[this.value];
    updatePreview();
  });
  sliderDef.addEventListener("input", function () {
    document.getElementById("defLabel").textContent = DEF_LABELS[this.value];
    updatePreview();
  });

  // ── Text input listeners ──
  var textInputs = [
    "agentPersona", "systemPrompt", "payloadContent",
    "successRed", "successBlue", "failCondition",
    "hintStuck", "hintMisconception",
  ];
  for (var t = 0; t < textInputs.length; t++) {
    document.getElementById(textInputs[t]).addEventListener("input", updatePreview);
  }

  // ── Preview update ──
  function updatePreview() {
    var persona = document.getElementById("agentPersona").value || "Unnamed Agent";
    var payload = document.getElementById("payloadContent").value;

    // Title
    document.getElementById("prevTitle").textContent = persona + " Scenario";

    // Icon based on delivery mechanism
    document.getElementById("prevIcon").textContent = MECH_ICONS[selectedMech] || "📄";

    // Description
    var mechNames = {
      html: "Hidden HTML", pdf: "PDF Metadata", email: "Email Body",
      code: "Code Comment", api: "API Response", sql: "SQL Injection",
    };
    var activeTools = getActiveTools();
    var toolStr = activeTools.length > 0 ? activeTools[0].label + " tool" : "agent";
    document.getElementById("prevDesc").textContent =
      mechNames[selectedMech] + " injection targeting " + toolStr;

    // Tools
    var toolsDiv = document.getElementById("prevTools");
    toolsDiv.innerHTML = "";
    for (var i = 0; i < activeTools.length; i++) {
      var span = document.createElement("span");
      span.className = "preview-tool-chip";
      span.textContent = activeTools[i].icon + " " + activeTools[i].label;
      toolsDiv.appendChild(span);
    }
    if (activeTools.length === 0) {
      toolsDiv.innerHTML = '<span style="color:var(--muted);font-size:.82rem;">No tools selected</span>';
    }

    // Difficulty bars
    var vis = parseInt(sliderVis.value);
    var dist = parseInt(sliderDist.value);
    var def = parseInt(sliderDef.value);

    setDiffBar("prevVis", vis);
    setDiffBar("prevDist", dist);
    setDiffBar("prevDef", def);

    // Payload
    var prevPayload = document.getElementById("prevPayload");
    prevPayload.textContent = payload || "(no payload defined)";

    // Criteria
    document.getElementById("prevRedCriteria").textContent =
      "🔴 " + (document.getElementById("successRed").value || "Not defined");
    document.getElementById("prevBlueCriteria").textContent =
      "🔵 " + (document.getElementById("successBlue").value || "Not defined");
  }

  function setDiffBar(id, val) {
    var el = document.getElementById(id);
    var pct = (val / 5) * 100;
    el.style.width = pct + "%";
    el.className = "preview-diff-fill " + (pct <= 40 ? "low" : pct <= 70 ? "mid" : "high");
  }

  function getActiveTools() {
    var result = [];
    var items = document.querySelectorAll(".tool-toggle");
    for (var i = 0; i < items.length; i++) {
      if (items[i].classList.contains("active")) {
        var tool = items[i].dataset.tool;
        result.push(TOOL_META[tool]);
      }
    }
    return result;
  }

  // ── Export JSON ──
  document.getElementById("btnExport").addEventListener("click", function () {
    var scenario = {
      agentPersona: document.getElementById("agentPersona").value,
      systemPrompt: document.getElementById("systemPrompt").value,
      tools: getActiveTools().map(function (t) { return t.label; }),
      difficulty: {
        attackVisibility: { value: parseInt(sliderVis.value), label: VIS_LABELS[sliderVis.value] },
        causalDistance: { value: parseInt(sliderDist.value), label: DIST_LABELS[sliderDist.value] },
        defenseContext: { value: parseInt(sliderDef.value), label: DEF_LABELS[sliderDef.value] },
      },
      attackPayload: {
        deliveryMechanism: selectedMech,
        content: document.getElementById("payloadContent").value,
      },
      assessmentCriteria: {
        redTeamSuccess: document.getElementById("successRed").value,
        blueTeamSuccess: document.getElementById("successBlue").value,
        failureIndicator: document.getElementById("failCondition").value,
      },
      tutorHints: {
        whenStuck: document.getElementById("hintStuck").value,
        commonMisconception: document.getElementById("hintMisconception").value,
      },
    };

    var json = JSON.stringify(scenario, null, 2);
    var blob = new Blob([json], { type: "application/json" });
    var url = URL.createObjectURL(blob);
    var a = document.createElement("a");
    a.href = url;
    a.download = "agentsec-scenario.json";
    a.click();
    URL.revokeObjectURL(url);
  });

  // ── Reset form ──
  document.getElementById("btnReset").addEventListener("click", function () {
    document.getElementById("agentPersona").value = "";
    document.getElementById("systemPrompt").value = "";
    document.getElementById("payloadContent").value = "";
    document.getElementById("successRed").value = "";
    document.getElementById("successBlue").value = "";
    document.getElementById("failCondition").value = "";
    document.getElementById("hintStuck").value = "";
    document.getElementById("hintMisconception").value = "";

    // Reset tools
    var items = document.querySelectorAll(".tool-toggle");
    for (var i = 0; i < items.length; i++) {
      items[i].classList.remove("active");
      items[i].querySelector("input").checked = false;
    }

    // Reset sliders
    sliderVis.value = 3;
    sliderDist.value = 2;
    sliderDef.value = 3;
    document.getElementById("visLabel").textContent = VIS_LABELS[3];
    document.getElementById("distLabel").textContent = DIST_LABELS[2];
    document.getElementById("defLabel").textContent = DEF_LABELS[3];

    // Reset delivery
    for (var j = 0; j < chips.length; j++) chips[j].classList.remove("active");
    chips[0].classList.add("active");
    selectedMech = "html";

    updatePreview();
  });

  // Initial preview
  updatePreview();
})();
