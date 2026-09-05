// Erzeugt die vom JavaScript befuellten Inhalte der Startseite als HTML-Schnipsel.
var __store={};
global.localStorage={getItem:k=>Object.prototype.hasOwnProperty.call(__store,k)?__store[k]:null,
  setItem:(k,v)=>{__store[k]=String(v)},removeItem:k=>{delete __store[k]}};
var reg={};
function esc(s){return String(s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;');}
function mk(tag){
  var e={tag:tag,_html:'',_text:'',attrs:{},style:{},dataset:{},kids:[],
    classList:{add(c){e.attrs['class']=((e.attrs['class']||'')+' '+c).trim()},
               remove(c){e.attrs['class']=((e.attrs['class']||'').split(/\s+/).filter(x=>x&&x!==c).join(' '))},
               contains(c){return (e.attrs['class']||'').split(/\s+/).includes(c)},
               toggle(){}},
    setAttribute(k,v){e.attrs[k]=v}, getAttribute(k){return e.attrs[k]},
    addEventListener(){}, focus(){}, scrollIntoView(){}, closest(){return null},
    querySelectorAll(){return []}, querySelector(){return null},
    appendChild(c){e.kids.push(c); e._html+=c.outerHTML();},
    get className(){return e.attrs['class']||''}, set className(v){e.attrs['class']=v;},
    get open(){return 'open' in e.attrs}, set open(v){ if(v) e.attrs['open']=''; else delete e.attrs['open']; },
    outerHTML(){
      var a=Object.keys(e.attrs).map(k=>' '+k+'="'+esc(e.attrs[k])+'"').join('');
      return '<'+e.tag+a+'>'+(e._html||esc(e._text))+'</'+e.tag+'>';
    }};
  Object.defineProperty(e,'innerHTML',{get(){return e._html;},set(v){e._html=v;e.kids=[];}});
  Object.defineProperty(e,'textContent',{get(){return e._text;},set(v){e._text=v;e._html='';}});
  return e;
}
function el(id){ if(!reg[id]) {reg[id]=mk('div'); reg[id].attrs.id=id;} return reg[id]; }
global.window={addEventListener(){},matchMedia(){return{matches:false}},scrollY:0,scrollTo(){}};
global.document={getElementById:el,addEventListener(){},querySelector(){return el('__h')},
  querySelectorAll(s){return s==='.view'?['landing','quiz','result','archetypes','state','profile','settings','compat-archive','understand'].map(n=>el('view-'+n)):[]},
  documentElement:{setAttribute(){},removeAttribute(){},lang:''},createElement:mk};
global.requestAnimationFrame=function(){}; global.setTimeout=function(){};


(function(){
  "use strict";

  // Globales Auffangnetz (Feedback-Runde 32): bislang liefen unerwartete Laufzeitfehler oder
  // abgelehnte Promises komplett lautlos ins Leere — die Ansicht blieb einfach stehen, ohne dass
  // die Person überhaupt merkte, dass etwas schiefging. toast() existiert bereits als bewährter
  // Hinweis-Mechanismus (siehe u. a. Vergleichsarchiv); hier nur mit eigener Drossel, damit eine
  // Fehlerkaskade nicht denselben Hinweis im Sekundentakt wiederholt. Ersetzt keine echte
  // Fehlerbehandlung an der jeweiligen Stelle, sondern ist bewusst nur das letzte Sicherheitsnetz.
  var lastGlobalErrorToast = 0;
  function notifyUnexpectedError(){
    var now = Date.now();
    if (now - lastGlobalErrorToast < 4000) return;
    lastGlobalErrorToast = now;
    try{
      var t = document.getElementById('toast');
      if (t){ t.textContent = 'Etwas ist schiefgelaufen. Deine gespeicherten Daten bleiben unberührt.'; t.classList.add('show'); setTimeout(function(){ t.classList.remove('show'); }, 2600); }
    }catch(e){ /* selbst der Hinweis darf die App nicht zum Absturz bringen */ }
  }
  window.addEventListener('error', notifyUnexpectedError);
  window.addEventListener('unhandledrejection', notifyUnexpectedError);

  var LABELS = {E:'Extraversion', A:'Verträglichkeit', C:'Gewissenhaftigkeit', S:'Emotionale Stabilität', O:'Offenheit'};
  var RADAR_LABELS = {E:'EXTRA.', A:'VERTR.', C:'GEWISS.', S:'STABIL.', O:'OFFEN.'};
  var ORDER = ['O','E','C','A','S'];

  var FACTORS = {
    E: [
      {t:'Bin auf Partys die Seele der Feier', k:1},
      {t:'Fühle mich in Gesellschaft anderer wohl', k:1},
      {t:'Beginne von mir aus Gespräche', k:1},
      {t:'Rede auf Partys mit vielen verschiedenen Leuten', k:1},
      {t:'Habe kein Problem damit, im Mittelpunkt zu stehen', k:1},
      {t:'Rede nicht viel', k:-1},
      {t:'Halte mich im Hintergrund', k:-1},
      {t:'Habe wenig zu sagen', k:-1},
      {t:'Mag es nicht, Aufmerksamkeit auf mich zu ziehen', k:-1},
      {t:'Bin bei Fremden eher still', k:-1}
    ],
    A: [
      {t:'Interessiere mich für andere Menschen', k:1},
      {t:'Kann mit den Gefühlen anderer mitfühlen', k:1},
      {t:'Habe ein weiches Herz', k:1},
      {t:'Nehme mir Zeit für andere', k:1},
      {t:'Spüre die Emotionen anderer', k:1},
      {t:'Sorge dafür, dass sich andere wohlfühlen', k:1},
      {t:'Empfinde wenig Anteilnahme für andere', k:-1},
      {t:'Beleidige andere Menschen', k:-1},
      {t:'Interessiere mich nicht für die Probleme anderer', k:-1},
      {t:'Interessiere mich eigentlich nicht wirklich für andere', k:-1}
    ],
    C: [
      {t:'Bin immer gut vorbereitet', k:1},
      {t:'Achte auf Details', k:1},
      {t:'Erledige Aufgaben sofort', k:1},
      {t:'Mag Ordnung', k:1},
      {t:'Halte mich an einen Zeitplan', k:1},
      {t:'Arbeite sehr genau', k:1},
      {t:'Lasse meine Sachen überall liegen', k:-1},
      {t:'Hinterlasse gerne mal ein Chaos', k:-1},
      {t:'Vergesse oft, Dinge an ihren Platz zurückzulegen', k:-1},
      {t:'Drücke mich vor meinen Pflichten', k:-1}
    ],
    S: [
      {t:'Bin meistens entspannt', k:1},
      {t:'Fühle mich selten niedergeschlagen', k:1},
      {t:'Bin schnell gestresst', k:-1},
      {t:'Mache mir viele Sorgen', k:-1},
      {t:'Lasse mich leicht aus der Ruhe bringen', k:-1},
      {t:'Rege mich schnell auf', k:-1},
      {t:'Meine Stimmung wechselt oft', k:-1},
      {t:'Habe häufig Stimmungsschwankungen', k:-1},
      {t:'Bin schnell gereizt', k:-1},
      {t:'Fühle mich oft niedergeschlagen', k:-1}
    ],
    O: [
      {t:'Habe einen reichen Wortschatz', k:1},
      {t:'Habe eine lebhafte Vorstellungskraft', k:1},
      {t:'Habe ausgezeichnete Ideen', k:1},
      {t:'Verstehe Dinge schnell', k:1},
      {t:'Verwende anspruchsvolle Wörter', k:1},
      {t:'Denke gerne länger über Dinge nach', k:1},
      {t:'Stecke voller Ideen', k:1},
      {t:'Habe Schwierigkeiten, abstrakte Ideen zu verstehen', k:-1},
      {t:'Interessiere mich nicht für abstrakte Ideen', k:-1},
      {t:'Habe keine besonders gute Vorstellungskraft', k:-1}
    ]
  };

  var ITEMS = [];
  for (var i=0;i<10;i++){
    for (var j=0;j<ORDER.length;j++){
      var f = ORDER[j];
      ITEMS.push({factor:f, text:FACTORS[f][i].t, key:FACTORS[f][i].k});
    }
  }

  var PROFILES = {
    E: { high: {teaser:'Du tankst Energie in Gesellschaft und gehst offen auf andere zu.',
      alltag:'Kontakte knüpfen, Gespräche starten, im Mittelpunkt stehen — das kostet dich eher wenig Energie, oft gibt es dir sogar welche. Stille im Raum fühlt sich für dich schneller unangenehm an als für andere.',
      beziehungen:'Du bist meist die Person, die Pläne anstößt und Stimmung reinbringt. Achte darauf, auch ruhigeren Menschen in deinem Umfeld Raum zu lassen, ohne dass ihre Stille wie Ablehnung wirkt.',
      wachstum:'Übe bewusst kurze Pausen der Stille ein. Nicht jede Idee muss sofort ausgesprochen werden — manchmal wächst Klarheit gerade dort, wo du zuhörst statt zu reden.'},
      low: {teaser:'Du gehst mit deiner Energie sorgsam um und blühst in kleineren, vertrauten Kreisen auf.',
      alltag:'Große Gruppen oder Small Talk kosten dich eher Kraft, während du in ruhigeren, tieferen Eins-zu-eins-Situationen aufblühst. Du beobachtest gern, bevor du sprichst — deine Worte haben dadurch oft Gewicht.',
      beziehungen:'Du brauchst nach sozialen Situationen Zeit für dich. Das solltest du offen kommunizieren, statt dich stillschweigend zurückzuziehen und missverstanden zu werden.',
      wachstum:'Plane bewusst kleine, dosierte soziale Schritte außerhalb deiner Komfortzone ein, wenn dir eine Verbindung wichtig ist — ein einziges kurzes Gespräch reicht oft schon.'} },
    A: { high: {teaser:'Die Gefühle anderer sind für dich real spürbar – Empathie ist deine Stärke.',
      alltag:'Du nimmst Stimmungen und Bedürfnisse anderer fein wahr, oft bevor sie ausgesprochen werden, und stellst dich häufig hinten an, um zu helfen.',
      beziehungen:'Das macht dich zu einer vertrauenswürdigen Bezugsperson — Menschen öffnen sich dir leicht. Es birgt aber das Risiko, eigene Bedürfnisse so lange zu verschieben, bis sie unsichtbar werden.',
      wachstum:'Übe, „nein“ zu sagen, ohne dich lang zu rechtfertigen. Echte Fürsorge für andere beginnt mit Fürsorge für dich selbst.'},
      low: {teaser:'Du triffst Entscheidungen mit dem Kopf und sagst klar, was Sache ist.',
      alltag:'Du lässt dich von Fakten und Logik leiten statt primär von Stimmungen — auch dann, wenn das unbequem ist.',
      beziehungen:'Andere schätzen deine Ehrlichkeit, auch wenn sie manchmal hart wirkt. In Konflikten bewahrst du eher kühlen Kopf als die Menschen um dich herum.',
      wachstum:'Bevor du eine direkte Rückmeldung gibst, frag dich kurz: Wie kommt das gerade emotional an — nicht nur, ob es inhaltlich stimmt.'} },
    C: { high: {teaser:'Struktur und Verlässlichkeit sind für dich kein Zwang, sondern ein Werkzeug.',
      alltag:'Du planst gern voraus, hältst Zusagen ein und achtest auf Details, die andere übersehen.',
      beziehungen:'Das macht dich zur verlässlichen Konstante, auf die sich andere verlassen können. Deine Genauigkeit kann als Fürsorge ankommen — oder als Kontrolle, je nachdem, wie viel Raum du für Unordnung bei anderen lässt.',
      wachstum:'Plane bewusst ungeplante Zeit ein und übe, einen Plan auch mal spontan über den Haufen zu werfen, ohne dass es sich falsch anfühlt.'},
      low: {teaser:'Du bleibst flexibel, wo andere sich an Plänen festhalten.',
      alltag:'Starre Routinen fühlen sich für dich schnell einengend an — du reagierst lieber im Moment, als jeden Schritt vorab festzulegen.',
      beziehungen:'Das macht dich anpassungsfähig und offen für Spontanes, kann aber bei Deadlines oder gemeinsamen Vorhaben zu Reibung führen.',
      wachstum:'Externalisiere klare Absprachen (Kalender, Erinnerungen), statt dich auf reine Willenskraft zu verlassen. Wähle ein einziges Ritual, das du diese Woche konsequent durchziehst.'} },
    S: { high: {teaser:'Du bleibst auch unter Druck erstaunlich ruhig.',
      alltag:'Rückschläge und Stress bringen dich selten aus der Fassung — du reagierst eher abwägend als impulsiv und erholst dich schnell von negativen Erlebnissen.',
      beziehungen:'Das macht dich in Krisen zu einer stabilisierenden Kraft für dein Umfeld. Deine Gelassenheit kann von Menschen mit stärkeren Gefühlsausschlägen manchmal als Distanz missverstanden werden.',
      wachstum:'Zeig aktiv, wenn dich etwas doch bewegt. Worte für Gefühle zu finden macht deine Ruhe für andere greifbarer statt unnahbar.'},
      low: {teaser:'Du fühlst intensiv – das macht dich feinfühlig für Zwischentöne, die andere übersehen.',
      alltag:'Stimmungen, eigene wie fremde, wirken bei dir stärker nach — Stress, Sorgen oder Anspannung spürst du intensiver und schneller als andere.',
      beziehungen:'Das ist keine Schwäche, sondern erhöhte Sensibilität: Du nimmst Feinheiten in Beziehungen oft früher wahr als andere.',
      wachstum:'Richte dir bewusste Erholungsräume ein, statt Anspannung aufzuschieben, bis sie sich staut. Eine feste kleine Routine (Atmung, Bewegung, Schlafrhythmus) wirkt bei dir besonders spürbar.'} },
    O: { high: {teaser:'Neue Ideen und ungewohnte Blickwinkel ziehen dich magisch an.',
      alltag:'Du hinterfragst gern Gewohntes, denkst in Möglichkeiten statt in Regeln und findest ungewöhnliche Verbindungen zwischen Themen.',
      beziehungen:'Das macht dich kreativ und anregend im Gespräch. Du profitierst von Menschen, die deine Ideen erden, ohne sie klein zu machen.',
      wachstum:'Wähle eine Idee pro Monat aus, die du tatsächlich zu Ende bringst — Tiefe entsteht durch Fokus, nicht nur durch Breite.'},
      low: {teaser:'Du vertraust auf Bewährtes und hältst die Füße auf dem Boden.',
      alltag:'Du bevorzugst Konkretes vor Abstraktem und bewährte Lösungen vor Experimenten.',
      beziehungen:'Das macht dich praktisch und geerdet — du bist oft der ruhende Pol, der Pläne tatsächlich umsetzt statt nur davon zu träumen.',
      wachstum:'Lass dich bewusst einmal im Monat auf etwas völlig Neues ein, das nicht sofort einen erkennbaren Nutzen hat. Nicht jede Erfahrung muss sich rechnen.'} }
  };

  var CORE = {
    E:{ high:'Du bist die Person, bei der ein Raum lauter wird, sobald du reinkommst.', low:'Du bist die Person, die einen Raum liest, bevor sie ihn betritt.' },
    A:{ high:'Du bist die Person, bei der sich andere fallen lassen können.', low:'Du bist die Person, die man fragt, wenn man die Wahrheit will und keine Schonung.' },
    C:{ high:'Du bist die Person, auf die sich andere verlassen, ohne es laut sagen zu müssen.', low:'Du bist die Person, die merkt, wenn ein Plan gerade zu eng wird.' },
    S:{ high:'Du bist die Person im Raum, die auch dann noch ruhig atmet, wenn alle anderen die Nerven verlieren.', low:'Du bist die Person, die spürt, was in der Luft liegt, lange bevor es jemand ausspricht.' },
    O:{ high:'Du bist die Person, die eine Frage stellt, auf die noch niemand gekommen ist.', low:'Du bist die Person, die ein Versprechen tatsächlich einlöst, statt nur davon zu träumen.' }
  };
  var FLAVOR = {
    E:{ high:'Dabei suchst du aktiv die Nähe zu anderen — Energie ist für dich etwas, das zwischen Menschen entsteht.', low:'Dabei bleibst du lieber im Hintergrund, auch wenn du längst die Fäden in der Hand hast.' },
    A:{ high:'Dabei hast du immer ein offenes Ohr für das, was andere gerade wirklich brauchen.', low:'Dabei scheust du dich nicht, eine unbequeme Wahrheit auszusprechen, wenn es nötig ist.' },
    C:{ high:'Dabei hast du einen Blick für Struktur, der selten etwas durchrutschen lässt.', low:'Dabei klammerst du dich nicht an starre Pläne, sondern reagierst lieber im Moment.' },
    S:{ high:'Dabei bringst du eine Ruhe mit, die auf andere ansteckend wirkt.', low:'Dabei kostet dich das manchmal mehr, als andere von außen sehen.' },
    O:{ high:'Dabei bist du ständig auf der Suche nach der nächsten Idee, die es wert ist, verfolgt zu werden.', low:'Dabei bleibst du lieber bei dem, was sich in der Praxis schon bewährt hat.' }
  };
  var MOTTO = {
    E:{ high:'Lädt jeden Raum auf.', low:'Beobachtet zuerst, spricht dann.' },
    A:{ high:'Fühlt mit, bevor gefragt wird.', low:'Sagt, was Sache ist.' },
    C:{ high:'Baut, was hält.', low:'Bleibt flexibel, wenn andere starr werden.' },
    S:{ high:'Bleibt ruhig, wenn’s kippt.', low:'Spürt, was andere übersehen.' },
    O:{ high:'Stellt die Frage, die noch fehlt.', low:'Vertraut, was sich bewährt hat.' }
  };

  var NOUN = { E:{high:'Verbinder:in', low:'Beobachter:in'}, A:{high:'Brückenbauer:in', low:'Realist:in'},
    C:{high:'Baumeister:in', low:'Freigeist'}, S:{high:'Anker', low:'Feinfühler:in'}, O:{high:'Visionär:in', low:'Bewahrer:in'} };
  var ADJ = { E:{high:'gesellig', low:'ruhig'}, A:{high:'warmherzig', low:'direkt'},
    C:{high:'strukturiert', low:'spontan'}, S:{high:'gelassen', low:'feinfühlig'}, O:{high:'neugierig', low:'bodenständig'} };

  var COMPAT = {
    E:{ similar:'Ihr braucht ähnlich viel soziale Energie – gemeinsame Zeit lässt sich leicht abstimmen.', diff:'Eine Person lädt sich in Gesellschaft auf, die andere eher im Rückzug. Sprecht offen ab, wie viel gemeinsame vs. eigene Zeit ihr braucht.'},
    A:{ similar:'Ihr tickt bei Rücksichtnahme und Direktheit ähnlich – eure Erwartungen ans Gespräch passen zusammen.', diff:'Eine Person entscheidet eher nach Gefühl, die andere eher nach Fakten. Das kann sich gut ergänzen, wenn ihr Kritik bewusst in der Sprache des anderen formuliert.'},
    C:{ similar:'Euer Umgang mit Plänen und Ordnung ist ähnlich getaktet – das bedeutet weniger Reibung im Alltag.', diff:'Eine Person plant gern durch, die andere bleibt lieber spontan. Feste Absprachen (Kalender, klare Deadlines) beugen Frust auf beiden Seiten vor.'},
    S:{ similar:'Ihr geht ähnlich mit Stress um – ihr versteht intuitiv, wie viel Raum der andere in schwierigen Momenten braucht.', diff:'Eine Person bleibt in stressigen Momenten ruhig, die andere reagiert emotionaler. Wichtig: Niemand muss sich für seine Reaktion rechtfertigen.'},
    O:{ similar:'Eure Offenheit für Neues liegt auf ähnlichem Niveau – eure Vorstellung von einem guten gemeinsamen Abend dürfte zusammenpassen.', diff:'Eine Person sucht eher Neues, die andere Bewährtes. Wechselt euch bewusst ab, wer die nächste Aktivität aussucht.'}
  };

  // "Verstehen"-Bibliothek: kurze, an etablierte Big-Five-Forschung angelehnte Einordnungen,
  // bewusst getrennt vom Alltag/Beziehungen/Wachstum-Bericht oben — keine neuen Sub-Facetten,
  // sondern breit replizierte Zusammenhänge auf Dimensionsebene, vorsichtig formuliert
  // ("Studien deuten auf ... hin" statt fixer Behauptungen).
  var UNDERSTAND = {
    O:{ high:[
        {title:'Offenheit und kreatives Denken', body:'Mehrere Studien finden einen Zusammenhang zwischen hoher Offenheit und divergentem, assoziativem Denken — der Fähigkeit, zu einer Frage viele unterschiedliche Lösungswege zu finden statt nur den naheliegendsten.'},
        {title:'Offenheit und Ambiguitätstoleranz', body:'Menschen mit hoher Offenheit berichten häufiger, uneindeutige oder widersprüchliche Situationen als interessant statt als bedrohlich zu erleben — ein Muster, das in der Forschung als Ambiguitätstoleranz bezeichnet wird.'}
      ], low:[
        {title:'Bodenständigkeit und Entscheidungstempo', body:'Eine Präferenz für Bewährtes vor Experimenten korreliert in Studien häufig mit schnelleren, weniger grüblerischen Alltagsentscheidungen — weniger Optionen bedeuten weniger Abwägen.'},
        {title:'Struktur statt Reizüberflutung', body:'Wer neue Reize eher selektiv sucht, berichtet in Befragungen tendenziell seltener von kognitiver Überlastung in reizintensiven Umgebungen — ein möglicher Vorteil in stark strukturierten Arbeitsfeldern.'}
      ] },
    C:{ high:[
        {title:'Gewissenhaftigkeit und Gesundheit', body:'Gewissenhaftigkeit gehört zu den am robustesten replizierten Prädiktoren für gesundheitsförderliches Verhalten über die Lebensspanne — u. a. regelmäßigere Vorsorge und seltener riskantes Verhalten.'},
        {title:'Verlässlichkeit als messbarer Vorteil', body:'In arbeitspsychologischen Studien zählt Gewissenhaftigkeit branchenübergreifend zu den stärksten Persönlichkeits-Prädiktoren für Arbeitsleistung — stärker als die meisten anderen Big-Five-Dimensionen.'}
      ], low:[
        {title:'Flexibilität unter Unsicherheit', body:'Eine geringere Vorliebe für starre Pläne geht in Studien häufig mit einer schnelleren Anpassung an unerwartete Veränderungen einher — ein Vorteil in dynamischen, wenig planbaren Umgebungen.'},
        {title:'Spontaneität und Alltagszufriedenheit', body:'Manche Untersuchungen finden bei niedrigerer Gewissenhaftigkeit eine größere Bereitschaft, spontane Gelegenheiten wahrzunehmen — mit messbar mehr berichteten positiven Alltagsmomenten in manchen Stichproben.'}
      ] },
    E:{ high:[
        {title:'Extraversion und positive Emotionen', body:'Extraversion ist die Big-Five-Dimension mit dem stärksten und am häufigsten replizierten Zusammenhang zu selbstberichteten positiven Gefühlen im Alltag — unabhängig davon, was gerade passiert.'},
        {title:'Soziale Energie als Ressource', body:'Studien zu sozialer Interaktion zeigen, dass extravertierte Personen nach Gesprächen mit Fremden im Schnitt eine Stimmungsverbesserung berichten — introvertierte Personen im Schnitt seltener.'}
      ], low:[
        {title:'Introversion und fokussierte Arbeit', body:'Mehrere Studien zu kognitiver Leistung finden bei introvertierteren Personen im Schnitt eine geringere Ablenkbarkeit durch zusätzliche soziale Reize bei konzentrationsintensiven Aufgaben.'},
        {title:'Tiefe statt Breite im sozialen Kontakt', body:'Introvertiertere Personen berichten in Befragungen tendenziell von weniger, aber als bedeutsamer erlebten engen Beziehungen — ein Muster, das unabhängig von der reinen Kontaktanzahl mit Wohlbefinden zusammenhängt.'}
      ] },
    A:{ high:[
        {title:'Verträglichkeit und Beziehungszufriedenheit', body:'Hohe Verträglichkeit zählt in Partnerschaftsstudien konsistent zu den stärksten Persönlichkeits-Prädiktoren für gegenseitig berichtete Beziehungszufriedenheit — bei beiden Partner:innen.'},
        {title:'Kooperation in Gruppen', body:'In Verhaltensexperimenten (u. a. ökonomischen Spielen) verhalten sich Personen mit hoher Verträglichkeit im Schnitt kooperativer, selbst wenn kurzfristiger Eigennutz möglich wäre.'}
      ], low:[
        {title:'Direktheit als Verhandlungsvorteil', body:'Studien zu Gehalts- und Vertragsverhandlungen finden bei weniger verträglichen Personen im Schnitt bessere Verhandlungsergebnisse für sich selbst — Durchsetzungsfähigkeit zahlt sich hier messbar aus.'},
        {title:'Widerstand gegen Gruppendruck', body:'Eine geringere Tendenz, es allen recht machen zu wollen, geht in Studien zu Konformität häufig mit einer höheren Bereitschaft einher, einer Gruppenmeinung offen zu widersprechen.'}
      ] },
    S:{ high:[
        {title:'Emotionale Stabilität und Stressresistenz', body:'Personen mit hoher emotionaler Stabilität zeigen in Laborstudien zu Stressreizen im Schnitt eine schnellere körperliche Erholung (u. a. Herzrate) nach der Belastung.'},
        {title:'Stabilität und Lebenszufriedenheit', body:'Über viele Studien hinweg ist emotionale Stabilität neben Extraversion einer der beiden stärksten Big-Five-Prädiktoren für allgemein berichtete Lebenszufriedenheit.'}
      ], low:[
        {title:'Sensibilität als früherer Warnradar', body:'Personen mit stärkeren Gefühlsausschlägen nehmen in Studien zu emotionaler Wahrnehmung subtile Stimmungsveränderungen bei anderen im Schnitt schneller wahr — eine Kehrseite erhöhter emotionaler Reaktivität.'},
        {title:'Vorsicht als Schutzfaktor', body:'Eine stärkere Neigung, mögliche Risiken vorab zu bedenken, hängt in manchen Studien mit vorsichtigerem, seltener riskantem Verhalten in unklaren Situationen zusammen.'}
      ] }
  };

  // ---------- state ----------
  var answers = new Array(50).fill(0);
  var qi = 0;
  var scores = null; // {E,A,C,S,O} 0-100
  var pendingCompareScroll = false;
  var resetArmed = false, resetArmTimeout = null;
  var lastCompatSnapshot = null;

  var $ = function(id){ return document.getElementById(id); };
  // Feedback: "SELBSTPORTRÄT" oben rechts auf der Landing-Seite war verwirrend, da dort noch kein
  // Ergebnis existiert — anders als bei den übrigen Labels, die alle den tatsächlichen aktuellen
  // Zustand beschreiben (AUFNAHME während des Quiz, ERGEBNIS nach Abschluss usw.). Landing bleibt
  // jetzt bewusst ohne Label, die Überschrift im Hero übernimmt diese Rolle bereits.
  // 'history' entfernt: view-history existiert nicht mehr, der Verlauf lebt jetzt innerhalb von
  // view-profile (siehe VIEW_LABELS.profile).
  var VIEW_LABELS = {landing:'', quiz:'AUFNAHME', result:'ERGEBNIS', archetypes:'ARCHETYPEN', state:'TAGESFORM', profile:'PROFIL', settings:'EINSTELLUNGEN', 'compat-archive':'ARCHIV', understand:'VERSTEHEN'};
  function disarmResetButton(){
    if (!resetArmed) return;
    resetArmed = false;
    clearTimeout(resetArmTimeout);
    var btn = $('btnResetData');
    if (btn){ btn.classList.remove('armed'); btn.textContent = 'Eigene Daten zurücksetzen'; }
  }
  // Feedback-Runde 45: Klartext-Titel für die Fensterbeschriftung. VIEW_LABELS sind kurze
  // Versalien für die Kopfzeile und eignen sich dafür nicht.
  var VIEW_TITLES = {landing:'', quiz:'Fragebogen', result:'Dein Ergebnis', archetypes:'Archetypen',
    state:'Tagesform', profile:'Profil', settings:'Einstellungen', 'compat-archive':'Vergleichsarchiv',
    understand:'Verstehen'};
  var currentView = 'landing';
  var viewScroll = {};

  // Die Zurück-Geste des Systems — auf dem iPhone das Wischen vom linken Rand — führte bisher aus
  // der App heraus, weil jeder Ansichtswechsel im Verlauf unsichtbar blieb. Jetzt legt jeder
  // Wechsel einen Eintrag an, sodass die Geste innerhalb der App zurückführt. Überlagerungen
  // (Schublade, Bild-Dialog) bekommen ebenfalls einen Eintrag: die Geste schließt dann zuerst sie,
  // bevor sie die Ansicht wechselt — genau das Verhalten, das man von einer nativen App kennt.
  var historyOK = true, overlayDepth = 0;
  function pushViewState(name){
    if (!historyOK) return;
    try{
      if (overlayDepth>0){ history.replaceState({lucentaView:name}, ''); overlayDepth = 0; }
      else { history.pushState({lucentaView:name}, ''); }
    }catch(e){ historyOK = false; }
  }
  function pushOverlayState(kind){
    if (!historyOK) return;
    try{ history.pushState({lucentaOverlay:kind, lucentaView:currentView}, ''); overlayDepth++; }
    catch(e){ historyOK = false; }
  }
  function popOverlayState(){
    if (!historyOK || overlayDepth<=0) return;
    overlayDepth--;
    try{ history.back(); }catch(e){}
  }

  function showView(name, opts){
    opts = opts || {};
    // Scrollposition der verlassenen Ansicht merken, damit die Zurück-Geste an dieselbe Stelle
    // zurückführt statt an den Seitenanfang — bei einer acht Bildschirme langen Ergebnisseite
    // ist das der Unterschied zwischen „zurück" und „von vorn suchen".
    if (currentView && currentView !== name) viewScroll[currentView] = window.scrollY;
    document.querySelectorAll('.view').forEach(function(v){ v.classList.remove('active'); });
    var section = $('view-'+name);
    section.classList.add('active');
    currentView = name;
    $('viewLabel').textContent = VIEW_LABELS[name] || '';
    document.title = VIEW_TITLES[name] ? ('Lucenta — '+VIEW_TITLES[name]) : 'Lucenta';
    window.scrollTo({top: opts.restoreScroll ? (viewScroll[name]||0) : 0, behavior:'instant' in window ? 'instant':'auto'});
    syncHeaderScrollState();
    if (name!=='quiz'){ $('focusline-fill').style.width = name==='result' ? '100%':'0%'; disarmQuizAdvance(); }
    if (name!=='settings'){ disarmResetButton(); }
    // Bugfix Feedback-Runde 39: renderLandingUnderstandTeaser() blendet die "Verstehen"-Karte
    // seit Runde 38 abhängig vom Vorhandensein eines Ergebnisses ein/aus, wurde bisher aber nur
    // einmal beim allerersten Laden der Seite aufgerufen (siehe init() weiter unten) — nicht bei
    // jeder Rückkehr zur Startseite. Für Erstbesucher:innen blieb die Karte dadurch nach dem
    // ersten abgeschlossenen Test dauerhaft versteckt, obwohl jetzt ein Ergebnis vorliegt (und
    // umgekehrt nach "Eigene Daten zurücksetzen" fälschlich weiter sichtbar). Jetzt Teil derselben
    // Landing-Aktualisierung wie syncHeroState()/renderLandingStateTeaser(), die aus genau diesem
    // Grund schon bei jedem showView('landing') statt nur einmalig laufen.
    if (name==='landing'){ syncHeroState(); renderLandingStateTeaser(); renderLandingUnderstandTeaser(); }
    if (!opts.fromHistory) pushViewState(name);
    // Fokus an den Anfang der neuen Ansicht setzen, damit Vorleseprogramme den Wechsel überhaupt
    // bemerken — ohne das bleibt der Fokus auf der angetippten Schaltfläche der alten Ansicht.
    // preventScroll, weil die Scrollposition eine Zeile darüber bereits gesetzt wurde.
    try{ section.focus({preventScroll:true}); }catch(e){}
  }
  window.addEventListener('popstate', function(e){
    // Offene Überlagerungen zuerst schließen: die Zurück-Geste soll das Panel schließen,
    // nicht dahinter die Ansicht wechseln.
    if ($('drawerPanel').classList.contains('open')){
      overlayDepth = Math.max(0, overlayDepth-1); closeDrawer(true); return;
    }
    if ($('imgModal').classList.contains('open')){
      overlayDepth = Math.max(0, overlayDepth-1); closeImgModal(true); return;
    }
    var st = e.state;
    var name = (st && st.lucentaView) || 'landing';
    if (!$('view-'+name)) name = 'landing';
    if (name === currentView) return;
    showView(name, {fromHistory:true, restoreScroll:true});
  });
  // Feedback: die obere Leiste ist jetzt sticky (siehe header.top-CSS) — die Trennlinie darunter
  // soll aber erst auftauchen, sobald wirklich gescrollt wurde, nicht permanent stehen. Ein Listener
  // genügt für alle Screens, weil die Leiste außerhalb von #mainContent liegt und beim Wechsel der
  // .view nicht neu erzeugt wird.
  var headerTopEl = null;
  function syncHeaderScrollState(){
    if (!headerTopEl) headerTopEl = document.querySelector('header.top');
    if (headerTopEl) headerTopEl.classList.toggle('scrolled', window.scrollY > 2);
  }
  window.addEventListener('scroll', syncHeaderScrollState, {passive:true});

  // Die Startseite hat bisher jeder Besucherin, egal ob neu oder wiederkehrend, exakt dieselbe
  // Werbe-Ansicht mit "Test starten" gezeigt — selbst mit einem fertigen Ergebnis auf dem Gerät.
  // Für wiederkehrende Nutzer:innen stellt der Haupt-Button jetzt das eigentlich Relevante voran.
  function syncHeroState(){
    var progress = loadProgress();
    var result = loadResult();
    var btn = $('btnStart'), sec = $('btnHeroSecondary');
    if (progress){
      btn.textContent = 'Weitermachen (Frage '+(progress.qi+1)+'/50) →';
      btn.onclick = function(){ answers=progress.answers; qi=progress.qi; renderQuestion(); showView('quiz'); };
      sec.style.display = '';
      if (result){
        sec.textContent = 'Dein letztes Ergebnis ansehen';
        sec.onclick = function(){ scores=result; renderResult(); showView('result'); };
      } else {
        sec.textContent = 'Neu starten';
        sec.onclick = function(){ answers=new Array(50).fill(0); qi=0; clearProgress(); renderQuestion(); showView('quiz'); };
      }
    } else if (result){
      btn.textContent = 'Dein Ergebnis ansehen →';
      btn.onclick = function(){ scores=result; renderResult(); showView('result'); };
      sec.style.display = '';
      sec.textContent = 'Test erneut machen';
      sec.onclick = function(){ answers=new Array(50).fill(0); qi=0; clearProgress(); renderQuestion(); showView('quiz'); };
    } else {
      btn.textContent = 'Test starten →';
      btn.onclick = function(){ answers=new Array(50).fill(0); qi=0; clearProgress(); renderQuestion(); showView('quiz'); };
      sec.style.display = 'none';
    }
  }

  // ---------- persistence (per-viewer convenience only) ----------
  // Alle Speicherfunktionen unten fangen Schreibfehler bereits ab und scheitern still —
  // richtig für den Fall "Speicherkontingent voll" (Feedback-Runde 21). Ist localStorage aber
  // grundsätzlich unerreichbar (z. B. manche privaten Browser-Modi), würde das sonst überall
  // lautlos ins Leere laufen. Ein einmaliger Check beim Start macht das stattdessen sichtbar.
  function storageAvailable(){
    try{
      var k = '__lucenta_probe__';
      localStorage.setItem(k, '1');
      localStorage.removeItem(k);
      return true;
    }catch(e){ return false; }
  }
  function saveResult(sc){
    try{ localStorage.setItem('lucenta_result', JSON.stringify(sc)); }catch(e){}
  }
  function loadResult(){
    try{
      var r = localStorage.getItem('lucenta_result');
      if (!r) return null;
      var sc = JSON.parse(r);
      if (!sc || typeof sc!=='object') return null;
      for (var i=0;i<ORDER.length;i++){
        var v = sc[ORDER[i]];
        if (typeof v!=='number' || isNaN(v) || v<0 || v>100) return null;
      }
      return sc;
    }catch(e){ return null; }
  }
  function saveProgress(){
    try{ localStorage.setItem('lucenta_progress', JSON.stringify({answers:answers, qi:qi})); }catch(e){}
  }
  function loadProgress(){
    try{
      var r = localStorage.getItem('lucenta_progress');
      if (!r) return null;
      var p = JSON.parse(r);
      if (!p || !Array.isArray(p.answers) || p.answers.length!==50 || typeof p.qi!=='number' || p.qi<1 || p.qi>49) return null;
      return p;
    }catch(e){ return null; }
  }
  function clearProgress(){
    try{ localStorage.removeItem('lucenta_progress'); }catch(e){}
  }
  // Rollierender Verlauf abgeschlossener Testdurchläufe (unabhängig vom einzelnen "letzten
  // Ergebnis" oben) — Grundlage für die Trend-Sparklines in der Verlauf-Ansicht. Auf die letzten
  // MAX_HISTORY Einträge begrenzt, damit der lokale Speicher nicht unbegrenzt wächst.
  var MAX_HISTORY = 12;
  function loadHistory(){
    try{
      var r = localStorage.getItem('lucenta_history');
      if (!r) return [];
      var h = JSON.parse(r);
      if (!Array.isArray(h)) return [];
      return h.filter(function(e){
        if (!e || typeof e!=='object' || typeof e.date!=='number' || !e.scores) return false;
        for (var i=0;i<ORDER.length;i++){
          var v = e.scores[ORDER[i]];
          if (typeof v!=='number' || isNaN(v) || v<0 || v>100) return false;
        }
        return true;
      });
    }catch(e){ return []; }
  }
  function saveHistoryList(h){
    try{ localStorage.setItem('lucenta_history', JSON.stringify(h)); return true; }catch(e){ return false; }
  }
  function appendHistory(sc){
    var h = loadHistory();
    h.push({scores:sc, date:Date.now()});
    if (h.length>MAX_HISTORY) h = h.slice(h.length-MAX_HISTORY);
    saveHistoryList(h);
  }
  function clearHistory(){
    try{ localStorage.removeItem('lucenta_history'); }catch(e){}
  }
  // Tagesform / State-Check: kurzfristiger Zustand (Energie, Stimmung), bewusst als eigenes
  // Datenmodell getrennt vom stabilen Trait-Ergebnis oben (State vs. Trait) — höchstens ein
  // Eintrag pro Kalendertag, ein erneutes Speichern am selben Tag aktualisiert den Eintrag.
  var MAX_STATE_HISTORY = 30;
  function todayKey(){
    var d = new Date();
    return d.getFullYear()+'-'+String(d.getMonth()+1).padStart(2,'0')+'-'+String(d.getDate()).padStart(2,'0');
  }
  function loadStateHistory(){
    try{
      var r = localStorage.getItem('lucenta_state');
      if (!r) return [];
      var h = JSON.parse(r);
      if (!Array.isArray(h)) return [];
      return h.filter(function(e){
        return e && typeof e==='object' && typeof e.day==='string' &&
          typeof e.energy==='number' && e.energy>=1 && e.energy<=5 &&
          typeof e.valence==='number' && e.valence>=1 && e.valence<=5;
      });
    }catch(e){ return []; }
  }
  function saveStateHistoryList(h){
    try{ localStorage.setItem('lucenta_state', JSON.stringify(h)); return true; }catch(e){ return false; }
  }
  function upsertStateToday(energy, valence){
    var h = loadStateHistory();
    var key = todayKey();
    h = h.filter(function(e){ return e.day!==key; });
    h.push({day:key, ts:Date.now(), energy:energy, valence:valence});
    h.sort(function(a,b){ return a.ts-b.ts; });
    if (h.length>MAX_STATE_HISTORY) h = h.slice(h.length-MAX_STATE_HISTORY);
    return saveStateHistoryList(h);
  }
  function todayStateEntry(){
    var key = todayKey();
    var h = loadStateHistory();
    for (var i=0;i<h.length;i++){ if (h[i].day===key) return h[i]; }
    return null;
  }
  function clearStateHistory(){
    try{ localStorage.removeItem('lucenta_state'); }catch(e){}
  }
  // Vergleichsarchiv: mehrere gespeicherte Kompatibilitäts-Vergleiche mit unterschiedlichen
  // Personen, unabhängig vom zuletzt berechneten Einzelvergleich im Kompatibilitäts-Tool.
  // Jeder Eintrag ist ein Schnappschuss (eigener Code, Code der anderen Person, optionales Label,
  // Zeitpunkt, Übereinstimmungs-Prozentzahl) — ändert sich das eigene Ergebnis später, bleibt der
  // gespeicherte Vergleich unverändert nachvollziehbar, analog zum Verlauf-Datenmodell oben.
  var MAX_COMPAT_ARCHIVE = 20;
  function loadCompatArchive(){
    try{
      var r = localStorage.getItem('lucenta_compat_archive');
      if (!r) return [];
      var h = JSON.parse(r);
      if (!Array.isArray(h)) return [];
      return h.filter(function(e){
        return e && typeof e==='object' && typeof e.id==='string' &&
          typeof e.ts==='number' && typeof e.myCode==='string' && typeof e.otherCode==='string' &&
          typeof e.match==='number' && !isNaN(e.match);
      });
    }catch(e){ return []; }
  }
  function saveCompatArchiveList(h){
    try{ localStorage.setItem('lucenta_compat_archive', JSON.stringify(h)); return true; }catch(e){ return false; }
  }
  function appendCompatArchiveEntry(entry){
    var h = loadCompatArchive();
    h.push(entry);
    if (h.length>MAX_COMPAT_ARCHIVE) h = h.slice(h.length-MAX_COMPAT_ARCHIVE);
    return saveCompatArchiveList(h);
  }
  function removeCompatArchiveEntry(id){
    var h = loadCompatArchive().filter(function(e){ return e.id!==id; });
    return saveCompatArchiveList(h);
  }
  function clearCompatArchive(){
    try{ localStorage.removeItem('lucenta_compat_archive'); }catch(e){}
  }
  function saveProfile(p){
    try{ localStorage.setItem('lucenta_profile', JSON.stringify(p)); return true; }catch(e){ return false; }
  }
  function loadProfile(){
    try{ var r = localStorage.getItem('lucenta_profile'); return r? JSON.parse(r): {name:'', avatarImg:null}; }catch(e){ return {name:'', avatarImg:null}; }
  }
  function clearProfile(){
    try{ localStorage.removeItem('lucenta_profile'); }catch(e){}
  }
  function saveThemeMode(mode){
    try{
      if (mode==='system') localStorage.removeItem('lucenta_theme');
      else localStorage.setItem('lucenta_theme', mode);
    }catch(e){}
  }
  function loadThemeMode(){
    try{
      var t = localStorage.getItem('lucenta_theme');
      return (t==='dark' || t==='light') ? t : 'system';
    }catch(e){ return 'system'; }
  }
  // Die beiden theme-color-Angaben im Kopf greifen nur nach Systemeinstellung. Wählt jemand
  // ausdrücklich hell oder dunkel, würde die Systemleiste sonst weiter der Systemeinstellung
  // folgen und farblich von der App abweichen. Ein zusätzlicher, nachgestellter Eintrag ohne
  // Medienbedingung übersteuert das; bei „System" wird er wieder entfernt.
  function syncThemeColor(mode){
    try{
      var head = document.head || document.getElementsByTagName('head')[0];
      if (!head) return;
      var el = document.getElementById('themeColorNow');
      if (mode!=='dark' && mode!=='light'){
        if (el && el.parentNode) el.parentNode.removeChild(el);
        return;
      }
      if (!el){
        el = document.createElement('meta');
        el.id = 'themeColorNow';
        el.setAttribute('name','theme-color');
        head.appendChild(el);
      }
      el.setAttribute('content', mode==='dark' ? '#0F1613' : '#F5F6EF');
    }catch(e){}
  }
  function applyTheme(mode){
    if (mode==='dark' || mode==='light') document.documentElement.setAttribute('data-theme', mode);
    else document.documentElement.removeAttribute('data-theme');
    syncThemeColor(mode);
    saveThemeMode(mode);
    ['System','Light','Dark'].forEach(function(key){
      var btn = $('theme'+key);
      if (btn) btn.setAttribute('aria-pressed', btn.dataset.mode===mode ? 'true':'false');
    });
  }

  // ---------- scoring ----------
  function computeScores(){
    var sums = {E:0,A:0,C:0,S:0,O:0};
    for (var idx=0; idx<50; idx++){
      var it = ITEMS[idx];
      var a = answers[idx] || 3;
      var val = it.key===1 ? a : (6-a);
      sums[it.factor]+= val;
    }
    var out = {};
    ORDER.forEach(function(f){ out[f] = Math.round(((sums[f]-10)/40)*100); });
    return out;
  }

  // Feedback-Runde 41: Erkennung sehr gleichförmiger Antwortmuster ("Straight-Lining").
  // Hintergrund: die Punkteberechnung selbst ist korrekt und folgt exakt der Item-Polung des
  // wissenschaftlichen IPIP-50 — aber diese Polung ist je Dimension unterschiedlich verteilt (nur
  // Extraversion ist mit 5 positiv / 5 negativ ausgeglichen, emotionale Stabilität dagegen 2/8).
  // Dadurch ergibt 50x dieselbe Antwort kein neutrales 50/50/50/50/50-Profil, sondern ein deutlich
  // ausgeprägtes, das wie ein echtes Ergebnis aussieht. An der Berechnung wird bewusst nichts
  // geändert (das würde bestehende Ergebnisse verschieben und vom validierten Instrument abweichen);
  // stattdessen wird das Muster erkannt und auf der Ergebnisseite offen benannt.
  // Kennzahl: Anteil der häufigsten Antwort an allen abgegebenen Antworten.
  var UNIFORM_THRESHOLD = 0.8;
  function answerUniformity(list){
    var counts = {}, n = 0, max = 0;
    for (var i=0;i<list.length;i++){
      var v = list[i];
      if (!v) continue; // unbeantwortete Items zählen nicht mit
      counts[v] = (counts[v]||0) + 1;
      if (counts[v] > max) max = counts[v];
      n++;
    }
    return n ? max/n : 0;
  }

  function archetypeOf(sc){
    var dev = ORDER.map(function(f){ return {f:f, d:Math.abs(sc[f]-50)}; });
    dev.sort(function(a,b){ return b.d-a.d; });
    var top1 = dev[0].f, top2 = dev[1].f;
    var pole1 = sc[top1]>=50 ? 'high':'low';
    var pole2 = sc[top2]>=50 ? 'high':'low';
    return { title: NOUN[top1][pole1] + ' · ' + ADJ[top2][pole2], top1:top1, top2:top2 };
  }

  // ---------- archetypes overview (the 10 primary roles, generated from the same data the real result uses) ----------
  function renderArchetypeGroups(){
    var roles = [];
    ORDER.forEach(function(t){
      ['high','low'].forEach(function(p){
        roles.push({ title: NOUN[t][p], motto: MOTTO[t][p], desc: CORE[t][p], dim: t, pole: p });
      });
    });
    var totalCombos = roles.length * (ORDER.length-1) * 2; // each role paired with 4 other traits × 2 poles
    $('archTotalCount').textContent = totalCombos;
    // Jede Rolle stammt aus genau einer der fünf Dimensionen — das war bisher unsichtbar.
    // Ein kleiner Tag macht die Herkunft transparent und bricht zehn sonst identisch wirkende
    // Karten optisch auf, ohne neue Texte erfinden zu müssen (nutzt das vorhandene ADJ-Vokabular).
    $('archetypeGroups').innerHTML = roles.map(function(r,i){
      return '<div class="role-card" style="animation-delay:'+(i*40)+'ms">'+
        '<div class="role-tag role-tag-'+r.pole+'">'+LABELS[r.dim]+' &middot; '+ADJ[r.dim][r.pole]+'</div>'+
        '<div class="role-title">'+r.title+'</div>'+
        '<div class="role-motto">'+r.motto+'</div>'+
        '<p class="role-desc">'+r.desc+'</p>'+
        '</div>';
    }).join('');
  }

  // ---------- history (trend sparklines + list of past completed runs) ----------
  var HISTORY_DATE_FMT = null;
  // Landing-Teaser für die "Verstehen"-Bibliothek (Feedback-Runde 32): zieht eine zufällige Karte
  // aus UNDERSTAND, unabhängig vom eigenen Ergebnis (auf der Landing-Seite liegt meist noch keins
  // vor). Rein informativ und macht die Bibliothek vor dem ersten Testdurchlauf sichtbar, statt sie
  // ausschließlich hinter der Schublade zu verstecken.
  function pickRandomUnderstandCard(){
    var dims = Object.keys(UNDERSTAND);
    var dim = dims[Math.floor(Math.random()*dims.length)];
    var pole = Math.random()<0.5 ? 'high' : 'low';
    var pool = UNDERSTAND[dim][pole];
    return pool[Math.floor(Math.random()*pool.length)];
  }
  // Feedback-Runde 38: für Erstbesucher:innen ohne Ergebnis stapelten sich auf der Startseite drei
  // umrandete Karten hintereinander (Warum-kein-MBTI, Tagesform, Verstehen), bevor überhaupt die
  // Beispiel-Vorschau kam — sichtbare Unordnung genau in dem Moment, der eigentlich zum Teststart
  // einladen soll. Der Tagesform-Check bleibt sichtbar (funktioniert bewusst unabhängig vom
  // Testergebnis), aber die "Verstehen"-Karte zeigt ohne eigenes Ergebnis ohnehin nur eine
  // zufällige, nicht personalisierte Einordnung — für Erstbesucher:innen also reine Zusatzkarte ohne
  // echten Mehrwert. Sie erscheint deshalb erst, sobald ein Ergebnis vorliegt (wie im Drawer und in
  // der vollständigen Verstehen-Ansicht ohnehin schon der Fall).
  function renderLandingUnderstandTeaser(){
    var has = !!loadResult();
    $('landingUnderstandTeaser').style.display = has ? '' : 'none';
    if (!has) return;
    var card = pickRandomUnderstandCard();
    $('landingTeaserTitle').textContent = card.title;
    $('landingTeaserBody').textContent = card.body;
  }
  // Gemeinsamer Leerzustands-Baustein (Feedback-Runde 32): bündelt das bislang sechsfach
  // duplizierte reine-Text-Muster hinter einem konsistenten Icon + Text (+ optionalem CTA-Button),
  // angelehnt an das Empty-State-Muster gängiger Consumer-Apps. Icon ist ein neutrales,
  // gestricheltes Uhr-/Zeit-Symbol (passt zu "noch nichts erfasst"), kein neuer Bedeutungsträger.
  function emptyStateHTML(message, opts){
    opts = opts || {};
    var extra = opts.extraClass ? (' '+opts.extraClass) : '';
    var btn = opts.btnId
      ? '<button type="button" class="btn btn-primary btn-sm" id="'+opts.btnId+'">'+opts.btnLabel+'</button>'
      : '';
    return '<div class="profile-empty'+extra+'">'
      + '<svg class="empty-icon" width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><circle cx="12" cy="12" r="9" stroke-dasharray="2.5 3.2"></circle><path d="M12 8v4l2.3 2.3"></path></svg>'
      + '<p>'+message+'</p>'+btn+'</div>';
  }
  function historyDateFmt(){
    if (!HISTORY_DATE_FMT){
      try{ HISTORY_DATE_FMT = new Intl.DateTimeFormat('de-DE', {day:'2-digit', month:'short', year:'numeric'}); }
      catch(e){ HISTORY_DATE_FMT = { format:function(d){ return d.toLocaleDateString(); } }; }
    }
    return HISTORY_DATE_FMT;
  }
  function renderHistory(){
    $('historyMaxCount').textContent = MAX_HISTORY;
    var hist = loadHistory();
    var wrap = $('historyContent');
    if (hist.length===0){
      wrap.innerHTML = emptyStateHTML('Noch kein Testdurchlauf gespeichert. Mach den Test, um deinen Verlauf zu starten.');
      return;
    }
    if (hist.length<2){
      wrap.innerHTML = emptyStateHTML('Bisher liegt erst ein Testdurchlauf vor — mach den Test noch einmal, um einen Trend über die Zeit zu sehen.');
      return;
    }
    var trendRows = ORDER.map(function(f){
      var vals = hist.map(function(e){ return e.scores[f]; });
      var last = vals[vals.length-1];
      return '<div class="trend-row"><div class="trend-label">'+RADAR_LABELS[f]+'</div>'+sparklineSVG(vals,140,32)+'<div class="trend-val mono">'+last+'</div></div>';
    }).join('');
    var fmt = historyDateFmt();
    var listRows = hist.slice().reverse().map(function(e){
      var a = archetypeOf(e.scores);
      var title = NOUN[a.top1][e.scores[a.top1]>=50?'high':'low'] + ' · ' + ADJ[a.top2][e.scores[a.top2]>=50?'high':'low'];
      var dateStr;
      try{ dateStr = fmt.format(new Date(e.date)); }catch(ex){ dateStr = ''; }
      return '<div class="history-row"><div class="history-date">'+dateStr+'</div><div class="history-title">'+title+'</div></div>';
    }).join('');
    wrap.innerHTML = '<div class="trend-list">'+trendRows+'</div>'+
      '<h2 class="section-title section-title-sub">Frühere Ergebnisse <span class="n">'+hist.length+'</span></h2>'+
      '<div class="history-list">'+listRows+'</div>';
  }

  // ---------- Vergleichsarchiv ----------
  function renderCompatArchive(){
    $('compatArchiveMaxCount').textContent = MAX_COMPAT_ARCHIVE;
    var list = loadCompatArchive();
    var wrap = $('compatArchiveContent');
    if (list.length===0){
      wrap.innerHTML = emptyStateHTML('Noch kein Vergleich gespeichert. Berechne unter „Vergleichen&ldquo; einen Kompatibilitäts-Vergleich und speichere ihn dort.', {extraClass:'archive-empty-note'});
      return;
    }
    var fmt = historyDateFmt();
    var rows = list.slice().reverse().map(function(e){
      var dateStr;
      try{ dateStr = fmt.format(new Date(e.ts)); }catch(ex){ dateStr=''; }
      var label = e.label ? e.label : 'Unbenannter Vergleich';
      return '<div class="history-row">'+
        '<div><div class="history-date">'+dateStr+'</div><div class="history-title">'+label+'</div></div>'+
        '<div class="archive-row-actions">'+
          '<span class="archive-match mono">'+e.match+'%</span>'+
          '<button type="button" class="btn btn-ghost btn-sm" data-view-archive="'+e.id+'">Ansehen</button>'+
          '<button type="button" class="archive-del" data-del-archive="'+e.id+'" aria-label="Vergleich mit '+label+' löschen">'+
            '<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path></svg>'+
          '</button>'+
        '</div></div>';
    }).join('');
    wrap.innerHTML = '<div class="history-list">'+rows+'</div>';
    wrap.querySelectorAll('[data-view-archive]').forEach(function(btn){
      btn.addEventListener('click', function(){
        var id = btn.getAttribute('data-view-archive');
        var entry = loadCompatArchive().filter(function(e){ return e.id===id; })[0];
        if (!entry) return;
        var last = loadResult();
        if (last) scores = last;
        else if (!scores) scores = fromCode(entry.myCode);
        if (!scores){ toast('Kein eigenes Ergebnis vorhanden.'); return; }
        renderResult();
        showView('result');
        $('cmpMe').value = entry.myCode;
        $('cmpOther').value = entry.otherCode;
        renderCompat();
        setTimeout(function(){ $('compareAnchor').scrollIntoView({behavior:'smooth'}); }, 250);
      });
    });
    wrap.querySelectorAll('[data-del-archive]').forEach(function(btn){
      btn.addEventListener('click', function(){
        var id = btn.getAttribute('data-del-archive');
        removeCompatArchiveEntry(id);
        renderCompatArchive();
        refreshDrawerState();
        toast('Vergleich gelöscht');
      });
    });
  }

  // ---------- Tagesform / State-Check view ----------
  var statePickedEnergy = null, statePickedValence = null;
  function buildScaleRow(container, picked, labelPrefix, onPick){
    container.innerHTML='';
    for (var v=1; v<=5; v++){
      var b = document.createElement('button');
      var isPicked = picked===v;
      b.className='scale-btn'+(isPicked?' picked':'');
      b.setAttribute('aria-label', labelPrefix+' '+v+' von 5');
      b.setAttribute('aria-pressed', isPicked?'true':'false');
      b.innerHTML='<span class="fill"></span>';
      (function(val){ b.addEventListener('click', function(){ onPick(val); }); })(v);
      container.appendChild(b);
    }
  }
  function renderStateRows(){
    buildScaleRow($('stateEnergyRow'), statePickedEnergy, 'Energie', function(v){ statePickedEnergy=v; renderStateRows(); });
    buildScaleRow($('stateValenceRow'), statePickedValence, 'Stimmung', function(v){ statePickedValence=v; renderStateRows(); });
  }

  // Feedback: Tagesform sollte nicht in der Schublade, sondern kreativ direkt auf der Startseite
  // ankommen. Eigene, kleine Kopie der Pick-/Auto-Speicher-Logik statt die state-Variablen der
  // vollständigen Tagesform-Ansicht (statePickedEnergy/Valence) zu teilen — beide Stellen dürfen
  // unabhängig voneinander offen sein bzw. rendern, ohne sich gegenseitig zu überschreiben.
  var landingStatePickedEnergy = null, landingStatePickedValence = null;
  function renderLandingStateRows(){
    buildScaleRow($('landingStateEnergyRow'), landingStatePickedEnergy, 'Energie heute', function(v){ landingStatePickedEnergy=v; renderLandingStateRows(); maybeSaveLandingState(); });
    buildScaleRow($('landingStateValenceRow'), landingStatePickedValence, 'Stimmung heute', function(v){ landingStatePickedValence=v; renderLandingStateRows(); maybeSaveLandingState(); });
  }
  function updateLandingStateCopy(){
    var today = todayStateEntry();
    $('landingStateCopy').textContent = today
      ? ('Heute schon erfasst — Energie '+today.energy+'/5, Stimmung '+today.valence+'/5. Zum Aktualisieren einfach neu antippen.')
      : 'Kurzer Check von Energie & Stimmung heute — unabhängig von deinem stabilen Testergebnis.';
  }
  function maybeSaveLandingState(){
    if (!landingStatePickedEnergy || !landingStatePickedValence) return;
    var ok = upsertStateToday(landingStatePickedEnergy, landingStatePickedValence);
    toast(ok ? 'Tagesform gespeichert' : 'Konnte nicht gespeichert werden — evtl. ist der Gerätespeicher voll');
    updateLandingStateCopy();
  }
  function renderLandingStateTeaser(){
    var today = todayStateEntry();
    landingStatePickedEnergy = today ? today.energy : null;
    landingStatePickedValence = today ? today.valence : null;
    updateLandingStateCopy();
    renderLandingStateRows();
  }
  function renderStateView(){
    var today = todayStateEntry();
    statePickedEnergy = today ? today.energy : null;
    statePickedValence = today ? today.valence : null;
    $('stateTodayNote').textContent = today
      ? 'Heute bereits erfasst — du kannst sie unten aktualisieren.'
      : 'Heute noch nicht erfasst.';
    renderStateRows();
    renderStateTrend();
  }
  function renderStateTrend(){
    var hist = loadStateHistory();
    var wrap = $('stateTrendContent');
    if (hist.length===0){
      wrap.innerHTML = emptyStateHTML('Noch keine Tagesform erfasst — trag oben deinen ersten Check-in ein.');
      return;
    }
    if (hist.length<2){
      wrap.innerHTML = emptyStateHTML('Bisher liegt erst ein Eintrag vor — erfasse deine Tagesform an einem weiteren Tag, um einen Trend zu sehen.');
      return;
    }
    var energyVals = hist.map(function(e){ return (e.energy-1)/4*100; });
    var valenceVals = hist.map(function(e){ return (e.valence-1)/4*100; });
    var lastE = hist[hist.length-1].energy, lastV = hist[hist.length-1].valence;
    var trendRows =
      '<div class="trend-row"><div class="trend-label">Energie</div>'+sparklineSVG(energyVals,140,32)+'<div class="trend-val mono">'+lastE+'</div></div>'+
      '<div class="trend-row"><div class="trend-label">Stimmung</div>'+sparklineSVG(valenceVals,140,32)+'<div class="trend-val mono">'+lastV+'</div></div>';
    var fmt = historyDateFmt();
    var listRows = hist.slice().reverse().slice(0,14).map(function(e){
      var dateStr;
      try{ dateStr = fmt.format(new Date(e.ts)); }catch(ex){ dateStr = e.day; }
      return '<div class="history-row"><div class="history-date">'+dateStr+'</div><div class="history-title">Energie '+e.energy+'/5 &middot; Stimmung '+e.valence+'/5</div></div>';
    }).join('');
    wrap.innerHTML = '<div class="trend-list">'+trendRows+'</div>'+
      '<h2 class="section-title section-title-sub">Letzte Einträge <span class="n">'+hist.length+'</span></h2>'+
      '<div class="history-list">'+listRows+'</div>';
  }

  // ---------- code encode/decode ----------
  function toCode(sc){
    return ORDER.map(function(f){
      var v = Math.max(0,Math.min(100, sc[f]));
      return v.toString(36).padStart(2,'0');
    }).join('');
  }
  function fromCode(code){
    if (!code || code.length!==10) return null;
    var out = {};
    for (var i=0;i<5;i++){
      var chunk = code.substr(i*2,2);
      var v = parseInt(chunk,36);
      if (isNaN(v)) return null;
      out[ORDER[i]] = Math.max(0, Math.min(100, v));
    }
    return out;
  }

  // ---------- precision data visuals (gauge bar, ring gauge, sparkline, count-up) ----------
  // Ersetzt den früheren simplen Fortschrittsbalken durch eine Skala mit Tick-Markierungen
  // bei 25/50/75 und einem Marker-Punkt an der eigentlichen Position — liest sich eher wie eine
  // gemessene Instrumentenanzeige (Apple Health/Whoop-Richtung) als wie ein reiner Ladebalken.
  function gaugeBarHTML(value){
    value = Math.max(0, Math.min(100, value));
    return '<div class="gauge-track">'+
      '<div class="gauge-fill" style="width:'+value+'%"></div>'+
      '<div class="gauge-tick" style="left:25%"></div>'+
      '<div class="gauge-tick" style="left:50%"></div>'+
      '<div class="gauge-tick" style="left:75%"></div>'+
      '<div class="gauge-marker" style="left:'+value+'%"></div>'+
      '</div>';
  }

  function ringGaugeSVG(percent, size, label){
    size = size || 132;
    var pct = Math.max(0, Math.min(100, Math.round(percent)));
    var r = size/2 - 9, c = size/2;
    var circumf = 2*Math.PI*r;
    var offset = circumf * (1 - pct/100);
    return '<svg width="'+size+'" height="'+size+'" viewBox="0 0 '+size+' '+size+'" role="img" aria-label="'+(label||'Übereinstimmung')+': '+pct+' Prozent">'+
      '<circle cx="'+c+'" cy="'+c+'" r="'+r+'" fill="none" class="ring-track" stroke-width="9"/>'+
      '<circle cx="'+c+'" cy="'+c+'" r="'+r+'" fill="none" class="ring-fill" stroke-width="9" stroke-linecap="round" '+
        'stroke-dasharray="'+circumf.toFixed(1)+'" stroke-dashoffset="'+offset.toFixed(1)+'" transform="rotate(-90 '+c+' '+c+')"/>'+
      '<text x="'+c+'" y="'+(c+9)+'" text-anchor="middle" class="ring-text">'+pct+'</text>'+
      '</svg>';
  }

  // Kompakter Sparkline-Liniengraph für den Dimensionsverlauf über mehrere Testdurchläufe.
  // Braucht mindestens zwei Datenpunkte, um eine Linie zu ergeben.
  function sparklineSVG(values, w, h){
    w = w || 140; h = h || 32;
    if (!values || values.length<2){
      return '<svg width="'+w+'" height="'+h+'" viewBox="0 0 '+w+' '+h+'" role="img" aria-hidden="true"></svg>';
    }
    var pad = 4;
    var pts = values.map(function(v,i){
      var x = pad + (i/(values.length-1))*(w-2*pad);
      var y = pad + (1-v/100)*(h-2*pad);
      return [x,y];
    });
    var path = pts.map(function(p,i){ return (i===0?'M':'L')+p[0].toFixed(1)+','+p[1].toFixed(1); }).join(' ');
    var last = pts[pts.length-1];
    return '<svg width="'+w+'" height="'+h+'" viewBox="0 0 '+w+' '+h+'" role="img" aria-hidden="true">'+
      '<path d="'+path+'" fill="none" stroke="var(--accent)" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>'+
      '<circle cx="'+last[0].toFixed(1)+'" cy="'+last[1].toFixed(1)+'" r="3" fill="var(--accent-strong)"/>'+
      '</svg>';
  }

  function prefersReducedMotion(){
    try{ return window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches; }catch(e){ return false; }
  }

  // Zählt eine Zahl von 0 auf ihren Zielwert hoch, statt sie instantan einzublenden — ein
  // kleiner, aber typischer Baustein datengetriebener Premium-Apps beim "Reveal" eines Ergebnisses.
  function animateCountUp(el, target, duration){
    duration = duration || 900;
    if (prefersReducedMotion()){ el.textContent = target; return; }
    var start = null;
    function step(ts){
      if (!start) start = ts;
      var p = Math.min(1, (ts-start)/duration);
      var eased = 1 - Math.pow(1-p, 3);
      el.textContent = Math.round(eased*target);
      if (p<1) requestAnimationFrame(step);
      else el.textContent = target;
    }
    requestAnimationFrame(step);
  }

  // ---------- radar ----------
  function polyPoints(sc, c, r){
    return ORDER.map(function(f,i){
      var ang = -Math.PI/2 + i*(2*Math.PI/5);
      var v = Math.max(4,sc[f])/100 * r;
      return [c + v*Math.cos(ang), c + v*Math.sin(ang)];
    });
  }

  function radarSVG(sc, size, other, isExample){
    size = size || 320;
    var c = size/2, r = size*0.34, labelR = size*0.40;
    var poly = polyPoints(sc, c, r).map(function(p){ return p[0].toFixed(1)+','+p[1].toFixed(1); }).join(' ');

    var rings = [0.25,0.5,0.75,1].map(function(frac){
      var rp = ORDER.map(function(f,i){
        var ang = -Math.PI/2 + i*(2*Math.PI/5);
        return [c + r*frac*Math.cos(ang), c + r*frac*Math.sin(ang)];
      });
      return '<polygon points="'+rp.map(function(p){return p[0].toFixed(1)+','+p[1].toFixed(1);}).join(' ')+'" fill="none" stroke="var(--line)" stroke-width="1"/>';
    }).join('');

    var axes = ORDER.map(function(f,i){
      var ang = -Math.PI/2 + i*(2*Math.PI/5);
      var x2 = c + r*Math.cos(ang), y2 = c + r*Math.sin(ang);
      return '<line x1="'+c+'" y1="'+c+'" x2="'+x2.toFixed(1)+'" y2="'+y2.toFixed(1)+'" stroke="var(--line)" stroke-width="1"/>';
    }).join('');

    var otherPoly = '';
    if (other){
      var polyO = polyPoints(other.scores, c, r).map(function(p){ return p[0].toFixed(1)+','+p[1].toFixed(1); }).join(' ');
      otherPoly = '<polygon points="'+polyO+'" fill="color-mix(in srgb, var(--accent-2) 20%, transparent)" stroke="var(--accent-2)" stroke-width="2" stroke-dasharray="5 4" stroke-linejoin="round"/>';
    }

    var labels = ORDER.map(function(f,i){
      var ang = -Math.PI/2 + i*(2*Math.PI/5);
      var lx = c + labelR*Math.cos(ang), ly = c + labelR*Math.sin(ang);
      var anchor = Math.abs(Math.cos(ang))<0.2 ? 'middle' : (Math.cos(ang)>0?'start':'end');
      var valueLine = other
        ? '<text x="'+lx.toFixed(1)+'" y="'+(ly+13).toFixed(1)+'" text-anchor="'+anchor+'" class="radar-axis-value radar-axis-value-me">'+sc[f]+'</text>'+
          '<text x="'+lx.toFixed(1)+'" y="'+(ly+27).toFixed(1)+'" text-anchor="'+anchor+'" class="radar-axis-value radar-axis-value-other">'+other.scores[f]+'</text>'
        : '<text x="'+lx.toFixed(1)+'" y="'+(ly+13).toFixed(1)+'" text-anchor="'+anchor+'" class="radar-axis-value">'+sc[f]+'</text>';
      return '<text x="'+lx.toFixed(1)+'" y="'+(ly-4).toFixed(1)+'" text-anchor="'+anchor+'" class="radar-axis-label">'+RADAR_LABELS[f]+'</text>'+valueLine;
    }).join('');

    var ariaLabel = other
      ? 'Vergleich: Du ' + ORDER.map(function(f){ return LABELS[f]+' '+sc[f]; }).join(', ') + '. Andere Person ' + ORDER.map(function(f){ return LABELS[f]+' '+other.scores[f]; }).join(', ')
      : (isExample ? 'Beispielhaftes Profil zur Illustration, nicht deine eigenen Werte: ' : 'Dein Profil: ') + ORDER.map(function(f){ return LABELS[f]+' '+sc[f]+' von 100'; }).join(', ');
    return '<svg viewBox="0 0 '+size+' '+(other?size+14:size)+'" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="'+ariaLabel+'">'+
      rings+axes+otherPoly+
      '<polygon points="'+poly+'" fill="color-mix(in srgb, var(--accent) 28%, transparent)" stroke="var(--accent)" stroke-width="2" stroke-linejoin="round"/>'+
      labels+
      '</svg>';
  }

  // ---------- Ergebnisbild (Canvas-Karte zum Teilen/Speichern) ----------
  // Feste, vom aktuellen Hell-/Dunkelmodus unabhängige Markenfarben — eine geteilte Bildkarte
  // soll immer gleich aussehen, unabhängig vom Farbmodus des Geräts, auf dem sie geöffnet wird.
  var SHARE_COLORS = { paper:'#F5F6EF', ink:'#15201A', muted:'#57655C', line:'#DBDCCE', accent:'#2F6F6A', accentFill:'rgba(47,111,106,.26)', accent2:'#C97A3C' };

  function wrapCanvasText(ctx, text, x, y, maxWidth, lineHeight){
    var words = text.split(' ');
    var line = '', curY = y;
    for (var i=0;i<words.length;i++){
      var test = line + words[i] + ' ';
      if (ctx.measureText(test).width > maxWidth && line !== ''){
        ctx.fillText(line.trim(), x, curY);
        line = words[i] + ' ';
        curY += lineHeight;
      } else { line = test; }
    }
    ctx.fillText(line.trim(), x, curY);
    return curY;
  }

  function drawShareRadar(ctx, sc, cx, cy, r){
    var C = SHARE_COLORS;
    [0.25,0.5,0.75,1].forEach(function(frac){
      ctx.beginPath();
      ORDER.forEach(function(f,i){
        var ang = -Math.PI/2 + i*(2*Math.PI/5);
        var x = cx + r*frac*Math.cos(ang), y = cy + r*frac*Math.sin(ang);
        if (i===0) ctx.moveTo(x,y); else ctx.lineTo(x,y);
      });
      ctx.closePath();
      ctx.strokeStyle = C.line; ctx.lineWidth = 1.5; ctx.stroke();
    });
    ORDER.forEach(function(f,i){
      var ang = -Math.PI/2 + i*(2*Math.PI/5);
      ctx.beginPath(); ctx.moveTo(cx,cy);
      ctx.lineTo(cx+r*Math.cos(ang), cy+r*Math.sin(ang));
      ctx.strokeStyle = C.line; ctx.lineWidth = 1.5; ctx.stroke();
    });
    ctx.beginPath();
    ORDER.forEach(function(f,i){
      var ang = -Math.PI/2 + i*(2*Math.PI/5);
      var v = Math.max(4,sc[f])/100*r;
      var x = cx+v*Math.cos(ang), y = cy+v*Math.sin(ang);
      if (i===0) ctx.moveTo(x,y); else ctx.lineTo(x,y);
    });
    ctx.closePath();
    ctx.fillStyle = C.accentFill; ctx.fill();
    ctx.strokeStyle = C.accent; ctx.lineWidth = 5; ctx.lineJoin = 'round'; ctx.stroke();
    var labelR = r*1.34;
    ORDER.forEach(function(f,i){
      var ang = -Math.PI/2 + i*(2*Math.PI/5);
      var lx = cx + labelR*Math.cos(ang), ly = cy + labelR*Math.sin(ang);
      ctx.textAlign = Math.abs(Math.cos(ang))<0.2 ? 'center' : (Math.cos(ang)>0 ? 'left':'right');
      ctx.fillStyle = C.muted; ctx.font = '600 21px "IBM Plex Mono", monospace';
      ctx.fillText(RADAR_LABELS[f], lx, ly-6);
      ctx.fillStyle = C.ink; ctx.font = '700 32px Georgia, serif';
      ctx.fillText(String(sc[f]), lx, ly+30);
    });
    ctx.textAlign = 'left';
  }

  function buildShareCanvas(){
    var C = SHARE_COLORS, W = 1080, H = 1350, M = 84;
    var canvas = document.createElement('canvas');
    canvas.width = W; canvas.height = H;
    var ctx = canvas.getContext('2d');
    ctx.fillStyle = C.paper; ctx.fillRect(0,0,W,H);
    ctx.textBaseline = 'alphabetic'; ctx.textAlign = 'left';

    ctx.fillStyle = C.accent2;
    ctx.beginPath(); ctx.arc(M+8, M-4, 9, 0, Math.PI*2); ctx.fill();
    ctx.fillStyle = C.ink; ctx.font = '700 46px Georgia, serif';
    ctx.fillText('Lucenta', M+30, M+8);
    ctx.fillStyle = C.muted; ctx.font = '600 21px "IBM Plex Mono", monospace';
    ctx.fillText('ERGEBNISKARTE', M+2, M+50);

    var arch = archetypeOf(scores);
    var pole1 = scores[arch.top1]>=50?'high':'low', pole2 = scores[arch.top2]>=50?'high':'low';
    var titleText = NOUN[arch.top1][pole1] + ' · ' + ADJ[arch.top2][pole2];
    ctx.fillStyle = C.ink; ctx.font = '600 60px Georgia, serif';
    var afterTitleY = wrapCanvasText(ctx, titleText, M, M+188, W-2*M, 68);
    ctx.fillStyle = C.accent2; ctx.font = 'italic 500 30px Georgia, serif';
    ctx.fillText(MOTTO[arch.top1][pole1], M, afterTitleY + 52);

    drawShareRadar(ctx, scores, W/2, 700, 220);

    var sortedTraits = ORDER.slice().sort(function(a,b){ return scores[b]-scores[a]; });
    var listTop = 1030, colGap = 28, colW = (W - 2*M - colGap)/2;
    sortedTraits.forEach(function(f,i){
      var col = i % 2, row = Math.floor(i/2);
      var x = M + col*(colW+colGap), y = listTop + row*62;
      ctx.textAlign = 'left'; ctx.fillStyle = C.muted; ctx.font = '500 23px "Work Sans", sans-serif';
      ctx.fillText(LABELS[f], x, y);
      ctx.textAlign = 'right'; ctx.fillStyle = C.accent; ctx.font = '700 25px "IBM Plex Mono", monospace';
      ctx.fillText(String(scores[f]), x+colW, y);
    });
    ctx.textAlign = 'left';

    ctx.fillStyle = C.muted; ctx.font = '500 20px "IBM Plex Mono", monospace';
    ctx.fillText('Big-Five-Modell (IPIP) · lucenta', M, H-M+8);

    return canvas;
  }

  // ---------- rendering ----------
  function renderQuestion(){
    var it = ITEMS[qi];
    $('qNow').textContent = (qi+1);
    $('qText').textContent = it.text;
    $('focusline-fill').style.width = Math.round((qi/50)*100)+'%';
    var row = $('scaleRow'); row.innerHTML='';
    for (var v=1; v<=5; v++){
      var b = document.createElement('button');
      var isPicked = answers[qi]===v;
      b.className='scale-btn'+(isPicked?' picked':'');
      b.setAttribute('aria-label','Wert '+v+' von 5');
      b.setAttribute('aria-pressed', isPicked ? 'true':'false');
      b.innerHTML='<span class="fill"></span>';
      (function(val){
        b.addEventListener('click', function(){ selectAnswer(val); });
      })(v);
      row.appendChild(b);
    }
    $('btnPrev').style.visibility = qi===0 ? 'hidden':'visible';
    $('qHint').textContent = QUIZ_HINTS[Math.min(4, Math.floor(qi/10))];
  }

  var QUIZ_HINTS = ['Tippe eine Antwort an', 'Was passt am ehesten zu dir?', 'Der erste Impuls reicht meist', 'Weiter im Flow', 'Fast geschafft'];
  var QUIZ_MILESTONES = {
    13:'Ein Viertel geschafft.',
    25:'Die Hälfte ist geschafft — der Rest geht schneller, als es sich gerade anfühlt.',
    38:'Nur noch eine Handvoll Fragen.'
  };

  var quizAdvanceTimeout = null;
  function disarmQuizAdvance(){
    if (quizAdvanceTimeout){ clearTimeout(quizAdvanceTimeout); quizAdvanceTimeout = null; }
  }
  function selectAnswer(v){
    answers[qi] = v;
    saveProgress();
    renderQuestion();
    // Vorherigen ausstehenden Übergang verwerfen, statt ihn zusätzlich laufen zu lassen —
    // sonst würde ein schneller Doppel-Klick/Doppel-Tastendruck qi zweimal erhöhen und
    // eine Frage überspringen.
    disarmQuizAdvance();
    quizAdvanceTimeout = setTimeout(function(){
      quizAdvanceTimeout = null;
      // Falls die Nutzerin inzwischen manuell zu einer anderen Ansicht gewechselt hat,
      // nicht mehr automatisch weiterschalten oder das Ergebnis erzwingen.
      var quizView = $('view-quiz');
      if (!quizView || !quizView.classList.contains('active')) return;
      if (qi<49){
        qi++; renderQuestion();
        saveProgress();
        if (QUIZ_MILESTONES[qi]) toast(QUIZ_MILESTONES[qi]);
      }
      else { finishQuiz(); }
    }, 220);
  }

  function finishQuiz(){
    var previous = loadResult();
    scores = computeScores();
    // Das Muster-Kennzeichen reist als eigene Eigenschaft am Ergebnis mit, statt aus `answers`
    // neu berechnet zu werden: beim späteren Öffnen eines gespeicherten Ergebnisses ist `answers`
    // längst zurückgesetzt, eine Neuberechnung würde dann fälschlich "gleichförmig" ergeben.
    // Die Eigenschaft liegt außerhalb der fünf ORDER-Schlüssel und stört deshalb weder loadResult()
    // noch toCode() oder den Vergleich — ein über Code wiederhergestelltes Ergebnis trägt sie
    // schlicht nicht, was korrekt ist: dort ist das Antwortmuster tatsächlich nicht bekannt.
    scores.uniform = answerUniformity(answers) >= UNIFORM_THRESHOLD;
    saveResult(scores);
    appendHistory(scores);
    clearProgress();
    function reveal(){
      renderResult(previous);
      showView('result');
      if (pendingCompareScroll){
        pendingCompareScroll = false;
        setTimeout(function(){
          $('compareAnchor').scrollIntoView({behavior:'smooth'});
          $('cmpOther').focus();
        }, 350);
      }
    }
    // Kurzer, bewusst knapper "Analysiere..."-Moment statt eines instantanen Sprungs zum
    // Ergebnis — ein etablierter kleiner Baustein datengetriebener Premium-Apps beim ersten
    // Reveal. Wird bei reduzierter Bewegungspräferenz komplett übersprungen.
    if (prefersReducedMotion()){ reveal(); return; }
    var overlay = $('processingOverlay');
    overlay.classList.add('show');
    overlay.setAttribute('aria-hidden','false');
    setTimeout(function(){
      overlay.classList.remove('show');
      overlay.setAttribute('aria-hidden','true');
      reveal();
    }, 700);
  }

  function renderResult(previous){
    var arch = archetypeOf(scores);
    var pole1 = scores[arch.top1]>=50?'high':'low', pole2 = scores[arch.top2]>=50?'high':'low';
    $('archTitle').innerHTML = NOUN[arch.top1][pole1] + ' <span class="sep">·</span> ' + ADJ[arch.top2][pole2];
    $('archMotto').textContent = MOTTO[arch.top1][pole1];
    $('shareTitle').textContent = arch.title;
    $('synthesis').textContent = CORE[arch.top1][pole1] + ' ' + FLAVOR[arch.top2][pole2];
    // display:flex statt '' — .uniform-note ist eine Flex-Zeile (Icon + Text); ein leerer String
    // würde zwar auch auf den CSS-Wert zurückfallen, macht die Absicht hier aber weniger deutlich.
    $('uniformNote').style.display = scores.uniform ? 'flex' : 'none';
    $('radarWrap').innerHTML = radarSVG(scores);

    // Dimensionen nach erreichtem Score sortiert (höchster zuerst) für die lesbaren Listen
    // unten auf der Ergebnisseite — das Radar-Chart selbst behält die feste O-C-E-A-N-Achsenreihenfolge,
    // damit die Fünfeck-Form über mehrere Testdurchläufe hinweg vergleichbar bleibt.
    var sortedTraits = ORDER.slice().sort(function(a,b){ return scores[b]-scores[a]; });

    var chips = sortedTraits.map(function(f){
      return '<span class="chip">'+LABELS[f]+' <b>'+scores[f]+'</b></span>';
    }).join('');
    $('shareChips').innerHTML = chips;

    var code = toCode(scores);
    $('myCode').textContent = code;
    $('cmpMe').value = code;

    // Kompakte "auf einen Blick"-Kennzahlenreihe direkt unter dem Kurzporträt — fünf knappe
    // Ziffern mit Tick-Skala statt erst im ausführlichen Bericht weiter unten die erste Zahl zu
    // zeigen. Die Zahlen zählen beim Erscheinen von 0 auf ihren Zielwert hoch.
    var stripHTML = sortedTraits.map(function(f,i){
      return '<div class="stat-tile" style="animation-delay:'+(i*55)+'ms">'+
        '<div class="stat-label">'+RADAR_LABELS[f]+'</div>'+
        '<div class="stat-num mono" id="statNum-'+f+'">0</div>'+
        gaugeBarHTML(scores[f])+
        '</div>';
    }).join('');
    $('statStrip').innerHTML = stripHTML;
    sortedTraits.forEach(function(f){
      animateCountUp($('statNum-'+f), scores[f]);
    });

    // Feedback-Runde 44: Die fünf Dimensions-Karten zeigten ihren vollständigen Bericht sofort —
    // gemessen 2.407 der 2.927 Zeichen (82 %) des Dimensionstextes, wodurch die Ergebnisseite auf
    // rund acht Bildschirmhöhen reinen Text kam, dreimal so viel wie jede andere Ansicht der App.
    // Genau in dem Moment, in dem jemand sein Ergebnis zum ersten Mal sieht, ist das eher Last als
    // Belohnung. Kopfzeile, Messbalken und der eine zusammenfassende Satz bleiben sichtbar — das
    // ist der Teil, den man überfliegt; die drei ausführlichen Abschnitte liegen dahinter.
    // Die erste (also am stärksten ausgeprägte) Dimension steht bewusst offen: sie zeigt, was in
    // den Karten steckt, und macht ohne zusätzlichen Hinweistext klar, dass sich die übrigen
    // genauso öffnen lassen.
    var list = $('traitsList'); list.innerHTML='';
    sortedTraits.forEach(function(f,i){
      var pole = scores[f]>=50 ? 'high':'low';
      var pr = PROFILES[f][pole];
      var card = document.createElement('details');
      card.className='trait-card';
      if (i===0) card.open = true;
      card.style.animationDelay = (i*60)+'ms';
      card.innerHTML =
        '<summary>'+
          '<div class="trait-top"><span class="trait-name">'+LABELS[f]+'</span><span class="trait-score mono">'+scores[f]+' / 100</span></div>'+
          gaugeBarHTML(scores[f])+
          '<div class="trait-teaser">'+pr.teaser+'</div>'+
          '<div class="trait-more"><span class="tm-shut">Alltag &middot; Beziehungen &middot; Wachstum</span>'+
          '<span class="tm-open">Weniger anzeigen</span>'+
            '<svg class="chev" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><polyline points="9 18 15 12 9 6"></polyline></svg>'+
          '</div>'+
        '</summary>'+
        '<div class="trait-sections">'+
          '<div class="trait-section"><div class="trait-section-label">Im Alltag</div><p>'+pr.alltag+'</p></div>'+
          '<div class="trait-section"><div class="trait-section-label">In Beziehungen</div><p>'+pr.beziehungen+'</p></div>'+
          '<div class="trait-section"><div class="trait-section-label">Wachstumsimpuls</div><p>'+pr.wachstum+'</p></div>'+
        '</div>';
      list.appendChild(card);
    });

    renderDelta(previous);
  }

  function renderDelta(previous){
    var box = $('deltaCard');
    if (!previous){ box.style.display='none'; box.innerHTML=''; return; }
    var rows = ORDER.map(function(f){
      var d = scores[f]-previous[f];
      var cls = Math.abs(d)<5 ? 'delta-flat' : (d>0 ? 'delta-up':'delta-down');
      var arrow = Math.abs(d)<5 ? '≈' : (d>0 ? '↑':'↓');
      return '<div class="delta-row"><span>'+LABELS[f]+'</span><span class="delta-move '+cls+'">'+previous[f]+' → '+scores[f]+' &nbsp;'+arrow+'</span></div>';
    }).join('');
    box.innerHTML = '<div class="delta-head">Verglichen mit deinem letzten Ergebnis</div>'+rows+
      '<div class="delta-note">Kleine Verschiebungen (unter 5 Punkten) sind normale Schwankung, keine echte Veränderung. Größere Sprünge können echte Entwicklung widerspiegeln — oder auch nur deine Tagesform beim Ausfüllen. Für aussagekräftige Vergleiche empfiehlt sich außerdem ein Abstand von mehreren Monaten zwischen zwei Durchläufen — auf Wochensicht gelten die fünf Dimensionen als stabil, ein kurzfristiger Vergleich misst eher Antwort-Schwankung als echte Veränderung.</div>';
    box.style.display='block';
  }

  function renderCompat(){
    var me = fromCode($('cmpMe').value.trim());
    var other = fromCode($('cmpOther').value.trim());
    var box = $('compatResult'); box.innerHTML='';
    lastCompatSnapshot = null;
    if (!me || !other){
      box.innerHTML = '<div class="compat-line">Bitte zwei gültige 10-stellige Codes eintragen.</div>';
      return;
    }
    // Bugfix Feedback-Runde 32: identische Codes ergaben zuvor eine bedeutungslose "100 % Übereinstimmung
    // mit dir selbst" ohne jeden Hinweis. Früher, expliziter Check statt stiller Fehlinterpretation.
    if ($('cmpMe').value.trim() === $('cmpOther').value.trim()){
      box.innerHTML = '<div class="compat-line">Das ist derselbe Code wie deiner. Trag den Code der anderen Person ein, um einen echten Vergleich zu sehen.</div>';
      return;
    }
    var similar=0, diff=0;
    var lines = ORDER.map(function(f){
      var d = Math.abs(me[f]-other[f]);
      var isSim = d<15;
      if (isSim) similar++; else diff++;
      return '<div class="compat-line"><b>'+LABELS[f]+'</b> — Du: '+me[f]+' · Andere Person: '+other[f]+'<br>'+(isSim?COMPAT[f].similar:COMPAT[f].diff)+'</div>';
    });
    // Einzelne, sofort erfassbare Kennzahl obendrauf — eine einfache, vereinfachte Kennzahl aus
    // der mittleren Abweichung aller fünf Dimensionen, kein wissenschaftlich gewichteter Score
    // (siehe Disclaimer unten). Gut für einen Screenshot, ersetzt aber nicht die Detailansicht darunter.
    var avgDiff = ORDER.reduce(function(s,f){ return s+Math.abs(me[f]-other[f]); },0) / ORDER.length;
    var match = Math.round(100 - avgDiff);
    var matchLabel = match>=75 ? 'Hohe Übereinstimmung' : match>=45 ? 'Gemischtes Profil' : 'Deutlich unterschiedliche Profile';
    var scoreBlock = '<div class="compat-score"><div id="compatRing"></div><div class="compat-score-label">'+matchLabel+'</div></div>';
    var summary = '<div class="compat-line compat-line-total"><b>Insgesamt:</b> '+similar+' von 5 Dimensionen ähnlich, '+diff+' unterschiedlich — beides kann eine gute Basis sein, je nachdem, wie bewusst ihr damit umgeht.</div>';
    var radarBlock = '<div class="radar-wrap compat-radar">'+radarSVG(me, 300, {scores:other})+'</div>'+
      '<div class="compat-legend"><span><span class="dot dot-me"></span>Du</span><span><span class="dot dot-other"></span>Andere Person</span></div>';
    var note = '<div class="compat-note">Die Prozentzahl oben ist eine vereinfachte Kennzahl aus der durchschnittlichen Abweichung aller fünf Dimensionen — kein wissenschaftlich gewichteter Kompatibilitäts-Score. Ähnlicher zu sein ist zudem nicht automatisch besser — anders als bei den einzelnen Dimensionen selbst ist die Forschung dazu, welche Kombination gut zusammenpasst, deutlich weniger eindeutig. Die obige Einschätzung ist ein Denkanstoß, kein wissenschaftliches Urteil über eure Beziehung.</div>';
    // Mini-Formular zum Speichern dieses Vergleichs im Vergleichsarchiv — bewusst am Ende des
    // Ergebnisblocks, nachdem der Vergleich bereits berechnet und sichtbar ist, statt vorab um
    // einen Namen zu bitten, bevor überhaupt klar ist, ob der Vergleich einen Blick wert ist.
    var saveRow = '<div class="compat-save-row">'+
      '<div class="field"><label for="compatSaveLabel">Name (optional)</label><input type="text" id="compatSaveLabel" maxlength="30" placeholder="z. B. Mia"></div>'+
      '<button type="button" class="btn btn-ghost btn-sm" id="btnSaveCompat">Vergleich speichern</button>'+
      '</div>';
    box.innerHTML = scoreBlock + radarBlock + summary + lines.join('') + note + saveRow;
    lastCompatSnapshot = { myCode: $('cmpMe').value.trim(), otherCode: $('cmpOther').value.trim(), match: match };
    var saveBtn = $('btnSaveCompat');
    if (saveBtn){
      saveBtn.addEventListener('click', function(){
        if (!lastCompatSnapshot) return;
        var labelInput = $('compatSaveLabel');
        var label = labelInput ? labelInput.value.trim().slice(0,30) : '';
        var entry = { id: 'c'+Date.now()+Math.random().toString(36).slice(2,7), ts: Date.now(),
          myCode: lastCompatSnapshot.myCode, otherCode: lastCompatSnapshot.otherCode,
          match: lastCompatSnapshot.match, label: label };
        if (appendCompatArchiveEntry(entry)){
          toast('Vergleich gespeichert');
          refreshDrawerState();
        } else {
          toast('Konnte nicht gespeichert werden — evtl. ist der Gerätespeicher voll');
        }
      });
    }
    // Ring zunächst bei 0% einfügen und den Ziel-Versatz erst einen Frame später auf demselben
    // Kreis-Element setzen (nicht per innerHTML-Austausch) — nur so greift die CSS-Transition
    // auf stroke-dashoffset tatsächlich, statt sofort im Endzustand zu erscheinen.
    var ringHost = $('compatRing');
    ringHost.innerHTML = ringGaugeSVG(0, 132, 'Übereinstimmung');
    var fillCircle = ringHost.querySelector('.ring-fill');
    var textEl = ringHost.querySelector('.ring-text');
    requestAnimationFrame(function(){
      requestAnimationFrame(function(){
        if (fillCircle){
          var r = 132/2 - 9, circumf = 2*Math.PI*r;
          fillCircle.style.strokeDashoffset = (circumf * (1 - match/100)).toFixed(1);
        }
        if (textEl) textEl.textContent = match;
      });
    });
  }

  function toast(msg){
    var t = $('toast'); t.textContent = msg; t.classList.add('show');
    setTimeout(function(){ t.classList.remove('show'); }, 1800);
  }

  // ---------- drawer (side panel: compare + saved result) ----------
  var drawerLastFocus = null;
  function drawerKeydown(e){
    if (e.key==='Escape'){ closeDrawer(); return; }
    if (e.key==='Tab'){
      var all = $('drawerPanel').querySelectorAll('button, [href], input, [tabindex]:not([tabindex="-1"])');
      var f = Array.prototype.filter.call(all, function(el){ return el.offsetParent !== null; });
      if (!f.length) return;
      var first = f[0], last = f[f.length-1];
      if (e.shiftKey && document.activeElement===first){ e.preventDefault(); last.focus(); }
      else if (!e.shiftKey && document.activeElement===last){ e.preventDefault(); first.focus(); }
    }
  }
  // Feedback: die "Test unterbrochen"/"Gespeichertes Ergebnis"-Karten und der Tagesform-Status sind
  // aus der Schublade raus (siehe HTML-Kommentare bei <aside id="drawerPanel">) — refreshDrawerState()
  // pflegt jetzt nur noch, was dort tatsächlich noch angezeigt wird: Profil-Kopf und Vergleichsarchiv.
  function refreshDrawerState(){
    var profile = loadProfile();
    renderAvatarInto($('drawerAvatar'), profile);
    $('drawerProfileName').textContent = profile.name ? profile.name : 'Profil';
    $('drawerProfileSub').textContent = (profile.name || profile.avatarImg) ? 'Profil öffnen' : 'Name, Bild & Ergebnis hinzufügen';
    var archiveCount = loadCompatArchive().length;
    $('drawerCompatArchiveStatus').textContent = archiveCount
      ? (archiveCount + (archiveCount===1?' gespeicherter Vergleich':' gespeicherte Vergleiche'))
      : 'Noch keiner gespeichert.';
  }

  // ---------- profile ----------
  function avatarInitials(name){
    name = (name||'').trim();
    if (!name) return '?';
    var parts = name.split(/\s+/).filter(Boolean);
    var chars = parts.slice(0,2).map(function(p){ return p.charAt(0).toUpperCase(); });
    return chars.join('') || '?';
  }
  // Feedback: neben dem eigenen Foto jetzt drei ruhige, markenkonforme Farbtöne für den
  // Initialen-Kreis zur Auswahl (siehe .avatar-color-*-CSS) statt bunter Avatar-Grafiken, die dem
  // zurückhaltenden Erscheinungsbild widersprächen. renderAvatarInto() setzt die passende Klasse auf
  // jedes übergebene Avatar-Element (Profil, Schublade, Einstellungen — alle drei nutzen dieselbe
  // Funktion, bleiben also automatisch synchron).
  var AVATAR_COLORS = ['accent','ink','quiet'];
  function renderAvatarInto(el, profile){
    if (!el) return;
    AVATAR_COLORS.forEach(function(c){ el.classList.remove('avatar-color-'+c); });
    var color = AVATAR_COLORS.indexOf(profile.avatarColor)!==-1 ? profile.avatarColor : 'accent';
    el.classList.add('avatar-color-'+color);
    if (profile.avatarImg){
      el.style.backgroundImage = 'url('+profile.avatarImg+')';
      el.textContent = '';
    } else {
      el.style.backgroundImage = '';
      el.textContent = avatarInitials(profile.name);
    }
  }
  function renderAvatar(profile){
    renderAvatarInto($('profileAvatar'), profile);
    $('btnAvatarRemove').style.display = profile.avatarImg ? '' : 'none';
    $('avatarColorRow').style.display = profile.avatarImg ? 'none' : '';
    AVATAR_COLORS.forEach(function(c){
      var pressed = (profile.avatarColor || 'accent') === c;
      $('avatarColor'+c.charAt(0).toUpperCase()+c.slice(1)).setAttribute('aria-pressed', pressed?'true':'false');
    });
  }
  function renderProfile(){
    var profile = loadProfile();
    $('profileName').value = profile.name || '';
    renderAvatar(profile);
    var last = loadResult();
    var block = $('profileResultBlock');
    if (last){
      var a = archetypeOf(last);
      var title = NOUN[a.top1][last[a.top1]>=50?'high':'low'] + ' <span class="sep">·</span> ' + ADJ[a.top2][last[a.top2]>=50?'high':'low'];
      var motto = MOTTO[a.top1][last[a.top1]>=50?'high':'low'];
      block.innerHTML = '<div class="profile-result-card"><div><strong>'+title+'</strong><div class="l">'+motto+'</div></div><button type="button" class="btn btn-ghost btn-sm" id="btnProfileViewResult">Ansehen</button></div>';
      $('btnProfileViewResult').addEventListener('click', function(){ scores = last; renderResult(); showView('result'); });
    } else {
      block.innerHTML = emptyStateHTML('Noch kein Ergebnis auf diesem Gerät.', {btnId:'btnProfileStart', btnLabel:'Test starten'});
      $('btnProfileStart').addEventListener('click', function(){ answers=new Array(50).fill(0); qi=0; clearProgress(); renderQuestion(); showView('quiz'); });
    }
    // Feedback: Verlauf ist jetzt Teil des Profils statt einer eigenen Schubladen-Ansicht — renderProfile()
    // aktualisiert deshalb den Verlauf direkt mit (renderHistory() befüllt #historyContent, das jetzt
    // hier in view-profile statt in einer eigenen view-history liegt).
    renderHistory();
  }
  function handleAvatarFile(file){
    if (!file || !/^image\//.test(file.type)){ toast('Bitte ein Bild auswählen'); return; }
    var reader = new FileReader();
    reader.onload = function(e){
      var img = new Image();
      img.onload = function(){
        var size = 240;
        var canvas = document.createElement('canvas');
        canvas.width = size; canvas.height = size;
        var ctx = canvas.getContext('2d');
        var side = Math.min(img.width, img.height);
        var sx = (img.width - side)/2, sy = (img.height - side)/2;
        ctx.drawImage(img, sx, sy, side, side, 0, 0, size, size);
        var dataUrl;
        try{ dataUrl = canvas.toDataURL('image/jpeg', 0.85); }
        catch(err){ toast('Bild konnte nicht verarbeitet werden'); return; }
        var profile = loadProfile();
        profile.avatarImg = dataUrl;
        if (saveProfile(profile)){
          renderAvatar(profile);
          toast('Profilbild gespeichert');
        } else {
          toast('Bild konnte nicht gespeichert werden — evtl. ist der Gerätespeicher voll');
        }
      };
      img.onerror = function(){ toast('Bild konnte nicht geladen werden'); };
      img.src = e.target.result;
    };
    reader.onerror = function(){ toast('Bild konnte nicht gelesen werden'); };
    reader.readAsDataURL(file);
  }

  // ---------- "Verstehen": profilbasierte Kurz-Einordnungen ----------
  function renderUnderstand(){
    var last = loadResult();
    var wrap = $('understandContent');
    if (!last){
      wrap.innerHTML = emptyStateHTML('Noch kein Ergebnis auf diesem Gerät — mach zuerst den Test, dann kuratiert Lucenta passende Inhalte für dein Profil.', {btnId:'btnUnderstandStart', btnLabel:'Test starten'});
      $('btnUnderstandStart').addEventListener('click', function(){ answers=new Array(50).fill(0); qi=0; clearProgress(); renderQuestion(); showView('quiz'); });
      return;
    }
    var arch = archetypeOf(last);
    var traitsToShow = [
      {f:arch.top1, pole: last[arch.top1]>=50?'high':'low'},
      {f:arch.top2, pole: last[arch.top2]>=50?'high':'low'}
    ];
    var html = traitsToShow.map(function(t){
      var cards = UNDERSTAND[t.f][t.pole];
      var groupLabel = LABELS[t.f]+' &middot; '+ADJ[t.f][t.pole];
      return '<div class="understand-group-label">'+groupLabel+'</div>'+
        cards.map(function(c,i){
          return '<div class="understand-card" style="animation-delay:'+(i*60)+'ms"><h3>'+c.title+'</h3><p>'+c.body+'</p></div>';
        }).join('');
    }).join('');
    wrap.innerHTML = html +
      '<p class="acronym-note" style="margin-top:24px;">Diese Einordnungen fassen breit replizierte Zusammenhänge auf Ebene der beiden Dimensionen zusammen — keine individuelle Diagnose und kein Ersatz für eine fachliche Einschätzung.</p>';
  }

  // ---------- settings ----------
  function renderSettings(){
    var progress = loadProgress();
    var result = loadResult();
    var profile = loadProfile();

    renderAvatarInto($('settingsAvatar'), profile);
    $('settingsAccountName').textContent = profile.name ? profile.name : 'Profil';
    $('settingsAccountSub').textContent = profile.name ? 'Name gesetzt' : (profile.avatarImg ? 'Bild gesetzt, noch kein Name' : 'Noch kein Name gesetzt');

    if (progress){
      $('settingsTestStatus').textContent = 'Unterbrochen bei Frage ' + (progress.qi+1) + ' von 50.';
      $('btnDiscardProgress').style.display = '';
    } else {
      $('settingsTestStatus').textContent = 'Gerade kein unterbrochener Test.';
      $('btnDiscardProgress').style.display = 'none';
    }

    var items = [];
    if (profile.name || profile.avatarImg){
      var parts = [];
      if (profile.name) parts.push('Name');
      if (profile.avatarImg) parts.push('Bild');
      items.push('Profil (' + parts.join(', ') + ')');
    }
    if (result) items.push('1 gespeichertes Ergebnis');
    if (progress) items.push('1 unterbrochener Test');
    var histCount = loadHistory().length;
    if (histCount) items.push(histCount + (histCount===1 ? ' Ergebnis im Verlauf' : ' Ergebnisse im Verlauf'));
    var stateCount = loadStateHistory().length;
    if (stateCount) items.push(stateCount + (stateCount===1 ? ' Tagesform-Eintrag' : ' Tagesform-Einträge'));
    var archiveCount = loadCompatArchive().length;
    if (archiveCount) items.push(archiveCount + (archiveCount===1 ? ' gespeicherter Vergleich' : ' gespeicherte Vergleiche'));
    var list = $('settingsDataList');
    if (items.length){
      list.innerHTML = items.map(function(t){ return '<li>'+t+'</li>'; }).join('');
      list.style.display = '';
      $('settingsEmptyNote').style.display = 'none';
    } else {
      list.innerHTML = '';
      list.style.display = 'none';
      $('settingsEmptyNote').style.display = '';
    }
  }

  function openDrawer(){
    refreshDrawerState();
    drawerLastFocus = document.activeElement;
    $('drawerPanel').classList.add('open');
    $('drawerPanel').setAttribute('aria-hidden','false');
    $('drawerScrim').classList.add('show');
    $('btnDrawerToggle').setAttribute('aria-expanded','true');
    document.body.style.overflow='hidden';
    // Restlichen Seiteninhalt für Screenreader/Tastatur unerreichbar machen, solange der
    // modale Drawer offen ist — sonst bleibt er per virtuellem Cursor navigierbar.
    var shell = $('shell'); if (shell) shell.setAttribute('inert','');
    document.addEventListener('keydown', drawerKeydown);
    pushOverlayState('drawer');
    setTimeout(function(){ $('btnDrawerClose').focus(); }, 50);
  }
  // keepHistory=true bedeutet: der Verlauf wurde bereits an anderer Stelle behandelt — entweder
  // weil die Zurück-Geste selbst das Schließen ausgelöst hat, oder weil unmittelbar danach eine
  // Ansicht geöffnet wird, die den Überlagerungs-Eintrag ohnehin ersetzt.
  function closeDrawer(keepHistory){
    $('drawerPanel').classList.remove('open');
    $('drawerPanel').setAttribute('aria-hidden','true');
    $('drawerScrim').classList.remove('show');
    $('btnDrawerToggle').setAttribute('aria-expanded','false');
    document.body.style.overflow='';
    var shell = $('shell'); if (shell) shell.removeAttribute('inert');
    document.removeEventListener('keydown', drawerKeydown);
    if (drawerLastFocus && drawerLastFocus.focus) drawerLastFocus.focus();
    if (keepHistory !== true) popOverlayState();
  }

  // ---------- Ergebnisbild-Dialog ----------
  var imgModalLastFocus = null, currentShareCanvas = null;
  function imgModalKeydown(e){
    if (e.key==='Escape'){ closeImgModal(); return; }
    if (e.key==='Tab'){
      var all = $('imgModal').querySelectorAll('button, [href], input, [tabindex]:not([tabindex="-1"])');
      var f = Array.prototype.filter.call(all, function(el){ return el.offsetParent !== null; });
      if (!f.length) return;
      var first = f[0], last = f[f.length-1];
      if (e.shiftKey && document.activeElement===first){ e.preventDefault(); last.focus(); }
      else if (!e.shiftKey && document.activeElement===last){ e.preventDefault(); first.focus(); }
    }
  }
  function openImgModal(){
    imgModalLastFocus = document.activeElement;
    currentShareCanvas = buildShareCanvas();
    $('shareImagePreview').src = currentShareCanvas.toDataURL('image/png');
    $('imgModal').classList.add('open');
    $('imgModal').setAttribute('aria-hidden','false');
    $('imgModalScrim').classList.add('show');
    var shell = $('shell'); if (shell) shell.setAttribute('inert','');
    document.addEventListener('keydown', imgModalKeydown);
    pushOverlayState('image');
    setTimeout(function(){ $('btnImgModalClose').focus(); }, 50);
  }
  function closeImgModal(keepHistory){
    $('imgModal').classList.remove('open');
    $('imgModal').setAttribute('aria-hidden','true');
    $('imgModalScrim').classList.remove('show');
    var shell = $('shell'); if (shell) shell.removeAttribute('inert');
    document.removeEventListener('keydown', imgModalKeydown);
    if (imgModalLastFocus && imgModalLastFocus.focus) imgModalLastFocus.focus();
    if (keepHistory !== true) popOverlayState();
  }

  
  $('previewRadar').innerHTML = radarSVG({O:78,E:65,C:45,A:58,S:50}, 160, null, true);
  renderLandingUnderstandTeaser(); renderLandingStateTeaser(); syncHeroState();
  var out={};
  ['previewRadar','landingStateEnergyRow','landingStateValenceRow'].forEach(function(id){ out[id]={html:el(id).innerHTML}; });
  ['landingStateCopy','landingTeaserTitle','landingTeaserBody','btnStart','btnHeroSecondary','viewLabel'].forEach(function(id){ out[id]={text:el(id).textContent}; });
  ['landingUnderstandTeaser','landingStateTeaser','btnHeroSecondary','storageWarning','uniformNote'].forEach(function(id){ out[id]=out[id]||{}; out[id].display=el(id).style.display; });
  console.log(JSON.stringify(out));

})();
