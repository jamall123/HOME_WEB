// lib/firebase_options.dart
// إعدادات Firebase - يجب ملؤها بـ flutterfire configure
import 'package:firebase_core/firebase_core.dart' show FirebaseOptions;

class DefaultFirebaseOptions {
  static FirebaseOptions get currentPlatform {
    return web;
  }

  static const FirebaseOptions web = FirebaseOptions(
    apiKey: 'AIzaSyCJ8I06UGVBOJdnU4Upp_EekS7txwX-fBg',
    authDomain: 'jhomeweb-9ee56.firebaseapp.com',
    projectId: 'jhomeweb-9ee56',
    storageBucket: 'jhomeweb-9ee56.firebasestorage.app',
    messagingSenderId: '572713499787',
    appId: '1:572713499787:web:0cda5edea203991139288e',
    measurementId: 'G-ZFPKRZBMFJ',
  );
}