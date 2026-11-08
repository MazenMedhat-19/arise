/* ARISE — static data: foods, legends, training templates, ACL rehab protocol */
'use strict';

/* ---------- Foods: values per 100 g. srv = typical serving [label, grams] ---------- */
const FOODS = [
  // Proteins
  { id: 'f_chk', name: 'Chicken breast (grilled)', ar: 'صدور فراخ مشوية', kcal: 165, p: 31, c: 0, f: 3.6, srv: [['Fillet', 150], ['100 g', 100]] },
  { id: 'f_chkth', name: 'Chicken thigh (no skin)', ar: 'أوراك فراخ', kcal: 209, p: 26, c: 0, f: 10.9, srv: [['1 thigh', 110]] },
  { id: 'f_egg', name: 'Egg (whole)', ar: 'بيض', kcal: 143, p: 12.6, c: 0.7, f: 9.5, srv: [['1 egg', 50], ['3 eggs', 150]] },
  { id: 'f_eggw', name: 'Egg whites', ar: 'بياض بيض', kcal: 52, p: 11, c: 0.7, f: 0.2, srv: [['1 white', 33]] },
  { id: 'f_tuna', name: 'Tuna in water (drained)', ar: 'تونة مصفاة', kcal: 116, p: 26, c: 0, f: 1, srv: [['1 can', 120]] },
  { id: 'f_tunao', name: 'Tuna in oil (drained)', ar: 'تونة بالزيت', kcal: 198, p: 29, c: 0, f: 8, srv: [['1 can', 120]] },
  { id: 'f_beef', name: 'Lean beef (cooked)', ar: 'لحمة حمرا', kcal: 250, p: 26, c: 0, f: 15, srv: [['Portion', 150]] },
  { id: 'f_kofta', name: 'Kofta (grilled)', ar: 'كفتة مشوية', kcal: 255, p: 18, c: 4, f: 18, srv: [['1 skewer', 60]] },
  { id: 'f_kebda', name: 'Liver (kebda, cooked)', ar: 'كبدة', kcal: 175, p: 27, c: 5, f: 5, srv: [['Sandwich fill', 100]] },
  { id: 'f_fish', name: 'Grilled tilapia (bolti)', ar: 'سمك بلطي مشوي', kcal: 128, p: 26, c: 0, f: 2.7, srv: [['1 fish', 200]] },
  { id: 'f_shrimp', name: 'Shrimp (cooked)', ar: 'جمبري', kcal: 99, p: 24, c: 0.2, f: 0.3, srv: [['Portion', 150]] },
  { id: 'f_whey', name: 'Whey protein', ar: 'واي بروتين', kcal: 400, p: 80, c: 8, f: 6, srv: [['1 scoop', 30]] },
  { id: 'f_greek', name: 'Greek yogurt 2%', ar: 'زبادي يوناني', kcal: 73, p: 10, c: 3.9, f: 2, srv: [['1 cup', 170]] },
  { id: 'f_areesh', name: 'Cottage cheese (areesh)', ar: 'جبنة قريش', kcal: 90, p: 13, c: 3.5, f: 2.5, srv: [['Portion', 100]] },
  { id: 'f_domiati', name: 'White cheese (domiati)', ar: 'جبنة بيضا', kcal: 250, p: 15, c: 3, f: 20, srv: [['Slice', 30]] },
  { id: 'f_milk', name: 'Milk (full fat)', ar: 'لبن كامل الدسم', kcal: 61, p: 3.2, c: 4.8, f: 3.3, srv: [['1 cup', 250]] },
  { id: 'f_milkl', name: 'Milk (skimmed)', ar: 'لبن خالي الدسم', kcal: 35, p: 3.4, c: 5, f: 0.1, srv: [['1 cup', 250]] },
  // Egyptian classics
  { id: 'f_ful', name: 'Ful medames (plain)', ar: 'فول مدمس', kcal: 110, p: 7.6, c: 19.6, f: 0.4, srv: [['1 plate', 200], ['Sandwich fill', 100]] },
  { id: 'f_fulo', name: 'Ful with oil', ar: 'فول بالزيت', kcal: 160, p: 7.4, c: 19, f: 6, srv: [['1 plate', 200]] },
  { id: 'f_taameya', name: "Ta'ameya (falafel)", ar: 'طعمية', kcal: 333, p: 13.3, c: 31.8, f: 17.8, srv: [['1 piece', 17], ['5 pieces', 85]] },
  { id: 'f_koshari', name: 'Koshari', ar: 'كشري', kcal: 150, p: 5, c: 28, f: 2.5, srv: [['Small box', 350], ['Large box', 550]] },
  { id: 'f_tortbran', name: 'Bran tortilla · Broadway', ar: 'تورتيلا ردة برودواي', kcal: 278, p: 7.8, c: 52.2, f: 5, code: '6223007290913', srv: [['1 tortilla', 45], ['2 tortillas', 90]] },
  { id: 'f_tortw', name: 'Tortilla wrap (white flour)', ar: 'تورتيلا بيضا', kcal: 310, p: 8.2, c: 51, f: 7.8, srv: [['1 wrap (small)', 40], ['1 wrap (large)', 65]] },
  { id: 'f_toast', name: 'Toast bread (white)', ar: 'عيش توست أبيض', kcal: 265, p: 8.5, c: 49, f: 3.5, srv: [['1 slice', 28], ['2 slices', 56]] },
  { id: 'f_toastb', name: 'Toast bread (brown / bran)', ar: 'عيش توست بني', kcal: 245, p: 10, c: 42, f: 3.5, srv: [['1 slice', 28], ['2 slices', 56]] },
  { id: 'f_shami', name: 'Shami bread', ar: 'عيش شامي', kcal: 275, p: 9, c: 56, f: 1.2, srv: [['1 loaf', 70]] },
  { id: 'f_shawchk', name: 'Chicken shawarma sandwich', ar: 'ساندوتش شاورما فراخ', kcal: 230, p: 13, c: 22, f: 10, srv: [['1 sandwich', 200]] },
  { id: 'f_tawook', name: 'Sheesh tawook (grilled)', ar: 'شيش طاووق', kcal: 170, p: 28, c: 2, f: 5.5, srv: [['Plate portion', 200], ['Sandwich filling', 120]] },
  { id: 'f_baladi', name: 'Baladi bread', ar: 'عيش بلدي', kcal: 275, p: 9, c: 55, f: 1.5, srv: [['1 loaf', 90], ['½ loaf', 45]] },
  { id: 'f_fino', name: 'Fino bread', ar: 'عيش فينو', kcal: 290, p: 9, c: 55, f: 3.5, srv: [['1 roll', 60]] },
  { id: 'f_mahshi', name: 'Mahshi', ar: 'محشي', kcal: 150, p: 3, c: 25, f: 4, srv: [['Plate', 250]] },
  { id: 'f_molokhia', name: 'Molokhia', ar: 'ملوخية', kcal: 50, p: 3, c: 5, f: 2, srv: [['Bowl', 250]] },
  { id: 'f_lentil', name: 'Lentil soup', ar: 'شوربة عدس', kcal: 70, p: 4.5, c: 11, f: 1.2, srv: [['Bowl', 300]] },
  { id: 'f_shawerma', name: 'Chicken shawerma sandwich', ar: 'شاورما فراخ', kcal: 220, p: 13, c: 20, f: 10, srv: [['1 sandwich', 250]] },
  { id: 'f_hawawshi', name: 'Hawawshi', ar: 'حواوشي', kcal: 290, p: 13, c: 24, f: 16, srv: [['1 loaf', 250]] },
  { id: 'f_feteer', name: 'Feteer meshaltet', ar: 'فطير مشلتت', kcal: 420, p: 7, c: 45, f: 24, srv: [['Slice', 100]] },
  { id: 'f_basbousa', name: 'Basbousa', ar: 'بسبوسة', kcal: 380, p: 4, c: 55, f: 16, srv: [['1 piece', 70]] },
  { id: 'f_konafa', name: 'Konafa', ar: 'كنافة', kcal: 400, p: 6, c: 50, f: 20, srv: [['1 piece', 100]] },
  // Carbs
  { id: 'f_rice', name: 'White rice (cooked)', ar: 'رز أبيض', kcal: 130, p: 2.7, c: 28, f: 0.3, srv: [['1 cup', 160], ['Plate', 250]] },
  { id: 'f_pasta', name: 'Pasta (cooked)', ar: 'مكرونة', kcal: 158, p: 5.8, c: 31, f: 0.9, srv: [['Plate', 250]] },
  { id: 'f_oats', name: 'Oats (dry)', ar: 'شوفان', kcal: 389, p: 16.9, c: 66, f: 6.9, srv: [['½ cup', 40], ['1 cup', 80]] },
  { id: 'f_potato', name: 'Potato (boiled)', ar: 'بطاطس مسلوقة', kcal: 87, p: 1.9, c: 20, f: 0.1, srv: [['1 medium', 170]] },
  { id: 'f_sweetp', name: 'Sweet potato (baked)', ar: 'بطاطا', kcal: 90, p: 2, c: 21, f: 0.2, srv: [['1 medium', 150]] },
  { id: 'f_fries', name: 'French fries', ar: 'بطاطس محمرة', kcal: 312, p: 3.4, c: 41, f: 15, srv: [['Portion', 120]] },
  // Fruit & veg
  { id: 'f_banana', name: 'Banana', ar: 'موز', kcal: 89, p: 1.1, c: 23, f: 0.3, srv: [['1 medium', 118]] },
  { id: 'f_apple', name: 'Apple', ar: 'تفاح', kcal: 52, p: 0.3, c: 14, f: 0.2, srv: [['1 medium', 180]] },
  { id: 'f_orange', name: 'Orange', ar: 'برتقال', kcal: 47, p: 0.9, c: 12, f: 0.1, srv: [['1 medium', 150]] },
  { id: 'f_dates', name: 'Dates', ar: 'بلح / تمر', kcal: 282, p: 2.5, c: 75, f: 0.4, srv: [['1 date', 8], ['5 dates', 40]] },
  { id: 'f_guava', name: 'Guava', ar: 'جوافة', kcal: 68, p: 2.6, c: 14, f: 1, srv: [['1 fruit', 100]] },
  { id: 'f_mango', name: 'Mango', ar: 'مانجا', kcal: 60, p: 0.8, c: 15, f: 0.4, srv: [['1 cup', 165]] },
  { id: 'f_salad', name: 'Green salad (no dressing)', ar: 'سلطة خضرا', kcal: 20, p: 1, c: 4, f: 0.2, srv: [['Bowl', 200]] },
  // Fats & extras
  { id: 'f_pb', name: 'Peanut butter', ar: 'زبدة فول سوداني', kcal: 588, p: 25, c: 20, f: 50, srv: [['1 tbsp', 16]] },
  { id: 'f_oil', name: 'Olive oil', ar: 'زيت زيتون', kcal: 884, p: 0, c: 0, f: 100, srv: [['1 tbsp', 13.5], ['1 tsp', 4.5]] },
  { id: 'f_tahini', name: 'Tahini', ar: 'طحينة', kcal: 595, p: 17, c: 21, f: 54, srv: [['1 tbsp', 15]] },
  { id: 'f_hummus', name: 'Hummus', ar: 'حمص بالطحينة', kcal: 166, p: 7.9, c: 14, f: 9.6, srv: [['2 tbsp', 30]] },
  { id: 'f_almond', name: 'Almonds', ar: 'لوز', kcal: 579, p: 21, c: 22, f: 50, srv: [['Handful', 28]] },
  { id: 'f_honey', name: 'Honey', ar: 'عسل', kcal: 304, p: 0.3, c: 82, f: 0, srv: [['1 tbsp', 21]] },
  { id: 'f_sugar', name: 'Sugar', ar: 'سكر', kcal: 387, p: 0, c: 100, f: 0, srv: [['1 tsp', 4]] },
  { id: 'f_tea', name: 'Tea with sugar (2 tsp)', ar: 'شاي بسكر', kcal: 13, p: 0, c: 3.2, f: 0, srv: [['1 cup', 250]] },
];

