export default function(req, res, next) {
  console.log(req.headers)
  if (
    req.headers['X-Forwarded-Proto'] === 'https' ||
    process.env.NODE_ENV !== 'production'
  ) {
    next()
  } else if (
    req.headers['X-Forwarded-Proto'] !== 'https' &&
    req.headers['X-Forwarded-Port'] !== '443'
  ) {
    res.redirect('https://' + req.hostname + req.url)
  }
}
