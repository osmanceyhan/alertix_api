import admin from "firebase-admin";

// Firebase service account JSON dosya yolu .env'den gelir
// FIREBASE_SERVICE_ACCOUNT_PATH=./firebase-service-account.json
const serviceAccountPath = process.env.FIREBASE_SERVICE_ACCOUNT_PATH;

let firebaseInitialized = false;

export const initFirebase = () => {
  if (firebaseInitialized) return;

  try {
    if (serviceAccountPath) {
      // eslint-disable-next-line @typescript-eslint/no-require-imports
      const serviceAccount = require(serviceAccountPath);
      admin.initializeApp({
        credential: admin.credential.cert(serviceAccount),
      });
      firebaseInitialized = true;
      console.log("Firebase başarıyla başlatıldı");
    } else {
      console.log("Firebase yapılandırılmadı (FIREBASE_SERVICE_ACCOUNT_PATH tanımlı değil)");
    }
  } catch (error) {
    console.error("Firebase başlatma hatası:", error);
  }
};

export const isFirebaseReady = () => firebaseInitialized;

export default admin;