/* ---------- Hall of Legends ---------- */
const LEGENDS = [
  // Anime
  { by: 'Thors', from: 'Vinland Saga', cat: 'anime', q: 'You have no enemies. Nobody in this world has any enemies.', ar: 'انت ملكش أعداء. محدش في الدنيا دي عنده أعداء.' },
  { by: 'Thors', from: 'Vinland Saga', cat: 'anime', q: 'A true warrior needs no sword.', ar: 'المحارب الحقيقي مش محتاج سيف.' },
  { by: 'Thorfinn', from: 'Vinland Saga', cat: 'anime', q: 'I have no enemies.', ar: 'أنا معنديش أعداء.' },
  { by: 'Sung Jinwoo', from: 'Solo Leveling', cat: 'anime', q: 'Arise.', ar: 'انهض.' },
  { by: 'The System', from: 'Solo Leveling', cat: 'anime', q: 'I alone level up.', ar: 'أنا لوحدي اللي بعلّي مستوايا.' },
  { by: 'Rock Lee', from: 'Naruto', cat: 'anime', q: 'A dropout will beat a genius through hard work.', ar: 'الفاشل هيغلب العبقري بالشغل والتعب.' },
  { by: 'Naruto Uzumaki', from: 'Naruto', cat: 'anime', q: "I never go back on my word. That's my ninja way!", ar: 'عمري ما برجع في كلمتي. ده طريق النينجا بتاعي!' },
  { by: 'Naruto Uzumaki', from: 'Naruto', cat: 'anime', q: "Hard work is worthless for those who don't believe in themselves.", ar: 'التعب ملوش قيمة لو انت مش مصدق في نفسك.' },
  { by: 'Isagi Yoichi', from: 'Blue Lock', cat: 'anime', q: 'I will devour everything and become the best.', ar: 'هاكل كل حاجة قدامي وأبقى الأحسن.' },
  { by: 'Ego Jinpachi', from: 'Blue Lock', cat: 'anime', q: 'Be an egoist.', ar: 'كن أناني في الملعب.' },
  // Football
  { by: 'Cristiano Ronaldo', from: 'Football', cat: 'football', q: 'Talent without working hard is nothing.', ar: 'الموهبة من غير شغل ولا حاجة.' },
  { by: 'Cristiano Ronaldo', from: 'Football', cat: 'football', q: 'Your love makes me strong. Your hate makes me unstoppable.', ar: 'حبكم بيقويني، وكرهكم بيخليني مستحيل أتوقف.' },
  { by: 'Lionel Messi', from: 'Football', cat: 'football', q: 'You have to fight to reach your dream. You have to sacrifice and work hard for it.', ar: 'لازم تحارب عشان توصل لحلمك. لازم تضحي وتتعب.' },
  { by: 'Lionel Messi', from: 'Football', cat: 'football', q: 'It took me 17 years and 114 days to become an overnight success.', ar: 'خدت ١٧ سنة و١١٤ يوم عشان أنجح "فجأة".' },
  { by: 'Mohamed Salah', from: 'Football', cat: 'football', q: 'Never stop dreaming, never stop believing.', ar: 'متبطلش تحلم، ومتبطلش تصدّق.' },
  { by: 'Zlatan Ibrahimović', from: 'Football · after his ACL tear', cat: 'football', q: "Lions don't recover like humans.", ar: 'الأسود مش بتتعافى زي البشر.' },
  // Basketball
  { by: 'Michael Jordan', from: 'Basketball', cat: 'basketball', q: "I've failed over and over and over again in my life. And that is why I succeed.", ar: 'فشلت مرة ورا مرة ورا مرة… وعشان كده نجحت.' },
  { by: 'Michael Jordan', from: 'Basketball', cat: 'basketball', q: 'Some people want it to happen, some wish it would happen, others make it happen.', ar: 'ناس عايزاها تحصل، وناس بتتمنى، وناس بتخليها تحصل.' },
  { by: 'Kobe Bryant', from: 'Basketball', cat: 'basketball', q: 'Everything negative — pressure, challenges — is all an opportunity for me to rise.', ar: 'كل حاجة سلبية — ضغط، تحديات — فرصة إني أعلى.' },
  { by: 'Kobe Bryant', from: 'Basketball', cat: 'basketball', q: 'The moment you give up is the moment you let someone else win.', ar: 'اللحظة اللي تستسلم فيها هي اللحظة اللي بتسيب فيها حد تاني يكسب.' },
  { by: 'LeBron James', from: 'Basketball', cat: 'basketball', q: 'I like criticism. It makes you strong.', ar: 'بحب النقد. بيقويك.' },
  // F1
  { by: 'Ayrton Senna', from: 'Formula 1', cat: 'f1', q: 'If you no longer go for a gap that exists, you are no longer a racing driver.', ar: 'لو بطلت تدخل في فتحة موجودة، يبقى انت مبقتش سوّاق سباق.' },
  { by: 'Ayrton Senna', from: 'Formula 1', cat: 'f1', q: 'I have no idols. I admire work, dedication and competence.', ar: 'معنديش قدوة. أنا بحترم الشغل والالتزام والكفاءة.' },
  { by: 'Michael Schumacher', from: 'Formula 1', cat: 'f1', q: 'Once something is a passion, the motivation is there.', ar: 'لما الحاجة تبقى شغف، الحافز بيبقى موجود لوحده.' },
  { by: 'Lewis Hamilton', from: 'Formula 1', cat: 'f1', q: 'Still I rise.', ar: 'ولسه بقوم تاني.' },
  // Combat
  { by: 'Muhammad Ali', from: 'Boxing', cat: 'combat', q: "I hated every minute of training, but I said: don't quit. Suffer now and live the rest of your life as a champion.", ar: 'كرهت كل دقيقة تمرين، بس قلت: متستسلمش. اتعب دلوقتي وعيش باقي عمرك بطل.' },
];

