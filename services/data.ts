import { Word } from '../types';

// In a real production app, this would be fetched from Firestore or a large JSON file.
// Here we generate a sample structure to mimic the 3000 words logic.

const rawWords = [
  // Level 1 - Basic Words
  { en: "Ability", tr: "Yetenek", ex: "He has the ability to learn quickly.", type: "noun", lvl: 1 },
  { en: "Access", tr: "Erişim", ex: "Do you have access to the internet?", type: "noun", lvl: 1 },
  { en: "Action", tr: "Aksiyon", ex: "We need to take action immediately.", type: "noun", lvl: 1 },
  { en: "Active", tr: "Aktif", ex: "She is very active in sports.", type: "adj", lvl: 1 },
  { en: "Actual", tr: "Gerçek", ex: "What is the actual cost?", type: "adj", lvl: 1 },
  { en: "Address", tr: "Adres", ex: "What is your address?", type: "noun", lvl: 1 },
  { en: "Admit", tr: "Kabul Etmek", ex: "I admit I was wrong.", type: "verb", lvl: 1 },
  { en: "Adult", tr: "Yetişkin", ex: "This movie is for adults only.", type: "noun", lvl: 1 },
  { en: "Advance", tr: "İlerlemek", ex: "Technology continues to advance.", type: "verb", lvl: 1 },
  { en: "Advice", tr: "Tavsiye", ex: "Can you give me some advice?", type: "noun", lvl: 1 },
  { en: "Affect", tr: "Etkilemek", ex: "Weather can affect your mood.", type: "verb", lvl: 1 },
  { en: "Afford", tr: "Karşılayabilmek", ex: "I can't afford a new car.", type: "verb", lvl: 1 },
  { en: "Afraid", tr: "Korkmuş", ex: "Don't be afraid of the dark.", type: "adj", lvl: 1 },
  { en: "Again", tr: "Tekrar", ex: "Please say that again.", type: "adv", lvl: 1 },
  { en: "Against", tr: "Karşı", ex: "I'm against this idea.", type: "prep", lvl: 1 },
  { en: "Age", tr: "Yaş", ex: "What is your age?", type: "noun", lvl: 1 },
  { en: "Agency", tr: "Ajans", ex: "She works for a travel agency.", type: "noun", lvl: 1 },
  { en: "Agent", tr: "Ajan", ex: "The real estate agent showed us the house.", type: "noun", lvl: 1 },
  { en: "Agree", tr: "Katılmak", ex: "I agree with you completely.", type: "verb", lvl: 1 },
  { en: "Ahead", tr: "İleri", ex: "Look ahead and you'll see the sign.", type: "adv", lvl: 1 },
  { en: "Aid", tr: "Yardım", ex: "Foreign aid helps many countries.", type: "noun", lvl: 1 },
  { en: "Aim", tr: "Hedef", ex: "What is your aim in life?", type: "noun", lvl: 1 },
  { en: "Air", tr: "Hava", ex: "The air is fresh in the mountains.", type: "noun", lvl: 1 },
  { en: "Airport", tr: "Havalimanı", ex: "We arrived at the airport early.", type: "noun", lvl: 1 },
  { en: "Alarm", tr: "Alarm", ex: "Set your alarm for 7 AM.", type: "noun", lvl: 1 },
  { en: "Album", tr: "Albüm", ex: "This is my favorite music album.", type: "noun", lvl: 1 },
  { en: "Alcohol", tr: "Alkol", ex: "Don't drink alcohol and drive.", type: "noun", lvl: 1 },
  { en: "Alert", tr: "Uyarı", ex: "Stay alert while driving.", type: "adj", lvl: 1 },
  { en: "Alive", tr: "Canlı", ex: "The patient is still alive.", type: "adj", lvl: 1 },
  { en: "All", tr: "Hepsi", ex: "All students passed the exam.", type: "adj", lvl: 1 },
  
  // Level 2 - Intermediate Words
  { en: "Beneath", tr: "Altında", ex: "The boat sank beneath the waves.", type: "prep", lvl: 2 },
  { en: "Benefit", tr: "Fayda", ex: "Exercise has many health benefits.", type: "noun", lvl: 2 },
  { en: "Beside", tr: "Yanında", ex: "Sit beside me, please.", type: "prep", lvl: 2 },
  { en: "Besides", tr: "Ayrıca", ex: "Besides English, I speak French.", type: "prep", lvl: 2 },
  { en: "Bet", tr: "Bahis", ex: "I bet you can't do it.", type: "verb", lvl: 2 },
  { en: "Between", tr: "Arasında", ex: "Choose between these two options.", type: "prep", lvl: 2 },
  { en: "Beyond", tr: "Ötesinde", ex: "The problem is beyond my control.", type: "prep", lvl: 2 },
  { en: "Bicycle", tr: "Bisiklet", ex: "I ride my bicycle to work.", type: "noun", lvl: 2 },
  { en: "Bid", tr: "Teklif", ex: "I bid $100 for the painting.", type: "verb", lvl: 2 },
  { en: "Big", tr: "Büyük", ex: "This is a big opportunity.", type: "adj", lvl: 2 },
  { en: "Bill", tr: "Fatura", ex: "Can I have the bill, please?", type: "noun", lvl: 2 },
  { en: "Billion", tr: "Milyar", ex: "The company is worth billions.", type: "noun", lvl: 2 },
  { en: "Bind", tr: "Bağlamak", ex: "Bind the books together.", type: "verb", lvl: 2 },
  { en: "Biological", tr: "Biyolojik", ex: "This is a biological process.", type: "adj", lvl: 2 },
  { en: "Bird", tr: "Kuş", ex: "A bird is singing outside.", type: "noun", lvl: 2 },
  { en: "Birth", tr: "Doğum", ex: "The birth of a child is a miracle.", type: "noun", lvl: 2 },
  { en: "Birthday", tr: "Doğum Günü", ex: "Happy birthday to you!", type: "noun", lvl: 2 },
  { en: "Bit", tr: "Biraz", ex: "Wait a bit longer.", type: "noun", lvl: 2 },
  { en: "Bite", tr: "Isırmak", ex: "Don't bite your nails.", type: "verb", lvl: 2 },
  { en: "Bitter", tr: "Acı", ex: "The coffee tastes bitter.", type: "adj", lvl: 2 },
  { en: "Black", tr: "Siyah", ex: "She wore a black dress.", type: "adj", lvl: 2 },
  { en: "Blade", tr: "Bıçak", ex: "The blade is very sharp.", type: "noun", lvl: 2 },
  { en: "Blame", tr: "Suçlamak", ex: "Don't blame me for your mistakes.", type: "verb", lvl: 2 },
  { en: "Blank", tr: "Boş", ex: "Fill in the blank spaces.", type: "adj", lvl: 2 },
  { en: "Blanket", tr: "Battaniye", ex: "Cover yourself with a blanket.", type: "noun", lvl: 2 },
  { en: "Blind", tr: "Kör", ex: "He is blind in one eye.", type: "adj", lvl: 2 },
  { en: "Block", tr: "Blok", ex: "Turn left at the next block.", type: "noun", lvl: 2 },
  { en: "Blood", tr: "Kan", ex: "Blood is red.", type: "noun", lvl: 2 },
  { en: "Blow", tr: "Üflemek", ex: "Blow out the candles.", type: "verb", lvl: 2 },
  { en: "Blue", tr: "Mavi", ex: "The sky is blue today.", type: "adj", lvl: 2 },
  { en: "Board", tr: "Tahta", ex: "Write on the board.", type: "noun", lvl: 2 },
  { en: "Boat", tr: "Tekne", ex: "We sailed in a small boat.", type: "noun", lvl: 2 },
  { en: "Body", tr: "Vücut", ex: "Take care of your body.", type: "noun", lvl: 2 },
  { en: "Capacity", tr: "Kapasite", ex: "The stadium has a seating capacity of 50,000.", type: "noun", lvl: 2 },
  
  // Level 3 - Upper Intermediate
  { en: "Debate", tr: "Tartışma", ex: "There has been much debate on this issue.", type: "noun", lvl: 3 },
  { en: "Debt", tr: "Borç", ex: "I need to pay off my debt.", type: "noun", lvl: 3 },
  { en: "Decade", tr: "On Yıl", ex: "A decade has passed.", type: "noun", lvl: 3 },
  { en: "Decide", tr: "Karar Vermek", ex: "You must decide now.", type: "verb", lvl: 3 },
  { en: "Decision", tr: "Karar", ex: "This is an important decision.", type: "noun", lvl: 3 },
  { en: "Decline", tr: "Reddetmek", ex: "I decline your offer.", type: "verb", lvl: 3 },
  { en: "Decrease", tr: "Azaltmak", ex: "Sales decreased this month.", type: "verb", lvl: 3 },
  { en: "Deep", tr: "Derin", ex: "The ocean is very deep.", type: "adj", lvl: 3 },
  { en: "Defeat", tr: "Yenmek", ex: "We will defeat our enemies.", type: "verb", lvl: 3 },
  { en: "Defend", tr: "Savunmak", ex: "I will defend my position.", type: "verb", lvl: 3 },
  { en: "Define", tr: "Tanımlamak", ex: "Can you define this word?", type: "verb", lvl: 3 },
  { en: "Definite", tr: "Kesin", ex: "There is no definite answer.", type: "adj", lvl: 3 },
  { en: "Degree", tr: "Derece", ex: "What degree did you earn?", type: "noun", lvl: 3 },
  { en: "Delay", tr: "Gecikme", ex: "There was a delay in the flight.", type: "noun", lvl: 3 },
  { en: "Deliver", tr: "Teslim Etmek", ex: "The package will be delivered tomorrow.", type: "verb", lvl: 3 },
  { en: "Demand", tr: "Talep", ex: "There is high demand for this product.", type: "noun", lvl: 3 },
  { en: "Democracy", tr: "Demokrasi", ex: "We live in a democracy.", type: "noun", lvl: 3 },
  { en: "Demonstrate", tr: "Göstermek", ex: "Let me demonstrate how it works.", type: "verb", lvl: 3 },
  { en: "Dense", tr: "Yoğun", ex: "The forest is very dense.", type: "adj", lvl: 3 },
  { en: "Deny", tr: "İnkar Etmek", ex: "I cannot deny the truth.", type: "verb", lvl: 3 },
  { en: "Department", tr: "Bölüm", ex: "Which department do you work in?", type: "noun", lvl: 3 },
  { en: "Depend", tr: "Bağımlı Olmak", ex: "Children depend on their parents.", type: "verb", lvl: 3 },
  { en: "Deposit", tr: "Yatırmak", ex: "I need to deposit money in the bank.", type: "verb", lvl: 3 },
  { en: "Depress", tr: "Depresyona Sokmak", ex: "Bad news can depress people.", type: "verb", lvl: 3 },
  { en: "Depth", tr: "Derinlik", ex: "Measure the depth of the pool.", type: "noun", lvl: 3 },
  { en: "Describe", tr: "Tanımlamak", ex: "Can you describe what happened?", type: "verb", lvl: 3 },
  { en: "Desert", tr: "Çöl", ex: "The desert is very hot.", type: "noun", lvl: 3 },
  { en: "Design", tr: "Tasarım", ex: "I love the design of this building.", type: "noun", lvl: 3 },
  { en: "Desire", tr: "Arzu", ex: "I have a strong desire to succeed.", type: "noun", lvl: 3 },
  { en: "Desk", tr: "Masa", ex: "Sit at your desk.", type: "noun", lvl: 3 },
  { en: "Efficient", tr: "Verimli", ex: "We need an efficient way to work.", type: "adj", lvl: 3 },
  
  // Level 4 - Advanced
  { en: "Fabric", tr: "Kumaş", ex: "This fabric is very soft.", type: "noun", lvl: 4 },
  { en: "Face", tr: "Yüz", ex: "She has a beautiful face.", type: "noun", lvl: 4 },
  { en: "Fact", tr: "Gerçek", ex: "That's a fact, not an opinion.", type: "noun", lvl: 4 },
  { en: "Factor", tr: "Faktör", ex: "Price is an important factor.", type: "noun", lvl: 4 },
  { en: "Factory", tr: "Fabrika", ex: "He works in a factory.", type: "noun", lvl: 4 },
  { en: "Fail", tr: "Başarısız Olmak", ex: "Don't fail this test.", type: "verb", lvl: 4 },
  { en: "Failure", tr: "Başarısızlık", ex: "Failure is part of learning.", type: "noun", lvl: 4 },
  { en: "Fair", tr: "Adil", ex: "That's not fair!", type: "adj", lvl: 4 },
  { en: "Faith", tr: "İnanç", ex: "I have faith in you.", type: "noun", lvl: 4 },
  { en: "Fall", tr: "Düşmek", ex: "Don't fall down!", type: "verb", lvl: 4 },
  { en: "False", tr: "Yanlış", ex: "That statement is false.", type: "adj", lvl: 4 },
  { en: "Familiar", tr: "Tanıdık", ex: "This place looks familiar.", type: "adj", lvl: 4 },
  { en: "Family", tr: "Aile", ex: "I love my family.", type: "noun", lvl: 4 },
  { en: "Famous", tr: "Ünlü", ex: "She is a famous actress.", type: "adj", lvl: 4 },
  { en: "Fan", tr: "Hayran", ex: "I'm a big fan of this band.", type: "noun", lvl: 4 },
  { en: "Far", tr: "Uzak", ex: "How far is it?", type: "adj", lvl: 4 },
  { en: "Farm", tr: "Çiftlik", ex: "We visited a farm yesterday.", type: "noun", lvl: 4 },
  { en: "Farmer", tr: "Çiftçi", ex: "The farmer grows vegetables.", type: "noun", lvl: 4 },
  { en: "Fashion", tr: "Moda", ex: "Fashion changes every season.", type: "noun", lvl: 4 },
  { en: "Fast", tr: "Hızlı", ex: "Run as fast as you can.", type: "adj", lvl: 4 },
  { en: "Fat", tr: "Şişman", ex: "This food has too much fat.", type: "adj", lvl: 4 },
  { en: "Father", tr: "Baba", ex: "My father is very kind.", type: "noun", lvl: 4 },
  { en: "Fault", tr: "Hata", ex: "It's not my fault.", type: "noun", lvl: 4 },
  { en: "Favor", tr: "İyilik", ex: "Can you do me a favor?", type: "noun", lvl: 4 },
  { en: "Fear", tr: "Korku", ex: "I have no fear.", type: "noun", lvl: 4 },
  { en: "Feature", tr: "Özellik", ex: "This phone has many features.", type: "noun", lvl: 4 },
  { en: "Federal", tr: "Federal", ex: "This is a federal law.", type: "adj", lvl: 4 },
  { en: "Fee", tr: "Ücret", ex: "What is the fee?", type: "noun", lvl: 4 },
  { en: "Feed", tr: "Beslemek", ex: "Feed the cat, please.", type: "verb", lvl: 4 },
  { en: "Feel", tr: "Hissetmek", ex: "How do you feel?", type: "verb", lvl: 4 },
  { en: "Generate", tr: "Üretmek", ex: "The wind turbines generate electricity.", type: "verb", lvl: 4 },
  
  // Level 5 - Upper Advanced
  { en: "Habitat", tr: "Yaşam Alanı", ex: "The panda's natural habitat is the bamboo forest.", type: "noun", lvl: 5 },
  { en: "Habit", tr: "Alışkanlık", ex: "Smoking is a bad habit.", type: "noun", lvl: 5 },
  { en: "Hair", tr: "Saç", ex: "She has long hair.", type: "noun", lvl: 5 },
  { en: "Half", tr: "Yarım", ex: "I'll take half of it.", type: "noun", lvl: 5 },
  { en: "Hall", tr: "Salon", ex: "The wedding was in the hall.", type: "noun", lvl: 5 },
  { en: "Hand", tr: "El", ex: "Raise your hand.", type: "noun", lvl: 5 },
  { en: "Handle", tr: "İdare Etmek", ex: "Can you handle this situation?", type: "verb", lvl: 5 },
  { en: "Hang", tr: "Asmak", ex: "Hang the picture on the wall.", type: "verb", lvl: 5 },
  { en: "Happen", tr: "Olmak", ex: "What happened here?", type: "verb", lvl: 5 },
  { en: "Happy", tr: "Mutlu", ex: "I'm very happy today.", type: "adj", lvl: 5 },
  { en: "Hard", tr: "Sert", ex: "This is a hard problem.", type: "adj", lvl: 5 },
  { en: "Hardly", tr: "Neredeyse Hiç", ex: "I can hardly see it.", type: "adv", lvl: 5 },
  { en: "Harm", tr: "Zarar", ex: "No harm was done.", type: "noun", lvl: 5 },
  { en: "Hate", tr: "Nefret Etmek", ex: "I hate waiting.", type: "verb", lvl: 5 },
  { en: "Have", tr: "Sahip Olmak", ex: "I have a car.", type: "verb", lvl: 5 },
  { en: "He", tr: "O", ex: "He is my friend.", type: "pron", lvl: 5 },
  { en: "Head", tr: "Kafa", ex: "Use your head!", type: "noun", lvl: 5 },
  { en: "Health", tr: "Sağlık", ex: "Health is important.", type: "noun", lvl: 5 },
  { en: "Hear", tr: "Duymak", ex: "Can you hear me?", type: "verb", lvl: 5 },
  { en: "Heart", tr: "Kalp", ex: "My heart is beating fast.", type: "noun", lvl: 5 },
  { en: "Heat", tr: "Isı", ex: "The heat is unbearable.", type: "noun", lvl: 5 },
  { en: "Heavy", tr: "Ağır", ex: "This box is very heavy.", type: "adj", lvl: 5 },
  { en: "Height", tr: "Yükseklik", ex: "What is your height?", type: "noun", lvl: 5 },
  { en: "Help", tr: "Yardım", ex: "I need your help.", type: "noun", lvl: 5 },
  { en: "Hence", tr: "Bu Yüzden", ex: "Hence, we must act now.", type: "adv", lvl: 5 },
  { en: "Her", tr: "Onun", ex: "This is her book.", type: "pron", lvl: 5 },
  { en: "Here", tr: "Burada", ex: "Come here, please.", type: "adv", lvl: 5 },
  { en: "Hero", tr: "Kahraman", ex: "He is my hero.", type: "noun", lvl: 5 },
  { en: "Herself", tr: "Kendisi", ex: "She did it herself.", type: "pron", lvl: 5 },
  { en: "Illuminate", tr: "Aydınlatmak", ex: "A single candle illuminated the room.", type: "verb", lvl: 5 },
  
  // Level 6-10 - Keep existing words and add more
  { en: "Jeopardy", tr: "Tehlike", ex: "Thousands of jobs are in jeopardy.", type: "noun", lvl: 6 },
  { en: "Jewel", tr: "Mücevher", ex: "This jewel is very valuable.", type: "noun", lvl: 6 },
  { en: "Job", tr: "İş", ex: "I love my job.", type: "noun", lvl: 6 },
  { en: "Join", tr: "Katılmak", ex: "Join us for dinner.", type: "verb", lvl: 6 },
  { en: "Joint", tr: "Eklem", ex: "My knee joint hurts.", type: "noun", lvl: 6 },
  { en: "Joke", tr: "Şaka", ex: "That's a funny joke.", type: "noun", lvl: 6 },
  { en: "Journal", tr: "Dergi", ex: "I read a scientific journal.", type: "noun", lvl: 6 },
  { en: "Journey", tr: "Yolculuk", ex: "The journey was long.", type: "noun", lvl: 6 },
  { en: "Joy", tr: "Sevinç", ex: "She felt great joy.", type: "noun", lvl: 6 },
  { en: "Judge", tr: "Yargıç", ex: "The judge made a decision.", type: "noun", lvl: 6 },
  { en: "Judgment", tr: "Yargı", ex: "Use your best judgment.", type: "noun", lvl: 6 },
  { en: "Juice", tr: "Meyve Suyu", ex: "I want orange juice.", type: "noun", lvl: 6 },
  { en: "Jump", tr: "Zıplamak", ex: "Jump as high as you can.", type: "verb", lvl: 6 },
  { en: "Junction", tr: "Kavşak", ex: "Turn left at the junction.", type: "noun", lvl: 6 },
  { en: "June", tr: "Haziran", ex: "June is a summer month.", type: "noun", lvl: 6 },
  { en: "Jungle", tr: "Orman", ex: "The jungle is dangerous.", type: "noun", lvl: 6 },
  { en: "Junior", tr: "Genç", ex: "He is a junior employee.", type: "adj", lvl: 6 },
  { en: "Jury", tr: "Jüri", ex: "The jury reached a verdict.", type: "noun", lvl: 6 },
  { en: "Just", tr: "Sadece", ex: "I just arrived.", type: "adv", lvl: 6 },
  { en: "Justice", tr: "Adalet", ex: "We seek justice.", type: "noun", lvl: 6 },
  { en: "Justify", tr: "Haklı Çıkarmak", ex: "Can you justify this?", type: "verb", lvl: 6 },
  { en: "Kinetic", tr: "Hareketli", ex: "Kinetic energy is the energy of motion.", type: "adj", lvl: 6 },
  
  { en: "Lucid", tr: "Berrak/Açık", ex: "She gave a clear and lucid account of the accident.", type: "adj", lvl: 7 },
  { en: "Luck", tr: "Şans", ex: "Good luck!", type: "noun", lvl: 7 },
  { en: "Lucky", tr: "Şanslı", ex: "You are so lucky.", type: "adj", lvl: 7 },
  { en: "Lunch", tr: "Öğle Yemeği", ex: "Let's have lunch together.", type: "noun", lvl: 7 },
  { en: "Lung", tr: "Akciğer", ex: "Smoking damages your lungs.", type: "noun", lvl: 7 },
  { en: "Machine", tr: "Makine", ex: "This machine is broken.", type: "noun", lvl: 7 },
  { en: "Mad", tr: "Kızgın", ex: "Don't be mad at me.", type: "adj", lvl: 7 },
  { en: "Magazine", tr: "Dergi", ex: "I read a fashion magazine.", type: "noun", lvl: 7 },
  { en: "Magic", tr: "Büyü", ex: "It's like magic!", type: "noun", lvl: 7 },
  { en: "Mail", tr: "Posta", ex: "Check your mail.", type: "noun", lvl: 7 },
  { en: "Main", tr: "Ana", ex: "This is the main road.", type: "adj", lvl: 7 },
  { en: "Maintain", tr: "Sürdürmek", ex: "Maintain your car regularly.", type: "verb", lvl: 7 },
  { en: "Major", tr: "Büyük", ex: "This is a major problem.", type: "adj", lvl: 7 },
  { en: "Majority", tr: "Çoğunluk", ex: "The majority voted yes.", type: "noun", lvl: 7 },
  { en: "Make", tr: "Yapmak", ex: "Make a decision.", type: "verb", lvl: 7 },
  { en: "Male", tr: "Erkek", ex: "He is a male student.", type: "adj", lvl: 7 },
  { en: "Manifest", tr: "Göstermek/Belirmek", ex: "His illness manifested itself in severe headaches.", type: "verb", lvl: 7 },
  
  { en: "Nebulous", tr: "Bulanık/Belirsiz", ex: "She has a few nebulous ideas about what she might do.", type: "adj", lvl: 8 },
  { en: "Necessary", tr: "Gerekli", ex: "Is it necessary?", type: "adj", lvl: 8 },
  { en: "Neck", tr: "Boyun", ex: "My neck hurts.", type: "noun", lvl: 8 },
  { en: "Need", tr: "İhtiyaç", ex: "I need your help.", type: "verb", lvl: 8 },
  { en: "Negative", tr: "Negatif", ex: "Don't be so negative.", type: "adj", lvl: 8 },
  { en: "Neglect", tr: "İhmal Etmek", ex: "Don't neglect your duties.", type: "verb", lvl: 8 },
  { en: "Negotiate", tr: "Müzakere Etmek", ex: "Let's negotiate the price.", type: "verb", lvl: 8 },
  { en: "Neighbor", tr: "Komşu", ex: "My neighbor is very friendly.", type: "noun", lvl: 8 },
  { en: "Neither", tr: "Hiçbiri", ex: "Neither option is good.", type: "pron", lvl: 8 },
  { en: "Nerve", tr: "Sinir", ex: "You have a lot of nerve!", type: "noun", lvl: 8 },
  { en: "Nervous", tr: "Sinirli", ex: "I'm nervous about the exam.", type: "adj", lvl: 8 },
  { en: "Nest", tr: "Yuva", ex: "The bird built a nest.", type: "noun", lvl: 8 },
  { en: "Net", tr: "Ağ", ex: "Catch it with a net.", type: "noun", lvl: 8 },
  { en: "Network", tr: "Ağ", ex: "Join our network.", type: "noun", lvl: 8 },
  { en: "Never", tr: "Asla", ex: "I never give up.", type: "adv", lvl: 8 },
  { en: "Nevertheless", tr: "Yine de", ex: "Nevertheless, I'll try.", type: "adv", lvl: 8 },
  { en: "New", tr: "Yeni", ex: "This is a new car.", type: "adj", lvl: 8 },
  { en: "News", tr: "Haber", ex: "What's the news?", type: "noun", lvl: 8 },
  { en: "Newspaper", tr: "Gazete", ex: "I read the newspaper daily.", type: "noun", lvl: 8 },
  { en: "Next", tr: "Sonraki", ex: "See you next week.", type: "adj", lvl: 8 },
  { en: "Obscure", tr: "Anlaşılmaz/Gizlemek", ex: "The view was obscured by fog.", type: "verb", lvl: 8 },
  
  { en: "Paradigm", tr: "Örneklem/Model", ex: "This discovery caused a paradigm shift in science.", type: "noun", lvl: 9 },
  { en: "Paragraph", tr: "Paragraf", ex: "Read this paragraph.", type: "noun", lvl: 9 },
  { en: "Parallel", tr: "Paralel", ex: "These lines are parallel.", type: "adj", lvl: 9 },
  { en: "Parameter", tr: "Parametre", ex: "Set the parameters correctly.", type: "noun", lvl: 9 },
  { en: "Parent", tr: "Ebeveyn", ex: "My parents are kind.", type: "noun", lvl: 9 },
  { en: "Park", tr: "Park", ex: "Let's go to the park.", type: "noun", lvl: 9 },
  { en: "Part", tr: "Parça", ex: "This is part of the plan.", type: "noun", lvl: 9 },
  { en: "Participate", tr: "Katılmak", ex: "I want to participate.", type: "verb", lvl: 9 },
  { en: "Particular", tr: "Özel", ex: "This is a particular case.", type: "adj", lvl: 9 },
  { en: "Partner", tr: "Ortak", ex: "She is my business partner.", type: "noun", lvl: 9 },
  { en: "Party", tr: "Parti", ex: "The party was fun.", type: "noun", lvl: 9 },
  { en: "Pass", tr: "Geçmek", ex: "I passed the exam.", type: "verb", lvl: 9 },
  { en: "Passage", tr: "Geçit", ex: "Read this passage.", type: "noun", lvl: 9 },
  { en: "Passenger", tr: "Yolcu", ex: "All passengers boarded.", type: "noun", lvl: 9 },
  { en: "Passion", tr: "Tutku", ex: "I have a passion for music.", type: "noun", lvl: 9 },
  { en: "Past", tr: "Geçmiş", ex: "Learn from the past.", type: "noun", lvl: 9 },
  { en: "Path", tr: "Yol", ex: "Follow this path.", type: "noun", lvl: 9 },
  { en: "Patient", tr: "Hasta", ex: "The patient is recovering.", type: "noun", lvl: 9 },
  { en: "Pattern", tr: "Desen", ex: "I see a pattern here.", type: "noun", lvl: 9 },
  { en: "Quantum", tr: "Miktar/Kuantum", ex: "Quantum mechanics deals with physics at a small scale.", type: "noun", lvl: 9 },
  
  { en: "Resilient", tr: "Dirençli", ex: "Babies are often more resilient than you think.", type: "adj", lvl: 10 },
  { en: "Resist", tr: "Direnmek", ex: "I resist the temptation.", type: "verb", lvl: 10 },
  { en: "Resolve", tr: "Çözmek", ex: "Let's resolve this issue.", type: "verb", lvl: 10 },
  { en: "Resort", tr: "Tatil Yeri", ex: "We stayed at a resort.", type: "noun", lvl: 10 },
  { en: "Resource", tr: "Kaynak", ex: "Water is a valuable resource.", type: "noun", lvl: 10 },
  { en: "Respect", tr: "Saygı", ex: "Show respect to others.", type: "noun", lvl: 10 },
  { en: "Respond", tr: "Yanıtlamak", ex: "Please respond quickly.", type: "verb", lvl: 10 },
  { en: "Response", tr: "Yanıt", ex: "I got no response.", type: "noun", lvl: 10 },
  { en: "Responsibility", tr: "Sorumluluk", ex: "Take responsibility.", type: "noun", lvl: 10 },
  { en: "Rest", tr: "Dinlenmek", ex: "You need to rest.", type: "verb", lvl: 10 },
  { en: "Restaurant", tr: "Restoran", ex: "Let's eat at a restaurant.", type: "noun", lvl: 10 },
  { en: "Restore", tr: "Yenilemek", ex: "Restore the old building.", type: "verb", lvl: 10 },
  { en: "Restrict", tr: "Kısıtlamak", ex: "Don't restrict my freedom.", type: "verb", lvl: 10 },
  { en: "Result", tr: "Sonuç", ex: "What was the result?", type: "noun", lvl: 10 },
  { en: "Retain", tr: "Tutmak", ex: "Retain this information.", type: "verb", lvl: 10 },
  { en: "Retire", tr: "Emekli Olmak", ex: "He will retire soon.", type: "verb", lvl: 10 },
  { en: "Return", tr: "Dönmek", ex: "When will you return?", type: "verb", lvl: 10 },
  { en: "Reveal", tr: "Açığa Çıkarmak", ex: "Reveal the truth.", type: "verb", lvl: 10 },
  { en: "Revenue", tr: "Gelir", ex: "Company revenue increased.", type: "noun", lvl: 10 },
  { en: "Review", tr: "İncelemek", ex: "Review your work.", type: "verb", lvl: 10 },
  { en: "Revolution", tr: "Devrim", ex: "The industrial revolution changed everything.", type: "noun", lvl: 10 },
  { en: "Reward", tr: "Ödül", ex: "You deserve a reward.", type: "noun", lvl: 10 },
  { en: "Rhythm", tr: "Ritim", ex: "Feel the rhythm.", type: "noun", lvl: 10 },
  { en: "Rich", tr: "Zengin", ex: "He is very rich.", type: "adj", lvl: 10 },
  { en: "Ride", tr: "Binmek", ex: "I ride my bike to work.", type: "verb", lvl: 10 },
  { en: "Right", tr: "Doğru", ex: "You are right.", type: "adj", lvl: 10 },
  { en: "Ring", tr: "Yüzük", ex: "She wears a gold ring.", type: "noun", lvl: 10 },
  { en: "Rise", tr: "Yükselmek", ex: "The sun will rise soon.", type: "verb", lvl: 10 },
  { en: "Risk", tr: "Risk", ex: "Don't take unnecessary risks.", type: "noun", lvl: 10 },
  { en: "River", tr: "Nehir", ex: "The river flows to the sea.", type: "noun", lvl: 10 },
  { en: "Road", tr: "Yol", ex: "Follow this road.", type: "noun", lvl: 10 },
  { en: "Zenith", tr: "Zirve", ex: "The sun was at its zenith.", type: "noun", lvl: 10 },
];

