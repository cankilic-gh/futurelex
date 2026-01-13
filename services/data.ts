import { Word } from '../types';

// Multi-language word database
// Each word has translations in: English (en), Turkish (tr), German (de), French (fr), Italian (it), Spanish (es)

const rawWords = [
  // Level 1 - Basic Words
  { en: "Ability", tr: "Yetenek", de: "Fähigkeit", fr: "Capacité", it: "Capacità", es: "Capacidad", ex: "He has the ability to learn quickly.", type: "noun", lvl: 1 },
  { en: "Access", tr: "Erişim", de: "Zugang", fr: "Accès", it: "Accesso", es: "Acceso", ex: "Do you have access to the internet?", type: "noun", lvl: 1 },
  { en: "Action", tr: "Aksiyon", de: "Aktion", fr: "Action", it: "Azione", es: "Acción", ex: "We need to take action immediately.", type: "noun", lvl: 1 },
  { en: "Active", tr: "Aktif", de: "Aktiv", fr: "Actif", it: "Attivo", es: "Activo", ex: "She is very active in sports.", type: "adj", lvl: 1 },
  { en: "Actual", tr: "Gerçek", de: "Tatsächlich", fr: "Réel", it: "Reale", es: "Real", ex: "What is the actual cost?", type: "adj", lvl: 1 },
  { en: "Address", tr: "Adres", de: "Adresse", fr: "Adresse", it: "Indirizzo", es: "Dirección", ex: "What is your address?", type: "noun", lvl: 1 },
  { en: "Admit", tr: "Kabul Etmek", de: "Zugeben", fr: "Admettre", it: "Ammettere", es: "Admitir", ex: "I admit I was wrong.", type: "verb", lvl: 1 },
  { en: "Adult", tr: "Yetişkin", de: "Erwachsener", fr: "Adulte", it: "Adulto", es: "Adulto", ex: "This movie is for adults only.", type: "noun", lvl: 1 },
  { en: "Advance", tr: "İlerlemek", de: "Fortschreiten", fr: "Avancer", it: "Avanzare", es: "Avanzar", ex: "Technology continues to advance.", type: "verb", lvl: 1 },
  { en: "Advice", tr: "Tavsiye", de: "Rat", fr: "Conseil", it: "Consiglio", es: "Consejo", ex: "Can you give me some advice?", type: "noun", lvl: 1 },
  { en: "Affect", tr: "Etkilemek", de: "Beeinflussen", fr: "Affecter", it: "Influenzare", es: "Afectar", ex: "Weather can affect your mood.", type: "verb", lvl: 1 },
  { en: "Afford", tr: "Karşılayabilmek", de: "Leisten", fr: "Se permettre", it: "Permettersi", es: "Permitirse", ex: "I can't afford a new car.", type: "verb", lvl: 1 },
  { en: "Afraid", tr: "Korkmuş", de: "Ängstlich", fr: "Effrayé", it: "Spaventato", es: "Asustado", ex: "Don't be afraid of the dark.", type: "adj", lvl: 1 },
  { en: "Again", tr: "Tekrar", de: "Wieder", fr: "Encore", it: "Ancora", es: "Otra vez", ex: "Please say that again.", type: "adv", lvl: 1 },
  { en: "Against", tr: "Karşı", de: "Gegen", fr: "Contre", it: "Contro", es: "Contra", ex: "I'm against this idea.", type: "prep", lvl: 1 },
  { en: "Age", tr: "Yaş", de: "Alter", fr: "Âge", it: "Età", es: "Edad", ex: "What is your age?", type: "noun", lvl: 1 },
  { en: "Agency", tr: "Ajans", de: "Agentur", fr: "Agence", it: "Agenzia", es: "Agencia", ex: "She works for a travel agency.", type: "noun", lvl: 1 },
  { en: "Agent", tr: "Ajan", de: "Agent", fr: "Agent", it: "Agente", es: "Agente", ex: "The real estate agent showed us the house.", type: "noun", lvl: 1 },
  { en: "Agree", tr: "Katılmak", de: "Zustimmen", fr: "Être d'accord", it: "Essere d'accordo", es: "Estar de acuerdo", ex: "I agree with you completely.", type: "verb", lvl: 1 },
  { en: "Ahead", tr: "İleri", de: "Voraus", fr: "Devant", it: "Avanti", es: "Adelante", ex: "Look ahead and you'll see the sign.", type: "adv", lvl: 1 },
  { en: "Aid", tr: "Yardım", de: "Hilfe", fr: "Aide", it: "Aiuto", es: "Ayuda", ex: "Foreign aid helps many countries.", type: "noun", lvl: 1 },
  { en: "Aim", tr: "Hedef", de: "Ziel", fr: "But", it: "Obiettivo", es: "Objetivo", ex: "What is your aim in life?", type: "noun", lvl: 1 },
  { en: "Air", tr: "Hava", de: "Luft", fr: "Air", it: "Aria", es: "Aire", ex: "The air is fresh in the mountains.", type: "noun", lvl: 1 },
  { en: "Airport", tr: "Havalimanı", de: "Flughafen", fr: "Aéroport", it: "Aeroporto", es: "Aeropuerto", ex: "We arrived at the airport early.", type: "noun", lvl: 1 },
  { en: "Alarm", tr: "Alarm", de: "Alarm", fr: "Alarme", it: "Allarme", es: "Alarma", ex: "Set your alarm for 7 AM.", type: "noun", lvl: 1 },
  { en: "Album", tr: "Albüm", de: "Album", fr: "Album", it: "Album", es: "Álbum", ex: "This is my favorite music album.", type: "noun", lvl: 1 },
  { en: "Alcohol", tr: "Alkol", de: "Alkohol", fr: "Alcool", it: "Alcol", es: "Alcohol", ex: "Don't drink alcohol and drive.", type: "noun", lvl: 1 },
  { en: "Alert", tr: "Uyarı", de: "Wachsam", fr: "Alerte", it: "Attento", es: "Alerta", ex: "Stay alert while driving.", type: "adj", lvl: 1 },
  { en: "Alive", tr: "Canlı", de: "Lebendig", fr: "Vivant", it: "Vivo", es: "Vivo", ex: "The patient is still alive.", type: "adj", lvl: 1 },
  { en: "All", tr: "Hepsi", de: "Alle", fr: "Tout", it: "Tutto", es: "Todo", ex: "All students passed the exam.", type: "adj", lvl: 1 },

  // Level 2 - Intermediate Words
  { en: "Beneath", tr: "Altında", de: "Unter", fr: "Sous", it: "Sotto", es: "Debajo", ex: "The boat sank beneath the waves.", type: "prep", lvl: 2 },
  { en: "Benefit", tr: "Fayda", de: "Vorteil", fr: "Avantage", it: "Beneficio", es: "Beneficio", ex: "Exercise has many health benefits.", type: "noun", lvl: 2 },
  { en: "Beside", tr: "Yanında", de: "Neben", fr: "À côté de", it: "Accanto a", es: "Al lado de", ex: "Sit beside me, please.", type: "prep", lvl: 2 },
  { en: "Besides", tr: "Ayrıca", de: "Außerdem", fr: "En plus", it: "Inoltre", es: "Además", ex: "Besides English, I speak French.", type: "prep", lvl: 2 },
  { en: "Bet", tr: "Bahis", de: "Wette", fr: "Pari", it: "Scommessa", es: "Apuesta", ex: "I bet you can't do it.", type: "verb", lvl: 2 },
  { en: "Between", tr: "Arasında", de: "Zwischen", fr: "Entre", it: "Tra", es: "Entre", ex: "Choose between these two options.", type: "prep", lvl: 2 },
  { en: "Beyond", tr: "Ötesinde", de: "Jenseits", fr: "Au-delà", it: "Oltre", es: "Más allá", ex: "The problem is beyond my control.", type: "prep", lvl: 2 },
  { en: "Bicycle", tr: "Bisiklet", de: "Fahrrad", fr: "Vélo", it: "Bicicletta", es: "Bicicleta", ex: "I ride my bicycle to work.", type: "noun", lvl: 2 },
  { en: "Bid", tr: "Teklif", de: "Gebot", fr: "Offre", it: "Offerta", es: "Oferta", ex: "I bid $100 for the painting.", type: "verb", lvl: 2 },
  { en: "Big", tr: "Büyük", de: "Groß", fr: "Grand", it: "Grande", es: "Grande", ex: "This is a big opportunity.", type: "adj", lvl: 2 },
  { en: "Bill", tr: "Fatura", de: "Rechnung", fr: "Facture", it: "Conto", es: "Cuenta", ex: "Can I have the bill, please?", type: "noun", lvl: 2 },
  { en: "Billion", tr: "Milyar", de: "Milliarde", fr: "Milliard", it: "Miliardo", es: "Mil millones", ex: "The company is worth billions.", type: "noun", lvl: 2 },
  { en: "Bind", tr: "Bağlamak", de: "Binden", fr: "Lier", it: "Legare", es: "Atar", ex: "Bind the books together.", type: "verb", lvl: 2 },
  { en: "Biological", tr: "Biyolojik", de: "Biologisch", fr: "Biologique", it: "Biologico", es: "Biológico", ex: "This is a biological process.", type: "adj", lvl: 2 },
  { en: "Bird", tr: "Kuş", de: "Vogel", fr: "Oiseau", it: "Uccello", es: "Pájaro", ex: "A bird is singing outside.", type: "noun", lvl: 2 },
  { en: "Birth", tr: "Doğum", de: "Geburt", fr: "Naissance", it: "Nascita", es: "Nacimiento", ex: "The birth of a child is a miracle.", type: "noun", lvl: 2 },
  { en: "Birthday", tr: "Doğum Günü", de: "Geburtstag", fr: "Anniversaire", it: "Compleanno", es: "Cumpleaños", ex: "Happy birthday to you!", type: "noun", lvl: 2 },
  { en: "Bit", tr: "Biraz", de: "Bisschen", fr: "Un peu", it: "Un po'", es: "Un poco", ex: "Wait a bit longer.", type: "noun", lvl: 2 },
  { en: "Bite", tr: "Isırmak", de: "Beißen", fr: "Mordre", it: "Mordere", es: "Morder", ex: "Don't bite your nails.", type: "verb", lvl: 2 },
  { en: "Bitter", tr: "Acı", de: "Bitter", fr: "Amer", it: "Amaro", es: "Amargo", ex: "The coffee tastes bitter.", type: "adj", lvl: 2 },
  { en: "Black", tr: "Siyah", de: "Schwarz", fr: "Noir", it: "Nero", es: "Negro", ex: "She wore a black dress.", type: "adj", lvl: 2 },
  { en: "Blade", tr: "Bıçak", de: "Klinge", fr: "Lame", it: "Lama", es: "Hoja", ex: "The blade is very sharp.", type: "noun", lvl: 2 },
  { en: "Blame", tr: "Suçlamak", de: "Beschuldigen", fr: "Blâmer", it: "Incolpare", es: "Culpar", ex: "Don't blame me for your mistakes.", type: "verb", lvl: 2 },
  { en: "Blank", tr: "Boş", de: "Leer", fr: "Vide", it: "Vuoto", es: "En blanco", ex: "Fill in the blank spaces.", type: "adj", lvl: 2 },
  { en: "Blanket", tr: "Battaniye", de: "Decke", fr: "Couverture", it: "Coperta", es: "Manta", ex: "Cover yourself with a blanket.", type: "noun", lvl: 2 },
  { en: "Blind", tr: "Kör", de: "Blind", fr: "Aveugle", it: "Cieco", es: "Ciego", ex: "He is blind in one eye.", type: "adj", lvl: 2 },
  { en: "Block", tr: "Blok", de: "Block", fr: "Bloc", it: "Blocco", es: "Bloque", ex: "Turn left at the next block.", type: "noun", lvl: 2 },
  { en: "Blood", tr: "Kan", de: "Blut", fr: "Sang", it: "Sangue", es: "Sangre", ex: "Blood is red.", type: "noun", lvl: 2 },
  { en: "Blow", tr: "Üflemek", de: "Blasen", fr: "Souffler", it: "Soffiare", es: "Soplar", ex: "Blow out the candles.", type: "verb", lvl: 2 },
  { en: "Blue", tr: "Mavi", de: "Blau", fr: "Bleu", it: "Blu", es: "Azul", ex: "The sky is blue today.", type: "adj", lvl: 2 },
  { en: "Board", tr: "Tahta", de: "Brett", fr: "Tableau", it: "Tavola", es: "Tabla", ex: "Write on the board.", type: "noun", lvl: 2 },
  { en: "Boat", tr: "Tekne", de: "Boot", fr: "Bateau", it: "Barca", es: "Barco", ex: "We sailed in a small boat.", type: "noun", lvl: 2 },
  { en: "Body", tr: "Vücut", de: "Körper", fr: "Corps", it: "Corpo", es: "Cuerpo", ex: "Take care of your body.", type: "noun", lvl: 2 },
  { en: "Capacity", tr: "Kapasite", de: "Kapazität", fr: "Capacité", it: "Capacità", es: "Capacidad", ex: "The stadium has a seating capacity of 50,000.", type: "noun", lvl: 2 },

  // Level 3 - Upper Intermediate
  { en: "Debate", tr: "Tartışma", de: "Debatte", fr: "Débat", it: "Dibattito", es: "Debate", ex: "There has been much debate on this issue.", type: "noun", lvl: 3 },
  { en: "Debt", tr: "Borç", de: "Schulden", fr: "Dette", it: "Debito", es: "Deuda", ex: "I need to pay off my debt.", type: "noun", lvl: 3 },
  { en: "Decade", tr: "On Yıl", de: "Jahrzehnt", fr: "Décennie", it: "Decennio", es: "Década", ex: "A decade has passed.", type: "noun", lvl: 3 },
  { en: "Decide", tr: "Karar Vermek", de: "Entscheiden", fr: "Décider", it: "Decidere", es: "Decidir", ex: "You must decide now.", type: "verb", lvl: 3 },
  { en: "Decision", tr: "Karar", de: "Entscheidung", fr: "Décision", it: "Decisione", es: "Decisión", ex: "This is an important decision.", type: "noun", lvl: 3 },
  { en: "Decline", tr: "Reddetmek", de: "Ablehnen", fr: "Refuser", it: "Rifiutare", es: "Rechazar", ex: "I decline your offer.", type: "verb", lvl: 3 },
  { en: "Decrease", tr: "Azaltmak", de: "Verringern", fr: "Diminuer", it: "Diminuire", es: "Disminuir", ex: "Sales decreased this month.", type: "verb", lvl: 3 },
  { en: "Deep", tr: "Derin", de: "Tief", fr: "Profond", it: "Profondo", es: "Profundo", ex: "The ocean is very deep.", type: "adj", lvl: 3 },
  { en: "Defeat", tr: "Yenmek", de: "Besiegen", fr: "Vaincre", it: "Sconfiggere", es: "Derrotar", ex: "We will defeat our enemies.", type: "verb", lvl: 3 },
  { en: "Defend", tr: "Savunmak", de: "Verteidigen", fr: "Défendre", it: "Difendere", es: "Defender", ex: "I will defend my position.", type: "verb", lvl: 3 },
  { en: "Define", tr: "Tanımlamak", de: "Definieren", fr: "Définir", it: "Definire", es: "Definir", ex: "Can you define this word?", type: "verb", lvl: 3 },
  { en: "Definite", tr: "Kesin", de: "Bestimmt", fr: "Défini", it: "Definito", es: "Definitivo", ex: "There is no definite answer.", type: "adj", lvl: 3 },
  { en: "Degree", tr: "Derece", de: "Grad", fr: "Degré", it: "Grado", es: "Grado", ex: "What degree did you earn?", type: "noun", lvl: 3 },
  { en: "Delay", tr: "Gecikme", de: "Verzögerung", fr: "Retard", it: "Ritardo", es: "Retraso", ex: "There was a delay in the flight.", type: "noun", lvl: 3 },
  { en: "Deliver", tr: "Teslim Etmek", de: "Liefern", fr: "Livrer", it: "Consegnare", es: "Entregar", ex: "The package will be delivered tomorrow.", type: "verb", lvl: 3 },
  { en: "Demand", tr: "Talep", de: "Nachfrage", fr: "Demande", it: "Domanda", es: "Demanda", ex: "There is high demand for this product.", type: "noun", lvl: 3 },
  { en: "Democracy", tr: "Demokrasi", de: "Demokratie", fr: "Démocratie", it: "Democrazia", es: "Democracia", ex: "We live in a democracy.", type: "noun", lvl: 3 },
  { en: "Demonstrate", tr: "Göstermek", de: "Demonstrieren", fr: "Démontrer", it: "Dimostrare", es: "Demostrar", ex: "Let me demonstrate how it works.", type: "verb", lvl: 3 },
  { en: "Dense", tr: "Yoğun", de: "Dicht", fr: "Dense", it: "Denso", es: "Denso", ex: "The forest is very dense.", type: "adj", lvl: 3 },
  { en: "Deny", tr: "İnkar Etmek", de: "Leugnen", fr: "Nier", it: "Negare", es: "Negar", ex: "I cannot deny the truth.", type: "verb", lvl: 3 },
  { en: "Department", tr: "Bölüm", de: "Abteilung", fr: "Département", it: "Dipartimento", es: "Departamento", ex: "Which department do you work in?", type: "noun", lvl: 3 },
  { en: "Depend", tr: "Bağımlı Olmak", de: "Abhängen", fr: "Dépendre", it: "Dipendere", es: "Depender", ex: "Children depend on their parents.", type: "verb", lvl: 3 },
  { en: "Deposit", tr: "Yatırmak", de: "Einzahlen", fr: "Déposer", it: "Depositare", es: "Depositar", ex: "I need to deposit money in the bank.", type: "verb", lvl: 3 },
  { en: "Depress", tr: "Depresyona Sokmak", de: "Deprimieren", fr: "Déprimer", it: "Deprimere", es: "Deprimir", ex: "Bad news can depress people.", type: "verb", lvl: 3 },
  { en: "Depth", tr: "Derinlik", de: "Tiefe", fr: "Profondeur", it: "Profondità", es: "Profundidad", ex: "Measure the depth of the pool.", type: "noun", lvl: 3 },
  { en: "Describe", tr: "Tanımlamak", de: "Beschreiben", fr: "Décrire", it: "Descrivere", es: "Describir", ex: "Can you describe what happened?", type: "verb", lvl: 3 },
  { en: "Desert", tr: "Çöl", de: "Wüste", fr: "Désert", it: "Deserto", es: "Desierto", ex: "The desert is very hot.", type: "noun", lvl: 3 },
  { en: "Design", tr: "Tasarım", de: "Design", fr: "Design", it: "Design", es: "Diseño", ex: "I love the design of this building.", type: "noun", lvl: 3 },
  { en: "Desire", tr: "Arzu", de: "Wunsch", fr: "Désir", it: "Desiderio", es: "Deseo", ex: "I have a strong desire to succeed.", type: "noun", lvl: 3 },
  { en: "Desk", tr: "Masa", de: "Schreibtisch", fr: "Bureau", it: "Scrivania", es: "Escritorio", ex: "Sit at your desk.", type: "noun", lvl: 3 },
  { en: "Efficient", tr: "Verimli", de: "Effizient", fr: "Efficace", it: "Efficiente", es: "Eficiente", ex: "We need an efficient way to work.", type: "adj", lvl: 3 },

  // Level 4 - Advanced
  { en: "Fabric", tr: "Kumaş", de: "Stoff", fr: "Tissu", it: "Tessuto", es: "Tela", ex: "This fabric is very soft.", type: "noun", lvl: 4 },
  { en: "Face", tr: "Yüz", de: "Gesicht", fr: "Visage", it: "Viso", es: "Cara", ex: "She has a beautiful face.", type: "noun", lvl: 4 },
  { en: "Fact", tr: "Gerçek", de: "Tatsache", fr: "Fait", it: "Fatto", es: "Hecho", ex: "That's a fact, not an opinion.", type: "noun", lvl: 4 },
  { en: "Factor", tr: "Faktör", de: "Faktor", fr: "Facteur", it: "Fattore", es: "Factor", ex: "Price is an important factor.", type: "noun", lvl: 4 },
  { en: "Factory", tr: "Fabrika", de: "Fabrik", fr: "Usine", it: "Fabbrica", es: "Fábrica", ex: "He works in a factory.", type: "noun", lvl: 4 },
  { en: "Fail", tr: "Başarısız Olmak", de: "Scheitern", fr: "Échouer", it: "Fallire", es: "Fracasar", ex: "Don't fail this test.", type: "verb", lvl: 4 },
  { en: "Failure", tr: "Başarısızlık", de: "Misserfolg", fr: "Échec", it: "Fallimento", es: "Fracaso", ex: "Failure is part of learning.", type: "noun", lvl: 4 },
  { en: "Fair", tr: "Adil", de: "Fair", fr: "Juste", it: "Giusto", es: "Justo", ex: "That's not fair!", type: "adj", lvl: 4 },
  { en: "Faith", tr: "İnanç", de: "Glaube", fr: "Foi", it: "Fede", es: "Fe", ex: "I have faith in you.", type: "noun", lvl: 4 },
  { en: "Fall", tr: "Düşmek", de: "Fallen", fr: "Tomber", it: "Cadere", es: "Caer", ex: "Don't fall down!", type: "verb", lvl: 4 },
  { en: "False", tr: "Yanlış", de: "Falsch", fr: "Faux", it: "Falso", es: "Falso", ex: "That statement is false.", type: "adj", lvl: 4 },
  { en: "Familiar", tr: "Tanıdık", de: "Vertraut", fr: "Familier", it: "Familiare", es: "Familiar", ex: "This place looks familiar.", type: "adj", lvl: 4 },
  { en: "Family", tr: "Aile", de: "Familie", fr: "Famille", it: "Famiglia", es: "Familia", ex: "I love my family.", type: "noun", lvl: 4 },
  { en: "Famous", tr: "Ünlü", de: "Berühmt", fr: "Célèbre", it: "Famoso", es: "Famoso", ex: "She is a famous actress.", type: "adj", lvl: 4 },
  { en: "Fan", tr: "Hayran", de: "Fan", fr: "Fan", it: "Fan", es: "Fan", ex: "I'm a big fan of this band.", type: "noun", lvl: 4 },
  { en: "Far", tr: "Uzak", de: "Weit", fr: "Loin", it: "Lontano", es: "Lejos", ex: "How far is it?", type: "adj", lvl: 4 },
  { en: "Farm", tr: "Çiftlik", de: "Bauernhof", fr: "Ferme", it: "Fattoria", es: "Granja", ex: "We visited a farm yesterday.", type: "noun", lvl: 4 },
  { en: "Farmer", tr: "Çiftçi", de: "Bauer", fr: "Fermier", it: "Agricoltore", es: "Granjero", ex: "The farmer grows vegetables.", type: "noun", lvl: 4 },
  { en: "Fashion", tr: "Moda", de: "Mode", fr: "Mode", it: "Moda", es: "Moda", ex: "Fashion changes every season.", type: "noun", lvl: 4 },
  { en: "Fast", tr: "Hızlı", de: "Schnell", fr: "Rapide", it: "Veloce", es: "Rápido", ex: "Run as fast as you can.", type: "adj", lvl: 4 },
  { en: "Fat", tr: "Şişman", de: "Dick", fr: "Gros", it: "Grasso", es: "Gordo", ex: "This food has too much fat.", type: "adj", lvl: 4 },
  { en: "Father", tr: "Baba", de: "Vater", fr: "Père", it: "Padre", es: "Padre", ex: "My father is very kind.", type: "noun", lvl: 4 },
  { en: "Fault", tr: "Hata", de: "Fehler", fr: "Faute", it: "Colpa", es: "Culpa", ex: "It's not my fault.", type: "noun", lvl: 4 },
  { en: "Favor", tr: "İyilik", de: "Gefallen", fr: "Faveur", it: "Favore", es: "Favor", ex: "Can you do me a favor?", type: "noun", lvl: 4 },
  { en: "Fear", tr: "Korku", de: "Angst", fr: "Peur", it: "Paura", es: "Miedo", ex: "I have no fear.", type: "noun", lvl: 4 },
  { en: "Feature", tr: "Özellik", de: "Merkmal", fr: "Caractéristique", it: "Caratteristica", es: "Característica", ex: "This phone has many features.", type: "noun", lvl: 4 },
  { en: "Federal", tr: "Federal", de: "Bundes-", fr: "Fédéral", it: "Federale", es: "Federal", ex: "This is a federal law.", type: "adj", lvl: 4 },
  { en: "Fee", tr: "Ücret", de: "Gebühr", fr: "Frais", it: "Tassa", es: "Tarifa", ex: "What is the fee?", type: "noun", lvl: 4 },
  { en: "Feed", tr: "Beslemek", de: "Füttern", fr: "Nourrir", it: "Nutrire", es: "Alimentar", ex: "Feed the cat, please.", type: "verb", lvl: 4 },
  { en: "Feel", tr: "Hissetmek", de: "Fühlen", fr: "Sentir", it: "Sentire", es: "Sentir", ex: "How do you feel?", type: "verb", lvl: 4 },
  { en: "Generate", tr: "Üretmek", de: "Erzeugen", fr: "Générer", it: "Generare", es: "Generar", ex: "The wind turbines generate electricity.", type: "verb", lvl: 4 },

  // Level 5 - Upper Advanced
  { en: "Habitat", tr: "Yaşam Alanı", de: "Lebensraum", fr: "Habitat", it: "Habitat", es: "Hábitat", ex: "The panda's natural habitat is the bamboo forest.", type: "noun", lvl: 5 },
  { en: "Habit", tr: "Alışkanlık", de: "Gewohnheit", fr: "Habitude", it: "Abitudine", es: "Hábito", ex: "Smoking is a bad habit.", type: "noun", lvl: 5 },
  { en: "Hair", tr: "Saç", de: "Haar", fr: "Cheveux", it: "Capelli", es: "Cabello", ex: "She has long hair.", type: "noun", lvl: 5 },
  { en: "Half", tr: "Yarım", de: "Halb", fr: "Moitié", it: "Metà", es: "Mitad", ex: "I'll take half of it.", type: "noun", lvl: 5 },
  { en: "Hall", tr: "Salon", de: "Halle", fr: "Salle", it: "Sala", es: "Salón", ex: "The wedding was in the hall.", type: "noun", lvl: 5 },
  { en: "Hand", tr: "El", de: "Hand", fr: "Main", it: "Mano", es: "Mano", ex: "Raise your hand.", type: "noun", lvl: 5 },
  { en: "Handle", tr: "İdare Etmek", de: "Handhaben", fr: "Gérer", it: "Gestire", es: "Manejar", ex: "Can you handle this situation?", type: "verb", lvl: 5 },
  { en: "Hang", tr: "Asmak", de: "Hängen", fr: "Accrocher", it: "Appendere", es: "Colgar", ex: "Hang the picture on the wall.", type: "verb", lvl: 5 },
  { en: "Happen", tr: "Olmak", de: "Geschehen", fr: "Se passer", it: "Succedere", es: "Suceder", ex: "What happened here?", type: "verb", lvl: 5 },
  { en: "Happy", tr: "Mutlu", de: "Glücklich", fr: "Heureux", it: "Felice", es: "Feliz", ex: "I'm very happy today.", type: "adj", lvl: 5 },
  { en: "Hard", tr: "Sert", de: "Hart", fr: "Dur", it: "Duro", es: "Duro", ex: "This is a hard problem.", type: "adj", lvl: 5 },
  { en: "Hardly", tr: "Neredeyse Hiç", de: "Kaum", fr: "À peine", it: "A malapena", es: "Apenas", ex: "I can hardly see it.", type: "adv", lvl: 5 },
  { en: "Harm", tr: "Zarar", de: "Schaden", fr: "Mal", it: "Danno", es: "Daño", ex: "No harm was done.", type: "noun", lvl: 5 },
  { en: "Hate", tr: "Nefret Etmek", de: "Hassen", fr: "Détester", it: "Odiare", es: "Odiar", ex: "I hate waiting.", type: "verb", lvl: 5 },
  { en: "Have", tr: "Sahip Olmak", de: "Haben", fr: "Avoir", it: "Avere", es: "Tener", ex: "I have a car.", type: "verb", lvl: 5 },
  { en: "Head", tr: "Kafa", de: "Kopf", fr: "Tête", it: "Testa", es: "Cabeza", ex: "Use your head!", type: "noun", lvl: 5 },
  { en: "Health", tr: "Sağlık", de: "Gesundheit", fr: "Santé", it: "Salute", es: "Salud", ex: "Health is important.", type: "noun", lvl: 5 },
  { en: "Hear", tr: "Duymak", de: "Hören", fr: "Entendre", it: "Sentire", es: "Oír", ex: "Can you hear me?", type: "verb", lvl: 5 },
  { en: "Heart", tr: "Kalp", de: "Herz", fr: "Cœur", it: "Cuore", es: "Corazón", ex: "My heart is beating fast.", type: "noun", lvl: 5 },
  { en: "Heat", tr: "Isı", de: "Hitze", fr: "Chaleur", it: "Calore", es: "Calor", ex: "The heat is unbearable.", type: "noun", lvl: 5 },
  { en: "Heavy", tr: "Ağır", de: "Schwer", fr: "Lourd", it: "Pesante", es: "Pesado", ex: "This box is very heavy.", type: "adj", lvl: 5 },
  { en: "Height", tr: "Yükseklik", de: "Höhe", fr: "Hauteur", it: "Altezza", es: "Altura", ex: "What is your height?", type: "noun", lvl: 5 },
  { en: "Help", tr: "Yardım", de: "Hilfe", fr: "Aide", it: "Aiuto", es: "Ayuda", ex: "I need your help.", type: "noun", lvl: 5 },
  { en: "Hence", tr: "Bu Yüzden", de: "Daher", fr: "Par conséquent", it: "Quindi", es: "Por lo tanto", ex: "Hence, we must act now.", type: "adv", lvl: 5 },
  { en: "Here", tr: "Burada", de: "Hier", fr: "Ici", it: "Qui", es: "Aquí", ex: "Come here, please.", type: "adv", lvl: 5 },
  { en: "Hero", tr: "Kahraman", de: "Held", fr: "Héros", it: "Eroe", es: "Héroe", ex: "He is my hero.", type: "noun", lvl: 5 },
  { en: "Illuminate", tr: "Aydınlatmak", de: "Beleuchten", fr: "Illuminer", it: "Illuminare", es: "Iluminar", ex: "A single candle illuminated the room.", type: "verb", lvl: 5 },

  // Level 6
  { en: "Jeopardy", tr: "Tehlike", de: "Gefahr", fr: "Péril", it: "Pericolo", es: "Peligro", ex: "Thousands of jobs are in jeopardy.", type: "noun", lvl: 6 },
  { en: "Jewel", tr: "Mücevher", de: "Juwel", fr: "Bijou", it: "Gioiello", es: "Joya", ex: "This jewel is very valuable.", type: "noun", lvl: 6 },
  { en: "Job", tr: "İş", de: "Arbeit", fr: "Travail", it: "Lavoro", es: "Trabajo", ex: "I love my job.", type: "noun", lvl: 6 },
  { en: "Join", tr: "Katılmak", de: "Beitreten", fr: "Rejoindre", it: "Unirsi", es: "Unirse", ex: "Join us for dinner.", type: "verb", lvl: 6 },
  { en: "Joint", tr: "Eklem", de: "Gelenk", fr: "Articulation", it: "Articolazione", es: "Articulación", ex: "My knee joint hurts.", type: "noun", lvl: 6 },
  { en: "Joke", tr: "Şaka", de: "Witz", fr: "Blague", it: "Scherzo", es: "Chiste", ex: "That's a funny joke.", type: "noun", lvl: 6 },
  { en: "Journal", tr: "Dergi", de: "Zeitschrift", fr: "Journal", it: "Giornale", es: "Revista", ex: "I read a scientific journal.", type: "noun", lvl: 6 },
  { en: "Journey", tr: "Yolculuk", de: "Reise", fr: "Voyage", it: "Viaggio", es: "Viaje", ex: "The journey was long.", type: "noun", lvl: 6 },
  { en: "Joy", tr: "Sevinç", de: "Freude", fr: "Joie", it: "Gioia", es: "Alegría", ex: "She felt great joy.", type: "noun", lvl: 6 },
  { en: "Judge", tr: "Yargıç", de: "Richter", fr: "Juge", it: "Giudice", es: "Juez", ex: "The judge made a decision.", type: "noun", lvl: 6 },
  { en: "Judgment", tr: "Yargı", de: "Urteil", fr: "Jugement", it: "Giudizio", es: "Juicio", ex: "Use your best judgment.", type: "noun", lvl: 6 },
  { en: "Juice", tr: "Meyve Suyu", de: "Saft", fr: "Jus", it: "Succo", es: "Jugo", ex: "I want orange juice.", type: "noun", lvl: 6 },
  { en: "Jump", tr: "Zıplamak", de: "Springen", fr: "Sauter", it: "Saltare", es: "Saltar", ex: "Jump as high as you can.", type: "verb", lvl: 6 },
  { en: "Junction", tr: "Kavşak", de: "Kreuzung", fr: "Jonction", it: "Incrocio", es: "Cruce", ex: "Turn left at the junction.", type: "noun", lvl: 6 },
  { en: "June", tr: "Haziran", de: "Juni", fr: "Juin", it: "Giugno", es: "Junio", ex: "June is a summer month.", type: "noun", lvl: 6 },
  { en: "Jungle", tr: "Orman", de: "Dschungel", fr: "Jungle", it: "Giungla", es: "Selva", ex: "The jungle is dangerous.", type: "noun", lvl: 6 },
  { en: "Junior", tr: "Genç", de: "Junior", fr: "Junior", it: "Junior", es: "Junior", ex: "He is a junior employee.", type: "adj", lvl: 6 },
  { en: "Jury", tr: "Jüri", de: "Jury", fr: "Jury", it: "Giuria", es: "Jurado", ex: "The jury reached a verdict.", type: "noun", lvl: 6 },
  { en: "Just", tr: "Sadece", de: "Gerade", fr: "Juste", it: "Appena", es: "Solo", ex: "I just arrived.", type: "adv", lvl: 6 },
  { en: "Justice", tr: "Adalet", de: "Gerechtigkeit", fr: "Justice", it: "Giustizia", es: "Justicia", ex: "We seek justice.", type: "noun", lvl: 6 },
  { en: "Justify", tr: "Haklı Çıkarmak", de: "Rechtfertigen", fr: "Justifier", it: "Giustificare", es: "Justificar", ex: "Can you justify this?", type: "verb", lvl: 6 },
  { en: "Kinetic", tr: "Hareketli", de: "Kinetisch", fr: "Cinétique", it: "Cinetico", es: "Cinético", ex: "Kinetic energy is the energy of motion.", type: "adj", lvl: 6 },

  // Level 7
  { en: "Lucid", tr: "Berrak", de: "Klar", fr: "Lucide", it: "Lucido", es: "Lúcido", ex: "She gave a clear and lucid account of the accident.", type: "adj", lvl: 7 },
  { en: "Luck", tr: "Şans", de: "Glück", fr: "Chance", it: "Fortuna", es: "Suerte", ex: "Good luck!", type: "noun", lvl: 7 },
  { en: "Lucky", tr: "Şanslı", de: "Glücklich", fr: "Chanceux", it: "Fortunato", es: "Afortunado", ex: "You are so lucky.", type: "adj", lvl: 7 },
  { en: "Lunch", tr: "Öğle Yemeği", de: "Mittagessen", fr: "Déjeuner", it: "Pranzo", es: "Almuerzo", ex: "Let's have lunch together.", type: "noun", lvl: 7 },
  { en: "Lung", tr: "Akciğer", de: "Lunge", fr: "Poumon", it: "Polmone", es: "Pulmón", ex: "Smoking damages your lungs.", type: "noun", lvl: 7 },
  { en: "Machine", tr: "Makine", de: "Maschine", fr: "Machine", it: "Macchina", es: "Máquina", ex: "This machine is broken.", type: "noun", lvl: 7 },
  { en: "Mad", tr: "Kızgın", de: "Wütend", fr: "Fou", it: "Arrabbiato", es: "Enojado", ex: "Don't be mad at me.", type: "adj", lvl: 7 },
  { en: "Magazine", tr: "Dergi", de: "Magazin", fr: "Magazine", it: "Rivista", es: "Revista", ex: "I read a fashion magazine.", type: "noun", lvl: 7 },
  { en: "Magic", tr: "Büyü", de: "Magie", fr: "Magie", it: "Magia", es: "Magia", ex: "It's like magic!", type: "noun", lvl: 7 },
  { en: "Mail", tr: "Posta", de: "Post", fr: "Courrier", it: "Posta", es: "Correo", ex: "Check your mail.", type: "noun", lvl: 7 },
  { en: "Main", tr: "Ana", de: "Haupt-", fr: "Principal", it: "Principale", es: "Principal", ex: "This is the main road.", type: "adj", lvl: 7 },
  { en: "Maintain", tr: "Sürdürmek", de: "Pflegen", fr: "Maintenir", it: "Mantenere", es: "Mantener", ex: "Maintain your car regularly.", type: "verb", lvl: 7 },
  { en: "Major", tr: "Büyük", de: "Groß", fr: "Majeur", it: "Maggiore", es: "Mayor", ex: "This is a major problem.", type: "adj", lvl: 7 },
  { en: "Majority", tr: "Çoğunluk", de: "Mehrheit", fr: "Majorité", it: "Maggioranza", es: "Mayoría", ex: "The majority voted yes.", type: "noun", lvl: 7 },
  { en: "Make", tr: "Yapmak", de: "Machen", fr: "Faire", it: "Fare", es: "Hacer", ex: "Make a decision.", type: "verb", lvl: 7 },
  { en: "Male", tr: "Erkek", de: "Männlich", fr: "Mâle", it: "Maschio", es: "Masculino", ex: "He is a male student.", type: "adj", lvl: 7 },
  { en: "Manifest", tr: "Göstermek", de: "Manifestieren", fr: "Manifester", it: "Manifestare", es: "Manifestar", ex: "His illness manifested itself in severe headaches.", type: "verb", lvl: 7 },

  // Level 8
  { en: "Nebulous", tr: "Belirsiz", de: "Nebulös", fr: "Nébuleux", it: "Nebuloso", es: "Nebuloso", ex: "She has a few nebulous ideas about what she might do.", type: "adj", lvl: 8 },
  { en: "Necessary", tr: "Gerekli", de: "Notwendig", fr: "Nécessaire", it: "Necessario", es: "Necesario", ex: "Is it necessary?", type: "adj", lvl: 8 },
  { en: "Neck", tr: "Boyun", de: "Hals", fr: "Cou", it: "Collo", es: "Cuello", ex: "My neck hurts.", type: "noun", lvl: 8 },
  { en: "Need", tr: "İhtiyaç", de: "Brauchen", fr: "Besoin", it: "Bisogno", es: "Necesidad", ex: "I need your help.", type: "verb", lvl: 8 },
  { en: "Negative", tr: "Negatif", de: "Negativ", fr: "Négatif", it: "Negativo", es: "Negativo", ex: "Don't be so negative.", type: "adj", lvl: 8 },
  { en: "Neglect", tr: "İhmal Etmek", de: "Vernachlässigen", fr: "Négliger", it: "Trascurare", es: "Descuidar", ex: "Don't neglect your duties.", type: "verb", lvl: 8 },
  { en: "Negotiate", tr: "Müzakere Etmek", de: "Verhandeln", fr: "Négocier", it: "Negoziare", es: "Negociar", ex: "Let's negotiate the price.", type: "verb", lvl: 8 },
  { en: "Neighbor", tr: "Komşu", de: "Nachbar", fr: "Voisin", it: "Vicino", es: "Vecino", ex: "My neighbor is very friendly.", type: "noun", lvl: 8 },
  { en: "Neither", tr: "Hiçbiri", de: "Keiner", fr: "Ni l'un ni l'autre", it: "Nessuno dei due", es: "Ninguno", ex: "Neither option is good.", type: "pron", lvl: 8 },
  { en: "Nerve", tr: "Sinir", de: "Nerv", fr: "Nerf", it: "Nervo", es: "Nervio", ex: "You have a lot of nerve!", type: "noun", lvl: 8 },
  { en: "Nervous", tr: "Sinirli", de: "Nervös", fr: "Nerveux", it: "Nervoso", es: "Nervioso", ex: "I'm nervous about the exam.", type: "adj", lvl: 8 },
  { en: "Nest", tr: "Yuva", de: "Nest", fr: "Nid", it: "Nido", es: "Nido", ex: "The bird built a nest.", type: "noun", lvl: 8 },
  { en: "Net", tr: "Ağ", de: "Netz", fr: "Filet", it: "Rete", es: "Red", ex: "Catch it with a net.", type: "noun", lvl: 8 },
  { en: "Network", tr: "Ağ", de: "Netzwerk", fr: "Réseau", it: "Rete", es: "Red", ex: "Join our network.", type: "noun", lvl: 8 },
  { en: "Never", tr: "Asla", de: "Niemals", fr: "Jamais", it: "Mai", es: "Nunca", ex: "I never give up.", type: "adv", lvl: 8 },
  { en: "Nevertheless", tr: "Yine de", de: "Trotzdem", fr: "Néanmoins", it: "Tuttavia", es: "Sin embargo", ex: "Nevertheless, I'll try.", type: "adv", lvl: 8 },
  { en: "New", tr: "Yeni", de: "Neu", fr: "Nouveau", it: "Nuovo", es: "Nuevo", ex: "This is a new car.", type: "adj", lvl: 8 },
  { en: "News", tr: "Haber", de: "Nachrichten", fr: "Nouvelles", it: "Notizie", es: "Noticias", ex: "What's the news?", type: "noun", lvl: 8 },
  { en: "Newspaper", tr: "Gazete", de: "Zeitung", fr: "Journal", it: "Giornale", es: "Periódico", ex: "I read the newspaper daily.", type: "noun", lvl: 8 },
  { en: "Next", tr: "Sonraki", de: "Nächste", fr: "Prochain", it: "Prossimo", es: "Próximo", ex: "See you next week.", type: "adj", lvl: 8 },
  { en: "Obscure", tr: "Anlaşılmaz", de: "Unklar", fr: "Obscur", it: "Oscuro", es: "Oscuro", ex: "The view was obscured by fog.", type: "verb", lvl: 8 },

  // Level 9
  { en: "Paradigm", tr: "Model", de: "Paradigma", fr: "Paradigme", it: "Paradigma", es: "Paradigma", ex: "This discovery caused a paradigm shift in science.", type: "noun", lvl: 9 },
  { en: "Paragraph", tr: "Paragraf", de: "Absatz", fr: "Paragraphe", it: "Paragrafo", es: "Párrafo", ex: "Read this paragraph.", type: "noun", lvl: 9 },
  { en: "Parallel", tr: "Paralel", de: "Parallel", fr: "Parallèle", it: "Parallelo", es: "Paralelo", ex: "These lines are parallel.", type: "adj", lvl: 9 },
  { en: "Parameter", tr: "Parametre", de: "Parameter", fr: "Paramètre", it: "Parametro", es: "Parámetro", ex: "Set the parameters correctly.", type: "noun", lvl: 9 },
  { en: "Parent", tr: "Ebeveyn", de: "Elternteil", fr: "Parent", it: "Genitore", es: "Padre", ex: "My parents are kind.", type: "noun", lvl: 9 },
  { en: "Park", tr: "Park", de: "Park", fr: "Parc", it: "Parco", es: "Parque", ex: "Let's go to the park.", type: "noun", lvl: 9 },
  { en: "Part", tr: "Parça", de: "Teil", fr: "Partie", it: "Parte", es: "Parte", ex: "This is part of the plan.", type: "noun", lvl: 9 },
  { en: "Participate", tr: "Katılmak", de: "Teilnehmen", fr: "Participer", it: "Partecipare", es: "Participar", ex: "I want to participate.", type: "verb", lvl: 9 },
  { en: "Particular", tr: "Özel", de: "Besonders", fr: "Particulier", it: "Particolare", es: "Particular", ex: "This is a particular case.", type: "adj", lvl: 9 },
  { en: "Partner", tr: "Ortak", de: "Partner", fr: "Partenaire", it: "Partner", es: "Socio", ex: "She is my business partner.", type: "noun", lvl: 9 },
  { en: "Party", tr: "Parti", de: "Party", fr: "Fête", it: "Festa", es: "Fiesta", ex: "The party was fun.", type: "noun", lvl: 9 },
  { en: "Pass", tr: "Geçmek", de: "Passieren", fr: "Passer", it: "Passare", es: "Pasar", ex: "I passed the exam.", type: "verb", lvl: 9 },
  { en: "Passage", tr: "Geçit", de: "Passage", fr: "Passage", it: "Passaggio", es: "Pasaje", ex: "Read this passage.", type: "noun", lvl: 9 },
  { en: "Passenger", tr: "Yolcu", de: "Passagier", fr: "Passager", it: "Passeggero", es: "Pasajero", ex: "All passengers boarded.", type: "noun", lvl: 9 },
  { en: "Passion", tr: "Tutku", de: "Leidenschaft", fr: "Passion", it: "Passione", es: "Pasión", ex: "I have a passion for music.", type: "noun", lvl: 9 },
  { en: "Past", tr: "Geçmiş", de: "Vergangenheit", fr: "Passé", it: "Passato", es: "Pasado", ex: "Learn from the past.", type: "noun", lvl: 9 },
  { en: "Path", tr: "Yol", de: "Pfad", fr: "Chemin", it: "Sentiero", es: "Camino", ex: "Follow this path.", type: "noun", lvl: 9 },
  { en: "Patient", tr: "Hasta", de: "Patient", fr: "Patient", it: "Paziente", es: "Paciente", ex: "The patient is recovering.", type: "noun", lvl: 9 },
  { en: "Pattern", tr: "Desen", de: "Muster", fr: "Motif", it: "Modello", es: "Patrón", ex: "I see a pattern here.", type: "noun", lvl: 9 },
  { en: "Quantum", tr: "Kuantum", de: "Quantum", fr: "Quantum", it: "Quanto", es: "Cuántico", ex: "Quantum mechanics deals with physics at a small scale.", type: "noun", lvl: 9 },

  // Level 10
  { en: "Resilient", tr: "Dirençli", de: "Widerstandsfähig", fr: "Résilient", it: "Resiliente", es: "Resistente", ex: "Babies are often more resilient than you think.", type: "adj", lvl: 10 },
  { en: "Resist", tr: "Direnmek", de: "Widerstehen", fr: "Résister", it: "Resistere", es: "Resistir", ex: "I resist the temptation.", type: "verb", lvl: 10 },
  { en: "Resolve", tr: "Çözmek", de: "Lösen", fr: "Résoudre", it: "Risolvere", es: "Resolver", ex: "Let's resolve this issue.", type: "verb", lvl: 10 },
  { en: "Resort", tr: "Tatil Yeri", de: "Ferienort", fr: "Station", it: "Resort", es: "Resort", ex: "We stayed at a resort.", type: "noun", lvl: 10 },
  { en: "Resource", tr: "Kaynak", de: "Ressource", fr: "Ressource", it: "Risorsa", es: "Recurso", ex: "Water is a valuable resource.", type: "noun", lvl: 10 },
  { en: "Respect", tr: "Saygı", de: "Respekt", fr: "Respect", it: "Rispetto", es: "Respeto", ex: "Show respect to others.", type: "noun", lvl: 10 },
  { en: "Respond", tr: "Yanıtlamak", de: "Antworten", fr: "Répondre", it: "Rispondere", es: "Responder", ex: "Please respond quickly.", type: "verb", lvl: 10 },
  { en: "Response", tr: "Yanıt", de: "Antwort", fr: "Réponse", it: "Risposta", es: "Respuesta", ex: "I got no response.", type: "noun", lvl: 10 },
  { en: "Responsibility", tr: "Sorumluluk", de: "Verantwortung", fr: "Responsabilité", it: "Responsabilità", es: "Responsabilidad", ex: "Take responsibility.", type: "noun", lvl: 10 },
  { en: "Rest", tr: "Dinlenmek", de: "Ruhen", fr: "Se reposer", it: "Riposare", es: "Descansar", ex: "You need to rest.", type: "verb", lvl: 10 },
  { en: "Restaurant", tr: "Restoran", de: "Restaurant", fr: "Restaurant", it: "Ristorante", es: "Restaurante", ex: "Let's eat at a restaurant.", type: "noun", lvl: 10 },
  { en: "Restore", tr: "Yenilemek", de: "Wiederherstellen", fr: "Restaurer", it: "Ripristinare", es: "Restaurar", ex: "Restore the old building.", type: "verb", lvl: 10 },
  { en: "Restrict", tr: "Kısıtlamak", de: "Einschränken", fr: "Restreindre", it: "Limitare", es: "Restringir", ex: "Don't restrict my freedom.", type: "verb", lvl: 10 },
  { en: "Result", tr: "Sonuç", de: "Ergebnis", fr: "Résultat", it: "Risultato", es: "Resultado", ex: "What was the result?", type: "noun", lvl: 10 },
  { en: "Retain", tr: "Tutmak", de: "Behalten", fr: "Retenir", it: "Trattenere", es: "Retener", ex: "Retain this information.", type: "verb", lvl: 10 },
  { en: "Retire", tr: "Emekli Olmak", de: "In Rente gehen", fr: "Prendre sa retraite", it: "Andare in pensione", es: "Jubilarse", ex: "He will retire soon.", type: "verb", lvl: 10 },
  { en: "Return", tr: "Dönmek", de: "Zurückkehren", fr: "Revenir", it: "Tornare", es: "Volver", ex: "When will you return?", type: "verb", lvl: 10 },
  { en: "Reveal", tr: "Açığa Çıkarmak", de: "Enthüllen", fr: "Révéler", it: "Rivelare", es: "Revelar", ex: "Reveal the truth.", type: "verb", lvl: 10 },
  { en: "Revenue", tr: "Gelir", de: "Einnahmen", fr: "Revenus", it: "Entrate", es: "Ingresos", ex: "Company revenue increased.", type: "noun", lvl: 10 },
  { en: "Review", tr: "İncelemek", de: "Überprüfen", fr: "Réviser", it: "Rivedere", es: "Revisar", ex: "Review your work.", type: "verb", lvl: 10 },
  { en: "Revolution", tr: "Devrim", de: "Revolution", fr: "Révolution", it: "Rivoluzione", es: "Revolución", ex: "The industrial revolution changed everything.", type: "noun", lvl: 10 },
  { en: "Reward", tr: "Ödül", de: "Belohnung", fr: "Récompense", it: "Ricompensa", es: "Recompensa", ex: "You deserve a reward.", type: "noun", lvl: 10 },
  { en: "Rhythm", tr: "Ritim", de: "Rhythmus", fr: "Rythme", it: "Ritmo", es: "Ritmo", ex: "Feel the rhythm.", type: "noun", lvl: 10 },
  { en: "Rich", tr: "Zengin", de: "Reich", fr: "Riche", it: "Ricco", es: "Rico", ex: "He is very rich.", type: "adj", lvl: 10 },
  { en: "Ride", tr: "Binmek", de: "Fahren", fr: "Monter", it: "Cavalcare", es: "Montar", ex: "I ride my bike to work.", type: "verb", lvl: 10 },
  { en: "Right", tr: "Doğru", de: "Richtig", fr: "Correct", it: "Giusto", es: "Correcto", ex: "You are right.", type: "adj", lvl: 10 },
  { en: "Ring", tr: "Yüzük", de: "Ring", fr: "Anneau", it: "Anello", es: "Anillo", ex: "She wears a gold ring.", type: "noun", lvl: 10 },
  { en: "Rise", tr: "Yükselmek", de: "Steigen", fr: "Monter", it: "Salire", es: "Subir", ex: "The sun will rise soon.", type: "verb", lvl: 10 },
  { en: "Risk", tr: "Risk", de: "Risiko", fr: "Risque", it: "Rischio", es: "Riesgo", ex: "Don't take unnecessary risks.", type: "noun", lvl: 10 },
  { en: "River", tr: "Nehir", de: "Fluss", fr: "Rivière", it: "Fiume", es: "Río", ex: "The river flows to the sea.", type: "noun", lvl: 10 },
  { en: "Road", tr: "Yol", de: "Straße", fr: "Route", it: "Strada", es: "Carretera", ex: "Follow this road.", type: "noun", lvl: 10 },
  { en: "Zenith", tr: "Zirve", de: "Zenit", fr: "Zénith", it: "Zenit", es: "Cénit", ex: "The sun was at its zenith.", type: "noun", lvl: 10 },
];

