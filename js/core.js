'use strict';
// Helpers, game data tables (towns, cultures, jobs, names...) and real-world history events.
/* ================= helpers ================= */
const $=s=>document.querySelector(s);
const R=(a,b)=>a+Math.random()*(b-a);
const RI=(a,b)=>Math.floor(R(a,b+1));
const pick=a=>a[Math.floor(Math.random()*a.length)];
const clamp=(v,a=0,b=100)=>Math.max(a,Math.min(b,v));
const chance=p=>Math.random()<p;
const esc=s=>String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
function fmt(n){const neg=n<0;n=Math.abs(Math.round(n));let s;if(n>=1e6)s='RM '+(n/1e6).toFixed(n>=1e7?1:2)+'M';else s='RM '+n.toLocaleString('en-MY');return (neg?'−':'')+s;}
const SAVE_KEY='my-lifesim-v1';

/* ================= data ================= */
const STAT_NAMES={int:'Smarts',hlt:'Health',cha:'Charisma',look:'Looks',cre:'Creativity',ath:'Fitness',dis:'Discipline',hap:'Happiness',luck:'Luck'};
const LANG={ms:'Malay',en:'English',zh:'Mandarin',ta:'Tamil',ja:'Japanese',ko:'Korean',de:'German',ar:'Arabic'};
// Only these family cultures can be played for now (they have portrait art). Others stay in the code for later.
const PLAYABLE=['malay','chinese','indian'];
// Bumiputera families get the real-life priorities: Matrikulasi and MRSM quotas, MARA scholarships and a 7% discount on new homes.
const BUMI=['malay','iban','kadazan'];
const CULTURES={
  malay:{fest:'Hari Raya Aidilfitri',gift:'duit raya',langs:{ms:70,en:30},m:['Aiman','Hafiz','Irfan','Danial','Haziq','Amirul','Faris','Adam','Muhammad Afiq','Ahmad Zaki','Syafiq','Harith','Luqman','Iskandar','Zulkifli','Hakim','Ariff','Firdaus','Rizal','Azman','Khairul','Shahrul','Nazrin','Taufiq','Ikmal','Fakhrul','Hazwan','Izzat','Aqil','Rayyan','Umar','Hadif','Ammar','Danish','Syahmi','Badrul','Kamal','Rashid','Azlan','Hisham','Najib','Zainal','Fadzil','Imran','Aidil','Qayyum'],f:['Aisyah','Nurul Huda','Siti Sarah','Aina','Farah','Alya','Hana','Damia','Nur Aina','Nurul Izzah','Siti Aishah','Sofea','Balqis','Qistina','Hannah','Insyirah','Maisarah','Syafiqah','Nadia','Farhana','Izzati','Atiqah','Amira','Liyana','Syazwani','Fatin','Hidayah','Zulaikha','Khadijah','Rosnah','Zarina','Noraini','Haslinda','Rohani','Salmah','Wardah','Adriana','Humaira','Dayang','Mardhiah','Aleesya','Iman','Raihana','Suraya'],fam:['Ahmad','Ismail','Rahman','Hassan','Yusof','Othman','Abdullah','Ibrahim','Ali','Hamid','Mohamad','Aziz','Salleh','Zakaria','Mahmud','Hussein','Kassim','Latif','Bakar','Jaafar','Musa','Ramli','Sulaiman','Hashim'],famLabel:n=>'The '+n+' family'},
  chinese:{fest:'Chinese New Year',gift:'ang pow',langs:{zh:75,en:40,ms:40},m:['Wei Jie','Jun Hao','Kai Xuan','Zi Hao','Jia Le','Yi Xiang','Jun Wei','Zhi Hao','Wei Ming','Kah Wai','Chee Keong','Boon Hock','Yong Sheng','Jia Hao','Zhen Yu','Hao Ran','Kok Leong','Wai Kit','Ming Hui','Yi Fan','Jian Wen','Zi Xuan','Shao Wei','Chun Kit','Hong Wei','Ka Hou','Darren','Marcus','Jason','Ryan','Kelvin','Jonathan','Ethan','Bryan','Vincent','Alvin','Ivan','Nicholas'],f:['Mei Ling','Xin Yi','Hui Min','Jia Yi','Pei Shan','Wen Qi','Xin Hui','Li Ting','Jia Xin','Yu Xuan','Wei Ling','Siew Mei','Pei Ling','Hui Wen','Zi Ying','Shu Ting','Kai Xin','Yee Ling','Mun Yee','Ai Lin','Li Ying','Qian Yi','Yan Ni','Sze Ying','Michelle','Jasmine','Joanne','Rachel','Vivian','Cheryl','Amanda','Crystal','Natalie','Elaine','Sharon','Chloe','Evelyn','Fiona'],fam:['Tan','Lim','Lee','Wong','Ng','Chong','Ong','Tay','Teo','Goh','Yap','Chan','Leong','Lau','Cheah','Khoo','Low','Foo','Ho','Chua','Yeoh','Liew','Loh','Kok','Choo','Gan','Soh'],famLabel:n=>'The '+n+' family'},
  indian:{towns:['kl','pj','shahalam','kl','pj','ipoh','ipoh','penang','jb'],fest:'Deepavali',gift:'Deepavali ang pow',langs:{ta:70,en:55,ms:40},m:['Arjun','Vikram','Darshan','Kavin','Suresh','Pravin','Ganesh','Ravi','Kumar','Rajesh','Prakash','Hari','Naveen','Thinesh','Sanjay','Kishore','Mugilan','Sharvin','Tharun','Yuvan','Kavinesh','Logesh','Saravanan','Vinod','Ashwin','Dinesh','Rohan','Gopal','Bala','Karthik','Selvam','Arun'],f:['Priya','Kavitha','Divya','Shalini','Anusha','Thivya','Lakshmi','Meena','Revathi','Deepa','Nisha','Sangeetha','Yamini','Kirthana','Pooja','Harini','Sharmila','Malini','Vasanthi','Jeevitha','Tharshini','Nithya','Keerthana','Shanthi','Sarojini','Anitha','Durga','Pavithra','Logeswari','Vanitha'],fam:['Subramaniam','Krishnan','Muthu','Rajan','Pillai','Ramasamy','Govindasamy','Nair','Menon','Arumugam','Raju','Maniam','Pillay','Sivalingam','Chandran','Ponnusamy','Veerappan','Kannan','Selvaraj'],famLabel:n=>'The '+n+' family'},
  iban:{fest:'Gawai Dayak',gift:'Gawai gifts',langs:{ms:60,en:40},m:['Jerry','Melvin','Ryan','Nicholas','Alvin','Jugah','Linggi','Nyalau','Kenny','Dominic','Jimbun','Andrew','Gerald','Masing','Unggat','Sebastian','Edmund','Bujang','Enchana','Rentap','Peter','Joshua','Daniel','Kelly','Banyang','Lawrence','Rayner','Jackson'],f:['Jessica','Monica','Grace','Sharon','Valerie','Sandra','Ulai','Inja','Mazlin','Christina','Sendi','Nancy','Emily','Dayang','Rosalind','Bibiana','Patricia','Lucy','Jenny','Rachel','Suri','Endu','Clara','Stephanie','Angela','Melissa','Doris','Agatha'],fam:['Jugah','Ngelai','Anyi','Empawi','Sandai','Nanta','Masing','Dundang','Langgu','Unggang','Sengalang','Bangga'],famLabel:n=>'The '+n+' family',towns:['kuching','sarawak']},
  kadazan:{fest:'Kaamatan',gift:'Kaamatan gifts',langs:{ms:60,en:45},m:['Joseph','Aldrin','Calvin','Edwin','Jude','Julius','Ewon','Gilbert','Mojuntin','Clarence','Benedict','Raymond','Fredoline','Wilfred','Justin','Jeffrey','Bernard','Herman','Anthony','Ewald','Francis','Gregory','Matthew','Patrick','Rudy','Vincent','Darell','Nelson'],f:['Cynthia','Evelyn','Joanna','Rosalind','Bernadette','Juanita','Rosnah','Elvina','Melinda','Agnes','Felicia','Jacqueline','Regina','Philomena','Eunice','Josephine','Margaret','Veronica','Jennifer','Linda','Natasha','Rosemary','Gloria','Irene','Cecilia','Marlyn','Jovita','Lorna'],fam:['Gimbang','Majimbun','Sondoh','Lojinin','Kitingan','Sipaun','Gunsalam','Moguring','Pairin','Tangau','Ongkili','Dusing'],famLabel:n=>'The '+n+' family',towns:['kk','sabah']},
};
const TOWNS={
  kl:{name:'Kuala Lumpur',st:'14',col:1.3,flood:.3},pj:{name:'Petaling Jaya',st:'10',col:1.2,flood:.3},shahalam:{name:'Shah Alam',st:'10',col:1.1,flood:.45},
  penang:{name:'George Town, Penang',st:'07',col:1.15,flood:.1},jb:{name:'Johor Bahru',st:'01',col:1.05,flood:.15},ipoh:{name:'Ipoh',st:'08',col:.9,flood:.1},
  melaka:{name:'Melaka',st:'04',col:.9,flood:.1},kotabharu:{name:'Kota Bharu',st:'03',col:.8,flood:.35},kedah:{name:'Kampung in Kedah',st:'02',col:.7,kampung:1,flood:.2},
  kuching:{name:'Kuching',st:'13',col:.95,flood:.15},sarawak:{name:'Longhouse village, Sarawak',st:'13',col:.7,kampung:1,flood:.2},
  kk:{name:'Kota Kinabalu',st:'12',col:1,flood:.1},sabah:{name:'Kampung in Ranau, Sabah',st:'12',col:.7,kampung:1,flood:.1},
};
const COUNTRIES={
  MY:{name:'Malaysia',flag:'🇲🇾',city:'Malaysia',sal:1,col:1},
  SG:{name:'Singapore',flag:'🇸🇬',city:'Singapore',sal:2.6,col:2.2,lang:'en',need:40,anyJob:1,home:4500000,cit:1,flight:600,uni:'National University of Singapore',fee:100000},
  AU:{name:'Australia',flag:'🇦🇺',city:'Melbourne',sal:2.3,col:1.9,lang:'en',need:65,maxAge:45,home:3000000,cit:1,flight:3500,uni:'University of Melbourne',fee:140000},
  UK:{name:'United Kingdom',flag:'🇬🇧',city:'London',sal:2.5,col:2.3,lang:'en',need:65,home:3500000,cit:1,flight:5000,uni:'University of Manchester',fee:150000},
  JP:{name:'Japan',flag:'🇯🇵',city:'Tokyo',sal:1.6,col:1.5,lang:'ja',need:50,home:2000000,cit:1,flight:2500,uni:'Waseda University',fee:60000},
  KR:{name:'South Korea',flag:'🇰🇷',city:'Seoul',sal:1.6,col:1.5,lang:'ko',need:50,home:2500000,cit:1,flight:2200,uni:'Yonsei University',fee:60000},
  TW:{name:'Taiwan',flag:'🇹🇼',city:'Taipei',sal:1.3,col:1.2,lang:'zh',need:55,home:2500000,cit:1,flight:1800,uni:'National Taiwan University',fee:35000},
  CN:{name:'China',flag:'🇨🇳',city:'Shenzhen',sal:1.5,col:1.3,lang:'zh',need:60,home:2200000,cit:1,flight:1800,uni:'Tsinghua University',fee:50000},
  AE:{name:'UAE',flag:'🇦🇪',city:'Dubai',sal:2.3,col:1.8,lang:'en',need:50,anyJob:1,home:2500000,cit:0,flight:2500,uni:'University of Dubai',fee:80000},
  US:{name:'United States',flag:'🇺🇸',city:'New York',sal:3.4,col:2.8,lang:'en',need:65,lottery:.3,home:4500000,cit:1,flight:6000,uni:'University of Michigan',fee:230000},
  CA:{name:'Canada',flag:'🇨🇦',city:'Toronto',sal:2.3,col:2,lang:'en',need:60,maxAge:45,home:3200000,cit:1,flight:6000,uni:'University of Toronto',fee:160000},
  NZ:{name:'New Zealand',flag:'🇳🇿',city:'Auckland',sal:2,col:1.8,lang:'en',need:60,maxAge:45,home:2800000,cit:1,flight:4000,uni:'University of Auckland',fee:120000},
  DE:{name:'Germany',flag:'🇩🇪',city:'Berlin',sal:2.2,col:1.6,lang:'de',need:50,home:2200000,cit:1,flight:4500,uni:'Technical University of Munich',fee:30000},
};
const FOREIGN_NAMES={
  west:{m:['Oliver','Jack','Liam','Noah','Ethan','James','Harry','Daniel','Thomas','Ryan','William','Henry','Samuel','Benjamin','Lucas','Alexander','George','Charlie','Oscar','Leo','Matthew','Joshua','Michael','David','Andrew','Christopher','Nathan','Adam','Luke','Isaac'],f:['Emma','Olivia','Chloe','Sophie','Grace','Emily','Charlotte','Hannah','Lucy','Amelia','Ava','Mia','Isabella','Sophia','Ella','Lily','Zoe','Ruby','Jessica','Sarah','Rebecca','Megan','Katie','Ellie','Isla','Freya','Abigail','Madison','Natalie','Victoria']},
  JP:{m:['Haruto','Ren','Sota','Yuki','Kenta','Daiki','Riku','Takumi','Hiroshi','Kaito','Yuto','Sho','Takeshi','Shota','Haruki','Kenji','Ryota','Daisuke','Itsuki','Minato','Yamato','Kazuki','Naoki'],f:['Yui','Sakura','Aoi','Hina','Mei','Rin','Haruka','Nanami','Yuna','Miyu','Akari','Saki','Mio','Emi','Ayaka','Misaki','Natsuki','Kaori','Yoko','Hana','Rika','Asuka','Tsubasa']},KR:{m:['Min-jun','Ji-ho','Seo-jun','Do-yun','Hyun-woo','Jae-won','Tae-yang','Joon-ho','Sung-min','Woo-jin','Ji-hoon','Min-ho','Dong-hyun','Seung-woo','Yoon-seok','Jun-young','Hyun-jin','Tae-hyun','Jin-woo','Sang-hoon','Kyung-soo','Chan-yeol'],f:['Seo-yeon','Ji-woo','Ha-eun','Min-seo','Soo-ah','Ye-jin','Da-eun','Ji-eun','Soo-jin','Yoo-na','Hye-jin','Eun-ji','Min-ji','Seo-yun','Na-yeon','Ji-min','Chae-won','Yeon-woo','Hae-won','So-yeon','Ha-neul','Bo-ra']},
  TW:{m:['Chen Hao','Yu-ting','Wei-lun','Chih-wei','Chia-hao','Tsung-han','Po-yu','Yu-hsiang','Kuan-ting','Chun-hung','Wei-ting','Hsin-yu','Cheng-en','Yi-chen','Bo-wen'],f:['Pei-yu','Ya-ting','Hsin-yi','Shu-fen','Yi-ching','Hui-ling','Chia-yi','Pei-shan','Mei-hua','Yu-chen','Ting-yu','Hsiao-wen','Yun-ting','Chen-hsi','Wan-ju']},CN:{m:['Li Wei','Zhang Hao','Wang Lei','Liu Yang','Chen Bo','Zhao Lei','Sun Hao','Wu Jie','Xu Ming','Yang Fan','Huang Tao','Zhou Kai','Ma Rui','Guo Peng','Lin Feng'],f:['Liu Yang','Chen Jing','Zhou Min','Wang Fang','Li Na','Zhang Min','Zhao Li','Sun Yue','Xu Ting','Yang Xue','Huang Lei','Wu Qian','Lin Yu','Gao Yan','He Xin']},
  DE:{m:['Lukas','Felix','Jonas','Max','Paul','Leon','Niklas','Finn','Elias','Ben','Noah','Moritz','Tim','Jan','Florian','Tobias','Sebastian','Julian','Fabian','Philipp','Matthias'],f:['Lena','Mia','Hannah','Lea','Anna','Laura','Marie','Sophie','Emilia','Lina','Clara','Johanna','Katharina','Julia','Sarah','Nina','Jana','Franziska','Lisa','Charlotte']},
};
const TRIPS=[
  {id:'cameron',name:'Cameron Highlands weekend',cost:700,hap:4},{id:'langkawi',name:'Langkawi island getaway',cost:1500,hap:6},
  {id:'bkk',name:'Bangkok food & shopping',cost:2500,hap:7},{id:'bali',name:'Bali beach trip',cost:3200,hap:8},
  {id:'taiwan',name:'Taipei night markets',cost:4500,hap:8},{id:'korea',name:'Seoul, South Korea',cost:6000,hap:9},
  {id:'japan',name:'Japan: Tokyo & Kyoto',cost:8000,hap:10},{id:'aus',name:'Melbourne & Great Ocean Road',cost:10000,hap:10},
  {id:'maldives',name:'Maldives resort',cost:14000,hap:12},{id:'europe',name:'Europe: London, Paris, Rome',cost:18000,hap:12},
];
const EDU_RANK={none:0,spm:1,tvet:2,diploma:2,degree:3};
const EDU_LABEL={spm:'SPM',tvet:'TVET certificate',diploma:'Diploma',degree:'Degree'};
const MAJORS={med:{name:'Medicine',yrs:5,int:75,sci:1,pub:85},eng:{name:'Engineering',yrs:4,int:60,sci:1,pub:70},cs:{name:'Computer Science',yrs:3,int:55,pub:60},
  bus:{name:'Business & Accounting',yrs:3,int:40,pub:55},law:{name:'Law',yrs:4,int:60,pub:78},edu:{name:'Education (teaching)',yrs:4,int:40,pub:50},
  arts:{name:'Arts & Design',yrs:3,cre:50,pub:50},sport:{name:'Sports Science',yrs:3,ath:55,pub:50}};
