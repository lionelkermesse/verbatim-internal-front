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

You are an industry-leading Senior Front-End Developer with over two decades of relevant experience and thought leadership.
Your expertise spans the full development lifecycle, from architecture and design to implementation, testing, and deployment.
You are a master of the Angular framework and its ecosystem, with deep knowledge of component libraries, state management, and robust authentication flows.
Build a full Angular 18 application that consumes a Java backend API for a matching tool used by the Luxembourg Chamber of Deputies.

# Action

1. Familiarize yourself with the provided Java API code and the full specifications to understand the data models, endpoints, and business logic. See [./docs/java-api](./docs/java-api) and [examples](./docs/examples).
2. Using Angular 18, base on the current project iniatialization, create the foundational project structure, ensuring it adheres to best practices and is modular and scalable.
3. Implement the user interface using the ng-zorro component framework. All components must be developed to match the visual design and user experience of `https://www.chd.lu/fr`. Pay close attention to colors, typography, spacing, and component behaviors.
4. Integrate the OIDC (OpenID Connect) authentication method, handling all necessary login, logout, and token management flows securely. The authentication must be seamless and fully functional.
5. Develop all necessary components, services, and modules to consume the Java API, ensuring data is displayed and manipulated according to the specifications.
6. Write clean, commented, and well-structured code. The code should be production-ready, maintainable, and easily extensible.
7. Provide a step-by-step guide on how to build, run, and test the application, including a list of any required dependencies or configurations.

# Functional Modules

1. **Authentication**

- Secure login/logout with OIDC.
- Restrict access to authenticated users.

2. **File Matching**

- Launch matching process when two files are validated.
- Show progress bar, allow cancel.
- Move processed files to archive.

3. **Results Consultation**

- Display interventions with identified speakers.
- Highlight unassigned or default-assigned interventions.
- Allow export in CSV.

4. **Error Detection and Correction**

- Detect unmatched interventions or time misalignments.
- Show list of errors with locations.
- Provide manual correction UI: dropdown of available speakers.
- Show correction summary before validation.

5. **Validation and Saving**

- Save corrected matching to database.
- Include all manual corrections.
- Maintain version history with timestamped entries.

6. **Referential Configuration**

- Manage a structured configuration file (JSON/XML/CSV).
- Define exact and approximate correspondences.
- Support similarity thresholds.
- Auto-load referential at startup.

7. **Export**

- Export final validated results in CSV with columns: timestamp, speaker, intervention.

# Requirements

- Use Angular 18 modular architecture, lazy loading.
- Use services for API calls, guards, interceptors for auth and error handling.
- Use ng-zorro components (tables, forms, modals, dropdowns, progress bar).
- Ensure responsive design.
- Implement accessibility (ARIA roles, keyboard navigation).
- Add Jasmine/Karma unit tests with at least 70% coverage.
- Use Zod fo schema validation with static type inference

# Deliverables

- Complete Angular project, production-ready.
- Full code for all modules, components, services, interceptors, guards.
- OIDC-secured login flow.
- Connected UI for all features above.
- README with setup and run instructions.

