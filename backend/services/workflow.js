import { v4 as uuidv4 } from 'uuid';

/**
 * Manages the structure and progression tracker of tasks (AI Timeline).
 */
export class SessionWorkflow {
  constructor(sessionId = null) {
    this.sessionId = sessionId || uuidv4();
    this.steps = [];
    this.status = 'idle'; // idle | executing | completed | failed
    this.createdTime = new Date();
  }

  /**
   * Generates a structural sequence array for the UI to display on the Timeline.
   */
  initializeSteps(intent) {
    if (intent === 'data_report') {
      this.steps = [
        { id: 'parsing', label: 'Extracting document structure', status: 'pending', agent: 'Manager' },
        { id: 'analysis', label: 'Analyzing trends and statistics', status: 'pending', agent: 'Data Analyst' },
        { id: 'insights', label: 'Synthesizing strategic recommendations', status: 'pending', agent: 'Business Strategist' },
        { id: 'charts', label: 'Rendering high-resolution data graphics', status: 'pending', agent: 'Presentation Designer' },
        { id: 'documents', label: 'Compiling PDF & Word documentation', status: 'pending', agent: 'Report Writer' },
        { id: 'slides', label: 'Building PowerPoint presentation deck', status: 'pending', agent: 'Presentation Designer' },
        { id: 'packaging', label: 'Packaging assets into download files', status: 'pending', agent: 'Export Manager' }
      ];
    } else {
      // Default standard document operations sequence
      this.steps = [
        { id: 'parsing', label: 'Extracting content structure', status: 'pending', agent: 'Manager' },
        { id: 'analysis', label: 'Running document inspection', status: 'pending', agent: 'Data Analyst' },
        { id: 'documents', label: 'Synthesizing documentation artifacts', status: 'pending', agent: 'Report Writer' },
        { id: 'packaging', label: 'Generating compressed output archive', status: 'pending', agent: 'Export Manager' }
      ];
    }
    this.status = 'executing';
  }

  /**
   * Transitions progress states and logs milestones.
   */
  updateStepStatus(stepId, status, outputData = null) {
    const step = this.steps.find(s => s.id === stepId);
    if (step) {
      step.status = status;
      if (outputData) {
        step.output = outputData;
      }
    }
  }

  completeWorkflow() {
    this.status = 'completed';
    this.steps.forEach(s => {
      if (s.status === 'pending' || s.status === 'running') {
        s.status = 'completed';
      }
    });
  }

  failWorkflow() {
    this.status = 'failed';
  }

  getTimelineState() {
    return {
      sessionId: this.sessionId,
      status: this.status,
      steps: this.steps,
      timeElapsed: Math.floor((new Date() - this.createdTime) / 1000)
    };
  }
}