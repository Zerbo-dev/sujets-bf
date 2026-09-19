// Script à lancer UNE SEULE FOIS en local pour obtenir un refresh token
// OAuth2 Google Drive, à mettre dans GOOGLE_OAUTH_REFRESH_TOKEN.
//
// Prérequis (Google Cloud Console → APIs & Services) :
//   1. Activer l'API "Google Drive API" sur ton projet.
//   2. Créer un identifiant OAuth 2.0 de type "Application de bureau"
//      (Desktop app) → tu obtiens un Client ID + Client Secret.
//   3. Écran de consentement OAuth : ajouter ton propre compte Gmail
//      (celui qui possède le dossier "Bibliothèque scolaire Burkina")
//      comme "utilisateur de test" si l'app est en mode "Testing".
//
// Utilisation (Windows cmd.exe — une ligne à la fois) :
//   set GOOGLE_OAUTH_CLIENT_ID=...
//   set GOOGLE_OAUTH_CLIENT_SECRET=...
//   node scripts/get-google-refresh-token.mjs
//
// Le script ouvre une petite page locale, te donne une URL à ouvrir dans
// ton navigateur. Connecte-toi avec le compte Gmail propriétaire du Drive,
// autorise l'accès : le code est récupéré automatiquement (pas de
// copier-coller — Google a désactivé le flux "oob" en 2022 pour les
// nouveaux identifiants). Le refresh token s'affiche ensuite dans le
// terminal — colle-le dans .env.local (GOOGLE_OAUTH_REFRESH_TOKEN) et sur
// Vercel (Environment Variables).

import { google } from 'googleapis';
import http from 'node:http';

const clientId = process.env.GOOGLE_OAUTH_CLIENT_ID;
const clientSecret = process.env.GOOGLE_OAUTH_CLIENT_SECRET;

if (!clientId || !clientSecret) {
  console.error(
    'Définis GOOGLE_OAUTH_CLIENT_ID et GOOGLE_OAUTH_CLIENT_SECRET avant de lancer ce script.'
  );
  process.exit(1);
}

const PORT = 53682; // port arbitraire fixe, local uniquement
const REDIRECT_URI = `http://127.0.0.1:${PORT}/oauth2callback`;

const oauth2Client = new google.auth.OAuth2(clientId, clientSecret, REDIRECT_URI);

const authUrl = oauth2Client.generateAuthUrl({
  access_type: 'offline', // indispensable pour obtenir un refresh_token
  prompt: 'consent', // force le renvoi du refresh_token même si déjà autorisé avant
  scope: ['https://www.googleapis.com/auth/drive'],
});

console.log('\n1. Ouvre cette URL dans ton navigateur, connecte-toi avec le compte');
console.log('   Gmail propriétaire du dossier "Bibliothèque scolaire Burkina" :\n');
console.log(authUrl);
console.log(
  "\n2. Autorise l'accès. Le navigateur va rediriger vers 127.0.0.1 — c'est normal,"
);
console.log('   ce script écoute justement à cette adresse. Ne ferme rien.\n');

const server = http.createServer(async (req, res) => {
  if (!req.url?.startsWith('/oauth2callback')) {
    res.writeHead(404).end();
    return;
  }

  const url = new URL(req.url, REDIRECT_URI);
  const code = url.searchParams.get('code');
  const errorParam = url.searchParams.get('error');

  if (errorParam) {
    res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
    res.end('<h1>Autorisation refusée.</h1><p>Tu peux fermer cet onglet.</p>');
    console.error(`\n❌ Google a renvoyé une erreur : ${errorParam}`);
    server.close();
    process.exit(1);
  }

  if (!code) {
    res.writeHead(400).end('Code manquant.');
    return;
  }

  res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
  res.end('<h1>✅ Autorisé.</h1><p>Tu peux revenir au terminal et fermer cet onglet.</p>');

  server.close();

  try {
    const { tokens } = await oauth2Client.getToken(code);
    console.log('\n✅ Voilà ton refresh token — copie-le dans .env.local et sur Vercel :\n');
    console.log(`GOOGLE_OAUTH_REFRESH_TOKEN=${tokens.refresh_token}\n`);

    if (!tokens.refresh_token) {
      console.warn(
        '⚠️  Aucun refresh_token retourné. Si tu avais déjà autorisé cette app avant, ' +
          "révoque l'accès sur https://myaccount.google.com/permissions puis relance ce script."
      );
    }
  } catch (err) {
    console.error("\n❌ Échec de l'échange du code contre un token :", err.message ?? err);
    process.exit(1);
  }
});

server.listen(PORT, '127.0.0.1');