/* Real comebacks — shown in the Rehab tab */
const COMEBACKS = [
  { who: 'Zlatan Ibrahimović', what: 'Tore his ACL in April 2017 at 35. Back on the pitch for Manchester United about 7 months later.' },
  { who: 'Virgil van Dijk', what: 'ACL injury in October 2020. Came back the next season and was named in the PFA Team of the Year.' },
  { who: 'Adrian Peterson', what: 'Tore his ACL in December 2011. The next season he ran 2,097 yards and won NFL MVP.' },
  { who: 'Tom Brady', what: 'Tore his ACL in week 1 of 2008. Won Comeback Player of the Year in 2009 and four more Super Bowls after.' },
  { who: 'Niki Lauda', what: 'Badly burned in a 1976 crash. Raced again about six weeks later, then won two more world titles.' },
];

/* ---------- Training ---------- */
// Each exercise: [name, sets, reps, restSec, cue]
const TEMPLATES = {
  push: {
    name: 'PUSH', sub: 'Chest · Shoulders · Triceps', icon: '⚔️', type: 'gym',
    ex: [
      ['Barbell bench press', 4, '6-8', 150, 'Shoulder blades pinched, feet planted, bar to lower chest.'],
      ['Incline dumbbell press', 3, '8-10', 120, '30° bench. Control 2 seconds down.'],
      ['Seated dumbbell shoulder press', 3, '8-10', 120, 'Back supported. No knee load.'],
      ['Cable lateral raise', 4, '12-15', 60, 'Lead with the elbow, slight lean away.'],
      ['Cable fly (high to low)', 3, '12-15', 60, 'Stretch at the back, squeeze at the front.'],
      ['Rope triceps pushdown', 3, '10-12', 60, 'Elbows pinned, split the rope at the bottom.'],
      ['Overhead cable triceps extension', 3, '10-12', 60, 'Full stretch overhead.'],
    ],
  },
  pull: {
    name: 'PULL', sub: 'Back · Rear delts · Biceps', icon: '🐉', type: 'gym',
    ex: [
      ['Lat pulldown', 4, '8-10', 120, 'Chest up, pull elbows to your ribs. Thigh pad keeps knees safe.'],
      ['Chest-supported row', 4, '8-10', 120, 'Chest on the pad, no lower-back or knee strain.'],
      ['Seated cable row', 3, '10-12', 90, 'Squeeze shoulder blades, pause 1 second.'],
      ['Face pull', 3, '15', 60, 'Pull to forehead, thumbs back.'],
      ['Dumbbell rear delt fly (incline bench)', 3, '12-15', 60, 'Light weight, pinkies up.'],
      ['EZ-bar curl', 3, '8-10', 75, 'No swinging. Elbows still.'],
      ['Incline dumbbell curl', 3, '10-12', 60, 'Full stretch at the bottom.'],
    ],
  },
  upper: {
    name: 'UPPER', sub: 'Strength + size', icon: '🔱', type: 'gym',
    ex: [
      ['Weighted pull-up / assisted pull-up', 4, '6-8', 150, 'Cross ankles, no kipping. Step down — never jump down.'],
      ['Machine chest press', 3, '8-10', 120, 'Seated = zero knee stress.'],
      ['One-arm dumbbell row (bench supported)', 3, '10', 90, 'Knee of the good leg on the bench.'],
      ['Arnold press (seated)', 3, '10', 90, 'Rotate through the full range.'],
      ['Dips (assisted if needed)', 3, '8-12', 90, 'Slight forward lean for chest.'],
      ['Hammer curl + skull crusher superset', 3, '10 + 10', 75, 'Superset: no rest between the two.'],
    ],
  },
  lower: {
    name: 'LOWER', sub: 'Knee-safe — set by your rehab phase', icon: '🦵', type: 'lower',
    ex: [], // filled from the current ACL phase
  },
  core: {
    name: 'CORE + CARDIO', sub: 'Bike · Core · Mobility', icon: '🌀', type: 'gym',
    ex: [
      ['Stationary bike (easy-moderate)', 1, '20-30 min', 0, 'Seat high enough that the knee never bends past what is comfortable.'],
      ['Dead bug', 3, '10 / side', 45, 'Lower back glued to the floor.'],
      ['Side plank', 3, '30-45 s / side', 45, 'Hips high. Can be done on the knees early in rehab.'],
      ['Pallof press', 3, '12 / side', 45, 'Resist the rotation.'],
      ['Cable crunch', 3, '12-15', 60, 'Round the spine, hips still.'],
      ['Hip flexor + thoracic mobility', 1, '5 min', 0, 'Slow and controlled.'],
    ],
  },
  rest: {
    name: 'REST', sub: 'Recovery is part of the program', icon: '🌙', type: 'rest',
    ex: [
      ['Walk (flat ground)', 1, '20-30 min', 0, 'Only if your phase allows it.'],
      ['Rehab session', 1, 'see Rehab tab', 0, 'Rehab does not take days off.'],
      ['Sleep 8 hours', 1, '—', 0, 'This is where you level up.'],
    ],
  },
};

