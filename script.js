/* TravelSafe India - complete JavaScript */


function searchMaps(){
    const input=document.getElementById('mapSearch');
    const place=input.value.trim();
    if(!place){ alert(t('enterPlace')); input.focus(); return; }
    window.open('https://www.google.com/maps/search/?api=1&query='+encodeURIComponent(place),'_blank');
}
function getDirections(){
    const input=document.getElementById('destination');
    const destination=input.value.trim();
    if(!destination){ alert(t('enterDestination')); input.focus(); return; }
    window.open('https://www.google.com/maps/dir/?api=1&destination='+encodeURIComponent(destination),'_blank');
}
function callEmergency(number, service){
    const label=service || t('police');
    if(confirm(t('callConfirm').replace('{service}',label).replace('{number}',number))) window.location.href='tel:'+number;
}
function openSOS(){
    const modal=document.getElementById('sosModal');
    if(!modal) return;
    modal.classList.add('show');
    document.body.classList.add('modal-open');
}
function closeSOS(){
    const modal=document.getElementById('sosModal');
    if(!modal) return;
    modal.classList.remove('show');
    document.body.classList.remove('modal-open');
}

function nearbySearch(place){
    window.open('https://www.google.com/maps/search/?api=1&query='+encodeURIComponent(place+' near me'),'_blank');
}

async function getMyLocation(){
    const result=document.getElementById('locationResult');
    if(!navigator.geolocation){ result.textContent=t('locationUnsupported'); return; }
    result.innerHTML='📍 '+t('findingLocation');
    navigator.geolocation.getCurrentPosition(async pos=>{
        const {latitude,longitude}=pos.coords;
        try{
            const url='https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat='+latitude+'&lon='+longitude+'&zoom=18&addressdetails=1';
            const response=await fetch(url);
            if(!response.ok) throw new Error('geocode');
            const data=await response.json();
            const a=data.address || {};
            const city=a.city || a.town || a.village || a.municipality || a.county || '';
            const state=a.state || '';
            const country=a.country || '';
            const postcode=a.postcode || '';
            const road=a.road || a.neighbourhood || a.suburb || '';
            const parts=[road,city,state,postcode,country].filter(Boolean);
            result.innerHTML=`<strong>📍 ${escapeHtml(city || data.display_name || t('locationFound'))}</strong><br>${escapeHtml(parts.join(', '))}<br><a href="https://www.google.com/maps/search/?api=1&query=${latitude},${longitude}" target="_blank" rel="noopener">🗺️ ${t('viewOnMaps')}</a>`;
        }catch(e){
            result.innerHTML=`<strong>📍 ${t('locationFound')}</strong><br>${t('placeInfoUnavailable')}<br><a href="https://www.google.com/maps/search/?api=1&query=${latitude},${longitude}" target="_blank" rel="noopener">🗺️ ${t('viewOnMaps')}</a>`;
        }
    },err=>{
        const msg=err.code===1?t('locationDenied'):err.code===2?t('locationUnavailable'):t('locationTimeout');
        result.textContent=msg;
    },{enableHighAccuracy:true,timeout:15000,maximumAge:60000});
}
function shareLocation(){
    if(!navigator.geolocation){ alert(t('locationUnsupported')); return; }
    navigator.geolocation.getCurrentPosition(pos=>{
        const url='https://www.google.com/maps/search/?api=1&query='+pos.coords.latitude+','+pos.coords.longitude;
        if(navigator.share){ navigator.share({title:'TravelSafe India',text:t('shareText'),url}).catch(()=>{}); }
        else if(navigator.clipboard){ navigator.clipboard.writeText(url).then(()=>alert(t('linkCopied'))); }
        else prompt(t('copyLink'),url);
    },()=>alert(t('locationDenied')),{enableHighAccuracy:true,timeout:15000});
}
function safetyScanner(){
    const result=document.getElementById('helpResult');
    result.innerHTML=`🛡️ <strong>${t('scannerResultTitle')}</strong><br>${t('scannerResultText')}`;
    nearbySearch('hospital, police station, pharmacy, ATM');
}

