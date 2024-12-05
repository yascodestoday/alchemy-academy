class AdminAuthGuard {
    static checkAdminAccess() {
        const user = JSON.parse(localStorage.getItem('user') || '{}');
        
        // Check if user is logged in and is admin
        if (!user.email || user.email !== 'yaschraibi16@gmail.com') {
            window.location.href = '/pages/account/login.html';
            return false;
        }
        
        return true;
    }
}

export default AdminAuthGuard; 