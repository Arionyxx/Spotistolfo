# SpotiLoader

A modern desktop application for downloading and managing your Spotify playlists as MP3 files, built with React, Tailwind CSS, Electron, and Framer Motion.

## Features

### 🎵 Core Functionality
- **Spotify Integration**: Connect to your Spotify account using OAuth2 PKCE flow
- **Playlist Management**: Browse and manage your Spotify playlists
- **Batch Downloads**: Download entire playlists or individual tracks
- **Metadata Tagging**: Automatic ID3 tagging with track information
- **Progress Tracking**: Real-time download progress with detailed status updates

### 🎨 Modern UI/UX
- **Dark Theme**: Spotify-inspired dark mode interface
- **Glassmorphism Design**: Modern frosted glass effects and smooth animations
- **Responsive Layout**: Adaptive grid layouts for different screen sizes
- **Smooth Animations**: Framer Motion powered transitions and micro-interactions

### ⚡ Technical Features
- **Electron Desktop App**: Native desktop experience
- **React 18**: Modern React with hooks and context
- **Tailwind CSS**: Utility-first CSS framework with custom design system
- **Local Storage**: Persistent settings and download history
- **Concurrent Downloads**: Multi-threaded download processing
- **Error Handling**: Comprehensive error handling and retry mechanisms

## Architecture

### Project Structure
```
spotloader/
├── electron/                    # Electron backend
│   ├── main/                   # Main process
│   │   ├── index.js           # Main Electron entry point
│   │   ├── ipc/               # IPC handlers
│   │   │   ├── spotify.js     # Spotify API IPC handlers
│   │   │   ├── download.js    # Download/search IPC handlers
│   │   │   └── store.js       # electron-store handlers
│   │   └── services/          # Backend services
│   │       ├── SpotifyService.js    # Spotify API integration
│   │       ├── Downloader.js        # YouTube download logic
│   │       ├── Tagger.js            # MP3 metadata tagging
│   │       └── YouTubeSearch.js     # YouTube search utilities
│   └── preload.js             # Preload script with IPC bridge
├── src/                       # React frontend
│   ├── components/            # Reusable UI components
│   │   ├── AuthModal.jsx      # Authentication modal
│   │   ├── Header.jsx         # Application header
│   │   ├── PlaylistCard.jsx   # Playlist display component
│   │   ├── ProgressBar.jsx    # Download progress indicator
│   │   ├── Sidebar.jsx        # Navigation sidebar
│   │   ├── SongRow.jsx        # Individual track row
│   │   └── LoadingSpinner.jsx # Loading animation
│   ├── pages/                 # Main application pages
│   │   ├── Dashboard.jsx      # Playlist grid view
│   │   ├── PlaylistDetail.jsx # Track list view
│   │   ├── Downloads.jsx      # Download history
│   │   └── Settings.jsx       # Application settings
│   ├── hooks/                 # Custom React hooks
│   │   ├── useSpotifyAuth.js  # Authentication hook
│   │   └── useDownloader.js   # Download management hook
│   ├── styles/                # Global styles
│   │   └── globals.css        # Tailwind + custom utilities
│   ├── App.jsx                # Main layout component
│   └── main.jsx               # React entry point
├── package.json
├── vite.config.js            # Vite configuration
├── tailwind.config.js        # Tailwind theme configuration
└── README.md
```

### Key Technologies

**Frontend Stack:**
- **React 18**: Latest React with functional components and hooks
- **Vite**: Fast build tool and dev server
- **Tailwind CSS**: Utility-first CSS with custom Spotify theme
- **Framer Motion**: Smooth animations and transitions
- **React Router**: Client-side routing
- **Lucide React**: Modern icon library

**Backend Stack:**
- **Electron**: Desktop application framework
- **Node.js**: Backend runtime
- **electron-store**: Persistent storage
- **ytdl-core**: YouTube audio download
- **music-metadata-browser**: Audio file metadata processing

**Development Tools:**
- **ESLint**: Code linting
- **Prettier**: Code formatting
- **Concurrently**: Run multiple npm scripts
- **Wait-on**: Wait for development server

## Getting Started