async function getWeather(){
    const city=document.getElementById('cityInput').value.trim();
    const result=document.getElementById('weatherResult');
    if(!city){ alert(t('enterCity')); return; }
    result.innerHTML='🌤️ '+t('loadingWeather');
    try{
        const geo=await fetch('https://geocoding-api.open-meteo.com/v1/search?name='+encodeURIComponent(city)+'&count=1&language=en&format=json');
        const gd=await geo.json();
        if(!gd.results || !gd.results.length) throw new Error('city');
        await renderWeather(gd.results[0].latitude,gd.results[0].longitude,gd.results[0].name,result);
    }catch(e){ result.textContent=t('weatherUnavailable'); }
}
async function getLocationWeather(){
    const result=document.getElementById('weatherResult');
    if(!navigator.geolocation){ result.textContent=t('locationUnsupported'); return; }
    result.innerHTML='📍 '+t('loadingWeather');
    navigator.geolocation.getCurrentPosition(async pos=>{
        try{ await renderWeather(pos.coords.latitude,pos.coords.longitude,t('myLocation'),result); }
        catch(e){ result.textContent=t('weatherUnavailable'); }
    },()=>{ result.textContent=t('locationDenied'); });
}
async function renderWeather(lat,lon,name,result){
    const r=await fetch(`https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current=temperature_2m,relative_humidity_2m,apparent_temperature,weather_code,wind_speed_10m&timezone=auto`);
    if(!r.ok) throw new Error('weather');
    const d=await r.json(); const c=d.current;
    result.innerHTML=`<strong>🌤️ ${escapeHtml(name)}</strong><br>${t('temperature')}: ${c.temperature_2m}°C<br>${t('feelsLike')}: ${c.apparent_temperature}°C<br>${t('humidity')}: ${c.relative_humidity_2m}%<br>${t('wind')}: ${c.wind_speed_10m} km/h`;
}

async function initBattery(){
    const result=document.getElementById('batteryResult');
    if(!navigator.getBattery){ result.textContent=t('batteryUnavailable'); return; }
    try{
        const battery=await navigator.getBattery();
        const update=()=>result.innerHTML=`🔋 <strong>${Math.round(battery.level*100)}%</strong><br>${t('charging')}: ${battery.charging?t('yes'):t('no')}`;
        update(); battery.addEventListener('levelchange',update); battery.addEventListener('chargingchange',update);
    }catch(e){ result.textContent=t('batteryUnavailable'); }
}

function showHelp(type){
    const data={
        emergency:['🚨 '+t('emergencyHelp'),t('emergencyHelpText')],
        travel:['🧳 '+t('travelHelp'),t('travelHelpText')],
        lost:['🧭 '+t('lost'),t('lostText')],
        scam:['⚠️ '+t('scamSafety'),t('scamSafetyText')]
    };
    const x=data[type]; if(x) document.getElementById('helpResult').innerHTML=`<strong>${x[0]}</strong><br>${x[1]}`;
}

