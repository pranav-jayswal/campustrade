<?php
/**
 * CampusTrade - PHP Session Management Demonstration Script
 * 
 * This standalone script demonstrates traditional server-side PHP Session management
 * (session_start(), $_SESSION superglobal, session timeout, and session destruction)
 * for academic curriculum verification and comparison against modern JWT stateless sessions.
 */

// 1. Initialize or resume session
session_start([
    'cookie_lifetime' => 86400, // 1 day
    'cookie_httponly' => true,  // Prevent JavaScript XSS access to session cookie
    'cookie_secure' => false,   // Set to true in HTTPS production
]);

$message = '';
$action = isset($_GET['action']) ? $_GET['action'] : '';

// 2. Handle Logout / Session Destruction
if ($action === 'logout') {
    $_SESSION = [];
    if (ini_get("session.use_cookies")) {
        $params = session_get_cookie_params();
        setcookie(session_name(), '', time() - 42000,
            $params["path"], $params["domain"],
            $params["secure"], $params["httponly"]
        );
    }
    session_destroy();
    header("Location: session_demo.php?msg=logged_out");
    exit;
}

// 3. Handle Login Simulation
if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $email = isset($_POST['email']) ? trim($_POST['email']) : '';
    $enrollmentNo = isset($_POST['enrollmentNo']) ? trim($_POST['enrollmentNo']) : '';

    if (!empty($email) && str_ends_with(strtolower($email), '@iar.ac.in')) {
        // Store user identity securely in PHP Session
        $_SESSION['user'] = [
            'name' => 'Verified Student Scholar',
            'email' => $email,
            'enrollmentNo' => !empty($enrollmentNo) ? $enrollmentNo : 'IAR/14665',
            'role' => 'student',
            'campus' => 'Institute of Advanced Research, Gandhinagar',
            'login_time' => time(),
            'session_id' => session_id(),
        ];
        $message = "Session successfully initialized! User stored in \$_SESSION.";
    } else {
        $message = "Error: Please provide a valid @iar.ac.in institutional email.";
    }
}

