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
            response = 'I can help with various tasks like searching the web, providing weather updates, telling stories, and more. Please note, MAC is still in its learning stage, so I\'m continuously improving.';
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
            try {
                const result = eval(input.split('calculate ')[1]);
                response = `The result is ${result}`;
            } catch (error) {
                response = 'I\'m sorry, I could not calculate that.';
            }
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
            const question = input.split('math question ')[1];
            try {
                const result = eval(question);
                response = `The answer is ${result}`;
            } catch (error) {
                response = 'I\'m sorry, I could not solve that math question.';
            }
        } else if (input.includes('weather in') || input.includes('what is the weather')) {
            // To be rewritten to show weather for user in his or her current location
            const location = input.split('in ')[1] || 'your location';
            response = await fetchWeather(location);
        } else if (input.includes('entertainment news')) {
            window.open('https://www.bing.com/news/search?q=entertainment', '_blank');
            response = 'Opening entertainment news for you...';
        } else {
            response = `You said: ${input}. I don't have a specific response for that. Please note, MAC is still in its learning stage.`;
        }

        speak(response);
    }

    function containsRestrictedWords(input) {
        return restrictedWords.some(word => input.includes(word));
    }

    async function generateStory() {
        return "Once upon a time, in a mystical land far away, there was a brave knight who set out on a quest...";
    }

    async function generateLyrics(input) {
        return "Here's a song about love and hope...";
    }

    async function fetchWeather(location) {
        const apiKey = '95546e2ae4b482daf262fc4c81dae937'; // Replace with your weather API key

        //To be refactored and integrated with this code base
        let userCoordinates;

        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(storeCoordinates);
        } else { 
            //Add better error handling that integrates well with this project 
            console.log("Geolocation is not supported by this browser.");
        }

        function storeCoordinates(position) {
            userCoordinates = {
                latitude: position.coords.latitude,
                longitude: position.coords.longitude
            };
        }

        const response = await fetch(`https://api.openweathermap.org/data/2.5/weather?q=${encodeURIComponent(location)}&appid=${apiKey}&units=metric`);
        const data = await response.json();
        if (data.main) {
            return `The weather in ${location} is ${data.weather[0].description} with a temperature of ${data.main.temp}Â°C.`;
        } else {
            return `I\'m sorry, I couldn\'t fetch the weather for ${location}.`;
        }
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