const T={
English:{appTitle:'🇮🇳 TravelSafe India',appSubtitle:'Your Smart Travel Safety Assistant',sos:'SOS',emergencyAssistance:'Emergency assistance',searchMaps:'Search on Google Maps',search:'Search',getDirections:'Get Directions',directions:'Directions',emergencyServices:'Emergency Services',police:'Police',fire:'Fire',ambulance:'Ambulance',nearbyServices:'Nearby Services',hospital:'Hospital',policeStation:'Police',pharmacy:'Pharmacy',atm:'ATM',railwayStation:'Railway',petrolPump:'Petrol Pump',myLocation:'My Location',findMyLocation:'Find My Location',shareMyLocation:'Share My Location',locationDefault:'Your place information will appear here.',safetyScanner:'Nearby Safety Scanner',scannerDescription:'Quickly find important safety services around you.',scanNearby:'Scan Nearby',weather:'Weather',checkWeather:'Check Weather',weatherMyLocation:'Weather at My Location',weatherDefault:'Weather information will appear here.',battery:'Battery',checkingBattery:'Checking battery...',help:'Help',emergencyHelp:'Emergency Help',travelHelp:'Travel Help',lost:'Lost?',scamSafety:'Scam Safety',selectHelp:'Select a help option.',language:'Language',quickServices:'Quick Services',bookCab:'Book Cab',orderFood:'Order Food',orderThings:'Order Things',householdWork:'Household Work',touristTips:'Tourist Safety Tips',railwayTip:'Railway',hotelTip:'Hotel',mountainTip:'Mountain',beachTip:'Beach',taxiTip:'Taxi',nightTip:'Night Travel',moneyTip:'Money',phoneTip:'Phone',selectSafetyTopic:'Select a safety topic.',sosTitle:'Emergency SOS',choosePolice:'Choose police assistance:',cancel:'Cancel',searchPlacePlaceholder:'Search a place...',destinationPlaceholder:'Enter destination',cityPlaceholder:'Enter city',footer:'🇮🇳 TravelSafe India • Stay Safe • Travel Smart',enterPlace:'Please enter a place.',enterDestination:'Please enter a destination.',enterCity:'Please enter a city.',callConfirm:'Open the phone dialer for {service} ({number})?',findingLocation:'Finding your location and place information...',locationFound:'Location found',placeInfoUnavailable:'Place information could not be loaded.',viewOnMaps:'View on Google Maps',locationUnsupported:'Location is not supported by this browser.',locationDenied:'Location permission was denied.',locationUnavailable:'Your location is unavailable.',locationTimeout:'Location request timed out.',shareText:'My current location from TravelSafe India',linkCopied:'Location link copied.',copyLink:'Copy this location link:',scannerResultTitle:'Safety scan ready',scannerResultText:'Nearby hospitals, police stations, pharmacies and ATMs can be opened in Google Maps.',loadingWeather:'Loading weather...',weatherUnavailable:'Weather information is unavailable right now.',temperature:'Temperature',feelsLike:'Feels like',humidity:'Humidity',wind:'Wind',myLocation:'My Location',batteryUnavailable:'Battery information is unavailable.',charging:'Charging',yes:'Yes',no:'No',emergencyHelpText:'For immediate danger, contact Police at 112.',travelHelpText:'Keep important documents secure and share your travel plan with someone you trust.',lostText:'Move to a safe public place and use Google Maps to find a police station or other help.',scamSafetyText:'Do not share OTPs, PINs or banking passwords. Verify requests before paying.'},
Hindi:{appTitle:'🇮🇳 ट्रैवलसेफ इंडिया',appSubtitle:'आपका स्मार्ट यात्रा सुरक्षा सहायक',sos:'SOS',emergencyAssistance:'आपातकालीन सहायता',searchMaps:'Google Maps पर खोजें',search:'खोजें',getDirections:'दिशा-निर्देश',directions:'दिशाएँ',emergencyServices:'आपातकालीन सेवाएँ',police:'पुलिस',fire:'फायर सेवा',ambulance:'एम्बुलेंस',nearbyServices:'आस-पास की सेवाएँ',hospital:'अस्पताल',policeStation:'पुलिस',pharmacy:'फार्मेसी',atm:'ATM',railwayStation:'रेलवे',petrolPump:'पेट्रोल पंप',myLocation:'मेरा स्थान',findMyLocation:'मेरा स्थान खोजें',shareMyLocation:'मेरा स्थान साझा करें',locationDefault:'आपके स्थान की जानकारी यहाँ दिखाई देगी।',safetyScanner:'आस-पास सुरक्षा स्कैनर',scannerDescription:'अपने आसपास की महत्वपूर्ण सुरक्षा सेवाएँ जल्दी खोजें।',scanNearby:'आस-पास स्कैन करें',weather:'मौसम',checkWeather:'मौसम देखें',weatherMyLocation:'मेरे स्थान का मौसम',weatherDefault:'मौसम की जानकारी यहाँ दिखाई देगी।',battery:'बैटरी',checkingBattery:'बैटरी जाँची जा रही है...',help:'सहायता',emergencyHelp:'आपातकालीन सहायता',travelHelp:'यात्रा सहायता',lost:'खो गए?',scamSafety:'धोखाधड़ी से सुरक्षा',selectHelp:'सहायता विकल्प चुनें।',language:'भाषा',quickServices:'त्वरित सेवाएँ',bookCab:'कैब बुक करें',orderFood:'भोजन ऑर्डर करें',orderThings:'सामान ऑर्डर करें',householdWork:'घरेलू काम',touristTips:'पर्यटक सुरक्षा सुझाव',railwayTip:'रेलवे',hotelTip:'होटल',mountainTip:'पहाड़',beachTip:'समुद्र तट',taxiTip:'टैक्सी',nightTip:'रात की यात्रा',moneyTip:'पैसे',phoneTip:'फोन',selectSafetyTopic:'सुरक्षा विषय चुनें।',sosTitle:'आपातकालीन SOS',choosePolice:'पुलिस सहायता चुनें:',cancel:'रद्द करें',searchPlacePlaceholder:'स्थान खोजें...',destinationPlaceholder:'गंतव्य दर्ज करें',cityPlaceholder:'शहर दर्ज करें',footer:'🇮🇳 ट्रैवलसेफ इंडिया • सुरक्षित रहें • स्मार्ट यात्रा करें'},
Marathi:{appTitle:'🇮🇳 TravelSafe India',appSubtitle:'तुमचा स्मार्ट प्रवास सुरक्षा सहाय्यक',sos:'SOS',emergencyAssistance:'आपत्कालीन मदत',searchMaps:'Google Maps वर शोधा',search:'शोधा',getDirections:'दिशा मिळवा',directions:'दिशा',emergencyServices:'आपत्कालीन सेवा',police:'पोलीस',fire:'अग्निशमन',ambulance:'रुग्णवाहिका',nearbyServices:'जवळच्या सेवा',hospital:'रुग्णालय',policeStation:'पोलीस',pharmacy:'फार्मसी',atm:'ATM',railwayStation:'रेल्वे',petrolPump:'पेट्रोल पंप',myLocation:'माझे स्थान',findMyLocation:'माझे स्थान शोधा',shareMyLocation:'माझे स्थान शेअर करा',locationDefault:'तुमच्या स्थानाची माहिती येथे दिसेल.',safetyScanner:'जवळील सुरक्षा स्कॅनर',scannerDescription:'तुमच्या आसपासच्या महत्त्वाच्या सुरक्षा सेवा पटकन शोधा.',scanNearby:'जवळपास स्कॅन करा',weather:'हवामान',checkWeather:'हवामान तपासा',weatherMyLocation:'माझ्या स्थानाचे हवामान',weatherDefault:'हवामानाची माहिती येथे दिसेल.',battery:'बॅटरी',checkingBattery:'बॅटरी तपासत आहे...',help:'मदत',emergencyHelp:'आपत्कालीन मदत',travelHelp:'प्रवास मदत',lost:'हरवलात?',scamSafety:'फसवणूक सुरक्षा',selectHelp:'मदतीचा पर्याय निवडा.',language:'भाषा',quickServices:'जलद सेवा',bookCab:'कॅब बुक करा',orderFood:'अन्न ऑर्डर करा',orderThings:'सामान ऑर्डर करा',householdWork:'घरगुती काम',touristTips:'पर्यटक सुरक्षा सूचना',railwayTip:'रेल्वे',hotelTip:'हॉटेल',mountainTip:'डोंगर',beachTip:'समुद्रकिनारा',taxiTip:'टॅक्सी',nightTip:'रात्रीचा प्रवास',moneyTip:'पैसे',phoneTip:'फोन',selectSafetyTopic:'सुरक्षा विषय निवडा.',sosTitle:'आपत्कालीन SOS',choosePolice:'पोलीस मदत निवडा:',cancel:'रद्द करा',searchPlacePlaceholder:'ठिकाण शोधा...',destinationPlaceholder:'गंतव्य लिहा',cityPlaceholder:'शहर लिहा',footer:'🇮🇳 TravelSafe India • सुरक्षित रहा • स्मार्ट प्रवास करा'},
Bengali:{appTitle:'🇮🇳 TravelSafe India',appSubtitle:'আপনার স্মার্ট ভ্রমণ নিরাপত্তা সহায়ক',sos:'SOS',emergencyAssistance:'জরুরি সহায়তা',searchMaps:'Google Maps-এ খুঁজুন',search:'খুঁজুন',getDirections:'দিকনির্দেশ পান',directions:'দিকনির্দেশ',emergencyServices:'জরুরি পরিষেবা',police:'পুলিশ',fire:'ফায়ার সার্ভিস',ambulance:'অ্যাম্বুলেন্স',nearbyServices:'কাছাকাছি পরিষেবা',hospital:'হাসপাতাল',policeStation:'পুলিশ',pharmacy:'ফার্মেসি',atm:'ATM',railwayStation:'রেলওয়ে',petrolPump:'পেট্রোল পাম্প',myLocation:'আমার অবস্থান',findMyLocation:'আমার অবস্থান খুঁজুন',shareMyLocation:'আমার অবস্থান শেয়ার করুন',locationDefault:'আপনার অবস্থানের তথ্য এখানে দেখা যাবে।',safetyScanner:'কাছাকাছি নিরাপত্তা স্ক্যানার',scannerDescription:'আপনার আশেপাশের গুরুত্বপূর্ণ নিরাপত্তা পরিষেবা দ্রুত খুঁজুন।',scanNearby:'কাছাকাছি স্ক্যান করুন',weather:'আবহাওয়া',checkWeather:'আবহাওয়া দেখুন',weatherMyLocation:'আমার অবস্থানের আবহাওয়া',weatherDefault:'আবহাওয়ার তথ্য এখানে দেখা যাবে।',battery:'ব্যাটারি',checkingBattery:'ব্যাটারি পরীক্ষা হচ্ছে...',help:'সহায়তা',emergencyHelp:'জরুরি সহায়তা',travelHelp:'ভ্রমণ সহায়তা',lost:'হারিয়ে গেছেন?',scamSafety:'প্রতারণা থেকে নিরাপত্তা',selectHelp:'একটি সহায়তা বিকল্প বেছে নিন।',language:'ভাষা',quickServices:'দ্রুত পরিষেবা',bookCab:'ক্যাব বুক করুন',orderFood:'খাবার অর্ডার করুন',orderThings:'জিনিস অর্ডার করুন',householdWork:'গৃহস্থালির কাজ',touristTips:'পর্যটক নিরাপত্তা টিপস',railwayTip:'রেলওয়ে',hotelTip:'হোটেল',mountainTip:'পাহাড়',beachTip:'সমুদ্রসৈকত',taxiTip:'ট্যাক্সি',nightTip:'রাতের ভ্রমণ',moneyTip:'টাকা',phoneTip:'ফোন',selectSafetyTopic:'একটি নিরাপত্তা বিষয় বেছে নিন।',sosTitle:'জরুরি SOS',choosePolice:'পুলিশ সহায়তা বেছে নিন:',cancel:'বাতিল',searchPlacePlaceholder:'একটি স্থান খুঁজুন...',destinationPlaceholder:'গন্তব্য লিখুন',cityPlaceholder:'শহর লিখুন',footer:'🇮🇳 TravelSafe India • নিরাপদ থাকুন • স্মার্ট ভ্রমণ করুন'},
Tamil:{appTitle:'🇮🇳 TravelSafe India',appSubtitle:'உங்கள் ஸ்மார்ட் பயண பாதுகாப்பு உதவியாளர்',sos:'SOS',emergencyAssistance:'அவசர உதவி',searchMaps:'Google Maps-ல் தேடுங்கள்',search:'தேடு',getDirections:'வழிகளைப் பெறுங்கள்',directions:'வழிகள்',emergencyServices:'அவசர சேவைகள்',police:'காவல்துறை',fire:'தீயணைப்பு',ambulance:'ஆம்புலன்ஸ்',nearbyServices:'அருகிலுள்ள சேவைகள்',hospital:'மருத்துவமனை',policeStation:'காவல்துறை',pharmacy:'மருந்தகம்',atm:'ATM',railwayStation:'ரயில்வே',petrolPump:'பெட்ரோல் பங்க்',myLocation:'என் இருப்பிடம்',findMyLocation:'என் இருப்பிடத்தைக் கண்டறி',shareMyLocation:'என் இருப்பிடத்தைப் பகிர்',locationDefault:'உங்கள் இருப்பிடத் தகவல் இங்கே தோன்றும்.',safetyScanner:'அருகிலுள்ள பாதுகாப்பு ஸ்கேனர்',scannerDescription:'உங்களைச் சுற்றியுள்ள முக்கிய பாதுகாப்பு சேவைகளை விரைவாகக் கண்டறியுங்கள்.',scanNearby:'அருகில் ஸ்கேன் செய்',weather:'வானிலை',checkWeather:'வானிலையைப் பார்க்கவும்',weatherMyLocation:'என் இருப்பிட வானிலை',weatherDefault:'வானிலை தகவல் இங்கே தோன்றும்.',battery:'பேட்டரி',checkingBattery:'பேட்டரி சரிபார்க்கப்படுகிறது...',help:'உதவி',emergencyHelp:'அவசர உதவி',travelHelp:'பயண உதவி',lost:'தொலைந்துவிட்டீர்களா?',scamSafety:'மோசடி பாதுகாப்பு',selectHelp:'உதவி விருப்பத்தைத் தேர்ந்தெடுக்கவும்.',language:'மொழி',quickServices:'விரைவு சேவைகள்',bookCab:'கேப் முன்பதிவு',orderFood:'உணவு ஆர்டர்',orderThings:'பொருட்கள் ஆர்டர்',householdWork:'வீட்டு வேலை',touristTips:'சுற்றுலா பாதுகாப்பு குறிப்புகள்',railwayTip:'ரயில்வே',hotelTip:'ஹோட்டல்',mountainTip:'மலை',beachTip:'கடற்கரை',taxiTip:'டாக்ஸி',nightTip:'இரவு பயணம்',moneyTip:'பணம்',phoneTip:'தொலைபேசி',selectSafetyTopic:'பாதுகாப்பு தலைப்பைத் தேர்ந்தெடுக்கவும்.',sosTitle:'அவசர SOS',choosePolice:'காவல்துறை உதவியைத் தேர்ந்தெடுக்கவும்:',cancel:'ரத்து',searchPlacePlaceholder:'ஒரு இடத்தைத் தேடுங்கள்...',destinationPlaceholder:'இலக்கை உள்ளிடவும்',cityPlaceholder:'நகரத்தை உள்ளிடவும்',footer:'🇮🇳 TravelSafe India • பாதுகாப்பாக இருங்கள் • புத்திசாலித்தனமாக பயணம் செய்யுங்கள்'},
Telugu:{appTitle:'🇮🇳 TravelSafe India',appSubtitle:'మీ స్మార్ట్ ప్రయాణ భద్రత సహాయకుడు',sos:'SOS',emergencyAssistance:'అత్యవసర సహాయం',searchMaps:'Google Mapsలో వెతకండి',search:'వెతుకు',getDirections:'దిశలు పొందండి',directions:'దిశలు',emergencyServices:'అత్యవసర సేవలు',police:'పోలీసు',fire:'అగ్నిమాపక సేవ',ambulance:'అంబులెన్స్',nearbyServices:'సమీప సేవలు',hospital:'ఆసుపత్రి',policeStation:'పోలీసు',pharmacy:'ఫార్మసీ',atm:'ATM',railwayStation:'రైల్వే',petrolPump:'పెట్రోల్ పంప్',myLocation:'నా స్థానం',findMyLocation:'నా స్థానాన్ని కనుగొను',shareMyLocation:'నా స్థానాన్ని పంచుకోండి',locationDefault:'మీ స్థల సమాచారం ఇక్కడ కనిపిస్తుంది.',safetyScanner:'సమీప భద్రతా స్కానర్',scannerDescription:'మీ చుట్టూ ఉన్న ముఖ్యమైన భద్రతా సేవలను త్వరగా కనుగొనండి.',scanNearby:'సమీపంలో స్కాన్ చేయండి',weather:'వాతావరణం',checkWeather:'వాతావరణం చూడండి',weatherMyLocation:'నా స్థల వాతావరణం',weatherDefault:'వాతావరణ సమాచారం ఇక్కడ కనిపిస్తుంది.',battery:'బ్యాటరీ',checkingBattery:'బ్యాటరీ తనిఖీ చేస్తోంది...',help:'సహాయం',emergencyHelp:'అత్యవసర సహాయం',travelHelp:'ప్రయాణ సహాయం',lost:'దారి తప్పారా?',scamSafety:'మోసాల నుండి భద్రత',selectHelp:'సహాయ ఎంపికను ఎంచుకోండి.',language:'భాష',quickServices:'త్వరిత సేవలు',bookCab:'క్యాబ్ బుక్ చేయండి',orderFood:'ఆహారం ఆర్డర్ చేయండి',orderThings:'వస్తువులు ఆర్డర్ చేయండి',householdWork:'ఇంటి పనులు',touristTips:'పర్యాటక భద్రతా సూచనలు',railwayTip:'రైల్వే',hotelTip:'హోటల్',mountainTip:'పర్వతం',beachTip:'బీచ్',taxiTip:'టాక్సీ',nightTip:'రాత్రి ప్రయాణం',moneyTip:'డబ్బు',phoneTip:'ఫోన్',selectSafetyTopic:'భద్రతా అంశాన్ని ఎంచుకోండి.',sosTitle:'అత్యవసర SOS',choosePolice:'పోలీసు సహాయాన్ని ఎంచుకోండి:',cancel:'రద్దు',searchPlacePlaceholder:'స్థలాన్ని వెతకండి...',destinationPlaceholder:'గమ్యస్థానాన్ని నమోదు చేయండి',cityPlaceholder:'నగరాన్ని నమోదు చేయండి',footer:'🇮🇳 TravelSafe India • సురక్షితంగా ఉండండి • స్మార్ట్‌గా ప్రయాణించండి'}
};

