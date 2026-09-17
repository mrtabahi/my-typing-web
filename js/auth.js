// AUTHENTICATION AND ROUTE GUARD MODULE
const AuthManager = {
    getUser: async function () {
        if (!supabaseClient) return null;
        const { data: { user } } = await supabaseClient.auth.getUser();
        return user;
    },

    getProfile: async function () {
        const user = await this.getUser();
        if (!user) return null;

        const { data: profile } = await supabaseClient
            .from('profiles')
            .select('*')
            .eq('id', user.id)
            .single();

        return profile;
    },

    login: async function (email, password) {
        const { data, error } = await supabaseClient.auth.signInWithPassword({ email, password });
        if (error) throw error;
        return data;
    },

    register: async function (email, password, fullName) {
        const { data, error } = await supabaseClient.auth.signUp({
            email,
            password,
            options: { data: { full_name: fullName } }
        });
        if (error) throw error;
        return data;
    },

    logout: async function () {
        await supabaseClient.auth.signOut();
        window.location.href = 'login.html';
    },

    requireAdminGuard: async function () {
        const profile = await this.getProfile();
        if (!profile || profile.role !== 'admin') {
            window.location.href = 'login.html';
        }
    }
};

// LOGIN FORM SUBMISSION HANDLER
document.addEventListener("DOMContentLoaded", () => {
    const loginForm = document.getElementById("login-form");
    
    if (loginForm) {
        loginForm.addEventListener("submit", async (e) => {
            e.preventDefault();

            const emailInput = document.getElementById("login-email");
            const passwordInput = document.getElementById("login-password");
            const submitBtn = loginForm.querySelector('button[type="submit"]');

            const email = emailInput ? emailInput.value.trim() : "";
            const password = passwordInput ? passwordInput.value : "";

            if (!email || !password) {
                alert("कृपया ईमेल और पासवर्ड दोनों दर्ज करें!");
                return;
            }

            try {
                if (submitBtn) submitBtn.disabled = true;

                // 1. Supabase में लॉगिन करें
                await AuthManager.login(email, password);

                // 2. लॉगिन होने के बाद यूजर का Profile/Role चेक करें
                const profile = await AuthManager.getProfile();

                // 3. Role के आधार पर सही पेज पर भेजें (बिना किसी टोस्ट/अलर्ट के)
                if (profile && profile.role === 'admin') {
                    window.location.href = 'admin.html'; // Admin सीधा एडमिन पैनल पर जाएगा
                } else {
                    window.location.href = 'index.html'; // Candidate होमपेज पर जाएगा
                }

            } catch (error) {
                alert("लॉगिन असफल: " + (error.message || "ईमेल या पासवर्ड गलत है!"));
                if (submitBtn) submitBtn.disabled = false;
            }
        });
    }
});
