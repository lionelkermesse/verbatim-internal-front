# Project Brief - Verbatim Internal Front

## Project Overview

**Project Name:** ChdDigitalVerbatimFront  
**Version:** 0.0.0 (Initial Development)  
**Type:** Angular Frontend Application  
**Target Users:** French Chamber of Deputies (Chambre des Députés) Staff

## Purpose & Mission

Replace the existing VBA-based verbatim matching tool with a modern web application that automates the reconciliation between parliamentary session verbatim transcripts and speaker event tagging.

## Core Problem Statement

Parliamentary sessions generate two separate data streams:
1. **Verbatim transcripts** - Raw text of what was said during sessions
2. **Event tagging** - Structured metadata about who spoke when and about what topics

The current VBA-based matching process is inefficient, error-prone, and lacks proper traceability, error handling, and version management.

## Solution Goals

- **Automation**: Intelligent matching between verbatim content and speaker events
- **Accuracy**: Manual correction capabilities for automated matching errors
- **Traceability**: Complete audit trail of all changes and decisions
- **Efficiency**: Streamlined workflow from upload to final validation
- **Reliability**: Modern error handling and recovery mechanisms

## Key Success Criteria

1. **Process Improvement**: Reduce manual effort in verbatim-to-speaker attribution
2. **Quality Enhancement**: Provide tools to identify and correct matching errors
3. **Data Integrity**: Ensure all parliamentary interventions are properly attributed
4. **User Adoption**: Intuitive interface that Chamber staff can use effectively
5. **System Integration**: Seamless workflow with existing parliamentary systems

## Project Scope

### In Scope
- User authentication and authorization
- File upload and validation (verbatim and event files)
- Automated matching algorithm integration
- Interactive correction and editing interface
- Validation and approval workflows
- Data persistence and version management
- Referential configuration management
- Multi-language support (French/English)

### Out of Scope
- Backend matching algorithm implementation (separate Java service)
- Integration with external parliamentary databases (future phase)
- Mobile application development
- Advanced analytics and reporting (future phase)

## Stakeholders

**Primary Users:** Chamber of Deputies administrative staff responsible for session documentation  
**Technical Team:** SFEIR development team  
**Business Owner:** Chamber of Deputies IT department

## Project Timeline

**Current Status:** Initial development phase  
**Target:** Production-ready application for Chamber of Deputies deployment

## Technology Constraints

- Must be a modern web application
- Compatible with Chamber of Deputies infrastructure
- Support for French and English languages
- Accessible and user-friendly interface standards