let currentLanguage=localStorage.getItem('travelSafeLanguage')||'English';
function t(key){ return (T[currentLanguage]&&T[currentLanguage][key]) || T.English[key] || key; }
function translateApp(){
    document.documentElement.lang=currentLanguage==='Hindi'?'hi':currentLanguage==='Marathi'?'mr':currentLanguage==='Bengali'?'bn':currentLanguage==='Tamil'?'ta':currentLanguage==='Telugu'?'te':'en';
    document.querySelectorAll('[data-i18n]').forEach(el=>{ const key=el.dataset.i18n; if(T[currentLanguage][key]) el.textContent=t(key); });
    document.querySelectorAll('[data-placeholder]').forEach(el=>{ el.placeholder=t(el.dataset.placeholder); });
    const msg=document.getElementById('languageMessage'); if(msg) msg.textContent=t('language')+': '+document.getElementById('languageSelect').value;
    const select=document.getElementById('languageSelect');
    [...select.options].forEach(o=>{o.textContent={English:'English',Hindi:'हिन्दी',Marathi:'मराठी',Bengali:'বাংলা',Tamil:'தமிழ்',Telugu:'తెలుగు'}[o.value]||o.value;});
}
function changeLanguage(){ currentLanguage=document.getElementById('languageSelect').value; localStorage.setItem('travelSafeLanguage',currentLanguage); translateApp(); }

