let openaiApiKey = "";
const gptModel = "gpt-4-turbo";
let globalGptContext = "";

// Lade API-Key
fetch("apikey.txt")
  .then(res => res.text())
  .then(key => {
    openaiApiKey = key.trim();
    console.log("🔑 OpenAI API-Key geladen.");

    // Lade beide Stories
    loadStory("story1.json", "story1");
    loadStory("story2.json", "story2");
  });

function loadStory(path, containerId) {
  fetch(path)
    .then(res => res.json())
    .then(json => {
      const story = new inkjs.Story(json);
      const globalTags = story.globalTags || [];
      globalTags.forEach(tag => {
        if (tag.toLowerCase().startsWith("gptcontext:")) {
          globalGptContext = tag.substring("gptcontext:".length).trim();
          console.log("🌍 Globaler Kontext:", globalGptContext);
        }
      });
      runStory(story, containerId);
    });
}

function runStory(story, containerId) {
  const container = document.getElementById(containerId);
  const wrapper = container.closest(".ink-wrapper");
  let gptPromptHint = "";
  let gptEnabled = true;
  let choicesEnabled = true;

  function continueStory() {
    while (story.canContinue) {
      const text = story.Continue();
      const paragraph = document.createElement("p");
      paragraph.textContent = text;
      container.appendChild(paragraph);

      const tags = story.currentTags || [];
      tags.forEach(tag => {
        const clean = tag.trim().toLowerCase();

        if (clean === "gpt:on") gptEnabled = true;
        if (clean === "gpt:off") gptEnabled = false;
        if (clean === "choices:on") choicesEnabled = true;
        if (clean === "choices:off") choicesEnabled = false;
        if (clean.startsWith("gptprompt:")) {
          gptPromptHint = tag.substring("gptprompt:".length).trim();
        }

        const [k, v] = tag.split(":");
        if (!k || !v) return;
        const key = k.trim().toLowerCase();
        const val = v.trim();

        if (key === "background") {
          wrapper.style.backgroundImage = `url('${val}')`;
          wrapper.style.backgroundSize = "cover";
          wrapper.style.backgroundPosition = "center";
          wrapper.style.backgroundRepeat = "no-repeat";
        }

        if (key === "image") {
          const img = document.createElement("img");
          img.src = val;
          img.alt = "Bild";
          img.style.maxWidth = "100%";
          img.style.margin = "1em 0";
          container.appendChild(img);
        }
      });
    }

    removeAll(container, ".choice");

    if (choicesEnabled) {
      story.currentChoices.forEach(choice => {
        const choiceEl = document.createElement("p");
        choiceEl.classList.add("choice");
        choiceEl.innerHTML = `<a href="#">${choice.text}</a>`;
        container.appendChild(choiceEl);

        choiceEl.querySelector("a").addEventListener("click", e => {
          e.preventDefault();
          story.ChooseChoiceIndex(choice.index);
          removeAll(container, ".choice");
          removeElement(container, "userInputArea");
          continueStory();
        });
      });
    }

    if (gptEnabled) showGptInput(container, story, gptPromptHint);
    else removeElement(container, "userInputArea");
  }

  continueStory();
}

function showGptInput(container, story, promptHint) {
  removeElement(container, "userInputArea");

  const inputWrap = document.createElement("div");
  inputWrap.id = "userInputArea";

  const input = document.createElement("input");
  input.id = "userInput";
  input.placeholder = "Was möchten Sie tun?";
  input.type = "text";

  const button = document.createElement("button");
    button.id = "userInputButton";
  button.textContent = "Senden";

  input.addEventListener("keydown", e => {
    if (e.key === "Enter") {
      e.preventDefault();
      handleUserInput(container, story, promptHint, input);
    }
  });

  button.addEventListener("click", () => handleUserInput(container, story, promptHint, input));

  inputWrap.appendChild(input);
  inputWrap.appendChild(button);
  container.appendChild(inputWrap);
  input.focus();
}

async function handleUserInput(container, story, promptHint, inputField) {
  const input = inputField.value.trim();
  console.log("📨 Benutzereingabe: ", input);
  document.getElementById("userInput").value = "";

  const para = document.createElement("p");
  para.textContent = `🗣️ Sie: ${input}`;
  para.classList.add("user-input");
  container.appendChild(para);

  const result = await askGPTForChoiceIndex(input, story, promptHint);

  if (result.index !== null) {
    story.ChooseChoiceIndex(result.index);
    removeAll(container, ".choice");
    removeElement(container, "userInputArea");
    runStory(story, container.id); // restart flow
  } else {
    const p = document.createElement("p");
    p.textContent = result.rawResponse || "❌ GPT konnte Ihre Eingabe nicht zuordnen.";
    container.appendChild(p);
    showGptInput(container, story, promptHint);
  }
}

async function askGPTForChoiceIndex(input, story, promptHint) {
  const choices = story.currentChoices.map((c, i) => `(${i}): ${c.text}`).join("\n");

  const prompt = `${globalGptContext}\n\n${promptHint}\n\nSpieler sagt: "${input}"\nHier sind die Optionen:\n${choices}\n\nAntworten Sie mit einer Zahl.`;

  const res = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${openaiApiKey}`
    },
    body: JSON.stringify({
      model: gptModel,
      messages: [{ role: "user", content: prompt }],
      temperature: 0
    })
  });

  const data = await res.json();
  const reply = data.choices?.[0]?.message?.content.trim();
  const index = parseInt(reply);

  return {
    index: isNaN(index) ? null : index,
    rawResponse: reply
  };
}

function removeAll(container, selector) {
  container.querySelectorAll(selector).forEach(el => el.remove());
}

function removeElement(container, id) {
  const el = container.querySelector(`#${id}`);
  if (el) el.remove();
}
