/**
 * Cloud Function: إرسال إشعار Push فعلي لما يتسجّل مستند جديد في مجموعة notifications
 * ==========================================================================
 * ده الجزء اللي محتاج يتنشر على Firebase Cloud Functions (سيرفر) عشان الـ Push
 * يوصل للمستخدم حتى لو التطبيق مقفول تمامًا. الكود اللي في index.html وsw.js
 * بيسجّلوا "توكن الجهاز" بس، ومحتاجين الفنكشن دي عشان فعليًا تبعت الإشعار.
 *
 * خطوات النشر:
 * 1) لازم مشروع Firebase يكون على خطة Blaze (Pay as you go) — الـ Cloud Functions
 *    مش شغالة على الخطة المجانية Spark. أول 2 مليون استدعاء شهريًا مجانية برضو
 *    حتى على Blaze.
 * 2) ثبّت Firebase CLI على جهازك: npm install -g firebase-tools
 * 3) في مجلد المشروع: firebase login  ثم  firebase init functions
 *    (اختار المشروع studytogether-e8108، ولغة JavaScript)
 * 4) استبدل ملف functions/index.js بالملف ده، وشغّل: cd functions && npm install
 * 5) انشر: firebase deploy --only functions
 * 6) من Firebase Console → إعدادات المشروع → Cloud Messaging → Web Push certificates
 *    ولّد مفتاح VAPID، وحطّه بدل PASTE_YOUR_VAPID_KEY_HERE في index.html (بحث عن FCM_VAPID_KEY)
 */

const functions = require('firebase-functions');
const admin = require('firebase-admin');
admin.initializeApp();

exports.sendPushOnNotification = functions.firestore
  .document('notifications/{id}')
  .onCreate(async (snap, context) => {
    const n = snap.data();
    if (!n || !n.recipientUid) return null;

    const userDoc = await admin.firestore().collection('users').doc(n.recipientUid).get();
    const tokens = (userDoc.exists && userDoc.data().fcmTokens) || [];
    if (!tokens.length) return null;

    const TYPE_TITLES = {
      message: 'رسالة جديدة',
      comment: 'رد جديد على منشورك',
      like: 'إعجاب جديد',
      plan: 'تحديث في اشتراكك',
    };

    const message = {
      notification: {
        title: TYPE_TITLES[n.type] || 'نُدرس معًا',
        body: n.text || '',
      },
      tokens,
    };

    const res = await admin.messaging().sendEachForMulticast(message);

    // نظافة: شيل أي توكن باظ (مثلاً المستخدم مسح التطبيق) عشان مايتكررش المحاولة عليه
    const badTokens = [];
    res.responses.forEach((r, i) => {
      if (!r.success) badTokens.push(tokens[i]);
    });
    if (badTokens.length) {
      await admin.firestore().collection('users').doc(n.recipientUid).update({
        fcmTokens: admin.firestore.FieldValue.arrayRemove(...badTokens),
      });
    }
    return null;
  });
