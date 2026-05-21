type UpdateCallback = (interim: string, final: string) => void;
type StateCallback = (state: 'started' | 'stopped' | 'error', detail?: string) => void;

export class SpeechRecognizer {
  private recognition: any;
  private finalTranscript = '';
  private running = false;

  constructor(
    private onUpdate: UpdateCallback,
    private onState: StateCallback,
  ) {
    const SR =
      (window as any).SpeechRecognition ??
      (window as any).webkitSpeechRecognition;

    if (!SR) throw new Error('Speech recognition not supported in this browser.');

    this.recognition = new SR();
    this.recognition.continuous = true;
    this.recognition.interimResults = true;
    this.recognition.lang = 'en-US';

    this.recognition.onresult = (e: any) => {
      let interim = '';
      for (let i = e.resultIndex; i < e.results.length; i++) {
        const t = e.results[i][0].transcript;
        if (e.results[i].isFinal) this.finalTranscript += t + ' ';
        else interim += t;
      }
      this.onUpdate(interim, this.finalTranscript.trim());
    };

    this.recognition.onerror = (e: any) => {
      if (e.error !== 'aborted') this.onState('error', e.error);
    };

    this.recognition.onend = () => {
      if (this.running) this.recognition.start();
    };
  }

  start(): void {
    this.finalTranscript = '';
    this.running = true;
    this.recognition.start();
    this.onState('started');
  }

  stop(): string {
    this.running = false;
    this.recognition.stop();
    this.onState('stopped');
    return this.finalTranscript.trim();
  }
}
