# Bang.town

<div align="center">
  <img src="https://bang.town/api/og" alt="Bang.town - Your custom search engine with powerful (and shareable!) bang shortcuts" width="800"/>
</div>

Bang.town is a custom search engine utility that implements and extends the concept of "bang shortcuts" (popularized by DuckDuckGo) with several unique features designed to enhance your browsing experience.

## Features

### 🔍 Bang Shortcuts
- Perform quick searches on different websites using bang commands (e.g., `!c hello` to chat with ChatGPT)
- Built-in default bangs for popular services:
  - `!s` - ChatGPT Search with GPT-4
  - `!4o` - ChatGPT with GPT-4
  - `!t3` - T3 Chat
  - `!w` - Wikipedia
  - `!yt` - YouTube
  - `!gh` - GitHub
  - `!so` - Stack Overflow
  - And many more!
- DuckDuckGo Fallback: If a bang isn't found in your custom or default bangs, automatically falls back to DuckDuckGo's extensive bang system

### 🛠️ Custom Bang Management
- Create your own custom bang shortcuts
- Each custom bang consists of a key and a URL pattern
- Smart validation prevents infinite loops
- Duplicate detection avoids conflicts with existing bangs
- Override built-in bangs with your own custom URLs

### 🔄 Sharing Functionality
- Share your custom bang configurations with others
- Generate shareable URLs that preserve all custom bang settings
- Share individual bangs with unique codes
- Import bangs from other users

### 🔎 Search and Organization
- Fuzzy search feature for finding specific bangs
- Organized interface showing both custom and default bangs
- Clear indication when custom bangs override defaults
- Set default search engine for non-bang queries

### 🌐 Browser Integration
- Works with all major browsers
- Can be set up as a custom search engine
- Supports both `!command` syntax and browser search shortcuts
- Detailed setup instructions for various browsers

## Setup Instructions

### Chrome-based Browsers
1. Open Chrome Settings
2. Navigate to Search Engines
3. Click "Add" under "Site search"
4. Fill in:
   - Search engine: `Bang Town`
   - Shortcut: `bang`
   - URL: Your custom search URL from bang.town

### Arc Browser
1. Open Arc Settings
2. Navigate to Search Settings
3. Click "+ Add search engine"
4. Fill in:
   - Name: `Bang Town`
   - Shortcut: `bang`
   - URL: Your custom search URL from bang.town

## Usage

### Using Bang Shortcuts
1. Direct Usage:
   - Type `!c hello` in your address bar to chat with ChatGPT
   - Use `!yt music` to search YouTube for "music"
   - Try `!w science` to search Wikipedia for "science"

2. Browser Shortcut:
   - Type `bang` in the address bar
   - Press `Tab`
   - Enter your search (e.g., `c hello` without the `!`)

### Managing Bangs
- Use `!settings` to quickly return to your bang settings
- Add custom bangs with your preferred shortcuts
- Share your configurations with others
- Import bangs from other users

## Development

### Prerequisites
- Node.js (v18 or later)
- pnpm (v8 or later)

### Installation
```bash
# Clone the repository
git clone https://github.com/yourusername/bang-town.git

# Navigate to the project directory
cd bang-town

# Install dependencies
pnpm install

# Start the development server
pnpm dev
```

### Building for Production
```bash
# Create a production build
pnpm build

# Start the production server
pnpm start
```

## Contributing
Contributions are welcome! Please feel free to submit a Pull Request.

## License
This project is licensed under the MIT License - see the LICENSE file for details.

## Acknowledgments
- Inspired by DuckDuckGo's bang system
- Built with Next.js and Tailwind CSS
- Hosted on Vercel

---

<div align="center">
  Made with ❤️ by <a href="https://x.com/dakdevs">@dakdevs</a>
</div> 