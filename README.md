<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>Team Task Manager — README</title>
<link href="https://fonts.googleapis.com/css2?family=Space+Mono:wght@400;700&family=Syne:wght@400;600;700;800&display=swap" rel="stylesheet">
<style>
  :root {
    --bg: #0a0a0f;
    --surface: #111118;
    --surface2: #1a1a24;
    --border: #2a2a3a;
    --accent: #7c6af7;
    --accent2: #4fd1c5;
    --accent3: #f6ad55;
    --text: #e2e0f0;
    --muted: #7a7890;
    --code-bg: #0d0d15;
    --green: #68d391;
    --red: #fc8181;
    --pink: #f687b3;
  }
  * { margin: 0; padding: 0; box-sizing: border-box; }
  html { scroll-behavior: smooth; }
  body {
    background: var(--bg);
    color: var(--text);
    font-family: 'Syne', sans-serif;
    font-size: 15px;
    line-height: 1.7;
    min-height: 100vh;
  }
  body::before {
    content: '';
    position: fixed;
    inset: 0;
    background-image:
      linear-gradient(rgba(124,106,247,0.04) 1px, transparent 1px),
      linear-gradient(90deg, rgba(124,106,247,0.04) 1px, transparent 1px);
    background-size: 40px 40px;
    pointer-events: none;
    z-index: 0;
  }

  /* NAV */
  nav {
    position: sticky;
    top: 0;
    z-index: 100;
    background: rgba(10,10,15,0.92);
    backdrop-filter: blur(12px);
    border-bottom: 1px solid var(--border);
    padding: 0 32px;
    display: flex;
    align-items: center;
    gap: 4px;
    height: 48px;
    overflow-x: auto;
  }
  nav a {
    font-family: 'Space Mono', monospace;
    font-size: 11px;
    color: var(--muted);
    text-decoration: none;
    padding: 6px 10px;
    border-radius: 6px;
    white-space: nowrap;
    transition: color 0.2s, background 0.2s;
  }
  nav a:hover { color: var(--text); background: var(--surface2); }
  nav .nav-logo {
    font-size: 13px;
    font-weight: 700;
    color: var(--accent);
    margin-right: 12px;
    font-family: 'Syne', sans-serif;
    white-space: nowrap;
  }
  nav .sep { color: var(--border); margin: 0 2px; font-size: 11px; }

  .container {
    max-width: 960px;
    margin: 0 auto;
    padding: 52px 32px 80px;
    position: relative;
    z-index: 1;
  }

  /* HERO */
  .hero {
    border: 1px solid var(--border);
    border-radius: 16px;
    padding: 52px 48px;
    margin-bottom: 56px;
    background: linear-gradient(135deg, #111118 0%, #0f0f1a 100%);
    position: relative;
    overflow: hidden;
  }
  .hero::before {
    content: '';
    position: absolute;
    top: -60px; right: -60px;
    width: 280px; height: 280px;
    background: radial-gradient(circle, rgba(124,106,247,0.18) 0%, transparent 70%);
    border-radius: 50%;
  }
  .hero::after {
    content: '';
    position: absolute;
    bottom: -40px; left: -40px;
    width: 200px; height: 200px;
    background: radial-gradient(circle, rgba(79,209,197,0.1) 0%, transparent 70%);
    border-radius: 50%;
  }
  .badge {
    display: inline-flex;
    align-items: center;
    gap: 6px;
    background: rgba(124,106,247,0.15);
    border: 1px solid rgba(124,106,247,0.3);
    color: #a89ff9;
    font-family: 'Space Mono', monospace;
    font-size: 11px;
    padding: 4px 12px;
    border-radius: 100px;
    margin-bottom: 20px;
    letter-spacing: 0.05em;
  }
  .badge::before { content: '●'; color: var(--accent2); font-size: 8px; }
  h1 {
    font-size: 52px;
    font-weight: 800;
    line-height: 1.1;
    letter-spacing: -1.5px;
    margin-bottom: 16px;
  }
  h1 span { color: var(--accent); }
  .hero-desc {
    color: var(--muted);
    font-size: 16px;
    max-width: 560px;
    margin-bottom: 28px;
  }
  .pills { display: flex; flex-wrap: wrap; gap: 8px; }
  .pill {
    font-family: 'Space Mono', monospace;
    font-size: 11px;
    padding: 5px 12px;
    border-radius: 6px;
    border: 1px solid var(--border);
    background: var(--surface2);
    color: var(--muted);
  }
  .pill.green { border-color: rgba(104,211,145,0.3); background: rgba(104,211,145,0.07); color: var(--green); }
  .pill.purple { border-color: rgba(124,106,247,0.3); background: rgba(124,106,247,0.07); color: #a89ff9; }
  .pill.teal { border-color: rgba(79,209,197,0.3); background: rgba(79,209,197,0.07); color: var(--accent2); }
  .pill.orange { border-color: rgba(246,173,85,0.3); background: rgba(246,173,85,0.07); color: var(--accent3); }

  /* SECTIONS */
  section { margin-bottom: 52px; }
  h2 {
    font-size: 13px;
    font-weight: 700;
    letter-spacing: 0.12em;
    text-transform: uppercase;
    color: var(--accent);
    font-family: 'Space Mono', monospace;
    margin-bottom: 20px;
    display: flex;
    align-items: center;
    gap: 10px;
  }
  h2::after { content: ''; flex: 1; height: 1px; background: var(--border); }
  h3 { font-size: 16px; font-weight: 700; color: var(--text); margin-bottom: 12px; margin-top: 24px; }

  /* TECH GRID */
  .tech-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(200px, 1fr)); gap: 10px; }
  .tech-card { border: 1px solid var(--border); border-radius: 10px; padding: 14px 16px; background: var(--surface); }
  .tech-label { font-family: 'Space Mono', monospace; font-size: 10px; color: var(--muted); letter-spacing: 0.08em; text-transform: uppercase; display: block; margin-bottom: 4px; }
  .tech-value { font-size: 14px; font-weight: 600; color: var(--text); }

  /* FEATURES */
  .features { display: grid; grid-template-columns: 1fr 1fr; gap: 8px; }
  .feature { display: flex; align-items: flex-start; gap: 10px; padding: 12px 14px; border: 1px solid var(--border); border-radius: 8px; background: var(--surface); font-size: 14px; color: var(--muted); }
  .feature-dot { width: 6px; height: 6px; border-radius: 50%; background: var(--accent); margin-top: 6px; flex-shrink: 0; }
  .feature strong { color: var(--text); display: block; font-weight: 600; font-size: 13px; margin-bottom: 2px; }

  /* AUTH FLOW */
  .flow-group { border: 1px solid var(--border); border-radius: 10px; overflow: hidden; background: var(--surface); margin-bottom: 12px; }
  .flow-group-header { padding: 10px 16px; background: var(--surface2); border-bottom: 1px solid var(--border); font-size: 12px; font-weight: 700; letter-spacing: 0.08em; text-transform: uppercase; display: flex; align-items: center; gap: 8px; }
  .flow-group-header.reg { color: var(--accent); }
  .flow-group-header.login { color: var(--accent2); }
  .flow-group-header.forgot { color: var(--accent3); }
  .flow-step { display: flex; align-items: center; gap: 12px; padding: 10px 16px; border-bottom: 1px solid var(--border); font-size: 13px; }
  .flow-step:last-child { border-bottom: none; }
  .step-num { font-family: 'Space Mono', monospace; font-size: 10px; width: 20px; height: 20px; border-radius: 50%; background: rgba(124,106,247,0.2); border: 1px solid rgba(124,106,247,0.4); color: var(--accent); display: flex; align-items: center; justify-content: center; flex-shrink: 0; }
  .flow-endpoint { font-family: 'Space Mono', monospace; font-size: 11px; color: var(--accent2); background: rgba(79,209,197,0.08); border: 1px solid rgba(79,209,197,0.2); padding: 2px 8px; border-radius: 4px; }
  .method { font-family: 'Space Mono', monospace; font-size: 10px; padding: 2px 6px; border-radius: 4px; font-weight: 700; flex-shrink: 0; }
  .method.post { background: rgba(104,211,145,0.12); color: var(--green); border: 1px solid rgba(104,211,145,0.25); }
  .method.get { background: rgba(124,106,247,0.12); color: #a89ff9; border: 1px solid rgba(124,106,247,0.25); }
  .method.patch { background: rgba(246,173,85,0.12); color: var(--accent3); border: 1px solid rgba(246,173,85,0.25); }
  .method.delete { background: rgba(252,129,129,0.12); color: var(--red); border: 1px solid rgba(252,129,129,0.25); }
  .flow-desc { color: var(--muted); font-size: 12px; margin-left: auto; text-align: right; }

  /* OTP RULES */
  .otp-rules { display: grid; grid-template-columns: repeat(3, 1fr); gap: 10px; margin-top: 16px; }
  .otp-rule { border: 1px solid var(--border); border-radius: 10px; padding: 16px; background: var(--surface); text-align: center; }
  .otp-num { font-family: 'Space Mono', monospace; font-size: 28px; font-weight: 700; color: var(--accent); display: block; margin-bottom: 4px; }
  .otp-label { font-size: 12px; color: var(--muted); }

  /* TABLES */
  .api-table { width: 100%; border-collapse: collapse; border: 1px solid var(--border); border-radius: 10px; overflow: hidden; font-size: 13px; margin-bottom: 20px; }
  .api-table thead tr { background: var(--surface2); }
  .api-table th { font-family: 'Space Mono', monospace; font-size: 10px; letter-spacing: 0.08em; text-transform: uppercase; color: var(--muted); padding: 10px 14px; text-align: left; border-bottom: 1px solid var(--border); }
  .api-table td { padding: 9px 14px; border-bottom: 1px solid rgba(42,42,58,0.5); color: var(--muted); vertical-align: middle; }
  .api-table tr:last-child td { border-bottom: none; }
  .api-table tr:hover td { background: rgba(124,106,247,0.04); }
  .endpoint-path { font-family: 'Space Mono', monospace; font-size: 12px; color: var(--text); }
  .auth-badge { font-family: 'Space Mono', monospace; font-size: 10px; padding: 2px 7px; border-radius: 4px; }
  .auth-badge.public { background: rgba(104,211,145,0.1); color: var(--green); border: 1px solid rgba(104,211,145,0.2); }
  .auth-badge.bearer { background: rgba(124,106,247,0.1); color: #a89ff9; border: 1px solid rgba(124,106,247,0.2); }

  /* CODE */
  .code-block { background: var(--code-bg); border: 1px solid var(--border); border-radius: 10px; overflow: hidden; margin-bottom: 16px; }
  .code-header { display: flex; align-items: center; justify-content: space-between; padding: 8px 16px; background: var(--surface2); border-bottom: 1px solid var(--border); }
  .code-lang { font-family: 'Space Mono', monospace; font-size: 10px; color: var(--muted); letter-spacing: 0.05em; text-transform: uppercase; }
  .code-dots { display: flex; gap: 5px; }
  .dot { width: 8px; height: 8px; border-radius: 50%; }
  .dot.r { background: #ff5f57; } .dot.y { background: #febc2e; } .dot.g { background: #28c840; }
  pre { font-family: 'Space Mono', monospace; font-size: 12px; line-height: 1.7; padding: 16px; overflow-x: auto; color: #b0aed0; }
  .kw { color: #a89ff9; } .str { color: var(--accent2); } .cmt { color: #4a4870; } .key { color: var(--accent3); }

  /* SYSTEM DESIGN */
  .system-design-wrap {
    border: 1px solid var(--border);
    border-radius: 14px;
    overflow: hidden;
    background: var(--surface);
  }
  .system-design-header {
    padding: 14px 20px;
    background: var(--surface2);
    border-bottom: 1px solid var(--border);
    display: flex;
    align-items: center;
    justify-content: space-between;
  }
  .system-design-title {
    font-family: 'Space Mono', monospace;
    font-size: 11px;
    color: var(--muted);
    letter-spacing: 0.08em;
    text-transform: uppercase;
  }
  .system-design-svg {
    padding: 24px;
    background: #0d0d18;
  }
  .system-design-svg svg {
    width: 100%;
    font-family: 'Space Mono', monospace;
  }

  /* Layer legend */
  .layer-legend {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(180px, 1fr));
    gap: 8px;
    margin-top: 16px;
  }
  .legend-item {
    display: flex;
    align-items: center;
    gap: 8px;
    padding: 8px 12px;
    border: 1px solid var(--border);
    border-radius: 8px;
    background: var(--surface);
    font-size: 12px;
    color: var(--muted);
  }
  .legend-dot { width: 10px; height: 10px; border-radius: 3px; flex-shrink: 0; }

  /* ENV GRID */
  .env-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 8px; }
  .env-item { border: 1px solid var(--border); border-radius: 8px; padding: 12px 14px; background: var(--surface); }
  .env-key { font-family: 'Space Mono', monospace; font-size: 11px; color: var(--accent3); display: block; margin-bottom: 3px; }
  .env-desc { font-size: 12px; color: var(--muted); }

  /* SETUP */
  .setup-steps { display: flex; flex-direction: column; gap: 12px; }
  .setup-step { display: flex; gap: 16px; align-items: flex-start; }
  .step-circle { width: 28px; height: 28px; border-radius: 50%; background: rgba(124,106,247,0.15); border: 1px solid rgba(124,106,247,0.4); color: var(--accent); font-family: 'Space Mono', monospace; font-size: 11px; font-weight: 700; display: flex; align-items: center; justify-content: center; flex-shrink: 0; margin-top: 2px; }
  .step-content { flex: 1; }
  .step-title { font-weight: 700; font-size: 14px; color: var(--text); margin-bottom: 8px; }

  /* SECURITY */
  .security-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(240px, 1fr)); gap: 10px; }
  .sec-item { border: 1px solid var(--border); border-radius: 8px; padding: 14px 16px; background: var(--surface); display: flex; align-items: flex-start; gap: 10px; }
  .sec-icon { width: 28px; height: 28px; border-radius: 6px; background: rgba(124,106,247,0.15); display: flex; align-items: center; justify-content: center; font-size: 13px; flex-shrink: 0; }
  .sec-title { font-size: 13px; font-weight: 600; color: var(--text); margin-bottom: 2px; }
  .sec-desc { font-size: 12px; color: var(--muted); }

  /* FOOTER */
  .footer { border-top: 1px solid var(--border); margin-top: 56px; padding-top: 24px; display: flex; align-items: center; justify-content: space-between; color: var(--muted); font-size: 13px; }
  .footer-badge { font-family: 'Space Mono', monospace; font-size: 11px; padding: 4px 10px; border-radius: 6px; background: var(--surface2); border: 1px solid var(--border); }

  @media (max-width: 640px) {
    .features, .env-grid { grid-template-columns: 1fr; }
    .otp-rules { grid-template-columns: 1fr; }
    h1 { font-size: 32px; }
    .hero { padding: 32px 24px; }
  }
</style>
</head>
<body>

<nav>
  <span class="nav-logo">⬡ Task Manager</span>
  <span class="sep">|</span>
  <a href="#stack">Stack</a>
  <a href="#features">Features</a>
  <a href="#auth">Auth Flow</a>
  <a href="#api">API</a>
  <a href="#system-design">System Design</a>
  <a href="#setup">Setup</a>
  <a href="#security">Security</a>
</nav>

<div class="container">

  <!-- HERO -->
  <div class="hero">
    <div class="badge">production-ready backend</div>
    <h1>Team Task<br><span>Manager</span></h1>
    <p class="hero-desc">A collaborative task management system built with Spring Boot 3, featuring OTP email verification, JWT authentication, real-time notifications, and enterprise-grade resilience patterns.</p>
    <div class="pills">
      <span class="pill green">Spring Boot 3.2</span>
      <span class="pill purple">JWT + OTP Auth</span>
      <span class="pill teal">MySQL + Redis</span>
      <span class="pill orange">RabbitMQ</span>
      <span class="pill">Resilience4j</span>
      <span class="pill">Flyway</span>
      <span class="pill">Swagger UI</span>
    </div>
  </div>

  <!-- TECH STACK -->
  <section id="stack">
    <h2>Tech Stack</h2>
    <div class="tech-grid">
      <div class="tech-card"><span class="tech-label">Language</span><span class="tech-value">Java 17</span></div>
      <div class="tech-card"><span class="tech-label">Framework</span><span class="tech-value">Spring Boot 3.2</span></div>
      <div class="tech-card"><span class="tech-label">Security</span><span class="tech-value">Spring Security + JWT</span></div>
      <div class="tech-card"><span class="tech-label">Database</span><span class="tech-value">MySQL 8</span></div>
      <div class="tech-card"><span class="tech-label">Migrations</span><span class="tech-value">Flyway</span></div>
      <div class="tech-card"><span class="tech-label">ORM</span><span class="tech-value">Spring Data JPA</span></div>
      <div class="tech-card"><span class="tech-label">Email</span><span class="tech-value">Spring Mail + Thymeleaf</span></div>
      <div class="tech-card"><span class="tech-label">Cache</span><span class="tech-value">Redis</span></div>
      <div class="tech-card"><span class="tech-label">Messaging</span><span class="tech-value">RabbitMQ</span></div>
      <div class="tech-card"><span class="tech-label">Resilience</span><span class="tech-value">Resilience4j</span></div>
      <div class="tech-card"><span class="tech-label">Rate Limiting</span><span class="tech-value">Token Bucket</span></div>
      <div class="tech-card"><span class="tech-label">API Docs</span><span class="tech-value">SpringDoc / Swagger</span></div>
    </div>
  </section>

  <!-- FEATURES -->
  <section id="features">
    <h2>Features</h2>
    <div class="features">
      <div class="feature"><div class="feature-dot"></div><div><strong>OTP Registration</strong>Email verified before account creation</div></div>
      <div class="feature"><div class="feature-dot"></div><div><strong>JWT Auth</strong>Stateless Bearer token authentication</div></div>
      <div class="feature"><div class="feature-dot"></div><div><strong>Forgot Password</strong>Secure OTP-based reset flow</div></div>
      <div class="feature"><div class="feature-dot"></div><div><strong>Project Management</strong>Create projects, manage members with roles</div></div>
      <div class="feature"><div class="feature-dot"></div><div><strong>Task Management</strong>Assign tasks, priority, status, due dates</div></div>
      <div class="feature"><div class="feature-dot"></div><div><strong>Comments</strong>Per-task threaded comment system</div></div>
      <div class="feature"><div class="feature-dot"></div><div><strong>Notifications</strong>In-app + email for all task events</div></div>
      <div class="feature"><div class="feature-dot"></div><div><strong>User Profile</strong>Avatar, bio, department, preferences</div></div>
      <div class="feature"><div class="feature-dot"></div><div><strong>Audit Logs</strong>Full action history tracking</div></div>
      <div class="feature"><div class="feature-dot"></div><div><strong>Dashboard</strong>Stats with circuit breaker protection</div></div>
      <div class="feature"><div class="feature-dot"></div><div><strong>Rate Limiting</strong>Token bucket per IP address</div></div>
      <div class="feature"><div class="feature-dot"></div><div><strong>Async Emails</strong>Non-blocking via @Async</div></div>
    </div>
  </section>

  <!-- AUTH FLOW -->
  <section id="auth">
    <h2>Authentication Flow</h2>

    <div class="flow-group">
      <div class="flow-group-header reg">⬡ Register — 2 step</div>
      <div class="flow-step">
        <div class="step-num">1</div>
        <span class="method post">POST</span>
        <span class="flow-endpoint">/api/auth/register</span>
        <span class="flow-desc">{ name, email } → sends OTP</span>
      </div>
      <div class="flow-step">
        <div class="step-num">2</div>
        <span class="method post">POST</span>
        <span class="flow-endpoint">/api/auth/verify-otp</span>
        <span class="flow-desc">{ name, email, otp, password } → JWT</span>
      </div>
    </div>

    <div class="flow-group">
      <div class="flow-group-header login">⬡ Login</div>
      <div class="flow-step">
        <div class="step-num">1</div>
        <span class="method post">POST</span>
        <span class="flow-endpoint">/api/auth/login</span>
        <span class="flow-desc">{ email, password } → JWT</span>
      </div>
    </div>

    <div class="flow-group">
      <div class="flow-group-header forgot">⬡ Forgot Password — 2 step</div>
      <div class="flow-step">
        <div class="step-num">1</div>
        <span class="method post">POST</span>
        <span class="flow-endpoint">/api/auth/forgot-password</span>
        <span class="flow-desc">{ email } → sends OTP</span>
      </div>
      <div class="flow-step">
        <div class="step-num">2</div>
        <span class="method post">POST</span>
        <span class="flow-endpoint">/api/auth/reset-password</span>
        <span class="flow-desc">{ email, otp, newPassword } → success</span>
      </div>
    </div>

    <div class="otp-rules">
      <div class="otp-rule"><span class="otp-num">4</span><span class="otp-label">digit code</span></div>
      <div class="otp-rule"><span class="otp-num">5m</span><span class="otp-label">expiry time</span></div>
      <div class="otp-rule"><span class="otp-num">3</span><span class="otp-label">max attempts</span></div>
    </div>
  </section>

  <!-- API ENDPOINTS -->
  <section id="api">
    <h2>API Endpoints</h2>

    <h3>Auth — /api/auth</h3>
    <table class="api-table">
      <thead><tr><th>Method</th><th>Endpoint</th><th>Auth</th><th>Description</th></tr></thead>
      <tbody>
        <tr><td><span class="method post">POST</span></td><td><span class="endpoint-path">/register</span></td><td><span class="auth-badge public">Public</span></td><td>Step 1: send OTP</td></tr>
        <tr><td><span class="method post">POST</span></td><td><span class="endpoint-path">/verify-otp</span></td><td><span class="auth-badge public">Public</span></td><td>Step 2: create account + JWT</td></tr>
        <tr><td><span class="method post">POST</span></td><td><span class="endpoint-path">/login</span></td><td><span class="auth-badge public">Public</span></td><td>Get JWT token</td></tr>
        <tr><td><span class="method post">POST</span></td><td><span class="endpoint-path">/forgot-password</span></td><td><span class="auth-badge public">Public</span></td><td>Send reset OTP</td></tr>
        <tr><td><span class="method post">POST</span></td><td><span class="endpoint-path">/reset-password</span></td><td><span class="auth-badge public">Public</span></td><td>Reset password with OTP</td></tr>
        <tr><td><span class="method get">GET</span></td><td><span class="endpoint-path">/me</span></td><td><span class="auth-badge bearer">Bearer</span></td><td>Current user info</td></tr>
      </tbody>
    </table>

    <h3>Projects — /api/projects</h3>
    <table class="api-table">
      <thead><tr><th>Method</th><th>Endpoint</th><th>Auth</th><th>Description</th></tr></thead>
      <tbody>
        <tr><td><span class="method get">GET</span></td><td><span class="endpoint-path">/</span></td><td><span class="auth-badge bearer">Bearer</span></td><td>List my projects</td></tr>
        <tr><td><span class="method post">POST</span></td><td><span class="endpoint-path">/</span></td><td><span class="auth-badge bearer">Bearer</span></td><td>Create project</td></tr>
        <tr><td><span class="method get">GET</span></td><td><span class="endpoint-path">/{id}</span></td><td><span class="auth-badge bearer">Bearer</span></td><td>Get project details</td></tr>
        <tr><td><span class="method post">POST</span></td><td><span class="endpoint-path">/{id}/members</span></td><td><span class="auth-badge bearer">Bearer (ADMIN)</span></td><td>Add member</td></tr>
        <tr><td><span class="method delete">DELETE</span></td><td><span class="endpoint-path">/{id}/members/{uid}</span></td><td><span class="auth-badge bearer">Bearer (ADMIN)</span></td><td>Remove member</td></tr>
      </tbody>
    </table>

    <h3>Tasks — /api/tasks</h3>
    <table class="api-table">
      <thead><tr><th>Method</th><th>Endpoint</th><th>Auth</th><th>Description</th></tr></thead>
      <tbody>
        <tr><td><span class="method get">GET</span></td><td><span class="endpoint-path">/project/{projectId}</span></td><td><span class="auth-badge bearer">Bearer</span></td><td>List tasks</td></tr>
        <tr><td><span class="method post">POST</span></td><td><span class="endpoint-path">/project/{projectId}</span></td><td><span class="auth-badge bearer">Bearer</span></td><td>Create task</td></tr>
        <tr><td><span class="method get">GET</span></td><td><span class="endpoint-path">/{id}</span></td><td><span class="auth-badge bearer">Bearer</span></td><td>Get task</td></tr>
        <tr><td><span class="method patch">PATCH</span></td><td><span class="endpoint-path">/{id}/status</span></td><td><span class="auth-badge bearer">Bearer</span></td><td>Update status</td></tr>
        <tr><td><span class="method delete">DELETE</span></td><td><span class="endpoint-path">/{id}</span></td><td><span class="auth-badge bearer">Bearer (ADMIN)</span></td><td>Delete task</td></tr>
      </tbody>
    </table>

    <h3>Other Modules</h3>
    <table class="api-table">
      <thead><tr><th>Prefix</th><th>Description</th></tr></thead>
      <tbody>
        <tr><td><span class="endpoint-path">/api/profile</span></td><td>User profile CRUD — avatar, bio, department</td></tr>
        <tr><td><span class="endpoint-path">/api/notifications</span></td><td>In-app notifications — list, mark read</td></tr>
        <tr><td><span class="endpoint-path">/api/comments</span></td><td>Task comment threads</td></tr>
        <tr><td><span class="endpoint-path">/api/dashboard</span></td><td>Summary stats with circuit breaker</td></tr>
        <tr><td><span class="endpoint-path">/api/audit</span></td><td>Full audit log history</td></tr>
      </tbody>
    </table>
  </section>

  <!-- SYSTEM DESIGN -->
  <section id="system-design">
    <h2>System Design</h2>

    <div class="system-design-wrap">
      <div class="system-design-header">
        <span class="system-design-title">Architecture Diagram — All Layers</span>
        <div style="display:flex;gap:5px;">
          <div class="dot r"></div><div class="dot y"></div><div class="dot g"></div>
        </div>
      </div>
      <div class="system-design-svg">
<svg width="100%" viewBox="0 0 680 980" xmlns="http://www.w3.org/2000/svg" style="font-family:'Space Mono',monospace;">
<defs>
<marker id="arrow2" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
<path d="M2 1L8 5L2 9" fill="none" stroke="context-stroke" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
</marker>
</defs>

<!-- CLIENT -->
<rect x="40" y="20" width="600" height="56" rx="10" fill="none" stroke="#2a2a3a" stroke-width="1" stroke-dasharray="5 3"/>
<text x="56" y="36" font-size="9" fill="#4a4870" letter-spacing="1">CLIENT</text>
<rect x="60" y="34" width="120" height="32" rx="6" fill="#3C3489" stroke="#AFA9EC" stroke-width="0.5"/>
<text x="120" y="50" text-anchor="middle" dominant-baseline="central" font-size="13" font-weight="500" fill="#CECBF6">Web App</text>
<rect x="200" y="34" width="120" height="32" rx="6" fill="#3C3489" stroke="#AFA9EC" stroke-width="0.5"/>
<text x="260" y="50" text-anchor="middle" dominant-baseline="central" font-size="13" font-weight="500" fill="#CECBF6">Mobile App</text>
<rect x="340" y="34" width="120" height="32" rx="6" fill="#3C3489" stroke="#AFA9EC" stroke-width="0.5"/>
<text x="400" y="50" text-anchor="middle" dominant-baseline="central" font-size="13" font-weight="500" fill="#CECBF6">Swagger UI</text>

<line x1="120" y1="66" x2="200" y2="108" stroke="#3a3a4a" marker-end="url(#arrow2)"/>
<line x1="260" y1="66" x2="260" y2="108" stroke="#3a3a4a" marker-end="url(#arrow2)"/>
<line x1="400" y1="66" x2="320" y2="108" stroke="#3a3a4a" marker-end="url(#arrow2)"/>

<!-- GATEWAY -->
<rect x="40" y="100" width="600" height="56" rx="10" fill="none" stroke="#2a2a3a" stroke-width="1" stroke-dasharray="5 3"/>
<text x="56" y="116" font-size="9" fill="#4a4870" letter-spacing="1">GATEWAY / FILTERS</text>
<rect x="60" y="114" width="150" height="32" rx="6" fill="#713B26" stroke="#F0997B" stroke-width="0.5"/>
<text x="135" y="130" text-anchor="middle" dominant-baseline="central" font-size="12" font-weight="500" fill="#F5C4B3">Rate Limit Filter</text>
<rect x="230" y="114" width="150" height="32" rx="6" fill="#713B26" stroke="#F0997B" stroke-width="0.5"/>
<text x="305" y="130" text-anchor="middle" dominant-baseline="central" font-size="12" font-weight="500" fill="#F5C4B3">JWT Auth Filter</text>
<rect x="400" y="114" width="150" height="32" rx="6" fill="#713B26" stroke="#F0997B" stroke-width="0.5"/>
<text x="475" y="130" text-anchor="middle" dominant-baseline="central" font-size="12" font-weight="500" fill="#F5C4B3">CORS Config</text>

<line x1="260" y1="146" x2="260" y2="188" stroke="#3a3a4a" marker-end="url(#arrow2)"/>

<!-- CONTROLLERS -->
<rect x="40" y="180" width="600" height="56" rx="10" fill="none" stroke="#2a2a3a" stroke-width="1" stroke-dasharray="5 3"/>
<text x="56" y="196" font-size="9" fill="#4a4870" letter-spacing="1">CONTROLLERS (REST API)</text>
<rect x="56" y="194" width="88" height="32" rx="6" fill="#085041" stroke="#5DCAA5" stroke-width="0.5"/>
<text x="100" y="210" text-anchor="middle" dominant-baseline="central" font-size="12" font-weight="500" fill="#9FE1CB">Auth</text>
<rect x="154" y="194" width="88" height="32" rx="6" fill="#085041" stroke="#5DCAA5" stroke-width="0.5"/>
<text x="198" y="210" text-anchor="middle" dominant-baseline="central" font-size="12" font-weight="500" fill="#9FE1CB">Project</text>
<rect x="252" y="194" width="88" height="32" rx="6" fill="#085041" stroke="#5DCAA5" stroke-width="0.5"/>
<text x="296" y="210" text-anchor="middle" dominant-baseline="central" font-size="12" font-weight="500" fill="#9FE1CB">Task</text>
<rect x="350" y="194" width="88" height="32" rx="6" fill="#085041" stroke="#5DCAA5" stroke-width="0.5"/>
<text x="394" y="210" text-anchor="middle" dominant-baseline="central" font-size="11" font-weight="500" fill="#9FE1CB">Notification</text>
<rect x="448" y="194" width="88" height="32" rx="6" fill="#085041" stroke="#5DCAA5" stroke-width="0.5"/>
<text x="492" y="210" text-anchor="middle" dominant-baseline="central" font-size="12" font-weight="500" fill="#9FE1CB">Profile</text>
<rect x="544" y="194" width="88" height="32" rx="6" fill="#085041" stroke="#5DCAA5" stroke-width="0.5"/>
<text x="588" y="210" text-anchor="middle" dominant-baseline="central" font-size="11" font-weight="500" fill="#9FE1CB">Dashboard</text>

<line x1="340" y1="226" x2="340" y2="268" stroke="#3a3a4a" marker-end="url(#arrow2)"/>

<!-- SERVICES -->
<rect x="40" y="260" width="600" height="56" rx="10" fill="none" stroke="#2a2a3a" stroke-width="1" stroke-dasharray="5 3"/>
<text x="56" y="276" font-size="9" fill="#4a4870" letter-spacing="1">SERVICES (BUSINESS LOGIC)</text>
<rect x="56" y="274" width="88" height="32" rx="6" fill="#0C447C" stroke="#85B7EB" stroke-width="0.5"/>
<text x="100" y="290" text-anchor="middle" dominant-baseline="central" font-size="11" font-weight="500" fill="#B5D4F4">AuthService</text>
<rect x="154" y="274" width="88" height="32" rx="6" fill="#0C447C" stroke="#85B7EB" stroke-width="0.5"/>
<text x="198" y="290" text-anchor="middle" dominant-baseline="central" font-size="11" font-weight="500" fill="#B5D4F4">OtpService</text>
<rect x="252" y="274" width="88" height="32" rx="6" fill="#0C447C" stroke="#85B7EB" stroke-width="0.5"/>
<text x="296" y="290" text-anchor="middle" dominant-baseline="central" font-size="10" font-weight="500" fill="#B5D4F4">ProjectService</text>
<rect x="350" y="274" width="88" height="32" rx="6" fill="#0C447C" stroke="#85B7EB" stroke-width="0.5"/>
<text x="394" y="290" text-anchor="middle" dominant-baseline="central" font-size="10" font-weight="500" fill="#B5D4F4">TaskService</text>
<rect x="448" y="274" width="88" height="32" rx="6" fill="#0C447C" stroke="#85B7EB" stroke-width="0.5"/>
<text x="492" y="290" text-anchor="middle" dominant-baseline="central" font-size="10" font-weight="500" fill="#B5D4F4">EmailService</text>
<rect x="544" y="274" width="88" height="32" rx="6" fill="#0C447C" stroke="#85B7EB" stroke-width="0.5"/>
<text x="588" y="290" text-anchor="middle" dominant-baseline="central" font-size="10" font-weight="500" fill="#B5D4F4">DashboardSvc</text>

<line x1="100" y1="306" x2="100" y2="348" stroke="#3a3a4a" marker-end="url(#arrow2)"/>
<line x1="198" y1="306" x2="198" y2="348" stroke="#3a3a4a" marker-end="url(#arrow2)"/>

<!-- SECURITY -->
<rect x="40" y="340" width="380" height="56" rx="10" fill="none" stroke="#2a2a3a" stroke-width="1" stroke-dasharray="5 3"/>
<text x="56" y="356" font-size="9" fill="#4a4870" letter-spacing="1">SECURITY</text>
<rect x="56" y="354" width="100" height="32" rx="6" fill="#633806" stroke="#EF9F27" stroke-width="0.5"/>
<text x="106" y="370" text-anchor="middle" dominant-baseline="central" font-size="11" font-weight="500" fill="#FAC775">JwtUtil</text>
<rect x="166" y="354" width="120" height="32" rx="6" fill="#633806" stroke="#EF9F27" stroke-width="0.5"/>
<text x="226" y="370" text-anchor="middle" dominant-baseline="central" font-size="11" font-weight="500" fill="#FAC775">UserPrincipal</text>
<rect x="296" y="354" width="114" height="32" rx="6" fill="#633806" stroke="#EF9F27" stroke-width="0.5"/>
<text x="353" y="370" text-anchor="middle" dominant-baseline="central" font-size="10" font-weight="500" fill="#FAC775">TaskSecuritySvc</text>

<!-- MESSAGING -->
<rect x="440" y="340" width="200" height="56" rx="10" fill="none" stroke="#2a2a3a" stroke-width="1" stroke-dasharray="5 3"/>
<text x="456" y="356" font-size="9" fill="#4a4870" letter-spacing="1">MESSAGING</text>
<rect x="456" y="354" width="168" height="32" rx="6" fill="#72243E" stroke="#ED93B1" stroke-width="0.5"/>
<text x="540" y="370" text-anchor="middle" dominant-baseline="central" font-size="12" font-weight="500" fill="#F4C0D1">RabbitMQ</text>

<line x1="200" y1="396" x2="200" y2="448" stroke="#3a3a4a" marker-end="url(#arrow2)"/>
<line x1="394" y1="306" x2="394" y2="448" stroke="#3a3a4a" marker-end="url(#arrow2)"/>
<line x1="492" y1="306" x2="492" y2="448" stroke="#3a3a4a" marker-end="url(#arrow2)"/>
<line x1="540" y1="396" x2="540" y2="448" stroke="#3a3a4a" marker-end="url(#arrow2)"/>

<!-- DATA LAYER -->
<rect x="40" y="440" width="600" height="56" rx="10" fill="none" stroke="#2a2a3a" stroke-width="1" stroke-dasharray="5 3"/>
<text x="56" y="456" font-size="9" fill="#4a4870" letter-spacing="1">DATA LAYER</text>
<rect x="56" y="454" width="130" height="32" rx="6" fill="#27500A" stroke="#97C459" stroke-width="0.5"/>
<text x="121" y="470" text-anchor="middle" dominant-baseline="central" font-size="11" font-weight="500" fill="#C0DD97">MySQL (Flyway)</text>
<rect x="200" y="454" width="100" height="32" rx="6" fill="#27500A" stroke="#97C459" stroke-width="0.5"/>
<text x="250" y="470" text-anchor="middle" dominant-baseline="central" font-size="11" font-weight="500" fill="#C0DD97">Redis Cache</text>
<rect x="316" y="454" width="130" height="32" rx="6" fill="#27500A" stroke="#97C459" stroke-width="0.5"/>
<text x="381" y="470" text-anchor="middle" dominant-baseline="central" font-size="11" font-weight="500" fill="#C0DD97">Gmail SMTP</text>
<rect x="462" y="454" width="160" height="32" rx="6" fill="#27500A" stroke="#97C459" stroke-width="0.5"/>
<text x="542" y="470" text-anchor="middle" dominant-baseline="central" font-size="11" font-weight="500" fill="#C0DD97">RabbitMQ Broker</text>

<!-- DIVIDER -->
<line x1="40" y1="518" x2="640" y2="518" stroke="#2a2a3a" stroke-width="0.5" stroke-dasharray="4 4"/>
<text x="340" y="514" text-anchor="middle" font-size="9" fill="#4a4870" letter-spacing="1">DATABASE SCHEMA</text>

<!-- USERS table -->
<rect x="56" y="528" width="140" height="132" rx="8" fill="#085041" stroke="#5DCAA5" stroke-width="0.5"/>
<line x1="56" y1="556" x2="196" y2="556" stroke="#5DCAA5" stroke-width="0.5"/>
<text x="126" y="544" text-anchor="middle" dominant-baseline="central" font-size="12" font-weight="600" fill="#9FE1CB">users</text>
<text x="72" y="572" font-size="11" fill="#5DCAA5">id (PK)</text>
<text x="72" y="589" font-size="11" fill="#5DCAA5">name, email</text>
<text x="72" y="606" font-size="10" fill="#5DCAA5">password (BCrypt)</text>
<text x="72" y="623" font-size="11" fill="#5DCAA5">email_verified</text>
<text x="72" y="640" font-size="11" fill="#5DCAA5">phone, bio, avatar</text>

<!-- OTP table -->
<rect x="210" y="528" width="156" height="132" rx="8" fill="#633806" stroke="#EF9F27" stroke-width="0.5"/>
<line x1="210" y1="556" x2="366" y2="556" stroke="#EF9F27" stroke-width="0.5"/>
<text x="288" y="544" text-anchor="middle" dominant-baseline="central" font-size="10" font-weight="600" fill="#FAC775">otp_verifications</text>
<text x="226" y="572" font-size="11" fill="#EF9F27">id (PK)</text>
<text x="226" y="589" font-size="11" fill="#EF9F27">email, otp</text>
<text x="226" y="606" font-size="11" fill="#EF9F27">purpose (ENUM)</text>
<text x="226" y="623" font-size="11" fill="#EF9F27">expires_at</text>
<text x="226" y="640" font-size="10" fill="#EF9F27">verified, used, attempts</text>

<!-- PROJECTS table -->
<rect x="382" y="528" width="134" height="112" rx="8" fill="#0C447C" stroke="#85B7EB" stroke-width="0.5"/>
<line x1="382" y1="556" x2="516" y2="556" stroke="#85B7EB" stroke-width="0.5"/>
<text x="449" y="544" text-anchor="middle" dominant-baseline="central" font-size="12" font-weight="600" fill="#B5D4F4">projects</text>
<text x="398" y="572" font-size="11" fill="#85B7EB">id (PK)</text>
<text x="398" y="589" font-size="11" fill="#85B7EB">name, description</text>
<text x="398" y="606" font-size="11" fill="#85B7EB">created_by (FK)</text>

<!-- PROJECT MEMBERS table -->
<rect x="530" y="528" width="110" height="112" rx="8" fill="#3C3489" stroke="#AFA9EC" stroke-width="0.5"/>
<line x1="530" y1="556" x2="640" y2="556" stroke="#AFA9EC" stroke-width="0.5"/>
<text x="585" y="543" text-anchor="middle" dominant-baseline="central" font-size="10" font-weight="600" fill="#CECBF6">project</text>
<text x="585" y="556" text-anchor="middle" dominant-baseline="central" font-size="10" font-weight="600" fill="#CECBF6">_members</text>
<text x="542" y="572" font-size="10" fill="#AFA9EC">project_id (FK)</text>
<text x="542" y="589" font-size="10" fill="#AFA9EC">user_id (FK)</text>
<text x="542" y="606" font-size="10" fill="#AFA9EC">role (ENUM)</text>

<!-- FK lines row 1 -->
<line x1="196" y1="594" x2="210" y2="594" stroke="#3a3a4a" stroke-width="0.5" stroke-dasharray="3 3"/>
<line x1="516" y1="594" x2="530" y2="594" stroke="#3a3a4a" stroke-width="0.5" stroke-dasharray="3 3"/>

<!-- Row 2 arrows -->
<line x1="126" y1="660" x2="126" y2="678" stroke="#3a3a4a" stroke-width="0.5" stroke-dasharray="3 3" marker-end="url(#arrow2)"/>
<line x1="288" y1="660" x2="288" y2="678" stroke="#3a3a4a" stroke-width="0.5" stroke-dasharray="3 3" marker-end="url(#arrow2)"/>

<!-- TASKS table -->
<rect x="56" y="680" width="140" height="130" rx="8" fill="#3C3489" stroke="#AFA9EC" stroke-width="0.5"/>
<line x1="56" y1="708" x2="196" y2="708" stroke="#AFA9EC" stroke-width="0.5"/>
<text x="126" y="696" text-anchor="middle" dominant-baseline="central" font-size="12" font-weight="600" fill="#CECBF6">tasks</text>
<text x="72" y="724" font-size="11" fill="#AFA9EC">id (PK)</text>
<text x="72" y="741" font-size="11" fill="#AFA9EC">project_id (FK)</text>
<text x="72" y="758" font-size="11" fill="#AFA9EC">title, description</text>
<text x="72" y="775" font-size="11" fill="#AFA9EC">priority, status</text>
<text x="72" y="792" font-size="11" fill="#AFA9EC">assigned_to (FK)</text>

<!-- NOTIFICATIONS table -->
<rect x="212" y="680" width="154" height="112" rx="8" fill="#72243E" stroke="#ED93B1" stroke-width="0.5"/>
<line x1="212" y1="708" x2="366" y2="708" stroke="#ED93B1" stroke-width="0.5"/>
<text x="289" y="696" text-anchor="middle" dominant-baseline="central" font-size="11" font-weight="600" fill="#F4C0D1">notifications</text>
<text x="228" y="724" font-size="11" fill="#ED93B1">id (PK)</text>
<text x="228" y="741" font-size="11" fill="#ED93B1">user_id (FK)</text>
<text x="228" y="758" font-size="10" fill="#ED93B1">type, title, message</text>
<text x="228" y="775" font-size="11" fill="#ED93B1">is_read, read_at</text>

<!-- COMMENTS table -->
<rect x="382" y="680" width="134" height="112" rx="8" fill="#444441" stroke="#B4B2A9" stroke-width="0.5"/>
<line x1="382" y1="708" x2="516" y2="708" stroke="#B4B2A9" stroke-width="0.5"/>
<text x="449" y="696" text-anchor="middle" dominant-baseline="central" font-size="12" font-weight="600" fill="#D3D1C7">comments</text>
<text x="398" y="724" font-size="11" fill="#B4B2A9">id (PK)</text>
<text x="398" y="741" font-size="11" fill="#B4B2A9">task_id (FK)</text>
<text x="398" y="758" font-size="11" fill="#B4B2A9">user_id (FK)</text>
<text x="398" y="775" font-size="10" fill="#B4B2A9">content, created_at</text>

<!-- BADGES -->
<rect x="40" y="830" width="180" height="36" rx="8" fill="#27500A" stroke="#97C459" stroke-width="0.5"/>
<text x="130" y="845" text-anchor="middle" dominant-baseline="central" font-size="12" font-weight="600" fill="#C0DD97">Resilience4j</text>
<text x="130" y="860" text-anchor="middle" dominant-baseline="central" font-size="10" fill="#97C459">Circuit Breaker · Retry · Bulkhead</text>

<rect x="234" y="830" width="130" height="36" rx="8" fill="#633806" stroke="#EF9F27" stroke-width="0.5"/>
<text x="299" y="845" text-anchor="middle" dominant-baseline="central" font-size="12" font-weight="600" fill="#FAC775">Flyway</text>
<text x="299" y="860" text-anchor="middle" dominant-baseline="central" font-size="10" fill="#EF9F27">DB migrations (V1)</text>

<rect x="378" y="830" width="130" height="36" rx="8" fill="#713B26" stroke="#F0997B" stroke-width="0.5"/>
<text x="443" y="845" text-anchor="middle" dominant-baseline="central" font-size="12" font-weight="600" fill="#F5C4B3">Actuator</text>
<text x="443" y="860" text-anchor="middle" dominant-baseline="central" font-size="10" fill="#F0997B">health · metrics · CB</text>

<rect x="522" y="830" width="118" height="36" rx="8" fill="#3C3489" stroke="#AFA9EC" stroke-width="0.5"/>
<text x="581" y="845" text-anchor="middle" dominant-baseline="central" font-size="12" font-weight="600" fill="#CECBF6">OpenAPI</text>
<text x="581" y="860" text-anchor="middle" dominant-baseline="central" font-size="10" fill="#AFA9EC">Swagger UI</text>
</svg>
      </div>
    </div>

    <div class="layer-legend">
      <div class="legend-item"><div class="legend-dot" style="background:#3C3489;border:1px solid #AFA9EC"></div>Client / Controllers</div>
      <div class="legend-item"><div class="legend-dot" style="background:#713B26;border:1px solid #F0997B"></div>Gateway / Filters</div>
      <div class="legend-item"><div class="legend-dot" style="background:#085041;border:1px solid #5DCAA5"></div>Services / Controllers</div>
      <div class="legend-item"><div class="legend-dot" style="background:#0C447C;border:1px solid #85B7EB"></div>Service Layer</div>
      <div class="legend-item"><div class="legend-dot" style="background:#633806;border:1px solid #EF9F27"></div>Security</div>
      <div class="legend-item"><div class="legend-dot" style="background:#72243E;border:1px solid #ED93B1"></div>Messaging / Notifications</div>
      <div class="legend-item"><div class="legend-dot" style="background:#27500A;border:1px solid #97C459"></div>Data Layer</div>
      <div class="legend-item"><div class="legend-dot" style="background:#444441;border:1px solid #B4B2A9"></div>Audit / Comments</div>
    </div>
  </section>

  <!-- SETUP -->
  <section id="setup">
    <h2>Setup &amp; Run</h2>
    <div class="setup-steps">
      <div class="setup-step">
        <div class="step-circle">1</div>
        <div class="step-content">
          <div class="step-title">Clone &amp; configure</div>
          <div class="code-block">
            <div class="code-header"><span class="code-lang">bash</span><div class="code-dots"><div class="dot r"></div><div class="dot y"></div><div class="dot g"></div></div></div>
            <pre>git clone https://github.com/yourusername/team-task-manager.git
cd team-task-manager</pre>
          </div>
        </div>
      </div>
      <div class="setup-step">
        <div class="step-circle">2</div>
        <div class="step-content">
          <div class="step-title">Create database</div>
          <div class="code-block">
            <div class="code-header"><span class="code-lang">sql</span><div class="code-dots"><div class="dot r"></div><div class="dot y"></div><div class="dot g"></div></div></div>
            <pre><span class="kw">CREATE DATABASE</span> taskmanager;
<span class="cmt">-- Flyway auto-creates all tables on startup</span></pre>
          </div>
        </div>
      </div>
      <div class="setup-step">
        <div class="step-circle">3</div>
        <div class="step-content">
          <div class="step-title">Configure application.yml</div>
          <div class="code-block">
            <div class="code-header"><span class="code-lang">yaml</span><div class="code-dots"><div class="dot r"></div><div class="dot y"></div><div class="dot g"></div></div></div>
            <pre><span class="key">spring</span>:
  <span class="key">datasource</span>:
    <span class="key">url</span>: <span class="str">jdbc:mysql://localhost:3306/taskmanager</span>
    <span class="key">username</span>: <span class="str">root</span>
    <span class="key">password</span>: <span class="str">your_password</span>
  <span class="key">mail</span>:
    <span class="key">username</span>: <span class="str">your_gmail@gmail.com</span>
    <span class="key">password</span>: <span class="str">your_16_char_app_password</span>

<span class="key">app</span>:
  <span class="key">mail</span>:
    <span class="key">from</span>: <span class="str">your_gmail@gmail.com</span></pre>
          </div>
        </div>
      </div>
      <div class="setup-step">
        <div class="step-circle">4</div>
        <div class="step-content">
          <div class="step-title">Run the application</div>
          <div class="code-block">
            <div class="code-header"><span class="code-lang">bash</span><div class="code-dots"><div class="dot r"></div><div class="dot y"></div><div class="dot g"></div></div></div>
            <pre>mvn spring-boot:run</pre>
          </div>
          <div style="display:flex;gap:10px;flex-wrap:wrap;margin-top:10px;">
            <span class="pill teal">localhost:8080/swagger-ui.html</span>
            <span class="pill">localhost:8080/actuator/health</span>
          </div>
        </div>
      </div>
    </div>
  </section>

  <!-- ENV VARS -->
  <section>
    <h2>Environment Variables</h2>
    <div class="env-grid">
      <div class="env-item"><span class="env-key">PORT</span><span class="env-desc">Server port (default: 8080)</span></div>
      <div class="env-item"><span class="env-key">JWT_SECRET</span><span class="env-desc">JWT signing key (min 32 chars)</span></div>
      <div class="env-item"><span class="env-key">MAIL_USERNAME</span><span class="env-desc">Gmail address for sending</span></div>
      <div class="env-item"><span class="env-key">MAIL_PASSWORD</span><span class="env-desc">Gmail 16-char App Password</span></div>
      <div class="env-item"><span class="env-key">REDIS_URL</span><span class="env-desc">Redis connection URL</span></div>
      <div class="env-item"><span class="env-key">RABBITMQ_URL</span><span class="env-desc">RabbitMQ AMQP URL</span></div>
    </div>
  </section>

  <!-- SECURITY -->
  <section id="security">
    <h2>Security</h2>
    <div class="security-grid">
      <div class="sec-item"><div class="sec-icon">🔐</div><div><div class="sec-title">BCrypt Passwords</div><div class="sec-desc">Strength 12 hashing</div></div></div>
      <div class="sec-item"><div class="sec-icon">🪙</div><div><div class="sec-title">JWT — HMAC-SHA256</div><div class="sec-desc">24 hour expiry</div></div></div>
      <div class="sec-item"><div class="sec-icon">📨</div><div><div class="sec-title">OTP Validation</div><div class="sec-desc">3 attempts, 5 min expiry, 30s cooldown</div></div></div>
      <div class="sec-item"><div class="sec-icon">🚦</div><div><div class="sec-title">Rate Limiting</div><div class="sec-desc">10 req burst, 5 req/s refill</div></div></div>
      <div class="sec-item"><div class="sec-icon">🌐</div><div><div class="sec-title">CORS Configured</div><div class="sec-desc">Update origins for production</div></div></div>
      <div class="sec-item"><div class="sec-icon">🚫</div><div><div class="sec-title">CSRF Disabled</div><div class="sec-desc">Stateless JWT API</div></div></div>
    </div>
  </section>

  <!-- QUICK TEST -->
  <section>
    <h2>Quick Test</h2>
    <div class="code-block">
      <div class="code-header"><span class="code-lang">bash — test auth flow</span><div class="code-dots"><div class="dot r"></div><div class="dot y"></div><div class="dot g"></div></div></div>
      <pre><span class="cmt"># Step 1 — Register (sends OTP to email)</span>
curl -X POST http://localhost:8080/api/auth/register \
  -H <span class="str">"Content-Type: application/json"</span> \
  -d <span class="str">'{"name":"Madhavan","email":"your@email.com"}'</span>

<span class="cmt"># Step 2 — Verify OTP + set password</span>
curl -X POST http://localhost:8080/api/auth/verify-otp \
  -H <span class="str">"Content-Type: application/json"</span> \
  -d <span class="str">'{"name":"Madhavan","email":"your@email.com","otp":"1234","password":"secret123"}'</span>

<span class="cmt"># Step 3 — Login</span>
curl -X POST http://localhost:8080/api/auth/login \
  -H <span class="str">"Content-Type: application/json"</span> \
  -d <span class="str">'{"email":"your@email.com","password":"secret123"}'</span></pre>
    </div>
  </section>

  <div class="footer">
    <span>Team Task Manager — Spring Boot 3.2</span>
    <span class="footer-badge">MIT License</span>
  </div>

</div>
</body>
</html>