const JOBS={
  factory:{name:'Factory operator',sector:'trade',req:{},base:1800,levels:['Operator','Line Leader','Supervisor'],growth:[1,1.3,1.7],stat:'dis',easy:1},
  clerk:{name:'Office clerk',sector:'trade',req:{edu:'spm'},base:1900,levels:['Clerk','Senior Clerk','Admin Executive','Office Manager'],growth:[1,1.3,1.7,2.3],stat:'dis',easy:1},
  hawker:{name:'Hawker stall owner',sector:'food',req:{},base:2200,levels:['Roadside stall','Popular stall','Small restaurant','Restaurant chain'],growth:[1,1.6,3,6],stat:'cre',volatile:.4,noEpf:1,easy:1},
  grab:{name:'E-hailing driver',sector:'gig',req:{car:1},base:2600,levels:['Driver'],growth:[1],stat:'cha',noEpf:1,easy:1,from:2014},
  sales:{name:'Sales executive',sector:'trade',req:{edu:'spm',stat:{cha:55}},base:2600,levels:['Sales Executive','Senior Executive','Sales Manager','Regional Head'],growth:[1,1.5,2.3,4],stat:'cha',volatile:.3},
  civil:{name:'Civil servant',sector:'gov',req:{edu:'spm'},base:2300,levels:['Grade 19 Assistant','Grade 29 Officer','Grade 41 Officer','Grade 48 Senior Officer','Grade 54 Director'],growth:[1,1.5,2.2,3.2,4.5],stat:'dis',stable:1,pension:1,myOnly:1},
  police:{name:'Police officer',sector:'gov',req:{edu:'spm',stat:{ath:50}},base:2400,levels:['Constable','Sergeant','Inspector','ASP','Superintendent'],growth:[1,1.3,1.8,2.5,3.5],stat:'ath',stable:1,pension:1,myOnly:1},
  technician:{name:'Technician',sector:'eng',req:{edu:'tvet'},base:2500,levels:['Technician','Senior Technician','Supervisor','Plant Manager'],growth:[1,1.4,1.9,3],stat:'dis'},
  nurse:{name:'Nurse',sector:'health',req:{edu:'diploma'},base:2800,levels:['Staff Nurse','Senior Nurse','Sister','Matron'],growth:[1,1.3,1.7,2.3],stat:'cha'},
  planter:{name:'Plantation manager',sector:'agri',req:{edu:'diploma'},base:3000,levels:['Assistant Manager','Estate Manager','Senior Manager','General Manager'],growth:[1,1.5,2.3,3.5],stat:'dis'},
  teacher:{name:'Teacher',sector:'edu',req:{edu:'degree',major:['edu','arts','bus','cs','eng','sport']},base:3100,levels:['DG41 Teacher','Senior Teacher','Senior Assistant','Headmaster'],growth:[1,1.5,2,2.7],stat:'cha',hap:2,stable:1,pension:1,myOnly:1},
  designer:{name:'Designer / Artist',sector:'creative',req:{stat:{cre:60}},base:2600,levels:['Junior Designer','Designer','Art Director','Creative Director'],growth:[1,1.5,2.3,4],stat:'cre',hap:3,volatile:.4},
  coach:{name:'Sports coach',sector:'sport',req:{stat:{ath:60}},base:2800,levels:['Coach','Head Coach','National Coach'],growth:[1,1.6,2.8],stat:'cha'},
  accountant:{name:'Accountant',sector:'finance',req:{edu:'degree',major:['bus']},base:3500,levels:['Audit Associate','Senior Associate','Manager','Partner'],growth:[1,1.5,2.6,6],stat:'dis',hap:-1},
  banker:{name:'Banker',sector:'finance',req:{edu:'degree',major:['bus','law','eng','cs']},base:4000,levels:['Analyst','Associate','Vice President','Director'],growth:[1,1.6,2.8,5.5],stat:'cha'},
  lawyer:{name:'Lawyer',sector:'law',req:{edu:'degree',major:['law']},base:3500,levels:['Pupil in Chambers','Associate','Senior Associate','Partner'],growth:[1,1.6,2.8,7],stat:'cha',hap:-1},
  engineer:{name:'Engineer',sector:'eng',req:{edu:'degree',major:['eng']},base:4000,levels:['Graduate Engineer','Engineer','Senior Engineer','Principal Engineer','Engineering Director'],growth:[1,1.4,2,3,4.5],stat:'int'},
  software:{name:'Software engineer',sector:'tech',req:{edu:'degree',major:['cs','eng'],orStat:{int:78}},base:4500,levels:['Junior Developer','Software Engineer','Senior Engineer','Tech Lead','CTO'],growth:[1,1.5,2.2,3.2,5],stat:'int',from:1985},
  doctor:{name:'Doctor',sector:'health',req:{edu:'degree',major:['med']},base:5000,levels:['Houseman','Medical Officer','Specialist','Consultant'],growth:[1,1.4,2.8,5],stat:'int',hap:-2},
  athlete:{name:'Professional athlete',sector:'sport',req:{stat:{ath:80}},base:3000,levels:['State player','National squad','National star'],growth:[1,2.5,6],stat:'ath',maxAge:35,hap:3},
  influencer:{name:'Content creator',sector:'creative',req:{stat:{cha:55,look:50}},base:1500,levels:['Small creator','10K followers','100K followers','1M followers'],growth:[1,3,8,25],stat:'cha',volatile:.8,noEpf:1,hap:2,from:2010},
  entrepreneur:{name:'Entrepreneur',sector:'trade',req:{},base:3000,levels:['Startup','Growing SME','Established company','Bursa-listed company'],growth:[1,3,8,30],stat:'cre',volatile:.9,noEpf:1,startCost:30000},
};
const HOUSES=[
  {id:'ppr',name:'Low-cost flat',where:'Outskirts of KL',price:90000,cond:()=>incomeMonthly()<5000*infl(),why:'Household income must be under '+'RM 5k/month (scaled)'},
  {id:'afford',name:'Affordable home (state scheme)',where:'Selangor',price:250000,cond:()=>incomeMonthly()<10000*infl(),why:'Household income must be under RM 10k/month (scaled)'},
  {id:'kampung',name:'Kampung house with land',where:'Kedah',price:180000,landed:1},
  {id:'terrace1',name:'Single-storey terrace',where:'Ipoh, Perak',price:330000,landed:1},
  {id:'apt',name:'Apartment',where:'Cheras, KL',price:380000},
  {id:'jb',name:'Double-storey terrace',where:'Johor Bahru',price:600000,landed:1},
  {id:'condo',name:'Condominium',where:'Petaling Jaya',price:680000},
  {id:'terrace2',name:'Double-storey terrace',where:'Subang Jaya',price:950000,landed:1},
  {id:'penang',name:'Sea-view condo',where:'Tanjung Bungah, Penang',price:1100000},
  {id:'semid',name:'Semi-detached house',where:'Shah Alam',price:1600000,landed:1},
  {id:'luxcondo',name:'Luxury condo',where:'Mont Kiara, KL',price:2200000,lux:1},
  {id:'bungalow',name:'Bungalow',where:'Damansara Heights, KL',price:6500000,landed:1,lux:1},
  {id:'shoplot',name:'Three-storey shophouse (to rent out)',where:'SS2, Petaling Jaya',price:2600000,rental:1},
  {id:'units',name:'Five condo units (to rent out)',where:'Cyberjaya',price:2400000,rental:1},
];
const CARS=[
  {id:'ex5',name:'Honda EX5',type:'Motorcycle',price:5200,from:1987,minAge:16},
  {id:'y15',name:'Yamaha Y15ZR',type:'Motorcycle',price:9000,from:2015,minAge:16},
  {id:'kancil',name:'Perodua Kancil',type:'Budget',price:25000,from:1994,to:2009},
  {id:'saga',name:'Proton Saga',type:'Budget',price:40000,from:1985},
  {id:'wira',name:'Proton Wira',type:'Budget',price:45000,from:1993,to:2009},
  {id:'axia',name:'Perodua Axia',type:'Budget',price:38000,from:2014},
  {id:'bezza',name:'Perodua Bezza',type:'Popular',price:45000,from:2016},
  {id:'myvi',name:'Perodua Myvi',type:'Popular',price:55000,from:2005},
  {id:'city',name:'Honda City',type:'Sedan',price:90000,from:1996},
  {id:'vios',name:'Toyota Vios',type:'Sedan',price:95000,from:2003},
  {id:'x50',name:'Proton X50',type:'SUV',price:100000,from:2020},
  {id:'dolphin',name:'BYD Dolphin',type:'EV',price:100000,from:2023,ev:1},
  {id:'emas7',name:'Proton e.MAS 7',type:'EV',price:110000,from:2024,ev:1},
  {id:'civic',name:'Honda Civic',type:'Executive',price:140000,from:1973},
  {id:'teslay',name:'Tesla Model Y',type:'EV',price:200000,from:2023,ev:1,lux:1},
  {id:'camry',name:'Toyota Camry',type:'Executive',price:210000,from:1983},
  {id:'bmw3',name:'BMW 3 Series',type:'Luxury',price:250000,from:1975,lux:1},
  {id:'mercc',name:'Mercedes-Benz C-Class',type:'Luxury',price:290000,from:1993,lux:1},
  {id:'p911',name:'Porsche 911',type:'Supercar',price:1300000,from:1964,lux:1},
];
const PETS=[
  {id:'kcat',name:'Kampung cat (adopted)',price:0,cost:1000,life:[12,16],hap:3},
  {id:'persian',name:'Persian cat',price:2500,cost:2400,life:[12,15],hap:4},
  {id:'bsh',name:'British Shorthair cat',price:3500,cost:2400,life:[12,16],hap:4},
  {id:'mutt',name:'Rescued local dog',price:0,cost:1500,life:[11,15],hap:4,landed:1,hlt:1},
  {id:'golden',name:'Golden Retriever',price:4000,cost:3600,life:[10,12],hap:5,landed:1,hlt:1},
  {id:'shihtzu',name:'Shih Tzu',price:2500,cost:2400,life:[12,16],hap:4,landed:1},
  {id:'betta',name:'Betta fish',price:20,cost:60,life:[2,4],hap:1},
  {id:'arowana',name:'Asian arowana',price:8000,cost:1200,life:[15,20],hap:2,luck:4},
  {id:'koi',name:'Koi pond',price:9000,cost:2000,life:[15,25],hap:3,landed:1},
  {id:'merbok',name:'Merbok (zebra dove)',price:600,cost:300,life:[8,12],hap:2},
  {id:'hamster',name:'Hamster',price:60,cost:200,life:[2,3],hap:2},
  {id:'rabbit',name:'Rabbit',price:150,cost:600,life:[8,10],hap:2},
];
const PET_NAMES=['Oyen','Comel','Bobo','Lucky','Milo','Kopi','Mochi','Tiger','Snowy','Ah Huat','Putih','Boboi','Kuning','Teh Tarik'];
const ACH={
  straightA:['Straight As','Score straight As in SPM, UEC or IGCSE'],scholar:['Scholar','Win a scholarship'],grad:['Graduate','Earn a degree'],
  firstJob:['First paycheck','Land your first job'],boss:['Top of the ladder','Reach the highest rank in a career'],married:['Happily ever after','Get married'],
  parent:['Parenthood','Have or adopt a child'],homeowner:['Homeowner','Buy your first property'],millionaire:['Jutawan','Net worth of RM 1 million'],
  b40t20:['B40 to T20','Born B40, reach RM 2M net worth'],yb:['Yang Berhormat','Win an election'],minister:['Cabinet Minister','Become a Minister'],pm:['Prime Minister','Lead the country'],datuk:['Datuk','Receive a royal title'],kampungKLCC:['Kampung to KL','Born in a kampung, own a luxury home'],
  globetrotter:['Globetrotter','Visit 5 holiday destinations'],expat:['Malaysian abroad','Live overseas for 5 years'],centenarian:['Centenarian','Live to 100'],
  scamProof:['Scam-proof','See through a scam'],openHouse:['Open-house legend','Host 5 open houses'],petLover:['Pet lover','Own 3 pets at once'],
  carCollector:['Car collector','Own 3 vehicles at once'],polyglot:['Polyglot','Reach 60+ in four languages'],dynasty3:['Dynasty','Reach the third generation'],
};

