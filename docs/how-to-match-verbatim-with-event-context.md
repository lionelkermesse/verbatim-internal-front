# 1. Overview

This document specifies the requirements for the matching algorithm and associated workflows within the Verbatim Reconciliation application. The primary goal is to automatically associate verbatim interventions (`ParsedVerbatimDto`) with tagged parliamentary events (`ParsedEventDto`), while providing robust mechanisms for error detection, manual correction, and data traceability.

The system will adhere to the functional and technical requirements outlined in the project documentation, including user stories `GEN-003`, `COR-001`, `ENR-001`, and `REF-001`.

---

# 2. Data Structures

The matching process will operate on the following primary data structures:

- **ParsedVerbatimDto**: Contains the full parsed content from a DOCX file.
  - `sessionDate`, `sessionStartTime`, `sessionEndTime`: Metadata extracted from the document.
  - `records`: A `List<VerbatimTextRecord>` where each record represents a distinct intervention block identified by a numbered heading.
    - `udil` (title): The title of the intervention (e.g., "Ouverture de la séance publique").
    - `udtx` (text): The full, normalized text content of the intervention.
    - `itemNumber`: The sequential number of the intervention.

- **ParsedEventDto**: Contains the hierarchically structured event data.
  - `root`: A `List<EventDto>` representing the top-level events (hierarchy '1').
  - `details`: A nested `List<EventDto>` within each event, representing sub-events.
    - `title`: The title of the event (e.g., "Ouverture de la séance publique").
    - `speakerName`: The full name of the speaker, if applicable.
    - `debutEventMs`: The timestamp used for chronological sorting.

- **MatchingResultDto**: The output of the matching process.
  - `interventionContent`, `interventionLine`: Data from the original `VerbatimTextRecord`.
  - `eventTitle`, `eventSpeaker`: Data from the matched `EventDto`.
  - `status`: An enum (`MatchingStatus`) indicating the outcome (e.g., `AUTOMATICALLY_MATCHED`, `UNMATCHED`, `MATCHING_CONFLICT`).
  - `isManualCorrection`: A boolean flag to track user-made changes.

---

# 3. Configuration and Threshold Management (`REF-001`, `REF-003`, `REF-004`)

To ensure flexibility and accuracy, the matching logic will be driven by an external configuration file (e.g., `matching-rules.json`). This file will be loaded at application startup.

**File Structure:**
- The configuration will be a structured format (JSON, XML, or CSV) containing:
  - `structuralKeywords`: A list of phrases to identify non-speaker events (e.g., "ouverture de la séance", "vote sur").
  - `correspondences`: An array of mapping rules to handle known variations between verbatim and event titles.
    - `verbatim_term`: The text found in the verbatim document.
    - `event_term`: The corresponding text in the event data.
    - `type`: `"exact"` or `"approximate"`.
    - `similarityThreshold`: A value between 0.0 and 1.0 (e.g., 0.85) used for approximate matches. This directly addresses `REF-003`.

---

# 4. Matching Algorithm Specification

The core logic resides in the `MatchingAlgorithmService` and follows a multi-pass approach to maximize accuracy.

## Step 1: Pre-processing and Normalization

Before matching, all relevant text fields (`udil` from verbatim, `title` from events) must be normalized to ensure consistent comparisons:

- Convert all text to lowercase.
- Remove leading/trailing whitespace.
- Replace multiple whitespace characters with a single space.
- Remove punctuation and special characters (e.g., `. , - ( )`).

## Step 2: Pass 1 - Structural Event Matching (Anchor Points)

- Flatten the `ParsedEventDto` hierarchy into a single, chronologically sorted `List<EventDto>`.
- Iterate through each `VerbatimTextRecord`.
- For each record, iterate through the list of available `EventDto` objects.
- An event is considered "structural" if its `speakerName` is null/blank or contains "(n/a)".
- A match is found if the normalized verbatim title (`udil`) is an exact match for a normalized structural event title, or if it matches a rule in the configuration file.
- When a match is found, create a `MatchingResultDto` with the status `AUTOMATICALLY_MATCHED`.
- Remove both the `VerbatimTextRecord` and the `EventDto` from the lists of unmatched items to prevent re-matching.

## Step 3: Pass 2 - Speaker-Based Matching

- Iterate through the remaining `VerbatimTextRecord` objects.
- For each record, parse its content (`udtx`) to identify a speaker using the `SPEAKER_PATTERN` (e.g., "M. Fernand Etgen...").
- If a speaker is identified, normalize their name.
- Iterate through the remaining chronologically sorted `EventDto` objects.
- A match is found if the normalized speaker name from the verbatim is an exact or approximate match for the normalized `speakerName` in an event.
- Upon finding a match, create a `MatchingResultDto` with `AUTOMATICALLY_MATCHED` status and remove both items from the unmatched lists.

## Step 4: Post-processing and Error Detection (`COR-001`)

- After the automated passes, the system will analyze the results to detect potential errors.
  - **Unmatched Interventions**: Any `VerbatimTextRecord` remaining in the unmatched list is flagged with `UNMATCHED` status.
  - **Unmatched Events**: Any `EventDto` remaining is considered an unmatched event. This can indicate a missing section in the verbatim.
  - **Temporal Misalignment**: The system will check the sequence of matched items. If the `itemNumber` of interventions does not align chronologically with the rank or `debutEventMs` of the matched events (e.g., intervention #5 is matched to event #10, while intervention #6 is matched to event #8), a `MATCHING_CONFLICT` status is assigned, signaling a potential temporal shift that requires manual review.

---

# 5. Error Correction and Validation Workflow (`COR-002`, `COR-003`)

- The user interface must provide a clear view of the matching results, highlighting items with `UNMATCHED` or `MATCHING_CONFLICT` statuses.
- **Manual Correction**: The user must be able to manually assign an unmatched intervention to any available event from the list of unmatched events.
- **Re-assignment**: The user can change an existing automatic match.
- **Tracking**: Any manual change must set the `isManualCorrection` flag to `true` in the `MatchingResultDto`.
- **Validation**: A "Validate" action (`COR-003`) finalizes the matching for the session. The system will verify that no interventions remain in an `UNMATCHED` state before allowing validation. A summary of corrections should be displayed to the user before final confirmation.

---

# 6. Export and Versioning Requirements (`ENR-001`, `ENR-002`, `ENR-003`)

- **Versioning**: Upon successful validation, the system will create a `MatchingVersion` entity.
  - This entity will store a complete JSON snapshot of the final `List<MatchingResultDto>`.
  - It will be timestamped and associated with the user who performed the validation.
  - The version number will be incremented for each subsequent validation of the same session.

- **Export**: The application must provide an option to export the final, validated matching data into a CSV file, as specified in `ENR-003`. The CSV will contain columns for `horodatage`, `intervenant`, and the content of the intervention.
