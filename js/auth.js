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
        window.location.href = '/login.html';
    },

    requireAdminGuard: async function () {
        const profile = await this.getProfile();
        if (!profile || profile.role !== 'admin') {
            alert("Unauthorized Access. Admin credentials required.");
            window.location.href = '/login.html';
        }
    }
};
