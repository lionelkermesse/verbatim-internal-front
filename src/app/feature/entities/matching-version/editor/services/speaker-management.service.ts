import {inject, Injectable} from '@angular/core';
import {IMatchingResult, ISpeaker} from '@chd-digital-verbatim-front/core/models';
import {EnhancedTreeNode} from '../matching-editor.models';
import {MatchingEditorStateService} from '../matching-editor-state.service';

export interface NewSpeakerForm {
  firstName: string;
  lastName: string;
  function: string;
  party: string;
}

@Injectable({
  providedIn: 'root'
})
export class SpeakerManagementService {
  private readonly stateService = inject(MatchingEditorStateService);

  /**
   * Get all available speakers excluding those already assigned to the selected event
   */
  getAvailableSpeakers(
    selectedItem: EnhancedTreeNode | null,
    allTreeNodes: EnhancedTreeNode[],
    matchingResult: IMatchingResult | null
  ): ISpeaker[] {
    if (!selectedItem) return [];

    // Gather speakers from original matchingResult
    const originalSpeakers = matchingResult?.speakers || [];

    // Gather speakers from all events in the tree
    const speakersFromEvents = new Set<any>();
    const addSpeakersFromNode = (node: EnhancedTreeNode) => {
      if (node.speakers && node.speakers.length > 0) {
        node.speakers.forEach(speaker => {
          // Use fullName as unique key since ISpeaker has no id
          const key = `${speaker.firstName} ${speaker.lastName}`;
          speakersFromEvents.add(JSON.stringify({...speaker, key}));
        });
      }
      if (node.inners && node.inners.length > 0) {
        (node.inners as EnhancedTreeNode[]).forEach(child => addSpeakersFromNode(child));
      }
    };

    // Process all root nodes
    allTreeNodes.forEach(rootNode => {
      addSpeakersFromNode(rootNode);
    });

    // Convert set back to array of speaker objects
    const eventSpeakers = Array.from(speakersFromEvents).map(speakerStr => {
      const speaker = JSON.parse(speakerStr);
      delete speaker.key; // Remove the temporary key
      return speaker;
    });

    // Combine original speakers and event speakers, removing duplicates
    const allSpeakers = [...originalSpeakers];
    eventSpeakers.forEach(eventSpeaker => {
      const exists = allSpeakers.some(speaker =>
        (`${speaker.firstName} ${speaker.lastName}`) ===
        (eventSpeaker.fullName || `${eventSpeaker.firstName} ${eventSpeaker.lastName}`)
      );
      if (!exists) {
        allSpeakers.push(eventSpeaker);
      }
    });

    // Filter out speakers that are already assigned to the current event
    const assignedSpeakerNames = selectedItem.speakers.map(s => `${s.firstName} ${s.lastName}`);

    return allSpeakers.filter(speaker => {
      const speakerFullName = `${speaker.firstName} ${speaker.lastName}`;
      return !assignedSpeakerNames.includes(speakerFullName);
    });
  }

  /**
   * Assign an existing speaker to an event
   */
  assignSpeaker(eventId: number, speaker: ISpeaker): void {
    this.stateService.assignSpeaker(eventId, speaker);
  }

  /**
   * Remove a speaker from an event by index
   */
  removeSpeaker(eventId: number, speakerIndex: number): void {
    this.stateService.removeSpeaker(eventId, speakerIndex);
  }

  /**
   * Create a new speaker and assign it to an event
   */
  createAndAssignSpeaker(eventId: number, speakerData: NewSpeakerForm): void {
    const firstName = speakerData.firstName.trim();
    const lastName = speakerData.lastName.trim();
    const fullName = `${firstName} ${lastName}`;

    const newSpeaker: ISpeaker = {
      firstName,
      lastName,
      function: speakerData.function.trim(),
      party: speakerData.party.trim(),
      gender: '' // Default empty, could be enhanced with a gender field
    };

    this.stateService.assignSpeaker(eventId, newSpeaker);
  }

  /**
   * Validate new speaker form data
   */
  validateNewSpeaker(speakerForm: NewSpeakerForm): boolean {
    return !!(speakerForm.firstName.trim() && speakerForm.lastName.trim());
  }

  /**
   * Get display name for a speaker
   */
  getSpeakerDisplayName(speaker: ISpeaker): string {
    return `${speaker.firstName} ${speaker.lastName}`;
  }

  /**
   * Get full label for a speaker (with function if available)
   */
  getSpeakerFullLabel(speaker: ISpeaker): string {
    const name = this.getSpeakerDisplayName(speaker);
    return speaker.function ? `${name} (${speaker.function})` : name;
  }
}
