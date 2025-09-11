### **Verbatim Matching Detail Page**

**User Story 2.3 – View matching results**  
**As a** user  
**I want** a tree view of matching elements  
**So that** I can see the hierarchy of events and sub-events

**Acceptance Criteria:**

* Root: list of events, each with: title, speakers, content (verbatim), sub-events.
* Sub-events follow the same structure as events.
* A save button is available on the page.
* Clicking the save button stores all modifications made to the matching.

**User Story 2.4 – Edit event/sub-event**  
**As a** user  
**I want** to edit title, speakers, and verbatim of an event/sub-event  
**So that** I can correct or update the information

**Acceptance Criteria:**

* Title cannot be empty.
* Speakers: can add multiple speakers with: title (M./Mme), first name (required), last name (required), function (optional), party (optional).
* Verbatim text can be changed or removed completely.

**User Story 2.5 – Manage event/sub-event structure**  
**As a** user  
**I want** to add, rearrange, and delete events/sub-events  
**So that** I can structure the verbatim matching hierarchy appropriately

**User Story 2.6 – Save edited matching**
**As a** user
**I want** to save the edits I made on a verbatim matching
**So that** my changes are persisted

**Acceptance Criteria:**

* A save button is available on the page.
* Clicking the save button stores all modifications made to the matching.

**User Story 2.7 – Validate matching result**
**As a** user
**I want** to validate a verbatim matching result
**So that** I can mark it as finalized and correct

**Acceptance Criteria:**

* A validate button is available on the page.
* Clicking the validate button changes the matching status to VALIDATED.

---

## **3\. Referential Feature**

**User Story 3.1 – View current referential**  
**As a** user  
**I want** to view current referential content  
**So that** I know the latest uploaded referential details

**Acceptance Criteria:**

* Display details: username, upload date, format (JSON/XML), similarity threshold, list of correspondences (verbatim term, event term, type).

**User Story 3.2 – Upload new referential**  
**As a** user  
**I want** to upload a new JSON/XML referential file  
**So that** I can update the referential used by the system

**User Story 3.3 – Download referential**  
**As a** user  
**I want** to download the referential content  
**So that** I can retrieve it in its original format (JSON or XML)