// Default week, Saturday-first (Egyptian week). JS getDay(): 0=Sun..6=Sat
const DEFAULT_SPLIT = { 6: 'push', 0: 'pull', 1: 'lower', 2: 'core', 3: 'upper', 4: 'lower', 5: 'rest' };

/* ---------- ACL rehab protocol (generic, criteria-based) ---------- */
// Each exercise: { id, n: name, d: dose, cue }
const ACL_PHASES = [
  {
    key: 'p1', arc: 'ARC I', title: 'Protect & Wake Up', weeks: [0, 2],
    goals: ['Full extension (0°) — straight knee', 'Flexion to about 90°', 'Control swelling', 'Turn the quad back on'],
    exit: ['Knee fully straight', 'Straight-leg raise with no lag', 'Swelling going down', 'Walking with minimal limp (crutches as advised)'],
    ex: [
      { id: 'a1', n: 'Quad sets', d: '3 × 15 · 5 s hold', cue: 'Push the back of the knee into the bed, tighten the thigh.' },
      { id: 'a2', n: 'Straight-leg raise', d: '3 × 10', cue: 'Lock the quad first, then lift to the height of the other knee.' },
      { id: 'a3', n: 'Heel slides', d: '3 × 15', cue: 'Slide heel toward you, slow, to a comfortable stretch.' },
      { id: 'a4', n: 'Ankle pumps', d: '3 × 30', cue: 'Every hour you are awake — keeps blood moving.' },
      { id: 'a5', n: 'Prone hang / heel prop', d: '3 × 5 min', cue: 'Heel on a towel, let gravity straighten the knee.' },
      { id: 'a6', n: 'Patellar mobilisation', d: '2 min', cue: 'Gently move the kneecap up/down/side to side (if approved).' },
      { id: 'a7', n: 'Ice + elevation', d: '15-20 min × 3', cue: 'Knee above the heart.' },
    ],
  },
  {
    key: 'p2', arc: 'ARC II', title: 'Restore Motion', weeks: [2, 6],
    goals: ['Flexion 120°+', 'Normal walking without crutches', 'Closed-chain strength begins'],
    exit: ['Normal gait, no limp', 'Flexion ≥ 120°', 'Mini squat with good control', 'Minimal swelling after sessions'],
    ex: [
      { id: 'b1', n: 'Stationary bike', d: '10-20 min', cue: 'Start with rocking back and forth until a full turn is comfortable.' },
      { id: 'b2', n: 'Mini squats (0-45°)', d: '3 × 15', cue: 'Weight even on both legs, knees over toes.' },
      { id: 'b3', n: 'Wall sit (shallow)', d: '3 × 30 s', cue: 'Only as deep as is pain-free.' },
      { id: 'b4', n: 'Glute bridge', d: '3 × 15', cue: 'Squeeze glutes at the top, 2 s hold.' },
      { id: 'b5', n: 'Standing calf raises', d: '3 × 15', cue: 'Both legs, slow.' },
      { id: 'b6', n: 'Single-leg balance', d: '3 × 30 s', cue: 'Hold something nearby at first.' },
      { id: 'b7', n: 'Side-lying hip abduction', d: '3 × 15', cue: 'Toe slightly down, heel leads.' },
      { id: 'b8', n: 'Quad sets + SLR (keep going)', d: '2 × 15', cue: 'Keep the quad switched on.' },
    ],
  },
  {
    key: 'p3', arc: 'ARC III', title: 'Build the Foundation', weeks: [6, 12],
    goals: ['Full range of motion', 'Single-leg control', 'Real strength work'],
    exit: ['Full ROM', 'Single-leg squat to 60° with good alignment', 'No swelling after training', 'Quad strength ≥ 70% of the other leg'],
    ex: [
      { id: 'c1', n: 'Leg press (0-60°)', d: '3 × 12', cue: 'Both legs → progress to single leg.' },
      { id: 'c2', n: 'Goblet squat to box', d: '3 × 10', cue: 'Sit back to a box, stand tall.' },
      { id: 'c3', n: 'Romanian deadlift', d: '3 × 10', cue: 'Hinge at the hips, soft knees.' },
      { id: 'c4', n: 'Forward step-downs', d: '3 × 10', cue: 'Slow, knee tracks over the 2nd toe.' },
      { id: 'c5', n: 'Lateral band walks', d: '3 × 12 / side', cue: 'Stay low, toes forward.' },
      { id: 'c6', n: 'Split squat (supported)', d: '3 × 8 / side', cue: 'Short range first, add depth weekly.' },
      { id: 'c7', n: 'Single-leg balance (unstable surface)', d: '3 × 30 s', cue: 'Pillow or balance pad, add eyes closed later.' },
      { id: 'c8', n: 'Bike intervals', d: '15-20 min', cue: '30 s harder / 60 s easy.' },
    ],
  },
  {
    key: 'p4', arc: 'ARC IV', title: 'Strength & Running', weeks: [12, 24],
    goals: ['Heavy, controlled strength', 'Return-to-running program (with clearance)', 'Intro to jumping'],
    exit: ['Quad & hamstring strength ≥ 80-90% of the other leg', 'Pain-free running 20 min', 'Good landing mechanics on bilateral jumps'],
    ex: [
      { id: 'd1', n: 'Back squat / safety bar squat', d: '4 × 6-8', cue: 'Full depth you control. Add weight slowly.' },
      { id: 'd2', n: 'Bulgarian split squat', d: '3 × 8 / side', cue: 'The king of single-leg strength.' },
      { id: 'd3', n: 'Leg extension (90-45°)', d: '3 × 12', cue: 'Only the range your physio approves.' },
      { id: 'd4', n: 'Nordic hamstring (assisted)', d: '3 × 5', cue: 'Slow lowering, catch with hands.' },
      { id: 'd5', n: 'Single-leg RDL', d: '3 × 10 / side', cue: 'Hips square to the floor.' },
      { id: 'd6', n: 'Box jumps → stick the landing', d: '3 × 5', cue: 'Land soft, knees out. Step down.' },
      { id: 'd7', n: 'Jog / walk intervals', d: '10-20 min', cue: 'Only after your physio clears you to run.' },
    ],
  },
  {
    key: 'p5', arc: 'ARC V', title: 'Return to the Pitch', weeks: [24, 52],
    goals: ['Cutting, sprinting, agility', 'Sport-specific drills', 'Pass return-to-sport tests'],
    exit: ['Hop tests ≥ 90% of the other leg', 'Strength ≥ 90%', 'Full training without symptoms', 'Psychological readiness + physio/surgeon clearance'],
    ex: [
      { id: 'e1', n: 'Single-leg hop for distance', d: '3 × 5 / side', cue: 'Stick every landing for 2 s.' },
      { id: 'e2', n: 'Lateral bounds', d: '3 × 8', cue: 'Explode out, land quiet.' },
      { id: 'e3', n: 'Cone agility (T-drill / 5-10-5)', d: '6 reps', cue: 'Start at 70% speed, build up.' },
      { id: 'e4', n: 'Deceleration drills', d: '3 × 6', cue: 'Sprint 10 m, stop in 3 steps.' },
      { id: 'e5', n: 'Ball work: dribbling + passing', d: '15 min', cue: 'Controlled first, then add pressure.' },
      { id: 'e6', n: 'Heavy strength (keep going)', d: '2× / week', cue: 'Never stop strength work — it prevents re-injury.' },
      { id: 'e7', n: 'Injury-prevention warm-up (FIFA 11+)', d: 'Before every session', cue: 'Proven to reduce ACL injuries.' },
    ],
  },
];

