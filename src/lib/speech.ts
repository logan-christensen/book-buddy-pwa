type UpdateCallback = (interim: string, final: string) => void;
type StateCallback = (state: 'started' | 'stopped' | 'error', detail?: string) => void;

export class SpeechRecognizer {
  private recognition: any;
  private finalTranscript = '';
  private running = false;
  private seen = new Set<number>(); // result indices already committed to finalTranscript

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
        if (e.results[i].isFinal) {
          if (!this.seen.has(i)) {
            this.seen.add(i);
            this.finalTranscript += e.results[i][0].transcript + ' ';
          }
        } else {
          interim += e.results[i][0].transcript;
        }
      }
      this.onUpdate(interim, this.finalTranscript.trim());
    };

    this.recognition.onerror = (e: any) => {
      if (e.error !== 'aborted') this.onState('error', e.error);
    };

    // Don't restart on natural end — let the editor decide what to do.
    // Restarting causes Chrome mobile to replay previous finals with fresh
    // indices, bypassing the seen-set dedup.
    this.recognition.onend = () => {
      if (this.running) {
        this.running = false;
        this.onState('stopped');
      }
    };
  }

  start(): void {
    this.finalTranscript = '';
    this.seen.clear();
    this.running = true;
    this.recognition.start();
    this.onState('started');
  }

  stop(): string {
    this.running = false;
    try { this.recognition.stop(); } catch { /* already stopped */ }
    this.onState('stopped');
    return this.finalTranscript.trim();
  }

  get transcript(): string {
    return this.finalTranscript.trim();
  }
}
