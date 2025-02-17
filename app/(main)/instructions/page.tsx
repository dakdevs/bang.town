export default function InstructionsPage() {
  return (
    <div className="space-y-8 font-sans">
      <div className="flex items-center gap-2 text-sm">
        <a href="/" className="text-blue-500 hover:text-blue-600 transition-colors flex items-center gap-1">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M19 12H5M12 19l-7-7 7-7" />
          </svg>
          Back to Home
        </a>
      </div>

      <div>
        <h2 className="text-2xl mb-4 text-blue-500 bangers">Chrome-based Browser Setup</h2>
        <div className="space-y-4">
          <div className="bg-gray-50 p-4 rounded-lg">
            <h3 className="font-semibold mb-2 bangers">1. Open Chrome Settings</h3>
            <p className="text-gray-600">
              Click the three dots menu (⋮) in the top right corner and select <span className="font-mono bg-gray-100 px-1 rounded">Settings</span>
            </p>
          </div>

          <div className="bg-gray-50 p-4 rounded-lg">
            <h3 className="font-semibold mb-2 bangers">2. Navigate to Search Engines</h3>
            <p className="text-gray-600">
              In the left sidebar, click <span className="font-mono bg-gray-100 px-1 rounded">Search engine</span>, then click <span className="font-mono bg-gray-100 px-1 rounded">Manage search engines and site search</span>
            </p>
          </div>

          <div className="bg-gray-50 p-4 rounded-lg">
            <h3 className="font-semibold mb-2 bangers">3. Add New Search Engine</h3>
            <p className="text-gray-600 mb-2">
              Under "Site search", click <span className="font-mono bg-gray-100 px-1 rounded">Add</span> and fill in the following:
            </p>
            <ul className="list-disc pl-6 space-y-2 text-gray-600">
              <li>Search engine: <span className="font-mono bg-gray-100 px-1 rounded">Bang Town</span></li>
              <li>Shortcut: <span className="font-mono bg-gray-100 px-1 rounded">bang</span></li>
              <li>URL: Copy your Custom Search URL from the homepage</li>
            </ul>
          </div>

          <div className="bg-gray-50 p-4 rounded-lg">
            <h3 className="font-semibold mb-2 bangers">4. Using Your Bangs</h3>
            <p className="text-gray-600 mb-2">
              Now you can use your bangs in two ways:
            </p>
            <ul className="list-disc pl-6 space-y-2 text-gray-600">
              <li>Type <span className="font-mono bg-gray-100 px-1 rounded">bang</span> in the address bar, press <span className="font-mono bg-gray-100 px-1 rounded">Tab</span>, then type your bang command without the ! prefix (e.g., <span className="font-mono bg-gray-100 px-1 rounded">g cats</span>)</li>
              <li>Type your bang command directly in the address bar (e.g., <span className="font-mono bg-gray-100 px-1 rounded">!g cats</span>)</li>
            </ul>
          </div>
        </div>
      </div>

      <div>
        <h2 className="text-2xl mb-4 text-blue-500 bangers">Arc Browser Setup</h2>
        <div className="space-y-4">
          <div className="bg-gray-50 p-4 rounded-lg">
            <h3 className="font-semibold mb-2 bangers">1. Open Arc Settings</h3>
            <p className="text-gray-600">
              Click <span className="font-mono bg-gray-100 px-1 rounded">Arc</span> in the menu bar, then select <span className="font-mono bg-gray-100 px-1 rounded">Settings</span>
            </p>
          </div>

          <div className="bg-gray-50 p-4 rounded-lg">
            <h3 className="font-semibold mb-2 bangers">2. Navigate to Search Settings</h3>
            <p className="text-gray-600">
              Click <span className="font-mono bg-gray-100 px-1 rounded">Profiles</span> in the sidebar, then click <span className="font-mono bg-gray-100 px-1 rounded">Search settings</span>
            </p>
          </div>

          <div className="bg-gray-50 p-4 rounded-lg">
            <h3 className="font-semibold mb-2 bangers">3. Add Search Engine</h3>
            <p className="text-gray-600 mb-2">
              Click <span className="font-mono bg-gray-100 px-1 rounded">+ Add search engine</span> and enter:
            </p>
            <ul className="list-disc pl-6 space-y-2 text-gray-600">
              <li>Name: <span className="font-mono bg-gray-100 px-1 rounded">Bang Town</span></li>
              <li>Shortcut: <span className="font-mono bg-gray-100 px-1 rounded">bang</span></li>
              <li>URL: Copy your Custom Search URL from the homepage</li>
            </ul>
          </div>

          <div className="bg-gray-50 p-4 rounded-lg">
            <h3 className="font-semibold mb-2 bangers">4. Using Your Bangs</h3>
            <p className="text-gray-600 mb-2">
              In Arc, you can use your bangs in the command bar:
            </p>
            <ul className="list-disc pl-6 space-y-2 text-gray-600">
              <li>Press <span className="font-mono bg-gray-100 px-1 rounded">⌘ + T</span> to open a new tab</li>
              <li>Type your bang command (e.g., <span className="font-mono bg-gray-100 px-1 rounded">!g cats</span> or <span className="font-mono bg-gray-100 px-1 rounded">!yt music</span>)</li>
            </ul>
          </div>

          <div className="bg-gray-50 p-4 rounded-lg border-l-4 border-blue-500">
            <h3 className="font-semibold mb-2 bangers">Pro Tip</h3>
            <p className="text-gray-600">
              Arc's command bar is accessible from any tab with <span className="font-mono bg-gray-100 px-1 rounded">⌘ + T</span>, making your bangs always just a keystroke away!
            </p>
          </div>
        </div>
      </div>

      <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
        <h3 className="font-semibold mb-2 bangers">Need to Update Your Bangs?</h3>
        <p className="text-gray-600">
          Remember, you can always return to your settings page by using <span className="font-mono bg-gray-100 px-1 rounded">!settings</span> in your browser's address bar.
        </p>
      </div>
    </div>
  )
} 