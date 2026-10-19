/*
  ==========================================================
  Supabase সংযোগ (রক্তদাতা নিবন্ধন ও তালিকার জন্য)
  supabaseKey এ শুধু anon / publishable key বসাও।
  service_role বা secret key কখনো এখানে বসাবে না।
  ==========================================================
*/
window.SITE_CONFIG = {
  supabaseUrl: 'https://yjlkbzkhqmggcmqhilhd.supabase.co',
  supabaseKey: 'sb_publishable_p6lYipLu2vLy3RJj7IKS3w_A9Z-urGE'
};

/*
  ==========================================================
  ফটিকছড়ি উত্তর / ভূজপুর: সাইটের তথ্য এই ফাইলে থাকে
  শুধু এই ফাইলের লেখা বদলালেই সাইটের তথ্য বদলে যাবে।
  কোনো তথ্য যোগ করার সময় কমা (,) আর উদ্ধৃতিচিহ্ন ('...') ঠিক রাখবে।
  bn = বাংলা লেখা, en = English লেখা
  ==========================================================
*/
window.SITE_DATA = {

  /* ---------- ১. ছবির স্লাইডার ----------
     নিজের তোলা ছবি GitHub-এ images ফোল্ডারে আপলোড করে src এ নাম দাও।
     উদাহরণ: src: 'images/bhujpur1.jpg'
     src ফাঁকা থাকলে নমুনা ব্যানার দেখাবে। */
  slides: [
    { src: '', bn: 'ভূজপুরের ছবি শীঘ্রই যোগ হবে', en: 'Photos of Bhujpur coming soon' },
    { src: '', bn: 'আমাদের এলাকা, আমাদের গর্ব', en: 'Our area, our pride' },
    { src: '', bn: 'একসাথে গড়ি তথ্যসমৃদ্ধ কমিউনিটি', en: 'Together we build an informed community' }
  ],

  /* ---------- ২. নোটিশ ----------
     নতুন নোটিশ সবার উপরে যোগ করো। date: বছর-মাস-দিন (যেমন 2026-10-18) */
  notices: [
    {
      date: '2026-10-18',
      bn: 'নোটিশ বোর্ড চালু হয়েছে',
      en: 'Notice board is now live',
      textBn: 'এলাকার যাচাই করা নোটিশ এখানে প্রকাশ করা হবে।',
      textEn: 'Verified local notices will be published here.'
    }
  ],

  /* ---------- ৩. ইউনিয়ন, ওয়ার্ড, চেয়ারম্যান ও মেম্বার ----------
     নিচের ইউনিয়নগুলো নমুনা। আসল ইউনিয়নের নাম ও জনপ্রতিনিধির নাম যাচাই করে বসাও।
     একজন মেম্বারের নাম এভাবে লেখা যায়:
       'রহিম উদ্দিন'
     অথবা ইংরেজি নাম ও ফোনসহ:
       { bn: 'রহিম উদ্দিন', en: 'Rahim Uddin', phone: '01XXXXXXXXX' }
     ফোন নম্বর শুধু সংশ্লিষ্ট ব্যক্তির অনুমতি নিয়ে দাও। */
  unions: [
    {
      bn: 'ভূজপুর ইউনিয়ন', en: 'Bhujpur Union',
      /* সূত্র: ভূজপুর ইউনিয়ন পরিষদের সরকারি ওয়েবসাইটের "জনপ্রতিনিধি" পাতা */
      chairman: { bn: 'এস এম এইচ শাহজাহান চৌধুরী', en: 'S M H Shahjahan Chowdhury', phone: '01860705112' },
      /* ওয়ার্ড নম্বর যাঁর পাশে নেই, তিনি এখানে */
      others: [ { bn: 'রূপসী রাণী ধর', en: 'Rupasi Rani Dhar', phone: '01814444665' } ],
      wards: [
        { no: 1, members: [ { bn: 'মোহাম্মদ নুরুল আলম', en: 'Mohammad Nurul Alam', phone: '01819795209' }, { bn: 'আমেনা বেগম', en: 'Amena Begum', phone: '01875507486' } ] },
        { no: 2, members: [ { bn: 'দিদারুল আলম', en: 'Didarul Alam', phone: '01819748003' }, { bn: 'বেবী আকতার', en: 'Baby Akter', phone: '01840388582' } ] },
        { no: 3, members: [ { bn: 'মো: লোকমান', en: 'Md. Lokman', phone: '01818688948' }, { bn: 'বেবী আকতার', en: 'Baby Akter', phone: '01840388582' } ] },
        { no: 4, members: [ { bn: 'মোহাম্মদ আরশাদ উদ্দীন', en: 'Mohammad Arshad Uddin', phone: '01810587808' }, { bn: 'বেবী আকতার', en: 'Baby Akter', phone: '01840388582' } ] },
        { no: 5, members: [ { bn: 'মোহাম্মদ লোকমান', en: 'Mohammad Lokman', phone: '01819305650' }, { bn: 'আমেনা বেগম', en: 'Amena Begum', phone: '01875507486' } ] },
        { no: 6, members: [ { bn: 'মো: হেলাল', en: 'Md. Helal', phone: '01830126446' }, { bn: 'আমেনা বেগম', en: 'Amena Begum', phone: '01875507486' } ] },
        { no: 7, members: [ { bn: 'মুহাম্মদ সোহেল', en: 'Muhammad Sohel', phone: '01814944559' } ] },
        { no: 8, members: [ { bn: 'মোহাম্মদ ইব্রাহীম', en: 'Mohammad Ibrahim', phone: '01829381553' } ] },
        { no: 9, members: [ { bn: 'এস এম মুসলিম উদ্দীন সিকদার', en: 'S M Muslim Uddin Sikder', phone: '01812866690' } ] }
      ]
    },
    {
      bn: 'নারায়ণহাট ইউনিয়ন', en: 'Narayanhat Union',
      chairman: '',
      wards: [ { no: 1, members: [''] }, { no: 2, members: [''] }, { no: 3, members: [''] }, { no: 4, members: [''] }, { no: 5, members: [''] }, { no: 6, members: [''] }, { no: 7, members: [''] }, { no: 8, members: [''] }, { no: 9, members: [''] } ]
    },
    {
      bn: 'দাঁতমারা ইউনিয়ন', en: 'Dantmara Union',
      chairman: '',
      wards: [ { no: 1, members: [''] }, { no: 2, members: [''] }, { no: 3, members: [''] }, { no: 4, members: [''] }, { no: 5, members: [''] }, { no: 6, members: [''] }, { no: 7, members: [''] }, { no: 8, members: [''] }, { no: 9, members: [''] } ]
    },
    {
      bn: 'হারুয়ালছড়ি ইউনিয়ন', en: 'Harualchhari Union',
      chairman: '',
      wards: [ { no: 1, members: [''] }, { no: 2, members: [''] }, { no: 3, members: [''] }, { no: 4, members: [''] }, { no: 5, members: [''] }, { no: 6, members: [''] }, { no: 7, members: [''] }, { no: 8, members: [''] }, { no: 9, members: [''] } ]
    },
    {
      bn: 'সুয়াবিল ইউনিয়ন', en: 'Suabil Union',
      chairman: '',
      wards: [ { no: 1, members: [''] }, { no: 2, members: [''] }, { no: 3, members: [''] }, { no: 4, members: [''] }, { no: 5, members: [''] }, { no: 6, members: [''] }, { no: 7, members: [''] }, { no: 8, members: [''] }, { no: 9, members: [''] } ]
    },
    {
      bn: 'বাগানবাজার ইউনিয়ন', en: 'Baganbazar Union',
      chairman: '',
      wards: [ { no: 1, members: [''] }, { no: 2, members: [''] }, { no: 3, members: [''] }, { no: 4, members: [''] }, { no: 5, members: [''] }, { no: 6, members: [''] }, { no: 7, members: [''] }, { no: 8, members: [''] }, { no: 9, members: [''] } ]
    }
  ],

  /* ---------- ৪. স্কুল ও কলেজ ----------
     উদাহরণ (এই ধাঁচে [ ] এর ভেতরে নিজের তথ্য বসাও):
     { bn: 'নমুনা উচ্চ বিদ্যালয়', en: 'Sample High School', type: 'স্কুল', typeEn: 'School',
       union: 'ইউনিয়নের নাম', unionEn: 'Union name', address: 'গ্রামের নাম', addressEn: 'Village', phone: '01XXXXXXXXX' } */

  /* প্রতিটি স্কুল/মাদ্রাসা/হাসপাতাল/ডাক্তারের জন্য ঐচ্ছিক বাড়তি ঘর (ক্লিক করলে বিস্তারিত পাতায় দেখাবে):
       photo: 'images/school1.jpg',  phone: '01XXXXXXXXX',  address: 'ঠিকানা', addressEn: 'Address',
       est: 'প্রতিষ্ঠা সাল', estEn: 'Established',
       historyBn: 'ইতিহাস বাংলায়', historyEn: 'History in English' */
  schools: [
    { bn: 'ভূজপুর ন্যাশনাল স্কুল অ্যান্ড কলেজ', en: 'Bhujpur National School & College', type: 'স্কুল ও কলেজ', typeEn: 'School & College', union: 'ভূজপুর', unionEn: 'Bhujpur',
      address: 'ভূজপুর, ফটিকছড়ি, চট্টগ্রাম', addressEn: 'Bhujpur, Fatikchhari, Chattogram',
      photo: 'images/bhujpur-national-school.jpg',
      phone: '01624612392, 01815171379, 01819632565',
      est: '১৯৬৭ সাল', estEn: '1967',
      eiin: '104310',
      level: 'মাধ্যমিক (স্কুল শাখা) ও উচ্চ মাধ্যমিক (কলেজ শাখা)', levelEn: 'Secondary (school) and Higher secondary (college)',
      streams: 'কলেজ শাখায় মানবিক ও ব্যবসায় শিক্ষা', streamsEn: 'Humanities and Business Studies in the college section',
      board: 'মাধ্যমিক ও উচ্চ মাধ্যমিক শিক্ষা বোর্ড, চট্টগ্রাম', boardEn: 'Board of Intermediate and Secondary Education, Chattogram',
      activities: 'মাদকবিরোধী র‍্যালি, ক্রীড়া প্রতিযোগিতা, সচেতনতামূলক ও সাংস্কৃতিক অনুষ্ঠান', activitiesEn: 'Anti-drug rallies, sports competitions, awareness and cultural programmes',
      historyBn: 'ভূজপুর ন্যাশনাল স্কুল এন্ড কলেজ ফটিকছড়ি উপজেলার ভূজপুর ইউনিয়নে অবস্থিত একটি ঐতিহ্যবাহী ও স্বনামধন্য শিক্ষা প্রতিষ্ঠান। এটি ১৯৬৭ সালে প্রতিষ্ঠিত হয় এবং মাধ্যমিক ও উচ্চ মাধ্যমিক শিক্ষা বোর্ড, চট্টগ্রামের অধীনে পরিচালিত হয়। এখানে মাধ্যমিক (স্কুল শাখা) ও উচ্চ মাধ্যমিক (কলেজ শাখা) উভয় স্তরেই পাঠদান করা হয়। প্রতিষ্ঠানটি নিয়মিত মাদকবিরোধী র‍্যালি, ক্রীড়া প্রতিযোগিতা এবং বিভিন্ন সচেতনতামূলক ও সাংস্কৃতিক অনুষ্ঠান আয়োজন করে থাকে।',
      historyEn: 'Bhujpur National School & College is a well-known, traditional institution in Bhujpur Union, Fatikchhari. Established in 1967, it runs under the Board of Intermediate and Secondary Education, Chattogram, and teaches at both secondary (school) and higher secondary (college) levels. It regularly organises anti-drug rallies, sports competitions and awareness and cultural events.' },
    { bn: 'ভূজপুর মডেল উচ্চ বিদ্যালয়', en: 'Bhujpur Model High School', type: 'উচ্চ বিদ্যালয়', typeEn: 'High School', union: 'ভূজপুর', unionEn: 'Bhujpur' },
    { bn: 'মির্জার হাট উচ্চ বিদ্যালয়', en: 'Mirzar Hat High School', type: 'উচ্চ বিদ্যালয়', typeEn: 'High School', union: 'ভূজপুর', unionEn: 'Bhujpur' },
    { bn: 'পূর্ব ভূজপুর সরকারি প্রাথমিক বিদ্যালয়', en: 'East Bhujpur Government Primary School', type: 'প্রাথমিক বিদ্যালয়', typeEn: 'Primary School', union: 'ভূজপুর', unionEn: 'Bhujpur' },
    { bn: 'পশ্চিম ভূজপুর এ. গণি প্রাথমিক বিদ্যালয়', en: 'West Bhujpur A. Gani Primary School', type: 'প্রাথমিক বিদ্যালয়', typeEn: 'Primary School', union: 'ভূজপুর', unionEn: 'Bhujpur' },
    { bn: 'আমতলী প্রাথমিক বিদ্যালয়', en: 'Amtali Primary School', type: 'প্রাথমিক বিদ্যালয়', typeEn: 'Primary School', union: 'ভূজপুর', unionEn: 'Bhujpur' }
,
    { bn: 'ভূজপুর পাবলিক উচ্চ বিদ্যালয়', en: 'Bhujpur Public High School', type: 'উচ্চ বিদ্যালয়', typeEn: 'High School', union: 'ভূজপুর', unionEn: 'Bhujpur' },
    { bn: 'কাজীর হাট এমদাদুল ইসলাম মাদ্রাসা', en: 'Kazir Hat Emdadul Islam Madrasa', type: 'মাদ্রাসা', typeEn: 'Madrasa', union: 'ভূজপুর', unionEn: 'Bhujpur' },
    { bn: 'শরীয়তুল উলুম মাদ্রাসা', en: 'Shariatul Uloom Madrasa', type: 'মাদ্রাসা', typeEn: 'Madrasa', union: 'ভূজপুর', unionEn: 'Bhujpur' },
    { bn: 'শরীয়তুল উলুম প্রাথমিক বিদ্যালয়', en: 'Shariatul Uloom Primary School', type: 'প্রাথমিক বিদ্যালয়', typeEn: 'Primary School', union: 'ভূজপুর', unionEn: 'Bhujpur' },
    { bn: 'পূর্ব ভূজপুর প্রাথমিক বিদ্যালয়', en: 'East Bhujpur Primary School', type: 'প্রাথমিক বিদ্যালয়', typeEn: 'Primary School', union: 'ভূজপুর', unionEn: 'Bhujpur' },
    { bn: 'গাছবাড়িয়া প্রাথমিক বিদ্যালয়', en: 'Gasbaria Primary School', type: 'প্রাথমিক বিদ্যালয়', typeEn: 'Primary School', union: 'ভূজপুর', unionEn: 'Bhujpur' }
  ],

  /* ---------- ৫. হাসপাতাল ও ক্লিনিক ----------
     { bn: 'নমুনা ক্লিনিক', en: 'Sample Clinic', type: 'ক্লিনিক', typeEn: 'Clinic',
       address: 'ঠিকানা', addressEn: 'Address', phone: '01XXXXXXXXX' } */
  hospitals: [
    { bn: 'ফটিকছড়ি উপজেলা স্বাস্থ্য কমপ্লেক্স', en: 'Fatikchhari Upazila Health Complex', type: 'সরকারি স্বাস্থ্য কমপ্লেক্স', typeEn: 'Government health complex',
      address: 'ফটিকছড়ি', addressEn: 'Fatikchhari', phone: '01730324447',
      historyBn: 'নোট: ২৪ ঘণ্টার হটলাইন হিসেবে এই নম্বরটি পাওয়া গেছে, কিন্তু সরকারি হাসপাতালের ওয়েবসাইটে সরাসরি নিশ্চিত করা যায়নি। জরুরি অবস্থায় প্রথমে ৯৯৯ ডায়াল করুন।',
      historyEn: 'Note: this number was found as a 24-hour hotline but could not be confirmed directly on the official hospital website. In an emergency, dial 999 first.' }
  ],

  /* ---------- ৬. ডাক্তার ----------
     { bn: 'ডা. নমুনা', en: 'Dr. Sample', speciality: 'মেডিসিন', specialityEn: 'Medicine',
       chamber: 'চেম্বারের ঠিকানা', chamberEn: 'Chamber address', time: 'বিকাল ৫টা - রাত ৯টা', timeEn: '5 PM - 9 PM', phone: '01XXXXXXXXX' } */
  doctors: []
};