// Convert all raw words to Word format (English-Turkish pair)
// This maintains backward compatibility while supporting new structure
const allWordsEnTr: Word[] = rawWords.map((w, index) => ({
  id: `${w.en.toLowerCase()}-${w.lvl}-${index}`,
  sourceText: w.en,
  targetText: w.tr,
  sourceLanguage: 'en',
  targetLanguage: 'tr',
  example: w.ex,
  type: w.type,
  level: w.lvl,
  // Legacy fields for backward compatibility
  english: w.en,
  turkish: w.tr,
}));

// Word data structure: words[sourceLanguage][targetLanguage]
// Currently only English-Turkish is populated, others can be added later
const wordsByLanguagePair: Record<string, Record<string, Word[]>> = {
  en: {
    tr: allWordsEnTr,
    // Future: Add more language pairs here
    // de: allWordsEnDe,
    // fr: allWordsEnFr,
    // it: allWordsEnIt,
  },
  // Future: Add reverse pairs (Turkish-English, etc.)
  // tr: {
  //   en: allWordsTrEn,
  // },
};

// Get words for a specific language pair
// If direct pair doesn't exist, try reverse pair (swap source and target)
const getWordsForPair = (sourceLanguage: string, targetLanguage: string): Word[] => {
  // Try direct pair first
  const directWords = wordsByLanguagePair[sourceLanguage]?.[targetLanguage];
  if (directWords && directWords.length > 0) {
    return directWords;
  }
  
  // Try reverse pair (e.g., if tr->en doesn't exist, use en->tr and swap)
  const reverseWords = wordsByLanguagePair[targetLanguage]?.[sourceLanguage];
  if (reverseWords && reverseWords.length > 0) {
    console.log(`[DATA] Using reverse pair: ${targetLanguage}->${sourceLanguage} for ${sourceLanguage}->${targetLanguage}`);
    // Swap source and target text
    return reverseWords.map(word => ({
      ...word,
      id: `${word.id}-reversed`,
      sourceText: word.targetText || word.turkish || word.english || '',
      targetText: word.sourceText || word.english || word.turkish || '',
      sourceLanguage: sourceLanguage,
      targetLanguage: targetLanguage,
      // Keep legacy fields for backward compatibility
      english: word.targetText || word.turkish || word.english,
      turkish: word.sourceText || word.english || word.turkish,
    }));
  }
  
  // No words found for either direction
  return [];
};

