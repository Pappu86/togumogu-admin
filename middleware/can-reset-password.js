export default function ({ store, redirect }) {
  // If the user can reset password, redirect to dashboard
  if (!store.state.settings.password_edit_enabled) {
    return redirect('/auth/login');
  }
}