$isLoggedIn = isset($_SESSION['user']);
$currentUser = $isLoggedIn ? $_SESSION['user'] : null;
?>
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>CampusTrade - PHP Session Demonstration</title>
    <style>
        body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background: #0f172a; color: #f8fafc; margin: 0; padding: 40px 20px; }
        .container { max-width: 700px; margin: 0 auto; background: #1e293b; padding: 30px; border-radius: 16px; border: 1px solid #334155; box-shadow: 0 10px 25px rgba(0,0,0,0.4); }
        h1 { color: #38bdf8; margin-top: 0; font-size: 24px; border-bottom: 2px solid #334155; padding-bottom: 12px; }
        .badge { background: #0369a1; color: #e0f2fe; padding: 4px 10px; border-radius: 999px; font-size: 12px; font-weight: bold; }
        .alert { background: #1e3a8a; border: 1px solid #3b82f6; color: #dbeafe; padding: 12px; border-radius: 8px; margin-bottom: 20px; font-size: 14px; }
        .box { background: #0f172a; padding: 16px; border-radius: 8px; border: 1px solid #334155; font-family: monospace; font-size: 13px; color: #a5f3fc; overflow-x: auto; }
        label { display: block; margin: 12px 0 4px; font-size: 13px; font-weight: bold; color: #94a3b8; }
        input[type="text"], input[type="email"] { width: 100%; box-sizing: border-box; padding: 10px 14px; border-radius: 8px; border: 1px solid #475569; background: #0f172a; color: #ffffff; font-size: 14px; }
        button { background: #2563eb; color: #ffffff; border: none; padding: 10px 20px; border-radius: 8px; font-weight: bold; cursor: pointer; margin-top: 16px; transition: 0.2s; }
        button:hover { background: #1d4ed8; }
        .logout-btn { background: #dc2626; text-decoration: none; display: inline-block; padding: 8px 16px; border-radius: 8px; color: white; font-weight: bold; margin-top: 12px; }
        .logout-btn:hover { background: #b91c1c; }
        .comparison-table { width: 100%; border-collapse: collapse; margin-top: 24px; font-size: 13px; }
        .comparison-table th, .comparison-table td { border: 1px solid #334155; padding: 8px 12px; text-align: left; }
        .comparison-table th { background: #0f172a; color: #38bdf8; }
    </style>
</head>
<body>
<div class="container">
    <h1>CampusTrade <span class="badge">PHP Session Engine</span></h1>
    <p style="color: #94a3b8; font-size: 14px;">Demonstration of server-side PHP Session state management for academic review.</p>

    <?php if (!empty($message)): ?>
        <div class="alert"><?php echo htmlspecialchars($message); ?></div>
    <?php endif; ?>

    <?php if ($isLoggedIn): ?>
        <div style="background: rgba(16, 185, 129, 0.1); border: 1px solid #10b981; padding: 20px; border-radius: 12px;">
            <h3 style="color: #34d399; margin-top: 0;">Active PHP Session Authenticated</h3>
            <p><strong>Student Name:</strong> <?php echo htmlspecialchars($currentUser['name']); ?></p>
            <p><strong>Institutional Email:</strong> <?php echo htmlspecialchars($currentUser['email']); ?></p>
            <p><strong>Enrollment ID:</strong> <?php echo htmlspecialchars($currentUser['enrollmentNo']); ?></p>
            <p><strong>PHP Session ID (PHPSESSID):</strong> <code><?php echo htmlspecialchars($currentUser['session_id']); ?></code></p>
            <p><strong>Session Creation Timestamp:</strong> <?php echo date('Y-m-d H:i:s', $currentUser['login_time']); ?></p>

            <a href="session_demo.php?action=logout" class="logout-btn">Destroy PHP Session (Logout)</a>
        </div>

        <h4 style="margin-top: 24px; color: #94a3b8;">Current Raw $_SESSION Superglobal:</h4>
        <div class="box"><pre><?php print_r($_SESSION); ?></pre></div>
    <?php else: ?>
        <form method="POST" action="session_demo.php">
            <h3 style="color: #cbd5e1; margin-top: 0;">Start New PHP Authenticated Session</h3>
            <label for="email">IAR Institutional Email (@iar.ac.in):</label>
            <input type="email" id="email" name="email" value="pranav@iar.ac.in" required>

            <label for="enrollmentNo">Student Enrollment Number:</label>
            <input type="text" id="enrollmentNo" name="enrollmentNo" value="IAR/14665">

            <button type="submit">Initialize PHP Session</button>
        </form>
    <?php endif; ?>

    <h3 style="margin-top: 30px; color: #f1f5f9; font-size: 16px;">Architectural Comparison: PHP Sessions vs. MERN JWT Sessions</h3>
    <table class="comparison-table">
        <tr>
            <th>Feature</th>
            <th>Traditional PHP Sessions</th>
            <th>Modern MERN JWT Sessions (CampusTrade)</th>
        </tr>
        <tr>
            <td><strong>State Storage</strong></td>
            <td>Server file system / Memcached</td>
            <td>Stateless; stored client-side in localStorage/cookies</td>
        </tr>
        <tr>
            <td><strong>Decoupled SPA / Vercel</strong></td>
            <td>Difficult (Requires sticky sessions / same domain)</td>
            <td>Seamless (Transmitted in HTTP Authorization Bearer headers)</td>
        </tr>
        <tr>
            <td><strong>Scalability</strong></td>
            <td>Session synchronization bottlenecks</td>
            <td>Infinite horizontal scaling (No server state)</td>
        </tr>
        <tr>
            <td><strong>Mobile / Cross-platform</strong></td>
            <td>Cookie dependency issues</td>
            <td>Native JSON format supported across web & mobile apps</td>
        </tr>
    </table>
</div>
</body>
</html>
