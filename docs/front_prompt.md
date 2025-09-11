# Context
You are tasked with developing a complete front-end application. The back-end is a fully functional Java API, and the entire code base, along with detailed specifications, will be provided. 
The application must be built using the latest stable version of Angular, with a specific component library and authentication method. 
The design and styling of the application are critical and must precisely replicate the look and feel of a given public website.
- Goal: Provide a front end for the reconciliation of verbatim transcripts and tagging.  
- Backend: Java API (full code and spec provided separately).  
- Frontend: Angular 18 + ng-zorro.  
- Auth: OIDC with JWT, secure login for Chamber users.  
- Design: Match typography, colors, layout, and responsiveness of https://www.chd.lu/fr.

# Role:
You are an industry-leading Senior Front-End Developer with over two decades of relevant experience and thought leadership. Your expertise spans the full development lifecycle, from architecture and design to implementation, testing, and deployment. You are a master of the Angular framework and its ecosystem, with deep knowledge of component libraries, state management, and robust authentication flows. Build a full Angular 18 application that consumes a Java backend API for a matching tool used by the Luxembourg Chamber of Deputies. 

# Action
1.  Familiarize yourself with the provided angular code and Java API code and the full specifications to understand the data models, endpoints, and business logic.
2.  Using Angular 18, based on the current project iniatialization and structure, ensuring it adheres to best practices and is modular and scalable.
3.  Implement the user interface using the ng-zorro component framework. All components must be developed to match the visual design and user experience of `https://www.chd.lu/fr`. Pay close attention to colors, typography, spacing, and component behaviors.
4.  Integrate the OIDC (OpenID Connect) authentication method, handling all necessary login, logout, and token management flows securely. The authentication must be seamless and fully functional.
5.  Develop all necessary components, services, and modules to consume the Java API, ensuring data is displayed and manipulated according to the user stories.
6.  Write clean, commented, and well-structured code. The code should be production-ready, maintainable, and easily extensible.
7.  Provide a step-by-step guide on how to build, run, and test the application, including a list of any required dependencies or configurations.
8.  Don't develop all the feature directly. Before starting developping you must ask me which feature to I want to develop. I must give you the go before starting developping a new feature
9.  When ready to develop Ask me if you can proceed
10. IMPORTANT: All UI component's must be based on NG-ZORRO


**Verbatim Mathing User Stories**

---

## **0\. Authentication Feature**

**User Story 0.1 – Login via SSO**  
 **As a** user  
 **I want** a login page with a single login button  
 **So that** I can connect to the system via my SSO

**Acceptance Criteria:**

* The login page contains only one login button.
* Clicking the login button redirects the user to their SSO.
* If the connection succeeds, the user is redirected to the Session Page.
* If the connection fails, the user is redirected back to the login page with an error message displayed.

---

## **1\. Session Feature**

### **Session Page**

**User Story 1.1 – View list of sessions**  
 **As a** user  
 **I want** to see all available sessions in a table  
 **So that** I can select a session to view its details

**Acceptance Criteria:**
* Each session in the table shows: name, identifier, date.
* Clicking on a session opens its Session Detail Page.

---

### **Session Detail Page**

**User Story 1.2 – View session details**  
 **As a** user  
 **I want** to view detailed information for a session  
 **So that** I can see all related verbatim matching results

**Acceptance Criteria:**
* Session detail page displays: name, identifier, date.
* Lists all verbatim matching result versions in a table.
* Each verbatim matching result row shows:
  * Session identifier
  * Version
  * Status as a colored tag:
    * UPLOADED (purple)
    * PROCESSING (blue)
    * AWAITING\_CORRECTION (orange)
    * VALIDATED (green)
    * ERROR (red)
  * Username who created the matching
  * Creation date
  * Actions: view, edit, delete, export

**User Story 1.3 – Start new verbatim matching**  
 **As a** user  
 **I want** a button to start a new verbatim matching  
 **So that** I can create a new matching from the session

**Acceptance Criteria:**
* Button is located at the top right of the verbatim matching table.
* Clicking the button opens the “Create Verbatim Matching” page.

**User Story 1.4 – Open verbatim matching details**  
 **As a** user  
 **I want** to click on a verbatim matching result row  
 **So that** I can view and manage that matching in the “Verbatim Matching Detail” page

---

## **2\. Verbatim Matching Feature**

### **Create Verbatim Matching Page**

**User Story 2.1 – Upload verbatim file**  
 **As a** user  
 **I want** to upload a DOCX file from my device  
 **So that** I can create a new verbatim matching

**Acceptance Criteria:**

* Only Word (DOCX) files are accepted.
* Backend validates the document and returns a status: READY or ERROR.
  * READY: Start button is enabled.
  * ERROR: Start button is disabled and error message displayed.

**User Story 2.2 – Start matching process**  
 **As a** user  
 **I want** to start the verbatim matching process  
 **So that** I can generate matching results

**Acceptance Criteria:**
* A progress status is displayed while processing.
* On success, the matching result is displayed on the result page.
* On failure, an error message is displayed.

---

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


# Requirements
- Use Angular 18 modular architecture, lazy loading.  
- Use services for API calls, guards, interceptors for auth and error handling.  
- Use ng-zorro components (tables, forms, modals, dropdowns, progress bar).
- Use @ngrx/store for global state management, @ngrx/effects to isolate side effects from each component, @ngrx/operators utility library 
- Ensure responsive design.  
- Implement accessibility (ARIA roles, keyboard navigation).  
- Add Jasmine/Karma unit tests with at least 70% coverage.  

# Deliverables
- Complete Angular project, production-ready.  
- Full code for all modules, components, services, interceptors, guards.  
- OIDC-secured login flow.  
- Connected UI for all features above.  
- README with setup and run instructions.  

# Output Format
- Return full code files with correct paths.  
- Separate files with headings, e.g. `📄 src/app/app.module.ts`.  
- No partial snippets unless file exceeds limit.  
- Keep explanations minimal, focus on production-ready code.  
