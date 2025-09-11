# Context:
The goal of matching is to fill events intervention text of a session from verbatim text.

The current matching algorithm is completely wrong according to the initial specifications.
The goal of the matching process is to provide an algorithm that would match a root event to verbatim record as follows:

# Inputs:
 - ParsedVerbatimDto : that represents the fully parsed content of a verbatim DOCX file, the content is structured interventions record texts.
 - ParsedEventDto : that represents the fully parsed content of an event EVT.TXT file, including metadata and the hierarchically structured records.

### Matching Process
#### 1. Title Matching
Generally a root event title must match a verbatim record title (udil) ignoring case a special character, which mean before matching,
- each title must be normalized
- if the titles match then the verbatim record must be get to fill the current event verbatim
- if no verbatim is found for the current event