const tips={
railway:['🚆','Keep your luggage close and check the platform and train information before boarding.'],
hotel:['🏨','Keep your room locked and save the hotel contact details.'],
mountain:['🏔️','Check weather conditions, stay on marked paths and avoid unsafe areas.'],
beach:['🏖️','Follow local warnings and avoid entering water when conditions are unsafe.'],
taxi:['🚕','Use trusted taxi services and check the vehicle and trip details.'],
night:['🌙','Prefer well-lit public places and let someone you trust know your travel plan.'],
money:['💰','Keep cash and cards secure and never share your PIN or OTP.'],
phone:['📱','Keep your phone charged and emergency contacts available.']};
function showTip(type){const x=tips[type]; if(x) document.getElementById('tipResult').innerHTML=`${x[0]} <strong>${document.querySelector(`[data-i18n="${type}Tip"]`)?.textContent||type}</strong><br>${x[1]}`;}

function openPlayStore(service){
    const urls={
        uber:'https://play.google.com/store/apps/details?id=com.ubercab',
        zomato:'https://play.google.com/store/apps/details?id=com.application.zomato',
        blinkit:'https://play.google.com/store/search?q=Blinkit&c=apps',
        urbancompany:'https://play.google.com/store/apps/details?id=com.urbanclap.urbanclap'
    };
    if(urls[service]) window.open(urls[service],'_blank');
}
function escapeHtml(s){return String(s).replace(/[&<>'"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;',"'":'&#39;','"':'&quot;'}[c]));}

function setThemeIcon(){
    const icon=document.querySelector('#themeBtn .material-icons');
    if(icon) icon.textContent=document.body.classList.contains('dark') ? 'light_mode' : 'dark_mode';
}

function toggleTheme(){
    document.body.classList.toggle('dark');
    localStorage.setItem('travelSafeDarkMode', document.body.classList.contains('dark') ? 'true' : 'false');
    setThemeIcon();
}

function loadTheme(){
    if(localStorage.getItem('travelSafeDarkMode') === 'true') document.body.classList.add('dark');
    setThemeIcon();
}

function setupInteractions(){
    loadTheme();

    const select=document.getElementById('languageSelect');
    if(select){
        select.value=currentLanguage;
        translateApp();
    }

    const modal=document.getElementById('sosModal');
    if(modal){
        modal.addEventListener('click', function(e){
            if(e.target === modal) closeSOS();
        });
    }

    document.addEventListener('keydown', function(e){
        if(e.key === 'Escape') closeSOS();
    });

    initBattery();
}

if(document.readyState === 'loading') document.addEventListener('DOMContentLoaded', setupInteractions);
else setupInteractions();
