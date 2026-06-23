let audioCtx = null;
let isPlaying = false;
let playbackTimeouts = [];
let activeVocalAudio = null; // Tracks current playing human MP3 file

// --- Master Song Timeline & Arrangement ---
const songArrangement = {
    bpm: 65,
    timeline: [
        { id: "intro", label: "መግቢያ (INTRO)", style: "ambient" },
        { id: "verse1", label: "ስንኝ 1 (VERSE 1) — ብቸኝነት እና የሰው መክዳት", style: "soft" },
        { id: "chorus1", label: "አዝማች (CHORUS) — የክርስቶስ ከወንድም በላይ መሆን", style: "full" },
        { id: "verse2", label: "ስንኝ 2 (VERSE 2) — የታማኝነት ጥልቀት", style: "soft" },
        { id: "bridge", label: "ማሰሪያ (BRIDGE) — የቃል ኪዳን ጥንካሬ", style: "fast" },
        { id: "chorus2", label: "አዝማች (CHORUS)", style: "full" },
        { id: "outro", label: "ማሳረጊያ (OUTRO)", style: "ambient" }
    ],
    lyrics: {
        intro: [
            { text: "(የባህላዊ የትዝታ ዋሽንት እና ለስላሳ ፒያኖ አርፔጆ ብቻ)", duration: 5.5, chord: "C", pitch: 60, voiceKey: null }
        ],
        verse1: [
            // Notice the 'voiceKey' properties. They link directly to real human MP3 files below!
            { text: "የሰበሰብኳቸው… በዙሪያዬ የነበሩ፤", duration: 5.0, chord: "C", pitch: 64, voiceKey: "line1" },
            { text: "በቀን መከራዬ… ፈጥነው ተበተኑ።", duration: 5.0, chord: "Am", pitch: 62, voiceKey: "line2" },
            { text: "ሰውማ ምንድነው… ዛሬ አጅቦ ነገ የሚጠፋ፤", duration: 5.0, chord: "F", pitch: 60, voiceKey: "line3" },
            { text: "በምድር ወዳጅ ላይ… የጣለው ልቤ ተስፋ።", duration: 5.0, chord: "G", pitch: 59, voiceKey: "line4" }
        ],
        chorus1: [
            { text: "ግን ከወንድም አብልጦ… የሚጠጋጋኝ አለ፤", duration: 5.0, chord: "C", pitch: 64, voiceKey: "line5" },
            { text: "በሞት ጥላ መካከል… አብሮኝ የቆመ ወዳጅ አለ!", duration: 5.0, chord: "E", pitch: 67, voiceKey: "line6" },
            { text: "እርሱማ ኢየሱስ ነው… በምንም የማይለየኝ፤", duration: 5.0, chord: "F", pitch: 69, voiceKey: "line7" },
            { text: "ሰው ሁሉ ሲተወኝ… ደረቱ ላይ ያቀፈኝ።", duration: 5.5, chord: "G", pitch: 67, voiceKey: "line8" }
        ],
        verse2: [
            { text: "ወዳጅ ነኝ ባዮች… በደስታዬ ቀን የሳቁ፤", duration: 5.0, chord: "C", pitch: 64, voiceKey: "line9" },
            { text: "ሲጨልምብኝ ግን… ርቀውኝ የጠፉ።", duration: 5.0, chord: "Am", pitch: 62, voiceKey: "line10" },
            { text: "የማይለወጠው… የታመነው የኔ ጌታ፤", duration: 5.0, chord: "F", pitch: 60, voiceKey: "line11" },
            { text: "የልቤ መጠጊያ… ሆነኸኛል የነፍስ እረፍትና ደስታ።", duration: 5.5, chord: "G", pitch: 59, voiceKey: "line12" }
        ],
        bridge: [
            { text: "አይለወጥም ፍቅሩ… አይለቅም እጄን፤", duration: 4.0, chord: "Am", pitch: 69, voiceKey: "line13" },
            { text: "እስከ አለም ፍጻሜ… አያሳፍርም ልጄን!", duration: 4.0, chord: "F", pitch: 65, voiceKey: "line14" },
            { text: "ወዳጄ… የነፍሴ...", duration: 3.5, chord: "G", pitch: 67, voiceKey: "line15" },
            { text: "ኢየሱስ… ህይወቴ...", duration: 4.0, chord: "C", pitch: 64, voiceKey: "line16" }
        ],
        chorus2: [
            { text: "ግን ከወንድም አብልጦ… የሚጠጋጋኝ አለ፤", duration: 5.0, chord: "C", pitch: 64, voiceKey: "line5" },
            { text: "በሞት ጥላ መካከል… አብሮኝ የቆመ ወዳጅ አለ!", duration: 5.0, chord: "E", pitch: 67, voiceKey: "line6" },
            { text: "እርሱማ ኢየሱስ ነው… በምንም የማይለየኝ፤", duration: 5.0, chord: "F", pitch: 69, voiceKey: "line7" },
            { text: "ሰው ሁሉ ሲተወኝ… ደረቱ ላይ ያቀፈኝ።", duration: 5.5, chord: "G", pitch: 67, voiceKey: "line8" }
        ],
        outro: [
            { text: "(ከበሮው ይቆማል፤ የዋሽንትና የፒያኖ የመጨረሻ ረዥም ኖት ቀስ እያለ ይጠፋል)", duration: 6.0, chord: "C", pitch: 60, voiceKey: null }
        ]
    }
};