/* ================= world events ================= */
const HIST=[
  {id:'oil73',y:[1973,1974],title:'Oil crisis',desc:'Global oil prices quadruple. Petrol becomes expensive; oil & gas jobs boom.',fx:{fuel:1.5,stock:-.15,sal:{eng:1.1}}},
  {id:'rec85',y:[1985,1986],title:'Malaysian recession',desc:'Commodity prices collapse and Malaysia slips into recession.',fx:{stock:-.2,prop:-.05,layoff:{all:.06,agri:.15}}},
  {id:'afc97',y:[1997,1998],title:'Asian Financial Crisis',desc:'The ringgit crashes, Bursa collapses and companies retrench staff.',fx:{stock:-.45,prop:-.12,layoff:{all:.1,finance:.2,trade:.12},hap:-3}},
  {id:'sars03',y:[2003,2003],title:'SARS outbreak',desc:'Tourists stay away and people avoid eating out.',fx:{layoff:{food:.15},sal:{food:.75},hlt:-1,hap:-2}},
  {id:'gfc08',y:[2008,2009],title:'Global Financial Crisis',desc:'Wall Street collapses and the shock hits Malaysian exports.',fx:{stock:-.35,prop:-.05,layoff:{all:.06,finance:.15}}},
  {id:'oil15',y:[2015,2016],title:'Oil price crash & weak ringgit',desc:'Oil drops below USD 50 and the ringgit weakens. Oil & gas jobs are cut.',fx:{layoff:{eng:.15,agri:.05},stock:-.1,col:1.04,travel:1.25,abroadSal:1.15}},
  {id:'haze15',y:[2015,2015],title:'Severe haze',desc:'Smoke from forest fires blankets the country; schools close.',fx:{hlt:-4,hap:-2}},
  {id:'haze19',y:[2019,2019],title:'Haze returns',desc:'API readings hit unhealthy levels again.',fx:{hlt:-3}},
  {id:'covid',y:[2020,2021],title:'COVID-19 pandemic & MCO',desc:'The Movement Control Order shuts the country. Offices go remote, restaurants struggle.',fx:{stock:-.05,layoff:{all:.06,food:.3,gig:.1,trade:.1},sal:{tech:1.15,food:.6},hap:-5,hlt:-2,travel:3},onset:'covid'},
  {id:'flood21',y:[2021,2021],title:'Klang Valley floods',desc:'Record December rain floods Shah Alam and parts of the Klang Valley.',fx:{},onset:'flood',floodBoost:.3},
  {id:'infl22',y:[2022,2023],title:'Cost-of-living surge',desc:'Prices of food and essentials jump; interest rates rise.',fx:{col:1.08,hap:-2,rate:.01}},
  {id:'ai23',y:[2023,2026],title:'AI & data-centre boom',desc:'Johor fills with data centres. Tech salaries soar; some routine office work is automated.',fx:{sal:{tech:1.25,eng:1.1},layoff:{trade:.03}},good:1},
  {id:'fuel25',y:[2025,2026],title:'Targeted RON95 fuel subsidy',desc:'Petrol subsidies are targeted, changing what drivers pay.',fx:{fuel:1.1}},
];
const FUT=[
  {id:'recession',title:'Global recession',len:[1,2],desc:'Demand collapses worldwide and companies cut jobs.',fx:{stock:-.3,prop:-.08,layoff:{all:.08}}},
  {id:'pandemic',title:'New pandemic',len:[1,2],desc:'A new virus spreads and lockdowns return.',fx:{layoff:{all:.05,food:.25,gig:.1},sal:{tech:1.1,food:.6},hap:-5,hlt:-3,travel:3},onset:'covid'},
  {id:'propboom',title:'Property boom',len:[2,4],desc:'House prices climb fast across the Klang Valley and Penang.',fx:{prop:.09},good:1},
  {id:'rmup',title:'Ringgit surges',len:[1,3],desc:'The ringgit strengthens. Overseas holidays get cheaper.',fx:{travel:.8,abroadSal:.85},good:1},
  {id:'rmdown',title:'Ringgit slumps',len:[1,3],desc:'The ringgit weakens. Imports and overseas trips cost more.',fx:{travel:1.3,abroadSal:1.2,col:1.04}},
  {id:'automation',title:'AI automation wave',len:[2,5],desc:'AI agents take over routine office, finance and design work.',fx:{layoff:{trade:.1,finance:.06,creative:.05},sal:{tech:1.2}}},
  {id:'ev',title:'EV revolution',len:[3,6],desc:'EVs get cheap and chargers appear everywhere. Petrol cars lose resale value.',fx:{petrolCar:-.08,fuel:1.2},good:1},
  {id:'oilboom',title:'Oil price boom',len:[1,3],desc:'Oil prices spike. Petronas and O&G engineers do very well.',fx:{sal:{eng:1.2},fuel:1.3}},
  {id:'palm',title:'Palm oil price boom',len:[1,3],desc:'Palm oil hits record prices. Plantation bonuses soar.',fx:{sal:{agri:1.4}},good:1},
  {id:'megaflood',title:'Monsoon mega-floods',len:[1,1],desc:'The northeast monsoon brings the worst floods in decades.',fx:{},onset:'flood',floodBoost:.25},
  {id:'heat',title:'Record heatwave & haze',len:[1,1],desc:'Temperatures pass 40°C and haze returns.',fx:{hlt:-3,hap:-2}},
  {id:'techboom',title:'Startup & tech boom',len:[2,4],desc:'Venture money floods into Southeast Asian startups.',fx:{stock:.25,sal:{tech:1.15,trade:1.05}},good:1},
  {id:'aid',title:'Government cash aid',len:[1,1],desc:'The government hands out cash aid to B40 households.',fx:{aid:1},good:1},
];