// Supported language codes
const SUPPORTED_LANGS = ['en', 'tr', 'de', 'fr', 'it', 'es'];

// Create Word objects for a specific language pair
const createWordsForPair = (sourceLang: string, targetLang: string): Word[] => {
  return rawWords
    .filter(w => w[sourceLang as keyof typeof w] && w[targetLang as keyof typeof w])
    .map((w, index) => ({
      id: `${String(w.en).toLowerCase()}-${sourceLang}-${targetLang}-${w.lvl}-${index}`,
      sourceText: String(w[sourceLang as keyof typeof w]),
      targetText: String(w[targetLang as keyof typeof w]),
      sourceLanguage: sourceLang,
      targetLanguage: targetLang,
      example: w.ex,
      type: w.type,
      level: w.lvl,
      // Legacy fields for backward compatibility
      english: w.en,
      turkish: w.tr,
    }));
};

// Build word database for all language pairs
const wordsByLanguagePair: Record<string, Record<string, Word[]>> = {};

// Generate all possible language pairs
SUPPORTED_LANGS.forEach(sourceLang => {
  wordsByLanguagePair[sourceLang] = {};
  SUPPORTED_LANGS.forEach(targetLang => {
    if (sourceLang !== targetLang) {
      wordsByLanguagePair[sourceLang][targetLang] = createWordsForPair(sourceLang, targetLang);
    }
  });
});

