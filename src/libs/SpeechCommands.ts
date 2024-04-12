export type CommandEvent = { command: string, value: string }

class SpeechCommands {
    private recognition: SpeechRecognition
    private commands: Record<string, boolean>
    private results: Record<string, string>
    private timers: Record<string, NodeJS.Timeout>
    private lang: string
    public recording = false
    public onEnd: (e: CommandEvent) => void
    public onResult: (e: CommandEvent) => void

    constructor(public continuous: boolean, public timeout: number) {
        this.recognition = new (window.SpeechRecognition || window.webkitSpeechRecognition)()
        this.commands = {}
        this.results = {}
        this.timers = {}

        this.lang = 'en-EN'
        this.onEnd = () => { }
        this.onResult = () => { }

        this.recognition.onend = this.onEndHandler.bind(this)
        this.recognition.onresult = this.onResultHandler.bind(this)
    }

    start(lang: string) {
        this.lang = lang ?? this.lang
        this.recognition.continuous = true
        this.recognition.interimResults = true
        this.recognition.maxAlternatives = 1
        this.recognition.lang = this.lang
        this.recognition.start()
        this.recording = true
    }

    stop() {
        this.recognition.stop()
        this.recording = false
    }

    private onEndHandler() {
        for (const [command, triggered] of Object.entries(this.commands)) {
            if(triggered) {
                this.onEnd({ command, value: this.results[command] })
            }

            this.commands[command] = false
            this.results[command] = ''
            if (this.timers[command]) {
                clearTimeout(this.timers[command])
                delete this.timers[command]
            }
        }

        if (this.continuous) {
            this.recognition.start()
        }
    }

    private onResultHandler(event: SpeechRecognitionEvent) {
        let result = '';
        for (let i = event.resultIndex; i < event.results.length; i++) {
            if (event.results[i].isFinal) {
                result += event.results[i][0].transcript + ' ';
            } else {
                result += event.results[i][0].transcript;
            }
        }

        console.log(result)
        for (const [command, triggered] of Object.entries(this.commands)) {
            if (result.toLowerCase().includes(command)) {
                this.commands[command] = true
                const commandRegExp = new RegExp(command, 'gi')
                this.results[command] = result.replace(commandRegExp, '');
                this.onResult({ command, value: this.results[command] })
            }

            if (triggered) {
                const commandRegExp = new RegExp(command, 'gi')
                this.results[command] = result.replace(commandRegExp, '');
                this.onResult({ command, value: this.results[command] })

                if (this.timers[command]) {
                    clearTimeout(this.timers[command])
                }
                this.timers[command] = setTimeout(() => {
                    this.onEnd({ command, value: this.results[command] })
                    delete this.timers[command]
                    this.commands[command] = false
                    this.results[command] = ''
                }, this.timeout)
            } else {
                this.results[command] = ''
            }
        }
    }

    addCommand(command: string) {
        this.commands[command] = this.commands[command] || false
    }
    removeCommand(command: string) {
        delete this.commands[command]
    }
}

export default SpeechCommands