### Prerequisites
- Node.js 18+ 
- npm or pnpm
- Spotify Developer Account (for OAuth setup)

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd spotloader
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up Spotify App**
   - Go to [Spotify Developer Dashboard](https://developer.spotify.com/dashboard)
   - Create a new app
   - Get your Client ID and Client Secret
   - Set redirect URI to `http://localhost:3000/callback`

4. **Configure Environment**
   ```bash
   # Create .env file
   echo "SPOTIFY_CLIENT_ID=your-client-id" > .env
   echo "SPOTIFY_CLIENT_SECRET=your-client-secret" >> .env
   ```

5. **Start Development Server**
   ```bash
   npm run dev
   ```

### Building for Production

```bash
# Build the application
npm run build

# The built application will be in the dist/ directory
```

## Usage Guide

### Initial Setup
1. **Launch SpotiLoader** - The app will open with an authentication modal
2. **Connect Spotify** - Click "Connect Spotify" to authenticate
3. **Configure Settings** - Set your download path and preferences in Settings

### Downloading Playlists
1. **Browse Library** - View your playlists on the Dashboard
2. **Select Playlists** - Use checkboxes to select playlists to download
3. **Choose Download Path** - Select where to save your MP3 files
4. **Start Download** - Click download and track progress in real-time

### Managing Downloads
- **Download History** - View all completed and failed downloads
- **Progress Tracking** - Monitor active downloads with progress bars
- **Retry Failed Downloads** - Automatically retry failed downloads

### Settings Configuration
- **Download Quality** - Choose audio quality (128kbps, 192kbps, 320kbps)
- **Metadata Options** - Configure ID3 tagging and album art embedding
- **Authentication** - Manage API keys and tokens
- **Notifications** - Configure desktop notifications

## API Integration

### Spotify Web API
- **OAuth2 PKCE Flow**: Secure authentication without backend
- **Playlist Management**: Read user playlists and track metadata
- **Rate Limiting**: Built-in rate limiting and token refresh

### YouTube Integration
- **Audio Search**: Find best matching audio tracks
- **Download**: High-quality audio extraction
- **Metadata**: Enhanced track information

## Development

### Available Scripts

```bash
# Development
npm run dev          # Start both React dev server and Electron
npm run dev:react    # Start React dev server only
npm run dev:electron # Start Electron only

# Building
npm run build        # Build for production
npm run build:react  # Build React frontend
npm run build:electron # Build Electron app

# Utilities
npm run lint         # Run ESLint
npm run format       # Format code with Prettier
```

### Code Structure

**Frontend Components:**
- Modular React components with TypeScript-style prop definitions
- Custom hooks for business logic separation
- Context providers for global state management
- Framer Motion animations for smooth UX

**Backend Services:**
- Electron main process handles IPC communication
- SpotifyService for API interactions
- Downloader for YouTube integration
- Tagger for MP3 metadata processing

**State Management:**
- React Context for authentication and downloads
- electron-store for persistent storage
- Local component state for UI interactions

## Configuration

### Tailwind Configuration
The app uses a custom Tailwind configuration with Spotify-inspired colors and dark theme:

```javascript
colors: {
  spotify: {
    green: '#1DB954',
    'green-dark': '#1ed760',
    black: '#121212',
    'gray-dark': '#191414',
    'gray-medium': '#2e2e2e',
    'gray-light': '#b3b3b3',
    white: '#ffffff',
  }
}
```

### Electron Configuration
Main process configuration includes:
- Window settings and security policies
- IPC handler registration
- File system operations
- Auto-updater (for future releases)

## Security Considerations

- **OAuth2 PKCE**: Secure authentication flow
- **Context Isolation**: Electron security best practices
- **Input Validation**: All user inputs are validated
- **API Key Protection**: Sensitive credentials encrypted locally

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Acknowledgments

- **Spotify** - For their Web API
- **YouTube** - For audio content availability
- **React Team** - For the excellent React framework
- **Tailwind Labs** - For the utility-first CSS framework
- **Framer** - For the motion library

## Roadmap

### Upcoming Features
- [ ] Audio playback within the app
- [ ] Playlist creation and editing
- [ ] Cloud storage integration
- [ ] Advanced filtering and search
- [ ] Batch playlist operations
- [ ] Metadata editing interface
- [ ] Export to multiple formats
- [ ] Social sharing features

### Performance Improvements
- [ ] Virtualized lists for large playlists
- [ ] Incremental loading
- [ ] Background downloads
- [ ] Resume interrupted downloads
- [ ] Bandwidth throttling

---

**Note**: This application is not affiliated with Spotify. Users are responsible for complying with Spotify's Terms of Service and applicable copyright laws.