// Pre-op / non-operative ("prehab") track
const ACL_PREHAB = {
  key: 'pre', arc: 'PREHAB', title: 'Pre-Op Preparation', weeks: [0, 0],
  goals: ['Reduce swelling', 'Full extension before surgery', 'Strong quad going in = faster recovery'],
  exit: ['Full extension', 'Minimal swelling', 'Normal walking', 'Straight-leg raise with no lag'],
  ex: [
    { id: 'z1', n: 'Quad sets', d: '3 × 15 · 5 s hold', cue: 'Most important exercise before surgery.' },
    { id: 'z2', n: 'Straight-leg raise', d: '3 × 12', cue: 'No lag at the knee.' },
    { id: 'z3', n: 'Heel prop for extension', d: '3 × 5 min', cue: 'Get the knee fully straight.' },
    { id: 'z4', n: 'Stationary bike', d: '15-20 min', cue: 'Easy resistance.' },
    { id: 'z5', n: 'Glute bridge', d: '3 × 15', cue: '' },
    { id: 'z6', n: 'Mini squats (pain-free)', d: '3 × 12', cue: 'Stay in a pain-free range.' },
    { id: 'z7', n: 'Single-leg balance', d: '3 × 30 s', cue: '' },
  ],
};

const RED_FLAGS = [
  'Sudden big swelling, or the knee gets hot and red',
  'Fever, or wound drainage after surgery',
  'Calf pain, swelling or tightness (possible blood clot — go to a doctor the same day)',
  'Knee gives way / buckles, or you feel a new pop',
  'Pain that keeps getting worse over 48 hours',
];

const DAY_NAMES = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const DAY_AR = ['الحد', 'الاتنين', 'التلات', 'الأربع', 'الخميس', 'الجمعة', 'السبت'];
const WEEK_ORDER = [6, 0, 1, 2, 3, 4, 5]; // Saturday first

const EVENT_TYPES = {
  uni: { label: 'University', color: '#7c5cff' },
  gym: { label: 'Gym', color: '#3df5a7' },
  rehab: { label: 'Rehab', color: '#5ac8fa' },
  study: { label: 'Study', color: '#ffd60a' },
  other: { label: 'Other', color: '#ff5c8a' },
};
