# Technology Context - Stack & Development Environment

## Core Technology Stack

### Frontend Framework
**Angular 18.2.0**
- **Rationale**: Modern, enterprise-grade framework suitable for government applications
- **Key Features**: Standalone components, signals, improved SSR, enhanced performance
- **Configuration**: Strict TypeScript mode, standalone components architecture

### Programming Language
**TypeScript 5.5.2**
- **Configuration**: Strict mode enabled for maximum type safety
- **Target**: ES2022 for modern browser support
- **Module System**: ES modules with tree-shaking optimization

### UI Component Library
**Ng-Zorro (Ant Design for Angular) 18.2.1**
- **Rationale**: Professional, government-appropriate design system
- **Key Components**: Tables, Trees, Forms, Modals, Upload components
- **Theming**: Customizable for Chamber of Deputies branding
- **Icons**: @ant-design/icons-angular 18.0.0 for consistent iconography

### State Management
**NgRx 18.0.1**
- **@ngrx/store**: Centralized application state
- **@ngrx/effects**: Side effect management
- **@ngrx/store-devtools**: Development debugging tools
- **@angular-architects/ngrx-toolkit**: Simplified NgRx patterns

### HTTP & API Communication
**Angular HttpClient**
- **Built-in**: Angular's reactive HTTP client
- **Interceptors**: Custom authentication, error handling, notifications
- **Type Safety**: Strongly typed API responses

### Internationalization
**ngx-translate 16.0.4**
- **Core**: @ngx-translate/core for translation management
- **Loader**: @ngx-translate/http-loader for dynamic translation loading  
- **Languages**: French (primary), English (secondary)
- **Lazy Loading**: Feature-specific translation modules

### Date & Time Handling
**Day.js 1.11.18**
- **Rationale**: Lightweight alternative to moment.js
- **Features**: Parsing, formatting, manipulation of dates
- **Localization**: French/English date formats

### Icons & Styling
**FontAwesome 6.5.2**
- **Core**: @fortawesome/fontawesome-svg-core
- **Icons**: @fortawesome/free-solid-svg-icons
- **Angular**: @fortawesome/angular-fontawesome 0.15.0
- **Custom Styles**: SCSS with Angular Material theming

## Development Environment

### Node.js Requirements
**Node.js 20.15.0+**
- **Package Manager**: npm (lockfile: package-lock.json)
- **Engine Enforcement**: Specified in package.json engines field

### Build System
**Angular CLI 18.2.20**
- **Custom Webpack**: @angular-builders/custom-webpack 18.0.0
- **Configuration**: webpack/ directory with custom configs
- **Development Server**: ng serve with hot reload
- **Production Build**: Optimized bundles with tree-shaking

### Code Quality Tools
**ESLint 9.15.0**
- **Angular ESLint**: angular-eslint 18.4.3 for Angular-specific rules
- **Prettier Integration**: eslint-plugin-prettier 5.5.4
- **Configuration**: eslint.config.js with strict rules

**Prettier 3.6.2**
- **Code Formatting**: Automatic formatting on save
- **Configuration**: .prettierrc.js with project standards

### Testing Framework
**Jest 29.7.0**
- **Unit Testing**: @angular-builders/jest 18.0.0
- **Type Support**: @types/jest 29.5.14
- **Configuration**: Custom Jest configuration for Angular

**Karma & Jasmine** (Legacy Support)
- **Karma**: ~6.4.0 for browser-based testing
- **Jasmine**: ~5.2.0 for test specifications
- **Chrome Launcher**: karma-chrome-launcher for headless testing

### Development Tooling
**Browser Sync Webpack Plugin 2.4.0**
- **Live Reload**: Automatic browser refresh during development
- **Multi-device Testing**: Synchronized testing across devices

**Webpack Bundle Analyzer 4.10.2**
- **Bundle Analysis**: Visualize webpack bundle contents
- **Performance Monitoring**: Identify large dependencies

**Folder Hash 4.1.1**
- **Asset Versioning**: Content-based hash generation
- **Cache Busting**: Automatic cache invalidation

## Development Workflow

### Local Development Commands
```bash
npm start              # Development server (localhost:4200)
npm run build          # Production build
npm run watch          # Watch mode development build  
npm test               # Unit tests with Jest
npm run lint           # ESLint code analysis
ng generate            # Angular CLI generators
```

### Webpack Configuration
**Custom Configuration Files:**
- `webpack/webpack.custom.js` - Main custom webpack configuration
- `webpack/environment.js` - Environment-specific settings
- `webpack/proxy.conf.js` - Development proxy configuration

