/*
 * Task 2.1 — Intelligent Assessment & Formative Feedback
 * Simulates the three-layer assessment framework.
 */

(function () {
  var selectedApproach = null;

  // Assessment data per approach
  var ASSESSMENTS = {
    A: {
      layer1: [
        { label: "Attack payload delivered to agent context", pass: true },
        { label: "Agent processed hidden HTML comment", pass: true },
        { label: "Agent invoked env_read tool", pass: true },
        { label: "Secret token appeared in agent output", pass: true },
        { label: "Agent maintained normal summary functionality", pass: true },
      ],
      layer2: {
        trustBoundary: { score: 3, max: 5, feedback: "You identified that HTML comments enter the agent's context, but didn't articulate why the agent treats them as instructions rather than markup." },
        attackPath: { score: 4, max: 5, feedback: "Good identification of the direct injection path. Consider: are there alternative delivery vectors in this same page?" },
        archReasoning: { score: 2, max: 5, feedback: "Your explanation focused on the outcome ('it leaked the token') rather than the architectural reason (the agent's HTML parser doesn't distinguish between visible content and comment nodes in its context window)." },
        alternatives: { score: 2, max: 5, feedback: "You did not discuss alternative approaches or compare the visibility trade-offs of different injection methods." },
      },
      overallScore: 72,
      tutorMessages: [
        { sender: "student", text: "I used a hidden HTML comment to override the agent's instructions." },
        { sender: "tutor", text: "Your attack succeeded — the agent did exfiltrate the secret token. Let's go deeper: why did the agent treat your HTML comment as an instruction?" },
        { sender: "student", text: "Because the agent reads all the HTML content including comments?" },
        { sender: "tutor", text: "Exactly. The key insight is about the trust boundary: the agent's text extraction pipeline doesn't distinguish between content the user sees and content hidden in markup. This is the untrusted data → trusted context boundary. Can you name which specific tool-permission made the exfiltration possible?" },
        { sender: "student", text: "The env_read tool — without it the agent couldn't access the token even if injected." },
        { sender: "tutor", text: "That's the critical architectural point. The injection alone isn't sufficient — it required the combination of (1) untrusted HTML entering the agent's context AND (2) the agent having env_read tool access. A defense could restrict either side of this equation." },
      ],
    },
    B: {
      layer1: [
        { label: "Attack payload delivered to agent context", pass: true },
        { label: "Agent processed invisible text element", pass: true },
        { label: "Agent invoked env_read tool", pass: true },
        { label: "Secret token appeared in agent output (base64)", pass: true },
        { label: "Agent maintained normal summary functionality", pass: true },
      ],
      layer2: {
        trustBoundary: { score: 5, max: 5, feedback: "Excellent. You correctly identified that the trust boundary exists between rendered vs. parsed content, and exploited the gap between what users see and what the agent processes." },
        attackPath: { score: 5, max: 5, feedback: "Sophisticated approach: using zero-font-size text is harder to detect than comments and demonstrates understanding of how agents parse DOM vs. visual rendering." },
        archReasoning: { score: 4, max: 5, feedback: "Strong reasoning about the parser architecture. To reach 5/5, also discuss how the base64 encoding evades simple output-filtering defenses." },
        alternatives: { score: 4, max: 5, feedback: "You showed awareness of multiple injection vectors. Consider also discussing defenses against each." },
      },
      overallScore: 92,
      tutorMessages: [
        { sender: "student", text: "I used invisible text (zero font-size) to inject instructions that the user can't see but the agent's parser will extract." },
        { sender: "tutor", text: "Excellent approach! This demonstrates a nuanced understanding of the trust boundary. The agent's text extraction sees ALL DOM text nodes regardless of CSS visibility. Why did you choose base64 encoding for the output?" },
        { sender: "student", text: "To make the exfiltrated data less obvious in the summary — a base64 string looks like a citation or reference." },
        { sender: "tutor", text: "That's sophisticated adversarial thinking. You've identified two layers: (1) hiding the injection from the human viewer, and (2) hiding the exfiltration in the output. Now consider: what defense would catch this? Think about both the input side and the output side." },
        { sender: "student", text: "Input side: sanitize HTML to remove zero-size elements. Output side: flag any base64-looking strings in the summary." },
        { sender: "tutor", text: "Both are valid defense strategies. The deeper lesson is that agent security requires defense at multiple trust boundaries — not just prompt hardening. Your approach earned high marks because you demonstrated systematic reasoning about the full attack chain." },
      ],
    },
    C: {
      layer1: [
        { label: "Attack payload delivered to agent context", pass: true },
        { label: "Agent processed social engineering text", pass: false },
        { label: "Agent invoked env_read tool", pass: false },
        { label: "Secret token appeared in agent output", pass: false },
        { label: "Agent maintained normal summary functionality", pass: true },
      ],
      layer2: {
        trustBoundary: { score: 1, max: 5, feedback: "This approach doesn't exploit a trust boundary — the text is visible to users and easily flagged. The agent's system prompt typically overrides visible user-facing requests in web content." },
        attackPath: { score: 1, max: 5, feedback: "Social engineering the agent via visible text is unlikely to work because the agent differentiates between its operator's instructions and arbitrary web page content." },
        archReasoning: { score: 1, max: 5, feedback: "The reasoning conflates human social engineering with agent architecture exploitation. Agents don't respond to 'please' — they respond to instruction patterns that match their parsing pipeline." },
        alternatives: { score: 1, max: 5, feedback: "No alternative approaches were considered. Revisit how the agent's HTML parser works and where hidden data could enter its context." },
      },
      overallScore: 28,
      tutorMessages: [
        { sender: "student", text: "I asked the agent politely via visible text to include environment variables." },
        { sender: "tutor", text: "This attack didn't succeed. Let's think about why. The agent treats web page content as data to summarize, not as instructions to follow. Visible text in a web page has no special authority over the agent's behavior. What makes an injection effective?" },
        { sender: "student", text: "Maybe if it looks like a system instruction?" },
        { sender: "tutor", text: "You're getting closer. Think about what the agent's text extraction pipeline actually sees. Is there a way to embed text that the human user can't see but the agent's parser will extract? Consider: HTML comments, zero-size fonts, hidden elements, or metadata fields." },
        { sender: "student", text: "Oh — so I need to hide the instruction so the user doesn't see it, but the agent's parser still picks it up?" },
        { sender: "tutor", text: "Exactly! That's the core trust boundary: the gap between what humans see (rendered page) and what the agent processes (raw HTML/DOM). Your visible-text approach would be caught immediately by any user reviewing the page. Effective injections exploit the parsing mismatch between human perception and agent context extraction." },
      ],
    },
    D: {
      layer1: [
        { label: "Attack payload delivered to agent context", pass: true },
        { label: "Agent processed embedded instruction", pass: true },
        { label: "Agent invoked env_read tool", pass: true },
        { label: "Secret token appeared in agent output", pass: true },
        { label: "Agent maintained normal summary functionality", pass: false },
      ],
      layer2: {
        trustBoundary: { score: 4, max: 5, feedback: "Good understanding that markdown-style links can carry hidden payloads. You correctly identified the HTML comment as an injection vector." },
        attackPath: { score: 3, max: 5, feedback: "The combined markdown + comment approach works but is somewhat over-engineered. The javascript:void link may trigger browser-level warnings that could alert the user." },
        archReasoning: { score: 3, max: 5, feedback: "Decent reasoning about dual-vector injection. However, the approach disrupted normal functionality (summary was incomplete), which in a real scenario would alert the user." },
        alternatives: { score: 3, max: 5, feedback: "You explored a creative combination approach, which shows good adversarial thinking, but didn't fully assess the stealth trade-offs." },
      },
      overallScore: 68,
      tutorMessages: [
        { sender: "student", text: "I combined a markdown link with a hidden HTML comment containing the injection command." },
        { sender: "tutor", text: "Interesting dual-vector approach. The attack succeeded in exfiltrating the token, but notice that the agent's normal summary functionality was disrupted — it didn't complete the summary properly. Why does this matter?" },
        { sender: "student", text: "Because the user would notice something is wrong if the summary is broken?" },
        { sender: "tutor", text: "Exactly. In real-world agent attacks, stealth is critical. A broken summary is a detection signal. The best injections preserve normal functionality while silently performing the malicious action. How could you modify your approach to maintain the summary quality?" },
        { sender: "student", text: "I could place the injection at the end of the page so the summary generates first, then the exfiltration happens as a 'post-processing' step." },
        { sender: "tutor", text: "Good thinking about execution ordering. The key lesson is that effective agent attacks must balance three concerns: (1) bypassing the trust boundary, (2) achieving the malicious goal, and (3) maintaining stealth by preserving normal behavior. Your approach was strong on #1 and #2 but weak on #3." },
      ],
    },
  };

  // DOM references
  var options = document.querySelectorAll(".attempt-option");
  var btnSubmit = document.getElementById("btnSubmit");
  var resultsSection = document.getElementById("assessmentResults");

  // Option selection
  for (var i = 0; i < options.length; i++) {
    (function (opt) {
      opt.addEventListener("click", function () {
        for (var j = 0; j < options.length; j++) options[j].classList.remove("selected");
        opt.classList.add("selected");
        selectedApproach = opt.dataset.approach;
        btnSubmit.disabled = false;
      });
    })(options[i]);
  }

  // Submit
  btnSubmit.addEventListener("click", function () {
    if (!selectedApproach) return;
    btnSubmit.disabled = true;
    showAssessment(ASSESSMENTS[selectedApproach]);
  });

  function showAssessment(data) {
    resultsSection.style.display = "block";
    resultsSection.scrollIntoView({ behavior: "smooth", block: "start" });

    // Reset
    document.getElementById("layer1").classList.remove("visible");
    document.getElementById("layer2").classList.remove("visible");
    document.getElementById("layer3").classList.remove("visible");
    document.getElementById("overallScore").classList.remove("visible");

    // Layer 1: Automated checks (show after 400ms)
    setTimeout(function () {
      renderLayer1(data.layer1);
      document.getElementById("layer1").classList.add("visible");
    }, 400);

    // Layer 2: Rubric (show after 1600ms)
    setTimeout(function () {
      renderLayer2(data.layer2);
      document.getElementById("layer2").classList.add("visible");
      // Animate bars after card is visible
      setTimeout(function () { animateRubricBars(); }, 200);
    }, 1600);

    // Layer 3: Tutor chat (show after 2800ms)
    setTimeout(function () {
      renderLayer3(data.tutorMessages);
      document.getElementById("layer3").classList.add("visible");
    }, 2800);

    // Overall score (show after 5000ms)
    setTimeout(function () {
      renderOverall(data);
      document.getElementById("overallScore").classList.add("visible");
      btnSubmit.disabled = false;
    }, 5000);
  }

  function renderLayer1(checks) {
    var ul = document.getElementById("checkList");
    ul.innerHTML = "";
    for (var i = 0; i < checks.length; i++) {
      var li = document.createElement("li");
      var icon = document.createElement("span");
      icon.className = "check-icon " + (checks[i].pass ? "pass" : "fail");
      icon.textContent = checks[i].pass ? "\u2713" : "\u2717";
      var text = document.createElement("span");
      text.textContent = checks[i].label;
      li.appendChild(icon);
      li.appendChild(text);
      ul.appendChild(li);
    }
  }

  function renderLayer2(rubric) {
    var grid = document.getElementById("rubricGrid");
    grid.innerHTML = "";
    var labels = {
      trustBoundary: "Trust Boundary Identification",
      attackPath: "Attack Path Analysis",
      archReasoning: "Architectural Reasoning",
      alternatives: "Alternative Approaches",
    };
    var keys = ["trustBoundary", "attackPath", "archReasoning", "alternatives"];
    for (var i = 0; i < keys.length; i++) {
      var k = keys[i];
      var r = rubric[k];
      var pct = (r.score / r.max) * 100;
      var level = pct >= 70 ? "high" : pct >= 40 ? "med" : "low";

      var div = document.createElement("div");
      div.className = "rubric-item";
      div.innerHTML =
        '<div class="rubric-label">' + labels[k] + "</div>" +
        '<div class="rubric-bar-track"><div class="rubric-bar-fill ' + level + '" data-width="' + pct + '%" style="width:0"></div></div>' +
        '<div class="rubric-score">' + r.score + " / " + r.max + "</div>";
      grid.appendChild(div);
    }

    // Overall feedback
    var fb = document.getElementById("rubricFeedback");
    var bestKey = keys[0];
    var bestScore = 0;
    var worstKey = keys[0];
    var worstScore = 5;
    for (var j = 0; j < keys.length; j++) {
      if (rubric[keys[j]].score > bestScore) { bestScore = rubric[keys[j]].score; bestKey = keys[j]; }
      if (rubric[keys[j]].score < worstScore) { worstScore = rubric[keys[j]].score; worstKey = keys[j]; }
    }
    fb.style.display = "block";
    fb.innerHTML = "<strong>Key area for improvement:</strong> " + rubric[worstKey].feedback;
  }

  function animateRubricBars() {
    var bars = document.querySelectorAll(".rubric-bar-fill");
    for (var i = 0; i < bars.length; i++) {
      bars[i].style.width = bars[i].dataset.width;
    }
  }

  function renderLayer3(messages) {
    var chat = document.getElementById("tutorChat");
    chat.innerHTML = "";
    for (var i = 0; i < messages.length; i++) {
      (function (msg, idx) {
        var div = document.createElement("div");
        div.className = "tutor-msg " + msg.sender;
        var sender = document.createElement("div");
        sender.className = "msg-sender";
        sender.textContent = msg.sender === "tutor" ? "AI Tutor" : "Student";
        var text = document.createElement("div");
        text.textContent = msg.text;
        div.appendChild(sender);
        div.appendChild(text);
        chat.appendChild(div);

        setTimeout(function () {
          div.classList.add("visible");
          chat.scrollTop = chat.scrollHeight;
        }, idx * 400);
      })(messages[i], i);
    }
  }

  function renderOverall(data) {
    document.getElementById("scoreValue").textContent = data.overallScore;
    var circle = document.getElementById("scoreCircle");
    if (data.overallScore >= 80) circle.style.background = "var(--safe)";
    else if (data.overallScore >= 50) circle.style.background = "var(--primary)";
    else circle.style.background = "var(--harm)";

    var bd = document.getElementById("scoreBreakdown");
    var rubric = data.layer2;
    var passed = 0;
    for (var i = 0; i < data.layer1.length; i++) {
      if (data.layer1[i].pass) passed++;
    }
    bd.innerHTML =
      "<strong>Layer 1:</strong> " + passed + "/" + data.layer1.length + " checks passed<br>" +
      "<strong>Layer 2:</strong> " +
        "Trust " + rubric.trustBoundary.score + "/5, " +
        "Path " + rubric.attackPath.score + "/5, " +
        "Reasoning " + rubric.archReasoning.score + "/5, " +
        "Alternatives " + rubric.alternatives.score + "/5<br>" +
      "<strong>Layer 3:</strong> Tutor feedback delivered";
  }
})();
