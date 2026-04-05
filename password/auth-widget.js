// auth-widget.js
class MyAuthWidget {
    constructor(config) {
        this.containerId = config.containerId; // Where to render the form
        this.apiUrl = config.apiUrl;           // The URL of your running backend
        this.onSuccess = config.onSuccess;     // What to do when login succeeds
    }

    mount() {
        const container = document.getElementById(this.containerId);
        if (!container) return console.error('Auth container not found!');

        // Create the UI dynamically
        container.innerHTML = `
            <div style="border: 1px solid #ccc; padding: 20px; border-radius: 8px; max-width: 300px; font-family: sans-serif;">
                <h3 style="margin-top: 0;">Login</h3>
                <input type="text" id="auth-username" placeholder="Username" style="width: 100%; padding: 8px; margin-bottom: 10px; box-sizing: border-box;" />
                <input type="password" id="auth-password" placeholder="Password" style="width: 100%; padding: 8px; margin-bottom: 10px; box-sizing: border-box;" />
                <button id="auth-submit-btn" style="width: 100%; padding: 10px; background: #007bff; color: white; border: none; border-radius: 4px; cursor: pointer;">Login</button>
                <p id="auth-message" style="color: red; font-size: 14px; display: none;"></p>
            </div>
        `;

        // Attach event listener
        document.getElementById('auth-submit-btn').addEventListener('click', () => this.login());
    }

    async login() {
        const username = document.getElementById('auth-username').value;
        const password = document.getElementById('auth-password').value;
        const messageEl = document.getElementById('auth-message');

        try {
            // Send request to YOUR backend
            const response = await fetch(`${this.apiUrl}/login`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ username, password })
            });

            const data = await response.json();

            if (response.ok) {
                messageEl.style.color = "green";
                messageEl.innerText = "Success!";
                messageEl.style.display = "block";
                
                // Trigger the developer's custom success function
                if (this.onSuccess) this.onSuccess(data);
            } else {
                messageEl.style.color = "red";
                messageEl.innerText = data.error;
                messageEl.style.display = "block";
            }
        } catch (err) {
            messageEl.innerText = "Network error connecting to auth server.";
            messageEl.style.display = "block";
        }
    }
}