// Get words for a specific language pair
const getWordsForPair = (sourceLanguage: string, targetLanguage: string): Word[] => {
  const words = wordsByLanguagePair[sourceLanguage]?.[targetLanguage];
  if (words && words.length > 0) {
    return words;
  }
  console.warn(`No words available for ${sourceLanguage} → ${targetLanguage}`);
  return [];
};

// Cache for pre-sorted words by language pair
const sortedWordsCache: Record<string, Word[]> = {};

// Get cache key for language pair
const getCacheKey = (sourceLang: string, targetLang: string) => `${sourceLang}-${targetLang}`;

// Get a pool of words for a specific language pair
export const getWordPool = (
  sourceLanguage: string = 'en',
  targetLanguage: string = 'tr',
  excludeWordIds: Set<string> = new Set(),
  poolSize: number = 100
): Word[] => {
  const pairWords = getWordsForPair(sourceLanguage, targetLanguage);

  if (pairWords.length === 0) {
    return [];
  }

  const availableWords = excludeWordIds.size > 0
    ? pairWords.filter(word => !excludeWordIds.has(word.id))
    : pairWords;

  if (availableWords.length === 0) {
    return [];
  }

  const cacheKey = getCacheKey(sourceLanguage, targetLanguage);
  let sortedWords = sortedWordsCache[cacheKey];

  if (!sortedWords || sortedWords.length !== pairWords.length) {
    sortedWords = [...pairWords].sort((a, b) => b.level - a.level);
    sortedWordsCache[cacheKey] = sortedWords;
  }

  const filteredSorted = excludeWordIds.size > 0
    ? sortedWords.filter(word => !excludeWordIds.has(word.id))
    : sortedWords;

  // Shuffle for variety
  const pool = filteredSorted.slice(0, Math.min(poolSize * 2, filteredSorted.length));
  for (let i = pool.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [pool[i], pool[j]] = [pool[j], pool[i]];
  }

  return pool.slice(0, Math.min(poolSize, pool.length));
};

// Get all available words for a language pair
export const getAllAvailableWords = (
  sourceLanguage: string = 'en',
  targetLanguage: string = 'tr',
  excludeWordIds: Set<string> = new Set()
): Word[] => {
  const pairWords = getWordsForPair(sourceLanguage, targetLanguage);
  const available = pairWords.filter(word => !excludeWordIds.has(word.id));

  return available.sort((a, b) => {
    if (b.level !== a.level) {
      return b.level - a.level;
    }
    return Math.random() - 0.5;
  });
};

// Legacy function for backward compatibility
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
