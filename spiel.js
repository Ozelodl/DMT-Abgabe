let dis_prozent = 50;
const heartbeat = new Audio('audio/heartbeat.mp3');
const overlay = document.getElementById('overlay');
const startButton = document.getElementById('start-button');
let beating = false;
let answerCounter = 0;
let storyState = 0;
let storyString = "";
let answerValues = [10, -10, 5, -5];
let pIdTable = ['aA','aB','aC','aD']
let answers = [["Ganz normal", "Ich fühle mich schlecht, ich sollte es ihm beichten", "Ich fühl mich zwar schlecht, aber vielleicht fällts ihm ja nicht auf", "Der Meister wird schon recht haben"],
               ["Immernoch komplett normal", "Richtig mies, ich muss so schnell wie möglich mit Jürgen sprechen und meinen Fehler beichten.", "Puh es scheint so als würde ich damit wohl irgendwie durchkommen", "Es scheint wohl so als wäre meine Arbeit doch richtig gut gewesen, sonst würd mich Jürgen nicht so sehr loben"],
               ["Interessiert mich nicht", "Das finde ich unfair", "Ich schäme mich", "Es musste früher oder später auffliegen, aber ich hätte es lieber weiter geheimgehalten"]
];
let index = 0;
let resetTimeout = setTimeout(null);


startButton.addEventListener('click', () => {
  overlay.style.display = 'none'; // Overlay verstecken
  awake();
  // Audio ist jetzt entsperrt!
});

function awake(){
    storyChange();
    shake();


    if (answerValues.length != pIdTable.length){
        console.log("Esel, zu wenig Ids/Antwortmoeglichkeiten")
    }
}

function updateDisMeter(id){
    dis_prozent += answerValues[id];
    if(dis_prozent > 100){
        dis_prozent = 100;
    } else if(dis_prozent < 0){
        dis_prozent = 0;
    }
    document.getElementById('text-item').innerHTML = dis_prozent + "%";
    document.getElementById('percentage').style.width = dis_prozent + "%";
    document.getElementById('percentage').style.transition = "all 2s";

        if (dis_prozent <= 25){
            document.getElementById('percentage').style.backgroundColor = 'green';
        }
        else if (dis_prozent <= 49){
            document.getElementById('percentage').style.backgroundColor = 'yellowgreen';
        }
        else if (dis_prozent <= 74){
            document.getElementById('percentage').style.backgroundColor = 'yellow';
        }
        else if (dis_prozent <= 89){
            document.getElementById('percentage').style.backgroundColor = 'orange';
        }
        else if (dis_prozent >= 90){
            document.getElementById('percentage').style.backgroundColor = 'red';
        }
        updateValues(id);
}

//Auf alle Objekte die die Dissonanz erhöhen die Shake Klasse hinzufügen
function shake(){
    for (let i = 0; i < pIdTable.length; i++){
        if (answerValues[i] > 0){
            document.getElementById(pIdTable[i]).classList.add('shake');
        } else if (document.getElementById(pIdTable[i]).classList.contains('shake') && answerValues[i] <= 0){
            document.getElementById(pIdTable[i]).classList.remove('shake');
        }
    }
}

function storyChange(){
    //Array für Storyinhalte
    const story  = ["Du bist Azubi im Malerbetrieb „Streich und Mal“.  Dein Meister Jürgen hat dir aufgetragen eine Gartenhütte mit einer schützenden weißen Farbe zu bestreichen. Leider hast du versehentlich den Eimer umgetreten und die gesamte Farbe verschüttet. Als Alternative hast du normale Wandfarbe gekaufte und mit dieser die Wand bestrichen. Später kommt Jürgen auf dich zu und gibt dir ein Sonderlob für deine gute Arbeit. Wie fühlst du dich?",
        "Am nächsten Tag zeigt Jürgen begeistert den anderen Azubis Fotos von deiner Arbeit. Er sagt alle anderen sollen sich ein Beispiel an dir nehmen und auch so genau und gewissenhaft arbeiten. Wie fühlst du dich?",
        "Drei Tage später ruft Jürgen dich in sein Büro. Er hat herausgefunden was du getan hast und ist sehr sauer. Wie fühlst du dich?"];
    
    

    //Überprüfung ob ausgewählte Story existiert
    if (storyState > story.length -1) return;

    //Hauptstory ändern
        if(storyState == 0){
            answerValues = [10, -10, 5, -5];
        }else if(storyState == 1){
            answerValues = [10, -10, 5, -5];
        } else if (storyState == 2){
            answerValues = [10, -5, -10, 10];
        }

    index = 0;
    document.getElementById('story-item').innerHTML = "";
    hideAnswers();
    answerCounter = 0;
    typeWriter(storyState);

    //Antworten Updaten
    for(let i= 0; i < answers[storyState].length; i++){
        const antwort = document.getElementById(i)
        antwort.innerHTML = answers[storyState][i];
    }
}

function updateValues(id){
    switch(id){
        case 0: storyString += "A";
        break;
        case 1: storyString += "B";
        break;
        case 2: storyString += "C";
        break;
        case 3: storyString += "D";
        break;
        default: storyString += "";
    }

    storyState++;
    if(storyState >= 3){
        ending();
        return;
    }
    awake();
}

