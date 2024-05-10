import * as admin from "firebase-admin";

const serviceAccount = {
  'type': 'service_account',
  'project_id': "projo-f83ae",
  'private_key_id': process.env.FIREBASE_ADMIN_PRIVATE_KEY_ID,
  // See: https://stackoverflow.com/a/50376092/3403247.
  'private_key': "-----BEGIN PRIVATE KEY-----\nMIIEvwIBADANBgkqhkiG9w0BAQEFAASCBKkwggSlAgEAAoIBAQCj+Fvr5m43ReNB\ncFwC7uhiMV3BuQDTsHH+zftIpSgfxokugbObvqTTgm0DbVnBgkxnP8rnduIs0h3P\njUMzpVf+destR3KZxfMONDNyF5yHKyNI3Mw8b5rIZHERtr4WMP4iqC9hPYFOkBpk\nW2kl2cyfwqK85cK2MTLkiQpk8+sppE3KjzHYhGs/Rx9oYxV5jcVZ900i5sMEtmfE\n+kPM/WG1Xh5jz2ZJO0qp7/9hOsvGQl9mN3i0dzOTiP//mETvrM2zAPI9jTEVzErP\nngMPKDPPAtviGMQMOEvjkVW1OxZKctIvodOWbHci/P1Bfs6ENiavSa4Uzts/fOMx\nSnfK0DjZAgMBAAECggEAQTaY0ISwFxmbnb4jSiNclxkNMevzcT3+yJmBtE3DXIfo\nrW92UJ4NDfYUh0VpajX5TyMm/tHgeHUE2DRVoufCzHh3lWWSJah914tZXqoXXgcB\nHIx8ShkVFVglRCdLCKZpnL0JQwJkOCvF414bvqsV4ABYGwrCWxXMKOp8ENSWFdQY\nSSCDIRLsVaN6ME+Y+9FOsQC1a8BZ7TVe8c5ZzrY+nIWX7bMQW50GgbWDi8u/qPJl\n1bkwRXkrH898UuyMDI4n8bFFWnReELl0gx0ciEc/JjXCxWoTAIJLqass0q8C3HTr\nvR7r+OAW43vU9MzJSoS++xaWv3mZhIZrSOkVpqQdJQKBgQDhbRklsQmVicLJBLqu\nJx6DcT4+5EppmIjzT2JPXZiGgZC782GhJ77UU+KWaqWPOM0kQF+cluIwLeDs+Yj6\nJ2CRjUh/zZM/r7APpsd3PDNVsEgFp5nA8Xgud22wUhF0TzjFexyyxKZ4KztPHyDY\n7KMMzRVR4Wicp4de0R6FWNu84wKBgQC6NXq4VLe0fyf/GNRDk77RNoaRhn9M2G2l\nu4pEbnNZijXw2/w2TurJf4xmml10h2M67jknE8uimHoyQJkFSyilecWJ7G23AjCl\n2xWLn7Cfe7O032R62oEjHAaq4Qcu25fxNErlIDA/lBb3d0b8WKq6GuEfq2z99New\n1baDtZQ8EwKBgQCdF/FJYfmC23EBsykBCkPqZ7VwEJmGwwTVQkIJevk66vnY8P/d\nVZxXzWl/VyyvBW94TuASeNeBqccwfakmYuCaLjIS1klCPYXdMmWYwzwm/+UBA85T\nNjOBdjrbgCWnvzmZ7XSPZBl6bu4y8kdqxGXQGu87k3Dakqj0u5igZs8i7wKBgQCL\nxKigw7ZAXVGAQPrS3otULkFD6liTLcDfra1TQDSE+SET8YuWmBXTuVGBkkyjsxvg\nl/9+PXWUTi8qmSJCvu97hbOomzafL52kYJYDf5Hro8Z39VZOgMR9vgOjL9VcbqfV\n/RJaeZa9okK67WTy9PrxRkvEob/lv2pG6aNdqWXi0QKBgQC1C3/rPkY+RfeYDPCm\nJsbwtlg/kovgWtZf+hNC36y2ywv62FLe5/4JIw2zDdQ00sUdkt/T/hhkOMWBbRqC\nWOjr9I0T3HaNhuHQpEPhTVOgNjz86JyEqhftum4zDVN5hzy+WVLre/6RC1I1VMGJ\nfR+QGEPlAwsEvpW9j//DNOBVQg==\n-----END PRIVATE KEY-----\n",
  'client_email': process.env.FIREBASE_ADMIN_CLIENT_EMAIL,
  'client_id': process.env.FIREBASE_ADMIN_CLIENT_ID,
  'auth_uri': 'https://accounts.google.com/o/oauth2/auth',
  'token_uri': 'https://oauth2.googleapis.com/token',
  'auth_provider_x509_cert_url': process.env.FIREBASE_ADMIN_AUTH_PROVIDER_X509_CERT_URL,
  'client_x509_cert_url': process.env.FIREBASE_ADMIN_CLIENT_X509_CERT_URL,
  "universe_domain": "googleapis.com"
} as admin.ServiceAccount;

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
});

const db = admin.firestore();
const messaging = admin.messaging();
export {admin, db};