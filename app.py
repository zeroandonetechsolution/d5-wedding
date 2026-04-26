from flask import Flask, request, jsonify, render_template_string, session, redirect, url_for
import sqlite3
import os
import requests # For potential real-world SMS API calls

app = Flask(__name__, static_folder='.', static_url_path='')
app.secret_key = 'super_secret_admin_key_123'

# Initialize SQLite database
def init_db():
    with sqlite3.connect('bookings.db') as conn:
        c = conn.cursor()
        c.execute('''CREATE TABLE IF NOT EXISTS bookings
                     (id INTEGER PRIMARY KEY AUTOINCREMENT,
                      names TEXT, date TEXT, location TEXT, 
                      package TEXT, amount TEXT, payment_method TEXT,
                      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP)''')
        conn.commit()

init_db()

# Simulated SMS / WhatsApp integration for automated sending
def send_admin_notification(booking_data):
    """
    Sends an automated notification to the admin mobile number.
    In a production environment, you would inject Twilio or WhatsApp Cloud API here.
    """
    admin_mobile = "+919876543210" # Placeholder for Admin's mobile number
    message = (
        f"*** NEW BOOKING ALERT! ***\n"
        f"Names: {booking_data.get('names')}\n"
        f"Date: {booking_data.get('date')}\n"
        f"Location: {booking_data.get('location')}\n"
        f"Package: {booking_data.get('package')}\n"
        f"Advance: {booking_data.get('amount')}"
    )
    
    print("\n" + "="*50)
    print(f"*** SENDING SMS TO ADMIN MOBILE {admin_mobile} (NO HUMAN INTERFERENCE) ***")
    print(message)
    print("="*50 + "\n")
    
    # Example of actual API call (commented out so it doesn't crash without keys):
    # url = "https://api.twilio.com/2010-04-01/Accounts/YOUR_SID/Messages.json"
    # payload = {'To': admin_mobile, 'From': '+1234567890', 'Body': message}
    # requests.post(url, auth=('YOUR_SID', 'YOUR_AUTH_TOKEN'), data=payload)
    
    return True

@app.route('/')
def index():
    return app.send_static_file('index.html')

@app.route('/api/book', methods=['POST'])
def book():
    data = request.json
    try:
        # Save to database
        with sqlite3.connect('bookings.db') as conn:
            c = conn.cursor()
            c.execute("INSERT INTO bookings (names, date, location, package, amount, payment_method) VALUES (?, ?, ?, ?, ?, ?)",
                      (data.get('names'), data.get('date'), data.get('location'), data.get('package'), data.get('amount'), data.get('payment_method')))
            conn.commit()
        
        # Automatically trigger mobile notification without human interference
        send_admin_notification(data)
        
        return jsonify({"status": "success", "message": "Booking received and admin notified automatically."})
    except Exception as e:
        return jsonify({"status": "error", "message": str(e)}), 500

# HTML Templates for Admin
HTML_LOGIN = '''
<!DOCTYPE html>
<html>
<head>
    <title>Admin Login - D5 Weddings</title>
    <style>
        body { background: url('https://images.unsplash.com/photo-1542042161784-26ab9e041e89?auto=format&fit=crop&w=1920&q=80') center/cover no-repeat; color: white; font-family: 'Inter', sans-serif; display: flex; justify-content: center; align-items: center; height: 100vh; margin: 0; position: relative; }
        body::before { content: ''; position: absolute; inset: 0; background: linear-gradient(to bottom, rgba(5,5,5,0.7), rgba(5,5,5,0.9)); z-index: -1; }
        .login-box { background: rgba(255,255,255,0.05); padding: 40px; border-radius: 12px; border: 1px solid rgba(212,175,55,0.3); text-align: center; backdrop-filter: blur(10px); width: 100%; max-width: 400px; box-sizing: border-box; z-index: 1;}
        h2 { color: #d4af37; font-family: 'Playfair Display', serif; font-size: 2rem; margin-bottom: 30px; margin-top: 0; }
        input { margin: 10px 0; padding: 15px; width: 100%; box-sizing: border-box; background: rgba(0,0,0,0.5); border: 1px solid rgba(255,255,255,0.1); color: white; border-radius: 6px; font-family: 'Inter', sans-serif;}
        input:focus { outline: none; border-color: #d4af37; }
        button { padding: 15px; width: 100%; background: #d4af37; border: none; color: black; font-weight: bold; cursor: pointer; border-radius: 6px; margin-top: 15px; font-size: 1rem; transition: 0.3s; font-family: 'Inter', sans-serif;}
        button:hover { background: #b5952f; transform: translateY(-2px); }
        .error { color: #ff4a4a; margin-top: 15px; font-size: 0.9rem; }
    </style>
</head>
<body>
    <div class="login-box">
        <h2>Admin Access</h2>
        <form method="POST">
            <input type="text" name="username" placeholder="Username" required>
            <input type="password" name="password" placeholder="Password" required>
            <button type="submit">Login</button>
        </form>
        {% if error %}<p class="error">{{ error }}</p>{% endif %}
        <div style="margin-top: 25px;">
            <a href="/" style="color: #d4af37; text-decoration: none; font-size: 0.95rem; font-weight: bold; border: 1px solid #d4af37; padding: 10px 20px; border-radius: 4px; display: inline-block; transition: 0.3s; background: rgba(0,0,0,0.5);">&larr; Back to Website</a>
        </div>
    </div>
    <script src="/animations.js"></script>
</body>
</html>
'''