// --- Human MP3 Vocal Storage Bank ---
// REPLACEMENT INSTRUCTION: Swap out these placeholder URLs with your own uploaded Amharic MP3 links!
const vocalTracks = {
    // These open-source placeholders ensure you hear a real human vocal instantly to confirm the player works!
    "line1": "https://actions.google.com/sounds/v1/human/human_vocal_singing_ah.ogg", 
    "line2": "https://actions.google.com/sounds/v1/human/human_vocal_singing_ah.ogg",
    "line3": "https://actions.google.com/sounds/v1/human/human_vocal_singing_ah.ogg",
    "line4": "https://actions.google.com/sounds/v1/human/human_vocal_singing_ah.ogg",
    "line5": "https://actions.google.com/sounds/v1/human/human_vocal_singing_ah.ogg",
    "line6": "https://actions.google.com/sounds/v1/human/human_vocal_singing_ah.ogg",
    "line7": "https://actions.google.com/sounds/v1/human/human_vocal_singing_ah.ogg",
    "line8": "https://actions.google.com/sounds/v1/human/human_vocal_singing_ah.ogg",
    "line9": "https://actions.google.com/sounds/v1/human/human_vocal_singing_ah.ogg",
    "line10": "https://actions.google.com/sounds/v1/human/human_vocal_singing_ah.ogg",
    "line11": "https://actions.google.com/sounds/v1/human/human_vocal_singing_ah.ogg",
    "line12": "https://actions.google.com/sounds/v1/human/human_vocal_singing_ah.ogg",
    "line13": "https://actions.google.com/sounds/v1/human/human_vocal_singing_ah.ogg",
    "line14": "https://actions.google.com/sounds/v1/human/human_vocal_singing_ah.ogg",
    "line15": "https://actions.google.com/sounds/v1/human/human_vocal_singing_ah.ogg",
    "line16": "https://actions.google.com/sounds/v1/human/human_vocal_singing_ah.ogg"
};

const CHORD_MAP = {
    'C': [48, 52, 55], 'Am': [45, 48, 52], 'F': [41, 45, 48], 'G': [43, 47, 50], 'E': [40, 44, 47]
};

function midiToFreq(note) {
    return 440 * Math.pow(2, (note - 69) / 12);
}

// --- Dedicated MP3 Human Voice Player Engine ---
function playHumanVoiceTrack(voiceKey) {
    if (activeVocalAudio) {
        activeVocalAudio.pause();
        activeVocalAudio = null;
    }

    if (!voiceKey || !vocalTracks[voiceKey]) return;

    activeVocalAudio = new Audio(vocalTracks[voiceKey]);
    activeVocalAudio.volume = 1.0; // Pushes the real voice loud and clear above background instruments
    activeVocalAudio.crossOrigin = "anonymous"; // Bypass potential CORS check parameters safely
    
    activeVocalAudio.play().catch(err => console.log("Audio playback initiated before user interaction sequence: ", err));
}

// --- Instrumental Accomp Engines ---
function playPianoArpeggio(ctx, time, notes) {
    notes.forEach((note, index) => {
        let osc = ctx.createOscillator();
        let gain = ctx.createGain();
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(midiToFreq(note + 12), time + (index * 0.15));
        
        gain.gain.setValueAtTime(0, time + (index * 0.15));
        gain.gain.linearRampToValueAtTime(0.07, time + (index * 0.15) + 0.02); 
        gain.gain.exponentialRampToValueAtTime(0.001, time + (index * 0.15) + 0.8);
        
        osc.connect(gain); gain.connect(ctx.destination);
        osc.start(time + (index * 0.15)); osc.stop(time + (index * 0.15) + 0.8);
    });
}

function playWashintSolo(ctx, time, baseNote, duration) {
    let osc = ctx.createOscillator();
    let gain = ctx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(midiToFreq(baseNote + 12), time);
    gain.gain.setValueAtTime(0, time);
    gain.gain.linearRampToValueAtTime(0.06, time + 0.2);
    gain.gain.exponentialRampToValueAtTime(0.001, time + duration);
    osc.connect(gain); gain.connect(ctx.destination);
    osc.start(time); osc.stop(time + duration);
}