// Cache for pre-sorted words by language pair to avoid repeated sorting
const sortedWordsCache: Record<string, Word[]> = {};

// Get cache key for language pair
const getCacheKey = (sourceLang: string, targetLang: string) => `${sourceLang}-${targetLang}`;

// Get a pool of words for a specific language pair, excluding completed ones
export const getWordPool = (
  sourceLanguage: string = 'en',
  targetLanguage: string = 'tr',
  excludeWordIds: Set<string> = new Set(),
  poolSize: number = 100
): Word[] => {
  // Get words for the language pair
  const pairWords = getWordsForPair(sourceLanguage, targetLanguage);
  
  // If no words for this pair, return empty array
  if (pairWords.length === 0) {
    console.warn(`No words available for ${sourceLanguage} → ${targetLanguage}`);
    return [];
  }
  
  // Filter out completed words (fast operation)
  const availableWords = excludeWordIds.size > 0 
    ? pairWords.filter(word => !excludeWordIds.has(word.id))
    : pairWords;
  
  if (availableWords.length === 0) {
    return [];
  }
  
  // Use cached sorted words if available, otherwise sort and cache
  const cacheKey = getCacheKey(sourceLanguage, targetLanguage);
  let sortedWords = sortedWordsCache[cacheKey];
  
  if (!sortedWords || sortedWords.length !== pairWords.length) {
    // Sort by level descending (harder first: 10 -> 1)
    // Don't shuffle here - shuffle only the final pool for variety
    sortedWords = [...pairWords].sort((a, b) => b.level - a.level);
    sortedWordsCache[cacheKey] = sortedWords;
  }
  
  // Filter sorted words by excludeWordIds if needed
  const filteredSorted = excludeWordIds.size > 0
    ? sortedWords.filter(word => !excludeWordIds.has(word.id))
    : sortedWords;
  
  // Shuffle first poolSize words for variety (only shuffle what we need)
  const pool = filteredSorted.slice(0, Math.min(poolSize * 2, filteredSorted.length));
  for (let i = pool.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [pool[i], pool[j]] = [pool[j], pool[i]];
  }
  
  // Take poolSize words
  return pool.slice(0, Math.min(poolSize, pool.length));
};

// Get all available words for a language pair, sorted by level descending
export const getAllAvailableWords = (
  sourceLanguage: string = 'en',
  targetLanguage: string = 'tr',
  excludeWordIds: Set<string> = new Set()
): Word[] => {
  const pairWords = getWordsForPair(sourceLanguage, targetLanguage);
  const available = pairWords.filter(word => !excludeWordIds.has(word.id));
  
  // Sort by level descending (harder first)
  return available.sort((a, b) => {
    if (b.level !== a.level) {
      return b.level - a.level;
    }
    return Math.random() - 0.5;
  });
};

// Legacy function for backward compatibility (if needed)
export const getWordsByLevel = (
  level: number,
  sourceLanguage: string = 'en',
  targetLanguage: string = 'tr'
): Word[] => {
  const pairWords = getWordsForPair(sourceLanguage, targetLanguage);
  return pairWords
    .filter(w => w.level === level)
    .map((w, index) => ({
      ...w,
      id: `${(w.sourceText || w.english || '').toLowerCase()}-${w.level}-${index}`
    }));
};

export const LEVELS = Array.from({ length: 10 }, (_, i) => i + 1);