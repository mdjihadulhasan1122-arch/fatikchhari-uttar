/*
  ==========================================================
  পর্যটন স্থান — নতুন স্থান যোগ করতে একটি { ... } কপি করে নিচে বসাও।
  history = স্থানের ইতিহাস; ফাঁকা থাকলে "ইতিহাস যোগ হবে" দেখাবে।
  photo = ছবি (images ফোল্ডারে আপলোড করে নাম দাও), ফাঁকা থাকলে নমুনা ছবি।
  দূরত্ব ও বর্ণনা উইকিভ্রমণ/উইকিপিডিয়া থেকে; যাওয়ার আগে যাচাই করে নিও।
  ==========================================================
*/
window.TOURISM_DATA = [
  { bn: 'ভূজপুর জমিদার বাড়ি ও ফাঁসির ঘর', en: 'Bhujpur Zamindar House & Gallows', photo: '', icon: '🏛️',
    placeBn: 'পূর্ব ভূজপুর, ভূজপুর ইউনিয়ন', placeEn: 'East Bhujpur, Bhujpur Union',
    howBn: 'বিবিরহাট থেকে প্রায় ১২ কিমি, নাজিরহাট বাস স্টেশন থেকে প্রায় ২০ কিমি। সিএনজিতে যাওয়া যায়।',
    howEn: 'About 12 km from Bibirhat and 20 km from Nazirhat bus station. Reachable by CNG.',
    historyBn: 'জমিদার কাজী শাহাব উদ্দিন চৌধুরী ১৮০০ সালের দিকে এখানে জমিদারি প্রতিষ্ঠা করেন; তাঁর দাদা মহব্বত সাধু গৌড় নগর থেকে এসে চট্টগ্রামে বসতি করেন। বাড়িটি কাজী বাড়ি বা মিঞা বাড়ি নামেও পরিচিত। বাড়িতে একটি ফাঁসির মঞ্চ ছিল, যা ব্রিটিশদের খুশি করতে তৈরি বলে উল্লেখ আছে। প্রায় ৬০ কক্ষের প্রাসাদটি এখন প্রায় ধ্বংসের মুখে; ফাঁসির মঞ্চ আর নেই, পরিখা ভরাট। বাড়ির মসজিদটি এখনও ভালো অবস্থায়। জমিদারি বিলুপ্ত হয় প্রায় ১৯৫৫ সালে।',
    historyEn: 'Zamindar Kazi Shahab Uddin Chowdhury founded the estate around 1800; his grandfather Mohabbat Sadhu came from Gaur Nagar and settled in Chattogram. Also called Kazi Bari or Miah Bari. It had a gallows said to have been built to please the British. The ~60-room palace is now nearly in ruins; the gallows is gone and the moat filled in, but the house mosque is still in good condition. The zamindari ended around 1955.' },
  { bn: 'মং রাজার দীঘি', en: "Mong Raja's Pond", photo: '', icon: '🌊',
    placeBn: 'পশ্চিম ভূজপুর, ভূজপুর ইউনিয়ন', placeEn: 'West Bhujpur, Bhujpur Union',
    howBn: 'সিএনজিতে যাওয়া যায়; জমিদার বাড়ির কাছাকাছি দূরত্ব।', howEn: 'Reachable by CNG; about the same distance as the zamindar house.',
    historyBn: '', historyEn: '' },
  { bn: 'হালদা রাবার ড্যাম', en: 'Halda Rubber Dam', photo: '', icon: '💧',
    placeBn: 'কাজিরহাট, ভূজপুর ইউনিয়ন', placeEn: 'Kazirhat, Bhujpur Union',
    howBn: 'বিবিরহাট থেকে প্রায় ১২ কিমি উত্তর-পশ্চিমে।', howEn: 'About 12 km north-west of Bibirhat.',
    historyBn: '', historyEn: '' },
  { bn: 'ফটিকছড়ি নদীর উৎস (সীতাকুণ্ড পাহাড়)', en: 'Source of the Fatikchhari river', photo: '', icon: '⛰️',
    placeBn: 'সীতাকুণ্ড পাহাড়, ভূজপুরের পশ্চিমে', placeEn: 'Sitakunda hills, west of Bhujpur',
    howBn: '', howEn: '', historyBn: '', historyEn: '' },
  { bn: 'হারুয়ালছড়ি ফকিরপাড়া গায়েবী মসজিদ', en: 'Fakirpara Gayebi Mosque, Harualchhari', photo: '', icon: '🕌',
    placeBn: 'হারুয়ালছড়ি ইউনিয়ন', placeEn: 'Harualchhari Union',
    howBn: 'বিবিরহাট থেকে প্রায় সাড়ে ৭ কিমি, নাজিরহাট থেকে প্রায় ১২ কিমি উত্তর-পশ্চিমে। সৌন্দর্যের জন্য বিশেষভাবে উল্লেখযোগ্য।',
    howEn: 'About 7.5 km from Bibirhat and 12 km from Nazirhat, north-west. Noted for its beauty.',
    historyBn: '', historyEn: '' },
  { bn: 'হালদা ভ্যালি চা বাগান', en: 'Halda Valley Tea Garden', photo: '', icon: '🍃',
    placeBn: 'নারায়ণহাট ইউনিয়ন', placeEn: 'Narayanhat Union',
    howBn: 'বিবিরহাট থেকে প্রায় ২০ কিমি উত্তর-পশ্চিমে। সিএনজিতে যাওয়া যায়।', howEn: 'About 20 km north-west of Bibirhat. Reachable by CNG.',
    historyBn: '', historyEn: '' },
  { bn: 'দাঁতমারা রাবার বাগান ও নিউ দাঁতমারা চা বাগান', en: 'Dantmara Rubber Garden & New Dantmara Tea Garden', photo: '', icon: '🌳',
    placeBn: 'দাঁতমারা ইউনিয়ন', placeEn: 'Dantmara Union',
    howBn: 'বিবিরহাট থেকে প্রায় ২৬ কিমি উত্তর-পশ্চিমে। সিএনজিতে যাওয়া যায়।', howEn: 'About 26 km north-west of Bibirhat. Reachable by CNG.',
    historyBn: '', historyEn: '' },
  { bn: 'রামগড় চা বাগান', en: 'Ramgarh Tea Garden', photo: '', icon: '🍃',
    placeBn: 'বাগানবাজার ইউনিয়ন', placeEn: 'Baganbazar Union',
    howBn: 'বিবিরহাট থেকে প্রায় ৪০ কিমি উত্তর-পশ্চিমে। সিএনজিতে যাওয়া যায়।', howEn: 'About 40 km north-west of Bibirhat. Reachable by CNG.',
    historyBn: '', historyEn: '' }
];