function playWolebaDrumBeat(ctx, time, type) {
    let osc = ctx.createOscillator();
    let gain = ctx.createGain();
    if (type === 'kick') {
        osc.frequency.setValueAtTime(110, time);
        osc.frequency.exponentialRampToValueAtTime(45, time + 0.12);
        gain.gain.setValueAtTime(0.25, time);
        gain.gain.exponentialRampToValueAtTime(0.001, time + 0.14);
    } else {
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(200, time);
        gain.gain.setValueAtTime(0.12, time);
        gain.gain.exponentialRampToValueAtTime(0.001, time + 0.16);
    }
    osc.connect(gain); gain.connect(ctx.destination);
    osc.start(time); osc.stop(time + 0.17);
}

function renderSectionLyrics(sectionId) {
    const container = document.getElementById("lyricsContainer");
    container.innerHTML = "";
    songArrangement.lyrics[sectionId].forEach((phraseData, index) => {
        let span = document.createElement("span");
        span.className = "phrase";
        span.id = `phrase-${index}`;
        span.innerText = phraseData.text;
        container.appendChild(span);
    });
}

// --- Main Engine Orchestration Thread ---
function startSongEngine() {
    if (isPlaying) return;
    isPlaying = true;
    
    audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    
    document.getElementById("status").innerText = "እውነተኛ የሰው ድምፅ ማጫወቻ ዝግጁ ነው (Direct Human MP3 Engine Active)";
    document.getElementById("status").style.color = "#00e5ff";
    
    let currentScheduleTime = audioCtx.currentTime + 0.3;
    let accumulatedDelayMs = 300; 
    
    songArrangement.timeline.forEach((section) => {
        const lines = songArrangement.lyrics[section.id];
        
        lines.forEach((line, index) => {
            let lineDuration = line.duration;
            let currentChordNotes = CHORD_MAP[line.chord] || [60, 64, 67];
            
            // 1. Synth Instrument Processing
            if (section.style === "ambient" || section.style === "soft" || section.style === "full") {
                playPianoArpeggio(audioCtx, currentScheduleTime, currentChordNotes);
            }
            if (section.style === "ambient" || section.id === "outro") {
                playWashintSolo(audioCtx, currentScheduleTime, line.pitch, lineDuration);
            }
            if (section.style === "full" || section.style === "fast") {
                let beatSpeed = section.style === "fast" ? 0.23 : 0.33; 
                for (let b = 0; b < lineDuration; b += beatSpeed * 6) {
                    playWolebaDrumBeat(audioCtx, currentScheduleTime + b, 'kick');
                    playWolebaDrumBeat(audioCtx, currentScheduleTime + b + (beatSpeed * 3), 'snare');
                }
            }
            
            // 2. Synchronized Screen Updates & Human MP3 Triggers
            let targetScheduleTimeMs = accumulatedDelayMs;
            let t1 = setTimeout(() => {
                document.getElementById("sectionIndicator").innerText = section.label;
                if (index === 0) renderSectionLyrics(section.id);
                
                document.querySelectorAll(".phrase").forEach(el => el.classList.remove("active-phrase"));
                let currentLineNode = document.getElementById(`phrase-${index}`);
                if (currentLineNode) currentLineNode.classList.add("active-phrase");
                
                // Fire the actual human voice MP3 for this specific lyric block
                if (line.voiceKey) {
                    playHumanVoiceTrack(line.voiceKey);
                }
            }, targetScheduleTimeMs);
            
            playbackTimeouts.push(t1);
            currentScheduleTime += lineDuration;
            accumulatedDelayMs += lineDuration * 1000;
        });
    });
    
    let finalTimeout = setTimeout(stopSongEngine, accumulatedDelayMs);
    playbackTimeouts.push(finalTimeout);
}

function stopSongEngine() {
    isPlaying = false;
    playbackTimeouts.forEach(t => clearTimeout(t));
    playbackTimeouts = [];
    
    if (activeVocalAudio) {
        activeVocalAudio.pause();
        activeVocalAudio = null;
    }
    if (audioCtx) { 
        audioCtx.close(); 
        audioCtx = null; 
    }
    
    document.getElementById("status").innerText = "የድምፅ ሞገዶች ቆመዋል (Engine Idle)";
    document.getElementById("status").style.color = "#00e676";
    document.getElementById("sectionIndicator").innerText = "ከፍል፦ መግቢያ (INTRO)";
    document.getElementById("lyricsContainer").innerHTML = `<span style="color: #666;">መዝሙሩን ለማጫወት PLAY የሚለውን ይጫኑ...</span>`;
}

document.addEventListener("DOMContentLoaded", () => {
    document.getElementById("lyricsContainer").innerHTML = `<span style="color: #666;">መዝሙሩን ለማጫወት PLAY የሚለውን ይጫኑ...</span>`;
    document.getElementById("playBtn").addEventListener("click", startSongEngine);
    document.getElementById("stopBtn").addEventListener("click", stopSongEngine);
});