HTML_ADMIN = '''
<!DOCTYPE html>
<html>
<head>
    <title>Admin Panel - Bookings</title>
    <style>
        body { background: url('https://images.unsplash.com/photo-1542042161784-26ab9e041e89?auto=format&fit=crop&w=1920&q=80') center/cover no-repeat fixed; color: white; font-family: 'Inter', sans-serif; padding: 40px; margin: 0; position: relative; }
        body::before { content: ''; position: fixed; inset: 0; background: linear-gradient(to bottom, rgba(5,5,5,0.8), rgba(5,5,5,0.95)); z-index: -1; }
        .container { max-width: 1200px; margin: 0 auto; position: relative; z-index: 1; }
        h2 { color: #d4af37; font-family: 'Playfair Display', serif; font-size: 2.5rem; margin: 0; }
        .header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 30px; border-bottom: 1px solid rgba(255,255,255,0.1); padding-bottom: 20px; }
        .logout { padding: 10px 20px; background: transparent; border: 1px solid #d4af37; color: #d4af37; text-decoration: none; border-radius: 4px; transition: 0.3s; font-weight: bold; }
        .logout:hover { background: #d4af37; color: black; }
        table { width: 100%; border-collapse: collapse; background: rgba(255,255,255,0.02); border-radius: 8px; overflow: hidden; }
        th, td { border-bottom: 1px solid rgba(255,255,255,0.05); padding: 15px 20px; text-align: left; }
        th { background: rgba(212,175,55,0.1); color: #d4af37; font-weight: 500; text-transform: uppercase; font-size: 0.9rem; letter-spacing: 1px; }
        tr:hover { background: rgba(255,255,255,0.05); }
        .empty { text-align: center; padding: 40px; color: #666; font-style: italic; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h2>Bookings Dashboard</h2>
            <a href="/admin/logout" class="logout">Logout</a>
        </div>
        <table>
            <tr>
                <th>ID</th>
                <th>Couple Names</th>
                <th>Event Date</th>
                <th>Location</th>
                <th>Package</th>
                <th>Advance Amt</th>
                <th>Payment</th>
                <th>Booked At</th>
            </tr>
            {% for row in bookings %}
            <tr>
                <td style="color:#888;">#{{ row[0] }}</td>
                <td style="font-weight: bold; font-size: 1.1rem;">{{ row[1] }}</td>
                <td>{{ row[2] }}</td>
                <td>{{ row[3] }}</td>
                <td><span style="color:#d4af37; border:1px solid #d4af37; padding:2px 8px; border-radius:20px; font-size:0.8rem;">{{ row[4] }}</span></td>
                <td>{{ row[5] }}</td>
                <td>{{ row[6] | upper }}</td>
                <td style="color:#888; font-size:0.9rem;">{{ row[7] }}</td>
            </tr>
            {% else %}
            <tr><td colspan="8" class="empty">No bookings yet. They will appear here automatically.</td></tr>
            {% endfor %}
        </table>
    </div>
    <script src="/animations.js"></script>
</body>
</html>
'''

@app.route('/admin', methods=['GET', 'POST'])
def admin():
    if request.method == 'POST':
        if request.form.get('username') == 'admin' and request.form.get('password') == '123456':
            session['admin'] = True
            return redirect(url_for('admin'))
        else:
            return render_template_string(HTML_LOGIN, error="Invalid credentials! Use admin / 123456")
    
    if not session.get('admin'):
        return render_template_string(HTML_LOGIN)
        
    with sqlite3.connect('bookings.db') as conn:
        c = conn.cursor()
        c.execute("SELECT * FROM bookings ORDER BY id DESC")
        bookings = c.fetchall()
        
    return render_template_string(HTML_ADMIN, bookings=bookings)

@app.route('/admin/logout')
def logout():
    session.pop('admin', None)
    return redirect(url_for('admin'))

if __name__ == '__main__':
    print("="*60)
    print("*** D5 Weddings Server is Running! ***")
    print("Public Website: http://127.0.0.1:5000/")
    print("Admin Panel:    http://127.0.0.1:5000/admin")
    print("="*60)
    app.run(debug=True, port=5000)
