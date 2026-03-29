/*
 * Task 2.2 — Instructor Learning Analytics Dashboard
 * Chart.js visualizations with synthetic class data.
 */

(function () {
  var COLORS = {
    mod1: "#4f46e5",
    mod2: "#0891b2",
    mod3: "#c2410c",
    primary: "#2563eb",
    safe: "#15803d",
    harm: "#b91c1c",
    muted: "#94a3b8",
  };

  var scenarios = ["Web\nInjection", "File\nPoisoning", "Email\nManip.", "Code\nExec.", "API\nInteract.", "DB\nRedirect."];
  var moduleColors = [COLORS.mod1, COLORS.mod1, COLORS.mod2, COLORS.mod2, COLORS.mod2, COLORS.mod3];

  // ── Chart 1: Time-to-Exploit ──
  new Chart(document.getElementById("chartTimeToExploit"), {
    type: "bar",
    data: {
      labels: scenarios,
      datasets: [{
        label: "Avg. Minutes",
        data: [8.4, 11.2, 18.6, 15.3, 22.1, 12.7],
        backgroundColor: moduleColors.map(function (c) { return c + "cc"; }),
        borderColor: moduleColors,
        borderWidth: 1,
        borderRadius: 4,
      }],
    },
    options: {
      responsive: true,
      plugins: {
        legend: { display: false },
        tooltip: {
          callbacks: {
            label: function (ctx) { return ctx.parsed.y + " min avg"; }
          }
        }
      },
      scales: {
        y: {
          beginAtZero: true,
          title: { display: true, text: "Minutes" },
          grid: { color: "#f1f5f9" },
        },
        x: { grid: { display: false } },
      },
    },
  });

  // ── Chart 2: Trust-Boundary Accuracy ──
  new Chart(document.getElementById("chartTrustAccuracy"), {
    type: "bar",
    data: {
      labels: scenarios,
      datasets: [
        {
          label: "Correctly Identified",
          data: [42, 55, 28, 38, 22, 65],
          backgroundColor: COLORS.safe + "cc",
          borderColor: COLORS.safe,
          borderWidth: 1,
          borderRadius: 4,
        },
        {
          label: "Stumbled Into Exploit",
          data: [58, 45, 72, 62, 78, 35],
          backgroundColor: COLORS.harm + "88",
          borderColor: COLORS.harm,
          borderWidth: 1,
          borderRadius: 4,
        },
      ],
    },
    options: {
      responsive: true,
      plugins: {
        legend: { position: "bottom", labels: { boxWidth: 12, font: { size: 11 } } },
        tooltip: {
          callbacks: {
            label: function (ctx) { return ctx.dataset.label + ": " + ctx.parsed.y + "%"; }
          }
        }
      },
      scales: {
        y: {
          beginAtZero: true,
          max: 100,
          title: { display: true, text: "% of Students" },
          grid: { color: "#f1f5f9" },
        },
        x: { grid: { display: false } },
      },
    },
  });

  // ── Chart 3: Red vs Blue Team ──
  new Chart(document.getElementById("chartRedBlue"), {
    type: "radar",
    data: {
      labels: ["Web Injection", "File Poisoning", "Email Manip.", "Code Exec.", "API Interact.", "DB Redirect."],
      datasets: [
        {
          label: "Attack Success %",
          data: [82, 75, 68, 71, 58, 88],
          backgroundColor: "rgba(185,28,28,0.15)",
          borderColor: COLORS.harm,
          pointBackgroundColor: COLORS.harm,
          borderWidth: 2,
        },
        {
          label: "Defense Success %",
          data: [45, 52, 32, 38, 28, 62],
          backgroundColor: "rgba(21,128,61,0.15)",
          borderColor: COLORS.safe,
          pointBackgroundColor: COLORS.safe,
          borderWidth: 2,
        },
      ],
    },
    options: {
      responsive: true,
      plugins: {
        legend: { position: "bottom", labels: { boxWidth: 12, font: { size: 11 } } },
      },
      scales: {
        r: {
          beginAtZero: true,
          max: 100,
          ticks: { stepSize: 20, font: { size: 9 } },
          grid: { color: "#e2e8f0" },
          pointLabels: { font: { size: 10 } },
        },
      },
    },
  });

  // ── Chart 4: Progression Correlation ──
  var studentData = [];
  for (var i = 0; i < 32; i++) {
    var m1 = 30 + Math.random() * 65;
    var m2 = m1 * (0.6 + Math.random() * 0.5) + (Math.random() - 0.5) * 15;
    m2 = Math.max(10, Math.min(100, m2));
    studentData.push({ x: Math.round(m1), y: Math.round(m2) });
  }

  new Chart(document.getElementById("chartProgression"), {
    type: "scatter",
    data: {
      datasets: [{
        label: "Student",
        data: studentData,
        backgroundColor: COLORS.primary + "aa",
        borderColor: COLORS.primary,
        pointRadius: 5,
        pointHoverRadius: 7,
      }],
    },
    options: {
      responsive: true,
      plugins: {
        legend: { display: false },
        tooltip: {
          callbacks: {
            label: function (ctx) {
              return "M1: " + ctx.parsed.x + "%, M2: " + ctx.parsed.y + "%";
            }
          }
        }
      },
      scales: {
        x: {
          title: { display: true, text: "Module 1 Score (%)" },
          min: 0, max: 100,
          grid: { color: "#f1f5f9" },
        },
        y: {
          title: { display: true, text: "Module 2 Score (%)" },
          min: 0, max: 100,
          grid: { color: "#f1f5f9" },
        },
      },
    },
  });

  // ── Filter interactivity (simulated) ──
  document.getElementById("filterModule").addEventListener("change", function () {
    // In production, this would re-query and redraw charts.
    // For demo, we flash the charts to indicate interaction.
    var boxes = document.querySelectorAll(".chart-box");
    for (var i = 0; i < boxes.length; i++) {
      boxes[i].style.opacity = "0.5";
      (function (box) {
        setTimeout(function () { box.style.opacity = "1"; }, 300);
      })(boxes[i]);
    }
  });

  document.getElementById("filterWeek").addEventListener("change", function () {
    var boxes = document.querySelectorAll(".chart-box");
    for (var i = 0; i < boxes.length; i++) {
      boxes[i].style.opacity = "0.5";
      (function (box) {
        setTimeout(function () { box.style.opacity = "1"; }, 300);
      })(boxes[i]);
    }
  });
})();
