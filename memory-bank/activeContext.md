# Active Context - Current Development Focus

## Current Work Focus

### Development Phase: Foundation Complete, Feature Development Ready
**Status**: Initial project scaffolding and core architecture established  
**Next Priority**: Implement core matching workflow features  
**Current Sprint Focus**: Session listing and matching result display components

## Recent Changes & Decisions

### Architecture Decisions Made
- **Component Library**: Ant Design (ng-zorro-antd) selected for consistent UI
- **State Management**: NgRx chosen for complex state requirements
- **Internationalization**: ngx-translate configured for FR/EN support
- **Authentication**: Foundation service structure established
- **Module Organization**: Feature-based architecture with core/shared/feature separation

### Development Environment Setup
- Angular 18.2.0 with TypeScript 5.5.2
- Jest testing framework configured
- Custom Webpack configuration for development flexibility
- ESLint and Prettier for code quality
- Node.js 20.15.0+ requirement established

## Next Immediate Steps

### Priority 1: Core Session Management
1. **Session List Component** (User Story - not explicitly numbered)
   - Display available sessions for matching
   - Filter and search capabilities
   - Status indicators (pending, in-progress, completed, validated)

2. **File Upload Interface** (Related to GEN-003)
   - Verbatim file upload with validation
   - Event tagging file upload with validation
   - File format verification and error handling

### Priority 2: Matching Results Display
3. **Matching Detail Page** (User Story 2.3)
   - Tree view of matching elements
   - Hierarchical event/sub-event structure
   - Save functionality integration

4. **Event Editing Interface** (User Story 2.4)
   - Edit titles, speakers, and verbatim content
   - Speaker management with title/name/function/party fields
   - Inline editing capabilities

### Priority 3: Core Workflow Actions
5. **Save and Validate Actions** (User Stories 2.6, 2.7)
   - Save edited matching functionality
   - Validation workflow with status changes
   - Progress tracking and confirmation dialogs

## Active Technical Considerations

### State Management Strategy
- **Session State**: Track current session, uploaded files, matching results
- **UI State**: Component visibility, loading states, error conditions
- **User State**: Authentication status, preferences, recent actions

### Component Design Patterns
- **Container/Presentational**: Smart components handle state, dumb components handle display
- **Tree Components**: Hierarchical data display for event structures
- **Form Management**: Reactive forms for editing speakers and content
- **File Handling**: Upload progress, validation, error display

### Data Flow Architecture
```
Upload Files → Backend Processing → Results Display → User Corrections → Validation → Save
```

## Current Implementation Insights

### Key Technical Patterns in Use
1. **Feature Modules**: Each major feature gets its own lazy-loaded module
2. **Shared Components**: Common UI elements in shared module
3. **Core Services**: Authentication, HTTP, utilities in core module
4. **Reactive Patterns**: RxJS for async operations and state management

### Important Development Preferences
- **Type Safety**: Strict TypeScript configuration
- **Component Reusability**: Shared components for common patterns
- **Error Handling**: Consistent error display and recovery
- **User Feedback**: Loading states, progress indicators, success/error messages

## Known Technical Constraints

### Backend Integration Requirements
- RESTful API integration for matching service
- File upload handling for large verbatim documents
- Real-time progress updates during matching process
- Session state persistence between page refreshes

### User Experience Requirements
- French/English language switching
- Responsive design for different screen sizes
- Keyboard navigation support
- Accessibility compliance

## Development Environment Notes

### Build and Development
- `npm start` for development server on localhost:4200
- Custom Webpack configuration in webpack/ directory
- Hot reload configured for efficient development
- Jest for unit testing, Karma for integration testing

### Code Quality Standards
- ESLint rules enforced
- Prettier formatting automatic
- TypeScript strict mode enabled
- 100% typing coverage required for new code

## Current Blockers & Decisions Pending

### Technical Decisions Needed
1. **File Upload Strategy**: Determine max file sizes and progress tracking approach
2. **Error Handling**: Define error message patterns and user recovery flows
3. **State Persistence**: Decide on local storage vs session storage for user data
4. **Performance**: Lazy loading strategy for large matching result sets

### Integration Dependencies
- Backend API specification needed for matching service
- File format specifications for verbatim and event files
- Authentication service integration details
- Referential file format standards (JSON/XML schemas)

## Learning & Project Evolution

### Emerging Patterns
- Users need immediate visual feedback for all actions
- Tree-based data display is central to user workflow
- File validation is critical for preventing processing errors
- Manual correction workflows must be intuitive and fast

### Architecture Evolution
- Started with simple Angular setup
- Added NgRx for state complexity
- Ant Design provides professional government-appropriate UI
- Custom Webpack configuration enables future extensibility