**Key Features:**
- **Hot Module Replacement**: Fast development updates
- **Proxy Configuration**: Backend API integration during development
- **Bundle Optimization**: Code splitting and lazy loading
- **Asset Pipeline**: Efficient asset processing

### Build & Deployment
**Development Build:**
- Source maps enabled
- Verbose error messages
- Hot reload capabilities
- Unminified assets

**Production Build:**
- Minification and compression
- Tree-shaking unused code
- Bundle splitting for optimal loading
- Service worker integration ready

## Browser Support & Compatibility

### Target Browsers
- **Chrome**: Latest 2 versions
- **Firefox**: Latest 2 versions  
- **Edge**: Latest 2 versions
- **Safari**: Latest 2 versions
- **Government Systems**: IE11 compatibility if required

### Polyfills
**Zone.js 0.14.10**
- **Angular Requirement**: Zone.js for change detection
- **Browser Compatibility**: Automatic polyfill loading

**Core-js** (via Angular)
- **ES6+ Features**: Automatic polyfill inclusion
- **Target**: ES2022 with fallbacks

## Performance Considerations

### Bundle Optimization
- **Lazy Loading**: Feature modules loaded on demand
- **Code Splitting**: Vendor and application bundles separated
- **Tree Shaking**: Unused code elimination
- **Compression**: Gzip compression enabled

### Runtime Performance
- **OnPush Change Detection**: Reduced change detection cycles
- **Async Pipes**: Automatic subscription management
- **TrackBy Functions**: Optimized list rendering
- **Virtual Scrolling**: Large dataset handling

### Memory Management
- **Subscription Cleanup**: Automatic unsubscription patterns
- **Component Lifecycle**: Proper ngOnDestroy implementations
- **Observable Completion**: Completed streams to prevent leaks

## Security Considerations

### Dependencies Security
- **Regular Updates**: Automated dependency vulnerability scanning
- **Audit Process**: npm audit for security vulnerabilities
- **Lock Files**: package-lock.json for reproducible builds

### Runtime Security
- **Content Security Policy**: CSP headers for XSS protection
- **Secure HTTP**: HTTPS-only in production
- **Token Management**: Secure JWT storage and refresh
- **Input Sanitization**: Angular's built-in XSS protection

## Integration Requirements

### Backend API Integration
**Expected API Format:**
- **REST Architecture**: RESTful endpoints
- **JSON Data Format**: Structured request/response
- **Authentication**: JWT-based authentication
- **File Upload**: Multipart form data support
- **Real-time Updates**: WebSocket or Server-Sent Events

### File Format Support
**Input Formats:**
- **Verbatim Files**: .docx, .txt formats
- **Event Files**: .json, .xml, .csv formats
- **Referential Files**: .json, .xml configuration files

**Output Formats:**
- **Matching Results**: JSON structured data
- **Export Formats**: CSV, JSON for further processing

## Development Environment Setup

### Required Software
1. **Node.js 20.15.0+** - JavaScript runtime
2. **npm** - Package manager (comes with Node.js)
3. **Git** - Version control
4. **VS Code** (recommended) - Development environment

### Initial Setup Steps
```bash
# Clone repository
git clone [repository-url]
cd verbatim-internal-front

# Install dependencies  
npm install

# Start development server
npm start

# Run tests
npm test

# Lint code
npm run lint
```

### VS Code Extensions (Recommended)
- **Angular Language Service** - Angular template support
- **TypeScript Hero** - TypeScript import management
- **ESLint** - Code quality checking
- **Prettier** - Code formatting
- **Angular Snippets** - Angular code snippets

## Troubleshooting & Common Issues

### Node Version Issues
- **Solution**: Use Node.js 20.15.0+ as specified in package.json
- **Tool**: nvm for Node version management

### Dependencies Conflicts
- **npm cache**: Clear npm cache if installation issues
- **Lock file**: Delete node_modules and package-lock.json, reinstall
- **Audit**: Run npm audit --fix for security updates

### Build Performance
- **Incremental Builds**: Use ng build --watch for development
- **Memory**: Increase Node.js memory if large projects: --max_old_space_size=8192
- **Parallel Processing**: Jest runs tests in parallel automatically

### Browser Compatibility
- **Polyfills**: Uncomment required polyfills in polyfills.ts
- **Browserslist**: Update .browserslistrc for target browsers
- **Testing**: Use BrowserStack or similar for cross-browser testing
