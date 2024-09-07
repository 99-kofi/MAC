document.addEventListener('DOMContentLoaded', () => {
    const startButton = document.getElementById('start-voice');
    const statusDisplay = document.getElementById('status');
    const visualizer = document.getElementById('visualizer');

    let recognition = new (window.SpeechRecognition || window.webkitSpeechRecognition)();
    let synth = window.speechSynthesis;

    let userMemory = {
        name: ''
    };

    const restrictedWords = ['sex', 'porn', 'violence', 'drugs', 'hate', 'kill', 'suicide', 'self-harm', 'racism'];

    recognition.lang = 'en-US';
    recognition.interimResults = false;
    recognition.maxAlternatives = 1;

    recognition.onstart = () => {
        statusDisplay.textContent = 'Listening...';
        visualizer.style.display = 'block';
    };

    recognition.onspeechend = () => {
        statusDisplay.textContent = 'Stopped listening.';
        recognition.stop();
        visualizer.style.display = 'none';
    };

    recognition.onerror = (event) => {
        statusDisplay.textContent = `Error occurred: ${event.error}`;
        visualizer.style.display = 'none';
    };

    recognition.onresult = async (event) => {
        const transcript = event.results[0][0].transcript.toLowerCase();
        statusDisplay.textContent = `You said: ${transcript}`;
        await respondToInput(transcript);
    };

    startButton.addEventListener('click', () => {
        recognition.start();
    });

    async function respondToInput(input) {
        let response = '';

        if (containsRestrictedWords(input)) {
            response = "I\'m sorry, but I can\'t assist with that. Let's keep things positive and appropriate.";
        } else if (input.includes('my name is')) {
            const name = input.split('my name is ')[1];
            userMemory.name = name;
            response = `Nice to meet you, ${name}! I'll remember your name.`;
        } else if (input.includes('what is my name') || input.includes('do you remember my name')) {
            if (userMemory.name) {
                response = `Your name is ${userMemory.name}.`;
            } else {
                response = "I don't know your name yet. You can tell me by saying 'My name is [your name]'";
            }
        } else if (input.includes('forget my name')) {
            userMemory.name = '';
            response = "I've forgotten your name.";
        } else if (input.includes('hello') || input.includes('hi')) {
            response = userMemory.name ? `Hello, ${userMemory.name}! How can I assist you today?` : 'Hello! How can I assist you today?';
        } else if (input.includes('what is your name')) {
            response = 'I am MAC, your advanced voice assistant.';
        } else if (input.includes('who created you') || input.includes('who developed you')) {
            response = 'I was created by WAIT Technologies.';
        } else if (input.includes('what can you do') || input.includes('what are you capable of')) {
            response = 'I can help with various tasks like searching the web, providing weather updates, telling stories, translating text, solving math problems, and more.';
        } else if (input.includes('what time is it')) {
            const now = new Date();
            response = `The current time is ${now.getHours()}:${now.getMinutes()}`;
        } else if (input.includes('what is the date')) {
            const now = new Date();
            response = `Today\'s date is ${now.getMonth() + 1}/${now.getDate()}/${now.getFullYear()}`;
        } else if (input.startsWith('search for') || input.startsWith('search')) {
            const query = input.split('search for ')[1] || input.split('search ')[1];
            if (query) {
                window.open(`https://www.google.com/search?q=${encodeURIComponent(query)}`, '_blank');
                response = `Searching for ${query} on Google...`;
            } else {
                response = 'Please specify what you would like to search for.';
            }
        } else if (input.includes('calculate')) {
            response = await performCalculation(input);
        } else if (input.includes('translate to french')) {
            const textToTranslate = input.replace('translate to french', '').trim();
            response = await translateToFrench(textToTranslate);
        } else if (input.includes('translate to english')) {
            const textToTranslate = input.replace('translate to english', '').trim();
            response = await translateToEnglish(textToTranslate);
        } else if (input.includes('tell me a joke')) {
            response = 'Why don\'t scientists trust atoms? Because they make up everything!';
        } else if (input.includes('sports news')) {
            window.open('https://www.bing.com/news/search?q=sports', '_blank');
            response = 'Opening sports news for you...';
        } else if (input.includes('education news')) {
            window.open('https://www.bing.com/news/search?q=education', '_blank');
            response = 'Opening education news for you...';
        } else if (input.includes('coding tips')) {
            window.open('https://www.google.com/search?q=coding+tips', '_blank');
            response = 'Searching for coding tips...';
        } else if (input.includes('play music')) {
            window.open('https://www.youtube.com/', '_blank');
            response = 'Opening music player for you...';
        } else if (input.includes('recipe for')) {
            const recipe = input.split('recipe for ')[1];
            if (recipe) {
                window.open(`https://www.google.com/search?q=${encodeURIComponent(recipe)}+recipe`, '_blank');
                response = `Searching for a recipe for ${recipe}...`;
            } else {
                response = 'Please specify the recipe you would like to search for.';
            }
        } else if (input.includes('tell me a story')) {
            response = await generateStory();
        } else if (input.includes('write a song') || input.includes('write lyrics')) {
            response = await generateLyrics(input);
        } else if (input.includes('world history')) {
            window.open('https://www.google.com/search?q=world+history', '_blank');
            response = 'Searching for world history information...';
        } else if (input.includes('math question')) {
            response = await performCalculation(input.replace('math question', '').trim());
        } else if (input.includes('weather in') || input.includes('what is the weather')) {
            const location = input.split('in ')[1] || 'your location';
            response = await fetchWeather(location);
        } else if (input.includes('entertainment news')) {
            window.open('https://www.ghanaweb.com/GhanaHomePage/entertainment/', '_blank');
            response = 'Opening entertainment news for you...';
        } else {
            response = `You said: ${input}. I don't have a specific response for that. Please note, MAC is still in its learning stage.`;
        }

        speak(response);
    }

    async function performCalculation(input) {
        try {
            let mathExpression = input.replace('calculate', '').trim();
            // Handle trigonometric functions
            mathExpression = mathExpression.replace(/sin|cos|tan/g, function(match) {
                return `Math.${match}`;
            });
            // Handle square root and power
            mathExpression = mathExpression.replace(/sqrt/g, 'Math.sqrt').replace(/pow/g, 'Math.pow');

            const result = eval(mathExpression);
            return `The result is ${result}`;
        } catch (error) {
            return 'I\'m sorry, I could not calculate that.';
        }
    }

    async function generateStory() {
        return "In the bustling town of Awutu Bereku, Ghana, lived a young boy named Kofi. From a very young age, Kofi was fascinated by technology. While other children played soccer in the dusty streets, Kofi spent hours tinkering with old gadgets, trying to understand how they worked.\
                Kofi’s family wasn’t wealthy, but they were supportive. His mother, Ama, worked as a seamstress, and his father, Kwame, was a fisherman. They saved every extra cedi to buy Kofi a second-hand laptop. When Kofi finally received it, his eyes sparkled with joy. He knew this was his ticket to a brighter future.\
                Every evening after school, Kofi would sit under the baobab tree in his backyard, where the internet signal was strongest. He taught himself to code using free online resources. He built simple websites and apps, dreaming of one day creating something that could change the world.\
                One day, Kofi heard about a national tech competition for young innovators. The grand prize was a scholarship to a prestigious tech academy in Accra. Determined to win, Kofi spent countless nights perfecting his project—a mobile app that helped local farmers track weather patterns and optimize their crop yields.\
                The day of the competition arrived, and Kofi presented his app with confidence. The judges were impressed by his ingenuity and the potential impact of his creation. When they announced Kofi as the winner, he could hardly believe it. His hard work had paid off.\
                At the tech academy, Kofi thrived. He met other young tech enthusiasts and learned from some of the best minds in the industry. He continued to develop his app, which soon gained recognition and support from agricultural organizations across Ghana.\
                Years later, Kofi’s app had transformed the lives of thousands of farmers, increasing their productivity and improving their livelihoods. Kofi became a well-known tech entrepreneur, but he never forgot his roots. He returned to Awutu Bereku often, inspiring other young boys and girls to dream big and reach for the stars.\
                Kofi’s journey was a testament to the power of determination, hard work, and the belief that with the right tools and support, anyone can soar higher than they ever imagined.\
                I hope you enjoyed the story!";
    }

    async function generateLyrics(input) {
        return "Here's a song about love and hope...";
    }

    async function translateToFrench(text) {
        try {
            const response = await fetch('https://libretranslate.de/translate', {
                method: 'POST',
                body: JSON.stringify({
                    q: text,
                    source: 'en',
                    target: 'fr',
                    format: 'text'
                }),
                headers: { 'Content-Type': 'application/json' }
            });
            const data = await response.json();
            return data.translatedText ? `In French: ${data.translatedText}` : 'Translation failed.';
        } catch (error) {
            return 'I\'m sorry, I couldn\'t translate that.';
        }
    }

    async function translateToEnglish(text) {
        try {
            const response = await fetch('https://libretranslate.de/translate', {
                method: 'POST',
                body: JSON.stringify({
                    q: text,
                    source: 'fr',
                    target: 'en',
                    format: 'text'
                }),
                headers: { 'Content-Type': 'application/json' }
            });
            const data = await response.json();
            return data.translatedText ? `In English: ${data.translatedText}` : 'Translation failed.';
        } catch (error) {
            return 'I\'m sorry, I couldn\'t translate that.';
        }
    }

    function containsRestrictedWords(input) {
        return restrictedWords.some(word => input.includes(word));
    }

    function speak(text) {
        if (synth.speaking) {
            console.error('SpeechSynthesis is already speaking');
            return;
        }

        const utterance = new SpeechSynthesisUtterance(text);
        const voices = synth.getVoices();

        utterance.voice = voices.find(voice => voice.lang === 'en-US' || voice.lang.includes('en')) || voices[0];
        utterance.rate = 1.0;

        utterance.onend = () => {
            console.log('SpeechSynthesisUtterance.onend');
        };

        utterance.onerror = (event) => {
            console.error('SpeechSynthesisUtterance.onerror', event);
        };

        setTimeout(() => {
            synth.speak(utterance);
            if (!synth.speaking) {
                console.warn("SpeechSynthesis failed to start.");
                statusDisplay.textContent = "I'm unable to speak on this device.";
            }
        }, 250);
    }

    if (synth.onvoiceschanged !== undefined) {
        synth.onvoiceschanged = () => {
            console.log('Voices changed:', synth.getVoices());
        };
    }
});
