As we can see in the function runMatching, only root elements of events has been matched with the verbatim based on title, however the matching process is incompleted because an event can have inner events (details) for wich verbatim text content must be assigned. Here is the process to achieve that:

- if a root event has details not empty then the verbatim text matched to that even will be the input verbatim to fill inner event text

> if inner event has speaker then use algorithm to use algorithm (1) -> SPEAKER EXTRACTION BASED MATCHING
> if text content has not been found then use second algorithm (2)  -> TITLE EXTRACTION BASED

1. SPEAKER EXTRACTION BASED MATCHING
- to extract text content of an inner event we must get the speakers of that event
- the verbatim will read line by line and when a line contains the speaker full name(a speaker pattern matching must be used for that), then that line represents the start of text extraction
- the inner event text extraction stops when a different speaker is found or the end of verbatim is reached

2. TITLE EXTRACTION BASED MATCHING (CORRESPONDANCE or SIMILARITY matching)
- to extract text content of an inner event we must get the title of that event
- the verbatim will read line by line and when a lin[AGENT.md](AGENT.md)e contains parenthetical text (text in parentheses) and the text in parentheses is matching the event title based on correspondance/similarity then that represents the start of text extraction (skip that title in the extracted text)
- the inner event text extraction stops when a the current line contains parenthetical text or the end of verbatim is reached

