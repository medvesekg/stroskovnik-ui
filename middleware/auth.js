export default function({ store, redirect, error, route }) {
  if (route.path !== '/login') {
    if (!store.state.auth.user.email) {
      return redirect('/login', { intended: route ? route.path : null })
    }

    if (store.state.auth.role !== 'admin') {
      return error({
        statusCode: 401,
        message: 'Tega ne smeš videt'
      })
    }
  }
}