function ending(){
const inhalt = document.getElementById("story-item")
let endingString = "Das Spiel ist zuende. "
endingString += "Dissonanzmeter: " + dis_prozent + "% "
if(dis_prozent < 30){
    endingString += "Kein innerer Konflikt – gut gemacht! Du hast die Dissonanz entweder vermieden oder schnell ausgeglichen – etwa durch rationale Erklärungen (‚Die Wand war eh hell‘) oder Selbstbestätigung. Lösung: Dieses flexible Denken hilft dir, stressfrei mit Widersprüchen umzugehen. Bleib dir selbst treu!";
} else if(dis_prozent <=55){
    endingString += "Du spürst leichte Unstimmigkeit, aber sie ist handhabbar. Dein Gefühl der Dissonanz deutet darauf hin, dass du zwar weißt, dass deine Handlung nicht ideal war, aber das Lob dich teilweise beruhigt. Lösung: Überlege, ob du das Lob als Motivation für künftige Ehrlichkeit nutzen kannst – so harmonisierst du dein Selbstbild mit deinem Handeln."
}else{
    endingString += "Deine Antworten zeigen starke innere Spannung! Kognitive Dissonanz entsteht, wenn Handlungen und Überzeugungen im Widerspruch stehen – wie bei dir, als du die falsche Farbe nutztest, aber trotzdem Lob erhieltest. Lösung: Reflektiere, warum dich die Situation so belastet. Vielleicht hilft es, den Vorfall offen zuzugeben oder zu akzeptieren, dass Fehler menschlich sind."
}

inhalt.innerHTML = endingString;
document.getElementById("aA").style.display= "none";
document.getElementById("aB").style.display = "none";
document.getElementById("aC").style.display = "none";
document.getElementById("aD").style.display = "none";
inhalt.style.fontSize = "5vh";
}

function enterUpdate(id){
    const spielfeld = document.getElementById("spielfeld");
    if (answerValues[id] >= 0){
        clearTimeout(resetTimeout); // Vorheriges Timeout abbrechen
        beating = true;
        beat();
        document.getElementById("spielfeld").style.backgroundColor = 'lightblue';
        spielfeld.classList.add("farbe2");
        spielfeld.classList.remove("farbe1");
        let current = 'orange';
        resetTimeout = setTimeout(() => cReset(current), 2000);
    }


}

function leaveUpdate(id){
    if(answerValues[id] < 0)
        clearTimeout(resetTimeout); // Vorheriges Timeout abbrechen
        const spielfeld = document.getElementById('spielfeld');
        beating = false;
        document.getElementById("spielfeld").style.backgroundColor = 'orange';
        spielfeld.classList.add("farbe1");
        spielfeld.classList.remove("farbe2");
        let current = 'lightblue'
        resetTimeout = setTimeout(() => cReset(current), 2000);
}

function cReset(current){
    console.log(current);
    const spielfeld = document.getElementById("spielfeld");
    spielfeld.style.backgroundColor = current;
}

function beat(){
    if(beating){
        heartbeat.currentTime = 0;
        heartbeat.play()
    .then(() => {
        setTimeout(beat,2000);
    })

    }
}

function typeWriter(storyState) {
    const textContainer = document.getElementById('story-item');
        const story  = ["Du bist Azubi im Malerbetrieb „Streich und Mal“.  Dein Meister Jürgen hat dir aufgetragen eine Gartenhütte mit einer schützenden weißen Farbe zu bestreichen. Leider hast du versehentlich den Eimer umgetreten und die gesamte Farbe verschüttet. Als Alternative hast du normale Wandfarbe gekaufte und mit dieser die Wand bestrichen. Später kommt Jürgen auf dich zu und gibt dir ein Sonderlob für deine gute Arbeit. Wie fühlst du dich?",
        "Am nächsten Tag zeigt Jürgen begeistert den anderen Azubis Fotos von deiner Arbeit. Er sagt alle anderen sollen sich ein Beispiel an dir nehmen und auch so genau und gewissenhaft arbeiten. Wie fühlst du dich?",
        "Drei Tage später ruft Jürgen dich in sein Büro. Er hat herausgefunden was du getan hast und ist sehr sauer. Wie fühlst du dich?"];

         if (
        typeof storyState !== 'number' || // Keine Zahl
        storyState < 0 ||                // Negativ
        storyState >= story.length ||    // Zu groß
        !Number.isInteger(storyState)    // Keine Ganzzahl
    ) {
        console.error("Ungültiger storyState:", storyState);
        return; // Abbruch
    }

    const currentText = story[storyState];

    if (index < currentText.length) {
        document.getElementById('story-item').textContent += currentText.charAt(index);
        index++;
        setTimeout(() => typeWriter(storyState), 50); // ⚠️ Arrow-Funktion!
    }
    else {
        showAnswers();
    }
}

function showAnswers(){
    let aura =  document.getElementById(pIdTable[answerCounter]);
    let btn = document.getElementById(answerCounter);
    aura.style.display = 'inline';
    btn.style.display = 'inline';
    answerCounter++;
    if (answerCounter < 4){
        setTimeout(() => showAnswers(), 1000);
    }

}

function hideAnswers(){
    document.getElementById('aA').style.display = 'none';
    document.getElementById('aB').style.display = 'none';
    document.getElementById('aC').style.display = 'none';
    document.getElementById('aD').style.display = 'none';
    document.getElementById('0').style.display = 'none';
    document.getElementById('1').style.display = 'none';
    document.getElementById('2').style.display = 'none';
    document.getElementById('3').style.display = 'none';

}