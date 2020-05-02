export default function({ store, redirect, error }) {
  if (!store.state.auth.user.email) {
    return redirect('/login')
  }

  if (store.state.auth.role !== 'admin') {
    return error({
      statusCode: 401,
      message: 'Tega ne smeš videt'
    })
  }
}
